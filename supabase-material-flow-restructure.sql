-- ============================================================
-- 4-Step Material Flow Schema
-- Raw -> Process -> Pack -> SKU Matrix
-- ============================================================

-- 0) Canonical processing methods with strict category
CREATE TABLE IF NOT EXISTS public.processing_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('original_or_cutting', 'repacking', 'marinating', 'others')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS processing_methods_all ON public.processing_methods;
CREATE POLICY processing_methods_all ON public.processing_methods FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.processing_methods
  DROP CONSTRAINT IF EXISTS processing_methods_category_check;
UPDATE public.processing_methods
SET category = 'original_or_cutting'
WHERE category = 'cutting';
ALTER TABLE public.processing_methods
  ADD CONSTRAINT processing_methods_category_check
  CHECK (category IN ('original_or_cutting', 'repacking', 'marinating', 'others'));

-- 1) Process layer (per material)
CREATE TABLE IF NOT EXISTS public.material_process_specs (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  processing_method_id UUID REFERENCES public.processing_methods(id) ON DELETE SET NULL,
  processing_category TEXT NOT NULL DEFAULT 'others' CHECK (processing_category IN ('original_or_cutting', 'repacking', 'marinating', 'others')),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  yield_rate NUMERIC(6,4) NOT NULL DEFAULT 1 CHECK (yield_rate >= 0.5 AND yield_rate <= 1.0),
  pack_quantity NUMERIC(10,3),
  pack_unit TEXT CHECK (pack_unit IN ('g', 'kg', 'lb', 'catty')),
  is_default_piece BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tab 1 pre-packed wholesale unit support
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS net_content_volume NUMERIC(10,3);
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS net_content_unit TEXT;
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS protein_category TEXT;
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS protein_category_id TEXT;
ALTER TABLE public.ingredients
  DROP CONSTRAINT IF EXISTS ingredients_net_content_unit_check;
ALTER TABLE public.ingredients
  ADD CONSTRAINT ingredients_net_content_unit_check
  CHECK (net_content_unit IS NULL OR net_content_unit IN ('g', 'kg', 'lb', 'catty'));
ALTER TABLE public.ingredients
  DROP CONSTRAINT IF EXISTS ingredients_protein_category_check;
ALTER TABLE public.ingredients
  ADD CONSTRAINT ingredients_protein_category_check
  CHECK (protein_category IS NULL OR protein_category IN ('PORK', 'BEEF', 'CHICKEN', 'POULTRY', 'SEAFOOD', 'OTHERS'));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS protein_category TEXT;
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_protein_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_protein_category_check
  CHECK (protein_category IS NULL OR protein_category IN ('PORK', 'BEEF', 'CHICKEN', 'POULTRY', 'SEAFOOD', 'OTHERS'));

-- Unified category dictionary for product catalog + material flow
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE OR REPLACE VIEW public.product_categories AS
SELECT
  id,
  name,
  icon,
  COALESCE(sort_order, 0) AS sort_order
FROM public.categories;

-- 2) Pack layer (physical spec matrix)
CREATE TABLE IF NOT EXISTS public.material_pack_specs (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  process_spec_id TEXT NOT NULL REFERENCES public.material_process_specs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  pricing_mode TEXT NOT NULL DEFAULT 'fixed_pack', -- fixed_pack | by_piece
  target_channel TEXT NOT NULL DEFAULT 'wholesale', -- retail | wholesale | both
  spec_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  spec_unit TEXT NOT NULL DEFAULT 'g', -- g | kg | lb | catty
  pack_quantity NUMERIC(10,3),
  pack_unit TEXT CHECK (pack_unit IN ('g', 'kg', 'lb', 'catty')),
  pack_label TEXT,
  packaging_fee NUMERIC(10,2) NOT NULL DEFAULT 0, -- flat fee for one pack
  packaging_item_codes TEXT[] NOT NULL DEFAULT '{}',
  pack_weight_lb NUMERIC(10,3), -- normalized base for fixed-pack
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (process_spec_id, code)
);

-- Global packaging dictionary (for Tab 3 checkbox list)
CREATE TABLE IF NOT EXISTS public.packaging_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional relation table for explicit per-pack material mapping
CREATE TABLE IF NOT EXISTS public.material_packaging_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_spec_id TEXT NOT NULL REFERENCES public.material_pack_specs(id) ON DELETE CASCADE,
  packaging_material_id UUID NOT NULL REFERENCES public.packaging_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pack_spec_id, packaging_material_id)
);

