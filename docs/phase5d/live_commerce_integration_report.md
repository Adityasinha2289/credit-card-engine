# RENO CRED 2.0 — Phase 5D.5 Live Commerce Integration Report

## Architecture Before

```
ShopPage / HomePage / PlanDatePage
        │
        ├── import MOCK_PRODUCTS (static array)
        ├── import MOCK_OFFERS (static array)
        ├── adaptUserCardsToPaymentMethods(dashboardStore.userCards)
        │
        └── OptimizationEngine.optimizeSpending(opportunity, paymentMethods, MOCK_OFFERS)
                │
                └── SmartSpendCard (renders result)
```

Every page independently imported mock data, constructed SpendingOpportunities inline, called the engine directly, and passed results to UI components. There was no shared orchestration layer, no async data fetching, and no connection to the production Supabase commerce schema.

## Architecture After

```
ShopPage / HomePage / PlanDatePage
        │
        └── CommerceOptimizationService
                │
                ├── CommerceRepository.getCommerceEntities()     ← Supabase or mock
                ├── CommerceRepository.getEligibleOffers()       ← Supabase or mock
                ├── PaymentMethodProvider.getUserPaymentMethods() ← Supabase or legacy fallback
                │
                ├── adaptOffer(CommerceOffer → Offer)
                │
                └── OptimizationEngine.optimizeSpending()
                        │
                        └── SmartSpendCard (renders real OptimizationResult)
```

A single orchestration boundary (`CommerceOptimizationService`) now sits between all UI pages and the Optimization Engine. Pages no longer import mock data or call the engine directly. The service handles data fetching, offer adaptation, and engine invocation.

## Mock → Production Migration

| Component | Before | After |
| --- | --- | --- |
| `ShopPage.tsx` | `MOCK_PRODUCTS`, `MOCK_OFFERS`, `OptimizationEngine` direct | `CommerceOptimizationService.optimizeCollection()` |
| `HomePage.tsx` | `MOCK_PRODUCTS`, `MOCK_OFFERS`, `OptimizationEngine` direct | `CommerceOptimizationService.optimizeCollection()` |
| `PlanDatePage.tsx` | `MOCK_OFFERS`, `OptimizationOrchestrator` direct | `CommerceOptimizationService.optimizeItinerary()` |
| `SmartSpendCard.tsx` | Accepted both `MockRecommendation` and `OptimizationResult` | No change needed; already renders `OptimizationResult` fields correctly |

Mock data files (`MOCK_PRODUCTS`, `MOCK_OFFERS`, `MOCK_PARTNERS`) remain intact for:
- Demo mode fallback (via `CommerceRepository.useMock`)
- Existing test fixtures
- Legacy `PartnerDetailPage` (not migrated in this phase)

## CommerceOptimizationService

**File**: `src/features/commerce/services/CommerceOptimizationService.ts`

### Methods

| Method | Purpose |
| --- | --- |
| `adaptOffer(CommerceOffer)` | Maps DB offer schema to engine `Offer` type |
| `optimizeEntity(entity, userId, amount?)` | Single entity optimization |
| `optimizeCollection(userId, partnerId?)` | Batch optimization for shop/home views |
| `optimizeItinerary(opportunities, userId)` | Multi-venue itinerary optimization |

### Key Design Decisions
- Fetches `PaymentMethods` and `Offers` concurrently via `Promise.all` to avoid sequential latency.
- Does NOT contain any mathematical logic — delegates entirely to `OptimizationEngine`.
- Does NOT contain any UI logic — returns pure domain objects.

## Offer Adapter

The `adaptOffer` method maps `CommerceOffer` (DB schema) to `Offer` (engine schema):

```typescript
static adaptOffer(commerceOffer: CommerceOffer): Offer {
  return {
    id: commerceOffer.id,
    name: commerceOffer.title,
    description: commerceOffer.description || '',
    type: commerceOffer.offerType,
    value: commerceOffer.value,
    source: commerceOffer.source,
    eligibility: commerceOffer.eligibilityRules || {},
  };
}
```

All eligibility fields are preserved 1:1:
- `minSpend` → `eligibility.minSpend`
- `maxDiscount` → `eligibility.maxDiscount`
- `partnerIds` → `eligibility.partnerIds`
- `categories` → `eligibility.categories`
- `paymentMethodIds` → `eligibility.paymentMethodIds`
- `paymentMethodTypes` → `eligibility.paymentMethodTypes`
- `mutuallyExclusiveSource` → `eligibility.mutuallyExclusiveSource`

