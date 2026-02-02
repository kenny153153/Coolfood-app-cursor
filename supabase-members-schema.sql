-- Run in Supabase SQL Editor to create public.members.
-- If you see "Could not find the table 'public.members' in the schema cache", run this entire file in Supabase Dashboard → SQL Editor → New query, then run it.

CREATE TABLE IF NOT EXISTS public.members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  password_hash TEXT,
  phone_number TEXT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  wallet_balance NUMERIC NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze',
  role TEXT NOT NULL DEFAULT 'customer',
  addresses JSONB
);

-- Ensure columns exist (for existing tables)
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Make phone_number NOT NULL only if we're not breaking existing rows (run once)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'phone_number') THEN
    UPDATE public.members SET phone_number = COALESCE(phone_number, '') WHERE phone_number IS NULL;
    ALTER TABLE public.members ALTER COLUMN phone_number SET NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Unique on phone for login/signup
DROP INDEX IF EXISTS public.members_phone_unique;
CREATE UNIQUE INDEX members_phone_unique ON public.members (phone_number);

-- Optional unique on email where set (allow multiple NULLs)
DROP INDEX IF EXISTS public.members_email_unique;
CREATE UNIQUE INDEX members_email_unique ON public.members (email) WHERE email IS NOT NULL AND email != '';

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read and write" ON public.members;
CREATE POLICY "Allow anonymous read and write"
  ON public.members FOR ALL
  USING (true)
  WITH CHECK (true);
