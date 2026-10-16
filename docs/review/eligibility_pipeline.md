# Card eligibility pipeline review: model and data (October 2026)

**Scope.** This is a review only; nothing here is implemented in this branch. It covers how RenoCred decides which card a user can get and which offer applies to which card. Specifically:
- the card master (`renocred_card_master.json`, 518 cards);
- the ExtractFlow offer pipeline (`ExtractFlow/renocred_offers/*`, `renocred_offer_master.json`, 434 offers);
- the import path into the app (`scripts/importOffers.ts`, `src/features/data-import/*`);
- the server filter `api/offers/eligible.ts`;
- the client engines (`OfferEligibilityEngine`, `optimization/engine/*`, `financial-engine/EligibilityService`, `finix/recommendEngine`).

**Method.** Counts were measured directly from the two JSON files with Python on 16 Oct 2026. Code references point at the files on branch `dhruv/oct-2026-run`.

---

## 1. Two different questions share the word "eligibility"

| | (a) Approval eligibility | (b) Offer eligibility |
|---|---|---|
| Question | Will this user be approved for card X? | Does offer O apply to this user's card, merchant, amount and city? |
| Where it lives today | `finix/lib/recommendEngine.ts` (hard income/CIBIL gates), `financial-engine/EligibilityService.ts` (ELIGIBLE / INELIGIBLE / UNKNOWN / ALREADY_OWNED), the unused `card_eligibility_rules` table | ExtractFlow `eligibility.py` (three outcomes plus a caveat), `api/offers/eligible.ts` + `commerce/services/OfferEligibilityEngine.ts` (binary), `optimization/engine/eligibility.ts` |
| Model | Rules only | Rules only |
| Biggest problem | **No data**: approval criteria are essentially empty | **Lossy import**: most offers never reach ranking |

There is no ML anywhere today. That is the right starting point: neither data set is good enough to train on yet (§5).

---

## 2. Approval eligibility: the data isn't there

### 2.1 Measured fill rates in the 518-card master

| Field (`eligibility.*`) | Filled |
|---|---|
| `minimum_income`, `annual_income`, `income_type`, `employment_requirements`, `credit_profile_requirements`, `residency_requirements`, `existing_customer_requirements`, `nationality`, `secured_card_requirement`, `business_eligibility` | **0 / 518** |
| `monthly_income` | **26 / 518 (5%)**. Values include `2.0` and `6.0`, almost certainly "₹2 lakh" / "₹6 lakh" parsed as numbers. `renocred-data/adapters/finixAdapter.ts` then turns `2.0` into a ₹24/year threshold. |
| `minimum_age` / `maximum_age` | 5 / 518 (all 21 / 60) |

The file's own `metadata.coverage_by_field.eligibility` reports **520/520**, because it counts the eligibility *block* being present, not filled values. That metric has been hiding the gap.

Related reward and fee coverage:

| Field | Filled |
|---|---|
| `fees.annual_fee` | 220 / 518 |
| `rewards.earning_rules` | 67 / 518 |
| `rewards.caps` | 0 |
| `redemption.value` | 0 |
| `milestones` | 0 |

The legacy 144-card dataset the UI actually uses has `minIncome` / `minCibil` on every card, but they are round guesses (650/700/750). Its 572 category rates carry **0 caps**.

### 2.2 Data quality issues to fix at the source
- Issuer names are not normalised: `IDFC Bank` vs `IDFC FIRST Bank`, `Induslnd Bank` (typo) vs `IndusInd Bank`, and `RuPay` listed as an *issuer*.
- Income is captured as a free-floating number with no unit or period, and salaried and self-employed thresholds are not separated. Issuers publish them separately, often per city tier.
- CIBIL minimums are rarely published by Indian issuers. Treat `minCibil` as **unknown by default**, not 650.

### 2.3 Model behaviour today (after this branch)
- `recommendEngine` and `RewardsFacade` gate only on what is known. Unknown income or CIBIL produces a "Not confirmed" caveat instead of a fabricated ₹15L / 750 profile.
- `EligibilityService` returns UNKNOWN when a card publishes no criteria. The ranker keeps those cards with a caveat. Before this branch it dropped them, which meant "no recommendations" on real data.
- `minAge`, `maxAge`, `employmentType` and location exist in the types but have no data behind them.

---

