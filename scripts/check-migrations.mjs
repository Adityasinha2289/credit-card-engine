// Applies supabase/migrations to an in-memory Postgres (PGlite) with a
// Supabase-like auth stub (roles + auth.jwt()), then asserts RLS / RPC behaviour.
// Usage: npm run db:check   (no Docker or Supabase project needed)
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = process.argv[2] ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(repo, 'supabase', 'migrations');
const db = new PGlite();

const results = [];
const ok = (name, cond, extra = '') => { results.push([cond ? 'PASS' : 'FAIL', name, extra]); };

// Supabase-like environment: roles, auth.jwt(), default privileges for API roles.
await db.exec(`
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
    $$ SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb $$;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
`);

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
for (const f of files) {
  try {
    await db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
    ok(`apply ${f}`, true);
  } catch (e) {
    ok(`apply ${f}`, false, e.message.split('\n')[0]);
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
async function as(role, sub, fn) {
  await db.exec(`SET ROLE ${role}`);
  await db.query(`SELECT set_config('request.jwt.claims', $1, false)`, [sub ? JSON.stringify({ sub, role }) : '']);
  try { return await fn(); } finally { await db.exec('RESET ROLE'); await db.query(`SELECT set_config('request.jwt.claims', '', false)`); }
}
async function tryQ(sql, params) {
  try { return { rows: (await db.query(sql, params)).rows }; } catch (e) { return { error: e.message.split('\n')[0] }; }
}

if (results.some(([s]) => s === 'FAIL')) {
  for (const [s, n, e] of results) console.log(`  ${s} ${n}${e ? `  → ${e}` : ''}`);
  process.exit(1);
}

// ── catalog ──────────────────────────────────────────────────────────────────
let r = await db.query(`SELECT count(*)::int AS n FROM cards`);
ok('card catalog seeded from the app dataset', r.rows[0].n >= 100, String(r.rows[0].n));
const card = (await db.query(`SELECT id FROM cards ORDER BY id LIMIT 1`)).rows[0].id;
r = await as('anon', null, () => tryQ(`SELECT count(*)::int AS n FROM cards`));
ok('catalog readable by anon', r.rows?.[0]?.n > 0, r.error ?? '');

// ── users ────────────────────────────────────────────────────────────────────
await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO users (id, email, name, total_reward_points) VALUES ('user_a','a@x.com','A', 999999)`));
r = await db.query(`SELECT total_reward_points::int AS p FROM users WHERE id='user_a'`);
ok('client INSERT cannot set reward points', r.rows[0]?.p === 0, JSON.stringify(r.rows));
await as('authenticated', 'user_b', () => tryQ(`INSERT INTO users (id, email, name) VALUES ('user_b','b@x.com','B')`));

r = await as('authenticated', 'user_a', () => tryQ(`UPDATE users SET total_reward_points = 5000 WHERE id='user_a'`));
ok('client UPDATE of reward points rejected', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`UPDATE users SET salary = 1200000, onboarding_completed = true, age_band = '25-34' WHERE id='user_a'`));
ok('client UPDATE of profile fields ok', !r.error, r.error ?? '');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM users`));
ok('RLS: users see only themselves', r.rows?.[0]?.n === 1, JSON.stringify(r.rows ?? r.error));
r = await as('authenticated', 'user_a', () => tryQ(`INSERT INTO users (id, email) VALUES ('someone_else','x@y.z')`));
ok('RLS: cannot create another user', !!r.error, r.error ?? 'no error');

// ── wallet + RPCs ────────────────────────────────────────────────────────────
r = await as('authenticated', 'user_a', () => tryQ(`SELECT add_user_card_v1('user_a', $1, '1234', 'A', '12/30', 10000000) AS res`, [card]));
ok('add_user_card_v1', r.rows?.[0]?.res?.status === 'success', r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(`SELECT add_user_card_v1('user_a', $1, '1234', 'A', '12/30', 10000000) AS res`, [card]));
ok('add_user_card_v1 is idempotent', r.rows?.[0]?.res?.status === 'already_exists', r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(`SELECT add_user_card_v1('user_a', 'not_a_card', '1234', 'A', '12/30', 0) AS res`));
ok('add_user_card_v1 rejects unknown catalog ids', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`SELECT add_user_card_v1('user_b', $1, '1234', 'A', '12/30', 0) AS res`, [card]));
ok('add_user_card_v1 ignores a spoofed p_user_id', !!r.error, r.error ?? 'no error');

