/**
 * AI 生成接口 — Vertex AI (Paid Tier)
 * Engine: Gemini 2.0 Flash (GA stable) + Imagen 3 (image generation)
 * Region: us-central1
 * Auth: GOOGLE_VERTEX_AI_CREDENTIALS service account JSON
 */
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

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

const PRODUCT_DESC_SYSTEM = `你是「CoolFood 凍肉專門店」的產品描述員。用簡潔親切的香港繁體中文撰寫產品描述。

規則：
- 2-3 句，簡短實用，不要浮誇。
- 用全角標點（，、。）。
- 提及產地或特色，再簡單建議一兩種煮法。
- 語氣像街坊推薦，不要像美食雜誌。`;

const RECIPE_SYSTEM = `你是一個幫香港家庭寫食譜的助手。你的用戶是平日要煮飯的爸爸媽媽，不是廚師。

核心原則：
- 食譜要簡單、實際、易煮。一般家庭廚房就能做到。
- 食材控制在 3-8 種以內，用超市或凍肉店買得到的材料。
- 步驟控制在 3-6 步，寫清楚就好，不需要長篇大論。
- 煮食時間控制在 30 分鐘以內（燉煮類除外）。

命名規則：
- 食譜名稱要簡短直接，像日常對話一樣。
- 正確示範：蒸水蛋、避風塘雞軟骨、蒜蓉牛油蝦、日式薑燒豬肉
- 錯誤示範：避風塘風味氣炸鍋雞軟骨：惹味香脆！、嫩滑如絲黃金蒸水蛋
- 不要加副標題、冒號、感嘆號、形容詞修飾。名稱就是菜名本身。

風格：
- 香港繁體中文，用全角標點（，、。）。
- 語氣平實、親切，像朋友分享食譜一樣。
- chef_tip 寫一條實用小貼士就好（如保存方法、替代食材）。`;

function withUserInstruction(base: string, userInstruction?: string): string {
  if (!userInstruction?.trim()) return base;
  return `【用戶額外指令 — 最高優先】\n${userInstruction.trim()}\n\n---\n\n${base}`;
}

const FOOD_PHOTO_DIRECTOR_SYSTEM = `You are a professional food photography art director. 
Your task: translate a Chinese recipe name and short description into a highly detailed English image generation prompt for Imagen 3.

Rules:
- Output ONLY the English prompt text. No explanations, no quotes, no JSON.
- Always include: the precise English name of the dish, key ingredients visible, plating style (Chinese home-style or restaurant), lighting (natural daylight or warm studio), camera angle (overhead or 45-degree), and quality keywords.
- End every prompt with: food photography, high resolution, appetizing, vibrant colors, professional food styling.
- Keep it under 200 words.`;

async function expandPromptWithGemini(title: string, description: string): Promise<string> {
  const input = `Recipe name: ${title}${description ? `\nDescription: ${description}` : ''}`;
  const expanded = await callVertex(input, 0.4, { systemInstruction: FOOD_PHOTO_DIRECTOR_SYSTEM });
  return expanded.trim() || `Professional food photography of ${title}, served on a white ceramic plate, natural daylight, overhead shot, appetizing, high resolution`;
}

