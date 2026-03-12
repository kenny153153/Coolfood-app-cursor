-- Add sort_order to categories table for drag-and-drop ordering
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows with sequential order based on insertion
UPDATE public.categories SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) - 1 AS rn FROM public.categories
) sub
WHERE public.categories.id = sub.id;
