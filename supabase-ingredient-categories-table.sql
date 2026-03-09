-- ============================================================
-- Create ingredient_categories table
-- Run once in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ingredient_categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '📦',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- No seed data — create your own categories from the admin panel (原材料 → 類別管理).
