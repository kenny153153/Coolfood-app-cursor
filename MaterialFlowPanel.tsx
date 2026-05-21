import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid3X3, Layers, Scissors, Package, Search, RefreshCw, Save, Settings2, Upload, Plus, FileDown } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { CostItem, Ingredient, Product, SaleChannel } from './types';
import { mapIngredientRowToIngredient } from './supabaseMappers';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

type StepTab = 'raw' | 'process' | 'pack' | 'sku';
type PricingType = 'fixed_pack' | 'by_piece';
type ChannelFilter = 'all' | 'retail' | 'wholesale';
type TypeFilter = 'all' | 'fixed_pack' | 'by_piece';

interface GlobalMethod { id: string; code: string; name: string; isActive: boolean; }
interface ProcessRow { id: string; ingredientId: string; code: string; name: string; yieldRate: number; processingCost: number; isDefaultPiece: boolean; isActive: boolean; }
interface PackRow { id: string; ingredientId: string; processSpecId: string; code: string; name: string; pricingType: PricingType; channel: SaleChannel; specWeight: number; specUnit: 'g' | 'kg' | 'lb' | 'catty'; packLabel: string; packagingFee: number; packWeightLb?: number; isActive: boolean; }
interface SkuRow { id: string; code: string; name: string; alias?: string; ingredientId: string; processSpecId: string; packSpecId: string; productId: string; saleChannel: SaleChannel; isActive: boolean; }

const round2 = (v: number) => Math.round(v * 100) / 100;
const mkId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const unitToLb = (weight: number, unit: 'g' | 'kg' | 'lb' | 'catty') => unit === 'lb' ? weight : unit === 'kg' ? weight * 2.20462 : unit === 'g' ? weight / 453.59237 : (weight * 600) / 453.59237;
const QUOTE_SUFFIX: Record<string, string> = { P0: 'A0', P1: 'B1', P2: 'B2', 'P-1': 'Y1', 'P-2': 'Z2' };

