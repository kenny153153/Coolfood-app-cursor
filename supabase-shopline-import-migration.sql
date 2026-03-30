-- Migration: Add columns for Shopline legacy member import
-- Run in Supabase Dashboard → SQL Editor → New query

-- 1. Add import tracking columns to members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS import_source TEXT,
  ADD COLUMN IF NOT EXISTS import_metadata JSONB,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN members.import_source IS 'Origin system for imported members, e.g. shopline';
COMMENT ON COLUMN members.import_metadata IS 'Preserved data from the original system (order count, spend, join date, promo prefs)';
COMMENT ON COLUMN members.claimed_at IS 'When a legacy member claimed their account by setting phone + password';

-- 2. Ensure must_change_password column exists (needed for imported members)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- 3. Partial index so we can quickly look up unclaimed Shopline members by email
CREATE INDEX IF NOT EXISTS idx_members_shopline_unclaimed
  ON public.members (email)
  WHERE import_source = 'shopline' AND claimed_at IS NULL;
