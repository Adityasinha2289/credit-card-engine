# Supabase architecture review (October 2026)

Scope: `supabase/migrations/*`, `supabase/config.toml`, `src/lib/database.types.ts`, `remote_types.ts`, the client data layer (`dashboardStore`, `useDashboardQueries`, services) and the server functions in `api/` that use the service role.

Method: I read every migration. I then **executed them in order against a real Postgres (PGlite) with a Supabase-like `auth.jwt()` stub and `anon` / `authenticated` / `service_role` roles**. Run `npm run db:check` (script: `scripts/check-migrations.mjs`) to reproduce. Findings marked **[verified]** were reproduced that way; the rest come from reading the code.

---

## 1. Summary

The data model is basically sound. Supabase uses Clerk ids (TEXT) everywhere, and tables are owner-scoped through the JWT `sub` claim. Money is mostly in integer paise, and the important writes go through `SECURITY DEFINER` RPCs with `search_path` pinned. The problems are operational and in the details:

| # | Severity | Finding |
|---|---|---|
| 1 | **P0** | **Remote migration history is empty, and `001_initial_schema.sql` starts with `DROP TABLE … CASCADE`.** A plain `supabase db push` would re-run 001 and wipe production. |
| 2 | **P0** | **The profile allowlist trigger (0819) breaks the money RPCs [verified].** It fires whenever `request.jwt.claims` is set, and that is still true inside SECURITY DEFINER functions. `add_transaction_v1` therefore raises on any purchase of ₹100 or more (the reward-points update), and `redeem_points_v1` always raises. Webhook email updates are blocked too. |
| 3 | **P0** | **A client can mint reward points [verified].** The `users` INSERT policy plus the UPDATE-only allowlist lets a user create their own row with `total_reward_points = 999999` before the Clerk webhook runs. |
| 4 | P1 | **Four migrations cannot apply [verified].** `20260726000000_production_schema.sql` uses `//` comments (syntax error). `20260816000000`, `…010000` and `…020000` depend on `credit_cards_catalog`, which only that failed file creates. `20260901000000_planning_sessions.sql` declares `user_id UUID REFERENCES users(id)` against a TEXT key. So none of the financial-engine tables, the data-intelligence tables or `planning_sessions` exist in any environment built from these files. |
| 5 | P1 | **`pay_bill_v1` records a phantom payment when the balance is 0.** If `LEAST(amount, balance) <= 0` it falls back to the full amount. The client clamped to 0, so client and server disagreed. |
| 6 | P1 | **Card-ownership and idempotency checks were silently lost.** `add_transaction_v1` gained them in 0814130000, but 0820, 0822 and 0823 each redefine the function from an older copy without them. |
| 7 | P1 | **`transactions` has no "when it happened" column.** Month bucketing uses `created_at`, so an SMS from last month that is pasted today counts as this month. |
| 8 | P1 | **Subscriptions were unwritable from the client.** `subscriptions.card_id` is `NOT NULL REFERENCES user_cards(id)` (the wallet row UUID), but the client sent the catalog card id, so every insert hit an FK error. There is no `status` column, so "cancel" deleted the row. |
| 9 | P2 | **Three money conventions.** Most tables use INTEGER paise. `users.salary` is INTEGER annual rupees. Commerce and 20260726 tables use NUMERIC(12,2) rupees. A single INTEGER-paise transaction overflows at about ₹2.1 crore. |
| 10 | P2 | **Dates stored as TEXT** (`credit_accounts.due_date`, `next_statement_date`, `subscriptions.next_billing_date`). The client wrote card expiry (`"08/30"`) into `due_date`, and JS parses that as 30 Aug **2001**. |
| 11 | P2 | **RLS policies inline `auth.jwt()->>'sub'`** instead of a helper wrapped in `(select …)`, so Postgres evaluates it per row. There is no `requesting_user_id()`. |
| 12 | P2 | **`verification_audit_log` is world-readable** (`USING (true)`), including the reviewer identity column. |
| 13 | P2 | **Types are hand-written and stale.** `src/lib/database.types.ts` says it "mirrors 001". It has no Functions or Views, so every RPC is called `as any`. `remote_types.ts` lacks the onboarding columns, `processed_webhook_events`, `planning_sessions` and all functions. |
| 14 | P2 | **There is no scheduler.** No `pg_cron` or `pg_net`, no `supabase/functions/`, no Vercel `crons`. Reminders cannot be sent server-side. |
| 15 | P3 | **Supabase's native Clerk integration is disabled** (`[auth.third_party.clerk] enabled = false`). The client uses the deprecated Clerk JWT template (`getToken({ template: 'supabase' })`) on every request. |

The P0/P1 items are fixed by the three new migrations described in §5. P2/P3 are the target-architecture work in §6.

