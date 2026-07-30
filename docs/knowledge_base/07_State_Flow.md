# Phase 7: State Flow

RenoCred relies on a highly centralized state architecture powered by Zustand. Because the application acts as an intelligent operating system running complex simulations (like CIBIL forecasting and Wallet Optimization), having a single source of truth is critical.

## 1. Global State (`dashboardStore.ts`)
*   **Technology**: Zustand + Immer + Persist middleware.
*   **What it holds**: 
    *   `transactions` (Array)
    *   `creditAccounts` (Array)
    *   `userCards` (Array)
    *   `rewards` (Object)
    *   `profile` (Object)
    *   `activeCardId` (String)
*   **Why Immer?**: Used to simplify complex immutable updates, allowing direct mutations in action functions (e.g., `state.rewards.totalPoints += points`).
*   **Why Persist?**: Syncs the entire state tree to `localStorage`. This ensures that on a hard refresh, the user instantly sees their data before the network can even fire.

## 2. Local Component State
*   **Technology**: React `useState`, `useRef`.
*   **What it holds**: Ephemeral UI states.
    *   Modal toggles (`isAddCardModalOpen`)
    *   Active tabs in Layouts (`activeTab`)
    *   Form inputs during transaction creation.
*   **Why Local?**: It keeps the global store clean. For example, the `QuickAskTaqdeer.tsx` component stores the chat history array locally because the chat history is lost upon closing the tab (by design).

## 3. Context State
*   **Technology**: React `createContext`.
*   **Usage**: Extremely limited. Primarily used for third-party providers (Clerk Auth Context, PostHog Context, Supabase Client Context). 

## 4. Derived State (Memoization)
*   **Technology**: React `useMemo` and Engine functions.
*   **Usage**: The AI engines (Behaviour, Recommendations, Health) act as pure functions that take the Global State as an argument and return derived states (Insights). These are wrapped in custom hooks that utilize `useMemo` to prevent recalculation on every render.
    *   *Example*: `const insights = useMemo(() => BehaviourEngine.getInsights(transactions), [transactions])`

## 5. Synchronization (Hydration Flow)
1.  **Boot**: App reads from `localStorage` immediately.
2.  **Auth Confirmed**: Clerk fires `useUser()`.
3.  **Hydrate**: `useDashboardStore.getState().hydrateFromSupabase()` fires.
4.  **Merge**: Fetches live data from Postgres and overrides the local state, ensuring multi-device sync.
