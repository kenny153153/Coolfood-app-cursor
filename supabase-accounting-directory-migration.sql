-- ═══════════════════════════════════════════════════════════════════
-- Accounting Directory: Saved Accounts, Contacts & Payment Templates
-- 常用資料：帳戶、聯絡人、付款範本
-- Run via Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Accounting Accounts (常用帳戶) ─────────────────────────────
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code        TEXT NOT NULL,
  account_name        TEXT NOT NULL,
  account_type        TEXT NOT NULL DEFAULT 'other'
    CHECK (account_type IN ('bank','cash','expense','revenue','payable','receivable','other')),
  bank_name           TEXT,
  bank_account_number TEXT,
  currency            TEXT DEFAULT 'HKD',
  is_default          BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for accounting_accounts" ON accounting_accounts
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_acct_type ON accounting_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_acct_active ON accounting_accounts(is_active);

-- ── 2. Accounting Contacts (常用聯絡人) ───────────────────────────
CREATE TABLE IF NOT EXISTS accounting_contacts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  contact_type           TEXT NOT NULL DEFAULT 'other'
    CHECK (contact_type IN ('supplier','client','employee','government','landlord','other')),
  contact_person         TEXT,
  phone                  TEXT,
  email                  TEXT,
  bank_name              TEXT,
  bank_account_number    TEXT,
  bank_account_name      TEXT,
  fps_id                 TEXT,
  default_payment_method TEXT,
  address                TEXT,
  notes                  TEXT,
  is_frequent            BOOLEAN DEFAULT FALSE,
  is_active              BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE accounting_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for accounting_contacts" ON accounting_contacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contact_type ON accounting_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_freq ON accounting_contacts(is_frequent);
CREATE INDEX IF NOT EXISTS idx_contact_active ON accounting_contacts(is_active);

-- ── 3. Payment Templates (付款範本) ──────────────────────────────
CREATE TABLE IF NOT EXISTS payment_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name   TEXT NOT NULL,
  contact_id      UUID REFERENCES accounting_contacts(id) ON DELETE SET NULL,
  contact_name    TEXT NOT NULL DEFAULT '',
  account_id      UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  account_name    TEXT NOT NULL DEFAULT '',
  default_amount  NUMERIC(12,2),
  category        TEXT,
  description     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for payment_templates" ON payment_templates
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tpl_contact ON payment_templates(contact_id);
CREATE INDEX IF NOT EXISTS idx_tpl_account ON payment_templates(account_id);
