/**
 * Server-side Customer Authentication API — POST /api/customer-auth
 * Body: { action: 'login' | 'register' | 'restore-session', ... }
 *
 * Handles all customer auth server-side so password_hash is NEVER sent to the browser.
 * Uses bcrypt for new passwords; gracefully upgrades legacy SHA-256 hashes on login.
 */
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(32);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

async function verifyPasswordServer(plain: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(plain, storedHash);
  }
  if (storedHash.includes(':')) {
    const [salt, hash] = storedHash.split(':');
    return timingSafeCompare(sha256(salt + plain), hash);
  }
  return timingSafeCompare(sha256(plain), storedHash);
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

const loginSchema = z.object({
  action: z.literal('login'),
  identifier: z.string().min(1),
  password: z.string().min(1),
  isWholesale: z.boolean().optional(),
});

const registerSchema = z.object({
  action: z.literal('register'),
  name: z.string().min(1),
  phone: z.string().min(4),
  email: z.string().email().optional().or(z.literal('')).or(z.null()),
  password: z.string().min(6),
  isWholesale: z.boolean().optional(),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  branchCount: z.string().optional(),
  brDocUrl: z.string().optional(),
  storefrontPhotoUrl: z.string().optional(),
  storefrontPreparing: z.boolean().optional(),
});

const restoreSchema = z.object({
  action: z.literal('restore-session'),
  memberId: z.string().min(1),
  sessionToken: z.string().min(1),
  issuedAt: z.number().optional(),
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

async function handleLogin(body: z.infer<typeof loginSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const { identifier, password, isWholesale } = body;
  const isEmail = identifier.includes('@');

  const col = isEmail ? 'email' : 'phone_number';
  const val = isEmail ? identifier.toLowerCase() : identifier;

  const memberRes = await fetch(
    `${supabaseUrl}/rest/v1/members?${col}=eq.${encodeURIComponent(val)}&select=*`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );

  if (!memberRes.ok) {
    console.error('[customer-auth/login] Supabase query failed:', memberRes.status, await memberRes.text());
    return { status: 500, body: { error: '伺服器錯誤，請稍後再試', code: 'QUERY_FAILED' } };
  }

  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member || !(await verifyPasswordServer(password, member.password_hash))) {
    return { status: 401, body: { error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' } };
  }

  // Block rejected wholesale accounts from accessing the wholesale platform
  if (isWholesale && member.wholesale_status === 'rejected') {
    return { status: 403, body: { error: '您的批發帳戶申請已被拒絕，如有疑問請聯繫客服', code: 'WHOLESALE_REJECTED' } };
  }

  // Upgrade legacy hash to bcrypt on successful login
  if (member.password_hash && !member.password_hash.startsWith('$2')) {
    const bcryptHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ password_hash: bcryptHash }),
      }
    );
    member.password_hash = bcryptHash;
  }

  const issuedAt = Date.now();
  const sessionToken = generateSessionToken(member.id, member.password_hash, issuedAt);

  await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_issued_at: issuedAt }),
    }
  );

  return { status: 200, body: { user: stripPasswordHash(member), sessionToken, issuedAt } };
}

