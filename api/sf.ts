/**
 * Consolidated 順豐 (SF Express) API — POST /api/sf
 * Body: { action: 'order' | 'label', ... }
 *
 * Merges the former /api/sf-order and /api/sf-label into a single serverless function.
 */
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from './_rateLimit.js';

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

function parseApiResultData(raw: unknown): any {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  if (raw && typeof raw === 'object') return raw;
  return {};
}

function deepCollectWaybillCandidates(node: any, acc: string[], depth = 0): void {
  if (!node || depth > 6) return;
  if (typeof node === 'string') {
    const parsed = parseApiResultData(node);
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
      deepCollectWaybillCandidates(parsed, acc, depth + 1);
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) deepCollectWaybillCandidates(item, acc, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;

  const keyCandidates = ['waybillNo', 'waybill_no', 'mailNo', 'mainMailNo', 'masterWaybillNo'];
  for (const key of keyCandidates) {
    const value = (node as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) acc.push(value.trim());
  }

  for (const value of Object.values(node as Record<string, unknown>)) {
    if (typeof value === 'object' && value !== null) {
      deepCollectWaybillCandidates(value, acc, depth + 1);
    }
  }
}

function extractWaybillNoFromSfData(innerData: any): string | null {
  const parsedRoot = parseApiResultData(innerData);
  const parsedMsg = parseApiResultData(parsedRoot?.msgData);
  const msgData = Object.keys(parsedMsg || {}).length > 0 ? parsedMsg : parsedRoot;
  const directCandidates = [
    msgData?.waybillNoInfoList?.[0]?.waybillNo,
    msgData?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo,
    msgData?.routeLabelInfo?.[0]?.waybillNo,
    msgData?.mailNo,
    msgData?.mainMailNo,
    parsedRoot?.waybillNoInfoList?.[0]?.waybillNo,
    parsedRoot?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo,
    parsedRoot?.mailNo,
    parsedRoot?.mainMailNo,
  ];
  for (const item of directCandidates) {
    if (typeof item === 'string' && item.trim()) return item.trim();
  }

  const deepCandidates: string[] = [];
  deepCollectWaybillCandidates(msgData, deepCandidates);
  deepCollectWaybillCandidates(parsedRoot, deepCandidates);
  const first = deepCandidates.find(v => v && !v.startsWith('{') && !v.startsWith('['));
  return first ?? null;
}

function deepCollectStringValues(node: any, acc: string[], depth = 0): void {
  if (!node || depth > 6) return;
  if (typeof node === 'string') {
    const value = node.trim();
    if (value) acc.push(value);
    const parsed = parseApiResultData(node);
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
      deepCollectStringValues(parsed, acc, depth + 1);
    }
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) deepCollectStringValues(item, acc, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;
  for (const value of Object.values(node as Record<string, unknown>)) {
    if (typeof value === 'string') {
      const str = value.trim();
      if (str) acc.push(str);
    } else if (typeof value === 'object' && value !== null) {
      deepCollectStringValues(value, acc, depth + 1);
    }
  }
}

function extractCloudPrintFiles(innerData: any): Array<{ url: string; token?: string; waybillNo?: string }> {
  const files = innerData?.obj?.files ?? innerData?.files;
  if (Array.isArray(files)) {
    return files
      .filter((f: any) => typeof f?.url === 'string' && f.url.trim())
      .map((f: any) => ({ url: f.url.trim(), token: f.token, waybillNo: f.waybillNo }));
  }
  return [];
}

function extractCloudPrintPdf(innerData: any): { pdfUrl: string | null; pdfBase64: string | null; printBatchNo: string | null } {
  const files = extractCloudPrintFiles(innerData);
  if (files.length > 0) {
    return { pdfUrl: files[0].url, pdfBase64: null, printBatchNo: null };
  }

  const values: string[] = [];
  deepCollectStringValues(innerData, values);

  // Extract printBatchNo from obj (SF cloud print 2.0 async mode)
  const printBatchNo = innerData?.obj?.printBatchNo
    ?? innerData?.printBatchNo
    ?? values.find(v => /^AAAB/i.test(v) && v.length > 20)
    ?? null;

  const pdfUrl = values.find(v =>
    /^https?:\/\//i.test(v)
    && (
      v.toLowerCase().includes('.pdf')
      || v.toLowerCase().includes('download')
      || v.toLowerCase().includes('print')
      || v.toLowerCase().includes('label')
      || v.toLowerCase().includes('waybill')
    )
  ) ?? null;

  const pdfBase64 = values.find(v => /^JVBER/i.test(v) && v.length > 200) ?? null;
  return { pdfUrl, pdfBase64, printBatchNo };
}

function buildCloudPrintTemplateCandidates(): string[] {
  const partnerID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? '').trim();
  const configured = (
    process.env.SF_CLOUD_PRINT_TEMPLATE_CODE
    ?? process.env.SF_PRINT_TEMPLATE_CODE
    ?? process.env.SF_SANDBOX_PRINT_TEMPLATE
    ?? 'fm_150_standard'
  ).trim();

  const baseCodes = [configured, 'fm_150_standard', 'fm_210_standard']
    .map(v => v.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const base of baseCodes) {
    out.push(base);
    if (partnerID && !base.endsWith(`_${partnerID}`)) {
      out.push(`${base}_${partnerID}`);
    }
  }
  return Array.from(new Set(out));
}

