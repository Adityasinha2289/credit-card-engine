# Phase 13: Core Business Logic Rules

This document records the exact reasoning behind the application's rule engines and logic flows.

## 1. Recommendation Rules (`features/recommendation`)
**Purpose**: To stop users from applying for credit cards they don't need, which negatively impacts their CIBIL score via hard inquiries.
*   **Rule A**: The engine must first determine the user's `primaryGoal` (e.g., "Maximise Cashback").
*   **Rule B**: It identifies the user's top spending category where they do *not* have an optimized multiplier.
*   **Execution**: If the user spends 40% on Dining but only uses a basic 1x multiplier card, the engine filters the Knowledge Graph for a card with `multiplier.dining > 1` and matches it.

## 2. Wallet Optimization Logic (`features/finix`)
**Purpose**: To visually demonstrate the "coverage" of a user's wallet across spending categories.
*   **Rule**: A category is "Covered" if the user has a card with a multiplier > 1 for that category. It is a "Gap" if all cards offer standard 1x points.
*   **Why it exists**: To create an upsell opportunity for affiliate credit card links.

## 3. Rewards Calculation Logic (`dashboardStore.ts`)
**Purpose**: To translate raw spending into tangible "Reward Points" or "Estimated Savings" to build user retention.
*   **Formula**: `Math.floor((amount / 100) * multiplier)`
*   **Rule**: 1 base point per ₹100 spent. If the transaction category matches a card's bonus category (e.g., `dining: 5`), the transaction yields 5x points.
*   **Why it exists**: Users love watching numbers go up. The Gamification of rewards is the primary retention mechanism.

## 4. Financial Health (RenoCred Score) (`features/financial-health`)
**Purpose**: A proprietary gamified score (0-100) that is easier to digest than a strict CIBIL score.
*   **Logic**: It's a blended average.
    *   CIBIL component: `(Credit Score / 900) * 100` (Weighted 50%)
    *   Utilization component: Assesses `(Current Balance / Total Limit)`. If > 30%, it heavily penalizes the score. (Weighted 30%)
    *   Profile completeness (Weighted 20%)
*   **Why it exists**: To give users a sense of progress even if their CIBIL score takes months to update.

## 5. Analytics & Telemetry Rules (`lib/analytics.ts`)
**Purpose**: To track user behavior for product iteration.
*   **Rule**: Every major state mutation (e.g., `addTransaction`, `addCard`) triggers a `posthog.capture()` event.
*   **Rule**: PII (Personally Identifiable Information) like the exact merchant string is theoretically sanitized or aggregated to avoid privacy violations.
