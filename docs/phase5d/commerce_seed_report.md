# RENO CRED 2.0 — COMMERCE SEED REPORT

## Source Mock Data
Mock data was sourced directly from the prototype models:
- `src/features/lifestyle/mock/products.ts`
- `src/features/lifestyle/mock/partners.ts`
- `src/features/optimization/mock/offers.ts`
- `src/features/optimization/mock/partners.ts`

## Mock → Production Mapping
The exact mapping and strategy was documented in `docs/phase5d/mock_to_production_mapping.md`.

## Categories Seeded
Seeded 7 foundational, stable categories to support both Lifestyle and Optimization features:
- Shopping (`shopping`)
- Fitness (`fitness`)
- Dining (`dining`)
- Travel (`travel`)
- Accommodation (`accommodation`)
- Transport (`transport`)
- Entertainment (`entertainment`)

## Partners Seeded
Seeded 6 production partners matching prototype capabilities:
- Nike (Shopping)
- Cult.fit (Fitness)
- Uber (Transport)
- Olive Bar & Kitchen (Dining)
- Taj Hotels (Accommodation)
- MakeMyTrip (Travel)

## Commerce Entities Seeded
Seeded 2 targetable products/subscriptions:
- Nike Air Max 270 (Product, ₹12,000)
- Cultpass Pro 12 Months (Subscription, ₹15,000)

## Offers Seeded
Seeded 7 optimization-compliant offers:
- Nike 10% Discount (Merchant, Percentage)
- HDFC Diners 5X Rewards (Bank, Points)
- SBI Cashback (Bank, Cashback)
- Axis Ace Flat Cashback (Bank, Cashback)
- Cult.fit ₹1000 Off (Merchant, Flat Discount)
- Visa Dining Delights (Card Network, Percentage)
- Nike Flat ₹200 (Merchant, Flat Discount)

*Note: `reward_multiplier` was mapped to `points` and `network` was mapped to `card_network` to satisfy production schema constraints.*

## Records Not Seeded
- `payment_methods`: No fake payment methods were seeded into the global production state, as they are strictly user-scoped. The prototype Demo continues to inject local mock payment methods.
- `affiliate_relationships`: Affiliate secrets and networks were omitted to preserve security and follow the Phase 5C architecture.

## RLS Validation
RLS correctly blocks any unauthenticated mutations to the public tables, while completely obscuring internal tracking/commission tables. Data can only be queried publicly where explicitly allowed.

## Data Integrity
- No legacy production tables (`users`, `cards`, etc.) were mutated.
- All entities reference valid, seeded UUIDs for categories and partners.
- Conflict targets ensure the script can be rerun cleanly.

## Idempotency
The seed script (`supabase/seed_commerce_mock.sql`) uses statically assigned V4 UUIDs combined with `ON CONFLICT (id) DO UPDATE SET...`. It can be run infinitely without duplicating data.

## Remote Database Verification
Data counts retrieved directly from the linked production Supabase database:
- **Categories**: 7
- **Partners**: 6
- **Commerce Entities**: 2
- **Offers**: 7

## Test Results
- `npm run build`: Success.
- `npx vitest run`: 15/15 tests passing.

## Known Limitations
The UI is not yet wired to this remote production data. It still reads from local mock models. Phase 5D.3+ will integrate the backend.
