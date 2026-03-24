-- ═══════════════════════════════════════════════════
-- Wholesale Registration Fields Migration
-- Adds company BR and storefront photo columns to members table
-- ═══════════════════════════════════════════════════

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS br_number TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS br_doc_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS storefront_photo_url TEXT;

COMMENT ON COLUMN public.members.company_name IS 'Wholesale: company/restaurant name';
COMMENT ON COLUMN public.members.br_number IS 'Wholesale: Business Registration (BR) number';
COMMENT ON COLUMN public.members.br_doc_url IS 'Wholesale: uploaded BR document image URL';
COMMENT ON COLUMN public.members.storefront_photo_url IS 'Wholesale: uploaded restaurant front door photo URL';
