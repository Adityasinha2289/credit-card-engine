## Visual Correction: Device Proportions & Carousel
- **Strict Aspect Ratios:** Enforced physical aspect ratios on the components: `aspect-[9/19.5]` (iPhone), `aspect-[4/3]` (iPad), and `aspect-[16/10]` (MacBook display).
- **Decoupled Sizing:** Removed generic width/height transitions from the device animations. The devices now determine their own dimensions based on a base relative width, and only scale (`transform: scale()`) during carousel transitions.
- **Stable Showcase Stage:** Locked the device container (`.device-showcase`) to a fixed maximum size and height. This anchors the Device Switcher in a permanent location, stopping the UI from jumping when switching states.
- **Dynamic Content Scaling:** Replaced absolute pixel widths on the `HeroDeviceContent` components (like the Dynamic Island) with percentages to ensure they scale naturally with the 3D transforms across mobile, tablet, and desktop breakpoints.
- **Mobile Stack:** Correctly separated the visual bounds of the Left Text column and Right Device Scene column to ensure there are no layout collisions.

The visual redesign of the Hero Section is complete and aligns with the premium fintech aesthetic requested.

## Changes Made

1. **New 3D Device Assets**:
   - `IPadMockup.tsx` and `MacBookMockup.tsx` were created using CSS/HTML to match the realistic, physical appearance of the existing `IPhoneMockup`.
   - `HeroDeviceContent.tsx` was created to standardize the dark-themed dummy UI displayed inside each device screen, dynamically scaling for different device types.

2. **Hero Section Complete Overhaul (`HeroSection.tsx`)**:
   - Switched the background to `#FAFBF9` for a light, spacious feel.
   - Restructured into a clean 2-column layout (stacking on mobile).
   - **Left Content**: Added the AI Copilot pill badge, updated typography, highlighted "RenoCred" in the brand green color, and styled the CTA buttons appropriately for a light theme.
   - **Right Content**: Built a 3D animated scene containing the three devices with depth, scaling, and subtle continuous floating logic.
   - Implemented an **auto-rotating carousel** that smoothly transitions between the active device every 5 seconds.
   - Added a functional **Device Switcher** below the scene, complete with manual override controls (left/right arrows and direct selection), which gracefully restarts the auto-play timer upon interaction.
   - Relocated the requested **Trust Indicators** strip below the Hero layout, with compact, green-accented icons.

3. **Header Adaptations (`PublicHeader.tsx`)**:
   - Replaced static white text with a dynamic text color that transitions from dark gray (`text-gray-900`) when at the top of the page (light hero background) to white when scrolled into the dark lower sections of the page.
   - Adjusted the header's translucent background state to ensure legibility across the transition.

## Validation Results
- The changes were built locally with `npm run build` and compiled successfully with no TypeScript errors or missing imports.
- The `framer-motion` layout animations run smoothly, and the design respects the `prefers-reduced-motion` settings.
- The UI is mobile-responsive, preventing horizontal scrolling and correctly stacking the layout elements with a scaled-down device showcase.

The implementation is ready for you to preview in the browser!