# RENO CRED 2.0 — REMOTE SCHEMA RECONCILIATION

## 1. Remote database identity
The Supabase CLI is successfully authenticated and linked to the remote project `beruzoibiamgxyqpmmox`.

## 2. Migration history state
`npx supabase migration list` reveals that the remote `supabase_migrations.schema_migrations` tracking table is completely empty (all local migrations show as `blank` remotely). 
**Why?** The evidence suggests the remote database was created and its schema applied manually via the Supabase Dashboard SQL Editor (or prior to setting up migration tracking). The `001_initial_schema.sql` script actually contains a comment: `Run this in: Supabase Dashboard → SQL Editor`, strongly supporting this. 

## 3. Existing remote tables
By generating the remote TypeScript types (`npx supabase gen types typescript --linked`), I safely inspected the actual remote schema.
The remote database contains:
`apply_clicks`, `budgets`, `cards`, `credit_accounts`, `merchants`, `notifications`, `score_history`, `subscriptions`, `transactions`, `user_cards`, `users`.

## 4. Existing production schema comparison
The remote database **differs massively** from `20260726000000_production_schema.sql`:
- **MISSING:** `profiles`, `credit_cards_catalog`, `category_budgets`, `merchant_offers`, `financial_ledger`, `financial_health_scores`, `knowledge_rules`, `knowledge_articles`, etc.
- **DIFFERENT:** The remote database uses `users(id)` for Clerk authentication, while the `20260726000000` schema uses `profiles(id)`. The remote database uses `cards(id)`, while the `20260726000000` schema uses `credit_cards_catalog(id)`.
- **STATUS:** `20260726000000_production_schema.sql` was **never** deployed to this remote project. The remote database is still running on the V1 schema defined by `001` and `002`.

## 5. Commerce table comparison
None of the Phase 5D commerce tables (`categories`, `partners`, `commerce_entities`, `offers`, `payment_methods`, `affiliate_relationships`, `tracking_events`, `conversions`, `commissions`) exist remotely. They are completely absent.

## 6. RLS comparison
Remote RLS is active on existing tables (`users`, `user_cards`, `transactions`, `cards`) following the legacy definitions from `001_initial_schema.sql`.

## 7. Index comparison
Indexes match the `001` and `002` definitions, but not the `20260726000000` definitions.

## 8. Foreign-key comparison
All remote user-related foreign keys currently point to `users(id)`.

## 9. Differences discovered
The most critical difference is the User Identity Table. Our new commerce schema (`20260809130000_commerce_schema.sql`) was explicitly designed to reference `profiles(id)` because we assumed `20260726000000_production_schema.sql` was live. Since the remote database actually uses `users(id)`, pushing our commerce migration right now would throw a **fatal foreign key error** (`relation "profiles" does not exist`).

## 10. Risk assessment
This is exactly **Scenario C**: Remote database partially differs from local production schema. 
If we run `npx supabase db push`, Supabase will attempt to apply `001`, `002`, `003`, `004`, `20260726...` and `20260809...` sequentially because the remote tracking table is blank. 
- Applying `001`/`002` will execute `DROP TABLE IF EXISTS ... CASCADE;` on the live database! **(CATASTROPHIC DATA LOSS)**
- Applying `20260726` will create completely disconnected tables.
- Applying `20260809` will fail because it targets `profiles`, not `users`.

## 11. Recommended migration strategy
We must establish a safe baseline before deploying the commerce schema.

1. **Do NOT run `db push`!** It will trigger catastrophic data loss by executing the `DROP` statements in `001_initial_schema.sql`.
2. We must **baseline** the remote migration history to tell Supabase that `001`, `002`, `003`, and `004` are already applied:
   `npx supabase migration repair --status applied 001 002 003 004` (Do not run this until approved).
3. We need to decide the fate of `20260726000000_production_schema.sql`. If we don't want it remotely, we should delete or ignore it.
4. We must refactor `20260809130000_commerce_schema.sql` to reference `users(id)` instead of `profiles(id)` so it aligns with the actual remote reality.

## 12. Exact next command
To prevent destruction, we must first repair the migration history for the manually applied migrations:
```bash
npx supabase migration repair --status applied 001 002 003 004
```
*(Wait for architectural approval on how to handle `20260726000000_production_schema.sql` before running this)*
