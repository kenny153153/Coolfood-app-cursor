/**
 * 順豐路由推送 (Route Push) Webhook
 * 接收順豐的物流狀態更新，自動更新訂單狀態：
 *   - 路由代碼 50 (已攬收/已取件) → shipping (運輸中)
 *   - 路由代碼 80 (已簽收) → completed (已完成)
 *
 * 順豐推送格式 (application/x-www-form-urlencoded):
 *   partnerID, requestID, serviceCode, timestamp, msgDigest, msgData
 *
 * 安全校驗：驗證 msgDigest = Base64(MD5(msgData + timestamp + checkword))
 *
 * 端點：POST /api/webhooks/sf-status
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/** SF Route Push opCode → order status mapping */
const ROUTE_STATUS_MAP: Record<string, string> = {
  '50': 'shipping',    // 已攬收 / 已取件
  '80': 'completed',   // 已簽收
};

/** Additional opCodes that also indicate "in transit" */
const SHIPPING_CODES = new Set(['50', '51', '30', '31', '36', '44', '45', '46']);
/** Codes that indicate delivery complete */
const COMPLETED_CODES = new Set(['80']);

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const str = msgData + timestamp + checkword;
  const md5 = crypto.createHash('md5').update(str, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

interface SfRoutePushBody {
  partnerID?: string;
  requestID?: string;
  serviceCode?: string;
  timestamp?: string;
  msgDigest?: string;
  msgData?: string;
}

interface SfRouteInfo {
  mailNo?: string;
  routes?: {
    opCode?: string;
    remark?: string;
    acceptTime?: string;
    acceptAddress?: string;
  }[];
}

export default async function handler(
  req: { method?: string; body?: SfRoutePushBody; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  // SF expects the endpoint to accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as SfRoutePushBody;
  const {
    partnerID = '',
    requestID = '',
    serviceCode = '',
    timestamp = '',
    msgDigest = '',
    msgData = '',
  } = body;

  console.log('[sf-status] Route Push received:', { partnerID, requestID, serviceCode, timestamp });

  // ── 1. Validate checkword signature ──
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  if (!checkword) {
    console.error('[sf-status] SF_CHECKWORD not configured');
    return res.status(500).json({ error: 'Server config missing SF_CHECKWORD' });
  }

  const expectedDigest = computeMsgDigest(msgData, timestamp, checkword);
  if (msgDigest !== expectedDigest) {
    console.error('[sf-status] msgDigest verification FAILED', {
      received: msgDigest,
      expected: expectedDigest,
    });
    return res.status(403).json({ error: 'Signature verification failed', code: 'DIGEST_MISMATCH' });
  }
  console.log('[sf-status] msgDigest verified OK');

  // ── 2. Parse msgData ──
  let routeData: SfRouteInfo;
  try {
    routeData = JSON.parse(msgData) as SfRouteInfo;
  } catch {
    console.error('[sf-status] Failed to parse msgData:', msgData.slice(0, 200));
    return res.status(400).json({ error: 'Invalid msgData JSON' });
  }

  const waybillNo = routeData.mailNo?.trim();
  if (!waybillNo) {
    console.log('[sf-status] No mailNo in msgData, skip');
    // SF expects a success response even if we skip
    return res.status(200).json({ return_code: '0000', return_msg: 'success' });
  }

  const routes = routeData.routes || [];
  if (routes.length === 0) {
    console.log('[sf-status] No routes in msgData for waybill:', waybillNo);
    return res.status(200).json({ return_code: '0000', return_msg: 'success' });
  }

  // ── 3. Determine target status from the latest route opCode ──
  // Process routes from latest to earliest to find the most significant status change
  let targetStatus: string | null = null;
  let latestRoute = routes[routes.length - 1]; // SF pushes latest last

  for (let i = routes.length - 1; i >= 0; i--) {
    const route = routes[i];
    const opCode = route.opCode ?? '';

    if (COMPLETED_CODES.has(opCode)) {
      targetStatus = 'completed';
      latestRoute = route;
      break; // Completed takes highest priority
    }
    if (SHIPPING_CODES.has(opCode) && !targetStatus) {
      targetStatus = 'shipping';
      latestRoute = route;
    }
  }

  if (!targetStatus) {
    console.log('[sf-status] No actionable opCode for waybill:', waybillNo, 'routes:', routes.map(r => r.opCode));
    return res.status(200).json({ return_code: '0000', return_msg: 'success' });
  }

  console.log(`[sf-status] Waybill ${waybillNo} → ${targetStatus} (opCode: ${latestRoute.opCode})`);

  // ── 4. Update order in Supabase ──
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim().replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[sf-status] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
    return res.status(500).json({ error: 'Server config missing' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Find order by waybill_no
    const { data: orderRows, error: findError } = await supabaseAdmin
      .from('orders')
      .select('id, status, waybill_no')
      .eq('waybill_no', waybillNo);

    if (findError) {
      console.error('[sf-status] Supabase query error:', findError.message);
      return res.status(502).json({ error: 'Database query failed', details: findError.message });
    }

    if (!orderRows || orderRows.length === 0) {
      console.log('[sf-status] No order found for waybill:', waybillNo);
      // Still return success to SF so they don't keep retrying
      return res.status(200).json({ return_code: '0000', return_msg: 'success' });
    }

    // Update each matching order (normally just one)
    let updatedCount = 0;
    for (const order of orderRows) {
      // Prevent status regression: don't overwrite completed with shipping
      const currentStatus = String(order.status).toLowerCase();
      if (currentStatus === 'completed' && targetStatus === 'shipping') {
        console.log(`[sf-status] Skip: order ${order.id} already completed`);
        continue;
      }
      // Don't update abnormal/refund orders
      if (currentStatus === 'abnormal' || currentStatus === 'refund') {
        console.log(`[sf-status] Skip: order ${order.id} status is ${currentStatus}`);
        continue;
      }

      const sfRouteLog = {
        opCode: latestRoute.opCode,
        remark: latestRoute.remark,
        acceptTime: latestRoute.acceptTime,
        acceptAddress: latestRoute.acceptAddress,
        receivedAt: new Date().toISOString(),
      };

      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: targetStatus,
          sf_responses: sfRouteLog,
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`[sf-status] Update failed for order ${order.id}:`, updateError.message);
      } else {
        updatedCount++;
        console.log(`[sf-status] Order ${order.id} updated to ${targetStatus}`);
      }
    }

    console.log(`[sf-status] Done: ${updatedCount}/${orderRows.length} orders updated for waybill ${waybillNo}`);

    // SF expects this exact response format for acknowledgement
    return res.status(200).json({ return_code: '0000', return_msg: 'success' });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error('[sf-status] Error:', errMsg);
    // Still return 200 to SF to prevent infinite retries, but log the error
    return res.status(200).json({ return_code: '0001', return_msg: errMsg.slice(0, 100) });
  }
}
