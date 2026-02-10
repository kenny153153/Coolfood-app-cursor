/**
 * 通知發送 API 端點
 * POST /api/send-notification
 *
 * 用途：供前端（Admin 後台）在批量操作後觸發通知。
 * Body: { orders: [{ orderId, newStatus, waybillNo?, customerPhone? }] }
 *
 * 安全性：通知失敗不影響回應，回傳所有訂單的發送結果。
 */
import { createClient } from '@supabase/supabase-js';
import { sendPhoneNotification } from './services/notification';

interface NotifRequest {
  orderId: string;
  newStatus: string;
  waybillNo?: string;
  customerPhone?: string;
}

export default async function handler(
  req: { method?: string; body?: { orders?: NotifRequest[] } },
  res: { status: (n: number) => { json: (o: object) => void } },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orders = req.body?.orders;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Missing or empty orders array' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 並行發送所有通知（全部非阻塞）
  const results = await Promise.allSettled(
    orders.map(o =>
      sendPhoneNotification(supabaseAdmin, {
        orderId: o.orderId,
        newStatus: o.newStatus,
        waybillNo: o.waybillNo,
        customerPhone: o.customerPhone,
        source: 'admin-batch',
      }),
    ),
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[send-notification] ${sent}/${orders.length} notifications processed`);

  return res.status(200).json({ success: true, total: orders.length, sent });
}
