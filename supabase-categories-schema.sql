-- Run in Supabase SQL Editor to create/align public.categories

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.categories;
CREATE POLICY "Allow anonymous read and write"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);
