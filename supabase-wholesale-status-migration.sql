-- Wholesale registration enhancement: approval status, business info, storefront preparing flag
-- Run this migration after supabase-wholesale-registration-migration.sql

-- Wholesale approval status: pending → approved / rejected
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS wholesale_status TEXT DEFAULT NULL;

-- Business info fields for wholesale registration
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch_count TEXT DEFAULT NULL;

-- Storefront photo can be skipped if preparing
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS storefront_preparing BOOLEAN DEFAULT NULL;

-- Staff-managed delivery address (from BR) and BR update tracking
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS delivery_address TEXT DEFAULT NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS br_update_required BOOLEAN DEFAULT NULL;

-- Set existing wholesale members to 'approved' so they aren't locked out
UPDATE public.members
SET wholesale_status = 'approved'
WHERE member_type = 'wholesale'
  AND wholesale_status IS NULL;

-- Index for quick lookup of pending applications
CREATE INDEX IF NOT EXISTS idx_members_wholesale_status
  ON public.members (wholesale_status)
  WHERE member_type = 'wholesale';
