/**
 * 確認支付：向 Airwallex 查詢 Payment Intent 是否 SUCCEEDED，再更新 Supabase 為 success，並觸發順豐下單
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

const maskUrl = (value: string): string => {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return value ? `${value.slice(0, 6)}...` : '';
  }
};

const isLocalhost = (value: string): boolean => {
  return value.includes('localhost') || value.includes('127.0.0.1') || value.includes('0.0.0.0');
};

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

  // 1. 檢查 Method
  if (req.method !== 'POST') {
    console.error('錯誤: 非 POST 請求');
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
  console.log('[confirm-payment] origin:', origin || '(none)');

  try {
    // 2. 檢查環境變數
    console.log('檢查環境變數:');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已載入' : '❌ 缺失');
    console.log('- SF_PARTNER_ID:', process.env.SF_PARTNER_ID ? '✅ 已載入' : '❌ 缺失');
    console.log('- SF_CHECKWORD:', process.env.SF_CHECKWORD ? '✅ 已載入' : '❌ 缺失');

    const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '');
    const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
    if (serviceRoleKey) console.log('[confirm-payment] Using SUPABASE_SERVICE_ROLE_KEY for update');
    console.log('API 使用的網址:', process.env.SUPABASE_URL);
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[confirm-payment] Missing Supabase config');
      return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
    }
    if (isLocalhost(supabaseUrl)) {
      console.error('[confirm-payment] SUPABASE_URL is localhost, not reachable from Vercel:', supabaseUrl);
      return res.status(500).json({ error: 'SUPABASE_URL must be a public URL (not localhost)', code: 'SUPABASE_URL_INVALID' });
    }
    console.log('[confirm-payment] Supabase URL host:', maskUrl(supabaseUrl));
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    if (paymentIntentId) {
      console.log('[confirm-payment] payment_intent_id detected:', paymentIntentId);
      try {
        const { token, baseUrl } = await getAirwallexToken();
        const getIntentUrl = `${baseUrl}/api/v1/pa/payment_intents/${encodeURIComponent(paymentIntentId)}`;
        console.log('[confirm-payment] GET intent:', getIntentUrl);
        const intentRes = await fetch(getIntentUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const intentText = await intentRes.text();
        if (!intentRes.ok) {
          console.error('[confirm-payment] Airwallex GET intent failed', intentRes.status, intentText.slice(0, 200));
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
      } catch (airwallexErr) {
        const msg = airwallexErr instanceof Error ? airwallexErr.message : String(airwallexErr);
        console.error('[confirm-payment] Airwallex verification failed, continue with orderId fallback:', msg);
        if (!orderId) {
          return res.status(502).json({ error: msg, code: 'AIRWALLEX_FETCH_FAILED' });
        }
      }
    } else {
      console.log('[confirm-payment] payment_intent_id is empty, skip Airwallex verification');
    }

    if (!orderId) {
      console.error('[confirm-payment] Missing orderId');
      return res.status(400).json({ error: 'Missing orderId or payment_intent_id', code: 'BAD_REQUEST' });
    }

    const dbId = getOrderDbId(orderId);
    console.log('[confirm-payment] Resolve orderId:', orderId, '=> dbId:', dbId);
    const { data: orderByDbId, error: orderByDbError } = await supabaseClient
      .from('orders')
      .select('id,status,tracking_number,waybill_no')
      .eq('id', dbId)
      .maybeSingle();
    if (orderByDbError) {
      console.error('[confirm-payment] Supabase fetch failed (dbId):', orderByDbError.message);
      return res.status(502).json({ error: 'Supabase fetch failed', code: 'SUPABASE_FETCH_FAILED', details: orderByDbError.message });
    }
    let order = orderByDbId ?? null;
    if (!order && String(dbId) !== orderId) {
      console.warn('[confirm-payment] Order not found by dbId, retry with orderId:', orderId);
      const { data: orderByOrderId, error: orderByOrderError } = await supabaseClient
        .from('orders')
        .select('id,status,tracking_number,waybill_no')
        .eq('id', orderId)
        .maybeSingle();
      if (orderByOrderError) {
        console.error('[confirm-payment] Supabase fetch failed (orderId):', orderByOrderError.message);
        return res.status(502).json({ error: 'Supabase fetch failed', code: 'SUPABASE_FETCH_FAILED', details: orderByOrderError.message });
      }
      order = orderByOrderId ?? null;
    }
    if (!order) {
      console.error('[confirm-payment] Order not found:', dbId);
      return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }
    console.log('[confirm-payment] Order loaded:', JSON.stringify(order));

    const alreadySuccess = order.status === 'success';
    let canTriggerSf = false;
    if (alreadySuccess) {
      console.log('[confirm-payment] Order already success, skip update');
      canTriggerSf = true;
    } else {
      const updateId = order.id ?? dbId;
      console.log('[confirm-payment] Updating Supabase status to success');
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({ status: 'success' })
        .eq('id', updateId);
      if (updateError) {
        console.error('[confirm-payment] Update status failed', updateError.message);
        return res.status(502).json({ error: 'Failed to update order status', code: 'UPDATE_FAILED', details: updateError.message });
      }
      console.log('✅ Supabase 狀態已更新為 success');
      canTriggerSf = true;
    }

    const existingWaybill = order.waybill_no ?? order.tracking_number ?? null;
    if (existingWaybill) {
      console.log('[confirm-payment] waybill exists, skip SF API:', existingWaybill);
      console.log('--- [流程結束] ---');
      return res.status(200).json({ success: true, orderId, waybillNo: existingWaybill, waybill_no: existingWaybill, confirmed: true });
    }

    if (!canTriggerSf) {
      console.log('[confirm-payment] Skip SF: status not updated to success');
      console.log('--- [流程結束] ---');
      return res.status(200).json({ success: true, orderId, waybillNo: null, waybill_no: null, confirmed: true, sfPending: true });
    }

    // 3. 呼叫順豐前
    console.log('準備呼叫順豐 API...');
    try {
      const sfRes = await fetch(`${origin}/api/sf-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const sfText = await sfRes.text();
      let sfJson: { waybillNo?: string; waybill_no?: string; error?: string; code?: string } | null = null;
      try {
        sfJson = sfText ? JSON.parse(sfText) : null;
      } catch {
        sfJson = null;
      }
      console.log('[confirm-payment] SF response:', sfRes.status, sfJson ?? sfText.slice(0, 200));

      console.log('--- [流程結束] ---');
      if (!sfRes.ok) {
        const updateId = order.id ?? dbId;
        const sfErrorPayload = { status: sfRes.status, body: sfJson ?? sfText, at: new Date().toISOString() };
        const { error: sfStoreError } = await supabaseClient
          .from('orders')
          .update({ sf_responses: sfErrorPayload })
          .eq('id', updateId);
        if (sfStoreError) {
          console.error('[confirm-payment] Failed to store sf_responses', sfStoreError.message);
        }
        return res.status(200).json({ success: true, orderId, waybillNo: null, waybill_no: null, confirmed: true, sfPending: true });
      }
      const waybill = sfJson?.waybill_no ?? sfJson?.waybillNo ?? null;
      const updateId = order.id ?? dbId;
      if (waybill) {
        const { error: wbError } = await supabaseClient
          .from('orders')
          .update({ waybill_no: waybill, sf_responses: null })
          .eq('id', updateId);
        if (wbError) {
          console.error('[confirm-payment] Failed to store waybill_no', wbError.message);
        } else {
          console.log('[confirm-payment] waybill_no saved:', waybill);
        }
      } else {
        const sfErrorPayload = { status: sfRes.status, body: sfJson ?? sfText, at: new Date().toISOString() };
        const { error: sfStoreError } = await supabaseClient
          .from('orders')
          .update({ sf_responses: sfErrorPayload })
          .eq('id', updateId);
        if (sfStoreError) {
          console.error('[confirm-payment] Failed to store sf_responses', sfStoreError.message);
        }
      }
      return res.status(200).json({ success: true, orderId, waybillNo: waybill, waybill_no: waybill, confirmed: true });
    } catch (sfErr) {
      const msg = sfErr instanceof Error ? sfErr.message : String(sfErr);
      console.error('[confirm-payment] SF fetch failed, mark pending:', msg);
      console.log('--- [流程結束] ---');
      const updateId = order.id ?? dbId;
      const sfErrorPayload = { status: 0, body: msg, at: new Date().toISOString() };
      const { error: sfStoreError } = await supabaseClient
        .from('orders')
        .update({ sf_responses: sfErrorPayload })
        .eq('id', updateId);
      if (sfStoreError) {
        console.error('[confirm-payment] Failed to store sf_responses', sfStoreError.message);
      }
      return res.status(200).json({ success: true, orderId, waybillNo: null, waybill_no: null, confirmed: true, sfPending: true });
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ 流程崩潰:', errMsg);
    return res.status(500).json({ error: errMsg });
  }
}
