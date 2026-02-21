/**
 * Ultramsg WhatsApp 發送服務
 * 透過 Ultramsg API 發送 WhatsApp 訊息
 *
 * 環境變數（Vercel）:
 *   ULTRAMSG_INSTANCE_ID — Ultramsg Instance ID
 *   ULTRAMSG_TOKEN       — Ultramsg API Token
 */

const ULTRAMSG_INSTANCE_ID = (process.env.ULTRAMSG_INSTANCE_ID ?? '').trim();
const ULTRAMSG_TOKEN = (process.env.ULTRAMSG_TOKEN ?? '').trim();

function formatHKPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `+852${digits}`;
  if (digits.length === 11 && digits.startsWith('852')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('852')) return `+${digits.slice(0, 11)}`;
  if (!phone.startsWith('+') && digits.length > 8) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<{ success: boolean; error?: string }> {
  if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) {
    return { success: false, error: 'Ultramsg not configured (missing ULTRAMSG_INSTANCE_ID or ULTRAMSG_TOKEN)' };
  }

  const phone = formatHKPhone(to);
  const apiUrl = `https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ULTRAMSG_TOKEN, to: phone, body }),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = {}; }

    if (!res.ok || data.error) {
      const errMsg = data.error || `HTTP ${res.status}: ${text.slice(0, 150)}`;
      console.error(`[WhatsApp] Send failed to ${phone}:`, errMsg);
      return { success: false, error: errMsg };
    }

    console.log(`[WhatsApp] Sent to ${phone}, id: ${data.id ?? 'unknown'}`);
    return { success: true };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[WhatsApp] Network error sending to ${phone}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

// Vercel serverless handler (optional direct endpoint)
export default async function handler(
  req: { method?: string; body?: { phone?: string; body?: string } },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; json: (o: object) => void },
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, body } = req.body ?? {};
  if (!phone || !body) {
    return res.status(400).json({ error: 'Missing phone or body' });
  }

  const result = await sendWhatsAppMessage(phone, body);
  return res.status(result.success ? 200 : 502).json(result);
}
