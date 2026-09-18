-- =============================================================================
--  RENOCRED MIGRATION: 20260822000000_fix_p0_001_auth_bypass.sql
--  Fix P0-001: Fix RLS/Auth bypass where missing auth fails open
-- =============================================================================

-- Redefine add_transaction_v1 with fail-closed auth
CREATE OR REPLACE FUNCTION add_transaction_v1(
  p_id TEXT,
  p_user_id TEXT,
  p_card_id TEXT,
  p_merchant TEXT,
  p_amount INTEGER,
  p_category TEXT,
  p_type TEXT DEFAULT 'debit',
  p_is_pending BOOLEAN DEFAULT false
) RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_balance INTEGER;
  v_result JSONB;
  v_reward_points INTEGER;
BEGIN
  -- Authorization verification: User can only add transactions for themselves
  IF auth.jwt() IS NULL OR (auth.jwt()->>'sub') IS NULL OR (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch or missing';
  END IF;

  -- Financial Input Integrity: Amount must be positive for standard transactions
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Transaction amount must be strictly positive.';
  END IF;

  -- Step 1: Insert transaction
  INSERT INTO transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, created_at)
  VALUES (
    COALESCE(p_id, 'txn-' || gen_random_uuid()::text),
    p_user_id,
    p_card_id,
    p_merchant,
    p_amount,
    p_category,
    p_type,
    p_is_pending,
    NOW()
  );

  -- Step 2: Update credit account balance if card_id is provided
  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    UPDATE credit_accounts
    SET current_balance = GREATEST(0, current_balance + p_amount),
        updated_at = NOW()
    WHERE user_id = p_user_id AND (user_card_id = p_card_id OR card_id = p_card_id)
    RETURNING current_balance INTO v_new_balance;
  END IF;

  -- Step 3: Calculate basic reward points securely on the server (1% standard rate = 1 point per 100 paise)
  v_reward_points := FLOOR(p_amount / 100);
  
  IF v_reward_points > 0 THEN
    -- Bypass standard client constraints by executing as the SECURITY DEFINER role
    UPDATE users
    SET total_reward_points = COALESCE(total_reward_points, 0) + v_reward_points,
        updated_at = NOW()
    WHERE id = p_user_id;
  END IF;

  v_result := jsonb_build_object(
    'status', 'success',
    'id', p_id,
    'new_balance', COALESCE(v_new_balance, 0),
    'reward_points', v_reward_points
  );
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$;


-- Redefine pay_bill_v1 with fail-closed auth
CREATE OR REPLACE FUNCTION pay_bill_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_amount INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_new_balance INTEGER;
  v_effective_payment INTEGER;
  v_tx_id TEXT;
  v_current_balance INTEGER;
BEGIN
  -- Strict fail-closed authorization: Rejects if unauthenticated, missing sub, or mismatch
  IF auth.jwt() IS NULL OR (auth.jwt()->>'sub') IS NULL OR (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch or missing';
  END IF;

  -- Financial Input Integrity: Prevent negative/zero payments increasing debt
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be strictly positive.';
  END IF;

  -- Step 1: Fetch current balance WITH ROW LOCK to prevent concurrent double-payments (TOCTOU)
  SELECT current_balance INTO v_current_balance
  FROM credit_accounts
  WHERE user_id = p_user_id AND (user_card_id = p_card_id OR card_id = p_card_id)
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;

  v_effective_payment := LEAST(p_amount, v_current_balance);
  IF v_effective_payment <= 0 THEN
    v_effective_payment := p_amount;
  END IF;

  v_tx_id := 'txn-pay-' || gen_random_uuid()::text;

  -- Step 2: Record credit payment transaction
  INSERT INTO transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, created_at)
  VALUES (
    v_tx_id,
    p_user_id,
    p_card_id,
    'Bill Payment',
    -v_effective_payment,
    'other',
    'credit',
    false,
    NOW()
  );

  -- Step 3: Update balance
  UPDATE credit_accounts
  SET current_balance = GREATEST(0, current_balance - v_effective_payment),
      updated_at = NOW()
  WHERE user_id = p_user_id AND (user_card_id = p_card_id OR card_id = p_card_id)
  RETURNING current_balance INTO v_new_balance;

  RETURN jsonb_build_object(
    'status', 'success',
    'id', v_tx_id,
    'new_balance', COALESCE(v_new_balance, 0),
    'payment_amount', v_effective_payment
  );
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Bill payment failed: %', SQLERRM;
END;
$$;


-- Redefine add_user_card_v1 with fail-closed auth
CREATE OR REPLACE FUNCTION add_user_card_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_last_4_digits TEXT,
  p_cardholder_name TEXT,
  p_expiry TEXT,
  p_credit_limit INTEGER
) RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_card_id TEXT;
BEGIN
  -- Strict fail-closed authorization: Rejects if unauthenticated, missing sub, or mismatch
  IF auth.jwt() IS NULL OR (auth.jwt()->>'sub') IS NULL OR (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch or missing';
  END IF;

  -- Step 1: Insert user_cards record
  INSERT INTO user_cards (user_id, card_id, last_4_digits, cardholder_name, expiry, credit_limit, status)
  VALUES (p_user_id, p_card_id, p_last_4_digits, p_cardholder_name, p_expiry, p_credit_limit, 'active')
  RETURNING id::text INTO v_user_card_id;

  -- Step 2: Insert credit_accounts record
  INSERT INTO credit_accounts (user_id, card_id, user_card_id, current_balance, available_credit)
  VALUES (p_user_id, p_card_id, v_user_card_id, 0, p_credit_limit);

  RETURN jsonb_build_object(
    'status', 'success',
    'user_card_id', v_user_card_id
  );
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Add user card failed: %', SQLERRM;
END;
$$;

-- Enforce principle of least privilege: Revoke from public/anon, grant to authenticated
REVOKE EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
