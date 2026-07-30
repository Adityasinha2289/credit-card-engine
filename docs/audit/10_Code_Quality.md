# Code Quality & Maintainability

An assessment of the codebase's cleanliness, typing strictness, and tooling.

## 1. Tooling & Enforcement
*   **TypeScript**: Strictly typed. Extensive interfaces are defined in `types/` (e.g., `AppProfile`, `TransactionCategory`, `CardData`).
*   **Linter**: The project uses **Oxlint** (`"lint": "oxlint"`). Oxlint is written in Rust and is orders of magnitude faster than ESLint for catching baseline errors.
*   **Formatting**: Likely Prettier, though specific config files aren't explicitly visible, the code structure implies automated formatting.

## 2. Component Structure
*   **Pros**: Feature-Sliced Design prevents the `src/components` directory from becoming unmanageable. The use of generic UI components (`Panel`, `Stat`, `Skeleton`) reduces duplication.
*   **Cons**: Several "God Components" exist. `App.tsx` handles complex routing, lazy loading definitions, and significant layout scaffolding. `HomeTab` renders multiple engines' outputs simultaneously. These could be broken down further.

## 3. State Management Complexity
*   The `dashboardStore.ts` file is nearly 1000 lines long. While `immer` makes updating complex nested states easier, the store handles too many domains (Transactions, Cards, Budgets, Subscriptions, Hydration).
*   **Recommendation**: Slice the Zustand store into smaller domains (e.g., `useCardStore`, `useTransactionStore`) and merge them, or utilize React Context for localized feature state.

## 4. Current Build Failures
*   **TypeScript Errors**: Running `tsc -b` fails due to mock data typings (e.g., `"general"` category instead of `"other"` in `mockCards.ts`) and missing module definitions for new directories like `recommendation/evaluation`. 
*   **Workaround**: The build script was intentionally modified to `vite build` (bypassing `tsc`) to allow the app to run and preview despite the strict typing errors in the mock data.

## 5. Security & Error Handling
*   Sentry (`@sentry/react`) is integrated for production telemetry.
*   Try/Catch blocks are consistently used in database abstractions (`safeDbWrite`).
