-- Migration: Add columns for Shopline legacy member import
-- Run in Supabase Dashboard → SQL Editor → New query

-- 1. Add import tracking columns to members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS import_source TEXT,
  ADD COLUMN IF NOT EXISTS import_metadata JSONB,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN members.import_source IS 'Origin system for imported members, e.g. shopline';
COMMENT ON COLUMN members.import_metadata IS 'Preserved data from the original system (order count, spend, join date, promo prefs)';
COMMENT ON COLUMN members.claimed_at IS 'When a legacy member claimed their account by setting phone + password';

-- 2. Drop the NOT NULL constraint on phone_number temporarily for legacy imports.
--    Legacy members get a placeholder like SHOPLINE-0001 until they claim their account.
--    The UNIQUE index remains so no collisions.
--    (phone_number was already NOT NULL; we keep it NOT NULL but allow placeholder values.)

-- 3. Partial index so we can quickly look up unclaimed Shopline members by email
CREATE INDEX IF NOT EXISTS idx_members_shopline_unclaimed
  ON public.members (email)
  WHERE import_source = 'shopline' AND claimed_at IS NULL;

-- 4. Update the members_safe view to include the new columns (non-sensitive)
CREATE OR REPLACE VIEW public.members_safe AS
  SELECT
    id, name, email, phone_number, points, tier, role, addresses,
    member_type, wholesale_price_tier, company_name, wholesale_status,
    business_type, branch_count, storefront_preparing, delivery_address,
    br_update_required, security_level, import_source, claimed_at
  FROM public.members;

COMMENT ON VIEW public.members_safe IS
  'Public-safe view of members — excludes password_hash, must_change_password, admin_permissions, import_metadata.';
