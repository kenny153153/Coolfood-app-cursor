-- ============================================================
-- Material Flow Restructure (4-layer pipeline)
-- Ingredient -> Process Spec -> Pack Spec -> Sellable SKU
-- ============================================================

-- 1) Process specs per ingredient
CREATE TABLE IF NOT EXISTS public.material_process_specs (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  yield_rate NUMERIC(6,4) NOT NULL DEFAULT 1,
  processing_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_default_piece BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ingredient_id, code)
);

-- 2) Pack specs per process spec
CREATE TABLE IF NOT EXISTS public.material_pack_specs (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  process_spec_id TEXT NOT NULL REFERENCES public.material_process_specs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  pricing_mode TEXT NOT NULL DEFAULT 'fixed_pack',
  pack_label TEXT,
  pack_weight_lb NUMERIC(10,3),
  packaging_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (process_spec_id, code)
);

-- 3) Sellable SKUs
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

-- 4) Basic policies
ALTER TABLE public.material_process_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_pack_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellable_skus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "material_process_specs_all" ON public.material_process_specs;
CREATE POLICY "material_process_specs_all"
  ON public.material_process_specs FOR ALL
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "material_pack_specs_all" ON public.material_pack_specs;
CREATE POLICY "material_pack_specs_all"
  ON public.material_pack_specs FOR ALL
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sellable_skus_all" ON public.sellable_skus;
CREATE POLICY "sellable_skus_all"
  ON public.sellable_skus FOR ALL
  USING (true) WITH CHECK (true);

-- 5) updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_material_process_specs_updated_at ON public.material_process_specs;
CREATE TRIGGER trg_material_process_specs_updated_at
  BEFORE UPDATE ON public.material_process_specs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_material_pack_specs_updated_at ON public.material_pack_specs;
CREATE TRIGGER trg_material_pack_specs_updated_at
  BEFORE UPDATE ON public.material_pack_specs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_sellable_skus_updated_at ON public.sellable_skus;
CREATE TRIGGER trg_sellable_skus_updated_at
  BEFORE UPDATE ON public.sellable_skus
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- 6) One-time backfill (idempotent)
-- ------------------------------------------------------------
-- Goal:
-- - Convert existing ingredient/product structure into 4 layers
-- - Ensure every ingredient has at least one default chain (原件)
-- - Build SKU rows for existing wholesale-capable linked products
-- ============================================================

-- 6.1 Ensure default process spec "WHOLE" per ingredient
INSERT INTO public.material_process_specs (
  id, ingredient_id, code, name, yield_rate, processing_cost, is_default_piece, sort_order, is_active
)
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
  SELECT 1
  FROM public.material_process_specs ps
  WHERE ps.ingredient_id = i.id
    AND ps.code = 'WHOLE'
);

-- 6.2 Ensure default pack spec "BULK" per WHOLE process (by piece)
INSERT INTO public.material_pack_specs (
  id, ingredient_id, process_spec_id, code, name, pricing_mode, pack_label, pack_weight_lb, packaging_cost, sort_order, is_active
)
SELECT
  'PK-BULK-' || ps.id,
  ps.ingredient_id,
  ps.id,
  'BULK',
  '散買/原件',
  'by_piece',
  NULL,
  NULL,
  0,
  0,
  true
FROM public.material_process_specs ps
WHERE ps.code = 'WHOLE'
  AND NOT EXISTS (
    SELECT 1
    FROM public.material_pack_specs pk
    WHERE pk.process_spec_id = ps.id
      AND pk.code = 'BULK'
  );

