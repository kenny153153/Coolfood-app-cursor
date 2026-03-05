/**
 * Airwallex 退款 API
 * 支援全額退款 (Full Refund) 和部分退款 (Partial Refund)
 *
 * POST /api/airwallex-refund
 * Body: { orderId, amount, reason? }
 *   - amount: 退款金額（部分退款時由管理員輸入，全額退款時等於訂單 total）
 *   - reason: 退款原因（可選）
 */

const AIRWALLEX_DEMO = 'https://api-demo.airwallex.com';
const AIRWALLEX_PROD = 'https://api.airwallex.com';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function fetchWithTimeout(url: string, opts: RequestInit, ms = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

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

type RefundPayload = {
  orderId: string;
  amount: number;
  reason?: string;
};

export default async function handler(
  req: { method?: string; body?: RefundPayload },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as RefundPayload;
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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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
