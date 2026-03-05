/**
 * 順豐電子面單 API
 * 呼叫 EXP_RECE_CREATE_ORDER（isGenEletricPic=1）取得真正的順豐面單圖片
 * 如果訂單已有 waybillNo，會嘗試用相同 orderId 重新取得面單
 *
 * POST /api/sf-label
 * Body: { orderId } 或 { waybillNos: ["SF..."] }
 */
import crypto from 'crypto';

const SF_SANDBOX_URL = 'https://sfapi-sbox.sf-express.com/std/service';
const SF_PROD_URL = 'https://sfapi.sf-express.com/std/service';
const SF_TIMEOUT_MS = 15000;

function getSfEndpoint(): string {
  const env = (process.env.SF_ENV ?? process.env.VITE_SF_ENV ?? 'demo').trim().toLowerCase();
  if (env === 'prod' || env === 'production') return SF_PROD_URL;
  return SF_SANDBOX_URL;
}

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
}

function fetchWithTimeout(url: string, opts: RequestInit, ms = SF_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const str = msgData + timestamp + checkword;
  const md5 = crypto.createHash('md5').update(str, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

type LabelPayload = {
  orderId?: string;
  waybillNos?: string[];
};

async function callSfService(serviceCode: string, msgDataObj: object): Promise<{ ok: boolean; data?: any; error?: string }> {
  const partnerID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? '').trim();
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  const sfEndpoint = getSfEndpoint();

  if (!partnerID || !checkword) {
    return { ok: false, error: '順豐參數未配置 (SF_PARTNER_ID / SF_CHECKWORD)' };
  }

  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const msgDigest = computeMsgDigest(msgData, timestamp, checkword);

  const formBody = new URLSearchParams();
  formBody.set('partnerID', partnerID);
  formBody.set('requestID', requestID);
  formBody.set('serviceCode', serviceCode);
  formBody.set('timestamp', timestamp);
  formBody.set('msgData', msgData);
  formBody.set('msgDigest', msgDigest);

  try {
    const sfRes = await fetchWithTimeout(sfEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const resText = await sfRes.text();
    if (!sfRes.ok) return { ok: false, error: `SF HTTP ${sfRes.status}` };

    let json: any;
    try { json = JSON.parse(resText); } catch { return { ok: false, error: '順豐回傳非 JSON' }; }

    if (String(json.apiResultCode) !== 'A1000') {
      return { ok: false, error: `SF: ${json.apiErrorMsg || json.apiResultCode}` };
    }

    let innerData: any;
    try { innerData = JSON.parse(json.apiResultData ?? '{}'); } catch { innerData = {}; }
    return { ok: true, data: innerData };
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    return { ok: false, error: isTimeout ? '順豐 API 超時' : '順豐連線失敗' };
  }
}

export default async function handler(
  req: { method?: string; body?: LabelPayload },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as LabelPayload;
  const orderId = body?.orderId;
  const waybillNos = body?.waybillNos;

  if (!orderId && (!waybillNos || waybillNos.length === 0)) {
    return res.status(400).json({ error: 'Missing orderId or waybillNos', code: 'BAD_REQUEST' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

  const senderName = (process.env.SF_SENDER_NAME ?? '寄件人').trim();
  const senderPhone = (process.env.SF_SENDER_PHONE ?? '').trim();
  const senderAddress = (process.env.SF_SENDER_ADDRESS ?? '').trim();
  const monthlyCard = (process.env.SF_MONTHLY_CARD ?? process.env.SF_PARTNER_ID ?? '').trim();
  const coldExpressType = Number(process.env.SF_COLD_EXPRESS_TYPE ?? '21') || 21;

  // Strategy 1: Create order with isGenEletricPic=1 to get label image
  if (orderId) {
    let orderRow: any = null;
    if (supabaseUrl && supabaseKey) {
      try {
        const dbId = getOrderDbId(orderId);
        const r = await fetchWithTimeout(
          `${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}&select=*`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }, 5000,
        );
        const data = await r.json();
        orderRow = Array.isArray(data) ? data[0] : data;
      } catch (e) {
        console.warn('[sf-label] DB fetch error:', e instanceof Error ? e.message : e);
      }
    }

    if (!orderRow) {
      return res.status(404).json({ error: '訂單不存在', code: 'ORDER_NOT_FOUND' });
    }

    const addr = [
      orderRow.delivery_district,
      orderRow.delivery_address,
      orderRow.delivery_floor ? `${orderRow.delivery_floor}樓` : '',
      orderRow.delivery_flat ? `${orderRow.delivery_flat}室` : '',
    ].filter(Boolean).join(' ');

    const msgDataObj = {
      orderId: orderRow.id?.toString?.() ?? orderId,
      language: 'Zh-CN',
      monthlyCard: monthlyCard || '7551234567',
      expressType: coldExpressType,
      isGenBillNo: 1,
      isGenEletricPic: 1,
      payMethod: 1,
      parcelQty: 1,
      totalWeight: 1,
      cargoDetails: [
        { name: '冷凍食品', count: 1, unit: 'pcs', weight: 0.1, volume: 1, amount: 0 },
      ],
      contactInfoList: [
        {
          contactType: 1,
          contact: senderName,
          tel: senderPhone,
          mobile: senderPhone,
          address: senderAddress,
          province: '香港',
          city: '香港',
          county: '',
          company: senderName,
        },
        {
          contactType: 2,
          contact: orderRow.contact_name || orderRow.customer_name || '收件人',
          tel: orderRow.customer_phone || '',
          mobile: orderRow.customer_phone || '',
          address: addr || '收件地址',
          province: '香港',
          city: orderRow.delivery_district || '香港',
          county: orderRow.delivery_district || '香港',
          company: '',
        },
      ],
    };

    console.log('[sf-label] Calling EXP_RECE_CREATE_ORDER with isGenEletricPic=1 for', orderId);
    const result = await callSfService('EXP_RECE_CREATE_ORDER', msgDataObj);

    if (!result.ok) {
      return res.status(502).json({ error: result.error, code: 'SF_LABEL_FAILED' });
    }

    const msgData = result.data?.msgData ?? result.data;
    const waybillNo = msgData?.waybillNoInfoList?.[0]?.waybillNo ?? null;
    const routeLabel = msgData?.routeLabelInfo?.[0] ?? null;
    const routeLabelData = routeLabel?.routeLabelData ?? null;
    const labelImage = routeLabelData?.image ?? routeLabel?.image ?? null;

    // Save waybill to DB if new
    if (waybillNo && supabaseUrl && supabaseKey) {
      try {
        const dbId = getOrderDbId(orderId);
        await fetchWithTimeout(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ waybill_no: waybillNo }),
        }, 5000);
      } catch { /* non-blocking */ }
    }

    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: waybillNo ? String(waybillNo).trim() : null,
      labelImage: labelImage ?? null,
      routeLabelData: routeLabelData ?? null,
    });
  }

  // Strategy 2: Batch waybill label retrieval (COM_RECE_CLOUD_PRINT_WAYBILLS)
  if (waybillNos && waybillNos.length > 0) {
    const msgDataObj = {
      documents: waybillNos.map(wn => ({ masterWaybillNo: wn })),
      templateCode: 'fm_150_standard_HKCFEX',
      version: '2.0',
      fileType: 'pdf',
    };

    console.log('[sf-label] Calling COM_RECE_CLOUD_PRINT_WAYBILLS for', waybillNos.join(','));
    const result = await callSfService('COM_RECE_CLOUD_PRINT_WAYBILLS', msgDataObj);

    if (!result.ok) {
      return res.status(502).json({ error: result.error, code: 'SF_CLOUD_PRINT_FAILED' });
    }

    return res.status(200).json({
      success: true,
      waybillNos,
      data: result.data,
    });
  }

  return res.status(400).json({ error: 'Invalid request' });
}
