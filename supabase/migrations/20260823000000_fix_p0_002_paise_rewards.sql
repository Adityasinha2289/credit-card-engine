-- =============================================================================
--  RENOCRED MIGRATION: 20260823000000_fix_p0_002_paise_rewards.sql
--  Fix P0-002: Fix 100x reward calculation bug by correctly scaling paise
-- =============================================================================

-- Redefine add_transaction_v1 with correct reward calculation
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

  -- Step 3: Calculate basic reward points securely on the server
  -- p_amount is in paise. 1 point = 1 rupee.
  -- 1% standard rate means 1 point per 100 rupees spent (which is 10,000 paise).
  v_reward_points := FLOOR(p_amount / 10000);
  
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
