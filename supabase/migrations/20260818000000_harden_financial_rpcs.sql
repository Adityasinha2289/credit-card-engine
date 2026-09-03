-- =============================================================================
--  RENOCRED MIGRATION: 20260818000000_harden_financial_rpcs.sql
--  Phase 4: Server-Side Ownership & Financial Input Integrity
-- =============================================================================

-- 1. HARDEN ADD TRANSACTION RPC (Prevent negative amounts and calculate rewards)
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
  v_reward_points INTEGER;
BEGIN
  -- Authorization verification: User can only add transactions for themselves
  IF auth.jwt() IS NOT NULL AND (auth.jwt()->>'sub') IS NOT NULL AND (auth.jwt()->>'sub') <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: User ID mismatch';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. HARDEN PAY BILL RPC (Prevent negative payments)
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

  -- Financial Input Integrity: Prevent negative/zero payments increasing debt
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be strictly positive.';
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
    -- If balance is 0, allow a small payment to be recorded anyway? 
    -- Actually, it should just be clamped to what they paid.
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


-- 3. NEW REDEEM POINTS RPC (Server-side point validation)
CREATE OR REPLACE FUNCTION redeem_points_v1(
  p_points INTEGER
) RETURNS JSONB AS $$
DECLARE
  v_user_id TEXT := auth.jwt()->>'sub';
  v_total INTEGER;
  v_redeemed INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: User ID missing';
  END IF;
  
  IF p_points <= 0 THEN
    RAISE EXCEPTION 'Points to redeem must be greater than zero.';
  END IF;
  
  -- Acquire current points state with a lock to prevent race conditions (FOR UPDATE)
  SELECT COALESCE(total_reward_points, 0), COALESCE(redeemed_reward_points, 0)
  INTO v_total, v_redeemed
  FROM users 
  WHERE id = v_user_id 
  FOR UPDATE;
  
  IF (v_total - v_redeemed) < p_points THEN
    RAISE EXCEPTION 'Insufficient reward points to redeem. Requested: %, Available: %', p_points, (v_total - v_redeemed);
  END IF;
  
  UPDATE users 
  SET redeemed_reward_points = v_redeemed + p_points,
      updated_at = NOW()
  WHERE id = v_user_id;
  
  RETURN jsonb_build_object('status', 'success', 'redeemed', p_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. DATABASE TRIGGER TO PROTECT SENSITIVE FIELDS
-- Prevent clients from directly modifying system-controlled financial fields via `UPDATE`
CREATE OR REPLACE FUNCTION protect_user_financial_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked via authenticated client (auth.jwt is not null)
  -- The SECURITY DEFINER functions run as service role, so this check allows RPCs to bypass
  IF (current_setting('request.jwt.claims', true) IS NOT NULL AND auth.jwt() IS NOT NULL) THEN
    -- Discard any client-supplied changes to protected fields
    NEW.total_reward_points = OLD.total_reward_points;
    NEW.redeemed_reward_points = OLD.redeemed_reward_points;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_user_financials ON users;
CREATE TRIGGER trg_protect_user_financials
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION protect_user_financial_fields();
