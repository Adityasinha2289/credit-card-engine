# Design Debt & UI Consistency

While the "Anti-Gravity" design system is powerful, several areas of design debt have accumulated during the MVP phase.

## 1. CSS Class Sprawl
*   **Issue**: Many components combine 10+ Tailwind utility classes with 2-3 custom global classes (`panel-glass`, `scroll-shadow-bottom`). This makes refactoring a single visual pattern difficult.
*   **Solution**: Abstract common patterns into dedicated React components (e.g., `<GlassPanel>`) rather than relying on global CSS classes.

## 2. Hardcoded Values
*   **Issue**: Some components use hardcoded hex codes or pixel values instead of referencing the Tailwind theme. For example, the `CreditScoreDial.tsx` relies on hardcoded SVG dimensions and stroke colors instead of the `stroke-brand-500` utilities.
*   **Solution**: Strict enforcement of Tailwind config variables in SVGs and inline styles.

## 3. Dark Mode Quirks
*   **Issue**: The mesh gradient in dark mode (`.dark .bg-mesh`) is occasionally overpowered by the glass panels. Because glass relies on backdrop-blur, rendering a white panel with `0.4` opacity over a dark mesh can result in washed-out grays instead of crisp dark surfaces.
*   **Solution**: Refine the dark mode `surface` colors to be opaque at the base and only apply glass effects to the borders or top-level modals.

## 4. Clerk Overrides
*   **Issue**: The `index.css` file contains extensive, aggressive overrides (`!important`) to hide Clerk watermarks and restyle their specific class names (`.cl-internal-b3al4j`).
*   **Risk**: If Clerk updates their internal DOM structure or class names, the auth flow's styling will break silently.
*   **Solution**: Utilize Clerk's built-in `appearance` prop and Theme API inside `<ClerkProvider>` rather than brute-forcing CSS overrides.

## 5. Mobile Responsiveness
*   **Issue**: The `DashboardLayout` handles mobile via an off-canvas sidebar. However, the horizontal card carousel on mobile (`snap-x`) can feel cramped if the user has more than 3 cards.
*   **Solution**: Implement a stacked or accordion view for the wallet on viewport widths `< 640px`.
