/**
 * Consolidated 順豐 (SF Express) API — POST /api/sf
 * Body: { action: 'order' | 'label', ... }
 *
 * Merges the former /api/sf-order and /api/sf-label into a single serverless function.
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

// ─── label handler (former sf-label) ────────────────────────────────

type LabelPayload = { orderId?: string; waybillNos?: string[] };

async function handleLabel(req: any, res: any) {
  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'dispatch', 'read');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

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

    return res.status(200).json({ success: true, waybillNos, data: result.data });
  }

  return res.status(400).json({ error: 'Invalid request' });
}

// ─── order handler (former sf-order) ────────────────────────────────

type SfOrderPayload = {
  orderId: string;
  customer_name?: string;
  customer_phone?: string;
  contact_name?: string;
  delivery_address?: string;
  delivery_district?: string;
  delivery_street?: string;
  delivery_building?: string;
  delivery_floor?: string;
  delivery_flat?: string;
  delivery_method?: string;
  locker_code?: string;
};

const COLD_CHAIN_EXPRESS_TYPE = Number(process.env.SF_COLD_EXPRESS_TYPE ?? '21') || 21;

function buildSfMsgData(payload: SfOrderPayload, sender: { name: string; phone: string; address: string }) {
  const monthlyCard = (process.env.SF_MONTHLY_CARD ?? process.env.SF_PARTNER_ID ?? '').trim() || '7551234567';
  const addr = [
    payload.delivery_district,
    payload.delivery_address,
    payload.delivery_floor ? `${payload.delivery_floor}樓` : '',
    payload.delivery_flat ? `${payload.delivery_flat}室` : '',
  ].filter(Boolean).join(' ');
  const receiverContact = payload.contact_name || payload.customer_name || '收件人';
  const receiverPhone = payload.customer_phone || '';
  const receiverDistrict = payload.delivery_district || '香港';

  return {
    orderId: payload.orderId,
    language: 'Zh-CN',
    monthlyCard,
    expressType: COLD_CHAIN_EXPRESS_TYPE,
    isGenBillNo: 1,
    isGenEletricPic: 0,
    payMethod: 1,
    parcelQty: 1,
    totalWeight: 1,
    cargoDetails: [
      { name: '冷凍食品', count: 1, unit: 'pcs', weight: 0.1, volume: 1, amount: 0 },
    ],
    contactInfoList: [
      {
        contactType: 1,
        contact: sender.name,
        tel: sender.phone,
        mobile: sender.phone,
        address: sender.address,
        province: '香港',
        city: '香港',
        county: '',
        company: sender.name,
      },
      {
        contactType: 2,
        contact: receiverContact,
        tel: receiverPhone,
        mobile: receiverPhone,
        address: addr || '收件地址',
        province: '香港',
        city: receiverDistrict,
        county: receiverDistrict,
        company: '',
      },
    ],
  };
}

function validateSfRequiredFields(msgData: ReturnType<typeof buildSfMsgData>) {
  const missing: string[] = [];
  if (!msgData.orderId?.trim()) missing.push('orderId');
  if (!msgData.monthlyCard?.trim()) missing.push('monthlyCard');
  if (!msgData.expressType) missing.push('expressType');
  if (!Array.isArray(msgData.contactInfoList) || msgData.contactInfoList.length < 2) missing.push('contactInfoList');
  if (Array.isArray(msgData.contactInfoList)) {
    msgData.contactInfoList.forEach((item, idx) => {
      if (!item?.contact?.trim()) missing.push(`contactInfoList[${idx}].contact`);
      if (!item?.tel?.trim() && !item?.mobile?.trim()) missing.push(`contactInfoList[${idx}].tel`);
      if (!item?.address?.trim()) missing.push(`contactInfoList[${idx}].address`);
    });
  }
  return missing;
}

async function handleOrder(req: any, res: any) {
  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'dispatch', 'create');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const partnerID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? '').trim();
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  const senderName = (process.env.SF_SENDER_NAME ?? '寄件人').trim();
  const senderPhone = (process.env.SF_SENDER_PHONE ?? '').trim();
  const senderAddress = (process.env.SF_SENDER_ADDRESS ?? '').trim();
  const sfEndpoint = getSfEndpoint();

  console.log('[SF] called | endpoint:', sfEndpoint, '| partnerID:', partnerID.length > 0 ? '***' : '(empty)');

  if (!partnerID || !checkword) {
    return res.status(500).json({ error: '順豐參數未配置 (SF_PARTNER_ID / SF_CHECKWORD)', code: 'SF_CREDENTIALS_MISSING' });
  }

  const body = req.body as SfOrderPayload & { orderId: string };
  const orderId = body?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Missing orderId', code: 'BAD_REQUEST' });
  }

  let payload: SfOrderPayload = body;
  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

  if (supabaseUrl && supabaseKey && (!body.customer_name || !body.delivery_address)) {
    try {
      const dbId = getOrderDbId(orderId);
      const r = await fetchWithTimeout(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}&select=*`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
        5000,
      );
      const data = await r.json();
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        payload = {
          orderId: row.id?.toString?.() ?? orderId,
          customer_name: row.customer_name,
          customer_phone: row.customer_phone,
          contact_name: row.contact_name,
          delivery_address: row.delivery_address,
          delivery_district: row.delivery_district,
          delivery_street: row.delivery_street,
          delivery_building: row.delivery_building,
          delivery_floor: row.delivery_floor,
          delivery_flat: row.delivery_flat,
          delivery_method: row.delivery_method,
          locker_code: row.locker_code,
        };
        if (/^ORD-/.test(orderId)) payload.orderId = orderId;
        console.log('[SF] Order from DB:', payload.orderId, '| method:', payload.delivery_method);
      }
    } catch (e) {
      console.warn('[SF] DB fetch error:', e instanceof Error ? e.message : e);
    }
  }

  const msgDataObj = buildSfMsgData(payload, { name: senderName, phone: senderPhone, address: senderAddress });
  const missingFields = validateSfRequiredFields(msgDataObj);
  if (missingFields.length > 0) {
    return res.status(400).json({ error: '必传参数不可为空', code: 'SF_REQUIRED_FIELDS', missing: missingFields });
  }

  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const msgDigest = computeMsgDigest(msgData, timestamp, checkword);
    const formBody = new URLSearchParams();
    formBody.set('partnerID', partnerID);
    formBody.set('requestID', requestID);
    formBody.set('serviceCode', 'EXP_RECE_CREATE_ORDER');
    formBody.set('timestamp', timestamp);
    formBody.set('msgData', msgData);
    formBody.set('msgDigest', msgDigest);

    console.log('[SF] Sending | requestID:', requestID);

    let sfRes: Response;
    try {
      sfRes = await fetchWithTimeout(sfEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      return res.status(504).json({
        error: isTimeout ? '順豐 API 超時' : '順豐連線失敗',
        code: isTimeout ? 'SF_TIMEOUT' : 'SF_CONNECT_FAILED',
      });
    }

    const resText = await sfRes.text();
    console.log('[SF] Response:', sfRes.status, resText.slice(0, 300));

    if (!sfRes.ok) {
      return res.status(502).json({ error: '順豐請求失敗', code: 'SF_REQUEST_FAILED', details: resText.slice(0, 300) });
    }

    let json: Record<string, unknown>;
    try { json = JSON.parse(resText); } catch {
      return res.status(502).json({ error: '順豐回傳非 JSON', code: 'SF_INVALID_RESPONSE' });
    }

    const apiResultCode = String(json.apiResultCode ?? '');
    if (apiResultCode !== 'A1000') {
      return res.status(502).json({
        error: `順豐錯誤: ${json.apiErrorMsg || apiResultCode}`,
        code: 'SF_API_ERROR',
        sfResultCode: apiResultCode,
      });
    }

    const sfResponseData = json as { apiResultData?: string };
    let innerData: any;
    try { innerData = JSON.parse(sfResponseData.apiResultData ?? '{}'); } catch { innerData = {}; }
    let waybillNo = innerData.msgData?.waybillNoInfoList?.[0]?.waybillNo;
    if (!waybillNo) waybillNo = innerData.msgData?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo;
    const waybillNoStr = waybillNo ? String(waybillNo).trim() : null;
    console.log('[SF] Waybill:', waybillNoStr);

    if (waybillNoStr && supabaseUrl && supabaseKey) {
      try {
        const dbId = getOrderDbId(orderId);
        await fetchWithTimeout(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json', Prefer: 'return=minimal',
          },
          body: JSON.stringify({ waybill_no: waybillNoStr, sf_responses: json }),
        }, 5000);
        console.log('[SF] DB updated:', orderId, waybillNoStr);
      } catch (e) {
        console.warn('[SF] DB update error:', e instanceof Error ? e.message : e);
      }
    }

    return res.status(200).json({ success: true, orderId, waybillNo: waybillNoStr, raw: json });
  } catch (e) {
    console.error('[SF] Unhandled:', e);
    return res.status(502).json({ error: '順豐系統錯誤', code: 'SF_ERROR' });
  }
}

// ─── Router ─────────────────────────────────────────────────────────

export default async function handler(
  req: { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = req.body?.action;
  if (action === 'label') return handleLabel(req, res);
  if (action === 'order') return handleOrder(req, res);
  return res.status(400).json({ error: 'Invalid action. Use: order, label' });
}
