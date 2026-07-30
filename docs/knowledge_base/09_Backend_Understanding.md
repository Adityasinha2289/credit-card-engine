# Phase 9: Backend Understanding

RenoCred relies on a hybrid backend: Vercel Serverless for utility proxies and Supabase for relational data.

## 1. Supabase (The Primary Backend)

### Database Schema
The database is defined in `supabase/migrations/20260726000000_production_schema.sql`. It relies heavily on standard relational modeling and Postgres constraints.
*   **`profiles`**: The central anchor for a user.
*   **`user_cards`**: A user's physical/virtual wallet inventory.
*   **`credit_accounts`**: The running ledger of balances and limits tied to a `user_card`.
*   **`transactions`**: The chronological event log of all spending.

### Row Level Security (RLS)
Supabase enforces security at the database row level.
*   **Requirement**: Because Auth is handled by Clerk, Supabase must be configured to trust Clerk's JWTs.
*   **Policies**: Every table has policies similar to: `CREATE POLICY "Users can only view their own transactions" ON transactions FOR SELECT USING (user_id = auth.jwt()->>'sub');`. This ensures that even if a malicious user connects to the Supabase endpoint directly, they cannot fetch another user's financial data.

### Storage & Realtime
*   **Storage**: Currently unused, but positioned for uploading statements or receipts.
*   **Realtime**: Unused. The app favors manual hydration on boot rather than WebSocket pub/sub for transactions.

### Edge Functions / Triggers
*   **Triggers**: Plpgsql functions (e.g., `update_updated_at_column`) automatically update timestamps on every mutation.
*   **Edge Functions**: Supabase Edge functions (Deno) could be used to securely process scheduled tasks (e.g., Monthly Report generation), replacing client-side generation.

## 2. Authentication (Clerk)
*   Clerk handles MFA, passwordless login, and session persistence.
*   **Integration**: The `@clerk/clerk-react` SDK provides the `<ClerkProvider>` and `useUser()` hook. The `user.id` string from Clerk is passed into Supabase as the Foreign Key for all tables.

## 3. Serverless API (`/api`)
*   Vercel serverless functions (`health-ai.ts`, `send-email.ts`) exist to protect API keys. For example, if the application directly pinged the Gemini API from the client, the API key would be exposed in the network tab. Instead, the client pings `/api/health-ai`, which holds the secret `process.env.VITE_AI_API_URL` securely.

## 4. The "Missing" Backend
Currently, all intelligence engines (Taqdeer, Recommendations, Health) run in the browser. 
**Architectural Goal**: These engines must be migrated. For example, a Supabase Edge Function should run every night, analyze a user's `transactions`, update the `financial_health` score, and write it back to the database. The frontend should merely *display* the result, rather than computing it on the fly.
