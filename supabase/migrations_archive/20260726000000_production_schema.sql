-- =============================================================================
--  RENOCRED PRODUCTION POSTGRESQL SCHEMA FOR SUPABASE & CLERK AUTH
--  Migration File: 20260726000000_production_schema.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
// 1. ENUMS DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TYPE user_segment_enum AS ENUM ('youth', 'adult');

CREATE TYPE primary_goal_enum AS ENUM (
  'Maximise Cashback',
  'Travel Rewards',
  'Save More Money',
  'Build Credit Score',
  'Earn Reward Points'
);

CREATE TYPE occupation_enum AS ENUM (
  'Student',
  'Salaried',
  'Self-employed',
  'Business Owner',
  'Other'
);

CREATE TYPE transaction_category_enum AS ENUM (
  'dining',
  'travel',
  'groceries',
  'entertainment',
  'utilities',
  'shopping',
  'health',
  'transport',
  'subscriptions',
  'other'
);

CREATE TYPE transaction_type_enum AS ENUM ('debit', 'credit', 'refund');
CREATE TYPE reward_tier_enum AS ENUM ('standard', 'silver', 'gold', 'platinum', 'black');
CREATE TYPE card_network_enum AS ENUM ('Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners');
CREATE TYPE card_premium_tier_enum AS ENUM ('entry', 'mid_tier', 'premium', 'super_premium');
CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'upi', 'debit_card', 'net_banking');
CREATE TYPE online_offline_enum AS ENUM ('online', 'offline', 'both');
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'flat', 'points_multiplier');
CREATE TYPE priority_enum AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE rule_source_type_enum AS ENUM ('rbi_policy', 'bank_terms', 'renocred_expert', 'ai_reasoning');
CREATE TYPE financial_health_grade_enum AS ENUM ('A+', 'A', 'B', 'C', 'D');
CREATE TYPE ledger_entry_type_enum AS ENUM ('recommendation', 'taqdeer_decision', 'merchant_offer', 'manual_action');
CREATE TYPE ledger_entry_status_enum AS ENUM ('completed', 'pending', 'dismissed');
CREATE TYPE ledger_source_enum AS ENUM ('rule_engine', 'taqdeer', 'user_action');
CREATE TYPE notification_type_enum AS ENUM ('alert', 'reminder', 'opportunity', 'summary');
CREATE TYPE notification_status_enum AS ENUM ('unread', 'read', 'dismissed');
CREATE TYPE notification_source_engine_enum AS ENUM ('taqdeer', 'financial_health', 'merchant_intelligence', 'card_intelligence', 'financial_ledger');
CREATE TYPE experiment_status_enum AS ENUM ('draft', 'running', 'paused', 'completed');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'cancelled', 'paused');
CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'yearly');

-- ─────────────────────────────────────────────────────────────────────────────
// 2. TRIGGER FUNCTION FOR UPDATED_AT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
// 3. CORE USER & PROFILE TABLES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (auth.jwt()->>'sub')
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT '',
  avatar TEXT DEFAULT '',
  salary NUMERIC(12, 2) DEFAULT 0 CHECK (salary >= 0),
  credit_score INT DEFAULT 750 CHECK (credit_score BETWEEN 300 AND 900),
  user_segment user_segment_enum DEFAULT 'adult',
  onboarding_completed BOOLEAN DEFAULT false,
  primary_goal primary_goal_enum,
  occupation occupation_enum,
  city VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 4. CARDS & ACCOUNTS TABLES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_name VARCHAR(255) NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  last_four VARCHAR(4) NOT NULL CHECK (length(last_four) = 4),
  network card_network_enum NOT NULL,
  tier card_premium_tier_enum DEFAULT 'entry',
  primary_multiplier NUMERIC(4, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_cards_updated_at
BEFORE UPDATE ON user_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE credit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL UNIQUE REFERENCES user_cards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_limit NUMERIC(12, 2) NOT NULL CHECK (total_limit >= 0),
  current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
  minimum_payment_due NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_payment_due >= 0),
  payment_due_date DATE NOT NULL,
  last_payment_amount NUMERIC(12, 2) DEFAULT 0,
  last_payment_date DATE,
  apr NUMERIC(5, 4) NOT NULL DEFAULT 0.2499,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_credit_accounts_updated_at
BEFORE UPDATE ON credit_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE rewards_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  redeemed_points INT NOT NULL DEFAULT 0 CHECK (redeemed_points >= 0),
  cycle_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tier reward_tier_enum NOT NULL DEFAULT 'standard',
  points_to_next_tier INT NOT NULL DEFAULT 1000,
  category_multipliers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_rewards_accounts_updated_at
