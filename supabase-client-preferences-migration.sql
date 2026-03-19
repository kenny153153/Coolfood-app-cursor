-- =====================================================
-- Client Product Preferences Migration
-- 客戶產品加工偏好記錄
-- =====================================================

-- Stores per-client default processing preferences for ingredients.
-- When a client orders a product, the system auto-fills their preferred
-- processing type and spec based on historical orders.

CREATE TABLE IF NOT EXISTS client_product_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES wholesale_clients(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  default_processing_type_id UUID NOT NULL REFERENCES processing_types(id) ON DELETE CASCADE,
  default_spec TEXT,
  note TEXT,
  last_ordered_at TIMESTAMPTZ,
  order_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, ingredient_id, default_processing_type_id)
);

ALTER TABLE client_product_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_product_preferences_all" ON client_product_preferences
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cpp_client ON client_product_preferences(client_id);
CREATE INDEX IF NOT EXISTS idx_cpp_ingredient ON client_product_preferences(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_cpp_client_ingredient ON client_product_preferences(client_id, ingredient_id);
