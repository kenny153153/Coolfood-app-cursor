/**
 * First-time admin setup API — POST /api/setup
 * Body: { name: string, phone: string, password: string }
 *
 * Creates the initial admin account. Refuses if any admin already exists.
 * Uses service_role key to bypass RLS on the locked members table.
 */
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit';

const BCRYPT_ROUNDS = 12;

const setupSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
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

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req.headers ?? {});
  const rl = checkRateLimit(`setup:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: '嘗試次數過多', code: 'RATE_LIMITED' });
  }

  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: '請填寫所有欄位（名稱、電話至少8位、密碼至少6位）', code: 'VALIDATION_ERROR' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: '伺服器配置錯誤', code: 'SERVER_CONFIG' });
  }

  try {
    // Check if any admin already exists
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/members?role=neq.customer&select=id&limit=1`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: '管理員帳號已存在', code: 'ADMIN_EXISTS' });
    }

    const { name, phone, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/members`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: `u-${Date.now()}`,
          name: name.trim(),
          phone_number: phone.trim(),
          role: 'admin',
          password_hash: passwordHash,
          tier: 'VIP',
          wallet_balance: 0,
          points: 0,
        }),
      }
    );

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error('[setup] Insert failed:', errText);
      return res.status(500).json({ error: '建立失敗', code: 'INSERT_FAILED' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[setup] Error:', e);
    return res.status(500).json({ error: '系統錯誤', code: 'SERVER_ERROR' });
  }
}
