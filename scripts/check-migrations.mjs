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

await db.exec(`
  CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
    $$ SELECT NULLIF(current_setting('request.jwt.claims', true), '')::jsonb $$;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
    $$ SELECT NULLIF(auth.jwt()->>'sub','')::uuid $$;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
`);

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const mine = files.filter((f) => f.startsWith('20261016'));
const legacy = files.filter((f) => !f.startsWith('20261016'));

async function apply(f) {
  const sql = fs.readFileSync(path.join(dir, f), 'utf8');
  try {
    await db.exec(sql);
    return null;
  } catch (e) {
    return e.message.split('\n')[0];
  }
}

console.log('== legacy migrations (simulating whatever subset succeeds remotely)');
for (const f of legacy) {
  // Wrap each legacy file in its own transaction so a failure leaves no partial state.
  await db.exec('BEGIN');
  const err = await apply(f);
  await db.exec(err ? 'ROLLBACK' : 'COMMIT');
  console.log(err ? `  FAIL ${f}: ${err}` : `  ok   ${f}`);
}

await db.exec(`
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
`);

console.log('== new migrations (pass 1)');
for (const f of mine) {
  const err = await apply(f);
  ok(`apply ${f}`, !err, err ?? '');
}
await db.exec(`
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
`);
console.log('== new migrations (pass 2: idempotency)');
for (const f of mine) {
  const err = await apply(f);
  ok(`re-apply ${f}`, !err, err ?? '');
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

// seed a catalog card as owner
const card = (await db.query(`SELECT id FROM cards LIMIT 1`)).rows[0]?.id
  ?? (await db.query(`INSERT INTO cards (id, name, bank, network) VALUES ('test_card','Test','Bank','Visa') RETURNING id`)).rows[0].id;

// 1. user insert cannot mint points
await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO users (id, email, name, total_reward_points) VALUES ('user_a','a@x.com','A', 999999)`));
let r = await db.query(`SELECT total_reward_points FROM users WHERE id='user_a'`);
ok('client INSERT cannot set reward points', r.rows[0]?.total_reward_points === 0, JSON.stringify(r.rows));

await as('authenticated', 'user_b', () => tryQ(`INSERT INTO users (id, email, name) VALUES ('user_b','b@x.com','B')`));

// 2. client UPDATE of points is rejected, allowed fields pass
r = await as('authenticated', 'user_a', () => tryQ(`UPDATE users SET total_reward_points = 5000 WHERE id='user_a'`));
ok('client UPDATE of reward points rejected', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_a', () => tryQ(`UPDATE users SET salary = 1200000, onboarding_completed = true, age_band = '25-34' WHERE id='user_a'`));
ok('client UPDATE of allowlisted fields ok', !r.error, r.error ?? '');

// 3. wallet + RPCs
r = await as('authenticated', 'user_a', () => tryQ(`SELECT add_user_card_v1('user_a', $1, '1234', 'A', '12/30', 10000000) AS res`, [card]));
ok('add_user_card_v1', !r.error, r.error ?? JSON.stringify(r.rows?.[0]));

r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v1('t1','user_a',$1,'Zomato',50000,'dining','debit',false) AS res`, [card]));
ok('add_transaction_v1 >= Rs100 no longer blocked by allowlist trigger', !r.error, r.error ?? JSON.stringify(r.rows?.[0]?.res));

