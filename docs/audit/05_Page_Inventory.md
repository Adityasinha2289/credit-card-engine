# Page & Screen Inventory

RenoCred's routing is divided into two distinct domains: the Public Marketing Platform (traditional URL routing) and the Private Application Dashboard (SPA Tab Navigation).

## 1. Marketing & Public Pages

These pages are SEO optimized, require no authentication, and are wrapped in the `<PublicLayout>` component (which includes the public navigation bar and footer).

| Route | Page Component | Purpose | Authentication | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `HomePage` | Primary landing page, value proposition, and CTA to sign up. | None | Active |
| `/about` | `AboutPage` | Company mission, vision, and team details. | None | Active |
| `/contact` | `ContactPage` | Contact forms and support information. | None | Active |
| `/methodology` | `MethodologyPage` | Explains the AI scoring and recommendation algorithms. | None | Active |
| `/editorial-policy`| `EditorialPolicyPage`| Guidelines on how card data is curated and reviewed. | None | Active |
| `/affiliate-disclosure`| `AffiliateDisclosurePage`| Legal disclosure regarding bank partnerships and commissions. | None | Active |
| `/privacy` | `PrivacyPage` | Privacy policy and data handling (essential for financial apps). | None | Active |
| `/terms` | `TermsPage` | Terms of service. | None | Active |
| `/disclaimer` | `DisclaimerPage` | Financial advice disclaimers. | None | Active |
| `/*` | `NotFoundPage` | 404 Error page. | None | Active |

## 2. Authentication Flow

Authentication is handled entirely via Clerk components, styled to match the "Anti-Gravity" theme.

| Route | Component | Purpose | Authentication | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| `/app/login` (fallback) | `<LoginScreen>` | Initial authentication screen rendered if the user session is absent inside `/app`. | N/A | Active |
| Clerk Modals | `<ClerkProvider>` elements | Sign Up, Sign In, OTP Verification, Password Reset. | N/A | Active (Overridden UI) |

## 3. Private Dashboard Screens (SPA)

All private views are located under the `/app/*` route. The application behaves as an SPA, swapping out views based on an active Tab State rather than utilizing `react-router` nested routes. They are wrapped in `<DashboardLayout>`.

### A. Home Dashboard
*   **Component**: `HomeTab` (Inside `App.tsx`)
*   **Purpose**: The central command center. Displays time-aware greetings, top-level financial impact ledgers, RenoCred Intelligence Score, Smart Alerts, Taqdeer's top pick, and the horizontal active card carousel.
*   **Data Sources**: `useDashboardStore`, `useBehaviourInsights`, `useTaqdeerDecision`, `useCardIntelligence`.

### B. Wallet & Optimizer
*   **Component**: `WalletOptimizerTab` (Renders Finix Panels)
*   **Purpose**: Deep dive into the user's current cards.
*   **Sub-Views**:
    *   `WalletOptimizerPanel`: Analyzes current cards, calculates missing coverage, suggests upgrades.
    *   `UpiSimulatorPanel`: Simulates RuPay UPI capabilities.
    *   `BillTrackerPanel`: Aggregates upcoming credit card bills.
    *   `EmiCalculatorPanel`: Simulates converting large transactions to EMIs.

### C. Insights & Analytics
*   **Component**: `InsightsTab` (Renders Finix Panels)
*   **Purpose**: Advanced charting, reporting, and CIBIL simulations.
*   **Sub-Views**:
    *   `InsightsPanel` & `SpendingAnalytics`: Categorized spend breakdowns using Recharts.
    *   `CibilPanel`: Deep dive into credit score factors.
    *   `CreditScoreSimulator`: Interactive sliders to see how actions (like closing a card) affect CIBIL.
    *   `BudgetingPanel`: Dynamic budget tracking.
    *   `MonthlyReport`: PDF-like snapshot of the previous month.

### D. AI Advisor (Taqdeer)
*   **Component**: `TaqdeerPanel`
*   **Purpose**: A full-screen conversational interface with the Gemini-powered AI advisor. Allows free-text queries regarding wallet optimization.
*   **Data Sources**: `TaqdeerEngine`, Gemini API.

### E. Rewards & Recommendations
*   **Component**: `RecommenderPanel` / `PerksDashboard`
*   **Purpose**: Shows personalized card recommendations and a consolidated view of lounge access, milestones, and fee waivers.

### F. Profile & Settings
*   **Component**: `ProfileTab`
*   **Purpose**: Manages user persona (segment, occupation, goals), enabling the user to tweak the inputs that feed the AI engines.

## Summary & Hierarchy Analysis
The routing structure favors deep, modular panels over flat pages. This creates a highly immersive, application-like feel (similar to native iOS apps) but makes deep-linking to specific insights impossible since the URL remains `/app`. For a web application, migrating from state-based tabs to `react-router` nested routes (e.g., `/app/wallet`, `/app/insights`) would be a strong future recommendation.
