-- ============================================================
-- Add category & sale_channel columns to ingredients
-- Run in Supabase SQL Editor
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS category TEXT;
  ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS sale_channel TEXT DEFAULT 'both';
END $$;
