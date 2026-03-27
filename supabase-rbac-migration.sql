-- ============================================================
-- RBAC (Role-Based Access Control) Migration
-- Run once in Supabase SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- 1. staff_roles — role templates with default module permissions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.staff_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  module_permissions JSONB NOT NULL DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_roles_public" ON public.staff_roles FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 2. Seed default role templates
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.staff_roles (id, name, display_name, is_system, module_permissions, sort_order) VALUES

-- Super Admin — all modules
('role_super_admin', 'super_admin', '超級管理員', true, '{
  "global_dashboard": true, "new_order": true, "orders": true,
  "dispatch": true, "warehouse_ops": true, "production": true,
  "accounting": true, "wholesale_clients": true, "sales_reps": true,
  "inventory": true, "pricing": true, "dashboard": true,
  "members": true, "slideshow": true, "recipes": true,
  "ingredients": true, "costs": true, "language": true,
  "settings": true, "admin_management": true
}'::jsonb, 0),

-- Admin — everything except admin management
('role_admin', 'admin', '管理員', true, '{
  "global_dashboard": true, "new_order": true, "orders": true,
  "dispatch": true, "warehouse_ops": true, "production": true,
  "accounting": true, "wholesale_clients": true, "sales_reps": true,
  "inventory": true, "pricing": true, "dashboard": true,
  "members": true, "slideshow": true, "recipes": true,
  "ingredients": true, "costs": true, "language": true,
  "settings": true, "admin_management": false
}'::jsonb, 1),

-- Customer Service
('role_customer_service', 'customer_service', '客服', false, '{
  "global_dashboard": true, "new_order": true, "orders": true,
  "dispatch": false, "warehouse_ops": false, "production": false,
  "accounting": false, "wholesale_clients": true, "sales_reps": false,
  "inventory": false, "pricing": false, "dashboard": false,
  "members": true, "slideshow": false, "recipes": false,
  "ingredients": false, "costs": false, "language": false,
  "settings": false, "admin_management": false
}'::jsonb, 2),

-- Buyer
('role_buyer', 'buyer', '採購', false, '{
  "global_dashboard": true, "new_order": false, "orders": false,
  "dispatch": false, "warehouse_ops": true, "production": false,
  "accounting": false, "wholesale_clients": false, "sales_reps": false,
  "inventory": true, "pricing": true, "dashboard": false,
  "members": false, "slideshow": false, "recipes": false,
  "ingredients": true, "costs": true, "language": false,
  "settings": false, "admin_management": false
}'::jsonb, 3),

-- Accountant
('role_accountant', 'accountant', '會計', false, '{
  "global_dashboard": true, "new_order": false, "orders": true,
  "dispatch": false, "warehouse_ops": false, "production": false,
  "accounting": true, "wholesale_clients": false, "sales_reps": false,
  "inventory": false, "pricing": true, "dashboard": true,
  "members": false, "slideshow": false, "recipes": false,
  "ingredients": false, "costs": true, "language": false,
  "settings": false, "admin_management": false
}'::jsonb, 4),

-- Factory
('role_factory', 'factory', '工場', false, '{
  "global_dashboard": true, "new_order": false, "orders": false,
  "dispatch": true, "warehouse_ops": true, "production": true,
  "accounting": false, "wholesale_clients": false, "sales_reps": false,
  "inventory": true, "pricing": false, "dashboard": false,
  "members": false, "slideshow": false, "recipes": false,
  "ingredients": true, "costs": false, "language": false,
  "settings": false, "admin_management": false
}'::jsonb, 5),

-- Sales Rep
('role_sales_rep', 'sales_rep', '銷售員', false, '{
  "global_dashboard": true, "new_order": true, "orders": true,
  "dispatch": false, "warehouse_ops": false, "production": false,
  "accounting": false, "wholesale_clients": true, "sales_reps": true,
  "inventory": false, "pricing": false, "dashboard": false,
  "members": false, "slideshow": false, "recipes": false,
  "ingredients": false, "costs": false, "language": false,
  "settings": false, "admin_management": false
}'::jsonb, 6)

ON CONFLICT (id) DO UPDATE SET
  module_permissions = EXCLUDED.module_permissions,
  display_name = EXCLUDED.display_name,
  updated_at = now();

-- ═══════════════════════════════════════════════════════════════
-- 3. Ensure super admin member exists (96988711)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.members (id, name, phone_number, password_hash, role, admin_permissions, points, wallet_balance, tier)
VALUES (
  gen_random_uuid()::text,
  'Super Admin',
  '96988711',
  '1b57cfbb47d6bce8:cb1149ed0539b75e7e700e21cf0f96e489fd97245aa710fa6481115f587271d6',
  'super_admin',
  '{
    "global_dashboard": true, "new_order": true, "orders": true,
    "dispatch": true, "warehouse_ops": true, "production": true,
    "accounting": true, "wholesale_clients": true, "sales_reps": true,
    "inventory": true, "pricing": true, "dashboard": true,
    "members": true, "slideshow": true, "recipes": true,
    "ingredients": true, "costs": true, "language": true,
    "settings": true, "admin_management": true
  }'::jsonb,
  0, 0, 'Bronze'
)
ON CONFLICT (phone_number) DO UPDATE SET
  role = 'super_admin',
  password_hash = CASE
    WHEN public.members.password_hash IS NULL OR public.members.password_hash = ''
    THEN '1b57cfbb47d6bce8:cb1149ed0539b75e7e700e21cf0f96e489fd97245aa710fa6481115f587271d6'
    ELSE public.members.password_hash
  END,
  admin_permissions = '{
    "global_dashboard": true, "new_order": true, "orders": true,
    "dispatch": true, "warehouse_ops": true, "production": true,
    "accounting": true, "wholesale_clients": true, "sales_reps": true,
    "inventory": true, "pricing": true, "dashboard": true,
    "members": true, "slideshow": true, "recipes": true,
    "ingredients": true, "costs": true, "language": true,
    "settings": true, "admin_management": true
  }'::jsonb;

-- ═══════════════════════════════════════════════════════════════
-- 4. Also update 91111111 if it exists (admin)
-- ═══════════════════════════════════════════════════════════════

UPDATE public.members
SET
  role = 'admin',
  admin_permissions = '{
    "global_dashboard": true, "new_order": true, "orders": true,
    "dispatch": true, "warehouse_ops": true, "production": true,
    "accounting": true, "wholesale_clients": true, "sales_reps": true,
    "inventory": true, "pricing": true, "dashboard": true,
    "members": true, "slideshow": true, "recipes": true,
    "ingredients": true, "costs": true, "language": true,
    "settings": true, "admin_management": false
  }'::jsonb
WHERE phone_number = '91111111';
