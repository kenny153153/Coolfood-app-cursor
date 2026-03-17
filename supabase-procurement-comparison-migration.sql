-- ═══════════════════════════════════════════════════════════════════
-- Procurement Comparison System (採購比價系統)
-- 供應商報價上載 → AI 解析 → 比較價格 → 生成購買訂單
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Extend suppliers table with procurement fields ────────────
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(12,2) DEFAULT 0;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'HKD';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS warehouse_locations TEXT[] DEFAULT '{}';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS last_quote_date DATE;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ── 2. Raw Material Catalog (原材料主目錄) ───────────────────────
-- Canonical names for raw materials — the single source of truth
CREATE TABLE IF NOT EXISTS raw_material_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  name_en TEXT,
  category TEXT,
  sub_category TEXT,
  default_unit TEXT DEFAULT 'lb',
  specs JSONB DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE raw_material_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "raw_material_catalog_all" ON raw_material_catalog
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_rmc_name ON raw_material_catalog(canonical_name);
CREATE INDEX idx_rmc_category ON raw_material_catalog(category);

-- ── 3. Material Aliases (供應商別名映射) ─────────────────────────
-- Maps supplier-specific product names to canonical catalog entries
CREATE TABLE IF NOT EXISTS material_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES raw_material_catalog(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  alias_name TEXT NOT NULL,
  brand TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(supplier_id, alias_name)
);

ALTER TABLE material_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_aliases_all" ON material_aliases
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_alias_catalog ON material_aliases(catalog_id);
CREATE INDEX idx_alias_supplier ON material_aliases(supplier_id);
CREATE INDEX idx_alias_name ON material_aliases(alias_name);

-- ── 4. Supplier Quotes (供應商報價單) ────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  source_type TEXT NOT NULL DEFAULT 'pdf' CHECK (source_type IN ('pdf', 'whatsapp', 'manual')),
  source_file_url TEXT,
  original_text TEXT,
  parsed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'parsed', 'confirmed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplier_quotes_all" ON supplier_quotes
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_sq_supplier ON supplier_quotes(supplier_id);
CREATE INDEX idx_sq_date ON supplier_quotes(quote_date DESC);
CREATE INDEX idx_sq_status ON supplier_quotes(status);

-- ── 5. Quote Line Items (報價明細) ──────────────────────────────
CREATE TABLE IF NOT EXISTS quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES supplier_quotes(id) ON DELETE CASCADE,
  catalog_id UUID REFERENCES raw_material_catalog(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  brand TEXT,
  origin TEXT,
  storage_location TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'HKD',
  unit TEXT DEFAULT 'lb',
  price_per_lb NUMERIC(12,4),
  weight_per_case TEXT,
  min_order_qty NUMERIC,
  product_code TEXT,
  specs JSONB DEFAULT '{}',
  match_confidence NUMERIC(3,2) DEFAULT 0,
  is_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quote_line_items_all" ON quote_line_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_qli_quote ON quote_line_items(quote_id);
CREATE INDEX idx_qli_catalog ON quote_line_items(catalog_id);
CREATE INDEX idx_qli_brand ON quote_line_items(brand);

-- ── 6. Purchase Decisions (採購決策記錄 — 防貪核心) ───────────────
CREATE TABLE IF NOT EXISTS purchase_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID REFERENCES raw_material_catalog(id),
  brand TEXT,
  selected_quote_item_id UUID REFERENCES quote_line_items(id),
  selected_supplier_id UUID REFERENCES suppliers(id),
  selected_supplier_name TEXT NOT NULL,
  selected_price NUMERIC(12,2) NOT NULL,
  selected_unit TEXT DEFAULT 'lb',
  lowest_quote_item_id UUID REFERENCES quote_line_items(id),
  lowest_supplier_name TEXT,
  lowest_price NUMERIC(12,2) NOT NULL,
  is_lowest BOOLEAN GENERATED ALWAYS AS (selected_price <= lowest_price) STORED,
  justification TEXT,
  justification_category TEXT CHECK (justification_category IN (
    'quality', 'delivery_speed', 'min_order', 'payment_terms', 'stock_availability', 'other'
  )),
  decided_by TEXT NOT NULL,
  decided_at TIMESTAMPTZ DEFAULT now(),
  purchase_order_id BIGINT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  approved_by TEXT,
  approved_at TIMESTAMPTZ
);

ALTER TABLE purchase_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchase_decisions_all" ON purchase_decisions
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_pd_catalog ON purchase_decisions(catalog_id);
CREATE INDEX idx_pd_decided ON purchase_decisions(decided_at DESC);
CREATE INDEX idx_pd_is_lowest ON purchase_decisions(is_lowest);

-- ── 7. Synonym Dictionary (同義詞字典) ──────────────────────────
-- Stored in site_config as JSON for flexibility
-- Key: 'procurement_synonyms'
-- Value: { synonyms: {...}, brand_corrections: {...}, warehouse_aliases: {...} }
INSERT INTO site_config (id, value) VALUES (
  'procurement_synonyms',
  '{
    "synonyms": {
      "牛冧": ["牛林", "牛臀", "Rump"],
      "金錢肚": ["金肚", "Honeycomb Tripe"],
      "帶皮挑骨豬腩": ["帶皮帶軟骨挑骨腩", "帶皮挑骨腩"],
      "餅肋": ["肋排餅裝", "餅裝肋排"],
      "豬扒": ["豬排"],
      "梅肉": ["豬梅肉", "梅頭"],
      "三肉": ["三層肉"],
      "四肉": ["四層肉"],
      "肋排": ["排骨"]
    },
    "brand_corrections": {
      "Auoura": "AURORA",
      "auoura": "AURORA",
      "Aurora": "AURORA",
      "Frimesa": "FRIMESA",
      "frimesa": "FRIMESA",
      "Miratorg": "MIRATORG",
      "miratorg": "MIRATORG",
      "Seara": "SEARA",
      "seara": "SEARA",
      "Sadia": "SADIA",
      "sadia": "SADIA"
    },
    "warehouse_aliases": {
      "沙2": "沙田2號倉",
      "沙二": "沙田2號倉",
      "沙2/其士": "沙田2號倉/其士",
      "威強": "威強凍倉",
      "其士": "其士凍倉",
      "光一": "光一凍倉",
      "百信倉": "百信凍倉",
      "亞洲": "亞洲凍倉",
      "萬集": "萬集凍倉",
      "光一/威強": "光一凍倉/威強凍倉",
      "光一/百信倉": "光一凍倉/百信凍倉",
      "沙2/光一": "沙田2號倉/光一凍倉",
      "其士/光一": "其士凍倉/光一凍倉"
    }
  }'
) ON CONFLICT (id) DO NOTHING;
