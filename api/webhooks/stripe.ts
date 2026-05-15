/**
 * Stripe Webhook — POST /api/webhooks/stripe
 *
 * Handles checkout.session.completed so orders are marked paid even if the
 * customer never loads /success (browser closed). Uses raw Request body for
 * signature verification (Vercel Web Standard handler).
 *
 * Configure in Stripe Dashboard → Developers → Webhooks (see docs/STRIPE_WEBHOOK_SETUP.md).
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { fulfillCheckoutSessionPaid } from '../_stripeCheckoutFulfilled.js';

const safeTrim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function getStripe(): Stripe {
  const secretKey = safeTrim(process.env.STRIPE_SECRET_KEY ?? '');
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(secretKey);
}

export async function POST(request: Request): Promise<Response> {
  const signingSecret = safeTrim(process.env.STRIPE_WEBHOOK_SECRET ?? '');
  if (!signingSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, signingSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe-webhook] Signature verification failed:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true, ignored: true, type: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.mode !== 'payment') {
    return Response.json({ received: true, ignored: true, reason: 'not_payment_mode' });
  }

  if (session.payment_status !== 'paid') {
    console.log('[stripe-webhook] Session not paid, skipping:', session.id, session.payment_status);
    return Response.json({ received: true, skipped: true, payment_status: session.payment_status });
  }

  const supabaseUrl = safeTrim(process.env.SUPABASE_URL ?? '').replace(/\/$/, '');
  const serviceRoleKey = safeTrim(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[stripe-webhook] Supabase config missing');
    return Response.json({ error: 'Server config missing' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const result = await fulfillCheckoutSessionPaid({
      session,
      supabaseAdmin,
      logPrefix: '[stripe-webhook]',
    });

    if (result.ok === false) {
      const { statusCode, code, message } = result;
      console.warn('[stripe-webhook] Fulfillment issue:', code, message);
      if (statusCode >= 500) {
        return Response.json({ error: code, message }, { status: 500 });
      }
      return Response.json({ received: true, ok: false, code, message }, { status: 200 });
    }

    return Response.json({
      received: true,
      ok: true,
      orderId: result.orderId,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (e) {
    console.error('[stripe-webhook] Unexpected:', e instanceof Error ? e.message : e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
