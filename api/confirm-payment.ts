/**
 * 確認支付：使用 Supabase Admin SDK 更新狀態
 * 設計原則：訂單狀態更新 (paid) 是最高優先級，任何下游操作（WhatsApp 通知等）
 *           失敗都不會阻擋用戶看到「支付成功」。
 *
 * WhatsApp 邏輯直接內嵌於本檔案，避免 Vercel serverless 跨檔案 import 錯誤
 * (ERR_MODULE_NOT_FOUND: /var/task/api/send-whatsapp)。
 */
import { createClient } from '@supabase/supabase-js';

const AIRWALLEX_DEMO = 'https://api-demo.airwallex.com';
const AIRWALLEX_PROD = 'https://api.airwallex.com';

type ConfirmPayload = { orderId?: string | null; payment_intent_id?: string | null; origin?: string | null };

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

const safeTrim = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function fetchWithTimeout(url: string, opts: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ─── Inline WhatsApp helper (avoids cross-file import in Vercel) ─────
function formatHKPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `+852${digits}`;
  if (digits.length === 11 && digits.startsWith('852')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('852')) return `+${digits.slice(0, 11)}`;
  if (!phone.startsWith('+') && digits.length > 8) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

async function sendWhatsApp(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  const instanceId = (process.env.ULTRAMSG_INSTANCE_ID ?? '').trim();
  const token = (process.env.ULTRAMSG_TOKEN ?? '').trim();
  if (!instanceId || !token) return { success: false, error: 'Ultramsg not configured' };

  const phone = formatHKPhone(to);
  try {
    const res = await fetchWithTimeout(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: phone, body }),
    }, 6000);
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = {}; }
    if (!res.ok || data.error) return { success: false, error: data.error || `HTTP ${res.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Airwallex ───────────────────────────────────────────────────────
async function getAirwallexToken(): Promise<{ token: string; baseUrl: string }> {
  const clientId = safeTrim(process.env.AIRWALLEX_CLIENT_ID ?? process.env.VITE_AIRWALLEX_CLIENT_ID ?? '');
  const apiKey = safeTrim(process.env.AIRWALLEX_API_KEY ?? process.env.VITE_AIRWALLEX_API_KEY ?? '');
  const useDemo = safeTrim(process.env.AIRWALLEX_ENV ?? process.env.VITE_AIRWALLEX_ENV ?? '') !== 'prod';
  const baseUrl = useDemo ? AIRWALLEX_DEMO : AIRWALLEX_PROD;

  const authRes = await fetchWithTimeout(`${baseUrl}/api/v1/authentication/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-id': clientId, 'x-api-key': apiKey },
    body: '{}',
  });
  if (!authRes.ok) {
    const t = await authRes.text();
    throw new Error(`Airwallex auth failed: ${authRes.status} ${t.slice(0, 150)}`);
  }
  const data = (await authRes.json()) as { access_token?: string; token?: string };
  const token = data.access_token ?? data.token;
  if (!token) throw new Error('Airwallex: no token in response');
  return { token, baseUrl };
}

