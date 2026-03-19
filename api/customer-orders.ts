/**
 * Secure API route: returns only the authenticated customer's orders.
 * Validates session token server-side before querying with service role key.
 */
import { createHash } from 'crypto';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function verifySession(token: string, memberId: string, passwordHash: string | null): boolean {
  const raw = `session:${memberId}:${passwordHash ?? ''}`;
  const expected = createHash('sha256').update(raw).digest('hex');
  return token === expected;
}

export default async function handler(
  req: { method?: string; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void } }
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const memberId = safeTrim(req.headers?.['x-member-id'] as string);
  const sessionToken = safeTrim(req.headers?.['x-session-token'] as string);

  if (!memberId || !sessionToken) {
    return res.status(401).json({ error: '未授權：需要登入' });
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

    const ordersRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?member_id=eq.${encodeURIComponent(memberId)}&select=id,customer_name,total,status,order_date,items_count,tracking_number,waybill_no,order_type,wholesale_brand,member_id&order=order_date.desc`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const orders = await ordersRes.json();

    return res.status(200).json({ data: Array.isArray(orders) ? orders : [] });
  } catch (e) {
    console.error('[customer-orders] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
