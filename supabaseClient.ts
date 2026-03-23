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
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.abc123';

const wsTransport = typeof WebSocket !== 'undefined' ? WebSocket : undefined;

/**
 * Custom fetch that auto-injects session headers into every Supabase REST request.
 * This allows PostgreSQL RLS policies to verify the admin/customer session
 * via is_admin_session() / is_customer_session() functions — no code changes
 * needed in any panel component.
 */
function createAuthFetch(): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (typeof localStorage === 'undefined') return fetch(input, init);
      const headers = new Headers(init?.headers);

      // Inject admin session headers if available
      const adminSession = localStorage.getItem('coolfood_admin_session');
      const adminToken = localStorage.getItem('coolfood_admin_session_token');
      if (adminSession && adminToken) {
        try {
          const admin = JSON.parse(adminSession);
          if (admin?.id) {
            headers.set('x-admin-id', admin.id);
            headers.set('x-admin-session', adminToken);
          }
        } catch { /* ignore parse error */ }
      }

      // Inject customer session headers if available
      const memberId = localStorage.getItem('coolfood_member_id');
      const memberToken = localStorage.getItem('coolfood_session_token');
      if (memberId && memberToken) {
        headers.set('x-member-id', memberId);
        headers.set('x-member-session', memberToken);
      }

      return fetch(input, { ...init, headers });
    } catch {
      return fetch(input, init);
    }
  };
}

let supabase: SupabaseClient;
try {
  const url = supabaseUrl.startsWith('http') ? supabaseUrl : PLACEHOLDER_URL;
  const key = supabaseAnonKey.length > 20 ? supabaseAnonKey : PLACEHOLDER_KEY;
  supabase = createClient(url, key, {
    global: { fetch: createAuthFetch() },
    realtime: { transport: wsTransport as unknown as typeof WebSocket },
  });
} catch (err) {
  console.error('[SupabaseClient] init failed:', err);
  supabase = null as unknown as SupabaseClient;
}

export { supabase };
