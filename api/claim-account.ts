/**
 * Server-side Claim Account API — POST /api/claim-account
 * Body: { action: 'lookup' | 'claim', ... }
 *
 * Allows legacy Shopline members to claim their account by:
 * 1. Looking up their email to find the imported record
 * 2. Setting a new phone number + password to activate the account
 */
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

const BCRYPT_ROUNDS = 12;

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function generateSessionToken(memberId: string, passwordHash: string | null, issuedAt?: number): string {
  const base = `session:${memberId}:${passwordHash ?? ''}`;
  return issuedAt ? sha256(`${base}:${issuedAt}`) : sha256(base);
}

function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  return { supabaseUrl, serviceRoleKey };
}

function stripPasswordHash(member: Record<string, unknown>): Record<string, unknown> {
  const { password_hash: _, ...safe } = member;
  return safe;
}

const lookupSchema = z.object({
  action: z.literal('lookup'),
  email: z.string().email(),
});

const claimSchema = z.object({
  action: z.literal('claim'),
  email: z.string().email(),
  phone: z.string().min(4),
  password: z.string().min(6),
});

type Req = {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => void };
};

async function supaFetch(url: string, serviceRoleKey: string, opts?: RequestInit) {
  return fetch(url, {
    ...opts,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(opts?.headers as Record<string, string> ?? {}),
    },
  });
}

async function handleLookup(body: z.infer<typeof lookupSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const email = body.email.toLowerCase().trim();

  const res = await supaFetch(
    `${supabaseUrl}/rest/v1/members?email=eq.${encodeURIComponent(email)}&import_source=eq.shopline&claimed_at=is.null&select=id,name,phone_number,import_metadata`,
    serviceRoleKey
  );

  if (!res.ok) {
    console.error('[claim-account/lookup] Supabase query failed:', res.status, await res.text());
    return { status: 500, body: { error: '伺服器錯誤，請稍後再試', code: 'QUERY_FAILED' } };
  }

  const members = await res.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member) {
    return { status: 404, body: { error: '找不到此電郵的舊會員記錄', code: 'NOT_FOUND' } };
  }

  const hasRealPhone = !member.phone_number?.startsWith('SHOPLINE-');

  return {
    status: 200,
    body: {
      found: true,
      name: member.name,
      hasRealPhone,
      existingPhone: hasRealPhone ? member.phone_number : null,
      shoplineJoinDate: member.import_metadata?.shopline_join_date ?? null,
      shoplineOrders: member.import_metadata?.shopline_orders ?? '0',
    },
  };
}

async function handleClaim(body: z.infer<typeof claimSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const email = body.email.toLowerCase().trim();
  const phone = body.phone.trim();

  const memberRes = await supaFetch(
    `${supabaseUrl}/rest/v1/members?email=eq.${encodeURIComponent(email)}&import_source=eq.shopline&claimed_at=is.null&select=*`,
    serviceRoleKey
  );

  if (!memberRes.ok) {
    console.error('[claim-account/claim] Supabase query failed:', memberRes.status, await memberRes.text());
    return { status: 500, body: { error: '伺服器錯誤，請稍後再試', code: 'QUERY_FAILED' } };
  }

  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member) {
    return { status: 404, body: { error: '找不到此電郵的舊會員記錄，或帳戶已被啟用', code: 'NOT_FOUND' } };
  }

  // Check if this phone number is already taken by another member
  const phoneCheck = await supaFetch(
    `${supabaseUrl}/rest/v1/members?phone_number=eq.${encodeURIComponent(phone)}&select=id`,
    serviceRoleKey
  );
  const existingPhone = await phoneCheck.json();
  if (Array.isArray(existingPhone) && existingPhone.length > 0 && existingPhone[0].id !== member.id) {
    return { status: 409, body: { error: '此電話號碼已被其他會員使用', code: 'PHONE_EXISTS' } };
  }

  const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
  const issuedAt = Date.now();

  const updateRes = await supaFetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}`,
    serviceRoleKey,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        phone_number: phone,
        password_hash: passwordHash,
        must_change_password: false,
        claimed_at: new Date().toISOString(),
        session_issued_at: issuedAt,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.error('[claim-account/claim] Update failed:', updateRes.status, err);
    return { status: 500, body: { error: '啟用帳戶失敗，請稍後再試', code: 'UPDATE_FAILED' } };
  }

  const rows = await updateRes.json();
  const updated = Array.isArray(rows) ? rows[0] : rows;
  const sessionToken = generateSessionToken(updated.id, updated.password_hash, issuedAt);

  return {
    status: 200,
    body: {
      success: true,
      user: stripPasswordHash(updated),
      sessionToken,
      issuedAt,
    },
  };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.body as Record<string, unknown>)?.action;
  if (!action || !['lookup', 'claim'].includes(action as string)) {
    return res.status(400).json({ error: 'Invalid action. Use: lookup, claim' });
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  const ip = getClientIp(req.headers ?? {});

  try {
    if (action === 'lookup') {
      const rl = await checkRateLimit(`claim-lookup:${ip}`, 15, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED', retryAfterMs: rl.retryAfterMs });
      }
      const parsed = lookupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: '請輸入有效的電郵地址', code: 'VALIDATION_ERROR' });
      }
      const result = await handleLookup(parsed.data, supabaseUrl, serviceRoleKey);
      return res.status(result.status).json(result.body);
    }

    if (action === 'claim') {
      const rl = await checkRateLimit(`claim:${ip}`, 5, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED' });
      }
      const parsed = claimSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: '請填寫電郵、電話及密碼', code: 'VALIDATION_ERROR' });
      }
      const result = await handleClaim(parsed.data, supabaseUrl, serviceRoleKey);
      return res.status(result.status).json(result.body);
    }
  } catch (e) {
    console.error('[claim-account] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤', code: 'SERVER_ERROR' });
  }
}
