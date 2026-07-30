# Project Overview: RenoCred 

**Project Type**: Intelligent Financial Operating System  
**Version**: 0.0.0 (Pre-Release / MVP)  
**Primary Goal**: An AI-driven credit card and wealth advisory platform for the Indian market, maximizing savings, tracking financial health, and optimizing credit utilization.

---

## 1. Tech Stack
RenoCred is a modern, highly interactive React application built with performance and aesthetics as primary drivers.

*   **Core**: React 19, DOM rendering.
*   **Build Tool**: Vite 8, utilizing Rolldown for high-speed builds.
*   **Language**: TypeScript (Strict Mode).
*   **Styling**: Tailwind CSS 3.4, PostCSS, custom CSS Variables for a bespoke "Anti-Gravity" glassmorphic UI.
*   **State Management**: Zustand (Global state, persisted).
*   **Routing**: React Router DOM v7.
*   **Authentication**: Clerk (`@clerk/clerk-react`) with dark theme integration.
*   **Database & API**: Supabase (`@supabase/supabase-js`).
*   **Animations**: Framer Motion for micro-interactions and fluid layout transitions.
*   **Icons**: Lucide React.
*   **Data Visualization**: Recharts.
*   **Analytics**: PostHog.
*   **Error Tracking**: Sentry.
*   **Code Quality**: Oxlint, TypeScript compiler checks.

---

## 2. App Architecture
The application follows a **Feature-Sliced Design (FSD)** inspired architecture. It strictly separates concerns into domains (e.g., `features/dashboard`, `features/finix`, `features/card-intelligence`), keeping logic localized and highly cohesive. 

### Key Architectural Pillars:
1.  **AI Engine Layer**: Contains complex, client-side inference and logic engines (`Taqdeer Engine`, `Recommendation Engine`, `Financial Health Engine`).
2.  **Presentation Layer**: Built with heavily customized Tailwind classes focusing on a premium "Anti-Gravity" design system. It uses `lazy` and `Suspense` aggressively to split bundles for heavy Finix panels and complex dashboards.
3.  **Authentication Layer**: Managed entirely via Clerk. Wraps the application to enforce strict session states before rendering the `/app` routes.
4.  **Analytics Layer**: PostHog tracks every interaction (e.g., `Prompt Sent`, `Card Added`) for granular product analytics. Sentry runs silently to capture client-side exceptions.

---

## 3. Routing Structure
RenoCred employs a split routing strategy handled inside `src/main.tsx` and `src/App.tsx`.

*   **Public Platform (`/`)**: 
    *   `/` - Home Page
    *   `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/methodology`, `/editorial-policy`
    *   Wraps pages in a `<PublicLayout>`. No authentication required.
*   **Private App (`/app/*`)**:
    *   Handled via React Router inside `App.tsx` wrapped in `<DashboardLayout>`.
    *   Routes are managed by internal Tab state (`HomeTab`, `WalletOptimizerTab`, `InsightsTab`, `ProfileTab`) rather than explicit URL changes, effectively acting as a Single Page Application (SPA) dashboard.
    *   Requires Clerk Authentication.

---

## 4. State Management
*   **Zustand**: Powers the global `dashboardStore.ts`. Handles `userCards`, `creditAccounts`, `rewards`, `activeCardId`, `transactions`, and `profile`. It persists data to `localStorage`.
*   **Context/Hooks**: Custom hooks map directly to feature logic (e.g., `useRecommendations`, `useTaqdeerDecision`, `useCardIntelligence`).
*   **Local State**: `useState` is used for UI toggles (modals, active tabs, hover states).

---

## 5. Authentication Flow
Powered by **Clerk**:
1.  User accesses `/app`.
2.  If unauthenticated, Clerk redirects to the internal Sign In / Sign Up flow (utilizing `signInFallbackRedirectUrl`).
3.  The Clerk UI is heavily overridden in `index.css` to remove watermarks, hide default footers, and blend seamlessly into the "Anti-Gravity" theme.
4.  Once authenticated, the `AuthAnalytics` component hooks into Clerk's user object to identify the user in PostHog.

---

## 6. API & Database Layer
*   **Database**: Supabase serves as the backend database.
*   **AI Backend**: Communicates with Google's Gemini API directly from the client (`generateTaqdeerResponse`) or falls back to a custom backend (`VITE_AI_API_URL`).
*   **Mock Data**: A significant portion of intelligence currently utilizes rich client-side mock datasets (`mockCards.ts`, `mockMerchants.ts`, `demoData.ts`) to simulate the engine's capabilities.

---

## 7. External Services
*   **Clerk**: Identity and User Management.
*   **Supabase**: PostgreSQL Database and Edge Functions.
*   **PostHog**: Product Analytics and Feature Flags (e.g., `useFeatureFlag('live_offers')`).
*   **Sentry**: Application Monitoring.
*   **Gemini API**: Generative AI for the Taqdeer Advisor.
*   **Resend**: Transactional emails (mentioned in `package.json`).

---

## 8. Build Configuration & Deployment
*   **Vite**: The build tool configured in `vite.config.ts`.
    *   **Port**: `3000` (Dev).
    *   **Code Splitting**: Manual chunking implemented in Rollup config to isolate `vendor-react`, `vendor-ui`, `vendor-auth`, and `vendor-db`.
    *   **Sentry Plugin**: Injects release data and uploads sourcemaps in production.
*   **Vercel**: The `vercel.json` and `@vercel/node` packages suggest deployment on Vercel's edge network.
