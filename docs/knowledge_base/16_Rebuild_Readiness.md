# Phase 16: Rebuild Readiness Categorization

As the Lead Engineer preparing for V1 production, every part of the codebase must be categorized for its future state.

## 🟢 KEEP AS IS
*   **The Routing Architecture (`App.tsx`, `main.tsx`)**: The separation of public marketing pages (URL-based) and the private dashboard (State-based Tab routing) works perfectly for this application type.
*   **Feature-Sliced Design Folders**: The domain separation is excellent.
*   **Zustand (Conceptually)**: Zustand is the right tool for the job.

## 🟡 REFACTOR
*   **`dashboardStore.ts`**: It is a 1000+ line God Object. 
    *   *Action*: Slice it into `useTransactionStore`, `useWalletStore`, and `useUserStore`.
*   **Mock Data Typing**: The mock arrays (`MOCK_BEHAVIOUR_TRANSACTIONS`) currently break the strict TypeScript interfaces defined in `types/`.
    *   *Action*: Align all mock data to strict types so `tsc -b` passes the build step.
*   **CSS Global Classes**: The design system relies on too many global `.panel-glass` classes.
    *   *Action*: Abstract these into React generic components (e.g., `<GlassCard>`).

## 🔴 REDESIGN UI ONLY
*   **`AddTransactionModal`**: The current UI for adding a transaction requires too many clicks and fields. It feels like database entry rather than a consumer app.
    *   *Action*: Simplify the form, utilize AI to auto-categorize based on the merchant name.

## 🟣 REWRITE (Backend Migration)
*   **All Intelligence Engines (`features/behaviour`, `features/recommendation`, `features/financial-health`)**: 
    *   *Why*: They currently execute synchronously in the browser. Iterating over thousands of transactions on the client will freeze the UI.
    *   *Action*: Rewrite these rule engines as **Supabase Edge Functions** (TypeScript/Deno) or a Python microservice. The client should only *fetch* the resulting insights, not calculate them.

## 🟤 REMOVE
*   **Hardcoded `mockCards.ts` and `mockMerchants.ts`**:
    *   *Why*: They are massive arrays bloating the client bundle.
    *   *Action*: Remove them completely once the Supabase database is seeded. The client should query the Knowledge Graph dynamically.

## 🔵 MERGE
*   **`finix/RecommenderPanel` & `finix/WalletOptimizerPanel`**:
    *   *Why*: They serve the same ultimate goal: showing the user gaps in their wallet and selling them a card.
    *   *Action*: Merge them into a single cohesive "Wallet Optimization Flow".
