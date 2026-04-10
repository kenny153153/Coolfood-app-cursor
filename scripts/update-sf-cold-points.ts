#!/usr/bin/env npx tsx
/**
 * 順豐冷運自提點數據更新腳本 v3 (Playwright)
 * =============================================
 * 用途：使用無頭瀏覽器爬取順豐官方「順豐站地址」頁面，
 *       篩選支援冷運服務的站點，更新 sfColdPickupPoints.ts
 *
 * 使用方法（在專案根目錄執行）：
 *   npx tsx scripts/update-sf-cold-points.ts
 *
 * 首次使用需安裝 Playwright：
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 * 重要行為：
 *   1. 使用 Playwright (Chromium) 載入順豐網頁，等待 DOM 渲染完成
 *   2. 解析「順豐站地址」表格，篩選冷運服務 = "適用" 的站點
 *   3. 從地址中自動提取地區（18 區）
 *   4. 新舊數量比對 — 若新數據驟降超過 40%，拒絕更新
 *   5. 保留 MANUAL_OVERRIDES 區塊（手動加註 / 排除不受影響）
 *   6. 只覆蓋 SF_COLD_PICKUP_DISTRICTS_RAW 區塊
 *
 * 可選參數：
 *   --force    跳過安全驗證，強制更新
 *   --headed   使用有頭瀏覽器（可視化偵錯用）
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────────────────────────
// 常數
// ────────────────────────────────────────────────────────────────────

const SF_STORE_URLS = [
  'https://hk.sf-express.com/hk/tc/more/sf-store-address',
  'https://hk.sf-express.com/hk/en/more/sf-store-address',
  'https://htm.sf-express.com/hk/tc/dynamic_function/S.F.Network/SF_store_address/',
  'https://htm.sf-express.com/HK/tc/dynamic_function/store/',
];

/** 新數據若比舊數據少超過此比例，拒絕更新 */
const DROP_THRESHOLD = 0.40;
/** 最低可接受的抓取站點數 */
const MIN_ABSOLUTE_POINTS = 10;

// 香港 18 區列表（用於從地址中提取地區）
const HK_DISTRICTS_18 = [
  '中西區', '灣仔區', '東區', '南區',
  '油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區',
  '荃灣區', '屯門區', '元朗區', '北區', '大埔區', '沙田區', '西貢區', '葵青區', '離島區',
];

const REGION_ORDER: Record<string, number> = {
  '中西區': 1, '灣仔區': 2, '東區': 3, '南區': 4,
  '油尖旺區': 10, '深水埗區': 11, '九龍城區': 12, '黃大仙區': 13, '觀塘區': 14,
  '荃灣區': 15, '屯門區': 16, '元朗區': 17, '北區': 18, '大埔區': 19,
  '沙田區': 20, '西貢區': 21, '葵青區': 22, '離島區': 23,
};

// ────────────────────────────────────────────────────────────────────
// 類型
// ────────────────────────────────────────────────────────────────────

interface ScrapedPoint {
  code: string;
  name: string;
  address: string;
  area: string;       // 子區域 e.g. "上環"
  district: string;   // 18 區 e.g. "中西區"
  region: string;     // 大區 e.g. "香港島"
  hours: { weekday: string; saturday: string; sunday: string };
}

interface OldStats {
  totalPoints: number;
  allCodes: Set<string>;
}

interface ManualOverrides {
  excludeBlock: string;
  includeBlock: string;
}

interface ValidationResult {
  passed: boolean;
  oldCount: number;
  newCount: number;
  dropPercent: number;
  addedCodes: string[];
  removedCodes: string[];
  warnings: string[];
}

// ────────────────────────────────────────────────────────────────────
// Step 0: 讀取舊數據 + 手動加註
// ────────────────────────────────────────────────────────────────────

function readOldStats(filePath: string): OldStats {
  const stats: OldStats = { totalPoints: 0, allCodes: new Set() };
  if (!fs.existsSync(filePath)) return stats;
  const content = fs.readFileSync(filePath, 'utf-8');

  // 只計算 RAW 數據區塊中的 code，排除註解中的佔位符
  // 匹配 "code: '852XXX'" 中以 852 開頭的真實站點碼
  for (const m of content.matchAll(/^\s+code:\s*'(852[A-Z0-9]+)'/gm)) {
    stats.allCodes.add(m[1]);
  }
  stats.totalPoints = stats.allCodes.size;
  return stats;
}

