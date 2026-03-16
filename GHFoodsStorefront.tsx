
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Trash2, ChevronDown, Send, LogOut, Phone, Truck, Clock, DollarSign, Package, User, Coins, ChevronRight, Check } from 'lucide-react';
import type { Product, CartItem, User as UserType, Category, Order, OrderStatus, OrderLineItem, Ingredient, CostItem, WholesalePricingRules } from './types';

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
  onSubmitOrder: () => void;
  logoUrl?: string;
  logoIcon: string;
  logoText: string;
}

type GHView = 'order' | 'cart' | 'history' | 'login';

const GHFoodsStorefront: React.FC<GHFoodsStorefrontProps> = ({
  products, categories, cart, setCart, user, orders,
  ingredients, costItems, wholesaleRules, wholesalePriceOverrides,
  getPrice, onLogin, onSubmitOrder, logoUrl, logoIcon, logoText,
}) => {
  const [view, setView] = useState<GHView>(user ? 'order' : 'login');
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
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
    return cart.reduce((sum, item) => sum + getPrice(item, item.qty) * item.qty, 0);
  }, [cart, getPrice]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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

  // ── Login Screen ──
  if (!user || view === 'login') {
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
          <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">電話 / 帳號</label>
              <input
                type="text"
                value={authForm.email}
                onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                placeholder="輸入電話號碼"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">密碼</label>
              <input
                type="password"
                value={authForm.password}
                onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                placeholder="密碼"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors">
              登入
            </button>
            <p className="text-center text-xs text-slate-400">如需開戶，請聯絡業務員</p>
          </form>
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
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <span className="text-xs text-slate-500 hidden sm:block">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

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
                    <th className="text-left px-3 py-2.5 font-bold text-slate-500 text-xs hidden md:table-cell">產地</th>
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
                  {filteredProducts.map((p, idx) => {
                    const inCart = cart.find(c => c.id === p.id);
                    const qty = inCart?.qty || 0;
                    const price = getPrice(p, qty || 1);
                    const outOfStock = p.trackInventory && p.stock <= 0;

                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 transition-colors ${qty > 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50'} ${outOfStock ? 'opacity-40' : ''}`}
                      >
                        <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {p.image && (
                              <img src={p.image} alt="" className="w-8 h-8 rounded object-cover bg-slate-100 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{p.name}</p>
                              {p.weight && <p className="text-[10px] text-slate-400">{p.weight}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs hidden sm:table-cell font-mono">
                          {p.legacyId || p.id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2 text-slate-500 text-xs hidden md:table-cell">
                          {p.origin || '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-800">
                          ${price}
                        </td>
                        <td className="px-3 py-2">
                          {outOfStock ? (
                            <span className="text-xs text-red-400 font-bold block text-center">缺貨</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {qty > 0 ? (
                                <>
                                  <button
                                    onClick={() => updateQty(p.id, qty - 1)}
                                    className="w-7 h-7 rounded bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <input
                                    type="number"
                                    value={qty}
                                    onChange={e => {
                                      const val = parseInt(e.target.value) || 0;
                                      if (val > 0) updateQty(p.id, val);
                                      else removeFromCart(p.id);
                                    }}
                                    className="w-14 text-center py-1 border border-slate-200 rounded text-sm font-bold focus:border-amber-400 outline-none"
                                    min={0}
                                  />
                                  <button
                                    onClick={() => updateQty(p.id, qty + 1)}
                                    className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => addToCart(p)}
                                  className="px-4 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold hover:bg-amber-100 transition-colors"
                                >
                                  + 加入
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-800">
                          {qty > 0 ? `$${price * qty}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 text-center py-2">共 {filteredProducts.length} 項產品</p>
          </div>

          {/* Sticky Cart Summary Bar */}
          {cartCount > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    <ShoppingCart size={16} className="inline mr-1" />
                    {cartCount} 件商品
                  </span>
                  <span className="text-xl font-black text-slate-900">${cartTotal}</span>
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
                          <td className="px-3 py-2.5 text-right text-slate-600">${price}</td>
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
                          <td className="px-3 py-2.5 text-right font-bold text-slate-800">${price * item.qty}</td>
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
                      <td className="px-3 py-3 text-right font-black text-lg text-slate-900">${cartTotal}</td>
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
                  <label className="block text-xs font-bold text-slate-500 mb-1">送貨地址 / 備註</label>
                  <textarea
                    value={deliveryNote}
                    onChange={e => setDeliveryNote(e.target.value)}
                    placeholder="餐廳名稱、街道、樓層等"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none min-h-[60px] focus:border-amber-400 outline-none"
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
                確認下單 (${cartTotal})
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
                      <td className="px-3 py-2.5 text-right font-bold text-slate-800">${o.total}</td>
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
