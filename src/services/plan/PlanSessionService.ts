import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';
import type { ServiceResponse } from '../core/types';
import { handleServiceError } from '../core/errorHandler';
import type { PlanSession, PlanCategory, PlanStatus } from '../../features/plan/types';

export class PlanSessionService {
  constructor(private client: SupabaseClient<Database>) {}

  async getSession(id: string, userId: string): ServiceResponse<PlanSession> {
    try {
      const { data, error } = await this.client
        .from('planning_sessions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw handleServiceError(error, 'DATABASE_ERROR');
      
      if (!data) return { data: null, error: null };

      const session: PlanSession = {
        id: data.id,
        userId: data.user_id,
        planType: data.plan_type as PlanCategory,
        status: data.status as PlanStatus,
        currentPhase: data.current_phase,
        draft: data.draft,
        selectedPlan: data.selected_plan,
        schemaVersion: data.schema_version,
        revision: data.revision,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastViewedAt: data.last_viewed_at,
        completedAt: data.completed_at
      };

      return { data: session, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async listSessions(userId: string): ServiceResponse<PlanSession[]> {
    try {
      const { data, error } = await this.client
        .from('planning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');

      const sessions: PlanSession[] = (data || []).map(d => ({
        id: d.id,
        userId: d.user_id,
        planType: d.plan_type as PlanCategory,
        status: d.status as PlanStatus,
        currentPhase: d.current_phase,
        draft: d.draft,
        selectedPlan: d.selected_plan,
        schemaVersion: d.schema_version,
        revision: d.revision,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        lastViewedAt: d.last_viewed_at,
        completedAt: d.completed_at
      }));

      return { data: sessions, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async saveSession(session: PlanSession): ServiceResponse<PlanSession> {
    try {
      const payload = {
        p_id: session.id,
        p_user_id: session.userId,
        p_plan_type: session.planType,
        p_status: session.status,
        p_current_phase: session.currentPhase,
        p_draft: session.draft,
        p_selected_plan: session.selectedPlan,
        p_expected_revision: session.revision
      };

      let response = await this.client.rpc('save_planning_session_v1', payload as any);

      // Fallback if RPC doesn't exist
      if (response.error && (response.error.message.includes('function') || response.error.code === 'PGRST202')) {
        console.warn('RPC failed, falling back to direct upsert for planning_sessions', response.error);
        const row = {
          id: session.id,
          user_id: session.userId,
          plan_type: session.planType,
          status: session.status,
          current_phase: session.currentPhase,
          draft: session.draft,
          selected_plan: session.selectedPlan,
          schema_version: session.schemaVersion || 1,
          revision: (session.revision || 0) + 1,
          created_at: session.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_viewed_at: new Date().toISOString(),
          completed_at: session.completedAt
        };
        const upsertRes = await this.client.from('planning_sessions').upsert(row).select().single();
        response = { data: upsertRes.data, error: upsertRes.error as any };
      }

      const { data, error } = response;

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');

      if (!data) return { data: null, error: handleServiceError(new Error("RPC returned no data")) };

      const updatedSession: PlanSession = {
        id: data.id,
        userId: data.user_id,
        planType: data.plan_type as PlanCategory,
        status: data.status as PlanStatus,
        currentPhase: data.current_phase,
        draft: data.draft,
        selectedPlan: data.selected_plan,
        schemaVersion: data.schema_version,
        revision: data.revision,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastViewedAt: data.last_viewed_at,
        completedAt: data.completed_at
      };

      return { data: updatedSession, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }

  async deleteSession(id: string, userId: string): ServiceResponse<boolean> {
    try {
      const { error } = await this.client
        .from('planning_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw handleServiceError(error, 'DATABASE_ERROR');
      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: handleServiceError(err) };
    }
  }
}
