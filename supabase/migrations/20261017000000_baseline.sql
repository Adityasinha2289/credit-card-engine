-- =============================================================================
--  RENOCRED — BASELINE SCHEMA (2026-10-17)
--
--  Replaces the 25 historical migrations (now in supabase/migrations_archive/)
--  with one clean, reviewed schema. Apply to an EMPTY database
--  (`supabase db reset --linked`), not on top of the old history.
--
--  Conventions
--    • Identity  : Clerk user id (TEXT). requesting_user_id() reads the JWT `sub`.
--                  Every user-scoped policy uses (SELECT requesting_user_id()) so
--                  it is evaluated once per statement, not per row.
--    • Money     : user ledger amounts are BIGINT paise (₹1 = 100).
--                  users.salary is ANNUAL RUPEES (profile input, not ledger).
--                  Commerce catalog prices stay NUMERIC(12,2) rupees.
--    • Dates     : DATE for calendar facts (txn_date, due_date, next_billing_on),
--                  TIMESTAMPTZ for events.
--    • Writes that move balances / points go through SECURITY DEFINER RPCs that
--      take identity from the JWT, never from a parameter.
--    • Server-only tables have RLS enabled and NO policies (service role only).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
--  0. Helpers
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ist_today()
RETURNS DATE LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date
$$;

