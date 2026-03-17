-- ═══════════════════════════════════════════════════════════════════
-- Sales Representatives, Client Extensions & Commissions
-- Run via Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Sales Representatives (銷售員) ─────────────────────────────
CREATE TABLE IF NOT EXISTS sales_representatives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  brand       TEXT NOT NULL DEFAULT 'GHFOODS' CHECK (brand IN ('GHFOODS', 'COOLFOOD')),
  notes       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sales_representatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for sales_representatives" ON sales_representatives FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sales_reps_brand ON sales_representatives(brand);
CREATE INDEX IF NOT EXISTS idx_sales_reps_active ON sales_representatives(is_active);

-- ── 2. Extend wholesale_clients ───────────────────────────────────
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS client_code TEXT;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS parent_client_id UUID REFERENCES wholesale_clients(id) ON DELETE SET NULL;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS salesperson_id UUID REFERENCES sales_representatives(id) ON DELETE SET NULL;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS payment_terms_days INT DEFAULT 0;
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS payment_terms_type TEXT DEFAULT 'cod'
  CHECK (payment_terms_type IN ('cod', 'weekly', 'biweekly', 'monthly'));
ALTER TABLE wholesale_clients ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_wholesale_clients_code ON wholesale_clients(client_code);
CREATE INDEX IF NOT EXISTS idx_wholesale_clients_parent ON wholesale_clients(parent_client_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_clients_salesperson ON wholesale_clients(salesperson_id);

-- ── 3. Sales Commissions (佣金記錄 — 進入會計) ────────────────────
CREATE TABLE IF NOT EXISTS sales_commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id    UUID REFERENCES sales_representatives(id) ON DELETE SET NULL,
  salesperson_name  TEXT NOT NULL,
  client_id         UUID REFERENCES wholesale_clients(id) ON DELETE SET NULL,
  client_name       TEXT NOT NULL,
  brand             TEXT CHECK (brand IN ('GHFOODS', 'COOLFOOD')),
  order_id          TEXT,
  order_date        DATE,
  order_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_tier        TEXT NOT NULL DEFAULT 'P0',
  commission_rate   NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  paid_date         DATE,
  payment_method    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sales_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for sales_commissions" ON sales_commissions FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_commissions_salesperson ON sales_commissions(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON sales_commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_brand ON sales_commissions(brand);
CREATE INDEX IF NOT EXISTS idx_commissions_order_date ON sales_commissions(order_date);