const MaterialFlowPanel: React.FC<Props> = ({ showToast, products, setProducts }) => {
  const [tab, setTab] = useState<StepTab>('raw');
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [methods, setMethods] = useState<GlobalMethod[]>([]);
  const [processRows, setProcessRows] = useState<ProcessRow[]>([]);
  const [packRows, setPackRows] = useState<PackRow[]>([]);
  const [skuRows, setSkuRows] = useState<SkuRow[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<string>>(new Set());
  const [baseDenominator, setBaseDenominator] = useState(0.88);
  const [tierStep, setTierStep] = useState(0.01);
  const [selectedTierForPdf, setSelectedTierForPdf] = useState('P0');
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [feeEditorId, setFeeEditorId] = useState<string | null>(null);
  const [packFeeSelections, setPackFeeSelections] = useState<Record<string, string[]>>({});
  const [newSku, setNewSku] = useState({ packSpecId: '', name: '', alias: '' });
  const [newMethod, setNewMethod] = useState({ code: '', name: '' });
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'lb', supplier: '', cost: 0 });

  const ingredientMap = useMemo(() => new Map(ingredients.map(i => [i.id, i])), [ingredients]);
  const processMap = useMemo(() => new Map(processRows.map(i => [i.id, i])), [processRows]);
  const packMap = useMemo(() => new Map(packRows.map(i => [i.id, i])), [packRows]);
  const tierDefs = useMemo(() => ([{ key: 'P-2', delta: -2 }, { key: 'P-1', delta: -1 }, { key: 'P0', delta: 0 }, { key: 'P1', delta: 1 }, { key: 'P2', delta: 2 }]), []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, methodRes, processRes, packRes, skuRes, cfgRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('processing_types').select('id,code,name,is_active').order('sort_order').order('name'),
        supabase.from('material_process_specs').select('*').order('sort_order').order('name'),
        supabase.from('material_pack_specs').select('*').order('sort_order').order('name'),
        supabase.from('sellable_skus').select('*').order('sort_order').order('name'),
        supabase.from('site_config').select('id,value').in('id', ['cost_items', 'material_flow_price_overrides']),
      ]);
      if (ingRes.error || methodRes.error || processRes.error || packRes.error || skuRes.error || cfgRes.error) throw (ingRes.error || methodRes.error || processRes.error || packRes.error || skuRes.error || cfgRes.error);
      setIngredients((ingRes.data || []).map(mapIngredientRowToIngredient));
      setMethods((methodRes.data || []).map((r: any) => ({ id: r.id, code: r.code || '', name: r.name || '', isActive: r.is_active !== false })));
      setProcessRows((processRes.data || []).map((r: any) => ({ id: r.id, ingredientId: r.ingredient_id, code: r.code, name: r.name, yieldRate: Number(r.yield_rate) || 1, processingCost: Number(r.processing_cost) || 0, isDefaultPiece: !!r.is_default_piece, isActive: r.is_active !== false })));
      setPackRows((packRes.data || []).map((r: any) => ({ id: r.id, ingredientId: r.ingredient_id, processSpecId: r.process_spec_id, code: r.code, name: r.name, pricingType: r.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack', channel: (['retail', 'wholesale', 'both'].includes(r.target_channel) ? r.target_channel : 'wholesale') as SaleChannel, specWeight: Number(r.spec_weight) || 0, specUnit: (['g', 'kg', 'lb', 'catty'].includes(r.spec_unit) ? r.spec_unit : 'g') as any, packLabel: r.pack_label || '', packagingFee: Number(r.packaging_fee) || 0, packWeightLb: r.pack_weight_lb == null ? undefined : Number(r.pack_weight_lb), isActive: r.is_active !== false })));
      setSkuRows((skuRes.data || []).map((r: any) => ({ id: r.id, code: r.code, name: r.name, alias: r.alias || undefined, ingredientId: r.ingredient_id, processSpecId: r.process_spec_id, packSpecId: r.pack_spec_id, productId: r.product_id, saleChannel: (['retail', 'wholesale', 'both'].includes(r.sale_channel) ? r.sale_channel : 'wholesale') as SaleChannel, isActive: r.is_active !== false })));
      const cfgMap = new Map((cfgRes.data || []).map((x: any) => [x.id, x.value]));
      if (Array.isArray(cfgMap.get('cost_items'))) setCostItems(cfgMap.get('cost_items') as CostItem[]);
      if (cfgMap.get('material_flow_price_overrides') && typeof cfgMap.get('material_flow_price_overrides') === 'object') setManualOverrides(cfgMap.get('material_flow_price_overrides') as Record<string, number>);
    } catch (e: any) {
      showToast(`載入失敗: ${e?.message || '未知錯誤'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadAll(); }, [loadAll]);
  useEffect(() => { if (!selectedIngredientId && ingredients.length > 0) setSelectedIngredientId(ingredients[0].id); }, [ingredients, selectedIngredientId]);

  const materials = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients.filter(m => !q || m.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, search]);
  const selectedIngredient = useMemo(() => ingredients.find(x => x.id === selectedIngredientId), [ingredients, selectedIngredientId]);
  const processForMaterial = useMemo(() => processRows.filter(r => r.ingredientId === selectedIngredientId && r.isActive), [processRows, selectedIngredientId]);
  const packForMaterial = useMemo(() => packRows.filter(r => r.ingredientId === selectedIngredientId && r.isActive).filter(r => (channelFilter === 'all' ? true : r.channel === channelFilter || r.channel === 'both')).filter(r => (typeFilter === 'all' ? true : r.pricingType === typeFilter)), [packRows, selectedIngredientId, channelFilter, typeFilter]);
  const filteredSkus = useMemo(() => {
    const q = search.trim().toLowerCase();
    return skuRows.filter(s => s.isActive).filter(s => !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).filter(s => channelFilter === 'all' ? true : s.saleChannel === channelFilter || s.saleChannel === 'both').filter(s => {
      const p = packMap.get(s.packSpecId);
      return typeFilter === 'all' ? true : (p?.pricingType || 'fixed_pack') === typeFilter;
    });
  }, [skuRows, search, channelFilter, typeFilter, packMap]);
  const availablePackRows = useMemo(() => packRows.filter(p => p.isActive), [packRows]);

  const processedCostPerLb = useCallback((ingredientId: string, processId: string) => {
    const ing = ingredientMap.get(ingredientId);
    const proc = processMap.get(processId);
    if (!ing || !proc) return 0;
    const y = proc.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, proc.yieldRate || 1));
    return round2((ing.baseCostPerLb / y) + (proc.processingCost || 0));
  }, [ingredientMap, processMap]);
  const calcTotalCost = useCallback((pack: PackRow) => {
    const processed = processedCostPerLb(pack.ingredientId, pack.processSpecId);
    if (pack.pricingType === 'by_piece') return round2(processed);
    const lb = pack.packWeightLb && pack.packWeightLb > 0 ? pack.packWeightLb : unitToLb(pack.specWeight, pack.specUnit);
    return round2((processed * lb) + pack.packagingFee);
  }, [processedCostPerLb]);
  const tierPrice = useCallback((skuId: string, totalCost: number, delta: number) => {
    const override = manualOverrides[`${skuId}:${delta}`];
    if (override != null) return round2(override);
    const denom = baseDenominator - (delta * tierStep);
    return denom <= 0.01 ? 0 : round2(totalCost / denom);
  }, [manualOverrides, baseDenominator, tierStep]);

  const addIngredient = async () => {
    if (!newIngredient.name.trim()) return showToast('請輸入母料名稱', 'error');
    const row = { id: mkId('ING'), name: newIngredient.name.trim(), unit: newIngredient.unit, supplier: newIngredient.supplier.trim() || null, base_cost_per_lb: Number(newIngredient.cost) || 0, material_type: 'meat' };
    const { data, error } = await supabase.from('ingredients').insert(row).select('*').single();
    if (error) return showToast(`新增失敗: ${error.message}`, 'error');
    const ing = mapIngredientRowToIngredient(data as any);
    setIngredients(prev => [...prev, ing].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedIngredientId(ing.id);
    setNewIngredient({ name: '', unit: 'lb', supplier: '', cost: 0 });
  };
  const saveIngredient = async (ing: Ingredient) => {
    const { error } = await supabase.from('ingredients').update({ name: ing.name, supplier: ing.supplier || null, unit: ing.unit, base_cost_per_lb: ing.baseCostPerLb }).eq('id', ing.id);
    if (error) return showToast(`保存失敗: ${error.message}`, 'error');
  };
  const addMethod = async () => {
    if (!newMethod.name.trim()) return showToast('請輸入加工方式', 'error');
    const code = (newMethod.code || newMethod.name).trim().toLowerCase().replace(/\s+/g, '_');
    const { data, error } = await supabase.from('processing_types').insert({ id: mkId('PT'), code, name: newMethod.name.trim(), surcharge_pork_chicken: 0, surcharge_beef_lamb_seafood: 0, requires_repackaging: false, sort_order: methods.length, is_active: true }).select('id,code,name,is_active').single();
    if (error) return showToast(`新增方式失敗: ${error.message}`, 'error');
    setMethods(prev => [...prev, { id: data.id, code: data.code, name: data.name, isActive: data.is_active !== false }]);
    setNewMethod({ code: '', name: '' });
  };
  const addProcessRow = async (methodId: string) => {
    if (!selectedIngredientId) return showToast('請先選擇母料', 'error');
    const m = methods.find(x => x.id === methodId);
    if (!m) return;
    const isWhole = m.code === 'whole' || m.name === '原件';
    const payload = { id: mkId('PS'), ingredient_id: selectedIngredientId, code: m.code.toUpperCase(), name: m.name, yield_rate: isWhole ? 1 : 0.8, processing_cost: 0, is_default_piece: isWhole, sort_order: processForMaterial.length, is_active: true };
    const { data, error } = await supabase.from('material_process_specs').insert(payload).select('*').single();
    if (error) return showToast(`新增加工失敗: ${error.message}`, 'error');
    setProcessRows(prev => [...prev, { id: data.id, ingredientId: data.ingredient_id, code: data.code, name: data.name, yieldRate: Number(data.yield_rate) || 1, processingCost: Number(data.processing_cost) || 0, isDefaultPiece: !!data.is_default_piece, isActive: data.is_active !== false }]);
  };
  const saveProcessRow = async (row: ProcessRow) => {
    const { error } = await supabase.from('material_process_specs').update({ yield_rate: row.isDefaultPiece ? 1 : Math.max(0.5, Math.min(1, row.yieldRate)), processing_cost: row.processingCost }).eq('id', row.id);
    if (error) showToast(`保存加工失敗: ${error.message}`, 'error');
  };
  const addPackRow = async () => {
    if (!selectedIngredientId || processForMaterial.length === 0) return showToast('請先建立加工列', 'error');
    const firstProcess = processForMaterial[0];
    const payload = { id: mkId('PK'), ingredient_id: selectedIngredientId, process_spec_id: firstProcess.id, code: `PACK_${Date.now().toString().slice(-4)}`, name: `${selectedIngredient?.name || ''} 規格`, pricing_mode: 'fixed_pack', target_channel: 'wholesale', spec_weight: 500, spec_unit: 'g', pack_label: '500g/包', packaging_fee: 0, pack_weight_lb: unitToLb(500, 'g'), is_active: true, sort_order: packForMaterial.length };
    const { data, error } = await supabase.from('material_pack_specs').insert(payload).select('*').single();
    if (error) return showToast(`新增包裝失敗: ${error.message}`, 'error');
    setPackRows(prev => [...prev, { id: data.id, ingredientId: data.ingredient_id, processSpecId: data.process_spec_id, code: data.code, name: data.name, pricingType: data.pricing_mode === 'by_piece' ? 'by_piece' : 'fixed_pack', channel: (['retail', 'wholesale', 'both'].includes(data.target_channel) ? data.target_channel : 'wholesale') as SaleChannel, specWeight: Number(data.spec_weight) || 0, specUnit: (['g', 'kg', 'lb', 'catty'].includes(data.spec_unit) ? data.spec_unit : 'g') as any, packLabel: data.pack_label || '', packagingFee: Number(data.packaging_fee) || 0, packWeightLb: data.pack_weight_lb == null ? undefined : Number(data.pack_weight_lb), isActive: data.is_active !== false }]);
  };
  const savePackRow = async (row: PackRow) => {
    const lb = row.pricingType === 'fixed_pack' ? (row.packWeightLb || unitToLb(row.specWeight, row.specUnit)) : null;
    const { error } = await supabase.from('material_pack_specs').update({ process_spec_id: row.processSpecId, name: row.name, pricing_mode: row.pricingType, target_channel: row.channel, spec_weight: row.specWeight, spec_unit: row.specUnit, pack_label: row.packLabel, packaging_fee: row.packagingFee, pack_weight_lb: lb }).eq('id', row.id);
    if (error) showToast(`保存包裝失敗: ${error.message}`, 'error');
  };
  const saveOverrides = async () => {
    const { error } = await supabase.from('site_config').upsert({ id: 'material_flow_price_overrides', value: manualOverrides });
    if (error) return showToast(`保存控價失敗: ${error.message}`, 'error');
  };
  const addSku = async () => {
    const pack = packMap.get(newSku.packSpecId);
    if (!pack) return showToast('請先選擇包裝規格', 'error');
    const proc = processMap.get(pack.processSpecId);
    const ing = ingredientMap.get(pack.ingredientId);
    if (!proc || !ing) return showToast('關聯資料不完整', 'error');
    if (!newSku.name.trim()) return showToast('請輸入 SKU 名稱', 'error');
    const totalCost = calcTotalCost(pack);
    const p0 = baseDenominator > 0 ? round2(totalCost / baseDenominator) : totalCost;
    const productId = mkId('P');
    const packLb = pack.packWeightLb && pack.packWeightLb > 0 ? pack.packWeightLb : unitToLb(pack.specWeight, pack.specUnit);
    const packagingCostPerLb = pack.pricingType === 'fixed_pack' && packLb > 0 ? round2(pack.packagingFee / packLb) : 0;
    const variantLabel = `${proc.name}${pack.packLabel ? ` ${pack.packLabel}` : ''}`.trim();
    const productPayload = { id: productId, name: newSku.name.trim(), categories: [], price: p0, member_price: p0, stock: 0, track_inventory: true, tags: ['sellable_sku'], image: '📦', ingredient_id: ing.id, parent_ingredient_id: ing.id, processing_type_id: null, yield_rate: proc.yieldRate, processing_cost: proc.processingCost, packaging_cost: packagingCostPerLb, misc_cost: 0, sale_channel: pack.channel, product_type: 'processed', pack_size: pack.packLabel || null, pack_weight_lb: pack.pricingType === 'fixed_pack' ? packLb : null, group_id: null, variant_label: variantLabel, pricing_mode: pack.pricingType, processing_spec: proc.name };
    const { error: prodErr } = await supabase.from('products').insert(productPayload);
    if (prodErr) return showToast(`新增商品失敗: ${prodErr.message}`, 'error');
    const skuPayload = { id: mkId('SKU'), code: `${newSku.name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 28)}_${Date.now().toString().slice(-4)}`, name: newSku.name.trim(), alias: newSku.alias.trim() || null, ingredient_id: ing.id, process_spec_id: proc.id, pack_spec_id: pack.id, product_id: productId, sale_channel: pack.channel, sort_order: skuRows.length, is_active: true };
    const { data, error } = await supabase.from('sellable_skus').insert(skuPayload).select('*').single();
    if (error) return showToast(`新增SKU失敗: ${error.message}`, 'error');
    setSkuRows(prev => [...prev, { id: data.id, code: data.code, name: data.name, alias: data.alias || undefined, ingredientId: data.ingredient_id, processSpecId: data.process_spec_id, packSpecId: data.pack_spec_id, productId: data.product_id, saleChannel: data.sale_channel, isActive: data.is_active !== false }]);
    setProducts(prev => [...prev, { id: productPayload.id, name: productPayload.name, categories: [], price: productPayload.price, memberPrice: productPayload.member_price, stock: 0, trackInventory: true, tags: ['sellable_sku'], image: '📦', ingredientId: ing.id, parentIngredientId: ing.id, yieldRate: proc.yieldRate, processingCost: proc.processingCost, packagingCost: packagingCostPerLb, miscCost: 0, saleChannel: pack.channel, productType: 'processed', packSize: pack.packLabel, packWeightLb: productPayload.pack_weight_lb || undefined, variantLabel, pricingMode: pack.pricingType, processingSpec: proc.name }]);
    setNewSku({ packSpecId: '', name: '', alias: '' });
  };
  const exportQuotePdf = () => {
    const chosen = filteredSkus.filter(s => selectedSkuIds.has(s.id));
    if (chosen.length === 0) return showToast('請先勾選SKU', 'error');
    const tier = tierDefs.find(t => t.key === selectedTierForPdf);
    if (!tier) return;
    const refNo = `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}-${QUOTE_SUFFIX[selectedTierForPdf] || 'A0'}`;
    const rows = chosen.map((s, idx) => {
      const p = packMap.get(s.packSpecId);
      const c = p ? calcTotalCost(p) : 0;
      const price = tierPrice(s.id, c, tier.delta);
      return `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0">${idx + 1}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${s.name}</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">$${price.toFixed(2)}</td></tr>`;
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
        <div><h3 className="font-black text-sm text-slate-900">4-Step Material Flow Workstation</h3><p className="text-[11px] font-bold text-slate-500">母料 → 加工 → 包裝 → SKU 控價（即時連動）</p></div>
        <button onClick={() => void loadAll()} className="ml-auto px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 flex items-center gap-1.5">{loading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />} Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('raw')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Layers size={14} />1. 母料</button>
        <button onClick={() => setTab('process')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'process' ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Scissors size={14} />2. 加工</button>
        <button onClick={() => setTab('pack')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'pack' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Package size={14} />3. 包裝</button>
        <button onClick={() => setTab('sku')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ${tab === 'sku' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}><Grid3X3 size={14} />4. SKU 控價</button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋母料/SKU名稱..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold" /></div>
        {(['all', 'wholesale', 'retail'] as ChannelFilter[]).map(x => <button key={x} onClick={() => setChannelFilter(x)} className={`px-3 py-2 rounded-lg text-[11px] font-black ${channelFilter === x ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>{x === 'all' ? '全部' : x === 'wholesale' ? '批發' : '零售'}</button>)}
        {(['all', 'fixed_pack', 'by_piece'] as TypeFilter[]).map(x => <button key={x} onClick={() => setTypeFilter(x)} className={`px-3 py-2 rounded-lg text-[11px] font-black ${typeFilter === x ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-500'}`}>{x === 'all' ? '全部類型' : x === 'fixed_pack' ? '定額' : '抄碼'}</button>)}
        {tab === 'raw' && <button onClick={() => setShowMethodModal(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1"><Settings2 size={12} />管理加工方式</button>}
        {tab === 'raw' && <button onClick={() => showToast('批量匯入入口已啟用', 'success')} className="px-3 py-2 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 flex items-center gap-1"><Upload size={12} />批量匯入</button>}
      </div>

      {tab === 'raw' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-3 overflow-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">母料</th><th className="px-2 py-2 text-left">供應商</th><th className="px-2 py-2 text-center">單位</th><th className="px-2 py-2 text-right">成本</th><th className="px-2 py-2 text-right">保存</th></tr></thead>
            <tbody>
              <tr className="border-t border-slate-100 bg-blue-50/40"><td className="px-2 py-1.5"><input value={newIngredient.name} onChange={e => setNewIngredient(v => ({ ...v, name: e.target.value }))} placeholder="新增母料" className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td><td className="px-2 py-1.5"><input value={newIngredient.supplier} onChange={e => setNewIngredient(v => ({ ...v, supplier: e.target.value }))} placeholder="供應商" className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td><td className="px-2 py-1.5 text-center"><input value={newIngredient.unit} onChange={e => setNewIngredient(v => ({ ...v, unit: e.target.value }))} className="w-16 p-1.5 border border-slate-200 rounded text-center font-bold mx-auto" /></td><td className="px-2 py-1.5"><input type="number" value={newIngredient.cost} onChange={e => setNewIngredient(v => ({ ...v, cost: Number(e.target.value) || 0 }))} className="w-24 p-1.5 border border-slate-200 rounded text-right font-bold ml-auto block" /></td><td className="px-2 py-1.5 text-right"><button onClick={() => void addIngredient()} className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-black">新增</button></td></tr>
              {materials.map(ing => <tr key={ing.id} className="border-t border-slate-100"><td className="px-2 py-1.5"><input value={ing.name} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, name: e.target.value } : x))} className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td><td className="px-2 py-1.5"><input value={ing.supplier || ''} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, supplier: e.target.value } : x))} className="w-full p-1.5 border border-slate-200 rounded font-bold" /></td><td className="px-2 py-1.5 text-center"><input value={ing.unit} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, unit: e.target.value } : x))} className="w-16 p-1.5 border border-slate-200 rounded text-center font-bold mx-auto" /></td><td className="px-2 py-1.5"><input type="number" value={ing.baseCostPerLb} onChange={e => setIngredients(prev => prev.map(x => x.id === ing.id ? { ...x, baseCostPerLb: Number(e.target.value) || 0 } : x))} className="w-24 p-1.5 border border-slate-200 rounded text-right font-bold ml-auto block" /></td><td className="px-2 py-1.5 text-right"><button onClick={() => void saveIngredient(ing)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button></td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {(tab === 'process' || tab === 'pack') && (
        <div className="grid grid-cols-1 xl:grid-cols-[30%_70%] gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3"><p className="text-[11px] text-slate-500 font-black mb-2">母料 Master Sidebar</p><div className="space-y-1 max-h-[34rem] overflow-auto">{materials.map(m => <button key={m.id} onClick={() => setSelectedIngredientId(m.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${selectedIngredientId === m.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>{m.name}</button>)}</div></div>
          <div className="bg-white border border-slate-100 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2"><h4 className="font-black text-sm text-slate-900">{selectedIngredient?.name || '請先選母料'}</h4>{tab === 'process' ? <select onChange={e => e.target.value && void addProcessRow(e.target.value)} defaultValue="" className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold"><option value="">+ 新增加工方式</option>{methods.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select> : <button onClick={() => void addPackRow()} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center gap-1"><Plus size={12} />新增加包裝</button>}</div>
            {tab === 'process' && <div className="overflow-auto max-h-[33rem] border border-slate-100 rounded-xl"><table className="w-full text-xs"><thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">加工方式</th><th className="px-2 py-2 text-right">Yield</th><th className="px-2 py-2 text-right">加工費</th><th className="px-2 py-2 text-right">processed_cost</th><th className="px-2 py-2 text-right">保存</th></tr></thead><tbody>{processForMaterial.map(r => { const c = processedCostPerLb(r.ingredientId, r.id); return <tr key={r.id} className="border-t border-slate-100"><td className="px-2 py-1.5 font-bold">{r.name}</td><td className="px-2 py-1.5"><input disabled={r.isDefaultPiece} type="number" min="0.5" max="1" step="0.01" value={r.yieldRate} onChange={e => setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, yieldRate: Number(e.target.value) || 1 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold ml-auto block disabled:opacity-50" /></td><td className="px-2 py-1.5"><input type="number" step="0.01" value={r.processingCost} onChange={e => setProcessRows(prev => prev.map(x => x.id === r.id ? { ...x, processingCost: Number(e.target.value) || 0 } : x))} className="w-20 p-1 border border-slate-200 rounded text-right font-bold ml-auto block" /></td><td className="px-2 py-1.5 text-right font-black text-amber-700">${c.toFixed(2)}</td><td className="px-2 py-1.5 text-right"><button onClick={() => void saveProcessRow(r)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button></td></tr>; })}</tbody></table></div>}
            {tab === 'pack' && <div className="overflow-auto max-h-[33rem] border border-slate-100 rounded-xl"><table className="w-full text-xs"><thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">規格名</th><th className="px-2 py-2 text-left">加工</th><th className="px-2 py-2">類型</th><th className="px-2 py-2">通路</th><th className="px-2 py-2 text-right">包裝費</th><th className="px-2 py-2 text-right">Total Cost</th><th className="px-2 py-2 text-right">保存</th></tr></thead><tbody>{packForMaterial.map(r => { const total = calcTotalCost(r); const feeIds = packFeeSelections[r.id] || []; return <tr key={r.id} className="border-t border-slate-100"><td className="px-2 py-1.5"><input value={r.name} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, name: e.target.value } : x))} className="w-full p-1 border border-slate-200 rounded font-bold" /><div className="mt-1 flex gap-1"><input type="number" value={r.specWeight} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specWeight: Number(e.target.value) || 0 } : x))} className="w-16 p-1 border border-slate-200 rounded text-right font-bold" /><select value={r.specUnit} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, specUnit: e.target.value as any } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="g">g</option><option value="kg">kg</option><option value="lb">lb</option><option value="catty">斤</option></select></div></td><td className="px-2 py-1.5"><select value={r.processSpecId} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, processSpecId: e.target.value } : x))} className="p-1 border border-slate-200 rounded font-bold">{processForMaterial.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td className="px-2 py-1.5 text-center"><button onClick={() => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, pricingType: x.pricingType === 'fixed_pack' ? 'by_piece' : 'fixed_pack' } : x))} className="px-2 py-1 rounded border border-slate-200 font-black">{r.pricingType === 'fixed_pack' ? '定額' : '抄碼'}</button></td><td className="px-2 py-1.5 text-center"><select value={r.channel} onChange={e => setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, channel: e.target.value as SaleChannel } : x))} className="p-1 border border-slate-200 rounded font-bold"><option value="wholesale">批發</option><option value="retail">零售</option><option value="both">全部</option></select></td><td className="px-2 py-1.5 text-right"><button onClick={() => setFeeEditorId(feeEditorId === r.id ? null : r.id)} className="px-2 py-1 rounded border border-slate-200 text-[10px] font-black">費用</button><div className="font-black mt-1">${r.packagingFee.toFixed(2)}</div>{feeEditorId === r.id && <div className="mt-1 p-2 border border-slate-200 rounded-lg bg-white text-left">{costItems.map(ci => { const checked = feeIds.includes(ci.id); return <button key={ci.id} onClick={() => { const nextIds = checked ? feeIds.filter(id => id !== ci.id) : [...feeIds, ci.id]; setPackFeeSelections(prev => ({ ...prev, [r.id]: nextIds })); const totalFee = nextIds.reduce((sum, id) => sum + (costItems.find(x => x.id === id)?.defaultPrice || 0), 0); setPackRows(prev => prev.map(x => x.id === r.id ? { ...x, packagingFee: round2(totalFee) } : x)); }} className={`mr-1 mb-1 px-2 py-1 rounded text-[10px] font-black border ${checked ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{ci.name}</button>; })}</div>}</td><td className="px-2 py-1.5 text-right font-black text-amber-700">${total.toFixed(2)}</td><td className="px-2 py-1.5 text-right"><button onClick={() => void savePackRow(r)} className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black">保存</button></td></tr>; })}</tbody></table></div>}
          </div>
        </div>
      )}

      {tab === 'sku' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-2">
            <select value={newSku.packSpecId} onChange={e => setNewSku(v => ({ ...v, packSpecId: e.target.value }))} className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[260px]"><option value="">選擇包裝規格</option>{availablePackRows.map(p => <option key={p.id} value={p.id}>{p.name} · {p.channel} · {p.pricingType === 'fixed_pack' ? '定額' : '抄碼'}</option>)}</select>
            <input value={newSku.name} onChange={e => setNewSku(v => ({ ...v, name: e.target.value }))} placeholder="SKU 名稱" className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[180px]" />
            <input value={newSku.alias} onChange={e => setNewSku(v => ({ ...v, alias: e.target.value }))} placeholder="Alias(選填)" className="p-2 border border-slate-200 rounded-lg text-xs font-bold min-w-[140px]" />
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
              <thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2">#</th><th className="px-2 py-2 text-left">SKU</th><th className="px-2 py-2 text-left">通路</th><th className="px-2 py-2 text-right">成本</th>{tierDefs.map(t => <th key={t.key} className="px-2 py-2 text-right">{t.key}</th>)}</tr></thead>
              <tbody>{filteredSkus.map(s => { const p = packMap.get(s.packSpecId); const cost = p ? calcTotalCost(p) : 0; return <tr key={s.id} className="border-t border-slate-100"><td className="px-2 py-1.5 text-center"><input type="checkbox" checked={selectedSkuIds.has(s.id)} onChange={e => setSelectedSkuIds(prev => { const n = new Set(prev); if (e.target.checked) n.add(s.id); else n.delete(s.id); return n; })} /></td><td className="px-2 py-1.5"><div className="font-black">{s.name}</div><div className="text-[10px] text-slate-400">{s.code}</div></td><td className="px-2 py-1.5">{s.saleChannel}</td><td className="px-2 py-1.5 text-right font-black text-amber-700">${cost.toFixed(2)}</td>{tierDefs.map(t => { const price = tierPrice(s.id, cost, t.delta); const margin = round2(price - cost); const key = `${s.id}:${t.delta}`; const bad = margin < 0; return <td key={t.key} className="px-2 py-1.5 text-right"><div className={`font-black ${bad ? 'text-rose-600' : 'text-emerald-600'}`}>${price.toFixed(2)} ({margin >= 0 ? '+' : ''}{margin.toFixed(2)})</div><input type="number" step="0.01" value={manualOverrides[key] ?? ''} onChange={e => setManualOverrides(prev => { const n = { ...prev }; if (!e.target.value) delete n[key]; else n[key] = Number(e.target.value) || 0; return n; })} className="w-20 mt-1 p-1 border border-slate-200 rounded text-[10px] font-bold text-right" /></td>; })}</tr>; })}</tbody>
            </table>
          </div>
        </div>
      )}

      {showMethodModal && <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-end"><div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-4"><div className="flex items-center justify-between"><h4 className="font-black text-slate-900">加工方法表</h4><button onClick={() => setShowMethodModal(false)} className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold">關閉</button></div><div className="grid grid-cols-2 gap-2 mt-3"><input value={newMethod.code} onChange={e => setNewMethod(v => ({ ...v, code: e.target.value }))} placeholder="code" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" /><input value={newMethod.name} onChange={e => setNewMethod(v => ({ ...v, name: e.target.value }))} placeholder="name" className="p-2 border border-slate-200 rounded-lg text-sm font-bold" /></div><button onClick={() => void addMethod()} className="mt-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-black">新增方式</button><div className="mt-3 border border-slate-100 rounded-xl overflow-auto max-h-[70vh]"><table className="w-full text-xs"><thead><tr className="bg-slate-50 text-slate-500"><th className="px-2 py-2 text-left">Code</th><th className="px-2 py-2 text-left">Name</th></tr></thead><tbody>{methods.filter(m => m.isActive).map(m => <tr key={m.id} className="border-t border-slate-100"><td className="px-2 py-1.5 font-mono">{m.code}</td><td className="px-2 py-1.5 font-bold">{m.name}</td></tr>)}</tbody></table></div></div></div>}
      {showTierModal && <div className="fixed inset-0 bg-slate-900/35 z-50 flex items-center justify-center"><div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-4"><h4 className="font-black text-slate-900">請選擇導出的價格梯度 (P-2 至 P2)</h4><div className="grid grid-cols-5 gap-1 mt-3">{tierDefs.map(t => <button key={t.key} onClick={() => setSelectedTierForPdf(t.key)} className={`px-2 py-2 rounded-lg text-xs font-black ${selectedTierForPdf === t.key ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>{t.key}</button>)}</div><div className="mt-3 flex justify-end gap-2"><button onClick={() => setShowTierModal(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-black text-slate-600">取消</button><button onClick={() => { setShowTierModal(false); exportQuotePdf(); }} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-black">產生 PDF</button></div></div></div>}
    </div>
  );
};

export default MaterialFlowPanel;
