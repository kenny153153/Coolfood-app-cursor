
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Layers, Plus, Edit, Trash2, Save, X, RefreshCw, Search,
  Tag, Filter, ShoppingCart, Lock, Upload, FileText, BarChart3,
  ChevronDown, ChevronRight, AlertTriangle, Check, Star,
  MessageSquare, Building2, Phone, MapPin, Clock, Mail, Scissors,
  PackageCheck, ClipboardCheck, ArrowDownToLine, History,
  Coins, ClipboardList,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { computeProductCost, computePackCost, mapMaterialProcessingRow } from './supabaseMappers';
import type {
  Ingredient, IngredientCategory, SaleChannel, MaterialType, Supplier,
  RawMaterialCatalog, SupplierQuote, QuoteLineItem,
  ComparisonRow, PurchaseDecision, JustificationCategory,
  ProcessingType, GoodsReceipt, StockMovement, StockLot,
  Product, CostItem, SiteConfig, WholesalePricingRules, MaterialProcessingEntry,
} from './types';
import { mapProcessingTypeRow } from './supabaseMappers';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  costItems: CostItem[];
  setCostItems: React.Dispatch<React.SetStateAction<CostItem[]>>;
  siteConfig: SiteConfig;
  isMediaUrl: (url: string) => boolean;
}

type SubTab = 'ingredients' | 'suppliers' | 'quote_compare' | 'purchase_orders' | 'goods_receiving' | 'units' | 'processing_types' | 'product_costs' | 'reorder_alerts';

const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: 'meat', label: '🥩 肉類原材料' },
  { value: 'third_party', label: '📦 第三方產品' },
];

const SALE_CHANNELS: { value: SaleChannel; label: string }[] = [
  { value: 'both', label: '全部' },
  { value: 'retail', label: '零售' },
  { value: 'wholesale', label: '批發' },
];

const DEFAULT_UNITS = [
  { value: 'lb', label: '磅 (lb)' },
  { value: 'kg', label: '公斤 (kg)' },
  { value: 'pc', label: '件 (pc)' },
  { value: 'box', label: '箱 (box)' },
  { value: 'pack', label: '包 (pack)' },
];

const PO_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  submitted: { label: '已提交', color: 'bg-blue-50 text-blue-600' },
  partial: { label: '部份到貨', color: 'bg-amber-50 text-amber-600' },
  received: { label: '已收貨', color: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: '已取消', color: 'bg-rose-50 text-rose-500' },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  unpaid: { label: '未付', color: 'bg-rose-50 text-rose-500' },
  partial: { label: '部份付', color: 'bg-amber-50 text-amber-600' },
  paid: { label: '已付', color: 'bg-emerald-50 text-emerald-600' },
};

const GRN_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  confirmed: { label: '已確認', color: 'bg-emerald-50 text-emerald-600' },
  cancelled: { label: '已取消', color: 'bg-rose-50 text-rose-500' },
};

const MOVEMENT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  receive: { label: '收貨入倉', color: 'text-emerald-600' },
  production_out: { label: '生產出倉', color: 'text-amber-600' },
  adjustment: { label: '人工調整', color: 'text-blue-600' },
  wastage: { label: '損耗', color: 'text-rose-600' },
  return: { label: '退貨', color: 'text-purple-600' },
};

const JUSTIFICATION_OPTIONS: { value: JustificationCategory; label: string }[] = [
  { value: 'quality', label: '品質/良率較穩定' },
  { value: 'delivery_speed', label: '交貨時間更快' },
  { value: 'min_order', label: '最低量不符合需求' },
  { value: 'payment_terms', label: '數期/付款條件更好' },
  { value: 'stock_availability', label: '有現貨/庫存充足' },
  { value: 'other', label: '其他（請說明）' },
];

interface POLineItem {
  ingredientId?: string;
  productName: string;
  qty: number;
  unit: string;
  unitCost: number;
  lineTotal: number;
  receivedQty: number;
  notes: string;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierPhone: string;
  orderDate: string;
  expectedDelivery: string;
  status: string;
  lineItems: POLineItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

const EMPTY_PO_LINE: POLineItem = {
  productName: '', qty: 0, unit: 'lb', unitCost: 0, lineTotal: 0, receivedQty: 0, notes: '',
};

const WarehousePanel: React.FC<Props> = ({ showToast, products, setProducts, costItems, setCostItems, siteConfig, isMediaUrl }) => {
  const [subTab, setSubTab] = useState<SubTab>('ingredients');

  // ── Ingredients state ──
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterChannel, setFilterChannel] = useState<SaleChannel | 'all'>('all');
  const [filterMaterialType, setFilterMaterialType] = useState<MaterialType | 'all'>('all');
  const [editing, setEditing] = useState<(Partial<Ingredient> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Units state ──
  const [customUnits, setCustomUnits] = useState<{ id: string; label: string; value: string }[]>([]);
  const [unitsSaving, setUnitsSaving] = useState(false);

  const allUnits = useMemo(() => [
    ...DEFAULT_UNITS,
    ...customUnits.filter(u => u.value && u.label).map(u => ({ value: u.value, label: u.label })),
  ], [customUnits]);

  // ── Purchase Orders state ──
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poLoading, setPOLoading] = useState(false);
  const [poSearch, setPOSearch] = useState('');
  const [poStatusFilter, setPOStatusFilter] = useState('all');
  const [editingPO, setEditingPO] = useState<(Partial<PurchaseOrder> & { isNew?: boolean }) | null>(null);
  const [poSaving, setPOSaving] = useState(false);

  // ── Suppliers state ──
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<(Partial<Supplier> & { isNew?: boolean }) | null>(null);
  const [supplierSaving, setSupplierSaving] = useState(false);

  // ── Processing Types state ──
  const [processingTypes, setProcessingTypes] = useState<ProcessingType[]>([]);
  const [ptLoading, setPtLoading] = useState(false);
  const [editingPT, setEditingPT] = useState<(Partial<ProcessingType> & { isNew?: boolean }) | null>(null);
  const [ptSaving, setPtSaving] = useState(false);

