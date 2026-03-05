/**
 * 手機通知服務 (Phone Notification Service)
 * 統一的手機通知發送邏輯。使用 Ultramsg WhatsApp API。
 *
 * WhatsApp 邏輯直接內嵌，避免 Vercel serverless 跨檔案 import 錯誤。
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface PhoneNotificationEvent {
  orderId: string;
  newStatus: string;
  waybillNo?: string;
  customerPhone?: string;
  source?: string;
}

type Provider = 'ULTRAMSG' | 'MOCK';
type DeliveryStatus = 'LOGGED' | 'SENT' | 'FAILED';

// ─── Inline WhatsApp helper ──────────────────────────────────────────

function formatHKPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `+852${digits}`;
  if (digits.length === 11 && digits.startsWith('852')) return `+${digits}`;
  if (digits.length === 12 && digits.startsWith('852')) return `+${digits.slice(0, 11)}`;
  if (!phone.startsWith('+') && digits.length > 8) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${digits}`;
}

async function sendWhatsAppMessage(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  const instanceId = (process.env.ULTRAMSG_INSTANCE_ID ?? '').trim();
  const token = (process.env.ULTRAMSG_TOKEN ?? '').trim();
  if (!instanceId || !token) return { success: false, error: 'Ultramsg not configured' };

  const phone = formatHKPhone(to);
  try {
    const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: phone, body }),
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
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─── Message templates ───────────────────────────────────────────────

function buildMessageContent(event: PhoneNotificationEvent): string | null {
  const { orderId, newStatus, waybillNo } = event;

  switch (newStatus) {
    case 'paid':
      return `Coolfood: 收到你嘅訂單 ${orderId}！我哋正準備處理，請耐心等候。`;
    case 'preparing':
      return `Coolfood: 你嘅訂單 ${orderId} 已經開始備貨，我哋會盡快安排出貨。`;
    case 'shipping':
      return `Coolfood: 你嘅訂單 ${orderId} 已安排發貨，順豐單號為 ${waybillNo || '（處理中）'}，好快會送到你手上。`;
    case 'shipped':
      return `Coolfood: 順豐哥哥已經攞咗你件貨喇，單號 ${waybillNo || '（處理中）'}，留意收件。`;
    case 'delivered':
      return `Coolfood: 順豐顯示你已經收到貨。多謝支持！`;
    default:
      return null;
  }
}

async function lookupCustomerPhone(supabase: SupabaseClient, orderId: string): Promise<string | null> {
  try {
    const dbId = orderId.replace(/^ORD-/, '');
    const { data, error } = await supabase
      .from('orders').select('customer_phone').eq('id', dbId).maybeSingle();
    if (error || !data) return null;
    return data.customer_phone?.trim() || null;
  } catch {
    return null;
  }
}

async function writeNotificationLog(
  supabase: SupabaseClient,
  event: PhoneNotificationEvent,
  phone: string | null,
  message: string,
  provider: Provider,
  deliveryStatus: DeliveryStatus,
): Promise<void> {
  try {
    const { error } = await supabase.from('notification_logs').insert({
      order_id: event.orderId,
      phone_number: phone,
      status_type: event.newStatus,
      content: message,
      provider,
      delivery_status: deliveryStatus,
      created_at: new Date().toISOString(),
    });
    if (error) console.warn('[Notification] Log write failed:', error.message);
  } catch (err) {
    console.warn('[Notification] Log exception:', err instanceof Error ? err.message : err);
  }
}

// ─── Main entry ──────────────────────────────────────────────────────

export async function sendPhoneNotification(
  supabase: SupabaseClient,
  event: PhoneNotificationEvent,
): Promise<void> {
  try {
    const message = buildMessageContent(event);
    if (!message) return;

    let phone = event.customerPhone?.trim() || null;
    if (!phone) phone = await lookupCustomerPhone(supabase, event.orderId);

    console.log(
      `[Notification] ${event.newStatus.toUpperCase()} | ${event.orderId}` +
      (phone ? ` | ${phone}` : ' | (no phone)') +
      (event.waybillNo ? ` | 運單 ${event.waybillNo}` : ''),
    );

    let provider: Provider = 'MOCK';
    let deliveryStatus: DeliveryStatus = 'LOGGED';

    if (phone) {
      const result = await sendWhatsAppMessage(phone, message);
      provider = 'ULTRAMSG';
      deliveryStatus = result.success ? 'SENT' : 'FAILED';
      if (!result.success) console.warn(`[Notification] WhatsApp failed: ${result.error}`);
    }

    await writeNotificationLog(supabase, event, phone, message, provider, deliveryStatus);
  } catch (err) {
    console.error('[Notification] Unexpected error (swallowed):', err instanceof Error ? err.message : err);
  }
}
