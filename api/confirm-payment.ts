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

  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  try {
    console.log('Supabase URL:', new URL(supabaseUrl ?? '').href);
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
    console.log('[confirm-payment] Step 0: start Airwallex verification');
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
    console.log('[confirm-payment] Resolve orderId:', orderId, '=> dbId:', dbIdValue);
    console.log('[confirm-payment] Step A: fetch order by dbId');

    let orderRow: { id?: string | number; status?: string; tracking_number?: string | null; waybill_no?: string | null } | null = null;
    const { data: orderByDbId, error: orderByDbIdError } = await supabaseAdmin
      .from('orders')
      .select('id,status,tracking_number,waybill_no')
      .eq('id', dbIdValue)
      .maybeSingle();
    if (orderByDbIdError) {
      console.error('[confirm-payment] Supabase fetch error (dbId):', orderByDbIdError.message, orderByDbIdError.details ?? '');
      return res.status(502).json({ error: 'Supabase fetch failed', code: 'SUPABASE_FETCH_FAILED', details: orderByDbIdError.message });
    }
    orderRow = orderByDbId ?? null;

    if (!orderRow && typeof orderId === 'string' && orderId.startsWith('ORD-')) {
      console.log('[confirm-payment] Step A: fetch order by orderId string');
      const { data: orderByOrderId, error: orderByOrderError } = await supabaseAdmin
        .from('orders')
        .select('id,status,tracking_number,waybill_no')
        .eq('id', orderId)
        .maybeSingle();
      if (orderByOrderError) {
        console.error('[confirm-payment] Supabase fetch error (orderId):', orderByOrderError.message, orderByOrderError.details ?? '');
        return res.status(502).json({ error: 'Supabase fetch failed', code: 'SUPABASE_FETCH_FAILED', details: orderByOrderError.message });
      }
      orderRow = orderByOrderId ?? null;
    }

    if (!orderRow) {
      console.error('[confirm-payment] Order not found for dbId/orderId:', dbIdValue, orderId);
      return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
    }
    console.log('[confirm-payment] Order found:', orderRow.id, orderRow.status);

    // Step A: 更新狀態為 processing（解耦順豐 API，由後台批量操作觸發）
    console.log('[confirm-payment] Step A: update status to processing');
    const updateId = orderRow.id ?? dbIdValue;
    const { data: updatedRow, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', updateId)
      .select('id,status,tracking_number,waybill_no')
      .maybeSingle();
    if (updateError) {
      console.error('[confirm-payment] Update status error:', updateError.message, updateError.details ?? '');
      return res.status(502).json({ error: 'Failed to update order status', code: 'UPDATE_FAILED', details: updateError.message });
    }
    const effectiveOrder = updatedRow ?? orderRow;
    console.log('[confirm-payment] Status updated to processing:', effectiveOrder.status);

    // SF API 已解耦：不再自動呼叫順豐，改由後台「呼叫順豐」批量操作手動觸發
    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: effectiveOrder.tracking_number ?? null,
      waybill_no: effectiveOrder.waybill_no ?? null,
      confirmed: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ 流程崩潰:', errMsg);
    return res.status(500).json({ error: errMsg });
  }
}
