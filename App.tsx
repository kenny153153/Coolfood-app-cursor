
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ShoppingBag, Package, Truck, CreditCard, Settings, CheckCircle,
  AlertTriangle, X, ChevronRight, LogOut, Edit, Plus, Minus,
  Search, MessageCircle, Clock, ChevronLeft, BookOpen, Wallet,
  Tag, Sparkles, User, Bell, Trash2, Lock, Cpu, Database, Wifi, 
  RefreshCw, BarChart3, Users, ClipboardList, ArrowUpRight, DollarSign,
  MoreHorizontal, MapPin, ShieldCheck, Key, Image as ImageIcon,
  Check, Filter, List, Video, FileText, ChevronUp, ChevronDown, GripVertical,
  Printer, ExternalLink, Calendar, Hash, UserCheck, CreditCard as CardIcon,
  Award, Smartphone, Mail, Save, PlusCircle, Map, Download, Upload, Zap,
  Layers, Percent, Globe, Crosshair, Scissors, Phone, Square, CheckSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { HK_DISTRICTS } from './constants';
import { SF_COLD_PICKUP_DISTRICTS, SF_COLD_DISTRICT_NAMES, getPointsByDistrict, findPointByCode, formatLockerAddress, SfColdPickupPoint } from './sfColdPickupPoints';
import { Product, CartItem, User as UserType, Order, OrderStatus, SupabaseOrderRow, SupabaseMemberRow, OrderLineItem, SiteConfig, Recipe, Category, UserAddress, GlobalPricingRules, DeliveryRules, DeliveryTier, BulkDiscount, SlideshowItem, ShippingConfig, PricingTier } from './types';
import { useI18n, Language } from './i18n';
import { supabase } from './supabaseClient';
import {
  mapProductRowToProduct,
  mapCategoryRowToCategory,
  mapMemberRowToUser,
  mapOrderRowToOrder,
  mapProductToRow,
  mapCategoryToRow,
  mapUserToMemberRow,
  mapSlideshowRowToItem,
  mapSlideshowItemToRow,
  normalizeOrderStatus
} from './supabaseMappers';
import { hashPassword, verifyPassword } from './authHelpers';
import { uploadImage, uploadImages, deleteImage, isMediaUrl } from './imageUpload';

/** Format address for display using new required fields. */
const formatAddressLine = (addr: UserAddress): string => {
  const parts = [
    addr.district,
    addr.detail,
    addr.floor ? (addr.floor + '樓') : '',
    addr.flat ? (addr.flat + '室') : '',
  ].filter(Boolean);
  return parts.join(' ');
};

/** True if address meets SF requirement (contact + phone + district + address + floor/flat). */
const isAddressCompleteForOrder = (a: UserAddress): boolean => {
  if (!a.contactName?.trim() || !a.phone?.trim()) return false;
  if (!a.district?.trim()) return false;
  if (!a.detail?.trim()) return false;
  if (!a.floor?.trim() || !a.flat?.trim()) return false;
  return true;
};

/** Empty address with all detailed fields for forms. */
const emptyAddress = (): UserAddress => ({
  id: 'a-' + Date.now(),
  label: '',
  detail: '',
  district: '',
  floor: '',
  flat: '',
  contactName: '',
  phone: '',
  altContactName: '',
  altPhone: '',
  isDefault: false
});

/** Detect app language for Google API calls. Returns 'zh-HK' or 'en'. */
function getAppLanguage(): 'zh-HK' | 'en' {
  if (typeof document !== 'undefined' && document.documentElement?.lang) {
    const lang = document.documentElement.lang.toLowerCase();
    if (lang.startsWith('zh')) return 'zh-HK';
    if (lang.startsWith('en')) return 'en';
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) return 'zh-HK';
  }
  return 'en';
}

/** Smart parse: building (premise/point_of_interest), street (route+number), district (area). */
function parseAddressComponents(components: { long_name: string; short_name: string; types: string[] }[]): { district: string; street: string; building: string } {
  const get = (types: string[]) => {
    const c = components.find(x => types.some(t => x.types.includes(t)));
    return c?.long_name?.trim() ?? '';
  };
  const building = get(['premise', 'point_of_interest']) || get(['subpremise', 'establishment']);
  const route = get(['route']);
  const streetNumber = get(['street_number']);
  const street = [streetNumber, route].filter(Boolean).join(' ') || route || streetNumber;
  const district = get(['sublocality', 'sublocality_level_1']) || get(['locality', 'administrative_area_level_2', 'administrative_area_level_1']) || get(['neighborhood']);
  return { district, street, building };
}

/** From reverse-geocode results: street/district from first result; building from ANY result (Google often puts building name in a later result). */
function parseReverseGeocodeResults(
  results: { address_components?: { long_name: string; short_name: string; types: string[] }[]; formatted_address?: string }[]
): { district: string; street: string; building: string } {
  const first = results[0];
  const comps = first?.address_components;
  const formatted = first?.formatted_address ?? '';
  const parsedFirst = comps?.length ? parseAddressComponents(comps) : { district: '', street: '', building: '' };
  let { district, street, building } = parsedFirst;

  if ((!district || !street) && formatted) {
    const parts = formatted.split(/[,，]/).map((p: string) => p.trim()).filter(Boolean);
    if (!district && parts[0]) district = parts[0];
    if (!street && parts.length >= 2) street = parts.slice(1, 3).join(' ').trim();
  }
  if (!building && results.length > 1) {
    for (let i = 1; i < results.length; i++) {
      const c = results[i]?.address_components;
      if (c?.length) {
        const b = parseAddressComponents(c).building;
        if (b) {
          building = b;
          break;
        }
      }
    }
  }
  if (!building && formatted) {
    const firstSegment = formatted.split(/[,，]/)[0]?.trim() ?? '';
    const looksLikeBuilding = firstSegment.length > 0 && firstSegment.length <= 80 && !/^\d+\s*[-–]?\s*$/.test(firstSegment);
    if (looksLikeBuilding) building = firstSegment;
  }
  return { district, street, building };
}

/** Legacy alias for parseAddressComponents. */
function parseGeocodeResult(components: { long_name: string; short_name: string; types: string[] }[]): { district: string; street: string; building: string } {
  return parseAddressComponents(components);
}

/** Load Google Maps JS API with language and Places; idempotent. */
function loadGoogleMapsScript(apiKey: string, language: 'zh-HK' | 'en' = 'en'): Promise<void> {
  const win = typeof window !== 'undefined' ? (window as unknown as { google?: { maps?: unknown } }) : null;
  if (win?.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

// --- Shared Components ---

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-[env(safe-area-inset-top,12px)] left-1/2 -translate-x-1/2 mt-3 z-[9000] animate-slide-up px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-white text-sm font-medium max-w-[90vw] ${type === 'success' ? 'bg-slate-900' : 'bg-rose-600'}`}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      <span className="truncate">{message}</span>
    </div>
  );
};

/**
 * 三層定價引擎
 * Guest  → 折扣價(如有) 或 售價
 * Member → 上述基礎 × (1 - 會員折扣%)
 * Wallet → 上述會員價 × (1 - 錢包折扣%)
 */
const getEffectiveUnitPrice = (
  p: Product, qty: number,
  tier: PricingTier = 'guest',
  memberPct: number = 0,
  walletPct: number = 0,
  excludedIds?: string[]
) => {
  // 1. 基礎價：有手動折扣價且低於售價則用折扣價，否則用售價
  const hasDiscount = p.memberPrice > 0 && p.memberPrice < p.price;
  let base = hasDiscount ? p.memberPrice : p.price;

  // 2. 自動折扣（排除的產品不適用）
  const isExcluded = excludedIds?.includes(p.id);
  if (!isExcluded) {
    if (tier === 'wallet') {
      if (memberPct > 0) base = base * (1 - memberPct / 100);
      if (walletPct > 0) base = base * (1 - walletPct / 100);
    } else if (tier === 'member') {
      if (memberPct > 0) base = base * (1 - memberPct / 100);
    }
  }

  // 3. 批量折扣（疊加在最終價上）
  if (p.bulkDiscount && qty >= p.bulkDiscount.threshold) {
    if (p.bulkDiscount.type === 'percent') {
      return Math.round(base * (1 - p.bulkDiscount.value / 100));
    } else {
      return p.bulkDiscount.value;
    }
  }

  return Math.round(base);
};

const getOrderStatusLabel = (status: OrderStatus | string, t?: { orderStatus: Record<string, string> }) => {
  if (t) {
    const key = String(status) as keyof typeof t.orderStatus;
    if (t.orderStatus[key]) return t.orderStatus[key];
  }
  const labels: Record<string, string> = {
    [OrderStatus.PENDING_PAYMENT]: '待付款',
    [OrderStatus.PAID]: '已付款',
    [OrderStatus.PROCESSING]: '處理中',
    [OrderStatus.READY_FOR_PICKUP]: '等待收件',
    [OrderStatus.SHIPPING]: '運輸中',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.ABNORMAL]: '異常',
    [OrderStatus.REFUND]: '已退款',
  };
  return labels[status] ?? String(status);
};

const StatusBadge: React.FC<{ status: OrderStatus; t?: { orderStatus: Record<string, string> } }> = ({ status, t }) => {
  const configs: Record<string, { label: string; color: string }> = {
    [OrderStatus.PENDING_PAYMENT]: { label: getOrderStatusLabel(OrderStatus.PENDING_PAYMENT, t), color: 'bg-slate-50 text-slate-600 border-slate-100' },
    [OrderStatus.PAID]: { label: getOrderStatusLabel(OrderStatus.PAID, t), color: 'bg-green-50 text-green-700 border-green-100' },
    [OrderStatus.PROCESSING]: { label: getOrderStatusLabel(OrderStatus.PROCESSING, t), color: 'bg-blue-50 text-blue-700 border-blue-100' },
    [OrderStatus.READY_FOR_PICKUP]: { label: getOrderStatusLabel(OrderStatus.READY_FOR_PICKUP, t), color: 'bg-amber-50 text-amber-700 border-amber-100' },
    [OrderStatus.SHIPPING]: { label: getOrderStatusLabel(OrderStatus.SHIPPING, t), color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    [OrderStatus.COMPLETED]: { label: getOrderStatusLabel(OrderStatus.COMPLETED, t), color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    [OrderStatus.ABNORMAL]: { label: getOrderStatusLabel(OrderStatus.ABNORMAL, t), color: 'bg-rose-50 text-rose-700 border-rose-100' },
    [OrderStatus.REFUND]: { label: getOrderStatusLabel(OrderStatus.REFUND, t), color: 'bg-orange-50 text-orange-700 border-orange-100' },
  };
  const config = configs[status] || { label: String(status), color: 'bg-slate-50 text-slate-600 border-slate-100' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-wider ${config.color}`}>
      {config.label}
    </span>
  );
};

const ORDER_TIMELINE = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.SHIPPING,
  OrderStatus.COMPLETED,
];

