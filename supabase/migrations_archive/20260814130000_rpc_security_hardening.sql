-- =============================================================================
--  RENOCRED MIGRATION: 20260814130000_rpc_security_hardening.sql
--  Phase 2A.1: RPC Security Hardening & Authorization Verification
-- =============================================================================

-- 1. HARDENED ADD TRANSACTION RPC
CREATE OR REPLACE FUNCTION public.add_transaction_v1(
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
  v_auth_user TEXT;
  v_new_balance INTEGER;
  v_tx_id TEXT;
  v_result JSONB;
BEGIN
  -- Strict Authentication Check: Must have valid JWT sub claim
  v_auth_user := auth.jwt()->>'sub';
  IF v_auth_user IS NULL OR v_auth_user = '' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;

  -- IDOR Protection: p_user_id must match authenticated user
  IF p_user_id IS NOT NULL AND p_user_id <> '' AND p_user_id <> v_auth_user THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
  END IF;

  -- Force identity to authenticated user
  p_user_id := v_auth_user;

  -- Card Ownership Verification
  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_cards
      WHERE user_id = p_user_id AND (id::text = p_card_id OR card_id = p_card_id)
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Target card does not belong to user';
    END IF;
  END IF;

  -- Financial Input Validation
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Invalid transaction amount';
  END IF;

  v_tx_id := COALESCE(p_id, 'txn-' || gen_random_uuid()::text);

  -- Idempotency Check: Ignore duplicate submissions for the same transaction ID
  IF EXISTS (SELECT 1 FROM public.transactions WHERE id = v_tx_id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object(
      'status', 'already_exists',
      'id', v_tx_id
    );
  END IF;

  -- Step 1: Insert transaction
  INSERT INTO public.transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, created_at)
  VALUES (
    v_tx_id,
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
    UPDATE public.credit_accounts
    SET current_balance = GREATEST(0, current_balance + p_amount),
        updated_at = NOW()
    WHERE user_id = p_user_id AND (user_card_id = p_card_id OR card_id = p_card_id)
    RETURNING current_balance INTO v_new_balance;
  END IF;

  v_result := jsonb_build_object(
    'status', 'success',
    'id', v_tx_id,
    'new_balance', COALESCE(v_new_balance, 0)
  );
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$;


-- 2. HARDENED PAY BILL RPC
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
  v_auth_user TEXT;
  v_new_balance INTEGER;
  v_effective_payment INTEGER;
  v_tx_id TEXT;
  v_current_balance INTEGER;
BEGIN
  -- Strict Authentication Check
  v_auth_user := auth.jwt()->>'sub';
  IF v_auth_user IS NULL OR v_auth_user = '' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;

  IF p_user_id IS NOT NULL AND p_user_id <> '' AND p_user_id <> v_auth_user THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
  END IF;

  p_user_id := v_auth_user;

  -- Card Ownership Verification
  IF p_card_id IS NOT NULL AND p_card_id <> '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_cards
      WHERE user_id = p_user_id AND (id::text = p_card_id OR card_id = p_card_id)
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Target card does not belong to user';
    END IF;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid payment amount';
  END IF;

  -- Step 1: Fetch current balance
  SELECT current_balance INTO v_current_balance
  FROM public.credit_accounts
  WHERE user_id = p_user_id AND (user_card_id = p_card_id OR card_id = p_card_id);

  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;

  v_effective_payment := LEAST(p_amount, v_current_balance);
  IF v_effective_payment <= 0 THEN
    v_effective_payment := p_amount;
  END IF;

  v_tx_id := 'txn-pay-' || gen_random_uuid()::text;

  -- Step 2: Record credit payment transaction
  INSERT INTO public.transactions (id, user_id, card_id, merchant, amount, category, type, is_pending, created_at)
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
  UPDATE public.credit_accounts
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


-- 3. HARDENED ADD USER CARD RPC
CREATE OR REPLACE FUNCTION public.add_user_card_v1(
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
  v_auth_user TEXT;
  v_user_card_id TEXT;
BEGIN
  -- Strict Authentication Check
  v_auth_user := auth.jwt()->>'sub';
  IF v_auth_user IS NULL OR v_auth_user = '' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;

  IF p_user_id IS NOT NULL AND p_user_id <> '' AND p_user_id <> v_auth_user THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
  END IF;

  p_user_id := v_auth_user;

  -- Step 1: Insert user_cards record
  INSERT INTO public.user_cards (user_id, card_id, last_4_digits, cardholder_name, expiry, credit_limit, status)
  VALUES (p_user_id, p_card_id, p_last_4_digits, p_cardholder_name, p_expiry, p_credit_limit, 'active')
  RETURNING id::text INTO v_user_card_id;

  -- Step 2: Insert credit_accounts record
  INSERT INTO public.credit_accounts (user_id, card_id, user_card_id, current_balance, available_credit)
  VALUES (p_user_id, p_card_id, v_user_card_id, 0, p_credit_limit);

  RETURN jsonb_build_object(
    'status', 'success',
    'user_card_id', v_user_card_id
  );
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Add user card failed: %', SQLERRM;
END;
$$;


-- 4. RESTRICT FUNCTION EXECUTION PRIVILEGES (REVOKE FROM PUBLIC / ANON, GRANT TO AUTHENTICATED ONLY)

-- add_transaction_v1
REVOKE EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_transaction_v1(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT, BOOLEAN) TO authenticated;

-- pay_bill_v1
REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.pay_bill_v1(TEXT, TEXT, INTEGER) TO authenticated;

-- add_user_card_v1
REVOKE EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_user_card_v1(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
