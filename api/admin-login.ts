/**
 * Admin Login API — POST /api/admin-login
 * Body: { phone: string, password: string }
 *
 * Authenticates admin users server-side using service_role key to bypass RLS.
 * Returns admin profile + session token (never exposes password_hash to client).
 * Supports bcrypt, salted SHA-256, and legacy SHA-256 hashes.
 * Auto-upgrades legacy hashes to bcrypt on successful login.
 */
import { createHash, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit';

const BCRYPT_ROUNDS = 12;

type Req = {
  method?: string;
  body?: { phone?: string; password?: string };
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
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
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

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req.headers ?? {});
  const rl = checkRateLimit(`admin-login:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: '嘗試次數過多，請稍後再試', code: 'RATE_LIMITED', retryAfterMs: rl.retryAfterMs });
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '請輸入電話號碼和密碼', code: 'MISSING_FIELDS' });
  }

  const { phone, password } = parsed.data;

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[admin-login] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    const baseCols = 'id,name,phone_number,email,role,admin_permissions,password_hash,must_change_password';
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?phone_number=eq.${encodeURIComponent(phone)}&role=neq.customer&select=${baseCols}`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    if (!member || !(await verifyPasswordServer(password, member.password_hash))) {
      await new Promise(r => setTimeout(r, 300));
      return res.status(401).json({ error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' });
    }

    // Auto-upgrade legacy hash to bcrypt
    if (member.password_hash && !member.password_hash.startsWith('$2')) {
      const bcryptHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await fetch(
        `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}`,
        {
          method: 'PATCH',
          headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
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
        mustChangePassword: !!member.must_change_password,
      },
      sessionToken,
    });
  } catch (e: any) {
    console.error('[admin-login] Error:', e?.message);
    return res.status(500).json({ error: '登入失敗，請稍後再試', code: 'SERVER_ERROR' });
  }
}
