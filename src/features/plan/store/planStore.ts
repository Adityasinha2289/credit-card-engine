import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PlanSession, PlanCategory, PlanStatus } from '../types';
import { PlanSessionService } from '../../../services/plan/PlanSessionService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/database.types';

// Helper for generating local IDs if not hydrated
function generateSessionId(): string {
  return 'plan-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

interface PlanState {
  activeSessions: Record<string, PlanSession>;
  currentSessionId: string | null;
  isSaving: boolean;
  saveError: string | null;
  supabaseClient: SupabaseClient<Database> | null;
  isDemoMode: boolean;
}

interface PlanActions {
  setSupabaseClient: (client: SupabaseClient<Database> | null) => void;
  setDemoMode: (isDemo: boolean) => void;
  
  // Creates a new session or resumes an existing one from memory
  startOrResumeSession: (userId: string, planType: PlanCategory, existingSessionId?: string) => string;
  
  // Fully load a session from Supabase
  loadSession: (sessionId: string, userId: string) => Promise<void>;
  
  // Loads all sessions for history view
  loadAllSessions: (userId: string) => Promise<PlanSession[]>;
  
  // Update a portion of the draft locally and debounce-save to Supabase
  updateDraft: (sessionId: string, draftUpdates: any) => void;
  
  // Update current phase
  setPhase: (sessionId: string, phase: number) => void;
  
  // Update status
  setStatus: (sessionId: string, status: PlanStatus) => void;

  // Complete plan and save selected variant
  completePlan: (sessionId: string, selectedVariant: any) => Promise<void>;

  // Immediately force sync
  syncSession: (sessionId: string) => Promise<void>;
}

export const usePlanStore = create<PlanState & PlanActions>()(
  devtools(
    immer((set, get) => ({
      activeSessions: {},
      currentSessionId: null,
      isSaving: false,
      saveError: null,
      supabaseClient: null,
      isDemoMode: false,

      setSupabaseClient: (client) => {
        set((state) => {
          state.supabaseClient = client as any;
        });
      },

      setDemoMode: (isDemo) => {
        set((state) => {
          state.isDemoMode = isDemo;
        });
      },

      startOrResumeSession: (userId, planType, existingSessionId) => {
        if (existingSessionId && get().activeSessions[existingSessionId]) {
          set((state) => {
            state.currentSessionId = existingSessionId;
          });
          return existingSessionId;
        }

        if (existingSessionId) {
          if (get().isDemoMode) {
             try {
               const localData = localStorage.getItem(`renocred:demo-plan:${existingSessionId}`);
               if (localData) {
                 set((state) => {
                   state.activeSessions[existingSessionId] = JSON.parse(localData);
                   state.currentSessionId = existingSessionId;
                 });
                 return existingSessionId;
               } else {
                 // Missing in demo mode! Remove query param and create new session!
                 const newUrl = new URL(window.location.href);
                 newUrl.searchParams.delete('session');
                 window.history.replaceState({}, '', newUrl.toString());
                 // Fall through to create a new session
               }
             } catch (e) {
               // Fall through
             }
          } else {
            set((state) => {
              state.currentSessionId = existingSessionId;
            });
            get().loadSession(existingSessionId, userId);
            return existingSessionId;
          }
        }

        const newId = generateSessionId();
        
        const newSession: PlanSession = {
          id: newId,
          userId,
          planType,
          status: 'draft',
          currentPhase: 1,
          draft: {},
          selectedPlan: null,
          schemaVersion: 1,
          revision: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastViewedAt: new Date().toISOString(),
          completedAt: null
        };

        set((state) => {
          state.activeSessions[newId] = newSession;
          state.currentSessionId = newId;
        });

        // Fire off initial save
        get().syncSession(newId);

        return newId;
      },

      loadSession: async (sessionId, userId) => {
        const { supabaseClient, isDemoMode } = get();
        if (isDemoMode) return; // In demo mode, sessions are handled synchronously in startOrResumeSession
        if (!supabaseClient) return;

        const service = new PlanSessionService(supabaseClient as any);
        const { data, error } = await service.getSession(sessionId, userId);
        
        if (data) {
          set((state) => {
            state.activeSessions[sessionId] = data;
            state.currentSessionId = sessionId;
          });
        }
      },

      loadAllSessions: async (userId) => {
        const { supabaseClient, isDemoMode, activeSessions } = get();
        if (isDemoMode) {
          try {
            const sessions: PlanSession[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('renocred:demo-plan:')) {
                sessions.push(JSON.parse(localStorage.getItem(key) || '{}'));
              }
            }
            return sessions;
          } catch (e) {
            return Object.values(activeSessions);
          }
        }
        if (!supabaseClient) return [];

        const service = new PlanSessionService(supabaseClient as any);
        const { data } = await service.listSessions(userId);
        return data || [];
      },

      updateDraft: (sessionId, draftUpdates) => {
        set((state) => {
          const session = state.activeSessions[sessionId];
          if (session) {
            session.draft = { ...session.draft, ...draftUpdates };
            session.updatedAt = new Date().toISOString();
          }
        });
        
        // Trigger save
        get().syncSession(sessionId);
      },

      setPhase: (sessionId, phase) => {
        set((state) => {
          const session = state.activeSessions[sessionId];
          if (session) {
            session.currentPhase = phase;
          }
        });
        get().syncSession(sessionId);
      },

      setStatus: (sessionId, status) => {
        set((state) => {
          const session = state.activeSessions[sessionId];
          if (session) {
            session.status = status;
          }
        });
        get().syncSession(sessionId);
      },

      completePlan: async (sessionId, selectedVariant) => {
        set((state) => {
          const session = state.activeSessions[sessionId];
          if (session) {
            session.selectedPlan = selectedVariant;
            session.status = 'ready';
            session.completedAt = new Date().toISOString();
          }
        });
        await get().syncSession(sessionId);
      },

      syncSession: async (sessionId) => {
        const { supabaseClient, activeSessions, isDemoMode } = get();
        const session = activeSessions[sessionId];
        if (!session) return;
        
        if (isDemoMode) {
          try {
            localStorage.setItem(`renocred:demo-plan:${sessionId}`, JSON.stringify(session));
          } catch (e) {}
          return;
        }

        if (!supabaseClient) return;

        set({ isSaving: true, saveError: null });

        const service = new PlanSessionService(supabaseClient as any);
        const { data, error } = await service.saveSession(session);

        if (error) {
          set({ isSaving: false, saveError: error.message });
        } else if (data) {
          set((state) => {
            state.activeSessions[sessionId] = data;
            state.isSaving = false;
          });
        }
      }
    }))
  )
);
