-- ─────────────────────────────────────────────────────────────────────────────
--  RenoCred — Phase 3: Seed Master Data
--  Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Insert the master definitions for the available credit cards
-- These must exist in the database so users can add them to their wallets.

INSERT INTO cards (
  id, name, bank, network, annual_fee, fee_waiver_spend, 
  min_income, min_cibil, welcome_bonus, lounge_access, 
  base_reward_rate, gradient_from, gradient_to, is_active
) 
VALUES 
(
  'card-001', 
  'Signature Rewards', 
  'SBI', 
  'visa', 
  1000, 
  100000, 
  600000, 
  700, 
  '2000 Bonus Points on first spend', 
  4, 
  1.5, 
  '#1F5247', 
  '#456171', 
  TRUE
),
(
  'card-002', 
  'Platinum Travel', 
  'HDFC', 
  'mastercard', 
  2500, 
  250000, 
  1200000, 
  750, 
  'Complimentary flight ticket voucher', 
  8, 
  2.0, 
  '#B85C2A', 
  '#D4943A', 
  TRUE
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  bank = EXCLUDED.bank,
  network = EXCLUDED.network;