async function handleRegister(body: z.infer<typeof registerSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const { name, phone, email, password, isWholesale, companyName, businessType, branchCount, brDocUrl, storefrontPhotoUrl, storefrontPreparing } = body;

  // Check phone uniqueness
  const phoneCheck = await fetch(
    `${supabaseUrl}/rest/v1/members?phone_number=eq.${encodeURIComponent(phone)}&select=id`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const existing = await phoneCheck.json();
  if (Array.isArray(existing) && existing.length > 0) {
    return { status: 409, body: { error: '此電話已被註冊', code: 'PHONE_EXISTS' } };
  }

  // Check email uniqueness
  const emailVal = email?.trim().toLowerCase() || null;
  if (emailVal) {
    const emailCheck = await fetch(
      `${supabaseUrl}/rest/v1/members?email=eq.${encodeURIComponent(emailVal)}&select=id`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const existingEmail = await emailCheck.json();
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return { status: 409, body: { error: '此電郵已被註冊', code: 'EMAIL_EXISTS' } };
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const newId = `u-${Date.now()}`;
  const newMember: Record<string, unknown> = {
    id: newId,
    name: name.trim(),
    email: emailVal,
    password_hash: passwordHash,
    phone_number: phone,
    points: 0,
    tier: 'Bronze',
    role: 'customer',
    member_type: isWholesale ? 'wholesale' : 'retail',
    wholesale_price_tier: isWholesale ? 'P0' : null,
    wholesale_status: isWholesale ? 'pending' : null,
    addresses: null,
  };
  if (isWholesale) {
    if (companyName) newMember.company_name = companyName;
    if (businessType) newMember.business_type = businessType;
    if (branchCount) newMember.branch_count = branchCount;
    if (brDocUrl) newMember.br_doc_url = brDocUrl;
    if (storefrontPhotoUrl) newMember.storefront_photo_url = storefrontPhotoUrl;
    if (storefrontPreparing) newMember.storefront_preparing = true;
  }

  const insertRes = await fetch(
    `${supabaseUrl}/rest/v1/members`,
    {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(newMember),
    }
  );

  if (!insertRes.ok) {
    const err = await insertRes.text();
    console.error('[customer-auth] Insert failed:', insertRes.status, err);
    const isRLS = err.includes('row-level security') || err.includes('policy');
    return {
      status: isRLS ? 403 : 500,
      body: {
        error: isRLS
          ? '註冊暫時無法使用，請聯繫客服'
          : '註冊失敗',
        code: isRLS ? 'RLS_BLOCKED' : 'INSERT_FAILED',
      },
    };
  }

  const rows = await insertRes.json();
  const inserted = Array.isArray(rows) ? rows[0] : rows;
  const issuedAt = Date.now();
  const sessionToken = generateSessionToken(inserted.id, inserted.password_hash, issuedAt);

  await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(inserted.id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_issued_at: issuedAt }),
    }
  );

  // Assign welcome coupons (fire-and-forget)
  (async () => {
    try {
      const cfgRes = await fetch(
        `${supabaseUrl}/rest/v1/site_config?id=eq.welcome_coupons_config&select=value`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      const cfgRows = await cfgRes.json();
      const welcomeCfg = Array.isArray(cfgRows) && cfgRows[0]?.value;
      if (!welcomeCfg?.enabled || !Array.isArray(welcomeCfg.couponTemplateIds) || welcomeCfg.couponTemplateIds.length === 0) return;

      for (const couponId of welcomeCfg.couponTemplateIds) {
        const cpnRes = await fetch(
          `${supabaseUrl}/rest/v1/coupons?id=eq.${encodeURIComponent(couponId)}&select=expiry_days,is_active`,
          { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
        );
        const cpns = await cpnRes.json();
        const cpn = Array.isArray(cpns) ? cpns[0] : null;
        if (!cpn?.is_active) continue;

        const expiresAt = new Date(Date.now() + (cpn.expiry_days || 30) * 86400000).toISOString();
        const mcId = `mc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        await fetch(`${supabaseUrl}/rest/v1/member_coupons`, {
          method: 'POST',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            id: mcId,
            member_id: inserted.id,
            coupon_id: couponId,
            status: 'available',
            source: 'welcome',
            expires_at: expiresAt,
          }),
        });
      }
    } catch (e) {
      console.warn('[customer-auth] Welcome coupon assignment failed:', e instanceof Error ? e.message : e);
    }
  })();

  return { status: 200, body: { user: stripPasswordHash(inserted), sessionToken, issuedAt } };
}

async function handleRestoreSession(body: z.infer<typeof restoreSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const { memberId, sessionToken } = body;

  const memberRes = await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=*`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );

  if (!memberRes.ok) {
    console.error('[customer-auth/restore] Supabase query failed:', memberRes.status, await memberRes.text());
    return { status: 500, body: { error: '伺服器錯誤', code: 'QUERY_FAILED' } };
  }

  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member) {
    return { status: 401, body: { error: '找不到會員', code: 'NOT_FOUND' } };
  }

  const serverIssuedAt = Number(member.session_issued_at) || 0;

  if (!serverIssuedAt || (Date.now() - serverIssuedAt) > SESSION_MAX_AGE_MS) {
    return { status: 401, body: { error: '登入已過期，請重新登入', code: 'SESSION_EXPIRED' } };
  }

  const expected = generateSessionToken(member.id, member.password_hash, serverIssuedAt);
  if (!timingSafeCompare(sessionToken, expected)) {
    const legacyExpected = generateSessionToken(member.id, member.password_hash);
    if (!timingSafeCompare(sessionToken, legacyExpected)) {
      return { status: 401, body: { error: '登入已過期', code: 'INVALID_SESSION' } };
    }
  }

  return { status: 200, body: { user: stripPasswordHash(member) } };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.body as Record<string, unknown>)?.action;
  if (!action || !['login', 'register', 'restore-session'].includes(action as string)) {
    return res.status(400).json({ error: 'Invalid action. Use: login, register, restore-session' });
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    if (action === 'login') {
      const ip = getClientIp(req.headers ?? {});
      const rl = await checkRateLimit(`login:${ip}`, 10, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED', retryAfterMs: rl.retryAfterMs });
      }

      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: '請輸入帳號和密碼', code: 'VALIDATION_ERROR' });
      }
      const result = await handleLogin(parsed.data, supabaseUrl, serviceRoleKey);
      return res.status(result.status).json(result.body);
    }

    if (action === 'register') {
      const ip = getClientIp(req.headers ?? {});
      const rl = await checkRateLimit(`register:${ip}`, 5, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED' });
      }

      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message ?? '輸入資料不正確';
        return res.status(400).json({ error: firstError, code: 'VALIDATION_ERROR' });
      }
      const result = await handleRegister(parsed.data, supabaseUrl, serviceRoleKey);
      return res.status(result.status).json(result.body);
    }

    if (action === 'restore-session') {
      const ip = getClientIp(req.headers ?? {});
      const rl = await checkRateLimit(`restore:${ip}`, 10, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({ error: '嘗試次數過多', code: 'RATE_LIMITED', retryAfterMs: rl.retryAfterMs });
      }

      const parsed = restoreSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: '無效的登入狀態', code: 'VALIDATION_ERROR' });
      }
      const result = await handleRestoreSession(parsed.data, supabaseUrl, serviceRoleKey);
      return res.status(result.status).json(result.body);
    }
  } catch (e) {
    console.error('[customer-auth] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤', code: 'SERVER_ERROR' });
  }
}
