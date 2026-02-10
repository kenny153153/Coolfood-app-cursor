/**
 * 第三部分：Webhook — 當 Supabase 訂單被更新為「已付款」(paid/success) 時由 Supabase 呼叫
 * 在 Supabase Dashboard → Database → Webhooks 新增：table orders, Events: Update, URL: https://你的網域/api/on-order-paid
 * 
 * 注意：SF API 已解耦，此 webhook 僅確認付款並更新狀態至 processing。
 * 順豐下單改由後台「呼叫順豐」批量操作觸發。
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

  // SF API 已解耦：webhook 僅記錄收到事件，不再觸發 confirm-payment 或 SF 下單
  console.log('[on-order-paid] Payment confirmed for order', body.record.id, '- SF decoupled, no auto-call');
  return res.status(200).json({ received: true, sfDecoupled: true });
}