r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t2',$1,'Amazon',250000,'shopping','debit',false,'2026-10-01') AS res`, [card]));
ok('add_transaction_v2 purchase + points', !r.error && r.rows[0].res.points === 25, r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t2',$1,'Amazon',250000,'shopping','debit',false,'2026-10-01') AS res`, [card]));
ok('add_transaction_v2 idempotent retry', r.rows?.[0]?.res?.status === 'already_exists', r.error ?? '');
r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t3',$1,'Myntra',49900,'shopping','refund',false,NULL) AS res`, [card]));
ok('add_transaction_v2 refund', !r.error, r.error ?? '');
r = await db.query(`SELECT amount::int, txn_date::text FROM transactions WHERE id IN ('t2','t3') ORDER BY id`);
ok('refund stored negative, txn_date honoured', r.rows[1]?.amount === -49900 && r.rows[0]?.txn_date === '2026-10-01', JSON.stringify(r.rows));
r = await as('authenticated', 'user_b', () => tryQ(`SELECT add_transaction_v2('t4',$1,'X',1000,'other','debit',false,NULL) AS res`, [card]));
ok('add_transaction_v2 rejects a card the user does not own', !!r.error, r.error ?? 'no error');
r = await as('anon', null, () => tryQ(`SELECT add_transaction_v2('t5',NULL,'X',1000,'other','debit',false,NULL)`));
ok('RPCs not callable by anon', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`INSERT INTO transactions (id,user_id,merchant,amount,type) VALUES ('bad','user_a','X',-100,'debit')`));
ok('ledger sign must match type', !!r.error, r.error ?? 'no error');

r = await db.query(`SELECT total_reward_points::int AS p FROM users WHERE id='user_a'`);
ok('server-side points accrued', r.rows[0].p === 25, JSON.stringify(r.rows));
r = await db.query(`SELECT current_balance::bigint AS b FROM credit_accounts WHERE user_id='user_a'`);
const bal = Number(r.rows[0]?.b);
ok('balance = 2500 - 499 rupees', bal === 250000 - 49900, String(bal));

r = await as('authenticated', 'user_a', () => tryQ(`SELECT pay_bill_v1('user_a',$1, 999999999) AS res`, [card]));
ok('pay_bill_v1 clamps to balance', Number(r.rows?.[0]?.res?.payment_amount) === bal, r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(`SELECT pay_bill_v1('user_a',$1, 1000) AS res`, [card]));
ok('pay_bill_v1 refuses a zero balance', !!r.error && r.error.includes('NOTHING_TO_PAY'), r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`SELECT redeem_points_v1(10) AS res`));
ok('redeem_points_v1 works', !r.error, r.error ?? '');
r = await as('authenticated', 'user_a', () => tryQ(`SELECT redeem_points_v1(1000) AS res`));
ok('redeem_points_v1 refuses overdraw', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`UPDATE credit_accounts SET due_date = '2026-10-25' WHERE user_id='user_a' RETURNING due_date::text`));
ok('credit_accounts.due_date is a DATE', r.rows?.[0]?.due_date === '2026-10-25', r.error ?? JSON.stringify(r.rows));

// ── subscriptions / reminders ────────────────────────────────────────────────
r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, card_id, name, amount, billing_cycle, next_billing_on, status, reminder_days)
   VALUES ('s1','user_a',NULL,'Netflix',64900,'monthly','2026-10-20','active','{3,1}') RETURNING id`));
ok('subscription without a card (UPI)', !r.error, r.error ?? '');
r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, name, amount, billing_cycle, next_billing_on, status) VALUES ('s2','user_a','Bad',100,'monthly','2026-10-20','deleted')`));
ok('subscription status constrained', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM subscriptions`));
ok('RLS: subscriptions isolated', r.rows?.[0]?.n === 0, r.error ?? JSON.stringify(r.rows));
r = await as('authenticated', 'user_b', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, name, amount, next_billing_on) VALUES ('s3','user_a','Spoof',100,'2026-10-20')`));
ok('RLS: cannot insert for another user', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ('user_a','https://e','k','a')`));
ok('push subscriptions are server-written only', !!r.error, r.error ?? 'no error');

await db.exec(`SET ROLE service_role`);
r = await tryQ(`INSERT INTO reminder_deliveries (user_id, subscription_id, kind, due_on, lead_days, channel)
                VALUES ('user_a','s1','renewal','2026-10-20',3,'email') ON CONFLICT DO NOTHING RETURNING id`);
const first = r.rows?.length;
r = await tryQ(`INSERT INTO reminder_deliveries (user_id, subscription_id, kind, due_on, lead_days, channel)
                VALUES ('user_a','s1','renewal','2026-10-20',3,'email') ON CONFLICT DO NOTHING RETURNING id`);
await db.exec('RESET ROLE');
ok('reminder claim is idempotent', first === 1 && r.rows?.length === 0, JSON.stringify({ first, second: r.rows?.length, err: r.error }));

r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO savings_goals (user_id, name, target_amount, monthly_contribution) VALUES ('user_a','Goa',2500000,500000) RETURNING id`));
ok('savings goal insert', !r.error, r.error ?? '');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM savings_goals`));
ok('RLS: savings goals isolated', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));

r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT save_planning_session_v1('00000000-0000-0000-0000-000000000001'::uuid,'user_a','date','draft',1,'{}'::jsonb,NULL,0) AS res`));
ok('planning session save with Clerk id', !r.error, r.error ?? '');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM planning_sessions`));
ok('RLS: planning sessions isolated', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));

// ── commerce ─────────────────────────────────────────────────────────────────
await db.exec(`
  INSERT INTO categories (id, slug, name, status) VALUES
    ('10000000-0000-0000-0000-000000000001','food','Food','active'),
    ('10000000-0000-0000-0000-000000000002','old','Old','inactive');
  INSERT INTO partners (id, slug, name) VALUES ('20000000-0000-0000-0000-000000000001','acme','Acme');
  INSERT INTO offers (source, offer_type, value, title, valid_until, internal_campaign_metadata)
    VALUES ('merchant','cashback',10,'10% off', now() + interval '7 days', '{"secret":"margin"}');
