/**
 * 順豐物流下單接口
 * 簽名：Base64(MD5(msgData + timestamp + checkword))
 *
 * 所有依賴邏輯內嵌，不跨檔案 import，避免 Vercel ERR_MODULE_NOT_FOUND。
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

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const str = msgData + timestamp + checkword;
  const md5 = crypto.createHash('md5').update(str, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

export default async function handler(
  req: { method?: string; body?: SfOrderPayload & { orderId: string } },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const partnerID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? '').trim();
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  const senderName = (process.env.SF_SENDER_NAME ?? '寄件人').trim();
  const senderPhone = (process.env.SF_SENDER_PHONE ?? '').trim();
  const senderAddress = (process.env.SF_SENDER_ADDRESS ?? '').trim();
  const sfEndpoint = getSfEndpoint();

  console.log('[SF] called | endpoint:', sfEndpoint, '| partnerID:', partnerID.length > 0 ? '***' : '(empty)');

  if (!partnerID || !checkword) {
    return res.status(500).json({
      error: '順豐參數未配置 (SF_PARTNER_ID / SF_CHECKWORD)',
      code: 'SF_CREDENTIALS_MISSING',
    });
  }

  const body = req.body as SfOrderPayload & { orderId: string };
  const orderId = body?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Missing orderId', code: 'BAD_REQUEST' });
  }

  // ─── Fetch order details from Supabase ─────────────────────────────
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

  // ─── Build & validate SF request ───────────────────────────────────
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

    // ─── Extract waybill ─────────────────────────────────────────────
    const sfResponseData = json as { apiResultData?: string };
    let innerData: any;
    try { innerData = JSON.parse(sfResponseData.apiResultData ?? '{}'); } catch { innerData = {}; }
    let waybillNo = innerData.msgData?.waybillNoInfoList?.[0]?.waybillNo;
    if (!waybillNo) waybillNo = innerData.msgData?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo;
    const waybillNoStr = waybillNo ? String(waybillNo).trim() : null;
    console.log('[SF] Waybill:', waybillNoStr);

    // ─── Save waybill to DB ──────────────────────────────────────────
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
