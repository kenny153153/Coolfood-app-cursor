import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Globe, Search, Save, Sparkles, Check, ChevronDown, ChevronUp, RefreshCw, Languages, Package } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Product } from './types';

type TranslationOverrides = Record<string, Record<string, string>>;

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const SECTION_LABELS: Record<string, string> = {
  orderStatus: '訂單狀態',
  nav: '導航列',
  store: '商店頁面',
  checkout: '結帳頁面',
  orders: '訂單記錄',
  success: '付款成功',
  profile: '會員頁面',
  address: '地址管理',
  common: '通用',
  toast: '提示訊息',
};

const DEFAULT_EN: Record<string, Record<string, string>> = {
  orderStatus: {
    pending_payment: 'Pending Payment', paid: 'Paid', processing: 'Processing',
    ready_for_pickup: 'Ready for Pickup', shipping: 'Shipping', completed: 'Completed',
    abnormal: 'Abnormal', refund: 'Refunded',
  },
  nav: { store: 'Store', orders: 'Orders', profile: 'Profile' },
  store: {
    login: 'Login', goCheckout: 'Checkout', addToCart: 'Add to Cart',
    featuredPrice: 'Price', noCategories: 'No categories or products yet',
    noCategoryProducts: 'No products in this category', addedToCart: 'Added to cart',
    bulkOff: 'pcs+ save ', percent: '%', dollar: '$',
  },
  checkout: {
    title: 'Checkout', deliveryMethod: 'Delivery Method', homeDelivery: 'Home Delivery',
    sfLocker: 'SF Locker', deliveryAddress: 'Delivery Address', fillAddress: 'Enter delivery address',
    changeAddress: 'Change / Add new address', defaultAddress: 'Default Address',
    shippingAddress: 'Shipping Address',
    district: 'District', street: 'Street', building: 'Building',
    floor: 'Floor', flat: 'Unit', contactName: 'Contact Name',
    contactPhone: 'Contact Phone', saveAsDefault: 'Set as default address',
    cancel: 'Cancel', saveAndUse: 'Save & Use', productSummary: 'Order Summary',
    subtotal: 'Subtotal', estimatedShipping: 'Shipping', freeShipping: 'Free shipping applied',
    totalAmount: 'Total', payNow: 'Pay Now', redirecting: 'Redirecting...',
  },
  orders: {
    myOrders: 'My Orders', noOrders: 'No orders yet', noTracking: 'No tracking number',
    viewOrder: 'View Order', trackLogistics: 'Track Delivery', courier: 'Courier: SF Express',
    logisticsStatus: 'Status:', trackingNo: 'Tracking:',
  },
  success: {
    paymentConfirmed: 'Payment Confirmed!', thankYou: 'Thank you for your order',
    viewOrders: 'View Orders', missingParams: 'Missing order parameters.',
  },
  profile: {
    loginSignup: 'Login / Sign Up', loginTab: 'Login', signupTab: 'Sign Up',
    emailOrPhone: 'Email or Phone', password: 'Password', loginBtn: 'Login',
    name: 'Name', phone: 'Phone', emailOptional: 'Email (optional)',
    passwordMin6: 'Password (min 6 chars)', signupBtn: 'Sign Up',
    walletBalance: 'Wallet Balance', points: 'Points', addresses: 'Saved Addresses',
    addAddress: 'Add Address', openAdmin: 'Open Admin', logout: 'Logout',
  },
  address: {
    newAddress: 'New Address', editAddress: 'Edit Address',
    label: 'Label', districtRequired: 'District *', addressRequired: 'Address *',
    floorRequired: 'Floor *', flatRequired: 'Unit *', contactNameRequired: 'Contact Name *',
    phoneRequired: 'Phone *', save: 'Save', cancel: 'Cancel',
  },
  common: {
    loading: 'Loading...', error: 'Error', success: 'Success', confirm: 'Confirm',
    cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close', back: 'Back',
  },
  toast: {
    orderSubmitted: 'Order submitted! Redirecting to payment...',
    addressFilled: 'Address filled, please add floor and unit.',
  },
};