async function callImagen(prompt: string): Promise<string> {
  const credsJson = process.env.GOOGLE_VERTEX_AI_CREDENTIALS;
  if (!credsJson) throw new Error('GOOGLE_VERTEX_AI_CREDENTIALS not configured');

  const parsed = JSON.parse(credsJson);
  if (parsed.private_key && typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  if (!parsed.project_id) throw new Error('project_id missing in credentials');

  const auth = new GoogleAuth({
    credentials: parsed,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await (client as any).getAccessToken();
  const token = tokenResponse?.token ?? tokenResponse;

  const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${parsed.project_id}/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        safetyFilterLevel: 'block_few',
        personGeneration: 'dont_allow',
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data.error?.message || `Imagen API error: ${response.status}`;
    console.error('[callImagen] error:', errMsg, JSON.stringify(data).slice(0, 300));
    throw new Error(errMsg);
  }

  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error('No image returned from Imagen');
  return base64;
}

const ACTIONS: Record<string, (payload: any) => Promise<any>> = {
  async 'single-recipe'(payload) {
    const { title, linkedProductNames, categoryIds, categoryMap, existingTitles, userInstruction } = payload;
    const context = title
      ? `食譜名稱：${title}${linkedProductNames?.length ? `\n主要食材：${linkedProductNames.join('、')}` : ''}`
      : `主要食材：${linkedProductNames?.join('、') || ''}`;

    const categoryHint = Array.isArray(categoryMap) && categoryMap.length > 0
      ? `\n- 從以下分類中選擇最合適的 1-2 個 category_ids：${categoryMap.map((c: any) => `${c.id}(${c.name})`).join('、')}\n- 只用以上已有的分類 ID，不要自創`
      : Array.isArray(categoryIds) && categoryIds.length > 0
        ? `\n- 從以下分類中選擇 category_ids：${categoryIds.join(', ')}`
        : '';

    const exclusionHint = Array.isArray(existingTitles) && existingTitles.length > 0
      ? `\n\n⚠️ 嚴格禁止重複！以下食譜已存在，絕對不能重複或使用相近名稱：\n${existingTitles.map((t: string) => `- ${t}`).join('\n')}\n請生成一個完全不同主題的食譜。`
      : '';

    const basePrompt = `生成一個簡單家常食譜。回覆嚴格 JSON（不要 markdown）：
{
  "title": "菜名（簡短直接，如：蒸水蛋、蒜蓉蝦）",
  "description": "一句話介紹這道菜",
  "cooking_time": 數字(分鐘),
  "serving_size": "2-3人份",
  "category_ids": [],
  "ingredients": [{"name":"食材","amount":"份量"}],
  "steps": [{"order":1,"content":"步驟"}],
  "chef_tip": "一條實用小貼士"
}

${context}

要求：
- 繁體中文，全角標點
- 食材 3-8 種，份量寫具體（如「2片」「1湯匙」）
- 步驟 3-6 步，簡潔清楚
- title 只寫菜名，不加副標題、不加感嘆號、不加形容詞修飾
- 如有食譜名稱就用，否則起一個簡短的菜名
- 以香港家常小菜為主${categoryHint}${exclusionHint}`;

    const raw = await callVertex(withUserInstruction(basePrompt, userInstruction), 0.85, { topP: 0.95, systemInstruction: RECIPE_SYSTEM });
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid JSON from AI');
    return JSON.parse(match[0]);
  },

  async 'single-product-desc'(payload) {
    const { productName, userInstruction } = payload;
    const basePrompt = `為以下凍肉產品寫 2-3 句簡短描述。提及產品特色和建議煮法。只回覆文字，不要任何格式。\n\n產品名稱：${productName}`;
    return { description: (await callVertex(withUserInstruction(basePrompt, userInstruction), 0.7, { systemInstruction: PRODUCT_DESC_SYSTEM })).trim() };
  },

  async 'generate-field'(payload) {
    const { fieldType, productName, productDescription, currentValue } = payload;
    const ctx = `產品名稱：${productName || ''}${productDescription ? `\n產品描述：${productDescription}` : ''}${currentValue ? `\n目前內容：${currentValue}` : ''}`;

    const prompts: Record<string, string> = {
      'seo-title': `為以下凍肉產品寫一個 SEO 標題（不超過 60 字元）。格式：「產品名 | 關鍵詞 | CoolFood」。只回覆標題文字。\n\n${ctx}`,
      'seo-description': `為以下凍肉產品寫一段 SEO 描述（50-150 字元），用於 Google 搜尋結果。包含產品特色和關鍵詞。只回覆描述文字。\n\n${ctx}`,
      'image-alt': `為以下凍肉產品的圖片寫一段簡短 alt 文字（不超過 30 字元），描述產品外觀。只回覆 alt 文字。\n\n${ctx}`,
      'name-en': `將以下凍肉產品名稱翻譯成英文。簡潔專業。只回覆英文名稱。\n\n${ctx}`,
      'desc-en': `將以下凍肉產品描述翻譯成英文。保持簡潔。只回覆英文描述。\n\n${ctx}`,
    };

    const prompt = prompts[fieldType];
    if (!prompt) throw new Error(`Unknown fieldType: ${fieldType}`);
    const text = (await callVertex(prompt, 0.3, { systemInstruction: SYSTEM_PREFIX })).trim();
    return { text };
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

  async 'generate-recipe-image'(payload) {
    const { title, description } = payload;
    // Step 1: Gemini expands the Chinese recipe name into a rich English photography prompt
    const expandedPrompt = await expandPromptWithGemini(title, description || '');
    console.log(`[generate-recipe-image] title="${title}" → expanded prompt: ${expandedPrompt.slice(0, 120)}...`);
    // Step 2: Imagen 3 generates the image from the expanded prompt
    const base64Image = await callImagen(expandedPrompt);
    return { base64Image, expandedPrompt };
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
