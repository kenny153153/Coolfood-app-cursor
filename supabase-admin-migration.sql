-- ============================================================
-- Admin Accounts Migration
-- Run once in Supabase SQL Editor
-- ============================================================

-- 1. Add admin_permissions column to members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS admin_permissions JSONB;

-- 2. Promote 96988711 → super_admin (highest privilege, full access)
UPDATE public.members
SET
  role = 'super_admin',
  admin_permissions = '{
    "dashboard": true,
    "inventory": true,
    "orders": true,
    "members": true,
    "slideshow": true,
    "pricing": true,
    "recipes": true,
    "ingredients": true,
    "costs": true,
    "language": true,
    "settings": true,
    "admin_management": true
  }'::jsonb
WHERE phone_number = '96988711';

-- 3. Promote 91111111 → admin (all modules except admin management)
UPDATE public.members
SET
  role = 'admin',
  admin_permissions = '{
    "dashboard": true,
    "inventory": true,
    "orders": true,
    "members": true,
    "slideshow": true,
    "pricing": true,
    "recipes": true,
    "ingredients": true,
    "costs": true,
    "language": true,
    "settings": true,
    "admin_management": false
  }'::jsonb
WHERE phone_number = '91111111';
