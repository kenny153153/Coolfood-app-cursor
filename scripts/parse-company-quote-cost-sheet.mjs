/**
 * Parse company internal quote PDF → CSV for ingredients (parents) + cut variants (children).
 *
 * Usage:
 *   node scripts/parse-company-quote-cost-sheet.mjs "/path/to/2025年10月公司報價單.pdf"
 *
 * Outputs (under data/import/):
 *   company-quote-ingredients.csv   — raw-material parents (merged by mergeStemKey|unit; 原件/抄碼列取較高成本)
 *   company-quote-variants.csv      — cuts + merged PDF 母列保留列（寧可重複 trace，不遺漏）
 *   company-quote-merge-log.csv     — which PDF rows were merged into one parent
 *
 * Notes:
 * - Rows without a parsable $cost/unit are skipped (NO placeholders, broken extracts).
 * - Parent vs variant is heuristic; review `review_flag` column in variants.
 * - yield_rate / yield_rate_override default 0.85 per user request (adjust in sheet before SQL).
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'import');
const DEFAULT_YIELD = 0.85;

const SKIP_LINE_SUBSTR = [
  '改成本表',
  '聯絡我們',
  '種類繁多',
  '**以上為參考價格',
  '成本 \t利潤',
  '利潤現金單價',
  '-- ',
  'Tel:',
  'WhatsApp:',
  'Fax:',
  '轉貼紙人工',
  '成本\t運費',
  '食粉454G',
  '黑椒碎',
  '美極',
  '喼汁',
  '生粉25KG',
];

const UNIT = '磅|斤|包|箱|餅|條|盒|小盒|磚|KG|kg|Kg|隻';

/** First $cost/unit where cost > 0 and margin digit follows unit (e.g. 磅0.87). Returns index or -1. */
function findCostAnchorIndex(line) {
  const re = new RegExp(`\\$([\\d.]+)/(${UNIT})(0\\.\\d{2})`, 'g');
  let m;
  while ((m = re.exec(line)) !== null) {
    if (parseFloat(m[1]) > 0) return m.index;
  }
  return -1;
}

/** Parse tail after "$cost/unit + margin" e.g. " $12.1/磅$12.4/磅" or " 1.50  $13.6/磅$14.0/磅" */
function parsePriceTail(tail) {
  const t = tail.trim();
  let surcharge = '';
  let rest = t;
  const sur = rest.match(/^(\d+\.?\d+)\s+(.*)$/s);
  if (sur) {
    surcharge = sur[1];
    rest = sur[2].trim();
  }
  const prices = [...rest.matchAll(/\$([\d.]+)\//g)];
  const p0 = prices[0]?.[1] ?? '';
  const p3 = prices[1]?.[1] ?? '';
  return { surcharge, p0, p3 };
}

/** Turn multiline PDF name chunks into one display string */
function normalizeRawName(parts) {
  let s = parts.map((p) => p.trim()).filter(Boolean).join('').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*[/／]\s*/g, ' / ');
  return s;
}

/**
 * pdf-parse output: product names split across lines; one line has $cost/unitMARGIN tail.
 */
function rowsFromPdfText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = [];
  const nameParts = [];

  const flushOrphan = () => {
    nameParts.length = 0;
  };

  for (const line of lines) {
    if (/^\d+\/\d+\s*頁$/.test(line)) {
      flushOrphan();
      continue;
    }
    if (line === '成本' || line === '利潤現金單價P0P3' || line === 'P0P3') {
      flushOrphan();
      continue;
    }
    if (SKIP_LINE_SUBSTR.some((s) => line.includes(s))) {
      flushOrphan();
      continue;
    }
    if (/^轉貼紙人工|^成本\s+運費|^2\s+[\d.]+\s+[\d.]+\s+[\d.]+$/.test(line)) {
      flushOrphan();
      continue;
    }
    if (/^(鹽|味)\s*$/.test(line) && line.length < 4) {
      flushOrphan();
      continue;
    }

    if (/^0\.\d{2}\s+\$/.test(line) && line.includes('$0.0')) {
      flushOrphan();
      continue;
    }

    const idx = findCostAnchorIndex(line);
    if (idx === -1) {
      nameParts.push(line);
      continue;
    }

    const before = line.slice(0, idx).trim();
    const costLine = line.slice(idx);
    if (before) nameParts.push(before);

    const rawName = normalizeRawName(nameParts);
    nameParts.length = 0;

    if (!rawName || /^NO\s/i.test(rawName)) continue;

    const m = costLine.match(
      new RegExp(`^\\$([\\d.]+)/(${UNIT})(0\\.\\d{2})(.*)$`),
    );
    if (!m) continue;
    const baseCost = parseFloat(m[1]);
    const unit = m[2];
    const margin = parseFloat(m[3]);
    if (!(baseCost > 0)) continue;

    const { surcharge, p0, p3 } = parsePriceTail(m[4]);
    const p0n = p0 ? parseFloat(p0) : 0;
    if (p0n <= 0 && surcharge === '') continue;

    rows.push({
      rawName,
      baseCost,
      unit,
      margin,
      surcharge: surcharge === '' ? '' : parseFloat(surcharge),
      cashP0: p0,
      cashP3: p3,
    });
  }

  return rows;
}

