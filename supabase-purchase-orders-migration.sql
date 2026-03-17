-- Purchase Orders: 買手向供應商購貨的採購訂單

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id BIGSERIAL PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  supplier_phone TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, submitted, received, partial, cancelled
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'HKD',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',  -- unpaid, partial, paid
  payment_method TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_purchase_orders_status ON public.purchase_orders (status);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders (supplier_name);
CREATE INDEX idx_purchase_orders_date ON public.purchase_orders (order_date DESC);

-- line_items JSONB structure per item:
-- {
--   "ingredient_id": "optional FK to ingredients",
--   "product_name": "牛肋條",
--   "qty": 100,
--   "unit": "kg",
--   "unit_cost": 45.00,
--   "line_total": 4500.00,
--   "received_qty": 0,
--   "notes": ""
-- }
