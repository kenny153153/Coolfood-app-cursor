
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit, Trash2, Search, Save, X,
  RefreshCw, Phone, MapPin, Truck, Tag, Check,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { WholesaleClient, WholesaleBrand, DeliveryRoute, WholesalePriceTier } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_CLIENT: Partial<WholesaleClient> & { isNew?: boolean } = {
  companyName: '',
  contactName: '',
  phone: '',
  address: '',
  district: '',
  brand: 'GHFOODS',
  priceTier: 'P0',
  routeId: null,
  creditLimit: 0,
  notes: '',
  isActive: true,
  isNew: true,
};

const WholesaleClientsPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand, availableWholesaleBrands } = useWorkspace();

  const [clients, setClients] = useState<WholesaleClient[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [priceTiers, setPriceTiers] = useState<WholesalePriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<(Partial<WholesaleClient> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clientsRes, routesRes, pricingRes] = await Promise.all([
      supabase.from('wholesale_clients').select('*').eq('brand', wholesaleBrand).order('company_name'),
      supabase.from('delivery_routes').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('wholesale_brand_pricing').select('price_tiers').eq('brand', wholesaleBrand).single(),
    ]);

    if (clientsRes.data) {
      setClients(clientsRes.data.map(mapRowToClient));
    }
    if (routesRes.data) {
      setRoutes(routesRes.data.map((r: any) => ({
        id: r.id, name: r.name, description: r.description,
        color: r.color, sortOrder: r.sort_order, isActive: r.is_active,
      })));
    }
    if (pricingRes.data) {
      setPriceTiers(pricingRes.data.price_tiers || []);
    }
    setLoading(false);
  }, [wholesaleBrand]);

  useEffect(() => { loadData(); }, [loadData]);

  const mapRowToClient = (r: any): WholesaleClient => ({
    id: r.id,
    companyName: r.company_name,
    contactName: r.contact_name,
    phone: r.phone,
    address: r.address || '',
    district: r.district || '',
    brand: r.brand as WholesaleBrand,
    priceTier: r.price_tier || 'P0',
    routeId: r.route_id,
    creditLimit: r.credit_limit || 0,
    notes: r.notes || '',
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.companyName?.trim() || !editing.contactName?.trim() || !editing.phone?.trim()) {
      showToast('請填寫公司名、聯絡人及電話', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      company_name: editing.companyName!.trim(),
      contact_name: editing.contactName!.trim(),
      phone: editing.phone!.trim(),
      address: editing.address || '',
      district: editing.district || '',
      brand: editing.brand || wholesaleBrand,
      price_tier: editing.priceTier || 'P0',
      route_id: editing.routeId || null,
      credit_limit: editing.creditLimit || 0,
      notes: editing.notes || '',
      is_active: editing.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    if (editing.isNew) {
      const { error } = await supabase.from('wholesale_clients').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('批發客已新增');
    } else {
      const { error } = await supabase.from('wholesale_clients').update(payload).eq('id', editing.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('批發客已更新');
    }
    setEditing(null);
    setSaving(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此批發客？')) return;
    const { error } = await supabase.from('wholesale_clients').delete().eq('id', id);
    if (error) showToast(`刪除失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadData(); }
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.companyName.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.phone.includes(q);
  });

  const getRouteName = (routeId?: string | null) => {
    if (!routeId) return '—';
    return routes.find(r => r.id === routeId)?.name || '—';
  };

  const allTierOptions = ['P0', ...priceTiers.map(t => t.name)];
  const brandMeta = WHOLESALE_BRAND_META[wholesaleBrand];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${brandMeta.colorClasses.accent} ${brandMeta.colorClasses.text} ${brandMeta.colorClasses.border} border`}>
          <span className="text-lg">{brandMeta.icon}</span>
          <span>{brandMeta.label} 批發客</span>
          <span className="text-xs font-bold opacity-60">({filteredClients.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜尋公司/聯絡人/電話..."
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold w-64"
            />
          </div>
          <button
            onClick={() => setEditing({ ...EMPTY_CLIENT, brand: wholesaleBrand })}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} /> 新增批發客
          </button>
        </div>
      </div>

      {/* Client list */}
      {filteredClients.length === 0 && (
        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">尚無批發客資料</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">{client.companyName}</h4>
                <p className="text-xs text-slate-400 font-bold">{client.contactName}</p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing({ ...client, isNew: false })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit size={14} /></button>
                <button onClick={() => handleDelete(client.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">
                <Tag size={10} /> {client.priceTier}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black">
                <Truck size={10} /> {getRouteName(client.routeId)}
              </span>
              {!client.isActive && (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-black">停用</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
              {client.address && <span className="flex items-center gap-1 truncate"><MapPin size={12} /> {client.address}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editing.isNew ? '新增批發客' : '編輯批發客'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">公司名稱 *</label>
                  <input value={editing.companyName || ''} onChange={e => setEditing({ ...editing, companyName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="XX 凍肉公司" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人 *</label>
                  <input value={editing.contactName || ''} onChange={e => setEditing({ ...editing, contactName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="陳先生" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話 *</label>
                  <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="9XXX XXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">品牌</label>
                  <select
                    value={editing.brand || wholesaleBrand}
                    onChange={e => setEditing({ ...editing, brand: e.target.value as WholesaleBrand })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                  >
                    {availableWholesaleBrands.map(b => (
                      <option key={b} value={b}>{WHOLESALE_BRAND_META[b].icon} {WHOLESALE_BRAND_META[b].label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">地址</label>
                <input value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="九龍觀塘..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">P 等級</label>
                  <select
                    value={editing.priceTier || 'P0'}
                    onChange={e => setEditing({ ...editing, priceTier: e.target.value })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                  >
                    {allTierOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">車線</label>
                  <select
                    value={editing.routeId || ''}
                    onChange={e => setEditing({ ...editing, routeId: e.target.value || null })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                  >
                    <option value="">未指定</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">信用額度</label>
                  <input type="number" value={editing.creditLimit || 0} onChange={e => setEditing({ ...editing, creditLimit: +e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                <textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} rows={2} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black transition-colors ${editing.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                >
                  <Check size={14} /> {editing.isActive ? '啟用中' : '已停用'}
                </button>
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

export default WholesaleClientsPanel;
