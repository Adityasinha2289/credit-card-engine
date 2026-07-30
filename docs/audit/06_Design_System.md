# Design System Audit (Anti-Gravity Theme)

RenoCred utilizes a highly custom, premium design system dubbed "Anti-Gravity". It relies heavily on glassmorphism, multi-layered soft shadows, and deep color scales.

## 1. Global Definitions
*   **Tailwind Config**: `tailwind.config.js`
*   **Global CSS**: `src/index.css`

## 2. Color Palette (Semantic & Scales)

### Backgrounds & Surfaces
*   **Canvas**: Warm cream in Light Mode (`#fcfbf9` to `#dedbcd`), Deep black/grey in Dark Mode (`#0a0c0b`).
*   **Surface**: Pure white elevated panels in Light Mode, slightly lighter greys (`#141816`) in Dark Mode.
*   **Glass**: `bg-surface/70` with `backdrop-blur(20px)`.

### Brand & Accents
*   **Brand (Primary)**: Forest Green scale (`brand-500`: `#1f5247` / Dark: `#5da08c`).
*   **Secondary**: Teal (`#2dd4bf`).
*   **Tertiary**: Amber (`#f59e0b`).
*   **Copper**: Accent for warnings and premium indicators (`#b85c2a`).
*   **Steel**: Neutral blue-greys for secondary UI elements.
*   **Sage**: Earthy greens for subtle background tints.

### Semantic Status
*   **Profit (Success)**: `#129a6d` (Emerald green).
*   **Loss (Error)**: `#d94556` (Soft red).
*   **Caution (Warning)**: `#d9931e` (Orange).
*   **Neutral**: `#788580`.

### Typography Colors (Ink)
*   **Primary**: `#1a2420` (Light Mode), `#f5f7f6` (Dark Mode).
*   **Secondary**: `#414d48` (Light Mode), `#d4dad7` (Dark Mode).
*   **Tertiary**: `#788580` (Light Mode), `#94a39b` (Dark Mode).
*   **Disabled**: `#aab5b0` (Light Mode), `#44504a` (Dark Mode).

## 3. Typography
*   **Sans (UI Text)**: `Inter`
*   **Display (Headings)**: `Plus Jakarta Sans`
*   **Monospace (Card Numbers)**: `JetBrains Mono`

## 4. Spacing & Sizing
*   Standard Tailwind spacing scale with custom extensions (`18`, `22`, `30`, `72`, `84`, `96`).

## 5. Border Radius
*   Pill-shaped geometry is heavily favored.
*   Standard components use `0.75rem` (`rounded-xl` in default tailwind, here mapped to `rounded`).
*   Cards and Panels use `1.5rem` (`rounded-2xl`) or `2rem` (`rounded-3xl`).

## 6. Shadows (Anti-Gravity Presets)
Shadows are defined with multi-layered diffusion to simulate physical elevation.
*   **ag-base**: Resting state.
*   **ag-card**: Default for panels.
*   **ag-hover**: Interactive card hover state.
*   **ag-float**: Active floating state.
*   **ag-modal**: Maximum elevation for overlays.
*   **Glows**: `ag-glow-primary`, `ag-glow-success`, `ag-glow-warning` for colored ambient light.

## 7. Animations & Transitions
*   **Timing Functions**: Custom curves like `ag-spring` (bouncy) and `ag-smooth` (elegant).
*   **Keyframes**: `ag-float-in`, `ag-slide-up`, `ag-scale-in`, `ag-shimmer` for skeleton loaders.
*   **Complex Effects**: 
    *   `border-gradient-animated`: Rotating conic gradient borders.
    *   `bg-mesh`: Radial gradient mesh backgrounds.
    *   `card-particles`: CSS-only drifting particle effects.

## 8. Components Implementation
*   **Buttons**: Defined in `.btn-base`, `.btn-primary` (Teal), `.btn-secondary` (Dark elevated), `.btn-inverted`, and `.btn-outlined`. Symmetrical pill radiuses.
*   **Inputs**: `.input-premium` (glassy background, brand focus ring), `.input-search` (with icon padding).
*   **Clerk Auth Overrides**: Extensive CSS rules in `index.css` target `.cl-*` classes to remove watermarks, borders, and shadows, forcing Clerk components to inherit the glassmorphic theme.

## 9. Visual Consistency Evaluation
The design system is highly cohesive, meticulously defined, and enforces a premium aesthetic (Stripe/Linear quality). However, it relies heavily on global CSS classes (`.panel-glass`, `.btn-primary`) mixed with Tailwind utility classes, which can sometimes lead to class-name collision or rigid component structures.
