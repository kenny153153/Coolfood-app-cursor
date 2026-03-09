-- ============================================================
-- Ingredients (原材料) table & Products (產品) cost columns
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create ingredients (原材料) table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  base_cost_per_lb NUMERIC NOT NULL DEFAULT 0,
  supplier TEXT,
  market_benchmark NUMERIC,
  unit TEXT NOT NULL DEFAULT 'lb',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.ingredients;
CREATE POLICY "Allow anonymous read and write"
  ON public.ingredients FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_ingredients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ingredients_updated_at ON public.ingredients;
CREATE TRIGGER trg_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_ingredients_updated_at();

-- 2. Add new cost-related columns to products
DO $$ BEGIN
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredient_id TEXT;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS yield_rate NUMERIC;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS processing_cost NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC NOT NULL DEFAULT 0;
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS misc_cost NUMERIC NOT NULL DEFAULT 0;
END $$;

-- 3. (Optional) FK constraint – products.ingredient_id -> ingredients.id
--    SET NULL on delete so removing an ingredient won't break products.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_product_ingredient' AND table_name = 'products'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT fk_product_ingredient
      FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Computed-cost helper view (optional, for dashboards / reporting)
CREATE OR REPLACE VIEW public.product_cost_breakdown AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  i.name AS ingredient_name,
  i.base_cost_per_lb,
  p.yield_rate,
  CASE
    WHEN p.yield_rate IS NOT NULL AND p.yield_rate > 0
    THEN ROUND(i.base_cost_per_lb / p.yield_rate, 2)
    ELSE i.base_cost_per_lb
  END AS adjusted_ingredient_cost,
  p.processing_cost,
  p.packaging_cost,
  p.misc_cost,
  p.cost_price,
  CASE
    WHEN p.yield_rate IS NOT NULL AND p.yield_rate > 0
    THEN ROUND(i.base_cost_per_lb / p.yield_rate, 2) + p.processing_cost + p.packaging_cost + p.misc_cost
    ELSE COALESCE(p.cost_price, 0) + p.processing_cost + p.packaging_cost + p.misc_cost
  END AS computed_cost,
  p.price AS sell_price,
  p.member_price
FROM public.products p
LEFT JOIN public.ingredients i ON p.ingredient_id = i.id;
