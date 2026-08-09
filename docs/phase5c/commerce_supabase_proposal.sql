-- RENO CRED COMMERCE DATA ARCHITECTURE - SUPABASE PROPOSAL
-- NOTE: THIS IS A DESIGN PROPOSAL ONLY. DO NOT EXECUTE.

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
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_featured ON partners(is_featured);

-- ==============================================================================
-- 3. COMMERCE ENTITIES (Products, Services, Experiences)
-- ==============================================================================
CREATE TABLE commerce_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('product', 'service', 'experience', 'subscription', 'booking', 'venue')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    destination_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_commerce_entities_partner ON commerce_entities(partner_id);
CREATE INDEX idx_commerce_entities_category ON commerce_entities(category_id);

-- ==============================================================================
-- 4. OFFERS & ELIGIBILITY
-- ==============================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL CHECK (source IN ('merchant', 'bank', 'card_network', 'renocred')),
    offer_type VARCHAR(50) NOT NULL CHECK (offer_type IN ('percentage_discount', 'flat_discount', 'cashback', 'points', 'miles')),
    value DECIMAL(10, 2) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    -- Complex eligibility rules stored as JSONB to allow dynamic Optimization Engine rule evaluation
    eligibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_offers_status_dates ON offers(status, valid_from, valid_until);
-- GIN index for querying JSONB eligibility rules efficiently
CREATE INDEX idx_offers_eligibility ON offers USING GIN (eligibility_rules);

-- ==============================================================================
-- 5. AFFILIATE RELATIONSHIPS
-- ==============================================================================
CREATE TABLE affiliate_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    network VARCHAR(100) NOT NULL CHECK (network IN ('direct', 'cuelinks', 'admitad', 'bank_referral')),
    tracking_template_url TEXT NOT NULL,
    commission_model VARCHAR(50) NOT NULL CHECK (commission_model IN ('cpa', 'cps', 'cpl', 'cpc', 'fixed')),
    commission_rate DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_affiliate_partner_unique ON affiliate_relationships(partner_id) WHERE status = 'active';

-- ==============================================================================
-- 6. TRACKING EVENTS (Clicks)
-- ==============================================================================
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    commerce_entity_id UUID REFERENCES commerce_entities(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    source_placement VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_partner ON tracking_events(partner_id);

-- ==============================================================================
-- 7. CONVERSIONS & COMMISSIONS
-- ==============================================================================
CREATE TABLE conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_event_id UUID NOT NULL REFERENCES tracking_events(id) ON DELETE RESTRICT,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    external_transaction_id VARCHAR(255) UNIQUE NOT NULL,
    order_value DECIMAL(10, 2) NOT NULL,
    commission_earned DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'paid')),
    converted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_conversions_partner ON conversions(partner_id);
CREATE INDEX idx_conversions_status ON conversions(status);
