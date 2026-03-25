-- ============================================================
-- Inventory RPCs: committed_qty, incoming_qty, ingredient stock
-- Run this migration in Supabase SQL Editor
-- ============================================================

-- 1. RPC: decrement ingredient stock (used by ProductionPanel on approval)
CREATE OR REPLACE FUNCTION public.decrement_ingredient_stock(
  p_ingredient_id TEXT,
  p_qty NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - p_qty),
      updated_at = now()
  WHERE id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC: increment committed_qty (called when wholesale order is placed)
CREATE OR REPLACE FUNCTION public.increment_committed_qty(
  p_ingredient_id TEXT,
  p_qty NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET committed_qty = COALESCE(committed_qty, 0) + p_qty,
      updated_at = now()
  WHERE id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: decrement committed_qty (called when order is dispatched/delivered)
CREATE OR REPLACE FUNCTION public.decrement_committed_qty(
  p_ingredient_id TEXT,
  p_qty NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET committed_qty = GREATEST(0, COALESCE(committed_qty, 0) - p_qty),
      updated_at = now()
  WHERE id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: increment incoming_qty (called when PO is approved)
CREATE OR REPLACE FUNCTION public.increment_incoming_qty(
  p_ingredient_id TEXT,
  p_qty NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET incoming_qty = COALESCE(incoming_qty, 0) + p_qty,
      updated_at = now()
  WHERE id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: decrement incoming_qty (called when GRN confirms receipt)
CREATE OR REPLACE FUNCTION public.decrement_incoming_qty(
  p_ingredient_id TEXT,
  p_qty NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE public.ingredients
  SET incoming_qty = GREATEST(0, COALESCE(incoming_qty, 0) - p_qty),
      updated_at = now()
  WHERE id = p_ingredient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated for client-side calls
GRANT EXECUTE ON FUNCTION public.decrement_ingredient_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_committed_qty TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_committed_qty TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_incoming_qty TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_incoming_qty TO anon, authenticated;
