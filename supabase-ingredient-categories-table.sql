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

-- Seed the default preset categories (skip rows that already exist)
INSERT INTO public.ingredient_categories (id, name, emoji, sort_order) VALUES
  ('ic-beef',      '牛肉',  '🐄', 0),
  ('ic-pork',      '豬肉',  '🐷', 1),
  ('ic-chicken',   '雞肉',  '🐔', 2),
  ('ic-lamb',      '羊肉',  '🐑', 3),
  ('ic-seafood',   '海鮮',  '🦞', 4),
  ('ic-veg',       '蔬菜',  '🥦', 5),
  ('ic-seasoning', '調味料','🧂', 6),
  ('ic-dry',       '乾貨',  '🌾', 7),
  ('ic-other',     '其他',  '📦', 8)
ON CONFLICT (id) DO NOTHING;
