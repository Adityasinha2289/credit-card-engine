# Hero Section Redesign Implementation Plan

## Goal
Redesign the Hero Section of the RenoCred landing page to feature a premium, light-themed aesthetic with a 3D interactive device showcase, while preserving the existing functionality and design of the rest of the application.

## Proposed Changes

### 1. Header Adaptations (`PublicHeader.tsx`)
- Since the Hero Section will now have a light background (`#FAFBF9`), the transparent/dark header will be invisible. We will update the header to be light-themed (dark text, white/light translucent background on scroll) to ensure readability.

### 2. New Device Mockups
- **`IPadMockup.tsx` [NEW]**: Create a realistic iPad CSS/HTML shell.
- **`MacBookMockup.tsx` [NEW]**: Create a realistic MacBook CSS/HTML shell.
- **`HeroDeviceContent.tsx` [NEW]**: A component to render the dark-themed UI inside the devices (displaying Instant Discount, Reward Value, and Total Savings).

### 3. Hero Section Overhaul (`HeroSection.tsx`)
- **Background & Layout**: 
  - Change background to `#FAFBF9`.
  - Implement a 2-column layout (Left: 42%, Right: 58%) that stacks on mobile.
- **Left Content**:
  - Add the "AI-POWERED FINANCIAL COPILOT" pill badge.
  - Update the headline typography (black text, "RenoCred" highlighted in green).
  - Update the supporting paragraph (dark gray text).
  - Keep the CTAs but style them appropriately for the light theme.
- **Right Content (3D Device Showcase)**:
  - Implement a 3D-feeling scene using `framer-motion`.
  - Add the subtle green orbit/ambient effect behind the devices.
  - Position the iPhone, iPad, and MacBook with depth (overlap, scale, and z-index).
  - Implement the **auto-rotation carousel** (4-6 seconds per state).
  - Implement the **Device Switcher** below the scene.
  - Add left/right navigation arrows.
- **Trust Indicators**:
  - Add the requested trust strip (Bank-level Encryption, 60 Seconds Setup, Privacy First) at the bottom of the Hero Section.

### 4. Responsiveness & Accessibility
- Ensure the mobile layout is a single column, with a scaled-down device carousel that prevents horizontal overflow.
- Respect `prefers-reduced-motion` by disabling continuous floating/rotation if enabled.

> [!WARNING]  
> **Light/Dark Theme Transition:** The rest of the `HomePage.tsx` sections are currently dark-themed. By changing the Hero Section and Header to a light theme, there will be a sharp contrast transition from the Hero to the `WhatItDoesSection`. I will ensure this transition looks clean, but please be aware of this stark contrast between sections.

## User Review Required
Please review the plan above. If you approve, I will proceed with creating the new device mockups and refactoring the `HeroSection` and `PublicHeader`. Are you comfortable with the proposed light header and the sharp transition to the dark sections below?