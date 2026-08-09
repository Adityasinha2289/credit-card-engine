# RENO CRED 2.0 — PAYMENT METHOD MIGRATION REPORT

## Current Architecture
RenoCred currently uses the legacy `CardData` abstraction and `user_cards` table to drive the UI wallet, combined with a `cardAdapter` that maps this UI-heavy schema into an optimization-friendly format on the fly. 

## New Architecture
A new `PaymentMethod` domain boundary now sits in front of the Optimization Engine. It strictly separates User-Controlled fields (`name`, `status`) from System-Verified fields (`network`, `bank`, `legacy_card_id`). The Optimization Engine natively queries `PaymentMethodProvider`, isolating it completely from legacy state.

## CardData → PaymentMethod Mapping
To ensure optimization parity:
- **`CardData.label`** maps to **`PaymentMethod.name`**
- **`CardData.bank` / `CardData.network`** are strictly enforced by the backend and passed in `PaymentMethod.metadata` as un-editable fields.
- **`CardData.status`** drives the `status` flag for active/inactive processing.

## Production Schema
The `payment_methods` table successfully conforms to the UUID primary key format and links via Foreign Key natively to the generic `users(id)` identity system. Metadata rules guarantee that optimization rates can't be spoofed by frontend clients.

## RLS
Row Level Security is correctly configured:
- `user_id` strictly controls SELECT, UPDATE, INSERT, and DELETE statements for `payment_methods`.
- Users cannot query or mutate peer records.

## User-Controlled vs System-Controlled Fields
`PaymentMethodRepository` enforces strict mutation boundaries. The `updateUserMetadata(name)` endpoint only exposes the `name` column to client edits. Trusted metadata like `cashback_rate`, `network`, and `provider` are firmly isolated. 

## Backfill Analysis
A dry-run analysis was executed. 
- **Total `user_cards`**: 13
- **Total users**: 17
- All 13 cards possessed valid IDs, user IDs, network tags, and bank tags. They were universally classified as **SAFE**.

## Backfill Results
Using a generated v5 UUID seeded by `${user_id}:${card_id}:${last_4_digits}`, 13 rows were idempotently migrated to `payment_methods` without duplicate collision. Legacy data (`user_cards`) was left 100% intact.

## Provider/Resolver
`PaymentMethodProvider` was introduced as the dual-read resolver. 
1. It queries `payment_methods` if the `commerce_production_data` flag is active.
2. If Supabase is disabled, or data is missing, it seamlessly invokes the legacy `cardAdapter` to map Zustand `userCards` state.

## Fallback Strategy
The `demo-user-id` is actively intercepted within the Provider. To prevent pollution of the production backend database with fake onboarding traffic, demo users ALWAYS bypass the Supabase request and are fed exclusively from the local `cardAdapter` memory.

## Optimization Equivalence
The test suite validates that a `PaymentMethod` hydrated directly from Supabase produces mathematically identical fields (and therefore identical engine outputs) to a `PaymentMethod` hydrated via `cardAdapter` from legacy state.

## Security Tests
Unit tests in `PaymentMethodRepository.test.ts` verified the strict payload isolation for `updateUserMetadata`.

## Application Regression
The full test suite passed correctly:
- **Existing tests:** 21/21
- **New tests:** 4/4
- **Total:** 25/25
`npm run build` completed cleanly without bundle bloat.

## Known Limitations
The UI `dashboardStore` has not yet been modified to cutover its write actions. Updates (e.g., card edits) will only sync to legacy `user_cards`. 

## Recommended Next Step
Phase 5D.5 — Live Commerce + Payment Method → Optimization Engine Integration. This will connect the engine and trigger the final live marketplace.
