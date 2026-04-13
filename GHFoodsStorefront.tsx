
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Trash2, ChevronDown, Send, LogOut, Phone, Truck, Clock, DollarSign, Package, User, Coins, ChevronRight, Check, Scissors, Upload } from 'lucide-react';
import type { Product, CartItem, User as UserType, Category, Order, OrderStatus, OrderLineItem, Ingredient, CostItem, WholesalePricingRules, ProcessingType, ProductGroup } from './types';
import { roundMoney, formatMoney } from './money';

interface WholesaleRegForm {
  name: string;
  phone: string;
  password: string;
  companyName: string;
  businessType: string;
  branchCount: string;
  storefrontPreparing: boolean;
}

interface GHFoodsStorefrontProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: UserType | null;
  orders: Order[];
  ingredients: Ingredient[];
  costItems: CostItem[];
  wholesaleRules: WholesalePricingRules;
  wholesalePriceOverrides: Record<string, number>;
  getPrice: (p: Product, qty?: number) => number;
  onLogin: (form: { email: string; password: string }) => void | Promise<void>;
  onRegister?: (form: WholesaleRegForm, files: { brDoc: File | null; storefrontPhoto: File | null }) => void | Promise<void>;
  onSubmitOrder: () => void;
  logoUrl?: string;
  logoIcon: string;
  logoText: string;
  processingTypes?: ProcessingType[];
  productGroups?: ProductGroup[];
  inventoryEnforcementEnabled?: boolean;
}

type GHView = 'order' | 'cart' | 'history' | 'login';

