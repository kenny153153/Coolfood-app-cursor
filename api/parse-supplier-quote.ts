/**
 * AI Supplier Quote Parser — Vertex AI (Gemini 2.0 Flash)
 * Parses supplier quotation PDFs (via Vision) or WhatsApp text into structured line items.
 * Supports direct PDF binary upload — Gemini reads the PDF visually for accurate table parsing.
 */
import { VertexAI } from '@google-cloud/vertexai';

type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (n: number) => { json: (o: any) => void } };

const VERTEX_MODEL = 'gemini-2.0-flash-001';
const VERTEX_REGION = 'us-central1';

function getVertexClient(): VertexAI {
  const credsJson = process.env.GOOGLE_VERTEX_AI_CREDENTIALS;
  if (!credsJson) throw new Error('GOOGLE_VERTEX_AI_CREDENTIALS not configured');

  const parsed = JSON.parse(credsJson);
  if (parsed.private_key && typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  if (!parsed.project_id) throw new Error('project_id missing in credentials');

  return new VertexAI({
    project: parsed.project_id,
    location: VERTEX_REGION,
    googleAuthOptions: { credentials: parsed },
  });
}

/** Attempt to repair truncated JSON from AI output (common when maxOutputTokens is reached). */
function repairTruncatedJson(raw: string): any | null {
  try { return JSON.parse(raw); } catch {}

  let repaired = raw;

  // Close unclosed string literal
  let inString = false, escaped = false;
  for (const ch of repaired) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') inString = !inString;
  }
  if (inString) repaired += '"';

  // Remove trailing comma or incomplete key-value
  repaired = repaired.replace(/,\s*$/, '');
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/, '');

  // Close unclosed brackets/braces based on a stack
  const close = (s: string): string => {
    const stack: string[] = [];
    let ins = false, esc = false;
    for (const ch of s) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { ins = !ins; continue; }
      if (ins) continue;
      if (ch === '{' || ch === '[') stack.push(ch);
      if (ch === '}' || ch === ']') stack.pop();
    }
    let out = s;
    while (stack.length) { out += stack.pop() === '{' ? '}' : ']'; }
    return out;
  };

  repaired = close(repaired);
  try { return JSON.parse(repaired); } catch {}

  // More aggressive: trim back to last complete array element
  const lastItem = raw.lastIndexOf('},');
  if (lastItem > 0) {
    const trimmed = close(raw.substring(0, lastItem + 1));
    try { return JSON.parse(trimmed); } catch {}
  }
  return null;
}

const SYSTEM_INSTRUCTION = `你是香港凍肉批發行業的報價單解析專家。你需要從供應商報價單（PDF文字或WhatsApp訊息）中提取結構化的報價資料。

你的任務：
1. **辨識供應商**：從報價單中提取公司名、英文名、地址、電話、傳真、聯絡人、WhatsApp號碼
2. **提取報價日期**：找出報價生效日期
3. **逐項解析產品**：拆解每個報價項目為結構化數據

報價項目解析規則：
- **品名分離**：把品牌(如AURORA,FRIMESA,MIRATORG,SADIA,SEARA)從品名中分離
- **產地分離**：把產地(巴西,俄羅斯,印度,中國,美國,愛爾蘭等)從品名中分離
- **規格分離**：把規格(如#727,200+,6x2K,(151))從品名中分離
- **純品名**：剩下的就是原材料名稱(如「豬扒」「肋排」「牛肋條」「梅肉」「金錢肚」)
- **倉位**：提取凍倉地址(如 威強、其士、光一、沙2、百信倉、亞洲)
- **價錢**：提取單價和單位($/LB、$/KG、$/件 等)
- **重量/規格**：提取每件重量(如 25KG、抄碼、10KG)

常見同義詞（品名標準化）：
- 牛冧 = 牛林 = Rump
- 金肚 = 金錢肚 = Honeycomb Tripe
- 餅肋 = 肋排餅裝 = 肋排(餅裝)
- 帶皮挑骨豬腩 = 帶皮帶軟骨挑骨腩
- 梅肉 = 豬梅肉 = 梅頭
- 削骨豬扒 = 去骨豬扒
- 三肉 = 三層肉
- 四肉 = 四層肉

品牌名標準化（統一大寫）：
- Auoura / auoura / Aurora → AURORA
- Frimesa / frimesa → FRIMESA
- Miratorg / miratorg → MIRATORG
- Seara / seara → SEARA
- Sadia / sadia → SADIA

單位標準化：
- $/磅 = $/LB = 磅價 → unit: "lb"
- $/K = $/KG = $/公斤 → unit: "kg"
- $/件 = $/箱 → unit: "pc"
- $/包 → unit: "pack"

⚠️ 重要：
- 有些行可能缺少產品名（PDF表格解析錯亂），這時請根據上下文推斷或標記為unknown
- 「抄碼」表示需要現場確認重量，不是規格
- 「清」表示清倉貨、「新」表示新貨、「↓」表示降價
- 如有多頁，同一供應商不要重複提取供應商資訊

輸出嚴格JSON，無markdown包裹。`;

