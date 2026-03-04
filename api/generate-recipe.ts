/**
 * AI 生成接口 — Vertex AI (Paid Tier)
 * Engine: Gemini 3.1 Flash-Lite (2026) with fallback to Gemini 3 Flash
 * Region: us-central1 (most stable for 3.x models)
 * Auth: GOOGLE_VERTEX_AI_CREDENTIALS service account JSON
 */
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (n: number) => { json: (o: any) => void } };

export const AI_ENGINE_STATUS = 'Vertex_Paid_Live';

const PRIMARY_MODEL = 'gemini-3.1-flash-lite-preview';
const FALLBACK_MODEL = 'gemini-3-flash-preview';
const VERTEX_REGION = 'us-central1';
const MAX_OUTPUT_TOKENS = 1024;

function getVertexClient(): VertexAI {
  const credsJson = process.env.GOOGLE_VERTEX_AI_CREDENTIALS;
  if (!credsJson) throw new Error('GOOGLE_VERTEX_AI_CREDENTIALS not configured');

  const creds = JSON.parse(credsJson);
  const projectId = creds.project_id;
  if (!projectId) throw new Error('project_id missing in credentials');

  return new VertexAI({
    project: projectId,
    location: VERTEX_REGION,
    googleAuthOptions: { credentials: creds },
  });
}

function getModel(vertexAI: VertexAI, modelId: string, temperature: number): GenerativeModel {
  return vertexAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      temperature,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });
}

async function callVertex(prompt: string, temperature = 0.7): Promise<string> {
  const vertexAI = getVertexClient();
  const contents = [{ role: 'user' as const, parts: [{ text: prompt }] }];

  try {
    const model = getModel(vertexAI, PRIMARY_MODEL, temperature);
    const result = await model.generateContent({ contents });
    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text) return text;
    throw new Error('Empty response from primary model');
  } catch (primaryErr: any) {
    const is404 = primaryErr?.message?.includes('404') || primaryErr?.message?.includes('NOT_FOUND');
    if (!is404) throw primaryErr;

    console.warn(`[generate-recipe] ${PRIMARY_MODEL} unavailable (404), falling back to ${FALLBACK_MODEL}`);
    const fallback = getModel(vertexAI, FALLBACK_MODEL, temperature);
    const result = await fallback.generateContent({ contents });
    return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
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

    const raw = await callVertex(prompt, 0.8);
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'single-product-desc'(payload) {
    const { productName } = payload;
    const prompt = `${SYSTEM_PREFIX}你是一個凍肉零售店的產品描述撰寫員。請為以下凍肉產品撰寫一段吸引人的繁體中文產品描述（2-3句），強調品質、新鮮度和口感。只回覆描述文字，不要加任何標點符號以外的格式。\n\n產品名稱：${productName}`;
    return { description: (await callVertex(prompt, 0.7)).trim() };
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
      model: PRIMARY_MODEL,
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
