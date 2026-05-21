-- ============================================================
-- 4-Step Material Flow Schema
-- Raw -> Process -> Pack -> SKU Matrix
-- ============================================================

-- 0) Canonical processing methods with strict category
CREATE TABLE IF NOT EXISTS public.processing_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cutting', 'repacking', 'marinating', 'others')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.processing_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS processing_methods_all ON public.processing_methods;
CREATE POLICY processing_methods_all ON public.processing_methods FOR ALL USING (true) WITH CHECK (true);

-- 1) Process layer (per material)
CREATE TABLE IF NOT EXISTS public.material_process_specs (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  processing_method_id UUID REFERENCES public.processing_methods(id) ON DELETE SET NULL,
  processing_category TEXT NOT NULL DEFAULT 'others' CHECK (processing_category IN ('cutting', 'repacking', 'marinating', 'others')),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  yield_rate NUMERIC(6,4) NOT NULL DEFAULT 1,
  processing_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  pack_quantity NUMERIC(10,3),
  pack_unit TEXT CHECK (pack_unit IN ('g', 'kg', 'lb', 'catty')),
  is_default_piece BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ingredient_id, code)
);

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
  pack_weight_lb NUMERIC(10,3), -- normalized base for fixed-pack
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (process_spec_id, code)
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
  DROP CONSTRAINT IF EXISTS material_process_specs_processing_category_check;
ALTER TABLE public.material_process_specs
  ADD CONSTRAINT material_process_specs_processing_category_check CHECK (processing_category IN ('cutting', 'repacking', 'marinating', 'others'));
ALTER TABLE public.material_process_specs
  DROP CONSTRAINT IF EXISTS material_process_specs_pack_unit_check;
ALTER TABLE public.material_process_specs
  ADD CONSTRAINT material_process_specs_pack_unit_check CHECK (pack_unit IS NULL OR pack_unit IN ('g', 'kg', 'lb', 'catty'));

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

-- 4) RLS + permissive policies
ALTER TABLE public.material_process_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_pack_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellable_skus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS material_process_specs_all ON public.material_process_specs;
CREATE POLICY material_process_specs_all ON public.material_process_specs
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS material_pack_specs_all ON public.material_pack_specs;
CREATE POLICY material_pack_specs_all ON public.material_pack_specs
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS sellable_skus_all ON public.sellable_skus;
CREATE POLICY sellable_skus_all ON public.sellable_skus
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

DROP TRIGGER IF EXISTS trg_processing_methods_updated_at ON public.processing_methods;
CREATE TRIGGER trg_processing_methods_updated_at
BEFORE UPDATE ON public.processing_methods
FOR EACH ROW EXECUTE FUNCTION public.touch_material_flow_updated_at();

-- Canonical method seed (strict categories)
INSERT INTO public.processing_methods (code, name, category, sort_order, is_active)
VALUES
  ('WHOLE', '原件 (Whole Block)', 'cutting', 0, true),
  ('SLICED', '切片 (Sliced)', 'cutting', 1, true),
  ('STEAK', '切扒 (Steak Cut)', 'cutting', 2, true),
  ('STRIPS', '切條 (Strips)', 'cutting', 3, true),
  ('DICED', '切粒 (Diced)', 'cutting', 4, true),
  ('BONELESS', '去骨 (Boneless)', 'cutting', 5, true),
  ('REPACK_RET', '零售精裝', 'repacking', 6, true),
  ('REPACK_WHL', '商用大包裝', 'repacking', 7, true),
  ('MAR_GARLIC', '蒜香醃製', 'marinating', 8, true),
  ('MAR_PEPPER', '黑椒醃製', 'marinating', 9, true),
  ('MAR_SPICY', '麻辣醃製', 'marinating', 10, true),
  ('QUICK_FREEZE', '速凍拉膜', 'others', 11, true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 6) Backfill defaults: WHOLE process + BULK pack + SKU for existing linked products
INSERT INTO public.material_process_specs (id, ingredient_id, code, name, yield_rate, processing_cost, is_default_piece, sort_order, is_active)
SELECT
  'PS-WHOLE-' || i.id,
  i.id,
  'WHOLE',
  '原件',
  1,
  0,
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
-- NOTIFY pgrst, 'reload schema';
