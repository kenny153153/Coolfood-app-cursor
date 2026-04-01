# 在 Vercel 設定 Stripe（取代原 Airwallex）

部署到 Vercel 時，**API 金鑰不能從 .env.local 讀取**，必須在 Vercel 後台手動加入環境變數。

## 步驟

1. 打開 [Vercel Dashboard](https://vercel.com) → 你的專案 → **Settings** → **Environment Variables**。
2. 新增以下變數（Value 請貼上你自己的 Stripe 金鑰，不要提交到 Git）：

| Name | Value | 說明 |
|------|--------|------|
| `STRIPE_SECRET_KEY` | 你的 Secret Key（例如 `sk_test_...` 或 `sk_live_...`） | 測試模式用 `sk_test_`，正式用 `sk_live_` |

3. **Environment** 請勾選 **Production** 和 **Preview**（若要在預覽環境測試）。
4. 儲存後到 **Deployments** → 最新部署右側 **⋯** → **Redeploy**，讓新變數生效。

## 取得 Stripe API 金鑰

1. 前往 [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. 測試模式下複製 **Secret key**（`sk_test_...`）
3. 正式上線時切換到 Live 模式，複製 **Secret key**（`sk_live_...`）

## 注意

- **不要把 Secret Key 寫進程式碼或提交到 Git。**
- 本機開發用 `.env.local` 即可；部署環境只用 Vercel 這裡的設定。
- Stripe 只需要一個 Secret Key（不像 Airwallex 需要 Client ID + API Key + ENV）。
- 付款方式僅限信用卡（Stripe Checkout Sessions，`payment_method_types: ['card']`）。
