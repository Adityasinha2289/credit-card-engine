# RenoCred Motion System

This directory houses the global motion architecture for the RenoCred platform. 
It acts as the single source of truth for all physics, variants, and animated components, enforcing the "Illuminated Intelligence" brand principles.

## Philosophy
*   **Cinematic, not frantic**: Motion should feel like heavy, expensive hardware sliding into place.
*   **Physicality**: Interactions rely on tight spring physics, never linear easing.
*   **Accessibility First**: Animations must respect OS-level reduced motion preferences automatically.

## Architecture
```
src/motion/
├── springs.ts      # Global physics definitions (snappy, smooth, scroll)
├── variants.ts     # Reusable animation states (fadeUp, scaleIn, stagger)
├── gestures.ts     # Semantic interaction intents (primary, secondary)
├── viewport.ts     # Standardized intersection observer settings
├── index.ts        # The barrel file. Always import from here.
└── components/
    ├── MotionButton.tsx  # Accessible wrapper for tactile buttons
    └── FadeInView.tsx    # Accessible wrapper for scroll-reveals
```

## Naming Conventions
All configurations are named based on **semantic intent** or **physical behavior**, never visual ambiguity.
*   ✅ `interactivePrimary` (Clear intent)
*   ❌ `subtleHover` (Ambiguous)
*   ✅ `fadeUpVariant` (Clear behavior)
*   ❌ `normalReveal` (Ambiguous)

## Accessibility (Reduced Motion)
All custom components in this directory (`MotionButton`, `FadeInView`) automatically hook into Framer Motion's `useReducedMotion()`. 
If a user has requested reduced motion at the OS level:
*   `<MotionButton>` disables all scale transforms, acting like a standard button.
*   `<FadeInView>` disables the `y` translation and delay, acting as a static block.

**Rule**: Never write `motion.div` directly if the animation includes heavy scaling or translation. Wrap it in a reduced-motion hook or use `<FadeInView>`.

## Performance Guidelines
1.  **Layout Thrashing**: Avoid animating properties like `width`, `height`, `margin`, or `padding`. Always animate `transform` (scale, x, y) and `opacity`.
2.  **GPU Acceleration**: `framer-motion` automatically forces GPU acceleration for transforms, but ensure you do not mix CSS transitions with Framer Motion on the same property.
3.  **AnimatePresence**: Use `AnimatePresence` sparingly around large lists. Ensure `key` props are highly stable to prevent unnecessary unmount/remount cycles.

## Code Examples

### 1. The MotionButton (Primary CTA)
```tsx
import { MotionButton } from '@/motion';

// Defaults to intent="primary" (tight scale, strong feedback)
<MotionButton onClick={submit}>
  Calculate Savings
</MotionButton>
```

### 2. The MotionButton (Secondary Action)
```tsx
import { MotionButton } from '@/motion';

// Uses intent="secondary" (minimal scale, for icons or text links)
<MotionButton intent="secondary" onClick={close}>
  <CloseIcon />
</MotionButton>
```

### 3. Scroll Reveal (FadeInView)
```tsx
import { FadeInView } from '@/motion';

// Automatically handles whileInView, accessibility, and default margins
<FadeInView delay={0.2}>
  <h2>Your Cards</h2>
</FadeInView>
```
