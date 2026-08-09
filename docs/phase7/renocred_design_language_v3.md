# RenoCred Design Language V3

## Design North Star
**AN INTELLIGENT FINANCIAL OPERATING SYSTEM.**
RenoCred is not a generic banking dashboard or an ecommerce wrapper. It is a premium, highly restrained financial terminal that mathematically proves its recommendations. Users should feel that RenoCred understands exactly how their money should move.

## Product Personality
- **Apple-level restraint:** Quiet confidence. No noise.
- **Stripe-level precision:** Pixel perfection, exact alignments, flawless typography.
- **Linear-level discipline:** High-contrast dark mode, hyper-fast performance.
- **Premium Financial Authority:** Trustworthy, robust, data-centric.

## Color System
- **Obsidian Canvas (`bg-obsidian`):** `#050505`. The deepest, cleanest black.
- **Surface Primary (`bg-surface-primary`):** `#0A0A0A`. For base panels.
- **Surface Elevated (`bg-surface-elevated`):** `#111111`. For floating elements (menus, dropdowns).
- **Surface Card (`bg-surface-card`):** `#141414`. For strictly delineated content blocks.
- **Action/Authority (Emerald):** `#00E599`. Used explicitly for SAVINGS, VALUE, and OPTIMIZATION. Scarcity creates importance.
- **Text:** Crisp white (`#F6F6F6`) for primary data. Muted for secondary context. No muddy mid-greys for data.

## Semantic Tokens
- `border-subtle`: `rgba(255, 255, 255, 0.05)` — the absolute minimum line needed to create structure.
- `surface-hover`: `#1A1A1A`
- `surface-active`: `#222222`
- `text-primary`: `#F6F6F6`
- `text-secondary`: `rgba(255, 255, 255, 0.68)`
- `text-muted`: `rgba(255, 255, 255, 0.42)`

## Typography
- **Display/Headers:** `Plus Jakarta Sans`. Clean, modern, friendly but structural.
- **Body:** `Inter`. Optimized for legibility at small sizes.
- **Financial Typography:** `JetBrains Mono` or high-tracking `Inter` for raw numbers. Financial figures (`₹`) must visually dominate other text.

## Spacing & Surfaces
- Avoid nested cards.
- Surfaces are solid blocks. Glassmorphism is strictly reserved for floating top-level overlays (TopNav, modals, dropdowns).
- Maintain generous negative space to let the financial math breathe.

## Card Philosophy
**Not everything is a card.**
Only use a card when grouping a distinct Entity (e.g., a merchant, an itinerary venue) with its Financial Optimization.
For layout structure, rely on the Obsidian canvas and subtle 1px borders instead of drawing boxes around every feature.

## Navigation
- **Sidebar:** Stripped of its boxy container. It belongs directly on the Obsidian canvas. Active states are denoted by high-contrast text and a subtle 2px Emerald border indicator (or quiet glow), not massive pill backgrounds.
- **TopBar:** Thin, dark, and purposeful. A subtle 1px border separates it from the canvas. Notification icons are precise, not large noisy circles.

## Page Container
- Standardized to `max-w-5xl`.
- The application should feel like one cohesive, tightly constrained workspace rather than pages that float randomly in width.

## Metrics & Recommendation Language
- **FinancialMetric:** Must clearly separate the LABEL (`Effective Cost`), the VALUE (`₹12,746`), and the CONTEXT (`vs. ₹14,995`).
- **Recommendation:** Always answer WHAT, WHY, and VALUE. (e.g., `SBI Cashback`, `5% merchant offer`, `-₹1,500`). The "Why" should read like math, not prose.

## Motion
- **Fast, Precise, Quiet.**
- Motion must communicate state changes (e.g., deducting savings from a total) or hierarchy (e.g., modal entrance). 
- Eliminate constant floating animations or decorative "bouncing".

## Responsive Rules
- Mobile must collapse into a focused, intent-first view (e.g., Search/Taqdeer at the top).
- Do not shrink cards endlessly; stack them linearly with clear 1px separation.
- The sidebar transforms into a clean drawer or bottom navigation without heavy background blurring.

## Visual Quality Bar (Definition of Done)
If the page contains:
- Giant grey containers (`bg-surface-elevated` applied as a page wrapper)
- Generic white pill active states
- Low contrast on financial savings
- Excessive glass (`bg-white/5 backdrop-blur`) on standard content
...it fails the V3 standard. Rewrite it.
