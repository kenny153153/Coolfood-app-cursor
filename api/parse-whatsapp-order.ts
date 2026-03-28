/**
 * AI WhatsApp 訂單解析 — Vertex AI (Gemini 2.0 Flash)
 * 將客戶 WhatsApp 訊息 + 壓縮產品清單 + 修正記錄發送給 AI
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

const SYSTEM_INSTRUCTION = `你是香港食品批發公司的訂單解析專家。從 WhatsApp 訊息中**只提取食品訂單項目**並匹配產品清單。

⚠️ 最高優先：只輸出食品訂單項目。非食品（人名、備註、寒暄）絕不輸出。寧漏勿錯。

規則：
1. **匹配產品清單**：優先匹配清單中的產品ID。看起來像食材但無法匹配→productId=null。不像食品→丟棄。
2. **拆分**：一行多產品（逗號/頓號分隔）→各自獨立輸出。例：「蝦肉4包，海鮮2包」→兩項。
3. **中文數字**：五=5、三=3、半=0.5、十=10、兩=2。「兩磅半」=2.5磅。
4. **單位**：磅/斤/件/包/盒/箱/碟/隻/條/塊/盤/份/打/kg/lb/pc。KG保持不轉。無單位→推斷。
5. **廣東話口語量詞**：「舊」=塊、「嚿」=塊、「紮」=束/紮、「撻」=個、「碌」=條、「件」=件、「底」=個、「板」=板。例：「牛油10舊」=牛油10塊。
6. **中英雙語匹配**：產品有中英文名。"Beef short plates"→匹配牛肋條。不分大小寫，接受簡稱近似。productName永遠輸出**中文名**。
7. **忽略**：人名(李小姐/陳生/王太)、寒暄、備註指示、日期時間、客戶名單中的名字。括號內容→放note欄。單獨括號行→併入上一產品note。
8. **格式**：「肥牛x5磅」「5磅肥牛」「肥牛5」都能解析。
9. **修正記錄**：如有提供過往修正範例，嚴格學習這些模式。修正代表用戶的明確意圖，優先級最高。
10. **加工方式提取**：如訊息提到加工方式（切粒、切片、切絲、切條、切扒、免治、醃製、原件等），提取 processingCode 和 processingSpec。
    - 常見關鍵詞對應：切片/薄切→slice、切粒/粒狀→dice、切絲→shred、切條→strip、切扒→steak、免治/碎→mince、醃/醃製→marinate、原件/原塊/整件→whole
    - 規格數字提取：「切片3mm」→processingCode="slice",processingSpec="3MM"。「切扒4分厚」→processingCode="steak",processingSpec="4分厚"。「切粒1吋」→processingCode="dice",processingSpec="1吋×1吋"
    - 如有提供加工方式清單，嚴格使用清單中的 code。如無匹配→processingCode=null
    - 如有提供客戶偏好，在客戶沒有指明加工方式時，參考偏好自動填入。
11. **輸出**：嚴格JSON array，無markdown。無食品項→空array []`;

export default async function handler(req: VercelRequest & { headers?: Record<string, string | string[] | undefined> }, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { verifyAdminRequest } = await import('./_adminAuth.js');
  const authResult = await verifyAdminRequest(req, 'orders', 'create');
  if (!authResult.ok) return res.status(authResult.status).json({ error: authResult.error, code: 'UNAUTHORIZED' });

  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > 500_000) {
    return res.status(413).json({ error: 'Request too large', code: 'PAYLOAD_TOO_LARGE' });
  }

  const { message, products, clientNames, corrections, extraUnits, processingTypes, clientPreferences } = req.body || {};

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'products array is required' });
  }

  // Compact product list: "ID|中文名|英文名|$價|規格" — ~15 tokens per product vs ~40 before
  const productList = products
    .map((p: any) => {
      const parts = [p.id, p.name];
      if (p.nameEn) parts.push(p.nameEn);
      parts.push(`$${p.price}`);
      if (p.weight) parts.push(p.weight);
      return parts.join('|');
    })
    .join('\n');

  const clientHint = Array.isArray(clientNames) && clientNames.length > 0
    ? `\n非產品名單：${clientNames.join('、')}`
    : '';

  const unitHint = Array.isArray(extraUnits) && extraUnits.length > 0
    ? `\n額外自訂單位：${extraUnits.join('、')}`
    : '';

  const correctionHint = Array.isArray(corrections) && corrections.length > 0
    ? `\n\n過往修正（請嚴格學習）：\n${corrections.map((c: any) =>
        `「${c.original_text}」→ ${c.corrected_product_name} ${c.corrected_qty}${c.corrected_unit}`
      ).join('\n')}`
    : '';

  const processingHint = Array.isArray(processingTypes) && processingTypes.length > 0
    ? `\n\n加工方式清單（code|中文名|規格）：\n${processingTypes.map((pt: any) =>
        `${pt.code}|${pt.name}${pt.spec ? '|' + pt.spec : ''}`
      ).join('\n')}`
    : '';

  const prefHint = Array.isArray(clientPreferences) && clientPreferences.length > 0
    ? `\n\n此客戶常用加工偏好（客戶沒指明時參考）：\n${clientPreferences.map((p: any) =>
        `${p.ingredientName} → ${p.processingName}${p.spec ? ' ' + p.spec : ''}`
      ).join('\n')}`
    : '';

  const prompt = `產品清單（格式：ID|中文名|英文名|價格|規格）：
${productList}
${clientHint}${unitHint}${correctionHint}${processingHint}${prefHint}

解析：
"""
${message}
"""

JSON array:
[{"productId":"ID或null","productName":"中文名","originalText":"原文","qty":數字,"unit":"單位","processingCode":"加工code或null","processingSpec":"規格或null","note":"其他備註或null"}]`;

  try {
    const vertexAI = getVertexClient();
    const model = vertexAI.getGenerativeModel({
      model: VERTEX_MODEL,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[parse-whatsapp-order] AI did not return valid JSON array:', raw.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'AI 未回傳有效 JSON' });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      ok: true,
      data: parsed,
      model: VERTEX_MODEL,
    });
  } catch (e: any) {
    const msg = e?.message || 'AI parsing failed';
    console.error('[parse-whatsapp-order] error:', msg);

    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED', message: '請求太頻繁，請稍後重試' });
    }

    return res.status(502).json({ ok: false, error: msg });
  }
}
