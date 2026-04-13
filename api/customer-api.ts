/**
 * Consolidated customer API — POST /api/customer-api
 * Body: { action: 'list' | 'details' | 'reorder' | 'save-addresses', ... }
 *
 * Merges the former /api/customer-orders, /api/customer-order-details,
 * and /api/customer-reorder into a single serverless function.
 */
import { createHash, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(32);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function verifySession(token: string, memberId: string, passwordHash: string | null, sessionIssuedAt?: number): boolean {
  if (sessionIssuedAt && sessionIssuedAt > 0 && (Date.now() - sessionIssuedAt) > SESSION_MAX_AGE_MS) {
    return false;
  }
  const base = `session:${memberId}:${passwordHash ?? ''}`;
  if (sessionIssuedAt) {
    const expected = createHash('sha256').update(`${base}:${sessionIssuedAt}`).digest('hex');
    if (timingSafeCompare(token, expected)) return true;
  }
  const legacy = createHash('sha256').update(base).digest('hex');
  return timingSafeCompare(token, legacy);
}

const addressSchema = z.object({
  id: z.string().min(1),
  detail: z.string().optional(),
  district: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  flat: z.string().optional(),
  isDefault: z.boolean(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  altContactName: z.string().optional(),
  altPhone: z.string().optional(),
});

const customerApiSchema = z.object({
  action: z.enum(['list', 'details', 'reorder', 'save-addresses']),
  orderId: z.union([z.string(), z.number()]).optional().nullable(),
  addresses: z.array(addressSchema).optional(),
  deliveryAddress: z.string().optional().nullable(),
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

async function fetchOrdersWithFallback(
  supabaseUrl: string,
  serviceRoleKey: string,
  memberId: string,
  selectCols: string,
  extraParams = ''
) {
  const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };
  const encodedMemberId = encodeURIComponent(memberId);
  const suffix = extraParams ? `&${extraParams}` : '';
  const primaryUrl = `${supabaseUrl}/rest/v1/orders?member_id=eq.${encodedMemberId}&select=${selectCols}&order=created_at.desc,id.desc${suffix}`;
  let res = await fetch(primaryUrl, { headers });
  if (!res.ok) {
    const fallbackUrl = `${supabaseUrl}/rest/v1/orders?member_id=eq.${encodedMemberId}&select=${selectCols}&order=order_date.desc,id.desc${suffix}`;
    res = await fetch(fallbackUrl, { headers });
  }
  return res;
}

async function expireStalePendingOrders(
  supabaseUrl: string,
  serviceRoleKey: string,
  memberId: string,
) {
  // Big-brand behavior: card payment intents that are not completed within timeout should not stay "pending" forever.
  const cutoffIso = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const encodedMemberId = encodeURIComponent(memberId);
  const encodedCutoff = encodeURIComponent(cutoffIso);
  const filter =
    `member_id=eq.${encodedMemberId}` +
    `&status=eq.pending_payment` +
    `&payment_method=eq.card` +
    `&order_type=eq.retail` +
    `&created_at=lt.${encodedCutoff}`;

  try {
    await fetch(`${supabaseUrl}/rest/v1/orders?${filter}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'payment_failed' }),
    });
  } catch {
    // Non-blocking cleanup: never fail customer order list for this.
  }
}

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

  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`customer-api:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
  }

  const parsed = customerApiSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid action. Use: list, details, reorder, save-addresses' });
  }
  const action = parsed.data.action;

  const auth = await authenticate(req, res);
  if (!auth.ok) return auth.respond();

  const { memberId, supabaseUrl, serviceRoleKey } = auth;

  try {
    if (action === 'list') {
      await expireStalePendingOrders(supabaseUrl, serviceRoleKey, memberId);
      const ordersRes = await fetchOrdersWithFallback(
        supabaseUrl,
        serviceRoleKey,
        memberId,
        'id,customer_name,total,status,order_date,items_count,tracking_number,waybill_no,order_type,wholesale_brand,member_id,created_at,payment_method,payment_intent_id',
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
      const ordersRes = await fetchOrdersWithFallback(
        supabaseUrl,
        serviceRoleKey,
        memberId,
        'line_items',
        'status=in.(paid,preparing,shipping,shipped,delivered)&limit=1',
      );
      const orders = await ordersRes.json();
      if (!Array.isArray(orders) || orders.length === 0) {
        return res.status(200).json({ data: null });
      }
      return res.status(200).json({ data: orders[0].line_items || [] });
    }

    if (action === 'save-addresses') {
      const addresses = parsed.data.addresses;
      if (!Array.isArray(addresses)) {
        return res.status(400).json({ error: '缺少地址資料' });
      }
      const deliveryAddress = parsed.data.deliveryAddress ?? null;
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&select=id,name,email,phone_number,points,tier,role,admin_permissions,member_type,wholesale_price_tier,wholesale_status,wholesale_brand,company_name,business_type,branch_count,br_doc_url,storefront_photo_url,storefront_preparing,delivery_address,br_update_required,addresses,client_code,fax,district,route_id,credit_limit,parent_member_id,salesperson_id,payment_terms_days,payment_terms_type,discount_percent,wholesale_notes,is_wholesale_active`,
        {
          method: 'PATCH',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ addresses, delivery_address: deliveryAddress }),
        }
      );
      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.error('[customer-api/save-addresses] update failed:', updateRes.status, errText);
        return res.status(500).json({ error: '地址儲存失敗' });
      }
      const rows = await updateRes.json();
      const updated = Array.isArray(rows) ? rows[0] : rows;
      if (!updated) return res.status(500).json({ error: '地址儲存失敗' });
      return res.status(200).json({ user: updated });
    }
  } catch (e) {
    console.error('[customer-api] Error:', e);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
