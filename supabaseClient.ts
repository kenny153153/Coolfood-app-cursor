import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.VITE_PUBLIC_SUPABASE ??
  '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ??
  '';

let supabase: SupabaseClient;
try {
  supabase =
    supabaseUrl && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey)
      : (createClient('https://placeholder.supabase.co', 'placeholder') as SupabaseClient);
} catch {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder');
}

export { supabase };
