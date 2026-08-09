-- BACKFILL PAYMENT METHODS

INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('0932d9b9-53cd-5eee-8a86-0da64fbf909b', 'user_3FzC9MJOgS5BYiD41Lg8tn15srz', 'credit_card', 'INDUSIND Visa - 8758', 'INDUSIND', '{"network":"Visa","panLast4":"8758","legacy_card_id":"indusind_platinum_visa"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('9b2c2fb8-4001-53d3-884e-4e442e94d4fc', 'user_3GRGB1cIK7BsRzB092qTlZDIYJ3', 'credit_card', 'SBI Visa - 8969', 'SBI', '{"network":"Visa","panLast4":"8969","legacy_card_id":"sbi_aurum"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('4a51abbb-e3a1-5036-b259-f7fbbfa1316e', 'user_3GN5qKR5eKqtRYHUePZDkE9G6TS', 'credit_card', 'HDFC Mastercard - 7986', 'HDFC', '{"network":"Mastercard","panLast4":"7986","legacy_card_id":"hdfc_swiggy"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('d0274595-997d-543c-9178-16a520b70b98', 'user_3GN5qKR5eKqtRYHUePZDkE9G6TS', 'credit_card', 'AXIS Visa - 6576', 'AXIS', '{"network":"Visa","panLast4":"6576","legacy_card_id":"axis_indianoil"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('186519a8-e69a-5570-948c-2d9fdb69d9f7', 'user_3FzBCNZkJYJf4tnGnB8A7KCl0QI', 'credit_card', 'INDUSIND Visa - 7969', 'INDUSIND', '{"network":"Visa","panLast4":"7969","legacy_card_id":"indusind_platinum_visa"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('21052911-f0bb-515f-b552-8b70d5d8cd22', 'user_3FzBCNZkJYJf4tnGnB8A7KCl0QI', 'credit_card', 'ICICI Visa - 7679', 'ICICI', '{"network":"Visa","panLast4":"7679","legacy_card_id":"icici_emeralde_private_metal"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('7e45ac4a-4a5b-544e-9df7-aa125e1373d7', 'user_3FzBCNZkJYJf4tnGnB8A7KCl0QI', 'credit_card', 'HDFC Mastercard - 8689', 'HDFC', '{"network":"Mastercard","panLast4":"8689","legacy_card_id":"hdfc_swiggy"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('a241d7d9-d376-55cf-8f91-3a267e2eb095', 'user_3GlFLsYqyh7ab2J4UIsOoJzCv2j', 'credit_card', 'ICICI Visa - 6868', 'ICICI', '{"network":"Visa","panLast4":"6868","legacy_card_id":"icici_sapphiro"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('86b098c6-fff3-5cc9-8d99-1e97bf45854e', 'user_3Gy1H1nz6rSHgIbJ2LnA90ZEwZg', 'credit_card', 'HDFC Mastercard - 6789', 'HDFC', '{"network":"Mastercard","panLast4":"6789","legacy_card_id":"hdfc_swiggy"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('b1ebd454-321c-5057-971b-ce97632956f0', 'user_3Gy1H1nz6rSHgIbJ2LnA90ZEwZg', 'credit_card', 'INDIANBANK RuPay - 2345', 'INDIANBANK', '{"network":"RuPay","panLast4":"2345","legacy_card_id":"indian_bank_rupay_platinum"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('e4307c1e-04c6-5d59-a81c-6558e0e519d6', 'user_3Gy1H1nz6rSHgIbJ2LnA90ZEwZg', 'credit_card', 'IOB RuPay - 4564', 'IOB', '{"network":"RuPay","panLast4":"4564","legacy_card_id":"iob_platinum"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('0a96bd2b-4f7c-5077-8a09-edbf83ecd253', 'user_3GDiqA1IoVHZhbxymoSPoBXujdf', 'credit_card', 'HDFC RuPay - 7897', 'HDFC', '{"network":"RuPay","panLast4":"7897","legacy_card_id":"hdfc_indianoil"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
INSERT INTO payment_methods (id, user_id, type, name, provider, metadata, status) 
VALUES ('907bcaa3-1d36-5335-93ab-2681817b5503', 'user_3GDiqA1IoVHZhbxymoSPoBXujdf', 'credit_card', 'HDFC Visa - 7387', 'HDFC', '{"network":"Visa","panLast4":"7387","legacy_card_id":"hdfc_millennia"}'::jsonb, 'active') 
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, provider = EXCLUDED.provider, metadata = EXCLUDED.metadata, status = EXCLUDED.status;
