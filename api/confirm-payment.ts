/**
 * 確認支付：使用 Supabase Admin SDK 更新狀態，再呼叫順豐下單
 * 若 payment_intent_id 為空但有 orderId，仍會更新 Supabase 狀態（供 Sandbox 測試）
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

async function getAirwallexToken(): Promise<{ token: string; baseUrl: string }> {
  const clientId = safeTrim(process.env.AIRWALLEX_CLIENT_ID ?? process.env.VITE_AIRWALLEX_CLIENT_ID ?? '');
  const apiKey = safeTrim(process.env.AIRWALLEX_API_KEY ?? process.env.VITE_AIRWALLEX_API_KEY ?? '');
  const useDemo = safeTrim(process.env.AIRWALLEX_ENV ?? process.env.VITE_AIRWALLEX_ENV ?? '') !== 'prod';
  const baseUrl = useDemo ? AIRWALLEX_DEMO : AIRWALLEX_PROD;
  const authUrl = `${baseUrl}/api/v1/authentication/login`;

  console.log('[confirm-payment] Airwallex auth start:', authUrl);
  const authRes = await fetch(authUrl, {
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
  console.log('[confirm-payment] Airwallex auth success');
  return { token, baseUrl };
}

export default async function handler(
  req: { method?: string; body?: ConfirmPayload; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  console.log('--- [開始支付確認流程] ---');
  console.log('請求方法:', req.method);
  console.log('收到參數:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as ConfirmPayload;
  const paymentIntentId = safeTrim(body?.payment_intent_id ?? '');
  let orderId = safeTrim(body?.orderId ?? '');

  const protocol = (req.headers && (req.headers['x-forwarded-proto'] as string)) || 'https';
  const host = req.headers && req.headers.host;
  const fallbackOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://coolfood-app-cursor.vercel.app';
  const origin = host ? `${protocol}://${host}` : safeTrim(body?.origin ?? fallbackOrigin);

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  try {
    console.log('Supabase URL:', new URL(supabaseUrl).href);
  } catch (urlError) {
    console.error('[confirm-payment] SUPABASE_URL invalid:', supabaseUrl);
    console.error('[confirm-payment] SUPABASE_URL error:', JSON.stringify(urlError, Object.getOwnPropertyNames(urlError)));
    return res.status(500).json({ error: 'SUPABASE_URL invalid', code: 'SUPABASE_URL_INVALID' });
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (paymentIntentId) {
      const { token, baseUrl } = await getAirwallexToken();
      const getIntentUrl = `${baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(paymentIntentId)}`;
      console.log('[confirm-payment] GET intent:', getIntentUrl);
      const intentRes = await fetch(getIntentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const intentText = await intentRes.text();
      if (!intentRes.ok) {
        return res.status(400).json({
          error: '無法向 Airwallex 確認支付狀態',
          code: 'INTENT_FETCH_FAILED',
          details: intentText.slice(0, 200),
        });
      }
      const intent = JSON.parse(intentText) as { status?: string; merchant_order_id?: string };
      const status = (intent.status ?? '').toUpperCase();
      console.log('[confirm-payment] Intent status:', status, 'merchant_order_id:', intent.merchant_order_id);
      if (status !== 'SUCCEEDED') {
        return res.status(400).json({
          error: '支付尚未成功',
          code: 'PAYMENT_NOT_SUCCEEDED',
          status: intent.status,
        });
      }
      if (intent.merchant_order_id) orderId = String(intent.merchant_order_id).trim();
    } else {
      console.log('[confirm-payment] payment_intent_id is empty, skip Airwallex verification');
    }

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId or payment_intent_id', code: 'BAD_REQUEST' });
    }

    const dbId = getOrderDbId(orderId);
    const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;
    const filters = String(dbIdValue) === orderId ? `id.eq.${dbIdValue}` : `id.eq.${dbIdValue},id.eq.${orderId}`;
    console.log('[confirm-payment] Resolve orderId:', orderId, '=> dbId:', dbIdValue);

    const { data: orderRow, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id,status,tracking_number,waybill_no')
      .or(filters)
      .maybeSingle();
    if (orderError) {
      return res.status(502).json({ error: 'Supabase fetch failed', code: 'SUPABASE_FETCH_FAILED', details: orderError.message });
    }
    if (!orderRow) {
      return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }

    // Step A: 更新狀態
    const { data: updatedRow, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'success' })
      .or(filters)
      .select('id,status,tracking_number,waybill_no')
      .maybeSingle();
    if (updateError) {
      return res.status(502).json({ error: 'Failed to update order status', code: 'UPDATE_FAILED', details: updateError.message });
    }
    const effectiveOrder = updatedRow ?? orderRow;

    // Step B: 呼叫順豐
    console.log('[confirm-payment] Step B: call sf-order');
    const sfRes = await fetch(`${origin}/api/sf-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    const sfText = await sfRes.text();
    let sfJson: { waybillNo?: string; waybill_no?: string } | null = null;
    try {
      sfJson = sfText ? JSON.parse(sfText) : null;
    } catch {
      sfJson = null;
    }

    // Step C: 儲存單號 + 回應
    const waybill = sfJson?.waybill_no ?? sfJson?.waybillNo ?? null;
    const sfPayload = { status: sfRes.status, body: sfJson ?? sfText, at: new Date().toISOString() };
    const updatePayload = waybill ? { waybill_no: waybill, sf_responses: sfPayload } : { sf_responses: sfPayload };

    const { error: sfStoreError } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .or(filters);
    if (sfStoreError) {
      return res.status(502).json({ error: 'Failed to store sf result', code: 'SF_STORE_FAILED', details: sfStoreError.message });
    }

    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: waybill ?? effectiveOrder.tracking_number ?? null,
      waybill_no: waybill ?? effectiveOrder.waybill_no ?? null,
      confirmed: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ 流程崩潰:', errMsg);
    return res.status(500).json({ error: errMsg });
  }
}
