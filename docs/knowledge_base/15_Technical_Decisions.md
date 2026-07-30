# Phase 15: Technical Decisions & Rationale

Why is RenoCred built this way? Identifying the tradeoffs made by the original engineering team.

## 1. Why React & Vite?
*   **Decision**: Use React 19 over Next.js App Router for the main application; bundle with Vite.
*   **Rationale**: RenoCred is a highly interactive Single Page Application (SPA). It acts like a desktop application (state-based tabs, heavy client-side simulations) rather than a content-heavy website. Next.js Server Components would introduce network latency for every interaction (like adjusting the CIBIL simulator slider). Vite provides a blazingly fast local dev experience and a highly optimized static SPA bundle.

## 2. Why Tailwind CSS?
*   **Decision**: Use Tailwind + custom global CSS variables over styled-components or CSS Modules.
*   **Rationale**: The "Anti-Gravity" theme requires immense consistency in transparency and shadow tokens. Tailwind allows rapid application of these tokens (`bg-surface/70 shadow-ag-glow`). 
*   **Compromise**: The class strings become extremely long, and global overrides (`!important`) were used to force third-party components (Clerk) into compliance.

## 3. Why Zustand?
*   **Decision**: Use Zustand over Redux or React Context.
*   **Rationale**: React Context causes unnecessary re-renders of the entire tree if the context value changes. Redux has massive boilerplate. Zustand allows components (like `TransactionFeed`) to subscribe *only* to the `transactions` slice of the store, ensuring 60fps performance even when the global state updates frequently.

## 4. Why Feature-Sliced Design (FSD)?
*   **Decision**: Structure folders by domain (`features/taqdeer`, `features/behaviour`) instead of technical type (`components/`, `hooks/`, `api/`).
*   **Rationale**: As the number of AI engines grows, grouping by technical type becomes a nightmare to maintain. FSD allows a developer to delete the entire `features/merchant-intelligence` folder without breaking the rest of the app.

## 5. Why Supabase?
*   **Decision**: Use Supabase over Firebase or custom Postgres on AWS.
*   **Rationale**: Financial data is inherently relational (User -> Card -> Transactions). Firebase (NoSQL) is poor at complex aggregations (e.g., "Sum all dining transactions for Visa cards"). Supabase provides a fully relational Postgres database with the developer velocity of a BaaS.

## 6. Where Compromises Were Made (MVP Debt)
*   **Client-Side AI**: To launch the prototype faster, the Behaviour and Recommendation engines were built in the browser. *Cost: High CPU usage, battery drain on mobile, and inability to run background analytics.*
*   **Mock Data Typing**: The mock datasets were built hastily to populate the UI, diverging from the strict TypeScript interfaces in `types/`. *Cost: The compiler (`tsc`) currently fails, forcing the team to bypass type-checking during the build.*
