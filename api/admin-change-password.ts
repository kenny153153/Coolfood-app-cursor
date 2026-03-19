/**
 * Admin Change Password API — POST /api/admin-change-password
 * Body: { adminId: string, sessionToken: string, newPassword: string }
 *
 * Allows an authenticated admin to change their password server-side.
 * Returns a new session token (since password_hash changes).
 */
import { createHash, randomBytes } from 'crypto';

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

function generateSalt(): string {
  return randomBytes(8).toString('hex');
}

function hashPassword(plain: string): string {
  const salt = generateSalt();
  const hash = sha256(salt + plain);
  return `${salt}:${hash}`;
}

function verifySessionToken(token: string, memberId: string, passwordHash: string | null): boolean {
  const expected = sha256(`session:${memberId}:${passwordHash ?? ''}`);
  return token === expected;
}

function generateSessionToken(memberId: string, passwordHash: string | null): string {
  return sha256(`session:${memberId}:${passwordHash ?? ''}`);
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminId = safeTrim(req.body?.adminId);
  const sessionToken = safeTrim(req.body?.sessionToken);
  const newPassword = req.body?.newPassword ?? '';

  if (!adminId || !sessionToken) {
    return res.status(401).json({ error: '未授權：需要登入', code: 'UNAUTHORIZED' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密碼至少需要6個字元', code: 'WEAK_PASSWORD' });
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  ).trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

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

    if (!member || !verifySessionToken(sessionToken, member.id, member.password_hash)) {
      return res.status(401).json({ error: '登入已過期，請重新登入', code: 'INVALID_SESSION' });
    }

    const newHash = hashPassword(newPassword);

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
        body: JSON.stringify({ password_hash: newHash }),
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