-- Keep existing environments aligned (fix missing-column runtime errors)
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT NOT NULL DEFAULT 'fixed_pack';
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS target_channel TEXT NOT NULL DEFAULT 'wholesale';
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS spec_weight NUMERIC(10,3) NOT NULL DEFAULT 0;
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS spec_unit TEXT NOT NULL DEFAULT 'g';
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS pack_label TEXT;
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS packaging_fee NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS packaging_item_codes TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS pack_weight_lb NUMERIC(10,3);
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS pack_quantity NUMERIC(10,3);
ALTER TABLE public.material_pack_specs
  ADD COLUMN IF NOT EXISTS pack_unit TEXT;
ALTER TABLE public.material_pack_specs
  DROP CONSTRAINT IF EXISTS material_pack_specs_target_channel_check;
ALTER TABLE public.material_pack_specs
  ADD CONSTRAINT material_pack_specs_target_channel_check CHECK (target_channel IN ('retail', 'wholesale', 'both'));
ALTER TABLE public.material_pack_specs
  DROP CONSTRAINT IF EXISTS material_pack_specs_pricing_mode_check;
ALTER TABLE public.material_pack_specs
  ADD CONSTRAINT material_pack_specs_pricing_mode_check CHECK (pricing_mode IN ('fixed_pack', 'by_piece'));
ALTER TABLE public.material_pack_specs
  DROP CONSTRAINT IF EXISTS material_pack_specs_spec_unit_check;
ALTER TABLE public.material_pack_specs
  ADD CONSTRAINT material_pack_specs_spec_unit_check CHECK (spec_unit IN ('g', 'kg', 'lb', 'catty'));
ALTER TABLE public.material_pack_specs
  DROP CONSTRAINT IF EXISTS material_pack_specs_pack_unit_check;
ALTER TABLE public.material_pack_specs
  ADD CONSTRAINT material_pack_specs_pack_unit_check CHECK (pack_unit IS NULL OR pack_unit IN ('g', 'kg', 'lb', 'catty'));

ALTER TABLE public.material_process_specs
  ADD COLUMN IF NOT EXISTS processing_method_id UUID REFERENCES public.processing_methods(id) ON DELETE SET NULL;
ALTER TABLE public.material_process_specs
  ADD COLUMN IF NOT EXISTS processing_category TEXT NOT NULL DEFAULT 'others';
ALTER TABLE public.material_process_specs
  ADD COLUMN IF NOT EXISTS pack_quantity NUMERIC(10,3);
ALTER TABLE public.material_process_specs
  ADD COLUMN IF NOT EXISTS pack_unit TEXT;
ALTER TABLE public.material_process_specs
  DROP COLUMN IF EXISTS processing_cost;

-- Local MVP override: disable RLS to avoid policy blocking packaging writes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'packaging_materials'
  ) THEN
    EXECUTE 'ALTER TABLE public.packaging_materials DISABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'material_packaging_specs'
  ) THEN
    EXECUTE 'ALTER TABLE public.material_packaging_specs DISABLE ROW LEVEL SECURITY';
  END IF;
END $$;
UPDATE public.material_process_specs
SET yield_rate = LEAST(1.0, GREATEST(0.5, COALESCE(yield_rate, 1.0)))
WHERE yield_rate IS NULL OR yield_rate < 0.5 OR yield_rate > 1.0;
ALTER TABLE public.material_process_specs
  DROP CONSTRAINT IF EXISTS material_process_specs_yield_rate_check;
ALTER TABLE public.material_process_specs
  ADD CONSTRAINT material_process_specs_yield_rate_check CHECK (yield_rate >= 0.5 AND yield_rate <= 1.0);
ALTER TABLE public.material_process_specs
  DROP CONSTRAINT IF EXISTS material_process_specs_processing_category_check;
UPDATE public.material_process_specs
SET processing_category = 'original_or_cutting'
WHERE processing_category = 'cutting';

