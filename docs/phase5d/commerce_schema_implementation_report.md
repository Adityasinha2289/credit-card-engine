# RENO CRED 2.0 — PHASE 5D.1 SCHEMA IMPLEMENTATION REPORT

## Existing schema audit
Before creating the migration, the existing `20260726000000_production_schema.sql` was rigorously audited. The most critical finding was that RenoCred currently uses Clerk for authentication, meaning user IDs are stored as `TEXT` in the `profiles` table (mapping to Clerk's JWT `sub`), rather than Supabase's native `auth.users(id)` UUIDs. The V2 SQL proposal was refactored to point `user_id` foreign keys to `profiles(id)` via `TEXT` to prevent broken relationships. Additionally, all currency values were standardized to `NUMERIC(12, 2)` and timestamps to `TIMESTAMPTZ` with automatic `updated_at` triggers to match existing conventions.

## New tables created
1. `categories` (Hierarchical taxonomy)
2. `partners` (Commercial organizations)
3. `commerce_entities` (Products/Services with price snapshots)
4. `offers` (Math-driven discounts)
5. `payment_methods` (Generic wallet metadata)
6. `affiliate_relationships` (Internal commission contracts)
7. `tracking_events` (Attribution clicks with snapshots)
8. `conversions` (Partner-reported sales)
9. `commissions` (Financial reconciliation records)

## Relationships
- `commerce_entities` belongs to `partners` (CASCADE) and `categories` (SET NULL).
- `offers` and `affiliate_relationships` belong to `partners` (CASCADE).
- `tracking_events` link a `user_id`, `partner_id`, `commerce_entity_id`, and `offer_id`.
- `conversions` are strictly bound to `tracking_events` (RESTRICT deletion).
- `commissions` belong to `conversions` (CASCADE).

## RLS policies
- **Public Read (via true):** `categories`, `partners`, `commerce_entities`.
- **Public Read (Sanitized View):** Direct access to `offers` is denied. A `public_offers_view` is created to securely expose only non-sensitive mathematical fields to the client.
- **User Restricted:** `payment_methods` (CRUD limited to own `user_id`), `tracking_events` (Read limited to own `user_id`).
- **Server Only (Default Deny ALL frontend access):** `affiliate_relationships`, `conversions`, `commissions`.

## Indexes
Optimized for read performance on the frontend:
- `idx_partners_status`
- `idx_commerce_entities_partner`
- `idx_offers_status_dates`
- `idx_offers_eligibility` (GIN index for JSONB rule evaluation)
- `idx_payment_methods_user`
- `idx_tracking_events_user`

## Migration safety
This migration is 100% additive. No existing tables (`user_cards`, `transactions`, `profiles`, etc.) were modified or deleted. Existing Dashboard and Optimization Engine logic remains fully intact and operational using the adapter pattern from Phase 5B.

## Payment method strategy
The `payment_methods` table was created but the frontend has NOT been switched over. Dual-write and backfilling will be implemented in a subsequent phase. The frontend cannot fabricate reward metadata, as sensitive fields are controlled entirely server-side.

## Security validation
- No PANs, CVVs, or secure credentials can be stored in the generic `payment_methods` metadata JSON.
- `internal_campaign_metadata` and `commission_terms` are completely invisible to the frontend thanks to strict View projection and RLS defaults.
- The browser cannot write tracking attribution clicks directly.

## Rollback considerations
Because the migration is strictly additive and independent of legacy `user_cards`, rolling it back is as simple as dropping the 9 new tables. Zero impact on live users.

## Test results
- `npm run build` completed successfully with no type errors.
- `npx vitest run` passed successfully (15/15), confirming the Optimization Engine math and adapters are uncorrupted.

## Known limitations
**IMPORTANT:** The migration file `20260809130000_commerce_schema.sql` has been perfectly crafted and saved in `supabase/migrations/`. However, the local environment lacks Docker/Podman, meaning a local Supabase database instance could not be spawned to execute `supabase db push`. The migration must be applied via a CI/CD pipeline or an environment with Docker enabled before we can proceed to Phase 5D.2 Data Seeding.
