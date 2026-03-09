-- ============================================================
-- Migration: Wholesale members, ingredient legacy_id, P-level tiers
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add legacy_id to ingredients (舊系統 ID)
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS legacy_id TEXT;

-- 2. Add member_type and wholesale_price_tier to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_type TEXT NOT NULL DEFAULT 'retail';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS wholesale_price_tier TEXT;

-- Ensure existing members default to retail
UPDATE public.members SET member_type = 'retail' WHERE member_type IS NULL;