const VARIANT_HINT =
  /粒|絲|片|條|扒|免治|切粒|切絲|刨片|牛肉片|肥牛片|羊肉片|切雞脾|切豬軟骨|切牛柳頭|切\)|（切）|\(切\)|牛腩粒|牛根粒|牛根切|肉眼粒|腩排粒|肋排粒|豬手粒|梅肉片|赤肉片|雞絲|雞粒|去皮雞絲|雞脾肉|湯骨\(切\)|筒骨\(切\)|豬扒片|肉眼片|梅肉粒|赤肉粒|牛冧片|牛冧粒|牛尾 \(切\)|西冷扒|牛仔骨片|三角肥牛片|板健.*代切|下肩胛肉眼 \(切\)|板翼 \(切\)|肥牛片|雙片肥牛片|一口牛粒|金沙骨/;

const VARIANT_FALSE_POSITIVE = /竹絲雞|雞翼尖|粉絲皮|魚絲|銀魚|白飯魚|多春魚|比目魚|三文魚|蒲燒鰻|鳳尾蝦|蟹籽|魚籽|芝士碎|粟米粒|什菜粒|青豆粒|原味薯角|辣味 薯角|薯格|細粒蟹/;

const PARENT_HINT = /原件|抄碼|原條|原舊|\(原件\)|\(抄碼\)|\(原條\)/;

function slugify(s) {
  return (
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^\d{6}-\d+\s*/u, '')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 80) || 'item'
  );
}

