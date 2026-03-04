/**
 * AI 生成接口 — Vertex AI (Paid Tier)
 * Engine: Gemini 2.0 Flash (GA stable)
 * Region: us-central1
 * Auth: GOOGLE_VERTEX_AI_CREDENTIALS service account JSON
 */
import { VertexAI } from '@google-cloud/vertexai';

type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (n: number) => { json: (o: any) => void } };

export const AI_ENGINE_STATUS = 'Vertex_Paid_Live';

const VERTEX_MODEL = 'gemini-2.0-flash-001';
const VERTEX_REGION = 'us-central1';
const MAX_OUTPUT_TOKENS = 2048;

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

async function callVertex(
  prompt: string,
  temperature = 0.7,
  options?: { topP?: number; systemInstruction?: string },
): Promise<string> {
  const vertexAI = getVertexClient();

  const modelConfig: any = {
    model: VERTEX_MODEL,
    generationConfig: {
      temperature,
      topP: options?.topP ?? 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  };
  if (options?.systemInstruction) {
    modelConfig.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  const model = vertexAI.getGenerativeModel(modelConfig);

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const SYSTEM_PREFIX = '你是「CoolFood 凍肉專門店」的 AI 助手，專精冷凍肉類零售。回答時請用專業但親切的繁體中文。\n\n';

const PRODUCT_DESC_SYSTEM = `你是一位香港高端電商的資深食評人與行銷專家，專門為「CoolFood 凍肉專門店」撰寫產品描述。

【標點規範】
- 必須使用標準中文全角標點符號（，、。！）。
- 嚴禁出現沒有標點的長難句，每句不超過 30 字。

【內容結構】
每段描述需依次包含：
1. 產品來源與等級（如產地、品牌、等級認證）
2. 口感特色描述（如質感、風味、脂香）
3. 建議烹飪方式（如煎、焗、氣炸、慢煮等）

【語言風格】
- 使用道地的香港繁體中文。
- 語氣優雅、誘人，適度使用「入口即化」、「脂香濃郁」、「肉質鮮嫩」、「油花分佈均勻」等形容詞。
- 行文要有節奏感，讓顧客閱讀時產生食慾。`;

const RECIPE_SYSTEM = `你是一位駐港的星級私房菜大廚，同時擅長香港大排檔風味、日式料理、西式慢煮及氣炸鍋創意食譜。

【標點規範】
- 必須使用標準中文全角標點符號（，、。！）。
- 每個步驟需完整成句，不可省略標點。

【食譜結構要求】
每份食譜必須包含以下三大部分：
1. 食材準備（ingredients）：列明每項食材的精確份量。
2. 烹飪步驟（steps）：分點標號，步驟清晰，包含火候、時間、技巧細節。
3. 大廚小貼士（chef_tip）：提供 1-2 條實用建議，如食材替換、保存方法或擺盤技巧。

【風格與獨特性】
- 使用道地的香港繁體中文。
- 優先生成具有香港特色的家常菜（如大排檔風味、茶餐廳經典）或流行西餐（如慢煮牛扒、氣炸鍋食譜）。
- 食譜名稱要有吸引力，避免平淡無奇的命名。
- 每份食譜都應有獨特賣點，避免千篇一律。`;

const ACTIONS: Record<string, (payload: any) => Promise<any>> = {
  async 'single-recipe'(payload) {
    const { title, linkedProductNames, categoryIds, existingTitles } = payload;
    const context = title
      ? `食譜名稱：${title}${linkedProductNames?.length ? `\n主要食材：${linkedProductNames.join('、')}` : ''}`
      : `主要食材：${linkedProductNames?.join('、') || ''}`;

    const categoryHint = Array.isArray(categoryIds) && categoryIds.length > 0
      ? `\n- 從以下分類中選擇 category_ids：${categoryIds.join(', ')}`
      : '';

    const exclusionHint = Array.isArray(existingTitles) && existingTitles.length > 0
      ? `\n\n【排除清單 — 請勿重複生成與以下標題相似的食譜】\n${existingTitles.map((t: string) => `- ${t}`).join('\n')}`
      : '';

    const prompt = `根據以下資訊生成一個完整的食譜。回覆嚴格 JSON 格式（不要 markdown），欄位如下：
{
  "title": "食譜名稱（要有創意和吸引力）",
  "description": "一句話簡介，突出風味特色",
  "cooking_time": 數字(分鐘),
  "serving_size": "1-2人份 或 3-4人份",
  "category_ids": [],
  "ingredients": [{"name":"食材名","amount":"份量"}],
  "steps": [{"order":1,"content":"步驟描述（需包含火候與時間）"}],
  "chef_tip": "大廚小貼士：一條實用建議"
}

${context}

要求：
- 繁體中文，使用全角標點符號（，、。）
- 食材份量要具體（例如「2片（約200g）」「1湯匙」「少許」）
- 步驟要詳細實用（5-8步），每步包含火候和時間
- 必須包含 chef_tip 欄位
- 如已有食譜名稱就用該名稱，否則根據食材起一個有創意且吸引的名稱
- 優先考慮香港特色家常菜、大排檔風味、氣炸鍋或慢煮食譜${categoryHint}${exclusionHint}`;

    const raw = await callVertex(prompt, 0.8, { topP: 0.95, systemInstruction: RECIPE_SYSTEM });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'single-product-desc'(payload) {
    const { productName } = payload;
    const prompt = `請為以下凍肉產品撰寫一段高品質的繁體中文產品描述（3-4句）。

產品名稱：${productName}

要求：
- 第一句點明產品來源或等級
- 第二句描述口感與風味特色
- 第三句推薦烹飪方式
- 使用全角標點符號（，、。！）
- 只回覆描述文字本身，不要加任何格式標記`;
    return { description: (await callVertex(prompt, 0.8, { topP: 0.95, systemInstruction: PRODUCT_DESC_SYSTEM })).trim() };
  },

  async 'business-analysis'(_payload) {
    const prompt = `${SYSTEM_PREFIX}你是一個零售業經營顧問。分析並提供 3 個提高凍肉零售店銷量的具體策略。每個策略請包含：標題、具體做法、預期效果。請用繁體中文，格式清晰易讀。`;
    return { text: await callVertex(prompt, 0.7) };
  },

  async 'translate-ui'(payload) {
    const { texts } = payload;
    const prompt = `Translate the following Chinese UI text keys to English for a frozen meat online retail shop. Return ONLY a valid JSON object with the same keys. Keep translations concise and professional.\n\n${JSON.stringify(texts, null, 2)}`;
    const raw = await callVertex(prompt, 0.3);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON');
    return JSON.parse(match[0]);
  },

  async 'translate-products'(payload) {
    const { names } = payload;
    const prompt = `Translate these Chinese frozen meat product names to English. Return ONLY a valid JSON object with the same keys (product IDs) and English name values. Be concise and professional.\n\n${JSON.stringify(names, null, 2)}`;
    const raw = await callVertex(prompt, 0.3);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI did not return valid JSON');
    return JSON.parse(match[0]);
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body || {};

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({
      error: `Unknown action: ${action}. Available: ${Object.keys(ACTIONS).join(', ')}`,
    });
  }

  try {
    const result = await ACTIONS[action](payload || {});
    return res.status(200).json({
      ok: true,
      data: result,
      engine: AI_ENGINE_STATUS,
      model: VERTEX_MODEL,
    });
  } catch (e: any) {
    const msg = e?.message || 'AI generation failed';
    console.error(`[generate-recipe][${AI_ENGINE_STATUS}] action=${action} error:`, msg);

    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED', message: '請求太頻繁，請稍後重試', engine: AI_ENGINE_STATUS });
    }

    return res.status(502).json({ ok: false, error: msg, engine: AI_ENGINE_STATUS });
  }
}