-- ─────────────────────────────────────────────────────────────────────────────
--  1. Users
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.users (
  id                     TEXT PRIMARY KEY,                 -- Clerk user id
  email                  TEXT UNIQUE,
  name                   TEXT,
  phone                  TEXT,
  avatar_url             TEXT,
  salary                 BIGINT NOT NULL DEFAULT 0 CHECK (salary >= 0),   -- annual ₹, 0 = unknown
  credit_score           INTEGER NOT NULL DEFAULT 0 CHECK (credit_score = 0 OR credit_score BETWEEN 300 AND 900), -- 0 = unknown
  onboarding_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  user_segment           TEXT,
  primary_goal           TEXT,
  spend_categories       JSONB NOT NULL DEFAULT '[]'::jsonb,
  city                   TEXT,
  occupation             TEXT,
  age_band               TEXT,
  cibil_band             TEXT,
  total_reward_points    BIGINT NOT NULL DEFAULT 0 CHECK (total_reward_points >= 0),
  redeemed_reward_points BIGINT NOT NULL DEFAULT 0 CHECK (redeemed_reward_points >= 0),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- End users may only change profile fields. SECURITY DEFINER RPCs run as the
-- function owner and the service role is trusted, so neither is restricted.
CREATE OR REPLACE FUNCTION public.enforce_profile_allowlist()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  v_allowed TEXT[] := ARRAY[
    'name', 'phone', 'avatar_url', 'salary', 'credit_score', 'onboarding_completed',
    'user_segment', 'primary_goal', 'spend_categories', 'city', 'occupation',
    'age_band', 'cibil_band', 'updated_at'
  ];
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  IF (to_jsonb(OLD) - v_allowed) IS DISTINCT FROM (to_jsonb(NEW) - v_allowed) THEN
    RAISE EXCEPTION 'Only profile fields can be changed' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_enforce_profile_allowlist BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_allowlist();

-- A client creating its own row can't mint points.
CREATE OR REPLACE FUNCTION public.guard_user_insert()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    NEW.total_reward_points := 0;
    NEW.redeemed_reward_points := 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_guard_insert BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_insert();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: read own"   ON public.users FOR SELECT USING (id = (SELECT public.requesting_user_id()));
CREATE POLICY "users: insert own" ON public.users FOR INSERT WITH CHECK (id = (SELECT public.requesting_user_id()));
CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (id = (SELECT public.requesting_user_id()))
  WITH CHECK (id = (SELECT public.requesting_user_id()));

-- ─────────────────────────────────────────────────────────────────────────────
--  2. Card catalog (public, seeded by 20261017000100_card_catalog.sql)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.cards (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  bank             TEXT NOT NULL,
  network          TEXT NOT NULL,
  annual_fee       INTEGER,                    -- ₹; NULL = unknown
  fee_waiver_spend INTEGER,                    -- ₹ per year
  min_income       INTEGER,                    -- ₹ per year; NULL = not published
  min_cibil        INTEGER,
  welcome_bonus    TEXT,
  lounge_access    INTEGER NOT NULL DEFAULT 0, -- visits per year
  base_reward_rate NUMERIC(5,2),               -- % effective value
  rewards          JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{category, rate, cap?}]
  highlights       JSONB NOT NULL DEFAULT '[]'::jsonb,
  gradient_from    TEXT,
  gradient_to      TEXT,
  apply_url        TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_bank ON public.cards (bank);
CREATE TRIGGER cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards: public read" ON public.cards FOR SELECT USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
--  3. Wallet, balances, ledger
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.user_cards (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id         TEXT NOT NULL REFERENCES public.cards(id),
  last_4_digits   TEXT CHECK (last_4_digits IS NULL OR last_4_digits ~ '^\d{4}$'),
  cardholder_name TEXT,
  expiry          TEXT,                                   -- MM/YY as printed
  credit_limit    BIGINT NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),  -- paise
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

CREATE INDEX idx_user_cards_card ON public.user_cards (card_id);

CREATE TABLE public.credit_accounts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id             TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id             TEXT NOT NULL REFERENCES public.cards(id),
  user_card_id        TEXT NOT NULL UNIQUE REFERENCES public.user_cards(id) ON DELETE CASCADE,
  current_balance     BIGINT NOT NULL DEFAULT 0 CHECK (current_balance >= 0),  -- paise
  available_credit    BIGINT NOT NULL DEFAULT 0,                               -- paise
  min_due             BIGINT NOT NULL DEFAULT 0 CHECK (min_due >= 0),           -- paise
  next_statement_date DATE,
  due_date            DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

CREATE INDEX idx_credit_accounts_due ON public.credit_accounts (due_date) WHERE due_date IS NOT NULL;
CREATE TRIGGER credit_accounts_updated_at BEFORE UPDATE ON public.credit_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.transactions (
  id            TEXT PRIMARY KEY DEFAULT ('txn-' || gen_random_uuid()::text),
  user_id       TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id       TEXT,                                -- catalog id; NULL = bank/UPI/cash
  merchant      TEXT NOT NULL CHECK (length(merchant) BETWEEN 1 AND 120),
  amount        BIGINT NOT NULL CHECK (amount <> 0), -- paise; purchases > 0, refunds/credits/payments < 0
  category      TEXT NOT NULL DEFAULT 'other',
  type          TEXT NOT NULL DEFAULT 'debit' CHECK (type IN ('debit', 'refund', 'credit')),
  is_pending    BOOLEAN NOT NULL DEFAULT FALSE,
  txn_date      DATE NOT NULL DEFAULT public.ist_today(),
  reward_points BIGINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((type = 'debit') = (amount > 0))
);

CREATE INDEX idx_transactions_user_date ON public.transactions (user_id, txn_date DESC, created_at DESC);
CREATE INDEX idx_transactions_user_card ON public.transactions (user_id, card_id);

ALTER TABLE public.user_cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cards: own" ON public.user_cards FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "credit_accounts: own" ON public.credit_accounts FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "transactions: own" ON public.transactions FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));

-- ─────────────────────────────────────────────────────────────────────────────
--  4. Budgets, goals, subscriptions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.budgets (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  limit_amount BIGINT NOT NULL CHECK (limit_amount > 0),   -- paise per period
  period       TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
  icon         TEXT,
  color        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

CREATE TABLE public.savings_goals (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id              TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  target_amount        BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount       BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  monthly_contribution BIGINT NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
  deadline             DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_savings_goals_user ON public.savings_goals (user_id);
CREATE TRIGGER savings_goals_updated_at BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.subscriptions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id         TEXT REFERENCES public.user_cards(id) ON DELETE SET NULL,  -- wallet row; NULL = UPI/bank
  name            TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  amount          BIGINT NOT NULL CHECK (amount > 0),                       -- paise per cycle
  billing_cycle   TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing_on DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  is_free_trial   BOOLEAN NOT NULL DEFAULT FALSE,
  trial_ends_on   DATE,
  has_price_hike  BOOLEAN NOT NULL DEFAULT FALSE,
  previous_amount BIGINT,
  reminder_days   INTEGER[] CHECK (reminder_days IS NULL OR (cardinality(reminder_days) <= 5 AND 0 <= ALL (reminder_days) AND 30 >= ALL (reminder_days))),
  source          TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'detected')),
  cancel_url      TEXT,
  icon            TEXT,
  category        TEXT NOT NULL DEFAULT 'subscriptions',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions (user_id);
CREATE INDEX idx_subscriptions_due ON public.subscriptions (next_billing_on) WHERE status = 'active';
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.budgets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budgets: own" ON public.budgets FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "savings_goals: own" ON public.savings_goals FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "subscriptions: own" ON public.subscriptions FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));

-- ─────────────────────────────────────────────────────────────────────────────
--  5. Reminders & notifications
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.notification_preferences (
  user_id               TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  in_app_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  default_reminder_days INTEGER[] NOT NULL DEFAULT ARRAY[3, 1],
  quiet_start           TIME NOT NULL DEFAULT '22:00',
  quiet_end             TIME NOT NULL DEFAULT '08:00',
  timezone              TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Written by the server after verifying the Clerk session; users may read/delete their own.
CREATE TABLE public.push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL UNIQUE,
  p256dh          TEXT NOT NULL,
  auth            TEXT NOT NULL,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_success_at TIMESTAMPTZ
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions (user_id);

-- Idempotency ledger: the cron claims a row before sending (at-most-once delivery).
CREATE TABLE public.reminder_deliveries (
  id              BIGSERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL,
  due_on          DATE NOT NULL,
  lead_days       INTEGER NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'push')),
  status          TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'sent', 'failed', 'skipped')),
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  UNIQUE (subscription_id, kind, due_on, lead_days, channel)
);

