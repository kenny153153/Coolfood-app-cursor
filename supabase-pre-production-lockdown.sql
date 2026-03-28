-- ============================================================
-- PRE-PRODUCTION LOCKDOWN MIGRATION
-- Run AFTER supabase-production-security-migration.sql
-- and AFTER supabase-security-lockdown-migration.sql
-- and AFTER supabase-session-security-migration.sql
-- ============================================================
-- This migration:
--   1. Drops ALL leftover permissive USING(true) policies on admin tables
--   2. Locks down members SELECT (no more password_hash exposure to anon)
--   3. Locks down member_coupons SELECT (customer can only see own)
--   4. Locks down coupons (public read, admin write)
--   5. Revokes anon/authenticated EXECUTE on SECURITY DEFINER RPCs
--   6. Drops the dangerous staff_roles_public policy
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. NUCLEAR CLEANUP: drop ALL policies on admin tables, then
--        re-ensure only the correct {table}_access policy exists ───

DO $$
DECLARE
  t TEXT;
  pol RECORD;
  admin_tables TEXT[] := ARRAY[
    'accounts_payable', 'accounts_receivable', 'expense_records',
    'sales_commissions', 'sales_representatives',
    'accounting_accounts', 'accounting_contacts',
    'payment_templates', 'journal_entries', 'journal_entry_lines',
    'app_settings', 'staff_roles',
    'wholesale_clients', 'delivery_routes', 'wholesale_brand_pricing',
    'purchase_orders', 'suppliers', 'supplier_quotes', 'quote_line_items',
    'raw_material_catalog', 'material_aliases', 'purchase_decisions',
    'goods_receipts', 'goods_receipt_items', 'stock_movements',
    'processing_types', 'material_processing_matrix', 'product_groups',
    'production_orders', 'production_order_inputs', 'production_order_outputs',
    'packaging_materials', 'product_bom',
    'quotations', 'parsing_corrections', 'client_product_preferences',
    'notification_logs', 'standard_remarks', 'invoices',
    'invoice_line_items', 'invoice_order_links',
    'client_price_history', 'settlements', 'settlement_items',
    'module_lock_dates', 'currencies',
    'stock_lots'
  ];
BEGIN
  FOREACH t IN ARRAY admin_tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      -- Drop ALL existing policies on this table
      FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = t AND schemaname = 'public'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
      END LOOP;

      -- Enable RLS (idempotent)
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      -- Re-create the single correct policy
      EXECUTE format(
        'CREATE POLICY "%s_access" ON public.%I FOR ALL USING (can_write()) WITH CHECK (can_write())',
        t, t
      );
    END IF;
  END LOOP;
END $$;


-- ─── 2. LOCK DOWN members SELECT ─────────────────────────────
-- password_hash must NOT be readable by anon. Only admin session,
-- service_role, or the member themselves can SELECT.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.members', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (
    can_write()
    OR auth.role() = 'service_role'
  );

CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    can_write()
    OR role = 'customer'
  );

CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (can_write()) WITH CHECK (can_write());

CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (auth.role() = 'service_role');


-- ─── 3. LOCK DOWN coupons + member_coupons ────────────────────

DO $$
DECLARE
  pol RECORD;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='coupons') THEN
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE tablename = 'coupons' AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.coupons', pol.policyname);
    END LOOP;
    EXECUTE 'ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "coupons_read" ON public.coupons FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "coupons_write" ON public.coupons FOR INSERT WITH CHECK (can_write())';
    EXECUTE 'CREATE POLICY "coupons_update" ON public.coupons FOR UPDATE USING (can_write()) WITH CHECK (can_write())';
    EXECUTE 'CREATE POLICY "coupons_delete" ON public.coupons FOR DELETE USING (can_write())';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='member_coupons') THEN
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE tablename = 'member_coupons' AND schemaname = 'public'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.member_coupons', pol.policyname);
    END LOOP;
    EXECUTE 'ALTER TABLE public.member_coupons ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "mc_admin_all" ON public.member_coupons FOR ALL USING (can_write()) WITH CHECK (can_write())';
    EXECUTE 'CREATE POLICY "mc_customer_read" ON public.member_coupons FOR SELECT USING (is_customer_session() AND member_id::text = get_session_member_id())';
  END IF;
END $$;


-- ─── 4. REVOKE anon/authenticated EXECUTE on SECURITY DEFINER RPCs ─

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_ingredient_stock') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION increment_ingredient_stock FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'batch_update_ingredient_stocks') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION batch_update_ingredient_stocks FROM anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrement_stock') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION decrement_stock FROM anon, authenticated';
  END IF;
END $$;


-- ─── 5. REBUILD members_safe VIEW ────────────────────────────

DO $$
DECLARE
  col_list TEXT;
  safe_cols TEXT[] := ARRAY[
    'id','name','email','phone_number','points',
    'tier','role','admin_permissions','member_type',
    'wholesale_price_tier','wholesale_status',
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


-- ─── 6. VERIFY ───────────────────────────────────────────────

SELECT tablename, policyname, cmd, permissive, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('members', 'orders', 'coupons', 'member_coupons', 'staff_roles', 'stock_lots')
ORDER BY tablename, policyname;
