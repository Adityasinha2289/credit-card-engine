-- =============================================================================
--  RENOCRED MIGRATION: 20261016010000_money_integrity.sql
--
--  Idempotent and non-destructive. Depends on 20261016000000 (requesting_user_id).
--
--  1. transactions.txn_date — when the money moved (SMS / back-dated entries),
--     separate from created_at (when the row was saved). Month boundaries use it.
--  2. transactions.reward_points — server-computed, returned to the client.
--  3. credit_accounts.due_date / next_statement_date become real DATEs (junk
--     strings such as card expiry "08/30" are cleared first).
--  4. add_transaction_v2 — identity from the JWT (no p_user_id), card ownership
--     + idempotency checks (dropped again by 0820-0823), refunds/credits
--     supported, txn_date honoured, points returned.
--  5. pay_bill_v1 — refuses to record a payment against a zero balance
--     (previously recorded a phantom full-amount credit).
--  6. savings_goals (paise) with RLS.
--  7. Missing indexes on hot paths and commerce foreign keys.
-- =============================================================================

-- ── 1/2. transactions ────────────────────────────────────────────────────────
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS txn_date DATE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reward_points INTEGER NOT NULL DEFAULT 0;

UPDATE public.transactions
   SET txn_date = (created_at AT TIME ZONE 'Asia/Kolkata')::date
 WHERE txn_date IS NULL AND created_at IS NOT NULL;

ALTER TABLE public.transactions ALTER COLUMN txn_date SET DEFAULT ((now() AT TIME ZONE 'Asia/Kolkata')::date);

CREATE INDEX IF NOT EXISTS idx_transactions_user_txn_date
  ON public.transactions (user_id, txn_date DESC);

-- ── 3. credit account dates ──────────────────────────────────────────────────
DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT data_type INTO v_type FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'credit_accounts' AND column_name = 'due_date';
  IF v_type = 'text' THEN
    UPDATE public.credit_accounts SET due_date = NULL
     WHERE due_date IS NOT NULL AND due_date !~ '^\d{4}-\d{2}-\d{2}';
    ALTER TABLE public.credit_accounts
      ALTER COLUMN due_date TYPE DATE USING NULLIF(substring(due_date from 1 for 10), '')::date;
  END IF;

  SELECT data_type INTO v_type FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'credit_accounts' AND column_name = 'next_statement_date';
  IF v_type = 'text' THEN
    UPDATE public.credit_accounts SET next_statement_date = NULL
     WHERE next_statement_date IS NOT NULL AND next_statement_date !~ '^\d{4}-\d{2}-\d{2}';
    ALTER TABLE public.credit_accounts
      ALTER COLUMN next_statement_date TYPE DATE USING NULLIF(substring(next_statement_date from 1 for 10), '')::date;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_credit_accounts_due_date
  ON public.credit_accounts (due_date) WHERE due_date IS NOT NULL;

