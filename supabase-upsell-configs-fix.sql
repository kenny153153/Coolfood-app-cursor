-- Create the upsell_configs table (湊單推薦產品)
-- Run this in Supabase SQL Editor to fix the PGRST205 error.

CREATE TABLE IF NOT EXISTS public.upsell_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upsell_configs_product_id ON public.upsell_configs(product_id);

ALTER TABLE public.upsell_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on upsell_configs" ON public.upsell_configs;
CREATE POLICY "Allow public read on upsell_configs"
  ON public.upsell_configs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admin write on upsell_configs" ON public.upsell_configs;
CREATE POLICY "Allow admin write on upsell_configs"
  ON public.upsell_configs FOR ALL
  USING (true)
  WITH CHECK (true);

SELECT pg_notify('pgrst', 'reload schema');
