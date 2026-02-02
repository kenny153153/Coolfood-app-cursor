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
  weight TEXT
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.products;
CREATE POLICY "Allow anonymous read and write"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);
