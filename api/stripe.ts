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

function getOrderDisplayId(orderId: string | number): string {
  const asString = String(orderId);
  return /^\d+$/.test(asString) ? `ORD-${asString}` : asString;
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
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server config missing', code: 'CONFIG_MISSING' });
  }

  const round2 = (n: number): number => Math.round(n * 100) / 100;
  const toNum = (v: unknown, fallback = 0): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const shippingFallbacks: Record<'sf_delivery' | 'sf_locker', { fee: number; threshold: number }> = {
    sf_delivery: { fee: 50, threshold: 300 },
    sf_locker: { fee: 30, threshold: 200 },
  };

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const dbId = getOrderDbId(merchantOrderId);
  const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

  const { data: orderById } = await supabaseAdmin.from('orders').select('*').eq('id', dbIdValue).maybeSingle();
  const order = orderById || (await supabaseAdmin.from('orders').select('*').eq('id', merchantOrderId).maybeSingle()).data;
  if (!order) {
    return res.status(400).json({
      error: 'Order not found or invalid amount. Place the order first, then create the checkout session.',
      code: 'ORDER_NOT_FOUND',
    });
  }
  if (order.status && order.status !== 'pending_payment') {
    return res.status(400).json({ error: 'Order is not pending payment', code: 'ORDER_NOT_PENDING_PAYMENT' });
  }

  let orderName = `Order ${merchantOrderId}`;
  if (order.customer_name) orderName = `${order.customer_name} - ${merchantOrderId}`;

  // ── Server-side price revalidation (防改包) ──────────────────────
  let subtotal = 0;
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
  for (const item of lineItems as Array<{ qty?: number; unit_price?: number; line_total?: number }>) {
    const qty = toNum(item.qty, 0);
    const unitPrice = toNum(item.unit_price, 0);
    const lineTotal = toNum(item.line_total, NaN);
    subtotal += Number.isFinite(lineTotal) ? lineTotal : qty * unitPrice;
  }
  subtotal = round2(subtotal);

  let couponDiscount = 0;
  let deliveryFee = toNum(order.delivery_fee, 0);
  const memberId = safeTrim(order.member_id ?? '');
  const couponId = safeTrim(order.coupon_id ?? '');
  let memberCouponId = safeTrim(order.member_coupon_id ?? '');

  let couponType = '';
  let couponMinSpend = 0;
  if (couponId || memberCouponId || toNum(order.coupon_discount, 0) > 0) {
    if (!memberId || !couponId) {
      return res.status(400).json({
        error: 'Coupon binding is invalid. Please re-select coupon at checkout.',
        code: 'INVALID_COUPON_BINDING',
      });
    }

    if (!memberCouponId) {
      const { data: fallbackMc } = await supabaseAdmin
        .from('member_coupons')
        .select('id, expires_at')
        .eq('member_id', memberId)
        .eq('coupon_id', couponId)
        .eq('status', 'available')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!fallbackMc?.id) {
        return res.status(400).json({ error: 'Coupon is no longer available.', code: 'COUPON_NOT_AVAILABLE' });
      }
      if (fallbackMc.expires_at && new Date(fallbackMc.expires_at).getTime() < Date.now()) {
        return res.status(400).json({ error: 'Coupon expired. Please re-select coupon.', code: 'COUPON_EXPIRED' });
      }
      memberCouponId = fallbackMc.id;
      await supabaseAdmin.from('orders').update({ member_coupon_id: memberCouponId }).eq('id', order.id);
    }

    const { data: mc } = await supabaseAdmin
      .from('member_coupons')
      .select('id, member_id, coupon_id, status, expires_at, coupons(*)')
      .eq('id', memberCouponId)
      .maybeSingle();
    const coupon = mc?.coupons as any;
    if (!mc || !coupon) {
      return res.status(400).json({ error: 'Coupon not found. Please re-select coupon.', code: 'COUPON_NOT_FOUND' });
    }
    if (mc.member_id !== memberId || mc.coupon_id !== couponId || mc.status !== 'available') {
      return res.status(400).json({ error: 'Coupon is no longer available.', code: 'COUPON_NOT_AVAILABLE' });
    }
    if (mc.expires_at && new Date(mc.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Coupon expired. Please re-select coupon.', code: 'COUPON_EXPIRED' });
    }
    if (!coupon.is_active) {
      return res.status(400).json({ error: 'Coupon is inactive.', code: 'COUPON_INACTIVE' });
    }
    if (subtotal < toNum(coupon.min_spend, 0)) {
      return res.status(400).json({ error: 'Coupon minimum spend not met.', code: 'COUPON_MIN_SPEND_NOT_MET' });
    }

    couponType = safeTrim(coupon.coupon_type);
    couponMinSpend = toNum(coupon.min_spend, 0);
    if (couponType === 'fixed_amount') {
      couponDiscount = Math.min(toNum(coupon.discount_value, 0), subtotal);
    } else if (couponType === 'percentage') {
      couponDiscount = round2(subtotal * toNum(coupon.discount_value, 0) / 100);
    } else {
      couponDiscount = 0;
    }
    couponDiscount = round2(Math.max(0, couponDiscount));

  }

  // Shipping threshold is always evaluated on post-coupon subtotal.
  const postCouponSubtotal = round2(subtotal - couponDiscount);
  if (order.order_type !== 'wholesale') {
    const cfgId = order.delivery_method === 'home' ? 'sf_delivery' : (order.delivery_method === 'sf_locker' ? 'sf_locker' : null);
    if (cfgId) {
      const { data: shippingRow } = await supabaseAdmin
        .from('shipping_configs')
        .select('id, fee, threshold')
        .eq('id', cfgId)
        .maybeSingle();
      const fallback = shippingFallbacks[cfgId];
      const threshold = toNum(shippingRow?.threshold, fallback.threshold);
      const fee = toNum(shippingRow?.fee, fallback.fee);
      deliveryFee = postCouponSubtotal >= threshold ? 0 : fee;
    }
    if (couponType === 'free_delivery' && subtotal >= couponMinSpend) {
      deliveryFee = 0;
    }
  }

  const expectedTotal = round2(Math.max(0, subtotal - couponDiscount) + Math.max(0, deliveryFee));
  if (expectedTotal <= 0) {
    return res.status(400).json({ error: 'Invalid computed order total.', code: 'INVALID_TOTAL' });
  }

  const storedTotal = toNum(order.total, expectedTotal);
  const storedSubtotal = toNum(order.subtotal, subtotal);
  const storedCouponDiscount = toNum(order.coupon_discount, 0);
  const storedDeliveryFee = toNum(order.delivery_fee, deliveryFee);
  if (
    Math.abs(storedTotal - expectedTotal) > 0.01 ||
    Math.abs(storedSubtotal - subtotal) > 0.01 ||
    Math.abs(storedCouponDiscount - couponDiscount) > 0.01 ||
    Math.abs(storedDeliveryFee - deliveryFee) > 0.01
  ) {
    // Keep DB aligned with server-recomputed numbers before charging.
    await supabaseAdmin.from('orders').update({
      subtotal,
      coupon_discount: couponDiscount,
      delivery_fee: deliveryFee,
      total: expectedTotal,
    }).eq('id', order.id);
    console.warn('[Stripe] Order amount corrected by server revalidation', {
      orderId: merchantOrderId,
      storedTotal,
      expectedTotal,
      storedCouponDiscount,
      couponDiscount,
      storedDeliveryFee,
      deliveryFee,
    });
  }

  try {
    const stripe = getStripe();
    const cleanOrigin = successOrigin.replace(/\/$/, '');
    const successUrl = `${cleanOrigin}/success?order=${encodeURIComponent(merchantOrderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${cleanOrigin}/`;

    console.log('[Stripe] Creating Checkout Session | order:', merchantOrderId, '| amount:', expectedTotal, '| successUrl:', successUrl);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'hkd',
          product_data: { name: orderName },
          unit_amount: Math.round(expectedTotal * 100),
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
      .from('orders')
      .select('id,total,status,payment_intent_id,member_id,coupon_id,member_coupon_id,points_earned')
      .eq('id', dbIdValue)
      .maybeSingle();

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

    await supabaseAdmin.from('orders').update({ status: newStatus }).eq('id', order.id);

    const warnings: string[] = [];
    let couponRestored = false;
    let pointsDeducted = 0;

    // Big-brand standard baseline:
    // - Full refund: restore consumed coupon (if any) + claw back earned points.
    // - Partial refund: do not auto-restore coupon.
    if (isFullRefund && order.member_id) {
      const orderAliases = Array.from(new Set([
        safeTrim(orderId),
        getOrderDisplayId(order.id),
        String(order.id),
      ].filter(Boolean)));

      if (order.member_coupon_id || order.coupon_id) {
        try {
          if (order.member_coupon_id) {
            const { data: restored, error: restoreErr } = await supabaseAdmin
              .from('member_coupons')
              .update({ status: 'available', used_at: null, used_order_id: null })
              .eq('id', order.member_coupon_id)
              .eq('member_id', order.member_id)
              .eq('status', 'used')
              .in('used_order_id', orderAliases)
              .select('id');
            if (restoreErr) throw restoreErr;
            couponRestored = Array.isArray(restored) && restored.length > 0;
          }

          // Backward compatibility for older orders without member_coupon_id binding.
          if (!couponRestored && order.coupon_id) {
            const { data: usedCoupon, error: usedCouponErr } = await supabaseAdmin
              .from('member_coupons')
              .select('id')
              .eq('member_id', order.member_id)
              .eq('coupon_id', order.coupon_id)
              .eq('status', 'used')
              .in('used_order_id', orderAliases)
              .order('used_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (usedCouponErr) throw usedCouponErr;
            if (usedCoupon?.id) {
              const { error: fallbackRestoreErr } = await supabaseAdmin
                .from('member_coupons')
                .update({ status: 'available', used_at: null, used_order_id: null })
                .eq('id', usedCoupon.id);
              if (fallbackRestoreErr) throw fallbackRestoreErr;
              couponRestored = true;
            }
          }
        } catch (couponRestoreErr: any) {
          warnings.push(`COUPON_RESTORE_FAILED: ${couponRestoreErr?.message || String(couponRestoreErr)}`);
        }
      }

      const earned = Number(order.points_earned || 0);
      if (earned > 0) {
        try {
          const { data: memberData, error: memberErr } = await supabaseAdmin
            .from('members')
            .select('points')
            .eq('id', order.member_id)
            .maybeSingle();
          if (memberErr) throw memberErr;
          if (memberData) {
            const currentPoints = Number(memberData.points || 0);
            // Allow negative balance to enforce strict clawback and reduce refund abuse.
            const newPoints = currentPoints - earned;
            const { error: deductErr } = await supabaseAdmin
              .from('members')
              .update({ points: newPoints })
              .eq('id', order.member_id);
            if (deductErr) throw deductErr;
            pointsDeducted = earned;
          }
        } catch (pointsErr: any) {
          warnings.push(`POINTS_CLAWBACK_FAILED: ${pointsErr?.message || String(pointsErr)}`);
        }
      }
    }

    console.log(`[Stripe] Order ${orderId} refunded $${amount} → ${newStatus}, refund: ${refund.id}`);

    return res.status(200).json({
      success: true,
      orderId,
      refundAmount: amount,
      newStatus,
      refundId: refund.id,
      couponRestored,
      pointsDeducted,
      warnings: warnings.length > 0 ? warnings : undefined,
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
