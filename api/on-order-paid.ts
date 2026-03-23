/**
 * 第三部分：Webhook — 當 Supabase 訂單被更新為「已付款」(paid/success) 時由 Supabase 呼叫
 * 在 Supabase Dashboard → Database → Webhooks 新增：table orders, Events: Update, URL: https://你的網域/api/on-order-paid
 * 
 * Security: Requires WEBHOOK_SECRET header to prevent unauthorized calls.
 * Set the same secret in Supabase webhook config headers.
 */
import { timingSafeEqual } from 'crypto';

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: { id?: string | number; status?: string; tracking_number?: string };
  old_record?: { status?: string };
};

function verifyWebhookSecret(headers: Record<string, string | string[] | undefined>): boolean {
  const secret = (process.env.WEBHOOK_SECRET ?? '').trim();
  if (!secret) {
    console.warn('[on-order-paid] WEBHOOK_SECRET not configured — rejecting all requests');
    return false;
  }
  const provided = typeof headers['x-webhook-secret'] === 'string' ? headers['x-webhook-secret'].trim() : '';
  if (!provided || provided.length !== secret.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
}

export default async function handler(
  req: { method?: string; body?: WebhookPayload; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyWebhookSecret(req.headers ?? {})) {
    return res.status(403).json({ error: 'Invalid webhook secret' });
  }

  const body = req.body as WebhookPayload;
  console.log('[on-order-paid] Webhook received', body?.type, body?.table, 'record.status:', body?.record?.status, 'old_record.status:', body?.old_record?.status);

  if (body?.type !== 'UPDATE' || body?.table !== 'orders' || !body?.record) {
    return res.status(400).json({ error: 'Invalid webhook payload' });
  }

  const newStatus = body.record.status;
  const oldStatus = body.old_record?.status;
  const paidStatuses = ['paid', 'success'];
  if (!paidStatuses.includes(String(newStatus)) || paidStatuses.includes(String(oldStatus))) {
    console.log('[on-order-paid] Skip: status not changed to paid/success');
    return res.status(200).json({ received: true, skipped: true });
  }

  console.log('[on-order-paid] Payment confirmed for order', body.record.id, '- SF decoupled, no auto-call');
  return res.status(200).json({ received: true, sfDecoupled: true });
}