CREATE INDEX idx_reminder_deliveries_user ON public.reminder_deliveries (user_id, created_at DESC);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_deliveries      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences: own" ON public.notification_preferences FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "push_subscriptions: read own" ON public.push_subscriptions FOR SELECT
  USING (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "push_subscriptions: delete own" ON public.push_subscriptions FOR DELETE
  USING (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "reminder_deliveries: read own" ON public.reminder_deliveries FOR SELECT
  USING (user_id = (SELECT public.requesting_user_id()));

-- ─────────────────────────────────────────────────────────────────────────────
--  6. Planning sessions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.planning_sessions (
  id             UUID PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type      TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'draft',
  current_phase  INTEGER NOT NULL DEFAULT 1,
  schema_version INTEGER NOT NULL DEFAULT 1,
  revision       INTEGER NOT NULL DEFAULT 1,
  draft          JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_plan  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ
);

CREATE INDEX idx_planning_sessions_user ON public.planning_sessions (user_id, plan_type);
CREATE TRIGGER planning_sessions_updated_at BEFORE UPDATE ON public.planning_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.planning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "planning_sessions: own" ON public.planning_sessions FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));

-- ─────────────────────────────────────────────────────────────────────────────
--  7. Commerce (catalog prices in NUMERIC rupees)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  parent_id  UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  icon       VARCHAR(255),
  status     VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent ON public.categories (parent_id);
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.partners (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(255) UNIQUE NOT NULL,
  name                VARCHAR(255) NOT NULL,
  logo_url            TEXT,
  description         TEXT,
  website_url         TEXT CHECK (website_url IS NULL OR website_url ~ '^https://'),
  primary_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_sponsored        BOOLEAN NOT NULL DEFAULT FALSE,
  status              VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_partners_status ON public.partners (status);
CREATE TRIGGER partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.commerce_entities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id       UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  entity_type      VARCHAR(50) NOT NULL CHECK (entity_type IN ('product', 'service', 'experience', 'subscription', 'booking', 'venue')),
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  sku              VARCHAR(255),
  image_url        TEXT,
  base_price       NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
  currency         VARCHAR(3) NOT NULL DEFAULT 'INR',
  destination_path TEXT NOT NULL,
  is_sponsored     BOOLEAN NOT NULL DEFAULT FALSE,
  status           VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_commerce_entities_partner ON public.commerce_entities (partner_id);
CREATE INDEX idx_commerce_entities_category ON public.commerce_entities (category_id);
CREATE TRIGGER commerce_entities_updated_at BEFORE UPDATE ON public.commerce_entities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.offers (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source                     VARCHAR(50) NOT NULL CHECK (source IN ('merchant', 'bank', 'card_network', 'renocred')),
  offer_type                 VARCHAR(50) NOT NULL CHECK (offer_type IN ('percentage_discount', 'flat_discount', 'cashback', 'points', 'miles')),
  value                      NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  title                      VARCHAR(255) NOT NULL,
  description                TEXT NOT NULL DEFAULT '',
  min_spend                  NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_spend >= 0),
  max_discount               NUMERIC(12, 2) CHECK (max_discount IS NULL OR max_discount >= 0),
  valid_from                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until                TIMESTAMPTZ NOT NULL,
  status                     VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  eligibility_rules          JSONB NOT NULL DEFAULT '{}'::jsonb,
  internal_campaign_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (valid_until > valid_from),
  CHECK (offer_type <> 'percentage_discount' OR value <= 100)
);
CREATE INDEX idx_offers_status_dates ON public.offers (status, valid_from, valid_until);
CREATE INDEX idx_offers_eligibility ON public.offers USING GIN (eligibility_rules);
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.marketplace_partner_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id          UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  category_slug       VARCHAR(100) NOT NULL,
  subcategory_slug    VARCHAR(100),
  minor_category_slug VARCHAR(100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (partner_id, category_slug, subcategory_slug, minor_category_slug)
);
CREATE INDEX idx_marketplace_mappings ON public.marketplace_partner_mappings (category_slug, subcategory_slug, minor_category_slug);

