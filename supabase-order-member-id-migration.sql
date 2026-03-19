-- Migration: Add member_id to orders for per-user order visibility
-- Run this in Supabase Dashboard → SQL Editor → New query → Run.

-- 1) Add member_id column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS member_id TEXT;

-- 2) Create index for efficient per-user queries
CREATE INDEX IF NOT EXISTS idx_orders_member_id ON public.orders(member_id);

-- 3) Backfill existing orders by matching customer_phone to members.phone_number
UPDATE public.orders o
SET member_id = m.id
FROM public.members m
WHERE o.member_id IS NULL
  AND o.customer_phone IS NOT NULL
  AND o.customer_phone != ''
  AND m.phone_number = o.customer_phone;
