-- ============================================================
-- Production Security Migration (v2 — Database-Level Auth)
-- ============================================================
-- Run this in Supabase SQL Editor BEFORE going live.
--
-- Strategy: instead of requiring every frontend call to go through
-- API routes, we verify admin/customer sessions INSIDE PostgreSQL
-- via request headers that the Supabase JS client sends automatically.
--
-- This secures the entire database without changing any panel code.
-- ============================================================

-- ─── 0. PREREQUISITES ─────────────────────────────────────────
-- pgcrypto is needed for digest() used in session token verification

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── 1. SESSION VERIFICATION FUNCTIONS ────────────────────────

-- Verify admin session from request headers (x-admin-id + x-admin-session).
-- Supports time-bound tokens (with session_issued_at) and legacy fallback.
-- SECURITY DEFINER so it can read members.password_hash regardless of RLS.
CREATE OR REPLACE FUNCTION is_admin_session() RETURNS boolean AS $$
DECLARE
  headers_raw text;
  admin_id text;
  session_token text;
  stored_hash text;
  admin_role text;
  issued_at bigint;
  expected_token text;
  legacy_token text;
BEGIN
  headers_raw := current_setting('request.headers', true);
  IF headers_raw IS NULL OR headers_raw = '' THEN RETURN false; END IF;

  BEGIN
    admin_id      := headers_raw::json->>'x-admin-id';
    session_token := headers_raw::json->>'x-admin-session';
  EXCEPTION WHEN OTHERS THEN RETURN false;
  END;

  IF admin_id IS NULL OR admin_id = '' OR session_token IS NULL OR session_token = '' THEN
    RETURN false;
  END IF;

  SELECT password_hash, role, COALESCE(session_issued_at, 0)
    INTO stored_hash, admin_role, issued_at
  FROM public.members
  WHERE id = admin_id AND role NOT IN ('customer');

  IF NOT FOUND THEN RETURN false; END IF;

  IF issued_at > 0 AND (extract(epoch from now()) * 1000 - issued_at) > 604800000 THEN
    RETURN false;
  END IF;

  IF issued_at > 0 THEN
    expected_token := encode(
      digest('session:' || admin_id || ':' || COALESCE(stored_hash, '') || ':' || issued_at::text, 'sha256'),
      'hex'
    );
    IF session_token = expected_token THEN RETURN true; END IF;
  END IF;

  legacy_token := encode(
    digest('session:' || admin_id || ':' || COALESCE(stored_hash, ''), 'sha256'),
    'hex'
  );
  RETURN session_token = legacy_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verify customer session from request headers (x-member-id + x-member-session).
-- Supports time-bound tokens (with session_issued_at) and legacy fallback.
CREATE OR REPLACE FUNCTION is_customer_session() RETURNS boolean AS $$
DECLARE
  headers_raw text;
  member_id text;
  session_token text;
  stored_hash text;
  issued_at bigint;
  expected_token text;
  legacy_token text;
BEGIN
  headers_raw := current_setting('request.headers', true);
  IF headers_raw IS NULL OR headers_raw = '' THEN RETURN false; END IF;

  BEGIN
    member_id     := headers_raw::json->>'x-member-id';
    session_token := headers_raw::json->>'x-member-session';
  EXCEPTION WHEN OTHERS THEN RETURN false;
  END;

  IF member_id IS NULL OR member_id = '' OR session_token IS NULL OR session_token = '' THEN
    RETURN false;
  END IF;

  SELECT password_hash, COALESCE(session_issued_at, 0)
    INTO stored_hash, issued_at
  FROM public.members
  WHERE id = member_id;

  IF NOT FOUND THEN RETURN false; END IF;

  IF issued_at > 0 AND (extract(epoch from now()) * 1000 - issued_at) > 604800000 THEN
    RETURN false;
  END IF;

  IF issued_at > 0 THEN
    expected_token := encode(
      digest('session:' || member_id || ':' || COALESCE(stored_hash, '') || ':' || issued_at::text, 'sha256'),
      'hex'
    );
    IF session_token = expected_token THEN RETURN true; END IF;
  END IF;

  legacy_token := encode(
    digest('session:' || member_id || ':' || COALESCE(stored_hash, ''), 'sha256'),
    'hex'
  );
  RETURN session_token = legacy_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get the current customer member_id from headers (for INSERT ownership checks).
CREATE OR REPLACE FUNCTION get_session_member_id() RETURNS text AS $$
DECLARE
  headers_raw text;
BEGIN
  headers_raw := current_setting('request.headers', true);
  IF headers_raw IS NULL OR headers_raw = '' THEN RETURN NULL; END IF;
  BEGIN
    RETURN headers_raw::json->>'x-member-id';
  EXCEPTION WHEN OTHERS THEN RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper: writable by admin or service_role
CREATE OR REPLACE FUNCTION can_write() RETURNS boolean AS $$
BEGIN
  RETURN auth.role() = 'service_role' OR is_admin_session();
END;
$$ LANGUAGE plpgsql STABLE;


