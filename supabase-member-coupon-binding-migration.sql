-- Coolfood: bind order to exact member coupon instance
-- Run in Supabase SQL Editor.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS member_coupon_id TEXT REFERENCES public.member_coupons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_member_coupon_id ON public.orders(member_coupon_id);