-- 6.3 Create process specs from existing linked products
--     (Skip when same ingredient+code already exists)
WITH src AS (
  SELECT
    p.id AS product_id,
    p.ingredient_id,
    COALESCE(NULLIF(BTRIM(COALESCE(p.processing_type_id::text, '')), ''), 'WHOLE') AS process_key,
    COALESCE(NULLIF(BTRIM(COALESCE(pt.name::text, '')), ''), NULLIF(BTRIM(COALESCE(p.variant_label::text, '')), ''), '原件') AS process_name,
    COALESCE(p.yield_rate, 1) AS yield_rate,
    COALESCE(p.processing_cost, 0) AS processing_cost
  FROM public.products p
  LEFT JOIN public.processing_types pt ON pt.id = p.processing_type_id
  WHERE p.ingredient_id IS NOT NULL
    AND BTRIM(COALESCE(p.ingredient_id::text, '')) != ''
)
INSERT INTO public.material_process_specs (
  id, ingredient_id, code, name, yield_rate, processing_cost, is_default_piece, sort_order, is_active
)
SELECT
  'PS-' || s.ingredient_id || '-' || regexp_replace(UPPER(s.process_key), '[^A-Z0-9_]', '_', 'g'),
  s.ingredient_id,
  regexp_replace(UPPER(s.process_key), '[^A-Z0-9_]', '_', 'g'),
  s.process_name,
  GREATEST(0.5, LEAST(1, s.yield_rate)),
  s.processing_cost,
  (s.process_key = 'WHOLE'),
  10,
  true
FROM (
  SELECT DISTINCT ingredient_id, process_key, process_name, yield_rate, processing_cost
  FROM src
) s
WHERE s.process_key != 'WHOLE'
  AND NOT EXISTS (
    SELECT 1
    FROM public.material_process_specs ps
    WHERE ps.ingredient_id = s.ingredient_id
      AND ps.code = regexp_replace(UPPER(s.process_key), '[^A-Z0-9_]', '_', 'g')
  );

-- 6.4 Create pack specs from existing linked products
WITH src AS (
  SELECT
    p.id AS product_id,
    p.ingredient_id,
    regexp_replace(UPPER(COALESCE(NULLIF(BTRIM(COALESCE(p.processing_type_id::text, '')), ''), 'WHOLE')), '[^A-Z0-9_]', '_', 'g') AS process_code,
    COALESCE(NULLIF(BTRIM(COALESCE(p.pricing_mode::text, '')), ''), 'fixed_pack') AS pricing_mode,
    NULLIF(BTRIM(COALESCE(p.pack_size::text, '')), '') AS pack_label,
    p.pack_weight_lb,
    COALESCE(p.packaging_cost, 0) AS packaging_cost,
    CASE
      WHEN COALESCE(NULLIF(BTRIM(COALESCE(p.pricing_mode::text, '')), ''), 'fixed_pack') = 'by_piece' THEN 'BY_PIECE'
      WHEN NULLIF(BTRIM(COALESCE(p.pack_size::text, '')), '') IS NOT NULL THEN
        'PACK_' || regexp_replace(UPPER(BTRIM(COALESCE(p.pack_size::text, ''))), '[^A-Z0-9_]', '_', 'g')
      WHEN p.pack_weight_lb IS NOT NULL AND p.pack_weight_lb > 0 THEN
        'PACK_' || regexp_replace(REPLACE(UPPER(p.pack_weight_lb::text), '.', '_'), '[^A-Z0-9_]', '_', 'g') || 'LB'
      ELSE
        'STD_PACK'
    END AS pack_code,
    CASE
      WHEN COALESCE(NULLIF(BTRIM(COALESCE(p.pricing_mode::text, '')), ''), 'fixed_pack') = 'by_piece' THEN '散買/抄碼'
      WHEN NULLIF(BTRIM(COALESCE(p.pack_size::text, '')), '') IS NOT NULL THEN BTRIM(COALESCE(p.pack_size::text, ''))
      WHEN p.pack_weight_lb IS NOT NULL AND p.pack_weight_lb > 0 THEN p.pack_weight_lb::text || 'lb'
      ELSE '標準包裝'
    END AS pack_name
  FROM public.products p
  WHERE p.ingredient_id IS NOT NULL
    AND BTRIM(COALESCE(p.ingredient_id::text, '')) != ''
),
mapped AS (
  SELECT
    s.*,
    ps.id AS process_spec_id
  FROM src s
  JOIN public.material_process_specs ps
    ON ps.ingredient_id = s.ingredient_id
   AND ps.code = s.process_code
)
INSERT INTO public.material_pack_specs (
  id, ingredient_id, process_spec_id, code, name, pricing_mode, pack_label, pack_weight_lb, packaging_cost, sort_order, is_active
)
SELECT
  'PK-' || m.process_spec_id || '-' || m.pack_code,
  m.ingredient_id,
  m.process_spec_id,
  m.pack_code,
  m.pack_name,
  CASE WHEN m.pricing_mode = 'by_piece' THEN 'by_piece' ELSE 'fixed_pack' END,
  m.pack_label,
  CASE WHEN m.pricing_mode = 'fixed_pack' THEN m.pack_weight_lb ELSE NULL END,
  m.packaging_cost,
  10,
  true
