import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, FileDown, Grid3X3, Layers, Package, Pencil, Plus, RefreshCw, Save, Scissors, Search, Settings2, Trash2, Upload } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { CostItem, Ingredient, Product, SaleChannel } from './types';
import { mapIngredientRowToIngredient } from './supabaseMappers';
import { convertCost, convertWeight, normalizeWeightUnit, type WeightUnit } from './utils/unitConverter';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

type StepTab = 'raw' | 'process' | 'pack' | 'sku';
type PricingType = 'fixed_pack' | 'by_piece';
type MethodCategory = 'original_or_cutting' | 'repacking' | 'marinating' | 'others';
type ChannelFilter = 'all' | 'wholesale' | 'retail';
type TypeFilter = 'all' | 'fixed_pack' | 'by_piece';

interface GlobalMethod {
  id: string;
  code: string;
  name: string;
  category: MethodCategory;
  isActive: boolean;
}

interface ProcessRow {
  id: string;
  ingredientId: string;
  methodId?: string;
  code: string;
  name: string;
  category: MethodCategory;
  yieldRate: number;
  packQuantity?: number;
  packUnit?: WeightUnit;
  isDefaultPiece: boolean;
  isActive: boolean;
}

interface ProcessDraftRow {
  tempId: string;
  ingredientId: string;
  methodId?: string;
  code: string;
  category: MethodCategory;
  yieldRate: number;
  packQuantity?: number;
  packUnit?: WeightUnit;
}

interface PackRow {
  id: string;
  ingredientId: string;
  processSpecId: string;
  code: string;
  name: string;
  pricingType: PricingType;
  channel: SaleChannel;
  specWeight: number;
  specUnit: WeightUnit;
  packLabel: string;
  packagingFee: number;
  packagingItemCodes?: string[];
  packWeightLb?: number;
  packQuantity?: number;
  packUnit?: WeightUnit;
  isActive: boolean;
}

interface PackagingItem {
  id: string;
  code: string;
  name: string;
  defaultPrice: number;
}

interface MaterialCategoryItem {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface PackDraftRow {
  tempId: string;
  processSpecId: string;
  ingredientId: string;
  code: string;
  name: string;
  pricingType: PricingType;
  specWeight: number;
  specUnit: WeightUnit;
  packLabel: string;
  packagingItemCodes: string[];
}

interface SkuRow {
  id: string;
  code: string;
  name: string;
  alias?: string;
  ingredientId: string;
  processSpecId: string;
  packSpecId: string;
  productId: string;
  saleChannel: SaleChannel;
  isActive: boolean;
}

interface SkuGridRow {
  rowId: string;
  pack: PackRow;
  process?: ProcessRow;
  sku?: SkuRow;
}

type PricingTierKey = 'P0' | 'P1' | 'P2' | 'P3';

interface PricingTierState {
  price: number;
  margin: number;
}

interface PricingRowState {
  costOverride?: number;
  tiers: Record<PricingTierKey, PricingTierState>;
}


const round2 = (v: number) => Math.round(v * 100) / 100;
const mkId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const QUOTE_SUFFIX: Record<string, string> = { P0: 'A0', P1: 'B1', P2: 'B2', P3: 'C3', 'P-1': 'Y1', 'P-2': 'Z2' };
const RAW_UNIT_OPTIONS = ['lb', 'kg', 'g', 'catty', 'pack', 'box'] as const;
const needsNetContent = (unit?: string) => ['pack', 'box'].includes((unit || '').trim().toLowerCase());
const isMissingPackagingItemCodesError = (error: any) => {
  const msg = String(error?.message || '');
  return msg.includes("packaging_item_codes") && msg.includes("material_pack_specs");
};

const uniqueById = <T extends { id: string }>(rows: T[]): T[] => {
  const map = new Map<string, T>();
  rows.forEach(row => map.set(row.id, row));
  return Array.from(map.values());
};

const categoryLabel = (c: MethodCategory) => {
  if (c === 'original_or_cutting') return '原裝/切割';
  if (c === 'repacking') return '分裝';
  if (c === 'marinating') return '醃製';
  return '其他';
};

const categoryBadge = (c: MethodCategory) => {
  if (c === 'original_or_cutting') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (c === 'repacking') return 'bg-violet-50 text-violet-700 border-violet-200';
  if (c === 'marinating') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const DEFAULT_MATERIAL_CATEGORIES = ['豬類', '牛類', '雞類', '家禽類', '海鮮類', '其他'] as const;
const INGREDIENT_ACTIVITY_CFG_ID = 'material_flow_ingredient_activity';
const INGREDIENT_DELETED_CFG_ID = 'material_flow_deleted_ingredient_ids';

const MaterialFlowPanel: React.FC<Props> = ({ showToast, products, setProducts }) => {
  const [tab, setTab] = useState<StepTab>('raw');
  const [loading, setLoading] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showUnitGuide, setShowUnitGuide] = useState(false);
  const [showPackagingDrawer, setShowPackagingDrawer] = useState(false);
  const [showMaterialCategoryDrawer, setShowMaterialCategoryDrawer] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [methods, setMethods] = useState<GlobalMethod[]>([]);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [packRows, setPackRows] = useState<PackRow[]>([]);
  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [pricingOverrides, setPricingOverrides] = useState<Record<string, any>>({});
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);
  const [materialCategories, setMaterialCategories] = useState<MaterialCategoryItem[]>([]);

