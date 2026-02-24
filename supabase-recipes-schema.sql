-- ═══════════════════════════════════════════════════════════════════
-- Recipes & Recipe-Product Links
-- Run this in Supabase Dashboard → SQL Editor → New query → Run.
-- ═══════════════════════════════════════════════════════════════════

-- 0) recipe_categories table
CREATE TABLE IF NOT EXISTS public.recipe_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  sort_order INT DEFAULT 0
);

ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read recipe_categories" ON public.recipe_categories;
CREATE POLICY "Public read recipe_categories" ON public.recipe_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write recipe_categories" ON public.recipe_categories;
CREATE POLICY "Admin write recipe_categories" ON public.recipe_categories FOR ALL USING (true) WITH CHECK (true);

-- Seed some common categories
INSERT INTO public.recipe_categories (id, name, icon, sort_order) VALUES
  ('quick', '快手菜', '⚡', 1),
  ('airfryer', '氣炸鍋', '🍟', 2),
  ('pasta', '意粉', '🍝', 3),
  ('stew', '燉煮', '🫕', 4),
  ('steak', '牛扒', '🥩', 5),
  ('soup', '湯品', '🍲', 6),
  ('bbq', '燒烤', '🔥', 7)
ON CONFLICT (id) DO NOTHING;

-- 1) recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  cooking_time INT DEFAULT 0,
  serving_size TEXT DEFAULT '1-2人份',
  tags TEXT[] DEFAULT '{}',
  category_ids TEXT[] DEFAULT '{}',
  ingredients_raw JSONB DEFAULT '[]',
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- If table already exists, add new columns
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS serving_size TEXT DEFAULT '1-2人份';
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read recipes" ON public.recipes;
CREATE POLICY "Public read recipes"
  ON public.recipes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write recipes" ON public.recipes;
CREATE POLICY "Admin write recipes"
  ON public.recipes FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2) recipe_product_links join table (many-to-many)
CREATE TABLE IF NOT EXISTS public.recipe_product_links (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  PRIMARY KEY (recipe_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_rpl_recipe ON public.recipe_product_links(recipe_id);
CREATE INDEX IF NOT EXISTS idx_rpl_product ON public.recipe_product_links(product_id);

ALTER TABLE public.recipe_product_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read recipe_product_links" ON public.recipe_product_links;
CREATE POLICY "Public read recipe_product_links"
  ON public.recipe_product_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write recipe_product_links" ON public.recipe_product_links;
CREATE POLICY "Admin write recipe_product_links"
  ON public.recipe_product_links FOR ALL
  USING (true)
  WITH CHECK (true);