// ─── Handler ─────────────────────────────────────────────────────────
export default async function handler(
  req: { method?: string; body?: ConfirmPayload; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  console.log('[confirm-payment] Start | body:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as ConfirmPayload;
  const paymentIntentId = safeTrim(body?.payment_intent_id ?? '');
  let orderId = safeTrim(body?.orderId ?? '');

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
  }
  try { new URL(supabaseUrl); } catch {
    return res.status(500).json({ error: 'SUPABASE_URL invalid', code: 'SUPABASE_URL_INVALID' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ─── Step 1: Airwallex verification ────────────────────────────────
  let airwallexVerified = false;
  let airwallexError: string | null = null;

  if (paymentIntentId) {
    try {
      const { token, baseUrl } = await getAirwallexToken();
      const intentRes = await fetchWithTimeout(
        `${baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(paymentIntentId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!intentRes.ok) {
        airwallexError = `Intent fetch ${intentRes.status}`;
        console.warn('[confirm-payment]', airwallexError);
      } else {
        const intent = await intentRes.json() as { status?: string; merchant_order_id?: string };
        const status = (intent.status ?? '').toUpperCase();
        if (status === 'SUCCEEDED') {
          airwallexVerified = true;
          if (intent.merchant_order_id) orderId = String(intent.merchant_order_id).trim();
        } else {
          return res.status(400).json({ error: '支付尚未成功', code: 'PAYMENT_NOT_SUCCEEDED', status: intent.status });
        }
      }
    } catch (e) {
      airwallexError = e instanceof Error ? e.message : String(e);
      console.warn('[confirm-payment] Airwallex error (non-fatal):', airwallexError);
    }
  } else {
    airwallexVerified = true;
  }

  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId or payment_intent_id', code: 'BAD_REQUEST' });
  }

  // ─── Step 2: Mark order as PAID (critical path) ────────────────────
  try {
    const dbId = getOrderDbId(orderId);
    const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

    let orderRow: { id?: string | number; status?: string } | null = null;
    const { data: d1 } = await supabaseAdmin
      .from('orders').select('id,status').eq('id', dbIdValue).maybeSingle();
    orderRow = d1 ?? null;

    if (!orderRow && typeof orderId === 'string' && orderId.startsWith('ORD-')) {
      const { data: d2 } = await supabaseAdmin
        .from('orders').select('id,status').eq('id', orderId).maybeSingle();
      orderRow = d2 ?? null;
    }

    if (!orderRow) {
      return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }

    const updateId = orderRow.id ?? dbIdValue;
    const { error: updateError } = await supabaseAdmin
      .from('orders').update({ status: 'paid' }).eq('id', updateId);

    if (updateError) {
      console.error('[confirm-payment] CRITICAL update failed:', updateError.message);
      return res.status(502).json({ error: '更新訂單狀態失敗，請聯繫客服', code: 'UPDATE_FAILED' });
    }

    console.log('[confirm-payment] Order', updateId, 'marked as PAID');

    // ─── Step 3: Auto SF order — get tracking number (fire-and-forget) ─
    const protocol = (req.headers?.['x-forwarded-proto'] as string) || 'https';
    const host = req.headers?.host as string;
    const selfOrigin = host ? `${protocol}://${host}` : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    if (selfOrigin) {
      (async () => {
        try {
          console.log('[confirm-payment] Auto SF call for', orderId);
          const sfRes = await fetchWithTimeout(`${selfOrigin}/api/sf-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          }, 12000);
          const sfData: any = await sfRes.json().catch(() => ({}));
          if (sfRes.ok && sfData.waybillNo) {
            console.log('[confirm-payment] Auto SF success, waybill:', sfData.waybillNo);
          } else {
            console.warn('[confirm-payment] Auto SF no waybill:', sfData.error || sfRes.status);
            // Write admin note so admin knows to retry
            await supabaseAdmin.from('orders').update({
              sf_responses: { autoCall: true, error: sfData.error || `HTTP ${sfRes.status}`, at: new Date().toISOString() },
            }).eq('id', updateId);
          }
        } catch (sfErr) {
          console.warn('[confirm-payment] Auto SF error (non-blocking):', sfErr instanceof Error ? sfErr.message : sfErr);
        }
      })();
    }

    // ─── Step 4: WhatsApp (fire-and-forget, inlined) ─────────────────
    (async () => {
      try {
        const { data: fullOrder } = await supabaseAdmin
          .from('orders')
          .select('id,customer_name,customer_phone,total,subtotal,delivery_fee,line_items,delivery_method,delivery_address,delivery_district')
          .eq('id', updateId)
          .maybeSingle();

        if (!fullOrder?.customer_phone) return;

        const oid = orderId || `ORD-${fullOrder.id}`;
        const items = Array.isArray(fullOrder.line_items) ? fullOrder.line_items : [];
        const itemLines = items.map((li: any) => `  - ${li.name} x${li.qty}  $${li.line_total}`).join('\n');
        const deliveryLabel = fullOrder.delivery_method === 'sf_locker' ? '順豐冷運自提' : '送貨上門';

        let brandName = 'Coolfood';
        try {
          const { data: cfg } = await supabaseAdmin
            .from('site_config').select('value').eq('id', 'site_branding').maybeSingle();
          if (cfg?.value?.logoText) brandName = cfg.value.logoText;
        } catch { /* default */ }

        const message =
          `你好！${brandName} 已收到你嘅訂單 ${oid} 🎉\n\n` +
          `📦 商品：\n${itemLines}\n\n` +
          `💰 小計：$${fullOrder.subtotal ?? fullOrder.total}\n` +
          (fullOrder.delivery_fee ? `🚚 運費：$${fullOrder.delivery_fee}\n` : '') +
          `💵 合計：$${fullOrder.total}\n` +
          `📍 配送：${deliveryLabel}\n` +
          (fullOrder.delivery_address ? `📮 地址：${fullOrder.delivery_district ? fullOrder.delivery_district + ' ' : ''}${fullOrder.delivery_address}\n` : '') +
          `\n有任何問題可以隨時搵我哋。感謝支持！😊`;

        const waResult = await sendWhatsApp(fullOrder.customer_phone, message);

        await supabaseAdmin.from('notification_logs').insert({
          order_id: oid,
          phone_number: fullOrder.customer_phone,
          status_type: 'paid',
          content: message,
          provider: 'ULTRAMSG',
          delivery_status: waResult.success ? 'SENT' : 'FAILED',
          created_at: new Date().toISOString(),
        }).then(({ error: e }) => { if (e) console.warn('[confirm-payment] log write failed:', e.message); });

        console.log(`[confirm-payment] WhatsApp ${waResult.success ? 'sent' : 'failed'}`);
      } catch (e) {
        console.warn('[confirm-payment] WhatsApp background error:', e instanceof Error ? e.message : e);
      }
    })();

    // ─── Step 5: Return success immediately ──────────────────────────
    return res.status(200).json({
      success: true,
      orderId,
      confirmed: true,
      airwallexVerified,
      ...(airwallexError ? { airwallexWarning: airwallexError } : {}),
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[confirm-payment] Unexpected:', errMsg);

    // Last-resort: try simpler update path
    try {
      const dbId = getOrderDbId(orderId);
      const numId = /^\d+$/.test(String(dbId)) ? Number(dbId) : dbId;
      await supabaseAdmin.from('orders').update({ status: 'paid' }).eq('id', numId);
      return res.status(200).json({
        success: true, orderId, confirmed: true,
        warning: '支付已確認（部分流程有延遲，不影響訂單）',
      });
    } catch { /* fall through */ }

    return res.status(500).json({
      error: '支付處理遇到問題，但你的付款已記錄。如有疑問請聯繫客服。',
      code: 'PARTIAL_FAILURE',
    });
  }
}