const ZH_LABELS: Record<string, Record<string, string>> = {
  orderStatus: {
    pending_payment: '待付款', paid: '已付款', processing: '處理中',
    ready_for_pickup: '等待收件', shipping: '運輸中', completed: '已完成',
    abnormal: '異常', refund: '已退款',
  },
  nav: { store: '商店', orders: '記錄', profile: '會員' },
  store: {
    login: '登入', goCheckout: '去結帳', addToCart: '立即選購',
    featuredPrice: '精選價', noCategories: '尚未有分類與商品',
    noCategoryProducts: '此分類沒有商品', addedToCart: '已加入購物車',
    bulkOff: '件+ 即減 ', percent: '%', dollar: '元',
  },
  checkout: {
    title: '結帳', deliveryMethod: '配送方式', homeDelivery: '順豐冷鏈上門',
    sfLocker: '順豐凍櫃自取', deliveryAddress: '收貨地址', fillAddress: '填寫收貨地址',
    changeAddress: '改用其他地址／填寫新地址', defaultAddress: '預設地址',
    shippingAddress: '收貨地址',
    district: '地區（如：九龍、旺角）', street: '街道／門牌', building: '大廈名稱',
    floor: '樓層', flat: '室／單位', contactName: '聯絡人姓名 *',
    contactPhone: '聯絡電話 *', saveAsDefault: '下次結帳時設為預設地址',
    cancel: '取消', saveAndUse: '保存並使用', productSummary: '產品摘要',
    subtotal: '商品小計', estimatedShipping: '預估運費', freeShipping: '已享全單免運優惠',
    totalAmount: '總金額', payNow: '立即支付', redirecting: '轉接中...',
  },
  orders: {
    myOrders: '我的訂單記錄', noOrders: '尚未有訂單', noTracking: '沒有物流編號',
    viewOrder: '查看訂單', trackLogistics: '追蹤物流', courier: '物流公司：順豐速運',
    logisticsStatus: '物流狀態：', trackingNo: '單號：',
  },
  success: {
    paymentConfirmed: '付款已確認！', thankYou: '多謝惠顧',
    viewOrders: '查看記錄', missingParams: '缺少訂單或支付參數，請從「記錄」進入或重新結帳。',
  },
  profile: {
    loginSignup: '會員登入 / 註冊', loginTab: '登入', signupTab: '註冊',
    emailOrPhone: '電郵或電話', password: '密碼', loginBtn: '登入',
    name: '姓名', phone: '電話', emailOptional: '電郵（選填）',
    passwordMin6: '密碼（至少 6 字）', signupBtn: '註冊',
    walletBalance: '錢包餘額', points: '累積積分', addresses: '收貨地址/聯絡人',
    addAddress: '新增地址/聯絡人', openAdmin: '開啟管理後台', logout: '退出登入',
  },
  address: {
    newAddress: '新增地址', editAddress: '編輯地址',
    label: '標籤', districtRequired: '地區 *', addressRequired: '地址 *',
    floorRequired: '樓層 *', flatRequired: '室／單位 *', contactNameRequired: '收件人名稱 *',
    phoneRequired: '手機號碼 *', save: '保存', cancel: '取消',
  },
  common: {
    loading: '載入中...', error: '錯誤', success: '成功', confirm: '確認',
    cancel: '取消', save: '保存', delete: '刪除', edit: '編輯', close: '關閉', back: '返回',
  },
  toast: {
    orderSubmitted: '訂單已提交！正在轉接支付接口...',
    addressFilled: '已填入地址，請補上樓層及室號',
  },
};

