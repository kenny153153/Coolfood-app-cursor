-- =====================================================
-- Production / Factory Module Schema
-- 工場生產管理：包裝材料、生產工單、投入/產出
-- =====================================================

-- 1. Packaging Materials (升級自 CostItem)
CREATE TABLE IF NOT EXISTS packaging_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  unit TEXT NOT NULL DEFAULT 'pc',
  cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE packaging_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packaging_materials_all" ON packaging_materials FOR ALL USING (true) WITH CHECK (true);

-- 2. Production Orders (生產工單主表)
CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_by TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  total_input_weight_kg NUMERIC(10,3) DEFAULT 0,
  total_output_weight_kg NUMERIC(10,3) DEFAULT 0,
  yield_rate NUMERIC(5,2) DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "production_orders_all" ON production_orders FOR ALL USING (true) WITH CHECK (true);

-- 3. Production Order Inputs (原材料投入)
CREATE TABLE IF NOT EXISTS production_order_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'box',
  weight_per_unit_kg NUMERIC(10,3) DEFAULT 0,
  total_weight_kg NUMERIC(10,3) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  notes TEXT
);

ALTER TABLE production_order_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "production_order_inputs_all" ON production_order_inputs FOR ALL USING (true) WITH CHECK (true);

-- 4. Production Order Outputs (成品產出)
CREATE TABLE IF NOT EXISTS production_order_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  sale_channel TEXT NOT NULL DEFAULT 'retail',

  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_weight_kg NUMERIC(10,3) DEFAULT 0,
  total_weight_kg NUMERIC(10,3) NOT NULL DEFAULT 0,

  packaging_type TEXT,
  packaging_material_id UUID REFERENCES packaging_materials(id),
  packaging_quantity NUMERIC(10,2) DEFAULT 0,
  packaging_cost_total NUMERIC(10,2) DEFAULT 0,

  estimated_unit_cost NUMERIC(10,2) DEFAULT 0,
  notes TEXT
);

ALTER TABLE production_order_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "production_order_outputs_all" ON production_order_outputs FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_po_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_date ON production_orders(production_date);
CREATE INDEX IF NOT EXISTS idx_poi_order ON production_order_inputs(production_order_id);
CREATE INDEX IF NOT EXISTS idx_poo_order ON production_order_outputs(production_order_id);
