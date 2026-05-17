import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Scissors, Package, ShoppingBag, Plus, Save, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Ingredient, Product, SaleChannel } from './types';
import { mapIngredientRowToIngredient } from './supabaseMappers';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

type FlowTab = 'ingredients' | 'process_specs' | 'pack_specs' | 'sellable_skus';

interface ProcessSpec {
  id: string;
  ingredientId: string;
  code: string;
  name: string;
  yieldRate: number;
  processingCost: number;
  isDefaultPiece: boolean;
  sortOrder: number;
  isActive: boolean;
}

interface PackSpec {
  id: string;
  ingredientId: string;
  processSpecId: string;
  code: string;
  name: string;
  pricingMode: 'fixed_pack' | 'by_piece';
  packLabel?: string;
  packWeightLb?: number;
  packagingCost: number;
  sortOrder: number;
  isActive: boolean;
}

interface SellableSku {
  id: string;
  code: string;
  name: string;
  alias?: string;
  ingredientId: string;
  processSpecId: string;
  packSpecId: string;
  productId: string;
  saleChannel: SaleChannel;
  sortOrder: number;
  isActive: boolean;
}

const emptyIngredientDraft = { name: '', unit: 'lb', baseCostPerLb: 0, supplier: '', category: '' };
const emptyProcessDraft = { ingredientId: '', code: '', name: '', yieldRate: 1, processingCost: 0, isDefaultPiece: false };
const emptyPackDraft = { processSpecId: '', code: '', name: '', pricingMode: 'fixed_pack' as 'fixed_pack' | 'by_piece', packLabel: '', packWeightLb: 0, packagingCost: 0 };
const emptySkuDraft = { processSpecId: '', packSpecId: '', code: '', name: '', alias: '', saleChannel: 'wholesale' as SaleChannel };

