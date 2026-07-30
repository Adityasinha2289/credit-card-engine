# Phase 6: Component Relationships

This document visualizes how components nest, communicate, and draw data from stores and hooks.

## Hierarchical Map: The Dashboard Entry Flow

1.  **`<App />`** (Top Level)
    *   **Hook**: `useUser()` (Clerk Authentication)
    *   **Renders**: `<LoginScreen />` (if unauthenticated) OR `<DashboardLayout>`
    *   **Data**: Triggers `dashboardStore.hydrateFromSupabase()` on mount.

2.  **`<DashboardLayout>`**
    *   **Children**:
        *   `<Sidebar>` (Updates `activeTab` state in parent).
        *   `<TopNav>` (Renders Clerk `<UserButton>`).
        *   *Dynamic Content Container* (Renders active Tab).

3.  **`<HomeTab>`** (If activeTab === 'home')
    *   **Hooks Used**:
        *   `useDashboardStore()` (Gets cards, transactions)
        *   `usePersona()` (Gets personalized greeting)
        *   `useBehaviourInsights()` (Triggers transaction analysis)
        *   `useTaqdeerDecision()` (Gets top AI recommendation)
    *   **Children Rendered**:
        *   `<StatPanel>` (Generic widget wrapper)
        *   `<ActiveCard>` (Visualizes the selected card)
        *   `<TransactionFeed>` (Lists history)
        *   `<AddCardModal>` (Conditionally rendered)

4.  **`<TaqdeerPanel>`** (If activeTab === 'taqdeer', Lazy Loaded)
    *   **Hooks Used**:
        *   `useTaqdeerDecision()` (Chat logic)
    *   **Children Rendered**:
        *   Message bubbles (Markdown rendered text).
        *   Quick Action chips.
    *   **API Comms**: Directly triggers `fetch` to LLM endpoint on user submit.

## Inter-Component Communication
Because RenoCred utilizes **Zustand** as a global store, components rarely pass props deeply (prop-drilling is minimized). 

*   **Example**: When a user clicks `<ActiveCard>` in the carousel, it calls `setActiveCard(id)` in the store. Instantly, the `<TransactionFeed>` component (which subscribes to `activeCardId`) re-renders to filter transactions specifically for that card.
*   **Drawback**: This pattern creates implicit coupling. A component like `TransactionFeed` cannot be easily reused outside the context of the `dashboardStore`.

## Feature-to-Feature Dependencies
Feature engines often communicate with each other *through* the store or by chaining hooks.
*   **Chain Example**: `useRecommendationEngine` imports the `BehaviourEngine` directly to calculate `topCategories` before determining which card to recommend.
*   **Result**: The UI layer simply calls the final hook, completely unaware of the complex background dependency chain.
