#!/usr/bin/env npx tsx
/**
 * 順豐冷運自提點數據更新腳本 v2
 * ===============================
 * 用途：爬取順豐官方站點數據，篩選冷鏈自提站，更新 sfColdPickupPoints.ts
 *
 * 使用方法（在專案根目錄執行）：
 *   npx tsx scripts/update-sf-cold-points.ts
 *
 * 重要行為：
 *   1. 讀取現有 sfColdPickupPoints.ts 的站點數量作為基準
 *   2. 從順豐 API 抓取最新數據
 *   3. 新舊數量比對 — 若新數據驟降超過 40%，拒絕更新並警告
 *   4. 保留 MANUAL_OVERRIDES 區塊（手動加註 / 排除不受影響）
 *   5. 只覆蓋 SF_COLD_PICKUP_DISTRICTS_RAW 區塊
 *   6. 輸出詳細驗證報告
 *
 * 需要網路連線。建議每季度或收到順豐通知時執行一次。
 *
 * 若順豐 API 變更或被封鎖，可退回手動模式：
 *   - 前往 https://htm.sf-express.com/hk/tc/dynamic_function/S.F.Network/
 *   - 手動篩選冷鏈服務站點
 *   - 編輯 sfColdPickupPoints.ts 的 SF_COLD_PICKUP_DISTRICTS_RAW
 */

import * as fs from 'fs';
import * as path from 'path';

// ────────────────────────────────────────────────────────────────────
// 常數
// ────────────────────────────────────────────────────────────────────

const SF_NETWORK_API = 'https://htm.sf-express.com/hk/tc/dynamic_function/S.F.Network/SF_store_address/';

const HK_DISTRICTS = [
  '中西區', '灣仔區', '東區', '南區',
  '油尖旺區', '深水埗區', '九龍城區', '黃大仙區', '觀塘區',
  '荃灣區', '屯門區', '元朗區', '北區', '大埔區', '沙田區', '西貢區', '葵青區', '離島區',
];

/** 新數據若比舊數據少超過此比例，拒絕更新 */
const DROP_THRESHOLD = 0.40;

/** 最低可接受的抓取站點數（低於此數量視為抓取失敗） */
const MIN_ABSOLUTE_POINTS = 5;

const normalizeDistrict = (d: string) => d.replace(/區$/, '');

const REGION_ORDER: Record<string, number> = {
  '南區': 1, '東區': 2, '灣仔': 3, '中西區': 4,
  '油尖旺': 10, '深水埗': 11, '九龍城': 12, '黃大仙': 13, '觀塘': 14,
  '荃灣': 20, '屯門': 21, '元朗': 22, '北區': 23, '大埔': 24,
  '沙田': 25, '西貢': 26, '葵青': 27, '離島': 28,
};

// ────────────────────────────────────────────────────────────────────
// 類型
// ────────────────────────────────────────────────────────────────────

interface RawPoint {
  code: string;
  name: string;
  address: string;
  area: string;
  district: string;
  hours: { weekday: string; weekend: string };
}

interface OldStats {
  totalPoints: number;
  districtCounts: Record<string, number>;
  allCodes: Set<string>;
}

// ────────────────────────────────────────────────────────────────────
// Step 0: 讀取現有檔案的站點統計（用於比對驗證）
// ────────────────────────────────────────────────────────────────────