-- Protein category backfill (global taxonomy foundation)
UPDATE public.ingredients
SET protein_category = CASE
  WHEN upper(coalesce(name, '')) LIKE '%豬%' OR upper(coalesce(name, '')) LIKE '%PORK%' THEN 'PORK'
  WHEN upper(coalesce(name, '')) LIKE '%牛%' OR upper(coalesce(name, '')) LIKE '%BEEF%' THEN 'BEEF'
  WHEN upper(coalesce(name, '')) LIKE '%雞%' OR upper(coalesce(name, '')) LIKE '%CHICKEN%' THEN 'CHICKEN'
  WHEN upper(coalesce(name, '')) LIKE '%鴨%' OR upper(coalesce(name, '')) LIKE '%鵝%' OR upper(coalesce(name, '')) LIKE '%DUCK%' OR upper(coalesce(name, '')) LIKE '%GOOSE%' OR upper(coalesce(name, '')) LIKE '%TURKEY%' OR upper(coalesce(name, '')) LIKE '%POULTRY%' THEN 'POULTRY'
  WHEN upper(coalesce(name, '')) LIKE '%魚%' OR upper(coalesce(name, '')) LIKE '%蝦%' OR upper(coalesce(name, '')) LIKE '%蟹%' OR upper(coalesce(name, '')) LIKE '%SEAFOOD%' OR upper(coalesce(name, '')) LIKE '%FISH%' OR upper(coalesce(name, '')) LIKE '%SHRIMP%' OR upper(coalesce(name, '')) LIKE '%CRAB%' THEN 'SEAFOOD'
  ELSE coalesce(protein_category, 'OTHERS')
END
WHERE coalesce(protein_category, '') = '';

UPDATE public.products p
SET protein_category = i.protein_category
FROM public.ingredients i
WHERE p.parent_ingredient_id = i.id
  AND (p.protein_category IS NULL OR p.protein_category = '');

UPDATE public.products p
SET protein_category = i.protein_category
FROM public.ingredients i
WHERE p.ingredient_id = i.id
  AND (p.protein_category IS NULL OR p.protein_category = '');

-- Backfill category_id from unified product_categories dictionary
UPDATE public.ingredients i
SET protein_category_id = c.id
FROM public.product_categories c
WHERE (i.protein_category_id IS NULL OR i.protein_category_id = '')
  AND (
    (i.protein_category = 'PORK' AND (upper(c.id) LIKE '%PORK%' OR c.name LIKE '%豬%')) OR
    (i.protein_category = 'BEEF' AND (upper(c.id) LIKE '%BEEF%' OR c.name LIKE '%牛%')) OR
    (i.protein_category = 'CHICKEN' AND (upper(c.id) LIKE '%CHICKEN%' OR c.name LIKE '%雞%')) OR
    (i.protein_category = 'POULTRY' AND (upper(c.id) LIKE '%POULTRY%' OR c.name LIKE '%禽%' OR c.name LIKE '%鴨%' OR c.name LIKE '%鵝%')) OR
    (i.protein_category = 'SEAFOOD' AND (upper(c.id) LIKE '%SEAFOOD%' OR c.name LIKE '%海鮮%' OR c.name LIKE '%魚%' OR c.name LIKE '%蝦%' OR c.name LIKE '%蟹%')) OR
    (i.protein_category = 'OTHERS' AND (upper(c.id) LIKE '%OTHER%' OR c.name LIKE '%其他%'))
  );

UPDATE public.products p
SET category_id = i.protein_category_id
FROM public.ingredients i
WHERE p.parent_ingredient_id = i.id
  AND (p.category_id IS NULL OR p.category_id = '');

UPDATE public.products p
SET category_id = i.protein_category_id
FROM public.ingredients i
WHERE p.ingredient_id = i.id
  AND (p.category_id IS NULL OR p.category_id = '');
ALTER TABLE public.material_process_specs
  ADD CONSTRAINT material_process_specs_processing_category_check CHECK (processing_category IN ('original_or_cutting', 'repacking', 'marinating', 'others'));
ALTER TABLE public.material_process_specs
  DROP CONSTRAINT IF EXISTS material_process_specs_pack_unit_check;
ALTER TABLE public.material_process_specs
  ADD CONSTRAINT material_process_specs_pack_unit_check CHECK (pack_unit IS NULL OR pack_unit IN ('g', 'kg', 'lb', 'catty'));

-- Drop legacy constraints that block multiple repack rows
ALTER TABLE public.material_process_specs
  DROP CONSTRAINT IF EXISTS material_process_specs_ingredient_id_code_key;
