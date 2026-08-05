# Executive Summary

## Why Migration is Necessary
RenoCred currently relies on two disjointed, hardcoded static datasets (`masterDataset.ts` for frontend UI and `mockCards.ts` for backend intelligence). This fragmentation leads to data inconsistency, scales poorly as the card portfolio grows, and intertwines data definition directly with application logic. Replacing these with the new `renocred-data` package centralizes the data source, standardizes schemas, and externalizes dataset updates from code deployments.

## Current Limitations
- **Data Fragmentation**: Frontend components use `FinixCard` (133 cards) while the backend recommendation engine uses `CreditCardIntelligence` (mocked 13 cards). 
- **Hardcoded Coupling**: `import { CARD_DATASET }` is scattered across numerous UI components, preventing dynamic data fetching.
- **Brittle Math**: The reward engine assumes simple percentage rates (`rawRate`), which cannot represent complex real-world point systems or caps.
- **UI Tangled with Domain**: Presentation details (e.g., `gradientFrom`, `gradientTo`) are baked directly into the domain dataset.

## Expected Benefits
- **Single Source of Truth**: One JSON-backed dataset for both UI and Recommendation Engine.
- **Decoupled Architecture**: Data updates no longer require frontend deployments.
- **Accurate Recommendations**: Support for complex point multipliers and cap-based logic.
- **Type Safety**: Unified domain models via `renocred-data/types`.

## Migration Philosophy
**Adapter-First, Zero-Downtime.** We will integrate `renocred-data` by first mapping it to the legacy interfaces (`FinixCard` and `CreditCardIntelligence`). We will gradually migrate components to the new interfaces while the adapters protect legacy logic, ensuring no regressions in the recommendation engine or UI.

---

# Current Architecture

- **Frontend (UI)**: Imports `masterDataset.ts` (133 cards) directly via ESM for components like `CardComparisonPanel`, `WalletV4Panel`, and `RecommenderPanel`.
- **Backend (API Layer)**: Next.js API routes trigger the `RecommendationEngine`.
- **Recommendation Engine**: Uses `RewardCalculator` and `CardRanker` to score cards based on transactions.
- **Repository Layer**: `CardRepository` loads the 13 mocked `CreditCardIntelligence` cards instead of the master dataset.
- **Dataset Layer**: Hardcoded TypeScript arrays.
- **Data Flow**: `Static TS Array -> Repository -> Engine -> Controller -> JSON Response -> Frontend Component`.
- **Utilities**: Minor parsing tools inside `dashboard/lib`.
- **Authentication**: Supabase/Clerk.

---

# Target Architecture

The new architecture decouples the raw JSON dataset from the application logic via the `renocred-data` package and runtime adapters.

```mermaid
graph TD
    A[datasets/master_dataset.json] -->|Loaded by| B(renocred-data Loaders)
    B -->|Provides| C{renocred-data/types (CreditCard)}
    
    C -->|Consumed by| D[Adapter: CreditCard to FinixCard]
    C -->|Consumed by| E[Adapter: CreditCard to CreditCardIntelligence]
    
    D -->|Serves| F[Frontend UI Components]
    E -->|Serves| G[CardRepository]
    
    G --> H[Recommendation Engine]
    
    I[UI Theme Config] -->|Provides Gradients| F
```

---

# Dataset Comparison

## Legacy Dataset (`FinixCard` & `CreditCardIntelligence`)
| Legacy Field | Type | Purpose | UI Usage | Required? | Replacement | Notes |
|---|---|---|---|---|---|---|
| `id` | `string` | Unique identifier | Props & Keys | Yes | `id` | - |
| `name` / `cardName` | `string` | Display name | Headings | Yes | `card_title` | - |
| `bank` / `issuer` | `string` | Issuing bank | Filtering | Yes | `issuer` | - |
| `network` | `string` | Card network | Badges | Yes | `network` | - |
| `annualFee` | `number` | Yearly cost | Display & Rank | Yes | `annual_fee` | - |
| `feeWaiverSpend` | `number` | Threshold | Tooltips | No | `fee_waiver_spend` | - |
| `minIncome` | `number` | Eligibility | Hidden | Yes | `minimum_income` | - |
| `minCibil` | `number` | Eligibility | Hidden | Yes | `minimum_cibil` | - |
| `loungeAccess` | `number/string` | Perks | List items | Yes | `lounge` | Complex array in new schema |
| `baseRewardRate` | `number` | Math | Hidden | Yes | `rewards` | Needs computation adapter |
| `rewards` | `array` | Category logic | Display | Yes | `rewards` | Needs computation adapter |
| `gradientFrom/To` | `string` | Styling | CSS styles | Yes | **UI Config** | Needs extraction to frontend config |
| `highlights` | `array` | Selling points | Bullet lists | Yes | `benefits` | Needs mapping |

