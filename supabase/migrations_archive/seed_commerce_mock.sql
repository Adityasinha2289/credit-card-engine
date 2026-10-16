-- RENO CRED 2.0 - COMMERCE MOCK DATA SEED
-- Stable deterministic seed

-- 1. CATEGORIES
INSERT INTO categories (id, slug, name, parent_id, status) VALUES
('1791e511-224e-41d7-aff7-650267bed62b', 'shopping', 'Shopping', NULL, 'active'),
('e8221c11-7da3-4997-8d18-19cadfa844c0', 'fitness', 'Fitness', NULL, 'active'),
('b79c0055-d232-401f-9875-d0f004b79b7f', 'dining', 'Dining', NULL, 'active'),
('43cc26b3-8c36-41e0-9cd9-5a1b346f4260', 'travel', 'Travel', NULL, 'active'),
('ae19bca5-9d2b-4241-9905-54c36b6ec8db', 'accommodation', 'Accommodation', NULL, 'active'),
('a7033d1b-cb17-4452-bc74-dceacd1b2c1d', 'transport', 'Transport', NULL, 'active'),
('35310e0d-b469-47fc-bfde-6621810565f8', 'entertainment', 'Entertainment', NULL, 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  slug = EXCLUDED.slug, 
  status = EXCLUDED.status;

-- 2. PARTNERS
INSERT INTO partners (id, slug, name, primary_category_id, description, logo_url, status) VALUES
('86464532-7e4c-456a-b028-fe1ea86bc651', 'part-nike', 'Nike', '1791e511-224e-41d7-aff7-650267bed62b', 'Premium athletic footwear and apparel.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 'active'),
('2f68f5ab-b604-4edb-87c8-5eba01d34651', 'part-cultfit', 'Cult.fit', 'e8221c11-7da3-4997-8d18-19cadfa844c0', 'Upgrade your fitness with premium workouts.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', 'active'),
('4b7e75cf-3bc9-4167-8d85-6a79c22874c1', 'part-uber', 'Uber', 'a7033d1b-cb17-4452-bc74-dceacd1b2c1d', 'Rides and transport.', NULL, 'active'),
('bd799d55-10dc-4638-81d0-837bb524cec3', 'part-olive', 'Olive Bar & Kitchen', 'b79c0055-d232-401f-9875-d0f004b79b7f', 'Romantic Mediterranean dining experience.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', 'active'),
('fcee8ee1-4de2-47fc-85f7-f0ac01161f66', 'part-taj', 'Taj Hotels', 'ae19bca5-9d2b-4241-9905-54c36b6ec8db', 'Luxury stays and hospitality.', NULL, 'active'),
('95b70ce7-a6a6-48bb-8c7c-864adaa4346c', 'part-makemytrip', 'MakeMyTrip', '43cc26b3-8c36-41e0-9cd9-5a1b346f4260', 'Book flights and hotels seamlessly.', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description, 
  logo_url = EXCLUDED.logo_url;

-- 3. COMMERCE ENTITIES
INSERT INTO commerce_entities (id, partner_id, category_id, entity_type, name, base_price, currency, destination_path, image_url, status) VALUES
('b46c7425-ec66-4bba-b41c-0f07b7779785', '86464532-7e4c-456a-b028-fe1ea86bc651', '1791e511-224e-41d7-aff7-650267bed62b', 'product', 'Nike Air Max 270', 12000, 'INR', '/shop/nike-am270', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', 'active'),
('bf36d4f6-fc6a-4226-ac0a-24640f58bcc5', '2f68f5ab-b604-4edb-87c8-5eba01d34651', 'e8221c11-7da3-4997-8d18-19cadfa844c0', 'subscription', 'Cultpass Pro (12 Months)', 15000, 'INR', '/fitness/cultpass', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  base_price = EXCLUDED.base_price, 
  image_url = EXCLUDED.image_url;

-- 4. OFFERS
INSERT INTO offers (id, offer_type, source, title, description, value, min_spend, max_discount, valid_from, valid_until, eligibility_rules, status) VALUES
-- Nike 10% Discount
('c43d9ade-35bb-4f5e-99b2-04e84397ee5a', 'percentage_discount', 'merchant', 'Nike 10% Discount', '10% off on all Nike orders above ₹3000.', 10, 3000, 500, '2024-01-01', '2030-12-31', '{"partnerIds":["part-nike"],"mutuallyExclusiveSource":true}'::jsonb, 'active'),

-- HDFC Diners 5X
('81ca6c06-40db-40ab-b74b-030069275d6f', 'points', 'bank', 'HDFC Diners 5X Rewards', 'Earn 5X Reward Points on Dining.', 16.5, NULL, NULL, '2024-01-01', '2030-12-31', '{"categories":["dining"],"paymentMethodIds":["pm-hdfc-diners"]}'::jsonb, 'active'),

-- SBI Cashback
('40098151-2585-4d00-82d5-e82531e9140c', 'cashback', 'bank', 'SBI Cashback', '5% unlimited cashback on online spends.', 5, NULL, NULL, '2024-01-01', '2030-12-31', '{"categories":["shopping","travel","entertainment"],"paymentMethodIds":["pm-sbi-cashback"]}'::jsonb, 'active'),

-- Axis Ace
('66aaf29e-01a5-4959-80e9-549b963c5331', 'cashback', 'bank', 'Axis Ace Flat Cashback', '2% cashback on all spends.', 2, NULL, NULL, '2024-01-01', '2030-12-31', '{"paymentMethodIds":["pm-axis-ace"]}'::jsonb, 'active'),

-- Cult.fit Flat ₹1000
('8669f835-02a3-4dd9-89ae-c2eb44aa684a', 'flat_discount', 'merchant', 'Cult.fit ₹1000 Off', 'Flat ₹1000 discount on fitness memberships.', 1000, 10000, NULL, '2024-01-01', '2030-12-31', '{"partnerIds":["part-cultfit"],"mutuallyExclusiveSource":true}'::jsonb, 'active'),

-- Visa Dining
('a0c3b018-0f01-44dc-9d41-e945c11bc3ab', 'percentage_discount', 'card_network', 'Visa Dining Delights', '15% off on dining with Visa cards.', 15, NULL, 300, '2024-01-01', '2030-12-31', '{"categories":["dining"],"paymentMethodTypes":["credit_card","debit_card"]}'::jsonb, 'active'),

-- Nike Flat ₹200
('f19f18b3-3a56-42bb-a4f6-8c413b5ccbd3', 'flat_discount', 'merchant', 'Nike Flat ₹200', 'Flat ₹200 off.', 200, NULL, NULL, '2024-01-01', '2030-12-31', '{"partnerIds":["part-nike"],"mutuallyExclusiveSource":true}'::jsonb, 'active')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  description = EXCLUDED.description, 
  value = EXCLUDED.value, 
  eligibility_rules = EXCLUDED.eligibility_rules;