-- ── 4. add_transaction_v2 ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.add_transaction_v2(
  p_id TEXT,
  p_card_id TEXT,
  p_merchant TEXT,
  p_amount INTEGER,           -- paise; purchases > 0, refunds/credits < 0 (sign is normalised)
  p_category TEXT,
  p_type TEXT DEFAULT 'debit', -- debit | refund | credit
  p_is_pending BOOLEAN DEFAULT FALSE,
  p_date DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_id TEXT := COALESCE(NULLIF(p_id, ''), 'txn-' || gen_random_uuid()::text);
  v_type TEXT := lower(COALESCE(p_type, 'debit'));
  v_amount INTEGER;
  v_points INTEGER := 0;
  v_new_balance INTEGER;
  v_existing RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: authentication required' USING ERRCODE = '42501';
  END IF;
  IF v_type NOT IN ('debit', 'refund', 'credit') THEN
    RAISE EXCEPTION 'Invalid transaction type %', v_type USING ERRCODE = '22023';
  END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Transaction amount must be non-zero' USING ERRCODE = '22023';
  END IF;
  IF p_date IS NOT NULL AND (p_date > (now() AT TIME ZONE 'Asia/Kolkata')::date + 1 OR p_date < DATE '2000-01-01') THEN
    RAISE EXCEPTION 'Transaction date out of range' USING ERRCODE = '22023';
  END IF;

  -- Purchases are positive, money coming back is negative — regardless of what the client sent.
  v_amount := CASE WHEN v_type = 'debit' THEN abs(p_amount) ELSE -abs(p_amount) END;

  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_cards
       WHERE user_id = v_uid AND (card_id = p_card_id OR id = p_card_id)
    ) THEN
      RAISE EXCEPTION 'Card does not belong to user' USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Idempotent retries: same id → same result, no double balance/points.
  SELECT id, reward_points INTO v_existing FROM public.transactions WHERE id = v_id AND user_id = v_uid;
  IF FOUND THEN
    RETURN jsonb_build_object('status', 'already_exists', 'id', v_id,
                              'points', v_existing.reward_points, 'reward_points', v_existing.reward_points);
  END IF;

  IF v_type = 'debit' THEN
    v_points := FLOOR(v_amount / 10000); -- 1 point per Rs 100 (10,000 paise)
  END IF;

  INSERT INTO public.transactions
    (id, user_id, card_id, merchant, amount, category, type, is_pending, txn_date, reward_points, created_at)
  VALUES
    (v_id, v_uid, NULLIF(p_card_id, ''), left(COALESCE(p_merchant, 'Unknown'), 120), v_amount,
     COALESCE(NULLIF(p_category, ''), 'other'), v_type, COALESCE(p_is_pending, FALSE),
     COALESCE(p_date, (now() AT TIME ZONE 'Asia/Kolkata')::date), v_points, now());

  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    UPDATE public.credit_accounts
       SET current_balance = GREATEST(0, current_balance + v_amount),
           updated_at = now()
     WHERE user_id = v_uid AND (card_id = p_card_id OR user_card_id = p_card_id)
    RETURNING current_balance INTO v_new_balance;
  END IF;

  IF v_points > 0 THEN
    UPDATE public.users
       SET total_reward_points = COALESCE(total_reward_points, 0) + v_points,
           updated_at = now()
     WHERE id = v_uid;
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'id', v_id,
    'new_balance', COALESCE(v_new_balance, 0),
    'points', v_points,
    'reward_points', v_points
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_transaction_v2(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_transaction_v2(TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN, DATE) TO authenticated;

-- ── 5. pay_bill_v1: no phantom payments ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pay_bill_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_amount INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid TEXT := public.requesting_user_id();
  v_current_balance INTEGER;
  v_effective_payment INTEGER;
  v_new_balance INTEGER;
  v_tx_id TEXT := 'txn-pay-' || gen_random_uuid()::text;
BEGIN
  IF v_uid IS NULL OR v_uid <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch or missing' USING ERRCODE = '42501';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be strictly positive.' USING ERRCODE = '22023';
  END IF;

  -- Row lock prevents concurrent double payments.
  SELECT current_balance INTO v_current_balance
    FROM public.credit_accounts
   WHERE user_id = v_uid AND (user_card_id = p_card_id OR card_id = p_card_id)
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found' USING ERRCODE = 'P0002';
  END IF;
  IF COALESCE(v_current_balance, 0) <= 0 THEN
    RAISE EXCEPTION 'NOTHING_TO_PAY: card has no outstanding balance' USING ERRCODE = '22023';
  END IF;

  v_effective_payment := LEAST(p_amount, v_current_balance);

  INSERT INTO public.transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, txn_date, created_at)
  VALUES (v_tx_id, v_uid, p_card_id, 'Bill Payment', -v_effective_payment, 'other', 'credit', FALSE,
          (now() AT TIME ZONE 'Asia/Kolkata')::date, now());

  UPDATE public.credit_accounts
     SET current_balance = current_balance - v_effective_payment,
         updated_at = now()
   WHERE user_id = v_uid AND (user_card_id = p_card_id OR card_id = p_card_id)
  RETURNING current_balance INTO v_new_balance;

  RETURN jsonb_build_object(
    'status', 'success',
    'id', v_tx_id,
    'new_balance', COALESCE(v_new_balance, 0),
    'payment_amount', v_effective_payment
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) TO authenticated;

-- ── 6. savings_goals ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id              TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  target_amount        BIGINT NOT NULL CHECK (target_amount > 0),        -- paise
  current_amount       BIGINT NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  monthly_contribution BIGINT NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
  deadline             DATE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own savings goals" ON public.savings_goals;
CREATE POLICY "Own savings goals" ON public.savings_goals
  FOR ALL
  USING (user_id = (SELECT public.requesting_user_id()))
  WITH CHECK (user_id = (SELECT public.requesting_user_id()));

DROP TRIGGER IF EXISTS savings_goals_updated_at ON public.savings_goals;
CREATE TRIGGER savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 7. Indexes on foreign keys used by joins / cascades ─────────────────────
DO $$
BEGIN
  IF to_regclass('public.tracking_events') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_tracking_events_partner ON public.tracking_events(partner_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_events_offer ON public.tracking_events(offer_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_events_user ON public.tracking_events(user_id);
  END IF;
  IF to_regclass('public.conversions') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_conversions_tracking_event ON public.conversions(tracking_event_id);
  END IF;
  IF to_regclass('public.commissions') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_commissions_conversion ON public.commissions(conversion_id);
  END IF;
  IF to_regclass('public.commerce_entities') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_commerce_entities_category ON public.commerce_entities(category_id);
    CREATE INDEX IF NOT EXISTS idx_commerce_entities_partner ON public.commerce_entities(partner_id);
  END IF;
  IF to_regclass('public.categories') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
  END IF;
END $$;
