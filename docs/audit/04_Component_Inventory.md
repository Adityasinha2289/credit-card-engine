# Component Inventory

RenoCred's UI is built with a mix of highly reusable primitive components and complex, domain-specific feature components. It leverages React 19, Tailwind CSS, and Framer Motion.

## 1. Generic UI Components (`src/components/ui/`)
These are stateless, highly reusable presentation components.
*   **`Skeleton.tsx`**: A shimmering, animated placeholder used heavily during the initial boot sequence or while lazy-loading Finix panels.
*   **`CreditScoreDial.tsx`**: A custom SVG-based radial dial to visualize the CIBIL score simulator. Uses Recharts internally or pure SVG paths.

## 2. Layout Components (`src/components/layout/`)
*   **`DashboardLayout.tsx`**: The primary wrapper for the private app. Handles the Sidebar navigation, TopNav (with user profile/Clerk dropdown), and main content area scrolling.
*   **`Sidebar.tsx`**: Responsive navigation (collapsible on desktop, off-canvas on mobile). Maps to active `TabId` (Home, Optimizer, Insights, Settings).

## 3. Feature Components (`src/features/*/components/`)
These components are often stateful, connecting directly to the `useDashboardStore` or feature-specific hooks.

### Dashboard & Home (`features/dashboard/`)
*   **`HomeTab.tsx`**: The orchestrator for the main dashboard view. Renders the greeting, intelligence widgets, and the card carousel.
*   **`LoginScreen.tsx`**: Custom Clerk authentication screen wrapper to match the glassmorphic brand.
*   **`TransactionFeed.tsx`**: Displays recent ledger history.
*   **`AddCardModal.tsx`**: Form to onboard a new credit card into the wallet.

### Cards (`features/cards/`)
*   **`ActiveCard.tsx`**: The primary interactive 3D/glass card visualizer.
*   **`CardBenefitsSheet.tsx`**: A slide-up or modal sheet detailing specific perks (lounge access, fee waivers) for a selected card.

### Finix Sub-Panels (`features/finix/`)
*These are aggressively lazy-loaded to keep the initial bundle small.*
*   **`TaqdeerPanel.tsx`**: The AI chat interface. Handles rendering of user prompts and markdown/structured AI responses.
*   **`RecommenderPanel.tsx`**: Displays the output of the Recommendation Engine (e.g., "Get the HDFC Infinia").
*   **`WalletOptimizerPanel.tsx`**: Visualizes missing wallet coverage (e.g., "You have no card for Fuel").
*   **`UpiSimulatorPanel.tsx`**: Simulates RuPay UPI limits and transactions.
*   **`CibilPanel.tsx` & `CreditScoreSimulator.tsx`**: Interactive tools for managing credit health.
*   **`BudgetingPanel.tsx`**: Tracks spending against custom limits.
*   **`SmartAlerts.tsx`**: Aggregates warnings from the Notification Engine.

## 4. Component Quality Assessment
*   **Reusability**: Core UI elements are well abstracted. However, some panels in `features/finix/` are highly monolithic and could benefit from further breakdown into smaller sub-components (e.g., extracting chart widgets).
*   **State Coupling**: Many components are tightly coupled to `useDashboardStore`, which is acceptable in an FSD architecture but makes isolating them for Storybook or testing slightly more complex (requires store mocking).
*   **Animation**: Excellent use of `framer-motion` for micro-interactions (hover states, modal entry/exit, card shuffling).