CREATE TABLE public.payment_methods (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'upi', 'wallet', 'reward_points')),
  name       VARCHAR(255) NOT NULL,
  provider   VARCHAR(100) NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  status     VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_methods_user ON public.payment_methods (user_id);
CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.affiliate_relationships (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id            UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  network               VARCHAR(100) NOT NULL,
  tracking_template_url TEXT NOT NULL CHECK (tracking_template_url ~ '^https://'),
  commission_model      VARCHAR(50) NOT NULL CHECK (commission_model IN ('cpa', 'cps', 'cpl', 'cpc', 'fixed', 'tiered')),
  commission_terms      JSONB NOT NULL DEFAULT '{}'::jsonb,
  status                VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- One active relationship per partner (the click and conversion paths rely on it).
CREATE UNIQUE INDEX uq_affiliate_active_partner ON public.affiliate_relationships (partner_id) WHERE status = 'active';
CREATE TRIGGER affiliate_relationships_updated_at BEFORE UPDATE ON public.affiliate_relationships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.tracking_events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- the click id
  user_id                 TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  commerce_entity_id      UUID REFERENCES public.commerce_entities(id) ON DELETE SET NULL,
  partner_id              UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  offer_id                UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  source_placement        VARCHAR(100) NOT NULL,
  recommendation_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tracking_events_user ON public.tracking_events (user_id);
CREATE INDEX idx_tracking_events_partner ON public.tracking_events (partner_id);
CREATE INDEX idx_tracking_events_offer ON public.tracking_events (offer_id);

CREATE TABLE public.conversions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_event_id       UUID REFERENCES public.tracking_events(id) ON DELETE SET NULL,  -- kept when a user is erased
  partner_id              UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  external_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_value             NUMERIC(12, 2) NOT NULL CHECK (order_value >= 0),
  currency                VARCHAR(3) NOT NULL DEFAULT 'INR',
  status                  VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  converted_at            TIMESTAMPTZ NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversions_tracking_event ON public.conversions (tracking_event_id);
CREATE TRIGGER conversions_updated_at BEFORE UPDATE ON public.conversions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.commissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_id       UUID NOT NULL REFERENCES public.conversions(id) ON DELETE CASCADE,
  expected_commission NUMERIC(12, 2) NOT NULL,
  actual_commission   NUMERIC(12, 2),
  status              VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'adjusted', 'voided')),
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_commissions_conversion ON public.commissions (conversion_id);
CREATE TRIGGER commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.processed_webhook_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     TEXT NOT NULL UNIQUE,
  event_type   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'completed',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_entities            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_partner_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_relationships      ENABLE ROW LEVEL SECURITY;  -- server only
