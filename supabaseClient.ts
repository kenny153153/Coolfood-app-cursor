import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = String(
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_PUBLIC_SUPABASE ||
  ''
);
const supabaseAnonKey = String(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  ''
);

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.placeholder';

let supabase: SupabaseClient;
try {
  const url = supabaseUrl.startsWith('http') ? supabaseUrl : PLACEHOLDER_URL;
  const key = supabaseAnonKey.length > 10 ? supabaseAnonKey : PLACEHOLDER_KEY;
  supabase = createClient(url, key);
} catch (err) {
  console.error('[SupabaseClient] init failed, using placeholder:', err);
  try {
    supabase = createClient(PLACEHOLDER_URL, PLACEHOLDER_KEY);
  } catch {
    supabase = null as unknown as SupabaseClient;
  }
}

export { supabase };
