-- Migration: Add purchase_limit column to products table
-- purchase_limit: NULL = no limit, positive integer = max qty per order per customer

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS purchase_limit INT DEFAULT NULL CHECK (purchase_limit IS NULL OR purchase_limit > 0);

COMMENT ON COLUMN public.products.purchase_limit IS '每位客人每單最多購買數量。NULL 代表不限購。';
