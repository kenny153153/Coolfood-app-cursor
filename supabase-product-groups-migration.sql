-- =====================================================
-- Product Groups & Variant Structure Migration
-- 產品群組（原材料 / 第三方 / 自製）+ 規格變體
-- =====================================================

-- 1. Product Groups (產品群組)
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  classification TEXT NOT NULL DEFAULT 'raw_material',
  ingredient_id TEXT REFERENCES ingredients(id),
  image TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_groups_all" ON product_groups FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_product_groups_classification ON product_groups(classification);
CREATE INDEX IF NOT EXISTS idx_product_groups_ingredient ON product_groups(ingredient_id);

-- 2. Extend products table with group/variant fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES product_groups(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_label TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'fixed_pack';

CREATE INDEX IF NOT EXISTS idx_products_group_id ON products(group_id);

-- 3. Auto-migrate existing products into groups
--    Creates groups for products that have parent_ingredient_id set
--    (processed / raw_material products linked to an ingredient)
DO $$
DECLARE
  ing RECORD;
  grp_id UUID;
BEGIN
  FOR ing IN
    SELECT DISTINCT p.parent_ingredient_id, i.name, i.name_en
    FROM products p
    JOIN ingredients i ON i.id = p.parent_ingredient_id
    WHERE p.parent_ingredient_id IS NOT NULL
      AND p.group_id IS NULL
  LOOP
    INSERT INTO product_groups (name, name_en, classification, ingredient_id)
    VALUES (ing.name, ing.name_en, 'raw_material', ing.parent_ingredient_id)
    RETURNING id INTO grp_id;

    UPDATE products
    SET group_id = grp_id,
        variant_label = COALESCE(
          (SELECT pt.name FROM processing_types pt WHERE pt.id = products.processing_type_id),
          '原件'
        )
    WHERE parent_ingredient_id = ing.parent_ingredient_id
      AND group_id IS NULL;
  END LOOP;
END $$;
