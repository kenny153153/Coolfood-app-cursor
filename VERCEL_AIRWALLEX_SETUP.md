# 在 Vercel 設定 Airwallex（解決 401 credentials_invalid）

部署到 Vercel 時，**API 金鑰不能從 .env.local 讀取**，必須在 Vercel 後台手動加入環境變數。

## 步驟

1. 打開 [Vercel Dashboard](https://vercel.com) → 你的專案 → **Settings** → **Environment Variables**。
2. 新增以下三個變數（Value 請貼上你自己的 Sandbox 金鑰，不要提交到 Git）：

| Name | Value | 說明 |
|------|--------|------|
| `AIRWALLEX_CLIENT_ID` | 你的 Client ID（例如 `UfwLizOuS0-RhbTRcmsnWw`） | Sandbox 的 Client ID |
| `AIRWALLEX_API_KEY` | 你的 Sandbox API Key（長字串） | Sandbox 的 API Key |
| `AIRWALLEX_ENV` | `demo` | 使用 demo 端點時設為 `demo` |

3. **Environment** 請勾選 **Production** 和 **Preview**（若要在預覽環境測試）。
4. 儲存後到 **Deployments** → 最新部署右側 **⋯** → **Redeploy**，讓新變數生效。

## 注意

- **不要把 API Key 或 Client ID 寫進程式碼或提交到 Git。**
- 本機開發用 `.env.local` 即可（你已設定好）；部署環境只用 Vercel 這裡的設定。
- 若日後改用 Production 金鑰，請改設 `AIRWALLEX_ENV=prod` 並使用 Production 的 Client ID 與 API Key。
