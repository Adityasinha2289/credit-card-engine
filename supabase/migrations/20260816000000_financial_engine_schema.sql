-- =============================================================================
--  RENOCRED FINANCIAL TRUTH ENGINE SCHEMA
--  Migration File: 20260816000000_financial_engine_schema.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS DEFINITIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TYPE reward_type_enum AS ENUM ('CASHBACK', 'POINTS', 'MILES');
CREATE TYPE reward_earning_method_enum AS ENUM ('PERCENTAGE', 'POINTS_PER_SPEND', 'FLAT', 'MULTIPLIER');
CREATE TYPE cap_period_enum AS ENUM ('TRANSACTION', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'LIFETIME');
CREATE TYPE cap_unit_enum AS ENUM ('MONETARY', 'POINTS', 'MILES');
CREATE TYPE redemption_mechanism_enum AS ENUM ('STATEMENT_CREDIT', 'TRAVEL', 'VOUCHER', 'TRANSFER');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TAXONOMY & NORMALIZATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE transaction_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id VARCHAR(100) REFERENCES transaction_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- We assume `merchants` table already exists from 20260726000000_production_schema.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FINANCIAL TRUTH CORE MODELS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE card_reward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(100) NOT NULL REFERENCES credit_cards_catalog(id) ON DELETE CASCADE,
  category_id VARCHAR(100) REFERENCES transaction_categories(id),
  merchant_id VARCHAR(100) REFERENCES merchants(id),
  
  -- Core mechanics
  reward_type reward_type_enum NOT NULL,
  earning_method reward_earning_method_enum NOT NULL,
  
  -- Numeric boundaries
  base_rate NUMERIC(10, 4), -- Used for PERCENTAGE or MULTIPLIER
  points_awarded NUMERIC(10, 2), -- Used for POINTS_PER_SPEND
  spend_requirement NUMERIC(10, 2), -- e.g. "per ₹100"
  
  -- Semantics
  is_exclusion BOOLEAN NOT NULL DEFAULT false,
  is_base_rule BOOLEAN NOT NULL DEFAULT false,
  
  -- Data Provenance
  raw_source_text TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent ambiguous rules (must target a category, a merchant, or be the base rule)
  CONSTRAINT rule_target_check CHECK (
    category_id IS NOT NULL OR 
    merchant_id IS NOT NULL OR 
    is_base_rule = true OR
    is_exclusion = true
  )
);

CREATE TRIGGER update_card_reward_rules_updated_at
BEFORE UPDATE ON card_reward_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. REWARD CAPS & LIMITS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE card_reward_caps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(100) NOT NULL REFERENCES credit_cards_catalog(id) ON DELETE CASCADE,
  
  period cap_period_enum NOT NULL,
  unit cap_unit_enum NOT NULL,
  max_value NUMERIC(12, 2) NOT NULL CHECK (max_value > 0),
  
  raw_source_text TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_card_reward_caps_updated_at
BEFORE UPDATE ON card_reward_caps
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Support for Shared Caps across categories/rules
CREATE TABLE card_cap_links (
  cap_id UUID NOT NULL REFERENCES card_reward_caps(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES card_reward_rules(id) ON DELETE CASCADE,
  PRIMARY KEY (cap_id, rule_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. REDEMPTION ECONOMICS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE card_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(100) NOT NULL REFERENCES credit_cards_catalog(id) ON DELETE CASCADE,
  
  point_type_name VARCHAR(100) NOT NULL, -- e.g., "CashPoints"
  mechanism redemption_mechanism_enum NOT NULL,
  monetary_value NUMERIC(10, 4) NOT NULL CHECK (monetary_value >= 0),
  
  raw_source_text TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_card_redemptions_updated_at
BEFORE UPDATE ON card_redemptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SUPPLEMENTARY CARD METADATA (Benefits & Eligibility)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE card_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(100) NOT NULL REFERENCES credit_cards_catalog(id) ON DELETE CASCADE,
  benefit_type VARCHAR(100) NOT NULL, -- e.g., 'lounge', 'milestone', 'fuel_surcharge'
  details JSONB NOT NULL,
  raw_source_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(100) NOT NULL REFERENCES credit_cards_catalog(id) ON DELETE CASCADE,
  min_income NUMERIC(12, 2),
  min_cibil INT,
  employment_type occupation_enum,
  raw_source_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RLS POLICIES (Read-Only for Public)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to transaction categories" ON transaction_categories FOR SELECT USING (true);

ALTER TABLE card_reward_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reward rules" ON card_reward_rules FOR SELECT USING (true);

ALTER TABLE card_reward_caps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reward caps" ON card_reward_caps FOR SELECT USING (true);

ALTER TABLE card_cap_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to cap links" ON card_cap_links FOR SELECT USING (true);

ALTER TABLE card_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to redemptions" ON card_redemptions FOR SELECT USING (true);

ALTER TABLE card_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to benefits" ON card_benefits FOR SELECT USING (true);

ALTER TABLE card_eligibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to eligibility" ON card_eligibility_rules FOR SELECT USING (true);
