
import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers, Plus, Edit, Trash2, Save, X, RefreshCw, Search,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Ingredient, IngredientCategory, SaleChannel } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const SALE_CHANNELS: { value: SaleChannel; label: string }[] = [
  { value: 'both', label: '全部' },
  { value: 'retail', label: '零售' },
  { value: 'wholesale', label: '批發' },
];

const WarehousePanel: React.FC<Props> = ({ showToast }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterChannel, setFilterChannel] = useState<SaleChannel | 'all'>('all');

  const [editing, setEditing] = useState<(Partial<Ingredient> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  const loadIngredients = useCallback(async () => {
    setLoading(true);
    const [ingredientsRes, categoriesRes] = await Promise.all([
      supabase.from('ingredients').select('*').order('name'),
      supabase.from('ingredient_categories').select('*').order('sort_order'),
    ]);
    if (ingredientsRes.data) {
      setIngredients(ingredientsRes.data.map((r: any) => ({
        id: r.id,
        legacyId: r.legacy_id,
        name: r.name,
        nameEn: r.name_en,
        baseCostPerLb: r.base_cost_per_lb,
        supplier: r.supplier,
        marketBenchmark: r.market_benchmark,
        unit: r.unit,
        category: r.category,
        saleChannel: r.sale_channel as SaleChannel | undefined,
        notes: r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    if (categoriesRes.data) {
      setCategories(categoriesRes.data.map((r: any) => ({
        id: r.id, name: r.name, emoji: r.emoji || '📦', sortOrder: r.sort_order || 0,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadIngredients(); }, [loadIngredients]);

  const filtered = ingredients.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !(i.nameEn || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    if (filterChannel !== 'all' && i.saleChannel !== filterChannel && i.saleChannel !== 'both') return false;
    return true;
  });

  const handleSave = async () => {
    if (!editing || !editing.name?.trim()) { showToast('請輸入名稱', 'error'); return; }
    setSaving(true);
    const payload = {
      name: editing.name.trim(),
      name_en: editing.nameEn || null,
      base_cost_per_lb: editing.baseCostPerLb || 0,
      supplier: editing.supplier || null,
      market_benchmark: editing.marketBenchmark || null,
      unit: editing.unit || 'lb',
      category: editing.category || null,
      sale_channel: editing.saleChannel || 'both',
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

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此原材料？')) return;
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) showToast(`失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadIngredients(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Ingredients management ── */}
      <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜尋原材料..."
                  className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="all">所有類別</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value as any)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="all">所有渠道</option>
                {SALE_CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button
              onClick={() => setEditing({ isNew: true, unit: 'lb', baseCostPerLb: 0, saleChannel: 'both' })}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
            >
              <Plus size={14} /> 新增原材料
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw size={24} className="animate-spin text-slate-300" />
            </div>
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
                    <th className="px-4 py-3 text-right">成本/單位</th>
                    <th className="px-4 py-3 text-left">供應商</th>
                    <th className="px-4 py-3 text-center">渠道</th>
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
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">
                          {cat ? `${cat.emoji} ${cat.name}` : ing.category || '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">{ing.unit}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-800">${ing.baseCostPerLb.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500">{ing.supplier || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            ing.saleChannel === 'retail' ? 'bg-blue-50 text-blue-600' :
                            ing.saleChannel === 'wholesale' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {ing.saleChannel === 'retail' ? '零售' : ing.saleChannel === 'wholesale' ? '批發' : '全部'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditing({ ...ing, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                            <button onClick={() => handleDelete(ing.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                共 {filtered.length} 項原材料
              </div>
            </div>
          )}
        </div>

      {/* ── Edit modal ── */}
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
                    <option value="lb">磅 (lb)</option>
                    <option value="kg">公斤 (kg)</option>
                    <option value="pc">件 (pc)</option>
                    <option value="box">箱</option>
                    <option value="pack">包</option>
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">渠道</label>
                  <select value={editing.saleChannel || 'both'} onChange={e => setEditing({ ...editing, saleChannel: e.target.value as SaleChannel })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                    <option value="both">全部</option>
                    <option value="retail">零售</option>
                    <option value="wholesale">批發</option>
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
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePanel;