const getTimelineIndex = (status: OrderStatus | string) => {
  const idx = ORDER_TIMELINE.indexOf(status as OrderStatus);
  return idx === -1 ? -1 : idx;
};

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const configs: Record<string, string> = {
    'Bronze': 'bg-orange-50 text-orange-700 border-orange-100',
    'Silver': 'bg-slate-100 text-slate-700 border-slate-200',
    'Gold': 'bg-amber-50 text-amber-700 border-amber-200',
    'VIP': 'bg-purple-50 text-purple-700 border-purple-200'
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-widest ${configs[tier] || configs['Bronze']}`}>
      {tier}
    </span>
  );
};

/** 第四部分：/success 頁面 — 抓取 URL 參數、發送確認請求、同步狀態、支援重整與手動重試 */
const SuccessView: React.FC<{
  successWaybill: string | null;
  successWaybillLoading: boolean;
  setSuccessWaybill: (v: string | null) => void;
  setSuccessWaybillLoading: (v: boolean) => void;
  highlightOrderId: string | null;
  orders: Order[];
  onViewOrders: () => void;
  onRefreshOrders: () => void;
}> = ({ successWaybill, successWaybillLoading, setSuccessWaybill, setSuccessWaybillLoading, onViewOrders, onRefreshOrders }) => {
  const { t } = useI18n();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const runConfirmPayment = useCallback(async () => {
    const win = typeof window !== 'undefined' ? window : null;
    if (!win) return;
    const params = new URLSearchParams(win.location.search);
    const rawOrderId = params.get('order');
    const orderIdFromUrl = rawOrderId ? rawOrderId.trim() : '';
    const paymentIntentId = params.get('payment_intent_id') ?? params.get('intent_id') ?? win.sessionStorage?.getItem?.('airwallex_payment_intent_id') ?? null;
    const orderId = orderIdFromUrl || null;
    if (!orderId && !paymentIntentId) {
      setConfirmError(t.success.missingParams);
      setSuccessWaybillLoading(false);
      return;
    }
    setConfirmError(null);
    setSuccessWaybillLoading(true);
    const apiUrl = `${win.location.origin}/api/confirm-payment`;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, payment_intent_id: paymentIntentId ?? null }),
      });
      const text = await response.text();
      if (!response.ok) {
        let errData: { error?: string; code?: string; details?: string } | null = null;
        try {
          errData = text ? JSON.parse(text) : null;
        } catch {
          errData = null;
        }
        if (errData?.code === 'SUPABASE_FETCH_FAILED' && orderId) {
          const dbId = orderId.startsWith('ORD-') ? orderId.replace(/^ORD-/, '') : orderId;
          const attemptUpdate = async (idValue: string) => {
            const { data, error } = await supabase
              .from('orders')
              .update({ status: 'paid' })
              .eq('id', idValue)
              .select('id,status,tracking_number,waybill_no')
              .maybeSingle();
            if (error) return null;
            return data ?? null;
          };
          const updated = (await attemptUpdate(dbId)) ?? (await attemptUpdate(orderId));
          if (updated) {
            setSuccessWaybillLoading(false);
            setConfirmSuccess(true);
            setSuccessWaybill((updated as SupabaseOrderRow).waybill_no ?? (updated as SupabaseOrderRow).tracking_number ?? null);
            setConfirmError(null);
            onRefreshOrders();
            return;
          }
        }
        setSuccessWaybillLoading(false);
        setConfirmError(`錯誤 ${response.status}${text ? `: ${text.slice(0, 100)}` : ''}`);
        setConfirmSuccess(false);
        return;
      }
      let data: { success?: boolean; waybillNo?: string; waybill_no?: string; error?: string; code?: string };
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setSuccessWaybillLoading(false);
        setConfirmError(`後端回傳非 JSON (${response.status})`);
        setConfirmSuccess(false);
        return;
      }
      setSuccessWaybillLoading(false);
      if (data.success) {
        setConfirmSuccess(true);
        setSuccessWaybill(data.waybill_no ?? data.waybillNo ?? null);
        setConfirmError(null);
        onRefreshOrders();
        if (paymentIntentId) try { win.sessionStorage?.removeItem?.('airwallex_payment_intent_id'); } catch { /* ignore */ }
      } else {
        setConfirmError(data.error ?? '確認付款時發生錯誤');
        setConfirmSuccess(false);
      }
    } catch (e) {
      setSuccessWaybillLoading(false);
      setConfirmError((e as Error)?.message ?? '網路錯誤，請稍後再試');
      setConfirmSuccess(false);
    }
  }, [setSuccessWaybill, setSuccessWaybillLoading]);

  useEffect(() => {
    runConfirmPayment();
  }, [runConfirmPayment]);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 pb-24 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg p-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle className="w-12 h-12 text-emerald-600" /></div>
        <h2 className="text-2xl font-black text-slate-900">{t.success.paymentConfirmed}</h2>
        <p className="text-slate-600 font-bold text-sm">{t.success.waybillGenerating}</p>

        {successWaybillLoading && (
          <p className="text-slate-600 text-sm font-bold">{t.success.verifyingPayment}</p>
        )}

        {!successWaybillLoading && confirmSuccess && successWaybill && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.success.sfWaybill}</p>
            <p className="text-lg font-black text-slate-900 tracking-wide">{successWaybill}</p>
          </div>
        )}

        {!successWaybillLoading && confirmSuccess && !successWaybill && (
          <p className="text-slate-400 text-xs">{t.success.waybillLater}</p>
        )}

        {!successWaybillLoading && confirmError && (
          <div className="space-y-3">
            <p className="text-rose-600 text-sm font-bold">{confirmError}</p>
            <button type="button" onClick={runConfirmPayment} className="w-full py-3 bg-rose-50 text-rose-700 rounded-2xl font-black text-sm border border-rose-200 hover:bg-rose-100">
              {t.success.retryManual}
            </button>
          </div>
        )}

        <button type="button" onClick={onViewOrders} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">{t.success.viewOrders}</button>
      </div>
    </div>
  );
};

// Default advertisement slideshow when Supabase has no data
const DEFAULT_SLIDESHOW: SlideshowItem[] = [
  { id: 'slide-1', type: 'image', url: 'https://placehold.co/800x320/slate-800/white?text=歡迎光臨+冷凍肉專門店', title: '歡迎光臨', sortOrder: 0 },
  { id: 'slide-2', type: 'image', url: 'https://placehold.co/800x320/blue-900/white?text=新鮮急凍+直送到家', title: '新鮮急凍 直送到家', sortOrder: 1 },
];

// --- Main App ---

const App: React.FC = () => {
  const { lang, setLang, t } = useI18n();

  // --- Routing & Auth Logic ---
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  
  const [view, setView] = useState<'store' | 'orders' | 'profile' | 'checkout' | 'success'>(
    () => (typeof window !== 'undefined' && (window.location.pathname === '/success' || window.location.hash === '#success') ? 'success' : 'store')
  );
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [adminModule, setAdminModule] = useState<'dashboard' | 'inventory' | 'orders' | 'members' | 'slideshow' | 'pricing' | 'settings'>('dashboard');
  const [inventorySubTab, setInventorySubTab] = useState<'products' | 'categories' | 'rules'>('products');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<'all' | OrderStatus>('all');
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

  // --- Data State ---
  const [user, setUser] = useState<UserType | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({ 
    logoText: 'Fridge-Link', 
    logoIcon: '❄️',
    accentColor: 'blue',
    pricingRules: {
      memberDiscountPercent: 0,
      walletDiscountPercent: 0,
      autoApplyMemberPrice: true,
      roundToNearest: 1,
      excludedProductIds: [],
      excludedCategoryIds: [],
      markupPercent: 0
    },
    deliveryRules: {
      freeThreshold: 500,
      baseFee: 50,
      coldChainSurcharge: 20,
      lockerDiscount: 10,
      residentialSurcharge: 30,
      tieredFees: [
        { min: 0, fee: 80 },
        { min: 200, fee: 50 },
        { min: 400, fee: 30 }
      ]
    }
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [members, setMembers] = useState<UserType[]>([]);
  const [slideshowItems, setSlideshowItems] = useState<SlideshowItem[]>(DEFAULT_SLIDESHOW);
  const [editingSlideshow, setEditingSlideshow] = useState<SlideshowItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'sf_locker'>('home');

  // ── 動態運費管理 ──
  const SHIPPING_FALLBACKS: Record<string, ShippingConfig> = {
    sf_delivery: { id: 'sf_delivery', label: '順豐冷鏈上門', fee: 50, threshold: 300 },
    sf_locker:   { id: 'sf_locker',   label: '順豐凍櫃自取', fee: 30, threshold: 200 },
  };
  const [shippingConfigs, setShippingConfigs] = useState<Record<string, ShippingConfig>>(SHIPPING_FALLBACKS);
  const [upsellProductIds, setUpsellProductIds] = useState<string[]>([]);
  const [selectedLockerDistrict, setSelectedLockerDistrict] = useState('');
  const [selectedLockerCode, setSelectedLockerCode] = useState('');
  const lockerPointsForDistrict = useMemo(() => getPointsByDistrict(selectedLockerDistrict), [selectedLockerDistrict]);
  const selectedLockerPoint: SfColdPickupPoint | undefined = useMemo(() => findPointByCode(selectedLockerCode), [selectedLockerCode]);
  
  // UI State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState('hot');
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminMemberSearch, setAdminMemberSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [sfValidationModal, setSfValidationModal] = useState<{ problematic: { id: string; reason: string }[]; valid: SupabaseOrderRow[] } | null>(null);
  
  // ── 一鍵回購 ──
  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [reorderPhone, setReorderPhone] = useState('');
  const [reorderHint, setReorderHint] = useState<{ type: 'none' | 'guest' | 'member'; text: string }>({ type: 'none', text: '' });
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderNotification, setReorderNotification] = useState<{
    type: 'success' | 'partial' | 'fail';
    successCount: number;
    failedNames: string[];
  } | null>(null);

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMember, setEditingMember] = useState<UserType | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [inspectingOrderDetails, setInspectingOrderDetails] = useState<SupabaseOrderRow | null>(null);
  const [orderStatusDraft, setOrderStatusDraft] = useState<OrderStatus | null>(null);
  const [trackingDraft, setTrackingDraft] = useState('');
  const [addressEditor, setAddressEditor] = useState<{ address: UserAddress, isNew: boolean, ownerId: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [editingMemberPassword, setEditingMemberPassword] = useState('');

  // Address UI States
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showCheckoutAddressForm, setShowCheckoutAddressForm] = useState(false);
  const [checkoutAddressDraft, setCheckoutAddressDraft] = useState<UserAddress | null>(null);
  const [checkoutSelectedAddressId, setCheckoutSelectedAddressId] = useState<string | null>(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [checkoutSaveNewAddressAsDefault, setCheckoutSaveNewAddressAsDefault] = useState(true);
  const [isLocatingAddress, setIsLocatingAddress] = useState(false);

  // Highlight the order card on 記錄 after payment success
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);
  // Success page: 順豐單號（從 confirm-payment 取得）
  const [successWaybill, setSuccessWaybill] = useState<string | null>(null);
  const [successWaybillLoading, setSuccessWaybillLoading] = useState(false);

  // Slideshow (store-front ad carousel)
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const streetInputRef = useRef<HTMLInputElement | null>(null);
  const placesAutocompleteRef = useRef<unknown>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  // Handle Hash / path navigation (admin, success → 記錄 with highlight)
  useEffect(() => {
    const syncViewFromUrl = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search || '';
      setIsAdminRoute(hash === '#admin');
      if (path === '/success' || hash === '#success') {
        const params = new URLSearchParams(search);
        const orderId = params.get('order');
        setView('success');
        if (orderId) {
          setHighlightOrderId(orderId);
          setToast({ message: '多謝惠顧', type: 'success' });
        }
      }
    };
    syncViewFromUrl();
    window.addEventListener('hashchange', syncViewFromUrl);
    window.addEventListener('popstate', syncViewFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncViewFromUrl);
      window.removeEventListener('popstate', syncViewFromUrl);
    };
  }, []);

  // Clear order highlight after a few seconds
  useEffect(() => {
    if (!highlightOrderId) return;
    const t = setTimeout(() => setHighlightOrderId(null), 4000);
    return () => clearTimeout(t);
  }, [highlightOrderId]);

  // Update browser tab title when route changes
  useEffect(() => {
    if (isAdminRoute) {
      document.title = `Fridge-Link | 管理後台 (${window.location.href})`;
      return;
    }
    document.title = `${siteConfig.logoText} | 香港冷凍肉專門店`;
  }, [isAdminRoute, siteConfig.logoText]);

  useEffect(() => {
    const title = `${siteConfig.logoText} | 香港冷凍肉專門店`;
    const desc = `${siteConfig.logoText} - 香港冷凍肉專門店，新鮮急凍直送到家，順豐冷鏈配送`;
    const logoUrl = siteConfig.logoUrl || '';
    const updateMeta = (id: string, attr: string, value: string) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute(attr, value);
    };
    updateMeta('og-title', 'content', title);
    updateMeta('og-description', 'content', desc);
    updateMeta('og-image', 'content', logoUrl);
    updateMeta('tw-title', 'content', title);
    updateMeta('tw-description', 'content', desc);
    updateMeta('tw-image', 'content', logoUrl);
    if (logoUrl) {
      updateMeta('dynamic-favicon', 'href', logoUrl);
      updateMeta('apple-touch-icon', 'href', logoUrl);
    }
    const ldEl = document.getElementById('ld-json-org');
    if (ldEl) {
      ldEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.logoText,
        url: window.location.origin,
        logo: logoUrl,
      });
    }
  }, [siteConfig.logoText, siteConfig.logoUrl]);

  // Load core data from Supabase on mount
  useEffect(() => {
    const loadCoreData = async () => {
      const [productsRes, categoriesRes, membersRes, slideshowRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('members').select('*'),
        supabase.from('slideshow').select('*').order('sort_order', { ascending: true })
      ]);

      if (productsRes.error) {
        if (!handleSchemaError(productsRes.error, 'products')) {
          showToast('產品資料載入失敗', 'error');
        }
      } else if (productsRes.data?.length) {
        setProducts(productsRes.data.map(mapProductRowToProduct));
      }

      if (categoriesRes.error) {
        if (!handleSchemaError(categoriesRes.error, 'categories')) {
          showToast('分類資料載入失敗', 'error');
        }
      } else if (categoriesRes.data?.length) {
        const mapped = categoriesRes.data.map(mapCategoryRowToCategory);
        setCategories(mapped);
        setActiveCategory(mapped[0].id);
      }

      if (membersRes.error) {
        if (!handleSchemaError(membersRes.error, 'members')) {
          showToast('會員資料載入失敗', 'error');
        }
      } else if (membersRes.data) {
        setMembers(membersRes.data.map(mapMemberRowToUser));
      }

      if (!slideshowRes.error && slideshowRes.data?.length) {
        setSlideshowItems(slideshowRes.data.map((r: { id: string; type: string; url: string; title?: string | null; sort_order: number }) => mapSlideshowRowToItem(r)));
      }

      // ── 載入動態運費配置 + 湊單推薦產品（合併請求，失敗時使用 fallback）──
      try {
        const [scRes, upRes] = await Promise.all([
          supabase.from('shipping_configs').select('*'),
          supabase.from('upsell_configs').select('product_id').eq('is_active', true),
        ]);
        if (!scRes.error && scRes.data && scRes.data.length > 0) {
          const map: Record<string, ShippingConfig> = {};
          scRes.data.forEach((row: any) => {
            map[row.id] = { id: row.id, label: row.label, fee: Number(row.fee), threshold: Number(row.threshold), updated_at: row.updated_at };
          });
          setShippingConfigs(prev => ({ ...prev, ...map }));
        }
        if (!upRes.error && upRes.data) {
          setUpsellProductIds(upRes.data.map((r: any) => r.product_id));
        }
      } catch {
        console.warn('[shipping/upsell] Failed to load, using fallback values');
      }
    };

    loadCoreData();
  }, []);

  // Auto-advance advertisement slideshow
  useEffect(() => {
    if (slideshowItems.length <= 1) return;
    const t = setInterval(() => setSlideshowIndex(i => (i + 1) % slideshowItems.length), 5000);
    return () => clearInterval(t);
  }, [slideshowItems.length]);

  // Restore member login from localStorage after page load (e.g. after return from payment)
  useEffect(() => {
    let storedId: string | null = null;
    try { storedId = localStorage.getItem('coolfood_member_id'); } catch { /* ignore */ }
    if (!storedId) return;
    const restoreUser = async () => {
      const { data, error } = await supabase.from('members').select('*').eq('id', storedId).maybeSingle();
      if (error || !data) return;
      setUser(mapMemberRowToUser(data as SupabaseMemberRow));
    };
    restoreUser();
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_name, total, status, order_date, items_count, tracking_number, waybill_no')
      .order('order_date', { ascending: false });
    if (error) {
      if (!handleSchemaError(error, 'orders')) {
        showToast('訂單資料載入失敗', 'error');
      }
      return;
    }
    if (data?.length) {
      setOrders((data as SupabaseOrderRow[]).map(mapOrderRowToOrder));
    } else {
      setOrders([]);
    }
  }, []);

  // Load orders from Supabase on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh orders when viewing order history
  useEffect(() => {
    if (view === 'orders') fetchOrders();
  }, [view, fetchOrders]);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!inspectingOrder) {
        setInspectingOrderDetails(null);
        setOrderStatusDraft(null);
        setTrackingDraft('');
        return;
      }
      const dbId = getOrderDbId(inspectingOrder.id);
      if (dbId === null) return;
      const { data, error } = await supabase.from('orders').select('*').eq('id', dbId).single();
      if (error || !data) {
        showToast(error?.message || '訂單載入失敗', 'error');
        return;
      }
      const details = data as SupabaseOrderRow;
      setInspectingOrderDetails(details);
      setOrderStatusDraft(normalizeOrderStatus(details.status));
      setTrackingDraft(details.waybill_no ?? details.tracking_number ?? '');
    };
    loadOrderDetails();
  }, [inspectingOrder]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginForm.username === '1990' && adminLoginForm.password === '1990') {
      setIsAdminAuthenticated(true);
      showToast('後台登入成功');
    } else {
      showToast('帳號或密碼錯誤', 'error');
    }
  };

  const accentClass = 'bg-blue-600';
  const textAccentClass = 'text-blue-600';

  const updateCart = (product: Product, delta: number, e?: React.MouseEvent) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const newQty = (existing?.qty || 0) + delta;
      if (!existing && delta > 0) return [...prev, { ...product, qty: 1 }];
      if (existing) {
        if (newQty <= 0) return prev.filter(item => item.id !== product.id);
        return prev.map(item => item.id === product.id ? { ...item, qty: newQty } : item);
      }
      return prev;
    });
  };

  // ── 一鍵回購：核心邏輯 ──
  const handleReorderByPhone = useCallback(async (phone: string) => {
    if (!phone || phone.length < 6) { showToast('請輸入有效手機號碼', 'error'); return; }
    setReorderLoading(true);
    try {
      // 嘗試多種電話格式匹配（帶/不帶區號）
      const phoneTrimmed = phone.replace(/\s+/g, '').replace(/^(\+?852)/, '');
      const phoneVariants = [phoneTrimmed, `852${phoneTrimmed}`, `+852${phoneTrimmed}`, phone];

      let orderRows: any[] | null = null;
      let queryError: any = null;

      for (const variant of phoneVariants) {
        const { data, error } = await supabase
          .from('orders')
          .select('line_items')
          .eq('customer_phone', variant)
          .in('status', ['paid', 'processing', 'ready_for_pickup', 'completed'])
          .order('order_date', { ascending: false })
          .limit(1);
        queryError = error;
        if (!error && data && data.length > 0) { orderRows = data; break; }
      }

      if (queryError) {
        console.warn('[reorder] Query error:', queryError.message);
        setReorderNotification({ type: 'fail', successCount: 0, failedNames: ['系統查詢暫時出錯，請稍後再試。'] });
        setReorderLoading(false);
        setReorderModalOpen(false);
        return;
      }

      if (!orderRows || orderRows.length === 0) {
        setReorderNotification({ type: 'fail', successCount: 0, failedNames: ['未搵到您嘅歷史紀錄，不如去睇下我哋今日嘅精選？'] });
        setReorderLoading(false);
        setReorderModalOpen(false);
        return;
      }

      const lineItems: OrderLineItem[] = orderRows[0].line_items || [];
      if (lineItems.length === 0) {
        setReorderNotification({ type: 'fail', successCount: 0, failedNames: ['上次訂單冇產品紀錄'] });
        setReorderLoading(false);
        setReorderModalOpen(false);
        return;
      }

      // 分類 successItems 與 failedItems
      let successCount = 0;
      const failedNames: string[] = [];
      const newCart: CartItem[] = [...cart];

      // Debug: 列出所有資訊以便診斷
      const productIds = products.map(p => ({ id: p.id, idType: typeof p.id, name: p.name, stock: p.stock, trackInventory: p.trackInventory }));
      console.log('[reorder] 商店產品清單:', productIds);
      console.log('[reorder] 歷史訂單 line_items:', JSON.stringify(lineItems));

      for (const li of lineItems) {
        // 寬鬆比對：同時嘗試嚴格匹配與 toString 匹配
        const liId = String(li.product_id ?? '');
        const prod = products.find(p => String(p.id) === liId);

        if (!prod) {
          console.warn(`[reorder] ❌ 找不到產品 — product_id="${liId}" (type=${typeof li.product_id})`);
          failedNames.push(li.name || liId);
          continue;
        }

        // 庫存判斷：若不追蹤庫存(trackInventory=false)則視為有貨；stock 為 null/undefined 也視為有貨
        const hasStock = !prod.trackInventory || prod.stock === null || prod.stock === undefined || prod.stock > 0;
        if (!hasStock) {
          console.warn(`[reorder] ❌ 庫存不足 — "${prod.name}" stock=${prod.stock}, trackInventory=${prod.trackInventory}`);
          failedNames.push(li.name || prod.name);
          continue;
        }

        const existing = newCart.find(c => c.id === prod.id);
        const maxQty = (prod.trackInventory && prod.stock > 0) ? prod.stock : 999;
        const wantQty = Math.min(li.qty || 1, maxQty);
        if (existing) {
          existing.qty = Math.min(existing.qty + wantQty, maxQty);
        } else {
          newCart.push({ ...prod, qty: wantQty });
        }
        successCount++;
        console.log(`[reorder] ✅ 已加入 "${prod.name}" x${wantQty}`);
      }

      setCart(newCart);
      setReorderModalOpen(false);
      setReorderPhone('');
      setReorderHint({ type: 'none', text: '' });

      // 顯示持久性通知（不跳轉、不自動消失）
      if (successCount > 0 && failedNames.length === 0) {
        setReorderNotification({ type: 'success', successCount, failedNames: [] });
      } else if (successCount > 0 && failedNames.length > 0) {
        setReorderNotification({ type: 'partial', successCount, failedNames });
      } else {
        setReorderNotification({ type: 'fail', successCount: 0, failedNames });
      }
    } catch {
      setReorderNotification({ type: 'fail', successCount: 0, failedNames: ['查詢失敗，請稍後再試'] });
      setReorderModalOpen(false);
    }
    setReorderLoading(false);
  }, [cart, products]);

  const handleReorderClick = useCallback(() => {
    setReorderNotification(null); // 清除舊通知
    if (user?.phoneNumber) {
      // 情況 A：已登入，直接查詢（不跳轉）
      handleReorderByPhone(user.phoneNumber);
    } else {
      // 情況 B：未登入，彈出 Modal
      setReorderPhone('');
      setReorderHint({ type: 'none', text: '' });
      setReorderModalOpen(true);
    }
  }, [user, handleReorderByPhone]);

  // 訪客輸入電話後偵測是否為會員
  const handleReorderPhoneCheck = useCallback(async (phone: string) => {
    setReorderPhone(phone);
    if (phone.length < 8) { setReorderHint({ type: 'none', text: '' }); return; }
    try {
      const { data } = await supabase.from('members').select('id').eq('phone_number', phone).maybeSingle();
      if (data) {
        setReorderHint({ type: 'member', text: '👋 原來您係我哋會員！您可以先登入，買嘢更快之餘仲可以累積積分。(但唔登入都買得架)' });
      } else {
        setReorderHint({ type: 'guest', text: '💡 溫馨提示：登記做會員下次就唔使再輸入電話，仲可以儲分換禮品添！(但唔登記都買得架)' });
      }
    } catch {
      setReorderHint({ type: 'guest', text: '' });
    }
  }, []);

  const isUsingWallet = user && user.walletBalance > 0;

  // ── 定價上下文（三層：訪客 / 會員 / 錢包）──
  const pricingTier: PricingTier = isUsingWallet ? 'wallet' : user ? 'member' : 'guest';
  const memberPct = siteConfig.pricingRules?.memberDiscountPercent || 0;
  const walletPct = siteConfig.pricingRules?.walletDiscountPercent || 0;
  const pricingExcluded = siteConfig.pricingRules?.excludedProductIds;

  // 便利包裝：快速取得當前使用者看到的價格
  const getPrice = (p: Product, qty: number = 1) =>
    getEffectiveUnitPrice(p, qty, pricingTier, memberPct, walletPct, pricingExcluded);
  
  const pricingData = useMemo(() => {
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += getEffectiveUnitPrice(item, item.qty, pricingTier, memberPct, walletPct, pricingExcluded) * item.qty;
    });

    // 動態運費：根據配送方式從 shipping_configs 讀取 fee / threshold
    const configKey = deliveryMethod === 'home' ? 'sf_delivery' : 'sf_locker';
    const sc = shippingConfigs[configKey] || SHIPPING_FALLBACKS[configKey];
    const deliveryFee = subtotal >= sc.threshold ? 0 : sc.fee;

    // 雙門檻資料供免運進度條使用
    const lockerConfig = shippingConfigs['sf_locker'] || SHIPPING_FALLBACKS['sf_locker'];
    const deliveryConfig = shippingConfigs['sf_delivery'] || SHIPPING_FALLBACKS['sf_delivery'];

    return { 
      subtotal, 
      deliveryFee, 
      total: subtotal + deliveryFee,
      // 當前選擇的配送方式門檻
      shippingThreshold: sc.threshold,
      shippingFee: sc.fee,
      // 雙門檻值
      lockerThreshold: lockerConfig.threshold,
      lockerFee: lockerConfig.fee,
      deliveryThreshold: deliveryConfig.threshold,
      deliveryFee_delivery: deliveryConfig.fee,
    };
  }, [cart, pricingTier, memberPct, walletPct, pricingExcluded, deliveryMethod, shippingConfigs]);

  // ── 湊單推薦產品（已過濾掉購物車中的商品）──
  const upsellProducts = useMemo(() => {
    if (upsellProductIds.length === 0) return [];
    const cartIds = new Set(cart.map(c => c.id));
    return products
      .filter(p => upsellProductIds.includes(p.id) && !cartIds.has(p.id) && p.stock > 0)
      .slice(0, 3);
  }, [upsellProductIds, products, cart]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const target = catRefs.current[id];
    if (target && listRef.current) {
      const containerTop = listRef.current.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      listRef.current.scrollTo({ top: targetTop - containerTop + listRef.current.scrollTop - 20, behavior: 'smooth' });
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthForm({ email: '', password: '', name: '', phone: '' });
    setShowAuthModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = authForm.email.trim();
    if (!input || !authForm.password) {
      showToast('請輸入電郵或電話及密碼', 'error');
      return;
    }
    const isEmail = input.includes('@');
    const { data, error } = isEmail
      ? await supabase.from('members').select('*').eq('email', input.toLowerCase()).maybeSingle()
      : await supabase.from('members').select('*').eq('phone_number', input).maybeSingle();
    if (error) {
      showToast(error.message || '登入失敗', 'error');
      return;
    }
    if (!data) {
      showToast('找不到此帳戶', 'error');
      return;
    }
    const row = data as SupabaseMemberRow;
    const ok = await verifyPassword(authForm.password, row.password_hash);
    if (!ok) {
      showToast('密碼錯誤', 'error');
      return;
    }
    const u = mapMemberRowToUser(row);
    setUser(u);
    try { localStorage.setItem('coolfood_member_id', u.id); } catch { /* ignore */ }
    setShowAuthModal(false);
    setAuthForm({ email: '', password: '', name: '', phone: '' });
    setView('profile');
    showToast('歡迎回來！');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = authForm.phone.trim();
    if (!authForm.name.trim() || !phone || !authForm.password) {
      showToast('請填寫姓名、電話及密碼', 'error');
      return;
    }
    if (authForm.password.length < 6) {
      showToast('密碼至少 6 個字元', 'error');
      return;
    }
    const { data: existingPhone } = await supabase.from('members').select('id').eq('phone_number', phone).maybeSingle();
    if (existingPhone) {
      showToast('此電話已被註冊', 'error');
      return;
    }
    const emailVal = authForm.email.trim() ? authForm.email.trim().toLowerCase() : null;
    if (emailVal) {
      const { data: existingEmail } = await supabase.from('members').select('id').eq('email', emailVal).maybeSingle();
      if (existingEmail) {
        showToast('此電郵已被註冊', 'error');
        return;
      }
    }
    const passwordHash = await hashPassword(authForm.password);
    const newId = `u-${Date.now()}`;
    const newMember: SupabaseMemberRow = {
      id: newId,
      name: authForm.name.trim(),
      email: emailVal,
      password_hash: passwordHash,
      phone_number: phone,
      points: 0,
      wallet_balance: 0,
      tier: 'Bronze',
      role: 'customer',
      addresses: null
    };
    const { data, error } = await supabase.from('members').insert(newMember).select().single();
    if (error) {
      showToast(error.message || '註冊失敗', 'error');
      return;
    }
    const u = mapMemberRowToUser(data as SupabaseMemberRow);
    setUser(u);
    try { localStorage.setItem('coolfood_member_id', u.id); } catch { /* ignore */ }
    setMembers(prev => [...prev, u]);
    setShowAuthModal(false);
    setAuthForm({ email: '', password: '', name: '', phone: '' });
    setView('profile');
    showToast('註冊成功！');
  };

  const handleSetDefaultAddress = (ownerId: string, addressId: string) => {
    const updateMember = (m: UserType) => {
      if (m.id !== ownerId) return m;
      const addresses = m.addresses?.map(a => ({ ...a, isDefault: a.id === addressId })) || [];
      return { ...m, addresses };
    };
    const baseMember = members.find(m => m.id === ownerId) || (user && user.id === ownerId ? user : null);
    if (!baseMember) {
      showToast('會員資料不存在', 'error');
      return;
    }
    upsertMember(updateMember(baseMember));
    showToast('已設為預設地址');
  };

  const handleSaveAddress = (ownerId: string, address: UserAddress, isNew: boolean, setAsDefault?: boolean) => {
    const updateMember = (m: UserType) => {
      if (m.id !== ownerId) return m;
      let addresses = [...(m.addresses || [])];
      if (isNew) {
        const newAddr = setAsDefault ? { ...address, isDefault: true } : { ...address, isDefault: addresses.length === 0 };
        if (setAsDefault) addresses = addresses.map(a => ({ ...a, isDefault: false }));
        addresses.push(newAddr);
      } else {
        addresses = addresses.map(a => a.id === address.id ? address : a);
      }
      return { ...m, addresses };
    };
    const baseMember = members.find(m => m.id === ownerId) || (user && user.id === ownerId ? user : null);
    if (!baseMember) {
      showToast('會員資料不存在', 'error');
      return;
    }
    const updatedMember = updateMember(baseMember);
    upsertMember(updatedMember);
    setAddressEditor(null);
    showToast(isNew ? '地址已新增' : '地址已更新');
  };

  const handleDeleteAddress = (ownerId: string, addressId: string) => {
    const baseMember = members.find(m => m.id === ownerId) || (user && user.id === ownerId ? user : null);
    if (!baseMember) {
      showToast('會員資料不存在', 'error');
      return;
    }
    const addresses = (baseMember.addresses || []).filter(a => a.id !== addressId);
    const wasDefault = baseMember.addresses?.find(a => a.id === addressId)?.isDefault;
    const nextAddresses = wasDefault && addresses.length > 0
      ? addresses.map((a, i) => ({ ...a, isDefault: i === 0 }))
      : addresses;
    upsertMember({ ...baseMember, addresses: nextAddresses });
    showToast('地址已刪除');
  };

  const getOrderDbId = (orderId: string) => {
    if (orderId.startsWith('ORD-')) {
      const parsed = Number(orderId.replace('ORD-', ''));
      return Number.isNaN(parsed) ? null : parsed;
    }
    const parsed = Number(orderId);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSchemaError = (error: { message?: string } | null, tableName: string) => {
    const message = error?.message || '';
    if (message.includes('schema cache') || message.includes(`public.${tableName}`)) {
      const hints: Record<string, string> = {
        members: '請在 Supabase SQL Editor 執行 supabase-members-schema.sql 建立 members 表',
        products: '請在 Supabase SQL Editor 執行 supabase-products-schema.sql 建立 products 表',
        categories: '請在 Supabase SQL Editor 執行 supabase-categories-schema.sql 建立 categories 表',
        orders: '請在 Supabase SQL Editor 執行 supabase-orders-schema.sql 建立 orders 表',
        slideshow: '請在 Supabase SQL Editor 執行 supabase-slideshow-schema.sql 建立 slideshow 表',
      };
      const hint = hints[tableName] || `請先在 Supabase 建立 ${tableName} 表`;
      showToast(hint, 'error');
      return true;
    }
    return false;
  };

  const upsertProduct = async (product: Product) => {
    const { data, error } = await supabase
      .from('products')
      .upsert(mapProductToRow(product))
      .select()
      .single();
    if (error || !data) {
      if (!handleSchemaError(error, 'products')) {
        showToast(error?.message || '產品保存失敗', 'error');
      }
      return;
    }
    const mapped = mapProductRowToProduct(data);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === mapped.id);
      if (idx === -1) return [...prev, mapped];
      const next = [...prev];
      next[idx] = mapped;
      return next;
    });
  };

  const upsertProducts = async (items: Product[]) => {
    if (items.length === 0) return false;
    const { data, error } = await supabase
      .from('products')
      .upsert(items.map(mapProductToRow))
      .select();
    if (error || !data) {
      if (!handleSchemaError(error, 'products')) {
        showToast(error?.message || '產品批量保存失敗', 'error');
      }
      return false;
    }
    setProducts(data.map(mapProductRowToProduct));
    return true;
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      if (!handleSchemaError(error, 'products')) {
        showToast(error.message || '產品刪除失敗', 'error');
      }
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('產品已刪除');
  };

  const upsertCategory = async (category: Category) => {
    const { data, error } = await supabase
      .from('categories')
      .upsert(mapCategoryToRow(category))
      .select()
      .single();
    if (error || !data) {
      if (!handleSchemaError(error, 'categories')) {
        showToast(error?.message || '分類保存失敗', 'error');
      }
      return;
    }
    const mapped = mapCategoryRowToCategory(data);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === mapped.id);
      if (idx === -1) return [...prev, mapped];
      const next = [...prev];
      next[idx] = mapped;
      return next;
    });
  };

  const deleteCategory = async (categoryId: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      if (!handleSchemaError(error, 'categories')) {
        showToast(error.message || '分類刪除失敗', 'error');
      }
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    showToast('分類已刪除');
  };

  const upsertSlideshowItem = async (item: SlideshowItem) => {
    const { data, error } = await supabase
      .from('slideshow')
      .upsert(mapSlideshowItemToRow(item))
      .select()
      .single();
    if (error || !data) {
      if (!handleSchemaError(error, 'slideshow')) {
        showToast(error?.message || '廣告保存失敗', 'error');
      }
      return;
    }
    const mapped = mapSlideshowRowToItem(data);
    setSlideshowItems(prev => {
      const idx = prev.findIndex(s => s.id === mapped.id);
      if (idx === -1) return [...prev, mapped].sort((a, b) => a.sortOrder - b.sortOrder);
      const next = [...prev];
      next[idx] = mapped;
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    showToast('廣告已保存');
  };

  const deleteSlideshowItem = async (id: string) => {
    const { error } = await supabase.from('slideshow').delete().eq('id', id);
    if (error) {
      if (!handleSchemaError(error, 'slideshow')) {
        showToast(error.message || '廣告刪除失敗', 'error');
      }
      return;
    }
    setSlideshowItems(prev => prev.filter(s => s.id !== id));
    showToast('廣告已刪除');
  };

  const upsertMember = async (member: UserType, passwordHash?: string | null) => {
    const { data, error } = await supabase
      .from('members')
      .upsert(mapUserToMemberRow(member, passwordHash))
      .select()
      .single();
    if (error || !data) {
      if (!handleSchemaError(error, 'members')) {
        showToast(error?.message || '會員保存失敗', 'error');
      }
      return;
    }
    const mapped = mapMemberRowToUser(data);
    setMembers(prev => {
      const idx = prev.findIndex(m => m.id === mapped.id);
      if (idx === -1) return [...prev, mapped];
      const next = [...prev];
      next[idx] = mapped;
      return next;
    });
    if (user && user.id === mapped.id) setUser(mapped);
    if (editingMember && editingMember.id === mapped.id) setEditingMember(mapped);
  };

  const updateOrderFields = async (orderId: string, fields: Partial<SupabaseOrderRow>) => {
    const dbId = getOrderDbId(orderId);
    if (dbId === null) {
      showToast('訂單編號無效', 'error');
      return;
    }
    const { data, error } = await supabase
      .from('orders')
      .update(fields)
      .eq('id', dbId)
      .select()
      .single();
    if (error || !data) {
      showToast(error?.message || '訂單更新失敗', 'error');
      return;
    }
    setInspectingOrderDetails(data as SupabaseOrderRow);
    const mapped = mapOrderRowToOrder(data);
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === mapped.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...mapped };
      return next;
    });
  };

  const handleTrackOrder = (order: Order) => {
    if (!order.trackingNumber) {
      showToast('沒有物流編號', 'error');
      return;
    }
    const url = `https://www.sf-express.com/hk/en/dynamic_function/waybill/?billno=${order.trackingNumber}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ========== Batch Order Operations ==========

  /** Action A: 截單 — batch update paid orders to processing */
  const handleBatchCutoff = async () => {
    if (selectedOrderIds.size === 0) return;
    setBatchProcessing(true);
    try {
      // Filter selected orders: only those with status paid (已付款)
      const eligibleOrders = orders.filter(o => selectedOrderIds.has(o.id) && o.status === OrderStatus.PAID);
      if (eligibleOrders.length === 0) {
        showToast('沒有符合條件的訂單（僅限「已付款」狀態）', 'error');
        setBatchProcessing(false);
        return;
      }
      const dbIds = eligibleOrders.map(o => {
        const dbId = getOrderDbId(o.id);
        return dbId;
      }).filter((id): id is number => id !== null);

      const { error } = await supabase
        .from('orders')
        .update({ status: 'processing' })
        .in('id', dbIds);
      if (error) {
        showToast(`截單失敗：${error.message}`, 'error');
      } else {
        showToast(`已截單 ${eligibleOrders.length} 筆訂單`);
        // 觸發通知（非阻塞，失敗不影響截單結果）
        // customerPhone 由 notification service 自動從 DB 查詢
        fetch(`${window.location.origin}/api/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orders: eligibleOrders.map(o => ({
              orderId: o.id,
              newStatus: 'processing',
            })),
          }),
        }).catch(() => {/* 通知失敗不影響 UI */});
        await fetchOrders();
        setSelectedOrderIds(new Set());
      }
    } catch (e) {
      showToast(`截單錯誤：${e instanceof Error ? e.message : String(e)}`, 'error');
    }
    setBatchProcessing(false);
  };

  /** Action B: 列印總揀貨單 — aggregate packing list */
  const handlePrintAggregateList = async () => {
    if (selectedOrderIds.size === 0) return;
    setBatchProcessing(true);
    try {
      const dbIds = Array.from(selectedOrderIds).map(id => {
        const dbId = getOrderDbId(id);
        return dbId;
      }).filter((id): id is number => id !== null);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', dbIds);
      if (error || !data) {
        showToast('載入訂單資料失敗', 'error');
        setBatchProcessing(false);
        return;
      }

      // Aggregate line_items by product
      const aggregated: Record<string, { name: string; qty: number; image?: string | null }> = {};
      for (const row of data as SupabaseOrderRow[]) {
        for (const item of row.line_items || []) {
          const key = `${item.product_id}_${item.name}`;
          if (aggregated[key]) {
            aggregated[key].qty += item.qty;
          } else {
            aggregated[key] = { name: item.name, qty: item.qty, image: item.image };
          }
        }
      }

      // Sort by qty descending
      const sorted = Object.values(aggregated).sort((a, b) => b.qty - a.qty);
      const today = new Date().toLocaleDateString('zh-HK');

      // Open print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('無法開啟列印視窗，請允許彈出視窗', 'error');
        setBatchProcessing(false);
        return;
      }
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>總揀貨單</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
          h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f1f5f9; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          .qty { font-weight: 900; font-size: 16px; color: #0f172a; }
          @media print { body { padding: 20px; } }
        </style>
      </head><body>
        <h1>總揀貨單</h1>
        <p class="meta">日期：${today} ｜ 共 ${selectedOrderIds.size} 筆訂單 ｜ ${sorted.length} 種商品</p>
        <table>
          <thead><tr><th>#</th><th>商品名稱</th><th>總數量</th></tr></thead>
          <tbody>${sorted.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td class="qty">${item.qty}</td></tr>`).join('')}</tbody>
        </table>
      </body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    } catch (e) {
      showToast(`列印失敗：${e instanceof Error ? e.message : String(e)}`, 'error');
    }
    setBatchProcessing(false);
  };

  /** Action C: 列印個人清單 — individual invoices */
  const handlePrintIndividualInvoices = async () => {
    if (selectedOrderIds.size === 0) return;
    setBatchProcessing(true);
    try {
      const dbIds = Array.from(selectedOrderIds).map(id => {
        const dbId = getOrderDbId(id);
        return dbId;
      }).filter((id): id is number => id !== null);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('id', dbIds);
      if (error || !data) {
        showToast('載入訂單資料失敗', 'error');
        setBatchProcessing(false);
        return;
      }

      const orderRows = data as SupabaseOrderRow[];
      const today = new Date().toLocaleDateString('zh-HK');

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('無法開啟列印視窗，請允許彈出視窗', 'error');
        setBatchProcessing(false);
        return;
      }

      const invoicesHtml = orderRows.map((row, idx) => {
        const orderId = typeof row.id === 'number' ? `ORD-${row.id}` : row.id;
        const address = [row.delivery_district, row.delivery_address, row.delivery_street, row.delivery_building].filter(Boolean).join(' ');
        const floorFlat = [row.delivery_floor ? row.delivery_floor + '樓' : '', row.delivery_flat ? row.delivery_flat + '室' : ''].filter(Boolean).join(' ');
        const fullAddress = [address, floorFlat].filter(Boolean).join(' ') || '未提供地址';

        const lineItemsHtml = (row.line_items || []).map(item =>
          `<tr><td>${item.name}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">$${item.unit_price}</td><td style="text-align:right">$${item.line_total}</td></tr>`
        ).join('');

        return `<div class="invoice" ${idx < orderRows.length - 1 ? 'style="page-break-after:always"' : ''}>
          <h2>訂單 #${orderId}</h2>
          <div class="info-grid">
            <div><span class="label">客戶</span><span>${row.customer_name}</span></div>
            <div><span class="label">電話</span><span>${row.customer_phone || '未提供'}</span></div>
            <div><span class="label">聯絡人</span><span>${row.contact_name || '未提供'}</span></div>
            <div><span class="label">配送方式</span><span>${row.delivery_method || '未設定'}</span></div>
            <div class="full-width"><span class="label">地址</span><span>${fullAddress}</span></div>
          </div>
          <table>
            <thead><tr><th>商品</th><th style="text-align:center">數量</th><th style="text-align:right">單價</th><th style="text-align:right">小計</th></tr></thead>
            <tbody>${lineItemsHtml}</tbody>
          </table>
          <div class="totals">
            <div><span>商品小計</span><span>$${row.subtotal ?? row.total}</span></div>
            <div><span>運費</span><span>$${row.delivery_fee ?? 0}</span></div>
            <div class="grand-total"><span>總計</span><span>$${row.total}</span></div>
          </div>
        </div>`;
      }).join('');

      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>個人清單</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
          .invoice { margin-bottom: 40px; }
          h2 { font-size: 20px; font-weight: 900; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #1e293b; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; }
          .info-grid .full-width { grid-column: 1 / -1; }
          .info-grid .label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; }
          .info-grid span:not(.label) { font-size: 14px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f1f5f9; padding: 10px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border-bottom: 2px solid #e2e8f0; text-align: left; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600; }
          .totals { text-align: right; font-size: 14px; }
          .totals > div { display: flex; justify-content: flex-end; gap: 24px; padding: 4px 0; }
          .totals .grand-total { font-weight: 900; font-size: 16px; border-top: 2px solid #1e293b; padding-top: 8px; margin-top: 4px; }
          @media print { body { padding: 20px; } }
        </style>
      </head><body>
        <div style="text-align:center;margin-bottom:32px;font-size:11px;color:#94a3b8;font-weight:700;">列印日期：${today} ｜ 共 ${orderRows.length} 筆訂單</div>
        ${invoicesHtml}
      </body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 300);
    } catch (e) {
      showToast(`列印失敗：${e instanceof Error ? e.message : String(e)}`, 'error');
    }
    setBatchProcessing(false);
  };

  /** Action D: 呼叫順豐 — call SF API sequentially, then update status */
  const handleBatchCallCourier = async () => {
    if (selectedOrderIds.size === 0) return;
    setBatchProcessing(true);
    try {
      // Filter to processing orders only
      const eligibleOrders = orders.filter(o => selectedOrderIds.has(o.id) && o.status === OrderStatus.PROCESSING);
      if (eligibleOrders.length === 0) {
        showToast('沒有符合條件的訂單（僅限「處理中」狀態）', 'error');
        setBatchProcessing(false);
        return;
      }

      // Fetch full details for all eligible orders
      const dbIds = eligibleOrders.map(o => getOrderDbId(o.id)).filter((id): id is number => id !== null);
      const { data, error } = await supabase.from('orders').select('*').in('id', dbIds);
      if (error || !data) {
        showToast('載入訂單資料失敗', 'error');
        setBatchProcessing(false);
        return;
      }

      const orderRows = data as SupabaseOrderRow[];

      // Validate: check address and contact info
      const problematic: { id: string; reason: string }[] = [];
      const valid: SupabaseOrderRow[] = [];
      for (const row of orderRows) {
        const orderId = typeof row.id === 'number' ? `ORD-${row.id}` : String(row.id);
        const reasons: string[] = [];
        if (!row.delivery_address && !row.delivery_district) reasons.push('缺少配送地址');
        if (!row.customer_phone && !row.contact_name) reasons.push('缺少聯絡人/電話');
        if (reasons.length > 0) {
          problematic.push({ id: orderId, reason: reasons.join('、') });
        } else {
          valid.push(row);
        }
      }

      if (problematic.length > 0) {
        // Show validation modal
        setSfValidationModal({ problematic, valid });
        setBatchProcessing(false);
        return;
      }

      // All valid — proceed to call SF
      await executeSfCalls(valid);
    } catch (e) {
      showToast(`呼叫順豐錯誤：${e instanceof Error ? e.message : String(e)}`, 'error');
    }
    setBatchProcessing(false);
  };

  /** Execute SF API calls sequentially with controlled flow */
  const executeSfCalls = async (validOrders: SupabaseOrderRow[]) => {
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validOrders) {
      const orderId = typeof row.id === 'number' ? `ORD-${row.id}` : String(row.id);
      try {
        const sfRes = await fetch(`${window.location.origin}/api/sf-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const sfText = await sfRes.text();
        let sfJson: { waybillNo?: string; waybill_no?: string } | null = null;
        try { sfJson = sfText ? JSON.parse(sfText) : null; } catch { sfJson = null; }

        if (sfRes.ok && sfJson) {
          const waybill = sfJson.waybill_no ?? sfJson.waybillNo ?? null;
          // Update order status to ready_for_pickup and store waybill
          await supabase
            .from('orders')
            .update({
              status: 'ready_for_pickup',
              ...(waybill ? { waybill_no: waybill } : {}),
              sf_responses: { status: sfRes.status, body: sfJson, at: new Date().toISOString() },
            })
            .eq('id', row.id);
          successCount++;
        } else {
          // Mark as abnormal on failure
          await supabase
            .from('orders')
            .update({
              status: 'abnormal',
              sf_responses: { status: sfRes.status, body: sfText, at: new Date().toISOString(), error: true },
            })
            .eq('id', row.id);
          failCount++;
        }
      } catch (e) {
        await supabase
          .from('orders')
          .update({
            status: 'abnormal',
            sf_responses: { error: true, message: e instanceof Error ? e.message : String(e), at: new Date().toISOString() },
          })
          .eq('id', row.id);
        failCount++;
      }
    }

    await fetchOrders();
    setSelectedOrderIds(new Set());
    setSfValidationModal(null);
    const msg = failCount > 0
      ? `順豐下單完成：${successCount} 成功、${failCount} 失敗（已標記異常）`
      : `順豐下單完成：${successCount} 筆訂單已更新為「等待收件」`;
    showToast(msg, failCount > 0 ? 'error' : 'success');
    setBatchProcessing(false);
  };

  const handleLocateMe = () => {
    if (!checkoutAddressDraft) return;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      showToast('請在 .env.local 設定 GOOGLE_MAPS_API_KEY', 'error');
      return;
    }
    if (!navigator.geolocation) {
      showToast('此瀏覽器不支援定位，請手動填寫地址', 'error');
      return;
    }
    const lang = getAppLanguage();
    setIsLocatingAddress(true);
    const timeoutId = setTimeout(() => {
      setIsLocatingAddress((prev) => { if (prev) showToast('定位逾時，請手動填寫地址', 'error'); return false; });
    }, 15000);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await loadGoogleMapsScript(apiKey, lang);
          clearTimeout(timeoutId);
          const g = (window as unknown as { google?: { maps?: { Geocoder: new () => { geocode: (req: unknown, cb: (results: { address_components?: { long_name: string; short_name: string; types: string[] }[]; formatted_address?: string }[] | null, status: string) => void) => void } } } }).google;
          if (!g?.maps?.Geocoder) {
            setIsLocatingAddress(false);
            showToast('無法載入地圖服務，請手動填寫地址', 'error');
            return;
          }
          const geocoder = new g.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setIsLocatingAddress(false);
            if (status !== 'OK') {
              showToast('Could not find address', 'error');
              return;
            }
            if (!results || results.length === 0) {
              showToast('Could not find address', 'error');
              return;
            }
            const first = results[0];
            if (!first) {
              showToast('Could not find address', 'error');
              return;
            }
            const { district, street, building } = parseReverseGeocodeResults(results);
            const detail = [street, building].filter(Boolean).join(' ');
            setCheckoutAddressDraft(prev => prev ? { ...prev, district: district || prev.district, detail: detail || prev.detail } : prev);
            if (district || detail) showToast('已填入地址，請補上樓層及室號');
          });
        } catch {
          clearTimeout(timeoutId);
          setIsLocatingAddress(false);
          showToast('無法取得地址，請手動填寫', 'error');
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        setIsLocatingAddress(false);
        if (err?.code === 1) showToast('Location denied. Please allow location or type your address.', 'error');
        else showToast('無法取得位置，請允許定位或手動填寫地址', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Attach Google Places Autocomplete to street input when checkout address form is visible (flexible: suggestions only; floor/flat untouched).
  useEffect(() => {
    const formVisible = showCheckoutAddressForm || (isChangingAddress && !!checkoutAddressDraft);
    if (!formVisible) {
      placesAutocompleteRef.current = null;
      return;
    }
    const inputEl = streetInputRef.current;
    if (!inputEl) return;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    const lang = getAppLanguage();
    let ac: unknown = null;
    loadGoogleMapsScript(apiKey, lang)
      .then(() => {
        const g = (window as unknown as {
          google?: {
            maps?: {
              places?: {
                Autocomplete: new (input: HTMLInputElement, opts?: { types?: string[]; language?: string }) => { getPlace?: () => { place_id?: string }; addListener: (event: string, fn: () => void) => void };
                PlacesService: new (map: unknown) => { getDetails: (req: { placeId: string }, cb: (place: { address_components?: { long_name: string; short_name: string; types: string[] }[] } | null, status: string) => void) => void };
              };
              Map: new (el: HTMLElement, opts?: object) => unknown;
            };
          };
        }).google;
        if (!g?.maps?.places || !streetInputRef.current) return;
        const Autocomplete = g.maps.places.Autocomplete;
        ac = new Autocomplete(streetInputRef.current, { types: ['address'], language: lang });
        placesAutocompleteRef.current = ac;
        (ac as { addListener: (event: string, fn: () => void) => void }).addListener('place_changed', () => {
          const acInstance = placesAutocompleteRef.current as { getPlace?: () => { place_id?: string } } | null;
          const place = acInstance?.getPlace?.();
          const placeId = place?.place_id;
          if (!placeId) return;
          const mapEl = document.createElement('div');
          const map = new g.maps.Map(mapEl, {});
          const service = new g.maps.places.PlacesService(map);
          service.getDetails({ placeId }, (detail, status) => {
            if (status !== 'OK' || !detail?.address_components?.length) return;
            const { district, street, building } = parseAddressComponents(detail.address_components);
            const detailLine = [street, building].filter(Boolean).join(' ');
            setCheckoutAddressDraft(prev => prev ? { ...prev, district: district || prev.district, detail: detailLine || prev.detail } : prev);
          });
        });
      })
      .catch(() => {});
    return () => {
      placesAutocompleteRef.current = null;
    };
  }, [showCheckoutAddressForm, isChangingAddress, checkoutAddressDraft]);

  /** Resolves the delivery address for checkout: draft if complete, else selected/default saved address for member. */
  const getCheckoutDeliveryAddress = (): UserAddress | null => {
    if (deliveryMethod !== 'home') return null;
    if (checkoutAddressDraft && isAddressCompleteForOrder(checkoutAddressDraft)) return checkoutAddressDraft;
    const addrs = user?.addresses;
    if (!addrs?.length) return null;
    const selected = checkoutSelectedAddressId ? addrs.find(a => a.id === checkoutSelectedAddressId) : null;
    const fallback = addrs.find(a => a.isDefault) || addrs[0];
    return selected || fallback || null;
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      showToast('購物車是空的', 'error');
      return;
    }
    if (isRedirectingToPayment) return;
    const { subtotal, deliveryFee, total } = pricingData;
    const orderIdNum = Date.now();
    const orderIdDisplay = `ORD-${orderIdNum}`;
    const itemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const orderDate = new Date().toISOString().slice(0, 10);

    const lineItems: OrderLineItem[] = cart.map(item => {
      const unitPrice = getPrice(item, item.qty);
      const lineTotal = unitPrice * item.qty;
      return { product_id: item.id, name: item.name, unit_price: unitPrice, qty: item.qty, line_total: lineTotal, image: item.image ?? null };
    });

    const deliveryAddress = getCheckoutDeliveryAddress();
    if (deliveryMethod === 'home') {
      if (!deliveryAddress || !isAddressCompleteForOrder(deliveryAddress)) {
        showToast('請填寫地區、地址、樓層、單位、收件人及手機號碼', 'error');
        return;
      }
    }
    if (deliveryMethod === 'sf_locker') {
      if (!selectedLockerPoint) {
        showToast('請選擇冷運自提點', 'error');
        return;
      }
    }
    const useDraft = deliveryMethod === 'home' && checkoutAddressDraft && isAddressCompleteForOrder(checkoutAddressDraft);
    const deliveryAddr = deliveryMethod === 'sf_locker' && selectedLockerPoint
      ? formatLockerAddress(selectedLockerPoint, selectedLockerDistrict)
      : (deliveryAddress ? deliveryAddress.detail ?? null : null);
    const contactName = deliveryAddress?.contactName ?? (user?.name ?? null);
    const customerPhone = deliveryAddress?.phone ?? (user?.phoneNumber ?? null);
    const altContactName = deliveryAddress?.altContactName ?? null;
    const altContactPhone = deliveryAddress?.altPhone ?? null;
    const customerName = user?.name ?? '訪客';

    const newOrder: Order = {
      id: orderIdDisplay,
      customerName,
      total,
      status: OrderStatus.PENDING_PAYMENT,
      date: orderDate,
      items: itemsCount
    };

    const insertRow: Record<string, unknown> = {
      id: orderIdNum,
      customer_name: customerName,
      customer_phone: customerPhone,
      total,
      subtotal,
      delivery_fee: deliveryFee,
      status: OrderStatus.PENDING_PAYMENT,
      order_date: orderDate,
      items_count: itemsCount,
      line_items: lineItems,
      delivery_method: deliveryMethod,
      delivery_address: deliveryAddr,
      contact_name: contactName
      , delivery_alt_contact_name: altContactName
      , delivery_alt_contact_phone: altContactPhone
    };
    if (deliveryMethod === 'home' && deliveryAddress) {
      insertRow.delivery_district = deliveryAddress.district ?? null;
      insertRow.delivery_floor = deliveryAddress.floor ?? null;
      insertRow.delivery_flat = deliveryAddress.flat ?? null;
    }
    if (deliveryMethod === 'sf_locker' && selectedLockerPoint) {
      insertRow.locker_code = selectedLockerPoint.code;
      insertRow.delivery_district = selectedLockerDistrict;
    }

    setIsRedirectingToPayment(true);
    const apiBase = typeof window !== 'undefined' ? window.location.origin : '';
    let intentRes: Response;
    try {
      intentRes = await fetch(`${apiBase}/api/airwallex-create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, merchant_order_id: orderIdDisplay, success_origin: typeof window !== 'undefined' ? window.location.origin : '' }),
      });
    } catch {
      setIsRedirectingToPayment(false);
      showToast('Payment system is currently busy, please try again in a moment.', 'error');
      return;
    }
    if (!intentRes.ok) {
      setIsRedirectingToPayment(false);
      let errMsg = 'Payment system is currently busy, please try again in a moment.';
      try {
        const contentType = intentRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errBody = await intentRes.json() as { error?: string; details?: string; code?: string };
          if (typeof errBody?.error === 'string' && errBody.error) errMsg = errBody.error;
          // Helpful for debugging when Vercel returns upstream error text
          if (typeof errBody?.details === 'string' && errBody.details) {
            console.error('Airwallex API error details', errBody.code, errBody.details);
          } else if (typeof errBody?.code === 'string' && errBody.code) {
            console.error('Airwallex API error code', errBody.code);
          }
        } else {
          const errText = await intentRes.text();
          console.error('Airwallex API non-JSON error', intentRes.status, errText.slice(0, 500));
          if (intentRes.status === 404) {
            errMsg = 'Payment API not found. Please redeploy and ensure the Vercel Function /api/airwallex-create-intent is enabled.';
          }
        }
      } catch {
        /* use default errMsg */
      }
      showToast(errMsg, 'error');
      return;
    }
    let intentData: { intent_id?: string; client_secret?: string; currency?: string; country_code?: string };
    try {
      intentData = await intentRes.json();
    } catch {
      setIsRedirectingToPayment(false);
      showToast('Payment system is currently busy, please try again in a moment.', 'error');
      return;
    }
    const { intent_id, client_secret, currency = 'HKD', country_code = 'HK' } = intentData;
    if (!intent_id || !client_secret) {
      setIsRedirectingToPayment(false);
      showToast('Payment system is currently busy, please try again in a moment.', 'error');
      return;
    }

    const { error } = await supabase.from('orders').insert(insertRow);
    if (error) {
      setIsRedirectingToPayment(false);
      showToast(error.message || '訂單提交失敗', 'error');
      return;
    }

    if (user && useDraft && checkoutSaveNewAddressAsDefault && checkoutAddressDraft) {
      handleSaveAddress(user.id, checkoutAddressDraft, true, true);
    }

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    setShowCheckoutAddressForm(false);
    setCheckoutAddressDraft(null);
    setIsChangingAddress(false);
    showToast('訂單已提交！正在轉接支付接口...');

    const successUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/success?order=${encodeURIComponent(orderIdDisplay)}${intent_id ? `&payment_intent_id=${encodeURIComponent(intent_id)}` : ''}`
      : 'https://coolfood-app-cursor.vercel.app/success';
    try {
      if (typeof window !== 'undefined' && intent_id) {
        try { window.sessionStorage.setItem('airwallex_payment_intent_id', intent_id); } catch { /* ignore */ }
      }
      const { init, redirectToCheckout } = await import('@airwallex/components-sdk');
      const airwallexEnv = (import.meta.env.VITE_AIRWALLEX_ENV as string) || 'demo';
      if (airwallexEnv === 'demo') console.log('Airwallex Sandbox Mode Active');
      const { payments } = await init({ env: airwallexEnv as 'demo' | 'prod', enabledElements: ['payments'] });
      payments.redirectToCheckout({
        intent_id,
        client_secret,
        currency,
        country_code,
        successUrl,
        methods: ['card', 'fps'],
      });
    } catch (e) {
      setIsRedirectingToPayment(false);
      console.error('Airwallex redirectToCheckout failed', e);
      const msg = e instanceof Error ? e.message : '';
      showToast(msg ? `Payment error: ${msg}` : 'Payment system is currently busy, please try again in a moment.', 'error');
    }
  };

  // --- Admin Logic ---

  const handleGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `分析並提供 3 個提高銷量的具體策略。請用繁體中文。`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiAnalysis(response.text || 'AI 無法生成建議。');
    } catch (e) {
      setAiAnalysis('AI 離線中。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [imageUploading, setImageUploading] = useState<string | null>(null);

  const handleImageUpload = async (
    files: FileList | null,
    storagePath: string,
    onSuccess: (urls: string[]) => void,
    opts?: { multi?: boolean; uploadKey?: string }
  ) => {
    if (!files || files.length === 0) return;
    const key = opts?.uploadKey || storagePath;
    setImageUploading(key);
    try {
      if (opts?.multi) {
        const urls = await uploadImages(Array.from(files), storagePath);
        onSuccess(urls);
      } else {
        const file = files[0];
        const ext = file.type.startsWith('image/') ? 'webp' : (file.name.split('.').pop() || 'bin');
        const fullPath = `${storagePath}/main-${Date.now()}.${ext}`;
        const url = await uploadImage(file, fullPath);
        onSuccess([url]);
      }
    } catch (err: any) {
      showToast(err.message || '上傳失敗', 'error');
    } finally {
      setImageUploading(null);
    }
  };

  const downloadCSVTemplate = () => {
    const headers = ['id', 'name', 'price', 'memberPrice', 'stock', 'categories', 'trackInventory'];
    const sample = ['P-001', '澳洲M5和牛肉眼', '350', '298', '10', 'beef', 'true'];
    const csvContent = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fridge_link_product_template.csv');
    link.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const headers = lines[0].split(',').map(h => h.trim());
        const newProducts: Product[] = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const p: any = { tags: [], image: '🥩', recipes: [] };
          headers.forEach((h, i) => {
            if (h === 'categories') p[h] = values[i].split('|');
            else if (h === 'price' || h === 'memberPrice' || h === 'stock') p[h] = Number(values[i]);
            else if (h === 'trackInventory') p[h] = values[i].toLowerCase() === 'true';
            else p[h] = values[i];
          });
          return p as Product;
        });
        const success = await upsertProducts(newProducts);
        if (success) showToast(`成功批量上傳 ${newProducts.length} 個產品`);
      };
      reader.readAsText(file);
    }
  };

  const applyGlobalPricingRules = () => {
    if (!siteConfig.pricingRules) return;
    const { memberDiscountPercent, roundToNearest, excludedProductIds, excludedCategoryIds } = siteConfig.pricingRules;
    const updated = products.map(p => {
      if (excludedProductIds?.includes(p.id)) return p;
      if (excludedCategoryIds?.some(cid => p.categories.includes(cid))) return p;
      const newMemberPrice = Math.round((p.price * (1 - memberDiscountPercent / 100)) / roundToNearest) * roundToNearest;
      return { ...p, memberPrice: newMemberPrice };
    });
    setProducts(updated);
    upsertProducts(updated);
    showToast('價格規則已套用');
  };

  const filteredAdminProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(adminProductSearch.toLowerCase())
    );
  }, [products, adminProductSearch]);

  const filteredAdminOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(adminOrderSearch.toLowerCase()) || o.customerName.toLowerCase().includes(adminOrderSearch.toLowerCase());
      const matchesStatus = ordersStatusFilter === 'all' || o.status === ordersStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, adminOrderSearch, ordersStatusFilter]);

  const filteredAdminMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(adminMemberSearch.toLowerCase()) || 
      (m.email?.toLowerCase() ?? '').includes(adminMemberSearch.toLowerCase()) ||
      (m.phoneNumber && m.phoneNumber.includes(adminMemberSearch))
    );
  }, [members, adminMemberSearch]);

  // --- UI Module Handlers ---

  const renderInventoryModule = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-4 border-b border-slate-100">
        {[
          { id: 'products', label: '產品管理', icon: <Package size={16}/> },
          { id: 'categories', label: '分類設定', icon: <List size={16}/> },
          { id: 'rules', label: '價格與配送規則', icon: <Zap size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setInventorySubTab(tab.id as any)} 
            className={`pb-3 px-2 font-black text-sm uppercase transition-all relative flex items-center gap-2 ${inventorySubTab === tab.id ? 'text-slate-900' : 'text-slate-300'}`}
          >
            {tab.icon} {tab.label}
            {inventorySubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-t-full" />}
          </button>
        ))}
      </div>

      {inventorySubTab === 'products' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                value={adminProductSearch}
                onChange={e => setAdminProductSearch(e.target.value)}
                placeholder="搜索產品..." 
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold" 
              />
            </div>
            <div className="flex gap-3">
              <button onClick={downloadCSVTemplate} className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <Download size={16}/> 下載模板
              </button>
              <label className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                <Upload size={16}/> 批量上傳 CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </label>
              <button onClick={() => setEditingProduct({ id: 'P-'+Date.now(), name: '', price: 0, memberPrice: 0, stock: 0, categories: [], tags: [], image: '🥩', trackInventory: true, recipes: [] })} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
                <Plus size={16}/> 上架新產品
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">產品</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">分類</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">庫存</th>
                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAdminProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">
                        尚未有產品
                      </td>
                    </tr>
                  )}
                  {filteredAdminProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-100">
                          {isMediaUrl(p.image) ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <span className="text-xl">{p.image}</span>}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{p.name}</span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">${p.price}{p.memberPrice > 0 && p.memberPrice < p.price ? ` / 折扣: $${p.memberPrice}` : ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categories.map(cid => (
                            <span key={cid} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">
                              {categories.find(c => c.id === cid)?.name || cid}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.trackInventory ? (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black ${p.stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{p.stock} 件</span>
                        ) : (
                          <span className="text-slate-300 italic font-bold text-[10px]">無限量</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => setEditingProduct(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                        <button
                          onClick={() => setConfirmation({
                            title: '刪除產品',
                            message: `確定刪除 ${p.name} 嗎？此操作無法復原。`,
                            onConfirm: () => deleteProduct(p.id)
                          })}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </>
      )}

      {inventorySubTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800">分類列表</h3>
            <button onClick={() => setEditingCategory({ id: 'cat-'+Date.now(), name: '', icon: '🥩' })} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"><Plus size={14} className="inline mr-1"/> 新增</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.length === 0 && (
              <div className="col-span-full text-center text-slate-400 font-bold py-10">
                尚未有分類
              </div>
            )}
            {categories.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{c.icon}</div>
                  <div><p className="font-black text-slate-900">{c.name}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">{c.id}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingCategory(c)} className="p-2 text-slate-400 hover:text-blue-500"><Edit size={16}/></button>
                  <button
                    onClick={() => setConfirmation({
                      title: '刪除分類',
                      message: `確定刪除 ${c.name} 嗎？此操作無法復原。`,
                      onConfirm: () => deleteCategory(c.id)
                    })}
                    className="p-2 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inventorySubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in pb-12">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h4 className="text-lg font-black mb-4">定價管理</h4>
             <p className="text-sm text-slate-400 mb-4">會員折扣、錢包折扣與產品排除已移至獨立模組。</p>
             <button onClick={() => setAdminModule('pricing')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all">前往價錢設定</button>
           </div>
        </div>
      )}
    </div>
  );

  const renderAdminLogin = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleAdminLogin} className="w-full max-w-sm bg-white border border-slate-100 rounded-[2.5rem] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Cpu size={24} />
          </div>
          <h2 className="text-xl font-black text-slate-900">管理後台登入</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">REAR-LINK 4.2</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">帳號</label>
            <input
              value={adminLoginForm.username}
              onChange={e => setAdminLoginForm({ ...adminLoginForm, username: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm"
              placeholder="輸入帳號"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">密碼</label>
            <input
              type="password"
              value={adminLoginForm.password}
              onChange={e => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-sm"
              placeholder="輸入密碼"
            />
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all">
          登入後台
        </button>
        <button type="button" onClick={() => { window.location.hash = ''; }} className="w-full py-3 bg-white border border-slate-100 text-slate-500 rounded-2xl font-black text-xs">
          返回前台
        </button>
      </form>
    </div>
  );

  const renderAdminModuleContent = () => {
    switch (adminModule) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {[
              { label: '今日營收', value: '$12,450', icon: <DollarSign className="text-emerald-500" />, trend: '+12.5%' },
              { label: '待處理訂單', value: '24', icon: <Package className="text-amber-500" />, trend: '-2' },
              { label: '新增會員', value: '156', icon: <Users className="text-blue-500" />, trend: '+18' },
              { label: '庫存預警', value: '8', icon: <AlertTriangle className="text-rose-500" />, trend: '需補貨' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-2"><Sparkles className="text-blue-500"/> AI 經營建議</h3>
                <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl hover:bg-slate-800 disabled:opacity-50">
                  {isAnalyzing ? <RefreshCw size={16} className="animate-spin"/> : <Zap size={16}/>}
                  生成分析報告
                </button>
              </div>
              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 min-h-[100px] flex items-center justify-center">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div></div>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Gemini 正在分析實時數據...</p>
                  </div>
                ) : (
                  <div className="text-slate-600 text-sm font-bold leading-relaxed whitespace-pre-wrap">{aiAnalysis || "點擊按鈕獲取由 Gemini 3 Pro 提供的專業經營策略。"}</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'inventory': return renderInventoryModule();
      case 'orders':
        const allFilteredIds = new Set(filteredAdminOrders.map(o => o.id));
        const allSelected = filteredAdminOrders.length > 0 && filteredAdminOrders.every(o => selectedOrderIds.has(o.id));
        const toggleSelectAll = () => {
          if (allSelected) {
            setSelectedOrderIds(new Set());
          } else {
            setSelectedOrderIds(new Set(filteredAdminOrders.map(o => o.id)));
          }
        };
        const toggleSelectOrder = (id: string) => {
          setSelectedOrderIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
          });
        };
        return (
          <div className="space-y-6 animate-fade-in print:hidden">
             <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input value={adminOrderSearch} onChange={e => setAdminOrderSearch(e.target.value)} placeholder="搜索訂單編號或客戶名稱..." className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                   {['all', ...Object.values(OrderStatus)].map(s => (
                      <button key={s} onClick={() => setOrdersStatusFilter(s as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${ordersStatusFilter === s ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}>
                        {s === 'all' ? t.admin.all : getOrderStatusLabel(s, t)}
                      </button>
                   ))}
                </div>
             </div>
             <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="px-4 py-4 w-12">
                           <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 transition-colors">
                             {allSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                           </button>
                         </th>
                         <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">訂單編號</th>
                         <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">客戶</th>
                         <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">金額</th>
                         <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">狀態</th>
                         <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px]">日期</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredAdminOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold">
                            尚未有訂單
                          </td>
                        </tr>
                      )}
                      {filteredAdminOrders.map(o => (
                         <tr key={o.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedOrderIds.has(o.id) ? 'bg-blue-50/50' : ''}`} onClick={() => setInspectingOrder(o)}>
                            <td className="px-4 py-4" onClick={e => { e.stopPropagation(); toggleSelectOrder(o.id); }}>
                              {selectedOrderIds.has(o.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                            </td>
                            <td className="px-6 py-4 font-black text-blue-600">#{o.id}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{o.customerName}</td>
                            <td className="px-6 py-4 font-black text-slate-900">${o.total}</td>
                            <td className="px-6 py-4"><StatusBadge status={o.status}/></td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{o.date}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Floating Batch Action Bar */}
             {selectedOrderIds.size > 0 && (
               <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[5000] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in">
                 <span className="text-sm font-black whitespace-nowrap">已選 {selectedOrderIds.size} 筆訂單</span>
                 <div className="w-px h-8 bg-slate-700" />
                 <button
                   disabled={batchProcessing}
                   onClick={handleBatchCutoff}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                 >
                   <Scissors size={14} /> 截單
                 </button>
                 <button
                   disabled={batchProcessing}
                   onClick={handlePrintAggregateList}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                 >
                   <ClipboardList size={14} /> 總揀貨單
                 </button>
                 <button
                   disabled={batchProcessing}
                   onClick={handlePrintIndividualInvoices}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                 >
                   <Printer size={14} /> 個人清單
                 </button>
                 <button
                   disabled={batchProcessing}
                   onClick={handleBatchCallCourier}
                   className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black transition-colors disabled:opacity-50"
                 >
                   <Phone size={14} /> 呼叫順豐
                 </button>
                 <button
                   onClick={() => setSelectedOrderIds(new Set())}
                   className="ml-2 p-2 hover:bg-slate-700 rounded-xl transition-colors"
                 >
                   <X size={14} />
                 </button>
               </div>
             )}
          </div>
        );
      case 'slideshow':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <p className="text-slate-500 font-bold text-sm">首頁輪播廣告，可放圖片或影片連結</p>
                <button onClick={() => setEditingSlideshow({ id: `slide-${Date.now()}`, type: 'image', url: '', title: '', sortOrder: slideshowItems.length })} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl"><Plus size={16}/> 新增廣告</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...slideshowItems].sort((a, b) => a.sortOrder - b.sortOrder).map(s => (
                  <div key={s.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="aspect-[2.5/1] bg-slate-100 rounded-xl overflow-hidden mb-3">
                      {s.type === 'video' ? (
                        <video src={s.url} className="w-full h-full object-cover" muted />
                      ) : s.url ? (
                        <img src={s.url} alt={s.title || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32}/></div>
                      )}
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 text-sm truncate">{s.title || '（無標題）'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.type} · 順序 {s.sortOrder}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setEditingSlideshow({ ...s })} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600"><Edit size={16}/></button>
                        <button onClick={() => setConfirmation({ title: '刪除廣告', message: '確定要刪除此則廣告？', onConfirm: async () => { await deleteSlideshowItem(s.id); setConfirmation(null); } })} className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'members':
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 max-w-md w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input value={adminMemberSearch} onChange={e => setAdminMemberSearch(e.target.value)} placeholder="搜索姓名、電郵或電話..." className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold" />
                </div>
                <button onClick={() => { setEditingMember({ id: `u-${Date.now()}`, name: '', email: '', phoneNumber: '', points: 0, walletBalance: 0, tier: 'Bronze', role: 'customer', addresses: [] }); setEditingMemberPassword(''); }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl"><Plus size={16}/> 新增會員</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdminMembers.length === 0 && (
                  <div className="col-span-full text-center text-slate-400 font-bold py-10">
                    尚未有會員
                  </div>
                )}
                {filteredAdminMembers.map(m => (
                   <div key={m.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><User size={28}/></div>
                            <div><p className="font-black text-slate-900">{m.name}</p><TierBadge tier={m.tier}/></div>
                         </div>
                         <button onClick={() => { setEditingMember(m); setEditingMemberPassword(''); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={20}/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">錢包</p><p className="font-black text-slate-900">${m.walletBalance}</p></div>
                         <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">積分</p><p className="font-black text-slate-900">{m.points} pts</p></div>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-50">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Smartphone size={14}/> {m.phoneNumber ?? '—'}</div>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Mail size={14}/> {m.email ?? '—'}</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-8 animate-fade-in pb-20">
            {/* ── 定價規則卡片 ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Tag size={18}/></div><h4 className="font-black text-sm">會員折扣</h4></div>
                <p className="text-[10px] text-slate-400 font-bold">登入會員後，在售價/折扣價基礎上自動減價</p>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="50" step="1" value={siteConfig.pricingRules?.memberDiscountPercent || ''} onChange={e => setSiteConfig({...siteConfig, pricingRules: {...siteConfig.pricingRules!, memberDiscountPercent: Number(e.target.value) || 0}})} placeholder="0" className="flex-1 p-4 bg-slate-50 rounded-2xl font-black text-xl text-center border border-slate-100 focus:ring-2 focus:ring-blue-100" />
                  <span className="text-2xl font-black text-slate-300">%</span>
                </div>
                <p className="text-[9px] text-slate-300 font-bold">填 0 或留空 = 會員不額外減價</p>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2"><div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={18}/></div><h4 className="font-black text-sm">錢包折扣</h4></div>
                <p className="text-[10px] text-slate-400 font-bold">使用預付錢包餘額付款時，在會員價基礎上再減</p>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="50" step="1" value={siteConfig.pricingRules?.walletDiscountPercent || ''} onChange={e => setSiteConfig({...siteConfig, pricingRules: {...siteConfig.pricingRules!, walletDiscountPercent: Number(e.target.value) || 0}})} placeholder="0" className="flex-1 p-4 bg-slate-50 rounded-2xl font-black text-xl text-center border border-slate-100 focus:ring-2 focus:ring-purple-100" />
                  <span className="text-2xl font-black text-slate-300">%</span>
                </div>
                <p className="text-[9px] text-slate-300 font-bold">疊加在會員折扣之上，填 0 = 不額外減</p>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2"><div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Zap size={18}/></div><h4 className="font-black text-sm">定價預覽</h4></div>
                <p className="text-[10px] text-slate-400 font-bold">以 $100 售價為例</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl"><span className="text-slate-500 font-bold">🛒 訪客</span><span className="font-black text-slate-900">$100</span></div>
                  <div className="flex justify-between items-center p-2.5 bg-blue-50 rounded-xl"><span className="text-blue-600 font-bold">👤 會員</span><span className="font-black text-blue-700">${Math.round(100 * (1 - (siteConfig.pricingRules?.memberDiscountPercent || 0) / 100))}</span></div>
                  <div className="flex justify-between items-center p-2.5 bg-purple-50 rounded-xl"><span className="text-purple-600 font-bold">💳 錢包</span><span className="font-black text-purple-700">${Math.round(100 * (1 - (siteConfig.pricingRules?.memberDiscountPercent || 0) / 100) * (1 - (siteConfig.pricingRules?.walletDiscountPercent || 0) / 100))}</span></div>
                </div>
              </div>
            </div>

            {/* ── 全產品定價矩陣 ── */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><ClipboardList size={18}/></div><h4 className="font-black text-lg">全產品定價一覽</h4></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const allIds = products.map(p => p.id);
                    const current = siteConfig.pricingRules?.excludedProductIds || [];
                    if (current.length === 0) {
                      setSiteConfig({...siteConfig, pricingRules: {...siteConfig.pricingRules!, excludedProductIds: allIds}});
                      showToast('已排除全部產品');
                    } else {
                      setSiteConfig({...siteConfig, pricingRules: {...siteConfig.pricingRules!, excludedProductIds: []}});
                      showToast('已對全部產品實行折扣');
                    }
                  }} className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-colors">
                    {(siteConfig.pricingRules?.excludedProductIds?.length || 0) > 0 ? '✓ 全部實行' : '✗ 全部排除'}
                  </button>
                  <button onClick={async () => {
                    try {
                      // TODO: Persist pricingRules to Supabase (e.g. a site_config table)
                      showToast('定價規則已儲存（前端生效中）');
                    } catch (err: any) {
                      showToast(`儲存失敗：${err.message}`, 'error');
                    }
                  }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center gap-1.5"><Save size={14}/> 儲存</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="text-left px-6 py-3 w-10">參與</th>
                      <th className="text-left px-4 py-3">產品</th>
                      <th className="text-right px-4 py-3">售價</th>
                      <th className="text-right px-4 py-3">折扣價</th>
                      <th className="text-right px-4 py-3 text-blue-500">會員價</th>
                      <th className="text-right px-4 py-3 text-purple-500">錢包價</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map(p => {
                      const excluded = siteConfig.pricingRules?.excludedProductIds?.includes(p.id) || false;
                      const hasDiscount = p.memberPrice > 0 && p.memberPrice < p.price;
                      const base = hasDiscount ? p.memberPrice : p.price;
                      const mPct = siteConfig.pricingRules?.memberDiscountPercent || 0;
                      const wPct = siteConfig.pricingRules?.walletDiscountPercent || 0;
                      const memberP = excluded ? base : Math.round(base * (1 - mPct / 100));
                      const walletP = excluded ? base : Math.round(base * (1 - mPct / 100) * (1 - wPct / 100));
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${excluded ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-3">
                            <button onClick={() => {
                              const ids = siteConfig.pricingRules?.excludedProductIds || [];
                              const newIds = excluded ? ids.filter(x => x !== p.id) : [...ids, p.id];
                              setSiteConfig({...siteConfig, pricingRules: {...siteConfig.pricingRules!, excludedProductIds: newIds}});
                            }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${excluded ? 'border-slate-200 bg-white' : 'border-emerald-500 bg-emerald-500 text-white'}`}>
                              {!excluded && <Check size={12} strokeWidth={3}/>}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-base overflow-hidden flex-shrink-0 border border-slate-100">
                                {isMediaUrl(p.image) ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <span className="text-sm">{p.image || '📦'}</span>}
                              </div>
                              <span className="font-bold text-slate-700">{p.name}</span>
                            </div>
                          </td>
                          <td className="text-right px-4 py-3 font-bold text-slate-900">${p.price}</td>
                          <td className="text-right px-4 py-3">
                            {hasDiscount ? <span className="font-black text-rose-500">${p.memberPrice}</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="text-right px-4 py-3">
                            {!excluded && mPct > 0 ? <span className="font-black text-blue-600">${memberP}</span> : <span className="text-slate-300">{excluded ? '排除' : `$${base}`}</span>}
                          </td>
                          <td className="text-right px-4 py-3">
                            {!excluded && (mPct > 0 || wPct > 0) ? <span className="font-black text-purple-600">${walletP}</span> : <span className="text-slate-300">{excluded ? '排除' : `$${base}`}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in pb-20">
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Globe size={20}/></div><h3 className="text-xl font-black">基本資訊</h3></div>
                <div className="space-y-6">
                   <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 ml-4 uppercase">商店名稱</label><input value={siteConfig.logoText} onChange={e => setSiteConfig({...siteConfig, logoText: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" /></div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 ml-4 uppercase">商店 Logo</label>
                     <div className="flex items-center gap-4">
                       <label className={`relative w-20 h-20 rounded-2xl border-2 border-dashed ${imageUploading === 'logo' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group flex-shrink-0`}>
                         {imageUploading === 'logo' ? (
                           <RefreshCw size={20} className="text-blue-500 animate-spin" />
                         ) : isMediaUrl(siteConfig.logoUrl) ? (
                           <>
                             <img src={siteConfig.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload size={16} className="text-white" /></div>
                           </>
                         ) : siteConfig.logoIcon ? (
                           <span className="text-3xl">{siteConfig.logoIcon}</span>
                         ) : (
                           <div className="text-center"><Upload size={16} className="mx-auto text-slate-300 mb-0.5" /><span className="text-[8px] text-slate-400 font-bold">上傳</span></div>
                         )}
                         <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files, 'branding', async ([url]) => { if (isMediaUrl(siteConfig.logoUrl)) await deleteImage(siteConfig.logoUrl!); setSiteConfig({...siteConfig, logoUrl: url}); }, { uploadKey: 'logo' })} />
                       </label>
                       <div className="flex-1 space-y-1.5">
                         <input value={siteConfig.logoIcon} onChange={e => setSiteConfig({...siteConfig, logoIcon: e.target.value})} className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-sm" placeholder="備用 Emoji 圖標（如 ❄️）" />
                         <p className="text-[9px] text-slate-400 font-bold ml-1">上傳 Logo 圖片（用於網站標題、瀏覽器圖標、SEO）。Emoji 為備用顯示。</p>
                       </div>
                     </div>
                   </div>
                </div>
             </div>
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3"><div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Percent size={20}/></div><h3 className="text-xl font-black">定價管理</h3></div>
                <p className="text-sm text-slate-400 font-bold">會員折扣、錢包折扣、產品級別排除等定價設定已移至獨立模組。</p>
                <button onClick={() => setAdminModule('pricing')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><DollarSign size={16}/> 前往價錢設定</button>
             </div>
             {/* ── 運費設置卡片 ── */}
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 lg:col-span-2">
                <div className="flex items-center gap-3"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck size={20}/></div><h3 className="text-xl font-black">運費設置</h3></div>
                <p className="text-xs text-slate-400 font-bold -mt-4">在此設定每種配送方式的運費及免運門檻，切勿在程式碼中寫死數字。</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(['sf_delivery', 'sf_locker'] as const).map(key => {
                    const sc = shippingConfigs[key] || SHIPPING_FALLBACKS[key];
                    return (
                      <div key={key} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-5">
                        <h4 className="font-black text-sm text-slate-700">{sc.label}</h4>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">運費 (HKD)</label>
                          <input type="number" min="0" step="1" value={sc.fee} onChange={e => setShippingConfigs(prev => ({ ...prev, [key]: { ...prev[key], fee: Number(e.target.value) } }))} className="w-full p-4 bg-white rounded-2xl font-bold border border-slate-100 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-200 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">免運門檻 (HKD)</label>
                          <input type="number" min="0" step="1" value={sc.threshold} onChange={e => setShippingConfigs(prev => ({ ...prev, [key]: { ...prev[key], threshold: Number(e.target.value) } }))} className="w-full p-4 bg-white rounded-2xl font-bold border border-slate-100 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-200 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={async () => {
                  try {
                    const entries = Object.values(shippingConfigs);
                    for (const sc of entries) {
                      const { error } = await supabase.from('shipping_configs').upsert({ id: sc.id, label: sc.label, fee: sc.fee, threshold: sc.threshold, updated_at: new Date().toISOString() });
                      if (error) throw error;
                    }
                    showToast('運費設置已儲存');
                  } catch (err: any) {
                    showToast(`儲存失敗：${err.message}`, 'error');
                  }
                }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={16}/> 儲存運費設置</button>
             </div>
             {/* ── 湊單推薦產品管理 ── */}
             <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 lg:col-span-2">
                <div className="flex items-center gap-3"><div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Zap size={20}/></div><h3 className="text-xl font-black">湊單推薦產品</h3></div>
                <p className="text-xs text-slate-400 font-bold -mt-4">挑選 2-3 個產品作為「差少少就免運」的推薦項目，會在結帳頁面顯示。</p>
                {/* 已選產品列表 */}
                {upsellProductIds.length > 0 && (
                  <div className="space-y-2">
                    {upsellProductIds.map(pid => {
                      const p = products.find(x => x.id === pid);
                      return (
                        <div key={pid} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                              {isMediaUrl(p?.image) ? <img src={p!.image} className="w-full h-full object-cover" alt="" /> : <span>{p?.image || '📦'}</span>}
                            </div>
                            <div className="min-w-0"><p className="text-sm font-black text-slate-700 truncate">{p?.name || pid}</p><p className="text-[10px] text-slate-400 font-bold">${p?.price ?? '?'}</p></div>
                          </div>
                          <button onClick={() => setUpsellProductIds(prev => prev.filter(x => x !== pid))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* 新增產品下拉 */}
                {upsellProductIds.length < 5 && (
                  <select
                    value=""
                    onChange={e => { if (e.target.value) setUpsellProductIds(prev => [...prev, e.target.value]); }}
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-100 focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all"
                  >
                    <option value="">＋ 新增推薦產品...</option>
                    {products.filter(p => !upsellProductIds.includes(p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
                    ))}
                  </select>
                )}
                <button onClick={async () => {
                  try {
                    // 先清除舊資料，再插入新選擇
                    await supabase.from('upsell_configs').delete().neq('id', '');
                    if (upsellProductIds.length > 0) {
                      const rows = upsellProductIds.map(pid => ({ product_id: pid, is_active: true }));
                      const { error } = await supabase.from('upsell_configs').insert(rows);
                      if (error) throw error;
                    }
                    showToast('湊單推薦已儲存');
                  } catch (err: any) {
                    showToast(`儲存失敗：${err.message}`, 'error');
                  }
                }} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={16}/> 儲存湊單推薦</button>
             </div>
          </div>
        );
      default: return null;
    }
  };

  const renderGlobalModals = () => (
    <>
      {/* ── 一鍵回購 Modal（訪客輸入手機號碼）── */}
      {reorderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[5500] flex items-center justify-center p-6 animate-fade-in" onClick={() => setReorderModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-7 space-y-4 animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><Clock size={18} className="text-amber-500" /><h3 className="text-base font-black text-slate-900">一鍵回購</h3></div>
              <button onClick={() => setReorderModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 active:scale-90"><X size={16}/></button>
            </div>
            <p className="text-[11px] text-slate-400 font-bold">輸入上次落單用嘅手機號碼，即刻幫你填返成份清單。</p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="手機號碼（如 91234567）"
              value={reorderPhone}
              onChange={e => handleReorderPhoneCheck(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100 focus:ring-2 focus:ring-amber-100 focus:border-amber-200 transition-all"
              autoFocus
            />
            {/* 動態提示 */}
            {reorderHint.text && (
              <div className="px-1">
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">{reorderHint.text}</p>
                {reorderHint.type === 'member' && (
                  <button onClick={() => { setReorderModalOpen(false); setView('profile'); }} className="text-[11px] text-blue-500 font-black mt-1 hover:underline">立即登入 →</button>
                )}
              </div>
            )}
            <button
              disabled={reorderPhone.length < 6 || reorderLoading}
              onClick={() => handleReorderByPhone(reorderPhone)}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {reorderLoading ? <RefreshCw size={16} className="animate-spin" /> : <Clock size={16}/>}
              {reorderLoading ? '查詢中...' : '搵返上次嘅清單'}
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[5500] flex items-end justify-center animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-md rounded-t-[3rem] shadow-2xl p-8 space-y-6 animate-slide-up overflow-y-auto max-h-[90vh] hide-scrollbar" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start">
               <div className="w-32 h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center text-6xl border border-slate-100 overflow-hidden">
                  {isMediaUrl(selectedProduct.image) ? <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} /> : selectedProduct.image}
               </div>
               <button onClick={() => setSelectedProduct(null)} className="p-3 bg-slate-100 rounded-full text-slate-400 active:scale-90 transition-transform"><X size={20}/></button>
             </div>
             {selectedProduct.gallery && selectedProduct.gallery.length > 0 && (
               <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mt-2">
                 {selectedProduct.gallery.map((url, i) => (
                   <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                     <img src={url} alt="" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
             )}
             <div className="space-y-2">
               <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h3>
               <div className="flex flex-wrap gap-2">
                 {selectedProduct.tags.map(t => <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-tight">{t}</span>)}
               </div>
             </div>
             <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl">
               <div><p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">精選價</p><p className="text-3xl font-black">${selectedProduct.price}</p></div>
               <button onClick={() => { updateCart(selectedProduct, 1); setSelectedProduct(null); showToast('已加入購物車'); }} className={`${accentClass} text-white px-10 py-5 rounded-[1.5rem] font-black text-sm shadow-2xl active:scale-95 transition-all`}>立即選購</button>
             </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Package size={22}/></div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">編輯產品</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{editingProduct.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6 hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">名稱</label>
                  <input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">商品 ID</label>
                  <input value={editingProduct.id} onChange={e => setEditingProduct({ ...editingProduct, id: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">價格</label>
                  <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">折扣價 (留空或 0 = 不設折扣)</label>
  <input type="number" min="0" value={editingProduct.memberPrice || ''} onChange={e => setEditingProduct({ ...editingProduct, memberPrice: Number(e.target.value) || 0 })} placeholder="留空 = 不設折扣" className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">庫存</label>
                  <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">是否追蹤庫存</label>
                  <select value={editingProduct.trackInventory ? 'true' : 'false'} onChange={e => setEditingProduct({ ...editingProduct, trackInventory: e.target.value === 'true' })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold">
                    <option value="true">是</option>
                    <option value="false">否</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分類 (逗號分隔)</label>
                  <input value={editingProduct.categories.join(',')} onChange={e => setEditingProduct({ ...editingProduct, categories: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">標籤 (逗號分隔)</label>
                  <input value={editingProduct.tags.join(',')} onChange={e => setEditingProduct({ ...editingProduct, tags: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">產品圖片</label>
                  <div className="flex items-start gap-4">
                    <label className={`relative flex-shrink-0 w-28 h-28 rounded-2xl border-2 border-dashed ${imageUploading === `product-${editingProduct.id}` ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group`}>
                      {imageUploading === `product-${editingProduct.id}` ? (
                        <RefreshCw size={22} className="text-blue-500 animate-spin" />
                      ) : isMediaUrl(editingProduct.image) ? (
                        <img src={editingProduct.image} alt="" className="w-full h-full object-cover" />
                      ) : editingProduct.image ? (
                        <span className="text-4xl">{editingProduct.image}</span>
                      ) : (
                        <div className="text-center"><Upload size={20} className="mx-auto text-slate-300 mb-1" /><span className="text-[9px] text-slate-400 font-bold">上傳圖片</span></div>
                      )}
                      {isMediaUrl(editingProduct.image) && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload size={18} className="text-white" /></div>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files, `products/${editingProduct.id}`, async ([url]) => { if (isMediaUrl(editingProduct.image)) await deleteImage(editingProduct.image); setEditingProduct({ ...editingProduct, image: url }); }, { uploadKey: `product-${editingProduct.id}` })} />
                    </label>
                    <div className="flex-1 space-y-2">
                      <input value={editingProduct.image} onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-xs" placeholder="或貼上圖片 URL / Emoji" />
                      <p className="text-[9px] text-slate-400 font-bold">點擊左方上傳圖片，或直接輸入 URL / Emoji</p>
                    </div>
                  </div>
                </div>
                {/* ── 產品相簿 (Gallery) ── */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">產品相簿（最多 10 張）</label>
                  <div className="flex gap-2 flex-wrap">
                    {(editingProduct.gallery || []).map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={async () => {
                          await deleteImage(url);
                          setEditingProduct({ ...editingProduct, gallery: (editingProduct.gallery || []).filter((_, i) => i !== idx) });
                        }} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="text-white" /></button>
                      </div>
                    ))}
                    {(editingProduct.gallery || []).length < 10 && (
                      <label className={`w-20 h-20 rounded-xl border-2 border-dashed ${imageUploading === `gallery-${editingProduct.id}` ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all`}>
                        {imageUploading === `gallery-${editingProduct.id}` ? <RefreshCw size={16} className="text-blue-500 animate-spin" /> : <Plus size={18} className="text-slate-300" />}
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files, `products/${editingProduct.id}/gallery`, (urls) => {
                          const current = editingProduct.gallery || [];
                          const merged = [...current, ...urls].slice(0, 10);
                          setEditingProduct({ ...editingProduct, gallery: merged });
                        }, { multi: true, uploadKey: `gallery-${editingProduct.id}` })} />
                      </label>
                    )}
                  </div>
                  {(editingProduct.gallery || []).length > 0 && <p className="text-[9px] text-slate-400 font-bold">{(editingProduct.gallery || []).length}/10 張 · 懸浮圖片可刪除</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">商品描述</label>
                  <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold min-h-[100px]" />
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              <button onClick={() => {
                if (!editingProduct.name.trim()) { showToast('請輸入產品名稱', 'error'); return; }
                upsertProduct(editingProduct);
                setEditingProduct(null);
              }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">保存</button>
            </div>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><List size={20}/></div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">編輯分類</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{editingCategory.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingCategory(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
            </div>
            <div className="p-10 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分類 ID</label>
                <input value={editingCategory.id} onChange={e => setEditingCategory({ ...editingCategory, id: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分類名稱</label>
                <input value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">圖示</label>
                <input value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingCategory(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              <button onClick={() => {
                if (!editingCategory.name.trim()) { showToast('請輸入分類名稱', 'error'); return; }
                upsertCategory(editingCategory);
                setEditingCategory(null);
              }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">保存</button>
            </div>
          </div>
        </div>
      )}

      {editingSlideshow && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><ImageIcon size={20}/></div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">編輯廣告</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{editingSlideshow.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingSlideshow(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
            </div>
            <div className="p-10 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">類型</label>
                <select value={editingSlideshow.type} onChange={e => setEditingSlideshow({ ...editingSlideshow, type: e.target.value as 'image' | 'video' })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold">
                  <option value="image">圖片</option>
                  <option value="video">影片</option>
                </select>
              </div>
              {editingSlideshow.type === 'image' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">廣告圖片</label>
                  <label className={`relative block w-full aspect-[2.5/1] rounded-2xl border-2 border-dashed ${imageUploading === `slide-${editingSlideshow.id}` ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'} flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group`}>
                    {imageUploading === `slide-${editingSlideshow.id}` ? (
                      <div className="flex flex-col items-center gap-2"><RefreshCw size={24} className="text-blue-500 animate-spin" /><span className="text-xs text-blue-500 font-bold">上傳中...</span></div>
                    ) : isMediaUrl(editingSlideshow.url) ? (
                      <>
                        <img src={editingSlideshow.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><Upload size={20} className="text-white" /><span className="text-white font-bold text-sm">更換圖片</span></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300"><Upload size={28} /><span className="text-xs font-bold">點擊上傳廣告圖片</span></div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files, `slideshow/${editingSlideshow.id}`, async ([url]) => { if (isMediaUrl(editingSlideshow.url)) await deleteImage(editingSlideshow.url); setEditingSlideshow({ ...editingSlideshow, url }); }, { uploadKey: `slide-${editingSlideshow.id}` })} />
                  </label>
                  <input value={editingSlideshow.url} onChange={e => setEditingSlideshow({ ...editingSlideshow, url: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-xs" placeholder="或貼上圖片 URL" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">影片連結 URL</label>
                  <input value={editingSlideshow.url} onChange={e => setEditingSlideshow({ ...editingSlideshow, url: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="https://..." />
                  {editingSlideshow.url && <video src={editingSlideshow.url} className="w-full aspect-[2.5/1] rounded-xl object-cover bg-slate-100 mt-2" muted controls />}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">標題（選填）</label>
                <input value={editingSlideshow.title || ''} onChange={e => setEditingSlideshow({ ...editingSlideshow, title: e.target.value || undefined })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="廣告標題" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">順序 (數字越小越前)</label>
                <input type="number" value={editingSlideshow.sortOrder} onChange={e => setEditingSlideshow({ ...editingSlideshow, sortOrder: Number(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditingSlideshow(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              <button onClick={() => {
                if (!editingSlideshow.url.trim()) { showToast('請輸入連結', 'error'); return; }
                upsertSlideshowItem(editingSlideshow);
                setEditingSlideshow(null);
              }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">保存</button>
            </div>
          </div>
        </div>
      )}

      {addressEditor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><MapPin size={20}/></div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">{addressEditor.isNew ? '新增地址' : '編輯地址'}</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{addressEditor.address.id}</p>
                </div>
              </div>
              <button onClick={() => setAddressEditor(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
            </div>
            <div className="p-10 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">標籤</label>
                <input value={addressEditor.address.label} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, label: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="如：屋企、公司" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">地區 *</label>
                <select value={addressEditor.address.district ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, district: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold">
                  <option value="">請選擇地區</option>
                  {HK_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">地址 *</label>
                <input value={addressEditor.address.detail ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, detail: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="街道／門牌／村屋等" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">樓層 *</label>
                  <input value={addressEditor.address.floor ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, floor: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="如：3" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">室／單位 *</label>
                  <input value={addressEditor.address.flat ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, flat: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="如：B" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">收件人名稱 *</label>
                  <input value={addressEditor.address.contactName} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, contactName: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">手機號碼 *</label>
                  <input type="tel" value={addressEditor.address.phone} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, phone: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">後備收件人</label>
                  <input value={addressEditor.address.altContactName ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, altContactName: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">後備收件人手機號碼</label>
                  <input type="tel" value={addressEditor.address.altPhone ?? ''} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, altPhone: e.target.value } })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <input type="checkbox" checked={addressEditor.address.isDefault} onChange={e => setAddressEditor({ ...addressEditor, address: { ...addressEditor.address, isDefault: e.target.checked } })} />
                設為預設地址
              </label>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setAddressEditor(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              <button onClick={() => {
                if (!isAddressCompleteForOrder(addressEditor.address)) { showToast('請填寫地區、地址、樓層、單位、收件人及手機號碼', 'error'); return; }
                handleSaveAddress(addressEditor.ownerId, addressEditor.address, addressEditor.isNew);
              }} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">保存</button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-scale-up">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white flex-shrink-0">
                   <div className="flex items-center gap-5"><div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-white shadow-inner"><UserCheck size={28}/></div><div><h4 className="text-2xl font-black tracking-tight">調整會員帳戶</h4><p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">編輯: {editingMember.id}</p></div></div>
                   <button onClick={() => { setEditingMember(null); setEditingMemberPassword(''); }} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-12 space-y-12 hide-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2 text-blue-600 font-black uppercase tracking-widest text-xs">基本資料</div>
                         <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-4">
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">姓名</label><input value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full p-3 bg-white rounded-2xl font-bold border border-slate-100" placeholder="姓名" /></div>
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話</label><input type="tel" value={editingMember.phoneNumber || ''} onChange={e => setEditingMember({...editingMember, phoneNumber: e.target.value || undefined})} className="w-full p-3 bg-white rounded-2xl font-bold border border-slate-100" placeholder="電話" /></div>
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電郵（選填）</label><input type="email" value={editingMember.email ?? ''} onChange={e => setEditingMember({...editingMember, email: e.target.value || undefined})} className="w-full p-3 bg-white rounded-2xl font-bold border border-slate-100" placeholder="email@example.com" /></div>
                            <div><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">密碼（留空不更改；新會員請填）</label><input type="password" value={editingMemberPassword} onChange={e => setEditingMemberPassword(e.target.value)} className="w-full p-3 bg-white rounded-2xl font-bold border border-slate-100" placeholder="密碼" minLength={6} /></div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 mb-2 text-blue-600 font-black uppercase tracking-widest text-xs"><Wallet size={18}/> 錢包管理</div>
                         <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-6">
                            <div className="text-center"><p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">當前餘額</p><p className="text-4xl font-black text-slate-900">${editingMember.walletBalance}</p></div>
                            <div className="grid grid-cols-3 gap-2">
                               {[100, 500, -100].map(val => (
                                  <button key={val} onClick={() => { setEditingMember({...editingMember, walletBalance: editingMember.walletBalance + val}); }} className="py-3 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase shadow-sm">{val > 0 ? `+${val}` : val}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end flex-shrink-0">
                   <button onClick={async () => {
                     if (!editingMember.name.trim()) { showToast('請輸入姓名', 'error'); return; }
                     if (!editingMember.phoneNumber?.trim()) { showToast('請輸入電話', 'error'); return; }
                     const isNew = !members.some(m => m.id === editingMember.id);
                     if (isNew && !editingMemberPassword) { showToast('新會員請設定密碼（至少 6 字）', 'error'); return; }
                     if (editingMemberPassword && editingMemberPassword.length < 6) { showToast('密碼至少 6 個字元', 'error'); return; }
                     const hash = editingMemberPassword ? await hashPassword(editingMemberPassword) : undefined;
                     await upsertMember(editingMember, hash);
                     setEditingMember(null);
                     setEditingMemberPassword('');
                     showToast('資料已保存');
                   }} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 flex items-center gap-2"><Save size={16}/> 保存並關閉</button>
                </div>
             </div>
          </div>
      )}

      {inspectingOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6000] flex items-center justify-center p-6 animate-fade-in">
             <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-900 text-white">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-white shadow-inner"><Package size={28}/></div>
                      <div><h4 className="text-2xl font-black tracking-tight">{inspectingOrder.id}</h4><p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{inspectingOrder.date} • 下單完成</p></div>
                   </div>
                   <button onClick={() => setInspectingOrder(null)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-white hide-scrollbar">
                  {!inspectingOrderDetails ? (
                    <div className="text-center text-slate-400 font-bold">載入中...</div>
                  ) : (
                    <>
                      {/* 1. 商品明細 — 最高 */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">商品明細</p>
                        <div className="space-y-3">
                          {(inspectingOrderDetails.line_items || []).length === 0 && (
                            <p className="text-xs text-slate-400 font-bold">沒有商品明細</p>
                          )}
                          {(inspectingOrderDetails.line_items || []).map(item => (
                            <div key={`${item.product_id}-${item.name}`} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">無圖</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span>{item.name} x {item.qty}</span>
                              </div>
                              <span className="flex-shrink-0">${item.line_total}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. 配送方式及聯絡人 — 合在一起，地址只顯示一次 */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">配送方式及聯絡人</p>
                        <p className="text-sm font-bold text-slate-900">{inspectingOrderDetails.delivery_method || '未設定'}</p>
                        {(inspectingOrderDetails.delivery_district || inspectingOrderDetails.delivery_address) ? (
                          <p className="text-xs text-slate-600 font-bold">
                            {[inspectingOrderDetails.delivery_district, inspectingOrderDetails.delivery_address].filter(Boolean).join(' · ') +
                              ((inspectingOrderDetails.delivery_floor || inspectingOrderDetails.delivery_flat)
                                ? ` · ${inspectingOrderDetails.delivery_floor || ''}${inspectingOrderDetails.delivery_floor ? '樓' : ''}${inspectingOrderDetails.delivery_flat ? (inspectingOrderDetails.delivery_floor ? ' ' : '') + inspectingOrderDetails.delivery_flat + '室' : ''}`
                                : '')}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 font-bold">未提供地址</p>
                        )}
                        <p className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">聯絡人：{inspectingOrderDetails.contact_name || '未提供'}</p>
                      </div>

                      {/* 3. 金額明細 */}
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">金額明細</p>
                        <p className="text-sm font-bold text-slate-900">小計 ${inspectingOrderDetails.subtotal ?? inspectingOrder.total}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">運費 ${inspectingOrderDetails.delivery_fee ?? 0}</p>
                        <p className="text-xs text-slate-700 font-black mt-1">總計 ${inspectingOrderDetails.total}</p>
                      </div>

                      {/* 4. 客戶 */}
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">客戶</p>
                        <p className="text-sm font-bold text-slate-900">{inspectingOrderDetails.customer_name}</p>
                        <p className="text-xs text-slate-500 font-bold mt-1">{inspectingOrderDetails.customer_phone || '未提供電話'}</p>
                      </div>

                      {/* 5. 物流資訊 */}
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">物流資訊</p>
                        <p className="text-xs font-bold text-slate-700">物流公司：順豐速運</p>
                        <p className="text-xs font-bold text-slate-700">物流狀態：{getOrderStatusLabel(inspectingOrderDetails.status)}</p>
                        <p className="text-xs font-bold text-slate-700">單號：{inspectingOrderDetails.waybill_no ?? inspectingOrderDetails.tracking_number ?? '未提供'}</p>
                        <p className="text-[10px] text-slate-500 font-bold">最後更新：{inspectingOrderDetails.order_date}</p>
                      </div>

                      {isAdminRoute && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">訂單狀態</label>
                            <select value={orderStatusDraft || inspectingOrder.status} onChange={e => setOrderStatusDraft(e.target.value as OrderStatus)} className="w-full p-3 bg-slate-50 rounded-2xl font-bold">
                              {Object.values(OrderStatus).map(s => (<option key={s} value={s}>{getOrderStatusLabel(s)}</option>))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">物流編號</label>
                            <input value={trackingDraft} onChange={e => setTrackingDraft(e.target.value)} className="w-full p-3 bg-slate-50 rounded-2xl font-bold" placeholder="輸入物流編號" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => setInspectingOrder(null)} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">關閉</button>
                  {isAdminRoute && (
                    <button onClick={() => updateOrderFields(inspectingOrder.id, { status: orderStatusDraft || inspectingOrder.status, waybill_no: trackingDraft || null })} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">更新訂單</button>
                  )}
                </div>
             </div>
          </div>
      )}

      {/* SF Validation Modal — 呼叫順豐前的地址驗證 */}
      {sfValidationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6500] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={20} />
              <h4 className="text-lg font-black text-slate-900">地址驗證結果</h4>
            </div>
            {sfValidationModal.problematic.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-600">以下訂單資料不完整，將被跳過：</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {sfValidationModal.problematic.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <AlertTriangle className="text-amber-500 flex-shrink-0" size={14} />
                      <div>
                        <span className="text-sm font-black text-slate-900">訂單 #{p.id}</span>
                        <span className="text-xs font-bold text-amber-700 ml-2">{p.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sfValidationModal.valid.length > 0 && (
              <p className="text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl p-3">
                可處理的訂單：{sfValidationModal.valid.length} 筆
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setSfValidationModal(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              {sfValidationModal.valid.length > 0 && (
                <button
                  disabled={batchProcessing}
                  onClick={() => executeSfCalls(sfValidationModal.valid)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs disabled:opacity-50"
                >
                  {batchProcessing ? '處理中...' : `繼續處理 ${sfValidationModal.valid.length} 筆`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[6500] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-rose-500" size={20} />
              <h4 className="text-lg font-black text-slate-900">{confirmation.title}</h4>
            </div>
            <p className="text-sm text-slate-600 font-bold leading-relaxed">{confirmation.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmation(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs">取消</button>
              <button onClick={() => { confirmation.onConfirm(); setConfirmation(null); }} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs">確認</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── 免運進度提示元件（雙門檻：自提櫃 / 送貨上門）──
  const FreeShippingNudge = ({ compact = false }: { compact?: boolean }) => {
    const { subtotal, lockerThreshold, deliveryThreshold } = pricingData;

    // 三段式狀態判斷
    const tier: 'below_locker' | 'between' | 'all_free' =
      subtotal < lockerThreshold ? 'below_locker' :
      subtotal < deliveryThreshold ? 'between' : 'all_free';

    // 進度條：以最高門檻為 100%
    const progress = Math.min(1, subtotal / (deliveryThreshold || 1));
    // 中間刻度位置
    const lockerMark = deliveryThreshold > 0 ? (lockerThreshold / deliveryThreshold) * 100 : 50;

    // 進度條顏色
    const barColor = tier === 'all_free'
      ? 'bg-emerald-400'
      : tier === 'between'
      ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
      : 'bg-gradient-to-r from-orange-400 to-amber-400';

    if (compact) {
      // 簡約版：嵌入購物車按鈕
      const label = tier === 'all_free'
        ? '✓ 全場免運'
        : tier === 'between'
        ? `自提免運！差$${Math.ceil(deliveryThreshold - subtotal)}上門免運`
        : `差$${Math.ceil(lockerThreshold - subtotal)}自提免運`;
      const textColor = tier === 'all_free' ? 'text-emerald-400' : tier === 'between' ? 'text-teal-300' : 'text-orange-300';

      return (
        <div className="px-1">
          <div className="flex items-center gap-2">
            <p className={`text-[9px] font-bold ${textColor} whitespace-nowrap`}>{label}</p>
            {tier !== 'all_free' && (
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden min-w-[32px] relative">
                <div className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress * 100}%` }} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // 完整版：用於結帳金額明細區
    const bgClass = tier === 'all_free' ? 'bg-emerald-500/10' : tier === 'between' ? 'bg-teal-500/10' : 'bg-orange-500/10';

    return (
      <div className={`px-3 py-2.5 rounded-xl ${bgClass} transition-all`}>
        {tier === 'all_free' ? (
          <p className="text-[11px] font-black text-emerald-400 text-center">🎉 已享有全場免運費優惠！</p>
        ) : (
          <div className="space-y-2">
            <p className={`text-[11px] font-bold text-center ${tier === 'between' ? 'text-teal-300' : 'text-orange-300'}`}>
              {tier === 'between'
                ? <>自提櫃已免運！再買 <span className="font-black">${Math.ceil(deliveryThreshold - subtotal)}</span> 即享送貨上門免運 🏠</>
                : <>仲差 <span className="font-black">${Math.ceil(lockerThreshold - subtotal)}</span> 享自提櫃免運 📦</>
              }
            </p>
            {/* 雙門檻進度條 */}
            <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-visible">
              <div className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`} style={{ width: `${progress * 100}%` }} />
              {/* $200 刻度線 */}
              <div className="absolute top-0 h-full w-px bg-white/20" style={{ left: `${lockerMark}%` }} />
            </div>
            <div className="relative w-full h-3 text-[8px] text-white/25 font-bold">
              <span className="absolute left-0">$0</span>
              <span className="absolute" style={{ left: `${lockerMark}%`, transform: 'translateX(-50%)' }}>📦${lockerThreshold}</span>
              <span className="absolute right-0">🏠${deliveryThreshold}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── 一鍵湊免運推薦區塊 ──
  const UpsellNudge = () => {
    const { subtotal, shippingThreshold, deliveryFee } = pricingData;
    const diff = shippingThreshold - subtotal;
    // 只在 1 ≤ diff ≤ 50 且有可推薦產品時顯示
    if (deliveryFee === 0 || diff < 1 || diff > 50 || upsellProducts.length === 0) return null;

    return (
      <section className="bg-white p-5 rounded-[2.5rem] border border-orange-100 shadow-sm space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-xl"><Zap size={14} className="text-orange-500" /></div>
          <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest">差少少就免運費！加多件就可以：</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
          {upsellProducts.map(p => {
            const effectivePrice = getPrice(p);
            return (
              <div key={p.id} className="flex-shrink-0 w-40 bg-slate-50 rounded-2xl border border-slate-100 p-3 space-y-2.5 hover:border-orange-200 transition-all">
                <div className="w-full h-20 bg-white rounded-xl border border-slate-50 flex items-center justify-center text-3xl overflow-hidden">
                  {isMediaUrl(p.image) ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <span>{p.image || '📦'}</span>}
                </div>
                <p className="text-xs font-black text-slate-700 truncate">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-orange-600">${effectivePrice}</span>
                  <button
                    onClick={() => { updateCart(p, 1); showToast(`已加入 ${p.name}`); }}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-xl text-[10px] font-black shadow-md active:scale-90 transition-all whitespace-nowrap"
                  >
                    + 加購
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCheckoutView = () => {
    const { subtotal, deliveryFee, total } = pricingData;
    return (
      <div className="flex-1 bg-slate-50 min-h-screen pb-48 overflow-y-auto animate-fade-in">
        <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-4 border-b border-slate-100 flex items-center justify-between">
          <button onClick={() => setView('store')} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h2 className="text-lg font-black text-slate-900">{t.checkout.confirmOrder}</h2><div className="w-10"></div>
        </header>
        <div className="p-6 space-y-6">
          <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14}/> {t.checkout.deliveryInfo}</h3>
            {deliveryMethod === 'sf_locker' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2"><button onClick={() => setDeliveryMethod('home')} className="py-3 px-4 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400">{t.checkout.homeDelivery}</button><button onClick={() => setDeliveryMethod('sf_locker')} className="py-3 px-4 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-lg">{t.checkout.sfLocker}</button></div>
                {/* 二級下拉：第一層選地區，第二層選自提點 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">選擇地區</label>
                    <select
                      value={selectedLockerDistrict}
                      onChange={(e) => { setSelectedLockerDistrict(e.target.value); setSelectedLockerCode(''); }}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
                    >
                      <option value="">— 請選擇地區 —</option>
                      {SF_COLD_DISTRICT_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">選擇冷運自提點</label>
                    <select
                      value={selectedLockerCode}
                      onChange={(e) => setSelectedLockerCode(e.target.value)}
                      disabled={!selectedLockerDistrict}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">{selectedLockerDistrict ? '— 請選擇自提點 —' : '— 請先選擇地區 —'}</option>
                      {lockerPointsForDistrict.map(p => (
                        <option key={p.code} value={p.code}>{p.area} · {p.name}</option>
                      ))}
                    </select>
                  </div>
                  {selectedLockerPoint && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1.5 animate-fade-in">
                      <p className="text-xs font-black text-blue-800">{selectedLockerPoint.name}</p>
                      <p className="text-[11px] font-bold text-blue-600 leading-relaxed">{selectedLockerPoint.address}</p>
                      <p className="text-[10px] font-bold text-blue-500">
                        點碼：{selectedLockerPoint.code} ｜ 營業：{selectedLockerPoint.hours.weekday}（平日）/ {selectedLockerPoint.hours.weekend}（週末）
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2"><button onClick={() => setDeliveryMethod('home')} className="py-3 px-4 bg-blue-600 rounded-2xl text-xs font-black text-white shadow-lg">{t.checkout.homeDelivery}</button><button onClick={() => setDeliveryMethod('sf_locker')} className="py-3 px-4 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400">{t.checkout.sfLocker}</button></div>
                {isChangingAddress && user ? (
                  <div className="space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700">改用其他地址／填寫新地址</p>
                      <button type="button" onClick={() => { setIsChangingAddress(false); setCheckoutAddressDraft(null); }} className="py-2 px-4 border border-slate-200 rounded-xl text-slate-500 text-xs font-black min-h-[44px]">返回</button>
                    </div>
                    {user.addresses && user.addresses.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">已儲存地址</p>
                        <div className="space-y-3 divide-y divide-slate-100">
                          {user.addresses.map(addr => {
                            const isSelected = (checkoutSelectedAddressId ?? user.addresses!.find(a => a.isDefault)?.id) === addr.id;
                            return (
                              <button type="button" key={addr.id} onClick={() => { setCheckoutSelectedAddressId(addr.id); setIsChangingAddress(false); }} className={`w-full p-4 rounded-2xl border-2 text-left transition-all min-h-[56px] flex items-center justify-between active:scale-[0.99] -mt-px first:mt-0 pt-4 ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-black text-slate-900">{addr.label || (addr.isDefault ? '預設地址' : '其他地址')}</p>
                                  <p className="text-[11px] text-slate-600 font-bold mt-1 leading-relaxed">{formatAddressLine(addr)}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1">{addr.contactName} · {addr.phone}</p>
                                </div>
                                {isSelected && <span className="flex-shrink-0 ml-2 text-blue-600 font-black text-sm">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">新增地址</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        {checkoutAddressDraft ? (
                          <>
                            <input value={checkoutAddressDraft.label} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, label: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="地址標籤（選填，如：屋企、公司）" />
                            <div className="flex gap-2 items-center">
                              <select value={checkoutAddressDraft.district ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, district: e.target.value })} className="flex-1 p-3 bg-white rounded-xl font-bold text-sm border border-slate-100">
                                <option value="">選擇地區 *</option>
                                {HK_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <button type="button" onClick={handleLocateMe} disabled={isLocatingAddress} title="以目前位置自動填入地址" className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 disabled:opacity-50 transition-all" aria-label="定位填入地址">
                                {isLocatingAddress ? <RefreshCw size={20} className="animate-spin text-blue-600" /> : <Crosshair size={20} />}
                              </button>
                            </div>
                            <input value={checkoutAddressDraft.detail ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, detail: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="地址 *（街道／門牌／村屋等）" />
                            <div className="grid grid-cols-2 gap-2">
                              <input value={checkoutAddressDraft.floor ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, floor: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="樓層 *" />
                              <input value={checkoutAddressDraft.flat ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, flat: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="室／單位 *" />
                            </div>
                            <input value={checkoutAddressDraft.contactName} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, contactName: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="收件人名稱 *" />
                            <input type="tel" value={checkoutAddressDraft.phone} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, phone: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="手機號碼 *" />
                            <input value={checkoutAddressDraft.altContactName ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, altContactName: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="後備收件人（選填）" />
                            <input type="tel" value={checkoutAddressDraft.altPhone ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, altPhone: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="後備收件人手機號碼（選填）" />
                            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                              <input type="checkbox" checked={checkoutSaveNewAddressAsDefault} onChange={e => setCheckoutSaveNewAddressAsDefault(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              <span className="text-xs font-bold text-slate-700">下次結帳時設為預設地址</span>
                            </label>
                            <button type="button" onClick={() => { if (!isAddressCompleteForOrder(checkoutAddressDraft)) { showToast('請填寫地區、地址、樓層、單位、收件人及手機號碼', 'error'); return; } handleSaveAddress(user.id, checkoutAddressDraft, true, checkoutSaveNewAddressAsDefault); setCheckoutSelectedAddressId(checkoutAddressDraft.id); setIsChangingAddress(false); setCheckoutAddressDraft(null); showToast('已保存地址'); }} className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-sm min-h-[48px]">保存並使用</button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : showCheckoutAddressForm && checkoutAddressDraft ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
                    {!user && (
                      <p className="text-[11px] text-slate-500 font-bold">
                        註冊會員可以記錄預設地址，下次結帳更快捷。
                        <button type="button" onClick={() => setView('profile')} className="text-blue-600 underline ml-1 hover:text-blue-700">前往會員頁</button>
                      </p>
                    )}
                    <input value={checkoutAddressDraft.label} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, label: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="地址標籤（選填，如：屋企、公司）" />
                    <div className="flex gap-2 items-center">
                      <input value={checkoutAddressDraft.district ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, district: e.target.value })} className="flex-1 p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="地區（如：九龍、旺角）" />
                      <button type="button" onClick={handleLocateMe} disabled={isLocatingAddress} title="以目前位置自動填入地址" className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 disabled:opacity-50 transition-all" aria-label="定位填入地址">
                        {isLocatingAddress ? <RefreshCw size={20} className="animate-spin text-blue-600" /> : <Crosshair size={20} />}
                      </button>
                    </div>
                    <input ref={streetInputRef} value={checkoutAddressDraft.street ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, street: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="街道／門牌" autoComplete="off" />
                    <input value={checkoutAddressDraft.building ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, building: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="大廈名稱" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={checkoutAddressDraft.floor ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, floor: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="樓層" />
                      <input value={checkoutAddressDraft.flat ?? ''} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, flat: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="室／單位" />
                    </div>
                    <input value={checkoutAddressDraft.contactName} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, contactName: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="聯絡人姓名 *" />
                    <input type="tel" value={checkoutAddressDraft.phone} onChange={e => setCheckoutAddressDraft({ ...checkoutAddressDraft, phone: e.target.value })} className="w-full p-3 bg-white rounded-xl font-bold text-sm border border-slate-100" placeholder="聯絡電話 *" />
                    {user && (
                      <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                        <input type="checkbox" checked={checkoutSaveNewAddressAsDefault} onChange={e => setCheckoutSaveNewAddressAsDefault(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-xs font-bold text-slate-700">下次結帳時設為預設地址</span>
                      </label>
                    )}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setShowCheckoutAddressForm(false); setCheckoutAddressDraft(null); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-black text-xs text-slate-500 min-h-[44px]">取消</button>
                      {user ? (
                        <button type="button" onClick={() => { if (!isAddressCompleteForOrder(checkoutAddressDraft)) { showToast('請填寫聯絡人、電話及至少一項地址', 'error'); return; } handleSaveAddress(user.id, checkoutAddressDraft, true, checkoutSaveNewAddressAsDefault); setCheckoutSelectedAddressId(checkoutAddressDraft.id); setShowCheckoutAddressForm(false); setCheckoutAddressDraft(null); showToast('已保存地址'); }} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-black text-xs min-h-[44px]">保存並使用</button>
                      ) : null}
                    </div>
                  </div>
                ) : user?.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      {(() => {
                        const addr = getCheckoutDeliveryAddress();
                        if (!addr) return null;
                        return (
                          <>
                            <p className="text-xs font-black text-slate-900">{addr.label || (addr.isDefault ? '預設地址' : '收貨地址')}</p>
                            <p className="text-[11px] text-slate-500 font-bold mt-1">{formatAddressLine(addr)}</p>
                            <p className="text-[11px] text-slate-500 font-bold mt-0.5">{addr.contactName} · {addr.phone}</p>
                          </>
                        );
                      })()}
                    </div>
                    <button type="button" onClick={() => { setIsChangingAddress(true); setCheckoutAddressDraft({ ...emptyAddress(), contactName: user?.name || '', phone: user?.phoneNumber || '' }); }} className="w-full min-h-[52px] py-4 border-2 border-slate-200 rounded-2xl text-slate-600 text-sm font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                      改用其他地址／填寫新地址
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button type="button" onClick={() => { setShowCheckoutAddressForm(true); setCheckoutAddressDraft({ ...emptyAddress(), contactName: user?.name || '', phone: user?.phoneNumber || '' }); }} className="w-full min-h-[52px] py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black flex items-center justify-center gap-2">
                      填寫收貨地址 <ChevronDown size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
          <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={14}/> 產品摘要</h3>
             <div className="divide-y divide-slate-50">
               {cart.map(item => (
                 <div key={item.id} className="py-3 flex gap-3 items-center">
                   <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden">
                     {isMediaUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{item.image}</span>}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-black text-slate-800">{item.name}</p>
                     <p className="text-[10px] text-slate-400 font-bold">${getPrice(item, item.qty)} x {item.qty}</p>
                   </div>
                   <div className="flex items-center gap-1 rounded-full border border-slate-100 p-1 bg-white">
                     <button type="button" onClick={(e) => { e.stopPropagation(); updateCart(item, -1, e); }} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 active:scale-90"><Minus size={14}/></button>
                     <span className="w-6 text-center text-xs font-black text-slate-900">{item.qty}</span>
                     <button type="button" onClick={(e) => { e.stopPropagation(); updateCart(item, 1, e); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white active:scale-90"><Plus size={14}/></button>
                   </div>
                   <p className="text-sm font-black text-slate-900 w-14 text-right">${getPrice(item, item.qty) * item.qty}</p>
                 </div>
               ))}
             </div>
          </section>
          <UpsellNudge />
          <section className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest"><span>商品小計</span><span>${subtotal}</span></div>
              <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-widest"><span>預估運費</span><span>{deliveryFee === 0 ? '免運費' : `$${deliveryFee}`}</span></div>
              <FreeShippingNudge />
              <div className="pt-4 border-t border-white/10 flex justify-between items-end"><span className="text-sm font-black uppercase tracking-widest">總金額</span><span className="text-4xl font-black text-blue-400">${total}</span></div>
            </div>
            <button disabled={(deliveryMethod === 'home' && !getCheckoutDeliveryAddress()) || (deliveryMethod === 'sf_locker' && !selectedLockerPoint) || isRedirectingToPayment} onClick={handleSubmitOrder} className="w-full py-5 bg-blue-600 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3">{isRedirectingToPayment ? <RefreshCw size={20} className="animate-spin" /> : <CreditCard size={20}/>} {isRedirectingToPayment ? t.checkout.redirecting : t.checkout.payNow}</button>
          </section>
        </div>
      </div>
    );
  };

  const renderStoreView = () => (
    <div className="flex flex-col h-screen overflow-hidden bg-white animate-fade-in font-sans">
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg overflow-hidden">{isMediaUrl(siteConfig.logoUrl) ? <img src={siteConfig.logoUrl} alt={siteConfig.logoText} className="w-full h-full object-contain p-0.5" /> : <span>{siteConfig.logoIcon}</span>}</div><h1 className="font-bold text-lg text-slate-900 tracking-tight">{siteConfig.logoText}</h1></div>
        <div className="flex items-center gap-2">
          <button onClick={handleReorderClick} className="p-2 bg-amber-50 text-amber-600 rounded-full border border-amber-100 active:scale-90 transition-transform" title="一鍵回購"><Clock size={18} /></button>
          <button onClick={() => setLang(lang === 'zh-HK' ? 'en' : 'zh-HK')} className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">{lang === 'zh-HK' ? 'EN' : '中'}</button>
          <a href="https://wa.me/85212345678" target="_blank" rel="noreferrer" className="p-2 bg-green-50 text-green-600 rounded-full border border-green-100"><MessageCircle size={18} fill="currentColor" /></a>
          {user ? (
             <button onClick={() => setView('profile')} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"><Wallet size={14} className={textAccentClass} /><span className="text-xs font-bold text-slate-700">${user.walletBalance}</span></button>
          ) : (
            <button onClick={() => setView('profile')} className={`text-xs font-bold ${textAccentClass} px-3 py-1.5 rounded-full bg-blue-50`}>{t.store.login}</button>
          )}
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <aside className="bg-white border-r border-slate-100 overflow-y-auto hide-scrollbar flex flex-col items-center py-1 w-16">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`flex flex-col items-center gap-0.5 w-full py-4 transition-all relative ${activeCategory === cat.id ? `${textAccentClass} bg-blue-50/50` : 'text-slate-400'}`}>
              {activeCategory === cat.id && <div className={`absolute left-0 h-8 w-1 ${accentClass} rounded-r-full`} />}
              <span className="text-xl">{cat.icon}</span><span className="text-[9px] font-bold text-center leading-tight uppercase">{cat.name}</span>
            </button>
          ))}
        </aside>
        <main ref={listRef} className="flex-1 overflow-y-auto hide-scrollbar bg-white p-3 pb-48">
          <div className="space-y-12">
            {/* Advertisement slideshow - above categories */}
            {slideshowItems.length > 0 && (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
                <div className="relative aspect-[2.5/1] w-full">
                  {slideshowItems.map((slide, i) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${i === slideshowIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      {slide.type === 'video' ? (
                        <video src={slide.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={slide.url} alt={slide.title || ''} className="w-full h-full object-cover" />
                      )}
                      {slide.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          <p className="text-white font-bold text-sm">{slide.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {slideshowItems.length > 1 && (
                  <div className="flex justify-center gap-1.5 py-2 bg-white/80">
                    {slideshowItems.map((_, i) => (
                      <button key={i} onClick={() => setSlideshowIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === slideshowIndex ? 'bg-slate-900 scale-125' : 'bg-slate-300'}`} aria-label={`Slide ${i + 1}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
            {categories.length === 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center text-slate-400 font-bold">
                {t.store.noCategories}
              </div>
            )}
            {categories.map(cat => (
              <div key={cat.id} ref={el => { catRefs.current[cat.id] = el; }}>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2 text-sm sticky top-[0px] bg-white py-2 z-10 border-b border-slate-50"><span className="text-lg">{cat.icon}</span> {cat.name}</h3>
                <div className="divide-y divide-slate-100 bg-white rounded-2xl overflow-hidden shadow-sm">
                  {products.filter(p => p.categories.includes(cat.id)).length === 0 && (
                    <div className="p-6 text-center text-slate-400 font-bold">{t.store.noCategoryProducts}</div>
                  )}
                  {products.filter(p => p.categories.includes(cat.id)).map(p => {
                    const itemInCart = cart.find(i => i.id === p.id);
                    const qty = itemInCart?.qty || 0;
                    const isOfferMet = p.bulkDiscount && qty >= p.bulkDiscount.threshold;
                    return (
                      <div key={p.id} onClick={() => setSelectedProduct(p)} className="flex gap-4 py-4 px-3 hover:bg-slate-50 transition-all cursor-pointer group">
                        <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center text-5xl relative overflow-hidden flex-shrink-0 border border-slate-100 group-hover:shadow-inner transition-all">
                           {isMediaUrl(p.image) ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <span className="text-5xl">{p.image}</span>}
                           {p.recipes && p.recipes.length > 0 && <div className="absolute top-1 right-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-blue-600 shadow-sm"><BookOpen size={12}/></div>}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                           <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0"><h4 className="font-bold text-slate-900 text-[15px] leading-tight group-hover:text-blue-600 transition-colors flex items-center gap-2">{p.name}</h4>
                                {p.tags && p.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-1.5">{p.tags.map(tag => (<span key={tag} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase tracking-tight">{tag}</span>))}</div>)}
                                {p.bulkDiscount && (<p className="text-[10px] font-black text-rose-500 uppercase tracking-tight mt-1 animate-pulse">{p.bulkDiscount.threshold}件+ 即減 {p.bulkDiscount.value}{p.bulkDiscount.type === 'percent' ? '%' : '元'}</p>)}
                              </div>
                           </div>
                           <div className="flex items-end justify-between mt-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const yourPrice = getPrice(p);
                                  const showOriginal = yourPrice < p.price;
                                  return (<>
                                    <p className={`text-base font-bold ${showOriginal ? 'text-slate-300 text-xs line-through' : 'text-slate-900'}`}>${p.price}</p>
                                    {showOriginal && <p className="text-base font-bold text-rose-500 animate-fade-in">${yourPrice}</p>}
                                  </>);
                                })()}
                              </div>
                              <div className={`flex items-center rounded-full p-1 border transition-all ${isOfferMet ? 'bg-amber-400 border-amber-500 scale-105 shadow-md ring-2 ring-amber-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                {qty > 0 && (
                                  <><button onClick={(e) => updateCart(p, -1, e)} className={`w-8 h-8 flex items-center justify-center transition-colors active:scale-75 ${isOfferMet ? 'text-white' : 'text-slate-300'}`}><Minus size={16}/></button><span className={`mx-2 text-sm font-black w-4 text-center ${isOfferMet ? 'text-white' : 'text-slate-900'}`}>{qty}</span></>
                                )}
                                <button onClick={(e) => updateCart(p, 1, e)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOfferMet ? 'bg-white text-amber-500' : accentClass + ' text-white shadow-lg'} active:scale-90 animate-pop-pulse`}><Plus size={16}/></button>
                              </div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      {cart.length > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-[60]">
          <button onClick={(e) => { e.stopPropagation(); setView('checkout'); }} className="w-full bg-slate-900 text-white rounded-2xl shadow-2xl active:scale-[0.98] transition-all ring-4 ring-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3"><ShoppingBag size={18} /><span className="text-sm font-bold">${pricingData.subtotal}</span></div>
              <div className="flex-1 mx-3"><FreeShippingNudge compact /></div>
              <div className="px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-white flex-shrink-0">{t.store.goCheckout} <ChevronRight size={12} /></div>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  if (isAdminRoute && !isAdminAuthenticated) return renderAdminLogin();

  return (
    <div className={isAdminRoute ? "h-screen bg-slate-50 flex flex-row overflow-hidden font-sans" : "max-w-md mx-auto min-h-screen relative shadow-2xl overflow-hidden flex flex-col md:max-w-none bg-white font-sans"}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── 一鍵回購持久通知（手動關閉）── */}
      {reorderNotification && (
        <>
          {/* 點擊空白處關閉的透明遮罩 */}
          <div className="fixed inset-0 z-[8499]" onClick={() => setReorderNotification(null)} />
          <div className="fixed top-14 sm:top-16 inset-x-0 z-[8500] flex justify-center px-4 pointer-events-none">
            <div
              className={`pointer-events-auto w-full max-w-sm rounded-2xl shadow-xl border px-4 py-3 animate-slide-up ${
                reorderNotification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : reorderNotification.type === 'partial'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`flex-shrink-0 mt-0.5 ${
                  reorderNotification.type === 'success' ? 'text-emerald-500' : reorderNotification.type === 'partial' ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {reorderNotification.type === 'success' ? <CheckCircle size={16}/> : reorderNotification.type === 'partial' ? <AlertTriangle size={16}/> : <AlertTriangle size={16}/>}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  {reorderNotification.type === 'success' && (
                    <p className="text-xs font-bold text-emerald-700">已加入上次購買的 {reorderNotification.successCount} 件產品！您可以繼續選購。</p>
                  )}
                  {reorderNotification.type === 'partial' && (
                    <>
                      <p className="text-xs font-bold text-amber-700">已加入 {reorderNotification.successCount} 件，以下缺貨：</p>
                      <p className="text-[10px] text-amber-600/80 font-medium">{reorderNotification.failedNames.join('、')}</p>
                    </>
                  )}
                  {reorderNotification.type === 'fail' && (
                    <p className="text-xs font-bold text-rose-700">{reorderNotification.failedNames[0] || '上次買嘅產品已全數售罄'}</p>
                  )}
                </div>
                <button onClick={() => setReorderNotification(null)} className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 active:scale-90 transition-all" aria-label="關閉">
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {isAdminRoute ? (
        <>
          <aside className={`bg-slate-900 text-white flex-shrink-0 flex flex-col items-center py-4 overflow-y-auto hide-scrollbar border-r border-slate-800 transition-[width] duration-200 ${isAdminSidebarOpen ? 'w-56 px-4' : 'w-16 px-2'}`}>
            <div className={`flex items-center ${isAdminSidebarOpen ? 'gap-3 w-full' : 'justify-center flex-col gap-1'}`}>
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40 flex-shrink-0"><Cpu size={24}/></div>
              {isAdminSidebarOpen && (
                <div className="min-w-0"><h2 className="text-base font-black tracking-tight truncate">{t.admin.controlCenter}</h2><p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">REAR-LINK 4.2</p></div>
              )}
            </div>
            <button onClick={() => setIsAdminSidebarOpen(prev => !prev)} className={`w-full flex items-center ${isAdminSidebarOpen ? 'gap-2 px-3' : 'justify-center'} py-2 mt-4 bg-white/5 rounded-2xl text-xs font-black text-white/70 hover:text-white transition-all flex-shrink-0`}>
              <ChevronLeft size={16} className={isAdminSidebarOpen ? '' : 'rotate-180'} />
              {isAdminSidebarOpen && <span>{t.admin.collapseSidebar}</span>}
            </button>
            <nav className="space-y-1 flex-1 mt-4 w-full min-w-0">
               {[
                 { id: 'dashboard', label: t.admin.dashboard, icon: <BarChart3 size={20}/> },
                 { id: 'inventory', label: t.admin.inventory, icon: <Package size={20}/> },
                 { id: 'orders', label: t.admin.orders, icon: <Truck size={20}/> },
                 { id: 'members', label: t.admin.members, icon: <Users size={20}/> },
                 { id: 'slideshow', label: t.admin.slideshow, icon: <ImageIcon size={20}/> },
                 { id: 'pricing', label: '價錢設定', icon: <DollarSign size={20}/> },
                 { id: 'settings', label: t.admin.settings, icon: <Settings size={20}/> }
               ].map(item => (
                 <button
                   key={item.id}
                   onClick={() => setAdminModule(item.id as any)}
                   className={`w-full flex items-center ${isAdminSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${adminModule === item.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                 >
                   {item.icon}
                   {isAdminSidebarOpen && <span className="truncate">{item.label}</span>}
                 </button>
               ))}
            </nav>
            <button onClick={() => { setIsAdminAuthenticated(false); window.location.hash = ''; }} className={`w-full flex items-center ${isAdminSidebarOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 text-slate-500 font-bold text-sm hover:text-white border-t border-white/5 pt-4 mt-auto transition-colors flex-shrink-0`}>
              <LogOut size={20}/> {isAdminSidebarOpen && <span className="truncate">{t.admin.exitAdmin}</span>}
            </button>
          </aside>
          <main className="flex-1 min-w-0 p-6 md:p-10 overflow-y-auto bg-[#f8fafc] hide-scrollbar">
            <header className="flex justify-between items-center mb-10"><div><h1 className="text-3xl font-black text-slate-900 tracking-tighter">{({ dashboard: t.admin.dashboard, inventory: t.admin.inventory, orders: t.admin.orders, members: t.admin.members, slideshow: t.admin.slideshow, pricing: '價錢設定', settings: t.admin.settings } as Record<string, string>)[adminModule] || adminModule}</h1><p className="text-slate-400 font-bold text-sm">{t.admin.realtimeAdmin}</p></div><div className="flex items-center gap-4"><button onClick={() => showToast('通知功能開發中', 'error')} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 shadow-sm"><Bell size={20}/></button><button onClick={() => showToast('帳戶功能開發中', 'error')} className="w-12 h-12 bg-slate-200 rounded-2xl border border-slate-100"></button></div></header>
            {renderAdminModuleContent()}
          </main>
        </>
      ) : (
        <>
          {view === 'store' && renderStoreView()}
          {view === 'checkout' && renderCheckoutView()}
          {view === 'success' && (
            <SuccessView
              successWaybill={successWaybill}
              successWaybillLoading={successWaybillLoading}
              setSuccessWaybill={setSuccessWaybill}
              setSuccessWaybillLoading={setSuccessWaybillLoading}
              highlightOrderId={highlightOrderId}
              orders={orders}
              onViewOrders={() => { if (window.history.replaceState) window.history.replaceState({}, '', '/'); setView('orders'); const latestId = orders.length > 0 ? orders[0].id : null; if (latestId) setHighlightOrderId(latestId); }}
              onRefreshOrders={fetchOrders}
            />
          )}
          {view === 'orders' && (
             <div className="flex-1 bg-slate-50 p-6 space-y-4 overflow-y-auto pb-24">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{t.orders.myOrders}</h2>
                {orders.length === 0 && (
                   <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 font-bold">
                      {t.orders.noOrders}
                   </div>
                )}
                {orders.map(o => (
                   <div
                     key={o.id}
                     className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 hover:shadow-md transition-all duration-300 ${highlightOrderId === o.id ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-lg animate-order-pop' : 'border-slate-100'}`}
                   >
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>#{o.id} • {o.date}</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status as OrderStatus} t={t} />
                          {!o.trackingNumber && (
                            <span className="text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md">{t.orders.noTracking}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="text-2xl font-black text-slate-900">${o.total}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setInspectingOrder(o)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all border border-slate-200 hover:bg-slate-200">{t.orders.viewOrder}</button>
                          <button onClick={() => handleTrackOrder(o)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all ${o.trackingNumber ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`} disabled={!o.trackingNumber}><Truck size={14} className="inline mr-2"/> {t.orders.trackLogistics}</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
                                                <span>{t.orders.courier}</span>
                                                <span>{t.orders.logisticsStatus}{getOrderStatusLabel(o.status, t)}</span>
                                                {o.trackingNumber && <span>{t.orders.trackingNo}{o.trackingNumber}</span>}
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{t.orders.progress}</span>
                          <span>{getOrderStatusLabel(o.status, t)}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {ORDER_TIMELINE.map((step, idx) => {
                            const currentIdx = getTimelineIndex(o.status);
                            const isActive = currentIdx >= idx;
                            return (
                              <div key={step} className="flex flex-col items-center gap-2 text-[9px] font-bold text-slate-500">
                                <div className={`w-full h-1 rounded-full ${isActive ? 'bg-slate-900' : 'bg-slate-200'}`} />
                                <span className={`${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{getOrderStatusLabel(step, t)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
          {view === 'profile' && !user && (
             <div className="flex-1 bg-slate-50 p-6 overflow-y-auto pb-24 animate-fade-in">
                <div className="max-w-md mx-auto pt-4">
                  <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">{t.profile.loginSignup}</h2>
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex gap-0 border-b border-slate-100">
                                            <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-4 font-bold text-sm ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400'}`}>{t.profile.loginTab}</button>
                                            <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-4 font-bold text-sm ${authMode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400'}`}>{t.profile.signupTab}</button>
                    </div>
                    <div className="p-6 space-y-4">
                      {authMode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.emailOrPhone}</label>
                            <input type="text" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder={t.profile.emailOrPhone} required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.password}</label>
                            <input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder={t.profile.password} required />
                          </div>
                          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm">{t.profile.loginBtn}</button>
                        </form>
                      ) : (
                        <form onSubmit={handleSignup} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.name}</label>
                            <input value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder={t.profile.name} required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.phone}</label>
                            <input type="tel" value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder={t.profile.phone} required />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.emailOptional}</label>
                            <input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder="your@email.com" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.profile.passwordMin6}</label>
                            <input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full p-3 bg-slate-50 rounded-2xl font-bold border border-slate-100" placeholder={t.profile.password} minLength={6} required />
                          </div>
                          <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm">{t.profile.signupBtn}</button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
             </div>
          )}
          {view === 'profile' && user && (
             <div className="flex-1 bg-slate-50 p-6 space-y-6 overflow-y-auto pb-24">
                <div className={`p-8 rounded-[3rem] ${accentClass} text-white shadow-2xl relative overflow-hidden group`}>
                   <div className="relative z-10"><h2 className="text-2xl font-black mb-2 tracking-tight">{user.name}</h2><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8">{user.tier} MEMBER</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-inner group-hover:bg-white/20 transition-colors"><p className="text-[9px] font-bold uppercase mb-1 tracking-widest">{t.profile.walletBalance}</p><p className="text-2xl font-black">${user.walletBalance}</p></div>
                        <div className="bg-white/10 p-5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-inner group-hover:bg-white/20 transition-colors"><p className="text-[9px] font-bold uppercase mb-1 tracking-widest">{t.profile.points}</p><p className="text-2xl font-black">{user.points}</p></div>
                      </div>
                   </div>
                   <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><ShoppingBag size={200}/></div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                    <button onClick={() => setShowAddressDropdown(!showAddressDropdown)} className="w-full flex justify-between items-center p-6 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3"><MapPin size={20} className="text-blue-500"/> {t.profile.addresses}</div>
                      <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${showAddressDropdown ? 'rotate-180' : ''}`}/>
                    </button>
                    {showAddressDropdown && (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4 animate-fade-in">
                        {user.addresses?.map(addr => (
                          <div key={addr.id} onClick={() => handleSetDefaultAddress(user.id, addr.id)} className={`p-5 rounded-[2rem] border transition-all cursor-pointer group relative ${addr.isDefault ? 'bg-white border-blue-400 shadow-lg ring-1 ring-blue-400' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2"><span className="font-black text-slate-900 text-xs">{addr.label}</span>{addr.isDefault && <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-full">{t.profile.default}</span>}</div>
                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => setAddressEditor({ address: { ...addr }, isNew: false, ownerId: user.id })} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors" aria-label="編輯"><Edit size={14}/></button>
                                <button type="button" onClick={() => handleDeleteAddress(user.id, addr.id)} className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors" aria-label="刪除"><Trash2 size={14}/></button>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed mb-3 line-clamp-2">{formatAddressLine(addr)}</p>
                          </div>
                        ))}
                        <button onClick={() => setAddressEditor({ address: emptyAddress(), isNew: true, ownerId: user.id })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300 font-black uppercase text-[10px] tracking-widest hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"><Plus size={16}/> {t.profile.addAddress}</button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => window.location.hash = 'admin'} className="w-full flex justify-between items-center p-6 bg-slate-900 rounded-[2.5rem] text-white font-bold shadow-xl active:scale-95 transition-all"><div className="flex items-center gap-3"><ShieldCheck size={20} className="text-blue-400"/> {t.profile.openAdmin}</div><ArrowUpRight size={18} className="text-slate-400"/></button>
                </div>
                <button onClick={() => { setUser(null); try { localStorage.removeItem('coolfood_member_id'); } catch { /* ignore */ } setView('store'); showToast(t.profile.loggedOut); }} className="w-full py-5 bg-white text-rose-500 rounded-[2rem] font-black border border-rose-50 shadow-sm active:scale-95 transition-all hover:bg-rose-50">{t.profile.logout}</button>
             </div>
          )}
          {!isAdminRoute && (
            <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around z-50">
              {[
                { id: 'store', label: t.nav.store, icon: <ShoppingBag size={24} strokeWidth={2.5} /> },
                { id: 'orders', label: t.nav.orders, icon: <Clock size={24} strokeWidth={2.5} /> },
                { id: 'profile', label: t.nav.profile, icon: <User size={24} strokeWidth={2.5} /> }
              ].map(item => (<button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === item.id ? `${textAccentClass} scale-110` : 'text-slate-300 hover:text-slate-400'}`}>{item.icon}<span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span></button>))}
            </nav>
          )}
        </>
      )}
      {renderGlobalModals()}
    </div>
  );
};

const editingMember: any = null; // Placeholder for scope check if needed outside, though it's state-managed
export default App;