function readOldStats(filePath: string): OldStats {
  const stats: OldStats = { totalPoints: 0, districtCounts: {}, allCodes: new Set() };

  if (!fs.existsSync(filePath)) {
    console.log('  （首次生成，無舊數據可比對）');
    return stats;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // 用正則提取所有 code: 'XXXXX'
  const codeMatches = content.matchAll(/code:\s*'([^']+)'/g);
  for (const m of codeMatches) {
    stats.allCodes.add(m[1]);
  }
  stats.totalPoints = stats.allCodes.size;

  // 提取地區分組計數
  const districtMatches = content.matchAll(/district:\s*'([^']+)'/g);
  const districtNames: string[] = [];
  for (const m of districtMatches) {
    districtNames.push(m[1]);
  }

  // 粗略計數：每個 district 到下一個 district 之間有多少 code
  for (let i = 0; i < districtNames.length; i++) {
    const dName = districtNames[i];
    const startIdx = content.indexOf(`district: '${dName}'`);
    const endIdx = i + 1 < districtNames.length
      ? content.indexOf(`district: '${districtNames[i + 1]}'`)
      : content.length;
    const slice = content.slice(startIdx, endIdx);
    const count = (slice.match(/code:\s*'/g) || []).length;
    stats.districtCounts[dName] = count;
  }

  return stats;
}

// ────────────────────────────────────────────────────────────────────
// Step 0b: 讀取現有檔案中的 MANUAL_OVERRIDES 區塊
// ────────────────────────────────────────────────────────────────────

interface ManualOverrides {
  /** 完整的 MANUAL_EXCLUDE_CODES 宣告 (含註解行) */
  excludeBlock: string;
  /** 完整的 MANUAL_INCLUDE_POINTS 宣告 (含註解行) */
  includeBlock: string;
}

function readManualOverrides(filePath: string): ManualOverrides | null {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');

  // 提取 MANUAL_EXCLUDE_CODES 區塊
  const excludeMatch = content.match(
    /(\/\*\*[\s\S]*?\*\/\s*)?export\s+const\s+MANUAL_EXCLUDE_CODES[\s\S]*?\];\s*/,
  );
  // 提取 MANUAL_INCLUDE_POINTS 區塊
  const includeMatch = content.match(
    /(\/\*\*[\s\S]*?\*\/\s*)?export\s+const\s+MANUAL_INCLUDE_POINTS[\s\S]*?\];\s*/,
  );

  if (!excludeMatch && !includeMatch) return null;

  return {
    excludeBlock: excludeMatch?.[0] ?? '',
    includeBlock: includeMatch?.[0] ?? '',
  };
}

// ────────────────────────────────────────────────────────────────────
// Step 1: 從順豐 API 抓取站點
// ────────────────────────────────────────────────────────────────────

async function fetchFromSfApi(): Promise<RawPoint[]> {
  const allPoints: RawPoint[] = [];
  console.log('嘗試從順豐官方 API 獲取站點數據...\n');

  for (const district of HK_DISTRICTS) {
    try {
      const url = `${SF_NETWORK_API}?area=${encodeURIComponent(district)}&lang=tc`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          Accept: 'application/json, text/html',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.warn(`  [${district}] HTTP ${res.status}, 跳過`);
        continue;
      }

      const text = await res.text();

      try {
        const data = JSON.parse(text);
        const stores = Array.isArray(data) ? data : data?.stores ?? data?.data ?? [];
        for (const store of stores) {
          if (checkColdChain(store)) {
            allPoints.push({
              code: store.storeCode || store.code || '',
              name: store.storeName || store.name || '',
              address: store.address || store.storeAddress || '',
              area: store.area || store.subDistrict || '',
              district: normalizeDistrict(district),
              hours: parseHours(store),
            });
          }
        }
        const districtCount = allPoints.filter(p => p.district === normalizeDistrict(district)).length;
        console.log(`  [${district}] 找到 ${stores.length} 站點，冷鏈: ${districtCount}`);
      } catch {
        const points = parseHtmlForPoints(text, normalizeDistrict(district));
        allPoints.push(...points);
        console.log(`  [${district}] HTML 解析，冷鏈站點: ${points.length}`);
      }

      await sleep(500);
    } catch (err) {
      console.warn(`  [${district}] 查詢失敗:`, (err as Error).message);
    }
  }

  return allPoints;
}

function checkColdChain(store: Record<string, unknown>): boolean {
  const text = JSON.stringify(store).toLowerCase();
  return text.includes('冷運') || text.includes('冷鏈') || text.includes('cold') || text.includes('冷凍');
}

function parseHtmlForPoints(html: string, district: string): RawPoint[] {
  const points: RawPoint[] = [];
  const jsonMatch = html.match(/var\s+storeData\s*=\s*(\[[\s\S]*?\]);/);
  if (jsonMatch) {
    try {
      const stores = JSON.parse(jsonMatch[1]);
      for (const store of stores) {
        if (checkColdChain(store)) {
          points.push({
            code: store.storeCode || store.code || '',
            name: store.storeName || store.name || '',
            address: store.address || '',
            area: store.area || '',
            district,
            hours: parseHours(store),
          });
        }
      }
    } catch { /* ignore */ }
  }
  return points;
}

