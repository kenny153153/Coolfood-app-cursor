/**
 * 第三部分：Webhook — 當 Supabase 訂單被更新為「已付款」(paid/success) 時由 Supabase 呼叫
 * 在 Supabase Dashboard → Database → Webhooks 新增：table orders, Events: Update, URL: https://你的網域/api/on-order-paid
 */
type WebhookPayload = {
  type?: string;
  table?: string;
  record?: { id?: string | number; status?: string; tracking_number?: string };
  old_record?: { status?: string };
};

export default async function handler(
  req: { method?: string; body?: WebhookPayload },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
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

  const id = body.record.id;
  const orderId = typeof id === 'number' ? `ORD-${id}` : String(id);
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://coolfood-app-cursor.vercel.app';

  try {
    const cfRes = await fetch(`${baseUrl}/api/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, origin: baseUrl }),
    });
    const data = await cfRes.json();
    console.log('[on-order-paid] confirm-payment result', cfRes.status, data);
    return res.status(200).json({ received: true, confirmPayment: data });
  } catch (e) {
    console.error('[on-order-paid] Error', e);
    return res.status(502).json({ received: true, error: String(e) });
  }
}