ALTER TABLE public.tracking_events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions                  ENABLE ROW LEVEL SECURITY;  -- server only
ALTER TABLE public.commissions                  ENABLE ROW LEVEL SECURITY;  -- server only
ALTER TABLE public.processed_webhook_events     ENABLE ROW LEVEL SECURITY;  -- server only

CREATE POLICY "categories: public read active" ON public.categories FOR SELECT USING (status = 'active');
CREATE POLICY "partners: public read active" ON public.partners FOR SELECT USING (status = 'active');
CREATE POLICY "commerce_entities: public read active" ON public.commerce_entities FOR SELECT USING (status = 'active');
CREATE POLICY "marketplace_mappings: public read" ON public.marketplace_partner_mappings FOR SELECT USING (true);
CREATE POLICY "payment_methods: own" ON public.payment_methods FOR ALL
  USING (user_id = (SELECT public.requesting_user_id())) WITH CHECK (user_id = (SELECT public.requesting_user_id()));
CREATE POLICY "tracking_events: read own" ON public.tracking_events FOR SELECT
  USING (user_id = (SELECT public.requesting_user_id()));

-- Offers: no direct client access (internal_campaign_metadata is private).
-- Clients read live offers through this view, which exposes safe columns only.
CREATE VIEW public.public_offers_view AS
SELECT id, source, offer_type, value, title, description, min_spend, max_discount,
       valid_from, valid_until, status, eligibility_rules, created_at, updated_at
FROM public.offers
WHERE status = 'active' AND valid_until > now();

REVOKE ALL ON public.public_offers_view FROM PUBLIC;
GRANT SELECT ON public.public_offers_view TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
--  8. RPCs (identity always from the JWT)
-- ─────────────────────────────────────────────────────────────────────────────

-- Purchases, refunds and credits. Idempotent on p_id. Returns server-computed points.
CREATE OR REPLACE FUNCTION public.add_transaction_v2(
  p_id TEXT,
  p_card_id TEXT,
  p_merchant TEXT,
  p_amount BIGINT,
  p_category TEXT,
  p_type TEXT DEFAULT 'debit',
  p_is_pending BOOLEAN DEFAULT FALSE,
  p_date DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_id TEXT := COALESCE(NULLIF(p_id, ''), 'txn-' || gen_random_uuid()::text);
  v_type TEXT := lower(COALESCE(p_type, 'debit'));
  v_amount BIGINT;
  v_points BIGINT := 0;
  v_new_balance BIGINT;
  v_existing RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: authentication required' USING ERRCODE = '42501';
  END IF;
  IF v_type NOT IN ('debit', 'refund', 'credit') THEN
    RAISE EXCEPTION 'Invalid transaction type %', v_type USING ERRCODE = '22023';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 OR abs(p_amount) > 10000000000 THEN  -- ≤ ₹10 crore
    RAISE EXCEPTION 'Invalid transaction amount' USING ERRCODE = '22023';
  END IF;
  IF p_date IS NOT NULL AND (p_date > public.ist_today() + 1 OR p_date < DATE '2000-01-01') THEN
    RAISE EXCEPTION 'Transaction date out of range' USING ERRCODE = '22023';
  END IF;

  v_amount := CASE WHEN v_type = 'debit' THEN abs(p_amount) ELSE -abs(p_amount) END;

  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_cards WHERE user_id = v_uid AND (card_id = p_card_id OR id = p_card_id)) THEN
      RAISE EXCEPTION 'Card does not belong to user' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT id, reward_points INTO v_existing FROM public.transactions WHERE id = v_id AND user_id = v_uid;
  IF FOUND THEN
    RETURN jsonb_build_object('status', 'already_exists', 'id', v_id,
                              'points', v_existing.reward_points, 'reward_points', v_existing.reward_points);
  END IF;

  IF v_type = 'debit' THEN
    v_points := v_amount / 10000;  -- 1 point per ₹100 (10,000 paise)
  END IF;

  INSERT INTO public.transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, txn_date, reward_points)
  VALUES (v_id, v_uid, NULLIF(p_card_id, ''), left(COALESCE(NULLIF(p_merchant, ''), 'Unknown'), 120), v_amount,
          COALESCE(NULLIF(p_category, ''), 'other'), v_type, COALESCE(p_is_pending, FALSE),
          COALESCE(p_date, public.ist_today()), v_points);

  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    UPDATE public.credit_accounts
       SET current_balance = GREATEST(0, current_balance + v_amount)
     WHERE user_id = v_uid AND (card_id = p_card_id OR user_card_id = p_card_id)
    RETURNING current_balance INTO v_new_balance;
  END IF;

  IF v_points > 0 THEN
    UPDATE public.users SET total_reward_points = total_reward_points + v_points WHERE id = v_uid;
  END IF;

  RETURN jsonb_build_object('status', 'success', 'id', v_id, 'new_balance', COALESCE(v_new_balance, 0),
                            'points', v_points, 'reward_points', v_points);
