/**
 * 手機優先通知服務 (Phone-First Notification Service)
 * ====================================================
 * 統一的手機通知發送邏輯。本系統不收集客戶電郵。
 *
 * 目前行為 (Sandbox)：
 *   1. console.log — 永遠輸出（方便偵錯）
 *   2. Supabase notification_logs — 持久化寫入日誌
 *
 * 未來通道（填入 Key 即啟用）：
 *   3. WhatsApp Business API（WHATSAPP_API_TOKEN）
 *   4. Twilio SMS（TWILIO_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_PHONE）
 *
 * 使用方式：
 *   import { sendPhoneNotification } from '../services/notification';
 *   await sendPhoneNotification(supabaseAdmin, { orderId, newStatus, waybillNo });
 *
 * 安全性：所有通知操作均以 try/catch 包裹，失敗不會影響訂單流程。
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────────────
// 環境變數（填入 Key 即啟用真實發送）
// ────────────────────────────────────────────────────────────────────

// WhatsApp Business API (Meta Cloud API)
const WHATSAPP_API_TOKEN = (process.env.WHATSAPP_API_TOKEN ?? '').trim();
const WHATSAPP_PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID ?? '').trim();

// Twilio SMS
const TWILIO_SID = (process.env.TWILIO_SID ?? '').trim();
const TWILIO_AUTH_TOKEN = (process.env.TWILIO_AUTH_TOKEN ?? '').trim();
const TWILIO_FROM_PHONE = (process.env.TWILIO_FROM_PHONE ?? '').trim();

// ────────────────────────────────────────────────────────────────────
// 類型
// ────────────────────────────────────────────────────────────────────

export interface PhoneNotificationEvent {
  /** 訂單 ID (e.g. "ORD-1769855343814") */
  orderId: string;
  /** 新狀態 */
  newStatus: string;
  /** 順豐運單號 (shipping / ready_for_pickup 時需要) */
  waybillNo?: string;
  /** 收件人電話（若不提供，會自動從 orders 表查詢） */
  customerPhone?: string;
  /** 觸發來源（用於日誌追蹤） */
  source?: string;
}

type Provider = 'MOCK_WHATSAPP' | 'WHATSAPP' | 'TWILIO_SMS';
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
// 真實發送通道（填入 Key 後啟用）
// ────────────────────────────────────────────────────────────────────

async function sendViaWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, error: 'WHATSAPP not configured' };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `WhatsApp HTTP ${res.status}: ${errText.slice(0, 100)}` };
    }

    console.log(`[Notification] WhatsApp sent to ${phone}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function sendViaTwilioSms(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_PHONE) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_FROM_PHONE,
        To: phone,
        Body: message,
      }).toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Twilio HTTP ${res.status}: ${errText.slice(0, 100)}` };
    }

    console.log(`[Notification] Twilio SMS sent to ${phone}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
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
    if (error) {
      console.warn('[Notification] Log write failed:', error.message);
    }
  } catch (err) {
    console.warn('[Notification] Log exception:', err instanceof Error ? err.message : err);
  }
}

// ────────────────────────────────────────────────────────────────────
// 主入口
// ────────────────────────────────────────────────────────────────────

/**
 * 發送手機通知
 *
 * 流程：
 *   1. 根據 newStatus 生成廣東話訊息（無模板則跳過）
 *   2. 若無 customerPhone，自動從 orders 表查詢
 *   3. console.log 輸出（永遠）
 *   4. 嘗試真實發送（WhatsApp > Twilio SMS，按 Key 啟用）
 *   5. 寫入 notification_logs
 *
 * 安全性：整個函數以 try/catch 包裹，絕不拋出異常。
 */
export async function sendPhoneNotification(
  supabase: SupabaseClient,
  event: PhoneNotificationEvent,
): Promise<void> {
  try {
    // 1. 生成訊息
    const message = buildMessageContent(event);
    if (!message) {
      console.log(`[Notification] No template for status "${event.newStatus}", skip`);
      return;
    }

    // 2. 取得電話號碼
    let phone = event.customerPhone?.trim() || null;
    if (!phone) {
      phone = await lookupCustomerPhone(supabase, event.orderId);
    }

    // 3. Console 輸出（永遠）
    console.log(
      `[Notification] 📱 ${event.newStatus.toUpperCase()} | ${event.orderId}` +
      (phone ? ` | ${phone}` : ' | (no phone)') +
      (event.waybillNo ? ` | 運單 ${event.waybillNo}` : '') +
      ` | ${message}`,
    );

    // 4. 嘗試真實發送
    let provider: Provider = 'MOCK_WHATSAPP';
    let deliveryStatus: DeliveryStatus = 'LOGGED';

    if (phone) {
      // 優先嘗試 WhatsApp
      if (WHATSAPP_API_TOKEN) {
        const result = await sendViaWhatsApp(phone, message);
        if (result.success) {
          provider = 'WHATSAPP';
          deliveryStatus = 'SENT';
        } else {
          console.warn(`[Notification] WhatsApp failed: ${result.error}`);
          provider = 'WHATSAPP';
          deliveryStatus = 'FAILED';
        }
      }
      // 備援：Twilio SMS
      else if (TWILIO_SID) {
        const result = await sendViaTwilioSms(phone, message);
        if (result.success) {
          provider = 'TWILIO_SMS';
          deliveryStatus = 'SENT';
        } else {
          console.warn(`[Notification] Twilio SMS failed: ${result.error}`);
          provider = 'TWILIO_SMS';
          deliveryStatus = 'FAILED';
        }
      }
      // 無 Key → Sandbox 模式
      else {
        provider = 'MOCK_WHATSAPP';
        deliveryStatus = 'LOGGED';
      }
    }

    // 5. 寫入 notification_logs
    await writeNotificationLog(supabase, event, phone, message, provider, deliveryStatus);

    console.log(`[Notification] Done: ${event.orderId} → ${provider} (${deliveryStatus})`);
  } catch (err) {
    // 絕不讓通知錯誤影響上游流程
    console.error('[Notification] Unexpected error (swallowed):', err instanceof Error ? err.message : err);
  }
}
