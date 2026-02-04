-- Run in Supabase Dashboard → SQL Editor → New query → Run.
-- Fixes: Could not find the 'delivery_building' column of 'orders' in the schema cache

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_district TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_street TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_building TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_floor TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_flat TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS contact_name TEXT;