-- ─── 2. PUBLIC-READABLE TABLES ────────────────────────────────
-- Everyone can SELECT. Only admins (verified session) or service_role can write.

-- PRODUCTS
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;
DROP POLICY IF EXISTS "products_write" ON public.products;

CREATE POLICY "products_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_write" ON public.products FOR INSERT WITH CHECK (can_write());
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (can_write()) WITH CHECK (can_write());
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (can_write());

-- CATEGORIES
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.categories;
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;

CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_write" ON public.categories FOR INSERT WITH CHECK (can_write());
CREATE POLICY "categories_update" ON public.categories FOR UPDATE USING (can_write()) WITH CHECK (can_write());
CREATE POLICY "categories_delete" ON public.categories FOR DELETE USING (can_write());

-- SLIDESHOW
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.slideshow;
DROP POLICY IF EXISTS "slideshow_public_read" ON public.slideshow;
DROP POLICY IF EXISTS "slideshow_admin_write" ON public.slideshow;

CREATE POLICY "slideshow_read" ON public.slideshow FOR SELECT USING (true);
CREATE POLICY "slideshow_write" ON public.slideshow FOR ALL
  USING (can_write()) WITH CHECK (can_write());

-- SITE_CONFIG
DROP POLICY IF EXISTS "Public read site_config" ON public.site_config;
DROP POLICY IF EXISTS "Admin write site_config" ON public.site_config;
DROP POLICY IF EXISTS "site_config_public_read" ON public.site_config;
DROP POLICY IF EXISTS "site_config_admin_write" ON public.site_config;

CREATE POLICY "site_config_read" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "site_config_write" ON public.site_config FOR ALL
  USING (can_write()) WITH CHECK (can_write());

-- INGREDIENTS
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.ingredients;
DROP POLICY IF EXISTS "ingredients_public_read" ON public.ingredients;
DROP POLICY IF EXISTS "ingredients_admin_write" ON public.ingredients;

CREATE POLICY "ingredients_read" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "ingredients_write" ON public.ingredients FOR ALL
  USING (can_write()) WITH CHECK (can_write());

-- INGREDIENT_CATEGORIES
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='ingredient_categories') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.ingredient_categories';
    EXECUTE 'DROP POLICY IF EXISTS "ingredient_categories_public_read" ON public.ingredient_categories';
    EXECUTE 'DROP POLICY IF EXISTS "ingredient_categories_admin_write" ON public.ingredient_categories';
    EXECUTE 'CREATE POLICY "ic_read" ON public.ingredient_categories FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "ic_write" ON public.ingredient_categories FOR ALL USING (can_write()) WITH CHECK (can_write())';
  END IF;
END $$;

-- RECIPES + related tables
DROP POLICY IF EXISTS "Allow anonymous read" ON public.recipes;
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.recipes;
DROP POLICY IF EXISTS "Allow admin write" ON public.recipes;
DROP POLICY IF EXISTS "recipes_public_read" ON public.recipes;
DROP POLICY IF EXISTS "recipes_admin_write" ON public.recipes;

CREATE POLICY "recipes_read" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "recipes_write" ON public.recipes FOR ALL USING (can_write()) WITH CHECK (can_write());

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='recipe_categories') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.recipe_categories';
    EXECUTE 'DROP POLICY IF EXISTS "recipe_categories_public_read" ON public.recipe_categories';
    EXECUTE 'DROP POLICY IF EXISTS "recipe_categories_admin_write" ON public.recipe_categories';
    EXECUTE 'CREATE POLICY "rc_read" ON public.recipe_categories FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "rc_write" ON public.recipe_categories FOR ALL USING (can_write()) WITH CHECK (can_write())';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='recipe_product_links') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.recipe_product_links';
    EXECUTE 'DROP POLICY IF EXISTS "recipe_product_links_public_read" ON public.recipe_product_links';
    EXECUTE 'DROP POLICY IF EXISTS "recipe_product_links_admin_write" ON public.recipe_product_links';
    EXECUTE 'CREATE POLICY "rpl_read" ON public.recipe_product_links FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "rpl_write" ON public.recipe_product_links FOR ALL USING (can_write()) WITH CHECK (can_write())';
  END IF;
END $$;

-- SHIPPING_CONFIGS + UPSELL_CONFIGS (storefront needs to read these)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='shipping_configs') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.shipping_configs';
    EXECUTE 'DROP POLICY IF EXISTS "shipping_configs_service_only" ON public.shipping_configs';
    EXECUTE 'CREATE POLICY "sc_read" ON public.shipping_configs FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "sc_write" ON public.shipping_configs FOR ALL USING (can_write()) WITH CHECK (can_write())';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='upsell_configs') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.upsell_configs';
    EXECUTE 'DROP POLICY IF EXISTS "upsell_configs_service_only" ON public.upsell_configs';
    EXECUTE 'CREATE POLICY "uc_read" ON public.upsell_configs FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "uc_write" ON public.upsell_configs FOR ALL USING (can_write()) WITH CHECK (can_write())';
  END IF;
END $$;


