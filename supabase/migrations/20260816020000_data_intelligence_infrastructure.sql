-- =============================================================================
--  RENOCRED DATA INTELLIGENCE INFRASTRUCTURE MIGRATION
--  Migration File: 20260816020000_data_intelligence_infrastructure.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS FOR PROVENANCE & VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM (
    'DRAFT',
    'EXTRACTED',
    'VALIDATED',
    'PENDING_REVIEW',
    'VERIFIED',
    'ACTIVE',
    'SUPERSEDED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE source_type_enum AS ENUM (
    'ISSUER_MITC',
    'ISSUER_PRODUCT_PAGE',
    'ISSUER_REWARD_PORTAL',
    'ISSUER_FEE_SCHEDULE',
    'REGULATORY_FILING'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE snapshot_status_enum AS ENUM (
    'ARCHIVED',
    'VERIFIED',
    'DEPRECATED',
    'FAILED_FETCH'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. IMMUTABLE SOURCE SNAPSHOTS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS source_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  source_type source_type_enum NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  document_title TEXT,
  content_sha256 VARCHAR(64) NOT NULL,
  storage_uri TEXT,
  effective_date DATE,
  status snapshot_status_enum NOT NULL DEFAULT 'ARCHIVED',
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_source_snapshot_hash UNIQUE (source_url, content_sha256)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. AUDIT TRAIL FOR DATA VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'card', 'reward_rule', 'cap', 'redemption', 'eligibility'
  entity_id UUID NOT NULL,
  previous_status verification_status_enum,
  new_status verification_status_enum NOT NULL,
  verified_by TEXT NOT NULL,
  snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MODIFY EXISTING TABLES (TEMPORAL VERSIONING & PROVENANCE)
-- ─────────────────────────────────────────────────────────────────────────────

-- 4.1 card_reward_rules
ALTER TABLE card_reward_rules
  ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS effective_until DATE,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_uncapped BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS raw_source_excerpt TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 4.2 card_redemptions
ALTER TABLE card_redemptions
  ADD COLUMN IF NOT EXISTS points_required NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS min_redemption_units INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS redemption_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_partner VARCHAR(100),
  ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS effective_until DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 4.3 card_reward_caps
ALTER TABLE card_reward_caps
  ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS effective_until DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 4.4 card_eligibility_rules
ALTER TABLE card_eligibility_rules
  ADD COLUMN IF NOT EXISTS min_age INT,
  ADD COLUMN IF NOT EXISTS max_age INT,
  ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS effective_until DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 4.5 card_benefits
ALTER TABLE card_benefits
  ADD COLUMN IF NOT EXISTS effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS effective_until DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status verification_status_enum NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES source_snapshots(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS POLICIES FOR NEW INFRASTRUCTURE
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE source_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to source snapshots" ON source_snapshots FOR SELECT USING (true);

ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to verification audit logs" ON verification_audit_log FOR SELECT USING (true);
