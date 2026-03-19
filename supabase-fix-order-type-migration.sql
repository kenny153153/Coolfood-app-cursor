-- Fix: Add order_type column if missing (causes "Could not find the 'order_type' column" error)
-- Run this in the Supabase SQL Editor

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'retail';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
