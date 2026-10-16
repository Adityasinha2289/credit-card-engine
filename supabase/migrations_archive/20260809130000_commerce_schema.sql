-- =============================================================================
--  RENOCRED COMMERCE DATA ARCHITECTURE
--  Migration File: 20260809130000_commerce_schema.sql
-- =============================================================================

-- 1. CATEGORY TAXONOMY
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    icon VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. PARTNERS
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_sponsored BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_partners_status ON partners(status);
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. COMMERCE ENTITIES
CREATE TABLE commerce_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('product', 'service', 'experience', 'subscription', 'booking', 'venue')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(255),
    image_url TEXT,
    base_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    destination_path TEXT NOT NULL,
    is_sponsored BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_commerce_entities_partner ON commerce_entities(partner_id);
CREATE TRIGGER update_commerce_entities_updated_at BEFORE UPDATE ON commerce_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. OFFERS
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL CHECK (source IN ('merchant', 'bank', 'card_network', 'renocred')),
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('percentage_discount', 'flat_discount', 'cashback', 'points', 'miles')),
    value NUMERIC(12, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_spend NUMERIC(12, 2) DEFAULT 0,
    max_discount NUMERIC(12, 2),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    eligibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    internal_campaign_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_offers_status_dates ON offers(status, valid_from, valid_until);
CREATE INDEX idx_offers_eligibility ON offers USING GIN (eligibility_rules);
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. PAYMENT METHODS (User Wallet)
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'upi', 'wallet', 'reward_points')),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. AFFILIATE RELATIONSHIPS (Server Only)
CREATE TABLE affiliate_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    network VARCHAR(100) NOT NULL,
    tracking_template_url TEXT NOT NULL,
    commission_model VARCHAR(50) NOT NULL CHECK (commission_model IN ('cpa', 'cps', 'cpl', 'cpc', 'fixed', 'tiered')),
    commission_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_affiliate_relationships_updated_at BEFORE UPDATE ON affiliate_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. TRACKING EVENTS (Clicks - Server Only Write)
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commerce_entity_id UUID REFERENCES commerce_entities(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    source_placement VARCHAR(100) NOT NULL,
    recommendation_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);

-- 8. CONVERSIONS (Server Only)
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_event_id UUID NOT NULL REFERENCES tracking_events(id) ON DELETE RESTRICT,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    external_transaction_id VARCHAR(255) UNIQUE NOT NULL,
    order_value NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    converted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON conversions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. COMMISSIONS (Server Only)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
    expected_commission NUMERIC(12, 2) NOT NULL,
    actual_commission NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'adjusted', 'voided')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Configuration

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to partners" ON partners FOR SELECT USING (true);

ALTER TABLE commerce_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to commerce_entities" ON commerce_entities FOR SELECT USING (true);

-- Explicitly DO NOT grant public SELECT on offers directly
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Secure View for Offers
CREATE OR REPLACE VIEW public_offers_view AS 
SELECT id, source, offer_type, value, title, description, min_spend, max_discount, valid_from, valid_until, status, eligibility_rules, created_at, updated_at
FROM offers
WHERE status = 'active' AND valid_until > NOW();

-- Payment Methods RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payment methods" ON payment_methods FOR SELECT USING (user_id = (auth.jwt()->>'sub'));
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT WITH CHECK (user_id = (auth.jwt()->>'sub'));
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE USING (user_id = (auth.jwt()->>'sub'));
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE USING (user_id = (auth.jwt()->>'sub'));

-- Tracking Events RLS
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tracking events" ON tracking_events FOR SELECT USING (user_id = (auth.jwt()->>'sub'));
-- (Insertion is handled server-side)

-- Server-only tables (No RLS policies created, defaults to block all frontend access)
ALTER TABLE affiliate_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
