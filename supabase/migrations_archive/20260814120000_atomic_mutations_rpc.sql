-- =============================================================================
--  RENOCRED MIGRATION: 20260814120000_atomic_mutations_rpc.sql
--  Phase 2A: Atomic Financial Mutations RPCs & Database Indexes
-- =============================================================================

-- 1. ATOMIC ADD TRANSACTION RPC
CREATE OR REPLACE FUNCTION add_transaction_v1(
  p_id TEXT,
  p_user_id TEXT,
  p_card_id TEXT,
  p_merchant TEXT,
  p_amount INTEGER,
  p_category TEXT,
  p_type TEXT DEFAULT 'debit',
  p_is_pending BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_result JSONB;
BEGIN
  -- Authorization verification
  IF auth.jwt() IS NOT NULL AND (auth.jwt()->>'sub') IS NOT NULL AND (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
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

  v_result := jsonb_build_object(
    'status', 'success',
    'id', p_id,
    'new_balance', COALESCE(v_new_balance, 0)
  );
  RETURN v_result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. ATOMIC PAY BILL RPC
CREATE OR REPLACE FUNCTION pay_bill_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_amount INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_effective_payment INTEGER;
  v_tx_id TEXT;
  v_current_balance INTEGER;
BEGIN
  IF auth.jwt() IS NOT NULL AND (auth.jwt()->>'sub') IS NOT NULL AND (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
  END IF;

  -- Step 1: Fetch current balance
  SELECT current_balance INTO v_current_balance
  FROM credit_accounts
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. ATOMIC ADD USER CARD RPC
CREATE OR REPLACE FUNCTION add_user_card_v1(
  p_user_id TEXT,
  p_card_id TEXT,
  p_last_4_digits TEXT,
  p_cardholder_name TEXT,
  p_expiry TEXT,
  p_credit_limit INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_user_card_id TEXT;
BEGIN
  IF auth.jwt() IS NOT NULL AND (auth.jwt()->>'sub') IS NOT NULL AND (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. DATABASE INDEX ANALYSIS & CREATION
-- Composite index for fast transaction feed retrieval ordered by date descending
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- Index for card-filtered transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_card ON transactions(user_id, card_id);

-- Index for user_cards lookup
CREATE INDEX IF NOT EXISTS idx_user_cards_user ON user_cards(user_id);