## 3. Offer eligibility: where the ExtractFlow → app import loses data

ExtractFlow produces a careful dataset:
- three-outcome eligibility;
- a source-authority tier on every offer;
- verification states;
- unmatched card slugs kept verbatim, so a failed lookup can never widen who an offer applies to.

The import into Supabase and the app's engines discards most of that. Measured on `renocred_offer_master.json`:

| # | What is lost | Evidence | Effect |
|---|---|---|---|
| 1 | `validity.status = UNKNOWN` is imported as **expired** | `offerMapper.ts:61`: `status === 'ACTIVE' ? 'active' : 'expired'`. Status counts: UNKNOWN 216, EXPIRED 111, ACTIVE 107 | **162 VERIFIED offers dropped**; only 107 of 434 survive |
| 2 | `verification_status` ignored | NEEDS_REVIEW 74, CONFLICTED 1; discovery-grade B/C sources 105 | Unreviewed or conflicting offers would be shown as fact |
| 3 | `rate_type: UP_TO` dropped | 54 "up to X%" offers | Ranked at their headline maximum |
| 4 | Network scope dropped | 54 network offers (Visa/Mastercard) with no issuer | No constraint left, so they apply to **every** card |
| 5 | Unmatched card slugs, student/new-customer flags and `other_eligibility_rules` dropped | 89 offers with unmatched slugs (2 with only unmatched); 215 with other rules (incl. corporate-card exclusions) | Card IDs are re-resolved by name tokens (`cardReconciler.ts`), and all-unmatched offers widen to the whole issuer: exactly the failure ExtractFlow guards against |
| 6 | Region tokens matched as city names | `location`: NATIONAL 39, NORTH 15, EAST 12 (`OfferEligibilityEngine.ts`) | Nationwide offers fail every city check |
| 7 | Benefit values mis-mapped | benefit types: PARTNER_LOYALTY_TRANSFER 106, VOUCHER_ACCELERATOR 56, EMI 37 → `flat_discount 0`; REWARD_MULTIPLIER valued as "5 points × ₹0.25" (`benefitCalculator.ts`) | Value is zero or invented |
| 8 | **No merchant or amount context** when ranking | `CommerceOptimizationService` calls `getEligibleOffers()` with no arguments (3 call sites); 431 / 434 offers are merchant-scoped and 111 have a minimum spend | Merchant-scoped offers fail with MERCHANT_CONTEXT_MISSING: **close to zero ExtractFlow offers reach ranking** |
| 9 | Per-card applicability unused | `api/offers/eligible.ts:113` computes `applicable_wallet_card_ids`; the optimiser checks only `paymentMethodIds` (`optimization/engine/eligibility.ts:34`) | An offer valid on one HDFC card is credited to every wallet card |
| 10 | Two JSON schemas share one `eligibility_rules` column | Admin `EligibilityBuilder` writes camelCase (`categories`, `partnerIds`); the importer writes snake_case (`eligible_cards`, `issuer`) | Each engine only reads its own keys |
| 11 | Brittle issuer matching | `eligible.ts` compares `cards.bank` to short codes (`'SBI'`, `'HDFC'`) | Misses on "SBI Card", "HDFC Bank" |

The old recommendation benchmark reports **0% offer resolution**. Point 8 alone explains it, and the quality gate now fails on it (Task 5).

---

## 4. Recommended target design

### 4.1 One typed eligibility contract
- A single zod schema `OfferEligibility`, versioned, in `renocred-data/types`. It is shared by ExtractFlow's export, `importOffers.ts`, the admin builder, `api/offers/eligible.ts` and the client optimiser.
- Fields:
  - `scope`: NATIONAL / REGION / CITY / ONLINE;
  - `networks[]`, `issuers[]` (normalised codes), `cardIds[]`;
  - `unmatchedCardSlugs[]` (never widened);
  - `studentRequired`, `newCustomerRequired`;
  - `minSpend` and `maxBenefit` in paise;
  - `channels[]`, `rateType` (EXACT / UP_TO);
  - `otherRules[]` (free text shown as caveats).
- Migrate the JSONB column once, then reject unknown keys.

### 4.2 Three outcomes everywhere
Port ExtractFlow's `eligibility.py` semantics into `OfferEligibilityEngine`:
- ELIGIBLE, INELIGIBLE, or INSUFFICIENT_DATA, plus `caveats[]`;
- INSUFFICIENT_DATA is **never** treated as eligible for ranking value, but it is shown as "check with issuer";
- region tokens resolve through a state/region table, not string equality.

