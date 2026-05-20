import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Scissors, Package, Grid3X3, Save, Plus, RefreshCw, FileDown } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Ingredient, Product, SaleChannel, CostItem } from './types';
import { mapIngredientRowToIngredient } from './supabaseMappers';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

type StepTab = 'raw' | 'process' | 'pack' | 'sku';
type PricingType = 'fixed_pack' | 'by_piece';

interface GlobalMethod {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface ProcessRow {
  id: string;
  ingredientId: string;
  code: string;
  name: string;
  yieldRate: number;
  processingCost: number;
  isDefaultPiece: boolean;
  isActive: boolean;
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
  specUnit: 'g' | 'kg' | 'lb' | 'catty';
  packLabel: string;
  packagingFee: number;
  packWeightLb?: number;
  isActive: boolean;
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

const unitToLb = (weight: number, unit: 'g' | 'kg' | 'lb' | 'catty') => {
  if (!weight || weight <= 0) return 0;
  if (unit === 'lb') return weight;
  if (unit === 'kg') return weight * 2.20462;
  if (unit === 'g') return weight / 453.59237;
  return (weight * 600) / 453.59237;
};

const round2 = (v: number) => Math.round(v * 100) / 100;
const mkId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const QUOTE_SUFFIX: Record<string, string> = {
  P0: 'A0',
  P1: 'B1',
  P2: 'B2',
  'P-1': 'Y1',
  'P-2': 'Z2',
};

const MaterialFlowPanel: React.FC<Props> = ({ showToast, products, setProducts }) => {
  const [tab, setTab] = useState<StepTab>('raw');
  const [loading, setLoading] = useState(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [methods, setMethods] = useState<GlobalMethod[]>([]);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [packRows, setPackRows] = useState<PackRow[]>([]);
  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);

  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [baseDenominator, setBaseDenominator] = useState(0.88);
  const [tierStep, setTierStep] = useState(0.01);
  const [selectedTierForPdf, setSelectedTierForPdf] = useState('P0');
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});

  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'lb', supplier: '', cost: 0 });
  const [newMethod, setNewMethod] = useState({ code: '', name: '' });
  const [newProcess, setNewProcess] = useState({ methodId: '', yieldRate: 1, processingCost: 0 });
  const [newPack, setNewPack] = useState({
    code: '',
    name: '',
    pricingType: 'fixed_pack' as PricingType,
    channel: 'wholesale' as SaleChannel,
    specWeight: 500,
    specUnit: 'g' as 'g' | 'kg' | 'lb' | 'catty',
    packLabel: '',
    checkedCostItemIds: [] as string[],
  });
  const [newSku, setNewSku] = useState({ packSpecId: '', name: '', alias: '', code: '' });

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);
  const processMap = useMemo(() => new Map(processRows.map(r => [r.id, r])), [processRows]);
  const packMap = useMemo(() => new Map(packRows.map(r => [r.id, r])), [packRows]);
  const skuMap = useMemo(() => new Map(skuRows.map(r => [r.id, r])), [skuRows]);
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, methodRes, processRes, packRes, skuRes, cfgRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('processing_types').select('id,code,name,is_active').order('sort_order').order('name'),
        supabase.from('material_process_specs').select('*').order('sort_order').order('name'),
        supabase.from('material_pack_specs').select('*').order('sort_order').order('name'),
        supabase.from('sellable_skus').select('*').order('sort_order').order('name'),
        supabase.from('site_config').select('id,value').in('id', ['cost_items', 'material_flow_price_overrides']).order('id'),
      ]);

      if (ingRes.error) throw ingRes.error;
      if (methodRes.error) throw methodRes.error;
      if (processRes.error) throw processRes.error;
      if (packRes.error) throw packRes.error;
      if (skuRes.error) throw skuRes.error;
      if (cfgRes.error) throw cfgRes.error;

      setIngredients((ingRes.data || []).map(mapIngredientRowToIngredient));
      setMethods((methodRes.data || []).map((m: any) => ({
        id: m.id,
        code: m.code || '',
        name: m.name || '',
        isActive: m.is_active !== false,
      })));
      setProcessRows((processRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        code: r.code,
        name: r.name,
        yieldRate: Number(r.yield_rate) || 1,
        processingCost: Number(r.processing_cost) || 0,
        isDefaultPiece: !!r.is_default_piece,
        isActive: r.is_active !== false,
      })));
      setPackRows((packRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        processSpecId: r.process_spec_id,
        code: r.code,
        name: r.name,
        pricingType: r.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
        channel: (['retail', 'wholesale', 'both'].includes(r.target_channel) ? r.target_channel : 'wholesale') as SaleChannel,
        specWeight: Number(r.spec_weight) || 0,
        specUnit: (['g', 'kg', 'lb', 'catty'].includes(r.spec_unit) ? r.spec_unit : 'g') as 'g' | 'kg' | 'lb' | 'catty',
        packLabel: r.pack_label || '',
        packagingFee: Number(r.packaging_fee) || 0,
        packWeightLb: r.pack_weight_lb == null ? undefined : Number(r.pack_weight_lb),
        isActive: r.is_active !== false,
      })));
      setSkuRows((skuRes.data || []).map((r: any) => ({
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
      })));

      const cfgMap = new Map((cfgRes.data || []).map((r: any) => [r.id, r.value]));
      const cost = cfgMap.get('cost_items');
      const overrides = cfgMap.get('material_flow_price_overrides');
      if (Array.isArray(cost)) setCostItems(cost as CostItem[]);
      if (overrides && typeof overrides === 'object') setManualOverrides(overrides as Record<string, number>);
    } catch (err: any) {
      showToast(`載入 4 流程失敗：${err?.message || '未知錯誤'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!selectedIngredientId && ingredients.length > 0) setSelectedIngredientId(ingredients[0].id);
  }, [ingredients, selectedIngredientId]);

  const addIngredient = async () => {
    if (!newIngredient.name.trim()) return showToast('請輸入母料名稱', 'error');
    const row = {
      id: mkId('ING'),
      name: newIngredient.name.trim(),
      unit: newIngredient.unit,
      supplier: newIngredient.supplier.trim() || null,
      base_cost_per_lb: Number(newIngredient.cost) || 0,
      material_type: 'meat',
    };
    const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
    if (error) return showToast(`新增母料失敗：${error.message}`, 'error');
    const ing = mapIngredientRowToIngredient(data as any);
    setIngredients(prev => [...prev, ing].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedIngredientId(ing.id);
    setNewIngredient({ name: '', unit: 'lb', supplier: '', cost: 0 });
    showToast('母料已新增');
  };

  const saveIngredient = async (ing: Ingredient) => {
    const { error } = await supabase.from('ingredients').update({
      name: ing.name,
      supplier: ing.supplier || null,
      unit: ing.unit,
      base_cost_per_lb: ing.baseCostPerLb,
    }).eq('id', ing.id);
    if (error) return showToast(`保存母料失敗：${error.message}`, 'error');
    showToast('母料已保存');
  };

  const addMethod = async () => {
    if (!newMethod.name.trim()) return showToast('請輸入加工方法名稱', 'error');
    const code = (newMethod.code || newMethod.name).trim().toLowerCase().replace(/\s+/g, '_');
    const { data, error } = await supabase.from('processing_types').insert({
      id: mkId('PT'),
      code,
      name: newMethod.name.trim(),
      surcharge_pork_chicken: 0,
      surcharge_beef_lamb_seafood: 0,
      requires_repackaging: false,
      sort_order: methods.length,
      is_active: true,
    }).select('id,code,name,is_active').single();
    if (error) return showToast(`新增加工方法失敗：${error.message}`, 'error');
    setMethods(prev => [...prev, { id: data.id, code: data.code, name: data.name, isActive: data.is_active !== false }]);
    setNewMethod({ code: '', name: '' });
    showToast('加工方法已新增');
  };

  const selectedIngredient = useMemo(
    () => ingredients.find(i => i.id === selectedIngredientId),
    [ingredients, selectedIngredientId],
  );

  const processRowsForIngredient = useMemo(
    () => processRows.filter(r => r.ingredientId === selectedIngredientId && r.isActive),
    [processRows, selectedIngredientId],
  );

  const addProcessRow = async () => {
    if (!selectedIngredientId) return showToast('請先選母料', 'error');
    const method = methods.find(m => m.id === newProcess.methodId);
    if (!method) return showToast('請先選加工方法', 'error');
    const isWhole = method.code === 'whole' || method.name === '原件';
    const payload = {
      id: mkId('PS'),
      ingredient_id: selectedIngredientId,
      code: method.code.toUpperCase(),
      name: method.name,
      yield_rate: isWhole ? 1 : Math.max(0.5, Math.min(1, Number(newProcess.yieldRate) || 1)),
      processing_cost: Number(newProcess.processingCost) || 0,
      is_default_piece: isWhole,
      sort_order: processRowsForIngredient.length,
      is_active: true,
    };
    const { data, error } = await supabase.from('material_process_specs').insert(payload).select('*').single();
    if (error) return showToast(`新增加工流程失敗：${error.message}`, 'error');
    setProcessRows(prev => [...prev, {
      id: data.id,
      ingredientId: data.ingredient_id,
      code: data.code,
      name: data.name,
      yieldRate: Number(data.yield_rate) || 1,
      processingCost: Number(data.processing_cost) || 0,
      isDefaultPiece: !!data.is_default_piece,
      isActive: data.is_active !== false,
    }]);
    setNewProcess({ methodId: '', yieldRate: 1, processingCost: 0 });
    showToast('加工流程已新增');
  };

  const saveProcessRow = async (row: ProcessRow) => {
    const { error } = await supabase.from('material_process_specs').update({
      yield_rate: row.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, row.yieldRate)),
      processing_cost: row.processingCost,
      is_active: row.isActive,
    }).eq('id', row.id);
    if (error) return showToast(`保存加工流程失敗：${error.message}`, 'error');
    showToast('加工流程已保存');
  };

  const selectedProcess = useMemo(() => processMap.get(selectedProcessId), [processMap, selectedProcessId]);
  const processCostPerLb = useMemo(() => {
    if (!selectedProcess || !selectedIngredient) return 0;
    const y = selectedProcess.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, selectedProcess.yieldRate || 1));
    return round2((selectedIngredient.baseCostPerLb / y) + (selectedProcess.processingCost || 0));
  }, [selectedProcess, selectedIngredient]);

  const packRowsForProcess = useMemo(
    () => packRows.filter(r => r.processSpecId === selectedProcessId && r.isActive),
    [packRows, selectedProcessId],
  );

  const newPackFee = useMemo(
    () => newPack.checkedCostItemIds.reduce((sum, id) => sum + (costItems.find(ci => ci.id === id)?.defaultPrice || 0), 0),
    [newPack.checkedCostItemIds, costItems],
  );

  const computedPackTotal = useMemo(() => {
    if (!selectedProcess) return 0;
    if (newPack.pricingType === 'by_piece') return processCostPerLb;
    const lb = unitToLb(newPack.specWeight, newPack.specUnit);
    return round2((processCostPerLb * lb) + newPackFee);
  }, [newPack.pricingType, newPack.specWeight, newPack.specUnit, newPackFee, processCostPerLb, selectedProcess]);

  const addPackRow = async () => {
    if (!selectedIngredientId || !selectedProcessId) return showToast('請先選母料與加工流程', 'error');
    if (!newPack.name.trim()) return showToast('請輸入包裝名稱', 'error');
    const code = (newPack.code || newPack.name).trim().toUpperCase().replace(/\s+/g, '_');
    const lb = newPack.pricingType === 'fixed_pack' ? unitToLb(newPack.specWeight, newPack.specUnit) : 0;
    const payload = {
      id: mkId('PK'),
      ingredient_id: selectedIngredientId,
      process_spec_id: selectedProcessId,
      code,
      name: newPack.name.trim(),
      pricing_mode: newPack.pricingType,
      target_channel: newPack.channel,
      spec_weight: Number(newPack.specWeight) || 0,
      spec_unit: newPack.specUnit,
      pack_label: newPack.packLabel || `${newPack.specWeight}${newPack.specUnit}`,
      packaging_fee: newPackFee,
      pack_weight_lb: newPack.pricingType === 'fixed_pack' ? lb : null,
      is_active: true,
      sort_order: packRowsForProcess.length,
    };
    const { data, error } = await supabase.from('material_pack_specs').insert(payload).select('*').single();
    if (error) return showToast(`新增包裝規格失敗：${error.message}`, 'error');
    setPackRows(prev => [...prev, {
      id: data.id,
      ingredientId: data.ingredient_id,
      processSpecId: data.process_spec_id,
      code: data.code,
      name: data.name,
      pricingType: data.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
      channel: (['retail', 'wholesale', 'both'].includes(data.target_channel) ? data.target_channel : 'wholesale') as SaleChannel,
      specWeight: Number(data.spec_weight) || 0,
      specUnit: (['g', 'kg', 'lb', 'catty'].includes(data.spec_unit) ? data.spec_unit : 'g') as 'g' | 'kg' | 'lb' | 'catty',
      packLabel: data.pack_label || '',
      packagingFee: Number(data.packaging_fee) || 0,
      packWeightLb: data.pack_weight_lb == null ? undefined : Number(data.pack_weight_lb),
      isActive: data.is_active !== false,
    }]);
    setNewPack({ code: '', name: '', pricingType: 'fixed_pack', channel: 'wholesale', specWeight: 500, specUnit: 'g', packLabel: '', checkedCostItemIds: [] });
    showToast('包裝規格已新增');
  };

  const savePackRow = async (row: PackRow) => {
    const { error } = await supabase.from('material_pack_specs').update({
      target_channel: row.channel,
      pricing_mode: row.pricingType,
      spec_weight: row.specWeight,
      spec_unit: row.specUnit,
      pack_label: row.packLabel,
      packaging_fee: row.packagingFee,
      pack_weight_lb: row.pricingType === 'fixed_pack' ? row.packWeightLb || unitToLb(row.specWeight, row.specUnit) : null,
      is_active: row.isActive,
    }).eq('id', row.id);
    if (error) return showToast(`保存包裝規格失敗：${error.message}`, 'error');
    showToast('包裝規格已保存');
  };

  const availablePackRows = useMemo(() => {
    if (!selectedIngredientId) return [];
    return packRows.filter(r => r.ingredientId === selectedIngredientId && r.isActive);
  }, [packRows, selectedIngredientId]);

  const calcTotalCost = useCallback((pack: PackRow) => {
    const proc = processMap.get(pack.processSpecId);
    const ing = ingredientMap.get(pack.ingredientId);
    if (!proc || !ing) return 0;
    const y = proc.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, proc.yieldRate || 1));
    const processed = (ing.baseCostPerLb / y) + (proc.processingCost || 0);
    if (pack.pricingType === 'by_piece') return round2(processed);
    const lb = pack.packWeightLb && pack.packWeightLb > 0 ? pack.packWeightLb : unitToLb(pack.specWeight, pack.specUnit);
    return round2((processed * lb) + pack.packagingFee);
  }, [ingredientMap, processMap]);

  const addSku = async () => {
    const pack = packMap.get(newSku.packSpecId);
    if (!pack) return showToast('請先選包裝規格', 'error');
    const proc = processMap.get(pack.processSpecId);
    const ing = ingredientMap.get(pack.ingredientId);
    if (!proc || !ing) return showToast('關聯資料不完整', 'error');
    const skuName = newSku.name.trim();
    if (!skuName) return showToast('請輸入 SKU 名稱', 'error');

    const totalCost = calcTotalCost(pack);
    const p0 = baseDenominator > 0 ? round2(totalCost / baseDenominator) : totalCost;
    const productId = mkId('P');
    const variantLabel = `${proc.name}${pack.packLabel ? ` ${pack.packLabel}` : ''}`.trim();
    const packLb = pack.packWeightLb && pack.packWeightLb > 0 ? pack.packWeightLb : unitToLb(pack.specWeight, pack.specUnit);
    const packagingCostPerLb = pack.pricingType === 'fixed_pack' && packLb > 0 ? round2(pack.packagingFee / packLb) : 0;

    const productPayload = {
      id: productId,
      name: skuName,
      categories: [],
      price: p0,
      member_price: p0,
      stock: 0,
      track_inventory: true,
      tags: ['sellable_sku'],
      image: '📦',
      ingredient_id: ing.id,
      parent_ingredient_id: ing.id,
      processing_type_id: null,
      yield_rate: proc.yieldRate,
      processing_cost: proc.processingCost,
      packaging_cost: packagingCostPerLb,
      misc_cost: 0,
      sale_channel: pack.channel,
      product_type: 'processed',
      pack_size: pack.packLabel || null,
      pack_weight_lb: pack.pricingType === 'fixed_pack' ? packLb : null,
      group_id: null,
      variant_label: variantLabel,
      pricing_mode: pack.pricingType,
      processing_spec: proc.name,
    };
    const { error: prodErr } = await supabase.from('products').insert(productPayload);
    if (prodErr) return showToast(`新增商品失敗：${prodErr.message}`, 'error');

    const code = (newSku.code || skuName).trim().toUpperCase().replace(/\s+/g, '_').slice(0, 40);
    const skuPayload = {
      id: mkId('SKU'),
      code,
      name: skuName,
      alias: newSku.alias.trim() || null,
      ingredient_id: ing.id,
      process_spec_id: proc.id,
      pack_spec_id: pack.id,
      product_id: productId,
      sale_channel: pack.channel,
      sort_order: skuRows.length,
      is_active: true,
    };
    const { data: skuData, error: skuErr } = await supabase.from('sellable_skus').insert(skuPayload).select('*').single();
    if (skuErr) return showToast(`新增 SKU 失敗：${skuErr.message}`, 'error');

    setProducts(prev => [...prev, {
      id: productPayload.id,
      name: productPayload.name,
      categories: [],
      price: productPayload.price,
      memberPrice: productPayload.member_price,
      stock: 0,
      trackInventory: true,
      tags: ['sellable_sku'],
      image: '📦',
      ingredientId: ing.id,
      parentIngredientId: ing.id,
      yieldRate: proc.yieldRate,
      processingCost: proc.processingCost,
      packagingCost: packagingCostPerLb,
      miscCost: 0,
      saleChannel: pack.channel,
      productType: 'processed',
      packSize: pack.packLabel,
      packWeightLb: productPayload.pack_weight_lb || undefined,
      variantLabel,
      pricingMode: pack.pricingType,
      processingSpec: proc.name,
    }]);
    setSkuRows(prev => [...prev, {
      id: skuData.id,
      code: skuData.code,
      name: skuData.name,
      alias: skuData.alias || undefined,
      ingredientId: skuData.ingredient_id,
      processSpecId: skuData.process_spec_id,
      packSpecId: skuData.pack_spec_id,
      productId: skuData.product_id,
      saleChannel: skuData.sale_channel,
      isActive: skuData.is_active !== false,
    }]);
    setNewSku({ packSpecId: '', name: '', alias: '', code: '' });
    showToast('SKU 已新增');
  };

  const filteredSkus = useMemo(() => skuRows.filter(s => s.isActive), [skuRows]);
  const tierDefs = useMemo(() => [
    { key: 'P-2', delta: -2 },
    { key: 'P-1', delta: -1 },
    { key: 'P0', delta: 0 },
    { key: 'P1', delta: 1 },
    { key: 'P2', delta: 2 },
  ], []);

  const tierPrice = useCallback((skuId: string, totalCost: number, delta: number) => {
    const overrideKey = `${skuId}:${delta}`;
    if (manualOverrides[overrideKey] != null) return round2(manualOverrides[overrideKey]);
    const denom = baseDenominator - (delta * tierStep);
    if (denom <= 0.01) return 0;
    return round2(totalCost / denom);
  }, [manualOverrides, baseDenominator, tierStep]);

  const saveOverrides = async () => {
    const { error } = await supabase.from('site_config').upsert({
      id: 'material_flow_price_overrides',
      value: manualOverrides,
    });
    if (error) return showToast(`保存手動控價失敗：${error.message}`, 'error');
    showToast('手動控價已保存');
  };

  const exportQuotePdf = () => {
    const chosen = filteredSkus.filter(s => selectedSkuIds.has(s.id));
    if (chosen.length === 0) return showToast('請先勾選 SKU', 'error');
    const tier = tierDefs.find(t => t.key === selectedTierForPdf);
    if (!tier) return;
    const suffix = QUOTE_SUFFIX[selectedTierForPdf] || 'A0';
    const refNo = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}-${suffix}`;
    const rows = chosen.map(sku => {
      const pack = packMap.get(sku.packSpecId);
      const totalCost = pack ? calcTotalCost(pack) : 0;
      const price = tierPrice(sku.id, totalCost, tier.delta);
      return `<tr><td style="padding:6px;border:1px solid #ddd;">${sku.name}</td><td style="padding:6px;border:1px solid #ddd;text-align:right;">$${price.toFixed(2)}</td></tr>`;
    }).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Quotation</title></head><body style="font-family:Arial;padding:20px;">
      <h2>Quotation</h2><div style="margin-bottom:8px;">Ref No: <b>${refNo}</b></div>
      <table style="border-collapse:collapse;width:100%"><thead><tr><th style="text-align:left;padding:6px;border:1px solid #ddd;">Item</th><th style="text-align:right;padding:6px;border:1px solid #ddd;">Price</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return showToast('瀏覽器阻擋彈窗，請允許後重試', 'error');
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const isStepLocked = {
    process: ingredients.length === 0,
    pack: processRows.length === 0,
    sku: packRows.length === 0,
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-white rounded-xl"><Grid3X3 size={16} /></div>
        <div>
          <h3 className="font-black text-slate-900 text-sm">4-Step Material Flow Matrix</h3>
          <p className="text-[11px] text-slate-500 font-bold">母料 → 加工出成率 → 包裝規格 → SKU 控價面板（全程即時連動）</p>
        </div>
        <button onClick={() => void loadAll()} className="ml-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 flex items-center gap-1.5">
          {loading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />} Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('raw')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Layers size={14}/>1. 母料</button>
        <button disabled={isStepLocked.process} onClick={() => setTab('process')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'process' ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'} disabled:opacity-40`}><Scissors size={14}/>2. 加工</button>
        <button disabled={isStepLocked.pack} onClick={() => setTab('pack')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'pack' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'} disabled:opacity-40`}><Package size={14}/>3. 包裝</button>
        <button disabled={isStepLocked.sku} onClick={() => setTab('sku')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'sku' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'} disabled:opacity-40`}><Grid3X3 size={14}/>4. SKU 控價</button>
      </div>

      {tab === 'raw' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-black text-sm">母料分頁（Raw Materials Master）</h4>
            <div className="grid grid-cols-2 gap-2">
              <input value={newIngredient.name} onChange={e => setNewIngredient(v => ({ ...v, name: e.target.value }))} placeholder="material_name" className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
              <select value={newIngredient.unit} onChange={e => setNewIngredient(v => ({ ...v, unit: e.target.value }))} className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold">
                <option value="lb">lb</option><option value="kg">kg</option><option value="catty">斤</option>
              </select>
              <input value={newIngredient.supplier} onChange={e => setNewIngredient(v => ({ ...v, supplier: e.target.value }))} placeholder="supplier" className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
              <input type="number" min="0" step="0.01" value={newIngredient.cost} onChange={e => setNewIngredient(v => ({ ...v, cost: Number(e.target.value) || 0 }))} placeholder="cost_per_unit" className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
            </div>
            <button onClick={() => void addIngredient()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><Plus size={12}/>新增母料</button>
            <div className="max-h-72 overflow-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">名稱</th><th className="px-2 py-2">單位</th><th className="px-2 py-2 text-right">成本</th><th className="px-2 py-2 text-right">保存</th></tr></thead>
                <tbody>
                  {ingredients.map(ing => (
                    <tr key={ing.id} className="border-t border-slate-100">
                      <td className="px-2 py-1.5"><input value={ing.name} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, name: e.target.value } : x))} className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold"/></td>
                      <td className="px-2 py-1.5"><input value={ing.unit} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, unit: e.target.value } : x))} className="w-16 p-1.5 border border-slate-200 rounded text-xs font-bold"/></td>
                      <td className="px-2 py-1.5"><input type="number" value={ing.baseCostPerLb} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, baseCostPerLb: Number(e.target.value) || 0 } : x))} className="w-24 p-1.5 border border-slate-200 rounded text-xs font-bold text-right"/></td>
                      <td className="px-2 py-1.5 text-right"><button onClick={() => void saveIngredient(ing)} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-black">保存</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-black text-sm">加工方法表（Global Config）</h4>
            <div className="grid grid-cols-2 gap-2">
              <input value={newMethod.code} onChange={e => setNewMethod(v => ({ ...v, code: e.target.value }))} placeholder="code" className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
              <input value={newMethod.name} onChange={e => setNewMethod(v => ({ ...v, name: e.target.value }))} placeholder="name" className="p-2.5 rounded-xl border border-slate-200 text-sm font-bold" />
            </div>
            <button onClick={() => void addMethod()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><Plus size={12}/>新增加工方法</button>
            <div className="max-h-72 overflow-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">Code</th><th className="px-2 py-2 text-left">Name</th></tr></thead>
                <tbody>
                  {methods.filter(m => m.isActive).map(m => <tr key={m.id} className="border-t border-slate-100"><td className="px-2 py-1.5 font-mono">{m.code}</td><td className="px-2 py-1.5 font-bold">{m.name}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'process' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-black text-sm">加工分頁（Yield & Waste）</h4>
            <select value={selectedIngredientId} onChange={e => setSelectedIngredientId(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <select value={newProcess.methodId} onChange={e => setNewProcess(v => ({ ...v, methodId: e.target.value }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
                <option value="">選加工方法</option>
                {methods.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="number" min="0.5" max="1" step="0.01" value={newProcess.yieldRate} onChange={e => setNewProcess(v => ({ ...v, yieldRate: Number(e.target.value) || 1 }))} placeholder="yield_rate" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
              <input type="number" min="0" step="0.01" value={newProcess.processingCost} onChange={e => setNewProcess(v => ({ ...v, processingCost: Number(e.target.value) || 0 }))} placeholder="加工費/lb" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
            </div>
            <button onClick={() => void addProcessRow()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><Plus size={12}/>新增加工子列</button>
            <p className="text-[10px] text-slate-500 font-bold">processed_cost = cost_per_unit / yield_rate + processing_cost</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="max-h-80 overflow-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">方法</th><th className="px-2 py-2 text-right">出成率</th><th className="px-2 py-2 text-right">加工費</th><th className="px-2 py-2 text-right">processed_cost</th><th className="px-2 py-2 text-right">保存</th></tr></thead>
                <tbody>
                  {processRowsForIngredient.map(r => {
                    const base = selectedIngredient?.baseCostPerLb || 0;
                    const y = r.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, r.yieldRate || 1));
                    const processed = round2((base / y) + (r.processingCost || 0));
                    return (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 font-bold">{r.name}{r.isDefaultPiece ? ' (原件)' : ''}</td>
                        <td className="px-2 py-1.5"><input disabled={r.isDefaultPiece} type="number" min="0.5" max="1" step="0.01" value={y} onChange={e => setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, yieldRate: Number(e.target.value) || 1 } : x))} className="w-20 p-1.5 border border-slate-200 rounded text-xs font-bold text-right disabled:opacity-50"/></td>
                        <td className="px-2 py-1.5"><input type="number" min="0" step="0.01" value={r.processingCost} onChange={e => setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, processingCost: Number(e.target.value) || 0 } : x))} className="w-20 p-1.5 border border-slate-200 rounded text-xs font-bold text-right"/></td>
                        <td className="px-2 py-1.5 text-right font-black text-amber-700">${processed}</td>
                        <td className="px-2 py-1.5 text-right"><button onClick={() => void saveProcessRow(r)} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-black">保存</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'pack' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 xl:grid-cols-4 gap-2">
            <select value={selectedIngredientId} onChange={e => setSelectedIngredientId(e.target.value)} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <select value={selectedProcessId} onChange={e => setSelectedProcessId(e.target.value)} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選加工流程</option>
              {processRows.filter(p => p.ingredientId === selectedIngredientId && p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="px-3 py-2.5 bg-slate-50 rounded-xl text-xs font-black text-slate-600">Processed: ${processCostPerLb}/lb</div>
            <div className="px-3 py-2.5 bg-amber-50 rounded-xl text-xs font-black text-amber-700">新規格成本: ${computedPackTotal}</div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
              <h4 className="font-black text-sm">包裝分頁（2x2 Matrix）</h4>
              <div className="grid grid-cols-2 gap-2">
                <input value={newPack.code} onChange={e => setNewPack(v => ({ ...v, code: e.target.value }))} placeholder="code" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
                <input value={newPack.name} onChange={e => setNewPack(v => ({ ...v, name: e.target.value }))} placeholder="display_name" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
                <select value={newPack.pricingType} onChange={e => setNewPack(v => ({ ...v, pricingType: e.target.value as PricingType }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
                  <option value="fixed_pack">定額</option><option value="by_piece">抄碼</option>
                </select>
                <select value={newPack.channel} onChange={e => setNewPack(v => ({ ...v, channel: e.target.value as SaleChannel }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
                  <option value="retail">零售</option><option value="wholesale">批發</option><option value="both">全部</option>
                </select>
                <input type="number" value={newPack.specWeight} onChange={e => setNewPack(v => ({ ...v, specWeight: Number(e.target.value) || 0 }))} placeholder="spec_weight" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
                <select value={newPack.specUnit} onChange={e => setNewPack(v => ({ ...v, specUnit: e.target.value as any }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
                  <option value="g">g</option><option value="kg">kg</option><option value="lb">lb</option><option value="catty">斤</option>
                </select>
              </div>
              <input value={newPack.packLabel} onChange={e => setNewPack(v => ({ ...v, packLabel: e.target.value }))} placeholder="pack_label (例: 300g/包)" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
              <div className="p-2 border border-slate-100 rounded-xl">
                <p className="text-[10px] text-slate-500 font-black mb-1">Packaging Checklist</p>
                <div className="flex flex-wrap gap-1.5">
                  {costItems.map(ci => {
                    const checked = newPack.checkedCostItemIds.includes(ci.id);
                    return <button key={ci.id} onClick={() => setNewPack(v => ({ ...v, checkedCostItemIds: checked ? v.checkedCostItemIds.filter(x => x !== ci.id) : [...v.checkedCostItemIds, ci.id] }))} className={`px-2 py-1 rounded text-[10px] font-black border ${checked ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-500 border-slate-200'}`}>{ci.name} (${ci.defaultPrice})</button>;
                  })}
                </div>
              </div>
              <button onClick={() => void addPackRow()} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><Plus size={12}/>新增包裝規格</button>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <h4 className="font-black text-sm mb-2">包裝矩陣（Channel × Pricing Type）</h4>
              <div className="max-h-80 overflow-auto border border-slate-100 rounded-xl">
                <table className="w-full text-xs">
                  <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">Name</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Channel</th><th className="px-2 py-2 text-right">PackFee</th><th className="px-2 py-2 text-right">TotalCost</th><th className="px-2 py-2 text-right">保存</th></tr></thead>
                  <tbody>
                    {packRowsForProcess.map(r => {
                      const total = calcTotalCost(r);
                      return (
                        <tr key={r.id} className="border-t border-slate-100">
                          <td className="px-2 py-1.5"><input value={r.name} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold"/></td>
                          <td className="px-2 py-1.5">{r.pricingType === 'fixed_pack' ? '定額' : '抄碼'}</td>
                          <td className="px-2 py-1.5"><select value={r.channel} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, channel: e.target.value as SaleChannel } : x))} className="p-1.5 border border-slate-200 rounded text-xs font-bold"><option value="retail">零售</option><option value="wholesale">批發</option><option value="both">全部</option></select></td>
                          <td className="px-2 py-1.5"><input type="number" value={r.packagingFee} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, packagingFee: Number(e.target.value) || 0 } : x))} className="w-20 p-1.5 border border-slate-200 rounded text-xs font-bold text-right"/></td>
                          <td className="px-2 py-1.5 text-right font-black text-amber-700">${total}</td>
                          <td className="px-2 py-1.5 text-right"><button onClick={() => void savePackRow(r)} className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-black">保存</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'sku' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 xl:grid-cols-5 gap-2">
            <select value={newSku.packSpecId} onChange={e => setNewSku(v => ({ ...v, packSpecId: e.target.value }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選包裝規格</option>
              {availablePackRows.map(p => <option key={p.id} value={p.id}>{p.name} · {p.channel} · {p.pricingType === 'fixed_pack' ? '定額' : '抄碼'}</option>)}
            </select>
            <input value={newSku.code} onChange={e => setNewSku(v => ({ ...v, code: e.target.value }))} placeholder="SKU code" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
            <input value={newSku.name} onChange={e => setNewSku(v => ({ ...v, name: e.target.value }))} placeholder="SKU name" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
            <input value={newSku.alias} onChange={e => setNewSku(v => ({ ...v, alias: e.target.value }))} placeholder="alias (選填)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold"/>
            <button onClick={() => void addSku()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5"><Plus size={12}/>新增 SKU</button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-black text-slate-500">Base Denominator</label>
            <input type="number" step="0.01" value={baseDenominator} onChange={e => setBaseDenominator(Number(e.target.value) || 0.88)} className="w-24 p-2 border border-slate-200 rounded-xl text-xs font-black"/>
            <label className="text-[11px] font-black text-slate-500 ml-2">Tier Step</label>
            <input type="number" step="0.005" value={tierStep} onChange={e => setTierStep(Number(e.target.value) || 0.01)} className="w-20 p-2 border border-slate-200 rounded-xl text-xs font-black"/>
            <button onClick={() => void saveOverrides()} className="ml-auto px-3 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600">保存手動控價</button>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <select value={selectedTierForPdf} onChange={e => setSelectedTierForPdf(e.target.value)} className="p-2 border border-slate-200 rounded-xl text-xs font-black">
                {tierDefs.map(t => <option key={t.key} value={t.key}>{t.key}</option>)}
              </select>
              <button onClick={exportQuotePdf} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-1.5"><FileDown size={12}/>匯出報價 PDF</button>
            </div>
            <div className="overflow-auto border border-slate-100 rounded-xl max-h-[28rem]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="px-2 py-2">#</th>
                    <th className="px-2 py-2 text-left">SKU</th>
                    <th className="px-2 py-2 text-left">Channel</th>
                    <th className="px-2 py-2 text-right">Cost</th>
                    {tierDefs.map(t => <th key={t.key} className="px-2 py-2 text-right">{t.key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map(sku => {
                    const pack = packMap.get(sku.packSpecId);
                    const totalCost = pack ? calcTotalCost(pack) : 0;
                    return (
                      <tr key={sku.id} className="border-t border-slate-100">
                        <td className="px-2 py-1.5 text-center">
                          <input type="checkbox" checked={selectedSkuIds.has(sku.id)} onChange={e => {
                            setSelectedSkuIds(prev => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(sku.id); else next.delete(sku.id);
                              return next;
                            });
                          }} />
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="font-black text-slate-800">{sku.name}</div>
                          <div className="text-[10px] text-slate-400">{sku.code}</div>
                        </td>
                        <td className="px-2 py-1.5">{sku.saleChannel}</td>
                        <td className="px-2 py-1.5 text-right font-black text-amber-700">${totalCost.toFixed(2)}</td>
                        {tierDefs.map(t => {
                          const price = tierPrice(sku.id, totalCost, t.delta);
                          const profit = round2(price - totalCost);
                          const key = `${sku.id}:${t.delta}`;
                          const isLoss = profit < 0;
                          return (
                            <td key={t.key} className="px-2 py-1.5 text-right">
                              <div className={`font-black ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                                ${price.toFixed(2)} ({profit >= 0 ? '+' : ''}{profit.toFixed(2)})
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                value={manualOverrides[key] ?? ''}
                                onChange={e => setManualOverrides(prev => {
                                  const next = { ...prev };
                                  const val = e.target.value;
                                  if (!val) delete next[key];
                                  else next[key] = Number(val) || 0;
                                  return next;
                                })}
                                placeholder="manual"
                                className="w-20 p-1 border border-slate-200 rounded text-[10px] font-bold text-right mt-1"
                              />
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
        </div>
      )}
    </div>
  );
};

export default MaterialFlowPanel;
