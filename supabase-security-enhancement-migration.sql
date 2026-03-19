-- ============================================================
-- Security Enhancement Migration
-- Inspired by C-F Enterprise Security System (Appendix F)
-- ============================================================
-- 1. Add security_level and must_change_password to members
-- 2. Lock down members table RLS
-- 3. Migrate boolean permissions to CRUD ModulePermission format
-- ============================================================

-- ─── 1. Add new security columns to members ─────────────────

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS security_level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

COMMENT ON COLUMN members.security_level IS
  'Staff hierarchy level (min 1). Higher-level staff can view lower-level staff records. Same-level cannot see each other.';
COMMENT ON COLUMN members.must_change_password IS
  'When true, admin must change password on next login before accessing any module.';

-- Set super_admin to highest security level
UPDATE members SET security_level = 10 WHERE role = 'super_admin' AND security_level = 1;
UPDATE members SET security_level = 5  WHERE role = 'admin' AND security_level = 1;
UPDATE members SET security_level = 3  WHERE role IN ('accountant', 'buyer') AND security_level = 1;
UPDATE members SET security_level = 2  WHERE role NOT IN ('customer', 'super_admin', 'admin', 'accountant', 'buyer') AND role != 'customer' AND security_level = 1;

-- ─── 2. Lock down members table RLS ─────────────────────────

-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Allow anonymous read and write" ON members;

-- Customers can only read/update their own record
CREATE POLICY "members_self_read" ON members
  FOR SELECT USING (
    -- Service role bypasses (used by API routes)
    auth.role() = 'service_role'
    -- Anonymous/authenticated users can only see their own row
    OR id::text = coalesce(
      current_setting('request.headers', true)::json->>'x-member-id',
      ''
    )
  );

CREATE POLICY "members_self_update" ON members
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR id::text = coalesce(
      current_setting('request.headers', true)::json->>'x-member-id',
      ''
    )
  ) WITH CHECK (
    auth.role() = 'service_role'
    OR id::text = coalesce(
      current_setting('request.headers', true)::json->>'x-member-id',
      ''
    )
  );

-- Only service role can insert (registration goes through API)
CREATE POLICY "members_service_insert" ON members
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR true  -- Allow anon insert for self-registration
  );

-- Block all client-side deletes
CREATE POLICY "members_no_delete" ON members
  FOR DELETE USING (auth.role() = 'service_role');

-- ─── 3. Create a view that hides sensitive fields from client ─

CREATE OR REPLACE VIEW members_safe AS
  SELECT
    id, name, email, phone_number, points, wallet_balance,
    tier, role, member_type, wholesale_price_tier, addresses,
    security_level
  FROM members;

COMMENT ON VIEW members_safe IS
  'Public-safe view of members that excludes password_hash, admin_permissions, and must_change_password.';

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
