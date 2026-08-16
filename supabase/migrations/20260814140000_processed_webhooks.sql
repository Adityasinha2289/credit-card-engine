-- =============================================================================
--  RENOCRED MIGRATION: 20260814140000_processed_webhooks.sql
--  Phase 2B: Idempotent Webhook Events Processing Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed'
);

-- Index for rapid lookup of processed event IDs
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_id ON processed_webhook_events(event_id);

-- Enable RLS (Service role only access)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
