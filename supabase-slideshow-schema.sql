-- Run in Supabase SQL Editor. Creates public.slideshow for the store-front advertisement carousel.
-- Run supabase-schema.sql first if you use the combined schema; otherwise run this file alone.

CREATE TABLE IF NOT EXISTS public.slideshow (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.slideshow ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.slideshow;
CREATE POLICY "Allow anonymous read and write"
  ON public.slideshow FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
