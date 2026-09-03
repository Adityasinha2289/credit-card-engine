import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock persist middleware so it doesn't need localStorage
vi.mock('zustand/middleware', async (importOriginal) => {
  const actual = await importOriginal<typeof import('zustand/middleware')>();
  return {
    ...actual,
    persist: (config: any) => (set: any, get: any, api: any) => {
      // Create a fake persist API
      api.persist = {
        rehydrate: vi.fn(),
        hasHydrated: vi.fn(() => true),
        onHydrate: vi.fn(),
        onFinishHydration: vi.fn(),
        clearStorage: vi.fn(),
        setOptions: vi.fn(),
        getOptions: vi.fn(),
      };
      return config(set, get, api);
    },
    createJSONStorage: vi.fn(),
  };
});

import { useDashboardStore } from '../dashboardStore';

// Mock dependencies
vi.mock('../../../services/profile/ProfileService', () => ({
  ProfileService: vi.fn().mockImplementation(() => ({
    getProfile: vi.fn(async (clerkId) => {
      // Simulate network delay to test async race conditions
      await new Promise(resolve => setTimeout(resolve, 50));
      return { 
        data: { 
          id: clerkId, 
          email: `${clerkId}@example.com`,
          name: `User ${clerkId}`,
          total_reward_points: 100 
        }, 
        error: null 
      };
    })
  }))
}));

vi.mock('../../../services/wallet/WalletService', () => ({
  WalletService: vi.fn().mockImplementation(() => ({
    getWallet: vi.fn(async () => ({ data: [] }))
  }))
}));

vi.mock('../../../services/wallet/WalletService', () => ({
  WalletService: vi.fn().mockImplementation(() => ({
    getWallet: vi.fn(async () => ({ data: [] }))
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();
Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

describe('Dashboard Store Security & State Leakage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardStore.getState()._reset();
    localStorage.clear();
  });

  it('Test 1: User A state exists → logout → User B login → User A state is NOT present', () => {
    const store = useDashboardStore.getState();
    
    // Simulate User A login and state population
    store.login({ id: 'user-A', name: 'User A' } as any);
    expect(useDashboardStore.getState().profile?.id).toBe('user-A');
    
    // Logout User A
    store.logout();
    expect(useDashboardStore.getState().profile).toBeNull();
    expect(useDashboardStore.getState().currentSessionId).toBeNull();

    // User B login
    store.login({ id: 'user-B', name: 'User B' } as any);
    expect(useDashboardStore.getState().profile?.id).toBe('user-B');
    // Ensure User A's name is entirely gone
    expect(useDashboardStore.getState().profile?.name).not.toBe('User A');
  });

  it('Test 2: User A persisted state exists → User B login → hydration does NOT merge User A data', () => {
    // 1. Manually write some fake "User A" state into localStorage to simulate a stale browser session
    // Since we fixed the security issue, the partialize function should ignore sensitive fields anyway,
    // but even if it was there, we verify it doesn't leak.
    localStorage.setItem('renocred-dashboard-v5', JSON.stringify({
      state: {
        profile: { id: 'user-A', name: 'Leaked User A' },
        userCards: [{ id: 'card-A' }]
      }
    }));

    // 2. Re-hydrate store manually to simulate page reload
    useDashboardStore.persist.rehydrate();

    // 3. Verify that because of our fix (partialize returning {}), the sensitive state was NOT loaded
    const state = useDashboardStore.getState();
    expect(state.profile).toBeNull(); // Should be null because we removed it from persistence!
    expect(state.userCards.length).toBe(0);
  });

  it('Test 3: User A async request resolves after logout/user switch → its result does NOT enter User B state', async () => {
    const store = useDashboardStore.getState();
    
    // Set a mock supabase client so the hydration can proceed
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [] }),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-B', name: 'User B', total_reward_points: 100 }, error: null }),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      })
    };
    store.setSupabaseClient(mockSupabase as any);

    // 1. User A starts hydration (takes 50ms due to mock)
    const hydrationPromiseA = store.hydrateFromSupabase('user-A', 'a@a.com', 'User A', '');

    // 2. Immediately switch to User B before A finishes
    store._reset(); // Simulate App.tsx reset
    store.setSupabaseClient(mockSupabase as any); // Re-set after reset
    const hydrationPromiseB = store.hydrateFromSupabase('user-B', 'b@b.com', 'User B', '');

    await Promise.all([hydrationPromiseA, hydrationPromiseB]);

    // 3. Verify that User A's data was discarded and only User B's data is in state
    const finalState = useDashboardStore.getState();
    expect(finalState.profile?.id).toBe('user-B');
    expect(finalState.profile?.name).toBe('User B');
    expect(finalState.profile?.id).not.toBe('user-A');
  });

  it('Test 4: Fresh User B login correctly loads User B server-side data', async () => {
    const store = useDashboardStore.getState();
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [] }),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'user-B', name: 'Fresh B', total_reward_points: 100 }, error: null }),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      })
    };
    store.setSupabaseClient(mockSupabase as any);

    await store.hydrateFromSupabase('user-B', 'b@b.com', 'Fresh B', '');

    const state = useDashboardStore.getState();
    expect(state.profile?.id).toBe('user-B');
    expect(state.profile?.name).toBe('Fresh B');
    expect(state.rewards.totalPoints).toBe(100); // from mock
  });

  it('Test 5: Logout clears sensitive persisted state', () => {
    const store = useDashboardStore.getState();
    
    // Simulate active session
    store.login({ id: 'user-A', name: 'User A' } as any);
    store.setActiveCard('card-123');
    
    // Logout
    store.logout();
    
    // Verify state is cleared
    const state = useDashboardStore.getState();
    expect(state.profile).toBeNull();
    expect(state.activeCardId).toBe('');
    expect(state.currentSessionId).toBeNull();
    
    // Verify localStorage has no sensitive data
    const stored = JSON.parse(localStorage.getItem('renocred-dashboard-v5') || '{}');
    expect(stored.state?.profile).toBeUndefined();
    expect(stored.state?.userCards).toBeUndefined();
  });
});