  // ── Goods Receiving state ──
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [grnLoading, setGrnLoading] = useState(false);
  const [grnSearch, setGrnSearch] = useState('');
  const [grnStatusFilter, setGrnStatusFilter] = useState('all');
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receivingItems, setReceivingItems] = useState<{
    ingredientId?: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    rejectedQty: number;
    unit: string;
    unitCost: number;
    storageLocation: string;
    brand: string;
    reservedForClientId: string;
    notes: string;
  }[]>([]);
  const [receivingMeta, setReceivingMeta] = useState({ deliveryNoteNumber: '', receivedBy: '', notes: '' });
  const [grnSaving, setGrnSaving] = useState(false);
  const [grnView, setGrnView] = useState<'list' | 'receive'>('list');
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [showMovements, setShowMovements] = useState(false);
  const [movementsIngredientId, setMovementsIngredientId] = useState<string | null>(null);

  // ── Stock Lots state ──
  const [stockLots, setStockLots] = useState<StockLot[]>([]);
  const [lotsIngredientId, setLotsIngredientId] = useState<string | null>(null);
  const [showLots, setShowLots] = useState(false);
  const [wholesaleClients, setWholesaleClients] = useState<{ id: string; companyName: string }[]>([]);

  // ── Quote Comparison state ──
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [quoteLineItems, setQuoteLineItems] = useState<QuoteLineItem[]>([]);
  const [catalog, setCatalog] = useState<RawMaterialCatalog[]>([]);
  const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteCategoryFilter, setQuoteCategoryFilter] = useState('all');
  const [quoteBrandFilter, setQuoteBrandFilter] = useState('all');
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [uploadingQuote, setUploadingQuote] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadEntries, setUploadEntries] = useState<{
    id: string;
    file?: File;
    text?: string;
    sourceType: 'pdf' | 'whatsapp';
    fileName?: string;
    fileSize?: number;
    status: 'idle' | 'parsing' | 'done' | 'error';
    result?: string;
  }[]>([]);
  const [parsingQuote, setParsingQuote] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false);
  const [whatsAppText, setWhatsAppText] = useState('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── Justification modal ──
  const [justificationModal, setJustificationModal] = useState<{
    quoteItem: QuoteLineItem;
    lowestItem: QuoteLineItem;
    catalogName: string;
    brand: string;
  } | null>(null);
  const [justificationCategory, setJustificationCategory] = useState<JustificationCategory>('quality');
  const [justificationText, setJustificationText] = useState('');

  // ── PO generation from comparison ──
  const [selectedItems, setSelectedItems] = useState<Map<string, QuoteLineItem>>(new Map());
  const [showPOPreview, setShowPOPreview] = useState(false);

  // ── Product Costs overview state ──
  const [costsChannelFilter, setCostsChannelFilter] = useState<'all' | 'retail' | 'wholesale'>('all');
  const [matProcEntries, setMatProcEntries] = useState<MaterialProcessingEntry[]>([]);
  const [matProcLoading, setMatProcLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load data ──
  const loadIngredients = useCallback(async () => {
    setLoading(true);
    const [ingredientsRes, categoriesRes] = await Promise.all([
      supabase.from('ingredients').select('*').order('name'),
      supabase.from('ingredient_categories').select('*').order('sort_order'),
    ]);
    if (ingredientsRes.data) {
      setIngredients(ingredientsRes.data.map((r: any) => ({
        id: r.id, legacyId: r.legacy_id, name: r.name, nameEn: r.name_en,
        baseCostPerLb: r.base_cost_per_lb, supplier: r.supplier,
        marketBenchmark: r.market_benchmark, unit: r.unit, category: r.category,
        materialType: (['meat', 'third_party'].includes(r.material_type) ? r.material_type : 'meat') as MaterialType,
        saleChannel: r.sale_channel as SaleChannel | undefined,
        notes: r.notes, stockQty: r.stock_qty || 0, stockUnit: r.stock_unit,
        minStockAlert: r.min_stock_alert,
        committedQty: r.committed_qty || 0, incomingQty: r.incoming_qty || 0,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })));
    }
    if (categoriesRes.data) {
      setCategories(categoriesRes.data.map((r: any) => ({
        id: r.id, name: r.name, emoji: r.emoji || '📦', sortOrder: r.sort_order || 0,
      })));
    }
    setLoading(false);
  }, []);

  const loadUnits = useCallback(async () => {
    const { data } = await supabase.from('site_config').select('value').eq('id', 'custom_units').single();
    if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
      setCustomUnits(data.value);
    } else {
      const seed = [
        { id: 'u-jin', label: '斤', value: '斤' },
        { id: 'u-die', label: '碟', value: '碟' },
        { id: 'u-zek', label: '隻', value: '隻' },
        { id: 'u-tiu', label: '條', value: '條' },
        { id: 'u-faai', label: '塊 / 舊', value: '塊' },
        { id: 'u-pun', label: '盤', value: '盤' },
        { id: 'u-fan', label: '份', value: '份' },
        { id: 'u-da', label: '打 (12件)', value: '打' },
        { id: 'u-hap', label: '盒', value: '盒' },
        { id: 'u-baan', label: '板', value: '板' },
        { id: 'u-chuk', label: '束 / 紮', value: '束' },
        { id: 'u-tung', label: '桶', value: '桶' },
        { id: 'u-dai', label: '袋', value: '袋' },
      ];
      setCustomUnits(seed);
      await supabase.from('site_config').upsert({ id: 'custom_units', value: seed });
    }
  }, []);

  const loadPurchaseOrders = useCallback(async () => {
    setPOLoading(true);
    const { data } = await supabase.from('purchase_orders').select('*').order('created_at', { ascending: false });
    if (data) {
      setPurchaseOrders(data.map((r: any) => ({
        id: r.id, poNumber: r.po_number, supplierName: r.supplier_name,
        supplierContact: r.supplier_contact || '', supplierPhone: r.supplier_phone || '',
        orderDate: r.order_date, expectedDelivery: r.expected_delivery || '',
        status: r.status, lineItems: (r.line_items || []).map((li: any) => ({
          ingredientId: li.ingredient_id, productName: li.product_name,
          qty: li.qty, unit: li.unit, unitCost: li.unit_cost,
          lineTotal: li.line_total, receivedQty: li.received_qty || 0, notes: li.notes || '',
        })),
        subtotal: r.subtotal, tax: r.tax || 0, shippingCost: r.shipping_cost || 0,
        total: r.total, currency: r.currency || 'HKD',
        paymentStatus: r.payment_status || 'unpaid', paymentMethod: r.payment_method || '',
        notes: r.notes || '', createdBy: r.created_by || '', createdAt: r.created_at,
      })));
    }
    setPOLoading(false);
  }, []);

  const loadSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) {
      setSuppliers(data.map((r: any) => ({
        id: r.id, legacyCode: r.legacy_code, name: r.name, nameEn: r.name_en,
        contactName: r.contact_name, phone: r.phone, whatsapp: r.whatsapp,
        fax: r.fax, email: r.email, address: r.address,
        paymentTerms: r.payment_terms, paymentTermsDays: r.payment_terms_days,
        creditLimit: r.credit_limit, defaultCurrency: r.default_currency,
        warehouseLocations: r.warehouse_locations || [],
        lastQuoteDate: r.last_quote_date, rating: r.rating,
        notes: r.notes, isActive: r.is_active ?? true,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })));
    }
    setSuppliersLoading(false);
  }, []);

  const loadProcessingTypes = useCallback(async () => {
    setPtLoading(true);
    const { data } = await supabase.from('processing_types').select('*').order('sort_order');
    if (data) setProcessingTypes(data.map((r: any) => mapProcessingTypeRow(r)));
    setPtLoading(false);
  }, []);

  const loadGoodsReceipts = useCallback(async () => {
    setGrnLoading(true);
    const { data } = await supabase.from('goods_receipts').select('*').order('received_at', { ascending: false });
    if (data) {
      const receipts: GoodsReceipt[] = data.map((r: any) => ({
        id: r.id, grnNumber: r.grn_number, purchaseOrderId: r.purchase_order_id,
        poNumber: r.po_number, supplierName: r.supplier_name,
        receivedBy: r.received_by, receivedAt: r.received_at,
        deliveryNoteNumber: r.delivery_note_number, status: r.status,
        notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at,
      }));
      setGoodsReceipts(receipts);
    }
    setGrnLoading(false);
  }, []);

  const loadStockMovements = useCallback(async (ingredientId?: string) => {
    let query = supabase.from('stock_movements').select('*').order('performed_at', { ascending: false }).limit(100);
    if (ingredientId) query = query.eq('ingredient_id', ingredientId);
    const { data } = await query;
    if (data) {
      setStockMovements(data.map((r: any) => ({
        id: r.id, ingredientId: r.ingredient_id, productId: r.product_id,
        movementType: r.movement_type, quantity: r.quantity, unit: r.unit,
        referenceType: r.reference_type, referenceId: r.reference_id,
        performedBy: r.performed_by, performedAt: r.performed_at, notes: r.notes,
        lotId: r.lot_id ?? undefined,
      })));
    }
  }, []);

  const loadStockLots = useCallback(async (ingredientId?: string) => {
    let query = supabase.from('stock_lots').select('*').order('received_date', { ascending: true });
    if (ingredientId) query = query.eq('ingredient_id', ingredientId);
    query = query.neq('lot_status', 'depleted');
    const { data } = await query;
    if (data) {
      setStockLots(data.map((r: any) => ({
        id: r.id, ingredientId: r.ingredient_id, brand: r.brand ?? undefined,
        supplierId: r.supplier_id ?? undefined, supplierName: r.supplier_name ?? undefined,
        goodsReceiptItemId: r.goods_receipt_item_id ?? undefined,
        receivedDate: r.received_date, expiryDate: r.expiry_date ?? undefined,
        quantityReceived: r.quantity_received, quantityRemaining: r.quantity_remaining,
        unit: r.unit || 'lb', costPerUnit: r.cost_per_unit,
        storageLocation: r.storage_location ?? undefined,
        reservedForClientId: r.reserved_for_client_id ?? undefined,
        lotStatus: r.lot_status || 'available',
        notes: r.notes ?? undefined,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })));
    }
  }, []);

  const loadWholesaleClientsForReservation = useCallback(async () => {
    const { data } = await supabase.from('wholesale_clients').select('id, company_name').eq('is_active', true).order('company_name');
    if (data) {
      setWholesaleClients(data.map((r: any) => ({ id: r.id, companyName: r.company_name })));
    }
  }, []);

  const loadQuotesAndCatalog = useCallback(async () => {
    setQuotesLoading(true);
    const [quotesRes, itemsRes, catalogRes] = await Promise.all([
      supabase.from('supplier_quotes').select('*').order('quote_date', { ascending: false }),
      supabase.from('quote_line_items').select('*').order('created_at'),
      supabase.from('raw_material_catalog').select('*').eq('is_active', true).order('canonical_name'),
    ]);

    const loadedQuotes: SupplierQuote[] = (quotesRes.data || []).map((r: any) => ({
      id: r.id, supplierId: r.supplier_id, supplierName: r.supplier_name,
      quoteDate: r.quote_date, validUntil: r.valid_until,
      sourceType: r.source_type, sourceFileUrl: r.source_file_url,
      originalText: r.original_text, parsedAt: r.parsed_at,
      status: r.status, notes: r.notes,
      createdAt: r.created_at, updatedAt: r.updated_at,
    }));
    setQuotes(loadedQuotes);

    const loadedItems: QuoteLineItem[] = (itemsRes.data || []).map((r: any) => ({
      id: r.id, quoteId: r.quote_id, catalogId: r.catalog_id,
      originalName: r.original_name, brand: r.brand, origin: r.origin,
      storageLocation: r.storage_location, unitPrice: r.unit_price,
      currency: r.currency || 'HKD', unit: r.unit || 'lb',
      pricePerLb: r.price_per_lb, weightPerCase: r.weight_per_case,
      minOrderQty: r.min_order_qty, productCode: r.product_code,
      specs: r.specs, matchConfidence: r.match_confidence || 0,
      isConfirmed: r.is_confirmed || false, notes: r.notes,
      createdAt: r.created_at,
    }));
    setQuoteLineItems(loadedItems);

    const loadedCatalog: RawMaterialCatalog[] = (catalogRes.data || []).map((r: any) => ({
      id: r.id, canonicalName: r.canonical_name, nameEn: r.name_en,
      category: r.category, subCategory: r.sub_category,
      defaultUnit: r.default_unit || 'lb', specs: r.specs,
      notes: r.notes, isActive: r.is_active,
      createdAt: r.created_at, updatedAt: r.updated_at,
    }));
    setCatalog(loadedCatalog);

    // Build comparison rows
    buildComparisonRows(loadedItems, loadedQuotes, loadedCatalog);
    setQuotesLoading(false);
  }, []);

  const buildComparisonRows = (items: QuoteLineItem[], loadedQuotes: SupplierQuote[], loadedCatalog: RawMaterialCatalog[]) => {
    const quoteMap = new Map(loadedQuotes.map(q => [q.id, q]));
    const catalogMap = new Map(loadedCatalog.map(c => [c.id, c]));

    // Group by catalogId + brand
    const groups = new Map<string, ComparisonRow>();

    for (const item of items) {
      if (!item.catalogId) continue;
      const cat = catalogMap.get(item.catalogId);
      if (!cat) continue;
      const quote = quoteMap.get(item.quoteId);
      if (!quote) continue;

      const key = `${item.catalogId}__${item.brand || '—'}`;
      if (!groups.has(key)) {
        groups.set(key, {
          catalogId: item.catalogId,
          catalogName: cat.canonicalName,
          category: cat.category,
          brand: item.brand || '—',
          origin: item.origin,
          quotes: [],
        });
      }

      groups.get(key)!.quotes.push({
        supplierId: quote.supplierId || '',
        supplierName: quote.supplierName,
        quoteItemId: item.id,
        unitPrice: item.unitPrice,
        unit: item.unit,
        pricePerLb: item.pricePerLb ?? undefined,
        storageLocation: item.storageLocation,
        isLowest: false,
      });
    }

    // Mark lowest price per group
    for (const row of groups.values()) {
      if (row.quotes.length > 0) {
        const minPrice = Math.min(...row.quotes.map(q => q.unitPrice));
        for (const q of row.quotes) {
          q.isLowest = q.unitPrice === minPrice;
        }
      }
    }

    const rows = Array.from(groups.values()).sort((a, b) => {
      if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
      if (a.catalogName !== b.catalogName) return a.catalogName.localeCompare(b.catalogName);
      return a.brand.localeCompare(b.brand);
    });
    setComparisonRows(rows);

    // Auto expand all materials
    setExpandedMaterials(new Set(loadedCatalog.map(c => c.id)));
  };

  const loadMatProcEntries = useCallback(async () => {
    setMatProcLoading(true);
    const { data } = await supabase.from('material_processing_matrix').select('*');
    if (data) setMatProcEntries(data.map(mapMaterialProcessingRow));
    setMatProcLoading(false);
  }, []);

  useEffect(() => { loadIngredients(); loadUnits(); loadWholesaleClientsForReservation(); }, [loadIngredients, loadUnits, loadWholesaleClientsForReservation]);
  useEffect(() => {
    if (subTab === 'purchase_orders') loadPurchaseOrders();
    if (subTab === 'suppliers') loadSuppliers();
    if (subTab === 'quote_compare') { loadSuppliers(); loadQuotesAndCatalog(); }
    if (subTab === 'processing_types') loadProcessingTypes();
    if (subTab === 'goods_receiving') { loadGoodsReceipts(); loadPurchaseOrders(); }
    if (subTab === 'product_costs') { loadMatProcEntries(); loadProcessingTypes(); }
  }, [subTab, loadPurchaseOrders, loadSuppliers, loadQuotesAndCatalog, loadProcessingTypes, loadGoodsReceipts, loadMatProcEntries]);

  // ── Ingredients CRUD ──
  const filtered = ingredients.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !(i.nameEn || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    if (filterMaterialType !== 'all' && (i.materialType || 'meat') !== filterMaterialType) return false;
    return true;
  });

  const handleSaveIngredient = async () => {
    if (!editing || !editing.name?.trim()) { showToast('請輸入名稱', 'error'); return; }
    setSaving(true);
    const payload = {
      name: editing.name.trim(), name_en: editing.nameEn || null,
      base_cost_per_lb: editing.baseCostPerLb || 0, supplier: editing.supplier || null,
      market_benchmark: editing.marketBenchmark || null, unit: editing.unit || 'lb',
      category: editing.category || null, material_type: editing.materialType || 'meat',
      notes: editing.notes || null,
    };
    if (editing.isNew) {
      const { error } = await supabase.from('ingredients').insert(payload);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('原材料已新增');
    } else {
      const { error } = await supabase.from('ingredients').update(payload).eq('id', editing.id);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('原材料已更新');
    }
    setEditing(null); setSaving(false); loadIngredients();
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm('確定刪除此原材料？')) return;
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) showToast(`失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadIngredients(); }
  };

  // ── Units CRUD ──
  const handleSaveUnits = async () => {
    setUnitsSaving(true);
    try {
      await supabase.from('site_config').upsert({ id: 'custom_units', value: customUnits });
      showToast('單位設定已儲存');
    } catch (err: any) {
      showToast(`儲存失敗：${err.message}`, 'error');
    }
    setUnitsSaving(false);
  };

  // ── Purchase Order CRUD ──
  const generatePONumber = () => {
    const d = new Date();
    const prefix = `PO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const seq = String(purchaseOrders.filter(p => p.poNumber.startsWith(prefix)).length + 1).padStart(3, '0');
    return `${prefix}-${seq}`;
  };

  const filteredPOs = purchaseOrders.filter(po => {
    if (poStatusFilter !== 'all' && po.status !== poStatusFilter) return false;
    if (poSearch) {
      const q = poSearch.toLowerCase();
      return po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.lineItems.some(li => li.productName.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSavePO = async () => {
    if (!editingPO) return;
    if (!editingPO.supplierName?.trim()) { showToast('請填寫供應商名稱', 'error'); return; }
    const lines = (editingPO.lineItems || []).filter(l => l.productName);
    if (lines.length === 0) { showToast('請添加至少一項產品', 'error'); return; }
    setPOSaving(true);

    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const total = subtotal + (editingPO.tax || 0) + (editingPO.shippingCost || 0);

    const payload = {
      po_number: editingPO.poNumber || generatePONumber(),
      supplier_name: editingPO.supplierName!.trim(),
      supplier_contact: editingPO.supplierContact || null,
      supplier_phone: editingPO.supplierPhone || null,
      order_date: editingPO.orderDate || new Date().toISOString().slice(0, 10),
      expected_delivery: editingPO.expectedDelivery || null,
      status: editingPO.status || 'draft',
      line_items: lines.map(l => ({
        ingredient_id: l.ingredientId || null,
        product_name: l.productName,
        qty: l.qty, unit: l.unit, unit_cost: l.unitCost,
        line_total: l.lineTotal, received_qty: l.receivedQty, notes: l.notes,
      })),
      subtotal, tax: editingPO.tax || 0,
      shipping_cost: editingPO.shippingCost || 0,
      total, currency: editingPO.currency || 'HKD',
      payment_status: editingPO.paymentStatus || 'unpaid',
      payment_method: editingPO.paymentMethod || null,
      notes: editingPO.notes || null,
    };

    if (editingPO.isNew) {
      const { error } = await supabase.from('purchase_orders').insert(payload);
      if (error) { showToast(`儲存失敗：${error.message}`, 'error'); setPOSaving(false); return; }
      showToast('採購訂單已建立');
    } else {
      const { error } = await supabase.from('purchase_orders').update(payload).eq('id', editingPO.id);
      if (error) { showToast(`儲存失敗：${error.message}`, 'error'); setPOSaving(false); return; }
      showToast('採購訂單已更新');
    }
    setEditingPO(null); setPOSaving(false); loadPurchaseOrders();
  };

  const handleDeletePO = async (id: number) => {
    if (!confirm('確定刪除此採購訂單？')) return;
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) showToast(`失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadPurchaseOrders(); }
  };

  const updatePOLine = (idx: number, field: keyof POLineItem, value: any) => {
    if (!editingPO) return;
    const lines = [...(editingPO.lineItems || [])];
    const line = { ...lines[idx], [field]: value };
    if (field === 'qty' || field === 'unitCost') {
      line.lineTotal = (line.qty || 0) * (line.unitCost || 0);
    }
    lines[idx] = line;
    setEditingPO({ ...editingPO, lineItems: lines });
  };

  const addPOLine = () => {
    if (!editingPO) return;
    setEditingPO({ ...editingPO, lineItems: [...(editingPO.lineItems || []), { ...EMPTY_PO_LINE }] });
  };

  const removePOLine = (idx: number) => {
    if (!editingPO) return;
    const lines = (editingPO.lineItems || []).filter((_, i) => i !== idx);
    setEditingPO({ ...editingPO, lineItems: lines.length > 0 ? lines : [{ ...EMPTY_PO_LINE }] });
  };

  const poSubtotal = (editingPO?.lineItems || []).reduce((s, l) => s + (l.lineTotal || 0), 0);

  // ── Goods Receiving ──
  const generateGRNNumber = () => {
    const d = new Date();
    const prefix = `GRN-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const seq = String(goodsReceipts.filter(g => g.grnNumber.startsWith(prefix)).length + 1).padStart(3, '0');
    return `${prefix}-${seq}`;
  };

  const receivablePOs = purchaseOrders.filter(po => po.status === 'submitted' || po.status === 'partial');

  const filteredGRNs = goodsReceipts.filter(grn => {
    if (grnStatusFilter !== 'all' && grn.status !== grnStatusFilter) return false;
    if (grnSearch) {
      const q = grnSearch.toLowerCase();
      return grn.grnNumber.toLowerCase().includes(q) ||
        grn.supplierName.toLowerCase().includes(q) ||
        (grn.poNumber || '').toLowerCase().includes(q);
    }
    return true;
  });

  const startReceiving = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setReceivingItems(po.lineItems.map(li => ({
      ingredientId: li.ingredientId,
      productName: li.productName,
      orderedQty: li.qty,
      receivedQty: li.qty - (li.receivedQty || 0),
      rejectedQty: 0,
      unit: li.unit,
      unitCost: li.unitCost,
      storageLocation: '',
      brand: '',
      reservedForClientId: '',
      notes: '',
    })));
    setReceivingMeta({ deliveryNoteNumber: '', receivedBy: '', notes: '' });
    setGrnView('receive');
  };

  const handleConfirmReceipt = async () => {
    if (!receivingPO) return;
    const validItems = receivingItems.filter(i => i.receivedQty > 0);
    if (validItems.length === 0) { showToast('請填寫至少一項收貨數量', 'error'); return; }
    setGrnSaving(true);

    try {
      const grnNumber = generateGRNNumber();
      const { data: grn, error: grnErr } = await supabase.from('goods_receipts').insert({
        grn_number: grnNumber,
        purchase_order_id: receivingPO.id,
        po_number: receivingPO.poNumber,
        supplier_name: receivingPO.supplierName,
        received_by: receivingMeta.receivedBy || null,
        delivery_note_number: receivingMeta.deliveryNoteNumber || null,
        status: 'confirmed',
        notes: receivingMeta.notes || null,
      }).select().single();

      if (grnErr) throw grnErr;

      const itemPayloads = validItems.map(item => ({
        goods_receipt_id: grn.id,
        ingredient_id: item.ingredientId || null,
        product_name: item.productName,
        ordered_qty: item.orderedQty,
        received_qty: item.receivedQty,
        rejected_qty: item.rejectedQty,
        unit: item.unit,
        unit_cost: item.unitCost,
        line_total: item.receivedQty * item.unitCost,
        storage_location: item.storageLocation || null,
        brand: item.brand || null,
        reserved_for_client_id: item.reservedForClientId || null,
        notes: item.notes || null,
      }));
      const { data: insertedGrnItems, error: itemsErr } = await supabase.from('goods_receipt_items').insert(itemPayloads).select('id');
      if (itemsErr) throw itemsErr;

      // Update ingredient stock & create stock lots
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const grnItemId = insertedGrnItems?.[i]?.id;
        if (item.ingredientId) {
          const { error: stockErr } = await supabase.rpc('increment_ingredient_stock', {
            p_ingredient_id: item.ingredientId,
            p_qty: item.receivedQty,
          });
          if (stockErr) {
            const { data: curr } = await supabase.from('ingredients').select('stock_qty').eq('id', item.ingredientId).single();
            const newQty = (curr?.stock_qty || 0) + item.receivedQty;
            await supabase.from('ingredients').update({ stock_qty: newQty }).eq('id', item.ingredientId);
          }

          // Create stock lot
          const lotStatus = item.reservedForClientId ? 'reserved' : 'available';
          const { data: lotData } = await supabase.from('stock_lots').insert({
            ingredient_id: item.ingredientId,
            brand: item.brand || null,
            supplier_name: receivingPO.supplierName,
            goods_receipt_item_id: grnItemId || null,
            received_date: new Date().toISOString().slice(0, 10),
            quantity_received: item.receivedQty,
            quantity_remaining: item.receivedQty,
            unit: item.unit,
            cost_per_unit: item.unitCost,
            storage_location: item.storageLocation || null,
            reserved_for_client_id: item.reservedForClientId || null,
            lot_status: lotStatus,
            notes: item.notes || null,
          }).select('id').single();

          // Insert stock movement with lot reference
          await supabase.from('stock_movements').insert({
            ingredient_id: item.ingredientId,
            movement_type: 'receive',
            quantity: item.receivedQty,
            unit: item.unit,
            reference_type: 'goods_receipt',
            reference_id: grn.id,
            lot_id: lotData?.id || null,
            performed_by: receivingMeta.receivedBy || null,
            notes: `收貨單 ${grnNumber} — ${item.productName}${item.brand ? ` [${item.brand}]` : ''}`,
          });
        }
      }

      // Update PO line_items received_qty and status
      const updatedLines = receivingPO.lineItems.map(li => {
        const match = validItems.find(vi => vi.productName === li.productName && vi.ingredientId === li.ingredientId);
        const addedQty = match ? match.receivedQty : 0;
        return {
          ingredient_id: li.ingredientId || null,
          product_name: li.productName,
          qty: li.qty, unit: li.unit, unit_cost: li.unitCost,
          line_total: li.lineTotal,
          received_qty: (li.receivedQty || 0) + addedQty,
          notes: li.notes,
        };
      });
      const allReceived = updatedLines.every(l => l.received_qty >= l.qty);
      const someReceived = updatedLines.some(l => l.received_qty > 0);
      const newPOStatus = allReceived ? 'received' : someReceived ? 'partial' : receivingPO.status;

      await supabase.from('purchase_orders').update({
        line_items: updatedLines,
        status: newPOStatus,
      }).eq('id', receivingPO.id);

      showToast(`收貨單 ${grnNumber} 已確認，庫存已更新`);
      setReceivingPO(null);
      setGrnView('list');
      loadGoodsReceipts();
      loadPurchaseOrders();
      loadIngredients();
    } catch (err: any) {
      showToast(`收貨失敗：${err.message}`, 'error');
    }
    setGrnSaving(false);
  };

  // ── Suppliers CRUD ──
  const filteredSuppliers = suppliers.filter(s =>
    !supplierSearch ||
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (s.nameEn || '').toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const handleSaveSupplier = async () => {
    if (!editingSupplier || !editingSupplier.name?.trim()) { showToast('請輸入供應商名稱', 'error'); return; }
    setSupplierSaving(true);
    const payload = {
      name: editingSupplier.name.trim(),
      name_en: editingSupplier.nameEn || null,
      contact_name: editingSupplier.contactName || null,
      phone: editingSupplier.phone || null,
      whatsapp: editingSupplier.whatsapp || null,
      fax: editingSupplier.fax || null,
      email: editingSupplier.email || null,
      address: editingSupplier.address || null,
      payment_terms: editingSupplier.paymentTerms || 'cod',
      payment_terms_days: editingSupplier.paymentTermsDays || 0,
      credit_limit: editingSupplier.creditLimit || 0,
      default_currency: editingSupplier.defaultCurrency || 'HKD',
      warehouse_locations: editingSupplier.warehouseLocations || [],
      rating: editingSupplier.rating || null,
      notes: editingSupplier.notes || null,
      is_active: editingSupplier.isActive ?? true,
    };
    if (editingSupplier.isNew) {
      const { error } = await supabase.from('suppliers').insert(payload);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSupplierSaving(false); return; }
      showToast('供應商已新增');
    } else {
      const { error } = await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSupplierSaving(false); return; }
      showToast('供應商已更新');
    }
    setEditingSupplier(null); setSupplierSaving(false); loadSuppliers();
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('確定刪除此供應商？')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    showToast('已刪除'); loadSuppliers();
  };

  // ── Processing Types CRUD ──
  const handleSaveProcessingType = async () => {
    if (!editingPT || !editingPT.name?.trim() || !editingPT.code?.trim()) {
      showToast('請輸入代碼和名稱', 'error'); return;
    }
    setPtSaving(true);
    try {
      const row = {
        ...(editingPT.isNew ? {} : { id: editingPT.id }),
        code: editingPT.code!.trim(),
        name: editingPT.name!.trim(),
        name_en: editingPT.nameEn || null,
        spec: editingPT.spec || null,
        surcharge_pork_chicken: editingPT.surchargePorkChicken ?? 0,
        surcharge_beef_lamb_seafood: editingPT.surchargeBeefLambSeafood ?? 0,
        requires_repackaging: editingPT.requiresRepackaging ?? true,
        default_pack_weight_lb: editingPT.defaultPackWeightLb ?? null,
        sort_order: editingPT.sortOrder ?? processingTypes.length,
        is_active: editingPT.isActive ?? true,
      };
      const { error } = await supabase.from('processing_types').upsert(row);
      if (error) throw error;
      showToast(editingPT.isNew ? '已新增加工方式' : '已更新');
      setEditingPT(null);
      loadProcessingTypes();
    } catch (err: any) { showToast(`儲存失敗：${err.message}`, 'error'); }
    setPtSaving(false);
  };

  const handleDeleteProcessingType = async (pt: ProcessingType) => {
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('processing_type_id', pt.id);
    if (count && count > 0) {
      showToast(`無法刪除「${pt.name}」— 目前有 ${count} 個產品使用此加工方式`, 'error');
      return;
    }
    if (!confirm(`確定刪除「${pt.name}」？`)) return;
    const { error } = await supabase.from('processing_types').delete().eq('id', pt.id);
    if (error) { showToast(`刪除失敗：${error.message}`, 'error'); return; }
    showToast('已刪除');
    loadProcessingTypes();
  };

  // ── File helpers ──
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // strip data:…;base64,
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handlePdfFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) { showToast('請選擇 PDF 檔案', 'error'); return; }
    const newEntries = pdfs.map(f => ({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file: f,
      sourceType: 'pdf' as const,
      fileName: f.name,
      fileSize: f.size,
      status: 'idle' as const,
    }));
    setUploadEntries(prev => [...prev, ...newEntries]);
  };

  const handleAddWhatsApp = () => {
    if (!whatsAppText.trim()) return;
    setUploadEntries(prev => [...prev, {
      id: `e-${Date.now()}-wa`,
      text: whatsAppText.trim(),
      sourceType: 'whatsapp',
      fileName: 'WhatsApp 報價',
      status: 'idle',
    }]);
    setWhatsAppText('');
    setShowWhatsAppInput(false);
  };

  // ── Quote Upload & Parse ──
  const handleParseQuote = async () => {
    const validEntries = uploadEntries.filter(e => e.file || e.text?.trim());
    if (validEntries.length === 0) { showToast('請先上載 PDF 或輸入 WhatsApp 報價', 'error'); return; }
    setParsingQuote(true);

    try {
      const existingAliases: any[] = [];
      const { data: aliasData } = await supabase.from('material_aliases').select('alias_name, catalog_id').not('confirmed_by', 'is', null);
      if (aliasData) existingAliases.push(...aliasData.map((a: any) => ({ aliasName: a.alias_name, catalogId: a.catalog_id })));

      let synonyms = null;
      const { data: synData } = await supabase.from('site_config').select('value').eq('id', 'procurement_synonyms').single();
      if (synData?.value) synonyms = synData.value;

      let totalItems = 0;

      for (let ei = 0; ei < validEntries.length; ei++) {
        const entry = validEntries[ei];
        setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'parsing' } : e));

        try {
          let pdfBase64: string | undefined;
          let content: string | undefined;

          if (entry.file) {
            pdfBase64 = await fileToBase64(entry.file);
          } else if (entry.text) {
            content = entry.text;
          }

          const whAdminHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          try {
            const session = JSON.parse(localStorage.getItem('coolfood_admin_session') || '{}');
            if (session?.id) { whAdminHeaders['x-admin-id'] = session.id; whAdminHeaders['x-admin-role'] = session.role || ''; }
          } catch { /* ignore */ }
          const response = await fetch('/api/parse-supplier-quote', {
            method: 'POST',
            headers: whAdminHeaders,
            body: JSON.stringify({
              ...(pdfBase64 ? { pdfBase64 } : { content }),
              sourceType: entry.sourceType,
              existingSuppliers: suppliers.map(s => ({ id: s.id, name: s.name, nameEn: s.nameEn })),
              existingCatalog: catalog.map(c => ({ id: c.id, canonicalName: c.canonicalName, nameEn: c.nameEn, category: c.category })),
              existingAliases,
              synonyms,
            }),
          });

          if (!response.ok) {
            const errText = await response.text().catch(() => '');
            const errMsg = response.status === 404
              ? 'API 端點未部署，請先 deploy'
              : `API 錯誤 ${response.status}: ${errText.slice(0, 100)}`;
            setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', result: errMsg } : e));
            continue;
          }

          let result: any;
          try {
            result = await response.json();
          } catch {
            setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', result: '回應格式錯誤（非 JSON）' } : e));
            continue;
          }

          if (!result.ok) {
            setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', result: result.error || '解析失敗' } : e));
            continue;
          }

          const parsed = result.data;

          let supplierId: string | null = parsed.supplier?.matchedSupplierId || null;
          let supplierName = parsed.supplier?.name || '未知供應商';

          if (!supplierId && parsed.supplier?.name) {
            const match = suppliers.find(s =>
              s.name.includes(parsed.supplier.name) || parsed.supplier.name.includes(s.name) ||
              (s.nameEn && parsed.supplier.nameEn && s.nameEn.toLowerCase().includes(parsed.supplier.nameEn.toLowerCase()))
            );
            if (match) {
              supplierId = match.id;
              supplierName = match.name;
            }
          }

          if (!supplierId) {
            const shouldCreate = confirm(`報價 ${ei + 1}/${validEntries.length}：系統中未找到供應商「${supplierName}」。\n是否要新增此供應商？`);
            if (shouldCreate) {
              const { data: newSupplier, error } = await supabase.from('suppliers').insert({
                name: parsed.supplier?.name || supplierName,
                name_en: parsed.supplier?.nameEn || null,
                phone: parsed.supplier?.phone || null,
                fax: parsed.supplier?.fax || null,
                address: parsed.supplier?.address || null,
                whatsapp: parsed.supplier?.whatsapp || null,
                is_active: true,
              }).select().single();
              if (!error && newSupplier) {
                supplierId = newSupplier.id;
                suppliers.push({ id: newSupplier.id, name: supplierName, isActive: true } as Supplier);
              }
            }
          }

          const { data: savedQuote, error: quoteError } = await supabase.from('supplier_quotes').insert({
            supplier_id: supplierId,
            supplier_name: supplierName,
            quote_date: parsed.quoteDate || new Date().toISOString().slice(0, 10),
            source_type: entry.sourceType,
            original_text: entry.text || `[PDF: ${entry.fileName}]`,
            parsed_at: new Date().toISOString(),
            status: 'parsed',
          }).select().single();

          if (quoteError || !savedQuote) {
            setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', result: quoteError?.message || 'save failed' } : e));
            continue;
          }

          const lineItemsToInsert = [];
          for (const item of (parsed.items || [])) {
            let catalogId = item.matchedCatalogId || null;

            if (!catalogId && item.canonicalName) {
              const existing = catalog.find(c =>
                c.canonicalName === item.canonicalName ||
                c.canonicalName.includes(item.canonicalName) ||
                item.canonicalName.includes(c.canonicalName)
              );
              if (existing) {
                catalogId = existing.id;
              } else {
                const { data: newCat } = await supabase.from('raw_material_catalog').insert({
                  canonical_name: item.canonicalName,
                  category: detectCategory(item.canonicalName),
                  default_unit: item.unit || 'lb',
                }).select().single();
                if (newCat) {
                  catalogId = newCat.id;
                  catalog.push({
                    id: newCat.id, canonicalName: newCat.canonical_name,
                    category: newCat.category, defaultUnit: newCat.default_unit || 'lb',
                    isActive: true,
                  });
                }
              }
            }

            if (catalogId && supplierId && item.originalText) {
              await supabase.from('material_aliases').upsert({
                catalog_id: catalogId,
                supplier_id: supplierId,
                alias_name: item.originalText.slice(0, 200),
                brand: item.brand || null,
                confidence: item.matchConfidence || 0.8,
              }, { onConflict: 'supplier_id,alias_name' }).select();
            }

            lineItemsToInsert.push({
              quote_id: savedQuote.id,
              catalog_id: catalogId,
              original_name: item.originalText || item.canonicalName || '未知',
              brand: item.brand || null,
              origin: item.origin || null,
              storage_location: item.storageLocation || null,
              unit_price: item.unitPrice || 0,
              unit: item.unit || 'lb',
              weight_per_case: item.weightPerCase || null,
              product_code: item.productCode || null,
              specs: item.specs ? { raw: item.specs } : {},
              match_confidence: item.matchConfidence || 0,
              is_confirmed: false,
              notes: item.notes || null,
            });
          }

          if (lineItemsToInsert.length > 0) {
            await supabase.from('quote_line_items').insert(lineItemsToInsert);
          }

          if (supplierId) {
            await supabase.from('suppliers').update({
              last_quote_date: parsed.quoteDate || new Date().toISOString().slice(0, 10),
            }).eq('id', supplierId);
          }

          totalItems += lineItemsToInsert.length;
          setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'done', result: `${supplierName}：${lineItemsToInsert.length} 項` } : e));
        } catch (err: any) {
          setUploadEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', result: err.message } : e));
        }
      }

      showToast(`全部完成：${validEntries.length} 份報價，共 ${totalItems} 項產品`);
      loadSuppliers();
      loadQuotesAndCatalog();
    } catch (err: any) {
      showToast(`解析錯誤：${err.message}`, 'error');
    }
    setParsingQuote(false);
  };

  // ── Price selection for comparison ──
  const handleSelectPrice = (quoteItem: QuoteLineItem, row: ComparisonRow) => {
    const lowestQuote = row.quotes.reduce((min, q) => q.unitPrice < min.unitPrice ? q : min, row.quotes[0]);
    const isLowest = quoteItem.unitPrice <= lowestQuote.unitPrice;

    if (!isLowest) {
      const lowestItem = quoteLineItems.find(i => i.id === lowestQuote.quoteItemId);
      if (lowestItem) {
        setJustificationModal({
          quoteItem,
          lowestItem,
          catalogName: row.catalogName,
          brand: row.brand,
        });
        return;
      }
    }

    // Directly select — it's the lowest price
    const newSelected = new Map(selectedItems);
    const key = `${row.catalogId}__${row.brand}`;
    newSelected.set(key, quoteItem);
    setSelectedItems(newSelected);
    showToast(`已選擇 ${row.catalogName} (${row.brand})`);
  };

  const handleConfirmJustification = () => {
    if (!justificationModal) return;
    if (justificationCategory === 'other' && !justificationText.trim()) {
      showToast('請填寫原因說明', 'error');
      return;
    }

    const { quoteItem, catalogName, brand } = justificationModal;
    const newSelected = new Map(selectedItems);
    const key = `${quoteItem.catalogId}__${brand}`;

    // Attach justification to the item
    const itemWithJustification = {
      ...quoteItem,
      _justification: justificationText || JUSTIFICATION_OPTIONS.find(o => o.value === justificationCategory)?.label || '',
      _justificationCategory: justificationCategory,
    } as QuoteLineItem & { _justification: string; _justificationCategory: JustificationCategory };

    newSelected.set(key, itemWithJustification);
    setSelectedItems(newSelected);
    setJustificationModal(null);
    setJustificationText('');
    setJustificationCategory('quality');
    showToast(`已選擇 ${catalogName} (${brand}) — 已記錄原因`);
  };

  const handleGeneratePOs = async () => {
    if (selectedItems.size === 0) { showToast('請先選擇要購買的項目', 'error'); return; }

    // Group selected items by supplier
    const bySupplier = new Map<string, { supplierName: string; supplierId: string; items: any[] }>();

    for (const [key, item] of selectedItems) {
      const quote = quotes.find(q => q.id === item.quoteId);
      if (!quote) continue;
      const supplierKey = quote.supplierId || quote.supplierName;
      if (!bySupplier.has(supplierKey)) {
        bySupplier.set(supplierKey, {
          supplierName: quote.supplierName,
          supplierId: quote.supplierId || '',
          items: [],
        });
      }
      bySupplier.get(supplierKey)!.items.push({
        ...item,
        _key: key,
        _catalogName: comparisonRows.find(r => `${r.catalogId}__${r.brand}` === key)?.catalogName || item.originalName,
      });
    }

    // Create POs for each supplier
    let poCount = 0;
    for (const [, group] of bySupplier) {
      const d = new Date();
      const poNumber = `PO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(purchaseOrders.length + poCount + 1).padStart(3, '0')}`;

      const lineItems = group.items.map((item: any) => ({
        ingredient_id: null,
        product_name: `${item._catalogName} (${item.brand || '—'})`,
        qty: 0,
        unit: item.unit || 'lb',
        unit_cost: item.unitPrice,
        line_total: 0,
        received_qty: 0,
        notes: item.storageLocation ? `倉位: ${item.storageLocation}` : '',
      }));

      const supplier = suppliers.find(s => s.id === group.supplierId);
      const { data: savedPO, error } = await supabase.from('purchase_orders').insert({
        po_number: poNumber,
        supplier_name: group.supplierName,
        supplier_contact: supplier?.contactName || null,
        supplier_phone: supplier?.phone || null,
        order_date: new Date().toISOString().slice(0, 10),
        status: 'draft',
        line_items: lineItems,
        subtotal: 0, tax: 0, shipping_cost: 0, total: 0,
        currency: 'HKD', payment_status: 'unpaid',
      }).select().single();

      if (savedPO) {
        // Save purchase decisions
        for (const item of group.items) {
          const row = comparisonRows.find(r => `${r.catalogId}__${r.brand}` === item._key);
          if (!row) continue;
          const lowestQuote = row.quotes.reduce((min, q) => q.unitPrice < min.unitPrice ? q : min, row.quotes[0]);
          const lowestQuoteItem = quoteLineItems.find(i => i.id === lowestQuote.quoteItemId);
          const lowestQuoteObj = quotes.find(q => q.id === lowestQuoteItem?.quoteId);

          await supabase.from('purchase_decisions').insert({
            catalog_id: item.catalogId || null,
            brand: item.brand || null,
            selected_quote_item_id: item.id,
            selected_supplier_id: group.supplierId || null,
            selected_supplier_name: group.supplierName,
            selected_price: item.unitPrice,
            selected_unit: item.unit || 'lb',
            lowest_quote_item_id: lowestQuote.quoteItemId,
            lowest_supplier_name: lowestQuoteObj?.supplierName || '',
            lowest_price: lowestQuote.unitPrice,
            justification: (item as any)._justification || null,
            justification_category: (item as any)._justificationCategory || null,
            decided_by: 'buyer',
            purchase_order_id: savedPO.id,
          });
        }
        poCount++;
      }
    }

    showToast(`已生成 ${poCount} 張購買訂單`);
    setSelectedItems(new Map());
    loadPurchaseOrders();
    setSubTab('purchase_orders');
  };

  // ── Helpers ──
  const detectCategory = (name: string): string => {
    if (/牛|肥牛|牛肋|牛冧|牛林|牛腩|金錢肚|金展|針扒|肉眼|西冷|T骨/.test(name)) return '牛肉';
    if (/豬|梅肉|豬扒|肋排|腩|豬手|豬爭|豬腳|豬頸|豬面|大腸|免治|赤肉/.test(name)) return '豬肉';
    if (/雞|雞翼|雞扒|雞腳|雞脾|春雞|雞中翼|雞腎|雞膝|火雞/.test(name)) return '雞肉';
    if (/鴨|鵝|鴨胸|鴨脾|鴨舌|鵝腸|鵝腳|鷓鴣|鵪鶉/.test(name)) return '鵝鴨類';
    if (/魚|蝦|海鮮|魷|蟹|蜆|帶子|鮑/.test(name)) return '海鮮';
    if (/薯|菜|粟米|青豆|菠菜|什菜/.test(name)) return '蔬菜/薯類';
    if (/腸|丸|餃|燒賣|春卷|咖喱角|火腿|煙肉|煙腩/.test(name)) return '加工品';
    return '其他';
  };

  // ── Derived data for comparison filters ──
  const allBrands = useMemo(() => {
    const brands = new Set<string>();
    comparisonRows.forEach(r => brands.add(r.brand));
    return Array.from(brands).sort();
  }, [comparisonRows]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    comparisonRows.forEach(r => { if (r.category) cats.add(r.category); });
    return Array.from(cats).sort();
  }, [comparisonRows]);

  const filteredComparison = comparisonRows.filter(r => {
    if (quoteCategoryFilter !== 'all' && r.category !== quoteCategoryFilter) return false;
    if (quoteBrandFilter !== 'all' && r.brand !== quoteBrandFilter) return false;
    if (quoteSearch) {
      const q = quoteSearch.toLowerCase();
      return r.catalogName.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by catalogId for collapsible display
  const groupedComparison = useMemo(() => {
    const groups = new Map<string, { catalogName: string; category?: string; rows: ComparisonRow[] }>();
    for (const row of filteredComparison) {
      if (!groups.has(row.catalogId)) {
        groups.set(row.catalogId, { catalogName: row.catalogName, category: row.category, rows: [] });
      }
      groups.get(row.catalogId)!.rows.push(row);
    }
    return Array.from(groups.entries());
  }, [filteredComparison]);

  const uniqueSupplierNames = useMemo(() => {
    const names = new Set<string>();
    comparisonRows.forEach(r => r.quotes.forEach(q => names.add(q.supplierName)));
    return Array.from(names).sort();
  }, [comparisonRows]);

  // ── Render ──
  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { id: 'ingredients' as SubTab, label: '原材料', icon: <Layers size={16} /> },
          { id: 'suppliers' as SubTab, label: '供應商', icon: <Building2 size={16} /> },
          { id: 'quote_compare' as SubTab, label: '報價比較', icon: <BarChart3 size={16} /> },
          { id: 'purchase_orders' as SubTab, label: '購買訂單', icon: <ShoppingCart size={16} /> },
          { id: 'goods_receiving' as SubTab, label: '收貨入倉', icon: <PackageCheck size={16} /> },
          { id: 'processing_types' as SubTab, label: '加工方式', icon: <Scissors size={16} /> },
          { id: 'product_costs' as SubTab, label: '產品成本一覽', icon: <Coins size={16} /> },
          { id: 'reorder_alerts' as SubTab, label: '補貨預警', icon: <AlertTriangle size={16} /> },
          { id: 'units' as SubTab, label: '單位管理', icon: <Filter size={16} /> },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              subTab === tab.id
                ? tab.id === 'quote_compare' ? 'bg-indigo-600 text-white shadow-lg'
                  : tab.id === 'goods_receiving' ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.id === 'quote_compare' && selectedItems.size > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-[10px]">{selectedItems.size}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 原材料 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'ingredients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋原材料..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                <option value="all">所有類別</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
              <select value={filterMaterialType} onChange={e => setFilterMaterialType(e.target.value as any)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                <option value="all">所有類型</option>
                {MATERIAL_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button onClick={() => setEditing({ isNew: true, unit: 'lb', baseCostPerLb: 0, materialType: 'meat' })} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800">
              <Plus size={14} /> 新增原材料
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <Layers size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">暫無原材料記錄</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">名稱</th>
                    <th className="px-4 py-3 text-left">類別</th>
                    <th className="px-4 py-3 text-center">單位</th>
                    <th className="px-4 py-3 text-right">庫存</th>
                    <th className="px-4 py-3 text-right">待出</th>
                    <th className="px-4 py-3 text-right">待入</th>
                    <th className="px-4 py-3 text-right">成本/單位</th>
                    <th className="px-4 py-3 text-left">供應商</th>
                    <th className="px-4 py-3 text-center">類型</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ing => {
                    const cat = categories.find(c => c.name === ing.category);
                    return (
                      <tr key={ing.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                        <td className="px-5 py-3">
                          <p className="font-black text-slate-800">{ing.name}</p>
                          {ing.nameEn && <p className="text-[10px] text-slate-400">{ing.nameEn}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{cat ? `${cat.emoji} ${cat.name}` : ing.category || '—'}</td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{ing.unit}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-black text-xs ${
                            (ing.stockQty || 0) <= 0 ? 'text-slate-300' :
                            ing.minStockAlert && (ing.stockQty || 0) <= ing.minStockAlert ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {(ing.stockQty || 0).toFixed(1)}
                          </span>
                          {ing.minStockAlert && (ing.stockQty || 0) <= ing.minStockAlert && (ing.stockQty || 0) > 0 && (
                            <AlertTriangle size={10} className="inline ml-1 text-amber-500" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-[10px] text-rose-400">{(ing.committedQty || 0) > 0 ? (ing.committedQty || 0).toFixed(1) : '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-[10px] text-blue-400">{(ing.incomingQty || 0) > 0 ? (ing.incomingQty || 0).toFixed(1) : '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-800">${ing.baseCostPerLb.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{ing.supplier || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${(ing.materialType || 'meat') === 'meat' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            {(ing.materialType || 'meat') === 'meat' ? '🥩 肉類' : '📦 第三方'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setLotsIngredientId(ing.id); loadStockLots(ing.id); setShowLots(true); }}
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600"
                              title="庫存批次"
                            ><Layers size={13} /></button>
                            <button
                              onClick={() => { setMovementsIngredientId(ing.id); loadStockMovements(ing.id); setShowMovements(true); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                              title="進出記錄"
                            ><History size={13} /></button>
                            <button onClick={() => setEditing({ ...ing, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                            <button onClick={() => handleDeleteIngredient(ing.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">共 {filtered.length} 項原材料</div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 供應商 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)} placeholder="搜尋供應商..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
            </div>
            <button onClick={() => setEditingSupplier({ isNew: true, isActive: true, defaultCurrency: 'HKD', paymentTerms: 'cod' })} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800">
              <Plus size={14} /> 新增供應商
            </button>
          </div>

          {suppliersLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <Building2 size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">尚未建立供應商</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm text-slate-900 truncate">{s.name}</p>
                        {!s.isActive && <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-black">停用</span>}
                        {s.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: s.rating }).map((_, i) => (
                              <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>
                      {s.nameEn && <p className="text-[10px] text-slate-400 font-bold">{s.nameEn}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500">
                        {s.contactName && <span className="flex items-center gap-1"><Building2 size={10} /> {s.contactName}</span>}
                        {s.phone && <span className="flex items-center gap-1"><Phone size={10} /> {s.phone}</span>}
                        {s.whatsapp && <span className="flex items-center gap-1"><MessageSquare size={10} /> {s.whatsapp}</span>}
                        {s.email && <span className="flex items-center gap-1"><Mail size={10} /> {s.email}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.paymentTerms && s.paymentTerms !== 'cod' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">
                            <Clock size={8} className="inline mr-0.5" />
                            {s.paymentTerms === '7days' ? '7天' : s.paymentTerms === '14days' ? '14天' : s.paymentTerms === '15days' ? '15天' : s.paymentTerms === '30days' ? '30天' : s.paymentTerms === '60days' ? '60天' : s.paymentTerms}
                          </span>
                        )}
                        {(s.warehouseLocations || []).map(w => (
                          <span key={w} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                            <MapPin size={8} className="inline mr-0.5" /> {w}
                          </span>
                        ))}
                        {s.lastQuoteDate && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">
                            最後報價: {s.lastQuoteDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingSupplier({ ...s, isNew: false })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteSupplier(s.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 報價比較 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'quote_compare' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={quoteSearch} onChange={e => setQuoteSearch(e.target.value)} placeholder="搜尋原材料..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
              </div>
              <select value={quoteCategoryFilter} onChange={e => setQuoteCategoryFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                <option value="all">所有類別</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={quoteBrandFilter} onChange={e => setQuoteBrandFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                <option value="all">所有品牌</option>
                {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <button onClick={handleGeneratePOs} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 shadow-lg">
                  <ShoppingCart size={14} /> 生成購買訂單 ({selectedItems.size})
                </button>
              )}
              <button onClick={() => {
                setUploadEntries([]);
                setShowWhatsAppInput(false);
                setWhatsAppText('');
                setShowUploadModal(true);
              }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg">
                <Upload size={14} /> 上載報價
              </button>
            </div>
          </div>

          {/* Quote summary cards */}
          {quotes.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {quotes.slice(0, 10).map(q => (
                <div key={q.id} className="flex-shrink-0 bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="font-black text-xs text-slate-800">{q.supplierName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold">{q.quoteDate}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                      q.sourceType === 'pdf' ? 'bg-blue-50 text-blue-500' : q.sourceType === 'whatsapp' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {q.sourceType === 'pdf' ? 'PDF' : q.sourceType === 'whatsapp' ? 'WhatsApp' : '手動'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Table */}
          {quotesLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : groupedComparison.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <BarChart3 size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">尚無報價資料</p>
              <p className="text-[10px] text-slate-300 mt-1">按「上載報價」直接上傳供應商 PDF 報價單，AI 會自動閱讀解析</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3 text-left sticky left-0 bg-slate-50 z-10 min-w-[200px]">原材料 / 品牌</th>
                      {uniqueSupplierNames.map(name => (
                        <th key={name} className="px-4 py-3 text-center min-w-[130px]">{name}</th>
                      ))}
                      <th className="px-4 py-3 text-center w-16">已選</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedComparison.map(([catalogId, group]) => {
                      const isExpanded = expandedMaterials.has(catalogId);
                      return (
                        <React.Fragment key={catalogId}>
                          {/* Material header row */}
                          <tr
                            className="bg-slate-50/50 cursor-pointer hover:bg-slate-100/50"
                            onClick={() => {
                              const next = new Set(expandedMaterials);
                              if (isExpanded) next.delete(catalogId); else next.add(catalogId);
                              setExpandedMaterials(next);
                            }}
                          >
                            <td className="px-5 py-2.5 sticky left-0 bg-slate-50/50 z-10" colSpan={uniqueSupplierNames.length + 2}>
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                <span className="font-black text-slate-800">{group.catalogName}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{group.category}</span>
                                <span className="text-[10px] text-slate-300 font-bold">({group.rows.length} 品牌)</span>
                              </div>
                            </td>
                          </tr>

                          {/* Brand rows */}
                          {isExpanded && group.rows.map(row => {
                            const selKey = `${row.catalogId}__${row.brand}`;
                            const isSelected = selectedItems.has(selKey);
                            const selectedItem = selectedItems.get(selKey);

                            return (
                              <tr key={selKey} className={`border-t border-slate-50 ${isSelected ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'}`}>
                                <td className="px-5 py-2.5 pl-10 sticky left-0 bg-white z-10">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600">{row.brand}</span>
                                    {row.origin && <span className="text-[10px] text-slate-400">({row.origin})</span>}
                                  </div>
                                </td>
                                {uniqueSupplierNames.map(sName => {
                                  const quote = row.quotes.find(q => q.supplierName === sName);
                                  if (!quote) return <td key={sName} className="px-4 py-2.5 text-center text-slate-200 text-xs">—</td>;

                                  const qi = quoteLineItems.find(i => i.id === quote.quoteItemId);
                                  const isThisSelected = selectedItem?.id === quote.quoteItemId;

                                  return (
                                    <td key={sName} className="px-4 py-2.5 text-center">
                                      <button
                                        onClick={() => qi && handleSelectPrice(qi, row)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                          isThisSelected
                                            ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-300'
                                            : quote.isLowest
                                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200'
                                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                        }`}
                                      >
                                        ${quote.unitPrice.toFixed(2)}
                                        <span className="text-[9px] font-bold opacity-60">/{quote.unit}</span>
                                        {quote.isLowest && !isThisSelected && <Star size={8} className="inline ml-1 text-emerald-500 fill-emerald-500" />}
                                      </button>
                                      {quote.storageLocation && (
                                        <p className="text-[9px] text-slate-400 mt-0.5">{quote.storageLocation}</p>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="px-4 py-2.5 text-center">
                                  {isSelected && <Check size={16} className="text-emerald-600 mx-auto" />}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  共 {comparisonRows.length} 項 · {uniqueSupplierNames.length} 家供應商 · {quotes.length} 份報價單
                </span>
                {selectedItems.size > 0 && (
                  <button onClick={() => setSelectedItems(new Map())} className="text-[10px] text-rose-500 font-bold hover:underline">
                    清除所有選擇
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 購買訂單 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={poSearch} onChange={e => setPOSearch(e.target.value)} placeholder="搜尋訂單/供應商..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
              </div>
              <select value={poStatusFilter} onChange={e => setPOStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                <option value="all">所有狀態</option>
                {Object.entries(PO_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <button
              onClick={() => setEditingPO({
                isNew: true, poNumber: generatePONumber(), status: 'draft',
                orderDate: new Date().toISOString().slice(0, 10), currency: 'HKD',
                paymentStatus: 'unpaid', lineItems: [{ ...EMPTY_PO_LINE }],
                subtotal: 0, tax: 0, shippingCost: 0, total: 0,
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow-lg"
            >
              <Plus size={14} /> 新增購買訂單
            </button>
          </div>

          {poLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : filteredPOs.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <ShoppingCart size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">暫無購買訂單</p>
              <p className="text-[10px] text-slate-300 mt-1">按「新增購買訂單」向供應商落單</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">單號</th>
                    <th className="px-4 py-3 text-left">供應商</th>
                    <th className="px-4 py-3 text-center">下單日</th>
                    <th className="px-4 py-3 text-center">預計到貨</th>
                    <th className="px-4 py-3 text-center">項數</th>
                    <th className="px-4 py-3 text-right">金額</th>
                    <th className="px-4 py-3 text-center">狀態</th>
                    <th className="px-4 py-3 text-center">付款</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map(po => (
                    <tr key={po.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                      <td className="px-5 py-3 font-black text-blue-600 text-xs">{po.poNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 text-xs">{po.supplierName}</p>
                        {po.supplierContact && <p className="text-[10px] text-slate-400">{po.supplierContact}</p>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{po.orderDate}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{po.expectedDelivery || '—'}</td>
                      <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{po.lineItems.length}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-800">${po.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${PO_STATUS_MAP[po.status]?.color || 'bg-slate-100 text-slate-500'}`}>
                          {PO_STATUS_MAP[po.status]?.label || po.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${PAYMENT_STATUS_MAP[po.paymentStatus]?.color || 'bg-slate-100 text-slate-500'}`}>
                          {PAYMENT_STATUS_MAP[po.paymentStatus]?.label || po.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingPO({ ...po, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                          <button onClick={() => handleDeletePO(po.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">共 {filteredPOs.length} 筆訂單</div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 收貨入倉 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'goods_receiving' && (
        <div className="space-y-4">
          {grnView === 'list' ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={grnSearch} onChange={e => setGrnSearch(e.target.value)} placeholder="搜尋收貨單/供應商..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
                  </div>
                  <select value={grnStatusFilter} onChange={e => setGrnStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                    <option value="all">所有狀態</option>
                    {Object.entries(GRN_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Receivable POs section */}
              {receivablePOs.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownToLine size={16} className="text-blue-600" />
                    <h4 className="font-black text-sm text-blue-900">待收貨訂單</h4>
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-black">{receivablePOs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {receivablePOs.map(po => {
                      const totalOrdered = po.lineItems.reduce((s, l) => s + l.qty, 0);
                      const totalReceived = po.lineItems.reduce((s, l) => s + (l.receivedQty || 0), 0);
                      const pct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
                      return (
                        <div key={po.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm border border-blue-50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-blue-600 text-xs">{po.poNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${PO_STATUS_MAP[po.status]?.color || ''}`}>
                                {PO_STATUS_MAP[po.status]?.label || po.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-0.5">{po.supplierName}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-slate-400 font-bold">{po.lineItems.length} 項</span>
                              <span className="text-[10px] text-slate-400 font-bold">預計 {po.expectedDelivery || '未定'}</span>
                              <span className="text-[10px] text-slate-400 font-bold">${po.total.toFixed(2)}</span>
                            </div>
                            {pct > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400">{pct}%</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => startReceiving(po)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 shadow-lg shrink-0"
                          >
                            <ClipboardCheck size={14} /> 點貨收貨
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GRN history */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History size={16} className="text-slate-400" />
                  <h4 className="font-black text-sm text-slate-700">收貨記錄</h4>
                </div>
                {grnLoading ? (
                  <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
                ) : filteredGRNs.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                    <PackageCheck size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">暫無收貨記錄</p>
                    <p className="text-[10px] text-slate-300 mt-1">選擇上方待收貨訂單開始點貨</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-5 py-3 text-left">收貨單號</th>
                          <th className="px-4 py-3 text-left">採購單</th>
                          <th className="px-4 py-3 text-left">供應商</th>
                          <th className="px-4 py-3 text-center">收貨日期</th>
                          <th className="px-4 py-3 text-left">送貨單號</th>
                          <th className="px-4 py-3 text-left">收貨人</th>
                          <th className="px-4 py-3 text-center">狀態</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGRNs.map(grn => (
                          <tr key={grn.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                            <td className="px-5 py-3 font-black text-emerald-600 text-xs">{grn.grnNumber}</td>
                            <td className="px-4 py-3 text-xs font-bold text-blue-600">{grn.poNumber || '—'}</td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{grn.supplierName}</td>
                            <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">
                              {grn.receivedAt ? new Date(grn.receivedAt).toLocaleDateString('zh-HK') : '—'}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-500">{grn.deliveryNoteNumber || '—'}</td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-500">{grn.receivedBy || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${GRN_STATUS_MAP[grn.status]?.color || 'bg-slate-100 text-slate-500'}`}>
                                {GRN_STATUS_MAP[grn.status]?.label || grn.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">共 {filteredGRNs.length} 筆記錄</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ── Receiving form (點貨) ── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setGrnView('list'); setReceivingPO(null); }} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400">
                    <X size={16} />
                  </button>
                  <div>
                    <h3 className="font-black text-lg">點貨收貨</h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      採購單 <span className="text-blue-600">{receivingPO?.poNumber}</span> — {receivingPO?.supplierName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receiving metadata */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">供應商送貨單號</label>
                    <input
                      value={receivingMeta.deliveryNoteNumber}
                      onChange={e => setReceivingMeta({ ...receivingMeta, deliveryNoteNumber: e.target.value })}
                      placeholder="例：DN-2026-001"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">收貨人</label>
                    <input
                      value={receivingMeta.receivedBy}
                      onChange={e => setReceivingMeta({ ...receivingMeta, receivedBy: e.target.value })}
                      placeholder="姓名"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                    <input
                      value={receivingMeta.notes}
                      onChange={e => setReceivingMeta({ ...receivingMeta, notes: e.target.value })}
                      placeholder="任何附加說明"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3 text-left">品名</th>
                      <th className="px-4 py-3 text-center">訂購量</th>
                      <th className="px-4 py-3 text-center">已收量</th>
                      <th className="px-4 py-3 text-center w-28">本次收貨</th>
                      <th className="px-4 py-3 text-center w-24">退回數量</th>
                      <th className="px-4 py-3 text-center">單位</th>
                      <th className="px-4 py-3 text-right">單價</th>
                      <th className="px-4 py-3 text-right">小計</th>
                      <th className="px-4 py-3 text-left w-28">品牌</th>
                      <th className="px-4 py-3 text-left w-36">客戶預留</th>
                      <th className="px-4 py-3 text-left w-28">存放位置</th>
                      <th className="px-4 py-3 text-left w-28">備註</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivingItems.map((item, idx) => {
                      const poLine = receivingPO?.lineItems[idx];
                      const prevReceived = poLine?.receivedQty || 0;
                      const remaining = item.orderedQty - prevReceived;
                      return (
                        <tr key={idx} className="border-t border-slate-50">
                          <td className="px-5 py-3">
                            <p className="font-bold text-slate-800 text-xs">{item.productName}</p>
                            {item.ingredientId && <p className="text-[10px] text-slate-400">ID: {item.ingredientId.slice(0, 8)}</p>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{item.orderedQty}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-slate-400">{prevReceived}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number" min={0} max={remaining}
                              value={item.receivedQty}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], receivedQty: val };
                                setReceivingItems(items);
                              }}
                              className={`w-20 px-2 py-1.5 text-center rounded-lg border text-xs font-black ${
                                item.receivedQty > 0 ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number" min={0}
                              value={item.rejectedQty}
                              onChange={e => {
                                const val = Math.max(0, Number(e.target.value));
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], rejectedQty: val };
                                setReceivingItems(items);
                              }}
                              className={`w-16 px-2 py-1.5 text-center rounded-lg border text-xs font-black ${
                                item.rejectedQty > 0 ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 bg-slate-50'
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{item.unit}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-slate-600">${item.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-xs font-black text-slate-800">${(item.receivedQty * item.unitCost).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <input
                              value={item.brand}
                              onChange={e => {
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], brand: e.target.value };
                                setReceivingItems(items);
                              }}
                              placeholder="品牌名稱"
                              className="w-full px-2 py-1.5 bg-violet-50 border border-violet-100 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.reservedForClientId}
                              onChange={e => {
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], reservedForClientId: e.target.value };
                                setReceivingItems(items);
                              }}
                              className={`w-full px-2 py-1.5 border rounded-lg text-xs font-bold ${item.reservedForClientId ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100'}`}
                            >
                              <option value="">不預留</option>
                              {wholesaleClients.map(c => (
                                <option key={c.id} value={c.id}>{c.companyName}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={item.storageLocation}
                              onChange={e => {
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], storageLocation: e.target.value };
                                setReceivingItems(items);
                              }}
                              placeholder="倉位"
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={item.notes}
                              onChange={e => {
                                const items = [...receivingItems];
                                items[idx] = { ...items[idx], notes: e.target.value };
                                setReceivingItems(items);
                              }}
                              placeholder="備註"
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500">
                    合計：<span className="font-black text-slate-800">${receivingItems.reduce((s, i) => s + i.receivedQty * i.unitCost, 0).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {receivingItems.filter(i => i.rejectedQty > 0).length > 0 && (
                      <span className="text-rose-500">
                        有 {receivingItems.filter(i => i.rejectedQty > 0).length} 項退回
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setGrnView('list'); setReceivingPO(null); }}
                  className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmReceipt}
                  disabled={grnSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 shadow-lg disabled:opacity-50"
                >
                  {grnSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  確認收貨入倉
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 加工方式 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'processing_types' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><Scissors size={18} /></div>
              <div>
                <h4 className="font-black text-lg">加工方式管理</h4>
                <p className="text-[10px] text-slate-400 font-bold">定義切片、切粒、切絲等加工方式及收費標準</p>
              </div>
            </div>
            <button onClick={() => setEditingPT({ isNew: true, code: '', name: '', surchargePorkChicken: 1.5, surchargeBeefLambSeafood: 2.0, requiresRepackaging: true, defaultPackWeightLb: 5, sortOrder: processingTypes.length, isActive: true })} className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black shadow-lg active:scale-95 transition-all">
              <Plus size={16} /> 新增加工方式
            </button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {ptLoading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw size={20} className="animate-spin text-slate-300" /></div>
            ) : processingTypes.length === 0 ? (
              <div className="text-center py-20 text-slate-300 font-bold text-sm">尚未建立加工方式</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left px-5 py-3">代碼</th>
                    <th className="text-left px-4 py-3">名稱</th>
                    <th className="text-left px-4 py-3">英文</th>
                    <th className="text-left px-4 py-3">規格</th>
                    <th className="text-right px-4 py-3">豬雞費/磅</th>
                    <th className="text-right px-4 py-3">牛羊海鮮費/磅</th>
                    <th className="text-center px-4 py-3">重包裝</th>
                    <th className="text-right px-4 py-3">預設包裝規格</th>
                    <th className="text-center px-4 py-3">狀態</th>
                    <th className="text-right px-4 py-3 w-24">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processingTypes.map(pt => (
                    <tr key={pt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-violet-600">{pt.code}</td>
                      <td className="px-4 py-3 font-black text-slate-800">{pt.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{pt.nameEn || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{pt.spec || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">${pt.surchargePorkChicken.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">${pt.surchargeBeefLambSeafood.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">{pt.requiresRepackaging ? <Check size={14} className="text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-right text-xs">{(() => {
                        const wt = pt.defaultPackWeightLb;
                        const reverseMap: Record<number, string> = { 1: '1磅/包', 2: '2磅/包', 5: '5磅/包', 10: '10磅/箱', 0.66: '300g/包', 1.1: '500g/包', 2.2: '1kg/包', 11: '5kg/包' };
                        return wt ? (reverseMap[wt] || `${wt}磅`) : '—';
                      })()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${pt.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{pt.isActive ? '啟用' : '停用'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditingPT({ ...pt, isNew: false })} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"><Edit size={14} /></button>
                          <button onClick={() => handleDeleteProcessingType(pt)} className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-violet-500">
              標準規格參考：扒 3分/4分厚 | 絲 6MM | 片 2MM / 4MM | 丁 6分×6分 | 粒 1吋×1吋
            </p>
            <p className="text-[10px] font-bold text-violet-400 mt-1">
              加工費標準：豬雞 +$1.5/磅 | 牛羊海鮮 +$2.0/磅（可按需自訂）
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 編輯加工方式 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingPT && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditingPT(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editingPT.isNew ? '新增加工方式' : '編輯加工方式'}</h3>
              <button onClick={() => setEditingPT(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">代碼 (英文) *</label>
                  <input value={editingPT.code || ''} onChange={e => setEditingPT({ ...editingPT, code: e.target.value.replace(/\s/g, '').toLowerCase() })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm font-mono" placeholder="例: slice" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">名稱 (中文) *</label>
                  <input value={editingPT.name || ''} onChange={e => setEditingPT({ ...editingPT, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例: 切片" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">英文名稱</label>
                  <input value={editingPT.nameEn || ''} onChange={e => setEditingPT({ ...editingPT, nameEn: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例: Sliced" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">規格描述</label>
                  <input value={editingPT.spec || ''} onChange={e => setEditingPT({ ...editingPT, spec: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例: 2MM / 4MM" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">豬雞 加工費/磅</label>
                  <input type="number" step="0.1" min="0" value={editingPT.surchargePorkChicken ?? ''} onChange={e => setEditingPT({ ...editingPT, surchargePorkChicken: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">牛羊海鮮 加工費/磅</label>
                  <input type="number" step="0.1" min="0" value={editingPT.surchargeBeefLambSeafood ?? ''} onChange={e => setEditingPT({ ...editingPT, surchargeBeefLambSeafood: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">預設包裝規格</label>
                  <select value={(() => {
                    const wt = editingPT.defaultPackWeightLb;
                    const reverseMap: Record<number, string> = { 1: '1磅/包', 2: '2磅/包', 5: '5磅/包', 10: '10磅/箱', 0.66: '300g/包', 1.1: '500g/包', 2.2: '1kg/包', 11: '5kg/包' };
                    return wt ? (reverseMap[wt] || '') : '';
                  })()} onChange={e => {
                    const val = e.target.value;
                    const weightMap: Record<string, number> = { '1磅/包': 1, '2磅/包': 2, '5磅/包': 5, '10磅/箱': 10, '300g/包': 0.66, '500g/包': 1.1, '1kg/包': 2.2, '5kg/包': 11 };
                    setEditingPT({ ...editingPT, defaultPackWeightLb: weightMap[val] || undefined });
                  }} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="">— 不設定 —</option>
                    <option value="1磅/包">1磅/包</option>
                    <option value="2磅/包">2磅/包</option>
                    <option value="5磅/包">5磅/包</option>
                    <option value="10磅/箱">10磅/箱</option>
                    <option value="300g/包">300g/包</option>
                    <option value="500g/包">500g/包</option>
                    <option value="1kg/包">1kg/包</option>
                    <option value="5kg/包">5kg/包</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">排序</label>
                  <input type="number" min="0" value={editingPT.sortOrder ?? 0} onChange={e => setEditingPT({ ...editingPT, sortOrder: parseInt(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPT.requiresRepackaging ?? true} onChange={e => setEditingPT({ ...editingPT, requiresRepackaging: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-xs font-bold text-slate-600">需要重新包裝</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPT.isActive ?? true} onChange={e => setEditingPT({ ...editingPT, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-xs font-bold text-slate-600">啟用</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditingPT(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleSaveProcessingType} disabled={ptSaving} className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-black hover:bg-violet-700 disabled:opacity-50">
                {ptSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 產品成本一覽 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'product_costs' && (() => {
        const costsWsRules: WholesalePricingRules = siteConfig.wholesalePricingRules || { targetMarginFactor: 0.88, priceTiers: [] };
        if (!costsWsRules.priceTiers) costsWsRules.priceTiers = [];

        const costsFilteredProducts = products.filter(p => {
          const ch = p.saleChannel || 'retail';
          if (costsChannelFilter === 'retail') return ch === 'retail' || ch === 'both';
          if (costsChannelFilter === 'wholesale') return ch === 'wholesale' || ch === 'both';
          return true;
        });

        const ingredientGroupsMap = new Map<string, { ingredient: Ingredient; products: Product[] }>();
        const unlinkedProducts: Product[] = [];
        costsFilteredProducts.forEach(p => {
          const ing = p.ingredientId ? ingredients.find(i => i.id === p.ingredientId) : null;
          if (ing) {
            if (!ingredientGroupsMap.has(ing.id)) ingredientGroupsMap.set(ing.id, { ingredient: ing, products: [] });
            ingredientGroupsMap.get(ing.id)!.products.push(p);
          } else {
            unlinkedProducts.push(p);
          }
        });
        const ingredientGroups = {
          linked: Array.from(ingredientGroupsMap.values()).sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name)),
          unlinked: unlinkedProducts,
        };

        const getMatEntry = (ingredientId: string, processingTypeId: string) =>
          matProcEntries.find(e => e.ingredientId === ingredientId && e.processingTypeId === processingTypeId);

        const updateMatEntry = async (ingredientId: string, processingTypeId: string, field: 'yieldRateOverride' | 'surchargeOverride', value: number | undefined) => {
          const existing = getMatEntry(ingredientId, processingTypeId);
          if (existing) {
            const updates: any = {};
            if (field === 'yieldRateOverride') updates.yield_rate_override = value ?? null;
            if (field === 'surchargeOverride') updates.surcharge_override = value ?? null;
            await supabase.from('material_processing_matrix').update(updates).eq('id', existing.id);
            setMatProcEntries(prev => prev.map(e => e.id === existing.id ? { ...e, [field]: value } : e));
          } else {
            const newEntry = {
              ingredient_id: ingredientId,
              processing_type_id: processingTypeId,
              yield_rate_override: field === 'yieldRateOverride' ? value : null,
              surcharge_override: field === 'surchargeOverride' ? value : null,
              is_available: true,
            };
            const { data } = await supabase.from('material_processing_matrix').insert(newEntry).select('*').single();
            if (data) setMatProcEntries(prev => [...prev, mapMaterialProcessingRow(data)]);
          }
        };

        const saveCostItemsToDb = async () => {
          try {
            await supabase.from('site_config').upsert({ id: 'cost_items', value: costItems });
            showToast('成本項目已儲存');
          } catch (err: any) { showToast(`儲存失敗：${err.message}`, 'error'); }
        };

        const saveAllProductCosts = async () => {
          try {
            for (const p of costsFilteredProducts) {
              await supabase.from('products').update({
                cost_price: p.costPrice ?? null,
                cost_item_ids: p.costItemIds ?? null,
                ingredient_id: p.ingredientId ?? null,
                yield_rate: p.yieldRate ?? null,
                processing_cost: p.processingCost ?? null,
                packaging_cost: p.packagingCost ?? null,
                misc_cost: p.miscCost ?? null,
              }).eq('id', p.id);
            }
            showToast('所有產品成本已儲存');
          } catch (err: any) { showToast(`儲存失敗：${err.message}`, 'error'); }
        };

        return (
          <div className="space-y-8">
            {/* Channel filter + save */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                {(['all', 'retail', 'wholesale'] as const).map(ch => (
                  <button key={ch} onClick={() => setCostsChannelFilter(ch)}
                    className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${costsChannelFilter === ch ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                    {ch === 'all' ? '全部' : ch === 'retail' ? '零售' : '批發'}
                  </button>
                ))}
              </div>
              <button onClick={saveAllProductCosts}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center gap-1.5">
                <Save size={14}/> 全部儲存
              </button>
            </div>

            {/* Cost Items editor */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Coins size={16}/></div>
                  <div>
                    <h4 className="font-black text-sm">附加成本項目</h4>
                    <p className="text-[10px] text-slate-400 font-bold">碟、袋等可勾選的附加成本</p>
                  </div>
                </div>
                <button onClick={saveCostItemsToDb} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1"><Save size={12}/> 儲存</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {costItems.map(ci => (
                  <div key={ci.id} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                    <input value={ci.name} onChange={e => setCostItems(prev => prev.map(x => x.id === ci.id ? { ...x, name: e.target.value } : x))} className="w-20 bg-transparent font-bold text-xs outline-none" placeholder="名稱" />
                    <span className="text-slate-300">$</span>
                    <input type="number" min="0" step="0.1" value={ci.defaultPrice} onChange={e => setCostItems(prev => prev.map(x => x.id === ci.id ? { ...x, defaultPrice: Number(e.target.value) || 0 } : x))} className="w-12 bg-transparent font-bold text-xs text-right outline-none" />
                    <button onClick={() => setCostItems(prev => prev.filter(x => x.id !== ci.id))} className="p-0.5 text-rose-400 hover:text-rose-600"><X size={10}/></button>
                  </div>
                ))}
                <button onClick={() => setCostItems(prev => [...prev, { id: `ci-${Date.now()}`, name: '', defaultPrice: 0 }])} className="px-2.5 py-1.5 border-2 border-dashed border-slate-200 rounded-lg text-[10px] font-black text-slate-400 hover:border-amber-400 hover:text-amber-600 flex items-center gap-1"><Plus size={10}/> 新增</button>
              </div>
            </div>

            {/* ── Grouped by Ingredient ── */}
            {matProcLoading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
            ) : (
              <>
                {ingredientGroups.linked.map(({ ingredient: ing, products: ingProducts }) => {
                  const relatedPTs = new Set(ingProducts.map(p => p.processingTypeId).filter(Boolean));
                  const ptList = processingTypes.filter(pt => relatedPTs.has(pt.id)).sort((a, b) => a.sortOrder - b.sortOrder);

                  return (
                    <div key={ing.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                      {/* Ingredient header */}
                      <div className="p-6 pb-3 bg-gradient-to-r from-blue-50/80 to-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-lg">🥩</div>
                          <div className="flex-1">
                            <h4 className="font-black text-slate-900">{ing.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">買入成本: <span className="text-blue-600 font-black">${ing.baseCostPerLb.toFixed(2)}/{ing.unit}</span></p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{ingProducts.length} 款產品</span>
                        </div>
                      </div>

                      {/* Processing type matrix */}
                      {ptList.length > 0 && (
                        <div className="px-6 py-3 border-b border-slate-50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">加工方式成本矩陣</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  <th className="text-left px-2 py-1.5">加工方式</th>
                                  <th className="text-right px-2 py-1.5 w-20">出成率</th>
                                  <th className="text-right px-2 py-1.5 w-24">材料成本/lb</th>
                                  <th className="text-right px-2 py-1.5 w-20">加工費/lb</th>
                                  <th className="text-right px-2 py-1.5 w-24">小計/lb</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Whole/原件 row (no processing) */}
                                <tr className="border-t border-slate-50 bg-emerald-50/30">
                                  <td className="px-2 py-2 font-bold text-emerald-700">原件（不加工）</td>
                                  <td className="px-2 py-2 text-right text-emerald-600 font-bold">100%</td>
                                  <td className="px-2 py-2 text-right font-bold">${ing.baseCostPerLb.toFixed(2)}</td>
                                  <td className="px-2 py-2 text-right text-slate-400">—</td>
                                  <td className="px-2 py-2 text-right font-black text-slate-800">${ing.baseCostPerLb.toFixed(2)}</td>
                                </tr>
                                {ptList.map(pt => {
                                  const entry = getMatEntry(ing.id, pt.id);
                                  const yr = entry?.yieldRateOverride || 1;
                                  const proc = entry?.surchargeOverride || 0;
                                  const matCost = yr > 0 ? ing.baseCostPerLb / yr : ing.baseCostPerLb;
                                  const subtotal = matCost + proc;
                                  return (
                                    <tr key={pt.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                                      <td className="px-2 py-2 font-bold text-slate-700">{pt.name}{pt.spec ? ` (${pt.spec})` : ''}</td>
                                      <td className="px-2 py-2 text-right">
                                        <input type="number" min="0" max="1" step="0.01"
                                          value={entry?.yieldRateOverride ?? ''}
                                          onChange={e => updateMatEntry(ing.id, pt.id, 'yieldRateOverride', e.target.value ? Number(e.target.value) : undefined)}
                                          placeholder="—" className="w-14 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                      </td>
                                      <td className="px-2 py-2 text-right font-bold text-blue-600">${matCost.toFixed(2)}</td>
                                      <td className="px-2 py-2 text-right">
                                        <input type="number" min="0" step="0.1"
                                          value={entry?.surchargeOverride ?? ''}
                                          onChange={e => updateMatEntry(ing.id, pt.id, 'surchargeOverride', e.target.value ? Number(e.target.value) : undefined)}
                                          placeholder="0" className="w-14 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                      </td>
                                      <td className="px-2 py-2 text-right font-black text-amber-700">${subtotal.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Products under this ingredient */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="text-left px-4 py-2">規格</th>
                              <th className="text-right px-2 py-2">成本/lb</th>
                              <th className="text-right px-2 py-2">包裝費</th>
                              <th className="text-right px-2 py-2">雜費</th>
                              {costItems.map(ci => <th key={ci.id} className="text-center px-1 py-2">{ci.name}</th>)}
                              <th className="text-right px-2 py-2">總成本/lb</th>
                              <th className="text-right px-2 py-2">包裝規格</th>
                              <th className="text-right px-3 py-2">成本/包</th>
                              {costsChannelFilter !== 'retail' && <th className="text-right px-3 py-2 text-orange-500">P0</th>}
                              {costsChannelFilter !== 'retail' && costsWsRules.priceTiers.map(tier => (
                                <th key={tier.name} className="text-right px-2 py-2 text-teal-500">{tier.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {ingProducts.map(p => {
                              const perLbCost = computeProductCost(p, ing, costItems, matProcEntries);
                              const packCost = computePackCost(perLbCost, p.packWeightLb, p.pricingMode);
                              const p0 = packCost > 0 ? packCost / costsWsRules.targetMarginFactor : 0;
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center text-xs overflow-hidden flex-shrink-0 border border-slate-100">
                                        {isMediaUrl(p.image) ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <span className="text-[10px]">{p.image || '📦'}</span>}
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-700 text-[11px]">{p.variantLabel || p.name}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-2 text-right font-bold text-slate-700">${perLbCost.toFixed(2)}</td>
                                  <td className="px-2 py-2 text-right">
                                    <input type="number" min="0" step="0.1" value={p.packagingCost ?? ''} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, packagingCost: Number(e.target.value) || 0 } : x))} placeholder="0" className="w-12 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                  </td>
                                  <td className="px-2 py-2 text-right">
                                    <input type="number" min="0" step="0.1" value={p.miscCost ?? ''} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, miscCost: Number(e.target.value) || 0 } : x))} placeholder="0" className="w-12 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                  </td>
                                  {costItems.map(ci => {
                                    const checked = (p.costItemIds || []).includes(ci.id);
                                    return (
                                      <td key={ci.id} className="text-center px-1 py-2">
                                        <button onClick={() => {
                                          const ids = p.costItemIds || [];
                                          const next = checked ? ids.filter(x => x !== ci.id) : [...ids, ci.id];
                                          setProducts(prev => prev.map(x => x.id === p.id ? { ...x, costItemIds: next } : x));
                                        }} className={`w-4 h-4 rounded border-2 flex items-center justify-center mx-auto ${checked ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-200'}`}>
                                          {checked && <Check size={9} strokeWidth={3}/>}
                                        </button>
                                      </td>
                                    );
                                  })}
                                  <td className="px-2 py-2 text-right font-black text-slate-900">${perLbCost.toFixed(2)}</td>
                                  <td className="px-2 py-2 text-right text-[10px] font-bold text-slate-500">
                                    {p.pricingMode === 'by_piece' ? <span className="text-pink-500">抄碼</span> : p.packSize || (p.packWeightLb ? `${p.packWeightLb}磅` : '—')}
                                  </td>
                                  <td className="px-3 py-2 text-right font-black text-amber-700">
                                    {p.pricingMode === 'by_piece' ? `$${perLbCost.toFixed(1)}/lb` : p.packWeightLb ? `$${packCost.toFixed(1)}` : `$${perLbCost.toFixed(1)}/lb`}
                                  </td>
                                  {costsChannelFilter !== 'retail' && (
                                    <td className="px-3 py-2 text-right font-black text-orange-600">{p0 > 0 ? `$${p0.toFixed(1)}` : '—'}</td>
                                  )}
                                  {costsChannelFilter !== 'retail' && costsWsRules.priceTiers.map(tier => (
                                    <td key={tier.name} className="px-2 py-2 text-right font-bold text-teal-600">{p0 > 0 ? `$${(p0 / tier.factor).toFixed(1)}` : '—'}</td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {/* Unlinked products (no ingredient) */}
                {ingredientGroups.unlinked.length > 0 && (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 pb-3 bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center text-lg">📦</div>
                        <div>
                          <h4 className="font-black text-slate-700">未關聯原材料</h4>
                          <p className="text-[10px] text-slate-400 font-bold">以下產品尚未關聯原材料，使用手動成本</p>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="text-left px-4 py-2">產品</th>
                            <th className="text-right px-2 py-2">手動成本</th>
                            <th className="text-right px-2 py-2">包裝費</th>
                            <th className="text-right px-2 py-2">雜費</th>
                            <th className="text-right px-3 py-2">總成本</th>
                            <th className="text-right px-3 py-2">售價</th>
                            <th className="text-right px-3 py-2">利潤</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {ingredientGroups.unlinked.map(p => {
                            const totalCost = computeProductCost(p, undefined, costItems);
                            const sellPrice = (p.memberPrice > 0 && p.memberPrice < p.price) ? p.memberPrice : p.price;
                            const profit = sellPrice - totalCost;
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-bold text-slate-700">{p.name}</td>
                                <td className="px-2 py-2 text-right">
                                  <input type="number" min="0" step="0.5" value={p.costPrice ?? ''} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, costPrice: Number(e.target.value) || 0 } : x))} placeholder="0" className="w-14 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <input type="number" min="0" step="0.1" value={p.packagingCost ?? ''} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, packagingCost: Number(e.target.value) || 0 } : x))} placeholder="0" className="w-12 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <input type="number" min="0" step="0.1" value={p.miscCost ?? ''} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, miscCost: Number(e.target.value) || 0 } : x))} placeholder="0" className="w-12 p-1 bg-slate-50 rounded-md font-bold text-right border border-slate-100 text-xs" />
                                </td>
                                <td className="px-3 py-2 text-right font-black text-slate-900">${totalCost.toFixed(1)}</td>
                                <td className="px-3 py-2 text-right font-bold text-slate-600">${sellPrice}</td>
                                <td className={`px-3 py-2 text-right font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{profit >= 0 ? '+' : ''}${profit.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {costsFilteredProducts.length === 0 && (
                  <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                    <Coins size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">尚無產品</p>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 單位管理 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'units' && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Tag size={18} /></div>
              <div>
                <h4 className="font-black text-lg">單位管理</h4>
                <p className="text-[10px] text-slate-400 font-bold">管理所有計量單位，用於原材料、訂單和 AI 智能解析</p>
              </div>
            </div>
            <button onClick={handleSaveUnits} disabled={unitsSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50">
              {unitsSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">預設單位</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_UNITS.map(u => (
                <div key={u.value} className="px-4 py-2.5 bg-slate-50 rounded-xl text-xs font-black text-slate-500 border border-slate-100 flex items-center gap-2">
                  <Lock size={10} className="text-slate-300" />
                  <span className="text-slate-700">{u.label}</span>
                  <span className="text-slate-300 text-[10px]">{u.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">自訂單位</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="text-left px-4 py-3">顯示名稱</th>
                    <th className="text-left px-4 py-3">值（英文縮寫）</th>
                    <th className="text-right px-4 py-3 w-20">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customUnits.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input value={u.label} onChange={e => setCustomUnits(prev => prev.map(x => x.id === u.id ? { ...x, label: e.target.value } : x))} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-xs border border-slate-100 focus:ring-2 focus:ring-purple-100" placeholder="例：條" />
                      </td>
                      <td className="px-4 py-3">
                        <input value={u.value} onChange={e => setCustomUnits(prev => prev.map(x => x.id === u.id ? { ...x, value: e.target.value.replace(/\s/g, '') } : x))} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-xs border border-slate-100 focus:ring-2 focus:ring-purple-100 font-mono" placeholder="例：strip" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setCustomUnits(prev => prev.filter(x => x.id !== u.id))} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {customUnits.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-300 font-bold text-xs">尚無自訂單位，點擊下方新增</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={() => setCustomUnits(prev => [...prev, { id: `unit-${Date.now()}`, label: '', value: '' }])} className="px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:border-purple-400 hover:text-purple-600 transition-all flex items-center gap-1.5">
              <Plus size={14} /> 新增單位
            </button>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4">
            <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">所有可用單位預覽</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allUnits.map(u => (
                <span key={u.value} className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-600 border border-purple-100">{u.label}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 編輯原材料 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editing.isNew ? '新增原材料' : '編輯原材料'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">名稱 (中文) *</label>
                  <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">名稱 (EN)</label>
                  <input value={editing.nameEn || ''} onChange={e => setEditing({ ...editing, nameEn: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">單位</label>
                  <select value={editing.unit || 'lb'} onChange={e => setEditing({ ...editing, unit: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    {allUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">成本 (每單位)</label>
                  <input type="number" value={editing.baseCostPerLb || ''} onChange={e => setEditing({ ...editing, baseCostPerLb: parseFloat(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" step="0.01" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">供應商</label>
                  <input value={editing.supplier || ''} onChange={e => setEditing({ ...editing, supplier: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">類別</label>
                  <select value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="">—</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">原材料類型</label>
                  <select value={editing.materialType || 'meat'} onChange={e => setEditing({ ...editing, materialType: e.target.value as MaterialType })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    {MATERIAL_TYPES.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                  <textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-16" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleSaveIngredient} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 編輯供應商 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditingSupplier(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editingSupplier.isNew ? '新增供應商' : '編輯供應商'}</h3>
              <button onClick={() => setEditingSupplier(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">公司名稱 (中文) *</label>
                  <input value={editingSupplier.name || ''} onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">公司名稱 (EN)</label>
                  <input value={editingSupplier.nameEn || ''} onChange={e => setEditingSupplier({ ...editingSupplier, nameEn: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人</label>
                  <input value={editingSupplier.contactName || ''} onChange={e => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話</label>
                  <input value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</label>
                  <input value={editingSupplier.whatsapp || ''} onChange={e => setEditingSupplier({ ...editingSupplier, whatsapp: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">傳真</label>
                  <input value={editingSupplier.fax || ''} onChange={e => setEditingSupplier({ ...editingSupplier, fax: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電子郵件</label>
                  <input value={editingSupplier.email || ''} onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="info@example.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">地址</label>
                  <input value={editingSupplier.address || ''} onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">付款條件</label>
                  <select value={editingSupplier.paymentTerms || 'cod'} onChange={e => setEditingSupplier({ ...editingSupplier, paymentTerms: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="cod">到付 (COD)</option>
                    <option value="7days">7天數期</option>
                    <option value="14days">14天數期</option>
                    <option value="15days">15天數期</option>
                    <option value="30days">30天數期</option>
                    <option value="60days">60天數期</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">評分</label>
                  <select value={editingSupplier.rating || ''} onChange={e => setEditingSupplier({ ...editingSupplier, rating: parseInt(e.target.value) || undefined })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="">未評</option>
                    <option value="1">1 星</option>
                    <option value="2">2 星</option>
                    <option value="3">3 星</option>
                    <option value="4">4 星</option>
                    <option value="5">5 星</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">常用倉位（逗號分隔）</label>
                  <input
                    value={(editingSupplier.warehouseLocations || []).join(', ')}
                    onChange={e => setEditingSupplier({ ...editingSupplier, warehouseLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                    placeholder="例：威強, 其士, 光一"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                  <textarea value={editingSupplier.notes || ''} onChange={e => setEditingSupplier({ ...editingSupplier, notes: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-16" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditingSupplier(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleSaveSupplier} disabled={supplierSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                {supplierSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 編輯購買訂單 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {editingPO && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditingPO(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{editingPO.isNew ? '新增購買訂單' : '編輯購買訂單'}</h3>
                <p className="text-xs text-blue-600 font-bold mt-0.5">{editingPO.poNumber}</p>
              </div>
              <button onClick={() => setEditingPO(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">供應商名稱 *</label>
                  <input value={editingPO.supplierName || ''} onChange={e => setEditingPO({ ...editingPO, supplierName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例：四海食品" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人</label>
                  <input value={editingPO.supplierContact || ''} onChange={e => setEditingPO({ ...editingPO, supplierContact: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話</label>
                  <input value={editingPO.supplierPhone || ''} onChange={e => setEditingPO({ ...editingPO, supplierPhone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">下單日期</label>
                  <input type="date" value={editingPO.orderDate || ''} onChange={e => setEditingPO({ ...editingPO, orderDate: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">預計到貨</label>
                  <input type="date" value={editingPO.expectedDelivery || ''} onChange={e => setEditingPO({ ...editingPO, expectedDelivery: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">訂單狀態</label>
                  <select value={editingPO.status || 'draft'} onChange={e => setEditingPO({ ...editingPO, status: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    {Object.entries(PO_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">付款狀態</label>
                  <select value={editingPO.paymentStatus || 'unpaid'} onChange={e => setEditingPO({ ...editingPO, paymentStatus: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    {Object.entries(PAYMENT_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">採購明細</label>
                  <button onClick={addPOLine} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black hover:bg-slate-200">
                    <Plus size={12} /> 添加行
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-3 py-2.5 text-left">產品/原材料</th>
                        <th className="px-3 py-2.5 text-center w-24">數量</th>
                        <th className="px-3 py-2.5 text-center w-20">單位</th>
                        <th className="px-3 py-2.5 text-center w-28">單價 ($)</th>
                        <th className="px-3 py-2.5 text-right w-28">小計</th>
                        <th className="px-3 py-2.5 text-center w-24">已收量</th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingPO.lineItems || []).map((line, idx) => (
                        <tr key={idx} className="border-t border-slate-50">
                          <td className="px-3 py-2">
                            <input value={line.productName} onChange={e => updatePOLine(idx, 'productName', e.target.value)} placeholder="產品名稱" className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" value={line.qty || ''} onChange={e => updatePOLine(idx, 'qty', parseFloat(e.target.value) || 0)} className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none" min="0" />
                          </td>
                          <td className="px-3 py-2">
                            <select value={line.unit} onChange={e => updatePOLine(idx, 'unit', e.target.value)} className="w-full px-1 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none">
                              {allUnits.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" value={line.unitCost || ''} onChange={e => updatePOLine(idx, 'unitCost', parseFloat(e.target.value) || 0)} className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none" min="0" step="0.01" />
                          </td>
                          <td className="px-3 py-2 text-right font-black text-slate-800 text-xs">${(line.lineTotal || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">
                            <input type="number" value={line.receivedQty || ''} onChange={e => updatePOLine(idx, 'receivedQty', parseFloat(e.target.value) || 0)} className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none" min="0" />
                          </td>
                          <td className="px-3 py-2">
                            <button onClick={() => removePOLine(idx)} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                  <textarea value={editingPO.notes || ''} onChange={e => setEditingPO({ ...editingPO, notes: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-28" placeholder="付款條款、送貨要求等..." />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">小計</span>
                    <span className="font-black text-slate-800">${poSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold">稅項</span>
                    <input type="number" value={editingPO.tax || ''} onChange={e => setEditingPO({ ...editingPO, tax: parseFloat(e.target.value) || 0 })} className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-right outline-none" min="0" step="0.01" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold">運費</span>
                    <input type="number" value={editingPO.shippingCost || ''} onChange={e => setEditingPO({ ...editingPO, shippingCost: parseFloat(e.target.value) || 0 })} className="w-28 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-right outline-none" min="0" step="0.01" />
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-slate-100">
                    <span className="font-black text-slate-900">總計</span>
                    <span className="font-black text-slate-900">${(poSubtotal + (editingPO.tax || 0) + (editingPO.shippingCost || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditingPO(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleSavePO} disabled={poSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50 shadow-lg">
                {poSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存訂單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 上載報價 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => !parsingQuote && setShowUploadModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">上載供應商報價</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">拖放或選擇多份 PDF 報價單，AI 會自動閱讀並辨識供應商</p>
              </div>
              <button onClick={() => !parsingQuote && setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Hidden file input */}
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) handlePdfFiles(e.target.files); e.target.value = ''; }}
              />

              {/* PDF Drop Zone */}
              {!parsingQuote && (
                <div
                  className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                      : 'border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'
                  }`}
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handlePdfFiles(e.dataTransfer.files);
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'
                    }`}>
                      <Upload size={24} className={isDragging ? 'text-indigo-600' : 'text-slate-400'} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">
                        {isDragging ? '放開即可上載' : '拖放 PDF 報價單到這裡'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        或 <span className="text-indigo-600 underline">點擊選擇檔案</span> · 支援同時選擇多個 PDF
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* File List */}
              {uploadEntries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500">
                      已選擇 {uploadEntries.length} 份報價
                    </span>
                    {!parsingQuote && uploadEntries.length > 0 && (
                      <button
                        onClick={() => setUploadEntries([])}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        清除全部
                      </button>
                    )}
                  </div>
                  {uploadEntries.map((entry, idx) => (
                    <div key={entry.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                      entry.status === 'done' ? 'border-emerald-200 bg-emerald-50/40' :
                      entry.status === 'error' ? 'border-rose-200 bg-rose-50/40' :
                      entry.status === 'parsing' ? 'border-blue-200 bg-blue-50/40' :
                      'border-slate-100 bg-white'
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        entry.sourceType === 'whatsapp' ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        {entry.sourceType === 'whatsapp'
                          ? <MessageSquare size={16} className="text-emerald-600" />
                          : <FileText size={16} className="text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-700 truncate">{entry.fileName || '未知檔案'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {entry.sourceType === 'whatsapp' ? 'WhatsApp 報價' : 'PDF 報價單'}
                          {entry.fileSize ? ` · ${(entry.fileSize / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {entry.status === 'parsing' && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                            <RefreshCw size={10} className="animate-spin" /> AI 閱讀中...
                          </span>
                        )}
                        {entry.status === 'done' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <Check size={10} /> {entry.result}
                          </span>
                        )}
                        {entry.status === 'error' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 max-w-[160px] truncate" title={entry.result}>
                            <AlertTriangle size={10} /> {entry.result}
                          </span>
                        )}
                        {!parsingQuote && (
                          <button
                            onClick={() => setUploadEntries(prev => prev.filter(e => e.id !== entry.id))}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WhatsApp Section */}
              {!parsingQuote && (
                <div className="border-t border-slate-100 pt-4">
                  {!showWhatsAppInput ? (
                    <button
                      onClick={() => setShowWhatsAppInput(true)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      <MessageSquare size={14} />
                      加入 WhatsApp 報價訊息
                      <ChevronRight size={12} />
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-600">WhatsApp 報價訊息</span>
                        <button onClick={() => setShowWhatsAppInput(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                          <X size={14} className="text-slate-400" />
                        </button>
                      </div>
                      <textarea
                        value={whatsAppText}
                        onChange={e => setWhatsAppText(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-xs resize-none h-32 font-mono"
                        placeholder={'貼入 WhatsApp 報價訊息...\n\n例：今日報價：\nFrimesa豬扒 25K $8.20/磅\n巴西牛肋條 $52/磅'}
                      />
                      <button
                        onClick={handleAddWhatsApp}
                        disabled={!whatsAppText.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 disabled:opacity-40 transition-all"
                      >
                        <Plus size={12} /> 加入待解析列表
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-6 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400">
                {uploadEntries.filter(e => e.file || e.text?.trim()).length} 份報價待解析
              </span>
              <div className="flex gap-3">
                <button onClick={() => !parsingQuote && setShowUploadModal(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">
                  {uploadEntries.some(e => e.status === 'done') ? '完成' : '取消'}
                </button>
                <button
                  onClick={handleParseQuote}
                  disabled={parsingQuote || uploadEntries.filter(e => e.file || e.text?.trim()).length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:opacity-50 shadow-lg"
                >
                  {parsingQuote ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                  {parsingQuote ? '解析中...' : `AI 解析全部 (${uploadEntries.filter(e => e.file || e.text?.trim()).length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: 非最低價原因 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {justificationModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9100] flex items-center justify-center p-4" onClick={() => setJustificationModal(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">非最低價格</h3>
              </div>
              <p className="text-xs text-slate-500 font-bold">你選擇的價格不是此品牌的最低報價，請提供原因。</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">品名</span>
                  <span className="font-black text-slate-800">{justificationModal.catalogName} ({justificationModal.brand})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">你的選擇</span>
                  <span className="font-black text-amber-700">${justificationModal.quoteItem.unitPrice.toFixed(2)}/{justificationModal.quoteItem.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">最低價</span>
                  <span className="font-black text-emerald-700">${justificationModal.lowestItem.unitPrice.toFixed(2)}/{justificationModal.lowestItem.unit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-500">差價</span>
                  <span className="font-black text-rose-600">
                    +${(justificationModal.quoteItem.unitPrice - justificationModal.lowestItem.unitPrice).toFixed(2)}
                    ({((justificationModal.quoteItem.unitPrice - justificationModal.lowestItem.unitPrice) / justificationModal.lowestItem.unitPrice * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">選擇原因</label>
                <div className="space-y-1.5">
                  {JUSTIFICATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setJustificationCategory(opt.value)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        justificationCategory === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {justificationCategory === 'other' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">詳細說明 *</label>
                  <textarea
                    value={justificationText}
                    onChange={e => setJustificationText(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-20"
                    placeholder="請說明不選最低價的原因..."
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setJustificationModal(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleConfirmJustification} className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-black hover:bg-amber-700 shadow-lg">
                <Check size={14} /> 確認選擇
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: 補貨預警 ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {subTab === 'reorder_alerts' && (() => {
        const alertItems = ingredients
          .filter(ing => ing.minStockAlert && ing.minStockAlert > 0 && (ing.stockQty || 0) <= ing.minStockAlert)
          .sort((a, b) => ((a.stockQty || 0) / (a.minStockAlert || 1)) - ((b.stockQty || 0) / (b.minStockAlert || 1)));

        const criticalCount = alertItems.filter(i => (i.stockQty || 0) <= 0).length;
        const warningCount = alertItems.length - criticalCount;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">需補貨品項</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{alertItems.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm">
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">缺貨 (0庫存)</p>
                <p className="text-3xl font-black text-rose-600 mt-1">{criticalCount}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-sm">
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">低庫存警告</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{warningCount}</p>
              </div>
            </div>

            {alertItems.length === 0 ? (
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                <p className="text-lg font-black text-emerald-600">庫存充足</p>
                <p className="text-sm text-slate-400 font-bold mt-2">所有原材料的庫存都高於安全水位</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3 text-left">狀態</th>
                      <th className="px-4 py-3 text-left">原材料</th>
                      <th className="px-4 py-3 text-left">分類</th>
                      <th className="px-4 py-3 text-right">現有庫存</th>
                      <th className="px-4 py-3 text-right">安全水位</th>
                      <th className="px-4 py-3 text-right">差額</th>
                      <th className="px-4 py-3 text-left">供應商</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertItems.map(ing => {
                      const deficit = (ing.minStockAlert || 0) - (ing.stockQty || 0);
                      const isCritical = (ing.stockQty || 0) <= 0;
                      return (
                        <tr key={ing.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="px-6 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                              {isCritical ? '缺貨' : '低庫存'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-bold text-slate-800">{ing.name}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-slate-500">{ing.category || '—'}</td>
                          <td className={`px-4 py-2.5 text-right font-black ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                            {(ing.stockQty || 0).toFixed(1)} {ing.stockUnit || ing.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-500">
                            {(ing.minStockAlert || 0).toFixed(1)} {ing.stockUnit || ing.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right font-black text-rose-600">
                            -{deficit.toFixed(1)}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-bold text-slate-500">{ing.supplier || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ Stock Lots Modal (庫存批次) ═══ */}
      {showLots && lotsIngredientId && (() => {
        const ing = ingredients.find(i => i.id === lotsIngredientId);
        const lots = stockLots.filter(l => l.ingredientId === lotsIngredientId);
        const totalRemaining = lots.reduce((s, l) => s + l.quantityRemaining, 0);
        const brands = [...new Set(lots.map(l => l.brand).filter(Boolean))];
        return (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLots(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-800">{ing?.name || '—'} — 庫存批次</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-slate-500">
                      總庫存：<span className="font-black text-emerald-600">{totalRemaining.toFixed(1)} {ing?.unit || 'lb'}</span>
                    </span>
                    {brands.length > 0 && (
                      <span className="text-xs font-bold text-slate-400">
                        品牌：{brands.map(b => (
                          <span key={b} className="inline-block px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded text-[10px] font-black ml-1">{b}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowLots(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
              </div>
              <div className="overflow-auto max-h-[65vh]">
                {lots.length === 0 ? (
                  <div className="p-12 text-center">
                    <Layers size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">暫無批次記錄</p>
                    <p className="text-[10px] text-slate-300 mt-1">收貨確認後會自動建立批次</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3 text-left">收貨日期</th>
                        <th className="px-4 py-3 text-left">品牌</th>
                        <th className="px-4 py-3 text-left">供應商</th>
                        <th className="px-4 py-3 text-right">收貨量</th>
                        <th className="px-4 py-3 text-right">剩餘量</th>
                        <th className="px-4 py-3 text-right">成本/單位</th>
                        <th className="px-4 py-3 text-left">倉位</th>
                        <th className="px-4 py-3 text-center">狀態</th>
                        <th className="px-4 py-3 text-left">備註</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lots.map(lot => {
                        const clientName = lot.reservedForClientId
                          ? wholesaleClients.find(c => c.id === lot.reservedForClientId)?.companyName
                          : undefined;
                        const pct = lot.quantityReceived > 0 ? (lot.quantityRemaining / lot.quantityReceived) * 100 : 0;
                        return (
                          <tr key={lot.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                            <td className="px-5 py-3 text-xs font-bold text-slate-600">{lot.receivedDate}</td>
                            <td className="px-4 py-3">
                              {lot.brand ? (
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-[10px] font-black">{lot.brand}</span>
                              ) : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-500">{lot.supplierName || '—'}</td>
                            <td className="px-4 py-3 text-right text-xs font-bold text-slate-500">{lot.quantityReceived.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-black text-xs ${pct < 20 ? 'text-rose-600' : pct < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {lot.quantityRemaining.toFixed(1)}
                              </span>
                              <span className="text-[9px] text-slate-400 ml-1">{lot.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-bold text-slate-600">${lot.costPerUnit.toFixed(2)}</td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-500">{lot.storageLocation || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              {lot.lotStatus === 'reserved' && clientName ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black">{clientName} 專用</span>
                              ) : lot.lotStatus === 'expired' ? (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-black">已過期</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black">可用</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[10px] text-slate-400">{lot.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">共 {lots.length} 個批次（按收貨日期 FIFO 排序）</span>
                <div className="flex gap-2">
                  {lots.filter(l => l.lotStatus === 'reserved').length > 0 && (
                    <span className="text-[10px] font-black text-amber-600">
                      {lots.filter(l => l.lotStatus === 'reserved').length} 批已預留
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default WarehousePanel;
