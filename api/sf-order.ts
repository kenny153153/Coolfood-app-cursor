/**
 * 第二部分：順豐物流對接
 * 向順豐沙箱 https://sfapi-sbox.sf-express.com/std/service 發送下單請求
 * 簽名：Base64(MD5(msgData + timestamp + checkword))
 */
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPhoneNotification } from './services/notification';

const SF_SANDBOX_URL = 'https://sfapi-sbox.sf-express.com/std/service';

function getOrderDbId(orderId: string): string | number {
  if (/^ORD-\d+$/.test(orderId)) return orderId.replace(/^ORD-/, '');
  return orderId;
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

/**
 * 順豐 expressType 對照表 (香港)：
 *   1  = 順豐標快 (Standard Express)
 *   2  = 順豐特快 (S.F. Express)
 *  21  = 冷運到付 / 冷鏈服務 (Cold Chain)
 *
 * 環境變數 SF_COLD_EXPRESS_TYPE 可覆蓋預設值。
 * 若訂單為自提櫃取貨 (sf_locker)，亦使用冷鏈代碼，
 * 因為本系統所有配送均為冷鏈。
 */
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

  // ── expressType 邏輯 ──────────────────────────────────────────────
  // 本系統所有配送均為冷鏈，不論是冷鏈送貨 (sf_delivery) 還是冷鏈自提櫃 (sf_locker)，
  // 都使用 COLD_CHAIN_EXPRESS_TYPE（預設 21）。
  // 若未來需要非冷鏈服務，可在此增加判斷。
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
      {
        name: '冷凍食品',
        count: 1,
        unit: 'pcs',
        weight: 0.1,
        volume: 1,
        amount: 0,
      },
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

  console.log('[SF] sf-order called, partnerID length:', partnerID.length, 'checkword length:', checkword.length);

  if (!partnerID || !checkword) {
    console.error('[SF] Missing SF_PARTNER_ID/SF_CLIENT_CODE or SF_CHECKWORD');
    return res.status(500).json({
      error: '順豐參數未配置。請在 Vercel 設定 SF_PARTNER_ID、SF_CHECKWORD、SF_SENDER_NAME、SF_SENDER_PHONE、SF_SENDER_ADDRESS',
      code: 'SF_CREDENTIALS_MISSING',
    });
  }

  const body = req.body as SfOrderPayload & { orderId: string };
  let orderId = body?.orderId;
  if (!orderId || typeof orderId !== 'string') {
    return res.status(400).json({ error: 'Missing orderId', code: 'BAD_REQUEST' });
  }

  let payload: SfOrderPayload = body;
  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
  if (supabaseUrl && supabaseKey && (!body.customer_name || !body.delivery_address)) {
    try {
      const dbId = getOrderDbId(orderId);
      const r = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}&select=*`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });
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
        console.log('[SF] Fetched order from Supabase:', payload.orderId, '| delivery_method:', payload.delivery_method, '| locker_code:', payload.locker_code);
      }
    } catch (e) {
      console.error('[SF] Supabase fetch error', e);
    }
  }

  const msgDataObj = buildSfMsgData(payload, { name: senderName, phone: senderPhone, address: senderAddress });
  console.log('[SF] msgData preview:', msgDataObj);
  const missingFields = validateSfRequiredFields(msgDataObj);
  if (missingFields.length > 0) {
    console.error('[SF] Missing required fields:', missingFields, msgDataObj);
    return res.status(400).json({
      error: '必传参数不可为空',
      code: 'SF_REQUIRED_FIELDS',
      missing: missingFields,
      msgData: msgDataObj,
    });
  }
  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const msgDigest = computeMsgDigest(msgData, timestamp, checkword);
    const finalPayload = {
      partnerID,
      requestID,
      serviceCode: 'EXP_RECE_CREATE_ORDER',
      timestamp,
      msgData,
      msgDigest,
    };
    console.log('Sending to SF:', JSON.stringify(finalPayload));
    console.log('[SF] Request to sandbox:', SF_SANDBOX_URL, 'requestID:', requestID);

    const formBody = new URLSearchParams();
    formBody.set('partnerID', finalPayload.partnerID.trim());
    formBody.set('requestID', finalPayload.requestID.trim());
    formBody.set('serviceCode', finalPayload.serviceCode.trim());
    formBody.set('timestamp', finalPayload.timestamp.trim());
    formBody.set('msgData', finalPayload.msgData.trim());
    formBody.set('msgDigest', finalPayload.msgDigest.trim());

    const sfRes = await fetch(SF_SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const resText = await sfRes.text();
    console.log('[SF] Response status:', sfRes.status, 'body length:', resText.length, resText.slice(0, 300));

    if (!sfRes.ok) {
      return res.status(502).json({
        error: '順豐下單請求失敗',
        code: 'SF_REQUEST_FAILED',
        details: resText.slice(0, 300),
        msgData: msgDataObj,
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
        msgData: msgDataObj,
      });
    }

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
    console.log('[SF] 最終成功提取的單號:', waybillNo);
    const waybillNoStr = waybillNo ? String(waybillNo).trim() : null;

    if (waybillNoStr && supabaseUrl && supabaseKey) {
      try {
        const dbId = getOrderDbId(orderId);
        const patchRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ waybill_no: waybillNoStr, sf_responses: sfResponse }),
        });
        if (!patchRes.ok) console.error('[SF] Supabase PATCH waybill failed', patchRes.status, await patchRes.text());
        else console.log('[SF] Order updated with waybill:', orderId);
      } catch (e) {
        console.error('[SF] Supabase update error', e);
      }
    }

    // ── 觸發通知：ready_for_pickup（順豐已接單）──
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
      } catch {
        // 通知失敗不影響回應
      }
    }

    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: waybillNoStr,
      raw: json,
      msgData: msgDataObj,
    });
  } catch (e) {
    console.error('[SF] Error', e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({
      error: '順豐下單系統錯誤',
      code: 'SF_ERROR',
      details: errMsg.slice(0, 200),
      msgData: msgDataObj,
    });
  }
}