---

## 2. What is actually deployed?

Nobody can say for certain from the repo. `docs/phase5d/remote_schema_reconciliation.md` and `remote_types.ts` suggest the live project has the 001/002 tables, the commerce tables and the onboarding columns that 0814150000/0817 add. They also suggest it has **no RPCs** and an **empty `supabase_migrations.schema_migrations`**. The client is written defensively for exactly that case: it tries the RPC, and if PostgREST reports the function missing (`PGRST202`) it falls back to direct writes.

Run this read-only SQL in the Supabase SQL editor before applying anything:

```sql
-- What migration history does the CLI think exists?
select version, name from supabase_migrations.schema_migrations order by version;

-- Which of our tables exist?
select table_name from information_schema.tables
 where table_schema = 'public' order by 1;

-- Which RPCs exist?
select p.proname, pg_get_function_identity_arguments(p.oid) args, p.prosecdef as security_definer
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname like any (array['%_v1','%_v2','requesting_user_id'])
 order by 1;

-- Column types that matter for the client
select table_name, column_name, data_type, is_nullable
  from information_schema.columns
 where table_schema = 'public'
   and table_name in ('users','transactions','credit_accounts','subscriptions','budgets')
 order by table_name, ordinal_position;

-- RLS status and policies
select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
select tablename, policyname, cmd, qual, with_check from pg_policies where schemaname = 'public' order by 1, 2;

-- Triggers on users (allowlist / insert guard)
select tgname, pg_get_triggerdef(oid) from pg_trigger where tgrelid = 'public.users'::regclass and not tgisinternal;
```

---

## 3. Inventory

### 3.1 Tables

All user-owned tables key on Clerk's TEXT id and are scoped by `user_id = auth.jwt()->>'sub'`.

| Table | Created in | Purpose | Money / dates | RLS |
|---|---|---|---|---|
| `users` | 001 (+002, 0814150000, 0817) | Profile and reward totals | `salary` INTEGER **annual ₹**; points INTEGER | own select/insert/update; allowlist trigger on UPDATE |
| `cards` | 001 / 003 / 004 | Card catalog (seed) | fee/income INTEGER ₹ | public read |
| `user_cards` | 001 | Wallet; UNIQUE(user_id, card_id) | `credit_limit` INTEGER paise | own, FOR ALL |
| `transactions` | 001 | Ledger | `amount` INTEGER paise, signed | own, FOR ALL |
| `credit_accounts` | 002 | Live balances per wallet card | paise; `due_date`, `next_statement_date` **TEXT** | own |
| `budgets` | 002 | Category limits; UNIQUE(user_id, category) | paise | own |
| `subscriptions` | 002 | Recurring payments | paise; `next_billing_date` TEXT; `card_id` NOT NULL → `user_cards(id)` | own |
| `apply_clicks`, `score_history`, `notifications` | 001 | Affiliate clicks, CIBIL history, in-app notices | — | own |
| `categories`, `partners`, `commerce_entities`, `marketplace_partner_mappings` | 0809 / 0812 | Commerce catalog | NUMERIC ₹ | public read |
| `offers` | 0809 | Offer catalog | NUMERIC ₹ | no policies; exposed via `public_offers_view` (owner rights) |
| `payment_methods`, `tracking_events` | 0809 | User instruments, click tracking | — | own |
| `affiliate_relationships`, `conversions`, `commissions` | 0809 | Server-side attribution | NUMERIC ₹ | RLS on, no policies (service role only) |
| `processed_webhook_events` | 0814140000 | Svix idempotency | — | RLS on, no policies |
| financial-engine, `card_eligibility_rules`, `source_snapshots`, `verification_audit_log` | 0816* | Rules engine and data provenance | — | **never created** (depends on failed 20260726) |
| `planning_sessions` | 0901 | Trip/date planner drafts | — | **never created** (UUID vs TEXT FK) |

`20260726000000_production_schema.sql` describes a second, incompatible model: `profiles`, UUID keys, NUMERIC rupees, `category_budgets`, a second `subscriptions`/`notifications` design and `domain_events` without RLS. It can't parse, so it has never run. It should be **archived, not fixed** (see §6). If it ever were applied, `view_user_financial_overview` lacks `security_invoker` and would expose every user's finances to `anon`.

### 3.2 RPCs (final definitions)

| Function | Definer? | `search_path` | Auth | Notes |
|---|---|---|---|---|
| `add_transaction_v1` | yes | pinned | fail-closed `sub = p_user_id` (0822) | ownership and idempotency lost after 0814130000; amount must be > 0, so refunds are impossible |
| `pay_bill_v1` | yes | pinned | fail-closed | `FOR UPDATE` lock (0821); phantom payment at zero balance |
| `add_user_card_v1` | yes | pinned | fail-closed | returns `{ user_card_id }` |
| `redeem_points_v1` | yes | pinned | JWT | blocked by the allowlist trigger |
| `save_planning_session_v1` | invoker | — | trusts `p_user_id` | never created |
| `update_updated_at`, `enforce_profile_allowlist` | trigger | not pinned | — | — |

