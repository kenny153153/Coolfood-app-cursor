/**
 * Secure API route: returns a single order's full details,
 * only if it belongs to the authenticated customer.
 */
import { createHash } from 'crypto';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function verifySession(token: string, memberId: string, passwordHash: string | null): boolean {
  const raw = `session:${memberId}:${passwordHash ?? ''}`;
  const expected = createHash('sha256').update(raw).digest('hex');
  return token === expected;
}

type RequestBody = { orderId?: number | string | null };

export default async function handler(
  req: { method?: string; body?: RequestBody; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void } }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const memberId = safeTrim(req.headers?.['x-member-id'] as string);
  const sessionToken = safeTrim(req.headers?.['x-session-token'] as string);
  const orderId = req.body?.orderId;

  if (!memberId || !sessionToken) {
    return res.status(401).json({ error: '未授權：需要登入' });
  }
  if (orderId === undefined || orderId === null) {
    return res.status(400).json({ error: '缺少訂單 ID' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  try {
    const memberRes = await fetch(
      `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,password_hash`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const members = await memberRes.json();
    const member = Array.isArray(members) ? members[0] : null;

    if (!member || !verifySession(sessionToken, member.id, member.password_hash)) {
      return res.status(401).json({ error: '無效的登入狀態' });
    }

    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(String(orderId))}&member_id=eq.${encodeURIComponent(memberId)}&select=*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/vnd.pgrst.object+json',
        },
      }
    );

    if (orderRes.status === 406 || orderRes.status === 404) {
      return res.status(403).json({ error: '無法查看此訂單' });
    }

    const order = await orderRes.json();
    if (!order || order.code) {
      return res.status(403).json({ error: '無法查看此訂單' });
    }

    return res.status(200).json({ data: order });
  } catch (e) {
    console.error('[customer-order-details] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
