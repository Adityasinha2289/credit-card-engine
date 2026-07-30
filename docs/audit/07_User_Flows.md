# User Flows

RenoCred is designed around a single-page application (SPA) dashboard model, minimizing full page reloads to maintain a fluid, app-like experience.

## 1. Onboarding & Authentication Flow
1.  **Landing Page (`/`)**: User arrives at the marketing site. Clicks "Get Started".
2.  **Auth Gateway (`/app/login`)**: If no active Clerk session exists, the `<LoginScreen>` is presented.
3.  **Authentication**: User completes Sign Up / Sign In via Clerk's modal flow (Email/OTP or OAuth).
4.  **Initial Hydration**: `DashboardLayout` mounts. `useDashboardStore.hydrateFromSupabase()` fires to sync user state (cards, profile, txns).
5.  **Empty State (First Login)**: If `userCards.length === 0`, the Home Tab displays a highly visible "Add Your First Card" empty state widget.

## 2. Core Engagement Loop (The Dashboard)
1.  **Boot Sequence**: Simulated loading skeletons appear for 1.2s to build perceived value and allow intelligence engines to compute.
2.  **Home Tab View**: 
    *   User sees a time-aware greeting.
    *   **Notification Engine** surfaces highest-priority alert (e.g., "Upcoming Bill").
    *   **Financial Health Engine** displays the current RenoCred score.
    *   **Taqdeer Engine** surfaces the single best recommended action.
3.  **Card Selection**: User clicks a card in the horizontal carousel.
    *   Action: `setActiveCard(id)` fires.
    *   UI updates instantly: The card glows, and surrounding widgets (if card-specific) recalculate.

## 3. The "Taqdeer" AI Advisor Flow
1.  User clicks the glowing "Taqdeer" floating action button or navigates to the AI tab.
2.  **Input**: User types a natural language query (e.g., "Should I close my SBI card?").
3.  **Processing**:
    *   Component calls `generateTaqdeerResponse(query)`.
    *   Taqdeer checks the local Intent Registry.
    *   If no match, it calls the Gemini API via the backend.
4.  **Output**: Taqdeer renders a structured response, often including actionable buttons (e.g., "Simulate CIBIL Impact").

## 4. Wallet Optimization Flow
1.  User navigates to the "Optimizer" tab.
2.  **Engine Analysis**: `WalletOptimizerPanel` maps user's current cards against spending categories.
3.  **Discovery**: UI highlights a gap (e.g., "High Spend in Dining, but no Dining Card").
4.  **Recommendation**: `RecommenderPanel` suggests the best card to fill the gap (e.g., "HDFC Swiggy Card").
5.  **Action**: User can click to view benefits or theoretically apply (simulated).

## 5. Transaction & Ledger Flow
1.  User simulates a purchase or a bill payment.
2.  **Action**: `addTransaction()` or `payBill()` fired to `dashboardStore`.
3.  **Mutation**: 
    *   Current balance updates.
    *   Available credit updates.
    *   `calcRewardPoints()` evaluates multipliers and adds to `rewards` ledger.
4.  **Telemetry**: PostHog tracks the event.
5.  **Insight Generation**: The Behaviour Engine recalculates in the background, potentially generating a new insight (e.g., "High utilization warning").
