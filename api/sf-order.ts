/**
 * 順豐物流下單接口
 * 向順豐沙箱 / 正式環境發送下單請求
 * 簽名：Base64(MD5(msgData + timestamp + checkword))
 *
 * 由管理員後台「呼叫順豐」批量操作觸發，與支付確認完全解耦。
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPhoneNotification } from './services/notification';

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
  ]
    .filter(Boolean)
    .join(' ');
  const receiverContact = payload.contact_name || payload.customer_name || '收件人';
  const receiverPhone = payload.customer_phone || '';
  const receiverDistrict = payload.delivery_district || '香港';
  const expressType = COLD_CHAIN_EXPRESS_TYPE;

  return {
    orderId: payload.orderId,
    language: 'Zh-CN',
    monthlyCard,
    expressType,
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
  if (!msgData.language?.trim()) missing.push('language');
  if (!msgData.monthlyCard?.trim()) missing.push('monthlyCard');
  if (!msgData.expressType) missing.push('expressType');
  if (!msgData.payMethod) missing.push('payMethod');
  if (!msgData.parcelQty) missing.push('parcelQty');
  if (!msgData.totalWeight) missing.push('totalWeight');
  if (!Array.isArray(msgData.contactInfoList) || msgData.contactInfoList.length < 2) missing.push('contactInfoList');
  if (Array.isArray(msgData.contactInfoList)) {
    msgData.contactInfoList.forEach((item, idx) => {
      if (!item?.contactType) missing.push(`contactInfoList[${idx}].contactType`);
      if (!item?.contact?.trim()) missing.push(`contactInfoList[${idx}].contact`);
      if (!item?.tel?.trim() && !item?.mobile?.trim()) missing.push(`contactInfoList[${idx}].tel`);
      if (!item?.address?.trim()) missing.push(`contactInfoList[${idx}].address`);
      if (!item?.province?.trim()) missing.push(`contactInfoList[${idx}].province`);
      if (!item?.city?.trim()) missing.push(`contactInfoList[${idx}].city`);
    });
  }
  if (!Array.isArray(msgData.cargoDetails) || msgData.cargoDetails.length === 0) missing.push('cargoDetails');
  if (Array.isArray(msgData.cargoDetails)) {
    msgData.cargoDetails.forEach((item, idx) => {
      if (!item?.name?.trim()) missing.push(`cargoDetails[${idx}].name`);
      if (!item?.count) missing.push(`cargoDetails[${idx}].count`);
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

  console.log('[SF] sf-order called | endpoint:', sfEndpoint, '| partnerID length:', partnerID.length);

  if (!partnerID || !checkword) {
    console.error('[SF] Missing SF_PARTNER_ID or SF_CHECKWORD');
    return res.status(500).json({
      error: '順豐參數未配置。請在 Vercel 設定 SF_PARTNER_ID、SF_CHECKWORD、SF_SENDER_NAME、SF_SENDER_PHONE、SF_SENDER_ADDRESS',
      code: 'SF_CREDENTIALS_MISSING',
    });
  }

  const body = req.body as SfOrderPayload & { orderId: string };
  const orderId = body?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Missing orderId', code: 'BAD_REQUEST' });
  }

  // ─── Fetch order details from Supabase if not provided ──────────
  let payload: SfOrderPayload = body;
  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

  if (supabaseUrl && supabaseKey && (!body.customer_name || !body.delivery_address)) {
    try {
      const dbId = getOrderDbId(orderId);
      const r = await fetchWithTimeout(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}&select=*`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      }, 5000);
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
        console.log('[SF] Fetched order from Supabase:', payload.orderId, '| delivery_method:', payload.delivery_method);
      }
    } catch (e) {
      console.warn('[SF] Supabase fetch error (non-blocking):', e instanceof Error ? e.message : e);
    }
  }

  // ─── Build SF request ───────────────────────────────────────────
  const msgDataObj = buildSfMsgData(payload, { name: senderName, phone: senderPhone, address: senderAddress });
  const missingFields = validateSfRequiredFields(msgDataObj);
  if (missingFields.length > 0) {
    console.error('[SF] Missing required fields:', missingFields);
    return res.status(400).json({
      error: '必传参数不可为空',
      code: 'SF_REQUIRED_FIELDS',
      missing: missingFields,
    });
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

    console.log('[SF] Sending to', sfEndpoint, '| requestID:', requestID);

    let sfRes: Response;
    try {
      sfRes = await fetchWithTimeout(sfEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
    } catch (fetchErr) {
      const isTimeout = fetchErr instanceof Error && fetchErr.name === 'AbortError';
      console.error('[SF] Fetch error:', isTimeout ? 'TIMEOUT' : fetchErr);
      return res.status(504).json({
        error: isTimeout ? '順豐 API 回應超時，請稍後重試' : '順豐 API 連線失敗',
        code: isTimeout ? 'SF_TIMEOUT' : 'SF_CONNECT_FAILED',
        details: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
      });
    }

    const resText = await sfRes.text();
    console.log('[SF] Response status:', sfRes.status, 'body:', resText.slice(0, 300));

    if (!sfRes.ok) {
      return res.status(502).json({
        error: '順豐下單請求失敗',
        code: 'SF_REQUEST_FAILED',
        details: resText.slice(0, 300),
      });
    }

    let json: Record<string, unknown>;
    try {
      json = JSON.parse(resText) as Record<string, unknown>;
    } catch {
      return res.status(502).json({
        error: '順豐回傳非 JSON',
        code: 'SF_INVALID_RESPONSE',
        details: resText.slice(0, 200),
      });
    }

    // Check SF-level apiResultCode
    const apiResultCode = String(json.apiResultCode ?? '');
    if (apiResultCode !== 'A1000') {
      console.error('[SF] API error code:', apiResultCode, 'message:', json.apiErrorMsg);
      return res.status(502).json({
        error: `順豐回傳錯誤: ${json.apiErrorMsg || apiResultCode}`,
        code: 'SF_API_ERROR',
        sfResultCode: apiResultCode,
        details: String(json.apiErrorMsg ?? '').slice(0, 200),
      });
    }

    // Extract waybill number
    const sfResponse = json as { apiResultData?: string };
    let data: { msgData?: { waybillNoInfoList?: { waybillNo?: string }[]; routeLabelInfo?: { routeLabelData?: { waybillNo?: string } }[] } };
    try {
      data = JSON.parse(sfResponse.apiResultData ?? '{}');
    } catch {
      data = {};
    }
    let waybillNo = data.msgData?.waybillNoInfoList?.[0]?.waybillNo;
    if (!waybillNo) {
      waybillNo = data.msgData?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo;
    }
    console.log('[SF] Waybill:', waybillNo);
    const waybillNoStr = waybillNo ? String(waybillNo).trim() : null;

    // ─── Update Supabase with waybill (non-blocking on failure) ───
    if (waybillNoStr && supabaseUrl && supabaseKey) {
      try {
        const dbId = getOrderDbId(orderId);
        const patchRes = await fetchWithTimeout(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ waybill_no: waybillNoStr, sf_responses: json }),
        }, 5000);
        if (!patchRes.ok) console.warn('[SF] Supabase PATCH failed:', patchRes.status);
        else console.log('[SF] Order updated with waybill:', orderId);
      } catch (e) {
        console.warn('[SF] Supabase update error (non-blocking):', e instanceof Error ? e.message : e);
      }
    }

    // ─── Notification (fire-and-forget) ──────────────────────────
    if (waybillNoStr && supabaseUrl && supabaseKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        sendPhoneNotification(supabaseAdmin, {
          orderId,
          newStatus: 'ready_for_pickup',
          waybillNo: waybillNoStr,
          customerPhone: payload.customer_phone,
          source: 'sf-order',
        }).catch(err => console.warn('[SF] Notification error (swallowed):', err));
      } catch { /* swallow */ }
    }

    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: waybillNoStr,
      raw: json,
    });
  } catch (e) {
    console.error('[SF] Unhandled error:', e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({
      error: '順豐下單系統錯誤',
      code: 'SF_ERROR',
      details: errMsg.slice(0, 200),
    });
  }
}
