# Marketplace UX Audit (Phase 5E)

## Overview
This document audits the current state of the RenoCred Marketplace UX prior to Phase 5E productionization. The goal is to identify prototype-only UI, mock assumptions, visual inconsistencies, and areas for refinement to align with the core principle: *Financial Intelligence + Lifestyle Commerce + Payment Optimization*.

## Pages Audited

### 1. `LifestyleHub.tsx`
- **Current State**: Uses a basic grid with generic glass panels.
- **Issues**:
  - Missing strong visual hierarchy.
  - Feels slightly generic; needs the "obsidian/emerald" sharp premium feel.
  - Copy is a bit plain, needs to reinforce "INTENT → INTELLIGENCE → SAVINGS".
- **Action**: Refine tokens, use sharper typography, make hover states more deliberate.

### 2. `ShopPage.tsx`
- **Current State**: Fetches production `CommerceOptimizationService` data but filters with a mock frontend text search.
- **Issues**:
  - Hardcoded search query state (`Black sneakers`).
  - Lacks empty states that feel intentional.
  - The CTA routes to a partner page rather than an outbound tracking flow.
- **Action**: Remove hardcoded query, implement robust empty/loading states, and update card actions to trigger the new tracking flow.

### 3. `PlanDatePage.tsx`
- **Current State**: Mix of input forms and an itinerary view using `MOCK_DATE_ITINERARY`. 
- **Issues**:
  - Still relying on `MOCK_DATE_ITINERARY` instead of production commerce coverage.
  - Fallback UI for insufficient commerce coverage is missing.
- **Action**: Productionize the data source where possible, or build an elegant fallback UI. Refine the visual presentation of the Smart Payment Plan.

### 4. `InvestPage.tsx`
- **Current State**: Uses `MOCK_PRODUCTS` with a hardcoded filter (`cult`).
- **Issues**:
  - Fully reliant on mock data.
  - Acts as a generic directory rather than an optimized intent hub.
- **Action**: Connect to `CommerceOptimizationService`. Add intents (Fitness, Hobbies, Learning, Wellness).

### 5. `PartnerDetailPage.tsx`
- **Current State**: Uses `MOCK_PARTNERS` and `MOCK_PRODUCTS`.
- **Issues**:
  - Looks like a traditional brand storefront.
  - CTA is a dead button ("View all deals at {partner.name}").
- **Action**: Shift focus to "What you can spend here -> Offers -> Best way to pay". Integrate with production repositories. Replace CTA with actual outbound tracking flow.

### 6. `HomePage.tsx`
- **Current State**: Integrates some production commerce data under "Smarter Purchases For You".
- **Issues**:
  - Skeletons are a bit basic.
  - Needs to feel like a natural extension of RenoCred rather than an isolated shopping module.
- **Action**: Refine the visual integration. Ensure "Explore All" and other routing correctly directs to the updated Lifestyle hub.

## Components Audited

### `SmartSpendCard.tsx`
- **Current State**: The atomic intelligence unit, showing Price -> Value -> Effective Cost.
- **Issues**:
  - Uses a simulated 1.2s timeout for "calculating" state.
  - Styling leans towards generic SaaS grey.
- **Action**: Remove fake timeouts (or make them visually pristine if needed for UX). Ensure all numbers derive strictly from `OptimizationResult`. Elevate the design using obsidian/near-black, glass surfaces, and sharp typography.

### `RecommendationReason.tsx` & `CommandCenter.tsx`
- **Current State**: Functional but visually basic.
- **Action**: Sharpen the contrast and typography. 

## Visual System Alignment
- **To Avoid**: Generic SaaS grey, excessive gradients, neon green overload, giant rounded cards, visual noise.
- **To Implement**: Obsidian/near-black foundation, premium glass surfaces, restrained olive/emerald accents, sharp typography, subtle depth, intentional borders.

## Affiliate Attribution Readiness
- The UI currently lacks any real outbound tracking mechanism.
- All "View Deal" or "Shop" buttons need to be re-wired to call the new `POST /api/outbound` endpoint, passing `commerceEntityId` and `placement`, which will handle 302 redirects.