### 4.3 Fix the importer (`offerMapper.ts`)
- Import the *lifecycle* and *verification* states rather than collapsing them:
  - UNKNOWN validity → active, with a "dates not confirmed" caveat;
  - NEEDS_REVIEW and B/C-tier sources → hidden from ranking until verified;
  - CONFLICTED → excluded.
- Carry over network scope, `rate_type`, unmatched slugs, flags and `other_eligibility_rules`.
- Use ExtractFlow's `card_ids` as-is (it already resolved them against the card master) instead of re-resolving by name.
- Value benefits by mechanism:
  - loyalty transfer and voucher accelerators via point values from `renocred-data/config/reward_point_values.json`;
  - EMI as "no direct value";
  - REWARD_MULTIPLIER as (multiplier − 1) × the card's base rate.

### 4.4 Pass context and honour per-card applicability
- `CommerceOptimizationService` must call `getEligibleOffers({ merchantId, amount, city, channel })`.
- The optimiser must intersect with `applicable_wallet_card_ids`.

### 4.5 Approval data: collect it, then model it
1. **Collect.** Add an ExtractFlow adapter for issuer *eligibility* pages (each major issuer publishes one per card). Capture:
   - minimum income, salaried and self-employed separately, with unit and period;
   - age range, employment types and serviceable cities;
   - existing-relationship requirements;
   - evidence URL and snapshot, following the offer pipeline's verification model.

   Normalise issuers and fix the "2.0 → ₹2 lakh" unit bug. Change the coverage metric to count **filled values**.
2. **Rules first.** `EligibilityService` evaluates income (by employment type), age, city and CIBIL *when published*; everything else stays UNKNOWN with a caveat. Wire up the existing `card_eligibility_rules` table instead of hard-coding.
3. **Feedback loop.** This is what an approval model needs, and today nothing records outcomes. Sources:
   - `apply_clicks` already exist;
   - affiliate conversions (`api/affiliate/conversion.ts`) give approved / declined when partners report back;
   - a one-tap "Were you approved?" prompt 7 and 21 days after an apply click;
   - (later) bureau soft-pull pre-approvals.

   Store outcomes with the profile snapshot at apply time: income band, CIBIL band, age band, employment, city tier, existing issuer relationship, card tier.
4. **Then a model.**
   - Start with logistic regression over those features; it is interpretable, which matters for compliance and for explanations. Move to gradient boosting only if lift justifies it.
   - Calibrate with isotonic regression and track ECE and Brier score per issuer.
   - Show **bands** ("High / Medium / Low approval odds") rather than percentages until calibration error stays under about 5 points on a holdout set.
   - Rough data need: several hundred labelled outcomes per issuer before issuer-specific effects are trustworthy. Until then, pool across issuers with issuer as a feature.
   - Never use protected attributes, and log every prediction with its feature snapshot for audit.

### 4.6 Reward data the engines need (from Task 5)
- **Caps:** hand-curate, with evidence links, for the top ~50 cards by traffic. Today every legacy rate is uncapped, so estimates are pre-cap.
- **Redemption values:** point → ₹ per redemption route (`redemption.value` is 0% filled).
- **Earning rules:** typed (percent, points per ₹X, merchant-specific), with effective dates. `FinancialTruthEngine` already supports dates, precedence and caps.

---

## 5. Suggested order of work

| Step | Effort | Unlocks |
|---|---|---|
| 1. Importer fixes (§4.3) + pass merchant/amount context (§4.4) | S | Offers actually reach ranking; the offer-resolution metric becomes meaningful |
| 2. Shared zod eligibility schema + three-outcome engine (§4.1–4.2) | M | One definition of "applies", no silent widening |
| 3. Issuer eligibility adapter in ExtractFlow + normalisation (§4.5.1) | M | Real approval criteria for the top issuers |
| 4. Curated caps and redemption values for the top 50 cards (§4.6) | M | Honest reward numbers; turn on `VITE_UNIFIED_RECO_ENGINE` |
| 5. Outcome capture (§4.5.3) | S | Labels for any future model |
| 6. Calibrated approval model (§4.5.4) | L | Approval-odds bands (only after enough outcomes) |