export default async function handler(req: VercelRequest & { headers?: Record<string, string | string[] | undefined> }, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'warehouse_ops', 'create');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const bodyStr = typeof req.body?.pdfBase64 === 'string' ? req.body.pdfBase64 : '';
  if (bodyStr.length > 10_000_000) {
    return res.status(413).json({ error: 'PDF too large (max 10MB base64)', code: 'PAYLOAD_TOO_LARGE' });
  }

  const {
    content,
    pdfBase64,
    sourceType,
    existingSuppliers,
    existingCatalog,
    existingAliases,
    synonyms,
  } = req.body || {};

  if (!content?.trim() && !pdfBase64) {
    return res.status(400).json({ error: 'content or pdfBase64 is required' });
  }

  const supplierHint = Array.isArray(existingSuppliers) && existingSuppliers.length > 0
    ? `\n\n已知供應商列表（用於匹配）：\n${existingSuppliers.map((s: any) => `- ${s.name}${s.nameEn ? ` (${s.nameEn})` : ''} [ID:${s.id}]`).join('\n')}`
    : '';

  const catalogHint = Array.isArray(existingCatalog) && existingCatalog.length > 0
    ? `\n\n原材料主目錄（用於匹配品名）：\n${existingCatalog.map((c: any) => `- ${c.canonicalName}${c.nameEn ? ` (${c.nameEn})` : ''} [ID:${c.id}] 類別:${c.category || '未分'}`).join('\n')}`
    : '';

  const aliasHint = Array.isArray(existingAliases) && existingAliases.length > 0
    ? `\n\n已知別名映射（精確匹配優先）：\n${existingAliases.map((a: any) => `- "${a.aliasName}" → catalog_id:${a.catalogId}`).join('\n')}`
    : '';

  const synonymHint = synonyms
    ? `\n\n同義詞字典：${JSON.stringify(synonyms)}`
    : '';

  const isPdf = !!pdfBase64;
  const promptText = isPdf
    ? `請仔細閱讀這份 PDF 報價單（包含所有頁面），提取完整的報價資料。注意 PDF 中表格的列對齊——每一行的產品名、規格、倉位、價格要正確對應。
${supplierHint}${catalogHint}${aliasHint}${synonymHint}

請回傳以下JSON格式（嚴格JSON，無markdown包裹）：`
    : `解析以下${sourceType === 'whatsapp' ? 'WhatsApp報價訊息' : '供應商報價單'}：
${supplierHint}${catalogHint}${aliasHint}${synonymHint}

報價單內容：
"""
${content}
"""

請回傳以下JSON格式：`;

  const jsonSchema = `
{
  "supplier": {
    "name": "中文公司名",
    "nameEn": "英文公司名或null",
    "phone": "電話或null",
    "fax": "傳真或null",
    "address": "地址或null",
    "contacts": [{"name": "聯絡人名", "phone": "電話", "role": "角色"}],
    "whatsapp": "WhatsApp號碼或null",
    "matchedSupplierId": "匹配到的已知供應商ID或null"
  },
  "quoteDate": "YYYY-MM-DD",
  "items": [
    {
      "originalText": "報價單原文",
      "canonicalName": "標準品名（去掉品牌/產地/規格）",
      "brand": "品牌（標準化大寫）或null",
      "origin": "產地或null",
      "storageLocation": "倉位或null",
      "unitPrice": 數字,
      "unit": "lb/kg/pc/pack",
      "weightPerCase": "每件重量如25KG",
      "productCode": "貨品號或null",
      "specs": "規格備註或null",
      "matchedCatalogId": "匹配的主目錄ID或null",
      "matchConfidence": 0.0到1.0,
      "notes": "備註如清/新/↓"
    }
  ]
}`;

  const prompt = promptText + jsonSchema;

  try {
    const vertexAI = getVertexClient();
    const model = vertexAI.getGenerativeModel({
      model: VERTEX_MODEL,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 65536,
      },
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_INSTRUCTION }] },
    });

    // Build content parts: for PDF, include the file as inline_data so Gemini reads visually
    const parts: any[] = [];
    if (isPdf) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
    });

    const candidate = result.response?.candidates?.[0];
    const raw = candidate?.content?.parts?.[0]?.text || '';
    const truncated = candidate?.finishReason === 'MAX_TOKENS';

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[parse-supplier-quote] AI did not return valid JSON:', raw.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'AI 未回傳有效 JSON' });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = repairTruncatedJson(jsonMatch[0]);
      if (!parsed) {
        console.error('[parse-supplier-quote] JSON repair failed, raw:', raw.slice(0, 500));
        return res.status(502).json({ ok: false, error: 'AI 回傳的 JSON 不完整且無法修復' });
      }
      console.log('[parse-supplier-quote] Repaired truncated JSON successfully');
    }

    return res.status(200).json({
      ok: true,
      data: parsed,
      model: VERTEX_MODEL,
      ...(truncated && { warning: '回應被截斷，部分項目可能缺失' }),
    });
  } catch (e: any) {
    const msg = e?.message || 'AI parsing failed';
    console.error('[parse-supplier-quote] error:', msg);

    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED', message: '請求太頻繁，請稍後重試' });
    }

    return res.status(502).json({ ok: false, error: msg });
  }
}