async function cloudPrintWaybills(waybillNos: string[]): Promise<{ ok: boolean; data?: any; pdfUrl?: string | null; pdfBase64?: string | null; printBatchNo?: string | null; error?: string }> {
  const templates = buildCloudPrintTemplateCandidates();
  let lastError = '順豐未能提供雲打印面單';

  for (const templateCode of templates) {
    const msgDataObj = {
      documents: waybillNos.map(wn => ({ masterWaybillNo: wn })),
      templateCode,
      version: '2.0',
      fileType: 'pdf',
      sync: true,
    };

    console.log('[sf-label] Calling COM_RECE_CLOUD_PRINT_WAYBILLS for', waybillNos.join(','), '| template:', templateCode);
    const result = await callSfService('COM_RECE_CLOUD_PRINT_WAYBILLS', msgDataObj);
    if (!result.ok) {
      lastError = result.error ?? lastError;
      continue;
    }

    if (result.data && typeof result.data === 'object' && (result.data as any).success === false) {
      const errorMsg = String(
        (result.data as any).errorMsg
        ?? (result.data as any).errorMessage
        ?? (result.data as any).msg
        ?? '順豐未能提供雲打印面單'
      );
      lastError = errorMsg;
      // SF account-specific template mismatch: try next candidate template.
      if (errorMsg.toLowerCase().includes('templatecode') && errorMsg.toLowerCase().includes('not matched the clientcode')) {
        continue;
      }
      return { ok: false, error: errorMsg };
    }

    const printable = extractCloudPrintPdf(result.data);
    const allFiles = extractCloudPrintFiles(result.data);
    console.log('[sf-label] Cloud print files count:', allFiles.length, '| first pdfUrl=', printable.pdfUrl ? printable.pdfUrl.slice(0, 100) : null, '| pdfBase64=', printable.pdfBase64 ? 'yes' : 'no', '| printBatchNo=', printable.printBatchNo ? printable.printBatchNo.slice(0, 20) : null, '| template:', templateCode);
    if (!printable.pdfUrl && !printable.pdfBase64) {
      // SF cloud print 2.0 may return printBatchNo instead of direct PDF
      if (printable.printBatchNo) {
        console.log('[sf-label] Cloud print accepted with printBatchNo:', printable.printBatchNo, '| template:', templateCode);
        return { ok: true, data: result.data, pdfUrl: null, pdfBase64: null, printBatchNo: printable.printBatchNo };
      }
      console.warn('[sf-label] Cloud print returned without printable PDF payload | template:', templateCode);
      lastError = '順豐雲打印回傳成功，但未提供可列印PDF';
      continue;
    }

    // Download PDF(s) — return first successful one as base64 (frontend merges if multiple orders)
    if (allFiles.length > 0) {
      try {
        for (const file of allFiles) {
          console.log('[sf-label] Downloading PDF:', file.waybillNo ?? 'unknown', file.url.slice(0, 120));
          const downloadHeaders: Record<string, string> = {};
          if (file.token) downloadHeaders['X-Auth-token'] = file.token;
          const pdfRes = await fetchWithTimeout(file.url, { headers: downloadHeaders }, 30000);
          if (!pdfRes.ok) {
            console.warn('[sf-label] PDF download failed for', file.waybillNo, ':', pdfRes.status);
            continue;
          }
          const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
          console.log('[sf-label] PDF downloaded for', file.waybillNo, 'size:', pdfBuffer.length, 'bytes');
          return { ok: true, data: result.data, pdfUrl: null, pdfBase64: pdfBuffer.toString('base64') };
        }
        throw new Error('All PDF downloads failed');
      } catch (e) {
        console.warn('[sf-label] PDF download error:', e instanceof Error ? e.message : e);
        // Fallback: return the first PDF URL so client can at least open something
        return { ok: true, data: result.data, pdfUrl: allFiles[0]?.url ?? printable.pdfUrl, pdfBase64: null };
      }
    }

    return { ok: true, data: result.data, pdfUrl: printable.pdfUrl, pdfBase64: printable.pdfBase64 };
  }

  return { ok: false, error: lastError };
}

