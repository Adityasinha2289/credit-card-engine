-- =============================================================================
--  RENOCRED MIGRATION: 20260817000000_corrective_schema_drift.sql
--  Phase 3: Corrective Schema Drift (Non-destructive)
-- =============================================================================

-- This migration ensures the canonical schema is intact after the rogue 20260726000000 migration.
-- We are not dropping rogue tables (e.g., profiles, category_budgets) to ensure production safety
-- (no destructive operations on unknown data).

-- Ensure canonical users table has all required fields for onboarding.
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_segment TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spend_categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Verify canonical user_cards has required fields expected by WalletService
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS last_4_digits TEXT;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS cardholder_name TEXT;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS expiry TEXT;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS credit_limit INTEGER DEFAULT 0;
ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Re-assert correct RLS on canonical tables just in case the rogue migration disabled them
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;

-- Note: The rogue migration 20260726000000_production_schema.sql should be ignored 
-- by application logic as it incorrectly transitions to 'profiles' and changes ID types.