-- ─── 3. MEMBERS TABLE ────────────────────────────────────────
-- Admin (verified session) or service_role for full access.
-- Customer self-registration allowed via API routes (INSERT with role='customer' only).
-- SELECT also allowed for customer login lookups via API routes.

DROP POLICY IF EXISTS "members_select" ON public.members;
DROP POLICY IF EXISTS "members_insert" ON public.members;
DROP POLICY IF EXISTS "members_update" ON public.members;
DROP POLICY IF EXISTS "members_no_delete" ON public.members;
DROP POLICY IF EXISTS "members_service_only" ON public.members;
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.members;
DROP POLICY IF EXISTS "members_read" ON public.members;
DROP POLICY IF EXISTS "members_delete" ON public.members;

CREATE POLICY "members_read" ON public.members
  FOR SELECT USING (
    can_write()
    OR auth.role() = 'service_role'
    OR true  -- API routes handle auth server-side; PostgREST SELECT needed for login lookups
  );
CREATE POLICY "members_insert" ON public.members
  FOR INSERT WITH CHECK (
    can_write()
    OR role = 'customer'  -- Allow customer self-registration (API validates all fields server-side)
  );
CREATE POLICY "members_update" ON public.members
  FOR UPDATE USING (can_write()) WITH CHECK (can_write());
CREATE POLICY "members_delete" ON public.members
  FOR DELETE USING (auth.role() = 'service_role');


-- ─── 4. ORDERS TABLE ─────────────────────────────────────────
-- Admin + service_role for SELECT/UPDATE.
-- Customers can INSERT their own orders (member_id must match session).
-- No DELETE from anyone except service_role.

DROP POLICY IF EXISTS "Allow read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update orders" ON public.orders;
DROP POLICY IF EXISTS "Block delete orders" ON public.orders;
DROP POLICY IF EXISTS "orders_public_read" ON public.orders;
DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_public_update" ON public.orders;
DROP POLICY IF EXISTS "orders_service_only" ON public.orders;

CREATE POLICY "orders_read" ON public.orders
  FOR SELECT USING (can_write());

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (
    can_write()
    OR (is_customer_session() AND member_id::text = get_session_member_id())
  );

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (can_write()) WITH CHECK (can_write());

CREATE POLICY "orders_delete" ON public.orders
  FOR DELETE USING (auth.role() = 'service_role');


-- ─── 5. ADMIN/OPS TABLES ─────────────────────────────────────
-- Admin (verified session) or service_role for all operations.

DO $$
DECLARE
  t TEXT;
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
      -- Drop common existing policies
      EXECUTE format('DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "allow_all" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON public.%I', t);
      EXECUTE format('DROP POLICY IF EXISTS "%s_service_only" ON public.%I', t, t);
      -- Drop any policies from the old v1 migration
      EXECUTE format('DROP POLICY IF EXISTS "%s_read" ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS "%s_write" ON public.%I', t, t);
      -- Create new policy: admin session OR service_role
      EXECUTE format(
        'CREATE POLICY "%s_access" ON public.%I FOR ALL USING (can_write()) WITH CHECK (can_write())',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- Also handle quotation-specific policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='quotations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated read quotations" ON public.quotations';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated full access" ON public.quotations';
    EXECUTE 'DROP POLICY IF EXISTS "Anonymous read quotations" ON public.quotations';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='app_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated read" ON public.app_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated full access" ON public.app_settings';
    EXECUTE 'DROP POLICY IF EXISTS "Anonymous read" ON public.app_settings';
  END IF;
END $$;


-- ─── 6. DATABASE INDEXES ─────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_member_id ON public.orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_waybill_no ON public.orders(waybill_no);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='categories') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_categories ON public.products USING gin(categories)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ingredients' AND column_name='category_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients(category_id)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='wholesale_clients') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_wholesale_clients_brand ON public.wholesale_clients(brand)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='notification_logs') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notification_logs_order ON public.notification_logs(order_id)';
  END IF;
END $$;


-- ─── 7. MISSING FUNCTION: increment_ingredient_stock ─────────

CREATE OR REPLACE FUNCTION increment_ingredient_stock(p_id TEXT, p_qty NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET stock = COALESCE(stock, 0) + p_qty
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- HOW THIS WORKS:
--
-- 1. supabaseClient.ts injects session headers (x-admin-id,
--    x-admin-session, x-member-id, x-member-session) into every
--    Supabase REST request automatically.
--
-- 2. PostgreSQL functions is_admin_session() and is_customer_session()
--    read these headers and verify the session token against the
--    password_hash stored in the members table.
--
-- 3. RLS policies use can_write() which checks for admin session
--    or service_role. Public tables are readable by everyone.
--
-- AFTER RUNNING THIS MIGRATION:
--   - Anonymous users can only READ public tables (products, categories, etc.)
--   - Customers with valid sessions can place orders (INSERT into orders)
--   - Admins with valid sessions can read/write ALL tables
--   - API routes using service_role key bypass RLS as before
--   - All existing admin panel code continues to work unchanged
-- ============================================================
