/**
 * Admin Login API — POST /api/admin-login
 * Body: { phone: string, password: string }
 *
 * Authenticates admin users server-side using service_role key to bypass RLS.
 * Returns admin profile + session token (never exposes password_hash to client).
 */
import { createHash } from 'crypto';

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

function verifyPasswordServer(plain: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, hash] = storedHash.split(':');
    return sha256(salt + plain) === hash;
  }
  return sha256(plain) === storedHash;
}

function generateSessionToken(memberId: string, passwordHash: string | null): string {
  return sha256(`session:${memberId}:${passwordHash ?? ''}`);
}

const LOGIN_DELAY_MS = 300;

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const phone = safeTrim(req.body?.phone);
  const password = req.body?.password ?? '';

  if (!phone || !password) {
    return res.status(400).json({ error: '請輸入電話號碼和密碼', code: 'MISSING_FIELDS' });
  }

  const supabaseUrl = (
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
  ).trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  );

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[admin-login] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    const baseCols = 'id,name,phone_number,email,role,admin_permissions,password_hash';
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?phone_number=eq.${encodeURIComponent(phone)}&role=neq.customer&select=${baseCols}`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    if (!member || !verifyPasswordServer(password, member.password_hash)) {
      await new Promise(r => setTimeout(r, LOGIN_DELAY_MS));
      return res.status(401).json({ error: '帳號或密碼錯誤', code: 'INVALID_CREDENTIALS' });
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
    } catch { /* column may not exist yet — ignore */ }

    const sessionToken = generateSessionToken(member.id, member.password_hash);

    return res.status(200).json({
      admin: {
        id: member.id,
        name: member.name,
        phone: member.phone_number,
        role: member.role,
        permissions: member.admin_permissions,
        mustChangePassword,
      },
      sessionToken,
    });
  } catch (e: any) {
    console.error('[admin-login] Error:', e?.message);
    return res.status(500).json({ error: '登入失敗，請稍後再試', code: 'SERVER_ERROR' });
  }
}
