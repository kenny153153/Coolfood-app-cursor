/**
 * Stripe Payment API — POST /api/stripe
 * Body: { action: 'create-checkout-session' | 'refund', ... }
 *
 * Replaces the previous Airwallex integration.
 * Stripe Checkout Sessions handle the hosted payment page (credit card only, HKD).
 * Refunds use the stored payment_intent_id from confirmed orders.
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from './_adminAuth.js';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

function getStripe(): Stripe {
  const secretKey = safeTrim(process.env.STRIPE_SECRET_KEY ?? '');
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey);
}

// ─── create-checkout-session ────────────────────────────────────

async function handleCreateCheckoutSession(req: any, res: any) {
  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`create-checkout:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
  }

  const secretKey = safeTrim(process.env.STRIPE_SECRET_KEY ?? '');
  if (!secretKey) {
    return res.status(500).json({
      error: 'Stripe secret key not configured. Set STRIPE_SECRET_KEY in Vercel environment variables.',
      code: 'CREDENTIALS_MISSING',
    });
  }

  const body = req.body as { merchant_order_id?: string; success_origin?: string };
  const merchantOrderId = typeof body?.merchant_order_id === 'string' ? body.merchant_order_id : undefined;
  const successOrigin = typeof body?.success_origin === 'string' && body.success_origin
    ? body.success_origin
    : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://coolfood-app-cursor.vercel.app');

  if (!merchantOrderId) {
    return res.status(400).json({ error: 'Invalid merchant_order_id', code: 'BAD_REQUEST' });
  }

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  let amount: number | undefined;
  let orderName = `Order ${merchantOrderId}`;

  if (supabaseUrl && serviceRoleKey) {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const dbId = getOrderDbId(merchantOrderId);
    const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

    const { data: order } = await supabaseAdmin
      .from('orders').select('id,total,customer_name').eq('id', dbIdValue).maybeSingle();

    if (!order) {
      const { data: order2 } = await supabaseAdmin
        .from('orders').select('id,total,customer_name').eq('id', merchantOrderId).maybeSingle();
      if (order2) {
        amount = Number(order2.total);
        if (order2.customer_name) orderName = `${order2.customer_name} - ${merchantOrderId}`;
      }
    } else {
      amount = Number(order.total);
      if (order.customer_name) orderName = `${order.customer_name} - ${merchantOrderId}`;
    }
  }

  if (amount == null || amount <= 0) {
    return res.status(400).json({
      error: 'Order not found or invalid amount. Place the order first, then create the checkout session.',
      code: 'ORDER_NOT_FOUND',
    });
  }

  try {
    const stripe = getStripe();
    const cleanOrigin = successOrigin.replace(/\/$/, '');
    const successUrl = `${cleanOrigin}/success?order=${encodeURIComponent(merchantOrderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${cleanOrigin}/`;

    console.log('[Stripe] Creating Checkout Session | order:', merchantOrderId, '| amount:', amount, '| successUrl:', successUrl);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'hkd',
          product_data: { name: orderName },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { merchant_order_id: merchantOrderId },
    });

    console.log('[Stripe] Checkout Session created:', session.id);
    return res.status(200).json({ session_id: session.id, url: session.url });
  } catch (e: any) {
    console.error('[Stripe] Create session error:', e);
    const errMsg = e instanceof Error ? e.message : 'Payment system error. Check Vercel function logs.';
    return res.status(502).json({ error: errMsg, code: 'STRIPE_ERROR' });
  }
}

// ─── refund ─────────────────────────────────────────────────────

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

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const supabaseKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
  }

  try {
    const stripe = getStripe();
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const dbId = getOrderDbId(orderId);
    const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

    const { data: order } = await supabaseAdmin
      .from('orders').select('id,total,status,payment_intent_id').eq('id', dbIdValue).maybeSingle();

    if (!order) {
      return res.status(404).json({ error: '訂單不存在', code: 'ORDER_NOT_FOUND' });
    }

    const refundableStatuses = ['paid', 'preparing', 'shipping', 'shipped', 'delivered'];
    if (!refundableStatuses.includes(order.status)) {
      return res.status(400).json({
        error: `訂單狀態為「${order.status}」，無法退款。僅已付款訂單可退款。`,
        code: 'NOT_REFUNDABLE',
      });
    }

    const paymentIntentId = order.payment_intent_id;
    if (!paymentIntentId) {
      return res.status(400).json({
        error: '此訂單沒有關聯的 Payment Intent ID，無法退款。可能是舊訂單或未通過線上支付。',
        code: 'NO_PAYMENT_INTENT',
      });
    }

    if (amount > order.total) {
      return res.status(400).json({ error: '退款金額不能超過訂單總額', code: 'AMOUNT_EXCEEDS_TOTAL' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer',
      metadata: { admin_reason: reason, order_id: orderId },
    });

    const isFullRefund = Math.abs(amount - order.total) < 0.01;
    const newStatus = isFullRefund ? 'refunded' : 'partially_refunded';

    await supabaseAdmin.from('orders').update({ status: newStatus }).eq('id', dbIdValue);

    console.log(`[Stripe] Order ${orderId} refunded $${amount} → ${newStatus}, refund: ${refund.id}`);

    return res.status(200).json({
      success: true,
      orderId,
      refundAmount: amount,
      newStatus,
      refundId: refund.id,
    });
  } catch (e: any) {
    console.error('[Stripe] Refund error:', e);
    return res.status(500).json({
      error: '退款處理失敗，請稍後重試',
      code: 'REFUND_ERROR',
    });
  }
}

// ─── Router ─────────────────────────────────────────────────────

export default async function handler(
  req: { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = req.body?.action;
  if (action === 'create-checkout-session') return handleCreateCheckoutSession(req, res);
  if (action === 'refund') return handleRefund(req, res);
  return res.status(400).json({ error: 'Invalid action. Use: create-checkout-session, refund' });
}
