# Phase 4: Routing Documentation

RenoCred employs a hybrid routing model: standard URL routing for public marketing pages, and state-based Tab navigation for the authenticated dashboard.

## A. Public Marketing Routes (URL Based)
Handled by `react-router-dom` in `main.tsx`. All public routes are wrapped in `<PublicLayout>`.

| Route Path | Component Rendered | Purpose | Auth Required | Exit Paths |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `HomePage` | Primary landing page explaining RenoCred's value. | No | Header/Footer Links, "Get Started" -> `/app` |
| `/about` | `AboutPage` | Company mission and team. | No | Global Links |
| `/contact` | `ContactPage` | Support and contact forms. | No | Global Links |
| `/methodology` | `MethodologyPage` | Explains the scoring models for transparency. | No | Global Links |
| `/editorial-policy` | `EditorialPolicyPage` | Details how credit card data is curated. | No | Global Links |
| `/affiliate-disclosure` | `AffiliateDisclosurePage` | Legal compliance for bank affiliate links. | No | Global Links |
| `/privacy` | `PrivacyPage` | Privacy and Data Handling policy. | No | Global Links |
| `/terms` | `TermsPage` | Terms of Service. | No | Global Links |
| `/disclaimer` | `DisclaimerPage` | Financial disclaimer notice. | No | Global Links |
| `/*` (Fallback) | `NotFoundPage` | Custom 404 screen. | No | Back to Home |

## B. Private Application Routes (State Based)
All private traffic flows through `/app/*`. Inside `App.tsx`, navigation is handled by the `Sidebar` component updating an internal state (`activeTab`) passed down via `DashboardLayout`.

| Active Tab State | Sub-Components Rendered | Purpose | Data Fetched / Required |
| :--- | :--- | :--- | :--- |
| `home` | `HomeTab`, `ActiveCard`, `TransactionFeed` | The main command center. Shows greeting, active alerts, highest priority Taqdeer decision, and the wallet carousel. | `creditAccounts`, `userCards`, `rewards`, `profile` |
| `optimizer` | `WalletOptimizerPanel`, `UpiSimulatorPanel`, `BillTrackerPanel` | Simulates and evaluates wallet coverage against spending. | Output of `RecommendationEngine` |
| `insights` | `SpendingAnalytics`, `CibilPanel`, `CreditScoreSimulator` | Granular charts of category spend and CIBIL impact simulation. | `transactions`, `credit_accounts` |
| `taqdeer` | `TaqdeerPanel` | Conversational interface. Chat UI for querying the Gemini API. | User input -> LLM -> Markdown rendering |
| `rewards` | `RecommenderPanel`, `PerksDashboard` | Aggregates all potential benefits (lounge access, fee waivers). | `userCards` metadata from knowledge graph |
| `settings` | `ProfileTab` | Allows the user to edit their segment and primary goal, directly affecting the AI engine's behavior. | `profile` |

## Navigation State Management
Because the private dashboard does not utilize nested URLs (e.g., changing tabs does not update the browser URL to `/app/insights`), standard browser back-button functionality does not work for navigating between Tabs. This is a common pattern in Desktop-like Web Apps but can frustrate mobile users expecting deep linking.
