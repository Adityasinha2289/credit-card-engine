# Phase 14: Security Assumptions & Posture

## 1. Authentication (Clerk)
*   **Assumption**: Clerk is the absolute source of truth for user identity.
*   **Implementation**: RenoCred does not store passwords or manage JWT signing. It delegates entirely to Clerk.
*   **Security Risk**: If the Clerk JWKS (JSON Web Key Set) rotates unexpectedly, or the `VITE_CLERK_PUBLISHABLE_KEY` is misconfigured, the entire app fails closed.

## 2. Database Authorization (Supabase RLS)
*   **Assumption**: The frontend client is inherently untrusted.
*   **Implementation**: All queries from the frontend use the anonymous `anon` key. Supabase Row Level Security (RLS) intercepts every query.
*   **Policy Rule**: `auth.uid() = user_id`. 
*   **Vulnerability Check**: Because `dashboardStore.ts` executes `safeDbWrite` with the current user's payload, a malicious actor could intercept the network request and try to mutate `user_id` to another UUID. Supabase RLS will block this because the Postgres `auth.uid()` function decodes the secure JWT, ignoring the payload's `user_id`.

## 3. Environment Variables & Secrets
*   **Client Secrets**: Variables prefixed with `VITE_` (e.g., `VITE_SUPABASE_ANON_KEY`, `VITE_POSTHOG_KEY`) are bundled into the client JS. This is by design and safe, provided RLS is configured correctly.
*   **Server Secrets**: Variables like the Gemini API Key or Resend Email keys MUST NEVER be prefixed with `VITE_`. They reside in Vercel's secure environment and are only accessed by `api/` functions via `process.env`.

## 4. Cross-Site Scripting (XSS)
*   **Assumption**: React automatically sanitizes string inputs to prevent XSS.
*   **Vulnerability Check**: The `TaqdeerPanel` renders LLM output via `react-markdown`. If the LLM goes rogue and outputs malicious `<script>` tags, standard `react-markdown` escapes raw HTML by default. However, if `rehypeRaw` is enabled in the parser (to allow custom HTML widgets), it opens an XSS vector. This must be strictly monitored.

## 5. Protected Routes
*   **Implementation**: There is no router-level guard (e.g., `<ProtectedRoute>`) wrapping the `/app` route. Instead, `App.tsx` handles it at the component level:
    ```tsx
    if (!isSignedIn) return <LoginScreen />
    ```
*   **Why it exists**: It allows the heavy dashboard bundle to begin loading in the background while the user looks at the login screen, speeding up perceived performance post-login.
