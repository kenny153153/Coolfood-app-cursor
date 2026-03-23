import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package, Layers, ClipboardList, Plus, Edit, Trash2,
  Save, X, RefreshCw, Check, Eye, Send,
  CheckCircle, XCircle, BarChart3,
  AlertTriangle, TrendingUp, BookOpen,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import type {
  Product, Ingredient,
  SaleChannel,
  PackagingMaterial, ProductionOrder, ProductionOrderStatus,
  ProductionOrderInput, ProductionOrderOutput,
  ProductBomEntry,
} from './types';

// ─── Props ──────────────────────────────────────────────────────

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
  ingredients: Ingredient[];
}

type SubTab = 'orders' | 'bom' | 'packaging' | 'yield_report';

const STATUS_META: Record<ProductionOrderStatus, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-slate-500', bg: 'bg-slate-100' },
  pending_review: { label: '待審核', color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: '已批准', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rejected: { label: '已退回', color: 'text-rose-600', bg: 'bg-rose-50' },
};

// ─── Component ──────────────────────────────────────────────────

const ProductionPanel: React.FC<Props> = ({
  showToast, products, ingredients,
}) => {
  const [subTab, setSubTab] = useState<SubTab>('orders');

  // ── Production Orders state ──
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<ProductionOrderStatus | 'all'>('all');
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);

  // ── Packaging Materials state ──
  const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterial[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState<(Partial<PackagingMaterial> & { isNew?: boolean }) | null>(null);
  const [pkgSaving, setPkgSaving] = useState(false);

  // ── BOM (配方表) state ──
  const [bomEntries, setBomEntries] = useState<ProductBomEntry[]>([]);
  const [bomLoading, setBomLoading] = useState(true);
  const [editingBomProductId, setEditingBomProductId] = useState<string | null>(null);
  const [editingBomEntries, setEditingBomEntries] = useState<ProductBomEntry[]>([]);
  const [bomSaving, setBomSaving] = useState(false);
  const [bomSearch, setBomSearch] = useState('');

  // (Cost overview moved to WarehousePanel)

  // ── Review modal ──
  const [reviewOrder, setReviewOrder] = useState<ProductionOrder | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // ─── Data loading ─────────────────────────────────────────────

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('production_orders')
      .select('*')
      .order('production_date', { ascending: false });
    if (error) { console.warn('Failed to load production orders', error); setOrdersLoading(false); return; }

    const orderList: ProductionOrder[] = (data || []).map((r: any) => ({
      id: r.id,
      orderNumber: r.order_number,
      status: r.status as ProductionOrderStatus,
      productionDate: r.production_date,
      createdBy: r.created_by,
      submittedAt: r.submitted_at,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at,
      reviewNotes: r.review_notes,
      totalInputWeightKg: Number(r.total_input_weight_kg) || 0,
      totalOutputWeightKg: Number(r.total_output_weight_kg) || 0,
      yieldRate: Number(r.yield_rate) || 0,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    // Load inputs/outputs for all orders
    const orderIds = orderList.map(o => o.id);
    if (orderIds.length > 0) {
      const [inputsRes, outputsRes] = await Promise.all([
        supabase.from('production_order_inputs').select('*').in('production_order_id', orderIds),
        supabase.from('production_order_outputs').select('*').in('production_order_id', orderIds),
      ]);
      const inputsMap: Record<string, ProductionOrderInput[]> = {};
      const outputsMap: Record<string, ProductionOrderOutput[]> = {};
      (inputsRes.data || []).forEach((r: any) => {
        const inp: ProductionOrderInput = {
          id: r.id, productionOrderId: r.production_order_id,
          ingredientId: r.ingredient_id, ingredientName: r.ingredient_name,
          quantity: Number(r.quantity), unit: r.unit,
          weightPerUnitKg: Number(r.weight_per_unit_kg), totalWeightKg: Number(r.total_weight_kg),
          unitCost: Number(r.unit_cost), totalCost: Number(r.total_cost), notes: r.notes,
        };
        if (!inputsMap[inp.productionOrderId]) inputsMap[inp.productionOrderId] = [];
        inputsMap[inp.productionOrderId].push(inp);
      });
      (outputsRes.data || []).forEach((r: any) => {
        const out: ProductionOrderOutput = {
          id: r.id, productionOrderId: r.production_order_id,
          productName: r.product_name, productId: r.product_id,
          saleChannel: r.sale_channel as SaleChannel,
          quantity: Number(r.quantity), unitWeightKg: Number(r.unit_weight_kg),
          totalWeightKg: Number(r.total_weight_kg),
          packagingType: r.packaging_type, packagingMaterialId: r.packaging_material_id,
          packagingQuantity: Number(r.packaging_quantity), packagingCostTotal: Number(r.packaging_cost_total),
          estimatedUnitCost: Number(r.estimated_unit_cost), notes: r.notes,
        };
        if (!outputsMap[out.productionOrderId]) outputsMap[out.productionOrderId] = [];
        outputsMap[out.productionOrderId].push(out);
      });
      orderList.forEach(o => {
        o.inputs = inputsMap[o.id] || [];
        o.outputs = outputsMap[o.id] || [];
      });
    }
    setOrders(orderList);
    setOrdersLoading(false);
  }, []);

  const loadPackagingMaterials = useCallback(async () => {
    setPkgLoading(true);
    const { data, error } = await supabase
      .from('packaging_materials')
      .select('*')
      .order('name');
    if (error) { console.warn('Failed to load packaging materials', error); setPkgLoading(false); return; }
    setPackagingMaterials((data || []).map((r: any) => ({
      id: r.id, name: r.name, nameEn: r.name_en,
      unit: r.unit, costPerUnit: Number(r.cost_per_unit),
      stockQuantity: Number(r.stock_quantity), minStockAlert: Number(r.min_stock_alert),
      notes: r.notes, isActive: r.is_active, createdAt: r.created_at, updatedAt: r.updated_at,
    })));
    setPkgLoading(false);
  }, []);

  const loadBom = useCallback(async () => {
    setBomLoading(true);
    const { data, error } = await supabase.from('product_bom').select('*');
    if (error) { console.warn('Failed to load BOM', error); setBomLoading(false); return; }
    setBomEntries((data || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      ingredientId: r.ingredient_id,
      quantityPerUnit: Number(r.quantity_per_unit) || 0,
      unit: r.unit || 'kg',
      isPrimary: r.is_primary || false,
      expectedYieldRate: r.expected_yield_rate ? Number(r.expected_yield_rate) : undefined,
      notes: r.notes,
      createdAt: r.created_at,
    })));
    setBomLoading(false);
  }, []);

  useEffect(() => { loadOrders(); loadPackagingMaterials(); loadBom(); }, [loadOrders, loadPackagingMaterials, loadBom]);

  // ─── Generate order number ────────────────────────────────────

  const generateOrderNumber = () => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const seq = String(orders.filter(o => o.orderNumber.includes(dateStr)).length + 1).padStart(3, '0');
    return `PO-${dateStr}-${seq}`;
  };

  // ─── Create new order ─────────────────────────────────────────

  const handleNewOrder = () => {
    setEditingOrder({
      id: '', orderNumber: generateOrderNumber(), status: 'draft',
      productionDate: new Date().toISOString().split('T')[0],
      totalInputWeightKg: 0, totalOutputWeightKg: 0, yieldRate: 0,
      inputs: [{ id: `inp-${Date.now()}`, productionOrderId: '', ingredientId: '', ingredientName: '', quantity: 0, unit: 'box', weightPerUnitKg: 0, totalWeightKg: 0, unitCost: 0, totalCost: 0 }],
      outputs: [{ id: `out-${Date.now()}`, productionOrderId: '', productName: '', saleChannel: 'retail', quantity: 0, unitWeightKg: 0, totalWeightKg: 0, packagingQuantity: 0, packagingCostTotal: 0, estimatedUnitCost: 0 }],
    });
  };

  // ─── Recalculate totals ───────────────────────────────────────

  const recalcOrder = (order: ProductionOrder): ProductionOrder => {
    const inputs = (order.inputs || []).map(inp => ({
      ...inp,
      totalWeightKg: inp.quantity * inp.weightPerUnitKg,
      totalCost: inp.quantity * inp.unitCost,
    }));
    const totalInputWeight = inputs.reduce((s, i) => s + i.totalWeightKg, 0);
    const totalInputCost = inputs.reduce((s, i) => s + i.totalCost, 0);

    const outputs = (order.outputs || []).map(out => {
      const totalW = out.quantity * out.unitWeightKg;
      const pkg = packagingMaterials.find(p => p.id === out.packagingMaterialId);
      const pkgCost = pkg ? out.packagingQuantity * pkg.costPerUnit : 0;
      return { ...out, totalWeightKg: totalW, packagingCostTotal: pkgCost };
    });
    const totalOutputWeight = outputs.reduce((s, o) => s + o.totalWeightKg, 0);
    const yieldRate = totalInputWeight > 0 ? (totalOutputWeight / totalInputWeight) * 100 : 0;

    // Distribute material cost proportionally by weight
    const outputsWithCost = outputs.map(out => {
      const proportion = totalOutputWeight > 0 ? out.totalWeightKg / totalOutputWeight : 0;
      const materialCostShare = totalInputCost * proportion;
      const unitCost = out.quantity > 0 ? (materialCostShare + out.packagingCostTotal) / out.quantity : 0;
      return { ...out, estimatedUnitCost: Math.round(unitCost * 100) / 100 };
    });

    return {
      ...order,
      inputs,
      outputs: outputsWithCost,
      totalInputWeightKg: Math.round(totalInputWeight * 1000) / 1000,
      totalOutputWeightKg: Math.round(totalOutputWeight * 1000) / 1000,
      yieldRate: Math.round(yieldRate * 10) / 10,
    };
  };

  // ─── Save order ───────────────────────────────────────────────

  const handleSaveOrder = async (submitForReview = false) => {
    if (!editingOrder) return;
    const order = recalcOrder(editingOrder);
    if (!order.inputs?.length) { showToast('請添加至少一項原材料', 'error'); return; }
    if (!order.outputs?.length) { showToast('請添加至少一項成品', 'error'); return; }

    setOrderSaving(true);
    const status = submitForReview ? 'pending_review' : 'draft';
    const payload = {
      order_number: order.orderNumber,
      status,
      production_date: order.productionDate,
      created_by: order.createdBy || null,
      submitted_at: submitForReview ? new Date().toISOString() : order.submittedAt || null,
      total_input_weight_kg: order.totalInputWeightKg,
      total_output_weight_kg: order.totalOutputWeightKg,
      yield_rate: order.yieldRate,
      notes: order.notes || null,
    };

    let orderId = order.id;
    if (!orderId) {
      const { data, error } = await supabase.from('production_orders').insert(payload).select('id').single();
      if (error || !data) { showToast(`儲存失敗：${error?.message}`, 'error'); setOrderSaving(false); return; }
      orderId = data.id;
    } else {
      const { error } = await supabase.from('production_orders').update(payload).eq('id', orderId);
      if (error) { showToast(`儲存失敗：${error.message}`, 'error'); setOrderSaving(false); return; }
      await supabase.from('production_order_inputs').delete().eq('production_order_id', orderId);
      await supabase.from('production_order_outputs').delete().eq('production_order_id', orderId);
    }

    // Insert inputs
    if (order.inputs && order.inputs.length > 0) {
      const inputRows = order.inputs.map(inp => ({
        production_order_id: orderId,
        ingredient_id: inp.ingredientId || null,
        ingredient_name: inp.ingredientName,
        quantity: inp.quantity,
        unit: inp.unit,
        weight_per_unit_kg: inp.weightPerUnitKg,
        total_weight_kg: inp.totalWeightKg,
        unit_cost: inp.unitCost,
        total_cost: inp.totalCost,
        notes: inp.notes || null,
      }));
      await supabase.from('production_order_inputs').insert(inputRows);
    }

    // Insert outputs
    if (order.outputs && order.outputs.length > 0) {
      const outputRows = order.outputs.map(out => ({
        production_order_id: orderId,
        product_name: out.productName,
        product_id: out.productId || null,
        sale_channel: out.saleChannel,
        quantity: out.quantity,
        unit_weight_kg: out.unitWeightKg,
        total_weight_kg: out.totalWeightKg,
        packaging_type: out.packagingType || null,
        packaging_material_id: out.packagingMaterialId || null,
        packaging_quantity: out.packagingQuantity,
        packaging_cost_total: out.packagingCostTotal,
        estimated_unit_cost: out.estimatedUnitCost,
        notes: out.notes || null,
      }));
      await supabase.from('production_order_outputs').insert(outputRows);
    }

    showToast(submitForReview ? '已提交審核' : '草稿已儲存');
    setEditingOrder(null);
    setOrderSaving(false);
    loadOrders();
  };

  // ─── Review order (approve / reject) ──────────────────────────

  const handleReviewOrder = async (action: 'approved' | 'rejected') => {
    if (!reviewOrder) return;
    const { error } = await supabase.from('production_orders').update({
      status: action,
      reviewed_by: 'admin',
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    }).eq('id', reviewOrder.id);
    if (error) { showToast(`操作失敗：${error.message}`, 'error'); return; }

    if (action === 'approved') {
      // Deduct packaging material stock
      for (const out of (reviewOrder.outputs || [])) {
        if (out.packagingMaterialId && out.packagingQuantity > 0) {
          await supabase.rpc('decrement_stock', { row_id: out.packagingMaterialId, qty: out.packagingQuantity })
            .then(() => {})
            .catch(() => {
              // Fallback: manual update
              const pkg = packagingMaterials.find(p => p.id === out.packagingMaterialId);
              if (pkg) {
                supabase.from('packaging_materials').update({
                  stock_quantity: Math.max(0, pkg.stockQuantity - out.packagingQuantity),
                }).eq('id', pkg.id);
              }
            });
        }
      }
    }

    showToast(action === 'approved' ? '已批准，庫存已更新' : '已退回');
    setReviewOrder(null);
    setReviewNotes('');
    loadOrders();
    loadPackagingMaterials();
  };

  // ─── Packaging materials CRUD ─────────────────────────────────

  const handleSavePkg = async () => {
    if (!editingPkg || !editingPkg.name?.trim()) { showToast('請輸入名稱', 'error'); return; }
    setPkgSaving(true);
    const payload = {
      name: editingPkg.name.trim(),
      name_en: editingPkg.nameEn || null,
      unit: editingPkg.unit || 'pc',
      cost_per_unit: editingPkg.costPerUnit || 0,
      stock_quantity: editingPkg.stockQuantity || 0,
      min_stock_alert: editingPkg.minStockAlert || 0,
      notes: editingPkg.notes || null,
      is_active: editingPkg.isActive !== false,
    };
    if (editingPkg.isNew) {
      const { error } = await supabase.from('packaging_materials').insert(payload);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setPkgSaving(false); return; }
      showToast('包裝材料已新增');
    } else {
      const { error } = await supabase.from('packaging_materials').update(payload).eq('id', editingPkg.id);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setPkgSaving(false); return; }
      showToast('包裝材料已更新');
    }
    setEditingPkg(null);
    setPkgSaving(false);
    loadPackagingMaterials();
  };

  const handleDeletePkg = async (id: string) => {
    if (!confirm('確定刪除此包裝材料？')) return;
    const { error } = await supabase.from('packaging_materials').delete().eq('id', id);
    if (error) showToast(`失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadPackagingMaterials(); }
  };

  // ─── Yield report data ────────────────────────────────────────

  const yieldReportData = useMemo(() => {
    const approvedOrders = orders.filter(o => o.status === 'approved');
    const byIngredient: Record<string, { name: string; orders: ProductionOrder[]; avgYield: number; totalInputKg: number; totalOutputKg: number }> = {};
    approvedOrders.forEach(o => {
      (o.inputs || []).forEach(inp => {
        const key = inp.ingredientName || '未知';
        if (!byIngredient[key]) byIngredient[key] = { name: key, orders: [], avgYield: 0, totalInputKg: 0, totalOutputKg: 0 };
        if (!byIngredient[key].orders.find(x => x.id === o.id)) {
          byIngredient[key].orders.push(o);
          byIngredient[key].totalInputKg += o.totalInputWeightKg;
          byIngredient[key].totalOutputKg += o.totalOutputWeightKg;
        }
      });
    });
    Object.values(byIngredient).forEach(item => {
      item.avgYield = item.totalInputKg > 0 ? (item.totalOutputKg / item.totalInputKg) * 100 : 0;
    });
    return Object.values(byIngredient).sort((a, b) => b.orders.length - a.orders.length);
  }, [orders]);

  // ─── Filtered orders ──────────────────────────────────────────

  const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.status === orderStatusFilter);

  // ─── BOM-derived data ──────────────────────────────────────────

  const productsWithBom = useMemo(() => {
    const ids = new Set(bomEntries.map(b => b.productId));
    return products.filter(p => ids.has(p.id));
  }, [bomEntries, products]);

  const allowedIngredients = useMemo(() => {
    const selectedProductIds = (editingOrder?.outputs || [])
      .map(o => o.productId)
      .filter(Boolean) as string[];
    if (selectedProductIds.length === 0) return [];
    const allowedIds = new Set(
      bomEntries
        .filter(b => selectedProductIds.includes(b.productId))
        .map(b => b.ingredientId)
    );
    return ingredients.filter(i => allowedIds.has(i.id));
  }, [editingOrder?.outputs, bomEntries, ingredients]);

  // ─── BOM CRUD ──────────────────────────────────────────────────

  const openBomEditor = (productId: string) => {
    const entries = bomEntries.filter(b => b.productId === productId);
    setEditingBomEntries(entries.length > 0 ? entries.map(e => ({ ...e })) : []);
    setEditingBomProductId(productId);
  };

  const addBomEntry = () => {
    setEditingBomEntries(prev => [...prev, {
      id: `bom-${Date.now()}`, productId: editingBomProductId || '',
      ingredientId: '', quantityPerUnit: 0, unit: 'kg', isPrimary: prev.length === 0,
    }]);
  };

  const updateBomEntry = (idx: number, partial: Partial<ProductBomEntry>) => {
    setEditingBomEntries(prev => prev.map((e, i) => i === idx ? { ...e, ...partial } : e));
  };

  const removeBomEntry = (idx: number) => {
    setEditingBomEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveBom = async () => {
    if (!editingBomProductId) return;
    const validEntries = editingBomEntries.filter(e => e.ingredientId);
    setBomSaving(true);
    await supabase.from('product_bom').delete().eq('product_id', editingBomProductId);
    if (validEntries.length > 0) {
      const rows = validEntries.map(e => ({
        product_id: editingBomProductId,
        ingredient_id: e.ingredientId,
        quantity_per_unit: e.quantityPerUnit,
        unit: e.unit,
        is_primary: e.isPrimary,
        expected_yield_rate: e.expectedYieldRate || null,
        notes: e.notes || null,
      }));
      const { error } = await supabase.from('product_bom').insert(rows);
      if (error) { showToast(`儲存失敗：${error.message}`, 'error'); setBomSaving(false); return; }
    }
    showToast('配方已儲存');
    setEditingBomProductId(null);
    setBomSaving(false);
    loadBom();
  };

  const bomFilteredProducts = useMemo(() => {
    if (!bomSearch) return products;
    const q = bomSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q));
  }, [products, bomSearch]);

  // ─── Helper: update editing order input ───────────────────────

  const updateInput = (idx: number, partial: Partial<ProductionOrderInput>) => {
    if (!editingOrder) return;
    const inputs = [...(editingOrder.inputs || [])];
    inputs[idx] = { ...inputs[idx], ...partial };
    // Auto-fill from ingredient
    if (partial.ingredientId) {
      const ing = ingredients.find(i => i.id === partial.ingredientId);
      if (ing) {
        inputs[idx].ingredientName = ing.name;
        inputs[idx].unitCost = ing.baseCostPerLb;
      }
    }
    const updated = { ...editingOrder, inputs };
    setEditingOrder(recalcOrder(updated));
  };

  const updateOutput = (idx: number, partial: Partial<ProductionOrderOutput>) => {
    if (!editingOrder) return;
    const outputs = [...(editingOrder.outputs || [])];
    outputs[idx] = { ...outputs[idx], ...partial };
    const updated = { ...editingOrder, outputs };
    setEditingOrder(recalcOrder(updated));
  };

  const addInput = () => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      inputs: [...(editingOrder.inputs || []), {
        id: `inp-${Date.now()}`, productionOrderId: '', ingredientId: '', ingredientName: '',
        quantity: 0, unit: 'box', weightPerUnitKg: 0, totalWeightKg: 0, unitCost: 0, totalCost: 0,
      }],
    });
  };

  const addOutput = () => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      outputs: [...(editingOrder.outputs || []), {
        id: `out-${Date.now()}`, productionOrderId: '', productName: '', saleChannel: 'retail',
        quantity: 0, unitWeightKg: 0, totalWeightKg: 0, packagingQuantity: 0, packagingCostTotal: 0, estimatedUnitCost: 0,
      }],
    });
  };

  const removeInput = (idx: number) => {
    if (!editingOrder) return;
    const inputs = (editingOrder.inputs || []).filter((_, i) => i !== idx);
    setEditingOrder(recalcOrder({ ...editingOrder, inputs }));
  };

  const removeOutput = (idx: number) => {
    if (!editingOrder) return;
    const outputs = (editingOrder.outputs || []).filter((_, i) => i !== idx);
    setEditingOrder(recalcOrder({ ...editingOrder, outputs }));
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([
          { id: 'orders' as SubTab, label: '生產工單', icon: <ClipboardList size={14} /> },
          { id: 'bom' as SubTab, label: '配方管理', icon: <BookOpen size={14} /> },
          { id: 'packaging' as SubTab, label: '包裝材料', icon: <Package size={14} /> },
          { id: 'yield_report' as SubTab, label: '出成率報告', icon: <TrendingUp size={14} /> },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black transition-all ${
              subTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 1: Production Orders 生產工單                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      {subTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {(['all', 'draft', 'pending_review', 'approved', 'rejected'] as const).map(s => (
                <button key={s} onClick={() => setOrderStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${orderStatusFilter === s ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}`}>
                  {s === 'all' ? '全部' : STATUS_META[s].label}
                </button>
              ))}
            </div>
            <button onClick={handleNewOrder} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800">
              <Plus size={14} /> 新增生產工單
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <ClipboardList size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">暫無生產工單</p>
              <p className="text-xs text-slate-300 mt-1">點擊「新增生產工單」開始記錄生產</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">工單號</th>
                    <th className="px-4 py-3 text-left">生產日期</th>
                    <th className="px-4 py-3 text-left">原材料</th>
                    <th className="px-4 py-3 text-right">投入 (kg)</th>
                    <th className="px-4 py-3 text-right">產出 (kg)</th>
                    <th className="px-4 py-3 text-right">出成率</th>
                    <th className="px-4 py-3 text-center">狀態</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const meta = STATUS_META[order.status];
                    const mainIngredient = order.inputs?.[0]?.ingredientName || '—';
                    return (
                      <tr key={order.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                        <td className="px-5 py-3 font-black text-slate-800">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{order.productionDate}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{mainIngredient}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-600">{order.totalInputWeightKg.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-600">{order.totalOutputWeightKg.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-black text-blue-600">{order.yieldRate > 0 ? `${order.yieldRate}%` : '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black ${meta.bg} ${meta.color}`}>{meta.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {order.status === 'draft' && (
                              <button onClick={() => setEditingOrder({ ...order })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="編輯"><Edit size={13} /></button>
                            )}
                            {order.status === 'pending_review' && (
                              <button onClick={() => { setReviewOrder(order); setReviewNotes(''); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="審核"><Eye size={13} /></button>
                            )}
                            {(order.status === 'approved' || order.status === 'rejected') && (
                              <button onClick={() => { setReviewOrder(order); setReviewNotes(''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="查看"><Eye size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                共 {filteredOrders.length} 張工單
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 2: BOM 配方管理                                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {subTab === 'bom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input value={bomSearch} onChange={e => setBomSearch(e.target.value)}
                  placeholder="搜尋產品..." className="pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52" />
              </div>
              <p className="text-xs text-slate-400 font-bold">定義每個成品所需的原材料配方，工場生產時只能使用已定義的原材料</p>
            </div>
          </div>

          {bomLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">產品</th>
                    <th className="px-4 py-3 text-center">渠道</th>
                    <th className="px-4 py-3 text-center">配方原材料</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomFilteredProducts.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-300 font-bold text-sm">尚無產品</td></tr>
                  ) : bomFilteredProducts.map(p => {
                    const entries = bomEntries.filter(b => b.productId === p.id);
                    const ingNames = entries.map(e => ingredients.find(i => i.id === e.ingredientId)?.name || '?').join('、');
                    return (
                      <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                        <td className="px-5 py-3">
                          <p className="font-black text-slate-800">{p.name}</p>
                          {p.nameEn && <p className="text-[10px] text-slate-400">{p.nameEn}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            p.saleChannel === 'retail' ? 'bg-blue-50 text-blue-600' :
                            p.saleChannel === 'wholesale' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {p.saleChannel === 'retail' ? '零售' : p.saleChannel === 'wholesale' ? '批發' : '全部'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {entries.length > 0 ? (
                            <span className="text-xs font-bold text-emerald-600">{ingNames}</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-300">未設定</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => openBomEditor(p.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Edit size={12} /> 編輯配方
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">共 {bomFilteredProducts.length} 個產品</span>
                <span className="text-[10px] font-bold text-emerald-500">{productsWithBom.length} 個已設定配方</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 3: Packaging Materials 包裝材料                        */}
      {/* ════════════════════════════════════════════════════════════ */}
      {subTab === 'packaging' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-bold">管理黑碟、Skin Pack、零售膠袋等包裝材料及其庫存</p>
            <button onClick={() => setEditingPkg({ isNew: true, unit: 'pc', costPerUnit: 0, stockQuantity: 0, minStockAlert: 0, isActive: true })}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800">
              <Plus size={14} /> 新增包裝材料
            </button>
          </div>

          {pkgLoading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
          ) : packagingMaterials.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <Package size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">暫無包裝材料</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3 text-left">名稱</th>
                    <th className="px-4 py-3 text-center">單位</th>
                    <th className="px-4 py-3 text-right">單價</th>
                    <th className="px-4 py-3 text-right">庫存</th>
                    <th className="px-4 py-3 text-right">最低警告</th>
                    <th className="px-4 py-3 text-center">狀態</th>
                    <th className="px-4 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {packagingMaterials.map(pkg => {
                    const lowStock = pkg.minStockAlert > 0 && pkg.stockQuantity <= pkg.minStockAlert;
                    return (
                      <tr key={pkg.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                        <td className="px-5 py-3">
                          <p className="font-black text-slate-800">{pkg.name}</p>
                          {pkg.nameEn && <p className="text-[10px] text-slate-400">{pkg.nameEn}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{pkg.unit}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-800">${pkg.costPerUnit.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-black ${lowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                          {pkg.stockQuantity}
                          {lowStock && <AlertTriangle size={12} className="inline ml-1 text-rose-500" />}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-400">{pkg.minStockAlert || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${pkg.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {pkg.isActive ? '啟用' : '停用'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingPkg({ ...pkg, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                            <button onClick={() => handleDeletePkg(pkg.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                共 {packagingMaterials.length} 項包裝材料
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAB 4: Yield Report 出成率報告                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      {subTab === 'yield_report' && (
        <div className="space-y-4">
          {yieldReportData.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <BarChart3 size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">暫無已批准的生產工單</p>
              <p className="text-xs text-slate-300 mt-1">批准工單後，出成率數據將會顯示在此</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">已批准工單</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{orders.filter(o => o.status === 'approved').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">平均出成率</p>
                  <p className="text-3xl font-black text-blue-600 mt-1">
                    {(() => {
                      const approved = orders.filter(o => o.status === 'approved' && o.yieldRate > 0);
                      if (approved.length === 0) return '—';
                      return (approved.reduce((s, o) => s + o.yieldRate, 0) / approved.length).toFixed(1) + '%';
                    })()}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">原材料種類</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{yieldReportData.length}</p>
                </div>
              </div>

              {/* By-ingredient table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 pb-3">
                  <h4 className="font-black text-lg">按原材料出成率統計</h4>
                  <p className="text-[10px] text-slate-400 font-bold">僅統計已批准的生產工單</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3 text-left">原材料</th>
                      <th className="px-4 py-3 text-right">工單數</th>
                      <th className="px-4 py-3 text-right">總投入 (kg)</th>
                      <th className="px-4 py-3 text-right">總產出 (kg)</th>
                      <th className="px-4 py-3 text-right">平均出成率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yieldReportData.map(item => (
                      <tr key={item.name} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-black text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-500">{item.orders.length}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-600">{item.totalInputKg.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-600">{item.totalOutputKg.toFixed(1)}</td>
                        <td className="px-4 py-3 text-right font-black text-blue-600">{item.avgYield.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: Edit Production Order                               */}
      {/* ════════════════════════════════════════════════════════════ */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-start justify-center p-4 overflow-y-auto" onClick={() => setEditingOrder(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl my-8" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{editingOrder.id ? '編輯生產工單' : '新增生產工單'}</h3>
                <p className="text-xs text-slate-400 font-bold">{editingOrder.orderNumber}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">生產日期</label>
                  <input type="date" value={editingOrder.productionDate} onChange={e => setEditingOrder({ ...editingOrder, productionDate: e.target.value })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">工場人員</label>
                  <input value={editingOrder.createdBy || ''} onChange={e => setEditingOrder({ ...editingOrder, createdBy: e.target.value })}
                    placeholder="輸入姓名" className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
              </div>

              {/* ── Outputs (成品產出) — 先選擇成品，決定可用原材料 ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-700 flex items-center gap-2">
                    <Package size={16} className="text-emerald-500" /> ① 成品產出
                    <span className="text-[10px] font-normal text-slate-400 ml-1">先選擇要生產的成品</span>
                  </h4>
                  <button onClick={addOutput} className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Plus size={12} /> 添加
                  </button>
                </div>
                {productsWithBom.length === 0 && (
                  <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-bold">尚無已設定配方的產品，請先到「配方管理」設定產品配方</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-2 py-2">產品名稱</th>
                        <th className="text-center px-2 py-2 w-16">渠道</th>
                        <th className="text-right px-2 py-2 w-16">數量</th>
                        <th className="text-right px-2 py-2 w-24">每份重量(kg)</th>
                        <th className="text-right px-2 py-2 w-20">總重量</th>
                        <th className="text-left px-2 py-2 w-28">包裝</th>
                        <th className="text-right px-2 py-2 w-16">包裝量</th>
                        <th className="text-right px-2 py-2 w-20">每份成本</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingOrder.outputs || []).map((out, idx) => (
                        <tr key={out.id} className="border-t border-slate-100">
                          <td className="px-2 py-2">
                            <select value={out.productId || ''} onChange={e => {
                              const prod = productsWithBom.find(p => p.id === e.target.value);
                              if (prod) {
                                updateOutput(idx, { productId: prod.id, productName: prod.name, saleChannel: (prod.saleChannel === 'wholesale' ? 'wholesale' : 'retail') as SaleChannel });
                              } else {
                                updateOutput(idx, { productId: undefined, productName: '' });
                              }
                            }} className="w-full p-2 bg-slate-50 rounded-lg font-bold border border-slate-100">
                              <option value="">選擇產品</option>
                              {productsWithBom.map(p => <option key={p.id} value={p.id}>{p.name} ({p.saleChannel === 'retail' ? '零售' : p.saleChannel === 'wholesale' ? '批發' : '全部'})</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select value={out.saleChannel} onChange={e => updateOutput(idx, { saleChannel: e.target.value as SaleChannel })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-center border border-slate-100">
                              <option value="retail">零售</option><option value="wholesale">批發</option>
                            </select>
                          </td>
                          <td className="px-2 py-2"><input type="number" min="0" step="1" value={out.quantity || ''} onChange={e => updateOutput(idx, { quantity: Number(e.target.value) || 0 })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" /></td>
                          <td className="px-2 py-2"><input type="number" min="0" step="0.001" value={out.unitWeightKg || ''} onChange={e => updateOutput(idx, { unitWeightKg: Number(e.target.value) || 0 })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" /></td>
                          <td className="px-2 py-2 text-right font-black text-slate-700">{(out.quantity * out.unitWeightKg).toFixed(1)}</td>
                          <td className="px-2 py-2">
                            <select value={out.packagingMaterialId || ''} onChange={e => updateOutput(idx, { packagingMaterialId: e.target.value || undefined, packagingType: packagingMaterials.find(p => p.id === e.target.value)?.name })} className="w-full p-2 bg-slate-50 rounded-lg font-bold border border-slate-100">
                              <option value="">無</option>
                              {packagingMaterials.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name} (${p.costPerUnit})</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2"><input type="number" min="0" step="1" value={out.packagingQuantity || ''} onChange={e => updateOutput(idx, { packagingQuantity: Number(e.target.value) || 0 })} disabled={!out.packagingMaterialId} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100 disabled:opacity-40" /></td>
                          <td className="px-2 py-2 text-right font-black text-amber-600">${out.estimatedUnitCost.toFixed(1)}</td>
                          <td className="px-2 py-2"><button onClick={() => removeOutput(idx)} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><X size={12} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-6 text-xs font-black text-slate-500 px-2">
                  <span>總重量：<span className="text-slate-800">{editingOrder.totalOutputWeightKg.toFixed(1)} kg</span></span>
                </div>
              </div>

              {/* ── Inputs (原材料投入) — 根據成品配方自動過濾 ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-700 flex items-center gap-2">
                    <Layers size={16} className="text-blue-500" /> ② 原材料投入
                    <span className="text-[10px] font-normal text-slate-400 ml-1">根據成品配方自動過濾</span>
                  </h4>
                  <button onClick={addInput} disabled={allowedIngredients.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    <Plus size={12} /> 添加
                  </button>
                </div>
                {allowedIngredients.length === 0 && (editingOrder.outputs || []).some(o => o.productId) === false && (
                  <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                    <Layers size={14} className="text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-600 font-bold">請先在上方選擇要生產的成品，原材料將自動根據配方過濾</p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-2 py-2">原材料</th>
                        <th className="text-right px-2 py-2 w-20">數量</th>
                        <th className="text-center px-2 py-2 w-16">單位</th>
                        <th className="text-right px-2 py-2 w-24">每單位重量(kg)</th>
                        <th className="text-right px-2 py-2 w-20">總重量(kg)</th>
                        <th className="text-right px-2 py-2 w-20">單位成本</th>
                        <th className="text-right px-2 py-2 w-20">總成本</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingOrder.inputs || []).map((inp, idx) => (
                        <tr key={inp.id} className="border-t border-slate-100">
                          <td className="px-2 py-2">
                            <select value={inp.ingredientId || ''} onChange={e => {
                              const ing = ingredients.find(i => i.id === e.target.value);
                              updateInput(idx, { ingredientId: e.target.value || undefined, ingredientName: ing?.name || '' });
                            }} className="w-full p-2 bg-slate-50 rounded-lg font-bold border border-slate-100" disabled={allowedIngredients.length === 0}>
                              <option value="">{allowedIngredients.length === 0 ? '請先選擇成品' : '選擇原材料'}</option>
                              {allowedIngredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2"><input type="number" min="0" step="1" value={inp.quantity || ''} onChange={e => updateInput(idx, { quantity: Number(e.target.value) || 0 })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" /></td>
                          <td className="px-2 py-2">
                            <select value={inp.unit} onChange={e => updateInput(idx, { unit: e.target.value })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-center border border-slate-100">
                              <option value="box">箱</option><option value="kg">kg</option><option value="lb">lb</option><option value="pc">件</option>
                            </select>
                          </td>
                          <td className="px-2 py-2"><input type="number" min="0" step="0.1" value={inp.weightPerUnitKg || ''} onChange={e => updateInput(idx, { weightPerUnitKg: Number(e.target.value) || 0 })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" /></td>
                          <td className="px-2 py-2 text-right font-black text-slate-700">{(inp.quantity * inp.weightPerUnitKg).toFixed(1)}</td>
                          <td className="px-2 py-2"><input type="number" min="0" step="0.5" value={inp.unitCost || ''} onChange={e => updateInput(idx, { unitCost: Number(e.target.value) || 0 })} className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" /></td>
                          <td className="px-2 py-2 text-right font-black text-slate-700">${(inp.quantity * inp.unitCost).toFixed(0)}</td>
                          <td className="px-2 py-2"><button onClick={() => removeInput(idx)} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><X size={12} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-6 text-xs font-black text-slate-500 px-2">
                  <span>總重量：<span className="text-slate-800">{editingOrder.totalInputWeightKg.toFixed(1)} kg</span></span>
                  <span>總成本：<span className="text-slate-800">${(editingOrder.inputs || []).reduce((s, i) => s + i.quantity * i.unitCost, 0).toFixed(0)}</span></span>
                </div>
              </div>

              {/* ── Summary ── */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <h4 className="font-black text-sm text-slate-700">📊 生產摘要</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">投入重量</p>
                    <p className="text-xl font-black text-slate-800">{editingOrder.totalInputWeightKg.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">產出重量</p>
                    <p className="text-xl font-black text-slate-800">{editingOrder.totalOutputWeightKg.toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold">出成率</p>
                    <p className={`text-xl font-black ${editingOrder.yieldRate > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                      {editingOrder.yieldRate > 0 ? `${editingOrder.yieldRate}%` : '—'}
                    </p>
                  </div>
                </div>
                {editingOrder.totalInputWeightKg > 0 && editingOrder.totalOutputWeightKg > 0 && (
                  <p className="text-xs text-slate-400 font-bold text-center">
                    損耗：{(editingOrder.totalInputWeightKg - editingOrder.totalOutputWeightKg).toFixed(1)} kg
                    ({(100 - editingOrder.yieldRate).toFixed(1)}%)
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                <textarea value={editingOrder.notes || ''} onChange={e => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-16" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditingOrder(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={() => handleSaveOrder(false)} disabled={orderSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black hover:bg-slate-700 disabled:opacity-50">
                {orderSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存草稿
              </button>
              <button onClick={() => handleSaveOrder(true)} disabled={orderSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                {orderSaving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} 提交審核
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: Review / View Order                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {reviewOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-start justify-center p-4 overflow-y-auto" onClick={() => setReviewOrder(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {reviewOrder.status === 'pending_review' ? '審核生產工單' : '查看生產工單'}
                </h3>
                <p className="text-xs text-slate-400 font-bold">{reviewOrder.orderNumber} · {reviewOrder.productionDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black ${STATUS_META[reviewOrder.status].bg} ${STATUS_META[reviewOrder.status].color}`}>
                  {STATUS_META[reviewOrder.status].label}
                </span>
                <button onClick={() => setReviewOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
              {/* Inputs */}
              <div>
                <h4 className="font-black text-sm text-slate-700 mb-2">原材料投入</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase">
                      <th className="text-left px-2 py-2">原材料</th>
                      <th className="text-right px-2 py-2">數量</th>
                      <th className="text-center px-2 py-2">單位</th>
                      <th className="text-right px-2 py-2">總重量(kg)</th>
                      <th className="text-right px-2 py-2">總成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reviewOrder.inputs || []).map(inp => (
                      <tr key={inp.id} className="border-t border-slate-100">
                        <td className="px-2 py-2 font-bold">{inp.ingredientName}</td>
                        <td className="px-2 py-2 text-right">{inp.quantity}</td>
                        <td className="px-2 py-2 text-center">{inp.unit}</td>
                        <td className="px-2 py-2 text-right font-bold">{inp.totalWeightKg.toFixed(1)}</td>
                        <td className="px-2 py-2 text-right font-bold">${inp.totalCost.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Outputs */}
              <div>
                <h4 className="font-black text-sm text-slate-700 mb-2">成品產出</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase">
                      <th className="text-left px-2 py-2">產品</th>
                      <th className="text-center px-2 py-2">渠道</th>
                      <th className="text-right px-2 py-2">數量</th>
                      <th className="text-right px-2 py-2">總重量(kg)</th>
                      <th className="text-left px-2 py-2">包裝</th>
                      <th className="text-right px-2 py-2">每份成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reviewOrder.outputs || []).map(out => (
                      <tr key={out.id} className="border-t border-slate-100">
                        <td className="px-2 py-2 font-bold">{out.productName}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${out.saleChannel === 'wholesale' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {out.saleChannel === 'wholesale' ? '批發' : '零售'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right">{out.quantity}</td>
                        <td className="px-2 py-2 text-right font-bold">{out.totalWeightKg.toFixed(1)}</td>
                        <td className="px-2 py-2">{out.packagingType || '—'}</td>
                        <td className="px-2 py-2 text-right font-black text-amber-600">${out.estimatedUnitCost.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">投入</p>
                  <p className="text-lg font-black text-slate-800">{reviewOrder.totalInputWeightKg.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">產出</p>
                  <p className="text-lg font-black text-slate-800">{reviewOrder.totalOutputWeightKg.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">出成率</p>
                  <p className="text-lg font-black text-blue-600">{reviewOrder.yieldRate}%</p>
                </div>
              </div>

              {reviewOrder.notes && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 font-bold mb-1">備註</p>
                  <p className="text-xs text-slate-600">{reviewOrder.notes}</p>
                </div>
              )}

              {reviewOrder.reviewNotes && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[10px] text-amber-600 font-bold mb-1">審核備註</p>
                  <p className="text-xs text-amber-800">{reviewOrder.reviewNotes}</p>
                </div>
              )}

              {/* Review form */}
              {reviewOrder.status === 'pending_review' && (
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">審核備註</label>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                    placeholder="（可選）輸入審核意見..." className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-16" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setReviewOrder(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">關閉</button>
              {reviewOrder.status === 'pending_review' && (
                <>
                  <button onClick={() => handleReviewOrder('rejected')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black hover:bg-rose-700">
                    <XCircle size={14} /> 退回
                  </button>
                  <button onClick={() => handleReviewOrder('approved')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700">
                    <CheckCircle size={14} /> 批准
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: Edit Product BOM (配方)                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      {editingBomProductId && (() => {
        const prod = products.find(p => p.id === editingBomProductId);
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-start justify-center p-4 overflow-y-auto" onClick={() => setEditingBomProductId(null)}>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">編輯配方</h3>
                  <p className="text-xs text-slate-400 font-bold">{prod?.name || '未知產品'}</p>
                </div>
                <button onClick={() => setEditingBomProductId(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-bold">定義此產品生產所需的原材料</p>
                  <button onClick={addBomEntry} className="flex items-center gap-1 px-3 py-1.5 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Plus size={12} /> 添加原材料
                  </button>
                </div>
                {editingBomEntries.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <BookOpen size={24} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">尚無配方，點擊「添加原材料」開始設定</p>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-2 py-2">原材料</th>
                        <th className="text-right px-2 py-2 w-24">每單位用量</th>
                        <th className="text-center px-2 py-2 w-16">單位</th>
                        <th className="text-right px-2 py-2 w-24">預期出成率</th>
                        <th className="text-center px-2 py-2 w-14">主要</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingBomEntries.map((entry, idx) => (
                        <tr key={entry.id} className="border-t border-slate-100">
                          <td className="px-2 py-2">
                            <select value={entry.ingredientId} onChange={e => updateBomEntry(idx, { ingredientId: e.target.value })}
                              className="w-full p-2 bg-slate-50 rounded-lg font-bold border border-slate-100">
                              <option value="">選擇原材料</option>
                              {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" step="0.01" value={entry.quantityPerUnit || ''} onChange={e => updateBomEntry(idx, { quantityPerUnit: Number(e.target.value) || 0 })}
                              placeholder="0" className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" />
                          </td>
                          <td className="px-2 py-2">
                            <select value={entry.unit} onChange={e => updateBomEntry(idx, { unit: e.target.value })}
                              className="w-full p-2 bg-slate-50 rounded-lg font-bold text-center border border-slate-100">
                              <option value="kg">kg</option><option value="lb">lb</option><option value="pc">件</option><option value="g">g</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" max="1" step="0.01" value={entry.expectedYieldRate ?? ''} onChange={e => updateBomEntry(idx, { expectedYieldRate: Number(e.target.value) || undefined })}
                              placeholder="—" className="w-full p-2 bg-slate-50 rounded-lg font-bold text-right border border-slate-100" />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <button onClick={() => updateBomEntry(idx, { isPrimary: !entry.isPrimary })}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${entry.isPrimary ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200 bg-white'}`}>
                              {entry.isPrimary && <Check size={12} strokeWidth={3} />}
                            </button>
                          </td>
                          <td className="px-2 py-2">
                            <button onClick={() => removeBomEntry(idx)} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><X size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
                <button onClick={() => setEditingBomProductId(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
                <button onClick={handleSaveBom} disabled={bomSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                  {bomSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存配方
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MODAL: Edit Packaging Material                             */}
      {/* ════════════════════════════════════════════════════════════ */}
      {editingPkg && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditingPkg(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editingPkg.isNew ? '新增包裝材料' : '編輯包裝材料'}</h3>
              <button onClick={() => setEditingPkg(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">名稱 *</label>
                  <input value={editingPkg.name || ''} onChange={e => setEditingPkg({ ...editingPkg, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例：黑碟(小)" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">英文名</label>
                  <input value={editingPkg.nameEn || ''} onChange={e => setEditingPkg({ ...editingPkg, nameEn: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">單位</label>
                  <select value={editingPkg.unit || 'pc'} onChange={e => setEditingPkg({ ...editingPkg, unit: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="pc">個</option>
                    <option value="roll">卷</option>
                    <option value="sheet">張</option>
                    <option value="box">箱</option>
                    <option value="pack">包</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">單價 ($)</label>
                  <input type="number" min="0" step="0.01" value={editingPkg.costPerUnit ?? ''} onChange={e => setEditingPkg({ ...editingPkg, costPerUnit: Number(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">現有庫存</label>
                  <input type="number" min="0" step="1" value={editingPkg.stockQuantity ?? ''} onChange={e => setEditingPkg({ ...editingPkg, stockQuantity: Number(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">最低庫存警告</label>
                  <input type="number" min="0" step="1" value={editingPkg.minStockAlert ?? ''} onChange={e => setEditingPkg({ ...editingPkg, minStockAlert: Number(e.target.value) || 0 })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                  <textarea value={editingPkg.notes || ''} onChange={e => setEditingPkg({ ...editingPkg, notes: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none h-16" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setEditingPkg(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
              <button onClick={handleSavePkg} disabled={pkgSaving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                {pkgSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPanel;