async function queryWaybillFromSearchOrder(orderId: string): Promise<string | null> {
  const result = await callSfService('EXP_RECE_SEARCH_ORDER_RESP', { orderId, language: 'Zh-CN' });
  if (!result.ok) return null;
  return extractWaybillNoFromSfData(result.data);
}

async function queryWaybillFromSearchRoutes(orderId: string): Promise<string | null> {
  const result = await callSfService('EXP_RECE_SEARCH_ROUTES', {
    trackingType: 2,
    trackingNumber: [orderId],
    methodType: 1,
    language: 'Zh-CN',
  });
  if (!result.ok) return null;
  return extractWaybillNoFromSfData(result.data);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveWaybillWithRetries(orderIdCandidates: string[]): Promise<string | null> {
  const attempts = 4;
  for (let i = 0; i < attempts; i++) {
    for (const candidate of orderIdCandidates) {
      const fromOrder = await queryWaybillFromSearchOrder(candidate);
      if (fromOrder) return fromOrder;

      const fromRoutes = await queryWaybillFromSearchRoutes(candidate);
      if (fromRoutes) return fromRoutes;
    }
    if (i < attempts - 1) {
      await sleep(900 * (i + 1));
    }
  }
  return null;
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

  // ─── Dump full request/response for debugging ──────────────
  console.log('\n' + '='.repeat(80));
  console.log(`[SF REQUEST] ${serviceCode}`);
  console.log(`  Endpoint: ${sfEndpoint}`);
  console.log(`  partnerID: ${partnerID}`);
  console.log(`  requestID: ${requestID}`);
  console.log(`  timestamp: ${timestamp}`);
  console.log(`  msgDigest: ${msgDigest}`);
  console.log(`  msgData: ${msgData}`);
  console.log('='.repeat(80));

  try {
    const sfRes = await fetchWithTimeout(sfEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    });

    const resText = await sfRes.text();
    // ─── Dump full response ──────────────────────────────────
    console.log('\n' + '-'.repeat(80));
    console.log(`[SF RESPONSE] ${serviceCode}`);
    console.log(`  HTTP Status: ${sfRes.status}`);
    console.log(`  Body: ${resText}`);
    console.log('-'.repeat(80) + '\n');
    if (!sfRes.ok) {
      return { ok: false, error: `SF HTTP ${sfRes.status}: ${resText.slice(0, 200)}` };
    }

    let json: any;
    try { json = JSON.parse(resText); } catch { return { ok: false, error: `順豐回傳非 JSON: ${resText.slice(0, 200)}` }; }

    if (String(json.apiResultCode) !== 'A1000') {
      return { ok: false, error: `SF ${json.apiResultCode}: ${json.apiErrorMsg || '未知錯誤'}` };
    }

    const innerData = parseApiResultData(json.apiResultData);
    if (serviceCode === 'COM_RECE_CLOUD_PRINT_WAYBILLS') {
      console.log('[sf-label] RAW apiResultData type:', typeof json.apiResultData, '| length:', typeof json.apiResultData === 'string' ? json.apiResultData.length : 'N/A');
      console.log('[sf-label] RAW apiResultData:', String(json.apiResultData).slice(0, 4000));
    }
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
  const authResult = await verifyAdminRequest(req, 'orders', 'read');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const body = req.body as LabelPayload;
  const orderId = body?.orderId;
  const waybillNos = body?.waybillNos;

  if (!orderId && (!waybillNos || waybillNos.length === 0)) {
    return res.status(400).json({ error: 'Missing orderId or waybillNos', code: 'BAD_REQUEST' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
  if (!supabaseKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured', code: 'CONFIG_MISSING' });
  }

  const senderName = (process.env.SF_SENDER_NAME ?? '寄件人').trim();
  const senderPhone = (process.env.SF_SENDER_PHONE ?? '').trim();
  const senderAddress = (process.env.SF_SENDER_ADDRESS ?? '').trim();
  const monthlyCard = (process.env.SF_MONTHLY_CARD ?? process.env.SF_PARTNER_ID ?? '').trim();
  if (!monthlyCard) {
    return res.status(500).json({ error: 'SF_MONTHLY_CARD not configured', code: 'CONFIG_MISSING' });
  }
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

    const explicitWaybillNos = Array.isArray(waybillNos)
      ? waybillNos.map(v => String(v || '').trim()).filter(Boolean)
      : [];
    const existingWaybill = explicitWaybillNos[0] || String(orderRow.waybill_no || '').trim();
    if (existingWaybill) {
      const printResult = await cloudPrintWaybills([existingWaybill]);
      if (!printResult.ok) {
        console.warn('[sf-label] Cloud print failed for existing waybill:', existingWaybill, '| reason:', printResult.error);
        return res.status(200).json({ success: false, error: printResult.error, code: 'SF_CLOUD_PRINT_UNAVAILABLE' });
      }
      return res.status(200).json({
        success: true,
        orderId,
        waybillNo: existingWaybill,
        labelImage: null,
        labelPdfUrl: printResult.pdfUrl ?? null,
        labelPdfBase64: printResult.pdfBase64 ?? null,
        printBatchNo: printResult.printBatchNo ?? null,
        data: printResult.data,
      });
    }

    const expressTypeId = resolveExpressTypeId(orderRow.delivery_method);
    const msgDataObj = {
      orderId: orderRow.id?.toString?.() ?? orderId,
      language: 'Zh-CN',
      monthlyCard,
      expressTypeId,
      expressType: expressTypeId, // backward compatibility for some SF environments
      isGenBillNo: 1,
      isGenWaybillNo: 1, // SF support suggested this field for immediate waybill return
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
      ...buildSfLockerFields(orderRow.delivery_method, orderRow.locker_code),
    };

    console.log('[sf-label] Calling EXP_RECE_CREATE_ORDER with isGenEletricPic=1 for', orderId);
    const result = await callSfService('EXP_RECE_CREATE_ORDER', msgDataObj);

    if (!result.ok) {
      return res.status(502).json({ error: result.error, code: 'SF_LABEL_FAILED' });
    }

    if (result.data && typeof result.data === 'object' && (result.data as any).success === false) {
      return res.status(200).json({
        success: false,
        orderId,
        code: 'SF_BUSINESS_ERROR',
        sfErrorCode: String((result.data as any).errorCode ?? ''),
        message: String((result.data as any).errorMsg ?? '順豐業務規則拒絕此訂單'),
      });
    }

    const msgData = result.data?.msgData ?? result.data;
    const waybillNo = extractWaybillNoFromSfData(result.data);
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
      labelPdfUrl: null,
      labelPdfBase64: null,
      routeLabelData: routeLabelData ?? null,
    });
  }

  if (waybillNos && waybillNos.length > 0) {
    const normalized = waybillNos.map(v => String(v || '').trim()).filter(Boolean);
    const printResult = await cloudPrintWaybills(normalized);
    if (!printResult.ok) {
      console.warn('[sf-label] Cloud print failed for waybills:', normalized.join(','), '| reason:', printResult.error);
      return res.status(200).json({ success: false, error: printResult.error, code: 'SF_CLOUD_PRINT_UNAVAILABLE' });
    }
    return res.status(200).json({
      success: true,
      waybillNos: normalized,
      labelPdfUrl: printResult.pdfUrl ?? null,
      labelPdfBase64: printResult.pdfBase64 ?? null,
      printBatchNo: printResult.printBatchNo ?? null,
      data: printResult.data,
    });
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

const SF_EXTRA_ACTIONS = {
  query_order: 'EXP_RECE_SEARCH_ORDER_RESP',
  update_order: 'EXP_RECE_UPDATE_ORDER',
  get_sub_mailno: 'EXP_RECE_GET_SUB_MAILNO',
  pre_order: 'EXP_RECE_PRE_ORDER',
  query_routes: 'EXP_RECE_SEARCH_ROUTES',
} as const;

type SfExtraAction = keyof typeof SF_EXTRA_ACTIONS;

const SF_HOME_EXPRESS_TYPE_ID = Number(
  process.env.SF_HOME_EXPRESS_TYPE_ID
  ?? '273'
) || 273;

const SF_LOCKER_EXPRESS_TYPE_ID = Number(
  process.env.SF_LOCKER_EXPRESS_TYPE_ID
  ?? '274'
) || 274;

type SfExtraInfoItem = { attrName: string; attrValue: string };

function normalizeSfDeliveryMethod(method?: string): string {
  const normalized = String(method ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === 'home') return 'sf_delivery';
  return normalized;
}

function resolveExpressTypeId(deliveryMethod?: string): number {
  const normalizedMethod = normalizeSfDeliveryMethod(deliveryMethod);
  if (normalizedMethod === 'sf_locker') return SF_LOCKER_EXPRESS_TYPE_ID;
  return SF_HOME_EXPRESS_TYPE_ID;
}

function buildSfLockerFields(deliveryMethod?: string, lockerCode?: string): {
  isOneselfPickup?: number;
  extraInfoList?: SfExtraInfoItem[];
} {
  const normalizedMethod = normalizeSfDeliveryMethod(deliveryMethod);
  const code = (lockerCode ?? '').trim();
  if (normalizedMethod !== 'sf_locker' || !code) return {};

  // Self-pickup orders must pass locker/network code as structured fields for SF sorting.
  return {
    isOneselfPickup: 1,
    extraInfoList: [{ attrName: 'destDeptCode', attrValue: code }],
  };
}

function buildSfMsgData(payload: SfOrderPayload, sender: { name: string; phone: string; address: string }) {
  const monthlyCard = (process.env.SF_MONTHLY_CARD ?? process.env.SF_PARTNER_ID ?? '').trim();
  const expressTypeId = resolveExpressTypeId(payload.delivery_method);
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
    expressTypeId,
    expressType: expressTypeId, // backward compatibility for some SF environments
    isGenBillNo: 1,
    isGenWaybillNo: 1, // SF support suggested this field for immediate waybill return
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
    ...buildSfLockerFields(payload.delivery_method, payload.locker_code),
  };
}

function validateSfRequiredFields(msgData: ReturnType<typeof buildSfMsgData>) {
  const missing: string[] = [];
  if (!msgData.orderId?.trim()) missing.push('orderId');
  if (!msgData.monthlyCard?.trim()) missing.push('monthlyCard');
  if (!(msgData as any).expressTypeId && !(msgData as any).expressType) missing.push('expressTypeId');
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
  const authResult = await verifyAdminRequest(req, 'orders', 'update');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const partnerID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? '').trim();
  const checkword = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? '').trim();
  const senderName = (process.env.SF_SENDER_NAME ?? '寄件人').trim();
  const senderPhone = (process.env.SF_SENDER_PHONE ?? '').trim();
  const senderAddress = (process.env.SF_SENDER_ADDRESS ?? '').trim();
  const sfEndpoint = getSfEndpoint();

  console.log(
    '[SF] called | endpoint:',
    sfEndpoint,
    '| partnerID:',
    partnerID.length > 0 ? '***' : '(empty)'
  );

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
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

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
  console.log(
    '[SF] Using expressTypeId:',
    (msgDataObj as any).expressTypeId,
    '| method:',
    normalizeSfDeliveryMethod(payload.delivery_method)
  );
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
    console.log('[SF] Response status:', sfRes.status);

    if (!sfRes.ok) {
      console.error('[SF] Request failed:', resText.slice(0, 300));
      return res.status(502).json({ error: '順豐請求失敗', code: 'SF_REQUEST_FAILED' });
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
    const innerData = parseApiResultData(sfResponseData.apiResultData);
    console.log('[SF][DEBUG] apiResultCode=', apiResultCode, '| apiResultData(raw)=', String(sfResponseData.apiResultData ?? '').slice(0, 1200));
    console.log('[SF][DEBUG] apiResultData(parsed)=', JSON.stringify(innerData).slice(0, 1200));
    if (innerData && typeof innerData === 'object' && (innerData as any).success === false) {
      return res.status(200).json({
        success: false,
        orderId,
        code: 'SF_BUSINESS_ERROR',
        sfErrorCode: String((innerData as any).errorCode ?? ''),
        message: String((innerData as any).errorMsg ?? '順豐業務規則拒絕此訂單'),
      });
    }

    let waybillNoStr = extractWaybillNoFromSfData(innerData);
    if (!waybillNoStr) {
      const searchOrderIdCandidates = [
        String(payload.orderId || '').trim(),
        String(orderId || '').trim(),
      ].filter(Boolean);
      waybillNoStr = await resolveWaybillWithRetries(Array.from(new Set(searchOrderIdCandidates)));
      if (waybillNoStr) {
        console.log('[SF] Waybill resolved by retry-search:', waybillNoStr);
      } else {
        console.warn('[SF] Waybill unresolved after retries. orderId=', orderId, 'payloadOrderId=', payload.orderId);
      }
    }
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

    if (!waybillNoStr) {
      return res.status(200).json({
        success: true,
        orderId,
        waybillNo: null,
        code: 'SF_ACCEPTED_NO_WAYBILL',
        message: '順豐已受理訂單，但尚未回傳運單號，請稍後重試',
      });
    }

    return res.status(200).json({ success: true, orderId, waybillNo: waybillNoStr });
  } catch (e) {
    console.error('[SF] Unhandled:', e);
    return res.status(502).json({ error: '順豐系統錯誤', code: 'SF_ERROR' });
  }
}

