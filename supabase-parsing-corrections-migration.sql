-- Parsing corrections: stores user corrections to AI-parsed WhatsApp orders
-- Used as few-shot learning examples to improve future parsing accuracy

CREATE TABLE IF NOT EXISTS public.parsing_corrections (
  id BIGSERIAL PRIMARY KEY,
  original_text TEXT NOT NULL,
  corrected_product_id TEXT,
  corrected_product_name TEXT NOT NULL,
  corrected_qty NUMERIC,
  corrected_unit TEXT,
  brand TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parsing_corrections_brand ON public.parsing_corrections (brand);
CREATE INDEX idx_parsing_corrections_created ON public.parsing_corrections (created_at DESC);
