const AIRWALLEX_DEMO_BASE = 'https://api-demo.airwallex.com';
const AIRWALLEX_PROD_BASE = 'https://api.airwallex.com';

export default async function handler(req: { method?: string; body?: { amount?: number; merchant_order_id?: string } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 清除空白：讀取時即 .trim()，防止看不見的空格導致失敗
  const clientId = (process.env.AIRWALLEX_CLIENT_ID ?? process.env.VITE_AIRWALLEX_CLIENT_ID ?? '').trim();
  const apiKey = (process.env.AIRWALLEX_API_KEY ?? process.env.VITE_AIRWALLEX_API_KEY ?? '').trim();
  const envRaw = (process.env.AIRWALLEX_ENV ?? process.env.VITE_AIRWALLEX_ENV ?? '').trim();

  // 依 env 決定 demo / prod（demo 時用 api-demo.airwallex.com）
  const useDemo = envRaw !== 'prod';
  const baseUrl = useDemo ? AIRWALLEX_DEMO_BASE : AIRWALLEX_PROD_BASE;
  const authUrl = useDemo
    ? 'https://api-demo.airwallex.com/api/v1/authentication/login'
    : 'https://api.airwallex.com/api/v1/authentication/login';

  // Debug：確認網址與 env（不印出金鑰）
  console.log('目前正在訪問的網址是: ' + authUrl);
  console.log('process.env.VITE_AIRWALLEX_ENV =', JSON.stringify(process.env.VITE_AIRWALLEX_ENV), '| AIRWALLEX_ENV =', JSON.stringify(process.env.AIRWALLEX_ENV));
  console.log('clientId length:', clientId.length, '| apiKey length:', apiKey.length);

  if (useDemo) {
    console.log('Airwallex Sandbox Mode Active');
  }

  if (!clientId || !apiKey) {
    return res.status(500).json({
      error: 'Airwallex credentials not configured. In Vercel, set VITE_AIRWALLEX_CLIENT_ID and VITE_AIRWALLEX_API_KEY (or AIRWALLEX_*).',
      code: 'CREDENTIALS_MISSING',
    });
  }

  const body = req.body as { amount?: number; merchant_order_id?: string };
  const amount = typeof body?.amount === 'number' ? body.amount : undefined;
  const merchantOrderId = typeof body?.merchant_order_id === 'string' ? body.merchant_order_id : undefined;

  if (amount == null || amount <= 0 || !merchantOrderId) {
    return res.status(400).json({
      error: 'Invalid amount or merchant_order_id',
      code: 'BAD_REQUEST',
    });
  }

  const successUrl = 'https://coolfood-app-cursor.vercel.app/success';
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  try {
    // Debug: log full auth URL with keys masked
    console.log('Airwallex auth URL (keys masked):', authUrl, '| env:', envRaw || '(unset)', '| x-client-id length:', clientId.length, '| x-api-key length:', apiKey.length);

    // Token logic: we never use VITE_AIRWALLEX_API_KEY as Bearer. We send client id + api key
    // only in headers x-client-id and x-api-key to the login endpoint to obtain a fresh access_token.
    const authRes = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: '{}',
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error('Airwallex auth failed', authRes.status, baseUrl, errText);
      let airwallexMsg = '';
      try {
        const errJson = JSON.parse(errText) as { message?: string; error?: string; code?: string };
        airwallexMsg = errJson.message ?? errJson.error ?? '';
        if (errJson.code) airwallexMsg = (airwallexMsg ? `${errJson.code}: ${airwallexMsg}` : errJson.code);
      } catch {
        airwallexMsg = errText.slice(0, 120);
      }
      const hint = useDemo
        ? ' Use sandbox Client ID and API key from Airwallex Demo (Settings > Developer > API keys at demo.airwallex.com). In Vercel set AIRWALLEX_ENV=demo or leave unset.'
        : ' Use production Client ID and API key and AIRWALLEX_ENV=prod.';
      const mainMsg = airwallexMsg
        ? `Payment auth failed: ${airwallexMsg}.${hint}`
        : `Payment auth failed. Check Client ID and API key.${hint}`;
      return res.status(502).json({
        error: mainMsg,
        code: 'AUTH_FAILED',
        details: errText.slice(0, 200),
      });
    }

    const authData = (await authRes.json()) as { access_token?: string; token?: string };
    const token = authData.access_token ?? authData.token;
    if (!token) {
      console.error('Airwallex auth: no token in response', authData);
      return res.status(502).json({
        error: 'Payment auth failed (no token). Check credentials and environment (demo vs prod).',
        code: 'AUTH_NO_TOKEN',
      });
    }

    // Use only the access_token from login; never use VITE_AIRWALLEX_API_KEY as Bearer
    const createRes = await fetch(`${baseUrl}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        request_id: requestId,
        amount: Number(amount.toFixed(2)),
        currency: 'HKD',
        merchant_order_id: merchantOrderId,
        return_url: successUrl,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Airwallex create intent failed', createRes.status, errText);
      return res.status(502).json({
        error: 'Payment intent failed. See Vercel function logs for details.',
        code: 'INTENT_FAILED',
        details: errText.slice(0, 200),
      });
    }

    const intentData = (await createRes.json()) as { id?: string; client_secret?: string };
    const intentId = intentData.id;
    const clientSecret = intentData.client_secret;

    if (!intentId || !clientSecret) {
      console.error('Airwallex create intent: missing id or client_secret', intentData);
      return res.status(502).json({
        error: 'Payment intent invalid (missing id or client_secret).',
        code: 'INTENT_INVALID',
      });
    }

    return res.status(200).json({
      intent_id: intentId,
      client_secret: clientSecret,
      currency: 'HKD',
      country_code: 'HK',
    });
  } catch (e) {
    console.error('Airwallex API error', e);
    const errMsg = e instanceof Error ? e.message : String(e);
    return res.status(502).json({
      error: 'Payment system error. Check Vercel function logs.',
      code: 'NETWORK_OR_SERVER_ERROR',
      details: errMsg.slice(0, 200),
    });
  }
}
