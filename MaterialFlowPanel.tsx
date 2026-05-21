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

const round2 = (v: number) => Math.round(v * 100) / 100;
const mkId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const QUOTE_SUFFIX: Record<string, string> = { P0: 'A0', P1: 'B1', P2: 'B2', 'P-1': 'Y1', 'P-2': 'Z2' };
const RAW_UNIT_OPTIONS = ['lb', 'kg', 'g', 'catty', 'pack', 'box'] as const;
const needsNetContent = (unit?: string) => ['pack', 'box'].includes((unit || '').trim().toLowerCase());

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

const MaterialFlowPanel: React.FC<Props> = ({ showToast, products, setProducts }) => {
  const [tab, setTab] = useState<StepTab>('raw');
  const [loading, setLoading] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [showUnitGuide, setShowUnitGuide] = useState(false);
  const [showPackagingDrawer, setShowPackagingDrawer] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [methods, setMethods] = useState<GlobalMethod[]>([]);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [packRows, setPackRows] = useState<PackRow[]>([]);
  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);

  const [search, setSearch] = useState('');
  const [processMaterialSearch, setProcessMaterialSearch] = useState('');
  const [packMaterialSearch, setPackMaterialSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedSkuRowIds, setSelectedSkuRowIds] = useState<Set<string>>(new Set());
  const [selectedTierForPdf, setSelectedTierForPdf] = useState('P0');
  const [baseDenominator, setBaseDenominator] = useState(0.88);
  const [tierStep, setTierStep] = useState(0.01);

  const [newIngredient, setNewIngredient] = useState({ name: '', supplier: '', unit: 'lb', cost: 0, netContentVolume: 0, netContentUnit: 'g' as WeightUnit });
  const [newMethod, setNewMethod] = useState({ code: '', name: '', category: 'original_or_cutting' as MethodCategory });
  const [newSku, setNewSku] = useState({ packSpecId: '', name: '', alias: '' });
  const [processDraftRows, setProcessDraftRows] = useState<ProcessDraftRow[]>([]);
  const [packDraftRows, setPackDraftRows] = useState<PackDraftRow[]>([]);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editingPackagingItemId, setEditingPackagingItemId] = useState<string | null>(null);
  const [newPackagingItem, setNewPackagingItem] = useState({ code: '', name: '', defaultPrice: 0 });
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [savingIngredientId, setSavingIngredientId] = useState<string | null>(null);
  const [savedIngredientId, setSavedIngredientId] = useState<string | null>(null);
  const [saveErrorIngredientId, setSaveErrorIngredientId] = useState<string | null>(null);
  const savedIndicatorTimerRef = useRef<number | null>(null);
  const baselineEnsuringRef = useRef<Record<string, boolean>>({});

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);
  const processMap = useMemo(() => new Map(processRows.map(r => [r.id, r])), [processRows]);
  const packMap = useMemo(() => new Map(packRows.map(r => [r.id, r])), [packRows]);
  const tierDefs = useMemo(() => ([{ key: 'P-2', delta: -2 }, { key: 'P-1', delta: -1 }, { key: 'P0', delta: 0 }, { key: 'P1', delta: 1 }, { key: 'P2', delta: 2 }]), []);

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
        supabase.from('site_config').select('id,value').in('id', ['cost_items', 'material_flow_price_overrides', 'packaging_items']),
      ]);
      if (ingRes.error || processRes.error || packRes.error || cfgRes.error) {
        throw (ingRes.error || processRes.error || packRes.error || cfgRes.error);
      }
      await loadMethods();
      await loadPackagingItems();

      setIngredients((ingRes.data || []).map(mapIngredientRowToIngredient));
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
      if (cfgMap.get('material_flow_price_overrides') && typeof cfgMap.get('material_flow_price_overrides') === 'object') {
        setManualOverrides(cfgMap.get('material_flow_price_overrides') as Record<string, number>);
      }
    } catch (error: any) {
      showToast(`載入失敗：${error?.message || '未知錯誤'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [loadMethods, loadPackagingItems, packagingItems.length, showToast]);

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
    return ingredients
      .filter(i => !q || (
        i.name.toLowerCase().includes(q) ||
        (i.supplier || '').toLowerCase().includes(q) ||
        (i.unit || '').toLowerCase().includes(q)
      ))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, search]);

  const processMaterials = useMemo(() => {
    const q = processMaterialSearch.trim().toLowerCase();
    return ingredients
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.supplier || '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, processMaterialSearch]);

  const packMaterials = useMemo(() => {
    const q = packMaterialSearch.trim().toLowerCase();
    return ingredients
      .filter(i => !q || i.name.toLowerCase().includes(q) || (i.supplier || '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, packMaterialSearch]);

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

  const availablePackRows = useMemo(() => uniqueById(packRows.filter(r => r.isActive)), [packRows]);
  const skuGridRows = useMemo<SkuGridRow[]>(() => {
    const q = search.trim().toLowerCase();
    return packRows
      .filter(p => p.isActive)
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
      });
  }, [packRows, channelFilter, typeFilter, search, skuRows, processMap, ingredientMap]);

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

  const tierPrice = useCallback((skuId: string, totalCost: number, delta: number) => {
    const key = `${skuId}:${delta}`;
    if (manualOverrides[key] != null) return round2(manualOverrides[key]);
    const denom = baseDenominator - (delta * tierStep);
    if (denom <= 0.01) return 0;
    return round2(totalCost / denom);
  }, [manualOverrides, baseDenominator, tierStep]);

  const addIngredient = async () => {
    if (!newIngredient.name.trim()) return showToast('請輸入母料名稱', 'error');
    if (needsNetContent(newIngredient.unit) && (newIngredient.netContentVolume || 0) <= 0) {
      return showToast('使用 pack/box 單位時，請填寫淨含量', 'error');
    }
    const row = {
      id: mkId('ING'),
      name: newIngredient.name.trim(),
      supplier: newIngredient.supplier.trim() || null,
      unit: newIngredient.unit,
      base_cost_per_lb: Number(newIngredient.cost) || 0,
      net_content_volume: newIngredient.netContentVolume > 0 ? Number(newIngredient.netContentVolume) : null,
      net_content_unit: newIngredient.netContentVolume > 0 ? newIngredient.netContentUnit : null,
      material_type: 'meat',
    };
    const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
    if (error) return showToast(`新增母料失敗：${error.message}`, 'error');
    const item = mapIngredientRowToIngredient(data as any);
    setIngredients(prev => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedIngredientId(item.id);
    setNewIngredient({ name: '', supplier: '', unit: 'lb', cost: 0, netContentVolume: 0, netContentUnit: 'g' });
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
  }, [methods, selectedIngredientId, showToast]);

  const saveDraftProcessRow = async (draft: ProcessDraftRow) => {
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

  const saveProcessRow = async (row: ProcessRow) => {
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

  const addPackDraftRow = (process: ProcessRow) => {
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
    if (!draft.name.trim()) return showToast('請輸入規格名稱', 'error');
    if (draft.pricingType === 'fixed_pack' && (draft.specWeight || 0) <= 0) return showToast('定額規格需設定數量', 'error');
    const fee = packagingFeeByCodes(draft.packagingItemCodes);
    const lb = draft.pricingType === 'fixed_pack' ? convertWeight(draft.specWeight || 0, draft.specUnit, 'lb') : null;
    const payload = {
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
      packaging_item_codes: draft.packagingItemCodes,
      pack_weight_lb: lb,
      pack_quantity: null,
      pack_unit: null,
      is_active: true,
      sort_order: packRows.filter(r => r.ingredientId === draft.ingredientId && r.processSpecId === draft.processSpecId).length,
    };
    const { data, error } = await supabase.from('material_pack_specs').insert(payload).select('*').single();
    if (error) return showToast(`儲存規格失敗：${error.message}`, 'error');
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
    const lb = row.pricingType === 'fixed_pack' ? convertWeight(row.specWeight || 0, row.specUnit, 'lb') : null;
    const fee = packagingFeeByCodes(row.packagingItemCodes || []);
    const { error } = await supabase.from('material_pack_specs').update({
      process_spec_id: row.processSpecId,
      name: row.name,
      pricing_mode: row.pricingType,
      target_channel: 'both',
      spec_weight: row.specWeight,
      spec_unit: row.specUnit,
      pack_label: row.packLabel,
      packaging_fee: fee,
      packaging_item_codes: row.packagingItemCodes || [],
      pack_weight_lb: lb,
      pack_quantity: null,
      pack_unit: null,
    }).eq('id', row.id);
    if (error) return showToast(`保存包裝失敗：${error.message}`, 'error');
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
    }]);

    setNewSku({ packSpecId: '', name: '', alias: '' });
  };

  const saveOverrides = async () => {
    const { error } = await supabase.from('site_config').upsert({ id: 'material_flow_price_overrides', value: manualOverrides });
    if (error) return showToast(`保存控價失敗：${error.message}`, 'error');
  };

  const exportQuotePdf = () => {
    const chosen = skuGridRows.filter(r => r.sku && selectedSkuRowIds.has(r.rowId));
    if (chosen.length === 0) return showToast('請先勾選 SKU', 'error');
    const tier = tierDefs.find(t => t.key === selectedTierForPdf);
    if (!tier) return;
    const refNo = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}-${QUOTE_SUFFIX[selectedTierForPdf] || 'A0'}`;
    const rows = chosen.map((row, i) => {
      const totalCost = calcTotalCost(row.pack);
      const skuId = row.sku?.id || `PACK:${row.pack.id}`;
      const displayName = row.sku?.name || row.pack.name;
      const price = tierPrice(skuId, totalCost, tier.delta);
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
          <p className="text-[11px] font-bold text-slate-500">母料 → 加工 → 包裝 → SKU 控價（含分類與分裝欄位）</p>
        </div>
        <button onClick={() => void loadAll()} className="ml-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 flex items-center gap-1.5">{loading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />} Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('raw')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Layers size={16} />1. 母料</button>
        <button onClick={() => setTab('process')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'process' ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Scissors size={16} />2. 加工</button>
        <button onClick={() => setTab('pack')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'pack' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Package size={16} />3. 包裝</button>
        <button onClick={() => setTab('sku')} className={`px-7 py-3.5 rounded-xl text-lg font-bold flex items-center gap-2 ${tab === 'sku' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Grid3X3 size={16} />4. SKU 控價</button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋母料/SKU名稱..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
        </div>
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
            <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">母料</th><th className="px-2 py-2 text-left">供應商</th><th className="px-2 py-2 text-center">單位</th><th className="px-2 py-2 text-right">成本</th><th className="px-2 py-2 text-right">預包裝淨含量</th><th className="px-2 py-2 text-right">操作</th></tr></thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-blue-50/40">
                <td className="px-2 py-1.5"><input value={newIngredient.name} onChange={e => setNewIngredient(v => ({ ...v, name: e.target.value }))} placeholder="新增母料" className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td>
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
                <tr key={i.id} className={`border-t border-slate-100 ${editingIngredientId === i.id ? 'bg-emerald-50/30' : ''}`} onDoubleClick={() => setEditingIngredientId(i.id)}>
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
                <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-base text-slate-900">{ingredients.find(m => m.id === selectedIngredientId)?.name || '請先選材料'}</h4>
              <span className="text-[11px] font-black text-slate-500">加工工作台</span>
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
                              onChange={e => {
                                const method = methods.find(m => m.id === e.target.value);
                                if (!method) return;
                                setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, methodId: method.id, code: method.code, name: method.name, category: method.category } : x));
                              }}
                              className="w-full p-1 border border-slate-200 rounded font-bold"
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
                            disabled={r.isDefaultPiece}
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
                            <button disabled={invalidYield} onClick={() => void saveProcessRow(r)} className={`px-2 py-1 rounded text-[10px] font-black ${invalidYield ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 確定儲存加工</button>
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
                            className="w-full p-1 border border-slate-200 rounded font-bold"
                          >
                            {methods.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.code} · {m.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5"><span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(d.category)}`}>{categoryLabel(d.category)}</span></td>
                        <td className="px-2 py-1.5"><input type="number" min="0.5" max="1" step="0.01" value={d.yieldRate} onChange={e => setProcessDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, yieldRate: Number(e.target.value) || 0 } : x))} className={`w-24 p-1 border rounded text-right font-bold ml-auto block ${invalidYield ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'}`} /></td>
                        <td className="px-2 py-1.5 text-right font-black text-amber-700">${previewCost.toFixed(2)}</td>
                        <td className="px-2 py-1.5 text-right">
                          <button disabled={invalidYield} onClick={() => void saveDraftProcessRow(d)} className={`px-2 py-1 rounded text-[10px] font-black ${invalidYield ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white'}`}>💾 確定儲存加工</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button onClick={appendProcessDraftRow} className="mt-3 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-black inline-flex items-center gap-1"><Plus size={12} />➕ 新增加工方式</button>
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
              {packMaterials.map(m => <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>{m.name}</button>)}
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-sm text-slate-900">{materials.find(m => m.id === selectedIngredientId)?.name || '請先選母料'}</h4>
              <span className="text-[11px] font-black text-slate-500">包裝工作台</span>
            </div>

            <div className="space-y-3 max-h-[34rem] overflow-auto">
              {processRowsForMaterial.map(proc => {
                const method = methods.find(m => m.id === proc.methodId) || methods.find(m => m.code === proc.code);
                const isWholeProcess = (method?.code || proc.code) === 'WHOLE';
                const costPerLb = processedCostPerLb(proc.ingredientId, proc.id);
                const rows = packRowsForMaterial.filter(r => r.processSpecId === proc.id);
                const drafts = packDraftRowsForMaterial.filter(r => r.processSpecId === proc.id);
                return (
                  <div key={proc.id} className="border border-slate-100 rounded-xl bg-white">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900">【加工工序: {method?.name || proc.name}】— 當前肉成本: ${costPerLb.toFixed(2)} / lb</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(method?.category || proc.category)}`}>{categoryLabel(method?.category || proc.category)}</span>
                      </div>
                      <button onClick={() => addPackDraftRow(proc)} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-black inline-flex items-center gap-1"><Plus size={12} />➕ 新增包裝規格</button>
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
                                <td className="px-2 py-1.5"><input value={r.name} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /></td>
                                <td className="px-2 py-1.5"><select value={r.pricingType} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, pricingType: e.target.value as PricingType } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="fixed_pack">定額</option><option value="by_piece">抄碼</option></select></td>
                                <td className="px-2 py-1.5">
                                  {r.pricingType === 'fixed_pack' ? (
                                    <div className="flex gap-1">
                                      <input type="number" value={r.specWeight} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specWeight: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold" />
                                      <select value={r.specUnit} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specUnit: e.target.value as WeightUnit } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option></select>
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
                                    <button onClick={() => void savePackRow({ ...r, packagingFee: fee })} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">💾 儲存規格</button>
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
                                <td className="px-2 py-1.5"><input value={d.name} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /></td>
                                <td className="px-2 py-1.5"><select value={d.pricingType} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, pricingType: e.target.value as PricingType } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="fixed_pack">定額</option><option value="by_piece">抄碼</option></select></td>
                                <td className="px-2 py-1.5">
                                  {d.pricingType === 'fixed_pack' ? (
                                    <div className="flex gap-1">
                                      <input type="number" value={d.specWeight} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, specWeight: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold" />
                                      <select value={d.specUnit} onChange={e => setPackDraftRows(prev => prev.map(x => x.tempId === d.tempId ? { ...x, specUnit: e.target.value as WeightUnit } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="g">g</option><option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option></select>
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
                                    <button onClick={() => void savePackDraftRow(d)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">💾 儲存規格</button>
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
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <select value={newSku.packSpecId} onChange={e => setNewSku(v => ({ ...v, packSpecId: e.target.value }))} className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[260px]"><option value="">選擇包裝規格</option>{availablePackRows.map(p => <option key={p.id} value={p.id}>{p.name} · {p.channel} · {p.pricingType === 'fixed_pack' ? '定額' : '抄碼'}</option>)}</select>
            <input value={newSku.name} onChange={e => setNewSku(v => ({ ...v, name: e.target.value }))} placeholder="SKU 名稱" className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[180px]" />
            <input value={newSku.alias} onChange={e => setNewSku(v => ({ ...v, alias: e.target.value }))} placeholder="Alias (選填)" className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[140px]" />
            <button onClick={() => void addSku()} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center gap-1"><Plus size={12} />新增 SKU</button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-black text-slate-500">Base Denominator</label><input type="number" step="0.01" value={baseDenominator} onChange={e => setBaseDenominator(Number(e.target.value) || 0.88)} className="w-24 p-2 border border-slate-200 rounded-lg text-xs font-black" />
            <label className="text-[11px] font-black text-slate-500">Tier Step</label><input type="number" step="0.005" value={tierStep} onChange={e => setTierStep(Number(e.target.value) || 0.01)} className="w-20 p-2 border border-slate-200 rounded-lg text-xs font-black" />
            <button onClick={() => void saveOverrides()} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-black text-slate-600">保存手動控價</button>
            <button onClick={() => setShowTierModal(true)} className="ml-auto px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-black flex items-center gap-1"><FileDown size={12} />下載報價 PDF</button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3 overflow-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2">#</th><th className="px-2 py-2 text-left">規格/SKU</th><th className="px-2 py-2 text-left">分類</th><th className="px-2 py-2 text-left">通路</th><th className="px-2 py-2 text-right">成本</th>{tierDefs.map(t => <th key={t.key} className="px-2 py-2 text-right">{t.key}</th>)}</tr></thead>
              <tbody>
                {skuGridRows.map(row => {
                  const s = row.sku;
                  const pack = row.pack;
                  const process = row.process;
                  const totalCost = calcTotalCost(pack);
                  const rowKey = row.rowId;
                  const pricingKeyBase = s?.id || `PACK:${pack.id}`;
                  return (
                    <tr key={rowKey} className="border-t border-slate-100">
                      <td className="px-2 py-1.5 text-center"><input disabled={!s} type="checkbox" checked={selectedSkuRowIds.has(rowKey)} onChange={e => setSelectedSkuRowIds(prev => { const next = new Set(prev); if (e.target.checked) next.add(rowKey); else next.delete(rowKey); return next; })} /></td>
                      <td className="px-2 py-1.5"><div className="font-black">{s?.name || pack.name}</div><div className="text-[10px] text-slate-400">{s?.code || `${pack.code} · 待建立 SKU`}</div></td>
                      <td className="px-2 py-1.5"><span className={`inline-block px-2 py-0.5 text-[10px] rounded-full border ${categoryBadge(process?.category || 'others')}`}>{categoryLabel(process?.category || 'others')}</span></td>
                      <td className="px-2 py-1.5">{s?.saleChannel || pack.channel}</td>
                      <td className="px-2 py-1.5 text-right font-black text-amber-700">${totalCost.toFixed(2)}</td>
                      {tierDefs.map(t => {
                        const price = tierPrice(pricingKeyBase, totalCost, t.delta);
                        const margin = round2(price - totalCost);
                        const isLoss = margin < 0;
                        return (
                          <td key={t.key} className="px-2 py-1.5 text-right">
                            <div className={`font-black ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>${price.toFixed(2)} ({margin >= 0 ? '+' : ''}{margin.toFixed(2)})</div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

      {showTierModal && (
        <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="font-black text-slate-900">請選擇導出的價格梯度 (P-2 至 P2)</h4>
            <div className="grid grid-cols-5 gap-1 mt-3">{tierDefs.map(t => <button key={t.key} onClick={() => setSelectedTierForPdf(t.key)} className={`px-2 py-2 rounded-lg text-xs font-black ${selectedTierForPdf === t.key ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>{t.key}</button>)}</div>
            <div className="mt-3 flex justify-end gap-2"><button onClick={() => setShowTierModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-black text-slate-600">取消</button><button onClick={() => { setShowTierModal(false); exportQuotePdf(); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-black">產生 PDF</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialFlowPanel;

