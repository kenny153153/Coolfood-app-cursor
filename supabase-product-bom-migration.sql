-- =====================================================
-- Product BOM (配方表 / 物料清單) Migration
-- 建立原材料與成品之間的多對多關係
-- =====================================================

-- 1. Create product_bom table
CREATE TABLE IF NOT EXISTS product_bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  is_primary BOOLEAN DEFAULT false,
  expected_yield_rate NUMERIC(5,4),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

ALTER TABLE product_bom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_bom_all" ON product_bom FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_bom_product ON product_bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_ingredient ON product_bom(ingredient_id);

-- 2. Migrate existing products.ingredient_id data into BOM
--    Each product that already has ingredient_id becomes a single-ingredient BOM entry.
INSERT INTO product_bom (product_id, ingredient_id, is_primary, expected_yield_rate)
SELECT p.id, p.ingredient_id, true, p.yield_rate
FROM products p
WHERE p.ingredient_id IS NOT NULL
  AND p.ingredient_id != ''
  AND EXISTS (SELECT 1 FROM ingredients i WHERE i.id = p.ingredient_id)
ON CONFLICT (product_id, ingredient_id) DO NOTHING;
