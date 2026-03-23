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

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
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

function generateSessionToken(memberId: string, passwordHash: string | null): string {
  return sha256(`session:${memberId}:${passwordHash ?? ''}`);
}

function getSupabaseConfig() {
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  return { supabaseUrl, serviceRoleKey };
}

const SAFE_MEMBER_COLS = 'id,name,email,phone_number,points,wallet_balance,tier,role,admin_permissions,member_type,wholesale_price_tier,addresses';
const AUTH_MEMBER_COLS = `${SAFE_MEMBER_COLS},password_hash`;

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
});

const restoreSchema = z.object({
  action: z.literal('restore-session'),
  memberId: z.string().min(1),
  sessionToken: z.string().min(1),
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
  const { identifier, password } = body;
  const isEmail = identifier.includes('@');

  const col = isEmail ? 'email' : 'phone_number';
  const val = isEmail ? identifier.toLowerCase() : identifier;

  const memberRes = await fetch(
    `${supabaseUrl}/rest/v1/members?${col}=eq.${encodeURIComponent(val)}&select=${AUTH_MEMBER_COLS}`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member || !(await verifyPasswordServer(password, member.password_hash))) {
    return { status: 401, body: { error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' } };
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

  const sessionToken = generateSessionToken(member.id, member.password_hash);

  const { password_hash: _, ...safeProfile } = member;
  return { status: 200, body: { user: safeProfile, sessionToken } };
}

async function handleRegister(body: z.infer<typeof registerSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const { name, phone, email, password, isWholesale } = body;

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
  const newMember = {
    id: newId,
    name: name.trim(),
    email: emailVal,
    password_hash: passwordHash,
    phone_number: phone,
    points: 0,
    wallet_balance: 0,
    tier: 'Bronze',
    role: 'customer',
    member_type: isWholesale ? 'wholesale' : 'retail',
    wholesale_price_tier: isWholesale ? 'P0' : null,
    addresses: null,
  };

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
    console.error('[customer-auth] Insert failed:', err);
    return { status: 500, body: { error: '註冊失敗', code: 'INSERT_FAILED' } };
  }

  const rows = await insertRes.json();
  const inserted = Array.isArray(rows) ? rows[0] : rows;
  const sessionToken = generateSessionToken(inserted.id, inserted.password_hash);
  const { password_hash: _, ...safeProfile } = inserted;
  return { status: 200, body: { user: safeProfile, sessionToken } };
}

async function handleRestoreSession(body: z.infer<typeof restoreSchema>, supabaseUrl: string, serviceRoleKey: string) {
  const { memberId, sessionToken } = body;

  const memberRes = await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=${AUTH_MEMBER_COLS}`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member) {
    return { status: 401, body: { error: '找不到會員', code: 'NOT_FOUND' } };
  }

  const expected = generateSessionToken(member.id, member.password_hash);
  if (!timingSafeCompare(sessionToken, expected)) {
    return { status: 401, body: { error: '登入已過期', code: 'INVALID_SESSION' } };
  }

  const { password_hash: _, ...safeProfile } = member;
  return { status: 200, body: { user: safeProfile } };
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
      const rl = checkRateLimit(`login:${ip}`, 10, 60_000);
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
      const rl = checkRateLimit(`register:${ip}`, 5, 60_000);
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