DROP INDEX IF EXISTS public.material_process_specs_ingredient_id_code_key;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'material_process_wastes'
  ) THEN
    ALTER TABLE public.material_process_wastes
      ADD COLUMN IF NOT EXISTS pack_quantity NUMERIC(10,3);
    ALTER TABLE public.material_process_wastes
      ADD COLUMN IF NOT EXISTS pack_unit TEXT;
    ALTER TABLE public.material_process_wastes
      DROP CONSTRAINT IF EXISTS material_process_wastes_ingredient_id_code_key;
    DROP INDEX IF EXISTS public.material_process_wastes_ingredient_id_code_key;
    CREATE UNIQUE INDEX IF NOT EXISTS ux_material_process_wastes_ing_code_pack
    ON public.material_process_wastes (
      ingredient_id,
      code,
      COALESCE(pack_quantity, -1),
      COALESCE(pack_unit, '')
    );
  END IF;
END $$;

-- New uniqueness rule: same ingredient/code can exist with different pack size
CREATE UNIQUE INDEX IF NOT EXISTS ux_material_process_specs_ing_code_pack
ON public.material_process_specs (
  ingredient_id,
  code,
  COALESCE(pack_quantity, -1),
  COALESCE(pack_unit, '')
);

-- 3) SKU layer
CREATE TABLE IF NOT EXISTS public.sellable_skus (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  alias TEXT,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  process_spec_id TEXT NOT NULL REFERENCES public.material_process_specs(id) ON DELETE RESTRICT,
  pack_spec_id TEXT NOT NULL REFERENCES public.material_pack_specs(id) ON DELETE RESTRICT,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  sale_channel TEXT NOT NULL DEFAULT 'wholesale',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_skus (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  process_spec_id TEXT NOT NULL REFERENCES public.material_process_specs(id) ON DELETE CASCADE,
  pack_spec_id TEXT NOT NULL REFERENCES public.material_pack_specs(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id TEXT,
  effective_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  p0_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  p1_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  p2_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  p3_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  p123_unit_mode TEXT NOT NULL DEFAULT 'whole_pack' CHECK (p123_unit_mode IN ('whole_pack', 'per_lb')),
  pricing_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) RLS + permissive policies
ALTER TABLE public.material_process_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_pack_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellable_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS material_process_specs_all ON public.material_process_specs;
CREATE POLICY material_process_specs_all ON public.material_process_specs
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS material_pack_specs_all ON public.material_pack_specs;
CREATE POLICY material_pack_specs_all ON public.material_pack_specs
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sellable_skus_all ON public.sellable_skus;
CREATE POLICY sellable_skus_all ON public.sellable_skus
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS material_skus_all ON public.material_skus;
CREATE POLICY material_skus_all ON public.material_skus
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS material_categories_all ON public.material_categories;
CREATE POLICY material_categories_all ON public.material_categories
FOR ALL USING (true) WITH CHECK (true);

-- 5) updated_at trigger helper
CREATE OR REPLACE FUNCTION public.touch_material_flow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_material_process_specs_updated_at ON public.material_process_specs;
CREATE TRIGGER trg_material_process_specs_updated_at
BEFORE UPDATE ON public.material_process_specs
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

DROP TRIGGER IF EXISTS trg_material_pack_specs_updated_at ON public.material_pack_specs;
CREATE TRIGGER trg_material_pack_specs_updated_at
BEFORE UPDATE ON public.material_pack_specs
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

DROP TRIGGER IF EXISTS trg_sellable_skus_updated_at ON public.sellable_skus;
CREATE TRIGGER trg_sellable_skus_updated_at
BEFORE UPDATE ON public.sellable_skus
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

DROP TRIGGER IF EXISTS trg_material_skus_updated_at ON public.material_skus;
CREATE TRIGGER trg_material_skus_updated_at
BEFORE UPDATE ON public.material_skus
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

DROP TRIGGER IF EXISTS trg_material_categories_updated_at ON public.material_categories;
CREATE TRIGGER trg_material_categories_updated_at
BEFORE UPDATE ON public.material_categories
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

DROP TRIGGER IF EXISTS trg_processing_methods_updated_at ON public.processing_methods;
CREATE TRIGGER trg_processing_methods_updated_at
BEFORE UPDATE ON public.processing_methods
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

-- Canonical method seed (strict categories)
INSERT INTO public.processing_methods (code, name, category, sort_order, is_active)
VALUES
  ('WHOLE', '原件/原箱 (Whole Block/Case)', 'original_or_cutting', 0, true),
  ('STEAK', '切扒 (Steak)', 'original_or_cutting', 1, true),
  ('PREM_STEAK', '精修切扒 (Premium Steak)', 'original_or_cutting', 2, true),
  ('DICED', '切粒 (Diced)', 'original_or_cutting', 3, true),
  ('STRIPS', '切條 (Strips)', 'original_or_cutting', 4, true),
  ('SLICED_HP', '切片 (Sliced)', 'original_or_cutting', 5, true),
  ('SHREDDED', '切絲 (Shredded)', 'original_or_cutting', 6, true),
  ('BULK_PACK', '商用分裝 (Bulk Repack)', 'repacking', 7, true),
  ('VAC_PACK', '零售分裝 (Vacuum Repack)', 'repacking', 8, true),
  ('MAR', '醃製 (Marinating)', 'marinating', 9, true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE public.processing_methods
SET is_active = false
WHERE code NOT IN ('WHOLE', 'STEAK', 'PREM_STEAK', 'DICED', 'STRIPS', 'SLICED_HP', 'SHREDDED', 'BULK_PACK', 'VAC_PACK', 'MAR');

-- Tab 3 packaging materials seed + cleanup legacy "A" row
DELETE FROM public.packaging_materials
WHERE UPPER(code) = 'A' OR name = 'A';

INSERT INTO public.packaging_materials (code, name, cost, sort_order, is_active)
VALUES
  ('YELLOW_BAG', '黃袋', 0.06, 0, true),
  ('VAC_FILM', '真空膜', 0.09, 1, true),
  ('BLACK_TRAY', '黑碟', 0.05, 2, true),
  ('LABEL', '貼紙標籤', 0.01, 3, true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.material_categories (id, name, sort_order, is_active)
VALUES
  ('CAT-PORK', '豬類', 0, true),
  ('CAT-BEEF', '牛類', 1, true),
  ('CAT-CHICKEN', '雞類', 2, true),
  ('CAT-POULTRY', '家禽類', 3, true),
  ('CAT-SEAFOOD', '海鮮類', 4, true),
  ('CAT-OTHERS', '其他', 5, true)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 6) Backfill defaults: WHOLE process + BULK pack + SKU for existing linked products
INSERT INTO public.material_process_specs (id, ingredient_id, code, name, yield_rate, is_default_piece, sort_order, is_active)
SELECT
  'PS-WHOLE-' || i.id,
  i.id,
  'WHOLE',
  '原件/原箱 (Whole Block/Case)',
  1,
  true,
  0,
  true
FROM public.ingredients i
WHERE NOT EXISTS (
  SELECT 1 FROM public.material_process_specs ps
  WHERE ps.ingredient_id = i.id AND ps.code = 'WHOLE'
);

UPDATE public.material_process_specs ps
SET
  processing_method_id = pm.id,
  processing_category = pm.category
FROM public.processing_methods pm
WHERE pm.code = ps.code;

UPDATE public.material_process_specs
SET processing_category = 'original_or_cutting'
WHERE processing_category = 'cutting';

INSERT INTO public.material_pack_specs (id, ingredient_id, process_spec_id, code, name, pricing_mode, target_channel, spec_weight, spec_unit, pack_label, packaging_fee, pack_weight_lb, sort_order, is_active)
SELECT
  'PK-BULK-' || ps.id,
  ps.ingredient_id,
  ps.id,
  'BULK',
  '散買/原件',
  'by_piece',
  'wholesale',
  1,
  'lb',
  '散買',
  0,
  NULL,
  0,
  true
FROM public.material_process_specs ps
WHERE ps.code = 'WHOLE'
  AND NOT EXISTS (
    SELECT 1 FROM public.material_pack_specs pk
    WHERE pk.process_spec_id = ps.id AND pk.code = 'BULK'
  );

-- 7) Post-check queries
-- SELECT COUNT(*) FROM public.material_process_specs;
-- SELECT COUNT(*) FROM public.material_pack_specs;
-- SELECT COUNT(*) FROM public.sellable_skus;
-- SELECT code, category FROM public.processing_methods ORDER BY sort_order;
-- SELECT sku.id, sku.code FROM public.sellable_skus sku
-- LEFT JOIN public.material_process_specs ps ON ps.id = sku.process_spec_id
-- LEFT JOIN public.material_pack_specs pk ON pk.id = sku.pack_spec_id
-- LEFT JOIN public.products p ON p.id = sku.product_id
-- WHERE ps.id IS NULL OR pk.id IS NULL OR p.id IS NULL;

-- Refresh PostgREST schema cache after migration:
NOTIFY pgrst, 'reload schema';