## New Dataset (`CreditCard`)
| Field | Type | Meaning | Compatibility | Replacement / Transformation Needed |
|---|---|---|---|---|
| `id` | `string` | Unique ID | 1:1 | None |
| `card_title` | `string` | Display name | 1:1 | Map to `name` / `cardName` |
| `issuer` | `string` | Issuing Bank | 1:1 | Map to `bank` |
| `rewards` | `array` | Object with `points`, `spend` | **Breaking** | Adapter must compute effective `% rate` for legacy math. |
| `lounge` | `array` | Object with limits | **Breaking** | Adapter must parse `limit` to string/number. |
| `benefits` | `array` | Object with desc | **Breaking** | Adapter must extract strings for `highlights`. |

---

# Complete Field Mapping

## FinixCard Mapping
```text
FinixCard                 <-    renocred-data (CreditCard)
id                        <-    id
name                      <-    card_title
bank                      <-    issuer
network                   <-    network
first4Digits              <-    [DEPRECATED / NULL]
annualFee                 <-    annual_fee
feeWaiverSpend            <-    fee_waiver_spend
minIncome                 <-    minimum_income
minCibil                  <-    minimum_cibil
welcomeBonus              <-    welcome_bonus
loungeAccess              <-    lounge[0].limit (Fallback parsing)
rewards                   <-    Adapter Computed (calculate rate from points/spend)
baseRewardRate            <-    Adapter Computed (calculate rate from default points)
highlights                <-    benefits.map(b => b.description).slice(0, 3)
gradientFrom              <-    [EXTERNAL UI CONFIG]
gradientTo                <-    [EXTERNAL UI CONFIG]
```

## CreditCardIntelligence Mapping
```text
CreditCardIntelligence    <-    renocred-data (CreditCard)
cardName                  <-    card_title
joiningFee                <-    fees?.joining_fee || annual_fee
rewardType                <-    rewards[0]?.point_type || 'points'
rewardRate                <-    rewards[0]?.raw_text || 'Variable'
forexMarkup               <-    fees?.forex_markup || 3.5
fuelBenefits              <-    benefits.find(b => b.category === 'fuel')?.description
welcomeBenefits           <-    [welcome_bonus]
milestoneBenefits         <-    benefits.filter(b => b.category === 'milestone')
eligibility.minSalary     <-    minimum_income
categories                <-    card_categories
premiumTier               <-    card_tier
topBenefit                <-    benefits[0]?.description
```

---

# Missing Fields

1. **`gradientFrom` & `gradientTo`**
   - **Why it exists**: Render beautiful UI cards in the dashboard.
   - **Handling**: Remove from dataset. Create a UI config `src/features/finix/data/cardThemeConfig.ts` mapped by `card.id`.
2. **`first4Digits`**
   - **Why it exists**: Legacy identification.
   - **Handling**: Deprecated/Removed. UI will safely ignore it.
3. **`data_confidence` (New)**
   - **Why it exists**: Indicates parser confidence from `renocred-data`.
   - **Handling**: Ignored by adapters, but accessible for analytics.

---

# UI Dependency Audit

| Component | Purpose | Dataset Fields | Migration Risk | Replacement Strategy |
|---|---|---|---|---|
| `AddCardModal.tsx` | Select cards | `name`, `bank`, `network` | Low | Replace import with Adapter output |
| `CardBenefitsSheet.tsx` | Show perks | `highlights`, `loungeAccess` | Medium | Map `benefits` array properly |
| `CardComparisonPanel.tsx` | Compare cards | ALL | High | Ensure adapter populates identical structure |
| `RecommenderPanel.tsx` | Show suggestions | `rewards`, gradients | High | Ensure UI config provides gradients |
| `WalletV4Panel.tsx` | Dashboard wallet | `id`, `name`, gradients | Medium | Ensure UI config provides gradients |
| `RecentDecisionsV3.tsx` | Type usage | Interface only | Low | Update interface imports |

---

# Recommendation Engine Audit

- **CardRepository**: Currently imports `MOCK_CARDS_INTELLIGENCE` (13 cards).
  - **Risk**: High. Swapping to 133 dynamically mapped cards will alter recommendation outcomes drastically.
