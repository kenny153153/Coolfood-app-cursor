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