function csvEscape(v) {
  if (v == null || v === '') return '';
  const t = String(v);
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

function stemForGroup(name) {
  let s = name.replace(/^\d{6}-\d+\s*/u, '').trim();
  s = s
    .replace(/\s*\(原件\)\s*/g, ' ')
    .replace(/\s*\(抄碼\)\s*/g, ' ')
    .replace(/\s*\(原條\)\s*/g, ' ')
    .replace(/\s*\(原舊[^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s
    .replace(/片\s*[/／]\s*條.*$/u, '')
    .replace(/片\s*[/／]\s*粒.*$/u, '')
    .replace(/粒\s*[/／]\s*絲.*$/u, '')
    .replace(/片\s*[/／]\s*扒.*$/u, '')
    .replace(/\s*片\s*\(牛肉片\).*$/u, '')
    .replace(/\s*牛腩粒$/u, '牛腩')
    .replace(/\s*牛根粒$/u, '牛根')
    .replace(/\s*牛根切粒$/u, '牛根')
    .replace(/\s*肉眼粒.*$/u, '肉眼')
    .replace(/\s*腩排粒.*$/u, '腩排')
    .replace(/\s*肋排粒.*$/u, '肋排')
    .replace(/\s*豬手粒.*$/u, '豬手')
    .replace(/\s*豬扒片.*$/u, '豬扒')
    .replace(/\s*肉眼片.*$/u, '肉眼')
    .replace(/\s*梅肉片.*$/u, '梅肉')
    .replace(/\s*梅肉粒.*$/u, '梅肉')
    .replace(/\s*赤肉片.*$/u, '赤肉')
    .replace(/\s*赤肉粒.*$/u, '赤肉')
    .replace(/\s*牛冧片.*$/u, '牛冧')
    .replace(/\s*牛冧粒.*$/u, '牛冧')
    .replace(/\s*西冷扒$/u, '西冷')
    .replace(/\s*牛仔骨片$/u, '牛仔骨')
    .replace(/\s*切豬軟骨$/u, '豬軟骨')
    .replace(/\s*切雞脾.*$/u, '雞脾')
    .replace(/\s*有皮雞絲.*$/u, '有皮雞脾肉')
    .replace(/\s*有皮雞粒.*$/u, '有皮雞脾肉')
    .replace(/\s*去皮雞絲.*$/u, '去皮上脾肉')
    .replace(/\s*豬面肉片.*$/u, '豬面肉')
    .replace(/\s*日本豬手粒.*$/u, '日本豬手')
    .replace(/\s*巴西豬手粒.*$/u, '巴西豬手')
    .replace(/\s*去皮大胸肉.*$/u, '去皮大胸肉')
    .trim();

  return s || name;
}

function groupKey(row) {
  const stem = stemForGroup(row.rawName);
  return `${row.baseCost}|${row.unit}|${stem}`;
}

/** Normalize stem for merging duplicate parents (same 原材料, different $ in PDF). */
function mergeStemKey(stem) {
  if (!stem) return '';
  let s = String(stem)
    .replace(/\([^)]{0,400}\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/(片|粒|絲|條)$/u, '').trim();
  s = s.replace(/\s+CAB\s*$/iu, '').trim();
  return s;
}

function parentClusterMergeKey(parent) {
  return `${mergeStemKey(parent.stem)}|${parent.unit}`;
}

/** Prefer whole-piece / 原件-style display name over 代切 rows when costs tie. */
const NAME_NOISE_FOR_CANONICAL = /\(代切|原舊代切|\(切\)|\+\\$\d|一斤裝|1磅裝/i;

function pickCanonicalParent(atChosen, yuanAt) {
  let pool = yuanAt.length ? yuanAt : atChosen;
  const withoutNoise = pool.filter((p) => !NAME_NOISE_FOR_CANONICAL.test(p.name));
  if (withoutNoise.length) pool = withoutNoise;
  pool.sort((a, b) => b.name.length - a.name.length);
  return pool[0];
}

/** If same merge_key but costs differ by more than this, treat as separate SKUs (寧可分開). */
const MERGE_MAX_COST_SPREAD = 0.6;

function variantDedupeKey(v) {
  return `${v.pdf_variant_name}\t${v.pdf_processing_surcharge}\t${v.cash_p0}\t${v.cash_p3}\t${v.suggested_processing_type_codes}`;
}

/**
 * Merge clusters that share mergeStemKey(stem)|unit.
 * Cost: max among rows with 原件/抄碼/原條/原舊; else max of all.
 * Every merged-away parent becomes a [PDF 母列保留] variant so nothing is lost (寧可重複 trace).
 */
function mergeClusters(rawClusters) {
  const byMk = new Map();
  for (const c of rawClusters) {
    const mk = parentClusterMergeKey(c.parent);
    if (!byMk.has(mk)) byMk.set(mk, []);
    byMk.get(mk).push(c);
  }

  const usedIds = new Set();
  const allocId = (baseSlug) => {
    let id = baseSlug || 'item';
    let n = 2;
    while (usedIds.has(id)) {
      id = `${baseSlug}-${n++}`;
    }
    usedIds.add(id);
    return id;
  };

  const parentsOut = [];
  const variantsOut = [];
  const mergeLog = [];

  for (const [mk, list] of byMk) {
    const costs = list.map((x) => x.parent.base_cost_per_lb);
    const spread = Math.max(...costs) - Math.min(...costs);
    const sublists =
      spread > MERGE_MAX_COST_SPREAD
        ? (() => {
            const byCost = new Map();
            for (const c of list) {
              const ck = String(Math.round(c.parent.base_cost_per_lb * 100) / 100);
              if (!byCost.has(ck)) byCost.set(ck, []);
              byCost.get(ck).push(c);
            }
            return [...byCost.values()];
          })()
        : [list];

    for (const sub of sublists) {
      if (sub.length === 1) {
        const c = sub[0];
        const stemCanon = mergeStemKey(c.parent.stem) || c.parent.stem;
        const newId = allocId(slugify(stemCanon));
        parentsOut.push({
          ...c.parent,
          id: newId,
          stem: stemCanon,
        });
        for (const v of c.variants) {
          variantsOut.push({ ...v, parent_ingredient_id: newId });
        }
        mergeLog.push({
          merge_key: mk,
          action: spread > MERGE_MAX_COST_SPREAD ? 'split_by_cost' : 'single',
          final_id: newId,
          chosen_cost: c.parent.base_cost_per_lb,
          chosen_name: c.parent.name,
          merged_parent_names: c.parent.name,
          merged_parent_costs: String(c.parent.base_cost_per_lb),
          cluster_count: 1,
        });
        continue;
      }

      const allParents = sub.map((x) => x.parent);
      const yuan = allParents.filter((p) => PARENT_HINT.test(p.name));
      let chosenCost;
      if (yuan.length) {
        chosenCost = Math.max(...yuan.map((p) => p.base_cost_per_lb));
      } else {
        chosenCost = Math.max(...allParents.map((p) => p.base_cost_per_lb));
      }

      const atChosen = allParents.filter((p) => Math.abs(p.base_cost_per_lb - chosenCost) < 1e-6);
      const yuanAt = atChosen.filter((p) => PARENT_HINT.test(p.name));
      const pick = pickCanonicalParent(atChosen, yuanAt);

      const stemCanon = mergeStemKey(pick.stem) || pick.stem;
      const newId = allocId(slugify(stemCanon));

      parentsOut.push({
        id: newId,
        name: pick.name,
        stem: stemCanon,
        base_cost_per_lb: chosenCost,
        unit: pick.unit,
        supplier_note: `company-quote-2025-10 merged_from=${sub.length} parents | chosen_cost=${chosenCost} | prefer_原件抄碼_then_non代切_name | merge_key=${mk}${spread > MERGE_MAX_COST_SPREAD ? ' | cost_band_split' : ''}`,
      });

      const seenV = new Set();
      for (const item of sub) {
        for (const v of item.variants) {
          const k = variantDedupeKey(v);
          if (seenV.has(k)) continue;
          seenV.add(k);
          variantsOut.push({ ...v, parent_ingredient_id: newId });
        }
      }

      for (const p of allParents) {
        if (p === pick) continue;
        variantsOut.push({
          parent_ingredient_id: newId,
          pdf_variant_name: `[PDF 母列保留] ${p.name}`,
          suggested_processing_type_codes: '',
          pdf_processing_surcharge: '',
          yield_rate_override: DEFAULT_YIELD,
          margin_factor_pdf: '',
          cash_p0: '',
          cash_p3: '',
          review_flag: `merged_parent_trace canonical_cost=${chosenCost} this_pdf_cost=${p.base_cost_per_lb} pre_merge_stem=${p.stem}`,
        });
      }

      mergeLog.push({
        merge_key: mk,
        action: spread > MERGE_MAX_COST_SPREAD ? 'merged_after_cost_split' : 'merged',
        final_id: newId,
        chosen_cost: chosenCost,
        chosen_name: pick.name,
        merged_parent_names: allParents.map((x) => x.name).join(' | '),
        merged_parent_costs: allParents.map((x) => x.base_cost_per_lb).join(';'),
        cluster_count: sub.length,
      });
    }
  }

  return { parents: parentsOut, variants: variantsOut, mergeLog };
}

function isLikelyCutVariant(name) {
  if (VARIANT_FALSE_POSITIVE.test(name)) return false;
  return VARIANT_HINT.test(name);
}

function parentScore(name, row) {
  let score = 0;
  if (PARENT_HINT.test(name)) score += 5;
  if (!isLikelyCutVariant(name)) score += 3;
  if (row.surcharge === '' || row.surcharge === 0) score += 2;
  if (!/\(切\)/.test(name)) score += 1;
  return score;
}

function suggestProcessingCodes(name) {
  const codes = new Set();
  if (/粒|切粒|一口牛/.test(name)) codes.add('dice');
  if (/絲|切絲/.test(name)) codes.add('shred');
  if (/片|刨片|牛肉片|肥牛片|羊肉片/.test(name)) codes.add('slice');
  if (/條/.test(name)) codes.add('strip');
  if (/扒|牛排|肉眼扒|西冷扒/.test(name)) codes.add('steak');
  if (/免治/.test(name)) codes.add('mince');
  if (codes.size === 0 && isLikelyCutVariant(name)) codes.add('slice');
  return [...codes].join('|');
}

async function main() {
  const pdfPath = process.argv[2] || path.join('/Users/chanlokmun/Downloads', '2025年10月公司報價單.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF not found:', pdfPath);
    process.exit(1);
  }

  const buf = fs.readFileSync(pdfPath);
  const doc = await pdfParse(buf);
  const text = doc.text;

  const rows = rowsFromPdfText(text);

  const byGroup = new Map();
  for (const r of rows) {
    const k = groupKey(r);
    if (!byGroup.has(k)) byGroup.set(k, []);
    byGroup.get(k).push(r);
  }

  const clusters = [];
  const usedParentIds = new Set();

  const allocParentId = (baseSlug) => {
    let id = baseSlug;
    let n = 2;
    while (usedParentIds.has(id)) {
      id = `${baseSlug}-${n++}`;
    }
    usedParentIds.add(id);
    return id;
  };

  const normName = (s) => s.replace(/\s+/g, ' ').trim();

  for (const [, groupRows] of byGroup) {
    groupRows.sort((a, b) => parentScore(b.rawName, b) - parentScore(a.rawName, a));

    if (groupRows.length === 1) {
      const r = groupRows[0];
      const stem = stemForGroup(r.rawName);
      if (isLikelyCutVariant(r.rawName) && normName(stem) !== normName(r.rawName)) {
        const pid = allocParentId(slugify(stem));
        clusters.push({
          parent: {
            id: pid,
            name: stem,
            stem,
            base_cost_per_lb: r.baseCost,
            unit: r.unit,
            supplier_note: 'company-quote-2025-10 inferred_parent_from_cut_row',
          },
          variants: [
            {
              parent_ingredient_id: pid,
              pdf_variant_name: r.rawName,
              suggested_processing_type_codes: suggestProcessingCodes(r.rawName),
              pdf_processing_surcharge: r.surcharge === '' ? '' : r.surcharge,
              yield_rate_override: DEFAULT_YIELD,
              margin_factor_pdf: r.margin ?? '',
              cash_p0: r.cashP0,
              cash_p3: r.cashP3,
              review_flag: 'inferred_parent_single_row',
            },
          ],
        });
        continue;
      }
      const pid = allocParentId(slugify(r.rawName));
      clusters.push({
        parent: {
          id: pid,
          name: r.rawName,
          stem,
          base_cost_per_lb: r.baseCost,
          unit: r.unit,
          supplier_note: 'company-quote-2025-10',
        },
        variants: [],
      });
      continue;
    }

    const parent = groupRows[0];
    const stem = stemForGroup(parent.rawName);
    const parentIdFinal = allocParentId(slugify(parent.rawName));

    const cvs = [];
    for (const r of groupRows.slice(1)) {
      const review =
        !isLikelyCutVariant(r.rawName) && (r.surcharge === '' || r.surcharge === 0)
          ? 'maybe_separate_sku'
          : '';
      cvs.push({
        parent_ingredient_id: parentIdFinal,
        pdf_variant_name: r.rawName,
        suggested_processing_type_codes: suggestProcessingCodes(r.rawName),
        pdf_processing_surcharge: r.surcharge === '' ? '' : r.surcharge,
        yield_rate_override: DEFAULT_YIELD,
        margin_factor_pdf: r.margin ?? '',
        cash_p0: r.cashP0,
        cash_p3: r.cashP3,
        review_flag: review,
      });
    }

    clusters.push({
      parent: {
        id: parentIdFinal,
        name: parent.rawName,
        stem,
        base_cost_per_lb: parent.baseCost,
        unit: parent.unit,
        supplier_note: 'company-quote-2025-10',
      },
      variants: cvs,
    });
  }

  const { parents, variants, mergeLog } = mergeClusters(clusters);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const ingHeaders = [
    'id',
    'name',
    'stem_key',
    'base_cost_per_lb',
    'unit',
    'notes',
    'default_yield_placeholder',
  ];
  const ingLines = [
    ingHeaders.join(','),
    ...parents.map((p) =>
      [
        csvEscape(p.id),
        csvEscape(p.name),
        csvEscape(p.stem),
        p.base_cost_per_lb,
        csvEscape(p.unit),
        csvEscape(p.supplier_note),
        DEFAULT_YIELD,
      ].join(','),
    ),
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'company-quote-ingredients.csv'), ingLines.join('\n'), 'utf8');

  const varHeaders = [
    'parent_ingredient_id',
    'pdf_variant_name',
    'suggested_processing_type_codes',
    'pdf_processing_surcharge',
    'yield_rate_override',
    'margin_factor_pdf',
    'cash_p0',
    'cash_p3',
    'review_flag',
  ];
  const varLines = [
    varHeaders.join(','),
    ...variants.map((v) =>
      [
        csvEscape(v.parent_ingredient_id),
        csvEscape(v.pdf_variant_name),
        csvEscape(v.suggested_processing_type_codes),
        v.pdf_processing_surcharge,
        v.yield_rate_override,
        v.margin_factor_pdf,
        csvEscape(v.cash_p0),
        csvEscape(v.cash_p3),
        csvEscape(v.review_flag),
      ].join(','),
    ),
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'company-quote-variants.csv'), varLines.join('\n'), 'utf8');

  const logHeaders = [
    'merge_key',
    'action',
    'final_id',
    'chosen_cost',
    'chosen_name',
    'merged_parent_names',
    'merged_parent_costs',
    'cluster_count',
  ];
  const logLines = [
    logHeaders.join(','),
    ...mergeLog.map((row) =>
      [
        csvEscape(row.merge_key),
        csvEscape(row.action),
        csvEscape(row.final_id),
        row.chosen_cost,
        csvEscape(row.chosen_name),
        csvEscape(row.merged_parent_names),
        csvEscape(row.merged_parent_costs),
        row.cluster_count ?? '',
      ].join(','),
    ),
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'company-quote-merge-log.csv'), logLines.join('\n'), 'utf8');

  console.log(
    `Wrote ${parents.length} parents, ${variants.length} variant rows, ${mergeLog.length} merge-log rows → ${OUT_DIR}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