function parseHours(store: Record<string, unknown>): { weekday: string; weekend: string } {
  const wk = (store.weekdayHours || store.businessHours || store.openHours || '11:00-20:00') as string;
  const we = (store.weekendHours || store.satSunHours || '12:00-20:00') as string;
  return { weekday: String(wk), weekend: String(we) };
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ────────────────────────────────────────────────────────────────────
// Step 2: 驗證新舊數據差異
// ────────────────────────────────────────────────────────────────────

interface ValidationResult {
  passed: boolean;
  oldCount: number;
  newCount: number;
  dropPercent: number;
  addedCodes: string[];
  removedCodes: string[];
  warnings: string[];
}

function validateAgainstOld(oldStats: OldStats, newPoints: RawPoint[]): ValidationResult {
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

  if (dropPercent > DROP_THRESHOLD) {
    warnings.push(
      `數量驟降 ${(dropPercent * 100).toFixed(1)}%：舊 ${oldStats.totalPoints} → 新 ${newPoints.length}（閾值 ${DROP_THRESHOLD * 100}%）`,
    );
  }

  if (removedCodes.length > 10) {
    warnings.push(`大量站點消失：${removedCodes.length} 個 code 不再出現`);
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

// ────────────────────────────────────────────────────────────────────
// Step 3: 生成 TypeScript 檔案（僅覆蓋 RAW 區塊，保留 MANUAL 區塊）
// ────────────────────────────────────────────────────────────────────

function generateTsFile(points: RawPoint[], manualOverrides: ManualOverrides | null): string {
  // 按地區分組
  const grouped: Record<string, RawPoint[]> = {};
  for (const p of points) {
    if (!grouped[p.district]) grouped[p.district] = [];
    grouped[p.district].push(p);
  }
  const sortedDistricts = Object.keys(grouped).sort(
    (a, b) => (REGION_ORDER[a] ?? 99) - (REGION_ORDER[b] ?? 99),
  );

  const now = new Date().toISOString().slice(0, 10);

  // ── 檔案頭部 + interfaces ──
  let ts = `/**
 * 順豐冷運自提點數據 (SF Express Cold Chain Self-Pickup Points)
 * 僅包含支援冷運服務 (✔️) 的順豐站，數據來源：順豐官方
 *
 * 此檔案為本地靜態數據，不需要 API 請求，確保極速載入。
 * 按地區 (district) 分組，供二級下拉選單使用。
 *
 * 最後自動更新：${now}
 * 由 scripts/update-sf-cold-points.ts 自動生成
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

  // ── MANUAL_OVERRIDES 區塊（從舊檔案保留） ──
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

  // ── RAW 數據區塊 ──
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
    ts += `  {\n    district: '${escTs(district)}',\n    points: [\n`;
    for (const p of pts) {
      ts += `      {\n`;
      ts += `        code: '${escTs(p.code)}',\n`;
      ts += `        name: '${escTs(p.name)}',\n`;
      ts += `        address: '${escTs(p.address)}',\n`;
      ts += `        area: '${escTs(p.area)}',\n`;
      ts += `        hours: { weekday: '${escTs(p.hours.weekday)}', weekend: '${escTs(p.hours.weekend)}' },\n`;
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
  // Step 1: 從 RAW 數據中移除被排除的網點
  const merged: SfColdDistrict[] = SF_COLD_PICKUP_DISTRICTS_RAW.map(d => ({
    district: d.district,
    points: d.points.filter(p => !_excludeSet.has(p.code)),
  }));

  // Step 2: 追加手動新增的網點（不重複）
  for (const mp of MANUAL_INCLUDE_POINTS) {
    if (_excludeSet.has(mp.code)) continue; // 排除名單優先
    let districtGroup = merged.find(d => d.district === mp.district);
    if (!districtGroup) {
      districtGroup = { district: mp.district, points: [] };
      merged.push(districtGroup);
    }
    // 避免重複
    if (!districtGroup.points.some(p => p.code === mp.code)) {
      const { district: _, ...pointData } = mp;
      districtGroup.points.push(pointData);
    }
  }

  // 移除空地區
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

function escTs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
}

// ────────────────────────────────────────────────────────────────────
// Step 4: 輸出驗證報告
// ────────────────────────────────────────────────────────────────────

function printValidationReport(result: ValidationResult): void {
  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│            數據驗證報告 (Validation Report)       │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│  舊站點數量：${String(result.oldCount).padStart(4)}                               │`);
  console.log(`│  新站點數量：${String(result.newCount).padStart(4)}                               │`);

  const diff = result.newCount - result.oldCount;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const dropStr = result.dropPercent > 0
    ? `(↓${(result.dropPercent * 100).toFixed(1)}%)`
    : result.dropPercent < 0
      ? `(↑${(Math.abs(result.dropPercent) * 100).toFixed(1)}%)`
      : '(不變)';
  console.log(`│  數量變化：  ${diffStr.padStart(4)} ${dropStr.padEnd(30)}│`);

  if (result.addedCodes.length > 0) {
    console.log('│                                                 │');
    console.log(`│  新增站點 (${result.addedCodes.length})：                                  │`);
    for (const code of result.addedCodes.slice(0, 10)) {
      console.log(`│    + ${code.padEnd(42)}│`);
    }
    if (result.addedCodes.length > 10) {
      console.log(`│    ... 及其餘 ${result.addedCodes.length - 10} 個                             │`);
    }
  }

  if (result.removedCodes.length > 0) {
    console.log('│                                                 │');
    console.log(`│  消失站點 (${result.removedCodes.length})：                                  │`);
    for (const code of result.removedCodes.slice(0, 10)) {
      console.log(`│    - ${code.padEnd(42)}│`);
    }
    if (result.removedCodes.length > 10) {
      console.log(`│    ... 及其餘 ${result.removedCodes.length - 10} 個                             │`);
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
// 主程式
// ────────────────────────────────────────────────────────────────────

async function main() {
  const forceFlag = process.argv.includes('--force');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  順豐冷運自提點數據更新工具 v2');
  console.log('  SF Cold Chain Pickup Points Updater');
  console.log('═══════════════════════════════════════════════════════════');
  if (forceFlag) console.log('  ⚡ 已啟用 --force 模式，將跳過安全驗證');
  console.log('');

  const outputPath = path.resolve(__dirname, '..', 'sfColdPickupPoints.ts');
  const backupPath = path.resolve(__dirname, '..', 'sfColdPickupPoints.backup.ts');

  // ── Step 0: 讀取舊數據統計 + 手動加註區塊 ──
  console.log('📊 讀取現有數據作為比對基準...');
  const oldStats = readOldStats(outputPath);
  const manualOverrides = readManualOverrides(outputPath);

  if (oldStats.totalPoints > 0) {
    console.log(`   現有站點: ${oldStats.totalPoints} 個`);
    console.log(`   現有地區: ${Object.keys(oldStats.districtCounts).length} 個`);
  }

  if (manualOverrides) {
    const hasExcludes = manualOverrides.excludeBlock.includes("code:");
    const hasIncludes = manualOverrides.includeBlock.includes("code:");
    console.log(`   手動排除: ${hasExcludes ? '有' : '無'}`);
    console.log(`   手動新增: ${hasIncludes ? '有' : '無'}`);
    console.log('   ✅ MANUAL_OVERRIDES 區塊已讀取，更新後將保留');
  }

  // ── Step 1: 抓取新數據 ──
  console.log('\n🌐 開始從順豐 API 抓取最新站點數據...');
  const newPoints = await fetchFromSfApi();
  console.log(`\n   抓取完成，共 ${newPoints.length} 個冷鏈站點`);

  // ── Step 2: 驗證新舊差異 ──
  const validation = validateAgainstOld(oldStats, newPoints);
  printValidationReport(validation);

  // ── Step 3: 安全檢查 ──
  if (!validation.passed && !forceFlag) {
    console.log('\n🚫 更新已中止 — 數據異常，現有檔案保持不變。');
    console.log('');
    console.log('   如果你確認新數據是正確的（例如順豐確實關閉了大量網點），');
    console.log('   可以使用 --force 旗標強制更新：');
    console.log('');
    console.log('     npx tsx scripts/update-sf-cold-points.ts --force');
    console.log('');
    console.log('   或手動編輯 sfColdPickupPoints.ts 進行調整。');
    process.exit(1);
  }

  if (!validation.passed && forceFlag) {
    console.log('\n⚡ --force 模式：忽略驗證警告，繼續更新...');
  }

  // ── Step 4: 備份 ──
  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log(`\n💾 已備份 → ${path.basename(backupPath)}`);
  }

  // ── Step 5: 生成新檔案 ──
  const tsContent = generateTsFile(newPoints, manualOverrides);
  fs.writeFileSync(outputPath, tsContent, 'utf-8');

  // ── Step 6: 最終摘要 ──
  const newDistricts = [...new Set(newPoints.map(p => p.district))];
  console.log('\n✅ 更新完成！');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log(`│  檔案：sfColdPickupPoints.ts                     │`);
  console.log(`│  站點總數：${String(newPoints.length).padStart(4)}                                │`);
  console.log(`│  覆蓋地區：${String(newDistricts.length).padStart(2)} 個                                │`);
  console.log(`│  MANUAL_OVERRIDES：已保留                         │`);
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  📋 後續步驟：                                    │');
  console.log('│  1. npx tsc --noEmit  (確認 TypeScript 無錯誤)   │');
  console.log('│  2. 在瀏覽器測試下拉選單是否正常                  │');
  console.log('│  3. git diff sfColdPickupPoints.ts (檢視變更)     │');
  console.log('│  4. git commit 提交變更                           │');
  console.log('└─────────────────────────────────────────────────┘');
}

main().catch(err => {
  console.error('❌ 更新失敗:', err);
  process.exit(1);
});
