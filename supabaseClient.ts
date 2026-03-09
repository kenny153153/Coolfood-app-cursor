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
// A valid JWT-format placeholder key so Supabase doesn't throw on parse
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.abc123';

// Always use native browser WebSocket to avoid the `ws` Node package
// being bundled, which exports a non-constructor stub in browser builds.
const wsTransport = typeof WebSocket !== 'undefined' ? WebSocket : undefined;

let supabase: SupabaseClient;
try {
  const url = supabaseUrl.startsWith('http') ? supabaseUrl : PLACEHOLDER_URL;
  const key = supabaseAnonKey.length > 20 ? supabaseAnonKey : PLACEHOLDER_KEY;
  supabase = createClient(url, key, {
    realtime: { transport: wsTransport as unknown as typeof WebSocket },
  });
} catch (err) {
  console.error('[SupabaseClient] init failed:', err);
  supabase = null as unknown as SupabaseClient;
}

export { supabase };