- **RewardCalculator**: Expects `rewardRate` to be a parseable string (e.g., `"3.3% base"`).
  - **Risk**: Critical. If the adapter fails to inject `"X%"` strings, the engine's `parseFloat()` regex will return `NaN` or `1.0`.
- **CardRanker**: Relies heavily on accurate math from `RewardCalculator`.
  - **Risk**: Medium. Logic remains intact if `RewardCalculator` receives correct strings.

**Required Changes**: The adapter mapping `CreditCard` -> `CreditCardIntelligence` must generate a highly specific string for `rewardRate` (e.g., `"${calculatedRate}% base"`) to satisfy the legacy regex in `RewardCalculator:14`.

---

# Import Dependency Graph

## Old Graph
```text
src/features/finix/data/masterDataset.ts
 └── src/features/finix/data/cardDataset.ts
      ├── UI Components (Wallet, Modals, Panels)
      ├── data-import (Mappers, Validators)
      └── finix/lib (taqdeerEngine, recommendEngine)
```

## Target Graph
```text
renocred-data/datasets/master_dataset.json
 └── renocred-data/loaders/loadCards.ts
      ├── src/features/finix/adapters/finixAdapter.ts
      │    ├── UI Components (Wallet, Modals, Panels)
      │    ├── data-import
      │    └── finix/lib (taqdeerEngine)
      └── src/features/finix/adapters/intelligenceAdapter.ts
           └── src/features/card-intelligence/cardRepository.ts
```
**Files modified**: Every file importing `CARD_DATASET` or `MOCK_CARDS_INTELLIGENCE`.

---

# Adapter Specification

1. **`createFinixCardAdapter(card: CreditCard): FinixCard`**
   - **Inputs**: 1 `CreditCard` object.
   - **Outputs**: 1 `FinixCard` object.
   - **Transformations**: 
     - Map `rewards` array to `{ category, rate: (points/spend * 100) }`.
     - Extract `lounge` limit to a number.
     - Inject `gradientFrom`/`gradientTo` from external theme registry.
2. **`createIntelligenceAdapter(card: CreditCard): CreditCardIntelligence`**
   - **Inputs**: 1 `CreditCard` object.
   - **Outputs**: 1 `CreditCardIntelligence` object.
   - **Transformations**:
     - Serialize base reward calculation into string `"X% base"`.
   - **Error Handling**: Fallback to `1.0% base` and `entry` tier if parsing fails.
   - **Caching**: Adapters should run once on initialization inside the Repository, storing the mapped array in memory.

---

# Reward Migration

- **Legacy Model**: Statically defined percentage `rate` (e.g., 2%).
- **New Model**: `points` and `spend` (e.g., 2 points per ₹100 spend).
- **Conversion Strategy**:
  - `effective_rate = (points / spend) * point_value_in_inr * 100`
  - *Example*: 2 points / 100 spend. Point value = ₹0.25. Rate = `(2/100) * 0.25 * 100 = 0.5%`.
- **Edge Cases**: Uncapped rewards vs capped rewards. The current legacy engine does not process caps. The adapter will ignore caps for now to maintain parity, but V2 architecture will upgrade the engine to process caps natively.

---

# Presentation Layer Separation

All UI properties must be stripped from datasets.

- **Properties**: `gradientFrom`, `gradientTo`, `cardImage` (if applicable).
- **Location**: `src/features/finix/config/cardThemeRegistry.ts`.
- **Design**:
```typescript
export const CARD_THEMES: Record<string, { gradientFrom: string, gradientTo: string }> = {
  'iob_platinum': { gradientFrom: '#004D40', gradientTo: '#00796B' },
  // ...
};
```
UI components will fetch `CARD_THEMES[card.id] || DEFAULT_THEME`.

---

# Repository Migration

`CardRepository` currently holds hardcoded mock intelligence.

**Architecture Evolution**:
1. Remove `import { MOCK_CARDS_INTELLIGENCE }`.
2. Import `loadCards()` from `renocred-data`.
3. Inside `CardRepository.getInstance()`, execute `loadCards()`.
4. Map the resulting array through `createIntelligenceAdapter`.
5. Store the mapped array in the `this.cards` singleton state.
6. The interface of `CardRepository` (`getCards()`) remains completely unchanged, ensuring the Recommendation Engine requires zero modifications during Phase 1.

---

# API Impact

