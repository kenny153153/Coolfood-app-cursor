-- ============================================================
-- Wholesale Operations: Routes, Clients, Brand Pricing
-- Run this migration in Supabase SQL Editor
-- ============================================================

-- 1. Delivery routes (車線)
CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Wholesale clients (批發客)
CREATE TABLE IF NOT EXISTS wholesale_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  district TEXT,
  brand TEXT NOT NULL DEFAULT 'GHFOODS' CHECK (brand IN ('GHFOODS', 'COOLFOOD')),
  price_tier TEXT DEFAULT 'P0',
  route_id UUID REFERENCES delivery_routes(id) ON DELETE SET NULL,
  credit_limit NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Per-brand wholesale pricing config
CREATE TABLE IF NOT EXISTS wholesale_brand_pricing (
  brand TEXT PRIMARY KEY CHECK (brand IN ('GHFOODS', 'COOLFOOD')),
  target_margin_factor NUMERIC(5,4) DEFAULT 0.8800,
  price_tiers JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default pricing for both brands
INSERT INTO wholesale_brand_pricing (brand, target_margin_factor, price_tiers) VALUES
  ('GHFOODS', 0.8800, '[{"name":"P3","factor":0.97,"description":"3% 加成"},{"name":"P5","factor":0.95,"description":"5% 加成"}]'),
  ('COOLFOOD', 0.8800, '[{"name":"P3","factor":0.97,"description":"3% 加成"},{"name":"P5","factor":0.95,"description":"5% 加成"}]')
ON CONFLICT (brand) DO NOTHING;

-- 4. Add wholesale fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wholesale_brand TEXT CHECK (wholesale_brand IS NULL OR wholesale_brand IN ('GHFOODS', 'COOLFOOD'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wholesale_client_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS route_id UUID;

-- 5. RLS policies
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_brand_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for delivery_routes" ON delivery_routes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for wholesale_clients" ON wholesale_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for wholesale_brand_pricing" ON wholesale_brand_pricing FOR ALL USING (true) WITH CHECK (true);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_wholesale_clients_brand ON wholesale_clients(brand);
CREATE INDEX IF NOT EXISTS idx_wholesale_clients_route ON wholesale_clients(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_wholesale_brand ON orders(wholesale_brand);
CREATE INDEX IF NOT EXISTS idx_orders_route ON orders(route_id);
