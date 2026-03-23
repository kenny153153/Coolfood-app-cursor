/**
 * Admin Change Password API — POST /api/admin-change-password
 * Body: { adminId: string, sessionToken: string, newPassword: string }
 *
 * Allows an authenticated admin to change their password server-side.
 * New passwords are hashed with bcrypt.
 * Returns a new session token (since password_hash changes).
 */
import { createHash, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const BCRYPT_ROUNDS = 12;

type Req = {
  method?: string;
  body?: { adminId?: string; sessionToken?: string; newPassword?: string };
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

function generateSessionToken(memberId: string, passwordHash: string | null): string {
  return sha256(`session:${memberId}:${passwordHash ?? ''}`);
}

const changePasswordSchema = z.object({
  adminId: z.string().min(1),
  sessionToken: z.string().min(1),
  newPassword: z.string().min(6),
});

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.path.includes('newPassword') ? '新密碼至少需要6個字元' : '未授權：需要登入';
    const code = parsed.error.issues[0]?.path.includes('newPassword') ? 'WEAK_PASSWORD' : 'UNAUTHORIZED';
    return res.status(400).json({ error: msg, code });
  }

  const { adminId, sessionToken, newPassword } = parsed.data;

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=id,password_hash`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    const expectedToken = member ? generateSessionToken(member.id, member.password_hash) : '';
    if (!member || !timingSafeCompare(sessionToken, expectedToken)) {
      return res.status(401).json({ error: '登入已過期，請重新登入', code: 'INVALID_SESSION' });
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ password_hash: newHash, must_change_password: false }),
      }
    );

    if (!updateRes.ok) {
      return res.status(500).json({ error: '更改密碼失敗', code: 'UPDATE_FAILED' });
    }

    const newSessionToken = generateSessionToken(adminId, newHash);

    return res.status(200).json({
      success: true,
      sessionToken: newSessionToken,
    });
  } catch (e: any) {
    console.error('[admin-change-password] Error:', e?.message);
    return res.status(500).json({ error: '更改密碼失敗', code: 'SERVER_ERROR' });
  }
}
