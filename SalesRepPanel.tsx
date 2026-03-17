
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Edit, Trash2, Search, Save, X,
  RefreshCw, Phone, Mail, Tag, Check, UserCircle,
  ChevronDown, ChevronRight, MapPin, Building2,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { SalesRepresentative, WholesaleClient, WholesaleBrand } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_REP: Partial<SalesRepresentative> & { isNew?: boolean } = {
  name: '',
  phone: '',
  email: '',
  brand: 'GHFOODS',
  notes: '',
  isActive: true,
  isNew: true,
};

const SalesRepPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand } = useWorkspace();

  const [reps, setReps] = useState<SalesRepresentative[]>([]);
  const [clients, setClients] = useState<WholesaleClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<(Partial<SalesRepresentative> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedReps, setExpandedReps] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const [repsRes, clientsRes] = await Promise.all([
      supabase.from('sales_representatives').select('*').eq('brand', wholesaleBrand).order('name'),
      supabase.from('wholesale_clients').select('id,company_name,client_code,price_tier,address,phone,salesperson_id,is_active')
        .eq('brand', wholesaleBrand).order('client_code').order('company_name'),
    ]);

    if (repsRes.data) {
      setReps(repsRes.data.map((r: any) => ({
        id: r.id, name: r.name, phone: r.phone || '', email: r.email || '',
        brand: r.brand, notes: r.notes || '', isActive: r.is_active,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })));
    }
    if (clientsRes.data) {
      setClients(clientsRes.data.map((r: any) => ({
        id: r.id,
        clientCode: r.client_code || '',
        companyName: r.company_name,
        contactName: '',
        phone: r.phone || '',
        address: r.address || '',
        brand: r.brand as WholesaleBrand,
        priceTier: r.price_tier || 'P0',
        salespersonId: r.salesperson_id,
        isActive: r.is_active,
        creditLimit: 0,
        paymentTermsDays: 0,
        paymentTermsType: 'cod' as const,
        discountPercent: 0,
      })));
    }
    setLoading(false);
  }, [wholesaleBrand]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) {
      showToast('請填寫銷售員名稱', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name!.trim(),
      phone: editing.phone?.trim() || null,
      email: editing.email?.trim() || null,
      brand: editing.brand || wholesaleBrand,
      notes: editing.notes || null,
      is_active: editing.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    if (editing.isNew) {
      const { error } = await supabase.from('sales_representatives').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('銷售員已新增');
    } else {
      const { error } = await supabase.from('sales_representatives').update(payload).eq('id', editing.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('銷售員已更新');
    }
    setEditing(null);
    setSaving(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此銷售員？其下客戶的銷售員欄位會被清空。')) return;
    const { error } = await supabase.from('sales_representatives').delete().eq('id', id);
    if (error) showToast(`刪除失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadData(); }
  };

  const getClientsForRep = (repId: string) =>
    clients.filter(c => c.salespersonId === repId && c.isActive);

  const filteredReps = reps.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) ||
      (r.phone || '').includes(q) ||
      (r.email || '').toLowerCase().includes(q);
  });

  const toggleExpand = (id: string) => {
    setExpandedReps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriceTierColor = (tier: string) => {
    if (tier === 'P0') return 'bg-slate-100 text-slate-500';
    const n = parseInt(tier.replace('P', ''));
    if (n <= 2) return 'bg-blue-50 text-blue-600';
    if (n <= 5) return 'bg-amber-50 text-amber-600';
    return 'bg-rose-50 text-rose-600';
  };

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
          <span>{brandMeta.label} 銷售員</span>
          <span className="text-xs font-bold opacity-60">({filteredReps.length})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜尋銷售員..."
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold w-64"
            />
          </div>
          <button
            onClick={() => setEditing({ ...EMPTY_REP, brand: wholesaleBrand })}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} /> 新增銷售員
          </button>
        </div>
      </div>

      {filteredReps.length === 0 && (
        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <UserCircle size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">尚無銷售員資料</p>
        </div>
      )}

      {/* Sales rep cards */}
      <div className="space-y-4">
        {filteredReps.map(rep => {
          const repClients = getClientsForRep(rep.id);
          const isExpanded = expandedReps[rep.id] !== false;

          return (
            <div key={rep.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Rep header */}
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-blue-200">
                    {rep.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-black text-slate-900">{rep.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-0.5">
                      {rep.phone && <span className="flex items-center gap-1"><Phone size={10} /> {rep.phone}</span>}
                      {rep.email && <span className="flex items-center gap-1"><Mail size={10} /> {rep.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black">
                    {repClients.length} 間客戶
                  </span>
                  {!rep.isActive && (
                    <span className="px-2 py-1 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-black">停用</span>
                  )}
                  <button onClick={() => setEditing({ ...rep, isNew: false })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(rep.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Client list under this rep */}
              {repClients.length > 0 && (
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => toggleExpand(rep.id)}
                    className="w-full flex items-center gap-2 px-5 py-3 text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Building2 size={12} />
                    <span>管理的客戶 ({repClients.length})</span>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="text-left py-2 pr-3">編號</th>
                            <th className="text-left py-2 pr-3">客戶名稱</th>
                            <th className="text-left py-2 pr-3">P 等級</th>
                            <th className="text-left py-2 pr-3">地址</th>
                            <th className="text-left py-2">電話</th>
                          </tr>
                        </thead>
                        <tbody>
                          {repClients.map(c => (
                            <tr key={c.id} className="border-b border-slate-50 last:border-0">
                              <td className="py-2 pr-3 font-mono text-slate-400 font-bold">{c.clientCode || '—'}</td>
                              <td className="py-2 pr-3 font-black text-slate-700">{c.companyName}</td>
                              <td className="py-2 pr-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${getPriceTierColor(c.priceTier)}`}>
                                  {c.priceTier}
                                </span>
                              </td>
                              <td className="py-2 pr-3 text-slate-500 truncate max-w-[200px]">{c.address || '—'}</td>
                              <td className="py-2 text-slate-500">{c.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editing.isNew ? '新增銷售員' : '編輯銷售員'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">銷售員名稱 *</label>
                <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="OSCAR" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話</label>
                  <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="9XXX XXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電子郵件</label>
                  <input value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="name@company.com" />
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

export default SalesRepPanel;