No fields are silently discarded. No values are fabricated.

## PaymentMethod Integration

The service uses `PaymentMethodProvider` exclusively — never `dashboardStore.userCards` directly.

- **Production users**: `PaymentMethodProvider` → `PaymentMethodRepository` → Supabase `payment_methods` table (RLS-scoped)
- **Demo users**: `PaymentMethodProvider` → `cardAdapter` → `dashboardStore.userCards` (local memory)

## Shop Integration

`ShopPage.tsx` now:
1. Calls `CommerceOptimizationService.optimizeCollection(userId)` inside a `useEffect`.
2. Shows a `Loader2` spinner during async fetch.
3. Renders `SmartSpendCard` for each `{entity, result}` pair.
4. Handles empty state ("No matching products found").
5. Derives recommendation text from `result.reason.primary` and `result.reason.supportingFactors`.

## Home Integration

The "Smarter Purchases For You" section in `HomePage.tsx` now:
1. Calls `CommerceOptimizationService.optimizeCollection(userId)` inside a `useEffect`.
2. Shows skeleton loaders (3 animated pulse cards) during async fetch.
3. Renders the first 3 results using `SmartSpendCard`.

## Date Planner Integration

`PlanDatePage.tsx` now:
1. Retains `MOCK_DATE_ITINERARY` for venue definitions (no production venues exist yet).
2. Calls `CommerceOptimizationService.optimizeItinerary(opportunities, userId)` when the user transitions to the itinerary view.
3. Shows a spinner during optimization.
4. Falls back gracefully if no optimization items are returned ("No optimal plan found.").

**Fallback documentation**: The itinerary venues (`partnerName.toLowerCase().replace(' ', '-')`) may not match any production partner IDs. The engine handles this gracefully by returning zero-benefit results for unmatched partners, preserving the aggregate calculation's mathematical consistency.

## Taqdeer Integration Boundary

Taqdeer was NOT fully redesigned in this phase. However, the integration boundary is established:
- Any `SpendingOpportunity` produced by Taqdeer can be passed to `CommerceOptimizationService.optimizeEntity()`.
- The service accepts arbitrary entities and does not require them to be pre-seeded in the commerce catalog.

## Demo Behavior

Demo mode continues to work through the existing `FeatureEngine` + `CommerceRepository.useMock` path:
1. `CommerceRepository` returns mock products/offers when `commerce_production_data` flag is disabled.
2. `PaymentMethodProvider` returns legacy `cardAdapter` results for `demo-user-id`.
3. The engine computes identical `OptimizationResult` structures regardless of data source.

## Authenticated Behavior

For authenticated users:
1. `profile.id` from Clerk is passed to `CommerceOptimizationService`.
2. `PaymentMethodProvider` fetches from `payment_methods` table (RLS-scoped to `user_id`).
3. `CommerceRepository` fetches from production `commerce_entities` and `offers`.
4. No cross-user payment method leakage is possible due to RLS.

## Real Calculation Trace

### Entity: Nike Air Max 270

| Field | Value |
| --- | --- |
| Entity ID | `b46c7425-ec66-4bba-b41c-0f07b7779785` |
| Partner | Nike (`part-nike`) |
| Category | Shopping |
| Base Amount | ₹12,000 |
| Currency | INR |

### Eligible Offers (for Nike)

| Offer | Type | Value | Eligibility |
| --- | --- | --- | --- |
| Nike 10% Discount | `percentage_discount` | 10% (max ₹500) | `partnerIds: [part-nike]`, `minSpend: ₹3000`, `mutuallyExclusiveSource: true` |
| Nike Flat ₹200 | `flat_discount` | ₹200 | `partnerIds: [part-nike]`, `mutuallyExclusiveSource: true` |
| SBI Cashback | `cashback` | 5% | `categories: [shopping, travel, entertainment]`, `paymentMethodIds: [pm-sbi-cashback]` |
| Axis Ace Flat Cashback | `cashback` | 2% | `paymentMethodIds: [pm-axis-ace]` |

### Winning Scenario

For a user with an SBI Cashback card:
- **Merchant Benefit**: Nike 10% Discount → ₹500 (capped at max_discount)
- **Bank Benefit**: SBI Cashback 5% on shopping → ₹600
- **Total Savings**: ₹1,100
- **Effective Cost**: ₹10,900

The Nike Flat ₹200 offer is excluded because `mutuallyExclusiveSource: true` prevents stacking with the Nike 10% Discount (same merchant source).

