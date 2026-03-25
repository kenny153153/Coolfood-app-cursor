-- ============================================================
-- Coolfood: Coupon & Points System Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Remove wallet_balance column from members (data will be lost)
ALTER TABLE public.members DROP COLUMN IF EXISTS wallet_balance;

-- 2. Add points_config to site_config
INSERT INTO public.site_config (id, value)
VALUES ('points_config', '{"dollarsPerPoint": 10}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Add welcome_coupons_config to site_config
INSERT INTO public.site_config (id, value)
VALUES ('welcome_coupons_config', '{"enabled": false, "couponTemplateIds": []}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Create coupons table (templates created by admin)
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT 'cpn-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6),
  name TEXT NOT NULL,
  description TEXT,
  coupon_type TEXT NOT NULL CHECK (coupon_type IN ('fixed_amount', 'percentage', 'free_delivery', 'free_product')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  linked_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  min_spend NUMERIC NOT NULL DEFAULT 100,
  points_cost INTEGER DEFAULT NULL,
  expiry_days INTEGER DEFAULT 30,
  is_welcome_coupon BOOLEAN NOT NULL DEFAULT false,
  is_points_shop BOOLEAN NOT NULL DEFAULT false,
  max_distribution INTEGER DEFAULT NULL,
  distributed_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create member_coupons table (assigned coupons per member)
CREATE TABLE IF NOT EXISTS public.member_coupons (
  id TEXT PRIMARY KEY DEFAULT 'mc-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6),
  member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  coupon_id TEXT NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'welcome', 'points_shop')),
  used_at TIMESTAMPTZ,
  used_order_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_coupons_member ON public.member_coupons(member_id);
CREATE INDEX IF NOT EXISTS idx_member_coupons_status ON public.member_coupons(status);
CREATE INDEX IF NOT EXISTS idx_member_coupons_coupon ON public.member_coupons(coupon_id);

-- 6. Add coupon tracking columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- 7. RLS policies for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_select_all" ON public.coupons;
CREATE POLICY "coupons_select_all" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "coupons_service_role" ON public.coupons;
CREATE POLICY "coupons_service_role" ON public.coupons FOR ALL
  USING (auth.role() = 'service_role');

-- 8. RLS policies for member_coupons
ALTER TABLE public.member_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_coupons_own_select" ON public.member_coupons;
CREATE POLICY "member_coupons_own_select" ON public.member_coupons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "member_coupons_service_role" ON public.member_coupons;
CREATE POLICY "member_coupons_service_role" ON public.member_coupons FOR ALL
  USING (auth.role() = 'service_role');

-- 9. Remove walletDiscountPercent from pricing_rules if stored
UPDATE public.site_config
SET value = value - 'walletDiscountPercent'
WHERE id = 'pricing_rules' AND value ? 'walletDiscountPercent';

-- Remove memberDiscountPercent from pricing_rules
UPDATE public.site_config
SET value = value - 'memberDiscountPercent'
WHERE id = 'pricing_rules' AND value ? 'memberDiscountPercent';

-- 10. Update members_safe view to remove wallet_balance
DROP VIEW IF EXISTS public.members_safe;
CREATE OR REPLACE VIEW public.members_safe AS
  SELECT id, name, email, phone_number, points, tier, role,
         member_type, wholesale_price_tier, addresses
  FROM public.members;

-- Done!
-- After running this migration, deploy the updated application code.
