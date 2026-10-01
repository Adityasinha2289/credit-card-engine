# Plan Architecture Audit (Phase 0)

## 1. Plan Hub Routing
- **Routes:** Handled via `App.tsx` (using `lazy()` loaded components for `/app/plan`, `/app/plan/trip`, `/app/plan/date`, `/app/plan/movie`, `/app/plan/weekend`, `/app/plan/food`, `/app/plan/occasion`).
- **Plan Hub UI:** `src/pages/app/PlanHubPage.tsx` manages displaying the planning experiences, passing along the `?demo=profile` query parameters when entering individual planners.
- **Current State:** Hub is a visual launcher. The 5 non-trip planners are interactive UI shells storing state in their own components locally, with `FULLY_ACTIVE` for trip and `UI_READY` for the rest.

## 2. Demo Mode Propagation
- **State Logic:** Uses `DemoAppProvider` which intercepts queries and sets global demo context. 
- **Query Params:** All react-router navigation (`useNavigate`) preserves `location.search` (i.e. `?demo=profile`), meaning Demo Mode isolation stays intact across pages.

## 3. Trip Route
- **Component:** `TripPlannerPage.tsx`. Uses `useTripPlanner` hook which holds its own React state for a 10-step wizard.
- **Steps:** Origin, Destination, Dates, Travelers, Transport, Stay, Experiences.
- **Integration:** Reaches out to provider interfaces (mock or real) and itinerary/budget engines (`itineraryEngine.ts`, `budgetEngine.ts`).

## 4. Secondary Planner Routes
- **Components:** `DatePlannerPage.tsx`, `MoviePlannerPage.tsx`, `WeekendPlannerPage.tsx`, `FoodPlannerPage.tsx`, `OccasionPlannerPage.tsx`.
- **State:** Each page uses local `useState` for steps and an inline `{DraftType}` (e.g. `MoviePlanDraft`). They are purely UI shells (up to 10-11 steps) with no persistence.

## 5. Planning State
- **Trip:** Draft object `TripPlanDraft` in `src/features/plan/types.ts`.
- **Other Planners:** Inline draft types inside the respective components.
- **Persistence:** None. State is lost on refresh or cross-navigation. No `PlanSession` model exists.

## 6. Provider Selection
- **Logic:** `useIsDemo()` (or similar environment checks) is used to toggle between production implementations and demo fixtures.
- **Registry:** There's no unified `PlanningProviderRegistry` currently abstracting all services securely.

## 7. Mock Providers
- Files: `DemoPlaceProvider.ts`, `mockProviders.ts`, `mockHotelProvider.ts`.
- Provides deterministic fallback data for development/demo.

## 8. Real Providers
- Files: `RealPlaceProvider.ts` (Google Places), plus mock scaffolding for production that throws unimplemented errors or fetches limited API scope.

## 9. Data Persistence
- **Current Database:** Supabase, schema defined in `src/lib/database.types.ts`.
- **Planning Tables:** **NONE EXIST**. No table for planning sessions in Supabase.
- **Dashboard Store:** `src/features/dashboard/store/dashboardStore.ts` stores user wallet, cards, profile, but **NOT** planning data.

## 10. State Management
- `zustand` is used for the wallet/dashboard context (`dashboardStore`).
- Planner states rely heavily on transient React `useState` hooks. 

## 11. Current Page Shell
- The `PlanningWizardShell.tsx` provides Framer-motion transitions, standardized layouts, and header elements for a step-by-step UX. It's built for linear onboarding flows, not progressive disclosure/intelligence.

## 12. Current Wizard Step Count
- **Trip:** 10 steps.
- **Date:** 10 steps.
- **Weekend:** 11 steps.
- **Food:** 10 steps.
- **Occasion:** 11 steps.
- **Movie:** 10 steps.

## 13. Current Draft Structures
- Trip draft contains structured location and timestamp objects.
- Secondary planners use primitive strings (e.g. `location: string`). Need to upgrade to structured Place/Metadata objects for routing/calculating logic.

## 14. Current Supabase Usage
- Handles Profiles (`users`), `user_cards`, `transactions`, `budgets`, `subscriptions`, etc.
- No planning queries or RLS currently configured.

## 15. Current Backend/API Architecture
- Primarily client-side fetching relying on RLS + Supabase APIs.
- Some atomic mutations leverage Supabase RPCs (e.g. `add_transaction_v1`).

## 16. Current DemoAppProvider
- Used across the application to override the user session to `clerkId = demo-clerk-123` so we can inspect mock data without modifying DB.

## 17. Current DemoDataInspector
- Located at bottom of screen in Demo mode. Needs to be upgraded to show planning variables.

---

### Internal Reconciliation Map
- **Goal:** Move from **Ephemeral React state** to **Persistent Supabase state (`planning_sessions`)**.
- **Goal:** Move from **10-step manual input loops** to **Taqdeer Smart Brain progressive disclosure** (using Profile context to fill blanks).
- **Goal:** Move from **Inline draft types** to a **Unified PlanSession Domain Model**.
