# 支付到下單自動化流程 — 設定說明

## 流程概覽

1. **Stripe**：顧客付款（信用卡）→ Stripe Checkout 頁面完成付款 → 導回 `/success?order=ORD-xxx&session_id=cs_xxx`
2. **/success 頁**：呼叫 `POST /api/confirm-payment` → 驗證 Stripe Session → 訂單標記為「已付款」→ 呼叫順豐下單
3. **順豐**：`POST /api/sf` (action: 'order') 向沙箱下單，取得運單號並寫回 Supabase `orders.tracking_number`
4. **Webhook（可選）**：當訂單在 Supabase 被手動或由其他系統更新為 `status = 'paid'` 時，可透過 Supabase Webhook 呼叫 `POST /api/on-order-paid` 自動觸發順豐下單

---

## 一、Stripe（信用卡付款）

- 使用 Stripe Checkout Sessions（全頁跳轉模式）
- 測試模式使用 `sk_test_...` 密鑰；正式模式使用 `sk_live_...` 密鑰
- API 路由：`POST /api/stripe`（`create-checkout-session` 建立付款、`refund` 退款）
- 付款成功後導回 `/success?order=訂單ID&session_id=Stripe Session ID`

---

## 二、順豐 SF Express 沙箱

在 **Vercel → Environment Variables** 新增：

| 變數 | 說明 |
|------|------|
| `SF_PARTNER_ID` 或 `SF_CLIENT_CODE` | 順豐顧客編碼（沙箱） |
| `SF_CHECKWORD` 或 `SF_CHECK_WORD` | 順豐校驗碼（沙箱） |
| `SF_SENDER_NAME` | 寄件人姓名 |
| `SF_SENDER_PHONE` | 寄件人電話 |
| `SF_SENDER_ADDRESS` | 寄件人地址 |

簽名算法：`msgDigest = Base64(MD5(msgData + timestamp + checkword))`  
請求網址：`https://sfapi-sbox.sf-express.com/std/service`

---

## 三、Supabase

- **URL / Key**：Vercel 已有 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 時，後端會沿用；建議另設 **`SUPABASE_SERVICE_ROLE_KEY`** 供 API 更新訂單狀態與 `tracking_number`。
- **訂單狀態**：API 會將已付款訂單設為 `status = 'paid'`，並寫入 `tracking_number`（順豐運單號）。若你的 `orders.status` 只允許固定枚舉，請在 Supabase 或應用層允許 `paid`。

### 選用：Supabase Webhook（訂單更新為 paid 時自動順豐下單）

1. Supabase Dashboard → **Database** → **Webhooks** → **Create a new hook**
2. **Table**：`orders`
3. **Events**：勾選 **Update**
4. **URL**：`https://你的網域/api/on-order-paid`
5. 儲存後，任何將 `orders.status` 更新為 `paid` 的寫入都會觸發此 URL，並自動呼叫順豐下單與更新運單號。

---

## 四、/success 頁面

- 文案：「付款成功！我們正在為您安排發貨。」
- 會呼叫 `POST /api/confirm-payment`（帶 `orderId`、`session_id`），驗證 Stripe 付款後取得順豐單號顯示於頁面；若尚未產生則顯示「正在為您安排順豐發貨...」或引導至「記錄」查看。

---

## 除錯

- **Stripe**：Vercel Functions 日誌中搜尋 `[Stripe]`
- **順豐**：搜尋 `[SF]`
- **confirm-payment / webhook**：搜尋 `[confirm-payment]`、`[on-order-paid]`

所有 API 皆有錯誤處理，並在 console 輸出上述前綴日誌，方便在 Vercel Logs 中排查。
