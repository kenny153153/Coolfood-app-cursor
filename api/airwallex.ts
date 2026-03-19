/**
 * Consolidated Airwallex API — POST /api/airwallex
 * Body: { action: 'create-intent' | 'refund', ... }
 *
 * Merges the former /api/airwallex-create-intent and /api/airwallex-refund.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from './_adminAuth';

const AIRWALLEX_DEMO = 'https://api-demo.airwallex.com';
const AIRWALLEX_PROD = 'https://api.airwallex.com';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

function fetchWithTimeout(url: string, opts: RequestInit, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function getAirwallexConfig() {
  const clientId = safeTrim(process.env.AIRWALLEX_CLIENT_ID ?? process.env.VITE_AIRWALLEX_CLIENT_ID ?? '');
  const apiKey = safeTrim(process.env.AIRWALLEX_API_KEY ?? process.env.VITE_AIRWALLEX_API_KEY ?? '');
  const envRaw = safeTrim(process.env.AIRWALLEX_ENV ?? process.env.VITE_AIRWALLEX_ENV ?? '');
  const useDemo = envRaw !== 'prod';
  const baseUrl = useDemo ? AIRWALLEX_DEMO : AIRWALLEX_PROD;
  return { clientId, apiKey, useDemo, baseUrl };
}

async function getAirwallexToken(): Promise<{ token: string; baseUrl: string }> {
  const { clientId, apiKey, baseUrl } = getAirwallexConfig();
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

// ─── create-intent ──────────────────────────────────────────────────

async function handleCreateIntent(req: any, res: any) {
  const { clientId, apiKey, useDemo, baseUrl } = getAirwallexConfig();
  const authUrl = `${baseUrl}/api/v1/authentication/login`;

  console.log('目前正在訪問的網址是: ' + authUrl);
  console.log('process.env.VITE_AIRWALLEX_ENV =', JSON.stringify(process.env.VITE_AIRWALLEX_ENV), '| AIRWALLEX_ENV =', JSON.stringify(process.env.AIRWALLEX_ENV));
  console.log('clientId length:', clientId.length, '| apiKey length:', apiKey.length);
  if (useDemo) console.log('Airwallex Sandbox Mode Active');

  if (!clientId || !apiKey) {
    return res.status(500).json({
      error: 'Airwallex credentials not configured. In Vercel, set VITE_AIRWALLEX_CLIENT_ID and VITE_AIRWALLEX_API_KEY (or AIRWALLEX_*).',
      code: 'CREDENTIALS_MISSING',
    });
  }

  const body = req.body as { amount?: number; merchant_order_id?: string; success_origin?: string; action?: string };
  const merchantOrderId = typeof body?.merchant_order_id === 'string' ? body.merchant_order_id : undefined;
  const successOrigin = typeof body?.success_origin === 'string' && body.success_origin ? body.success_origin : 'https://coolfood-app-cursor.vercel.app';

  if (!merchantOrderId) {
    return res.status(400).json({ error: 'Invalid merchant_order_id', code: 'BAD_REQUEST' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  let amount: number | undefined;

  if (supabaseUrl && serviceRoleKey) {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const dbId = getOrderDbId(merchantOrderId);
    const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

    const { data: order } = await supabaseAdmin
      .from('orders').select('id,total').eq('id', dbIdValue).maybeSingle();

    if (!order) {
      const { data: order2 } = await supabaseAdmin
        .from('orders').select('id,total').eq('id', merchantOrderId).maybeSingle();
      if (order2) amount = Number(order2.total);
    } else {
      amount = Number(order.total);
    }
  }

  if (amount == null || amount <= 0) {
    const clientAmount = typeof body?.amount === 'number' ? body.amount : undefined;
    if (clientAmount != null && clientAmount > 0) {
      console.warn('[Airwallex] DB lookup failed, using client amount as fallback:', clientAmount);
      amount = clientAmount;
    } else {
      return res.status(400).json({ error: 'Order not found or invalid amount', code: 'BAD_REQUEST' });
    }
  }

  const successUrl = `${successOrigin.replace(/\/$/, '')}/success?order=${encodeURIComponent(merchantOrderId)}`;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    console.log('[Airwallex] Auth URL:', authUrl, '| successUrl:', successUrl);
    const authRes = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-client-id': clientId, 'x-api-key': apiKey },
      body: '{}',
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error('Airwallex auth failed', authRes.status, baseUrl, errText);
      let airwallexMsg = '';
      try {
        const errJson = JSON.parse(errText) as { message?: string; error?: string; code?: string };
        airwallexMsg = errJson.message ?? errJson.error ?? '';
        if (errJson.code) airwallexMsg = (airwallexMsg ? `${errJson.code}: ${airwallexMsg}` : errJson.code);
      } catch { airwallexMsg = errText.slice(0, 120); }
      const hint = useDemo
        ? ' Use sandbox Client ID and API key from Airwallex Demo (Settings > Developer > API keys at demo.airwallex.com). In Vercel set AIRWALLEX_ENV=demo or leave unset.'
        : ' Use production Client ID and API key and AIRWALLEX_ENV=prod.';
      const mainMsg = airwallexMsg
        ? `Payment auth failed: ${airwallexMsg}.${hint}`
        : `Payment auth failed. Check Client ID and API key.${hint}`;
      return res.status(502).json({ error: mainMsg, code: 'AUTH_FAILED', details: errText.slice(0, 200) });
    }

    const authData = (await authRes.json()) as { access_token?: string; token?: string };
    const token = authData.access_token ?? authData.token;
    if (!token) {
      console.error('[Airwallex] Auth: no token in response', authData);
      return res.status(502).json({ error: 'Payment auth failed (no token). Check credentials and environment (demo vs prod).', code: 'AUTH_NO_TOKEN' });
    }
    console.log('[Airwallex] Access token obtained, creating Payment Intent (card + fps, return_url=/success)');

    const createRes = await fetch(`${baseUrl}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        request_id: requestId,
        amount: Number(amount.toFixed(2)),
        currency: 'HKD',
        merchant_order_id: merchantOrderId,
        return_url: successUrl,
        payment_method_types: ['card'],
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('[Airwallex] Create intent failed', createRes.status, errText);
      return res.status(502).json({ error: 'Payment intent failed. See Vercel function logs for details.', code: 'INTENT_FAILED', details: errText.slice(0, 200) });
    }

    const intentData = (await createRes.json()) as Record<string, unknown>;
    const intentId = intentData.id as string | undefined;
    const clientSecret = intentData.client_secret as string | undefined;

    console.log('[Airwallex] Intent response keys:', Object.keys(intentData).join(', '));
    console.log('[Airwallex] Intent status:', intentData.status, '| available_payment_method_types:', JSON.stringify(intentData.available_payment_method_types));

    if (!intentId || !clientSecret) {
      console.error('[Airwallex] create intent: missing id or client_secret', JSON.stringify(intentData).slice(0, 500));
      return res.status(502).json({ error: 'Payment intent invalid (missing id or client_secret).', code: 'INTENT_INVALID' });
    }

    console.log('[Airwallex] Payment Intent created:', intentId, '| client_secret length:', clientSecret.length);
    return res.status(200).json({ intent_id: intentId, client_secret: clientSecret, currency: 'HKD', country_code: 'HK' });
  } catch (e) {
    console.error('[Airwallex] API error', e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({ error: 'Payment system error. Check Vercel function logs.', code: 'NETWORK_OR_SERVER_ERROR', details: errMsg.slice(0, 200) });
  }
}

// ─── refund ─────────────────────────────────────────────────────────

async function handleRefund(req: any, res: any) {
  const authResult = await verifyAdminRequest(req, 'orders', 'update');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const body = req.body as { orderId?: string; amount?: number; reason?: string };
  const orderId = safeTrim(body?.orderId ?? '');
  const amount = body?.amount;
  const reason = safeTrim(body?.reason ?? '管理員操作退款');

  if (!orderId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Missing orderId or invalid amount', code: 'BAD_REQUEST' });
  }

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  const supabaseKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '');

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
  }

  try {
    const dbId = getOrderDbId(orderId);
    const orderRes = await fetchWithTimeout(
      `${supabaseUrl}/rest/v1/orders?id=eq.${dbId}&select=id,total,status,payment_intent_id`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
      5000,
    );
    const orderData = await orderRes.json();
    const order = Array.isArray(orderData) ? orderData[0] : orderData;

    if (!order) {
      return res.status(404).json({ error: '訂單不存在', code: 'ORDER_NOT_FOUND' });
    }

    const paymentIntentId = order.payment_intent_id;
    if (!paymentIntentId) {
      return res.status(400).json({
        error: '此訂單沒有關聯的 Payment Intent ID，無法退款。可能是舊訂單或未通過 Airwallex 付款。',
        code: 'NO_PAYMENT_INTENT',
      });
    }

    if (amount > order.total) {
      return res.status(400).json({ error: '退款金額不能超過訂單總額', code: 'AMOUNT_EXCEEDS_TOTAL' });
    }

    const { token, baseUrl } = await getAirwallexToken();

    const refundRequestId = `refund_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const refundRes = await fetchWithTimeout(`${baseUrl}/api/v1/pa/refunds/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        amount: Number(amount.toFixed(2)),
        reason,
        request_id: refundRequestId,
      }),
    });

    const refundText = await refundRes.text();
    let refundJson: Record<string, unknown>;
    try { refundJson = JSON.parse(refundText); } catch { refundJson = {}; }

    if (!refundRes.ok) {
      console.error('[airwallex-refund] Refund failed:', refundRes.status, refundText.slice(0, 300));
      return res.status(502).json({
        error: `退款失敗: ${(refundJson as any).message || refundRes.status}`,
        code: 'REFUND_FAILED',
        details: refundText.slice(0, 300),
      });
    }

    const isFullRefund = Math.abs(amount - order.total) < 0.01;
    const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    await fetchWithTimeout(`${supabaseUrl}/rest/v1/orders?id=eq.${dbId}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json', Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: newStatus }),
    }, 5000);

    console.log(`[airwallex-refund] Order ${orderId} refunded $${amount} → ${newStatus}`);

    return res.status(200).json({
      success: true,
      orderId,
      refundAmount: amount,
      newStatus,
      refundId: (refundJson as any).id ?? null,
    });
  } catch (e) {
    console.error('[airwallex-refund] Error:', e);
    return res.status(500).json({
      error: '退款處理失敗，請稍後重試',
      code: 'REFUND_ERROR',
      details: e instanceof Error ? e.message : String(e),
    });
  }
}

// ─── Router ─────────────────────────────────────────────────────────

export default async function handler(
  req: { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = req.body?.action;
  if (action === 'create-intent') return handleCreateIntent(req, res);
  if (action === 'refund') return handleRefund(req, res);
  return res.status(400).json({ error: 'Invalid action. Use: create-intent, refund' });
}
