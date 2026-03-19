-- ═══════════════════════════════════════════════════════════════════
-- General Ledger Enhancement Migration
-- 總帳系統升級：憑單編號、會計科目層級、日記帳
-- Run via Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Voucher Numbers (憑單編號) ─────────────────────────────────

ALTER TABLE accounts_payable
  ADD COLUMN IF NOT EXISTS voucher_number TEXT;

ALTER TABLE accounts_receivable
  ADD COLUMN IF NOT EXISTS voucher_number TEXT;

ALTER TABLE expense_records
  ADD COLUMN IF NOT EXISTS voucher_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ap_voucher
  ON accounts_payable(voucher_number) WHERE voucher_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ar_voucher
  ON accounts_receivable(voucher_number) WHERE voucher_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_er_voucher
  ON expense_records(voucher_number) WHERE voucher_number IS NOT NULL;

-- ── 2. Expand Chart of Accounts (會計科目層級) ────────────────────

ALTER TABLE accounting_accounts
  ADD COLUMN IF NOT EXISTS parent_id UUID
    REFERENCES accounting_accounts(id) ON DELETE SET NULL;

ALTER TABLE accounting_accounts
  DROP CONSTRAINT IF EXISTS accounting_accounts_account_type_check;

ALTER TABLE accounting_accounts
  ADD CONSTRAINT accounting_accounts_account_type_check
    CHECK (account_type IN (
      'asset','liability','equity',
      'revenue','expense',
      'bank','cash','payable','receivable','other'
    ));

CREATE INDEX IF NOT EXISTS idx_acct_parent
  ON accounting_accounts(parent_id);

-- ── 3. Journal Entries (日記帳) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS journal_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number   TEXT NOT NULL,
  entry_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  description      TEXT NOT NULL DEFAULT '',
  source_type      TEXT CHECK (source_type IN ('manual','ap','ar','expense')),
  source_id        UUID,
  is_posted        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for journal_entries" ON journal_entries
  FOR ALL USING (true) WITH CHECK (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_je_voucher
  ON journal_entries(voucher_number);
CREATE INDEX IF NOT EXISTS idx_je_date
  ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_source
  ON journal_entries(source_type, source_id);

-- ── 4. Journal Entry Lines (日記帳明細) ──────────────────────────

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  account_code      TEXT NOT NULL DEFAULT '',
  account_name      TEXT NOT NULL DEFAULT '',
  debit             NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit            NUMERIC(12,2) NOT NULL DEFAULT 0,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for journal_entry_lines" ON journal_entry_lines
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_jel_entry
  ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jel_account
  ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_jel_account_code
  ON journal_entry_lines(account_code);

-- ── 5. Ensure account_code is unique (for COA integrity) ────────

CREATE UNIQUE INDEX IF NOT EXISTS idx_acct_code_unique
  ON accounting_accounts(account_code);

-- ── 6. Pre-seed Chart of Accounts (預設會計科目) ─────────────────
-- Standard COA for food distribution business, based on HK accounting convention.
-- Uses 4-digit codes (simplified from the 7-digit old system).
-- Accounts are grouped: 1xxx Assets, 2xxx Liabilities, 3xxx Equity,
-- 4xxx Revenue, 5xxx COGS, 6xxx-9xxx Expenses.
-- Skip any that already exist (matched by account_code).

INSERT INTO accounting_accounts (account_code, account_name, account_type, is_active)
VALUES
  -- ── Assets 資產 ──
  ('1100', '現金 Cash in Hand',            'asset', true),
  ('1200', '銀行往來 Cash at Bank',         'asset', true),
  ('1210', '恒生銀行',                       'bank',  true),
  ('1220', '中銀香港',                       'bank',  true),
  ('1300', '客戶往來 Debtors',              'asset', true),
  ('1500', '應收款項 Accounts Receivable',  'receivable', true),
  ('1600', '保證金 Utility Deposit',        'asset', true),
  ('1700', '預付款項 Prepayment',           'asset', true),
  ('1800', '存貨 Stock on Hand',            'asset', true),

  -- ── Liabilities 負債 ──
  ('2100', '應付賬款 Accounts Payable',     'payable', true),
  ('2300', '供應商帳 Creditors',            'payable', true),
  ('2700', '應付費用 Accrued Expenses',     'liability', true),

  -- ── Equity 權益 ──
  ('3000', '累積盈虧 Retained Earnings',    'equity', true),

  -- ── Revenue 收入 ──
  ('4000', '銷售收入 Sales',                'revenue', true),
  ('4100', '其他收入 Other Income',         'revenue', true),
  ('4500', '銷貨退回 Sales Returns',        'revenue', true),
  ('4600', '銷貨折扣 Sales Discounts',      'revenue', true),

  -- ── Cost of Sales 銷貨成本 ──
  ('5000', '銷售成本 Cost of Goods Sold',   'expense', true),
  ('5400', '商品購入 Purchases',            'expense', true),

  -- ── Operating Expenses 經營開支 ──
  ('6000', '營業費用 Selling Expenses',     'expense', true),
  ('6100', '人工 Salaries & Wages',         'expense', true),
  ('6200', '租金 Rent',                     'expense', true),
  ('6300', '車輛 Vehicle Expenses',         'expense', true),
  ('6400', '包裝 Packaging',                'expense', true),
  ('6500', '設備 Equipment',                'expense', true),
  ('6600', '牌照 Licences & Permits',       'expense', true),
  ('6700', '水電煤 Utilities',              'expense', true),
  ('6800', '保險 Insurance',                'expense', true),
  ('6900', '雜項 Miscellaneous',            'expense', true),

  -- ── Admin & Financial 管理及財務 ──
  ('7100', '管理費用 G&A Expenses',         'expense', true),
  ('8000', '財務費用 Financial Expenses',   'expense', true)

ON CONFLICT (account_code) DO NOTHING;

-- Set parent relationships for bank sub-accounts
UPDATE accounting_accounts SET parent_id = (
  SELECT id FROM accounting_accounts WHERE account_code = '1200'
) WHERE account_code IN ('1210', '1220') AND parent_id IS NULL;
