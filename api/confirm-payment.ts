/**
 * 確認支付：使用 Stripe + Supabase Admin SDK 更新狀態
 * 設計原則：訂單狀態更新 (paid) 是最高優先級，任何下游操作（WhatsApp 通知等）
 *           失敗都不會阻擋用戶看到「支付成功」。
 *
 * WhatsApp 邏輯直接內嵌於本檔案，避免 Vercel serverless 跨檔案 import 錯誤
 * (ERR_MODULE_NOT_FOUND: /var/task/api/send-whatsapp)。
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

type ConfirmPayload = { orderId?: string | null; session_id?: string | null; origin?: string | null };

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

function getStripe(): Stripe {
  const secretKey = safeTrim(process.env.STRIPE_SECRET_KEY ?? '');
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey);
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

// ─── Handler ─────────────────────────────────────────────────────────
export default async function handler(
  req: { method?: string; body?: ConfirmPayload; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`confirm-payment:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
  }

  const body = req.body as ConfirmPayload;
  const sessionId = safeTrim(body?.session_id ?? '');
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

  // ─── Step 1: Stripe verification ────────────────────────────────
  let stripeVerified = false;
  let stripeError: string | null = null;
  let paymentIntentId: string | null = null;

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        stripeVerified = true;
        paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent as any)?.id ?? null;
        if (session.metadata?.merchant_order_id) {
          orderId = session.metadata.merchant_order_id.trim();
        }
      } else {
        return res.status(400).json({
          error: '支付尚未成功',
          code: 'PAYMENT_NOT_SUCCEEDED',
          status: session.payment_status,
        });
      }
    } catch (e) {
      stripeError = e instanceof Error ? e.message : String(e);
      console.warn('[confirm-payment] Stripe error (non-fatal):', stripeError);
    }
  } else {
    return res.status(400).json({ error: 'Missing session_id', code: 'BAD_REQUEST' });
  }

  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId or session_id', code: 'BAD_REQUEST' });
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

    if (!stripeVerified) {
      console.error('[confirm-payment] Stripe verification failed:', stripeError);
      return res.status(400).json({ error: '支付驗證失敗，請聯繫客服', code: 'VERIFICATION_FAILED' });
    }

    if (orderRow.status === 'paid') {
      console.log('[confirm-payment] Order', orderRow.id, 'already paid — skipping');
      return res.status(200).json({ success: true, alreadyPaid: true });
    }

    const updateId = orderRow.id ?? dbIdValue;
    const blockedStatuses = new Set(['cancelled', 'refunded']);
    if (blockedStatuses.has(String(orderRow.status || '').trim().toLowerCase())) {
      return res.status(409).json({
        error: `訂單目前狀態為「${orderRow.status}」，無法標記為已付款`,
        code: 'ORDER_STATUS_CONFLICT',
      });
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
      console.error('[confirm-payment] CRITICAL update failed:', updateError.message);
      return res.status(502).json({ error: '更新訂單狀態失敗，請聯繫客服', code: 'UPDATE_FAILED' });
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { data: latestOrder, error: latestErr } = await supabaseAdmin
        .from('orders')
        .select('id,status')
        .eq('id', updateId)
        .maybeSingle();
      if (latestErr) {
        console.error('[confirm-payment] status recheck failed:', latestErr.message);
        return res.status(502).json({ error: '付款狀態確認失敗，請聯繫客服', code: 'STATUS_RECHECK_FAILED' });
      }
      if (latestOrder?.status === 'paid') {
        console.log('[confirm-payment] Order', latestOrder.id, 'already paid after recheck');
        return res.status(200).json({ success: true, alreadyPaid: true, orderId });
      }
      console.error('[confirm-payment] No rows updated; current status:', latestOrder?.status);
      return res.status(409).json({
        error: `付款已記錄，但訂單狀態仍為「${latestOrder?.status ?? 'unknown'}」`,
        code: 'ORDER_NOT_UPDATED',
      });
    }

    console.log('[confirm-payment] Order', updateId, 'marked as PAID');

    // ─── Step 2b: Stock decrement + points accrual + coupon marking ──
    (async () => {
      try {
        const { data: orderData } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', updateId)
          .maybeSingle();

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
              await supabaseAdmin
                .from('orders')
                .update({ status: 'payment_failed' })
                .in('id', toFailIds);
              console.log('[confirm-payment] Marked duplicate pending orders as payment_failed:', toFailIds.length);
            }
          } catch (dupErr) {
            console.warn('[confirm-payment] Duplicate pending cleanup failed (non-blocking):', dupErr instanceof Error ? dupErr.message : dupErr);
          }
        }

        if (orderData?.order_type === 'retail' && Array.isArray(orderData.line_items)) {
          for (const li of orderData.line_items as Array<{ product_id?: string; qty?: number }>) {
            if (li.product_id && li.qty && li.qty > 0) {
              const { error: stockErr } = await supabaseAdmin.rpc('decrement_stock', { p_id: li.product_id, p_qty: li.qty });
              if (stockErr) console.warn(`[confirm-payment] stock decrement failed for ${li.product_id}:`, stockErr.message);
            }
          }
          console.log('[confirm-payment] Stock decremented for', orderData.line_items.length, 'line items');
        }

        if (orderData?.order_type === 'retail' && orderData.member_id && orderData.subtotal > 0) {
          try {
            const { data: ptsCfg } = await supabaseAdmin
              .from('site_config').select('value').eq('id', 'points_config').maybeSingle();
            const dollarsPerPoint = ptsCfg?.value?.dollarsPerPoint || 10;
            const pointsEarned = Math.floor(orderData.subtotal / dollarsPerPoint);

            if (pointsEarned > 0) {
              const { data: memberData } = await supabaseAdmin
                .from('members').select('points').eq('id', orderData.member_id).maybeSingle();
              const currentPoints = memberData?.points || 0;
              await supabaseAdmin.from('members')
                .update({ points: currentPoints + pointsEarned })
                .eq('id', orderData.member_id);
              await supabaseAdmin.from('orders')
                .update({ points_earned: pointsEarned })
                .eq('id', updateId);
              console.log(`[confirm-payment] Awarded ${pointsEarned} points to member ${orderData.member_id}`);
            }
          } catch (ptsErr) {
            console.warn('[confirm-payment] Points accrual failed (non-blocking):', ptsErr instanceof Error ? ptsErr.message : ptsErr);
          }
        }

        if (orderData?.coupon_id && orderData.member_id) {
          try {
            const usedAt = new Date().toISOString();
            if (orderData.member_coupon_id) {
              await supabaseAdmin.from('member_coupons')
                .update({ status: 'used', used_at: usedAt, used_order_id: orderId })
                .eq('id', orderData.member_coupon_id)
                .eq('member_id', orderData.member_id)
                .eq('coupon_id', orderData.coupon_id)
                .eq('status', 'available');
              console.log(`[confirm-payment] Member coupon ${orderData.member_coupon_id} marked as used`);
            } else {
              // Backward compatibility for older pending orders created before member_coupon_id existed.
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
                await supabaseAdmin.from('member_coupons')
                  .update({ status: 'used', used_at: usedAt, used_order_id: orderId })
                  .eq('id', fallbackMc.id);
                console.log(`[confirm-payment] Fallback member coupon ${fallbackMc.id} marked as used`);
              } else {
                console.warn(`[confirm-payment] No available member coupon found for coupon ${orderData.coupon_id}`);
              }
            }
          } catch (cpnErr) {
            console.warn('[confirm-payment] Coupon marking failed (non-blocking):', cpnErr instanceof Error ? cpnErr.message : cpnErr);
          }
        }
      } catch (e) {
        console.warn('[confirm-payment] Post-payment processing error (non-blocking):', e instanceof Error ? e.message : e);
      }
    })();

    // ─── Step 3: SF is manual-only (admin batch operation) ────────────
    // Professional fulfillment flow:
    // - Payment confirmation only marks order as paid.
    // - SF order creation + label printing are triggered manually in admin.
    console.log('[confirm-payment] SF auto-call disabled; waiting for admin batch booking');

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
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[confirm-payment] Unexpected:', errMsg);

    if (stripeVerified && orderId) {
      try {
        const dbId = getOrderDbId(orderId);
        const numId = /^\d+$/.test(String(dbId)) ? Number(dbId) : dbId;
        const { data: latest } = await supabaseAdmin
          .from('orders')
          .select('id,status')
          .eq('id', numId)
          .maybeSingle();
        if (latest?.status === 'paid') {
          return res.status(200).json({
            success: true, orderId, confirmed: true,
            warning: '支付已確認（部分流程有延遲，不影響訂單）',
          });
        }
      } catch {
        // fall through to PARTIAL_FAILURE response
      }
    }

    return res.status(500).json({
      error: '支付處理遇到問題，但你的付款已記錄。如有疑問請聯繫客服。',
      code: 'PARTIAL_FAILURE',
    });
  }
}
