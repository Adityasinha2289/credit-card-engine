-- RENO CRED COMMERCE DATA ARCHITECTURE - SUPABASE PROPOSAL V2 (HARDENED)
-- DESIGN PROPOSAL ONLY
-- DO NOT EXECUTE

-- ==============================================================================
-- 1. CATEGORY TAXONOMY
-- ==============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    icon VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. PARTNERS
-- ==============================================================================
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_sponsored BOOLEAN DEFAULT FALSE, -- Purely UI flag. Engine ignores this.
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_partners_status ON partners(status);

-- ==============================================================================
-- 3. COMMERCE ENTITIES
-- ==============================================================================
CREATE TABLE commerce_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('product', 'service', 'experience', 'subscription', 'booking', 'venue')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(255), -- External reference for catalog syncing
    image_url TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    destination_path TEXT NOT NULL, -- Canonical path (e.g., /shop/shoes/nike), NOT affiliate link
    is_sponsored BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_commerce_entities_partner ON commerce_entities(partner_id);

-- ==============================================================================
-- 4. OFFERS
-- ==============================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL CHECK (source IN ('merchant', 'bank', 'card_network', 'renocred')),
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('percentage_discount', 'flat_discount', 'cashback', 'points', 'miles')),
    value DECIMAL(10, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_spend DECIMAL(10, 2) DEFAULT 0, -- First-class for fast indexing
    max_discount DECIMAL(10, 2), -- First-class
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    eligibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb, -- Complex rules (partner_ids, payment_method_types)
    -- Sensitive internal tracking data:
    internal_campaign_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_offers_status_dates ON offers(status, valid_from, valid_until);
CREATE INDEX idx_offers_eligibility ON offers USING GIN (eligibility_rules);

-- ==============================================================================
-- 5. PAYMENT METHODS (Hardened)
-- ==============================================================================
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'upi', 'wallet', 'reward_points')),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    -- Strictly metadata. NO PAN OR SENSITIVE CREDS.
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- ==============================================================================
-- 6. AFFILIATE RELATIONSHIPS (Server Only)
-- ==============================================================================
CREATE TABLE affiliate_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    network VARCHAR(100) NOT NULL,
    tracking_template_url TEXT NOT NULL,
    commission_model VARCHAR(50) NOT NULL CHECK (commission_model IN ('cpa', 'cps', 'cpl', 'cpc', 'fixed', 'tiered')),
    commission_terms JSONB NOT NULL DEFAULT '{}'::jsonb, -- Allows complex tiers
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. TRACKING EVENTS (Clicks - Server Only Write)
-- ==============================================================================
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Used as click_id / subid
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    commerce_entity_id UUID REFERENCES commerce_entities(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    source_placement VARCHAR(100) NOT NULL,
    -- Lightweight snapshot of what we actually recommended at the time of click
    recommendation_snapshot JSONB NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);

-- ==============================================================================
-- 8. CONVERSIONS (Server Only)
-- ==============================================================================
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_event_id UUID NOT NULL REFERENCES tracking_events(id) ON DELETE RESTRICT,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    external_transaction_id VARCHAR(255) UNIQUE NOT NULL,
    order_value DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    converted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. COMMISSIONS (Server Only - Financial Reconciliation)
-- ==============================================================================
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversion_id UUID NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
    expected_commission DECIMAL(10, 2) NOT NULL,
    actual_commission DECIMAL(10, 2), -- Filled when paid
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'adjusted', 'voided')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