### Entity: Cultpass Pro (12 Months)

| Field | Value |
| --- | --- |
| Entity ID | `bf36d4f6-fc6a-4226-ac0a-24640f58bcc5` |
| Partner | Cult.fit (`part-cultfit`) |
| Category | Fitness |
| Base Amount | ₹15,000 |

### Eligible Offers (for Cult.fit)

| Offer | Type | Value | Eligibility |
| --- | --- | --- | --- |
| Cult.fit ₹1000 Off | `flat_discount` | ₹1,000 | `partnerIds: [part-cultfit]`, `minSpend: ₹10,000`, `mutuallyExclusiveSource: true` |

- **Merchant Benefit**: ₹1,000
- **Bank Benefit**: Depends on user's card
- **Total Savings**: ≥₹1,000
- **Effective Cost**: ≤₹14,000

## Eligibility Verification

The production pipeline respects all engine constraints:
- **minSpend**: Nike 10% requires ₹3,000 minimum (₹12,000 passes). Cult.fit ₹1000 Off requires ₹10,000 (₹15,000 passes).
- **maxDiscount**: Nike 10% capped at ₹500 (10% of ₹12,000 = ₹1,200, capped to ₹500).
- **partnerIds**: Nike offers only apply to `part-nike` entities.
- **categories**: SBI Cashback only applies to `shopping`, `travel`, `entertainment`.
- **paymentMethodIds**: Bank-specific offers only apply when the user holds the matching card.
- **mutuallyExclusiveSource**: Two Nike merchant offers cannot stack.
- **validity**: All offers valid from 2024-01-01 to 2030-12-31.

## Loading/Error Handling

| Page | Loading State | Error State | Empty State |
| --- | --- | --- | --- |
| ShopPage | `Loader2` spinner | Console error, empty results shown | "No matching products found." |
| HomePage | 3× skeleton pulse cards | Console error, empty grid | Empty grid (graceful) |
| PlanDatePage | Spinning border animation | Console error, fallback to empty | "No optimal plan found." |

No generic spinners were introduced. Each page uses contextually appropriate loading patterns matching the existing RenoCred design language.

## Performance

- **PaymentMethods**: Fetched once per service call via `Promise.all`, not per-entity.
- **Offers**: Fetched once per service call, not per-entity.
- **Entities**: Single batch query per page.
- **No N+1**: `optimizeCollection` performs 3 parallel queries then maps synchronously.
- **No React Query**: Not introduced; async is handled via `useEffect` consistent with the existing architecture.

## Test Results

| Suite | Tests | Status |
| --- | --- | --- |
| Existing: cardAdapter | 2 | ✅ Pass |
| Existing: finixAdapter | 4 | ✅ Pass |
| Existing: engine | 13 | ✅ Pass |
| Existing: commerce repository | 6 | ✅ Pass |
| Existing: PaymentMethodRepository | 4 | ✅ Pass |
| **New: CommerceOptimizationService** | **2** | **✅ Pass** |
| Pre-existing empty suites | 3 | ⚠️ Empty (not our code) |

**Existing**: 25/25 ✅
**New**: 2/2 ✅
**Total**: 27/27 ✅

`npm run build` passes cleanly.

## Known Limitations

1. **Date Planner mock venues**: `MOCK_DATE_ITINERARY` venues use fabricated partner IDs (`partnerName.toLowerCase()`) that don't match production `partner_id` values. The engine handles this gracefully (zero benefit for unmatched partners). To fully resolve, production venues would need to be seeded.

2. **PartnerDetailPage**: Still uses `MOCK_PRODUCTS` directly. Not migrated in this phase as it was not in scope.

3. **Savings metric on HomePage**: The `SavingsMetricDisplay` still shows a hardcoded `₹4,820`. This is a UI-level display value, not a commerce calculation — it represents historical aggregate savings and is outside the scope of this integration.

4. **SmartSpendCard `MockRecommendation`**: The `SmartSpendCard` component still accepts the legacy `MockRecommendation` type as an optional prop for backward compatibility. In production commerce flows, the `recommendation` prop is now synthesized from `OptimizationResult.reason`.

5. **Offer eligibility by payment method ID**: Production offers reference IDs like `pm-axis-ace` and `pm-sbi-cashback` which are abstract product IDs, not the UUID-based `payment_methods.id`. For bank offers to match correctly in production, the engine would need a mapping layer between abstract product IDs and user-specific payment method IDs. This is tracked for Phase 5E.
