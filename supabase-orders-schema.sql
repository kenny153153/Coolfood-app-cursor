-- Run this entire script once in Supabase Dashboard → SQL Editor → New query → Run.
-- Creates public.orders with correct columns so 立即支付 works.

-- 1) Create table (no-op if already exists)
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGINT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total NUMERIC NOT NULL,
  subtotal NUMERIC,
  delivery_fee NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  order_date TEXT NOT NULL,
  items_count INT NOT NULL,
  line_items JSONB DEFAULT '[]',
  delivery_method TEXT,
  delivery_address TEXT,
  delivery_district TEXT,
  delivery_street TEXT,
  delivery_building TEXT,
  delivery_floor TEXT,
  delivery_flat TEXT,
  contact_name TEXT,
  tracking_number TEXT
);

-- 2) If id is bigint/serial, change to TEXT so "ORD-1769855343814" works
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'id';
  IF col_type IN ('bigint', 'integer', 'smallint', 'serial', 'bigserial') THEN
    ALTER TABLE public.orders ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

-- 3) If table existed with wrong column names, rename to match app
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'date') THEN
    ALTER TABLE public.orders RENAME COLUMN date TO order_date;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'items') THEN
    ALTER TABLE public.orders RENAME COLUMN items TO items_count;
  END IF;
END $$;

-- 4) Add any missing columns (safe if already exist)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_payment';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_date TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items_count INT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_district TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_floor TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_flat TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_alt_contact_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_alt_contact_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS locker_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS waybill_no TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS sf_responses JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 5) RLS and policy so app can read/insert
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and insert" ON public.orders;
CREATE POLICY "Allow anonymous read and insert"
  ON public.orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- 6) shipping_configs — 動態運費管理（每種配送方式一行）
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.shipping_configs (
  id TEXT PRIMARY KEY,              -- 'sf_delivery' | 'sf_locker'
  label TEXT NOT NULL,              -- 顯示名稱
  fee NUMERIC NOT NULL DEFAULT 0,   -- 運費
  threshold NUMERIC NOT NULL DEFAULT 0, -- 免運門檻
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 預設種子資料（如已存在則跳過）
INSERT INTO public.shipping_configs (id, label, fee, threshold) VALUES
  ('sf_delivery', '順豐冷鏈上門', 50, 300),
  ('sf_locker',   '順豐凍櫃自取', 30, 200)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.shipping_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on shipping_configs" ON public.shipping_configs;
CREATE POLICY "Allow full access on shipping_configs"
  ON public.shipping_configs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- 7) upsell_configs — 湊單推薦產品
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.upsell_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,           -- 關聯至 products 表的 id
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upsell_configs_product_id ON public.upsell_configs(product_id);

ALTER TABLE public.upsell_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on upsell_configs" ON public.upsell_configs;
CREATE POLICY "Allow public read on upsell_configs"
  ON public.upsell_configs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admin write on upsell_configs" ON public.upsell_configs;
CREATE POLICY "Allow admin write on upsell_configs"
  ON public.upsell_configs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- 8) notification_logs — 手機優先通知日誌（不收集電郵）
-- ═══════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS public.notification_logs;

CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,                         -- 訂單 ID
  phone_number TEXT,                              -- 客戶手機號碼
  status_type TEXT NOT NULL,                      -- 觸發狀態 e.g. "shipping", "completed"
  content TEXT NOT NULL,                          -- 通知正文（廣東話）
  provider TEXT NOT NULL DEFAULT 'MOCK_WHATSAPP', -- 發送商: MOCK_WHATSAPP / WHATSAPP / TWILIO_SMS
  delivery_status TEXT NOT NULL DEFAULT 'LOGGED', -- 發送狀態: LOGGED / SENT / FAILED
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON public.notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on notification_logs" ON public.notification_logs;
CREATE POLICY "Allow full access on notification_logs"
  ON public.notification_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Supabase Storage: 'media' bucket setup
-- =============================================
-- Run these in the Supabase Dashboard > Storage:
--
-- 1. Create a PUBLIC bucket named "media"
--    Dashboard > Storage > New Bucket > Name: media > Public: ON
--
-- 2. Add storage policies via SQL Editor:
--
-- Allow public read access (anonymous)
-- INSERT INTO storage.policies (bucket_id, name, definition, operation)
-- VALUES ('media', 'Public read', '(true)', 'SELECT');
--
-- Allow uploads (adjust auth as needed)
-- INSERT INTO storage.policies (bucket_id, name, definition, operation)
-- VALUES ('media', 'Allow uploads', '(true)', 'INSERT');
--
-- Allow updates (replace existing images)
-- INSERT INTO storage.policies (bucket_id, name, definition, operation)
-- VALUES ('media', 'Allow updates', '(true)', 'UPDATE');
--
-- Allow deletes (clean up old images)
-- INSERT INTO storage.policies (bucket_id, name, definition, operation)
-- VALUES ('media', 'Allow deletes', '(true)', 'DELETE');
--
-- File structure in the bucket:
--   media/
--     products/{productId}/main-{timestamp}.webp
--     products/{productId}/gallery/{timestamp}-{index}.webp
--     slideshow/{slideId}/main-{timestamp}.webp
--     branding/main-{timestamp}.webp

-- =============================================
-- Products table: SEO columns migration
-- =============================================
-- Run these if the products table already exists and needs new SEO columns:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- =============================================
-- Atomic stock decrement function (prevents overselling via race conditions)
-- =============================================
CREATE OR REPLACE FUNCTION decrement_stock(p_id TEXT, p_qty INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_id AND track_inventory = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Site Config key-value store (pricing rules, branding, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_config" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Admin write site_config" ON public.site_config FOR ALL USING (true);