function defaultMsgDataForAction(action: SfExtraAction, body: any): Record<string, unknown> | null {
  if (body?.msgData && typeof body.msgData === 'object' && !Array.isArray(body.msgData)) {
    return body.msgData as Record<string, unknown>;
  }

  if (action === 'query_order') {
    const orderId = String(body?.orderId ?? '').trim();
    if (!orderId) return null;
    return { orderId, language: String(body?.language ?? 'Zh-CN') };
  }

  if (action === 'update_order') {
    const orderId = String(body?.orderId ?? '').trim();
    const dealType = Number(body?.dealType ?? body?.deal_type);
    if (!orderId || !Number.isFinite(dealType)) return null;
    return { orderId, dealType, language: String(body?.language ?? 'Zh-CN') };
  }

  return null;
}

async function handleExtraSfAction(req: any, res: any, action: SfExtraAction) {
  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const access = action === 'query_order' || action === 'query_routes' ? 'read' : 'update';
  const authResult = await verifyAdminRequest(req, 'orders', access);
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const serviceCode = SF_EXTRA_ACTIONS[action];
  const msgDataObj = defaultMsgDataForAction(action, req.body);
  if (!msgDataObj) {
    return res.status(400).json({
      error: 'Missing or invalid msgData',
      code: 'BAD_REQUEST',
      tip: action === 'query_order' || action === 'update_order'
        ? 'Provide either `msgData` or required fields (orderId / dealType)'
        : 'Provide `msgData` object from SF API spec',
    });
  }

  const result = await callSfService(serviceCode, msgDataObj);
  if (!result.ok) {
    return res.status(502).json({ success: false, serviceCode, error: result.error, code: 'SF_API_ERROR' });
  }

  if (result.data && typeof result.data === 'object' && (result.data as any).success === false) {
    return res.status(200).json({
      success: false,
      serviceCode,
      code: 'SF_BUSINESS_ERROR',
      sfErrorCode: String((result.data as any).errorCode ?? ''),
      message: String((result.data as any).errorMsg ?? '順豐業務規則拒絕'),
      data: result.data,
    });
  }

  return res.status(200).json({ success: true, serviceCode, data: result.data });
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

  const ip = getClientIp(req.headers ?? {});
  const rl = await checkRateLimit(`sf:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
  }

  const action = req.body?.action;
  if (action === 'label') return handleLabel(req, res);
  if (action === 'order') return handleOrder(req, res);
  if (action in SF_EXTRA_ACTIONS) {
    return handleExtraSfAction(req, res, action as SfExtraAction);
  }
  return res.status(400).json({
    error: 'Invalid action. Use: order, label, query_order, update_order, get_sub_mailno, pre_order, query_routes',
  });
}
