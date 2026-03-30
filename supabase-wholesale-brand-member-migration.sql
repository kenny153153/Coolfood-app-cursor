-- ═══════════════════════════════════════════════════
-- Wholesale Brand on Members Migration
-- Adds wholesale_brand column so GH Foods and Coolfood
-- wholesale members are in separate pools for approval.
-- Run AFTER supabase-wholesale-registration-migration.sql
-- and supabase-wholesale-status-migration.sql
-- ═══════════════════════════════════════════════════

-- 1. Add the column
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS wholesale_brand TEXT DEFAULT NULL
  CHECK (wholesale_brand IS NULL OR wholesale_brand IN ('GHFOODS', 'COOLFOOD'));

COMMENT ON COLUMN public.members.wholesale_brand IS 'Wholesale brand pool: GHFOODS or COOLFOOD (NULL for retail members)';

-- 2. Index for fast filtering by brand + status
CREATE INDEX IF NOT EXISTS idx_members_wholesale_brand
  ON public.members (wholesale_brand)
  WHERE member_type = 'wholesale';

-- 3. Rebuild members_safe view to include the new column
DO $$
DECLARE
  col_list TEXT;
  safe_cols TEXT[] := ARRAY[
    'id','name','email','phone_number','points',
    'tier','role','admin_permissions','member_type',
    'wholesale_price_tier','wholesale_status','wholesale_brand',
    'company_name','business_type','branch_count',
    'br_doc_url','storefront_photo_url','storefront_preparing',
    'delivery_address','br_update_required','addresses',
    'security_level','session_issued_at'
  ];
  existing_cols TEXT[] := '{}';
  c TEXT;
BEGIN
  EXECUTE 'DROP VIEW IF EXISTS public.members_safe CASCADE';

  FOREACH c IN ARRAY safe_cols LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='members' AND column_name=c
    ) THEN
      existing_cols := existing_cols || c;
    END IF;
  END LOOP;

  col_list := array_to_string(existing_cols, ', ');
  EXECUTE 'CREATE VIEW public.members_safe AS SELECT ' || col_list || ' FROM public.members';
END $$;