function readManualOverrides(filePath: string): ManualOverrides | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');

  // 使用精確的錨點來提取 MANUAL 區塊
  // 匹配「以 "手動" 開頭的 JSDoc 註釋」+ export const 宣告 + 到 ]; 結束
  const excludeMatch = content.match(
    /(\/\*\*\s*\n\s*\*\s*手動排除[\s\S]*?\*\/\s*\n)?\s*export\s+const\s+MANUAL_EXCLUDE_CODES[\s\S]*?\];\s*/,
  );
  const includeMatch = content.match(
    /(\/\*\*\s*\n\s*\*\s*手動新增[\s\S]*?\*\/\s*\n)?\s*export\s+const\s+MANUAL_INCLUDE_POINTS[\s\S]*?\];\s*/,
  );
  if (!excludeMatch && !includeMatch) return null;
  return {
    excludeBlock: excludeMatch?.[0]?.trim() ?? '',
    includeBlock: includeMatch?.[0]?.trim() ?? '',
  };
}

// ────────────────────────────────────────────────────────────────────
// Step 1: 使用 Playwright 爬取順豐站地址頁面
// ────────────────────────────────────────────────────────────────────

/**
 * 子區域 → 18 區映射表
 * 當地址中沒有明確的「XX區」時，用子區域名稱推斷
 */
const AREA_TO_DISTRICT: Record<string, string> = {
  // 中西區
  '上環': '中西區', '中環': '中西區', '西營盤': '中西區', '堅尼地城': '中西區', '西環': '中西區', '半山': '中西區', '薄扶林': '中西區',
  // 灣仔區
  '灣仔': '灣仔區', '銅鑼灣': '灣仔區', '跑馬地': '灣仔區', '大坑': '灣仔區', '天后': '灣仔區',
  // 東區
  '北角': '東區', '鰂魚涌': '東區', '西灣河': '東區', '筲箕灣': '東區', '柴灣': '東區', '小西灣': '東區', '杏花邨': '東區',
  // 南區
  '香港仔': '南區', '鴨脷洲': '南區', '黃竹坑': '南區', '赤柱': '南區', '淺水灣': '南區',
  // 油尖旺區
  '太子': '油尖旺區', '旺角': '油尖旺區', '油麻地': '油尖旺區', '佐敦': '油尖旺區', '尖沙咀': '油尖旺區', '大角咀': '油尖旺區',
  // 深水埗區
  '深水埗': '深水埗區', '長沙灣': '深水埗區', '荔枝角': '深水埗區', '美孚': '深水埗區', '石硤尾': '深水埗區', '南昌': '深水埗區',
  // 九龍城區
  '九龍城': '九龍城區', '紅磡': '九龍城區', '何文田': '九龍城區', '土瓜灣': '九龍城區', '九龍塘': '九龍城區', '啟德': '九龍城區', '黃埔': '九龍城區',
  // 黃大仙區
  '黃大仙': '黃大仙區', '慈雲山': '黃大仙區', '鑽石山': '黃大仙區', '新蒲崗': '黃大仙區', '樂富': '黃大仙區', '彩虹': '黃大仙區', '牛池灣': '黃大仙區',
  // 觀塘區
  '觀塘': '觀塘區', '藍田': '觀塘區', '油塘': '觀塘區', '牛頭角': '觀塘區', '九龍灣': '觀塘區', '秀茂坪': '觀塘區',
  // 荃灣區
  '荃灣': '荃灣區', '深井': '荃灣區', '青龍頭': '荃灣區',
  // 屯門區
  '屯門': '屯門區',
  // 元朗區
  '元朗': '元朗區', '天水圍': '元朗區', '洪水橋': '元朗區', '錦田': '元朗區', '流浮山': '元朗區',
  // 北區
  '粉嶺': '北區', '上水': '北區', '古洞': '北區', '沙頭角': '北區',
  // 大埔區
  '大埔': '大埔區', '太和': '大埔區',
  // 沙田區
  '沙田': '沙田區', '馬鞍山': '沙田區', '大圍': '沙田區', '火炭': '沙田區',
  // 西貢區
  '將軍澳': '西貢區', '坑口': '西貢區', '西貢': '西貢區', '康城': '西貢區', '調景嶺': '西貢區',
  // 葵青區
  '葵涌': '葵青區', '葵芳': '葵青區', '青衣': '葵青區', '荔景': '葵青區', '大窩口': '葵青區',
  // 離島區
  '東涌': '離島區', '馬灣': '離島區', '大嶼山': '離島區', '長洲': '離島區', '梅窩': '離島區', '愉景灣': '離島區',
};

