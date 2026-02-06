import { createClient } from '@supabase/supabase-js';
import dns from 'dns/promises';

type HealthResponse = {
  ok: boolean;
  stage: string;
  error?: string;
  cause?: unknown;
  supabaseUrl?: string;
  supabaseHost?: string;
  apikeyPrefix?: string;
};

const safeTrim = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export default async function handler(
  req: { method?: string },
  res: { status: (n: number) => { json: (o: HealthResponse) => void } }
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, stage: 'method', error: 'Method not allowed' });
  }

  const supabaseUrlRaw = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  const supabaseUrl = safeTrim(supabaseUrlRaw).replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  const apikeyPrefix = serviceRoleKey ? serviceRoleKey.slice(0, 5) : '(empty)';

  console.log('[supabase-health] URL raw:', supabaseUrlRaw);
  console.log('[supabase-health] URL sanitized:', supabaseUrl);
  console.log('[supabase-health] apikey prefix:', apikeyPrefix);

  try {
    const urlObj = new URL(supabaseUrl);
    console.log('[supabase-health] URL host:', urlObj.host);
    try {
      const resolved = await dns.lookup(urlObj.hostname);
      console.log('[supabase-health] DNS lookup:', resolved);
    } catch (dnsErr) {
      console.error('[supabase-health] DNS lookup failed:', JSON.stringify(dnsErr, Object.getOwnPropertyNames(dnsErr)));
    }
  } catch (e) {
    console.error('[supabase-health] URL invalid:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
    return res.status(500).json({
      ok: false,
      stage: 'url-parse',
      error: 'SUPABASE_URL invalid',
      cause: e,
      supabaseUrl: supabaseUrlRaw,
      apikeyPrefix,
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({
      ok: false,
      stage: 'env',
      error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      supabaseUrl: supabaseUrlRaw,
      apikeyPrefix,
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    try {
      const pingRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      console.log('[supabase-health] REST ping status:', pingRes.status);
    } catch (pingErr) {
      console.error('[supabase-health] REST ping failed:', JSON.stringify(pingErr, Object.getOwnPropertyNames(pingErr)));
      console.error('[supabase-health] REST ping cause:', (pingErr as Error)?.cause);
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);
    if (error) {
      console.error('[supabase-health] Query error:', error.message);
      return res.status(502).json({
        ok: false,
        stage: 'query',
        error: error.message,
        supabaseUrl: supabaseUrlRaw,
        apikeyPrefix,
      });
    }
    console.log('[supabase-health] Query ok:', Array.isArray(data) ? data.length : 0);
    return res.status(200).json({
      ok: true,
      stage: 'query',
      supabaseUrl: supabaseUrlRaw,
      supabaseHost: new URL(supabaseUrl).host,
      apikeyPrefix,
    });
  } catch (e) {
    console.error('[supabase-health] Query exception:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
    console.error('[supabase-health] Cause:', (e as Error)?.cause);
    return res.status(502).json({
      ok: false,
      stage: 'query-exception',
      error: (e as Error)?.message ?? String(e),
      cause: e,
      supabaseUrl: supabaseUrlRaw,
      apikeyPrefix,
    });
  }
}