const GHFoodsStorefront: React.FC<GHFoodsStorefrontProps> = ({
  products, categories, cart, setCart, user, orders,
  ingredients, costItems, wholesaleRules, wholesalePriceOverrides,
  getPrice, onLogin, onRegister, onSubmitOrder, logoUrl, logoIcon, logoText,
  processingTypes = [],
  productGroups = [],
  inventoryEnforcementEnabled = false,
}) => {
  const [view, setView] = useState<GHView>('order');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupForm, setSignupForm] = useState<WholesaleRegForm>({ name: '', phone: '', password: '', companyName: '', businessType: '', branchCount: '1', storefrontPreparing: false });
  const [regFiles, setRegFiles] = useState<{ brDoc: File | null; storefrontPhoto: File | null }>({ brDoc: null, storefrontPhoto: null });
  const [regUploading, setRegUploading] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'fps' | 'cod'>('cod');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && view === 'login') setView('order');
  }, [user]);

  const wholesaleProducts = useMemo(() => {
    return products.filter(p => {
      const ch = p.saleChannel || 'retail';
      return ch === 'wholesale' || ch === 'both';
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = wholesaleProducts;
    if (activeCat) {
      list = list.filter(p => p.categories.includes(activeCat));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q) ||
        (p.legacyId || '').toLowerCase().includes(q) ||
        (p.origin || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [wholesaleProducts, activeCat, search]);

  const usedCategories = useMemo(() => {
    const catIds = new Set(wholesaleProducts.flatMap(p => p.categories));
    return categories.filter(c => catIds.has(c.id));
  }, [wholesaleProducts, categories]);

  const cartTotal = useMemo(() => {
    const total = cart.reduce((sum, item) => {
      const unitPrice = getPrice(item, item.qty);
      const isByPiece = item.pricingMode === 'by_piece';
      const effectiveQty = isByPiece && item.packWeightLb ? item.packWeightLb * item.qty : item.qty;
      return sum + unitPrice * effectiveQty;
    }, 0);
    return roundMoney(total);
  }, [cart, getPrice]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const processingTypeMap = useMemo(() => {
    const m = new Map<string, ProcessingType>();
    processingTypes.forEach(pt => m.set(pt.id, pt));
    return m;
  }, [processingTypes]);

  const productVariantGroups = useMemo(() => {
    const groups = new Map<string, { parentName: string; variants: Product[] }>();
    for (const p of filteredProducts) {
      const groupKey = p.groupId || (p.parentIngredientId && (p.productType === 'processed' || p.productType === 'raw_material') ? `ing-${p.parentIngredientId}` : null);
      if (!groupKey) continue;
      const existing = groups.get(groupKey);
      if (existing) {
        existing.variants.push(p);
      } else {
        let parentName = '';
        if (p.groupId) {
          const grp = productGroups.find(g => g.id === p.groupId);
          parentName = grp?.name || p.name;
        } else if (p.parentIngredientId) {
          const ing = ingredients.find(i => i.id === p.parentIngredientId);
          parentName = ing?.name || p.name;
        }
        groups.set(groupKey, { parentName, variants: [p] });
      }
    }
    return groups;
  }, [filteredProducts, ingredients, productGroups]);

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id);
      if (existing) {
        return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { ...product, qty }];
    });
  }, [setCart]);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.id !== id));
    } else {
      setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
    }
  }, [setCart]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, [setCart]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(authForm);
  };

  const handleSubmit = () => {
    onSubmitOrder();
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 3000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name.trim() || !signupForm.phone.trim() || !signupForm.password) return;
    if (signupForm.password.length < 6) return;
    if (!signupForm.companyName.trim()) return;
    if (!regFiles.brDoc) return;
    if (!signupForm.storefrontPreparing && !regFiles.storefrontPhoto) return;
    if (!onRegister) return;
    setRegUploading(true);
    try {
      await onRegister(signupForm, regFiles);
      setSignupForm({ name: '', phone: '', password: '', companyName: '', businessType: '', branchCount: '1', storefrontPreparing: false });
      setRegFiles({ brDoc: null, storefrontPhoto: null });
    } finally {
      setRegUploading(false);
    }
  };

  // ── Login / Signup Screen ──
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
              {logoIcon}
            </div>
            <h1 className="text-2xl font-black text-slate-900">{logoText}</h1>
            <p className="text-sm text-slate-500 mt-1">批發訂貨系統</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-3 font-bold text-sm transition-colors ${authMode === 'login' ? 'text-amber-700 border-b-2 border-amber-600 bg-amber-50/30' : 'text-slate-400'}`}>登入</button>
              <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-3 font-bold text-sm transition-colors ${authMode === 'signup' ? 'text-amber-700 border-b-2 border-amber-600 bg-amber-50/30' : 'text-slate-400'}`}>開戶申請</button>
            </div>
            <div className="p-6">
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">電話 / 帳號</label>
                    <input type="text" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" placeholder="輸入電話號碼或電郵地址" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">密碼</label>
                    <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none" placeholder="密碼" required />
                  </div>
                  <button type="submit" className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors">登入</button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人姓名 *</label>
                    <input value={signupForm.name} onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none" placeholder="聯絡人姓名" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話號碼 *</label>
                    <input type="tel" value={signupForm.phone} onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none" placeholder="電話號碼" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">密碼（最少 6 位）*</label>
                    <input type="password" value={signupForm.password} onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none" placeholder="密碼" minLength={6} required />
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">批發開戶資料</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">餐廳 / 公司名稱 *</label>
                    <input value={signupForm.companyName} onChange={e => setSignupForm(f => ({ ...f, companyName: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none" placeholder="貴餐廳或公司名稱" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">業務類型</label>
                    <select value={signupForm.businessType} onChange={e => setSignupForm(f => ({ ...f, businessType: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none">
                      <option value="">請選擇</option>
                      <option value="餐廳">餐廳</option>
                      <option value="茶餐廳/冰室">茶餐廳 / 冰室</option>
                      <option value="酒樓">酒樓</option>
                      <option value="咖啡店/甜品店">咖啡店 / 甜品店</option>
                      <option value="外賣店">外賣店</option>
                      <option value="食品加工/中央廚房">食品加工 / 中央廚房</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">分店數目</label>
                    <select value={signupForm.branchCount} onChange={e => setSignupForm(f => ({ ...f, branchCount: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none">
                      <option value="1">1 間</option>
                      <option value="2-3">2–3 間</option>
                      <option value="4-10">4–10 間</option>
                      <option value="10+">10 間以上</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">上傳商業登記證 (BR) 副本 *</label>
                    <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${regFiles.brDoc ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300'}`}>
                      {regFiles.brDoc ? (
                        <span className="text-xs font-bold text-emerald-600">✓ {regFiles.brDoc.name}</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400"><Upload size={14} className="inline mr-1" />點擊上傳 BR 圖片</span>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setRegFiles(prev => ({ ...prev, brDoc: e.target.files![0] })); }} />
                    </label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">門口 / 招牌相片 {signupForm.storefrontPreparing ? '' : '*'}</label>
                    <p className="text-[9px] text-slate-400 mb-1.5">用於核實經營地址，請拍攝清晰的門口招牌相片</p>
                    {!signupForm.storefrontPreparing && (
                      <label className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${regFiles.storefrontPhoto ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300'}`}>
                        {regFiles.storefrontPhoto ? (
                          <span className="text-xs font-bold text-emerald-600">✓ {regFiles.storefrontPhoto.name}</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400"><Upload size={14} className="inline mr-1" />點擊上傳餐廳門口相片</span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setRegFiles(prev => ({ ...prev, storefrontPhoto: e.target.files![0] })); }} />
                      </label>
                    )}
                    <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                      <input type="checkbox" checked={signupForm.storefrontPreparing} onChange={e => setSignupForm(f => ({ ...f, storefrontPreparing: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400" />
                      <span className="text-xs font-bold text-slate-500">正在籌備中（暫未有門口相片）</span>
                    </label>
                  </div>
                  <button type="submit" disabled={regUploading} className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors disabled:opacity-50">
                    {regUploading ? '提交中...' : '提交批發開戶申請'}
                  </button>
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1">
                    <p className="text-[9px] text-slate-500 text-center font-bold">送貨地址將按商業登記證上的地址安排，無需另外填寫。</p>
                    <p className="text-[9px] text-slate-400 text-center">提交後，我們會在 1-2 個工作天內審核您的申請，届時會以電話通知。</p>
                  </div>
                </form>
              )}
            </div>
          </div>
          <button onClick={() => setView('order')} className="w-full mt-4 py-2.5 text-slate-500 text-xs font-bold hover:text-amber-600 transition-colors">
            ← 先瀏覽產品目錄
          </button>
        </div>
      </div>
    );
  }

  // ── Order Success Overlay ──
  if (showOrderSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">訂單已提交</h2>
          <p className="text-sm text-slate-500">我們會盡快安排送貨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center h-14 gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white text-sm shadow">
                {logoIcon}
              </div>
              <span className="font-bold text-slate-900 text-sm hidden sm:block">{logoText}</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜尋產品名稱、編號..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:bg-white outline-none transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Nav Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setView('order')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'order' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Package size={14} className="inline mr-1" />訂貨
              </button>
              {user && (
                <>
                  <button
                    onClick={() => setView('cart')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${view === 'cart' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <ShoppingCart size={14} className="inline mr-1" />
                    購物車
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setView('history')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'history' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Clock size={14} className="inline mr-1" />記錄
                  </button>
                </>
              )}
              <div className="w-px h-6 bg-slate-200 mx-1" />
              {user ? (
                <span className="text-xs text-slate-500 hidden sm:block">{user.name}</span>
              ) : (
                <button onClick={() => setView('login')} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors">
                  登入
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Guest Login Banner ── */}
      {!user && view === 'order' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <User size={16} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-700 truncate">批發價格僅供已登記客戶查看，請登入帳戶查看價格及下單。</p>
            </div>
            <button onClick={() => setView('login')} className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors flex-shrink-0">
              立即登入
            </button>
          </div>
        </div>
      )}

      {/* ── Pending Approval Banner ── */}
      {user && user.wholesaleStatus === 'pending' && view === 'order' && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <Clock size={16} className="text-orange-500 flex-shrink-0" />
            <p className="text-xs font-bold text-orange-700">您的批發帳戶正在審核中，審核通過後即可下單。我們會在 1-2 個工作天內完成審核。</p>
          </div>
        </div>
      )}
      {user && user.wholesaleStatus === 'rejected' && view === 'order' && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <X size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-xs font-bold text-red-700">您的批發帳戶申請未獲批准，如有疑問請聯絡我們。</p>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {view === 'order' && (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          {/* Category Tabs */}
          <div className="bg-white border-b border-slate-200 px-3 sm:px-4">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar py-2">
              <button
                onClick={() => setActiveCat(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${!activeCat ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                全部 ({wholesaleProducts.length})
              </button>
              {usedCategories.map(cat => {
                const count = wholesaleProducts.filter(p => p.categories.includes(cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${activeCat === cat.id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {cat.icon} {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Table */}
          <div className="flex-1 overflow-auto px-2 sm:px-4 py-2">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2.5 font-bold text-slate-500 text-xs w-10">#</th>
                    <th className="text-left px-3 py-2.5 font-bold text-slate-500 text-xs">產品</th>
                    <th className="text-left px-3 py-2.5 font-bold text-slate-500 text-xs hidden sm:table-cell">編號</th>
                    <th className="text-left px-3 py-2.5 font-bold text-slate-500 text-xs hidden md:table-cell">加工</th>
                    <th className="text-right px-3 py-2.5 font-bold text-slate-500 text-xs">單價</th>
                    <th className="text-center px-3 py-2.5 font-bold text-slate-500 text-xs w-36">數量</th>
                    <th className="text-right px-3 py-2.5 font-bold text-slate-500 text-xs w-24">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                        {search ? `找不到「${search}」` : '暫無產品'}
                      </td>
                    </tr>
                  )}
                  {(() => {
                    const rendered = new Set<string>();
                    let rowIdx = 0;
                    return filteredProducts.map(p => {
                      const groupKey = p.groupId || `_solo_${p.id}`;
                      const variantGroup = p.groupId ? productVariantGroups.get(p.groupId) : null;
                      const hasMultiSpecs = variantGroup && variantGroup.variants.length > 1;

                      if (hasMultiSpecs) {
                        if (rendered.has(groupKey)) return null;
                        rendered.add(groupKey);
                        const isExpanded = expandedGroupId === groupKey;
                        const groupCartCount = variantGroup!.variants.reduce((sum, v) => sum + (cart.find(c => c.id === v.id)?.qty || 0), 0);
                        rowIdx++;

                        return (
                          <React.Fragment key={`grp-${groupKey}`}>
                            <tr className={`border-b border-slate-100 transition-colors cursor-pointer ${groupCartCount > 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`} onClick={() => setExpandedGroupId(isExpanded ? null : groupKey)}>
                              <td className="px-3 py-2 text-slate-400 text-xs">{rowIdx}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-slate-800">{variantGroup!.parentName}</p>
                                      <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${isExpanded ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Scissors size={10} />
                                        {variantGroup!.variants.length}款規格
                                        <ChevronDown size={10} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                      </span>
                                      {groupCartCount > 0 && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">{groupCartCount} 件</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 hidden sm:table-cell"></td>
                              <td className="px-3 py-2 hidden md:table-cell">
                                <span className="text-[10px] text-slate-400 font-bold">點擊展開選擇</span>
                              </td>
                              <td className="px-3 py-2 text-right text-slate-400 text-xs">{user ? '多款' : ''}</td>
                              <td className="px-3 py-2"></td>
                              <td className="px-3 py-2 text-right font-bold text-slate-800">
                                {!user ? '' : groupCartCount > 0 ? `$${formatMoney(variantGroup!.variants.reduce((sum, v) => { const c = cart.find(ci => ci.id === v.id); return sum + (c ? getPrice(v, c.qty) * c.qty : 0); }, 0))}` : '—'}
                              </td>
                            </tr>
                            {isExpanded && variantGroup!.variants.map(spec => {
                              const inCart = cart.find(c => c.id === spec.id);
                              const qty = inCart?.qty || 0;
                              const price = getPrice(spec, qty || 1);
                              const outOfStock = inventoryEnforcementEnabled && spec.trackInventory && spec.stock <= 0;
                              const isByPiece = spec.pricingMode === 'by_piece';
                              return (
                                <tr key={spec.id} className={`border-b border-slate-50 transition-colors bg-violet-50/20 ${qty > 0 ? 'bg-amber-50/30' : 'hover:bg-violet-50/40'} ${outOfStock ? 'opacity-40' : ''}`}>
                                  <td className="px-3 py-2"><div className="w-px h-3 bg-violet-200 ml-2" /></td>
                                  <td className="px-3 py-2 pl-6">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-700">{spec.variantLabel || spec.name}</span>
                                      {isByPiece && <span className="px-1 py-0.5 bg-pink-50 text-pink-600 rounded text-[8px] font-black">抄碼</span>}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 text-xs hidden sm:table-cell font-mono">{spec.legacyId || ''}</td>
                                  <td className="px-3 py-2 hidden md:table-cell"></td>
                                  <td className="px-3 py-2 text-right">
                                    {user ? (
                                      <>
                                        <span className="font-bold text-slate-800">${formatMoney(price)}{isByPiece ? '/磅' : ''}</span>
                                        {isByPiece && spec.packWeightLb && (
                                          <p className="text-[9px] text-slate-400">~{spec.packWeightLb}磅/件</p>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-[10px] text-amber-600 font-bold">登入查看</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {!user ? (
                                      <button onClick={() => setView('login')} className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100">登入下單</button>
                                    ) : outOfStock ? (
                                      <span className="text-xs text-red-400 font-bold block text-center">缺貨</span>
                                    ) : (
                                      <div className="flex items-center justify-center gap-1">
                                        {qty > 0 ? (
                                          <>
                                            <button onClick={() => updateQty(spec.id, qty - 1)} className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"><Minus size={12} /></button>
                                            <input type="number" value={qty} onChange={e => { const v = parseInt(e.target.value) || 0; if (v > 0) updateQty(spec.id, v); else removeFromCart(spec.id); }} className="w-14 text-center py-1 border border-slate-200 rounded text-sm font-bold focus:border-amber-400 outline-none" min={0} />
                                            <button onClick={() => updateQty(spec.id, qty + 1)} className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600"><Plus size={12} /></button>
                                          </>
                                        ) : (
                                          <button onClick={() => addToCart(spec)} className="px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold hover:bg-amber-100">+ 加入</button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-slate-800">
                                    {!user ? '—' : qty > 0 ? (
                                      isByPiece ? (
                                        <span className="text-pink-600">~${formatMoney(spec.packWeightLb ? (price * spec.packWeightLb * qty) : price * qty)}<span className="text-[9px] text-slate-400 ml-0.5">預估</span></span>
                                      ) : `$${formatMoney(price * qty)}`
                                    ) : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      }

                      const inCart = cart.find(c => c.id === p.id);
                      const qty = inCart?.qty || 0;
                      const price = getPrice(p, qty || 1);
                      const outOfStock = inventoryEnforcementEnabled && p.trackInventory && p.stock <= 0;
                      const isByPiece = p.pricingMode === 'by_piece';
                      rowIdx++;

                      return (
                        <tr key={p.id} className={`border-b border-slate-100 transition-colors ${qty > 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50'} ${outOfStock ? 'opacity-40' : ''}`}>
                          <td className="px-3 py-2 text-slate-400 text-xs">{rowIdx}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover bg-slate-100 flex-shrink-0" />}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                {p.weight && !p.packSize && <p className="text-[10px] text-slate-400">{p.weight}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-500 text-xs hidden sm:table-cell font-mono">{p.legacyId || p.id.slice(0, 8)}</td>
                          <td className="px-3 py-2 text-xs hidden md:table-cell">
                            {p.variantLabel && p.variantLabel !== '原件' ? (
                              <span className="px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded font-bold text-[10px]">{p.variantLabel}</span>
                            ) : isByPiece ? (
                              <span className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded font-bold text-[10px]">抄碼</span>
                            ) : '—'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {user ? (
                              <>
                                <span className="font-bold text-slate-800">${formatMoney(price)}{isByPiece ? '/磅' : ''}</span>
                                {isByPiece && p.packWeightLb && (
                                  <p className="text-[9px] text-slate-400">~{p.packWeightLb}磅/件</p>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-bold">登入查看</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {!user ? (
                              <button onClick={() => setView('login')} className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold hover:bg-amber-100">登入下單</button>
                            ) : outOfStock ? (
                              <span className="text-xs text-red-400 font-bold block text-center">缺貨</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {qty > 0 ? (
                                  <>
                                    <button onClick={() => updateQty(p.id, qty - 1)} className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"><Minus size={12} /></button>
                                    <input type="number" value={qty} onChange={e => { const v = parseInt(e.target.value) || 0; if (v > 0) updateQty(p.id, v); else removeFromCart(p.id); }} className="w-14 text-center py-1 border border-slate-200 rounded text-sm font-bold focus:border-amber-400 outline-none" min={0} />
                                    <button onClick={() => updateQty(p.id, qty + 1)} className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600"><Plus size={12} /></button>
                                  </>
                                ) : (
                                  <button onClick={() => addToCart(p)} className="px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold hover:bg-amber-100">+ 加入</button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-800">
                            {!user ? '—' : qty > 0 ? (
                              isByPiece ? (
                                <span className="text-pink-600">~${formatMoney(p.packWeightLb ? (price * p.packWeightLb * qty) : price * qty)}<span className="text-[9px] text-slate-400 ml-0.5">預估</span></span>
                              ) : `$${formatMoney(price * qty)}`
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 text-center py-2">共 {filteredProducts.length} 項產品</p>
          </div>

          {/* Sticky Cart Summary Bar */}
          {user && cartCount > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    <ShoppingCart size={16} className="inline mr-1" />
                    {cartCount} 件商品
                  </span>
                  <span className="text-xl font-black text-slate-900">${formatMoney(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setView('cart')}
                  className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  去結帳 <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Cart / Checkout View ── */}
      {view === 'cart' && (
        <div className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">購物車</h2>
            <button onClick={() => setView('order')} className="text-xs text-amber-600 font-bold hover:underline">
              ← 繼續選購
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <ShoppingCart size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">購物車是空的</p>
              <button onClick={() => setView('order')} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold">
                去選購
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 font-bold text-slate-500 text-xs">產品</th>
                      <th className="text-right px-3 py-2 font-bold text-slate-500 text-xs">單價</th>
                      <th className="text-center px-3 py-2 font-bold text-slate-500 text-xs w-32">數量</th>
                      <th className="text-right px-3 py-2 font-bold text-slate-500 text-xs">小計</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => {
                      const price = getPrice(item, item.qty);
                      return (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="px-3 py-2.5">
                            <span className="font-bold text-slate-800">{item.name}</span>
                            {item.weight && <span className="text-xs text-slate-400 ml-1">({item.weight})</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-600">${formatMoney(price)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300">
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                value={item.qty}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  if (val > 0) updateQty(item.id, val);
                                  else removeFromCart(item.id);
                                }}
                                className="w-14 text-center py-1 border border-slate-200 rounded text-sm font-bold outline-none focus:border-amber-400"
                                min={0}
                              />
                              <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600">
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-800">${formatMoney(price * item.qty)}</td>
                          <td className="px-1 py-2.5">
                            <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td colSpan={3} className="px-3 py-3 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">合計</td>
                      <td className="px-3 py-3 text-right font-black text-lg text-slate-900">${formatMoney(cartTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                  <Truck size={14} /> 送貨資料
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">送貨地址</label>
                  {user?.deliveryAddress ? (
                    <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">{user.deliveryAddress}</p>
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-bold text-amber-700">送貨地址尚未設定，我們會在審核後按 BR 地址安排送貨。</p>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 font-bold mt-1">如需更改送貨地址，請聯絡客服。</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">備註（選填）</label>
                  <textarea
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    placeholder="送貨備註（如有特別要求）"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none min-h-[50px] focus:border-amber-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">送貨日期</label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">付款方式</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === 'cod' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <Coins size={12} className="inline mr-1" /> 到付
                      </button>
                      <button
                        onClick={() => setPaymentMethod('fps')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === 'fps' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        <DollarSign size={12} className="inline mr-1" /> FPS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg"
              >
                <Send size={16} />
                確認下單 (${formatMoney(cartTotal)})
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Order History View ── */}
      {view === 'history' && (
        <div className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-4 space-y-3">
          <h2 className="text-lg font-black text-slate-900">訂單記錄</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Clock size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">暫無訂單</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-bold text-slate-500 text-xs">訂單號</th>
                    <th className="text-left px-3 py-2 font-bold text-slate-500 text-xs">日期</th>
                    <th className="text-right px-3 py-2 font-bold text-slate-500 text-xs">金額</th>
                    <th className="text-center px-3 py-2 font-bold text-slate-500 text-xs">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-600">#{o.id}</td>
                      <td className="px-3 py-2.5 text-slate-600">{o.date}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-800">${formatMoney(o.total)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          o.status === 'shipping' || o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'paid' || o.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {o.status === 'pending_payment' ? '待付款' :
                           o.status === 'paid' ? '已付款' :
                           o.status === 'preparing' ? '備貨中' :
                           o.status === 'shipping' ? '送貨中' :
                           o.status === 'shipped' ? '已送達' :
                           o.status === 'delivered' ? '完成' :
                           o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GHFoodsStorefront;
