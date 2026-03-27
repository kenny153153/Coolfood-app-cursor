-- Migration: Add server-side session tracking to members table
-- This enables time-bound session tokens with server-enforced expiry.
-- Run this in Supabase SQL Editor before deploying the code changes.

-- 1. Add session_issued_at column (epoch milliseconds of last login)
ALTER TABLE members ADD COLUMN IF NOT EXISTS session_issued_at bigint DEFAULT 0;

-- 2. Index for fast session validation lookups
CREATE INDEX IF NOT EXISTS idx_members_session_issued ON members (id, session_issued_at)
  WHERE role != 'customer';