- **Affected Endpoints**: `/api/recommendation` (Implicit via `recommendationEngine`).
- **Request**: Unchanged.
- **Response**: Unchanged structurally, but the **content** (recommended cards) will change drastically because the engine will evaluate 133 real cards instead of 13 mocked ones.
- **Mitigation**: Recommendation Engine tests must be updated to expect the new master dataset cards.

---

# Testing Strategy

- **Adapter Tests**: 100% coverage on `finixAdapter` and `intelligenceAdapter`. Ensure math conversions (points -> percentages) are mathematically identical to legacy hardcoded values.
- **UI Regression Tests**: Snapshot tests on `CardComparisonPanel` and `RecommenderPanel` to ensure gradients and text render correctly after theme separation.
- **Engine Tests**: Re-run recommendation benchmarks against the 133-card dataset to ensure `CardRanker` doesn't crash on edge cases.

---

# Risk Register

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| Reward math parses `NaN` causing Ranker crash | Medium | High | Strict fallback to `1.0%` in adapters | Revert repository to mock |
| Missing gradients break dashboard styling | Low | Medium | Default fallback theme in `cardThemeRegistry` | Revert component imports |
| Engine latency increases (13 -> 133 cards) | High | Low | Cache ranked results; observe latency metrics | None (optimization needed) |

---

# Rollback Strategy

If critical regressions occur in production:
1. Revert `CardRepository.ts` to use `MOCK_CARDS_INTELLIGENCE`.
2. Revert `src/features/finix/data/cardDataset.ts` to export `masterDataset.ts`.
3. Due to adapter isolation, the underlying business logic remains untouched, guaranteeing a clean and safe Git revert.

---

# Migration Phases

**Phase 1: UI Decoupling**
- **Goal**: Remove presentation logic from domain data.
- **Affected Files**: `masterDataset.ts`, all UI components using gradients.
- **Verification**: Dashboard visual regression check.

**Phase 2: Adapter Implementation**
- **Goal**: Build translation layers.
- **Affected Files**: `src/features/finix/adapters/` (new files).
- **Verification**: Unit tests confirm 100% data parity.

**Phase 3: Repository Cutover**
- **Goal**: Wire backend to the new dataset.
- **Affected Files**: `CardRepository.ts`.
- **Verification**: Recommendation API returns valid cards from the 133-set.
- **Rollback Point**: Git Revert on `CardRepository.ts`.

**Phase 4: Frontend Cutover**
- **Goal**: Wire UI to the new dataset.
- **Affected Files**: All files importing `CARD_DATASET`.
- **Verification**: E2E tests pass.

**Phase 5: Legacy Cleanup**
- **Goal**: Delete old data.
- **Affected Files**: Delete `finix/data/`, delete `mockCards.ts`.

---

# Acceptance Criteria

- [x] All UI components fetch data without legacy imports.
- [x] Dashboard renders correctly (gradients active).
- [x] Recommendation Engine evaluates all 133 real cards successfully.
- [x] Reward Calculator math does not result in `NaN`.
- [x] Unit and Integration tests pass.
- [x] `finix/data/masterDataset.ts` and `mockCards.ts` are entirely deleted.

---

# Technical Debt

- **Legacy Debt Removed**: Hardcoded data files, mocked intelligence, brittle UI-data coupling.
- **New Debt Introduced**: Adapter layers that convert modern schemas backwards into legacy structures (which adds minor runtime overhead).
- **Future Improvements**: Phase out the Adapters and rewrite `CardRanker` to natively understand the `CreditCard` schema (specifically natively processing points and caps).

---

# Future Architecture (V2)

Once Phase 5 completes, V2 will focus on:
1. Eliminating `FinixCard` entirely from the frontend.
2. Rewriting `RewardCalculator` to natively ingest `renocred-data` rewards arrays, unlocking cap-aware math.
3. Fetching `renocred-data` dynamically over an API endpoint on frontend hydration to reduce JS bundle size.

---

# Final Checklist

- [ ] Create `cardThemeRegistry.ts`.
- [ ] Refactor UI components to use Theme Registry.
- [ ] Build `finixAdapter.ts`.
- [ ] Build `intelligenceAdapter.ts`.
- [ ] Write Adapter Unit Tests.
- [ ] Swap `CardRepository` source to Adapter.
- [ ] Swap `CARD_DATASET` UI imports to Adapter.
- [ ] Validate Engine Benchmarks.
- [ ] Delete legacy dataset files.
