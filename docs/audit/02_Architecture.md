# Application Architecture

RenoCred employs a **Feature-Sliced Design (FSD)** inspired architecture tailored for a heavy client-side AI inference application. It minimizes coupling across domains while maintaining a highly interactive UI layer.

---

## 1. Core Principles
*   **Decoupled Features**: Each major business domain (e.g., `card-intelligence`, `financial-health`, `taqdeer`) is encapsulated within `src/features/`. 
*   **Lazy Loading**: Heavy UI panels (like charts, simulators, and analytics) are dynamically imported using React `lazy` and `Suspense` at the application entry points (`App.tsx`).
*   **Client-Side Intelligence**: The application leans heavily on client-side rules engines. State, scoring models, and recommendation logic are computed in the browser to ensure zero latency.

---

## 2. Logical Layers

### A. Presentation Layer (UI/UX)
*   **Global Layouts**: `DashboardLayout` for the private app and `PublicLayout` for marketing pages.
*   **Design System**: Implemented globally via Tailwind CSS (`tailwind.config.js`) and raw CSS (`index.css`), utilizing specific CSS custom properties for semantic coloring and "Anti-Gravity" shadows.
*   **Components**: Segregated into generic UI components (`src/components/ui`) and feature-specific components (`src/features/*/components`).

### B. Business Logic & Intelligence Layer (Engines)
RenoCred operates several independent engines that ingest user profiles and card data to output recommendations:
*   **Taqdeer Engine**: Resolves user intents via a registry pattern or falls back to Gemini API LLM generation for NLP queries.
*   **Recommendation Engine**: Scores cards and actions against a user's `primaryGoal` and spending habits.
*   **Behaviour Engine**: Analyzes transaction history to generate actionable financial insights.
*   **Financial Health Engine**: Calculates a proprietary "RenoCred Intelligence Score" out of 100.
*   **Notification Engine**: Prioritizes alerts and warnings (e.g., high utilization).

### C. State Management Layer
*   **Global Store**: Zustand (`dashboardStore.ts`) holds the single source of truth for the user's active session, including their linked credit cards, transactions, and profile data. It relies on local storage persistence.
*   **Component State**: React `useState` and `useRef` for ephemeral UI interactions (modals, dropdowns, tab switching).

### D. Data Access & API Layer
*   **Supabase Client**: Standard data fetching for backend persistence (when implemented).
*   **LLM API**: Direct fetch calls to `generativelanguage.googleapis.com` (Gemini API) with failovers to custom endpoints (`VITE_AI_API_URL`).
*   **Analytics Hook**: PostHog initializes early in the render cycle (`main.tsx`) and captures events via `analytics.ts` wrappers.

---

## 3. Data Flow Example: Requesting a Taqdeer AI Recommendation
1.  **User Input**: User types a query in `QuickAskTaqdeer.tsx`.
2.  **Action**: Component calls `generateTaqdeerResponse(query, userCards)`.
3.  **Engine Routing**: 
    *   Taqdeer checks the **Intent Registry** (Regex pattern matching for known queries like "wallet health").
    *   If matched, deterministic client-side logic calculates the response.
    *   If unmatched, it constructs an LLM prompt and fires a request to Gemini API.
4.  **State Update**: The response is appended to the chat history array in the local component state.
5.  **Render**: `TaqdeerPanel.tsx` re-renders with Framer Motion animations.
6.  **Telemetry**: `analytics.track('Prompt Sent')` fires to PostHog.