/**
 * 從地址中提取 18 區名稱
 * 優先匹配完整「XX區」，其次用子區域名稱推斷
 */
function extractDistrict(address: string, area?: string): string {
  // 方法 1：直接在地址中找「XX區」
  for (const d of HK_DISTRICTS_18) {
    if (address.includes(d)) return d;
  }

  // 方法 2：用子區域 (area) 查映射表
  if (area && AREA_TO_DISTRICT[area]) {
    return AREA_TO_DISTRICT[area];
  }

  // 方法 3：在地址中搜尋已知子區域名稱
  for (const [areaName, district] of Object.entries(AREA_TO_DISTRICT)) {
    if (address.includes(areaName)) return district;
  }

  return '未知區';
}

/**
 * 清理地址中的 ^CODE^ 標記
 * e.g. "...地下A號舖 ^852M^" → "...地下A號舖"
 */
function cleanAddress(addr: string): string {
  return addr.replace(/\s*\^[^^]+\^\s*/g, '').trim();
}

async function scrapeStoreAddressPage(headed: boolean): Promise<ScrapedPoint[]> {
  console.log('🌐 啟動瀏覽器，載入順豐站地址頁面...');

  const browser = await chromium.launch({ headless: !headed });
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-HK,zh;q=0.9,en;q=0.8' });

    let allPoints: {
      code: string;
      name: string;
      address: string;
      area: string;
      region: string;
      weekday: string;
      saturday: string;
      sunday: string;
      hasCold: boolean;
    }[] = [];

    for (const url of SF_STORE_URLS) {
      console.log(`   嘗試載入: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 });
        console.log(`   頁面載入完成: ${await page.title()}`);
      } catch (err: any) {
        console.warn(`   ⚠️ 載入失敗: ${err?.message || String(err)}`);
        continue;
      }

      const parsed = await page.evaluate(() => {
        const results: {
          code: string;
          name: string;
          address: string;
          area: string;
          region: string;
          weekday: string;
          saturday: string;
          sunday: string;
          hasCold: boolean;
        }[] = [];

        const tables = Array.from(document.querySelectorAll('table'));
        for (const tableEl of tables) {
          const table = tableEl as HTMLTableElement;
          const rows = Array.from(table.rows);
          if (rows.length < 2) continue;

          let headerRowIdx = -1;
          let idxArea = -1;
          let idxCode = -1;
          let idxName = -1;
          let idxAddress = -1;
          let idxWeekday = -1;
          let idxSat = -1;
          let idxSun = -1;
          let idxCold = -1;

          for (let i = 0; i < Math.min(rows.length, 6); i++) {
            const headers = Array.from(rows[i].cells).map(c => (c.textContent || '').trim());
            if (!headers.length) continue;
            const lowered = headers.map(h => h.replace(/\s+/g, ' ').trim().toLowerCase());
            const codeIdx = lowered.findIndex(h => ['點碼', '点码', 'code'].some(k => h.includes(k)));
            const coldIdx = lowered.findIndex(h => ['冷運服務', '冷运服务', 'cold chain'].some(k => h.includes(k)));
            if (codeIdx >= 0 && coldIdx >= 0) {
              headerRowIdx = i;
              idxArea = lowered.findIndex(h => ['地區', '地区', 'district', 'area'].some(k => h.includes(k)));
              idxCode = codeIdx;
              idxName = lowered.findIndex(h => ['網點簡稱', '网点简称', 'name', 'station'].some(k => h.includes(k)));
              idxAddress = lowered.findIndex(h => ['地址', 'address'].some(k => h.includes(k)));
              idxWeekday = lowered.findIndex(h => ['mon to fri', 'mon-fri', '星期一至五', '週一至週五'].some(k => h.includes(k)));
              idxSat = lowered.findIndex(h => ['sat', '星期六', '週六'].some(k => h.includes(k)));
              idxSun = lowered.findIndex(h => ['sun', '星期日', '假期', 'holidays'].some(k => h.includes(k)));
              idxCold = coldIdx;
              break;
            }
          }

          if (headerRowIdx < 0 || idxCode < 0 || idxCold < 0) continue;

          let currentArea = '';
          for (let r = headerRowIdx + 1; r < rows.length; r++) {
            const cells = Array.from(rows[r].cells).map(c => (c.textContent || '').trim());
            if (!cells.length) continue;

            // SF address tables usually use rowSpan on area and grouped business-hours columns:
            // full row(10): area, code, name, addr, weekday, sat, sun, cold, baggage, limit
            // cont row(9):  code, name, addr, weekday, sat, sun, cold, baggage, limit
            const hasAreaCell = cells.length >= 10;
            const maybeArea = hasAreaCell
              ? cells[0]
              : (idxArea >= 0 && idxArea < cells.length ? cells[idxArea] : '');
            if (maybeArea) currentArea = maybeArea;

            let code = '';
            let name = '';
            let address = '';
            let weekday = '';
            let saturday = '';
            let sunday = '';
            let coldCell = '';

            if (cells.length >= 10) {
              code = cells[1] || '';
              name = cells[2] || '';
              address = cells[3] || '';
              weekday = cells[4] || '';
              saturday = cells[5] || '';
              sunday = cells[6] || '';
              coldCell = cells[7] || '';
            } else if (cells.length >= 9) {
              code = cells[0] || '';
              name = cells[1] || '';
              address = cells[2] || '';
              weekday = cells[3] || '';
              saturday = cells[4] || '';
              sunday = cells[5] || '';
              coldCell = cells[6] || '';
            } else {
              code = idxCode >= 0 && idxCode < cells.length ? cells[idxCode] : '';
              name = idxName >= 0 && idxName < cells.length ? cells[idxName] : '';
              address = idxAddress >= 0 && idxAddress < cells.length ? cells[idxAddress] : '';
              weekday = idxWeekday >= 0 && idxWeekday < cells.length ? cells[idxWeekday] : '';
              saturday = idxSat >= 0 && idxSat < cells.length ? cells[idxSat] : '';
              sunday = idxSun >= 0 && idxSun < cells.length ? cells[idxSun] : '';
              coldCell = idxCold >= 0 && idxCold < cells.length ? cells[idxCold] : '';
            }

            if (!/^852[A-Z0-9]+$/i.test((code || '').trim())) {
              const fallbackCode = cells.find(c => /^852[A-Z0-9]+$/i.test((c || '').trim()));
              code = fallbackCode || '';
            }
            if (!/^852[A-Z0-9]+$/i.test((code || '').trim())) continue;

            const coldLower = (coldCell || '').replace(/\s+/g, ' ').trim().toLowerCase();
            if (!coldLower) continue;
            if (/(不適用|不适用|\bno\b|✗|x|not available|unsupported)/i.test(coldLower)) continue;
            const hasCold = /(適用|适用|\byes\b|√|✔|supported|available)/i.test(coldLower);

            results.push({
              code: code.trim(),
              name,
              address,
              area: currentArea,
              region: '香港',
              weekday,
              saturday,
              sunday,
              hasCold,
            });
          }
        }

        // 去重：同一點碼可能在多個 table 重複
        const dedup = new Map<string, typeof results[number]>();
        for (const row of results) {
          if (!dedup.has(row.code)) dedup.set(row.code, row);
        }
        return Array.from(dedup.values());
      });

      console.log(`   此頁解析到 ${parsed.length} 個順豐站，其中冷運: ${parsed.filter(p => p.hasCold).length} 個`);
      if (parsed.length > 0) {
        allPoints = parsed;
        break;
      }
    }

    if (allPoints.length === 0) {
      throw new Error('未能從所有候選頁面解析到任何順豐站點（可能 DOM/API 再次改版）');
    }

    console.log(`   共解析 ${allPoints.length} 個順豐站，其中冷運: ${allPoints.filter(p => p.hasCold).length} 個`);

    // 過濾冷運站點，提取地區
    const coldPoints: ScrapedPoint[] = allPoints
      .filter(p => p.hasCold)
      .map(p => ({
        code: p.code,
        name: p.name,
        address: cleanAddress(p.address),
        area: p.area,
        district: extractDistrict(p.address, p.area),
        region: p.region,
        hours: {
          weekday: p.weekday,
          saturday: p.saturday,
          sunday: p.sunday,
        },
      }));

    // 報告未能識別地區的站點
    const unknowns = coldPoints.filter(p => p.district === '未知區');
    if (unknowns.length > 0) {
      console.warn(`\n   ⚠️ ${unknowns.length} 個站點無法自動識別地區：`);
      for (const u of unknowns) {
        console.warn(`      ${u.code} ${u.name} — 地址: ${u.address.slice(0, 50)}...`);
      }
    }

    return coldPoints;
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
}

// ────────────────────────────────────────────────────────────────────
// Step 2: 驗證
// ────────────────────────────────────────────────────────────────────

function validateAgainstOld(oldStats: OldStats, newPoints: ScrapedPoint[]): ValidationResult {
  const newCodes = new Set(newPoints.map(p => p.code));
  const addedCodes = [...newCodes].filter(c => !oldStats.allCodes.has(c));
  const removedCodes = [...oldStats.allCodes].filter(c => !newCodes.has(c));
  const dropPercent = oldStats.totalPoints > 0
    ? (oldStats.totalPoints - newPoints.length) / oldStats.totalPoints
    : 0;
  const warnings: string[] = [];

  if (newPoints.length < MIN_ABSOLUTE_POINTS) {
    warnings.push(`絕對數量不足：僅抓到 ${newPoints.length} 個站點（最低要求 ${MIN_ABSOLUTE_POINTS}）`);
  }
  if (dropPercent > DROP_THRESHOLD && oldStats.totalPoints > 0) {
    warnings.push(`數量驟降 ${(dropPercent * 100).toFixed(1)}%：舊 ${oldStats.totalPoints} → 新 ${newPoints.length}（閾值 ${DROP_THRESHOLD * 100}%）`);
  }
  // 只在舊數據充分時檢查消失站點（避免首次從手動列表過渡時誤報）
  const removePercent = oldStats.totalPoints > 0 ? removedCodes.length / oldStats.totalPoints : 0;
  if (removedCodes.length > 20 && removePercent > 0.3) {
    warnings.push(`大量站點消失：${removedCodes.length} 個 code 不再出現 (${(removePercent * 100).toFixed(0)}%)`);
  }

  return {
    passed: warnings.length === 0,
    oldCount: oldStats.totalPoints,
    newCount: newPoints.length,
    dropPercent,
    addedCodes,
    removedCodes,
    warnings,
  };
}

function printValidationReport(result: ValidationResult): void {
  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│            數據驗證報告 (Validation Report)       │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│  舊站點數量：${String(result.oldCount).padStart(4)}                               │`);
  console.log(`│  新站點數量：${String(result.newCount).padStart(4)}                               │`);

  const diff = result.newCount - result.oldCount;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const arrow = result.dropPercent > 0 ? '↓' : result.dropPercent < 0 ? '↑' : '=';
  const pctStr = `(${arrow}${(Math.abs(result.dropPercent) * 100).toFixed(1)}%)`;
  console.log(`│  數量變化：  ${diffStr.padStart(4)} ${pctStr.padEnd(30)}│`);

  if (result.addedCodes.length > 0) {
    console.log('│                                                 │');
    console.log(`│  新增站點 (${result.addedCodes.length}):                                   │`);
    for (const code of result.addedCodes.slice(0, 10)) {
      console.log(`│    + ${code.padEnd(42)}│`);
    }
    if (result.addedCodes.length > 10) {
      console.log(`│    ... 及其餘 ${result.addedCodes.length - 10} 個`);
    }
  }

  if (result.removedCodes.length > 0) {
    console.log('│                                                 │');
    console.log(`│  消失站點 (${result.removedCodes.length}):                                   │`);
    for (const code of result.removedCodes.slice(0, 10)) {
      console.log(`│    - ${code.padEnd(42)}│`);
    }
    if (result.removedCodes.length > 10) {
      console.log(`│    ... 及其餘 ${result.removedCodes.length - 10} 個`);
    }
  }

  console.log('├─────────────────────────────────────────────────┤');
  if (result.passed) {
    console.log('│  ✅ 驗證通過 — 數據變化在合理範圍內              │');
  } else {
    console.log('│  ❌ 驗證未通過 — 以下問題需要注意：              │');
    for (const w of result.warnings) {
      console.log(`│  ⚠️  ${w}`);
    }
  }
  console.log('└─────────────────────────────────────────────────┘');
}

// ────────────────────────────────────────────────────────────────────
// Step 3: 生成 TypeScript 檔案
// ────────────────────────────────────────────────────────────────────

function generateTsFile(points: ScrapedPoint[], manualOverrides: ManualOverrides | null): string {
  // 按地區分組
  const grouped: Record<string, ScrapedPoint[]> = {};
  for (const p of points) {
    const d = p.district;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(p);
  }
  const sortedDistricts = Object.keys(grouped).sort(
    (a, b) => (REGION_ORDER[a] ?? 99) - (REGION_ORDER[b] ?? 99),
  );

  const now = new Date().toISOString().slice(0, 10);

  let ts = `/**
 * 順豐冷運自提點數據 (SF Express Cold Chain Self-Pickup Points)
 * 僅包含支援冷運服務 (✔️) 的順豐站，數據來源：順豐官方
 *
 * 此檔案為本地靜態數據，不需要 API 請求，確保極速載入。
 * 按地區 (district) 分組，供二級下拉選單使用。
 *
 * 最後自動更新：${now}
 * 由 scripts/update-sf-cold-points.ts (Playwright) 自動生成
 * 來源頁面：${SF_STORE_URLS[0]}
 *
 * ⚠️ 重要：自動腳本只會覆蓋 SF_COLD_PICKUP_DISTRICTS_RAW 區塊。
 *    下方的 MANUAL_OVERRIDES 區塊不會被覆蓋，你可以安全地手動編輯。
 */

export interface SfColdPickupPoint {
  /** 順豐站點碼 e.g. "852TAL" */
  code: string;
  /** 網點簡稱 e.g. "香港仔富嘉工廈順豐站" */
  name: string;
  /** 完整地址 */
  address: string;
  /** 子區域 e.g. "香港仔" */
  area: string;
  /** 營業時間 */
  hours: { weekday: string; weekend: string };
}

export interface SfColdDistrict {
  /** 地區名稱 (第一層下拉) */
  district: string;
  /** 該地區的冷運自提點 */
  points: SfColdPickupPoint[];
}

`;

  // ── MANUAL_OVERRIDES ──
  ts += `// ╔══════════════════════════════════════════════════════════════════╗
// ║  MANUAL_OVERRIDES — 手動加註區塊（不會被自動腳本覆蓋）          ║
// ║                                                                ║
// ║  用途 1：EXCLUDE — 排除已知有問題的網點（冷櫃壞了、搬遷等）    ║
// ║  用途 2：INCLUDE — 手動新增腳本未抓到但確認可用的網點            ║
// ║                                                                ║
// ║  規則：                                                        ║
// ║  - EXCLUDE 優先：若一個 code 同時出現在 EXCLUDE 和主數據中，     ║
// ║    最終結果會排除它                                              ║
// ║  - INCLUDE 的網點會被追加到對應地區，不會重複                    ║
// ╚══════════════════════════════════════════════════════════════════╝

`;

  if (manualOverrides?.excludeBlock) {
    ts += manualOverrides.excludeBlock + '\n';
  } else {
    ts += `/**
 * 手動排除的網點 code 列表
 * 例如冷櫃故障、已搬遷、服務差等原因
 * 加上備註方便日後回溯
 */
export const MANUAL_EXCLUDE_CODES: { code: string; reason: string }[] = [
  // { code: '852XXXX', reason: '2025-01 冷櫃長期故障，已向順豐反映' },
  // { code: '852YYYY', reason: '2025-03 已搬遷，新址未確認' },
];

`;
  }

  if (manualOverrides?.includeBlock) {
    ts += manualOverrides.includeBlock + '\n';
  } else {
    ts += `/**
 * 手動新增的網點（腳本未抓到但你已驗證可用的）
 * 格式與 SfColdPickupPoint 相同，額外加上 district 欄位
 */
export const MANUAL_INCLUDE_POINTS: (SfColdPickupPoint & { district: string })[] = [
  // {
  //   code: '852ZZZZ',
  //   name: '測試站點',
  //   address: '香港某區某街某號',
  //   area: '某區',
  //   district: '油尖旺區',
  //   hours: { weekday: '10:00-20:00', weekend: '12:00-18:00' },
  // },
];

`;
  }

  // ── RAW 數據 ──
  ts += `// ═══════════════════════════════════════════════════════════════════
//  以下為自動生成的主數據（由 scripts/update-sf-cold-points.ts 管理）
//  手動編輯亦可，但下次跑腳本時此區塊會被覆蓋
// ═══════════════════════════════════════════════════════════════════

/**
 * 全港順豐冷運自提點 — 按地區分組（原始數據）
 * 僅包含「冷運服務 ✔️」的網點
 */
export const SF_COLD_PICKUP_DISTRICTS_RAW: SfColdDistrict[] = [
`;

  for (const district of sortedDistricts) {
    const pts = grouped[district];
    ts += `  // ─── ${district} ───\n`;
    ts += `  {\n    district: '${esc(district)}',\n    points: [\n`;
    for (const p of pts) {
      // Combine saturday + sunday into "weekend" for UI compatibility
      const weekend = p.hours.saturday === p.hours.sunday
        ? p.hours.saturday
        : `星期六 ${p.hours.saturday} / 星期日 ${p.hours.sunday}`;
      ts += `      {\n`;
      ts += `        code: '${esc(p.code)}',\n`;
      ts += `        name: '${esc(p.name)}',\n`;
      ts += `        address: '${esc(p.address)}',\n`;
      ts += `        area: '${esc(p.area)}',\n`;
      ts += `        hours: { weekday: '${esc(p.hours.weekday)}', weekend: '${esc(weekend)}' },\n`;
      ts += `      },\n`;
    }
    ts += `    ],\n  },\n`;
  }

  ts += `];

// ═══════════════════════════════════════════════════════════════════
//  合併邏輯：RAW 數據 + MANUAL_INCLUDE − MANUAL_EXCLUDE = 最終數據
//  所有下游 export 均使用合併後的 SF_COLD_PICKUP_DISTRICTS
// ═══════════════════════════════════════════════════════════════════

const _excludeSet = new Set(MANUAL_EXCLUDE_CODES.map(e => e.code));

function _applyOverrides(): SfColdDistrict[] {
  const merged: SfColdDistrict[] = SF_COLD_PICKUP_DISTRICTS_RAW.map(d => ({
    district: d.district,
    points: d.points.filter(p => !_excludeSet.has(p.code)),
  }));

  for (const mp of MANUAL_INCLUDE_POINTS) {
    if (_excludeSet.has(mp.code)) continue;
    let districtGroup = merged.find(d => d.district === mp.district);
    if (!districtGroup) {
      districtGroup = { district: mp.district, points: [] };
      merged.push(districtGroup);
    }
    if (!districtGroup.points.some(p => p.code === mp.code)) {
      const { district: _, ...pointData } = mp;
      districtGroup.points.push(pointData);
    }
  }

  return merged.filter(d => d.points.length > 0);
}

/** 最終合併後的冷運自提點數據（= RAW + MANUAL_INCLUDE − MANUAL_EXCLUDE） */
export const SF_COLD_PICKUP_DISTRICTS: SfColdDistrict[] = _applyOverrides();

/** Flat list of all cold chain pickup points (for quick lookups) */
export const ALL_SF_COLD_POINTS: SfColdPickupPoint[] = SF_COLD_PICKUP_DISTRICTS.flatMap(d => d.points);

/** Get all district names (for first dropdown) */
export const SF_COLD_DISTRICT_NAMES: string[] = SF_COLD_PICKUP_DISTRICTS.map(d => d.district);

/** Find a pickup point by code */
export const findPointByCode = (code: string): SfColdPickupPoint | undefined =>
  ALL_SF_COLD_POINTS.find(p => p.code === code);

/** Get points for a specific district */
export const getPointsByDistrict = (district: string): SfColdPickupPoint[] =>
  SF_COLD_PICKUP_DISTRICTS.find(d => d.district === district)?.points ?? [];

/** Format address for SF order: 地區 + 自提點名稱 + 點碼 */
export const formatLockerAddress = (point: SfColdPickupPoint, district: string): string =>
  \`\${district} \${point.name} [\${point.code}]\`;
`;

  return ts;
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
}

// ────────────────────────────────────────────────────────────────────
// 主程式
// ────────────────────────────────────────────────────────────────────

async function main() {
  const forceFlag = process.argv.includes('--force');
  const headedFlag = process.argv.includes('--headed');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  順豐冷運自提點數據更新工具 v3 (Playwright)');
  console.log('  SF Cold Chain Pickup Points Updater');
  console.log('═══════════════════════════════════════════════════════════');
  if (forceFlag) console.log('  ⚡ --force 模式');
  if (headedFlag) console.log('  👁️  --headed 模式（有頭瀏覽器）');
  console.log('');

  const outputPath = path.resolve(__dirname, '..', 'sfColdPickupPoints.ts');
  const backupPath = path.resolve(__dirname, '..', 'sfColdPickupPoints.backup.ts');

  // ── Step 0: 讀取舊數據 ──
  console.log('📊 讀取現有數據作為比對基準...');
  const oldStats = readOldStats(outputPath);
  const manualOverrides = readManualOverrides(outputPath);

  if (oldStats.totalPoints > 0) {
    console.log(`   現有站點: ${oldStats.totalPoints} 個`);
  }
  if (manualOverrides) {
    const hasExcludes = manualOverrides.excludeBlock.includes('code:');
    const hasIncludes = manualOverrides.includeBlock.includes('code:');
    console.log(`   手動排除: ${hasExcludes ? '有' : '無'} | 手動新增: ${hasIncludes ? '有' : '無'}`);
    console.log('   ✅ MANUAL_OVERRIDES 區塊已讀取，更新後將保留');
  }

  // ── Step 1: Playwright 爬取 ──
  console.log('');
  const newPoints = await scrapeStoreAddressPage(headedFlag);
  console.log(`\n   冷鏈站點總計: ${newPoints.length} 個`);

  // 地區統計
  const districtStats: Record<string, number> = {};
  for (const p of newPoints) {
    districtStats[p.district] = (districtStats[p.district] || 0) + 1;
  }
  console.log('   地區分佈:');
  for (const [d, count] of Object.entries(districtStats).sort((a, b) => (REGION_ORDER[a[0]] ?? 99) - (REGION_ORDER[b[0]] ?? 99))) {
    console.log(`     ${d.padEnd(6)} ${count} 個`);
  }

  // ── Step 2: 驗證 ──
  const validation = validateAgainstOld(oldStats, newPoints);
  printValidationReport(validation);

  // ── Step 3: 安全檢查 ──
  if (!validation.passed && !forceFlag) {
    console.log('\n🚫 更新已中止 — 數據異常，現有檔案保持不變。');
    console.log('   使用 --force 強制更新：npx tsx scripts/update-sf-cold-points.ts --force');
    process.exit(1);
  }
  if (!validation.passed && forceFlag) {
    console.log('\n⚡ --force：忽略驗證警告，繼續更新...');
  }

  // ── Step 4: 備份 ──
  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`\n💾 已備份 → ${path.basename(backupPath)}`);
  }

  // ── Step 5: 生成新檔案 ──
  const tsContent = generateTsFile(newPoints, manualOverrides);
  fs.writeFileSync(outputPath, tsContent, 'utf-8');

  // ── Step 6: 摘要 ──
  const newDistricts = [...new Set(newPoints.map(p => p.district))];
  console.log('\n✅ 更新完成！');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log(`│  檔案：sfColdPickupPoints.ts                     │`);
  console.log(`│  冷鏈站點：${String(newPoints.length).padStart(4)} 個                              │`);
  console.log(`│  覆蓋地區：${String(newDistricts.length).padStart(2)} 個                                │`);
  console.log(`│  MANUAL_OVERRIDES：已保留                         │`);
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  📋 後續步驟：                                    │');
  console.log('│  1. npx tsc --noEmit  (確認 TypeScript 無錯誤)   │');
  console.log('│  2. 在瀏覽器測試下拉選單是否正常                  │');
  console.log('│  3. git diff sfColdPickupPoints.ts               │');
  console.log('│  4. git commit 提交變更                           │');
  console.log('└─────────────────────────────────────────────────┘');
}

main().catch(err => {
  console.error('❌ 更新失敗:', err);
  process.exit(1);
});
