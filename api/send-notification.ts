/**
 * 通知發送 API 端點 — POST /api/send-notification
 * 所有依賴邏輯內嵌，不跨檔案 import，避免 Vercel ERR_MODULE_NOT_FOUND。
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface NotifRequest {
  orderId: string;
  newStatus: string;
  waybillNo?: string;
  customerPhone?: string;
}

// ─── Inline WhatsApp ─────────────────────────────────────────────────
function formatHKPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `+852${digits}`;
  if (digits.length === 11 && digits.startsWith('852')) return `+${digits}`;
  if (!phone.startsWith('+') && digits.length > 8) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

async function sendWA(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  const instanceId = (process.env.ULTRAMSG_INSTANCE_ID ?? '').trim();
  const token = (process.env.ULTRAMSG_TOKEN ?? '').trim();
  if (!instanceId || !token) return { success: false, error: 'Not configured' };
  try {
    const r = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: formatHKPhone(to), body }),
    });
    const d: any = await r.json().catch(() => ({}));
    return (r.ok && !d.error) ? { success: true } : { success: false, error: d.error || `HTTP ${r.status}` };
  } catch (e) { return { success: false, error: e instanceof Error ? e.message : String(e) }; }
}

function buildMessage(ev: NotifRequest): string | null {
  switch (ev.newStatus) {
    case 'paid': return `Coolfood: 收到你嘅訂單 ${ev.orderId}！我哋正準備處理。`;
    case 'processing': return `Coolfood: 你嘅訂單 ${ev.orderId} 已開始處理。`;
    case 'ready_for_pickup': return `Coolfood: 貨品已打包！順豐單號 ${ev.waybillNo || '（處理中）'}。`;
    case 'shipping': return `Coolfood: 順豐已取件，單號 ${ev.waybillNo || '（處理中）'}，留意收件。`;
    case 'completed': return `Coolfood: 訂單 ${ev.orderId} 已完成，多謝支持！`;
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
    const r = await sendWA(phone, message);
    provider = 'ULTRAMSG';
    deliveryStatus = r.success ? 'SENT' : 'FAILED';
  }

  await (supabase as any).from('notification_logs').insert({
    order_id: ev.orderId, phone_number: phone, status_type: ev.newStatus,
    content: message, provider, delivery_status: deliveryStatus, created_at: new Date().toISOString(),
  }).then(({ error: e }: any) => { if (e) console.warn('[notif] log failed:', e.message); });
}

export default async function handler(
  req: { method?: string; body?: { orders?: NotifRequest[] } },
  res: { status: (n: number) => { json: (o: object) => void } },
) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const orders = req.body?.orders;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Missing or empty orders array' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server config missing' });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const results = await Promise.allSettled(orders.map(o => processNotification(supabase as any, o)));
  const sent = results.filter(r => r.status === 'fulfilled').length;
  return res.status(200).json({ success: true, total: orders.length, sent });
}