END;
$$;

-- Card bill payment (row lock; refuses a zero balance; clamps to the balance).
CREATE OR REPLACE FUNCTION public.pay_bill_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_amount BIGINT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_balance BIGINT;
  v_paid BIGINT;
  v_new BIGINT;
  v_tx TEXT := 'txn-pay-' || gen_random_uuid()::text;
BEGIN
  IF v_uid IS NULL OR (p_user_id IS NOT NULL AND p_user_id <> v_uid) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be strictly positive' USING ERRCODE = '22023';
  END IF;

  SELECT current_balance INTO v_balance FROM public.credit_accounts
   WHERE user_id = v_uid AND (card_id = p_card_id OR user_card_id = p_card_id)
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_balance <= 0 THEN
    RAISE EXCEPTION 'NOTHING_TO_PAY: card has no outstanding balance' USING ERRCODE = '22023';
  END IF;

  v_paid := LEAST(p_amount, v_balance);

  INSERT INTO public.transactions (id, user_id, card_id, merchant, amount, category, type, is_pending)
  VALUES (v_tx, v_uid, p_card_id, 'Bill Payment', -v_paid, 'other', 'credit', FALSE);

  UPDATE public.credit_accounts SET current_balance = current_balance - v_paid
   WHERE user_id = v_uid AND (card_id = p_card_id OR user_card_id = p_card_id)
  RETURNING current_balance INTO v_new;

  RETURN jsonb_build_object('status', 'success', 'id', v_tx, 'new_balance', v_new, 'payment_amount', v_paid);
END;
$$;

-- Add a card to the wallet together with its credit account.
CREATE OR REPLACE FUNCTION public.add_user_card_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_last_4_digits TEXT,
  p_cardholder_name TEXT,
  p_expiry TEXT,
  p_credit_limit BIGINT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_user_card_id TEXT;
  v_last4 TEXT := CASE WHEN p_last_4_digits ~ '^\d{4}$' THEN p_last_4_digits ELSE NULL END;