### 3.3 Server-side keys

The service-role key is used only in `api/clerk-webhook.ts`, `api/send-email.ts`, `api/admin/_utils/supabaseAdmin.ts` and the new `api/reminders.ts`. It never reaches the browser. The admin API checks Clerk `publicMetadata.role`. `src/features/data-import/reconciliation/*` creates anon clients and is only used by the import scripts.

---

## 4. Findings in detail

### 4.1 `db push` would wipe production (P0)
`supabase/migrations/001_initial_schema.sql:7-13` drops `users`, `cards`, `user_cards` and `transactions` with CASCADE. The project's migration history is empty, so the CLI treats every file as pending. **Never run `db push` before `migration repair`** (§7).

### 4.2 Allowlist trigger vs SECURITY DEFINER (P0) [verified]
`enforce_profile_allowlist` guards with `current_setting('request.jwt.claims', true) IS NOT NULL AND auth.jwt() IS NOT NULL`. Inside `add_transaction_v1`, the `UPDATE users SET total_reward_points = …` still sees the caller's claims, so the trigger raises. Reproduced on the unmodified schema:

```
v1 txn ₹50:   success (0 points, no users update)
v1 txn ₹500:  ERROR: Transaction failed: Unauthorized profile fields modified…
redeem 10:    ERROR: Unauthorized profile fields modified…
```

**Fix:** check `current_user`. It is `authenticated`/`anon` for PostgREST user requests, the function owner inside SECURITY DEFINER code, and `service_role` for the server.

### 4.3 Reward-point minting via INSERT (P0) [verified]
`INSERT INTO users (id, email, total_reward_points) VALUES ('<own sub>', …, 999999)` succeeds. **Fix:** a BEFORE INSERT trigger zeroes point columns for end-user roles.

### 4.4 Lost RPC hardening (P1)
0814130000 added card-ownership verification and an idempotency check to `add_transaction_v1`. 0820, 0822 and 0823 each `CREATE OR REPLACE` the function from an earlier text, so the final version has neither. **Fix:** `add_transaction_v2` takes identity from the JWT (no `p_user_id`), checks ownership, is idempotent on `p_id`, normalises the sign for refunds and credits, honours `p_date` and returns server-computed points.

### 4.5 Subscriptions and dates (P1/P2)
The client sent the catalog id into `subscriptions.card_id` (an FK to `user_cards.id`), and the column is `NOT NULL`, so UPI-paid subscriptions could not exist at all. Due and billing dates were free text. **Fix:** a nullable FK with `ON DELETE SET NULL`, a `status` CHECK, typed `next_billing_on DATE`, and `credit_accounts.due_date` converted to DATE (junk cleared first).

### 4.6 RLS evaluation cost (P2)
Policies of the form `USING ((auth.jwt()->>'sub') = user_id)` re-evaluate the JWT function per row. Supabase's guidance is to wrap the call, e.g. `(select requesting_user_id())`, so it becomes an init-plan evaluated once. The new tables and the rewritten `subscriptions`/`planning_sessions` policies do this. The remaining legacy policies should be migrated the same way (§6).

### 4.7 Indexes
Present: `transactions(user_id, created_at desc)` and `transactions(user_id, card_id)`, and `user_id` indexes on wallet, budgets, subscriptions and credit_accounts.

Added:
- `transactions(user_id, txn_date desc)`
- partial `credit_accounts(due_date)`
- partial `subscriptions(next_billing_on) WHERE status = 'active'` (the reminder scan)
- FK indexes on `tracking_events(partner_id, offer_id, user_id)`, `conversions(tracking_event_id)`, `commissions(conversion_id)`, `commerce_entities(category_id, partner_id)` and `categories(parent_id)`

---

## 5. What this branch adds (all idempotent, no data dropped)

| Migration | Contents |
|---|---|
| `20261016000000_security_and_identity.sql` | `requesting_user_id()`; allowlist trigger restricted to end-user roles (adds `age_band`, `cibil_band`); INSERT guard on reward points; onboarding columns, and backfill of `onboarding_completed` for users who already saved a salary; `verification_audit_log` made private; `planning_sessions` created/repaired with TEXT `user_id`, `sub`-based policy and a JWT-checked `save_planning_session_v1` |
| `20261016010000_money_integrity.sql` | `transactions.txn_date` (backfilled from `created_at` in IST) and `reward_points`; DATE `credit_accounts.due_date`/`next_statement_date`; `add_transaction_v2`; `pay_bill_v1` that refuses zero balances; `savings_goals` (BIGINT paise, RLS); FK and date indexes |
| `20261016020000_subscriptions_reminders.sql` | `subscriptions` extended: nullable FK (`ON DELETE SET NULL`), `status`, `next_billing_on`, trial / price-hike fields, `reminder_days`, `source`, `cancel_url`, CHECKs, partial due index, `(select …)` policy. New tables: `notification_preferences`, `push_subscriptions` (server-written) and `reminder_deliveries` (UNIQUE claim per subscription/kind/date/lead/channel, so a send happens at most once) |

