-- ============================================================
-- Admin Accounts Fix — Ensure admin/staff can access ALL areas
-- Run once in Supabase SQL Editor
-- ============================================================
-- This migration ensures that accounts 96988711 (super_admin)
-- and 91111111 (admin) exist with correct roles and permissions,
-- so they can log into:
--   1. Admin dashboard (/#admin)
--   2. Retail storefront (/)
--   3. Wholesale storefront (/wholesale)
--
-- NOTE: Passwords are NOT changed. Whatever password is currently
-- set for each account remains unchanged.
--
-- Safe: only references columns that definitely exist on members.
-- ============================================================

DO $$
DECLARE
  full_perms JSONB := '{
    "global_dashboard": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "new_order": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "orders": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "dispatch": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "warehouse_ops": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "production": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "accounting": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "wholesale_clients": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "sales_reps": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "inventory": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "pricing": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "dashboard": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "members": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "slideshow": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "recipes": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "ingredients": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "costs": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "language": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "settings": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "admin_management": {"read":true,"create":true,"update":true,"delete":true,"export":true}
  }'::jsonb;

  admin_perms JSONB := '{
    "global_dashboard": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "new_order": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "orders": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "dispatch": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "warehouse_ops": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "production": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "accounting": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "wholesale_clients": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "sales_reps": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "inventory": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "pricing": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "dashboard": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "members": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "slideshow": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "recipes": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "ingredients": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "costs": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "language": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "settings": {"read":true,"create":true,"update":true,"delete":true,"export":true},
    "admin_management": {"read":false,"create":false,"update":false,"delete":false,"export":false}
  }'::jsonb;

  has_member_type BOOLEAN;
  has_security_level BOOLEAN;
  row_exists BOOLEAN;
BEGIN

  -- Detect which optional columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='members' AND column_name='member_type'
  ) INTO has_member_type;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='members' AND column_name='security_level'
  ) INTO has_security_level;

  -- ─── 96988711 — super_admin ───────────────────────────────

  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE phone_number = '96988711'
  ) INTO row_exists;

  IF row_exists THEN
    -- Row exists: just update role + permissions, keep password
    UPDATE public.members SET
      role = 'super_admin',
      admin_permissions = full_perms
    WHERE phone_number = '96988711';

    IF has_member_type THEN
      UPDATE public.members SET member_type = 'wholesale' WHERE phone_number = '96988711';
    END IF;
    IF has_security_level THEN
      UPDATE public.members SET security_level = 10 WHERE phone_number = '96988711';
    END IF;

    RAISE NOTICE '96988711: updated to super_admin';
  ELSE
    -- Row does not exist: insert with minimal required columns
    INSERT INTO public.members (id, name, phone_number, role, admin_permissions, points, tier)
    VALUES (
      'u-superadmin-' || extract(epoch from now())::bigint,
      'Super Admin',
      '96988711',
      'super_admin',
      full_perms,
      0, 'VIP'
    );

    IF has_member_type THEN
      UPDATE public.members SET member_type = 'wholesale' WHERE phone_number = '96988711';
    END IF;
    IF has_security_level THEN
      UPDATE public.members SET security_level = 10 WHERE phone_number = '96988711';
    END IF;

    RAISE NOTICE '96988711: inserted as super_admin (NO PASSWORD SET — you must set one via admin panel or SQL)';
  END IF;

  -- ─── 91111111 — admin ─────────────────────────────────────

  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE phone_number = '91111111'
  ) INTO row_exists;

  IF row_exists THEN
    UPDATE public.members SET
      role = 'admin',
      admin_permissions = admin_perms
    WHERE phone_number = '91111111';

    IF has_member_type THEN
      UPDATE public.members SET member_type = 'wholesale' WHERE phone_number = '91111111';
    END IF;
    IF has_security_level THEN
      UPDATE public.members SET security_level = 5 WHERE phone_number = '91111111';
    END IF;

    RAISE NOTICE '91111111: updated to admin';
  ELSE
    INSERT INTO public.members (id, name, phone_number, role, admin_permissions, points, tier)
    VALUES (
      'u-admin-' || extract(epoch from now())::bigint,
      'Admin',
      '91111111',
      'admin',
      admin_perms,
      0, 'VIP'
    );

    IF has_member_type THEN
      UPDATE public.members SET member_type = 'wholesale' WHERE phone_number = '91111111';
    END IF;
    IF has_security_level THEN
      UPDATE public.members SET security_level = 5 WHERE phone_number = '91111111';
    END IF;

    RAISE NOTICE '91111111: inserted as admin (NO PASSWORD SET — you must set one via admin panel or SQL)';
  END IF;

END $$;

-- ─── Verify ─────────────────────────────────────────────────

SELECT id, name, phone_number, role,
       CASE WHEN password_hash IS NOT NULL AND password_hash != '' THEN 'SET' ELSE 'MISSING' END AS password_status
FROM public.members
WHERE phone_number IN ('96988711', '91111111');
