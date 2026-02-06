/**
 * 第二部分：順豐物流對接
 * 向順豐沙箱 https://sfapi-sbox.sf-express.com/std/service 發送下單請求
 * 簽名：Base64(MD5(msgData + timestamp + checkword))
 */
import crypto from 'crypto';

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
};

function buildSfMsgData(payload: SfOrderPayload, sender: { name: string; phone: string; address: string }) {
  const addr = [
    payload.delivery_district,
    payload.delivery_address,
    payload.delivery_floor ? `${payload.delivery_floor}樓` : '',
    payload.delivery_flat ? `${payload.delivery_flat}室` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    orderId: payload.orderId,
    cargoName: '冷凍食品',
    consignorContact: sender.name,
    consignorTel: sender.phone,
    consignorAddress: sender.address,
    consigneeContact: payload.contact_name || payload.customer_name || '收件人',
    consigneeTel: payload.customer_phone || '',
    consigneeAddress: addr || '收件地址',
  };
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
        };
        if (/^ORD-/.test(orderId)) payload.orderId = orderId;
        console.log('[SF] Fetched order from Supabase:', payload.orderId);
      }
    } catch (e) {
      console.error('[SF] Supabase fetch error', e);
    }
  }

  const msgDataObj = buildSfMsgData(payload, { name: senderName, phone: senderPhone, address: senderAddress });
  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const msgDigest = computeMsgDigest(msgData, timestamp, checkword);
    const payload = {
      partnerID,
      requestID,
      serviceCode: 'COM_RECE_CLOUD_PRINT_WAYBILLS',
      timestamp,
      msgData,
      msgDigest,
    };
    console.log('[SF] Request to sandbox:', SF_SANDBOX_URL, 'requestID:', requestID);

    const sfRes = await fetch(SF_SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resText = await sfRes.text();
    console.log('[SF] Response status:', sfRes.status, 'body length:', resText.length, resText.slice(0, 300));

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

    const waybillNo = (json as { apiResultData?: { waybillNo?: string }; waybillNo?: string }).apiResultData?.waybillNo
      ?? (json as { waybillNo?: string }).waybillNo
      ?? (json as { msgData?: string })?.msgData
      ? (() => { try { const m = JSON.parse((json as { msgData?: string }).msgData as string); return m?.waybillNo ?? m?.waybillList?.[0]?.waybillNo; } catch { return null; } })()
      : null;

    const waybillNoStr = waybillNo != null ? String(waybillNo) : null;
    console.log('[SF] Parsed waybillNo:', waybillNoStr);

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
          body: JSON.stringify({ tracking_number: waybillNoStr }),
        });
        if (!patchRes.ok) console.error('[SF] Supabase PATCH waybill failed', patchRes.status, await patchRes.text());
        else console.log('[SF] Order updated with waybill:', orderId);
      } catch (e) {
        console.error('[SF] Supabase update error', e);
      }
    }

    return res.status(200).json({
      success: true,
      orderId,
      waybillNo: waybillNoStr,
      raw: json,
    });
  } catch (e) {
    console.error('[SF] Error', e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({
      error: '順豐下單系統錯誤',
      code: 'SF_ERROR',
      details: errMsg.slice(0, 200),
    });
  }
}
