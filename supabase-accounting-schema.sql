-- ═══════════════════════════════════════════════════════════════════
-- Accounting system schema for Coolfood / GHFoods
-- Run via Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════

-- ── Suppliers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact_name TEXT,
  phone       TEXT,
  address     TEXT,
  payment_terms TEXT DEFAULT 'cod',
  notes       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on suppliers" ON suppliers
  FOR ALL USING (auth.role() = 'authenticated');

-- ── Accounts Payable (供應商買貨) ────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts_payable (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name   TEXT NOT NULL,
  invoice_number  TEXT,
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT NOT NULL DEFAULT '',
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date        DATE,
  status          TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','overdue')),
  paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT,
  payment_date    DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on accounts_payable" ON accounts_payable
  FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX idx_ap_status ON accounts_payable(status);
CREATE INDEX idx_ap_supplier ON accounts_payable(supplier_id);
CREATE INDEX idx_ap_due_date ON accounts_payable(due_date);

-- ── Accounts Receivable (批發客未付款) ───────────────────────────
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES wholesale_clients(id) ON DELETE SET NULL,
  client_name     TEXT NOT NULL,
  brand           TEXT CHECK (brand IN ('GHFOODS','COOLFOOD')),
  order_id        TEXT,
  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','received','overdue')),
  credit_terms    TEXT DEFAULT 'cod',
  payment_method  TEXT,
  received_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on accounts_receivable" ON accounts_receivable
  FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX idx_ar_status ON accounts_receivable(status);
CREATE INDEX idx_ar_client ON accounts_receivable(client_id);

-- ── Expense / Income Records (收支記錄) ─────────────────────────
CREATE TABLE IF NOT EXISTS expense_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT NOT NULL DEFAULT 'misc' CHECK (category IN ('salary','rent','vehicle','packaging','equipment','license','utilities','insurance','misc')),
  description     TEXT NOT NULL DEFAULT '',
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  type            TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense','income')),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurring_period TEXT CHECK (recurring_period IN ('monthly','quarterly','yearly')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated full access on expense_records" ON expense_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX idx_er_category ON expense_records(category);
CREATE INDEX idx_er_date ON expense_records(date);
CREATE INDEX idx_er_type ON expense_records(type);