r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t2',$1,'Amazon',250000,'shopping','debit',false,'2026-10-01') AS res`, [card]));
ok('add_transaction_v2 purchase', !r.error && r.rows[0].res.points === 25, r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t2',$1,'Amazon',250000,'shopping','debit',false,'2026-10-01') AS res`, [card]));
ok('add_transaction_v2 idempotent retry', r.rows?.[0]?.res?.status === 'already_exists', r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT add_transaction_v2('t3',$1,'Myntra',49900,'shopping','refund',false,NULL) AS res`, [card]));
ok('add_transaction_v2 refund accepted', !r.error, r.error ?? '');
r = await db.query(`SELECT amount, txn_date::text FROM transactions WHERE id IN ('t2','t3') ORDER BY id`);
ok('refund stored negative, txn_date honoured', r.rows[1]?.amount === -49900 && r.rows[0]?.txn_date === '2026-10-01', JSON.stringify(r.rows));
r = await as('authenticated', 'user_b', () => tryQ(
  `SELECT add_transaction_v2('t4',$1,'X',1000,'other','debit',false,NULL) AS res`, [card]));
ok('add_transaction_v2 rejects a card the user does not own', !!r.error, r.error ?? 'no error');
r = await as('anon', null, () => tryQ(`SELECT add_transaction_v2('t5',NULL,'X',1000,'other','debit',false,NULL)`));
ok('add_transaction_v2 not callable by anon', !!r.error, r.error ?? 'no error');

r = await db.query(`SELECT total_reward_points FROM users WHERE id='user_a'`);
ok('server-side points accrued', r.rows[0].total_reward_points === 30, JSON.stringify(r.rows));

r = await db.query(`SELECT current_balance FROM credit_accounts WHERE user_id='user_a'`);
const bal = r.rows[0]?.current_balance;
ok('balance = 500 + 2500 - 499 rupees', bal === 50000 + 250000 - 49900, String(bal));

r = await as('authenticated', 'user_a', () => tryQ(`SELECT pay_bill_v1('user_a',$1, 999999999) AS res`, [card]));
ok('pay_bill_v1 clamps to balance', r.rows?.[0]?.res?.payment_amount === bal, r.error ?? JSON.stringify(r.rows?.[0]?.res));
r = await as('authenticated', 'user_a', () => tryQ(`SELECT pay_bill_v1('user_a',$1, 1000) AS res`, [card]));
ok('pay_bill_v1 refuses zero balance (no phantom payment)', !!r.error && r.error.includes('NOTHING_TO_PAY'), r.error ?? 'no error');

r = await as('authenticated', 'user_a', () => tryQ(`SELECT redeem_points_v1(10) AS res`));
ok('redeem_points_v1 works (was always blocked by allowlist trigger)', !r.error, r.error ?? JSON.stringify(r.rows?.[0]));

// 4. credit account due date is a DATE now
r = await as('authenticated', 'user_a', () => tryQ(`UPDATE credit_accounts SET due_date = '2026-10-25' WHERE user_id='user_a' RETURNING due_date::text`));
ok('credit_accounts.due_date accepts ISO date', r.rows?.[0]?.due_date === '2026-10-25', r.error ?? JSON.stringify(r.rows));

// 5. subscriptions
r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, card_id, name, amount, billing_cycle, next_billing_date, next_billing_on, status, reminder_days)
   VALUES ('s1','user_a',NULL,'Netflix',64900,'monthly','2026-10-20','2026-10-20','active','{3,1}') RETURNING id`));
ok('subscription without a card (UPI) can be saved', !r.error, r.error ?? '');
r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, name, amount, billing_cycle, status) VALUES ('s2','user_a','Bad',100,'monthly','deleted')`));
ok('subscription status is constrained', !!r.error, r.error ?? 'no error');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM subscriptions`));
ok('RLS: user_b cannot see user_a subscriptions', r.rows?.[0]?.n === 0, r.error ?? JSON.stringify(r.rows));
r = await as('authenticated', 'user_b', () => tryQ(
  `INSERT INTO subscriptions (id, user_id, name, amount, billing_cycle) VALUES ('s3','user_a','Spoof',100,'monthly')`));
ok('RLS: user_b cannot insert for user_a', !!r.error, r.error ?? 'no error');

// 6. reminder ledger idempotency (service role writes)
await db.exec(`SET ROLE service_role`);
r = await tryQ(`INSERT INTO reminder_deliveries (user_id, subscription_id, kind, due_on, lead_days, channel)
                VALUES ('user_a','s1','renewal','2026-10-20',3,'email') ON CONFLICT DO NOTHING RETURNING id`);
const first = r.rows?.length;
r = await tryQ(`INSERT INTO reminder_deliveries (user_id, subscription_id, kind, due_on, lead_days, channel)
                VALUES ('user_a','s1','renewal','2026-10-20',3,'email') ON CONFLICT DO NOTHING RETURNING id`);
await db.exec('RESET ROLE');
ok('reminder claim is idempotent', first === 1 && r.rows?.length === 0, JSON.stringify({ first, second: r.rows?.length, err: r.error }));

// 7. savings goals RLS
r = await as('authenticated', 'user_a', () => tryQ(
  `INSERT INTO savings_goals (user_id, name, target_amount, monthly_contribution) VALUES ('user_a','Goa',2500000,500000) RETURNING id`));
ok('savings goal insert', !r.error, r.error ?? '');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM savings_goals`));
ok('RLS: savings goals isolated', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));

// 8. planning sessions with Clerk ids
r = await as('authenticated', 'user_a', () => tryQ(
  `SELECT save_planning_session_v1('00000000-0000-0000-0000-000000000001'::uuid,'user_a','date','draft',1,'{}'::jsonb,NULL,0) AS res`));
ok('planning session save with Clerk id', !r.error, r.error ?? '');
r = await as('authenticated', 'user_b', () => tryQ(`SELECT count(*)::int AS n FROM planning_sessions`));
ok('RLS: planning sessions isolated', r.rows?.[0]?.n === 0, JSON.stringify(r.rows));

// 9. audit log not public
const hasAudit = (await db.query(`SELECT to_regclass('public.verification_audit_log') AS t`)).rows[0].t;
if (hasAudit) {
  r = await as('anon', null, () => tryQ(`SELECT count(*)::int AS n FROM verification_audit_log`));
  ok('verification_audit_log hidden from anon', !!r.error || r.rows?.[0]?.n === 0, r.error ?? JSON.stringify(r.rows));
}

console.log('\n== behaviour');
for (const [s, n, e] of results) console.log(`  ${s} ${n}${e && s === 'FAIL' ? `  → ${e}` : ''}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
