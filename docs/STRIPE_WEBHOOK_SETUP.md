# Stripe Webhook Setup (Cool Food)

This app marks retail card orders as **paid** when either:

1. The customer lands on `/success` and the browser calls `POST /api/confirm-payment`, or  
2. Stripe sends **`checkout.session.completed`** to `POST /api/webhooks/stripe` (covers closed browser / dropped success page).

## 1. Webhook URL (Stripe Dashboard)

**Production (recommended):**

`https://coolfood.com.hk/api/webhooks/stripe`

If you use the apex domain only, use that exact origin. If Stripe or DNS also serves `www`, add a **second** webhook endpoint with:

`https://www.coolfood.com.hk/api/webhooks/stripe`

(Each URL has its own signing secret in Stripe.)

**Preview / testing (Vercel):**

`https://coolfood-app-cursor.vercel.app/api/webhooks/stripe`

## 2. Event to send

Subscribe to **exactly one** event (minimum required):

| Event | Purpose |
|-------|--------|
| `checkout.session.completed` | Confirms Checkout Session after payment; handler verifies `payment_status === 'paid'` and fulfills the order idempotently. |

You do **not** need `payment_intent.succeeded` for the current Checkout Session flow if you only use the event above.

## 3. Signing secret → Vercel

1. In Stripe: **Developers → Webhooks** → open your endpoint → **Reveal** under **Signing secret** (`whsec_...`).
2. In Vercel: **Project → Settings → Environment Variables** add:

   - **Name:** `STRIPE_WEBHOOK_SECRET`  
   - **Value:** the `whsec_...` string  
   - **Environment:** Production (and Preview if you use the preview URL webhook)

3. Redeploy so the function picks up the variable.

Also ensure **`STRIPE_SECRET_KEY`** and **`SUPABASE_URL`** / **`SUPABASE_SERVICE_ROLE_KEY`** are set (same as `confirm-payment`).

## 4. Local development

`npm run dev` (Vite) does **not** expose the same raw-body Webhook handler as Vercel’s Web Standard `POST(Request)` runtime. To test webhooks locally, use:

- **`vercel dev`** (uses Vercel’s function runtime), or  
- **Stripe CLI** forwarding to a **deployed** URL, e.g.  
  `stripe listen --forward-to https://coolfood.com.hk/api/webhooks/stripe`

## 5. Stripe Dashboard checklist

- [ ] Webhook URL added for production (`https://coolfood.com.hk/api/webhooks/stripe`).
- [ ] Event **`checkout.session.completed`** selected.
- [ ] `STRIPE_WEBHOOK_SECRET` copied to Vercel and deployment refreshed.
- [ ] Use **live** keys and **live** webhook endpoint for production.
