/**
 * AI 生成接口 — 每次只處理一個請求，保證在 Vercel 10s 限制內完成。
 * 批量邏輯由前端循環調用（帶 6 秒間隔）處理。
 */
type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (n: number) => { json: (o: any) => void } };

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, opts: RequestInit, ms = GEMINI_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function callGemini(prompt: string, temperature = 0.7): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  let res: Response;
  try {
    res = await fetchWithTimeout(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    });
  } catch (e) {
    const isTimeout = e instanceof Error && e.name === 'AbortError';
    throw new Error(isTimeout ? 'TIMEOUT' : `Gemini fetch failed: ${e instanceof Error ? e.message : e}`);
  }

  if (res.status === 429) {
    throw new Error('RATE_LIMITED');
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const SYSTEM_PREFIX = '你是「CoolFood 凍肉專門店」的 AI 助手，專精冷凍肉類零售。回答時請用專業但親切的繁體中文。\n\n';

const ACTIONS: Record<string, (payload: any) => Promise<any>> = {
  async 'single-recipe'(payload) {
    const { title, linkedProductNames, categoryIds } = payload;
    const context = title
      ? `食譜名稱：${title}${linkedProductNames?.length ? `\n主要食材：${linkedProductNames.join('、')}` : ''}`
      : `主要食材：${linkedProductNames?.join('、') || ''}`;

    const categoryHint = Array.isArray(categoryIds) && categoryIds.length > 0
      ? `\n- 從以下分類中選擇 category_ids：${categoryIds.join(', ')}`
      : '';

    const prompt = `${SYSTEM_PREFIX}你是一個專業廚師。根據以下資訊生成一個完整的中式家常菜食譜。回覆嚴格 JSON 格式（不要 markdown），欄位如下：
{
  "title": "食譜名稱",
  "description": "一句話簡介",
  "cooking_time": 數字(分鐘),
  "serving_size": "1-2人份 或 3-4人份",
  "category_ids": [],
  "ingredients": [{"name":"食材名","amount":"份量"}],
  "steps": [{"order":1,"content":"步驟描述"}]
}

${context}

要求：
- 繁體中文
- 食材份量要具體（例如「2片」「1湯匙」）
- 步驟要詳細實用（4-6步）
- 如已有食譜名稱就用該名稱，否則根據食材起一個吸引的名稱${categoryHint}`;

    const raw = await callGemini(prompt, 0.8);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'single-product-desc'(payload) {
    const { productName } = payload;
    const prompt = `${SYSTEM_PREFIX}你是一個凍肉零售店的產品描述撰寫員。請為以下凍肉產品撰寫一段吸引人的繁體中文產品描述（2-3句），強調品質、新鮮度和口感。只回覆描述文字，不要加任何標點符號以外的格式。\n\n產品名稱：${productName}`;
    return { description: (await callGemini(prompt, 0.7)).trim() };
  },

  async 'business-analysis'(_payload) {
    const prompt = `${SYSTEM_PREFIX}你是一個零售業經營顧問。分析並提供 3 個提高凍肉零售店銷量的具體策略。每個策略請包含：標題、具體做法、預期效果。請用繁體中文，格式清晰易讀。`;
    return { text: await callGemini(prompt, 0.7) };
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
    return res.status(200).json({ ok: true, data: result });
  } catch (e: any) {
    const msg = e?.message || 'AI generation failed';
    console.error(`[generate-recipe] action=${action} error:`, msg);

    if (msg === 'TIMEOUT') {
      return res.status(504).json({ ok: false, error: 'TIMEOUT', message: 'AI 回應超時，請重試' });
    }
    if (msg === 'RATE_LIMITED') {
      return res.status(429).json({ ok: false, error: 'RATE_LIMITED', message: '請求太頻繁，請稍後重試' });
    }

    return res.status(502).json({ ok: false, error: msg });
  }
}
