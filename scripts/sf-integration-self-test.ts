/**
 * SF integration self-test (single command).
 *
 * What it does:
 * 1) Calls key SF pull APIs directly:
 *    - EXP_RECE_CREATE_ORDER
 *    - EXP_RECE_SEARCH_ORDER_RESP
 *    - EXP_RECE_UPDATE_ORDER
 *    - EXP_RECE_GET_SUB_MAILNO
 *    - EXP_RECE_PRE_ORDER
 *    - EXP_RECE_SEARCH_ROUTES
 * 2) Optionally simulates callback pushes to your app:
 *    - /api/webhooks/sf-status
 *    - /api/webhooks/sf-events
 *
 * Usage:
 *   npx tsx scripts/sf-integration-self-test.ts
 *   npx tsx scripts/sf-integration-self-test.ts --times 3
 *   npx tsx scripts/sf-integration-self-test.ts --base-url https://your-domain.com
 *   npx tsx scripts/sf-integration-self-test.ts --times 3 --failed-only
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

type JsonObject = Record<string, unknown>;

function loadEnvFileIntoProcessEnv(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const valueRaw = line.slice(eq + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      const quoted =
        (valueRaw.startsWith('"') && valueRaw.endsWith('"'))
        || (valueRaw.startsWith("'") && valueRaw.endsWith("'"));
      process.env[key] = quoted ? valueRaw.slice(1, -1) : valueRaw;
    }
  } catch {
    // Ignore dotenv parse errors in helper script.
  }
}

const cwd = process.cwd();
loadEnvFileIntoProcessEnv(path.join(cwd, '.env.local'));
loadEnvFileIntoProcessEnv(path.join(cwd, '.env'));

const SF_SANDBOX_URL = 'https://sfapi-sbox.sf-express.com/std/service';
const SF_PROD_URL = 'https://sfapi.sf-express.com/std/service';

const PARTNER_ID = (process.env.SF_PARTNER_ID ?? process.env.SF_CLIENT_CODE ?? process.env.VITE_SF_CUSTOMER_CODE ?? '').trim();
const CHECKWORD = (process.env.SF_CHECKWORD ?? process.env.SF_CHECK_WORD ?? process.env.VITE_SF_CHECKWORD ?? '').trim();
const SF_ENV = (process.env.SF_ENV ?? process.env.VITE_SF_ENV ?? 'demo').trim().toLowerCase();
const MONTHLY_CARD = (
  process.env.SF_MONTHLY_CARD
  ?? process.env.SF_SANDBOX_MONTHLY_CARD
  ?? ((SF_ENV === 'prod' || SF_ENV === 'production') ? PARTNER_ID : '7551234567')
).trim();
const SF_ENDPOINT = SF_ENV === 'prod' || SF_ENV === 'production' ? SF_PROD_URL : SF_SANDBOX_URL;
const EXPRESS_TYPE_ID = Number(process.env.SF_HOME_EXPRESS_TYPE_ID ?? '273') || 273;

const SENDER_NAME = (process.env.SF_SENDER_NAME ?? 'Coolfood Sender').trim();
const SENDER_PHONE = (process.env.SF_SENDER_PHONE ?? '90000001').trim();
const SENDER_ADDRESS = (process.env.SF_SENDER_ADDRESS ?? 'Hong Kong Sender Address').trim();

type TestResult = {
  name: string;
  passed: boolean;
  detail: string;
};

function parseArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const md5 = crypto.createHash('md5').update(msgData + timestamp + checkword, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

function parseApiResultData(raw: unknown): JsonObject {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as JsonObject;
      return {};
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as JsonObject;
  return {};
}

function extractWaybill(innerData: JsonObject): string | null {
  const msgData = parseApiResultData(innerData.msgData);
  const candidates = [
    (msgData as any)?.waybillNoInfoList?.[0]?.waybillNo,
    (msgData as any)?.routeLabelInfo?.[0]?.routeLabelData?.waybillNo,
    (innerData as any)?.mailNo,
    (innerData as any)?.mainMailNo,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

async function callSf(serviceCode: string, msgDataObj: JsonObject): Promise<{ apiCode: string; apiErrorMsg: string; innerData: JsonObject }> {
  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sf_selftest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const msgDigest = computeMsgDigest(msgData, timestamp, CHECKWORD);

  const form = new URLSearchParams();
  form.set('partnerID', PARTNER_ID);
  form.set('requestID', requestID);
  form.set('serviceCode', serviceCode);
  form.set('timestamp', timestamp);
  form.set('msgData', msgData);
  form.set('msgDigest', msgDigest);

  const res = await fetch(SF_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${serviceCode} HTTP ${res.status}: ${text.slice(0, 250)}`);
  }
  let json: JsonObject;
  try {
    json = JSON.parse(text) as JsonObject;
  } catch {
    throw new Error(`${serviceCode} returned non-JSON`);
  }
  return {
    apiCode: String(json.apiResultCode ?? ''),
    apiErrorMsg: String(json.apiErrorMsg ?? ''),
    innerData: parseApiResultData(json.apiResultData),
  };
}

function sfBusinessStatus(innerData: JsonObject): { ok: boolean; errorText: string } {
  const success = (innerData as any)?.success;
  if (success === false) {
    const code = String((innerData as any)?.errorCode ?? '');
    const msg = String((innerData as any)?.errorMsg ?? '');
    return { ok: false, errorText: [code, msg].filter(Boolean).join(' ') || 'business rejected' };
  }
  return { ok: true, errorText: '' };
}

function mark(name: string, pass: boolean, detail: string): TestResult {
  const icon = pass ? 'PASS' : 'FAIL';
  console.log(`[${icon}] ${name}: ${detail}`);
  return { name, passed: pass, detail };
}

function aggregate(name: string, runs: TestResult[]): TestResult {
  const okCount = runs.filter(r => r.passed).length;
  const last = runs[runs.length - 1];
  return {
    name,
    passed: okCount === runs.length,
    detail: `${okCount}/${runs.length} passed${last ? `; last=${last.detail}` : ''}`,
  };
}

function buildCreateOrderPayload(orderId: string): JsonObject {
  return {
    orderId,
    language: 'Zh-CN',
    monthlyCard: MONTHLY_CARD,
    expressTypeId: EXPRESS_TYPE_ID,
    expressType: EXPRESS_TYPE_ID,
    isGenBillNo: 1,
    isGenWaybillNo: 1,
    isGenEletricPic: 0,
    payMethod: 1,
    parcelQty: 1,
    totalWeight: 1,
    cargoDetails: [{ name: 'Self Test Item', count: 1, unit: 'pcs', weight: 0.1, volume: 1, amount: 0 }],
    contactInfoList: [
      {
        contactType: 1,
        contact: SENDER_NAME,
        tel: SENDER_PHONE,
        mobile: SENDER_PHONE,
        address: SENDER_ADDRESS,
        province: '香港',
        city: '香港',
        county: '',
        company: SENDER_NAME,
      },
      {
        contactType: 2,
        contact: 'SF Self Test Receiver',
        tel: '90000002',
        mobile: '90000002',
        address: 'Hong Kong Test Receiver Address',
        province: '香港',
        city: '香港',
        county: '觀塘區',
        company: '',
      },
    ],
  };
}

async function testWebhook(
  baseUrl: string,
  endpoint: string,
  serviceCode: string,
  payload: JsonObject
): Promise<TestResult> {
  const msgData = JSON.stringify(payload);
  const timestamp = String(Date.now());
  const msgDigest = computeMsgDigest(msgData, timestamp, CHECKWORD);

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partnerID: PARTNER_ID,
      requestID: `cb_${Date.now()}`,
      serviceCode,
      timestamp,
      msgDigest,
      msgData,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    return mark(`${serviceCode} webhook`, false, `HTTP ${res.status} ${text.slice(0, 120)}`);
  }
  return mark(`${serviceCode} webhook`, true, `HTTP 200`);
}

async function main() {
  if (!PARTNER_ID || !CHECKWORD) {
    throw new Error('Missing SF_PARTNER_ID/SF_CHECKWORD (or equivalent vars)');
  }
  if (!MONTHLY_CARD) {
    throw new Error('Missing SF_MONTHLY_CARD (fallback to partnerID also failed)');
  }

  const baseUrlArg = parseArg('--base-url');
  const baseUrl = String(baseUrlArg ?? process.env.SF_SELF_TEST_BASE_URL ?? '').trim().replace(/\/$/, '');
  const timesArg = parseArg('--times');
  const times = Math.floor(Number(timesArg ?? '1'));
  const failedOnly = hasFlag('--failed-only');
  if (!Number.isFinite(times) || times < 1) throw new Error('--times must be >= 1');

  console.log(`SF endpoint : ${SF_ENDPOINT}`);
  console.log(`SF env      : ${SF_ENV}`);
  console.log(`Partner ID  : ${PARTNER_ID}`);
  console.log(`Base URL    : ${baseUrl || '(skip webhook simulation)'}`);
  console.log(`Times       : ${times}`);
  console.log(`Mode        : ${failedOnly ? 'failed-only' : 'full'}`);
  console.log('');

  const runResultsByApi = new Map<string, TestResult[]>();

  function collect(result: TestResult) {
    const list = runResultsByApi.get(result.name) ?? [];
    list.push(result);
    runResultsByApi.set(result.name, list);
  }

  for (let runIndex = 0; runIndex < times; runIndex++) {
    console.log(`\n----- RUN ${runIndex + 1}/${times} -----`);
    const orderId = `SF_SELFTEST_${Date.now()}_${runIndex + 1}`;
    let waybillNo: string | null = null;

    try {
      const create = await callSf('EXP_RECE_CREATE_ORDER', buildCreateOrderPayload(orderId));
      const business = sfBusinessStatus(create.innerData);
      waybillNo = extractWaybill(create.innerData);
      collect(mark(
        'EXP_RECE_CREATE_ORDER',
        create.apiCode === 'A1000' && business.ok,
        `api=${create.apiCode}${business.errorText ? `, err=${business.errorText}` : ''}${waybillNo ? `, waybill=${waybillNo}` : ''}`
      ));
    } catch (e) {
      collect(mark('EXP_RECE_CREATE_ORDER', false, e instanceof Error ? e.message : String(e)));
    }

    if (!failedOnly) {
      try {
        const q = await callSf('EXP_RECE_SEARCH_ORDER_RESP', { orderId, language: 'Zh-CN' });
        const business = sfBusinessStatus(q.innerData);
        collect(mark(
          'EXP_RECE_SEARCH_ORDER_RESP',
          q.apiCode === 'A1000' && business.ok,
          `api=${q.apiCode}${business.errorText ? `, err=${business.errorText}` : ''}`
        ));
      } catch (e) {
        collect(mark('EXP_RECE_SEARCH_ORDER_RESP', false, e instanceof Error ? e.message : String(e)));
      }

      try {
        const sub = await callSf('EXP_RECE_GET_SUB_MAILNO', {
          orderId,
          language: 'Zh-CN',
          applyNum: 1,
          ...(waybillNo ? { mainMailNo: waybillNo } : {}),
        });
        const business = sfBusinessStatus(sub.innerData);
        collect(mark(
          'EXP_RECE_GET_SUB_MAILNO',
          sub.apiCode === 'A1000' && business.ok,
          `api=${sub.apiCode}${business.errorText ? `, err=${business.errorText}` : ''}`
        ));
      } catch (e) {
        collect(mark('EXP_RECE_GET_SUB_MAILNO', false, e instanceof Error ? e.message : String(e)));
      }

      try {
        const u = await callSf('EXP_RECE_UPDATE_ORDER', { orderId, dealType: 2, language: 'Zh-CN' });
        const business = sfBusinessStatus(u.innerData);
        collect(mark(
          'EXP_RECE_UPDATE_ORDER',
          u.apiCode === 'A1000' && business.ok,
          `api=${u.apiCode}${business.errorText ? `, err=${business.errorText}` : ''}`
        ));
      } catch (e) {
        collect(mark('EXP_RECE_UPDATE_ORDER', false, e instanceof Error ? e.message : String(e)));
      }

      try {
        const pre = await callSf('EXP_RECE_PRE_ORDER', {
          ...buildCreateOrderPayload(`${orderId}_PRE`),
          orderId: `${orderId}_PRE`,
        });
        const business = sfBusinessStatus(pre.innerData);
        collect(mark(
          'EXP_RECE_PRE_ORDER',
          pre.apiCode === 'A1000' && business.ok,
          `api=${pre.apiCode}${business.errorText ? `, err=${business.errorText}` : ''}`
        ));
      } catch (e) {
        collect(mark('EXP_RECE_PRE_ORDER', false, e instanceof Error ? e.message : String(e)));
      }
    }

    try {
      const routes = await callSf('EXP_RECE_SEARCH_ROUTES', {
        trackingType: 2,
        trackingNumber: [orderId],
        methodType: 1,
        language: 'Zh-CN',
      });
      collect(mark(
        'EXP_RECE_SEARCH_ROUTES',
        routes.apiCode === 'A1000',
        `api=${routes.apiCode}${routes.apiErrorMsg ? `, msg=${routes.apiErrorMsg}` : ''}`
      ));
    } catch (e) {
      collect(mark('EXP_RECE_SEARCH_ROUTES', false, e instanceof Error ? e.message : String(e)));
    }

    if (baseUrl) {
      try {
        const fakeWaybill = waybillNo || 'SF_SELFTEST_WAYBILL';
        collect(await testWebhook(baseUrl, '/api/webhooks/sf-status', 'EXP_RECE_SEARCH_ROUTES', {
          mailNo: fakeWaybill,
          routes: [{ opCode: '50', remark: 'self test shipped', acceptTime: new Date().toISOString() }],
        }));
        collect(await testWebhook(baseUrl, '/api/webhooks/sf-events', 'EXP_RECE_DELIVERY_NOTICE', {
          orderId,
          mailNo: fakeWaybill,
          notice: 'self test delivery notice',
        }));
        collect(await testWebhook(baseUrl, '/api/webhooks/sf-events', 'EXP_RECE_WANTED_INTERCEPT', {
          orderId,
          mailNo: fakeWaybill,
          interceptReason: 'self test intercept',
        }));
        collect(await testWebhook(baseUrl, '/api/webhooks/sf-events', 'COM_RECE_CEMP_ORDER_UNAVAILABLE_NOTICE', {
          orderId,
          mailNo: fakeWaybill,
          reason: 'self test cemp unavailable',
        }));
      } catch (e) {
        collect(mark('Webhook simulation', false, e instanceof Error ? e.message : String(e)));
      }
    }
  }

  console.log('\n========== SF INTEGRATION SUMMARY ==========');
  const summary = Array.from(runResultsByApi.entries()).map(([name, runs]) => aggregate(name, runs));
  const passed = summary.filter(r => r.passed).length;
  for (const item of summary) {
    console.log(`${item.passed ? 'OK ' : 'ERR'} ${item.name} (${item.detail})`);
  }
  console.log(`Result: ${passed}/${summary.length} APIs fully passed`);

  if (summary.some(r => !r.passed)) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Self-test failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

