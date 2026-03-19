-- =====================================================
-- Product Restructure Migration
-- 產品結構重建：原材料分類 + 分裝加工 + 產品→規格兩層架構
-- =====================================================

-- 1. Add material_type to ingredients (肉類原材料 / 第三方產品)
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS material_type TEXT NOT NULL DEFAULT 'meat';
COMMENT ON COLUMN ingredients.material_type IS '原材料分類: meat=肉類原材料, third_party=第三方產品';

-- 2. Remove sale_channel from ingredients (渠道由產品規格決定)
-- We keep the column for backward compat but stop using it in the UI.
-- ALTER TABLE ingredients DROP COLUMN IF EXISTS sale_channel;

-- 3. Add 分裝 (repack) processing type
INSERT INTO processing_types (code, name, name_en, spec, surcharge_pork_chicken, surcharge_beef_lamb_seafood, requires_repackaging, default_pack_weight_lb, sort_order)
VALUES ('repack', '分裝', 'Repack', '500g / 350g / 250g', 0, 0, true, NULL, 8)
ON CONFLICT (code) DO NOTHING;

-- 4. Add processing_spec to products for storing selected spec option (e.g. "2MM", "500g")
ALTER TABLE products ADD COLUMN IF NOT EXISTS processing_spec TEXT;

-- 5. Ensure product_groups has sale_channel for future per-group channel control
ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS sale_channel TEXT DEFAULT 'wholesale';

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_material_type ON ingredients(material_type);
CREATE INDEX IF NOT EXISTS idx_products_processing_spec ON products(processing_spec);
