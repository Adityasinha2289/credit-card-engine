# RENO CRED 2.0 — COMMERCE SCHEMA DEPLOYMENT REPORT

## Baseline Decision
Strategy A was approved. We baselined the actual remote production database (which is based on the legacy V1 `001_initial_schema.sql` identity model) and completely ignored the un-deployed `20260726000000_production_schema.sql` architectural draft.

## Migrations Baselined
Using `npx supabase migration repair --status applied --linked`, we successfully marked the following migrations as already existing remotely without executing their destructive statements:
- `001_initial_schema.sql`
- `002_full_persistence.sql`
- `003_seed_master_data.sql`
- `004_full_master_cards_seed.sql`
- `20260726000000_production_schema.sql` (Ignored/Orphaned)

## Commerce Migration Modifications
`20260809130000_commerce_schema.sql` was modified to correctly align with the actual production identity model:
1. `payment_methods.user_id` was updated to reference `users(id)` instead of `profiles(id)`.
2. `tracking_events.user_id` was updated to reference `users(id)` instead of `profiles(id)`.
3. An incorrect trigger function call `update_updated_at_column()` was fixed to match the legacy production function `update_updated_at()`.

## Migration List BEFORE Repair
```text
Local                 Remote
001                   blank
002                   blank
003                   blank
004                   blank
20260726000000        blank
20260809130000        blank
```

## Migration List AFTER Repair
```text
Local                 Remote
001                   applied
002                   applied
003                   applied
004                   applied
20260726000000        applied
20260809130000        pending
```

## Exact Migration Applied
Only **`20260809130000_commerce_schema.sql`** was pushed to the live remote database.

## Remote Tables Created
The following Phase 5D commerce tables are now live:
- `categories`
- `partners`
- `commerce_entities`
- `offers`
- `payment_methods`
- `affiliate_relationships`
- `tracking_events`
- `conversions`
- `commissions`

## RLS Verification
- `payment_methods` and `tracking_events` correctly scope access using the canonical `(auth.jwt()->>'sub') = user_id`.
- Internal affiliate tables (`affiliate_relationships`, `conversions`, `commissions`) remain blocked from direct public access.

## Existing Data Verification
All existing legacy V1 tables remain perfectly intact. No rows were deleted. No data was mutated.
- `users`, `cards`, `user_cards`, `transactions`, `credit_accounts`, `budgets`, `subscriptions`, `apply_clicks`, `score_history`.

## Build Result
`npm run build` completed successfully (1.25s). 

## Test Result
`npx vitest run` completed successfully (15/15 existing tests passed).

## Rollback Strategy
If the commerce architecture needs to be reverted, we can safely drop the 9 new commerce tables without impacting the legacy V1 production database in any way.

## Final Status
Phase 5D.1.4 is COMPLETE. The database is now ready for Phase 5D.2 (Commerce Data Seeding).
