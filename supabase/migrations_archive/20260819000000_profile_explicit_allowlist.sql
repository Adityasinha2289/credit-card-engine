-- =============================================================================
--  RENOCRED MIGRATION: 20260819000000_profile_explicit_allowlist.sql
--  Fix 08: Harden Profile Update Authorization (Explicit Database Allowlist)
-- =============================================================================

-- Drop the old overly-permissive trigger
DROP TRIGGER IF EXISTS trg_protect_user_financials ON users;
DROP FUNCTION IF EXISTS protect_user_financial_fields();

-- Create the robust explicit allowlist function
CREATE OR REPLACE FUNCTION enforce_profile_allowlist()
RETURNS TRIGGER AS $$
DECLARE
  v_old_jsonb JSONB;
  v_new_jsonb JSONB;
  v_allowed_keys TEXT[] := ARRAY[
    'name', 
    'phone', 
    'avatar_url', 
    'salary', 
    'credit_score', 
    'onboarding_completed', 
    'user_segment', 
    'primary_goal', 
    'spend_categories', 
    'city', 
    'occupation',
    'updated_at'  -- Managed by system trigger, safe to exclude from the diff check
  ];
BEGIN
  -- We only enforce this for authenticated API requests, not service_role/admin bypasses.
  IF (current_setting('request.jwt.claims', true) IS NOT NULL AND auth.jwt() IS NOT NULL) THEN
    
    -- Convert OLD and NEW rows to JSONB
    v_old_jsonb := to_jsonb(OLD);
    v_new_jsonb := to_jsonb(NEW);
    
    -- Strip the allowed keys out of both JSON objects
    v_old_jsonb := v_old_jsonb - v_allowed_keys;
    v_new_jsonb := v_new_jsonb - v_allowed_keys;
    
    -- If there is ANY difference in the remaining keys, the client attempted to modify an unlisted column!
    -- Note: We use jsonb_strip_nulls just in case, but even NULL -> NULL is safe.
    IF (v_old_jsonb IS DISTINCT FROM v_new_jsonb) THEN
      RAISE EXCEPTION 'Unauthorized profile fields modified. Only explicit allowlist permitted. (Fields rejected)';
    END IF;

  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the new trigger to the `users` table
CREATE TRIGGER trg_enforce_profile_allowlist
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION enforce_profile_allowlist();
