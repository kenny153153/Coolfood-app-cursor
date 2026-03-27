/**
 * Consolidated Admin Auth API — POST /api/admin-auth
 * Body: { action: 'login' | 'session' | 'change-password' | 'setup', ...params }
 *
 * Combines admin-login, admin-session, admin-change-password, and first-time setup
 * into a single serverless function to stay within Vercel Hobby plan limits.
 */
import { createHash, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

const BCRYPT_ROUNDS = 12;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type Req = {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => void };
};

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
  if (storedHash.startsWith('$2')) return bcrypt.compare(plain, storedHash);
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
  if (!supabaseUrl || !serviceRoleKey) return null;
  return { supabaseUrl, serviceRoleKey };
}

function supaHeaders(key: string, extra?: Record<string, string>) {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

// ─── Action: login ──────────────────────────────────────────────────

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

async function handleLogin(req: Req, res: Res) {
  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`admin-login:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED', retryAfterMs: rl.retryAfterMs });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '請輸入電話號碼和密碼', code: 'MISSING_FIELDS' });
  }

  const cfg = getSupabaseConfig();
  if (!cfg) return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });

  try {
    const memberRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members?phone_number=eq.${encodeURIComponent(parsed.data.phone)}&role=neq.customer&select=*`,
      { headers: supaHeaders(cfg.serviceRoleKey) }
    );

    if (!memberRes.ok) {
      console.error('[admin-auth/login] Supabase query failed:', memberRes.status, await memberRes.text());
      return res.status(500).json({ error: '伺服器錯誤', code: 'QUERY_FAILED' });
    }

    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    if (!member || !(await verifyPasswordServer(parsed.data.password, member.password_hash))) {
      await new Promise(r => setTimeout(r, 300));
      return res.status(401).json({ error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' });
    }

    if (member.password_hash && !member.password_hash.startsWith('$2')) {
      const bcryptHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
      await fetch(
        `${cfg.supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}`,
        {
          method: 'PATCH',
          headers: supaHeaders(cfg.serviceRoleKey, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
          body: JSON.stringify({ password_hash: bcryptHash }),
        }
      );
      member.password_hash = bcryptHash;
    }

    const sessionToken = generateSessionToken(member.id, member.password_hash);

    return res.status(200).json({
      admin: {
        id: member.id,
        name: member.name,
        phone: member.phone_number,
        role: member.role,
        permissions: member.admin_permissions,
        mustChangePassword: false,
      },
      sessionToken,
      issuedAt: Date.now(),
    });
  } catch (e: any) {
    console.error('[admin-auth/login] Error:', e?.message);
    return res.status(500).json({ error: '登入失敗，請稍後再試', code: 'SERVER_ERROR' });
  }
}

// ─── Action: session ────────────────────────────────────────────────

async function handleSession(req: Req, res: Res) {
  const adminId = safeTrim(req.body?.adminId);
  const sessionToken = safeTrim(req.body?.sessionToken);
  const issuedAt = Number(req.body?.issuedAt) || 0;

  if (!adminId || !sessionToken) {
    return res.status(401).json({ error: '無效的登入狀態', code: 'MISSING_SESSION' });
  }

  if (issuedAt && (Date.now() - issuedAt) > SESSION_MAX_AGE_MS) {
    return res.status(401).json({ error: '登入已過期，請重新登入', code: 'SESSION_EXPIRED' });
  }

  const cfg = getSupabaseConfig();
  if (!cfg) return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });

  try {
    const memberRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=*`,
      { headers: supaHeaders(cfg.serviceRoleKey) }
    );

    if (!memberRes.ok) {
      console.error('[admin-auth/session] Supabase query failed:', memberRes.status, await memberRes.text());
      return res.status(500).json({ error: '伺服器錯誤', code: 'QUERY_FAILED' });
    }

    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    const expected = member ? generateSessionToken(member.id, member.password_hash) : '';
    if (!member || !timingSafeCompare(sessionToken, expected)) {
      return res.status(401).json({ error: '登入已過期，請重新登入', code: 'INVALID_SESSION' });
    }

    return res.status(200).json({
      admin: {
        id: member.id,
        name: member.name,
        phone: member.phone_number,
        role: member.role,
        permissions: member.admin_permissions,
        mustChangePassword: false,
      },
    });
  } catch (e: any) {
    console.error('[admin-auth/session] Error:', e?.message);
    return res.status(500).json({ error: '驗證失敗', code: 'SERVER_ERROR' });
  }
}

// ─── Action: change-password ────────────────────────────────────────

const changePasswordSchema = z.object({
  adminId: z.string().min(1),
  sessionToken: z.string().min(1),
  newPassword: z.string().min(6),
});

async function handleChangePassword(req: Req, res: Res) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.path.includes('newPassword') ? '新密碼至少需要6個字元' : '未授權：需要登入';
    const code = parsed.error.issues[0]?.path.includes('newPassword') ? 'WEAK_PASSWORD' : 'UNAUTHORIZED';
    return res.status(400).json({ error: msg, code });
  }

  const { adminId, sessionToken, newPassword } = parsed.data;
  const cfg = getSupabaseConfig();
  if (!cfg) return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });

  try {
    const memberRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=id,role,password_hash`,
      { headers: supaHeaders(cfg.serviceRoleKey) }
    );

    if (!memberRes.ok) {
      console.error('[admin-auth/change-password] Supabase query failed:', memberRes.status, await memberRes.text());
      return res.status(500).json({ error: '伺服器錯誤', code: 'QUERY_FAILED' });
    }

    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    const expectedToken = member ? generateSessionToken(member.id, member.password_hash) : '';
    if (!member || !timingSafeCompare(sessionToken, expectedToken)) {
      return res.status(401).json({ error: '登入已過期，請重新登入', code: 'INVALID_SESSION' });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    const updateRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}`,
      {
        method: 'PATCH',
        headers: supaHeaders(cfg.serviceRoleKey, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({ password_hash: newHash }),
      }
    );

    if (!updateRes.ok) {
      return res.status(500).json({ error: '更改密碼失敗', code: 'UPDATE_FAILED' });
    }

    const newSessionToken = generateSessionToken(adminId, newHash);
    return res.status(200).json({ success: true, sessionToken: newSessionToken });
  } catch (e: any) {
    console.error('[admin-auth/change-password] Error:', e?.message);
    return res.status(500).json({ error: '更改密碼失敗', code: 'SERVER_ERROR' });
  }
}

// ─── Action: setup ──────────────────────────────────────────────────

const setupSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  password: z.string().min(6),
});

async function handleSetup(req: Req, res: Res) {
  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`setup:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: '嘗試次數過多', code: 'RATE_LIMITED' });
  }

  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '請填寫所有欄位（名稱、電話至少8位、密碼至少6位）', code: 'VALIDATION_ERROR' });
  }

  const cfg = getSupabaseConfig();
  if (!cfg) return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });

  try {
    const checkRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members?role=neq.customer&select=id&limit=1`,
      { headers: supaHeaders(cfg.serviceRoleKey) }
    );
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: '管理員帳號已存在', code: 'ADMIN_EXISTS' });
    }

    const { name, phone, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const insertRes = await fetch(
      `${cfg.supabaseUrl}/rest/v1/members`,
      {
        method: 'POST',
        headers: supaHeaders(cfg.serviceRoleKey, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
        body: JSON.stringify({
          id: `u-${Date.now()}`,
          name: name.trim(),
          phone_number: phone.trim(),
          role: 'admin',
          password_hash: passwordHash,
          tier: 'VIP',
          points: 0,
        }),
      }
    );

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error('[admin-auth/setup] Insert failed:', errText);
      return res.status(500).json({ error: '建立失敗', code: 'INSERT_FAILED' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[admin-auth/setup] Error:', e);
    return res.status(500).json({ error: '系統錯誤', code: 'SERVER_ERROR' });
  }
}

// ─── Router ─────────────────────────────────────────────────────────

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = safeTrim(req.body?.action);

  switch (action) {
    case 'login':           return handleLogin(req, res);
    case 'session':         return handleSession(req, res);
    case 'change-password': return handleChangePassword(req, res);
    case 'setup':           return handleSetup(req, res);
    default:
      return res.status(400).json({ error: `Unknown action: ${action}`, code: 'INVALID_ACTION' });
  }
}