BEGIN
  IF v_uid IS NULL OR (p_user_id IS NOT NULL AND p_user_id <> v_uid) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE id = p_card_id) THEN
    RAISE EXCEPTION 'Unknown card %', p_card_id USING ERRCODE = '23503';
  END IF;

  -- Idempotent: adding a card you already hold returns the existing wallet row.
  SELECT id INTO v_user_card_id FROM public.user_cards WHERE user_id = v_uid AND card_id = p_card_id;
  IF FOUND THEN
    RETURN jsonb_build_object('status', 'already_exists', 'user_card_id', v_user_card_id);
  END IF;

  INSERT INTO public.user_cards (user_id, card_id, last_4_digits, cardholder_name, expiry, credit_limit, status)
  VALUES (v_uid, p_card_id, v_last4, left(p_cardholder_name, 80), left(p_expiry, 7), GREATEST(COALESCE(p_credit_limit, 0), 0), 'active')
  RETURNING id INTO v_user_card_id;

  INSERT INTO public.credit_accounts (user_id, card_id, user_card_id, current_balance, available_credit)
  VALUES (v_uid, p_card_id, v_user_card_id, 0, GREATEST(COALESCE(p_credit_limit, 0), 0));

  RETURN jsonb_build_object('status', 'success', 'user_card_id', v_user_card_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_points_v1(p_points BIGINT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_total BIGINT;
  v_redeemed BIGINT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'Points to redeem must be greater than zero' USING ERRCODE = '22023';
  END IF;

  SELECT total_reward_points, redeemed_reward_points INTO v_total, v_redeemed
    FROM public.users WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND OR (v_total - v_redeemed) < p_points THEN
    RAISE EXCEPTION 'Insufficient reward points' USING ERRCODE = '22023';
  END IF;

  UPDATE public.users SET redeemed_reward_points = v_redeemed + p_points WHERE id = v_uid;
  RETURN jsonb_build_object('status', 'success', 'redeemed', p_points, 'available', v_total - v_redeemed - p_points);
END;
$$;

-- Optimistic-concurrency save for planner drafts (runs as the caller; RLS applies).
CREATE OR REPLACE FUNCTION public.save_planning_session_v1(
  p_id UUID,
  p_user_id TEXT,
  p_plan_type TEXT,
  p_status TEXT,
  p_current_phase INTEGER,
  p_draft JSONB,
  p_selected_plan JSONB,
  p_expected_revision INTEGER
) RETURNS JSONB
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_rev INTEGER;
  v_row JSONB;
BEGIN
  IF v_uid IS NULL OR (p_user_id IS NOT NULL AND p_user_id <> v_uid) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT revision INTO v_rev FROM public.planning_sessions WHERE id = p_id AND user_id = v_uid FOR UPDATE;
  IF FOUND THEN
    IF v_rev > p_expected_revision THEN
      RAISE EXCEPTION 'STALE_SAVE: Current revision % is newer than expected %', v_rev, p_expected_revision;
    END IF;
    UPDATE public.planning_sessions
       SET plan_type = COALESCE(p_plan_type, plan_type),
           status = COALESCE(p_status, status),
           current_phase = COALESCE(p_current_phase, current_phase),
           draft = COALESCE(p_draft, draft),
           selected_plan = COALESCE(p_selected_plan, selected_plan),
           revision = revision + 1,
           last_viewed_at = now()
     WHERE id = p_id AND user_id = v_uid
    RETURNING to_jsonb(planning_sessions.*) INTO v_row;
  ELSE
    INSERT INTO public.planning_sessions (id, user_id, plan_type, status, current_phase, draft, selected_plan, revision)
    VALUES (p_id, v_uid, p_plan_type, COALESCE(p_status, 'draft'), COALESCE(p_current_phase, 1), COALESCE(p_draft, '{}'::jsonb), p_selected_plan, 1)
    RETURNING to_jsonb(planning_sessions.*) INTO v_row;
  END IF;
  RETURN v_row;
END;
$$;

-- Least privilege: only signed-in users may call the RPCs.
REVOKE EXECUTE ON FUNCTION public.add_transaction_v2(TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, BOOLEAN, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, BIGINT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_points_v1(BIGINT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.save_planning_session_v1(UUID, TEXT, TEXT, TEXT, INTEGER, JSONB, JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_transaction_v2(TEXT, TEXT, TEXT, BIGINT, TEXT, TEXT, BOOLEAN, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_points_v1(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_planning_session_v1(UUID, TEXT, TEXT, TEXT, INTEGER, JSONB, JSONB, INTEGER) TO authenticated;

-- Trigger helpers are not callable as RPCs.
REVOKE EXECUTE ON FUNCTION public.enforce_profile_allowlist() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_user_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
