type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (n: number) => { json: (o: any) => void } };

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 2000;

async function callGeminiWithRetry(prompt: string, temperature = 0.7): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature },
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
      await new Promise(r => setTimeout(r, delay));
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (res.status === 429) {
      lastError = new Error(`429 Too Many Requests (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
      console.warn(`[generate-recipe] ${lastError.message}, retrying...`);
      continue;
    }

    const errBody = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errBody.slice(0, 200)}`);
  }

  throw lastError || new Error('Max retries exceeded');
}

const SYSTEM_PREFIX = '你是「CoolFood 凍肉專門店」的 AI 助手，專精冷凍肉類零售。回答時請用專業但親切的繁體中文。\n\n';

const ACTIONS: Record<string, (payload: any) => Promise<any>> = {
  async 'single-recipe'(payload) {
    const { title, linkedProductNames } = payload;
    const context = title
      ? `食譜名稱：${title}${linkedProductNames?.length ? `\n主要食材：${linkedProductNames.join('、')}` : ''}`
      : `主要食材：${linkedProductNames?.join('、') || ''}`;

    const prompt = `${SYSTEM_PREFIX}你是一個專業廚師。根據以下資訊生成一個完整的中式家常菜食譜。回覆嚴格 JSON 格式（不要 markdown），欄位如下：
{
  "title": "食譜名稱",
  "description": "一句話簡介",
  "cooking_time": 數字(分鐘),
  "serving_size": "1-2人份 或 3-4人份",
  "ingredients": [{"name":"食材名","amount":"份量"}],
  "steps": [{"order":1,"content":"步驟描述"}]
}

${context}

要求：
- 繁體中文
- 食材份量要具體（例如「2片」「1湯匙」）
- 步驟要詳細實用（4-6步）
- 如已有食譜名稱就用該名稱，否則根據食材起一個吸引的名稱`;

    const raw = await callGeminiWithRetry(prompt, 0.7);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'batch-recipes'(payload) {
    const { categoryIds } = payload;
    const prompt = `${SYSTEM_PREFIX}你是一個專業中式家常菜廚師。請生成 6 個適合香港家庭的食譜（繁體中文）。
回覆嚴格 JSON 陣列格式（不要 markdown wrapper），每個元素包含：
{
  "title": "食譜名稱",
  "description": "一句話簡介",
  "cooking_time": 數字(分鐘),
  "serving_size": "1-2人份 或 3-4人份",
  "category_ids": ["從以下選：${(categoryIds || []).join(', ')}"],
  "ingredients": [{"name":"食材名","amount":"份量"}],
  "steps": [{"order":1,"content":"步驟描述"}]
}

要求：
- 多樣化：包含快炒、燉煮、意粉、氣炸鍋等不同類型
- 每個食譜 4-6 個步驟
- 食材份量要具體
- 不要使用特殊/難買的食材`;

    const raw = await callGeminiWithRetry(prompt, 0.8);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid JSON array from AI');
    return JSON.parse(match[0]);
  },

  async 'single-product-desc'(payload) {
    const { productName } = payload;
    const prompt = `${SYSTEM_PREFIX}你是一個凍肉零售店的產品描述撰寫員。請為以下凍肉產品撰寫一段吸引人的繁體中文產品描述（2-3句），強調品質、新鮮度和口感。只回覆描述文字，不要加任何標點符號以外的格式。\n\n產品名稱：${productName}`;
    return { description: (await callGeminiWithRetry(prompt, 0.7)).trim() };
  },

  async 'batch-product-desc'(payload) {
    const { productNames } = payload as { productNames: Record<string, string> };
    const prompt = `${SYSTEM_PREFIX}你是一個凍肉零售店的產品描述撰寫員。為以下凍肉產品各撰寫一段繁體中文描述（2-3句），強調品質和口感。回覆 JSON 格式 { "product_id": "描述" }。\n\n${JSON.stringify(productNames, null, 2)}`;
    const raw = await callGeminiWithRetry(prompt, 0.7);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'business-analysis'(_payload) {
    const prompt = `${SYSTEM_PREFIX}你是一個零售業經營顧問。分析並提供 3 個提高凍肉零售店銷量的具體策略。每個策略請包含：標題、具體做法、預期效果。請用繁體中文，格式清晰易讀。`;
    return { text: await callGeminiWithRetry(prompt, 0.7) };
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = req.body || {};

  if (!action || !ACTIONS[action]) {
    return res.status(400).json({ error: `Unknown action: ${action}. Available: ${Object.keys(ACTIONS).join(', ')}` });
  }

  try {
    const result = await ACTIONS[action](payload || {});
    return res.status(200).json({ ok: true, data: result });
  } catch (e: any) {
    console.error(`[generate-recipe] action=${action} error:`, e?.message || e);
    return res.status(502).json({ ok: false, error: e?.message || 'AI generation failed' });
  }
}
