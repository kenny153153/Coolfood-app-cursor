/**
 * 順豐路由推送 (Route Push) Webhook
 * 接收順豐物流狀態更新，自動更新訂單：
 *   - opCode 50 (已攬收) → shipping
 *   - opCode 80 (已簽收) → completed
 *
 * 所有依賴邏輯內嵌，不跨檔案 import，避免 Vercel ERR_MODULE_NOT_FOUND。
 */
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SHIPPED_CODES = new Set(['50', '51', '30', '31', '36', '44', '45', '46']);
const DELIVERED_CODES = new Set(['80']);

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const str = msgData + timestamp + checkword;
  const md5 = crypto.createHash('md5').update(str, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
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

function buildStatusMessage(orderId: string, status: string, waybillNo?: string): string | null {
  switch (status) {
    case 'shipped': return `Coolfood: 順豐已取件，單號 ${waybillNo || '（處理中）'}，留意收件。`;
    case 'delivered': return `Coolfood: 順豐顯示你已經收到貨。多謝支持！`;
    default: return null;
  }
}

async function notifyCustomer(supabase: SupabaseClient, orderId: string, status: string, waybillNo: string, phone?: string | null) {
  try {
    const message = buildStatusMessage(orderId, status, waybillNo);
    if (!message) return;

    let customerPhone = phone?.trim() || null;
    if (!customerPhone) {
      const { data } = await supabase.from('orders').select('customer_phone').eq('id', orderId).maybeSingle();
      customerPhone = data?.customer_phone?.trim() || null;
    }

    let deliveryStatus = 'LOGGED';
    if (customerPhone) {
      const r = await sendWA(customerPhone, message);
      deliveryStatus = r.success ? 'SENT' : 'FAILED';
    }

    await supabase.from('notification_logs').insert({
      order_id: orderId, phone_number: customerPhone, status_type: status,
      content: message, provider: customerPhone ? 'ULTRAMSG' : 'MOCK',
      delivery_status: deliveryStatus, created_at: new Date().toISOString(),
    }).then(({ error: e }) => { if (e) console.warn('[sf-status] notif log failed:', e.message); });
  } catch (e) {
    console.warn('[sf-status] notif error (swallowed):', e instanceof Error ? e.message : e);
  }
}

interface SfRoutePushBody {
  partnerID?: string; requestID?: string; serviceCode?: string;
  timestamp?: string; msgDigest?: string; msgData?: string;
}

interface SfRouteInfo {
  mailNo?: string;
  routes?: { opCode?: string; remark?: string; acceptTime?: string; acceptAddress?: string }[];
}

export default async function handler(
  req: { method?: string; body?: SfRoutePushBody; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as SfRoutePushBody;
  const { partnerID = '', requestID = '', timestamp = '', msgDigest = '', msgData = '' } = body;
  console.log('[sf-status] Push:', { partnerID, requestID, timestamp });

  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  if (!checkword) return res.status(500).json({ error: 'SF_CHECKWORD not set' });

  const expectedDigest = computeMsgDigest(msgData, timestamp, checkword);
  if (msgDigest !== expectedDigest) {
    console.error('[sf-status] Digest mismatch');
    return res.status(403).json({ error: 'Signature failed' });
  }

  let routeData: SfRouteInfo;
  try { routeData = JSON.parse(msgData); } catch {
    return res.status(400).json({ error: 'Invalid msgData' });
  }

  const waybillNo = routeData.mailNo?.trim();
  if (!waybillNo) return res.status(200).json({ return_code: '0000', return_msg: 'success' });

  const routes = routeData.routes || [];
  if (routes.length === 0) return res.status(200).json({ return_code: '0000', return_msg: 'success' });

  let targetStatus: string | null = null;
  let latestRoute = routes[routes.length - 1];
  for (let i = routes.length - 1; i >= 0; i--) {
    const opCode = routes[i].opCode ?? '';
    if (DELIVERED_CODES.has(opCode)) { targetStatus = 'delivered'; latestRoute = routes[i]; break; }
    if (SHIPPED_CODES.has(opCode) && !targetStatus) { targetStatus = 'shipped'; latestRoute = routes[i]; }
  }
  if (!targetStatus) return res.status(200).json({ return_code: '0000', return_msg: 'success' });

  console.log(`[sf-status] ${waybillNo} → ${targetStatus} (op: ${latestRoute.opCode})`);

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Config missing' });

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: orderRows, error: findErr } = await supabase
      .from('orders')
      .select('id, status, waybill_no, customer_phone')
      .eq('waybill_no', waybillNo);

    if (findErr || !orderRows?.length) {
      return res.status(200).json({ return_code: '0000', return_msg: 'success' });
    }

    let updated = 0;
    for (const order of orderRows) {
      const cur = String(order.status).toLowerCase();
      if (cur === 'delivered' && targetStatus === 'shipped') continue;
      if (cur === 'refunded' || cur === 'partially_refunded' || cur === 'cancelled') continue;

      const { error: upErr } = await supabase.from('orders').update({
        status: targetStatus,
        sf_responses: {
          opCode: latestRoute.opCode, remark: latestRoute.remark,
          acceptTime: latestRoute.acceptTime, receivedAt: new Date().toISOString(),
        },
      }).eq('id', order.id);

      if (!upErr) {
        updated++;
        notifyCustomer(supabase, String(order.id), targetStatus, waybillNo, order.customer_phone).catch(() => {});
      }
    }

    console.log(`[sf-status] ${updated}/${orderRows.length} updated`);
    return res.status(200).json({ return_code: '0000', return_msg: 'success' });
  } catch (e) {
    console.error('[sf-status] Error:', e);
    return res.status(200).json({ return_code: '0001', return_msg: 'error' });
  }
}
