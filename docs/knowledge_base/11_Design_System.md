# Phase 11: Design System (Anti-Gravity)

The "Anti-Gravity" design system is custom-built on top of Tailwind CSS, focusing on depth, glowing shadows, and glassmorphism.

## 1. Core Principles
*   **Depth over Flatness**: Flat design is rejected. Every panel floats above the background.
*   **Brand Colors**: The application completely eschews standard "bootstrap blue".
    *   `brand-500` (Forest Green): `#5da08c` - Used for primary actions and positive momentum.
    *   `copper-500` (`#c17a58`) - Used for warnings or premium highlights.
    *   `ink-primary` / `ink-secondary` - Used for text hierarchy instead of raw white/gray.
    *   `canvas` / `surface` - Base background layers.

## 2. Technical Implementation (`tailwind.config.js`)
*   **CSS Variables**: The theme defines base colors using HSL variables (e.g., `--color-brand-500`) in `index.css`, allowing dynamic theme switching if needed.
*   **Shadows**: The core of the system.
    *   `shadow-ag-base`: Standard panel elevation.
    *   `shadow-ag-glow-primary`: A colored, highly diffused shadow used on the active credit card or primary buttons to make them "glow".
*   **Backdrop Blur**: `backdrop-blur-xl` is applied heavily alongside `bg-surface/70` (70% opacity) to create frosted glass effects.

## 3. Global Styles (`index.css`)
*   **Mesh Gradients**: The background `.bg-mesh` class generates a complex CSS radial gradient, providing a subtle, shifting, colorful background beneath the glass panels.
*   **Clerk Overrides**: Because Clerk's default UI uses harsh borders and flat white backgrounds, `index.css` contains massive `!important` overrides to force Clerk inputs to become translucent, rounded glass elements matching the Anti-Gravity theme.

## 4. Component Conventions
*   **Skeletons**: Loading states use a custom shimmering animation (`.animate-shimmer`) rather than simple pulsing.
*   **Borders**: Solid borders are rarely used. Instead, panels use `border border-white/5` (a 5% opacity white border) to create a subtle "glass edge" highlight.
*   **Micro-animations**: Hover states almost always involve a `-translate-y-1` lift and an increase in shadow opacity to simulate moving closer to the user.

## Why It Looks This Way
The design is explicitly engineered to look like a "Premium Wealth Management" tool. By adopting dark mode, glassmorphism, and gold/copper accents, it builds immediate visual trust and stands out against the sterile, flat designs of traditional Indian banking apps (like SBI Yono or HDFC NetBanking).