BEFORE UPDATE ON rewards_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 5. TRANSACTIONS & BUDGETING
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES user_cards(id) ON DELETE SET NULL,
  merchant VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL, -- positive charge, negative refund
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category transaction_category_enum NOT NULL,
  type transaction_type_enum NOT NULL DEFAULT 'debit',
  pending BOOLEAN NOT NULL DEFAULT false,
  reward_points INT DEFAULT 0,
  payment_method payment_method_enum DEFAULT 'credit_card',
  online_offline online_offline_enum DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES user_cards(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  billing_cycle billing_cycle_enum NOT NULL DEFAULT 'monthly',
  next_billing_date DATE NOT NULL,
  status subscription_status_enum NOT NULL DEFAULT 'active',
  category VARCHAR(100) NOT NULL,
  has_price_hike BOOLEAN DEFAULT false,
  previous_amount NUMERIC(10, 2),
  is_free_trial BOOLEAN DEFAULT false,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category transaction_category_enum NOT NULL,
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
  current_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
  period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category, period)
);

CREATE TRIGGER update_category_budgets_updated_at
BEFORE UPDATE ON category_budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 6. CARD INTELLIGENCE CATALOG
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE credit_cards_catalog (
  id VARCHAR(100) PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  network card_network_enum NOT NULL,
  premium_tier card_premium_tier_enum NOT NULL,
  annual_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  joining_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fee_waiver_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
  reward_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  top_benefit TEXT NOT NULL,
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  lounge_access JSONB NOT NULL DEFAULT '{}'::jsonb,
  forex_markup NUMERIC(4, 2) NOT NULL DEFAULT 3.5,
  minimum_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_credit_cards_catalog_updated_at
BEFORE UPDATE ON credit_cards_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 7. MERCHANT INTELLIGENCE PLATFORM
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE merchants (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category transaction_category_enum NOT NULL,
  logo TEXT NOT NULL,
  website TEXT,
  online_offline online_offline_enum NOT NULL DEFAULT 'online',
  supported_payment_methods payment_method_enum[] NOT NULL,
  partner_banks VARCHAR(100)[] DEFAULT '{}',
  tags VARCHAR(100)[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE merchant_offers (
  id VARCHAR(100) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  discount_type discount_type_enum NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  eligible_cards VARCHAR(100)[] NOT NULL DEFAULT '{"all"}',
  eligible_networks card_network_enum[] NOT NULL,
  minimum_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
  validity TIMESTAMPTZ NOT NULL,
  priority priority_enum NOT NULL DEFAULT 'medium',
  stackable BOOLEAN NOT NULL DEFAULT false,
  category transaction_category_enum NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_merchant_offers_updated_at
BEFORE UPDATE ON merchant_offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 8. KNOWLEDGE GRAPH
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE knowledge_rules (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  condition TEXT NOT NULL,
  outcome TEXT NOT NULL,
  explanation TEXT NOT NULL,
  why TEXT NOT NULL,
  source rule_source_type_enum NOT NULL,
  confidence INT NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  tags VARCHAR(100)[] DEFAULT '{}',
  priority priority_enum NOT NULL DEFAULT 'medium',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_knowledge_rules_updated_at
BEFORE UPDATE ON knowledge_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE knowledge_articles (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  related_cards VARCHAR(100)[] DEFAULT '{}',
  related_merchants VARCHAR(100)[] DEFAULT '{}',
  related_categories transaction_category_enum[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_knowledge_articles_updated_at
BEFORE UPDATE ON knowledge_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 9. FINANCIAL HEALTH & LEDGER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE financial_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  grade financial_health_grade_enum NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  insights TEXT[] DEFAULT '{}',
  confidence INT NOT NULL DEFAULT 90,
  score_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  score_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_financial_health_scores_updated_at
BEFORE UPDATE ON financial_health_scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type ledger_entry_type_enum NOT NULL,
  status ledger_entry_status_enum NOT NULL DEFAULT 'completed',
  merchant VARCHAR(255),
  card VARCHAR(255),
  category transaction_category_enum NOT NULL,
  recommendation_id VARCHAR(100),
  taqdeer_decision_id VARCHAR(100),
  estimated_savings NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estimated_rewards INT NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL,
  source ledger_source_enum NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_financial_ledger_updated_at
BEFORE UPDATE ON financial_ledger
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE achievements (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked BOOLEAN NOT NULL DEFAULT true,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
// 10. NOTIFICATIONS & AUTOMATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  priority priority_enum NOT NULL DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  trigger VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  action VARCHAR(100) NOT NULL,
  source_engine notification_source_engine_enum NOT NULL,
  status notification_status_enum NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  channels JSONB NOT NULL DEFAULT '{"push":true,"email":true,"sms":false,"whatsapp":true,"in_app":true}'::jsonb,
  frequency_limit_per_day INT NOT NULL DEFAULT 5,
  locale VARCHAR(10) NOT NULL DEFAULT 'en-IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
// 11. FEATURE FLAGS, EXPERIMENTS & EVENT BUS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INT NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  environments VARCHAR(50)[] NOT NULL DEFAULT '{"development"}',
  audience JSONB DEFAULT '{}'::jsonb,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE experiments (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  variants VARCHAR(100)[] NOT NULL,
  allocation JSONB NOT NULL,
  status experiment_status_enum NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_experiments_updated_at
BEFORE UPDATE ON experiments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE domain_events (
  id VARCHAR(100) PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  event_name VARCHAR(150) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  correlation_id VARCHAR(100) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
// 12. INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_credit_accounts_user_id ON credit_accounts(user_id);
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_merchant_offers_merchant_id ON merchant_offers(merchant_id);
CREATE INDEX idx_merchant_offers_category ON merchant_offers(category);
CREATE INDEX idx_financial_health_scores_user_id_ts ON financial_health_scores(user_id, score_timestamp DESC);
CREATE INDEX idx_financial_ledger_user_id_ts ON financial_ledger(user_id, timestamp DESC);
CREATE INDEX idx_notifications_user_id_status ON notifications(user_id, status);
CREATE INDEX idx_domain_events_user_id_ts ON domain_events(user_id, timestamp DESC);
CREATE INDEX idx_domain_events_event_name ON domain_events(event_name);

-- ─────────────────────────────────────────────────────────────────────────────
// 13. ROW LEVEL SECURITY (RLS) POLICIES WITH CLERK AUTH
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read/update their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (id = (auth.jwt()->>'sub'));

-- User Cards: user can read/write their own cards
CREATE POLICY "Users can manage own cards" ON user_cards
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Credit Accounts
CREATE POLICY "Users can manage own credit accounts" ON credit_accounts
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Rewards Accounts
CREATE POLICY "Users can manage own rewards accounts" ON rewards_accounts
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Transactions
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Subscriptions
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Category Budgets
CREATE POLICY "Users can manage own budgets" ON category_budgets
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Financial Health Scores
CREATE POLICY "Users can read own health scores" ON financial_health_scores
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Financial Ledger
CREATE POLICY "Users can read own ledger" ON financial_ledger
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- User Achievements
CREATE POLICY "Users can read own achievements" ON user_achievements
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Notification Preferences
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = (auth.jwt()->>'sub'));

-- Public/Shared Read-Only Tables
ALTER TABLE credit_cards_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to card catalog" ON credit_cards_catalog FOR SELECT USING (true);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to merchants" ON merchants FOR SELECT USING (true);

ALTER TABLE merchant_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to merchant offers" ON merchant_offers FOR SELECT USING (true);

ALTER TABLE knowledge_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to knowledge rules" ON knowledge_rules FOR SELECT USING (true);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to knowledge articles" ON knowledge_articles FOR SELECT USING (true);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to achievements" ON achievements FOR SELECT USING (true);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to feature flags" ON feature_flags FOR SELECT USING (true);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to experiments" ON experiments FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
// 14. RECOMMENDED SUPABASE VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW view_user_financial_overview AS
SELECT
  p.id AS user_id,
  p.name,
  p.user_segment,
  p.primary_goal,
  ra.total_points,
  ra.redeemed_points,
  ra.tier AS rewards_tier,
  COALESCE(SUM(ca.total_limit), 0) AS aggregate_credit_limit,
  COALESCE(SUM(ca.current_balance), 0) AS aggregate_current_balance,
  CASE
    WHEN COALESCE(SUM(ca.total_limit), 0) > 0 THEN
      ROUND((COALESCE(SUM(ca.current_balance), 0) / SUM(ca.total_limit)) * 100, 2)
    ELSE 0
  END AS aggregate_utilization_pct
FROM profiles p
LEFT JOIN rewards_accounts ra ON ra.user_id = p.id
LEFT JOIN credit_accounts ca ON ca.user_id = p.id
GROUP BY p.id, p.name, p.user_segment, p.primary_goal, ra.total_points, ra.redeemed_points, ra.tier;
