/**
 * Shared Stripe Checkout → Supabase fulfillment (mark paid + post-payment side effects).
 * Used by POST /api/confirm-payment and POST /api/webhooks/stripe (checkout.session.completed).
 */
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

export function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

const safeTrim = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function fetchWithTimeout(url: string, opts: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

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

export type FulfillCheckoutPaidResult =
  | { ok: true; alreadyPaid: boolean; orderId: string }
  | { ok: false; statusCode: number; code: string; message?: string };

/**
 * Idempotently mark the order paid from a verified Stripe Checkout Session (payment_status === 'paid')
 * and run post-payment side effects only on the first transition from pending_payment → paid.
 */
export async function fulfillCheckoutSessionPaid(params: {
  session: Stripe.Checkout.Session;
  supabaseAdmin: SupabaseClient;
  logPrefix: string;
}): Promise<FulfillCheckoutPaidResult> {
  const { session, supabaseAdmin, logPrefix } = params;
  const sessionId = session.id;

  if (session.payment_status !== 'paid') {
    return {
      ok: false,
      statusCode: 400,
      code: 'PAYMENT_NOT_SUCCEEDED',
      message: `payment_status=${session.payment_status}`,
    };
  }

  let orderId = safeTrim(session.metadata?.merchant_order_id ?? '');
  if (!orderId) {
    console.error(`${logPrefix} Missing merchant_order_id in session metadata`, sessionId);
    return { ok: false, statusCode: 400, code: 'MISSING_MERCHANT_ORDER_ID' };
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent as { id?: string } | null)?.id ?? null;

  const dbId = getOrderDbId(orderId);
  const dbIdValue = typeof dbId === 'string' && /^\d+$/.test(dbId) ? Number(dbId) : dbId;

  let orderRow: { id?: string | number; status?: string } | null = null;
  const { data: d1 } = await supabaseAdmin.from('orders').select('id,status').eq('id', dbIdValue).maybeSingle();
  orderRow = d1 ?? null;

  if (!orderRow && typeof orderId === 'string' && orderId.startsWith('ORD-')) {
    const { data: d2 } = await supabaseAdmin.from('orders').select('id,status').eq('id', orderId).maybeSingle();
    orderRow = d2 ?? null;
  }

  if (!orderRow) {
    console.error(`${logPrefix} Order not found`, orderId, sessionId);
    return { ok: false, statusCode: 404, code: 'ORDER_NOT_FOUND' };
  }

  if (orderRow.status === 'paid') {
    console.log(`${logPrefix} Order`, orderRow.id, 'already paid — skipping');
    return { ok: true, alreadyPaid: true, orderId };
  }

  const updateId = orderRow.id ?? dbIdValue;
  const blockedStatuses = new Set(['cancelled', 'refunded']);
  if (blockedStatuses.has(String(orderRow.status || '').trim().toLowerCase())) {
    return {
      ok: false,
      statusCode: 409,
      code: 'ORDER_STATUS_CONFLICT',
      message: `status=${orderRow.status}`,
    };
  }

  const updatePayload: Record<string, unknown> = { status: 'paid' };
  if (paymentIntentId) updatePayload.payment_intent_id = paymentIntentId;
  const { data: updatedRows, error: updateError } = await supabaseAdmin
    .from('orders')
    .update(updatePayload)
    .eq('id', updateId)
    .eq('status', 'pending_payment')
    .select('id,status')
    .limit(1);

  if (updateError) {
    console.error(`${logPrefix} CRITICAL update failed:`, updateError.message);
    return { ok: false, statusCode: 502, code: 'UPDATE_FAILED', message: updateError.message };
  }

  if (!updatedRows || updatedRows.length === 0) {
    const { data: latestOrder, error: latestErr } = await supabaseAdmin
      .from('orders')
      .select('id,status')
      .eq('id', updateId)
      .maybeSingle();
    if (latestErr) {
      console.error(`${logPrefix} status recheck failed:`, latestErr.message);
      return { ok: false, statusCode: 502, code: 'STATUS_RECHECK_FAILED' };
    }
    if (latestOrder?.status === 'paid') {
      console.log(`${logPrefix} Order`, latestOrder.id, 'already paid after recheck');
      return { ok: true, alreadyPaid: true, orderId };
    }
    console.error(`${logPrefix} No rows updated; current status:`, latestOrder?.status);
    return {
      ok: false,
      statusCode: 409,
      code: 'ORDER_NOT_UPDATED',
      message: `status=${latestOrder?.status ?? 'unknown'}`,
    };
  }

  console.log(`${logPrefix} Order`, updateId, 'marked as PAID');

  // ─── Post-payment side effects (only on first paid transition) ───
  (async () => {
    try {
      const { data: orderData } = await supabaseAdmin.from('orders').select('*').eq('id', updateId).maybeSingle();

      if (orderData?.order_type === 'retail' && orderData?.payment_method === 'card' && orderData?.member_id) {
        try {
          const lineItemsFingerprint = JSON.stringify(orderData.line_items ?? []);
          const { data: siblingPending } = await supabaseAdmin
            .from('orders')
            .select('id,total,status,order_date,line_items')
            .eq('member_id', orderData.member_id)
            .eq('order_type', 'retail')
            .eq('payment_method', 'card')
            .eq('status', 'pending_payment')
            .eq('order_date', orderData.order_date)
            .order('id', { ascending: false })
            .limit(20);

          const toFailIds = (Array.isArray(siblingPending) ? siblingPending : [])
            .filter((row: any) => String(row.id) !== String(updateId))
            .filter((row: any) => Math.abs(Number(row.total || 0) - Number(orderData.total || 0)) < 0.01)
            .filter((row: any) => JSON.stringify(row.line_items ?? []) === lineItemsFingerprint)
            .map((row: any) => row.id);

          if (toFailIds.length > 0) {
            await supabaseAdmin.from('orders').update({ status: 'payment_failed' }).in('id', toFailIds);
            console.log(`${logPrefix} Marked duplicate pending orders as payment_failed:`, toFailIds.length);
          }
        } catch (dupErr) {
          console.warn(`${logPrefix} Duplicate pending cleanup failed (non-blocking):`, dupErr instanceof Error ? dupErr.message : dupErr);
        }
      }

      if (orderData?.order_type === 'retail' && Array.isArray(orderData.line_items)) {
        for (const li of orderData.line_items as Array<{ product_id?: string; qty?: number }>) {
          if (li.product_id && li.qty && li.qty > 0) {
            const { error: stockErr } = await supabaseAdmin.rpc('decrement_stock', { p_id: li.product_id, p_qty: li.qty });
            if (stockErr) console.warn(`${logPrefix} stock decrement failed for ${li.product_id}:`, stockErr.message);
          }
        }
        console.log(`${logPrefix} Stock decremented for`, orderData.line_items.length, 'line items');
      }

      if (orderData?.order_type === 'retail' && orderData.member_id && orderData.subtotal > 0) {
        try {
          const { data: ptsCfg } = await supabaseAdmin.from('site_config').select('value').eq('id', 'points_config').maybeSingle();
          const dollarsPerPoint = ptsCfg?.value?.dollarsPerPoint || 10;
          const pointsEarned = Math.floor(orderData.subtotal / dollarsPerPoint);

          if (pointsEarned > 0) {
            const { data: memberData } = await supabaseAdmin.from('members').select('points').eq('id', orderData.member_id).maybeSingle();
            const currentPoints = memberData?.points || 0;
            await supabaseAdmin.from('members').update({ points: currentPoints + pointsEarned }).eq('id', orderData.member_id);
            await supabaseAdmin.from('orders').update({ points_earned: pointsEarned }).eq('id', updateId);
            console.log(`${logPrefix} Awarded ${pointsEarned} points to member ${orderData.member_id}`);
          }
        } catch (ptsErr) {
          console.warn(`${logPrefix} Points accrual failed (non-blocking):`, ptsErr instanceof Error ? ptsErr.message : ptsErr);
        }
      }

      if (orderData?.coupon_id && orderData.member_id) {
        try {
          const usedAt = new Date().toISOString();
          if (orderData.member_coupon_id) {
            await supabaseAdmin
              .from('member_coupons')
              .update({ status: 'used', used_at: usedAt, used_order_id: orderId })
              .eq('id', orderData.member_coupon_id)
              .eq('member_id', orderData.member_id)
              .eq('coupon_id', orderData.coupon_id)
              .eq('status', 'available');
            console.log(`${logPrefix} Member coupon ${orderData.member_coupon_id} marked as used`);
          } else {
            const { data: fallbackMc } = await supabaseAdmin
              .from('member_coupons')
              .select('id')
              .eq('member_id', orderData.member_id)
              .eq('coupon_id', orderData.coupon_id)
              .eq('status', 'available')
              .order('created_at', { ascending: true })
              .limit(1)
              .maybeSingle();
            if (fallbackMc?.id) {
              await supabaseAdmin
                .from('member_coupons')
                .update({ status: 'used', used_at: usedAt, used_order_id: orderId })
                .eq('id', fallbackMc.id);
              console.log(`${logPrefix} Fallback member coupon ${fallbackMc.id} marked as used`);
            } else {
              console.warn(`${logPrefix} No available member coupon found for coupon ${orderData.coupon_id}`);
            }
          }
        } catch (cpnErr) {
          console.warn(`${logPrefix} Coupon marking failed (non-blocking):`, cpnErr instanceof Error ? cpnErr.message : cpnErr);
        }
      }
    } catch (e) {
      console.warn(`${logPrefix} Post-payment processing error (non-blocking):`, e instanceof Error ? e.message : e);
    }
  })();

  console.log(`${logPrefix} SF auto-call disabled; waiting for admin batch booking`);

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
        const { data: cfg } = await supabaseAdmin.from('site_config').select('value').eq('id', 'site_branding').maybeSingle();
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

      await supabaseAdmin
        .from('notification_logs')
        .insert({
          order_id: oid,
          phone_number: fullOrder.customer_phone,
          status_type: 'paid',
          content: message,
          provider: 'ULTRAMSG',
          delivery_status: waResult.success ? 'SENT' : 'FAILED',
          created_at: new Date().toISOString(),
        })
        .then(({ error: e }) => {
          if (e) console.warn(`${logPrefix} log write failed:`, e.message);
        });

      console.log(`${logPrefix} WhatsApp ${waResult.success ? 'sent' : 'failed'}`);
    } catch (e) {
      console.warn(`${logPrefix} WhatsApp background error:`, e instanceof Error ? e.message : e);
    }
  })();

  return { ok: true, alreadyPaid: false, orderId };
}
