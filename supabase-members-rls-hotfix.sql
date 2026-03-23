-- ============================================================
-- HOTFIX: Members table RLS — allow customer self-registration
-- Run in Supabase SQL Editor immediately.
-- ============================================================
-- Problem: members_insert policy only allows can_write() which requires
-- service_role or admin session. The API's service_role key may not
-- trigger BYPASSRLS depending on PostgREST configuration.
--
-- Fix: Allow INSERT of rows with role='customer' (self-registration).
-- This is secure because only customer accounts can be self-created;
-- admin/super_admin cannot be created without can_write() privilege.
-- ============================================================

-- Fix INSERT policy: allow customer self-registration
DROP POLICY IF EXISTS "members_insert" ON public.members;
CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    can_write()
    OR role = 'customer'
  );

-- Fix SELECT policy: allow reads for login/registration lookups
-- (API routes handle authentication server-side via service_role key)
DROP POLICY IF EXISTS "members_read" ON public.members;
CREATE POLICY "members_read" ON public.members
  FOR SELECT USING (true);
