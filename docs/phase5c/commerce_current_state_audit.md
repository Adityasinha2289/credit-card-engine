# COMMERCE DATA CURRENT STATE AUDIT

This document maps the existing commerce and recommendation concepts found in the Phase 5A and Phase 5B mock datasets, highlighting the current architecture's strengths, duplications, and missing concepts.

## 1. Existing Types (Lifestyle Mock Domain)
Location: `src/features/lifestyle/types/index.ts`

- **MockPartner**: `id`, `name`, `category`, `imageUrl`, `description`
- **MockProduct**: `id`, `partnerId`, `name`, `originalPrice`, `imageUrl`, `recommendation`
- **MockDateVenue**: `id`, `time`, `name`, `partnerName`, `type`, `originalCost`, `recommendation`
- **MockDateItinerary**: Aggregation of venues.
- **MockRecommendation**: Hardcoded result containing `bestCard`, `merchantOffer`, `cardReward`, `totalSavings`, `effectiveCost`, `reason`.
- **MockOffer**: Simple representation of a discount with `id`, `source`, `description`, `value`.

## 2. Existing Types (Optimization Engine Domain)
Location: `src/features/optimization/types/index.ts`

- **SpendingOpportunity**: `id`, `partnerId`, `category`, `baseAmount`, `currency`
- **PaymentMethod**: Generic abstraction for Wallet items (`credit_card`, `upi`, `wallet`).
- **Offer**: Robust discount representation with `type`, `value`, `source` (merchant, bank, network, renocred).
- **OfferEligibility**: Rules for when an offer applies (`partnerIds`, `categories`, `minSpend`, `paymentMethodIds`).
- **OptimizationResult**: Deterministic output containing `recommendedPaymentMethod`, `savings`, `reason`, `alternatives`.

## 3. Duplications & Conflicting Concepts

1. **Partners vs Products vs Venues**:
   - The UI mocks treat `MockProduct` (e.g. Nike shoes) and `MockDateVenue` (e.g. Dinner at Olive) as distinct interfaces.
   - Both are fundamentally "Things to buy from a Partner". 
   - They should be unified into a single generic `CommerceEntity`.

2. **MockRecommendation vs OptimizationResult**:
   - `MockProduct` tightly couples `MockRecommendation` directly into the product data.
   - The new Optimization Engine separates this beautifully. Products/Entities should NOT contain their own recommendations. Recommendations are generated at runtime via the Engine.

3. **MockOffer vs Offer**:
   - `MockOffer` is purely presentational (`description`, `value` as absolute INR).
   - `Offer` (Optimization Domain) is structural and mathematical (`type`, `value` as percentage/flat, `eligibility`).
   - The production model must use the mathematical `Offer` model.

## 4. Missing Concepts for Affiliate Business Model

The current codebase is a pure "calculator". It lacks the data structures needed to actually monetize this intelligence.

1. **Affiliate Relationships**: No mapping of how RenoCred earns money from a Partner (e.g., CPL, CPS).
2. **Tracking Events**: No mechanism to log when a user clicks "View Deal" and proceeds to a partner site.
3. **Conversions & Commissions**: No structure to receive postbacks from partners confirming a sale and recording the commission earned.
4. **Sponsored Placements**: No flag to differentiate between an organically ranked recommendation and a paid placement.
5. **URLs**: No fields for outbound destination URLs, deep links, or tracking parameters.
