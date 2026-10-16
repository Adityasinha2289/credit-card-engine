-- =============================================================================
--  RENOCRED MARKETPLACE PARTNER MAPPINGS
--  Migration File: 20260812_marketplace_mappings.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_partner_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    category_slug VARCHAR(100) NOT NULL,
    subcategory_slug VARCHAR(100),
    minor_category_slug VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(partner_id, category_slug, subcategory_slug, minor_category_slug)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_mappings 
ON marketplace_partner_mappings(category_slug, subcategory_slug, minor_category_slug);

ALTER TABLE marketplace_partner_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to marketplace mappings" 
ON marketplace_partner_mappings FOR SELECT USING (true);
