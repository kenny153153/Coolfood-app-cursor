/**
 * 確認支付：使用 Stripe + Supabase Admin SDK 更新狀態
 * 設計原則：訂單狀態更新 (paid) 是最高優先級，任何下游操作（WhatsApp 通知等）
 *           失敗都不會阻擋用戶看到「支付成功」。
 *
 * 與 `api/_stripeCheckoutFulfilled.ts` 共用核心邏輯；Stripe Webhook 亦會呼叫同一套 fulfillment。
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from './_rateLimit.js';
import { fulfillCheckoutSessionPaid, getOrderDbId } from './_stripeCheckoutFulfilled.js';

type ConfirmPayload = { orderId?: string | null; session_id?: string | null; origin?: string | null };

const safeTrim = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function getStripe(): Stripe {
  const secretKey = safeTrim(process.env.STRIPE_SECRET_KEY ?? '');
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey);
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

  let stripeVerified = false;
  let stripeError: string | null = null;
  let session: Stripe.Checkout.Session | null = null;

  if (sessionId) {
    try {
      const stripe = getStripe();
      session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        stripeVerified = true;
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

  if (!stripeVerified || !session) {
    console.error('[confirm-payment] Stripe verification failed:', stripeError);
    return res.status(400).json({ error: '支付驗證失敗，請聯繫客服', code: 'VERIFICATION_FAILED' });
  }

  try {
    const result = await fulfillCheckoutSessionPaid({
      session,
      supabaseAdmin,
      logPrefix: '[confirm-payment]',
    });

    if (result.ok === false) {
      const { statusCode, code, message } = result;
      if (statusCode === 404) return res.status(404).json({ error: 'Order not found', code });
      if (statusCode === 409) {
        return res.status(409).json({
          error: message || code,
          code,
        });
      }
      if (statusCode === 400) {
        return res.status(400).json({ error: message || code, code });
      }
      return res.status(statusCode).json({ error: message || 'Server error', code });
    }

    if (result.alreadyPaid) {
      return res.status(200).json({ success: true, alreadyPaid: true });
    }

    return res.status(200).json({
      success: true,
      orderId: result.orderId,
      confirmed: true,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[confirm-payment] Unexpected:', errMsg);

    if (orderId) {
      try {
        const dbId = getOrderDbId(orderId);
        const numId = /^\d+$/.test(String(dbId)) ? Number(dbId) : dbId;
        const { data: latest } = await supabaseAdmin.from('orders').select('id,status').eq('id', numId).maybeSingle();
        if (latest?.status === 'paid') {
          return res.status(200).json({
            success: true, orderId, confirmed: true,
            warning: '支付已確認（部分流程有延遲，不影響訂單）',
          });
        }
      } catch {
        // fall through
      }
    }

    return res.status(500).json({
      error: '支付處理遇到問題，但你的付款已記錄。如有疑問請聯繫客服。',
      code: 'PARTIAL_FAILURE',
    });
  }
}
