-- =============================================================================
--  RENOCRED MIGRATION: 20261016000000_security_and_identity.sql
--
--  Idempotent and non-destructive. Safe to apply on top of 001/002 + the
--  2026-08/09 migrations in any state. See docs/review/supabase_architecture.md
--  ("Apply runbook") BEFORE running `supabase db push` against production:
--  the remote migration history is empty and 001 begins with DROP TABLE CASCADE.
--
--  1. requesting_user_id(): one helper for the Clerk subject claim.
--  2. Profile allowlist trigger only restricts end-user roles. Previously it
--     also fired inside SECURITY DEFINER RPCs (request.jwt.claims stays set),
--     so add_transaction_v1 raised on any purchase >= Rs 100 (points update)
--     and redeem_points_v1 always raised.
--  3. Clients can no longer INSERT their own users row with reward points.
--  4. Onboarding columns (+ age/CIBIL bands) exist on users.
--  5. verification_audit_log is no longer world-readable.
--  6. planning_sessions works with Clerk TEXT ids (was UUID + auth.uid()).
-- =============================================================================

-- ── 1. Identity helper ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')
$$;

COMMENT ON FUNCTION public.requesting_user_id() IS
  'Clerk user id (JWT sub). Use as (select public.requesting_user_id()) in RLS so it is evaluated once per statement.';

-- ── 2. Profile allowlist: restrict end users only ────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_profile_allowlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_old_jsonb JSONB;
  v_new_jsonb JSONB;
  v_allowed_keys TEXT[] := ARRAY[
    'name', 'phone', 'avatar_url', 'salary', 'credit_score',
    'onboarding_completed', 'user_segment', 'primary_goal', 'spend_categories',
    'city', 'occupation', 'age_band', 'cibil_band', 'updated_at'
  ];
BEGIN
  -- current_user is 'authenticated'/'anon' for PostgREST requests made with a
  -- user JWT. Inside SECURITY DEFINER functions it is the function owner, and
  -- the service role (webhooks, cron) is trusted — neither is restricted.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  v_old_jsonb := to_jsonb(OLD) - v_allowed_keys;
  v_new_jsonb := to_jsonb(NEW) - v_allowed_keys;

  IF v_old_jsonb IS DISTINCT FROM v_new_jsonb THEN
    RAISE EXCEPTION 'Unauthorized profile fields modified. Only explicit allowlist permitted.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_allowlist ON public.users;
CREATE TRIGGER trg_enforce_profile_allowlist
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_allowlist();

-- ── 3. Client inserts cannot mint reward points ──────────────────────────────
CREATE OR REPLACE FUNCTION public.guard_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    NEW.total_reward_points := 0;
    NEW.redeemed_reward_points := 0;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_user_insert ON public.users;
CREATE TRIGGER trg_guard_user_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_user_insert();

-- ── 4. Onboarding / profile columns ──────────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_segment TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS spend_categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS occupation TEXT;
-- Coarse bands are what onboarding asks for; exact salary/score stay optional.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS age_band TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cibil_band TEXT;

-- Existing users who already gave us a salary went through the old onboarding.
UPDATE public.users
   SET onboarding_completed = TRUE
 WHERE onboarding_completed IS DISTINCT FROM TRUE
   AND COALESCE(salary, 0) > 0;

-- ── 5. Audit log is internal ─────────────────────────────────────────────────
DO $$
BEGIN
  IF to_regclass('public.verification_audit_log') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow public read access to verification audit logs" ON public.verification_audit_log;
    ALTER TABLE public.verification_audit_log ENABLE ROW LEVEL SECURITY;
    -- No policy: only the service role (which bypasses RLS) can read it.
  END IF;
END $$;

-- ── 6. planning_sessions with Clerk ids ──────────────────────────────────────
-- 20260901 declared user_id UUID REFERENCES users(id) (TEXT), which cannot be
-- created, and its policies used auth.uid(), which cannot parse Clerk ids.
DO $$
DECLARE
  v_type TEXT;
BEGIN
  IF to_regclass('public.planning_sessions') IS NULL THEN
    CREATE TABLE public.planning_sessions (
      id UUID PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      plan_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      current_phase INTEGER NOT NULL DEFAULT 1,
      schema_version INTEGER NOT NULL DEFAULT 1,
      revision INTEGER NOT NULL DEFAULT 1,
      draft JSONB NOT NULL DEFAULT '{}'::jsonb,
      selected_plan JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ
    );
  ELSE
    SELECT data_type INTO v_type
      FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'planning_sessions' AND column_name = 'user_id';
    IF v_type = 'uuid' THEN
      ALTER TABLE public.planning_sessions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_planning_sessions_user_id ON public.planning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_sessions_plan_type ON public.planning_sessions(plan_type);
ALTER TABLE public.planning_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own planning sessions" ON public.planning_sessions;
DROP POLICY IF EXISTS "Users can insert their own planning sessions" ON public.planning_sessions;
DROP POLICY IF EXISTS "Users can update their own planning sessions" ON public.planning_sessions;
DROP POLICY IF EXISTS "Users can delete their own planning sessions" ON public.planning_sessions;
DROP POLICY IF EXISTS "Own planning sessions" ON public.planning_sessions;
CREATE POLICY "Own planning sessions" ON public.planning_sessions
  FOR ALL
  USING (user_id = (SELECT public.requesting_user_id()))
  WITH CHECK (user_id = (SELECT public.requesting_user_id()));

DROP FUNCTION IF EXISTS public.save_planning_session_v1(UUID, UUID, TEXT, TEXT, INTEGER, JSONB, JSONB, INTEGER);
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
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_current_revision INTEGER;
  v_row JSONB;
BEGIN
  IF v_uid IS NULL OR (p_user_id IS NOT NULL AND p_user_id <> v_uid) THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;

  SELECT revision INTO v_current_revision
    FROM public.planning_sessions
   WHERE id = p_id AND user_id = v_uid
   FOR UPDATE;

  IF FOUND THEN
    IF v_current_revision > p_expected_revision THEN
      RAISE EXCEPTION 'STALE_SAVE: Current revision % is newer than expected %', v_current_revision, p_expected_revision;
    END IF;
    UPDATE public.planning_sessions
       SET plan_type = COALESCE(p_plan_type, plan_type),
           status = COALESCE(p_status, status),
           current_phase = COALESCE(p_current_phase, current_phase),
           draft = COALESCE(p_draft, draft),
           selected_plan = COALESCE(p_selected_plan, selected_plan),
           revision = revision + 1,
           updated_at = now(),
           last_viewed_at = now()
     WHERE id = p_id AND user_id = v_uid
    RETURNING to_jsonb(planning_sessions.*) INTO v_row;
  ELSE
    INSERT INTO public.planning_sessions (id, user_id, plan_type, status, current_phase, draft, selected_plan, revision)
    VALUES (p_id, v_uid, p_plan_type, p_status, p_current_phase, COALESCE(p_draft, '{}'::jsonb), p_selected_plan, 1)
    RETURNING to_jsonb(planning_sessions.*) INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.save_planning_session_v1(UUID, TEXT, TEXT, TEXT, INTEGER, JSONB, JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_planning_session_v1(UUID, TEXT, TEXT, TEXT, INTEGER, JSONB, JSONB, INTEGER) TO authenticated;
