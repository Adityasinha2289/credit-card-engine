# Performance & Optimizations

RenoCred is a heavy client-side application. Ensuring smooth 60fps animations while running multiple rule engines requires aggressive optimization.

## 1. Bundle Splitting
*   **Vite & Rollup**: The build configuration relies on Vite 8 (Rolldown).
*   **Lazy Loading**: Almost the entire `features/finix/` directory (which contains heavy charting libraries like Recharts) is wrapped in `React.lazy()`.
*   **Impact**: The initial JS payload is kept lean. The user can interact with the Home Tab while complex simulators load asynchronously in the background.

## 2. Rendering Optimizations
*   **Framer Motion**: Heavy animations use the `layoutId` prop for shared element transitions (e.g., the active card dot). The CSS includes `.transform-gpu` (`transform: translateZ(0); will-change: transform;`) to force hardware acceleration on complex glowing cards.
*   **Memoization**: `useMemo` and `useCallback` are utilized inside complex views like `DashboardV3.tsx` to prevent unnecessary re-rendering of charts when transaction state hasn't changed.

## 3. CSS Performance
*   **Anti-Gravity Theme**: The heavy use of `backdrop-filter: blur(20px)` and multi-layered `box-shadow` is notoriously expensive for browser paint cycles, especially on lower-end mobile devices.
*   **Mitigation**: The application applies these filters judiciously to surface panels, but an "Eco Mode" (disabling blurs and complex shadows) might be necessary for battery conservation on older devices.

## 4. State Performance
*   **Zustand**: Because Zustand does not wrap the app in a Context Provider, component re-renders are strictly limited to the specific slices of state they subscribe to.
*   **Local Storage**: Persisting a massive array of `transactions` to localStorage (`zustand/persist`) can cause synchronous blocking on the main thread during hydration. As the ledger grows, hydration must be optimized or moved entirely to IndexedDB.
