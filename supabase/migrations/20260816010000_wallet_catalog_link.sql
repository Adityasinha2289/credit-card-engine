-- =============================================================================
--  RENOCRED WALLET CATALOG LINK
--  Migration File: 20260816010000_wallet_catalog_link.sql
-- =============================================================================

-- Add catalog_id to user_cards to ensure deterministic duplicate detection
ALTER TABLE user_cards
ADD COLUMN catalog_id VARCHAR(100) REFERENCES credit_cards_catalog(id) ON DELETE SET NULL;

-- Enforce uniqueness of (user_id, catalog_id) to prevent duplicate wallet entries
-- Note: A user could theoretically own two of the exact same card in real life, 
-- but for recommendation engine purposes, owning the catalog item means it's ALREADY_OWNED.
CREATE UNIQUE INDEX idx_user_cards_unique_catalog ON user_cards(user_id, catalog_id) WHERE catalog_id IS NOT NULL;
