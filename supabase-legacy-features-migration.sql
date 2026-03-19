-- ============================================================================
-- LEGACY FEATURES MIGRATION
-- Inspired by New Frontier (新里程) system — 10 feature enhancements
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. STANDARD REMARKS LIBRARY (備註檔案)
--    Reusable remark templates for orders, invoices, POs, quotations
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS standard_remarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  content_zh  TEXT NOT NULL DEFAULT '',
  content_en  TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'general',
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE standard_remarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "standard_remarks_all" ON standard_remarks;
CREATE POLICY "standard_remarks_all" ON standard_remarks FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. SEPARATE INVOICE ENTITY (獨立發票)
--    Decoupled from orders — supports partial shipments, multiple invoices
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   TEXT NOT NULL UNIQUE,
  invoice_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date         DATE,
  client_id        UUID REFERENCES wholesale_clients(id),
  client_name      TEXT NOT NULL,
  client_code      TEXT,
  brand            TEXT,
  salesperson_id   UUID REFERENCES sales_representatives(id),
  salesperson_name TEXT,
  delivery_address TEXT,
  currency         TEXT DEFAULT 'HKD',
  exchange_rate    NUMERIC(12,6) DEFAULT 1,
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount  NUMERIC(12,2) DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'draft',
  payment_method   TEXT,
  warehouse_id     TEXT,
  delivery_date    DATE,
  remarks_top      TEXT,
  remarks_bottom   TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_id        TEXT,
  product_id      TEXT,
  product_name    TEXT NOT NULL,
  description     TEXT,
  qty             NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit            TEXT DEFAULT 'pc',
  unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(5,2) DEFAULT 0,
  line_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order      INTEGER DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_order_links (
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_id    TEXT NOT NULL,
  PRIMARY KEY (invoice_id, order_id)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_order_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_all" ON invoices;
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "invoice_line_items_all" ON invoice_line_items;
CREATE POLICY "invoice_line_items_all" ON invoice_line_items FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "invoice_order_links_all" ON invoice_order_links;
CREATE POLICY "invoice_order_links_all" ON invoice_order_links FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_line_items(invoice_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. OUTSTANDING ORDERS (no schema changes — uses existing orders table)
-- ────────────────────────────────────────────────────────────────────────────
-- (Implemented purely in UI)

-- ────────────────────────────────────────────────────────────────────────────
-- 4. YEAR-END GL CLOSING (no new tables — creates journal entries at runtime)
-- ────────────────────────────────────────────────────────────────────────────
-- (Implemented in UI as an action on the accounting panel)

-- ────────────────────────────────────────────────────────────────────────────
-- 5. CLIENT PRICE HISTORY (最後客戶貨物記錄)
--    Tracks every price charged to each client for each product
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_price_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES wholesale_clients(id),
  client_name  TEXT NOT NULL,
  product_id   TEXT,
  product_name TEXT NOT NULL,
  unit_price   NUMERIC(12,2) NOT NULL,
  qty          NUMERIC(12,3),
  unit         TEXT,
  currency     TEXT DEFAULT 'HKD',
  source_type  TEXT NOT NULL DEFAULT 'order',
  source_id    TEXT,
  source_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_price_history_all" ON client_price_history;
CREATE POLICY "client_price_history_all" ON client_price_history FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_cph_client_product ON client_price_history(client_id, product_id);
CREATE INDEX IF NOT EXISTS idx_cph_source_date ON client_price_history(source_date DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. BATCH AR/AP SETTLEMENT (結數)
--    Settle multiple invoices at once with bank/cheque info
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settlements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_number TEXT NOT NULL UNIQUE,
  settlement_type   TEXT NOT NULL,
  settlement_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id        UUID,
  client_name      TEXT,
  supplier_id      UUID,
  supplier_name    TEXT,
  bank_account_id  UUID REFERENCES accounting_accounts(id),
  bank_name        TEXT,
  cheque_number    TEXT,
  cheque_date      DATE,
  currency         TEXT DEFAULT 'HKD',
  total_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount         NUMERIC(12,2) DEFAULT 0,
  other_charges    NUMERIC(12,2) DEFAULT 0,
  net_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settlement_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id   UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL,
  document_id     UUID NOT NULL,
  document_number TEXT NOT NULL,
  document_date   DATE,
  original_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  settled_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settlements_all" ON settlements;
CREATE POLICY "settlements_all" ON settlements FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "settlement_items_all" ON settlement_items;
CREATE POLICY "settlement_items_all" ON settlement_items FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_settlements_date ON settlements(settlement_date);
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement ON settlement_items(settlement_id);

-- Add bank/cheque columns to existing AR/AP tables
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS bank_account_id UUID;
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS cheque_number TEXT;
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS cheque_date DATE;
ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS settlement_id UUID;

ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS bank_account_id UUID;
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS cheque_number TEXT;
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS cheque_date DATE;
ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS settlement_id UUID;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. PER-MODULE LOCK DATES (設定上鎖日期)
--    Independent lock dates for each module
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS module_lock_dates (
  module_key  TEXT PRIMARY KEY,
  lock_date   DATE NOT NULL DEFAULT '1900-01-01',
  updated_by  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE module_lock_dates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "module_lock_dates_all" ON module_lock_dates;
CREATE POLICY "module_lock_dates_all" ON module_lock_dates FOR ALL USING (true) WITH CHECK (true);

INSERT INTO module_lock_dates (module_key, lock_date) VALUES
  ('quotations',     '1900-01-01'),
  ('orders',         '1900-01-01'),
  ('invoices',       '1900-01-01'),
  ('purchase_orders','1900-01-01'),
  ('goods_receiving','1900-01-01'),
  ('inventory',      '1900-01-01'),
  ('ar',             '1900-01-01'),
  ('ap',             '1900-01-01'),
  ('gl',             '1900-01-01'),
  ('production',     '1900-01-01')
ON CONFLICT (module_key) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. STOCK INQUIRY ENHANCEMENTS
--    Add committed_qty and incoming_qty columns for quick reference
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS committed_qty NUMERIC DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS incoming_qty NUMERIC DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────────────
-- 9. PERIOD-END STOCK VALUATION (no new tables — computed at runtime)
-- ────────────────────────────────────────────────────────────────────────────
-- (Implemented in UI as a report on the warehouse panel)

-- ────────────────────────────────────────────────────────────────────────────
-- 10. MULTI-CURRENCY SUPPORT (貨幣檔案)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS currencies (
  code          TEXT PRIMARY KEY,
  name_zh       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  symbol        TEXT NOT NULL DEFAULT '$',
  exchange_rate NUMERIC(12,6) NOT NULL DEFAULT 1,
  is_base       BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "currencies_all" ON currencies;
CREATE POLICY "currencies_all" ON currencies FOR ALL USING (true) WITH CHECK (true);

INSERT INTO currencies (code, name_zh, name_en, symbol, exchange_rate, is_base) VALUES
  ('HKD', '港幣', 'Hong Kong Dollar', 'HK$', 1, TRUE),
  ('CNY', '人民幣', 'Chinese Yuan', '¥', 0.91, FALSE),
  ('USD', '美金', 'US Dollar', 'US$', 0.128, FALSE),
  ('GBP', '英鎊', 'British Pound', '£', 0.102, FALSE),
  ('EUR', '歐元', 'Euro', '€', 0.117, FALSE),
  ('JPY', '日圓', 'Japanese Yen', '¥', 19.1, FALSE)
ON CONFLICT (code) DO NOTHING;

-- Add currency column to tables that need it
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(12,6) DEFAULT 1;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'HKD';
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(12,6) DEFAULT 1;

-- ────────────────────────────────────────────────────────────────────────────
-- SEED: Standard Remarks
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO standard_remarks (code, content_zh, content_en, category, sort_order) VALUES
  ('FRAGILE',     '易碎品，請小心處理',           'Fragile, handle with care',        'delivery',  1),
  ('COLD_CHAIN',  '冷鏈運輸，請保持低溫',         'Cold chain, keep refrigerated',    'delivery',  2),
  ('URGENT',      '急件，請優先處理',              'Urgent, priority handling',        'delivery',  3),
  ('SAMPLE',      '樣品，不收費',                  'Sample, no charge',               'invoice',   4),
  ('NET30',       '30天付款',                      'Net 30 days payment',             'payment',   5),
  ('COD',         '貨到付款',                      'Cash on delivery',                'payment',   6),
  ('PARTIAL',     '部份交貨，餘貨待通知',          'Partial delivery, balance to follow', 'order', 7),
  ('SEASONAL',    '時令貨品，供應視乎季節',        'Seasonal item, subject to availability', 'product', 8),
  ('MIN_ORDER',   '此貨品設有最低訂購量',          'Minimum order quantity applies',   'order',     9),
  ('PRICE_VALID', '報價有效期為7天',               'Quotation valid for 7 days',      'quotation', 10)
ON CONFLICT (code) DO NOTHING;
