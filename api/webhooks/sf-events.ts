/**
 * SF callback receiver for service-codes beyond route-push.
 * Handles:
 * - EXP_RECE_DELIVERY_NOTICE
 * - EXP_RECE_WANTED_INTERCEPT
 * - COM_RECE_CEMP_* callback families
 */
import crypto, { timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

type SfPushBody = {
  partnerID?: string;
  requestID?: string;
  serviceCode?: string;
  timestamp?: string;
  msgDigest?: string;
  msgData?: string;
};

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const md5 = crypto.createHash('md5').update(msgData + timestamp + checkword, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

function parseJsonSafe(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    return {};
  } catch {
    return {};
  }
}

function collectStringsByKey(node: unknown, keys: Set<string>, out: string[], depth = 0): void {
  if (depth > 6 || !node) return;
  if (Array.isArray(node)) {
    for (const item of node) collectStringsByKey(item, keys, out, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (typeof value === 'string' && keys.has(key) && value.trim()) out.push(value.trim());
    if (typeof value === 'object' && value !== null) collectStringsByKey(value, keys, out, depth + 1);
  }
}

function normalizeOrderId(raw: string): string {
  if (/^ORD-\d+$/.test(raw)) return raw.replace(/^ORD-/, '');
  return raw;
}

async function appendCallbackLog(serviceCode: string, msgDataObj: Record<string, unknown>) {
  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseUrl || !serviceRoleKey) return;

  const orderIds: string[] = [];
  const waybills: string[] = [];
  collectStringsByKey(msgDataObj, new Set(['orderId', 'orderNo', 'order_id', 'custReferenceNo']), orderIds);
  collectStringsByKey(msgDataObj, new Set(['mailNo', 'waybillNo', 'waybill_no', 'masterWaybillNo']), waybills);

  const supabase = createClient(supabaseUrl.replace(/\/$/, ''), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const uniqueOrderIds = Array.from(new Set(orderIds.map(normalizeOrderId).filter(Boolean)));
  const uniqueWaybills = Array.from(new Set(waybills.filter(Boolean)));
  if (uniqueOrderIds.length === 0 && uniqueWaybills.length === 0) return;

  const updatesByOrderId = new Map<string, any>();
  if (uniqueOrderIds.length > 0) {
    const { data } = await supabase
      .from('orders')
      .select('id, sf_responses')
      .in('id', uniqueOrderIds);
    for (const row of data ?? []) updatesByOrderId.set(String(row.id), row);
  }

  if (uniqueWaybills.length > 0) {
    const { data } = await supabase
      .from('orders')
      .select('id, sf_responses, waybill_no')
      .in('waybill_no', uniqueWaybills);
    for (const row of data ?? []) updatesByOrderId.set(String(row.id), row);
  }

  if (updatesByOrderId.size === 0) return;

  const event = {
    serviceCode,
    receivedAt: new Date().toISOString(),
    payload: msgDataObj,
  };

  for (const [orderId, row] of updatesByOrderId.entries()) {
    const existing = row?.sf_responses && typeof row.sf_responses === 'object' ? row.sf_responses : {};
    const callbacks = Array.isArray((existing as any).callbacks) ? (existing as any).callbacks : [];
    const nextCallbacks = [...callbacks.slice(-19), event];
    const merged = {
      ...existing,
      callbacks: nextCallbacks,
      lastCallback: event,
    };

    await supabase
      .from('orders')
      .update({ sf_responses: merged })
      .eq('id', orderId);
  }
}

function successAck(res: any) {
  return res.status(200).json({
    return_code: '0000',
    return_msg: 'success',
    apiResultCode: 'A1000',
    apiErrorMsg: 'success',
  });
}

export default async function handler(
  req: { method?: string; body?: SfPushBody },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void } }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const serviceCode = String(body.serviceCode ?? '').trim();
  const timestamp = String(body.timestamp ?? '').trim();
  const msgDigest = String(body.msgDigest ?? '').trim();
  const msgData = String(body.msgData ?? '').trim();
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();

  if (!serviceCode || !timestamp || !msgDigest || !msgData || !checkword) {
    return res.status(400).json({ error: 'Missing SF callback fields' });
  }

  const expected = computeMsgDigest(msgData, timestamp, checkword);
  const digestMatch = msgDigest.length === expected.length
    && timingSafeEqual(Buffer.from(msgDigest), Buffer.from(expected));
  if (!digestMatch) return res.status(403).json({ error: 'Signature failed' });

  const msgDataObj = parseJsonSafe(msgData);
  await appendCallbackLog(serviceCode, msgDataObj).catch(err => {
    console.warn('[sf-events] append callback failed:', err instanceof Error ? err.message : String(err));
  });

  return successAck(res);
}