const toTitleCode = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const MaterialFlowPanel: React.FC<Props> = ({ showToast, products, setProducts }) => {
  const [tab, setTab] = useState<FlowTab>('ingredients');
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [processSpecs, setProcessSpecs] = useState<ProcessSpec[]>([]);
  const [packSpecs, setPackSpecs] = useState<PackSpec[]>([]);
  const [skus, setSkus] = useState<SellableSku[]>([]);

  const [ingredientDraft, setIngredientDraft] = useState(emptyIngredientDraft);
  const [processDraft, setProcessDraft] = useState(emptyProcessDraft);
  const [packDraft, setPackDraft] = useState(emptyPackDraft);
  const [skuDraft, setSkuDraft] = useState(emptySkuDraft);

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);
  const processMap = useMemo(() => new Map(processSpecs.map(p => [p.id, p])), [processSpecs]);
  const packMap = useMemo(() => new Map(packSpecs.map(p => [p.id, p])), [packSpecs]);
  const productIdSet = useMemo(() => new Set(products.map(p => p.id)), [products]);
  const orphanProcessSpecs = useMemo(
    () => processSpecs.filter(ps => !ingredientMap.has(ps.ingredientId)),
    [processSpecs, ingredientMap],
  );
  const orphanPackSpecs = useMemo(
    () => packSpecs.filter(pk => !ingredientMap.has(pk.ingredientId) || !processMap.has(pk.processSpecId)),
    [packSpecs, ingredientMap, processMap],
  );
  const orphanSkus = useMemo(
    () => skus.filter(sku =>
      !ingredientMap.has(sku.ingredientId) ||
      !processMap.has(sku.processSpecId) ||
      !packMap.has(sku.packSpecId) ||
      !productIdSet.has(sku.productId)
    ),
    [skus, ingredientMap, processMap, packMap, productIdSet],
  );
  const hasOrphans = orphanProcessSpecs.length > 0 || orphanPackSpecs.length > 0 || orphanSkus.length > 0;

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, procRes, packRes, skuRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('material_process_specs').select('*').order('sort_order').order('name'),
        supabase.from('material_pack_specs').select('*').order('sort_order').order('name'),
        supabase.from('sellable_skus').select('*').order('sort_order').order('name'),
      ]);
      if (ingRes.error) throw ingRes.error;
      if (procRes.error) throw procRes.error;
      if (packRes.error) throw packRes.error;
      if (skuRes.error) throw skuRes.error;
      setIngredients((ingRes.data || []).map(mapIngredientRowToIngredient));
      setProcessSpecs((procRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        code: r.code,
        name: r.name,
        yieldRate: Number(r.yield_rate) || 1,
        processingCost: Number(r.processing_cost) || 0,
        isDefaultPiece: !!r.is_default_piece,
        sortOrder: Number(r.sort_order) || 0,
        isActive: r.is_active !== false,
      })));
      setPackSpecs((packRes.data || []).map((r: any) => ({
        id: r.id,
        ingredientId: r.ingredient_id,
        processSpecId: r.process_spec_id,
        code: r.code,
        name: r.name,
        pricingMode: r.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack',
        packLabel: r.pack_label || undefined,
        packWeightLb: r.pack_weight_lb == null ? undefined : Number(r.pack_weight_lb),
        packagingCost: Number(r.packaging_cost) || 0,
        sortOrder: Number(r.sort_order) || 0,
        isActive: r.is_active !== false,
      })));
      setSkus((skuRes.data || []).map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        alias: r.alias || undefined,
        ingredientId: r.ingredient_id,
        processSpecId: r.process_spec_id,
        packSpecId: r.pack_spec_id,
        productId: r.product_id,
        saleChannel: ['retail', 'wholesale', 'both'].includes(r.sale_channel) ? r.sale_channel : 'wholesale',
        sortOrder: Number(r.sort_order) || 0,
        isActive: r.is_active !== false,
      })));
    } catch (err: any) {
      showToast(`載入 4 層流程失敗：${err?.message || '未知錯誤'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const createDefaultChainForIngredient = useCallback(async (ingredient: Ingredient) => {
    const procId = toTitleCode('PS');
    const packId = toTitleCode('PK');
    const skuId = toTitleCode('SKU');
    const productId = toTitleCode('P');
    const processCode = 'WHOLE';
    const packCode = 'BULK';
    const skuCode = `SKU-${ingredient.name.replace(/\s+/g, '').slice(0, 6).toUpperCase() || Date.now()}`;

    const defaultProcess = {
      id: procId,
      ingredient_id: ingredient.id,
      code: processCode,
      name: '原件',
      yield_rate: 1,
      processing_cost: 0,
      is_default_piece: true,
      sort_order: 0,
      is_active: true,
    };
    const defaultPack = {
      id: packId,
      ingredient_id: ingredient.id,
      process_spec_id: procId,
      code: packCode,
      name: '散買/原件',
      pricing_mode: 'by_piece',
      pack_label: null,
      pack_weight_lb: null,
      packaging_cost: 0,
      sort_order: 0,
      is_active: true,
    };
    const defaultProduct = {
      id: productId,
      name: ingredient.name,
      categories: [],
      price: 0,
      member_price: 0,
      stock: 0,
      track_inventory: true,
      tags: ['default_raw_piece'],
      image: '🥩',
      ingredient_id: ingredient.id,
      parent_ingredient_id: ingredient.id,
      processing_type_id: null,
      yield_rate: 1,
      processing_cost: 0,
      packaging_cost: 0,
      misc_cost: 0,
      sale_channel: 'wholesale',
      product_type: 'raw_material',
      pack_size: null,
      pack_weight_lb: null,
      group_id: null,
      variant_label: '原件',
      pricing_mode: 'by_piece',
      processing_spec: null,
    };
    const defaultSku = {
      id: skuId,
      code: skuCode,
      name: ingredient.name,
      alias: null,
      ingredient_id: ingredient.id,
      process_spec_id: procId,
      pack_spec_id: packId,
      product_id: productId,
      sale_channel: 'wholesale',
      sort_order: 0,
      is_active: true,
    };

    const { error: procErr } = await supabase.from('material_process_specs').insert(defaultProcess);
    if (procErr) throw procErr;
    const { error: packErr } = await supabase.from('material_pack_specs').insert(defaultPack);
    if (packErr) throw packErr;
    const { error: prodErr } = await supabase.from('products').insert(defaultProduct);
    if (prodErr) throw prodErr;
    const { error: skuErr } = await supabase.from('sellable_skus').insert(defaultSku);
    if (skuErr) throw skuErr;

    setProducts(prev => [...prev, {
      id: defaultProduct.id,
      name: defaultProduct.name,
      categories: [],
      price: 0,
      memberPrice: 0,
      stock: 0,
      trackInventory: true,
      tags: ['default_raw_piece'],
      image: '🥩',
      ingredientId: ingredient.id,
      parentIngredientId: ingredient.id,
      yieldRate: 1,
      processingCost: 0,
      packagingCost: 0,
      miscCost: 0,
      saleChannel: 'wholesale',
      productType: 'raw_material',
      variantLabel: '原件',
      pricingMode: 'by_piece',
    }]);
  }, [setProducts]);

  const createIngredient = async () => {
    if (!ingredientDraft.name.trim()) {
      showToast('請輸入母料名稱', 'error');
      return;
    }
    try {
      const row = {
        id: toTitleCode('ING'),
        name: ingredientDraft.name.trim(),
        unit: ingredientDraft.unit || 'lb',
        base_cost_per_lb: Number(ingredientDraft.baseCostPerLb) || 0,
        supplier: ingredientDraft.supplier.trim() || null,
        category: ingredientDraft.category.trim() || null,
        material_type: 'meat',
      };
      const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
      if (error) throw error;
      const ingredient = mapIngredientRowToIngredient(data as any);
      await createDefaultChainForIngredient(ingredient);
      setIngredientDraft(emptyIngredientDraft);
      await loadAll();
      setTab('process_specs');
      showToast('母料已建立，並已自動建立原件流程/包裝/SKU');
    } catch (err: any) {
      showToast(`新增母料失敗：${err?.message || '未知錯誤'}`, 'error');
    }
  };

  const createProcessSpec = async () => {
    if (hasOrphans) return showToast('偵測到孤兒資料，請先修復關聯（先跑重構 SQL backfill）', 'error');
    if (!processDraft.ingredientId) return showToast('請先選母料', 'error');
    if (!processDraft.name.trim()) return showToast('請輸入加工名稱', 'error');
    const code = (processDraft.code || processDraft.name).trim().toUpperCase().replace(/\s+/g, '_');
    try {
      const { error } = await supabase.from('material_process_specs').insert({
        id: toTitleCode('PS'),
        ingredient_id: processDraft.ingredientId,
        code,
        name: processDraft.name.trim(),
        yield_rate: Math.max(0.5, Math.min(1, Number(processDraft.yieldRate) || 1)),
        processing_cost: Number(processDraft.processingCost) || 0,
        is_default_piece: !!processDraft.isDefaultPiece,
        sort_order: processSpecs.filter(p => p.ingredientId === processDraft.ingredientId).length,
        is_active: true,
      });
      if (error) throw error;
      setProcessDraft(emptyProcessDraft);
      await loadAll();
      setTab('pack_specs');
      showToast('加工規格已建立');
    } catch (err: any) {
      showToast(`新增加工規格失敗：${err?.message || '未知錯誤'}`, 'error');
    }
  };

  const createPackSpec = async () => {
    if (hasOrphans) return showToast('偵測到孤兒資料，請先修復關聯（先跑重構 SQL backfill）', 'error');
    const process = processMap.get(packDraft.processSpecId);
    if (!process) return showToast('請先選加工規格', 'error');
    if (!packDraft.name.trim()) return showToast('請輸入包裝名稱', 'error');
    const code = (packDraft.code || packDraft.name).trim().toUpperCase().replace(/\s+/g, '_');
    try {
      const { error } = await supabase.from('material_pack_specs').insert({
        id: toTitleCode('PK'),
        ingredient_id: process.ingredientId,
        process_spec_id: process.id,
        code,
        name: packDraft.name.trim(),
        pricing_mode: packDraft.pricingMode,
        pack_label: packDraft.packLabel.trim() || null,
        pack_weight_lb: packDraft.pricingMode === 'fixed_pack'
          ? (Number(packDraft.packWeightLb) > 0 ? Number(packDraft.packWeightLb) : null)
          : null,
        packaging_cost: Number(packDraft.packagingCost) || 0,
        sort_order: packSpecs.filter(p => p.processSpecId === process.id).length,
        is_active: true,
      });
      if (error) throw error;
      setPackDraft(emptyPackDraft);
      await loadAll();
      setTab('sellable_skus');
      showToast('包裝規格已建立');
    } catch (err: any) {
      showToast(`新增包裝規格失敗：${err?.message || '未知錯誤'}`, 'error');
    }
  };

  const createSellableSku = async () => {
    if (hasOrphans) return showToast('偵測到孤兒資料，請先修復關聯（先跑重構 SQL backfill）', 'error');
    if (!skuDraft.processSpecId) return showToast('請先選加工規格', 'error');
    const pack = packMap.get(skuDraft.packSpecId);
    if (!pack) return showToast('請先選包裝規格', 'error');
    if (pack.processSpecId !== skuDraft.processSpecId) return showToast('包裝規格與加工規格不一致', 'error');
    const process = processMap.get(pack.processSpecId);
    const ingredient = ingredientMap.get(pack.ingredientId);
    if (!process || !ingredient) return showToast('規格關聯不完整', 'error');
    if (!skuDraft.name.trim()) return showToast('請輸入 SKU 名稱', 'error');
    const code = (skuDraft.code || skuDraft.name).trim().toUpperCase().replace(/\s+/g, '_').slice(0, 36);
    const productId = toTitleCode('P');
    const pricingMode = pack.pricingMode;

    try {
      const { error: productErr } = await supabase.from('products').insert({
        id: productId,
        name: skuDraft.name.trim(),
        categories: [],
        price: 0,
        member_price: 0,
        stock: 0,
        track_inventory: true,
        tags: ['sellable_sku'],
        image: '📦',
        ingredient_id: ingredient.id,
        parent_ingredient_id: ingredient.id,
        processing_type_id: null,
        yield_rate: process.yieldRate,
        processing_cost: process.processingCost,
        packaging_cost: pack.packagingCost,
        misc_cost: 0,
        sale_channel: skuDraft.saleChannel,
        product_type: 'processed',
        pack_size: pack.packLabel || null,
        pack_weight_lb: pack.packWeightLb ?? null,
        group_id: null,
        variant_label: `${process.name}${pack.packLabel ? ` ${pack.packLabel}` : ''}`.trim(),
        pricing_mode: pricingMode,
        processing_spec: process.name,
      });
      if (productErr) throw productErr;

      const { error: skuErr } = await supabase.from('sellable_skus').insert({
        id: toTitleCode('SKU'),
        code,
        name: skuDraft.name.trim(),
        alias: skuDraft.alias.trim() || null,
        ingredient_id: ingredient.id,
        process_spec_id: process.id,
        pack_spec_id: pack.id,
        product_id: productId,
        sale_channel: skuDraft.saleChannel,
        sort_order: skus.length,
        is_active: true,
      });
      if (skuErr) throw skuErr;

      setSkuDraft(emptySkuDraft);
      await loadAll();
      showToast('Sellable SKU 已建立，可在批發下單使用');
    } catch (err: any) {
      showToast(`新增 SKU 失敗：${err?.message || '未知錯誤'}`, 'error');
    }
  };

  const tabLocked = {
    process_specs: ingredients.length === 0,
    pack_specs: processSpecs.length === 0,
    sellable_skus: packSpecs.length === 0,
  } as const;

  const processOptions = useMemo(() => processSpecs.filter(p => p.isActive), [processSpecs]);
  const packOptions = useMemo(() => {
    if (!skuDraft.processSpecId) return [];
    return packSpecs.filter(p => p.isActive && p.processSpecId === skuDraft.processSpecId);
  }, [packSpecs, skuDraft.processSpecId]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-black text-slate-700">四層流程（強制一環扣一環）</p>
        <p className="text-[11px] text-slate-500 font-bold mt-1">母料 → 加工規格 → 包裝規格 → 銷售 SKU。批發選品只會讀取 Sellable SKU。</p>
      </div>
      {hasOrphans && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <p className="text-xs font-black text-rose-700">偵測到孤兒資料，已暫停新增下游層級</p>
          <p className="text-[11px] text-rose-600 font-bold mt-1">
            Process孤兒: {orphanProcessSpecs.length} · Pack孤兒: {orphanPackSpecs.length} · SKU孤兒: {orphanSkus.length}
          </p>
          <p className="text-[10px] text-rose-500 mt-1">請先跑 `supabase-material-flow-restructure.sql` 的 backfill 與檢查段落修復，再繼續新增。</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ingredients' as FlowTab, label: '1. 母料', icon: <Layers size={15} /> },
          { id: 'process_specs' as FlowTab, label: '2. 加工規格', icon: <Scissors size={15} /> },
          { id: 'pack_specs' as FlowTab, label: '3. 包裝規格', icon: <Package size={15} /> },
          { id: 'sellable_skus' as FlowTab, label: '4. 銷售 SKU', icon: <ShoppingBag size={15} /> },
        ].map(t => {
          const locked =
            (t.id === 'process_specs' && tabLocked.process_specs) ||
            (t.id === 'pack_specs' && tabLocked.pack_specs) ||
            (t.id === 'sellable_skus' && tabLocked.sellable_skus);
          return (
            <button
              key={t.id}
              disabled={locked}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
                tab === t.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
              } disabled:opacity-40`}
            >
              {t.icon} {t.label}
            </button>
          );
        })}
        <button onClick={() => void loadAll()} className="ml-auto px-3 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 flex items-center gap-1.5">
          {loading ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />} Refresh
        </button>
      </div>

      {tab === 'ingredients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-black text-sm">新增母料</h3>
            <input value={ingredientDraft.name} onChange={e => setIngredientDraft(v => ({ ...v, name: e.target.value }))} placeholder="母料名稱" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            <div className="grid grid-cols-2 gap-2">
              <input value={ingredientDraft.unit} onChange={e => setIngredientDraft(v => ({ ...v, unit: e.target.value }))} placeholder="單位" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input type="number" value={ingredientDraft.baseCostPerLb} onChange={e => setIngredientDraft(v => ({ ...v, baseCostPerLb: Number(e.target.value) || 0 }))} placeholder="成本" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <input value={ingredientDraft.supplier} onChange={e => setIngredientDraft(v => ({ ...v, supplier: e.target.value }))} placeholder="供應商" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            <button onClick={() => void createIngredient()} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
              <Plus size={12} /> 建立母料並自動建立原件 SKU
            </button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-2">母料列表 ({ingredients.length})</h3>
            <div className="space-y-1 max-h-72 overflow-auto">
              {ingredients.map(ing => (
                <div key={ing.id} className="px-3 py-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{ing.name}</span>
                  <span className="text-slate-400">${ing.baseCostPerLb}/{ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'process_specs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-black text-sm">新增加工規格</h3>
            <select value={processDraft.ingredientId} onChange={e => setProcessDraft(v => ({ ...v, ingredientId: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選擇母料</option>
              {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={processDraft.code} onChange={e => setProcessDraft(v => ({ ...v, code: e.target.value }))} placeholder="編碼 (例: DICE)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input value={processDraft.name} onChange={e => setProcessDraft(v => ({ ...v, name: e.target.value }))} placeholder="名稱 (例: 切粒)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0.5" max="1" step="0.01" value={processDraft.yieldRate} onChange={e => setProcessDraft(v => ({ ...v, yieldRate: Number(e.target.value) || 1 }))} placeholder="出成率" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input type="number" min="0" step="0.01" value={processDraft.processingCost} onChange={e => setProcessDraft(v => ({ ...v, processingCost: Number(e.target.value) || 0 }))} placeholder="加工費/lb" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <button onClick={() => void createProcessSpec()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
              <Plus size={12} /> 建立加工規格
            </button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-2">加工規格列表 ({processSpecs.length})</h3>
            <div className="space-y-1 max-h-72 overflow-auto">
              {processSpecs.map(ps => (
                <div key={ps.id} className="px-3 py-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{ingredientMap.get(ps.ingredientId)?.name || '未知'} · {ps.name}</span>
                  <span className="text-slate-400">{ps.code} · 出成 {Math.round(ps.yieldRate * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'pack_specs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-black text-sm">新增包裝規格</h3>
            <select value={packDraft.processSpecId} onChange={e => setPackDraft(v => ({ ...v, processSpecId: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選擇加工規格</option>
              {processOptions.map(ps => (
                <option key={ps.id} value={ps.id}>{ingredientMap.get(ps.ingredientId)?.name || '未知'} · {ps.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={packDraft.code} onChange={e => setPackDraft(v => ({ ...v, code: e.target.value }))} placeholder="編碼 (例: 5KG_PACK)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input value={packDraft.name} onChange={e => setPackDraft(v => ({ ...v, name: e.target.value }))} placeholder="名稱 (例: 5kg一包)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={packDraft.pricingMode} onChange={e => setPackDraft(v => ({ ...v, pricingMode: e.target.value as 'fixed_pack' | 'by_piece' }))} className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
                <option value="fixed_pack">定裝</option>
                <option value="by_piece">抄碼/散買</option>
              </select>
              <input value={packDraft.packLabel} onChange={e => setPackDraft(v => ({ ...v, packLabel: e.target.value }))} placeholder="標籤 (例: 450g/包)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="0" step="0.01" value={packDraft.packWeightLb} onChange={e => setPackDraft(v => ({ ...v, packWeightLb: Number(e.target.value) || 0 }))} placeholder="重量(lb,定裝用)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input type="number" min="0" step="0.01" value={packDraft.packagingCost} onChange={e => setPackDraft(v => ({ ...v, packagingCost: Number(e.target.value) || 0 }))} placeholder="包裝費/lb" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <button onClick={() => void createPackSpec()} className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
              <Plus size={12} /> 建立包裝規格
            </button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-2">包裝規格列表 ({packSpecs.length})</h3>
            <div className="space-y-1 max-h-72 overflow-auto">
              {packSpecs.map(pk => (
                <div key={pk.id} className="px-3 py-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{processMap.get(pk.processSpecId)?.name || '未知'} · {pk.name}</span>
                  <span className="text-slate-400">{pk.pricingMode === 'by_piece' ? '抄碼/散買' : pk.packLabel || '定裝'} </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'sellable_skus' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-black text-sm">新增銷售 SKU</h3>
            <select value={skuDraft.processSpecId} onChange={e => setSkuDraft(v => ({ ...v, processSpecId: e.target.value, packSpecId: '' }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選擇加工規格</option>
              {processOptions.map(ps => {
                const ing = ingredientMap.get(ps.ingredientId);
                return <option key={ps.id} value={ps.id}>{ing?.name || '未知'} · {ps.name}</option>;
              })}
            </select>
            <select value={skuDraft.packSpecId} onChange={e => setSkuDraft(v => ({ ...v, packSpecId: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="">選擇包裝規格</option>
              {packOptions.map(pk => {
                const ps = processMap.get(pk.processSpecId);
                const ing = ingredientMap.get(pk.ingredientId);
                return <option key={pk.id} value={pk.id}>{ing?.name || '未知'} · {ps?.name || '未知'} · {pk.name}</option>;
              })}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={skuDraft.code} onChange={e => setSkuDraft(v => ({ ...v, code: e.target.value }))} placeholder="SKU 編碼" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
              <input value={skuDraft.name} onChange={e => setSkuDraft(v => ({ ...v, name: e.target.value }))} placeholder="顯示名稱 (例: 勁好食牛柳頭450g)" className="p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
            <input value={skuDraft.alias} onChange={e => setSkuDraft(v => ({ ...v, alias: e.target.value }))} placeholder="另名/客戶名 (選填)" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold" />
            <select value={skuDraft.saleChannel} onChange={e => setSkuDraft(v => ({ ...v, saleChannel: e.target.value as SaleChannel }))} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-bold">
              <option value="wholesale">批發</option>
              <option value="retail">零售</option>
              <option value="both">全部</option>
            </select>
            <button onClick={() => void createSellableSku()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
              <Plus size={12} /> 建立 Sellable SKU
            </button>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-2">Sellable SKU 列表 ({skus.length})</h3>
            <div className="space-y-1 max-h-72 overflow-auto">
              {skus.map(sku => {
                const pk = packMap.get(sku.packSpecId);
                const ps = processMap.get(sku.processSpecId);
                const ing = ingredientMap.get(sku.ingredientId);
                return (
                  <div key={sku.id} className="px-3 py-2 border border-slate-100 rounded-lg text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>{sku.name}</span>
                      <span className="text-slate-400">{sku.code}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {ing?.name || '未知'} <ArrowRight size={10} className="inline" /> {ps?.name || '未知'} <ArrowRight size={10} className="inline" /> {pk?.name || '未知'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialFlowPanel;