  const [search, setSearch] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [processMaterialSearch, setProcessMaterialSearch] = useState('');
  const [packMaterialSearch, setPackMaterialSearch] = useState('');
  const [skuMaterialSearch, setSkuMaterialSearch] = useState('');
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedTierForPdf, setSelectedTierForPdf] = useState('P0');
  const [baseDenominator, setBaseDenominator] = useState(0.88);
  const [tierStep, setTierStep] = useState(0.01);
  const [showStoplightConfig, setShowStoplightConfig] = useState(false);
  const [greenThresholdPct, setGreenThresholdPct] = useState(15);
  const [redThresholdPct, setRedThresholdPct] = useState(5);
  const [pricingDrafts, setPricingDrafts] = useState<Record<string, PricingRowState>>({});
  const [p123UnitMode, setP123UnitMode] = useState<'whole_pack' | 'per_lb'>('whole_pack');

  const [newIngredient, setNewIngredient] = useState({ name: '', supplier: '', category: '豬類', unit: 'lb', cost: 0, netContentVolume: 0, netContentUnit: 'g' as WeightUnit });
  const [newMethod, setNewMethod] = useState({ code: '', name: '', category: 'original_or_cutting' as MethodCategory });
  const [newSku, setNewSku] = useState({ packSpecId: '', name: '', alias: '' });
  const [processDraftRows, setProcessDraftRows] = useState<ProcessDraftRow[]>([]);
  const [packDraftRows, setPackDraftRows] = useState<PackDraftRow[]>([]);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editingPackagingItemId, setEditingPackagingItemId] = useState<string | null>(null);
  const [newPackagingItem, setNewPackagingItem] = useState({ code: '', name: '', defaultPrice: 0 });
  const [editingMaterialCategoryId, setEditingMaterialCategoryId] = useState<string | null>(null);
  const [newMaterialCategory, setNewMaterialCategory] = useState({ name: '', sortOrder: 0, isActive: true });
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [savingIngredientId, setSavingIngredientId] = useState<string | null>(null);
  const [savedIngredientId, setSavedIngredientId] = useState<string | null>(null);
  const [saveErrorIngredientId, setSaveErrorIngredientId] = useState<string | null>(null);
  const savedIndicatorTimerRef = useRef<number | null>(null);
  const baselineEnsuringRef = useRef<Record<string, boolean>>({});
  const [supportsPackagingItemCodes, setSupportsPackagingItemCodes] = useState(true);

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);
  const processMap = useMemo(() => new Map(processRows.map(r => [r.id, r])), [processRows]);
  const packMap = useMemo(() => new Map(packRows.map(r => [r.id, r])), [packRows]);
  const tierDefs = useMemo(() => ([{ key: 'P0', level: 0 }, { key: 'P1', level: 1 }, { key: 'P2', level: 2 }, { key: 'P3', level: 3 }] as { key: PricingTierKey; level: number }[]), []);
  const activeMaterialCategoryOptions = useMemo(() => {
    const dynamic = materialCategories
      .filter(c => c.isActive !== false)
      .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name, 'zh-Hant'))
      .map(c => c.name);
    return dynamic.length > 0 ? dynamic : [...DEFAULT_MATERIAL_CATEGORIES];
  }, [materialCategories]);

  const loadMethods = useCallback(async () => {
    const methodRes = await supabase
      .from('processing_methods')
      .select('id,code,name,category,is_active')
      .order('sort_order')
      .order('name');
    if (!methodRes.error) {
      const rows = (methodRes.data || []).map((r: any) => ({
        id: r.id,
        code: r.code || '',
        name: r.name || '',
        category: (['original_or_cutting', 'repacking', 'marinating', 'others'].includes(r.category) ? r.category : 'others') as MethodCategory,
        isActive: r.is_active !== false,
      }));
      setMethods(uniqueById(rows));
      return;
    }
    const fallback = await supabase.from('processing_types').select('id,code,name,is_active').order('sort_order').order('name');
    if (fallback.error) throw fallback.error;
    const rows = (fallback.data || []).map((r: any) => ({
      id: r.id,
      code: r.code || '',
      name: r.name || '',
      category: 'others' as MethodCategory,
      isActive: r.is_active !== false,
    }));
    setMethods(uniqueById(rows));
  }, []);

  const loadPackagingItems = useCallback(async () => {
    const res = await supabase
      .from('packaging_materials')
      .select('id,code,name,cost,is_active,sort_order')
      .order('sort_order')
      .order('name');
    if (!res.error) {
      const rows = (res.data || [])
        .filter((r: any) => r.is_active !== false)
        .map((r: any) => ({
          id: r.id,
          code: (r.code || '').toString().trim().toUpperCase(),
          name: (r.name || '').toString(),
          defaultPrice: Number(r.cost) || 0,
        }))
        .filter((item: PackagingItem) => item.code && item.name);
      setPackagingItems(rows);
      return;
    }
    if (res.error && (res.error.code === '42P01' || res.error.code === 'PGRST205' || String(res.error.message || '').includes('schema cache'))) {
      const cfg = await supabase.from('site_config').select('value').eq('id', 'packaging_items').maybeSingle();
      if (!cfg.error && Array.isArray(cfg.data?.value)) {
        const rows = (cfg.data.value as any[])
          .map((item: any) => ({
            id: item.id || item.code || mkId('PKI'),
            code: (item.code || item.id || '').toString().trim().toUpperCase(),
            name: (item.name || '').toString(),
            defaultPrice: Number(item.defaultPrice ?? item.cost ?? 0) || 0,
          }))
          .filter((item: PackagingItem) => item.code && item.name);
        setPackagingItems(rows);
      }
    }
  }, []);

  const loadMaterialCategories = useCallback(async () => {
    const res = await supabase
      .from('material_categories')
      .select('id,name,sort_order,is_active')
      .order('sort_order')
      .order('name');
    if (!res.error) {
      const rows = (res.data || []).map((r: any) => ({
        id: r.id,
        name: String(r.name || ''),
        sortOrder: Number(r.sort_order) || 0,
        isActive: r.is_active !== false,
      })).filter((r: MaterialCategoryItem) => r.name);
      setMaterialCategories(rows);
      return;
    }
    // fallback: keep current defaults when table not available yet
    setMaterialCategories(DEFAULT_MATERIAL_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, sortOrder: idx, isActive: true })));
  }, []);


  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, processRes, packRes, cfgRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('material_process_specs').select('*').order('sort_order').order('name'),
        supabase
          .from('material_pack_specs')
          .select('*, sellable_skus!left(id,code,name,alias,ingredient_id,process_spec_id,pack_spec_id,product_id,sale_channel,is_active,sort_order)')
          .order('sort_order')
          .order('name'),
        supabase.from('site_config').select('id,value').in('id', ['cost_items', 'material_flow_price_overrides', 'material_flow_cost_overrides', 'packaging_items', INGREDIENT_ACTIVITY_CFG_ID, INGREDIENT_DELETED_CFG_ID]),
      ]);
      if (ingRes.error || processRes.error || packRes.error || cfgRes.error) {
        throw (ingRes.error || processRes.error || packRes.error || cfgRes.error);
      }
      await loadMethods();
      await loadPackagingItems();
      await loadMaterialCategories();

      const rawIngredients = (ingRes.data || []).map(mapIngredientRowToIngredient);
      setProcessRows(uniqueById((processRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        methodId: r.processing_method_id || undefined,
        code: r.code,
        name: r.name,
        category: (['original_or_cutting', 'repacking', 'marinating', 'others'].includes(r.processing_category) ? r.processing_category : 'others') as MethodCategory,
        yieldRate: Number(r.yield_rate) || 1,
        packQuantity: r.pack_quantity == null ? undefined : Number(r.pack_quantity),
        packUnit: (['g', 'kg', 'lb', 'catty'].includes(r.pack_unit) ? r.pack_unit : undefined) as WeightUnit | undefined,
        isDefaultPiece: !!r.is_default_piece,
        isActive: r.is_active !== false,
      }))));
      setPackRows(uniqueById((packRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        processSpecId: r.process_spec_id,
        code: r.code,
        name: r.name,
        pricingType: r.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
        channel: (['retail', 'wholesale', 'both'].includes(r.target_channel) ? r.target_channel : 'wholesale') as SaleChannel,
        specWeight: Number(r.spec_weight) || 0,
        specUnit: (['g', 'kg', 'lb', 'catty'].includes(r.spec_unit) ? r.spec_unit : 'g') as WeightUnit,
        packLabel: r.pack_label || '',
        packagingFee: Number(r.packaging_fee) || 0,
        packagingItemCodes: Array.isArray(r.packaging_item_codes) ? r.packaging_item_codes.filter((x: any) => typeof x === 'string') : [],
        packWeightLb: r.pack_weight_lb == null ? undefined : Number(r.pack_weight_lb),
        packQuantity: r.pack_quantity == null ? undefined : Number(r.pack_quantity),
        packUnit: (['g', 'kg', 'lb', 'catty'].includes(r.pack_unit) ? r.pack_unit : undefined) as WeightUnit | undefined,
        isActive: r.is_active !== false,
      }))));
      const skuFlatten = (packRes.data || []).flatMap((r: any) => Array.isArray(r.sellable_skus) ? r.sellable_skus : []);
      setSkuRows(uniqueById(skuFlatten.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        alias: r.alias || undefined,
        ingredientId: r.ingredient_id,
        processSpecId: r.process_spec_id,
        packSpecId: r.pack_spec_id,
        productId: r.product_id,
        saleChannel: (['retail', 'wholesale', 'both'].includes(r.sale_channel) ? r.sale_channel : 'wholesale') as SaleChannel,
        isActive: r.is_active !== false,
      }))));

      const cfgMap = new Map((cfgRes.data || []).map((r: any) => [r.id, r.value]));
      const activityMap = (cfgMap.get(INGREDIENT_ACTIVITY_CFG_ID) && typeof cfgMap.get(INGREDIENT_ACTIVITY_CFG_ID) === 'object')
        ? (cfgMap.get(INGREDIENT_ACTIVITY_CFG_ID) as Record<string, boolean>)
        : {};
      const deletedIds = Array.isArray(cfgMap.get(INGREDIENT_DELETED_CFG_ID))
        ? new Set((cfgMap.get(INGREDIENT_DELETED_CFG_ID) as any[]).map(v => String(v)))
        : new Set<string>();
      setIngredients(
        rawIngredients
          .filter(i => !deletedIds.has(i.id))
          .map(i => ({ ...i, isActive: activityMap[i.id] ?? (i.isActive !== false) }))
      );
      if (Array.isArray(cfgMap.get('cost_items'))) setCostItems(cfgMap.get('cost_items') as CostItem[]);
      if (packagingItems.length === 0 && Array.isArray(cfgMap.get('packaging_items'))) {
        const rows = (cfgMap.get('packaging_items') as any[]).map((item: any) => ({
          id: item.id || item.code || mkId('PKI'),
          code: (item.code || item.id || '').toString().trim().toUpperCase(),
          name: (item.name || '').toString(),
          defaultPrice: Number(item.defaultPrice ?? item.cost ?? 0) || 0,
        })).filter((item: PackagingItem) => item.code && item.name);
        setPackagingItems(rows);
      } else if (packagingItems.length === 0 && Array.isArray(cfgMap.get('cost_items'))) {
        const fallback = (cfgMap.get('cost_items') as CostItem[]).map((item) => ({
          id: item.id,
          code: item.id,
          name: item.name,
          defaultPrice: item.defaultPrice,
        }));
        setPackagingItems(fallback);
      }
      const loadedOverrides = cfgMap.get('material_flow_cost_overrides') || cfgMap.get('material_flow_price_overrides');
      if (loadedOverrides && typeof loadedOverrides === 'object') {
        setPricingOverrides(loadedOverrides as Record<string, any>);
      }
    } catch (error: any) {
      showToast(`載入失敗：${error?.message || '未知錯誤'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [loadMethods, loadPackagingItems, loadMaterialCategories, packagingItems.length, showToast]);

  const reloadProcessRowsForIngredient = useCallback(async (ingredientId: string) => {
    if (!ingredientId) return;
    const { data, error } = await supabase
      .from('material_process_specs')
      .select('*')
      .eq('ingredient_id', ingredientId)
      .order('sort_order')
      .order('name');
    if (error) return;
    const mapped = uniqueById((data || []).map((r: any) => ({
      id: r.id,
      ingredientId: r.ingredient_id,
      methodId: r.processing_method_id || undefined,
      code: r.code,
      name: r.name,
      category: (['original_or_cutting', 'repacking', 'marinating', 'others'].includes(r.processing_category) ? r.processing_category : 'others') as MethodCategory,
      yieldRate: Number(r.yield_rate) || 1,
      packQuantity: r.pack_quantity == null ? undefined : Number(r.pack_quantity),
      packUnit: (['g', 'kg', 'lb', 'catty'].includes(r.pack_unit) ? r.pack_unit : undefined) as WeightUnit | undefined,
      isDefaultPiece: !!r.is_default_piece,
      isActive: r.is_active !== false,
    })));
    setProcessRows(prev => [...prev.filter(r => r.ingredientId !== ingredientId), ...mapped]);
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);
  useEffect(() => { if (!selectedIngredientId && ingredients.length > 0) setSelectedIngredientId(ingredients[0].id); }, [ingredients, selectedIngredientId]);
  useEffect(() => { setProcessDraftRows([]); }, [selectedIngredientId]);
  useEffect(() => {
    if (tab !== 'pack') return;
    setPackDraftRows([]);
  }, [selectedIngredientId, tab]);
  useEffect(() => {
    if (tab !== 'process' || !selectedIngredientId) return;
    void reloadProcessRowsForIngredient(selectedIngredientId);
  }, [tab, selectedIngredientId, reloadProcessRowsForIngredient]);

  const materials = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rank = (i: Ingredient) => (i.isActive === false ? 1 : 0);
    return ingredients
      .filter(i => !q || (
        i.name.toLowerCase().includes(q) ||
        (i.supplier || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.unit || '').toLowerCase().includes(q)
      ))
      .filter(i => materialCategoryFilter === 'all' ? true : (i.category || '未分類') === materialCategoryFilter)
      .sort((a, b) => (rank(a) - rank(b)) || ((a.category || '未分類').localeCompare((b.category || '未分類'), 'zh-Hant')) || a.name.localeCompare(b.name, 'zh-Hant'));
  }, [ingredients, search, materialCategoryFilter]);

  const processMaterials = useMemo(() => {
    const q = processMaterialSearch.trim().toLowerCase();
    const rank = (i: Ingredient) => (i.isActive === false ? 1 : 0);
    return ingredients
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.supplier || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
      .filter(i => materialCategoryFilter === 'all' ? true : (i.category || '未分類') === materialCategoryFilter)
      .sort((a, b) => (rank(a) - rank(b)) || ((a.category || '未分類').localeCompare((b.category || '未分類'), 'zh-Hant')) || a.name.localeCompare(b.name, 'zh-Hant'));
  }, [ingredients, processMaterialSearch, materialCategoryFilter]);

  const packMaterials = useMemo(() => {
    const q = packMaterialSearch.trim().toLowerCase();
    const rank = (i: Ingredient) => (i.isActive === false ? 1 : 0);
    return ingredients
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.supplier || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
      .filter(i => materialCategoryFilter === 'all' ? true : (i.category || '未分類') === materialCategoryFilter)
      .sort((a, b) => (rank(a) - rank(b)) || ((a.category || '未分類').localeCompare((b.category || '未分類'), 'zh-Hant')) || a.name.localeCompare(b.name, 'zh-Hant'));
  }, [ingredients, packMaterialSearch, materialCategoryFilter]);

  const skuMaterials = useMemo(() => {
    const q = skuMaterialSearch.trim().toLowerCase();
    const rank = (i: Ingredient) => (i.isActive === false ? 1 : 0);
    return ingredients
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.supplier || '').toLowerCase().includes(q) || (i.category || '').toLowerCase().includes(q))
      .filter(i => materialCategoryFilter === 'all' ? true : (i.category || '未分類') === materialCategoryFilter)
      .sort((a, b) => (rank(a) - rank(b)) || ((a.category || '未分類').localeCompare((b.category || '未分類'), 'zh-Hant')) || a.name.localeCompare(b.name, 'zh-Hant'));
  }, [ingredients, skuMaterialSearch, materialCategoryFilter]);

  const unitGuideRows = useMemo(() => {
    const units: WeightUnit[] = ['g', 'kg', 'lb', 'catty'];
    return units.map(from => ({
      from,
      rates: units.map(to => ({ to, value: round2(convertWeight(1, from, to)) })),
    }));
  }, []);

  const processRowsForMaterial = useMemo(() => processRows.filter(r => r.ingredientId === selectedIngredientId && r.isActive), [processRows, selectedIngredientId]);
  const processDraftRowsForMaterial = useMemo(
    () => processDraftRows.filter(r => r.ingredientId === selectedIngredientId),
    [processDraftRows, selectedIngredientId]
  );
  const packRowsForMaterial = useMemo(() => packRows
    .filter(r => r.ingredientId === selectedIngredientId && r.isActive)
    .filter(r => channelFilter === 'all' ? true : r.channel === channelFilter || r.channel === 'both')
    .filter(r => typeFilter === 'all' ? true : r.pricingType === typeFilter), [packRows, selectedIngredientId, channelFilter, typeFilter]);
  const packDraftRowsForMaterial = useMemo(
    () => packDraftRows.filter(r => r.ingredientId === selectedIngredientId),
    [packDraftRows, selectedIngredientId]
  );

  const skuGridRows = useMemo<SkuGridRow[]>(() => {
    const q = search.trim().toLowerCase();
    return packRows
      .filter(p => p.isActive)
      .filter(p => {
        if (materialCategoryFilter === 'all') return true;
        const ingredient = ingredientMap.get(p.ingredientId);
        return (ingredient?.category || '未分類') === materialCategoryFilter;
      })
      .filter(p => channelFilter === 'all' ? true : p.channel === channelFilter || p.channel === 'both')
      .filter(p => typeFilter === 'all' ? true : p.pricingType === typeFilter)
      .filter(p => {
        if (!q) return true;
        const sku = skuRows.find(s => s.packSpecId === p.id && s.isActive);
        const process = processMap.get(p.processSpecId);
        const ingredient = ingredientMap.get(p.ingredientId);
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (sku?.name || '').toLowerCase().includes(q) ||
          (sku?.code || '').toLowerCase().includes(q) ||
          (ingredient?.name || '').toLowerCase().includes(q) ||
          (process?.name || '').toLowerCase().includes(q)
        );
      })
      .map((pack) => {
        const sku = skuRows.find(s => s.packSpecId === pack.id && s.isActive);
        const process = processMap.get(pack.processSpecId);
        return {
          rowId: pack.id,
          pack,
          process,
          sku,
        };
      })
      .sort((a, b) => {
        const ia = ingredientMap.get(a.pack.ingredientId);
        const ib = ingredientMap.get(b.pack.ingredientId);
        const ra = ia?.isActive === false ? 1 : 0;
        const rb = ib?.isActive === false ? 1 : 0;
        if (ra !== rb) return ra - rb;
        const an = `${ia?.name || ''} ${a.process?.name || a.pack.name}`;
        const bn = `${ib?.name || ''} ${b.process?.name || b.pack.name}`;
        return an.localeCompare(bn, 'zh-Hant');
      });
  }, [packRows, channelFilter, typeFilter, search, skuRows, processMap, ingredientMap, materialCategoryFilter]);

  const skuRowKey = useCallback((row: SkuGridRow) => row.sku?.id || `PACK:${row.pack.id}`, []);

  const sanitizeSkuText = useCallback((value?: string) => {
    return (value || '')
      .replace(/數據1原件/gi, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const formatPackDescriptor = useCallback((pack: PackRow, ingredient?: Ingredient) => {
    if (pack.pricingType === 'fixed_pack' && (pack.specWeight || 0) > 0) {
      const unit = pack.specUnit === 'catty' ? '斤' : pack.specUnit;
      return `${pack.specWeight}${unit}`;
    }
    const ingUnit = (ingredient?.unit || '').toLowerCase();
    if (ingUnit === 'box' || ingUnit === 'pack') return `1 ${ingUnit}`;
    return '1 unit';
  }, []);

  const buildSkuDisplayName = useCallback((row: SkuGridRow) => {
    const ingredient = ingredientMap.get(row.pack.ingredientId);
    const process = row.process || processMap.get(row.pack.processSpecId);
    const processMethod = (process?.methodId ? methods.find(m => m.id === process.methodId) : undefined) || methods.find(m => m.code === process?.code);
    const materialName = sanitizeSkuText(ingredient?.name) || '未命名母料';
    const processName = sanitizeSkuText(processMethod?.name || process?.name || row.pack.name) || '未命名加工';
    const size = formatPackDescriptor(row.pack, ingredient);
    return `${materialName} - ${processName} (${size})`;
  }, [ingredientMap, processMap, methods, sanitizeSkuText, formatPackDescriptor]);

  const skuPricingRows = useMemo(() => {
    const q = skuSearch.trim().toLowerCase();
    if (!q) return skuGridRows;
    return skuGridRows.filter(row => {
      const display = buildSkuDisplayName(row).toLowerCase();
      const skuCode = (row.sku?.code || '').toLowerCase();
      return display.includes(q) || skuCode.includes(q);
    });
  }, [skuGridRows, skuSearch, buildSkuDisplayName]);


  const processedCostPerLb = useCallback((ingredientId: string, processId: string) => {
    const ing = ingredientMap.get(ingredientId);
    const proc = processMap.get(processId);
    if (!ing || !proc) return 0;
    const y = proc.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, proc.yieldRate || 1));
    const ingUnit = normalizeWeightUnit(ing.unit);
    // If ingredient is pre-packed, treat baseCostPerLb as "cost per pack"
    // and normalize it back to cost/lb using net content.
    let basePerLb = convertCost(ing.baseCostPerLb || 0, ingUnit, 'lb');
    if ((ing.netContentVolume || 0) > 0 && ing.netContentUnit) {
      const netLb = convertWeight(ing.netContentVolume || 0, ing.netContentUnit, 'lb');
      if (netLb > 0) basePerLb = (ing.baseCostPerLb || 0) / netLb;
    }
    return round2(basePerLb / y);
  }, [ingredientMap, processMap]);

  const processedCostPreview = useCallback((ingredientId: string, yieldRate: number, isDefaultPiece: boolean) => {
    const ing = ingredientMap.get(ingredientId);
    if (!ing) return 0;
    const y = isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, yieldRate || 1));
    const ingUnit = normalizeWeightUnit(ing.unit);
    let basePerLb = convertCost(ing.baseCostPerLb || 0, ingUnit, 'lb');
    if ((ing.netContentVolume || 0) > 0 && ing.netContentUnit) {
      const netLb = convertWeight(ing.netContentVolume || 0, ing.netContentUnit, 'lb');
      if (netLb > 0) basePerLb = (ing.baseCostPerLb || 0) / netLb;
    }
    return round2(basePerLb / y);
  }, [ingredientMap]);

  const isYieldValid = useCallback((yieldRate: number, isDefaultPiece?: boolean) => {
    if (isDefaultPiece) return true;
    return Number.isFinite(yieldRate) && yieldRate >= 0.5 && yieldRate <= 1;
  }, []);

  const calcTotalCost = useCallback((pack: PackRow) => {
    const processedLb = processedCostPerLb(pack.ingredientId, pack.processSpecId);
    if (pack.pricingType === 'by_piece') return round2(processedLb);
    const weightG = convertWeight(pack.specWeight || 0, pack.specUnit, 'g');
    const costPerG = convertCost(processedLb, 'lb', 'g');
    return round2((costPerG * weightG) + (pack.packagingFee || 0));
  }, [processedCostPerLb]);

  const computeMarginPct = useCallback((price: number, cost: number) => {
    if (price <= 0) return 0;
    return round2(((price - cost) / price) * 100);
  }, []);

  const computePriceFromMargin = useCallback((cost: number, marginPct: number) => {
    const ratio = 1 - (marginPct / 100);
    if (ratio <= 0.001) return 0;
    return round2(cost / ratio);
  }, []);

  const addIngredient = async () => {
    if (!newIngredient.name.trim()) return showToast('請輸入母料名稱', 'error');
    if (needsNetContent(newIngredient.unit) && (newIngredient.netContentVolume || 0) <= 0) {
      return showToast('使用 pack/box 單位時，請填寫淨含量', 'error');
    }
    const row = {
      id: mkId('ING'),
      name: newIngredient.name.trim(),
      supplier: newIngredient.supplier.trim() || null,
      category: newIngredient.category?.trim() || null,
      unit: newIngredient.unit,
      base_cost_per_lb: Number(newIngredient.cost) || 0,
      net_content_volume: newIngredient.netContentVolume > 0 ? Number(newIngredient.netContentVolume) : null,
      net_content_unit: newIngredient.netContentVolume > 0 ? newIngredient.netContentUnit : null,
      is_active: true,
      material_type: 'meat',
    };
    const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
    if (error) return showToast(`新增母料失敗：${error.message}`, 'error');
    const item = mapIngredientRowToIngredient(data as any);
    setIngredients(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedIngredientId(item.id);
    setNewIngredient({ name: '', supplier: '', category: newIngredient.category || '豬類', unit: 'lb', cost: 0, netContentVolume: 0, netContentUnit: 'g' });
  };

  const saveIngredient = async (item: Ingredient, options?: { silentSuccess?: boolean }) => {
    if (needsNetContent(item.unit) && (item.netContentVolume || 0) <= 0) {
      setSaveErrorIngredientId(item.id);
      showToast('pack/box 單位必須設定淨含量', 'error');
      return false;
    }
    setSavingIngredientId(item.id);
    setSaveErrorIngredientId(null);
    const { error } = await supabase.from('ingredients').update({
      name: item.name,
      supplier: item.supplier || null,
      category: item.category || null,
      unit: item.unit,
      base_cost_per_lb: item.baseCostPerLb,
      net_content_volume: item.netContentVolume || null,
      net_content_unit: item.netContentVolume ? (item.netContentUnit || 'g') : null,
    }).eq('id', item.id);
    if (error) {
      setSaveErrorIngredientId(item.id);
      showToast(`保存母料失敗：${error.message}`, 'error');
      setSavingIngredientId(prev => (prev === item.id ? null : prev));
      return false;
    }
    setSavingIngredientId(prev => (prev === item.id ? null : prev));
    setSavedIngredientId(item.id);
    if (savedIndicatorTimerRef.current) window.clearTimeout(savedIndicatorTimerRef.current);
    savedIndicatorTimerRef.current = window.setTimeout(() => setSavedIngredientId(prev => (prev === item.id ? null : prev)), 1600);
    if (!options?.silentSuccess) showToast('母料已自動儲存', 'success');
    return true;
  };

  const persistIngredientActivityFallback = async (ingredientId: string, nextActive: boolean) => {
    const cfg = await supabase
      .from('site_config')
      .select('value')
      .eq('id', INGREDIENT_ACTIVITY_CFG_ID)
      .maybeSingle();
    const prev = (!cfg.error && cfg.data?.value && typeof cfg.data.value === 'object')
      ? (cfg.data.value as Record<string, boolean>)
      : {};
    const next = { ...prev, [ingredientId]: nextActive };
    const upsert = await supabase.from('site_config').upsert({ id: INGREDIENT_ACTIVITY_CFG_ID, value: next });
    return !upsert.error;
  };

  const hideIngredientFallback = async (ingredientId: string) => {
    const cfg = await supabase
      .from('site_config')
      .select('value')
      .eq('id', INGREDIENT_DELETED_CFG_ID)
      .maybeSingle();
    const prev = (!cfg.error && Array.isArray(cfg.data?.value))
      ? (cfg.data!.value as any[]).map(v => String(v))
      : [];
    const next = Array.from(new Set([...prev, ingredientId]));
    const upsert = await supabase.from('site_config').upsert({ id: INGREDIENT_DELETED_CFG_ID, value: next });
    return !upsert.error;
  };

  const removeIngredientLocally = (ingredientId: string) => {
    setIngredients(prev => prev.filter(i => i.id !== ingredientId));
    setProcessRows(prev => prev.filter(r => r.ingredientId !== ingredientId));
    setPackRows(prev => prev.filter(r => r.ingredientId !== ingredientId));
    setPackDraftRows(prev => prev.filter(r => r.ingredientId !== ingredientId));
    setProcessDraftRows(prev => prev.filter(r => r.ingredientId !== ingredientId));
    setSkuRows(prev => prev.filter(r => r.ingredientId !== ingredientId));
    if (selectedIngredientId === ingredientId) {
      const fallback = ingredients.find(i => i.id !== ingredientId && i.isActive !== false) || ingredients.find(i => i.id !== ingredientId);
      setSelectedIngredientId(fallback?.id || '');
    }
  };

  const toggleIngredientActive = async (item: Ingredient, nextActive: boolean) => {
    const { error } = await supabase
      .from('ingredients')
      .update({ is_active: nextActive })
      .eq('id', item.id);
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      const canFallback = error.code === '42703' || error.code === '42501' || msg.includes('is_active') || msg.includes('row-level security');
      if (!canFallback) return showToast(`更新母料狀態失敗：${error.message}`, 'error');
      const ok = await persistIngredientActivityFallback(item.id, nextActive);
      if (!ok) return showToast(`更新母料狀態失敗：${error.message}`, 'error');
      setIngredients(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
      showToast(nextActive ? '母料已啟用（兼容模式）' : '母料已停用（兼容模式）', 'success');
      return;
    }
    setIngredients(prev => prev.map(i => i.id === item.id ? { ...i, isActive: nextActive } : i));
    showToast(nextActive ? '母料已啟用' : '母料已停用', 'success');
  };

  const deleteIngredient = async (item: Ingredient) => {
    const used = processRows.some(r => r.ingredientId === item.id && r.isActive)
      || packRows.some(r => r.ingredientId === item.id && r.isActive)
      || skuRows.some(r => r.ingredientId === item.id && r.isActive);
    const ok = window.confirm(used
      ? `「${item.name}」已有加工/包裝/SKU 關聯，確定要刪除？`
      : `確定刪除母料「${item.name}」？`);
    if (!ok) return;

    const skuIds = skuRows.filter(s => s.ingredientId === item.id).map(s => s.id);
    const productIds = skuRows.filter(s => s.ingredientId === item.id).map(s => s.productId).filter(Boolean);

    if (skuIds.length > 0) {
      const delCommercial = await supabase.from('commercial_skus').delete().in('canonical_sku_id', skuIds);
      if (delCommercial.error && delCommercial.error.code !== '42P01' && delCommercial.error.code !== 'PGRST205') {
        return showToast(`刪除商業 SKU 失敗：${delCommercial.error.message}`, 'error');
      }
    }
    const delMaterialSku = await supabase.from('material_skus').delete().eq('ingredient_id', item.id);
    if (delMaterialSku.error && delMaterialSku.error.code !== '42P01' && delMaterialSku.error.code !== 'PGRST205') {
      return showToast(`刪除關聯 material_skus 失敗：${delMaterialSku.error.message}`, 'error');
    }
    const delSellable = await supabase.from('sellable_skus').delete().eq('ingredient_id', item.id);
    if (delSellable.error) return showToast(`刪除關聯 sellable_skus 失敗：${delSellable.error.message}`, 'error');
    if (productIds.length > 0) {
      const delProducts = await supabase.from('products').delete().in('id', productIds);
      if (delProducts.error) return showToast(`刪除關聯 products 失敗：${delProducts.error.message}`, 'error');
    }
    const { error } = await supabase.from('ingredients').delete().eq('id', item.id);
    if (error) {
      // Fallback: hide locally + persist hidden/deactivated IDs for environments blocked by FK/RLS.
      const hideOk = await hideIngredientFallback(item.id);
      const activeOk = await persistIngredientActivityFallback(item.id, false);
      if (!hideOk || !activeOk) return showToast(`刪除母料失敗：${error.message}`, 'error');
      removeIngredientLocally(item.id);
      showToast('母料無法硬刪除，已改為隱藏處理', 'success');
      return;
    }

    removeIngredientLocally(item.id);
    showToast('母料已刪除', 'success');
  };

  useEffect(() => () => {
    if (savedIndicatorTimerRef.current) window.clearTimeout(savedIndicatorTimerRef.current);
  }, []);

  const addMethod = async () => {
    if (!newMethod.name.trim()) return showToast('請輸入加工方式名稱', 'error');
    const code = (newMethod.code || newMethod.name).trim().toUpperCase().replace(/\s+/g, '_');
    const { data, error } = await supabase.from('processing_methods').insert({
      code,
      name: newMethod.name.trim(),
      category: newMethod.category,
      sort_order: methods.length,
      is_active: true,
    }).select('id,code,name,category,is_active').single();
    if (error) return showToast(`新增方式失敗：${error.message}`, 'error');
    setMethods(prev => uniqueById([...prev, {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category,
      isActive: data.is_active !== false,
    }]));
    setNewMethod({ code: '', name: '', category: 'original_or_cutting' });
  };

  const saveMethod = async (method: GlobalMethod) => {
    const code = method.code.trim().toUpperCase().replace(/\s+/g, '_');
    if (!code || !method.name.trim()) return showToast('請輸入完整加工方式資料', 'error');
    const { error } = await supabase.from('processing_methods').update({
      code,
      name: method.name.trim(),
      category: method.category,
    }).eq('id', method.id);
    if (error) return showToast(`更新方式失敗：${error.message}`, 'error');
    setMethods(prev => prev.map(m => m.id === method.id ? { ...method, code } : m));
    setEditingMethodId(null);
    showToast('加工方式已更新', 'success');
  };

  const deleteMethod = async (method: GlobalMethod) => {
    const { count, error: countErr } = await supabase
      .from('material_process_specs')
      .select('id', { count: 'exact', head: true })
      .eq('processing_method_id', method.id)
      .eq('is_active', true);
    if (countErr) return showToast(`檢查使用情況失敗：${countErr.message}`, 'error');
    if ((count || 0) > 0) return showToast('此加工方式已有材料使用，不能刪除', 'error');

    const { error } = await supabase.from('processing_methods').delete().eq('id', method.id);
    if (error) return showToast(`刪除方式失敗：${error.message}`, 'error');
    setMethods(prev => prev.filter(m => m.id !== method.id));
    if (editingMethodId === method.id) setEditingMethodId(null);
    showToast('加工方式已刪除', 'success');
  };

  const ensureWholeBaselineForIngredient = useCallback(async (ingredientId: string) => {
    if (!ingredientId) return;
    const existing = processRows.find(r => r.ingredientId === ingredientId && (r.code === 'WHOLE' || r.isDefaultPiece) && r.isActive);
    const wholeMethod = methods.find(m => m.code === 'WHOLE');
    const baselineName = '原件/原箱 (Whole Block/Case)';
    if (existing) {
      if (
        existing.code === 'WHOLE' &&
        existing.name === baselineName &&
        existing.category === 'original_or_cutting' &&
        existing.yieldRate === 1 &&
        existing.isDefaultPiece
      ) {
        return;
      }
      const { error } = await supabase.from('material_process_specs').update({
        processing_method_id: wholeMethod?.id || existing.methodId || null,
        processing_category: 'original_or_cutting',
        code: 'WHOLE',
        name: baselineName,
        yield_rate: 1,
        is_default_piece: true,
      }).eq('id', existing.id);
      if (error) return;
      setProcessRows(prev => prev.map(r => r.id === existing.id ? {
        ...r,
        methodId: wholeMethod?.id || r.methodId,
        code: 'WHOLE',
        name: baselineName,
        category: 'original_or_cutting',
        yieldRate: 1,
        isDefaultPiece: true,
      } : r));
      return;
    }
    const payload = {
      id: mkId('PS'),
      ingredient_id: ingredientId,
      processing_method_id: wholeMethod?.id || null,
      processing_category: 'original_or_cutting',
      code: 'WHOLE',
      name: baselineName,
      yield_rate: 1,
      pack_quantity: null,
      pack_unit: null,
      is_default_piece: true,
      sort_order: processRows.filter(r => r.ingredientId === ingredientId).length,
      is_active: true,
    };
    const { data, error } = await supabase.from('material_process_specs').insert(payload).select('*').single();
    if (error) return;
    setProcessRows(prev => uniqueById([...prev, {
      id: data.id,
      ingredientId: data.ingredient_id,
      methodId: data.processing_method_id || undefined,
      code: data.code,
      name: data.name,
      category: 'original_or_cutting',
      yieldRate: 1,
      packQuantity: data.pack_quantity == null ? undefined : Number(data.pack_quantity),
      packUnit: data.pack_unit || undefined,
      isDefaultPiece: true,
      isActive: data.is_active !== false,
    }]));
  }, [methods, processRows]);

  const appendProcessDraftRow = useCallback(() => {
    if (!selectedIngredientId) return;
    const selected = ingredients.find(i => i.id === selectedIngredientId);
    if (selected?.isActive === false) return showToast('停用母料不能新增加工', 'error');
    const firstMethod = methods.find(m => m.isActive && m.code !== 'WHOLE') || methods.find(m => m.isActive);
    if (!firstMethod) return showToast('尚未設定可用加工方式', 'error');
    const suffix = Date.now().toString().slice(-4);
    setProcessDraftRows(prev => ([...prev, {
      tempId: mkId('TMP-PS'),
      ingredientId: selectedIngredientId,
      methodId: firstMethod.id,
      code: `${firstMethod.code}_${suffix}`,
      category: firstMethod.category,
      yieldRate: 0.85,
    }]));
  }, [methods, selectedIngredientId, ingredients, showToast]);

  const saveDraftProcessRow = async (draft: ProcessDraftRow) => {
    const ing = ingredientMap.get(draft.ingredientId);
    if (ing?.isActive === false) return showToast('停用母料不能保存加工', 'error');
    if (!isYieldValid(draft.yieldRate)) {
      return showToast('Yield 必須介乎 0.5 至 1.0', 'error');
    }
    const method = methods.find(m => m.id === draft.methodId);
    const payload = {
      id: mkId('PS'),
      ingredient_id: draft.ingredientId,
      processing_method_id: draft.methodId || null,
      processing_category: draft.category,
      code: (draft.code || method?.code || 'PROC').trim(),
      name: (method?.name || draft.code || '加工規格').trim(),
      yield_rate: draft.yieldRate,
      pack_quantity: null,
      pack_unit: null,
      is_default_piece: false,
      sort_order: processRows.filter(r => r.ingredientId === draft.ingredientId).length,
      is_active: true,
    };
    const { data, error } = await supabase.from('material_process_specs').insert(payload).select('*').single();
    if (error) return showToast(`新增加工失敗：${error.message}`, 'error');
    setProcessRows(prev => uniqueById([...prev, {
      id: data.id,
      ingredientId: data.ingredient_id,
      methodId: data.processing_method_id || undefined,
      code: data.code,
      name: data.name,
      category: (['original_or_cutting', 'repacking', 'marinating', 'others'].includes(data.processing_category) ? data.processing_category : 'others') as MethodCategory,
      yieldRate: Number(data.yield_rate) || 1,
      packQuantity: data.pack_quantity == null ? undefined : Number(data.pack_quantity),
      packUnit: data.pack_unit || undefined,
      isDefaultPiece: !!data.is_default_piece,
      isActive: data.is_active !== false,
    }]));
    setProcessDraftRows(prev => prev.filter(r => r.tempId !== draft.tempId));
    showToast('加工方式已儲存', 'success');
  };

  useEffect(() => {
    if (tab !== 'process' || !selectedIngredientId) return;
    if (baselineEnsuringRef.current[selectedIngredientId]) return;
    const hasBaseline = processRows.some(r => r.ingredientId === selectedIngredientId && r.isActive && (r.code === 'WHOLE' || r.isDefaultPiece));
    if (hasBaseline) return;
    baselineEnsuringRef.current[selectedIngredientId] = true;
    void ensureWholeBaselineForIngredient(selectedIngredientId).finally(() => {
      baselineEnsuringRef.current[selectedIngredientId] = false;
    });
  }, [tab, selectedIngredientId, processRows, ensureWholeBaselineForIngredient]);

  const selectedIngredient = useMemo(
    () => ingredients.find(m => m.id === selectedIngredientId),
    [ingredients, selectedIngredientId]
  );
  const selectedIngredientInactive = selectedIngredient?.isActive === false;
  const skuPricingRowsForSelected = useMemo(
    () => skuPricingRows.filter(row => row.pack.ingredientId === selectedIngredientId),
    [skuPricingRows, selectedIngredientId]
  );

  const saveProcessRow = async (row: ProcessRow) => {
    const ing = ingredientMap.get(row.ingredientId);
    if (ing?.isActive === false) return showToast('停用母料不能保存加工', 'error');
    if (!isYieldValid(row.yieldRate, row.isDefaultPiece)) {
      return showToast('Yield 必須介乎 0.5 至 1.0', 'error');
    }
    const method = methods.find(m => m.id === row.methodId);
    const { error } = await supabase.from('material_process_specs').update({
      processing_method_id: row.methodId || null,
      processing_category: method?.category || row.category,
      code: method?.code || row.code,
      name: method?.name || row.name,
      yield_rate: row.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, row.yieldRate)),
      pack_quantity: null,
      pack_unit: null,
    }).eq('id', row.id);
    if (error) return showToast(`保存加工失敗：${error.message}`, 'error');
    showToast('加工方式已儲存', 'success');
  };

  const packagingFeeByCodes = useCallback((codes: string[]) => {
    return round2(codes.reduce((sum, code) => sum + (packagingItems.find(item => item.code === code)?.defaultPrice || 0), 0));
  }, [packagingItems]);

  const addPackagingItem = async () => {
    const code = newPackagingItem.code.trim().toUpperCase().replace(/\s+/g, '_');
    if (!code || !newPackagingItem.name.trim()) return showToast('請輸入包材 code / 名稱', 'error');
    if (packagingItems.some(i => i.code === code)) return showToast('包材 Code 重覆', 'error');
    const payload = {
      code,
      name: newPackagingItem.name.trim(),
      cost: Number(newPackagingItem.defaultPrice) || 0,
      sort_order: packagingItems.length,
      is_active: true,
    };
    const { data, error } = await supabase.from('packaging_materials').insert(payload).select('id,code,name,cost').single();
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || String(error.message || '').includes('schema cache')) {
        const next = [...packagingItems, { id: mkId('PKI'), code, name: newPackagingItem.name.trim(), defaultPrice: Number(newPackagingItem.defaultPrice) || 0 }];
        const fb = await supabase.from('site_config').upsert({ id: 'packaging_items', value: next });
        if (fb.error) return showToast(`新增包材失敗：${fb.error.message}`, 'error');
        setPackagingItems(next);
        setNewPackagingItem({ code: '', name: '', defaultPrice: 0 });
        showToast('包材項目已新增（本地字典）', 'success');
        return;
      }
      return showToast(`新增包材失敗：${error.message}`, 'error');
    }
    setPackagingItems(prev => [...prev, { id: data.id, code: data.code, name: data.name, defaultPrice: Number(data.cost) || 0 }]);
    setNewPackagingItem({ code: '', name: '', defaultPrice: 0 });
    showToast('包材項目已新增', 'success');
  };

  const savePackagingItem = async (item: PackagingItem) => {
    const code = item.code.trim().toUpperCase().replace(/\s+/g, '_');
    if (!code || !item.name.trim()) return showToast('請輸入完整包材資料', 'error');
    const duplicated = packagingItems.some(i => i.id !== item.id && i.code === code);
    if (duplicated) return showToast('包材 Code 重覆', 'error');
    const { error } = await supabase.from('packaging_materials').update({
      code,
      name: item.name.trim(),
      cost: Number(item.defaultPrice) || 0,
    }).eq('id', item.id);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || String(error.message || '').includes('schema cache')) {
        const next = packagingItems.map(i => i.id === item.id ? { ...item, code } : i);
        const fb = await supabase.from('site_config').upsert({ id: 'packaging_items', value: next });
        if (fb.error) return showToast(`更新包材失敗：${fb.error.message}`, 'error');
        setPackagingItems(next);
        setEditingPackagingItemId(null);
        showToast('包材項目已更新（本地字典）', 'success');
        return;
      }
      return showToast(`更新包材失敗：${error.message}`, 'error');
    }
    setPackagingItems(prev => prev.map(i => i.id === item.id ? { ...item, code } : i));
    setEditingPackagingItemId(null);
    showToast('包材項目已更新', 'success');
  };

  const deletePackagingItem = async (item: PackagingItem) => {
    const { error } = await supabase.from('packaging_materials').delete().eq('id', item.id);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205' || String(error.message || '').includes('schema cache')) {
        const next = packagingItems.filter(i => i.id !== item.id);
        const fb = await supabase.from('site_config').upsert({ id: 'packaging_items', value: next });
        if (fb.error) return showToast(`刪除包材失敗：${fb.error.message}`, 'error');
        setPackagingItems(next);
        setEditingPackagingItemId(prev => (prev === item.id ? null : prev));
        showToast('包材項目已刪除（本地字典）', 'success');
        return;
      }
      return showToast(`刪除包材失敗：${error.message}`, 'error');
    }
    setPackagingItems(prev => prev.filter(i => i.id !== item.id));
    setEditingPackagingItemId(prev => (prev === item.id ? null : prev));
    showToast('包材項目已刪除', 'success');
  };

  const addMaterialCategory = async () => {
    const name = newMaterialCategory.name.trim();
    if (!name) return showToast('請輸入分類名稱', 'error');
    if (materialCategories.some(c => c.name === name)) return showToast('分類名稱重覆', 'error');
    const payload = {
      id: mkId('MC'),
      name,
      sort_order: Number(newMaterialCategory.sortOrder) || materialCategories.length,
      is_active: newMaterialCategory.isActive !== false,
    };
    const { data, error } = await supabase.from('material_categories').insert(payload).select('id,name,sort_order,is_active').single();
    if (error) return showToast(`新增分類失敗：${error.message}`, 'error');
    setMaterialCategories(prev => [...prev, {
      id: data.id,
      name: data.name,
      sortOrder: Number(data.sort_order) || 0,
      isActive: data.is_active !== false,
    }].sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name, 'zh-Hant')));
    setNewMaterialCategory({ name: '', sortOrder: materialCategories.length + 1, isActive: true });
    showToast('母料分類已新增', 'success');
  };

  const saveMaterialCategory = async (item: MaterialCategoryItem) => {
    const name = item.name.trim();
    if (!name) return showToast('請輸入分類名稱', 'error');
    if (materialCategories.some(c => c.id !== item.id && c.name === name)) return showToast('分類名稱重覆', 'error');
    const { error } = await supabase
      .from('material_categories')
      .update({
        name,
        sort_order: Number(item.sortOrder) || 0,
        is_active: item.isActive !== false,
      })
      .eq('id', item.id);
    if (error) return showToast(`更新分類失敗：${error.message}`, 'error');
    setMaterialCategories(prev => prev.map(c => c.id === item.id ? { ...item, name } : c).sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name, 'zh-Hant')));
    setEditingMaterialCategoryId(null);
    showToast('母料分類已更新', 'success');
  };

  const addPackDraftRow = (process: ProcessRow) => {
    const ing = ingredientMap.get(process.ingredientId);
    if (ing?.isActive === false) return showToast('停用母料不能新增包裝規格', 'error');
    const defaultMode: PricingType = 'fixed_pack';
    setPackDraftRows(prev => [...prev, {
      tempId: mkId('TMP-PK'),
      processSpecId: process.id,
      ingredientId: process.ingredientId,
      code: `PACK_${Date.now().toString().slice(-4)}`,
      name: `${process.name} 規格`,
      pricingType: defaultMode,
      specWeight: 500,
      specUnit: 'g',
      packLabel: '500g/包',
      packagingItemCodes: [],
    }]);
  };

  const savePackDraftRow = async (draft: PackDraftRow) => {
    const ing = ingredientMap.get(draft.ingredientId);
    if (ing?.isActive === false) return showToast('停用母料不能保存包裝', 'error');
    if (!draft.name.trim()) return showToast('請輸入規格名稱', 'error');
    if (draft.pricingType === 'fixed_pack' && (draft.specWeight || 0) <= 0) return showToast('定額規格需設定數量', 'error');
    const fee = packagingFeeByCodes(draft.packagingItemCodes);
    const lb = draft.pricingType === 'fixed_pack' ? convertWeight(draft.specWeight || 0, draft.specUnit, 'lb') : null;
    const payload: any = {
      id: mkId('PK'),
      ingredient_id: draft.ingredientId,
      process_spec_id: draft.processSpecId,
      code: draft.code,
      name: draft.name.trim(),
      pricing_mode: draft.pricingType,
      target_channel: 'both',
      spec_weight: draft.pricingType === 'fixed_pack' ? draft.specWeight : 1,
      spec_unit: draft.pricingType === 'fixed_pack' ? draft.specUnit : 'lb',
      pack_label: draft.packLabel || null,
      packaging_fee: fee,
      pack_weight_lb: lb,
      pack_quantity: null,
      pack_unit: null,
      is_active: true,
      sort_order: packRows.filter(r => r.ingredientId === draft.ingredientId && r.processSpecId === draft.processSpecId).length,
    };
    if (supportsPackagingItemCodes) payload.packaging_item_codes = draft.packagingItemCodes;
    const { data, error } = await supabase.from('material_pack_specs').insert(payload).select('*').single();
    if (error) {
      if (supportsPackagingItemCodes && isMissingPackagingItemCodesError(error)) {
        setSupportsPackagingItemCodes(false);
        const retryPayload = { ...payload };
        delete retryPayload.packaging_item_codes;
        const retry = await supabase.from('material_pack_specs').insert(retryPayload).select('*').single();
        if (retry.error) return showToast(`儲存規格失敗：${retry.error.message}`, 'error');
        const retryData = retry.data as any;
        setPackRows(prev => uniqueById([...prev, {
          id: retryData.id,
          ingredientId: retryData.ingredient_id,
          processSpecId: retryData.process_spec_id,
          code: retryData.code,
          name: retryData.name,
          pricingType: retryData.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
          channel: retryData.target_channel === 'retail' || retryData.target_channel === 'wholesale' || retryData.target_channel === 'both' ? retryData.target_channel : 'both',
          specWeight: Number(retryData.spec_weight) || 0,
          specUnit: retryData.spec_unit,
          packLabel: retryData.pack_label || '',
          packagingFee: Number(retryData.packaging_fee) || 0,
          packagingItemCodes: draft.packagingItemCodes,
          packWeightLb: retryData.pack_weight_lb == null ? undefined : Number(retryData.pack_weight_lb),
          packQuantity: retryData.pack_quantity == null ? undefined : Number(retryData.pack_quantity),
          packUnit: retryData.pack_unit || undefined,
          isActive: retryData.is_active !== false,
        }]));
        setPackDraftRows(prev => prev.filter(r => r.tempId !== draft.tempId));
        showToast('包裝規格已儲存（兼容模式）', 'success');
        return;
      }
      return showToast(`儲存規格失敗：${error.message}`, 'error');
    }
    setPackRows(prev => uniqueById([...prev, {
      id: data.id,
      ingredientId: data.ingredient_id,
      processSpecId: data.process_spec_id,
      code: data.code,
      name: data.name,
      pricingType: data.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
      channel: data.target_channel === 'retail' || data.target_channel === 'wholesale' || data.target_channel === 'both' ? data.target_channel : 'both',
      specWeight: Number(data.spec_weight) || 0,
      specUnit: data.spec_unit,
      packLabel: data.pack_label || '',
      packagingFee: Number(data.packaging_fee) || 0,
      packagingItemCodes: Array.isArray(data.packaging_item_codes) ? data.packaging_item_codes.filter((x: any) => typeof x === 'string') : [],
      packWeightLb: data.pack_weight_lb == null ? undefined : Number(data.pack_weight_lb),
      packQuantity: data.pack_quantity == null ? undefined : Number(data.pack_quantity),
      packUnit: data.pack_unit || undefined,
      isActive: data.is_active !== false,
    }]));
    setPackDraftRows(prev => prev.filter(r => r.tempId !== draft.tempId));
    showToast('包裝規格已儲存', 'success');
  };

  const savePackRow = async (row: PackRow) => {
    const ing = ingredientMap.get(row.ingredientId);
    if (ing?.isActive === false) return showToast('停用母料不能保存包裝', 'error');
    const lb = row.pricingType === 'fixed_pack' ? convertWeight(row.specWeight || 0, row.specUnit, 'lb') : null;
    const fee = packagingFeeByCodes(row.packagingItemCodes || []);
    const updatePayload: any = {
      process_spec_id: row.processSpecId,
      name: row.name,
      pricing_mode: row.pricingType,
      target_channel: 'both',
      spec_weight: row.specWeight,
      spec_unit: row.specUnit,
      pack_label: row.packLabel,
      packaging_fee: fee,
      pack_weight_lb: lb,
      pack_quantity: null,
      pack_unit: null,
    };
    if (supportsPackagingItemCodes) updatePayload.packaging_item_codes = row.packagingItemCodes || [];
    const { error } = await supabase.from('material_pack_specs').update(updatePayload).eq('id', row.id);
    if (error) {
      if (supportsPackagingItemCodes && isMissingPackagingItemCodesError(error)) {
        setSupportsPackagingItemCodes(false);
        const retryPayload = { ...updatePayload };
        delete retryPayload.packaging_item_codes;
        const retry = await supabase.from('material_pack_specs').update(retryPayload).eq('id', row.id);
        if (retry.error) return showToast(`保存包裝失敗：${retry.error.message}`, 'error');
        setPackRows(prev => prev.map(r => r.id === row.id ? { ...r, packagingFee: fee } : r));
        showToast('包裝規格已儲存（兼容模式）', 'success');
        return;
      }
      return showToast(`保存包裝失敗：${error.message}`, 'error');
    }
    setPackRows(prev => prev.map(r => r.id === row.id ? { ...r, packagingFee: fee } : r));
    showToast('包裝規格已儲存', 'success');
  };

  const deletePackRow = async (rowId: string) => {
    const skuRes = await supabase.from('sellable_skus').select('id,product_id').eq('pack_spec_id', rowId);
    if (!skuRes.error && Array.isArray(skuRes.data) && skuRes.data.length > 0) {
      const skuIds = skuRes.data.map((r: any) => r.id).filter(Boolean);
      if (skuIds.length > 0) {
        const delSku = await supabase.from('sellable_skus').delete().in('id', skuIds);
        if (delSku.error) return showToast(`刪除關聯 SKU 失敗：${delSku.error.message}`, 'error');
      }
    }
    // Compatibility: some environments may still use material_skus table.
    const legacySkuDelete = await supabase.from('material_skus').delete().eq('pack_spec_id', rowId);
    if (legacySkuDelete.error && legacySkuDelete.error.code !== '42P01' && legacySkuDelete.error.code !== 'PGRST205') {
      return showToast(`刪除舊關聯 SKU 失敗：${legacySkuDelete.error.message}`, 'error');
    }

    const { error } = await supabase.from('material_pack_specs').delete().eq('id', rowId);
    if (error) return showToast(`刪除規格失敗：${error.message}`, 'error');
    setPackRows(prev => prev.filter(r => r.id !== rowId));
    showToast('包裝規格已刪除', 'success');
  };

  const addSku = async () => {
    const pack = packMap.get(newSku.packSpecId);
    if (!pack) return showToast('請先選擇包裝規格', 'error');
    const process = processMap.get(pack.processSpecId);
    const ingredient = ingredientMap.get(pack.ingredientId);
    if (!process || !ingredient) return showToast('關聯資料不完整', 'error');
    if (!newSku.name.trim()) return showToast('請輸入 SKU 名稱', 'error');

    const suffix = process.category === 'repacking' && (process.packQuantity || pack.packQuantity)
      ? ` - 分裝 ${process.packQuantity || pack.packQuantity}${process.packUnit || pack.packUnit || 'g'}`
      : '';
    const finalName = `${newSku.name.trim()}${suffix}`;

    const totalCost = calcTotalCost(pack);
    const p0 = baseDenominator > 0 ? round2(totalCost / baseDenominator) : totalCost;
    const productId = mkId('P');
    const packLb = convertWeight(pack.specWeight || 0, pack.specUnit, 'lb');
    const packagingCostPerLb = pack.pricingType === 'fixed_pack' && packLb > 0 ? round2(pack.packagingFee / packLb) : 0;
    const variantLabel = `${process.name}${suffix}`.trim();

    const { error: productError } = await supabase.from('products').insert({
      id: productId,
      name: finalName,
      categories: [],
      price: p0,
      member_price: p0,
      stock: 0,
      track_inventory: true,
      tags: ['sellable_sku'],
      image: '📦',
      ingredient_id: ingredient.id,
      parent_ingredient_id: ingredient.id,
      processing_type_id: process.methodId || null,
      yield_rate: process.yieldRate,
      processing_cost: 0,
      packaging_cost: packagingCostPerLb,
      misc_cost: 0,
      sale_channel: pack.channel,
      product_type: 'processed',
      pack_size: pack.packLabel || null,
      pack_weight_lb: pack.pricingType === 'fixed_pack' ? packLb : null,
      group_id: null,
      variant_label: variantLabel,
      pricing_mode: pack.pricingType,
      processing_spec: process.name,
    });
    if (productError) return showToast(`新增商品失敗：${productError.message}`, 'error');

    const skuPayload = {
      id: mkId('SKU'),
      code: `${finalName.toUpperCase().replace(/\s+/g, '_').slice(0, 28)}_${Date.now().toString().slice(-4)}`,
      name: finalName,
      alias: newSku.alias.trim() || null,
      ingredient_id: ingredient.id,
      process_spec_id: process.id,
      pack_spec_id: pack.id,
      product_id: productId,
      sale_channel: pack.channel,
      sort_order: skuRows.length,
      is_active: true,
    };
    const { data, error } = await supabase.from('sellable_skus').insert(skuPayload).select('*').single();
    if (error) return showToast(`新增 SKU 失敗：${error.message}`, 'error');

    setSkuRows(prev => uniqueById([...prev, {
      id: data.id,
      code: data.code,
      name: data.name,
      alias: data.alias || undefined,
      ingredientId: data.ingredient_id,
      processSpecId: data.process_spec_id,
      packSpecId: data.pack_spec_id,
      productId: data.product_id,
      saleChannel: data.sale_channel,
      isActive: data.is_active !== false,
    }]));

    setProducts(prev => [...prev, {
      id: productId,
      name: finalName,
      categories: [],
      price: p0,
      memberPrice: p0,
      stock: 0,
      trackInventory: true,
      tags: ['sellable_sku'],
      image: '📦',
      ingredientId: ingredient.id,
      parentIngredientId: ingredient.id,
      yieldRate: process.yieldRate,
      processingCost: 0,
      packagingCost: packagingCostPerLb,
      miscCost: 0,
      saleChannel: pack.channel,
      productType: 'processed',
      packSize: pack.packLabel,
      packWeightLb: pack.pricingType === 'fixed_pack' ? packLb : undefined,
      variantLabel,
      pricingMode: pack.pricingType,
      processingSpec: process.name,
      processingTypeId: process.methodId,
      categoryId: ingredient.category || undefined,
    }]);

    setNewSku({ packSpecId: '', name: '', alias: '' });
  };

  useEffect(() => {
    if (tab !== 'sku') return;
    setPricingDrafts(prev => {
      const next: Record<string, PricingRowState> = {};
      skuGridRows.forEach((row) => {
        const rowKey = skuRowKey(row);
        const baseCost = calcTotalCost(row.pack);
        const saved = pricingOverrides[rowKey];
        const fallbackByLevel = (level: number) => {
          const denom = baseDenominator - (level * tierStep);
          if (denom <= 0.01) return 0;
          return round2(baseCost / denom);
        };
        const fromSaved = (tier: PricingTierKey, level: number): PricingTierState => {
          const savedTier = saved && typeof saved === 'object' ? saved[tier] : null;
          const price = Number(savedTier?.price);
          const validPrice = Number.isFinite(price) && price > 0 ? price : fallbackByLevel(level);
          const margin = Number(savedTier?.margin);
          const validMargin = Number.isFinite(margin) ? margin : computeMarginPct(validPrice, Number(saved?.costOverride ?? baseCost) || baseCost);
          return { price: round2(validPrice), margin: round2(validMargin) };
        };
        const baseRowState: PricingRowState = {
          costOverride: Number.isFinite(Number(saved?.costOverride)) ? Number(saved.costOverride) : undefined,
          tiers: {
            P0: fromSaved('P0', 0),
            P1: fromSaved('P1', 1),
            P2: fromSaved('P2', 2),
            P3: fromSaved('P3', 3),
          },
        };
        next[rowKey] = prev[rowKey] || baseRowState;
      });
      return next;
    });
  }, [tab, skuGridRows, pricingOverrides, baseDenominator, tierStep, calcTotalCost, skuRowKey, computeMarginPct]);

  const marginTextClass = useCallback((margin: number) => {
    if (margin >= greenThresholdPct) return 'text-emerald-600';
    if (margin < redThresholdPct) return 'text-rose-600';
    return 'text-amber-600';
  }, [greenThresholdPct, redThresholdPct]);

  const packSizeLb = useCallback((pack: PackRow) => {
    if ((pack.packWeightLb || 0) > 0) return Number(pack.packWeightLb);
    if (pack.pricingType === 'fixed_pack' && (pack.specWeight || 0) > 0) return convertWeight(pack.specWeight || 0, pack.specUnit, 'lb');
    return 1;
  }, []);

  const updatePriceInput = (rowKey: string, tier: PricingTierKey, nextPrice: number, effectiveCost: number) => {
    setPricingDrafts(prev => {
      const row = prev[rowKey];
      if (!row) return prev;
      const price = Number.isFinite(nextPrice) ? nextPrice : 0;
      const margin = computeMarginPct(price, effectiveCost);
      return {
        ...prev,
        [rowKey]: {
          ...row,
          tiers: {
            ...row.tiers,
            [tier]: { price, margin },
          },
        },
      };
    });
  };

  const updateMarginInput = (rowKey: string, tier: PricingTierKey, nextMargin: number, effectiveCost: number) => {
    setPricingDrafts(prev => {
      const row = prev[rowKey];
      if (!row) return prev;
      const margin = Number.isFinite(nextMargin) ? nextMargin : 0;
      const price = computePriceFromMargin(effectiveCost, margin);
      return {
        ...prev,
        [rowKey]: {
          ...row,
          tiers: {
            ...row.tiers,
            [tier]: { price, margin },
          },
        },
      };
    });
  };

  const savePricingRow = async (row: SkuGridRow) => {
    const rowKey = skuRowKey(row);
    const draft = pricingDrafts[rowKey];
    if (!draft) return;
    const ingredient = ingredientMap.get(row.pack.ingredientId);
    if (ingredient?.isActive === false) return showToast('停用母料不可儲存 SKU 成本', 'error');
    const process = row.process || processMap.get(row.pack.processSpecId);
    const materialCategory = (ingredient?.category || '').trim();
    const displayName = buildSkuDisplayName(row);
    const effectiveCost = Number.isFinite(Number(draft.costOverride)) ? Number(draft.costOverride) : calcTotalCost(row.pack);
    const productId = row.sku?.productId || mkId('P');
    const existingProduct = products.find(p => p.id === productId);
    const skuId = row.sku?.id || mkId('SKU');
    const skuCode = row.sku?.code || `${displayName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '').slice(0, 28)}_${Date.now().toString().slice(-4)}`;

    const payload = {
      costOverride: draft.costOverride ?? null,
    };
    const merged = { ...pricingOverrides, [rowKey]: payload };
    const { error } = await supabase.from('site_config').upsert({ id: 'material_flow_cost_overrides', value: merged });
    if (error) return showToast(`保存成本覆蓋失敗：${error.message}`, 'error');

    const materialSkuPayload = {
      id: skuId,
      ingredient_id: row.pack.ingredientId,
      process_spec_id: row.pack.processSpecId,
      pack_spec_id: row.pack.id,
      product_id: productId,
      category_id: materialCategory || null,
      effective_cost: effectiveCost,
      pricing_payload: payload,
      is_active: true,
      updated_at: new Date().toISOString(),
    } as any;
    const skuWrite = await supabase.from('material_skus').upsert(materialSkuPayload, { onConflict: 'id' });
    if (skuWrite.error && skuWrite.error.code !== '42P01' && skuWrite.error.code !== 'PGRST205') {
      return showToast(`保存 material_skus 失敗：${skuWrite.error.message}`, 'error');
    }

    const productPayload = {
      id: productId,
      name: displayName,
      categories: materialCategory ? [materialCategory] : [],
      price: existingProduct?.price ?? 0,
      member_price: existingProduct?.memberPrice ?? 0,
      cost_price: effectiveCost,
      stock: 0,
      track_inventory: true,
      tags: ['sellable_sku', 'material_flow'],
      image: '📦',
      ingredient_id: row.pack.ingredientId,
      parent_ingredient_id: row.pack.ingredientId,
      processing_type_id: process?.methodId || null,
      pricing_mode: row.pack.pricingType,
      processing_spec: process?.name || row.pack.name,
      updated_at: new Date().toISOString(),
    } as any;
    const productWrite = await supabase.from('products').upsert(productPayload, { onConflict: 'id' });
    if (productWrite.error) return showToast(`同步產品清單失敗：${productWrite.error.message}`, 'error');

    const sellablePayload = {
      id: skuId,
      code: skuCode,
      name: displayName,
      alias: row.sku?.alias || null,
      ingredient_id: row.pack.ingredientId,
      process_spec_id: row.pack.processSpecId,
      pack_spec_id: row.pack.id,
      product_id: productId,
      sale_channel: row.sku?.saleChannel || row.pack.channel || 'both',
      sort_order: 0,
      is_active: true,
    };
    const skuUpsert = await supabase.from('sellable_skus').upsert(sellablePayload, { onConflict: 'id' }).select('*').single();
    if (skuUpsert.error) return showToast(`同步 SKU 失敗：${skuUpsert.error.message}`, 'error');
    const skuData = skuUpsert.data as any;
    setSkuRows(prev => uniqueById([...prev.filter(s => s.id !== skuId), {
      id: skuData.id,
      code: skuData.code,
      name: skuData.name,
      alias: skuData.alias || undefined,
      ingredientId: skuData.ingredient_id,
      processSpecId: skuData.process_spec_id,
      packSpecId: skuData.pack_spec_id,
      productId: skuData.product_id,
      saleChannel: (['retail', 'wholesale', 'both'].includes(skuData.sale_channel) ? skuData.sale_channel : 'both') as SaleChannel,
      isActive: skuData.is_active !== false,
    }]));
    setProducts(prev => {
      const exists = prev.some(p => p.id === productId);
      const current = prev.find(p => p.id === productId);
      const nextProduct = {
        id: productId,
        name: displayName,
        categories: materialCategory ? [materialCategory] : [],
        price: current?.price ?? 0,
        memberPrice: current?.memberPrice ?? 0,
        stock: 0,
        trackInventory: true,
        tags: ['sellable_sku', 'material_flow'],
        image: '📦',
        costPrice: effectiveCost,
        ingredientId: row.pack.ingredientId,
        parentIngredientId: row.pack.ingredientId,
        pricingMode: row.pack.pricingType,
        processingSpec: process?.name || row.pack.name,
      } as Product;
      if (exists) return prev.map(p => p.id === productId ? { ...p, ...nextProduct } : p);
      return [...prev, nextProduct];
    });

    setPricingOverrides(merged);
    showToast('SKU 與成本已儲存並同步產品清單', 'success');
  };

  const exportQuotePdf = () => {
    const chosen = skuPricingRows.filter(r => r.sku);
    if (chosen.length === 0) return showToast('目前沒有可導出的 SKU', 'error');
    const tier = tierDefs.find(t => t.key === (selectedTierForPdf as PricingTierKey));
    if (!tier) return;
    const refNo = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}-${QUOTE_SUFFIX[selectedTierForPdf] || 'A0'}`;
    const rows = chosen.map((row, i) => {
      const rowKey = skuRowKey(row);
      const draft = pricingDrafts[rowKey];
      const displayName = buildSkuDisplayName(row);
      const price = draft?.tiers?.[tier.key]?.price ?? 0;
      return `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0">${i + 1}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${displayName}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">$${price.toFixed(2)}</td></tr>`;
    }).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Quotation</title></head><body style="font-family:Inter,Arial,sans-serif;padding:32px;color:#0f172a"><div style="display:flex;justify-content:space-between;border-bottom:2px solid #0f172a;padding-bottom:12px"><div><h1 style="margin:0;font-size:24px">Quotation</h1><div style="font-size:12px;color:#64748b">Material Flow Pricing</div></div><div style="text-align:right"><div style="font-size:12px;color:#64748b">Ref No.</div><div style="font-weight:800">${refNo}</div></div></div><table style="width:100%;border-collapse:collapse;margin-top:16px"><thead><tr style="background:#f8fafc"><th style="padding:10px;text-align:left">#</th><th style="padding:10px;text-align:left">Item</th><th style="padding:10px;text-align:right">Price</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open('', '_blank', 'width=980,height=760');
    if (!w) return showToast('瀏覽器阻擋彈窗', 'error');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-white rounded-xl"><Grid3X3 size={16} /></div>
        <div>
          <h3 className="font-black text-sm text-slate-900">4-Step Material Flow Workstation</h3>
          <p className="text-[11px] font-bold text-slate-500">母料 → 加工 → 包裝 → SKU 成本（含分類與分裝欄位）</p>
        </div>
        <button onClick={() => void loadAll()} className="ml-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 flex items-center gap-1.5">{loading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />} Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('raw')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Layers size={16} />1. 母料</button>
        <button onClick={() => setTab('process')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'process' ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Scissors size={16} />2. 加工</button>
        <button onClick={() => setTab('pack')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'pack' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Package size={16} />3. 包裝</button>
        <button onClick={() => setTab('sku')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'sku' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Grid3X3 size={16} />4. SKU 成本</button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋母料/SKU名稱..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
        </div>
        <select
          value={materialCategoryFilter}
          onChange={e => setMaterialCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-700 bg-white"
        >
          <option value="all">全部分類</option>
          {activeMaterialCategoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="未分類">未分類</option>
        </select>
        {(['all', 'wholesale', 'retail'] as ChannelFilter[]).map(v => <button key={v} onClick={() => setChannelFilter(v)} className={`px-3 py-2 rounded-lg text-[11px] font-black ${channelFilter === v ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>{v === 'all' ? '全部' : v === 'wholesale' ? '批發' : '零售'}</button>)}
        {(['all', 'fixed_pack', 'by_piece'] as TypeFilter[]).map(v => <button key={v} onClick={() => setTypeFilter(v)} className={`px-3 py-2 rounded-lg text-[11px] font-black ${typeFilter === v ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>{v === 'all' ? '全部類型' : v === 'fixed_pack' ? '定額' : '抄碼'}</button>)}
        {tab === 'raw' && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowUnitGuide(prev => !prev)} className={`px-3 py-2 rounded-lg border text-[11px] font-black flex items-center gap-1 ${showUnitGuide ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
              <Settings2 size={12} />單位換算表
            </button>
            <button onClick={() => setShowMethodModal(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Settings2 size={12} />⚙️ 管理加工方式
            </button>
            <button onClick={() => setShowMaterialCategoryDrawer(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Settings2 size={12} />⚙️ 管理母料分類
            </button>
            <button onClick={() => showToast('批量匯入入口已啟用', 'success')} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Upload size={12} />批量匯入
            </button>
          </div>
        )}
        {tab === 'pack' && (
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowPackagingDrawer(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Settings2 size={12} />⚙️ 管理包材項目
            </button>
          </div>
        )}
      </div>

      {tab === 'raw' && showUnitGuide && (
        <div className="bg-white border border-blue-100 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-slate-900">單位換算表（像匯率一樣看 1 單位轉換）</h4>
            <span className="text-[11px] font-bold text-slate-500">可用於 pack/box 淨含量判斷</span>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-2 py-2 text-left">1 單位</th>
                  <th className="px-2 py-2 text-right">g</th>
                  <th className="px-2 py-2 text-right">kg</th>
                  <th className="px-2 py-2 text-right">lb</th>
                  <th className="px-2 py-2 text-right">catty/斤</th>
                </tr>
              </thead>
              <tbody>
                {unitGuideRows.map(row => (
                  <tr key={row.from} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 font-black">{row.from}</td>
                    {row.rates.map(rate => (
                      <td key={`${row.from}-${rate.to}`} className="px-2 py-1.5 text-right font-bold">{rate.value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'raw' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-3 overflow-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">母料</th><th className="px-2 py-2 text-left">分類</th><th className="px-2 py-2 text-left">供應商</th><th className="px-2 py-2 text-center">單位</th><th className="px-2 py-2 text-right">成本</th><th className="px-2 py-2 text-right">預包裝淨含量</th><th className="px-2 py-2 text-right">操作</th></tr></thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-blue-50/40">
                <td className="px-2 py-1.5"><input value={newIngredient.name} onChange={e => setNewIngredient(v => ({ ...v, name: e.target.value }))} placeholder="新增母料" className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td>
                <td className="px-2 py-1.5">
                  <select value={newIngredient.category} onChange={e => setNewIngredient(v => ({ ...v, category: e.target.value }))} className="w-full p-1.5 border border-slate-200 rounded font-bold">
                    {Array.from(new Set([...(newIngredient.category ? [newIngredient.category] : []), ...activeMaterialCategoryOptions])).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5"><input value={newIngredient.supplier} onChange={e => setNewIngredient(v => ({ ...v, supplier: e.target.value }))} placeholder="供應商" className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td>
                <td className="px-2 py-1.5">
                  <select value={newIngredient.unit} onChange={e => setNewIngredient(v => ({ ...v, unit: e.target.value }))} className="w-24 p-1.5 border border-slate-200 rounded font-bold text-center mx-auto block">
                    {RAW_UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5"><input type="number" value={newIngredient.cost} onChange={e => setNewIngredient(v => ({ ...v, cost: Number(e.target.value) || 0 }))} className="w-24 p-1.5 border border-slate-200 rounded font-bold text-right ml-auto block" /></td>
                <td className="px-2 py-1.5"><div className="flex gap-1 justify-end"><input type="number" value={newIngredient.netContentVolume} onChange={e => setNewIngredient(v => ({ ...v, netContentVolume: Number(e.target.value) || 0 }))} className="w-16 p-1.5 border border-slate-200 rounded font-bold text-right" /><select value={newIngredient.netContentUnit} onChange={e => setNewIngredient(v => ({ ...v, netContentUnit: e.target.value as WeightUnit }))} className="p-1.5 border border-slate-200 rounded font-bold"><option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option></select></div></td>
                <td className="px-2 py-1.5 text-right">
                  <button onClick={() => void addIngredient()} className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-black">新增</button>
                  {needsNetContent(newIngredient.unit) && (newIngredient.netContentVolume || 0) <= 0 && (
                    <div className="mt-1 text-[10px] font-black text-rose-600">pack/box 需填淨含量</div>
                  )}
                </td>
              </tr>
              {materials.map(i => (
                <tr key={i.id} className={`border-t border-slate-100 ${editingIngredientId === i.id ? 'bg-emerald-50/30' : ''} ${i.isActive === false ? 'opacity-50 bg-slate-50' : ''}`} onDoubleClick={() => setEditingIngredientId(i.id)}>
                  <td className="px-2 py-1.5">
                    {editingIngredientId === i.id ? (
                      <input
                        value={i.name}
                        onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, name: e.target.value } : x))}
                        onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                        className="w-full p-1.5 border border-slate-200 rounded font-bold"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{i.name}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {editingIngredientId === i.id ? (
                      <select
                        value={i.category || '其他'}
                        onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, category: e.target.value } : x))}
                        onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                        className="w-full p-1.5 border border-slate-200 rounded font-bold"
                      >
                        {Array.from(new Set([...(i.category ? [i.category] : []), ...activeMaterialCategoryOptions])).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] rounded-full border bg-slate-50 text-slate-700 border-slate-200">{i.category || '未分類'}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {editingIngredientId === i.id ? (
                      <input
                        value={i.supplier || ''}
                        onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, supplier: e.target.value } : x))}
                        onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                        className="w-full p-1.5 border border-slate-200 rounded font-bold"
                      />
                    ) : (
                      <span>{i.supplier || '-'}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {editingIngredientId === i.id ? (
                      <select
                        value={i.unit}
                        onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, unit: e.target.value } : x))}
                        onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                        className="w-24 p-1.5 border border-slate-200 rounded font-bold text-center mx-auto block"
                      >
                        {RAW_UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    ) : (
                      <span className="font-bold">{i.unit}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {editingIngredientId === i.id ? (
                      <input
                        type="number"
                        value={i.baseCostPerLb}
                        onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, baseCostPerLb: Number(e.target.value) || 0 } : x))}
                        onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                        className="w-24 p-1.5 border border-slate-200 rounded font-bold text-right ml-auto block"
                      />
                    ) : (
                      <span className="font-black">${Number(i.baseCostPerLb || 0).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {editingIngredientId === i.id ? (
                      <div className="flex gap-1 justify-end">
                        <input
                          type="number"
                          value={i.netContentVolume || 0}
                          onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, netContentVolume: Number(e.target.value) || 0 } : x))}
                          onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                          className="w-16 p-1.5 border border-slate-200 rounded font-bold text-right"
                        />
                        <select
                          value={i.netContentUnit || 'g'}
                          onChange={e => setIngredients(prev => prev.map(x => x.id === i.id ? { ...x, netContentUnit: e.target.value as WeightUnit } : x))}
                          onBlur={() => void saveIngredient(i, { silentSuccess: true })}
                          className="p-1.5 border border-slate-200 rounded font-bold"
                        >
                          <option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option>
                        </select>
                      </div>
                    ) : (
                      <div className="text-right">
                        {(i.netContentVolume || 0) > 0 ? (
                          <span className="font-bold">{i.netContentVolume}{i.netContentUnit || 'g'}</span>
                        ) : (
                          <span className={`${needsNetContent(i.unit) ? 'text-rose-600 font-black' : 'text-slate-300'}`}>
                            {needsNetContent(i.unit) ? '需設定淨含量' : '-'}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {savingIngredientId === i.id && <span className="text-[10px] font-black text-emerald-600 animate-pulse">儲存中...</span>}
                      {savedIngredientId === i.id && <span className="text-[10px] font-black text-emerald-600 inline-flex items-center gap-1"><Check size={11} />已自動儲存</span>}
                      {saveErrorIngredientId === i.id && <span className="text-[10px] font-black text-rose-600">儲存失敗</span>}
                      {editingIngredientId === i.id ? (
                        <button
                          onClick={() => {
                            void saveIngredient(i, { silentSuccess: true });
                            setEditingIngredientId(null);
                          }}
                          className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black"
                        >
                          完成
                        </button>
                      ) : (
                        <button onClick={() => setEditingIngredientId(i.id)} className="px-2 py-1 rounded border border-slate-200 text-[10px] font-black text-slate-600 inline-flex items-center gap-1"><Pencil size={11} />編輯</button>
                      )}
                      <button onClick={() => void toggleIngredientActive(i, i.isActive === false)} className={`px-2 py-1 rounded border text-[10px] font-black ${i.isActive === false ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-600'}`}>{i.isActive === false ? '▶ 啟用' : '⏸ 停用'}</button>
                      <button onClick={() => void deleteIngredient(i)} className="px-2 py-1 rounded border border-rose-200 text-[10px] font-black text-rose-600">🗑️ 刪除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'process' && (
        <div className="grid grid-cols-1 xl:grid-cols-[30%_70%] gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <p className="text-[11px] text-slate-500 font-black mb-2">材料清單</p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={processMaterialSearch}
                onChange={e => setProcessMaterialSearch(e.target.value)}
                placeholder="搜尋材料..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="space-y-1 max-h-[34rem] overflow-auto">
              {processMaterials.map(m => (
                <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'} ${m.isActive === false ? 'opacity-50' : ''}`}>
                  <div>{m.name}</div>
                  <div className="text-[10px] font-black text-slate-500 mt-0.5">{m.category || '未分類'}{m.isActive === false ? ' · 已停用' : ''}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-base text-slate-900">{selectedIngredient?.name || '請先選材料'}</h4>
              <span className={`text-[11px] font-black ${selectedIngredientInactive ? 'text-amber-600' : 'text-slate-500'}`}>{selectedIngredientInactive ? '加工工作台（已停用）' : '加工工作台'}</span>
            </div>
            <div className="overflow-auto max-h-[34rem] border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2 text-left">加工方式</th>
                    <th className="px-2 py-2 text-left">加工大類</th>
                    <th className="px-2 py-2 text-right">Yield (0.5-1.0)</th>
                    <th className="px-2 py-2 text-right">加工後成本</th>
                    <th className="px-2 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {processRowsForMaterial.map(r => {
                    const processed = processedCostPerLb(r.ingredientId, r.id);
                    const invalidYield = !isYieldValid(r.yieldRate, r.isDefaultPiece);
                    return (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5">
                          {r.isDefaultPiece ? (
                            <div><div className="font-black">WHOLE</div><div className="text-[10px] text-slate-500">原裝/切割（鎖定）</div></div>
                          ) : (
                            <select
                              value={r.methodId || ''}
                              disabled={selectedIngredientInactive}
                              onChange={e => {
                                const method = methods.find(m => m.id === e.target.value);
                                if (!method) return;
                                setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, methodId: method.id, code: method.code, name: method.name, category: method.category } : x));
                              }}
                              className="w-full p-1 border border-slate-200 rounded font-bold disabled:opacity-50"
                            >
                              {methods.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.code} · {m.name}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(r.category)}`}>{categoryLabel(r.category)}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            disabled={r.isDefaultPiece || selectedIngredientInactive}
                            type="number"
                            min="0.5"
                            max="1"
                            step="0.01"
                            value={r.yieldRate}
                            onChange={e => setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, yieldRate: Number(e.target.value) || 0 } : x))}
                            className={`w-24 p-1 border rounded text-right font-bold ml-auto block disabled:opacity-50 ${invalidYield ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'}`}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right font-black text-amber-700">${processed.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">
                          {r.isDefaultPiece ? (
                            <span className="text-[10px] font-black text-slate-400">基準列</span>
                          ) : (
                            <button disabled={invalidYield || selectedIngredientInactive} onClick={() => void saveProcessRow(r)} className={`px-2 py-1 rounded text-[10px] font-black ${invalidYield || selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 確定儲存加工</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {processDraftRowsForMaterial.map(d => {
                    const invalidYield = !isYieldValid(d.yieldRate);
                    const previewCost = processedCostPreview(d.ingredientId, d.yieldRate, false);
                    return (
                      <tr key={d.tempId} className="border-t border-blue-100 bg-blue-50/40">
                        <td className="px-2 py-1.5">
                          <select
                            value={d.methodId || ''}
                            disabled={selectedIngredientInactive}
                            onChange={e => {
                              const method = methods.find(m => m.id === e.target.value);
                              if (!method) return;
                              setProcessDraftRows(prev => prev.map(x => x.tempId === d.tempId ? {
                                ...x,
                                methodId: method.id,
                                category: method.category,
                                code: `${method.code}_${Date.now().toString().slice(-4)}`,
                                packQuantity: method.category === 'repacking' ? (x.packQuantity || 100) : undefined,
                                packUnit: method.category === 'repacking' ? (x.packUnit || 'g') : undefined,
                              } : x));
                            }}
                            className="w-full p-1 border border-slate-200 rounded font-bold disabled:opacity-50"
                          >
                            {methods.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.code} · {m.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5"><span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(d.category)}`}>{categoryLabel(d.category)}</span></td>
                        <td className="px-2 py-1.5"><input disabled={selectedIngredientInactive} type="number" min="0.5" max="1" step="0.01" value={d.yieldRate} onChange={e => setProcessDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, yieldRate: Number(e.target.value) || 0 } : x))} className={`w-24 p-1 border rounded text-right font-bold ml-auto block disabled:opacity-50 ${invalidYield ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'}`} /></td>
                        <td className="px-2 py-1.5 text-right font-black text-amber-700">${previewCost.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">
                          <button disabled={invalidYield || selectedIngredientInactive} onClick={() => void saveDraftProcessRow(d)} className={`px-2 py-1 rounded text-[10px] font-black ${invalidYield || selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 確定儲存加工</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button disabled={selectedIngredientInactive} onClick={appendProcessDraftRow} className={`mt-3 px-3 py-2 rounded-lg text-xs font-black inline-flex items-center gap-1 ${selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-violet-600 text-white'}`}><Plus size={12} />➕ 新增加工方式</button>
          </div>
        </div>
      )}

      {tab === 'pack' && (
        <div className="grid grid-cols-1 xl:grid-cols-[30%_70%] gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <p className="text-[11px] text-slate-500 font-black mb-2">材料清單</p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={packMaterialSearch}
                onChange={e => setPackMaterialSearch(e.target.value)}
                placeholder="搜尋材料..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="space-y-1 max-h-[34rem] overflow-auto">
              {packMaterials.map(m => <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'} ${m.isActive === false ? 'opacity-50' : ''}`}><div>{m.name}</div><div className="text-[10px] font-black text-slate-500 mt-0.5">{m.category || '未分類'}{m.isActive === false ? ' · 已停用' : ''}</div></button>)}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-sm text-slate-900">{selectedIngredient?.name || '請先選母料'}</h4>
              <span className={`text-[11px] font-black ${selectedIngredientInactive ? 'text-amber-600' : 'text-slate-500'}`}>{selectedIngredientInactive ? '包裝工作台（已停用）' : '包裝工作台'}</span>
            </div>

            <div className="space-y-3 max-h-[34rem] overflow-auto">
              {processRowsForMaterial.map(proc => {
                const method = methods.find(m => m.id === proc.methodId) || methods.find(m => m.code === proc.code);
                const isWholeProcess = (method?.code || proc.code) === 'WHOLE';
                const costPerLb = processedCostPerLb(proc.ingredientId, proc.id);
                const rows = packRowsForMaterial.filter(r => r.processSpecId === proc.id);
                const drafts = packDraftRowsForMaterial.filter(r => r.processSpecId === proc.id);
                return (
                  <div key={proc.id} className={`border border-slate-100 rounded-xl bg-white ${selectedIngredientInactive ? 'opacity-50' : ''}`}>
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900">【加工工序: {method?.name || proc.name}】— 當前肉成本: ${costPerLb.toFixed(2)} / lb</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(method?.category || proc.category)}`}>{categoryLabel(method?.category || proc.category)}</span>
                      </div>
                      <button disabled={selectedIngredientInactive} onClick={() => addPackDraftRow(proc)} className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1 ${selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-600 text-white'}`}><Plus size={12} />➕ 新增包裝規格</button>
                    </div>
                    <div className="overflow-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500">
                            <th className="px-2 py-2 text-left">規格名稱</th>
                            <th className="px-2 py-2 text-left">定額/抄碼</th>
                            <th className="px-2 py-2 text-left">規格數量&單位</th>
                            <th className="px-2 py-2 text-left">包材選擇</th>
                            <th className="px-2 py-2 text-right">最終總成本</th>
                            <th className="px-2 py-2 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(r => {
                            const checkedCodes = r.packagingItemCodes || [];
                            const fee = packagingFeeByCodes(checkedCodes);
                            const packCost = calcTotalCost({ ...r, packagingFee: fee });
                            return (
                              <tr key={r.id} className="border-t border-slate-100">
                                <td className="px-2 py-1.5"><input disabled={selectedIngredientInactive} value={r.name} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold disabled:opacity-50" /></td>
                                <td className="px-2 py-1.5"><select disabled={selectedIngredientInactive} value={r.pricingType} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, pricingType: e.target.value as PricingType } : x))} className="p-1 border border-slate-200 rounded font-bold disabled:opacity-50"><option value="fixed_pack">定額</option><option value="by_piece">抄碼</option></select></td>
                                <td className="px-2 py-1.5">
                                  {r.pricingType === 'fixed_pack' ? (
                                    <div className="flex gap-1">
                                      <input disabled={selectedIngredientInactive} type="number" value={r.specWeight} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specWeight: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold disabled:opacity-50" />
                                      <select disabled={selectedIngredientInactive} value={r.specUnit} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specUnit: e.target.value as WeightUnit } : x))} className="p-1 border border-slate-200 rounded font-bold disabled:opacity-50"><option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option></select>
                                    </div>
                                  ) : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-2 py-1.5">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    {packagingItems.map(item => {
                                      const checked = checkedCodes.includes(item.code);
                                      return (
                                        <label key={item.code} className="inline-flex items-center gap-1 font-bold text-slate-700">
                                          <input
                                            type="checkbox"
                                            disabled={selectedIngredientInactive}
                                            checked={checked}
                                            onChange={e => {
                                              const nextCodes = e.target.checked ? [...checkedCodes, item.code] : checkedCodes.filter(c => c !== item.code);
                                              setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, packagingItemCodes: nextCodes, packagingFee: packagingFeeByCodes(nextCodes) } : x));
                                            }}
                                          />
                                          <span>{item.name}</span>
                                        </label>
                                      );
                                    })}
                                    <span className="text-[11px] font-black text-emerald-700">合計包材費: ${fee.toFixed(2)}</span>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-right font-black text-amber-700">${packCost.toFixed(2)}</td>
                                <td className="px-2 py-1.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button disabled={selectedIngredientInactive} onClick={() => void savePackRow({ ...r, packagingFee: fee })} className={`px-2 py-1 rounded text-[10px] font-black ${selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 儲存規格</button>
                                    {!isWholeProcess && (
                                      <button onClick={() => void deletePackRow(r.id)} className="px-2 py-1 rounded border border-rose-200 text-rose-600 text-[10px] font-black">🗑️ 刪除</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {drafts.map(d => {
                            const fee = packagingFeeByCodes(d.packagingItemCodes);
                            const draftPackLike: PackRow = {
                              id: d.tempId,
                              ingredientId: d.ingredientId,
                              processSpecId: d.processSpecId,
                              code: d.code,
                              name: d.name,
                              pricingType: d.pricingType,
                              channel: 'both',
                              specWeight: d.specWeight,
                              specUnit: d.specUnit,
                              packLabel: d.packLabel,
                              packagingFee: fee,
                              packagingItemCodes: d.packagingItemCodes,
                              isActive: true,
                            };
                            const packCost = calcTotalCost(draftPackLike);
                            return (
                              <tr key={d.tempId} className="border-t border-blue-100 bg-blue-50/40">
                                <td className="px-2 py-1.5"><input disabled={selectedIngredientInactive} value={d.name} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold disabled:opacity-50" /></td>
                                <td className="px-2 py-1.5"><select disabled={selectedIngredientInactive} value={d.pricingType} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, pricingType: e.target.value as PricingType } : x))} className="p-1 border border-slate-200 rounded font-bold disabled:opacity-50"><option value="fixed_pack">定額</option><option value="by_piece">抄碼</option></select></td>
                                <td className="px-2 py-1.5">
                                  {d.pricingType === 'fixed_pack' ? (
                                    <div className="flex gap-1">
                                      <input disabled={selectedIngredientInactive} type="number" value={d.specWeight} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, specWeight: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold disabled:opacity-50" />
                                      <select disabled={selectedIngredientInactive} value={d.specUnit} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, specUnit: e.target.value as WeightUnit } : x))} className="p-1 border border-slate-200 rounded font-bold disabled:opacity-50"><option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option></select>
                                    </div>
                                  ) : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-2 py-1.5">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    {packagingItems.map(item => {
                                      const checked = d.packagingItemCodes.includes(item.code);
                                      return (
                                        <label key={item.code} className="inline-flex items-center gap-1 font-bold text-slate-700">
                                          <input
                                            type="checkbox"
                                            disabled={selectedIngredientInactive}
                                            checked={checked}
                                            onChange={e => {
                                              const nextCodes = e.target.checked ? [...d.packagingItemCodes, item.code] : d.packagingItemCodes.filter(c => c !== item.code);
                                              setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, packagingItemCodes: nextCodes } : x));
                                            }}
                                          />
                                          <span>{item.name}</span>
                                        </label>
                                      );
                                    })}
                                    <span className="text-[11px] font-black text-emerald-700">合計包材費: ${fee.toFixed(2)}</span>
                                  </div>
                                </td>
                                <td className="px-2 py-1.5 text-right font-black text-amber-700">${packCost.toFixed(2)}</td>
                                <td className="px-2 py-1.5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button disabled={selectedIngredientInactive} onClick={() => void savePackDraftRow(d)} className={`px-2 py-1 rounded text-[10px] font-black ${selectedIngredientInactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 儲存規格</button>
                                    {!isWholeProcess && (
                                      <button onClick={() => setPackDraftRows(prev => prev.filter(x => x.tempId !== d.tempId))} className="px-2 py-1 rounded border border-rose-200 text-rose-600 text-[10px] font-black">🗑️ 刪除</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
              {processRowsForMaterial.length === 0 && (
                <div className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl p-4">此材料尚未有加工工序，請先到 Tab 2 建立加工方式。</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'sku' && (
        <div className="grid grid-cols-1 xl:grid-cols-[30%_70%] gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <p className="text-[11px] text-slate-500 font-black mb-2">材料清單</p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={skuMaterialSearch}
                onChange={e => setSkuMaterialSearch(e.target.value)}
                placeholder="搜尋材料..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="space-y-1 max-h-[34rem] overflow-auto">
              {skuMaterials.map(m => (
                <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'} ${m.isActive === false ? 'opacity-50' : ''}`}>
                  <div>{m.name}</div>
                  <div className="text-[10px] font-black text-slate-500 mt-0.5">{m.category || '未分類'}{m.isActive === false ? ' · 已停用' : ''}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900">{selectedIngredient?.name || '請先選母料'}</h4>
              <span className={`text-[11px] font-black ${selectedIngredientInactive ? 'text-amber-600' : 'text-slate-500'}`}>{selectedIngredientInactive ? 'SKU 成本工作台（已停用）' : 'SKU 成本工作台'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[260px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={skuSearch} onChange={e => setSkuSearch(e.target.value)} placeholder="搜尋 SKU 名稱..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-bold bg-white" />
              </div>
              <p className="text-[11px] font-black text-slate-500">Tab 4 只處理 SKU 與最終成本，渠道定價改由零售/批發模組處理。</p>
            </div>
            <div className="overflow-auto max-h-[34rem] border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2">#</th><th className="px-2 py-2 text-left">商品 SKU 名稱</th><th className="px-2 py-2 text-left">加工大類</th><th className="px-2 py-2 text-right">基準總成本</th><th className="px-2 py-2 text-right">成本手動覆蓋</th><th className="px-2 py-2 text-right">有效商品成本</th><th className="px-2 py-2 text-right">操作</th></tr></thead>
                <tbody>
                {skuPricingRowsForSelected.map((row, idx) => {
                  const s = row.sku;
                  const pack = row.pack;
                  const process = row.process;
                  const ingredient = ingredientMap.get(pack.ingredientId);
                  const inactive = ingredient?.isActive === false;
                  const baseCost = calcTotalCost(pack);
                  const rowKey = skuRowKey(row);
                  const draft = pricingDrafts[rowKey] || {
                    costOverride: undefined,
                    tiers: {
                      P0: { price: round2(baseCost / Math.max(0.01, baseDenominator)), margin: computeMarginPct(round2(baseCost / Math.max(0.01, baseDenominator)), baseCost) },
                      P1: { price: round2(baseCost / Math.max(0.01, baseDenominator - tierStep)), margin: computeMarginPct(round2(baseCost / Math.max(0.01, baseDenominator - tierStep)), baseCost) },
                      P2: { price: round2(baseCost / Math.max(0.01, baseDenominator - (tierStep * 2))), margin: computeMarginPct(round2(baseCost / Math.max(0.01, baseDenominator - (tierStep * 2))), baseCost) },
                      P3: { price: round2(baseCost / Math.max(0.01, baseDenominator - (tierStep * 3))), margin: computeMarginPct(round2(baseCost / Math.max(0.01, baseDenominator - (tierStep * 3))), baseCost) },
                    },
                  };
                  const effectiveCost = draft.costOverride != null && Number.isFinite(draft.costOverride) ? draft.costOverride : baseCost;
                  return (
                    <tr key={rowKey} className={`border-t border-slate-100 ${inactive ? 'bg-slate-50 opacity-50' : ''}`}>
                      <td className="px-2 py-1.5 text-center">{idx + 1}</td>
                      <td className="px-2 py-1.5"><div className="font-black">{buildSkuDisplayName(row)}</div><div className="text-[10px] text-slate-400">{s?.code || `${pack.code} · 待建立 SKU`}</div></td>
                      <td className="px-2 py-1.5"><span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(process?.category || 'others')}`}>{categoryLabel(process?.category || 'others')}</span></td>
                      <td className="px-2 py-1.5 text-right font-black text-amber-700">${baseCost.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right"><input disabled={inactive} value={draft.costOverride ?? ''} onChange={e => {
                        const raw = e.target.value.trim();
                        const override = raw === '' ? undefined : Number(raw);
                        setPricingDrafts(prev => {
                          const rowState = prev[rowKey] || draft;
                          return { ...prev, [rowKey]: { ...rowState, costOverride: override } };
                        });
                      }} placeholder="留空=用基準" className="w-24 p-1 border border-slate-200 rounded text-right font-bold ml-auto block disabled:opacity-50" /></td>
                      <td className="px-2 py-1.5 text-right font-black text-slate-800">${effectiveCost.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-right"><button disabled={inactive} onClick={() => void savePricingRow(row)} className={`px-2 py-1 rounded text-[10px] font-black ${inactive ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 儲存 SKU 與成本</button></td>
                    </tr>
                  );
                })}
                {skuPricingRowsForSelected.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500 font-bold">此母料尚未有可用 SKU，請先在 Tab 2/3 建立加工與包裝。</td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showMethodModal && (
        <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-4">
            <div className="flex items-center justify-between"><h4 className="font-black text-slate-900">加工方式表</h4><button onClick={() => setShowMethodModal(false)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold">關閉</button></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <input value={newMethod.code} onChange={e => setNewMethod(v => ({ ...v, code: e.target.value }))} placeholder="code" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" />
              <input value={newMethod.name} onChange={e => setNewMethod(v => ({ ...v, name: e.target.value }))} placeholder="name" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" />
              <select value={newMethod.category} onChange={e => setNewMethod(v => ({ ...v, category: e.target.value as MethodCategory }))} className="p-2 border border-slate-200 rounded-lg text-sm font-bold"><option value="original_or_cutting">原裝/切割</option><option value="repacking">分裝</option><option value="marinating">醃製</option><option value="others">其他</option></select>
            </div>
            <button onClick={() => void addMethod()} className="mt-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-black">新增方式</button>
            <div className="mt-3 border border-slate-100 rounded-xl overflow-auto max-h-[70vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2 text-left">Code</th>
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-left">Category</th>
                    <th className="px-2 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {methods.filter(m => m.isActive).map(m => {
                    const editing = editingMethodId === m.id;
                    return (
                      <tr key={m.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-mono">
                          {editing ? (
                            <input value={m.code} onChange={e => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, code: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" />
                          ) : m.code}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing ? (
                            <input value={m.name} onChange={e => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" />
                          ) : (
                            <span className="font-bold">{m.name}</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          {editing ? (
                            <select value={m.category} onChange={e => setMethods(prev => prev.map(x => x.id === m.id ? { ...x, category: e.target.value as MethodCategory } : x))} className="w-full p-1 border border-slate-200 rounded font-bold">
                              <option value="original_or_cutting">原裝/切割</option>
                              <option value="repacking">分裝</option>
                              <option value="marinating">醃製</option>
                              <option value="others">其他</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(m.category)}`}>{categoryLabel(m.category)}</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {editing ? (
                              <button onClick={() => void saveMethod(m)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button>
                            ) : (
                              <button onClick={() => setEditingMethodId(m.id)} className="px-2 py-1 rounded border border-slate-200 text-[10px] font-black text-slate-600 inline-flex items-center gap-1"><Pencil size={11} />編輯</button>
                            )}
                            <button onClick={() => void deleteMethod(m)} className="px-2 py-1 rounded border border-rose-200 text-[10px] font-black text-rose-600 inline-flex items-center gap-1"><Trash2 size={11} />刪除</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showPackagingDrawer && (
        <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-4">
            <div className="flex items-center justify-between"><h4 className="font-black text-slate-900">包材項目字典</h4><button onClick={() => setShowPackagingDrawer(false)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold">關閉</button></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <input value={newPackagingItem.code} onChange={e => setNewPackagingItem(v => ({ ...v, code: e.target.value }))} placeholder="Code" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" />
              <input value={newPackagingItem.name} onChange={e => setNewPackagingItem(v => ({ ...v, name: e.target.value }))} placeholder="Name" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" />
              <input type="number" step="0.01" value={newPackagingItem.defaultPrice} onChange={e => setNewPackagingItem(v => ({ ...v, defaultPrice: Number(e.target.value) || 0 }))} placeholder="Cost" className="p-2 border border-slate-200 rounded-lg text-sm font-bold text-right" />
            </div>
            <button onClick={() => void addPackagingItem()} className="mt-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-black">新增包材</button>
            <div className="mt-3 border border-slate-100 rounded-xl overflow-auto max-h-[70vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2 text-left">Code</th>
                    <th className="px-2 py-2 text-left">Name</th>
                    <th className="px-2 py-2 text-right">Cost</th>
                    <th className="px-2 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {packagingItems.map(item => {
                    const editing = editingPackagingItemId === item.id;
                    return (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-mono">{editing ? <input value={item.code} onChange={e => setPackagingItems(prev => prev.map(x => x.id === item.id ? { ...x, code: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /> : item.code}</td>
                        <td className="px-2 py-1.5">{editing ? <input value={item.name} onChange={e => setPackagingItems(prev => prev.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /> : <span className="font-bold">{item.name}</span>}</td>
                        <td className="px-2 py-1.5 text-right">{editing ? <input type="number" step="0.01" value={item.defaultPrice} onChange={e => setPackagingItems(prev => prev.map(x => x.id === item.id ? { ...x, defaultPrice: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold ml-auto block" /> : <span className="font-black">${item.defaultPrice.toFixed(2)}</span>}</td>
                        <td className="px-2 py-1.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            {editing ? (
                              <button onClick={() => void savePackagingItem(item)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button>
                            ) : (
                              <button onClick={() => setEditingPackagingItemId(item.id)} className="px-2 py-1 rounded border border-slate-200 text-[10px] font-black text-slate-600 inline-flex items-center gap-1"><Pencil size={11} />編輯</button>
                            )}
                            <button onClick={() => void deletePackagingItem(item)} className="px-2 py-1 rounded border border-rose-200 text-[10px] font-black text-rose-600 inline-flex items-center gap-1"><Trash2 size={11} />刪除</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showMaterialCategoryDrawer && (
        <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-end">
          <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-4">
            <div className="flex items-center justify-between"><h4 className="font-black text-slate-900">母料分類字典（可改名/排序/開關）</h4><button onClick={() => setShowMaterialCategoryDrawer(false)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold">關閉</button></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <input value={newMaterialCategory.name} onChange={e => setNewMaterialCategory(v => ({ ...v, name: e.target.value }))} placeholder="分類名稱" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" />
              <input type="number" value={newMaterialCategory.sortOrder} onChange={e => setNewMaterialCategory(v => ({ ...v, sortOrder: Number(e.target.value) || 0 }))} placeholder="排序" className="p-2 border border-slate-200 rounded-lg text-sm font-bold text-right" />
              <label className="inline-flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-sm font-bold"><input type="checkbox" checked={newMaterialCategory.isActive} onChange={e => setNewMaterialCategory(v => ({ ...v, isActive: e.target.checked }))} />啟用</label>
            </div>
            <button onClick={() => void addMaterialCategory()} className="mt-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-black">新增分類</button>
            <div className="mt-3 border border-slate-100 rounded-xl overflow-auto max-h-[70vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2 text-left">名稱</th>
                    <th className="px-2 py-2 text-right">排序</th>
                    <th className="px-2 py-2 text-center">啟用</th>
                    <th className="px-2 py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {materialCategories.map(item => {
                    const editing = editingMaterialCategoryId === item.id;
                    return (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5">{editing ? <input value={item.name} onChange={e => setMaterialCategories(prev => prev.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /> : <span className="font-bold">{item.name}</span>}</td>
                        <td className="px-2 py-1.5 text-right">{editing ? <input type="number" value={item.sortOrder} onChange={e => setMaterialCategories(prev => prev.map(x => x.id === item.id ? { ...x, sortOrder: Number(e.target.value) || 0 } : x))} className="w-16 p-1 border border-slate-200 rounded text-right font-bold ml-auto block" /> : <span className="font-black">{item.sortOrder}</span>}</td>
                        <td className="px-2 py-1.5 text-center"><input type="checkbox" checked={item.isActive !== false} onChange={e => setMaterialCategories(prev => prev.map(x => x.id === item.id ? { ...x, isActive: e.target.checked } : x))} /></td>
                        <td className="px-2 py-1.5 text-right">
                          {editing ? (
                            <button onClick={() => void saveMaterialCategory(item)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button>
                          ) : (
                            <button onClick={() => setEditingMaterialCategoryId(item.id)} className="px-2 py-1 rounded border border-slate-200 text-[10px] font-black text-slate-600 inline-flex items-center gap-1"><Pencil size={11} />編輯</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaterialFlowPanel;

