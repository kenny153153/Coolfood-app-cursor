-- 收貨入倉 (Goods Receiving) schema
-- Adds ingredient stock tracking, goods receipt notes, and stock movement ledger

-- 1. Add stock tracking columns to ingredients
ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS stock_qty NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_unit TEXT,
  ADD COLUMN IF NOT EXISTS min_stock_alert NUMERIC;

-- stock_unit defaults to the ingredient's own unit if NULL (handled in app logic)

-- 2. Goods Receipt Note (收貨單 / GRN)
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number TEXT NOT NULL UNIQUE,
  purchase_order_id BIGINT REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  po_number TEXT,
  supplier_name TEXT NOT NULL,
  received_by TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_note_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft, confirmed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goods_receipts_status ON public.goods_receipts (status);
CREATE INDEX idx_goods_receipts_po ON public.goods_receipts (purchase_order_id);
CREATE INDEX idx_goods_receipts_date ON public.goods_receipts (received_at DESC);

-- 3. GRN line items
CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  ingredient_id TEXT REFERENCES public.ingredients(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  ordered_qty NUMERIC NOT NULL DEFAULT 0,
  received_qty NUMERIC NOT NULL DEFAULT 0,
  rejected_qty NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'lb',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  storage_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goods_receipt_items_grn ON public.goods_receipt_items (goods_receipt_id);
CREATE INDEX idx_goods_receipt_items_ingredient ON public.goods_receipt_items (ingredient_id);

-- 4. Stock movement ledger (進出記錄)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id TEXT REFERENCES public.ingredients(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL,  -- receive, production_out, adjustment, wastage, return
  quantity NUMERIC NOT NULL,    -- positive = in, negative = out
  unit TEXT,
  reference_type TEXT,          -- goods_receipt, production_order, manual
  reference_id TEXT,
  performed_by TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_stock_movements_ingredient ON public.stock_movements (ingredient_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements (movement_type);
CREATE INDEX idx_stock_movements_date ON public.stock_movements (performed_at DESC);

-- 5. RLS policies (allow all for authenticated — matches existing pattern)
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for goods_receipts" ON public.goods_receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for goods_receipt_items" ON public.goods_receipt_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for stock_movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);
