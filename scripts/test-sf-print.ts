/**
 * SF Sandbox Cloud Print quick test
 *
 * Goal:
 * - Hit COM_RECE_CLOUD_PRINT_WAYBILLS in sandbox quickly.
 * - Produce 3 successful calls for production-apply requirement.
 *
 * Usage examples:
 *   npx tsx scripts/test-sf-print.ts --waybill SF1234567890123
 *   npx tsx scripts/test-sf-print.ts --waybill SF1234567890123 --times 3
 *   npx tsx scripts/test-sf-print.ts --create-order --times 3
 *
 * Required env:
 *   SF_PARTNER_ID (or VITE_SF_CUSTOMER_CODE)
 *   SF_CHECKWORD  (or VITE_SF_CHECKWORD)
 *
 * Optional env:
 *   SF_SANDBOX_URL (default: https://sfapi-sbox.sf-express.com/std/service)
 *   SF_SANDBOX_MONTHLY_CARD (fallback: SF_MONTHLY_CARD)
 *   SF_SANDBOX_EXPRESS_TYPE_ID (default: 273)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function loadEnvFileIntoProcessEnv(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
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
    // Ignore env-file parsing errors; explicit process.env still works.
  }
}

const cwd = process.cwd();
loadEnvFileIntoProcessEnv(path.join(cwd, '.env.local'));
loadEnvFileIntoProcessEnv(path.join(cwd, '.env'));

const SANDBOX_URL = (process.env.SF_SANDBOX_URL ?? 'https://sfapi-sbox.sf-express.com/std/service').trim();
const PARTNER_ID = (process.env.SF_PARTNER_ID ?? process.env.VITE_SF_CUSTOMER_CODE ?? '').trim();
const CHECKWORD = (process.env.SF_CHECKWORD ?? process.env.VITE_SF_CHECKWORD ?? '').trim();
const MONTHLY_CARD = (process.env.SF_SANDBOX_MONTHLY_CARD ?? process.env.SF_MONTHLY_CARD ?? '').trim();
const EXPRESS_TYPE_ID = Number(process.env.SF_SANDBOX_EXPRESS_TYPE_ID ?? '273') || 273;

type JsonObject = Record<string, unknown>;

function usageAndExit(message?: string): never {
  if (message) console.error(`\n❌ ${message}\n`);
  console.log(`Usage:
  npx tsx scripts/test-sf-print.ts --waybill SF1234567890123 [--times 3]
  npx tsx scripts/test-sf-print.ts --create-order [--times 3]

Notes:
  - --waybill: use an existing sandbox waybill number directly.
  - --create-order: create one sandbox order first, then print it.
  - --times default is 3.
`);
  process.exit(1);
}

function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const md5 = crypto.createHash('md5').update(msgData + timestamp + checkword, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

function parseArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx < 0) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callSf(serviceCode: string, msgDataObj: JsonObject): Promise<JsonObject> {
  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `sandbox_print_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const msgDigest = computeMsgDigest(msgData, timestamp, CHECKWORD);

  const form = new URLSearchParams();
  form.set('partnerID', PARTNER_ID);
  form.set('requestID', requestID);
  form.set('serviceCode', serviceCode);
  form.set('timestamp', timestamp);
  form.set('msgData', msgData);
  form.set('msgDigest', msgDigest);

  const res = await fetch(SANDBOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }

  try {
    return JSON.parse(text) as JsonObject;
  } catch {
    throw new Error(`Non-JSON response: ${text.slice(0, 300)}`);
  }
}

function parseInnerData(json: JsonObject): JsonObject {
  const raw = json.apiResultData;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as JsonObject;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === 'object') return raw as JsonObject;
  return {};
}

function extractWaybill(json: JsonObject): string | null {
  const inner = parseInnerData(json);
  const msgData = (inner.msgData && typeof inner.msgData === 'object') ? inner.msgData as JsonObject : inner;
  const wbList = Array.isArray((msgData as any).waybillNoInfoList) ? (msgData as any).waybillNoInfoList : [];
  const first = wbList[0];
  const wb = first?.waybillNo;
  if (typeof wb === 'string' && wb.trim()) return wb.trim();
  return null;
}

async function createSandboxOrderAndGetWaybill(): Promise<string> {
  if (!MONTHLY_CARD) {
    throw new Error('Missing SF_SANDBOX_MONTHLY_CARD (or SF_MONTHLY_CARD) for --create-order mode');
  }

  const orderId = `SANDBOX_PRINT_${Date.now()}`;
  const payload: JsonObject = {
    orderId,
    language: 'Zh-CN',
    monthlyCard: MONTHLY_CARD,
    expressTypeId: EXPRESS_TYPE_ID,
    isGenBillNo: 1,
    isGenWaybillNo: 1,
    isGenEletricPic: 0,
    payMethod: 1,
    parcelQty: 1,
    totalWeight: 1,
    cargoDetails: [{ name: 'Sandbox Test Item', count: 1, unit: 'pcs', weight: 0.1, volume: 1, amount: 0 }],
    contactInfoList: [
      {
        contactType: 1,
        contact: 'Sandbox Sender',
        tel: '90000001',
        mobile: '90000001',
        address: 'Hong Kong Test Sender Address',
        province: '香港',
        city: '香港',
        county: '',
        company: 'Sandbox Sender',
      },
      {
        contactType: 2,
        contact: 'Sandbox Receiver',
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

  console.log(`\n[Create] EXP_RECE_CREATE_ORDER orderId=${orderId}`);
  const json = await callSf('EXP_RECE_CREATE_ORDER', payload);
  const apiCode = String(json.apiResultCode ?? '');
  const inner = parseInnerData(json);
  const innerSuccess = (inner as any).success;
  const innerError = (inner as any).errorMsg ?? (inner as any).errorCode ?? '';

  if (apiCode !== 'A1000') {
    throw new Error(`Create order failed: apiResultCode=${apiCode}, apiErrorMsg=${String(json.apiErrorMsg ?? '')}`);
  }
  if (innerSuccess === false) {
    throw new Error(`Create order business failed: ${String(innerError)}`);
  }

  const waybill = extractWaybill(json);
  if (!waybill) {
    throw new Error('Create order succeeded but no waybill returned in sandbox response');
  }
  console.log(`[Create] ✅ waybill=${waybill}`);
  return waybill;
}

async function runPrintTest(waybill: string, times: number): Promise<void> {
  let okCount = 0;
  console.log(`\n[Print] Target waybill=${waybill}, attempts=${times}`);

  for (let i = 1; i <= times; i++) {
    const payload: JsonObject = {
      documents: [{ masterWaybillNo: waybill }],
      templateCode: 'fm_150_standard_HKCFEX',
      version: '2.0',
      fileType: 'pdf',
    };

    const json = await callSf('COM_RECE_CLOUD_PRINT_WAYBILLS', payload);
    const apiCode = String(json.apiResultCode ?? '');
    const inner = parseInnerData(json);
    const innerSuccess = (inner as any).success;
    const innerErrCode = String((inner as any).errorCode ?? '');
    const innerErrMsg = String((inner as any).errorMsg ?? '');

    const success = apiCode === 'A1000' && innerSuccess !== false;
    if (success) {
      okCount++;
      console.log(`[${i}/${times}] ✅ success | apiResultCode=${apiCode}`);
    } else {
      console.log(
        `[${i}/${times}] ❌ fail | apiResultCode=${apiCode} | innerError=${innerErrCode} ${innerErrMsg}`.trim()
      );
    }

    await sleep(700);
  }

  console.log(`\nDone: ${okCount}/${times} successful cloud-print calls`);
  if (okCount < times) {
    process.exitCode = 1;
  }
}

async function main() {
  if (!PARTNER_ID || !CHECKWORD) {
    usageAndExit('Missing SF_PARTNER_ID / SF_CHECKWORD (or VITE_SF_CUSTOMER_CODE / VITE_SF_CHECKWORD)');
  }

  const waybillArg = parseArg('--waybill');
  const timesArg = parseArg('--times');
  const times = timesArg ? Number(timesArg) : 3;
  const createOrderMode = hasFlag('--create-order');

  if (!Number.isFinite(times) || times <= 0) {
    usageAndExit('--times must be a positive number');
  }

  if (!!waybillArg === !!createOrderMode) {
    usageAndExit('Use exactly one mode: --waybill <NO> OR --create-order');
  }

  console.log(`Endpoint   : ${SANDBOX_URL}`);
  console.log(`PartnerID  : ${PARTNER_ID}`);
  console.log(`Mode       : ${createOrderMode ? 'create-order' : 'waybill'}`);

  const waybill = createOrderMode ? await createSandboxOrderAndGetWaybill() : String(waybillArg).trim();
  if (!waybill) usageAndExit('Empty waybill');

  await runPrintTest(waybill, Math.floor(times));
}

main().catch((err) => {
  console.error('\nScript failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});

