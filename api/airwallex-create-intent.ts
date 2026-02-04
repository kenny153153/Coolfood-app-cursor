const AIRWALLEX_DEMO = 'https://api-demo.airwallex.com';
const AIRWALLEX_PROD = 'https://api.airwallex.com';

export default async function handler(req: { method?: string; body?: { amount?: number; merchant_order_id?: string } }, res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void }) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.AIRWALLEX_CLIENT_ID ?? process.env.VITE_AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY ?? process.env.VITE_AIRWALLEX_API_KEY;
  const envRaw = process.env.AIRWALLEX_ENV ?? process.env.VITE_AIRWALLEX_ENV;
  // Only use demo when explicitly set to 'demo'; otherwise use production
  const useDemo = envRaw === 'demo';
  const baseUrl = useDemo ? AIRWALLEX_DEMO : AIRWALLEX_PROD;

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
    const authRes = await fetch(`${baseUrl}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
        'x-api-key': apiKey,
      },
      body: JSON.stringify({}),
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.error('Airwallex auth failed', authRes.status, errText);
      return res.status(502).json({
        error: 'Payment auth failed. Check Client ID and API key (use sandbox credentials with demo env).',
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
