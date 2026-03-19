-- ============================================================
-- Security Enhancement Migration
-- ============================================================
-- Prerequisites: admin-login, admin-session, admin-change-password
-- API routes must be deployed BEFORE running this migration.
-- ============================================================
-- 1. Add security_level and must_change_password to members
-- 2. Lock down members table RLS (phased approach)
-- 3. Create members_safe view for non-auth client reads
-- 4. Migrate boolean permissions to CRUD ModulePermission format
-- ============================================================

-- ─── 1. Add new security columns to members ─────────────────

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS security_level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

COMMENT ON COLUMN members.security_level IS
  'Staff hierarchy level (min 1). Higher-level staff can view lower-level staff records.';
COMMENT ON COLUMN members.must_change_password IS
  'When true, admin must change password on next login before accessing any module.';

UPDATE members SET security_level = 10 WHERE role = 'super_admin' AND security_level = 1;
UPDATE members SET security_level = 5  WHERE role = 'admin' AND security_level = 1;
UPDATE members SET security_level = 3  WHERE role IN ('accountant', 'buyer') AND security_level = 1;
UPDATE members SET security_level = 2  WHERE role NOT IN ('customer', 'super_admin', 'admin', 'accountant', 'buyer') AND role != 'customer' AND security_level = 1;

-- ─── 2. Lock down members table RLS ─────────────────────────
--
-- Phase 1 (this migration):
--   Admin login/session/password-change are now handled server-side
--   via /api/admin-login, /api/admin-session, /api/admin-change-password
--   which use the service_role key and bypass RLS.
--
--   Customer login and admin member-management still use the anon key
--   client-side, so we keep SELECT/INSERT/UPDATE open for now but
--   block DELETE to prevent accidental data loss.
--
-- Phase 2 (future):
--   Move customer auth + admin member-management to server-side APIs,
--   then restrict SELECT/UPDATE to own-row-only (see commented policies below).

DROP POLICY IF EXISTS "Allow anonymous read and write" ON members;
DROP POLICY IF EXISTS "members_self_read" ON members;
DROP POLICY IF EXISTS "members_self_update" ON members;
DROP POLICY IF EXISTS "members_service_insert" ON members;
DROP POLICY IF EXISTS "members_no_delete" ON members;

-- Allow reads (needed for customer login-by-phone, admin member listing)
CREATE POLICY "members_select" ON members
  FOR SELECT USING (true);

-- Allow inserts (needed for customer self-registration)
CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (true);

-- Allow updates (needed for admin member-management via anon key)
CREATE POLICY "members_update" ON members
  FOR UPDATE USING (true) WITH CHECK (true);

-- Block all client-side deletes — only service_role can delete
CREATE POLICY "members_no_delete" ON members
  FOR DELETE USING (auth.role() = 'service_role');

-- ── Phase 2 policies (uncomment after migrating customer auth server-side) ──
-- CREATE POLICY "members_select_strict" ON members
--   FOR SELECT USING (
--     auth.role() = 'service_role'
--     OR id::text = coalesce(current_setting('request.headers', true)::json->>'x-member-id', '')
--   );
-- CREATE POLICY "members_update_strict" ON members
--   FOR UPDATE USING (
--     auth.role() = 'service_role'
--     OR id::text = coalesce(current_setting('request.headers', true)::json->>'x-member-id', '')
--   ) WITH CHECK (
--     auth.role() = 'service_role'
--     OR id::text = coalesce(current_setting('request.headers', true)::json->>'x-member-id', '')
--   );

-- ─── 3. Create a view that hides sensitive fields from client ─

CREATE OR REPLACE VIEW members_safe AS
  SELECT
    id, name, email, phone_number, points, wallet_balance,
    tier, role, member_type, wholesale_price_tier, addresses,
    security_level
  FROM members;

COMMENT ON VIEW members_safe IS
  'Public-safe view of members — excludes password_hash, admin_permissions, must_change_password.';

-- ─── 4. Migrate legacy boolean permissions to CRUD format ────
-- This converts existing admin_permissions from:
--   {"orders": true, "accounting": false}
-- to:
--   {"orders": {"read":true,"create":true,"update":true,"delete":true,"export":true},
--    "accounting": {"read":false,"create":false,"update":false,"delete":false,"export":false}}

UPDATE members
SET admin_permissions = (
  SELECT jsonb_object_agg(
    key,
    CASE
      WHEN jsonb_typeof(value) = 'boolean' THEN
        CASE WHEN value::text = 'true'
          THEN '{"read":true,"create":true,"update":true,"delete":true,"export":true}'::jsonb
          ELSE '{"read":false,"create":false,"update":false,"delete":false,"export":false}'::jsonb
        END
      ELSE value  -- already in new format
    END
  )
  FROM jsonb_each(admin_permissions::jsonb)
)
WHERE admin_permissions IS NOT NULL
  AND role != 'customer'
  AND EXISTS (
    SELECT 1 FROM jsonb_each(admin_permissions::jsonb)
    WHERE jsonb_typeof(value) = 'boolean'
  );

-- Also migrate staff_roles.module_permissions
UPDATE staff_roles
SET module_permissions = (
  SELECT jsonb_object_agg(
    key,
    CASE
      WHEN jsonb_typeof(value) = 'boolean' THEN
        CASE WHEN value::text = 'true'
          THEN '{"read":true,"create":true,"update":true,"delete":true,"export":true}'::jsonb
          ELSE '{"read":false,"create":false,"update":false,"delete":false,"export":false}'::jsonb
        END
      ELSE value
    END
  )
  FROM jsonb_each(module_permissions::jsonb)
)
WHERE module_permissions IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM jsonb_each(module_permissions::jsonb)
    WHERE jsonb_typeof(value) = 'boolean'
  );