`);
r = await as('anon', null, () => tryQ(`SELECT count(*)::int AS n FROM offers`));
ok('offers table not directly readable by clients', !!r.error || r.rows?.[0]?.n === 0, r.error ?? JSON.stringify(r.rows));
r = await as('anon', null, () => tryQ(`SELECT * FROM public_offers_view`));
ok('public_offers_view exposes live offers without internal metadata',
  r.rows?.length === 1 && !('internal_campaign_metadata' in r.rows[0]), r.error ?? JSON.stringify(r.rows));
r = await as('anon', null, () => tryQ(`SELECT slug FROM categories`));
ok('inactive categories hidden from clients', r.rows?.length === 1 && r.rows[0].slug === 'food', r.error ?? JSON.stringify(r.rows));
r = await tryQ(`INSERT INTO offers (source, offer_type, value, title, valid_until) VALUES ('merchant','percentage_discount',150,'bad', now() + interval '1 day')`);
ok('percentage offers capped at 100', !!r.error, r.error ?? 'no error');
r = await tryQ(`INSERT INTO affiliate_relationships (partner_id, network, tracking_template_url, commission_model) VALUES
  ('20000000-0000-0000-0000-000000000001','net','https://t/{{CLICK_ID}}','cps'),
  ('20000000-0000-0000-0000-000000000001','net2','https://u/{{CLICK_ID}}','cps')`);
ok('one active affiliate relationship per partner', !!r.error, r.error ?? 'no error');
r = await tryQ(`INSERT INTO affiliate_relationships (partner_id, network, tracking_template_url, commission_model) VALUES
  ('20000000-0000-0000-0000-000000000001','net','javascript:alert(1)','cps')`);
ok('affiliate tracking URLs must be https', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`SELECT count(*)::int AS n FROM affiliate_relationships`));
ok('affiliate relationships are server-only', !!r.error || r.rows?.[0]?.n === 0, r.error ?? JSON.stringify(r.rows));

// ── erasure (Clerk user.deleted) ─────────────────────────────────────────────
await db.exec(`
  INSERT INTO tracking_events (id, user_id, partner_id, source_placement) VALUES ('30000000-0000-0000-0000-000000000001','user_a','20000000-0000-0000-0000-000000000001','home');
  INSERT INTO conversions (tracking_event_id, partner_id, external_transaction_id, order_value, converted_at)
    VALUES ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','ext-1',999, now());
`);
r = await tryQ(`DELETE FROM users WHERE id = 'user_a'`);
ok('deleting a user succeeds even with affiliate history', !r.error, r.error ?? '');
const left = (await db.query(`SELECT
  (SELECT count(*) FROM transactions WHERE user_id='user_a')::int AS t,
  (SELECT count(*) FROM user_cards WHERE user_id='user_a')::int AS c,
  (SELECT count(*) FROM subscriptions WHERE user_id='user_a')::int AS s,
  (SELECT count(*) FROM tracking_events WHERE user_id='user_a')::int AS te,
  (SELECT count(*) FROM conversions)::int AS conv`)).rows[0];
ok('user erasure removes personal rows, keeps anonymised conversions',
  left.t === 0 && left.c === 0 && left.s === 0 && left.te === 0 && left.conv === 1, JSON.stringify(left));

// ── every public table has RLS ───────────────────────────────────────────────
r = await db.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity`);
ok('RLS enabled on every public table', r.rows.length === 0, JSON.stringify(r.rows));

console.log('\n== results');
for (const [s, n, e] of results) console.log(`  ${s} ${n}${e && s === 'FAIL' ? `  → ${e}` : ''}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
