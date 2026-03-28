/**
 * Consolidated customer API — POST /api/customer-api
 * Body: { action: 'list' | 'details' | 'reorder', orderId?: number|string }
 *
 * Merges the former /api/customer-orders, /api/customer-order-details,
 * and /api/customer-reorder into a single serverless function.
 */
import { createHash, timingSafeEqual } from 'crypto';
import { z } from 'zod';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(32);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifySession(token: string, memberId: string, passwordHash: string | null, sessionIssuedAt?: number): boolean {
  const base = `session:${memberId}:${passwordHash ?? ''}`;
  if (sessionIssuedAt) {
    const expected = createHash('sha256').update(`${base}:${sessionIssuedAt}`).digest('hex');
    if (timingSafeCompare(token, expected)) return true;
  }
  const legacy = createHash('sha256').update(base).digest('hex');
  return timingSafeCompare(token, legacy);
}

const customerApiSchema = z.object({
  action: z.enum(['list', 'details', 'reorder']),
  orderId: z.union([z.string(), z.number()]).optional().nullable(),
});

type Req = {
  method?: string;
  body?: { action?: string; orderId?: number | string | null };
  headers?: Record<string, string | string[] | undefined>;
};
type Res = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { json: (o: object) => void };
};

async function authenticate(req: Req, res: Res) {
  const memberId = safeTrim(req.headers?.['x-member-id'] as string);
  const sessionToken = safeTrim(req.headers?.['x-session-token'] as string);

  if (!memberId || !sessionToken) {
    return { ok: false as const, respond: () => res.status(401).json({ error: '未授權：需要登入' }) };
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false as const, respond: () => res.status(500).json({ error: 'Server config missing' }) };
  }

  const memberRes = await fetch(
    `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,password_hash,session_issued_at`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const members = await memberRes.json();
  const member = Array.isArray(members) ? members[0] : null;

  if (!member || !verifySession(sessionToken, member.id, member.password_hash, Number(member.session_issued_at) || 0)) {
    return { ok: false as const, respond: () => res.status(401).json({ error: '無效的登入狀態' }) };
  }

  return { ok: true as const, memberId, supabaseUrl, serviceRoleKey };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = customerApiSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid action. Use: list, details, reorder' });
  }
  const action = parsed.data.action;

  const auth = await authenticate(req, res);
  if (!auth.ok) return auth.respond();

  const { memberId, supabaseUrl, serviceRoleKey } = auth;

  try {
    if (action === 'list') {
      const ordersRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?member_id=eq.${encodeURIComponent(memberId)}&select=id,customer_name,total,status,order_date,items_count,tracking_number,waybill_no,order_type,wholesale_brand,member_id&order=order_date.desc`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      const orders = await ordersRes.json();
      return res.status(200).json({ data: Array.isArray(orders) ? orders : [] });
    }

    if (action === 'details') {
      const orderId = req.body?.orderId;
      if (orderId === undefined || orderId === null) {
        return res.status(400).json({ error: '缺少訂單 ID' });
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
    }

    if (action === 'reorder') {
      const ordersRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?member_id=eq.${encodeURIComponent(memberId)}&status=in.(paid,preparing,shipping,shipped,delivered)&select=line_items&order=order_date.desc&limit=1`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      const orders = await ordersRes.json();
      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(200).json({ data: null });
      }
      return res.status(200).json({ data: orders[0].line_items || [] });
    }
  } catch (e) {
    console.error('[customer-api] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
