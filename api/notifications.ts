/**
 * Consolidated Notifications API — POST /api/notifications
 * Body: { action: 'whatsapp' | 'status-notification', ...params }
 *
 * Combines send-whatsapp and send-notification into a single serverless function
 * to stay within Vercel Hobby plan limits.
 */
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

// ─── Shared WhatsApp helpers ────────────────────────────────────────

function formatHKPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `+852${digits}`;
  if (digits.length === 11 && digits.startsWith('852')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('852')) return `+${digits.slice(0, 11)}`;
  if (!phone.startsWith('+') && digits.length > 8) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

const getUltramsgConfig = () => ({
  instanceId: (process.env.ULTRAMSG_INSTANCE_ID ?? '').trim(),
  token: (process.env.ULTRAMSG_TOKEN ?? '').trim(),
});

export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  const { instanceId, token } = getUltramsgConfig();
  if (!instanceId || !token) {
    return { success: false, error: 'Ultramsg not configured (missing ULTRAMSG_INSTANCE_ID or ULTRAMSG_TOKEN)' };
  }

  const phone = formatHKPhone(to);
  const apiUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: phone, body }),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok || data.error) {
      const errMsg = data.error || `HTTP ${res.status}: ${text.slice(0, 150)}`;
      console.error(`[WhatsApp] Send failed to ${phone}:`, errMsg);
      return { success: false, error: errMsg };
    }

    console.log(`[WhatsApp] Sent to ${phone}, id: ${data.id ?? 'unknown'}`);
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[WhatsApp] Network error sending to ${phone}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

// ─── Action: whatsapp (direct send) ─────────────────────────────────

async function handleWhatsApp(req: any, res: any) {
  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'orders', 'update');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const { phone, body } = req.body ?? {};
  if (!phone || !body) {
    return res.status(400).json({ error: 'Missing phone or body' });
  }

  const result = await sendWhatsAppMessage(phone, body);
  return res.status(result.success ? 200 : 502).json(result);
}

// ─── Action: status-notification (order status change) ──────────────

interface NotifRequest {
  orderId: string;
  newStatus: string;
  waybillNo?: string;
  customerPhone?: string;
}

function buildMessage(ev: NotifRequest): string | null {
  switch (ev.newStatus) {
    case 'paid': return `Coolfood: 收到你嘅訂單 ${ev.orderId}！我哋正準備處理。`;
    case 'preparing': return `Coolfood: 你嘅訂單 ${ev.orderId} 已開始備貨。`;
    case 'shipping': return `Coolfood: 你嘅訂單 ${ev.orderId} 已安排發貨，順豐單號 ${ev.waybillNo || '（處理中）'}。`;
    case 'shipped': return `Coolfood: 順豐已取件，單號 ${ev.waybillNo || '（處理中）'}，留意收件。`;
    case 'delivered': return `Coolfood: 訂單 ${ev.orderId} 已到達，多謝支持！`;
    default: return null;
  }
}

async function processNotification(
  supabase: ReturnType<typeof createClient>,
  ev: NotifRequest,
) {
  const message = buildMessage(ev);
  if (!message) return;

  let phone = ev.customerPhone?.trim() || null;
  if (!phone) {
    const dbId = ev.orderId.replace(/^ORD-/, '');
    const { data } = await supabase.from('orders').select('customer_phone').eq('id', dbId).maybeSingle();
    phone = (data as any)?.customer_phone?.trim() || null;
  }

  let deliveryStatus = 'LOGGED';
  let provider = 'MOCK';
  if (phone) {
    const r = await sendWhatsAppMessage(phone, message);
    provider = 'ULTRAMSG';
    deliveryStatus = r.success ? 'SENT' : 'FAILED';
  }

  await (supabase as any).from('notification_logs').insert({
    order_id: ev.orderId, phone_number: phone, status_type: ev.newStatus,
    content: message, provider, delivery_status: deliveryStatus, created_at: new Date().toISOString(),
  }).then(({ error: e }: any) => { if (e) console.warn('[notif] log failed:', e.message); });
}

async function handleStatusNotification(req: any, res: any) {
  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'orders', 'update');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const orders = req.body?.orders;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Missing or empty orders array' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server config missing' });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const results = await Promise.allSettled(orders.map((o: NotifRequest) => processNotification(supabase as any, o)));
  const sent = results.filter(r => r.status === 'fulfilled').length;
  return res.status(200).json({ success: true, total: orders.length, sent });
}

// ─── Router ─────────────────────────────────────────────────────────

export default async function handler(
  req: { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void },
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`notifications:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
  }

  const action = typeof req.body?.action === 'string' ? req.body.action.trim() : '';

  switch (action) {
    case 'whatsapp':            return handleWhatsApp(req, res);
    case 'status-notification': return handleStatusNotification(req, res);
    default:
      return res.status(400).json({ error: `Unknown action: ${action}`, code: 'INVALID_ACTION' });
  }
}
