-- Stock Lots (庫存批次) & Catch-Weight Order Line Enhancement
-- Adds lot-based inventory tracking with brand, reservation, and FIFO support
-- Also extends order line items to persist catch-weight (抄碼) data

-- 1. Stock Lots table — each GRN receipt creates one lot per line
CREATE TABLE IF NOT EXISTS public.stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id TEXT NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  brand TEXT,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT,
  goods_receipt_item_id UUID REFERENCES public.goods_receipt_items(id) ON DELETE SET NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  quantity_received NUMERIC NOT NULL DEFAULT 0,
  quantity_remaining NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'lb',
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  storage_location TEXT,
  reserved_for_client_id UUID,
  lot_status TEXT NOT NULL DEFAULT 'available',  -- available, reserved, depleted, expired
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_lots_ingredient ON public.stock_lots (ingredient_id);
CREATE INDEX idx_stock_lots_status ON public.stock_lots (lot_status);
CREATE INDEX idx_stock_lots_brand ON public.stock_lots (brand);
CREATE INDEX idx_stock_lots_received ON public.stock_lots (received_date);
CREATE INDEX idx_stock_lots_reserved ON public.stock_lots (reserved_for_client_id) WHERE reserved_for_client_id IS NOT NULL;
CREATE INDEX idx_stock_lots_fifo ON public.stock_lots (ingredient_id, received_date ASC) WHERE lot_status IN ('available', 'reserved');

-- 2. Add lot_id to stock_movements for traceability
ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES public.stock_lots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_stock_movements_lot ON public.stock_movements (lot_id);

-- 3. Add brand field to goods_receipt_items for per-line brand tracking
ALTER TABLE public.goods_receipt_items
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS reserved_for_client_id UUID;

-- 4. RLS for stock_lots (match existing pattern)
ALTER TABLE public.stock_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for stock_lots" ON public.stock_lots FOR ALL USING (true) WITH CHECK (true);
