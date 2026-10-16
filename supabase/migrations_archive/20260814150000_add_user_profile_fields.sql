-- Add missing fields to users table for onboarding persistence
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_segment TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_goal TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spend_categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation TEXT;