const AdminLanguagePanel: React.FC<Props> = ({ products, setProducts, showToast }) => {
  const [overrides, setOverrides] = useState<TranslationOverrides>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [aiTranslating, setAiTranslating] = useState<string | null>(null);
  const [productLangTab, setProductLangTab] = useState<'all' | 'missing'>('missing');
  const [productSearch, setProductSearch] = useState('');
  const [bulkAiTranslating, setBulkAiTranslating] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_config').select('value').eq('id', 'translation_overrides').maybeSingle();
      if (data?.value && typeof data.value === 'object') setOverrides(data.value as TranslationOverrides);
    })();
  }, []);

  const handleChange = useCallback((section: string, key: string, value: string) => {
    setOverrides(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_config').upsert({
        id: 'translation_overrides',
        value: overrides,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setDirty(false);
      showToast('翻譯已儲存');
    } catch (err: any) {
      showToast(`儲存失敗：${err.message}`, 'error');
    }
    setSaving(false);
  }, [overrides, showToast]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const handleAiTranslateSection = useCallback(async (section: string) => {
    setAiTranslating(section);
    const zhSection = ZH_LABELS[section] || {};
    const currentEn = { ...(DEFAULT_EN[section] || {}), ...(overrides[section] || {}) };
    const missing: Record<string, string> = {};
    for (const [key, zhVal] of Object.entries(zhSection)) {
      if (!currentEn[key] || currentEn[key].trim() === '') {
        missing[key] = zhVal;
      }
    }

    if (Object.keys(missing).length === 0) {
      showToast('此區段已有完整英文翻譯');
      setAiTranslating(null);
      return;
    }

    try {
      const prompt = `Translate the following Chinese UI text keys to English for a frozen meat online retail shop. Return ONLY a JSON object with the same keys. Keep translations concise and professional.\n\n${JSON.stringify(missing, null, 2)}`;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error: ${text.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON');

      const translated = JSON.parse(jsonMatch[0]);
      setOverrides(prev => ({
        ...prev,
        [section]: { ...(prev[section] || {}), ...translated },
      }));
      setDirty(true);
      showToast(`已自動翻譯 ${Object.keys(translated).length} 個詞條`);
    } catch (err: any) {
      showToast(`AI 翻譯失敗：${err.message}`, 'error');
    }
    setAiTranslating(null);
  }, [overrides, showToast]);

  const handleBulkProductTranslate = useCallback(async () => {
    const toTranslate = products.filter(p => p.name && (!p.nameEn || p.nameEn.trim() === ''));
    if (toTranslate.length === 0) {
      showToast('所有產品已有英文名稱');
      return;
    }

    setBulkAiTranslating(true);
    try {
      const names: Record<string, string> = {};
      for (const p of toTranslate.slice(0, 50)) names[p.id] = p.name;

      const prompt = `Translate these Chinese frozen meat product names to English. Return ONLY a JSON object with the same keys (product IDs) and English name values. Be concise and professional.\n\n${JSON.stringify(names, null, 2)}`;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI did not return valid JSON');

      const translated: Record<string, string> = JSON.parse(jsonMatch[0]);
      let count = 0;

      for (const [pid, enName] of Object.entries(translated)) {
        if (!enName || typeof enName !== 'string') continue;
        await supabase.from('products').update({ name_en: enName }).eq('id', pid);
        count++;
      }

      setProducts(prev => prev.map(p => {
        const enName = translated[p.id];
        return enName ? { ...p, nameEn: enName } : p;
      }));

      showToast(`已自動翻譯 ${count} 個產品名稱`);
    } catch (err: any) {
      showToast(`AI 翻譯失敗：${err.message}`, 'error');
    }
    setBulkAiTranslating(false);
  }, [products, setProducts, showToast]);

  const handleProductNameEnChange = useCallback(async (productId: string, nameEn: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, nameEn } : p));
    await supabase.from('products').update({ name_en: nameEn }).eq('id', productId);
  }, [setProducts]);

  const handleProductDescEnChange = useCallback(async (productId: string, descEn: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, descriptionEn: descEn } : p));
    await supabase.from('products').update({ description_en: descEn }).eq('id', productId);
  }, [setProducts]);

  const sections = useMemo(() => Object.keys(SECTION_LABELS), []);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (productLangTab === 'missing') list = list.filter(p => !p.nameEn || p.nameEn.trim() === '');
    if (productSearch) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    return list;
  }, [products, productLangTab, productSearch]);

  return (
    <div className="space-y-8">
      {/* ── UI Translation Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h4 className="text-base font-black text-slate-700 flex items-center gap-2"><Languages size={18} className="text-blue-600" /> 界面文字翻譯 (中 → 英)</h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋翻譯..." className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl font-bold text-xs border border-slate-100 w-48" />
            </div>
            {dirty && (
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50">
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />} 儲存全部
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {sections.map(section => {
            const zhSection = ZH_LABELS[section] || {};
            const enDefaults = DEFAULT_EN[section] || {};
            const sectionOverrides = overrides[section] || {};
            const keys = Object.keys(zhSection);
            const lowerSearch = search.toLowerCase();
            const filtered = search
              ? keys.filter(k => zhSection[k]?.toLowerCase().includes(lowerSearch) || k.toLowerCase().includes(lowerSearch) || (sectionOverrides[k] || enDefaults[k] || '').toLowerCase().includes(lowerSearch))
              : keys;

            if (filtered.length === 0) return null;

            const isOpen = expandedSections.has(section);
            const translatedCount = keys.filter(k => (sectionOverrides[k] || enDefaults[k] || '').trim() !== '').length;

            return (
              <div key={section} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-700">{SECTION_LABELS[section]}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{translatedCount}/{keys.length}</span>
                    {translatedCount === keys.length && <Check size={14} className="text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleAiTranslateSection(section); }}
                      disabled={aiTranslating === section}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {aiTranslating === section ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />} AI 翻譯
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="p-4 space-y-2 bg-white">
                    <div className="grid grid-cols-[1fr,2fr,2fr] gap-2 px-2 mb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">KEY</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">中文</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">English</span>
                    </div>
                    {filtered.map(key => {
                      const zhVal = zhSection[key] || '';
                      const enVal = sectionOverrides[key] ?? enDefaults[key] ?? '';
                      return (
                        <div key={key} className="grid grid-cols-[1fr,2fr,2fr] gap-2 items-center px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors">
                          <span className="text-[10px] font-bold text-slate-400 truncate">{key}</span>
                          <span className="text-xs font-bold text-slate-600 truncate">{zhVal}</span>
                          <input
                            value={enVal}
                            onChange={e => handleChange(section, key, e.target.value)}
                            className={`w-full p-2 rounded-lg font-bold text-xs border transition-colors ${enVal.trim() === '' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
                            placeholder="Enter English..."
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Product Translation Section ── */}
      <div className="space-y-4 border-t border-slate-100 pt-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h4 className="text-base font-black text-slate-700 flex items-center gap-2"><Package size={18} className="text-amber-600" /> 產品翻譯</h4>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setProductLangTab('missing')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-colors ${productLangTab === 'missing' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>未翻譯</button>
              <button onClick={() => setProductLangTab('all')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-colors ${productLangTab === 'all' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}>全部</button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="搜尋產品..." className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl font-bold text-xs border border-slate-100 w-40" />
            </div>
            <button onClick={handleBulkProductTranslate} disabled={bulkAiTranslating} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50">
              {bulkAiTranslating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />} AI 批量翻譯
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-bold">
          {productLangTab === 'missing'
            ? `共 ${filteredProducts.length} 個產品尚未設定英文名稱`
            : `共 ${filteredProducts.length} 個產品`
          }
        </p>

        <div className="space-y-2 max-h-[600px] overflow-y-auto hide-scrollbar">
          {filteredProducts.map(p => (
            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                  {p.image?.startsWith('http') ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <span>{p.image || '📦'}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-700 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{p.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1">English Name</label>
                  <input
                    value={p.nameEn || ''}
                    onChange={e => handleProductNameEnChange(p.id, e.target.value)}
                    className={`w-full p-2.5 rounded-xl font-bold text-xs border transition-colors ${!p.nameEn ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}
                    placeholder="e.g. Australian Wagyu Ribeye"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 ml-1">English Description</label>
                  <input
                    value={p.descriptionEn || ''}
                    onChange={e => handleProductDescEnChange(p.id, e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl font-bold text-xs border border-slate-100"
                    placeholder="English product description"
                  />
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10">
              <Check size={32} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-black text-slate-700">{productLangTab === 'missing' ? '所有產品已有英文翻譯！' : '沒有符合的產品'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLanguagePanel;
