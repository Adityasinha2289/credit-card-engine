-- ─────────────────────────────────────────────────────────────────────────────
--  RenoCred — Phase 2: Full Persistence Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Update Users Table for Rewards
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reward_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS redeemed_reward_points INTEGER DEFAULT 0;

-- 2. Credit Accounts (Live balances for user cards)
CREATE TABLE IF NOT EXISTS credit_accounts (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id         TEXT NOT NULL REFERENCES cards(id),       -- Master card reference
  user_card_id    TEXT NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE, -- User's specific card
  current_balance INTEGER DEFAULT 0,                        -- In paise
  available_credit INTEGER DEFAULT 0,                       -- In paise
  next_statement_date TEXT,                                 -- YYYY-MM-DD
  due_date        TEXT,                                     -- YYYY-MM-DD
  min_due         INTEGER DEFAULT 0,                        -- In paise
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_card_id)
);

-- 3. Budgets (Category limits)
CREATE TABLE IF NOT EXISTS budgets (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  limit_amount INTEGER NOT NULL,  -- In paise
  icon        TEXT,               -- Emoji icon
  color       TEXT,               -- Hex or tailwind class
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id     TEXT NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  amount      INTEGER NOT NULL,   -- In paise
  billing_cycle TEXT NOT NULL,    -- 'monthly', 'yearly'
  next_billing_date TEXT NOT NULL, -- YYYY-MM-DD
  icon        TEXT,
  category    TEXT DEFAULT 'subscription',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
--  INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_credit_accounts_user ON credit_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_card ON subscriptions(card_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Credit Accounts
CREATE POLICY "Own credit accounts" ON credit_accounts FOR ALL USING ((auth.jwt()->>'sub') = user_id);

-- Budgets
CREATE POLICY "Own budgets" ON budgets FOR ALL USING ((auth.jwt()->>'sub') = user_id);

-- Subscriptions
CREATE POLICY "Own subscriptions" ON subscriptions FOR ALL USING ((auth.jwt()->>'sub') = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  AUTO-UPDATE TRIGGER for credit_accounts
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER credit_accounts_updated_at
  BEFORE UPDATE ON credit_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
