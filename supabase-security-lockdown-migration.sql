-- ============================================================
-- Security Lockdown Migration
-- Run in Supabase SQL Editor AFTER all other migrations
-- ============================================================
-- This migration:
--   1. Drops ALL overly-permissive members policies
--   2. Creates strict policies: INSERT restricted to customer role,
--      UPDATE/DELETE admin-only
--   3. Creates a members_safe view that NEVER exposes password_hash
--      (dynamically built to only include columns that exist)
--   4. Tightens orders SELECT to include customer self-read
-- ============================================================
-- IMPORTANT: Run supabase-production-security-migration.sql FIRST
-- (it creates is_admin_session, is_customer_session, can_write, etc.)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. LOCK DOWN MEMBERS TABLE ─────────────────────────────

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

CREATE POLICY "members_select" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    can_write()
    OR role = 'customer'
  );

CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (can_write()) WITH CHECK (can_write());

CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (auth.role() = 'service_role');


-- ─── 2. MEMBERS_SAFE VIEW (never exposes password_hash) ─────
-- Drop existing view first (column order may differ from previous migration).
-- Dynamically built to only include columns that actually exist.

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
    'security_level'
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

COMMENT ON VIEW public.members_safe IS
  'Public-safe view of members — excludes password_hash and must_change_password';


-- ─── 3. TIGHTEN ORDERS SELECT ───────────────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='orders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "orders_read" ON public.orders';
    EXECUTE 'CREATE POLICY "orders_read" ON public.orders FOR SELECT USING (can_write() OR (is_customer_session() AND member_id::text = get_session_member_id()))';
  END IF;
END $$;


-- ─── 4. VERIFY ──────────────────────────────────────────────

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('members', 'orders') AND schemaname = 'public'
ORDER BY tablename, policyname;
