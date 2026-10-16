-- =============================================================================
--  RENOCRED MIGRATION: 20261016020000_subscriptions_reminders.sql
--
--  Idempotent and non-destructive. Depends on 20261016000000 (requesting_user_id).
--
--  Extends the existing 002 `subscriptions` table (extend, don't replace — it is
--  the table the client already writes to) and adds what the reminder pipeline
--  needs:
--    • subscriptions: nullable card link (UPI / unknown card), status instead of
--      delete-on-cancel, real DATE for the next charge, trial/price-hike fields,
--      per-subscription reminder days, detected vs manual.
--    • notification_preferences: channels, default lead times, quiet hours.
--    • push_subscriptions: Web Push endpoints (one row per browser/device).
--    • reminder_deliveries: idempotency ledger. The cron claims a row BEFORE
--      sending, so a retried or overlapping run can never double-send.
-- =============================================================================

-- ── subscriptions ────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  -- card_id → user_cards(id) stays, but becomes optional and survives card removal.
  ALTER TABLE public.subscriptions ALTER COLUMN card_id DROP NOT NULL;

  SELECT conname INTO v_conname
    FROM pg_constraint
   WHERE conrelid = 'public.subscriptions'::regclass
     AND contype = 'f'
     AND conkey = ARRAY[(SELECT attnum FROM pg_attribute
                          WHERE attrelid = 'public.subscriptions'::regclass AND attname = 'card_id')]::smallint[];
  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.subscriptions DROP CONSTRAINT %I', v_conname);
  END IF;
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_card_id_fkey
    FOREIGN KEY (card_id) REFERENCES public.user_cards(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS next_billing_on DATE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS is_free_trial BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_on DATE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS has_price_hike BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS previous_amount INTEGER;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS reminder_days INTEGER[];
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_url TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- The legacy TEXT column stays (old clients write it); backfill the typed one.
ALTER TABLE public.subscriptions ALTER COLUMN next_billing_date DROP NOT NULL;
UPDATE public.subscriptions
   SET next_billing_on = substring(next_billing_date from 1 for 10)::date
 WHERE next_billing_on IS NULL
   AND next_billing_date ~ '^\d{4}-\d{2}-\d{2}';

DO $$
BEGIN
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'paused', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.subscriptions SET billing_cycle = 'yearly'
 WHERE lower(billing_cycle) IN ('annually', 'annual', 'year', 'yearly') AND billing_cycle <> 'yearly';
UPDATE public.subscriptions SET billing_cycle = lower(billing_cycle)
 WHERE billing_cycle <> lower(billing_cycle);
UPDATE public.subscriptions SET billing_cycle = 'monthly'
 WHERE billing_cycle NOT IN ('weekly', 'monthly', 'quarterly', 'yearly');

DO $$
BEGIN
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_billing_cycle_check
    CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly'));
EXCEPTION WHEN duplicate_object OR check_violation THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_reminder_days_check
    CHECK (reminder_days IS NULL OR (cardinality(reminder_days) <= 5 AND 0 <= ALL (reminder_days) AND 30 >= ALL (reminder_days)));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_due
  ON public.subscriptions (next_billing_on)
  WHERE status = 'active';

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Policy: same ownership rule, evaluated once per statement.
DROP POLICY IF EXISTS "Own subscriptions" ON public.subscriptions;
CREATE POLICY "Own subscriptions" ON public.subscriptions
  FOR ALL
  USING (user_id = (SELECT public.requesting_user_id()))
  WITH CHECK (user_id = (SELECT public.requesting_user_id()));

-- ── notification_preferences ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
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

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own notification preferences" ON public.notification_preferences;
CREATE POLICY "Own notification preferences" ON public.notification_preferences
  FOR ALL
  USING (user_id = (SELECT public.requesting_user_id()))
  WITH CHECK (user_id = (SELECT public.requesting_user_id()));

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── push_subscriptions ───────────────────────────────────────────────────────
-- Written by the server (api/reminders.ts, service role) after verifying the
-- Clerk session; users may read/delete their own rows.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint        TEXT NOT NULL UNIQUE,
  p256dh          TEXT NOT NULL,
  auth            TEXT NOT NULL,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_success_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Read own push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (user_id = (SELECT public.requesting_user_id()));
DROP POLICY IF EXISTS "Delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Delete own push subscriptions" ON public.push_subscriptions
  FOR DELETE USING (user_id = (SELECT public.requesting_user_id()));

-- ── reminder_deliveries ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminder_deliveries (
  id              BIGSERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  kind            TEXT NOT NULL,      -- renewal | trial_ending | price_hike | annual_renewal
  due_on          DATE NOT NULL,      -- the charge date the reminder is about
  lead_days       INTEGER NOT NULL,   -- days before due_on it was sent
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'push')),
  status          TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'sent', 'failed', 'skipped')),
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  UNIQUE (subscription_id, kind, due_on, lead_days, channel)
);

CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_user ON public.reminder_deliveries(user_id, created_at DESC);
ALTER TABLE public.reminder_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own reminder deliveries" ON public.reminder_deliveries;
CREATE POLICY "Read own reminder deliveries" ON public.reminder_deliveries
  FOR SELECT USING (user_id = (SELECT public.requesting_user_id()));
