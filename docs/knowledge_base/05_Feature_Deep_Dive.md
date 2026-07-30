# Phase 5: Feature Deep Dive

A comprehensive review of every feature module in `src/features/`.

## 1. `behaviour` (Behaviour Engine)
*   **Purpose**: Analyzes transaction history to generate actionable insights.
*   **Business Logic**: Groups transactions by category, calculates monthly spend vs total limits, and surfaces recurring merchants. Contains hardcoded rules (e.g., if Dining > 15% of total spend, fire "Dining Increase" insight).
*   **State / Stores**: Reads directly from `useDashboardStore.getState().transactions`.
*   **Limitations**: It executes entirely client-side. Iterating over 10,000+ transactions will freeze the main thread.
*   **Scalability**: Needs migration to a serverless backend cron job that caches insights per user.

## 2. `card-intelligence`
*   **Purpose**: Manages the static properties, benefits, and multipliers of credit cards.
*   **Business Logic**: Maps card metadata (e.g., `HDFC Infinia`) to potential reward structures.
*   **State / Stores**: Primarily relies on `mockCards.ts` (a large array of objects).
*   **Scalability**: Must be migrated to a relational Postgres structure (`master_cards` table) so the curation team can update card multipliers without a code deployment.

## 3. `dashboard`
*   **Purpose**: The central nervous system of the application.
*   **Business Logic**: Contains the `dashboardStore.ts`, the primary Zustand store managing `transactions`, `creditAccounts`, `rewards`, and hydration logic from Supabase.
*   **UI**: Houses `HomeTab.tsx`, `TransactionFeed.tsx`, and `AddCardModal.tsx`.
*   **Hidden Assumptions**: Assumes `localStorage` has enough quota to store the entire ledger history.

## 4. `feature-flags`
*   **Purpose**: Manages rollouts of experimental features.
*   **Business Logic**: Wraps `posthog-js` to expose a boolean `useFeatureFlag('feature_name')` hook.
*   **Dependencies**: PostHog API.

## 5. `financial-health`
*   **Purpose**: Generates the proprietary "RenoCred Score" (0-100).
*   **Business Logic**: Evaluates `credit_score`, `salary`, and profile completeness. Generates qualitative feedback (e.g., "Top Strength: Low credit utilization").

## 6. `financial-ledger`
*   **Purpose**: Calculates lifetime savings and reward points accumulation.
*   **UI**: Powers the "Your Financial Impact" widget.
*   **State**: Reads `rewards` and aggregates transaction savings arrays.

## 7. `finix`
*   **Purpose**: A container for heavy, complex sub-panels dynamically loaded into the dashboard.
*   **Components**: `CibilPanel` (interactive SVG dials), `TaqdeerPanel` (Chat UI), `WalletOptimizerPanel` (Recharts visualization).
*   **Reusable Parts**: Very few. These are monolithic "god components" wrapping massive amounts of presentation logic.

## 8. `merchant-intelligence`
*   **Purpose**: Maps user cards to live merchant offers.
*   **Business Logic**: Scans `userCards`, looks up a hardcoded array (`mockMerchants.ts`), and returns a "Best Offer" based on confidence matching.

## 9. `notifications`
*   **Purpose**: Aggregates warnings from other engines.
*   **Business Logic**: Sorts insights by `impactScore` or `priority` and surfaces the highest one to the `HomeTab` (e.g., "Payment Due in 2 Days").

## 10. `recommendation`
*   **Purpose**: Recommends new credit cards based on spending gaps.
*   **Business Logic**: Evaluates the user's `primaryGoal` and `topCategories` from the Behaviour Engine against the `card-intelligence` metadata.

## 11. `taqdeer`
*   **Purpose**: The AI financial advisor.
*   **Business Logic**: A two-stage pipeline. Stage 1: Regex intent matching (fast, deterministic). Stage 2: Generates a system prompt injecting the user's current card state and fetches from the Gemini API.
*   **Dependencies**: `VITE_AI_API_URL` (Proxied via `/api/health-ai`).