FROM (
  SELECT DISTINCT ingredient_id, process_spec_id, pack_code, pack_name, pricing_mode, pack_label, pack_weight_lb, packaging_cost
  FROM mapped
) m
WHERE NOT EXISTS (
  SELECT 1
  FROM public.material_pack_specs pk
  WHERE pk.process_spec_id = m.process_spec_id
    AND pk.code = m.pack_code
);

-- 6.5 Create missing default product row for each ingredient (raw piece)
INSERT INTO public.products (
  id, name, categories, price, member_price, stock, track_inventory, tags, image,
  ingredient_id, parent_ingredient_id, yield_rate, processing_cost, packaging_cost, misc_cost,
  sale_channel, product_type, variant_label, pricing_mode
)
SELECT
  'P-RAW-' || i.id,
  i.name,
  '[]'::jsonb,
  0, 0, 0, true,
  '["default_raw_piece"]'::jsonb,
  '🥩',
  i.id,
  i.id,
  1,
  0,
  0,
  0,
  'wholesale',
  'raw_material',
  '原件',
  'by_piece'
FROM public.ingredients i
WHERE NOT EXISTS (
  SELECT 1
  FROM public.products p
  WHERE p.ingredient_id = i.id
    AND (p.product_type = 'raw_material' OR p.variant_label = '原件')
);

-- 6.6 Create Sellable SKU rows for linked wholesale-capable products
WITH src AS (
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.ingredient_id,
    p.sale_channel,
    COALESCE(NULLIF(BTRIM(COALESCE(p.processing_type_id::text, '')), ''), 'WHOLE') AS process_key,
    COALESCE(NULLIF(BTRIM(COALESCE(p.pricing_mode::text, '')), ''), 'fixed_pack') AS pricing_mode,
    NULLIF(BTRIM(COALESCE(p.pack_size::text, '')), '') AS pack_label,
    p.pack_weight_lb,
    CASE
      WHEN COALESCE(NULLIF(BTRIM(COALESCE(p.pricing_mode::text, '')), ''), 'fixed_pack') = 'by_piece' THEN 'BY_PIECE'
      WHEN NULLIF(BTRIM(COALESCE(p.pack_size::text, '')), '') IS NOT NULL THEN
        'PACK_' || regexp_replace(UPPER(BTRIM(COALESCE(p.pack_size::text, ''))), '[^A-Z0-9_]', '_', 'g')
      WHEN p.pack_weight_lb IS NOT NULL AND p.pack_weight_lb > 0 THEN
        'PACK_' || regexp_replace(REPLACE(UPPER(p.pack_weight_lb::text), '.', '_'), '[^A-Z0-9_]', '_', 'g') || 'LB'
      ELSE
        'STD_PACK'
    END AS pack_code,
    COALESCE(NULLIF(BTRIM(COALESCE(p.variant_label::text, '')), ''), p.name) AS sku_label
  FROM public.products p
  WHERE p.ingredient_id IS NOT NULL
    AND BTRIM(COALESCE(p.ingredient_id::text, '')) != ''
    AND COALESCE(p.sale_channel, 'retail') IN ('wholesale', 'both')
),
mapped AS (
  SELECT
    s.*,
    ps.id AS process_spec_id,
    pk.id AS pack_spec_id
  FROM src s
  JOIN public.material_process_specs ps
    ON ps.ingredient_id = s.ingredient_id
   AND ps.code = regexp_replace(UPPER(s.process_key), '[^A-Z0-9_]', '_', 'g')
  JOIN public.material_pack_specs pk
    ON pk.process_spec_id = ps.id
   AND pk.code = s.pack_code
)
INSERT INTO public.sellable_skus (
  id, code, name, alias, ingredient_id, process_spec_id, pack_spec_id, product_id, sale_channel, sort_order, is_active
)
SELECT
  'SKU-' || m.product_id,
  'SKU_' || regexp_replace(UPPER(m.product_id), '[^A-Z0-9_]', '_', 'g'),
  m.product_name,
  m.sku_label,
  m.ingredient_id,
  m.process_spec_id,
  m.pack_spec_id,
  m.product_id,
  CASE WHEN m.sale_channel IN ('wholesale', 'both', 'retail') THEN m.sale_channel ELSE 'wholesale' END,
  10,
  true
