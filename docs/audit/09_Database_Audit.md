# Database & Supabase Audit

RenoCred uses **Supabase** as its backend-as-a-service (BaaS), relying on PostgreSQL for relational data storage and Edge Functions for potential serverless logic. 

## 1. Schema Design (`production_schema.sql`)
The schema is highly normalized, utilizing strict foreign key constraints and Enums to ensure data integrity.

### Core Tables:
1.  **`profiles`**: The central user record.
    *   **Auth Link**: The `id` column maps directly to the Clerk User ID (`auth.jwt()->>'sub'`).
    *   **Financial Metadata**: Stores `salary`, `credit_score` (constrained to 300-900), `primary_goal`, and `user_segment`.
2.  **`user_cards`**: Maps a specific credit card network and tier to a user.
3.  **`credit_accounts`**: Tracks the live ledger of a card (Total Limit, Current Balance, Minimum Payment, APR).
4.  **`rewards_accounts`**: Aggregates points across all cards.
5.  **`transactions`**: The core event log. Uses enums for category (`dining`, `travel`, etc.) and type (`debit`, `credit`).

### Enums & Constraints:
*   Extensive use of `ENUM` types (`transaction_category_enum`, `card_premium_tier_enum`, `financial_health_grade_enum`) prevents string-based data corruption.
*   `CHECK` constraints enforce business logic at the database level (e.g., preventing negative balances).
*   Standard `updated_at` triggers exist on all tables.

## 2. Row Level Security (RLS)
*Assumption based on standard Supabase architecture patterns observed in the codebase.*
Because authentication is handled by **Clerk** rather than Supabase Auth, RLS policies must utilize a custom JWT integration. 
*   Supabase requires setting a custom claim (e.g., `request.jwt.claim.sub`) to identify the user.
*   Every table is expected to have policies restricting `SELECT`, `INSERT`, `UPDATE`, and `DELETE` to rows where `user_id = auth.uid()` (or the Clerk equivalent).

## 3. Client-Side Abstraction
*   `dashboardStore.ts` utilizes a `safeDbWrite` helper. This wrapper intercepts Supabase SDK errors, surfaces them via `sonner` toast notifications, and returns normalized null states to the UI.
*   Hydration: The store features a `hydrateFromSupabase` function, designed to pull down the user's entire state upon login.

## 4. Risks & Recommendations
*   **Clerk-Supabase Sync**: Ensuring that a user record is created in `public.profiles` the moment a user signs up via Clerk requires either a Clerk Webhook (processed by an Edge Function) or optimistic creation on the first client render.
*   **Offline Support**: Currently, the app relies heavily on `zustand/persist` (localStorage). If the user clears local storage, they must have network access to re-hydrate from Supabase.
*   **Scalability of Transactions**: The `transactions` table will grow infinitely. Eventually, implementing pagination or windowing in the `TransactionFeed.tsx` query will be necessary.
