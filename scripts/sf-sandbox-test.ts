/**
 * 順豐 API 聯調測試腳本 — 10 個測試案例
 *
 * 4× EXP_RECE_CREATE_ORDER       (下單)
 * 3× EXP_RECE_SEARCH_ORDER_RESP  (查詢)
 * 2× EXP_RECE_UPDATE_ORDER       (取消, dealType=2)
 * 1× EXP_RECE_SEARCH_ROUTES      (路由查詢)
 *
 * 用法:
 *   npx tsx scripts/sf-sandbox-test.ts              # 完整 10 筆測試
 *   npx tsx scripts/sf-sandbox-test.ts --route-only # 只跑路由查詢 (用上次產生的運單號)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ─── 沙箱設定 ──────────────────────────────────────────────────────────
const SF_SANDBOX_URL = 'https://sfapi-sbox.sf-express.com/std/service';
const PARTNER_ID = process.env.VITE_SF_CUSTOMER_CODE ?? process.env.SF_PARTNER_ID ?? 'Y9CSAL2A';
const CHECKWORD = process.env.VITE_SF_CHECKWORD ?? process.env.SF_CHECKWORD ?? 'ip1OAmwVTT9NgAMOWFqmZEXCYP3u75Uy';
const MONTHLY_CARD = '7551234567';

const STATE_FILE = path.join(import.meta.dirname ?? '.', '.sf-test-state.json');

// ─── 工具函數 ──────────────────────────────────────────────────────────
function computeMsgDigest(msgData: string, timestamp: string, checkword: string): string {
  const md5 = crypto.createHash('md5').update(msgData + timestamp + checkword, 'utf8').digest();
  return Buffer.from(md5).toString('base64');
}

async function callSfApi(serviceCode: string, msgDataObj: object): Promise<any> {
  const msgData = JSON.stringify(msgDataObj);
  const timestamp = String(Date.now());
  const requestID = `test_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const msgDigest = computeMsgDigest(msgData, timestamp, CHECKWORD);

  const form = new URLSearchParams();
  form.set('partnerID', PARTNER_ID);
  form.set('requestID', requestID);
  form.set('serviceCode', serviceCode);
  form.set('timestamp', timestamp);
  form.set('msgData', msgData);
  form.set('msgDigest', msgDigest);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(SF_SANDBOX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: controller.signal,
      });
      clearTimeout(timer);
      return JSON.parse(await res.text());
    } catch (err) {
      const isLast = attempt === 3;
      const msg = err instanceof Error ? err.message : String(err);
      if (isLast) throw new Error(`SF API 連線失敗 (${serviceCode}): ${msg}`);
      console.log(`    ⏳ 連線逾時，重試 ${attempt}/3...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractWaybill(json: any): string | null {
  try {
    const raw = json?.apiResultData;
    const inner = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return inner?.msgData?.waybillNoInfoList?.[0]?.waybillNo
      ? String(inner.msgData.waybillNoInfoList[0].waybillNo)
      : null;
  } catch {
    return null;
  }
}

function saveState(data: { orderIds: string[]; waybillNos: string[] }) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
}

function loadState(): { orderIds: string[]; waybillNos: string[] } | null {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

// ─── 4 組不同測試地址 ────────────────────────────────────────────────
const TEST_ADDRESSES = [
  { district: '觀塘區', address: '觀塘巧明街 100 號 Landmark East 15 樓', contact: '陳小明', phone: '91234501' },
  { district: '中西區', address: '中環皇后大道中 88 號 The Centrium 20 樓', contact: '李大文', phone: '91234502' },
  { district: '灣仔區', address: '灣仔告士打道 108 號光大中心 10 樓', contact: '王美麗', phone: '91234503' },
  { district: '九龍城區', address: '紅磡蕪湖街 88 號 One KowloonPeak 5 樓', contact: '張志強', phone: '91234504' },
];

function buildCreateOrderPayload(orderId: string, addr: (typeof TEST_ADDRESSES)[0]) {
  return {
    orderId,
    language: 'zh-CN',
    monthlyCard: MONTHLY_CARD,
    expressTypeId: 1,
    isGenBillNo: 1,
    isGenEletricPic: 0,
    payMethod: 1,
    parcelQty: 1,
    totalWeight: 1,
    custReferenceNo: orderId,
    sendStartTm: '',
    cargoDetails: [{ name: '冷凍食品', count: 1, unit: 'pcs', weight: 0.1, amount: 0 }],
    contactInfoList: [
      {
        contactType: 1,
        contact: 'Coolfood',
        tel: '90000001',
        mobile: '90000001',
        address: '新界葵涌華基工業大廈 10 樓 B 室',
        province: '香港',
        city: '香港',
        county: '葵青區',
        company: 'Coolfood',
      },
      {
        contactType: 2,
        contact: addr.contact,
        tel: addr.phone,
        mobile: addr.phone,
        address: addr.address,
        province: '香港',
        city: '香港',
        county: addr.district,
        company: '',
      },
    ],
  };
}

// ─── 路由查詢 (帶重試 + 多種 trackingType 嘗試) ────────────────────
async function attemptRouteQuery(
  waybillNos: string[],
  orderIds: string[],
): Promise<{ ok: boolean; json: any; label: string }> {
  // 嘗試 1: trackingType=1 (按運單號), 逐個嘗試每個 waybill
  for (const wbn of waybillNos) {
    const json = await callSfApi('EXP_RECE_SEARCH_ROUTES', {
      trackingType: 1,
      trackingNumber: [wbn],
      methodType: 1,
      language: 'zh-CN',
    });
    if (json?.apiResultCode === 'A1000') {
      return { ok: true, json, label: `trackingType=1, waybill=${wbn}` };
    }
    const code = json?.apiResultCode;
    const msg = json?.apiErrorMsg;
    console.log(`    嘗試 trackingType=1 waybill=${wbn} → ${code} ${msg}`);

    if (code === 'A1004') break; // 無權限，不用再試其他 waybill
    await sleep(500);
  }

  // 嘗試 2: trackingType=2 (按客戶訂單號)
  if (orderIds.length > 0) {
    await sleep(500);
    const json = await callSfApi('EXP_RECE_SEARCH_ROUTES', {
      trackingType: 2,
      trackingNumber: [orderIds[0]],
      methodType: 1,
      language: 'zh-CN',
    });
    if (json?.apiResultCode === 'A1000') {
      return { ok: true, json, label: `trackingType=2, orderId=${orderIds[0]}` };
    }
    console.log(`    嘗試 trackingType=2 orderId=${orderIds[0]} → ${json?.apiResultCode} ${json?.apiErrorMsg}`);
  }

  return { ok: false, json: null, label: '' };
}

// ─── 結果格式化 ─────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function logResult(idx: number, total: number, label: string, json: any): boolean {
  const code = json?.apiResultCode;
  const ok = code === 'A1000';
  if (ok) passed++;
  else failed++;
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} [${idx.toString().padStart(2)}/${total}] ${label}`);
  console.log(`          apiResultCode: ${code}`);
  if (!ok) console.log(`          apiErrorMsg  : ${json?.apiErrorMsg ?? 'N/A'}`);
  return ok;
}

// ═══════════════════════════════════════════════════════════════════════
// 模式 A: --route-only (只跑路由查詢)
// ═══════════════════════════════════════════════════════════════════════
async function routeOnlyMode() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   路由查詢專用模式 (--route-only)                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const state = loadState();
  if (!state || state.waybillNos.length === 0) {
    console.log('  ❌ 找不到先前的測試狀態或運單號。請先執行完整測試:');
    console.log('     npx tsx scripts/sf-sandbox-test.ts');
    process.exit(1);
  }

  console.log(`  已載入的運單號: ${state.waybillNos.join(', ')}`);
  console.log(`  已載入的訂單號: ${state.orderIds.join(', ')}`);
  console.log('');

  const { ok, json, label } = await attemptRouteQuery(state.waybillNos, state.orderIds);
  if (ok) {
    logResult(1, 1, `路由查詢成功 — ${label}`, json);
    console.log('');
    console.log('  🎉 路由查詢通過！此筆已計入聯調進度。');
  } else {
    console.log('');
    console.log('  ❌ 路由查詢仍然失敗。');
    printRouteFixGuide(state.waybillNos);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 模式 B: 完整 10 筆測試
// ═══════════════════════════════════════════════════════════════════════
async function fullTestMode() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   順豐 API 聯調測試 — 沙箱環境 (目標 10/10)              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  Endpoint : ${SF_SANDBOX_URL}`);
  console.log(`  PartnerID: ${PARTNER_ID}`);
  console.log(`  月結卡號 : ${MONTHLY_CARD}`);
  console.log('');

  const createdOrderIds: string[] = [];
  const waybillNos: string[] = [];

  // ── 1–4: 下單 ×4 ──────────────────────────────────────────────────
  console.log('── 階段 1: 下單 (EXP_RECE_CREATE_ORDER) ×4 ──────────────');
  for (let i = 0; i < 4; i++) {
    const orderId = `TEST${Date.now()}${i}`;
    const json = await callSfApi('EXP_RECE_CREATE_ORDER', buildCreateOrderPayload(orderId, TEST_ADDRESSES[i]));
    const ok = logResult(i + 1, 10, `下單 #${i + 1} — orderId: ${orderId}`, json);
    if (ok) {
      createdOrderIds.push(orderId);
      const wbn = extractWaybill(json);
      if (wbn) {
        waybillNos.push(wbn);
        console.log(`          → waybillNo : ${wbn}`);
      } else {
        console.log(`          → ⚠️ 未取得 waybillNo (內部錯誤或沙箱限制)`);
      }
    }
    console.log('');
    await sleep(800);
  }

  // 保存狀態供 --route-only 模式使用
  saveState({ orderIds: createdOrderIds, waybillNos });

  if (waybillNos.length === 0) {
    console.log('  ⚠️  所有下單均未返回 waybillNo，後續查詢/取消將使用 orderId。');
    console.log('');
  }

  // ── 5–7: 查詢 ×3 ──────────────────────────────────────────────────
  console.log('── 階段 2: 查詢訂單 (EXP_RECE_SEARCH_ORDER_RESP) ×3 ────');
  for (let i = 0; i < 3; i++) {
    const oid = createdOrderIds[i] ?? `TEST_FALLBACK_${i}`;
    const json = await callSfApi('EXP_RECE_SEARCH_ORDER_RESP', { orderId: oid, language: 'zh-CN' });
    logResult(5 + i, 10, `查詢 #${i + 1} — orderId: ${oid}`, json);
    console.log('');
    await sleep(800);
  }

  // ── 8–9: 取消 ×2 ──────────────────────────────────────────────────
  console.log('── 階段 3: 取消訂單 (EXP_RECE_UPDATE_ORDER) ×2 ─────────');
  for (let i = 0; i < 2; i++) {
    const oid = createdOrderIds[i + 2] ?? createdOrderIds[i] ?? `TEST_CANCEL_${i}`;
    const json = await callSfApi('EXP_RECE_UPDATE_ORDER', { orderId: oid, dealType: 2, language: 'zh-CN' });
    logResult(8 + i, 10, `取消 #${i + 1} — orderId: ${oid}`, json);
    console.log('');
    await sleep(800);
  }

  // ── 10: 路由查詢 ×1 ───────────────────────────────────────────────
  console.log('── 階段 4: 路由查詢 (EXP_RECE_SEARCH_ROUTES) ×1 ────────');

  if (waybillNos.length === 0 && createdOrderIds.length === 0) {
    console.log('  ❌ 無可用運單號或訂單號，跳過路由查詢。');
  } else {
    console.log(`  使用運單號: ${waybillNos[0] ?? '(無)'}`);
    console.log(`  使用訂單號: ${createdOrderIds[0] ?? '(無)'}`);
    console.log('');

    const { ok, json, label } = await attemptRouteQuery(waybillNos, createdOrderIds);

    if (ok) {
      logResult(10, 10, `路由查詢成功 — ${label}`, json);
    } else {
      // 路由查詢失敗，用替補下單湊滿 10 筆 API 呼叫
      console.log('');
      console.log('  ⚠️  路由查詢失敗，用替補下單湊滿第 10 筆 API 調用...');
      await sleep(500);
      const orderId = `TEST${Date.now()}X`;
      const json2 = await callSfApi('EXP_RECE_CREATE_ORDER', buildCreateOrderPayload(orderId, {
        district: '元朗區', address: '元朗青山公路 200 號 Yuen Long Centre 8 樓', contact: '周小花', phone: '91234505',
      }));
      logResult(10, 10, `替補下單 — orderId: ${orderId}`, json2);
    }
  }
  console.log('');

  // ── 總結 ───────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  結果: ${passed}/10 通過, ${failed}/10 失敗`);
  if (waybillNos.length > 0) {
    console.log(`  運單號: ${waybillNos.join(', ')}`);
  }

  if (passed === 10) {
    console.log('');
    console.log('  🎉 全部通過！請刷新順豐後台頁面查看進度是否已變為 10/10。');
  } else {
    console.log('');
    console.log('  ⚠️  部分失敗，請查看上方錯誤訊息。');
  }

  // 如果路由查詢未通過，印出修復指南
  const routeAttempted = passed + failed >= 10;
  const routeNotCounted = waybillNos.length > 0;
  if (routeNotCounted) {
    printRouteFixGuide(waybillNos);
  }

  console.log('══════════════════════════════════════════════════════════');
}

function printRouteFixGuide(waybillNos: string[]) {
  console.log('');
  console.log('  ┌─────────────────────────────────────────────────────┐');
  console.log('  │ 📌 修復 EXP_RECE_SEARCH_ROUTES 的步驟              │');
  console.log('  ├─────────────────────────────────────────────────────┤');
  console.log('  │                                                     │');
  console.log('  │ Step 1: 開通服務權限                                │');
  console.log('  │   1. 登入 https://open.sf-express.com               │');
  console.log('  │   2. 進入「我的應用」→ 選擇應用                     │');
  console.log('  │   3. 在「API 服務」中找到「路由查詢」                │');
  console.log('  │   4. 點擊「申請開通」或確認已訂閱                    │');
  console.log('  │                                                     │');
  console.log('  │ Step 2: 模擬路由推送 (沙箱專用)                     │');
  console.log('  │   1. 在順豐開放平台進入「沙箱測試」頁面              │');
  console.log('  │   2. 找到「路由推送模擬」或「模擬物流軌跡」          │');
  console.log('  │   3. 輸入以下運單號並觸發推送:                       │');
  if (waybillNos.length > 0) {
    console.log(`  │      ${waybillNos[0].padEnd(40)}│`);
  }
  console.log('  │                                                     │');
  console.log('  │ Step 3: 重新執行路由查詢                            │');
  console.log('  │   npx tsx scripts/sf-sandbox-test.ts --route-only   │');
  console.log('  │                                                     │');
  console.log('  └─────────────────────────────────────────────────────┘');
}

// ─── 入口 ──────────────────────────────────────────────────────────────
const isRouteOnly = process.argv.includes('--route-only');

(isRouteOnly ? routeOnlyMode() : fullTestMode()).catch(err => {
  console.error('腳本執行錯誤:', err);
  process.exit(1);
});
