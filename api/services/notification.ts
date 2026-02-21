/**
 * 手機通知服務 (Phone Notification Service)
 * ====================================================
 * 統一的手機通知發送邏輯。使用 Ultramsg WhatsApp API。
 *
 * 行為：
 *   1. console.log — 永遠輸出（方便偵錯）
 *   2. Supabase notification_logs — 持久化寫入日誌
 *   3. Ultramsg WhatsApp — 真實發送（需設定 ULTRAMSG_INSTANCE_ID + ULTRAMSG_TOKEN）
 *
 * 使用方式：
 *   import { sendPhoneNotification } from '../services/notification';
 *   await sendPhoneNotification(supabaseAdmin, { orderId, newStatus, waybillNo });
 *
 * 安全性：所有通知操作均以 try/catch 包裹，失敗不會影響訂單流程。
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '../send-whatsapp';

// ────────────────────────────────────────────────────────────────────
// 類型
// ────────────────────────────────────────────────────────────────────

export interface PhoneNotificationEvent {
  orderId: string;
  newStatus: string;
  waybillNo?: string;
  customerPhone?: string;
  source?: string;
}

type Provider = 'ULTRAMSG' | 'MOCK';
type DeliveryStatus = 'LOGGED' | 'SENT' | 'FAILED';

// ────────────────────────────────────────────────────────────────────
// 廣東話通知模板
// ────────────────────────────────────────────────────────────────────

function buildMessageContent(event: PhoneNotificationEvent): string | null {
  const { orderId, newStatus, waybillNo } = event;

  switch (newStatus) {
    case 'paid':
      return `Coolfood: 收到你嘅訂單 ${orderId}！我哋正準備處理，請耐心等候。`;
    case 'processing':
      return `Coolfood: 你嘅訂單 ${orderId} 已經開始處理，我哋會盡快安排出貨。`;
    case 'ready_for_pickup':
      return `Coolfood: 貨品已打包！順豐單號為 ${waybillNo || '（處理中）'}，好快會送到你手上。`;
    case 'shipping':
      return `Coolfood: 順豐哥哥已經攞咗你件貨喇，單號 ${waybillNo || '（處理中）'}，留意收件。`;
    case 'completed':
      return `Coolfood: 順豐顯示你已經收到貨。多謝支持！`;
    default:
      return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// 從 orders 表查詢客戶電話
// ────────────────────────────────────────────────────────────────────

async function lookupCustomerPhone(supabase: SupabaseClient, orderId: string): Promise<string | null> {
  try {
    const dbId = orderId.replace(/^ORD-/, '');
    const { data, error } = await supabase
      .from('orders')
      .select('customer_phone')
      .eq('id', dbId)
      .maybeSingle();
    if (error || !data) return null;
    return data.customer_phone?.trim() || null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// 寫入 notification_logs
// ────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────
// 主入口
// ────────────────────────────────────────────────────────────────────

export async function sendPhoneNotification(
  supabase: SupabaseClient,
  event: PhoneNotificationEvent,
): Promise<void> {
  try {
    const message = buildMessageContent(event);
    if (!message) {
      console.log(`[Notification] No template for status "${event.newStatus}", skip`);
      return;
    }

    let phone = event.customerPhone?.trim() || null;
    if (!phone) {
      phone = await lookupCustomerPhone(supabase, event.orderId);
    }

    console.log(
      `[Notification] ${event.newStatus.toUpperCase()} | ${event.orderId}` +
      (phone ? ` | ${phone}` : ' | (no phone)') +
      (event.waybillNo ? ` | 運單 ${event.waybillNo}` : '') +
      ` | ${message}`,
    );

    let provider: Provider = 'MOCK';
    let deliveryStatus: DeliveryStatus = 'LOGGED';

    if (phone) {
      const result = await sendWhatsAppMessage(phone, message);
      if (result.success) {
        provider = 'ULTRAMSG';
        deliveryStatus = 'SENT';
      } else {
        console.warn(`[Notification] WhatsApp failed: ${result.error}`);
        provider = 'ULTRAMSG';
        deliveryStatus = 'FAILED';
      }
    }

    await writeNotificationLog(supabase, event, phone, message, provider, deliveryStatus);
    console.log(`[Notification] Done: ${event.orderId} → ${provider} (${deliveryStatus})`);
  } catch (err) {
    console.error('[Notification] Unexpected error (swallowed):', err instanceof Error ? err.message : err);
  }
}
