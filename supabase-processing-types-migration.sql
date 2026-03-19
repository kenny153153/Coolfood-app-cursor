-- =====================================================
-- Processing Types & Material-Processing Matrix Migration
-- 加工方式定義 + 原材料×加工方式矩陣
-- =====================================================

-- 1. Processing Types (加工方式定義)
CREATE TABLE IF NOT EXISTS processing_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  spec TEXT,
  surcharge_pork_chicken NUMERIC(10,2) NOT NULL DEFAULT 0,
  surcharge_beef_lamb_seafood NUMERIC(10,2) NOT NULL DEFAULT 0,
  requires_repackaging BOOLEAN NOT NULL DEFAULT true,
  default_pack_weight_lb NUMERIC(10,2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE processing_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "processing_types_all" ON processing_types FOR ALL USING (true) WITH CHECK (true);

-- Seed standard processing types
INSERT INTO processing_types (code, name, name_en, spec, surcharge_pork_chicken, surcharge_beef_lamb_seafood, requires_repackaging, default_pack_weight_lb, sort_order)
VALUES
  ('whole',     '原件', 'Whole',     NULL,             0,   0,   false, NULL, 0),
  ('slice',     '切片', 'Sliced',    '2MM / 4MM',      1.5, 2.0, true,  5,    1),
  ('dice',      '切粒', 'Diced',     '1吋×1吋',       1.5, 2.0, true,  5,    2),
  ('shred',     '切絲', 'Shredded',  '6MM',            1.5, 2.0, true,  5,    3),
  ('strip',     '切條', 'Strips',    NULL,             1.5, 2.0, true,  5,    4),
  ('steak',     '切扒', 'Steak-cut', '3分 / 4分厚',    1.5, 2.0, true,  5,    5),
  ('mince',     '免治', 'Minced',    NULL,             1.5, 2.0, true,  5,    6),
  ('marinate',  '醃製', 'Marinated', NULL,             0,   0,   true,  5,    7)
ON CONFLICT (code) DO NOTHING;

-- 2. Material-Processing Matrix (原材料 × 加工方式 → 產品)
CREATE TABLE IF NOT EXISTS material_processing_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  processing_type_id UUID NOT NULL REFERENCES processing_types(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  surcharge_override NUMERIC(10,2),
  yield_rate_override NUMERIC(5,4),
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ingredient_id, processing_type_id)
);

ALTER TABLE material_processing_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_processing_matrix_all" ON material_processing_matrix FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mpm_ingredient ON material_processing_matrix(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_mpm_processing ON material_processing_matrix(processing_type_id);
CREATE INDEX IF NOT EXISTS idx_mpm_product ON material_processing_matrix(product_id);

-- 3. Extend products table with processing fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS processing_type_id UUID REFERENCES processing_types(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_ingredient_id TEXT REFERENCES ingredients(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'standalone';
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pack_weight_lb NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_products_processing_type ON products(processing_type_id);
CREATE INDEX IF NOT EXISTS idx_products_parent_ingredient ON products(parent_ingredient_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
