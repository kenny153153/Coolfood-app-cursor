-- ═══════════════════════════════════════════════════════════════════
-- Recipe Meat Categories Migration
-- Adds category_type column to recipe_categories and inserts meat types.
-- Run this in Supabase Dashboard → SQL Editor → New query → Run.
-- ═══════════════════════════════════════════════════════════════════

-- 1) Add category_type column to recipe_categories
ALTER TABLE public.recipe_categories
  ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'method'
  CHECK (category_type IN ('method', 'meat'));

-- 2) Ensure existing categories are type 'method'
UPDATE public.recipe_categories
  SET category_type = 'method'
  WHERE category_type IS NULL OR category_type NOT IN ('method', 'meat');

-- 3) Seed meat categories
INSERT INTO public.recipe_categories (id, name, icon, sort_order, category_type) VALUES
  ('meat-beef',    '牛肉', '🥩', 10, 'meat'),
  ('meat-pork',    '豬肉', '🥓', 11, 'meat'),
  ('meat-chicken', '雞肉', '🍗', 12, 'meat'),
  ('meat-fish',    '魚類', '🐟', 13, 'meat'),
  ('meat-seafood', '海鮮', '🦐', 14, 'meat'),
  ('meat-lamb',    '羊肉', '🐑', 15, 'meat'),
  ('meat-veggie',  '素菜', '🥦', 16, 'meat')
ON CONFLICT (id) DO NOTHING;

-- 4) Tag existing recipes with meat categories based on title pattern matching
-- Beef
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-beef')
  WHERE (title ILIKE '%牛%' OR title ILIKE '%beef%')
    AND NOT ('meat-beef' = ANY(category_ids));

-- Pork
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-pork')
  WHERE (title ILIKE '%豬%' OR title ILIKE '%pork%' OR title ILIKE '%排骨%' OR title ILIKE '%五花%')
    AND NOT ('meat-pork' = ANY(category_ids));

-- Chicken
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-chicken')
  WHERE (title ILIKE '%雞%' OR title ILIKE '%chicken%')
    AND NOT ('meat-chicken' = ANY(category_ids));

-- Fish
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-fish')
  WHERE (title ILIKE '%魚%' OR title ILIKE '%fish%')
    AND NOT ('meat-fish' = ANY(category_ids));

-- Seafood (shrimp, crab, scallops, squid, oysters, clams etc.)
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-seafood')
  WHERE (
    title ILIKE '%蝦%' OR title ILIKE '%蟹%' OR title ILIKE '%海鮮%'
    OR title ILIKE '%帶子%' OR title ILIKE '%扇貝%' OR title ILIKE '%魷魚%'
    OR title ILIKE '%章魚%' OR title ILIKE '%蠔%' OR title ILIKE '%蛤%'
    OR title ILIKE '%貝%' OR title ILIKE '%seafood%' OR title ILIKE '%shrimp%'
  )
    AND NOT ('meat-seafood' = ANY(category_ids));

-- Lamb
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-lamb')
  WHERE (title ILIKE '%羊%' OR title ILIKE '%lamb%')
    AND NOT ('meat-lamb' = ANY(category_ids));

-- Veggie / vegetarian
UPDATE public.recipes
  SET category_ids = array_append(category_ids, 'meat-veggie')
  WHERE (
    title ILIKE '%豆腐%' OR title ILIKE '%素%' OR title ILIKE '%蔬菜%'
    OR title ILIKE '%tofu%' OR title ILIKE '%veggie%' OR title ILIKE '%vegetarian%'
  )
    AND NOT ('meat-veggie' = ANY(category_ids));