`npm run db:check` applies every legacy migration (recording which fail, as production would), then the three new files twice (idempotency), then asserts **32 behaviours**: RLS isolation, point minting blocked, the allowlist still enforced for clients, v1/v2/redeem/pay-bill semantics, subscription constraints, ledger idempotency and planning-session RLS. All pass.

The client (`dashboardStore`) works **before and after** these are applied:
- it tries `add_transaction_v2`, then `add_transaction_v1`, then a direct insert;
- writes that use new columns retry without them on `PGRST204`;
- a real RPC error is shown to the user and the optimistic update is rolled back, instead of being silently written through a fallback.

---

## 6. Target architecture

1. **One schema lineage.** Treat 001/002 + 0809/0812/0814*/0817–0823 + 20261016* as canonical. Move `20260726000000_production_schema.sql` and the three `20260816*` files to `supabase/migrations_archive/` (they have never applied anywhere). If the financial-engine tables are wanted, re-introduce them in a new migration that references `cards(id)`.
2. **Squash to a baseline** once production is repaired: `supabase db dump --schema-only > supabase/migrations/<ts>_baseline.sql`, archive the history, and keep 001's destructive header out of the active path for good.
3. **Identity:** enable Supabase's native Clerk third-party auth (`[auth.third_party.clerk]`), drop the `supabase` JWT template, and use `requesting_user_id()` in every policy, wrapped in `(select …)`. In the client, pass Clerk's session token via `accessToken` in `createClient` instead of rebuilding the client when `getToken` changes.
4. **Money:** BIGINT paise everywhere (`transactions.amount`, limits, balances) and `users.monthly_income_paise` instead of annual rupees. Commerce tables can stay NUMERIC rupees (catalog, not ledger) with the unit stated in column comments.
5. **Dates:** DATE for calendar facts (`txn_date`, `due_date`, `next_billing_on`) and TIMESTAMPTZ for events. Drop `subscriptions.next_billing_date` (TEXT) after a release in which nothing writes it.
6. **Writes go through RPCs.** Once v2 is deployed everywhere, revoke direct INSERT/UPDATE on `transactions` and `credit_accounts` from `authenticated`, leaving only SELECT, so balances can only change atomically.
7. **Types:** `supabase gen types typescript --linked > src/lib/database.types.ts` in CI; delete `remote_types.ts`; remove the `as any` RPC casts.
8. **Scheduling:** the reminder job runs as a Vercel cron (`api/reminders.ts`, daily 09:00 IST) using the service role. If the Vercel function limit becomes a problem, move it to a Supabase Edge Function triggered by `pg_cron`. The idempotency ledger already supports either.
9. **Observability:** turn on `pg_stat_statements`; add a weekly check that RLS is enabled on every `public` table (`select tablename from pg_tables where schemaname = 'public' and not rowsecurity`).

---

## 7. Apply runbook (production)

1. **Back up first:** Dashboard → Database → Backups (or `supabase db dump -f backup.sql --linked`).
2. Run the introspection SQL in §2 and keep the output.
3. Mark every existing file as already applied, so the CLI will **not** run 001's `DROP TABLE`:
   ```bash
   supabase link --project-ref <ref>
   for v in 001 002 003 004 20260726000000 20260809130000 20260812 20260814120000 \
            20260814130000 20260814140000 20260814150000 20260816000000 20260816010000 \
            20260816020000 20260817000000 20260818000000 20260819000000 20260820000000 \
            20260821000000 20260822000000 20260823000000 20260901000000; do
     supabase migration repair --status applied "$v"
   done
   supabase migration list   # every pre-20261016 version must show as applied remotely
   ```
4. `supabase db push --dry-run` must list **only** the three `20261016*` files. Then run `supabase db push`.
5. Re-run the §2 queries. Confirm that `requesting_user_id`, `add_transaction_v2` and the new tables exist, and that RLS is on.
6. Regenerate types (§6.7).

Rollback: the migrations only add things (columns, tables, functions, triggers, policies), except for converting the two `credit_accounts` date columns from TEXT to DATE. Clearing junk values in those columns is the only data change. Keep the backup from step 1.
