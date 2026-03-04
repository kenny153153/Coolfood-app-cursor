-- Run in Supabase SQL Editor to create/align public.products

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '[]',
  price NUMERIC NOT NULL,
  member_price NUMERIC NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  track_inventory BOOLEAN NOT NULL DEFAULT true,
  tags JSONB NOT NULL DEFAULT '[]',
  image TEXT NOT NULL,
  description TEXT,
  gallery JSONB,
  recipes JSONB,
  bulk_discount JSONB,
  origin TEXT,
  weight TEXT,
  seo_title TEXT,
  seo_description TEXT,
  image_alt TEXT,
  name_en TEXT,
  description_en TEXT,
  cost_price NUMERIC,
  cost_item_ids JSONB
);

-- Add columns that may be missing if the table already exists
DO $$ BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_alt TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_en TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_en TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_item_ids JSONB;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.products;
CREATE POLICY "Allow anonymous read and write"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);
