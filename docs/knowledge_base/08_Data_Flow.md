# Phase 8: Data Flow Lifecycle

This document traces the exact lifecycle of data during a critical user action.

## Scenario: User Logs a New Transaction

1.  **User Action**: The user fills out the Add Transaction form (Amount, Category, Merchant) and clicks "Submit".
2.  **Component Level**: The `<AddTransactionModal>` captures the form data in local React state.
3.  **Store Dispatch**: The component calls the global action `addTransaction(input)` on `useDashboardStore`.
4.  **Optimistic UI Update (Zustand)**: 
    *   The store instantly generates a local ID and pushes the transaction into the `state.transactions` array.
    *   It locates the active card's `creditAccount` and increments `currentBalance`.
    *   It calculates reward points (`calcRewardPoints`) and adds them to `state.rewards`.
5.  **UI Reaction**: Because the global state changed, the `<TransactionFeed>`, `<StatPanel>` (Balance), and `<HomeTab>` re-render instantly (0ms latency).
6.  **Engine Recalculation**: The `useBehaviourInsights()` hook detects a change in `transactions` and recalculates. If this new transaction pushes the user's dining spend over 15%, a new Insight is generated and appears on the dashboard.
7.  **Database Sync (Supabase)**: 
    *   *Simultaneously with Step 4*, the `addTransaction` action fires an async `safeDbWrite` wrapper.
    *   It sends an `INSERT` command via the Supabase client to the `transactions` table.
8.  **Response & Transformation**: 
    *   If Supabase returns a success (201), the process is complete.
    *   If Supabase errors, `safeDbWrite` catches the error, triggers a `sonner` toast to the user, and (ideally) rolls back the optimistic update in the store.

## Scenario: Taqdeer AI Chat Request

1.  **User Action**: Types "What card should I use for fuel?" and hits enter.
2.  **Component Level**: `<TaqdeerPanel>` appends the user's message to local chat state (`role: 'user'`).
3.  **Engine API Call**: The component calls `generateTaqdeerResponse(query, userCards)`.
4.  **Backend Proxy**: The client sends a `fetch` request to `/api/health-ai` or directly to the LLM.
5.  **LLM Processing**: The Gemini API processes the prompt (which includes hidden context about the user's cards).
6.  **Response**: The JSON response is returned to the client.
7.  **Transformation**: The component parses the response text.
8.  **UI Update**: The text is rendered via `react-markdown`. If the LLM returned structured tool calls, interactive UI buttons (e.g., "Add Fuel Card") are rendered in the chat stream.