FROM mapped m
WHERE NOT EXISTS (
  SELECT 1
  FROM public.sellable_skus s
  WHERE s.product_id = m.product_id
);

-- ============================================================
-- 7) Post-check queries (read-only)
-- ------------------------------------------------------------
-- SELECT COUNT(*) FROM public.material_process_specs;
-- SELECT COUNT(*) FROM public.material_pack_specs;
-- SELECT COUNT(*) FROM public.sellable_skus;
-- SELECT p.id, p.name FROM public.products p
-- WHERE COALESCE(p.sale_channel, 'retail') IN ('wholesale', 'both')
--   AND p.ingredient_id IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM public.sellable_skus s WHERE s.product_id = p.id);
-- SELECT ps.id, ps.ingredient_id, ps.code
-- FROM public.material_process_specs ps
-- LEFT JOIN public.ingredients i ON i.id = ps.ingredient_id
-- WHERE i.id IS NULL;
-- SELECT pk.id, pk.ingredient_id, pk.process_spec_id, pk.code
-- FROM public.material_pack_specs pk
-- LEFT JOIN public.ingredients i ON i.id = pk.ingredient_id
-- LEFT JOIN public.material_process_specs ps ON ps.id = pk.process_spec_id
-- WHERE i.id IS NULL OR ps.id IS NULL;
-- SELECT sku.id, sku.code, sku.ingredient_id, sku.process_spec_id, sku.pack_spec_id, sku.product_id
-- FROM public.sellable_skus sku
-- LEFT JOIN public.ingredients i ON i.id = sku.ingredient_id
-- LEFT JOIN public.material_process_specs ps ON ps.id = sku.process_spec_id
-- LEFT JOIN public.material_pack_specs pk ON pk.id = sku.pack_spec_id
-- LEFT JOIN public.products p ON p.id = sku.product_id
-- WHERE i.id IS NULL OR ps.id IS NULL OR pk.id IS NULL OR p.id IS NULL;
-- SELECT code, COUNT(*) AS dup_count
-- FROM public.sellable_skus
-- GROUP BY code
-- HAVING COUNT(*) > 1;
-- SELECT ingredient_id, code, COUNT(*) AS dup_count
-- FROM public.material_process_specs
-- GROUP BY ingredient_id, code
-- HAVING COUNT(*) > 1;
-- SELECT process_spec_id, code, COUNT(*) AS dup_count
-- FROM public.material_pack_specs
-- GROUP BY process_spec_id, code
-- HAVING COUNT(*) > 1;
-- ============================================================
