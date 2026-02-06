// api/confirm-payment.ts 診斷強化版
export default async function handler(req, res) {
  console.log('--- [開始支付確認流程] ---');
  console.log('請求方法:', req.method);
  console.log('收到參數:', JSON.stringify(req.body));

  // 1. 檢查 Method
  if (req.method !== 'POST') {
    console.error('錯誤: 非 POST 請求');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. 檢查環境變數
    console.log('檢查環境變數:');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已載入' : '❌ 缺失');
    console.log('- SF_PARTNER_ID:', process.env.SF_PARTNER_ID ? '✅ 已載入' : '❌ 缺失');
    console.log('- SF_CHECKWORD:', process.env.SF_CHECKWORD ? '✅ 已載入' : '❌ 缺失');

    // ... (中間是 Airwallex 驗證與 Supabase 更新邏輯) ...
    // 每完成一步就 log：console.log('✅ Supabase 狀態已更新為 paid');

    // 3. 呼叫順豐前
    console.log('準備呼叫順豐 API...');
    // ... (呼叫邏輯) ...

    console.log('--- [流程結束] ---');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ 流程崩潰:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
