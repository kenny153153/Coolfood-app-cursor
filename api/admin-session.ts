/**
 * Admin Session Verify API — POST /api/admin-session
 * Body: { adminId: string, sessionToken: string }
 *
 * Validates an existing admin session server-side. Used on page load to
 * restore a cached admin session without exposing password_hash to the client.
 */
import { createHash, timingSafeEqual } from 'crypto';

type Req = {
  method?: string;
  body?: { adminId?: string; sessionToken?: string };
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

function verifySessionToken(token: string, memberId: string, passwordHash: string | null): boolean {
  const expected = sha256(`session:${memberId}:${passwordHash ?? ''}`);
  const bufA = Buffer.from(token);
  const bufB = Buffer.from(expected);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminId = safeTrim(req.body?.adminId);
  const sessionToken = safeTrim(req.body?.sessionToken);

  if (!adminId || !sessionToken) {
    return res.status(401).json({ error: '無效的登入狀態', code: 'MISSING_SESSION' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[admin-session] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    const baseCols = 'id,name,phone_number,role,admin_permissions,password_hash';
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(adminId)}&role=neq.customer&select=${baseCols}`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    if (!member || !verifySessionToken(sessionToken, member.id, member.password_hash)) {
      return res.status(401).json({ error: '登入已過期，請重新登入', code: 'INVALID_SESSION' });
    }

    let mustChangePassword = false;
    try {
      const mcpRes = await fetch(
        `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(member.id)}&select=must_change_password`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      const mcpData = await mcpRes.json();
      if (Array.isArray(mcpData) && mcpData[0]?.must_change_password) {
        mustChangePassword = true;
      }
    } catch { /* column may not exist yet */ }

    return res.status(200).json({
      admin: {
        id: member.id,
        name: member.name,
        phone: member.phone_number,
        role: member.role,
        permissions: member.admin_permissions,
        mustChangePassword,
      },
    });
  } catch (e: any) {
    console.error('[admin-session] Error:', e?.message);
    return res.status(500).json({ error: '驗證失敗', code: 'SERVER_ERROR' });
  }
}
