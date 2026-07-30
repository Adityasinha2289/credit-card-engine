# API & Backend Audit

RenoCred employs a hybrid architecture, combining serverless functions for critical external communications (like AI generation) with direct client-to-BaaS connections (Supabase).

## 1. Vercel Serverless Functions (`/api/`)
These functions reside in the `api/` directory and are deployed as Vercel serverless endpoints.

| Endpoint | File | Purpose | Status |
| :--- | :--- | :--- | :--- |
| `/api/health-ai` | `health-ai.ts` | Proxies a health check request to the `VITE_AI_API_URL`. Prevents CORS issues and hides the actual AI backend URL from the client during health probes. Returns 200 OK or 503 Service Unavailable. | Active |
| `/api/health` | `health.ts` | Basic application health check returning a timestamp and `status: 'ok'`. | Active |
| `/api/recommendations` | `recommendations.ts` | Acts as a proxy to fetch AI-generated recommendations, likely communicating with a Python backend or direct LLM. | Active |
| `/api/send-email` | `send-email.ts` | Utilizes the `resend` library to dispatch transactional emails (e.g., Welcome emails, alert notifications). | Active |

## 2. Supabase Integration
*   **Initialization**: Managed via `src/lib/supabase.ts` and consumed through the `useSupabase()` hook.
*   **Database Schema**: Expected to handle `profiles`, `user_cards`, `transactions`, and `ledgers`. (Further investigated in Phase 8).
*   **Client-Side Writes**: The `dashboardStore.ts` contains helper functions (`safeDbWrite`) that attempt to optimistically update the Zustand store while firing off asynchronous writes to Supabase.

## 3. External API Integrations
*   **Google Gemini API**: Accessed for the Taqdeer AI advisor. Prompts are constructed client-side (or via `/api/`) and sent to generate conversational financial advice.
*   **PostHog API**: Client-side event ingestion via the `posthog-js` SDK. Tracks page views, feature flags, and custom events (`track()`).
*   **Clerk API**: Handled entirely via the `@clerk/clerk-react` SDK for session management and user identity mapping.

## 4. Security & Error Handling Assessment
*   **Error Boundaries**: The application wraps the main app in an `ErrorBoundary` and uses Sentry for tracking unhandled exceptions.
*   **Secret Management**: Keys (`VITE_SUPABASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`) are managed via environment variables. The `api/` folder accesses `process.env`, ensuring private keys (like Resend API keys) are not leaked to the client bundle.
*   **Resilience**: The `health-ai.ts` endpoint includes an `AbortController` with a 5-second timeout to prevent serverless function hangs if the AI backend is unresponsive. This is a good practice for resilience.
