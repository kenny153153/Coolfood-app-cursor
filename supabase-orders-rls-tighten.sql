-- ============================================================
-- Tighten RLS on orders table
-- 
-- Replaces the permissive "allow everything" policy with
-- granular per-operation policies:
--   SELECT: allowed (admin panel still uses anon key client-side)
--   INSERT: allowed (storefront order creation uses anon key)
--   UPDATE: allowed (admin panel updates order status client-side)
--   DELETE: BLOCKED (orders should never be deleted by clients)
--
-- Customer reads now go through secure API routes (/api/customer-orders,
-- /api/customer-order-details) that validate sessions server-side and
-- use the service role key (which bypasses RLS).
--
-- Run this AFTER deploying the new API routes.
-- ============================================================

-- Drop the old overly-permissive "FOR ALL" policy
DROP POLICY IF EXISTS "Allow anonymous read and insert" ON public.orders;

-- SELECT: allow reads (needed by admin panel which uses anon key client-side)
CREATE POLICY "orders_select_policy"
  ON public.orders FOR SELECT
  USING (true);

-- INSERT: allow creating orders (storefront creates orders with anon key)
CREATE POLICY "orders_insert_policy"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- UPDATE: allow (admin panel updates order status/tracking via anon key)
CREATE POLICY "orders_update_policy"
  ON public.orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: block entirely — orders should never be deleted by any client
CREATE POLICY "orders_delete_policy"
  ON public.orders FOR DELETE
  USING (false);
