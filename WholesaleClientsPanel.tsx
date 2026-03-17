
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Plus, Edit, Trash2, Search, Save, X,
  RefreshCw, Phone, MapPin, Truck, Tag, Check,
  Building2, ChevronDown, ChevronRight, Mail, UserCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { WholesaleClient, WholesaleBrand, DeliveryRoute, WholesalePriceTier, SalesRepresentative, PaymentTermsType } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const PAYMENT_TERMS_LABELS: Record<PaymentTermsType, string> = {
  cod: 'C.O.D. 貨到付款',
  weekly: '週結',
  biweekly: '半月結',
  monthly: '月結',
};

const EMPTY_CLIENT: Partial<WholesaleClient> & { isNew?: boolean } = {
  clientCode: '',
  companyName: '',
  contactName: '',
  phone: '',
  fax: '',
  email: '',
  address: '',
  district: '',
  brand: 'GHFOODS',
  priceTier: 'P0',
  routeId: null,
  creditLimit: 0,
  parentClientId: null,
  salespersonId: null,
  paymentTermsDays: 0,
  paymentTermsType: 'cod',
  discountPercent: 0,
  notes: '',
  isActive: true,
  isNew: true,
};

const WholesaleClientsPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand, availableWholesaleBrands } = useWorkspace();

  const [clients, setClients] = useState<WholesaleClient[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [priceTiers, setPriceTiers] = useState<WholesalePriceTier[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRepresentative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<(Partial<WholesaleClient> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clientsRes, routesRes, pricingRes, repsRes] = await Promise.all([
      supabase.from('wholesale_clients').select('*').eq('brand', wholesaleBrand).order('client_code').order('company_name'),
      supabase.from('delivery_routes').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('wholesale_brand_pricing').select('price_tiers').eq('brand', wholesaleBrand).single(),
      supabase.from('sales_representatives').select('*').eq('brand', wholesaleBrand).eq('is_active', true).order('name'),
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
    if (repsRes.data) {
      setSalesReps(repsRes.data.map((r: any) => ({
        id: r.id, name: r.name, phone: r.phone, email: r.email,
        brand: r.brand, notes: r.notes, isActive: r.is_active,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })));
    }
    setLoading(false);
  }, [wholesaleBrand]);

  useEffect(() => { loadData(); }, [loadData]);

  const mapRowToClient = (r: any): WholesaleClient => ({
    id: r.id,
    clientCode: r.client_code || '',
    companyName: r.company_name,
    contactName: r.contact_name,
    phone: r.phone,
    fax: r.fax || '',
    email: r.email || '',
    address: r.address || '',
    district: r.district || '',
    brand: r.brand as WholesaleBrand,
    priceTier: r.price_tier || 'P0',
    routeId: r.route_id,
    creditLimit: r.credit_limit || 0,
    parentClientId: r.parent_client_id || null,
    salespersonId: r.salesperson_id || null,
    paymentTermsDays: r.payment_terms_days || 0,
    paymentTermsType: r.payment_terms_type || 'cod',
    discountPercent: r.discount_percent || 0,
    notes: r.notes || '',
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.companyName?.trim()) {
      showToast('請填寫公司名稱', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      client_code: editing.clientCode?.trim() || null,
      company_name: editing.companyName!.trim(),
      contact_name: editing.contactName?.trim() || '',
      phone: editing.phone?.trim() || '',
      fax: editing.fax?.trim() || null,
      email: editing.email?.trim() || null,
      address: editing.address || '',
      district: editing.district || '',
      brand: editing.brand || wholesaleBrand,
      price_tier: editing.priceTier || 'P0',
      route_id: editing.routeId || null,
      credit_limit: editing.creditLimit || 0,
      parent_client_id: editing.parentClientId || null,
      salesperson_id: editing.salespersonId || null,
      payment_terms_days: editing.paymentTermsDays || 0,
      payment_terms_type: editing.paymentTermsType || 'cod',
      discount_percent: editing.discountPercent || 0,
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
      c.phone.includes(q) ||
      (c.clientCode || '').toLowerCase().includes(q);
  });

  const groupedClients = useMemo(() => {
    const parentMap = new Map<string, WholesaleClient>();
    const childrenMap = new Map<string, WholesaleClient[]>();
    const standalone: WholesaleClient[] = [];

    for (const c of filteredClients) {
      if (!c.parentClientId) {
        const hasChildren = filteredClients.some(x => x.parentClientId === c.id);
        if (hasChildren) {
          parentMap.set(c.id, c);
          if (!childrenMap.has(c.id)) childrenMap.set(c.id, []);
        } else {
          standalone.push(c);
        }
      } else {
        if (!childrenMap.has(c.parentClientId)) childrenMap.set(c.parentClientId, []);
        childrenMap.get(c.parentClientId)!.push(c);
        if (!parentMap.has(c.parentClientId)) {
          const parent = clients.find(x => x.id === c.parentClientId);
          if (parent) parentMap.set(c.parentClientId, parent);
        }
      }
    }

    const groups: { parent: WholesaleClient; children: WholesaleClient[] }[] = [];
    for (const [pid, parent] of parentMap) {
      groups.push({ parent, children: childrenMap.get(pid) || [] });
    }
    groups.sort((a, b) => (a.parent.clientCode || '').localeCompare(b.parent.clientCode || ''));

    return { groups, standalone };
  }, [filteredClients, clients]);

  const getRouteName = (routeId?: string | null) => {
    if (!routeId) return '—';
    return routes.find(r => r.id === routeId)?.name || '—';
  };

  const getSalesRepName = (id?: string | null) => {
    if (!id) return '';
    return salesReps.find(r => r.id === id)?.name || '';
  };

  const formatPaymentTerms = (days: number, type: PaymentTermsType) => {
    if (type === 'cod') return 'C.O.D.';
    return `${PAYMENT_TERMS_LABELS[type]} ${days}天`;
  };

  const parentOptions = clients.filter(c => !c.parentClientId);

  const allTierOptions = ['P0', ...priceTiers.map(t => t.name)];
  const brandMeta = WHOLESALE_BRAND_META[wholesaleBrand];

  const toggleGroup = (parentId: string) => {
    setExpandedGroups(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const renderClientCard = (client: WholesaleClient, isBranch = false) => (
    <div key={client.id} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group ${isBranch ? 'ml-6 border-l-4 border-l-blue-200' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            {client.clientCode && (
              <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{client.clientCode}</span>
            )}
            <h4 className="text-sm font-black text-slate-900 truncate">{client.companyName}</h4>
          </div>
          {client.contactName && <p className="text-xs text-slate-400 font-bold">{client.contactName}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setEditing({ ...client, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit size={13} /></button>
          <button onClick={() => handleDelete(client.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black">
          <Tag size={9} /> {client.priceTier}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-black">
          <Truck size={9} /> {getRouteName(client.routeId)}
        </span>
        {client.paymentTermsType !== 'cod' && (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black">
            {formatPaymentTerms(client.paymentTermsDays, client.paymentTermsType)}
          </span>
        )}
        {client.salespersonId && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black">
            <UserCircle size={9} /> {getSalesRepName(client.salespersonId)}
          </span>
        )}
        {!client.isActive && (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-500 rounded-md text-[10px] font-black">停用</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold">
        {client.phone && <span className="flex items-center gap-1"><Phone size={10} /> {client.phone}</span>}
        {client.address && <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {client.address}</span>}
      </div>
    </div>
  );

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
              placeholder="搜尋公司/編號/聯絡人/電話..."
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold w-72"
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

      <div className="space-y-3">
        {/* Grouped clients (parent + branches) */}
        {groupedClients.groups.map(({ parent, children }) => {
          const isExpanded = expandedGroups[parent.id] !== false;
          return (
            <div key={parent.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleGroup(parent.id)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <Building2 size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs font-black text-slate-500">{parent.clientCode || parent.companyName} — {children.length} 間分店</span>
              </div>
              {renderClientCard(parent)}
              {isExpanded && (
                <div className="space-y-2">
                  {children.map(c => renderClientCard(c, true))}
                </div>
              )}
            </div>
          );
        })}

        {/* Standalone clients (no branches) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {groupedClients.standalone.map(c => renderClientCard(c))}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">{editing.isNew ? '新增批發客' : '編輯批發客'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Row 1: Code + Name */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">客戶編號</label>
                  <input value={editing.clientCode || ''} onChange={e => setEditing({ ...editing, clientCode: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm font-mono" placeholder="A0002-01" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">公司名稱 *</label>
                  <input value={editing.companyName || ''} onChange={e => setEditing({ ...editing, companyName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="XX 凍肉公司" />
                </div>
              </div>

              {/* Row 2: Contact + Phone + Fax */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人</label>
                  <input value={editing.contactName || ''} onChange={e => setEditing({ ...editing, contactName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="陳先生" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電話</label>
                  <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="9XXX XXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">傳真</label>
                  <input value={editing.fax || ''} onChange={e => setEditing({ ...editing, fax: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="2XXX XXXX" />
                </div>
              </div>

              {/* Row 3: Email + Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">電子郵件</label>
                  <input value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="info@company.com" />
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

              {/* Row 4: Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">地址</label>
                <input value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="九龍觀塘..." />
              </div>

              {/* Row 5: P tier, Route, Salesperson */}
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">銷售員</label>
                  <select
                    value={editing.salespersonId || ''}
                    onChange={e => setEditing({ ...editing, salespersonId: e.target.value || null })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                  >
                    <option value="">未指定</option>
                    {salesReps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 6: Payment terms + Credit + Discount */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">數期類型</label>
                  <select
                    value={editing.paymentTermsType || 'cod'}
                    onChange={e => setEditing({ ...editing, paymentTermsType: e.target.value as PaymentTermsType })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                  >
                    {Object.entries(PAYMENT_TERMS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">數期天數</label>
                  <input type="number" value={editing.paymentTermsDays || 0} onChange={e => setEditing({ ...editing, paymentTermsDays: +e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">信用額度</label>
                  <input type="number" value={editing.creditLimit || 0} onChange={e => setEditing({ ...editing, creditLimit: +e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">折扣 %</label>
                  <input type="number" value={editing.discountPercent || 0} onChange={e => setEditing({ ...editing, discountPercent: +e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" />
                </div>
              </div>

              {/* Row 7: Parent company */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">所屬總店（如為分店）</label>
                <select
                  value={editing.parentClientId || ''}
                  onChange={e => setEditing({ ...editing, parentClientId: e.target.value || null })}
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
                >
                  <option value="">無（此為獨立客戶或總店）</option>
                  {parentOptions.filter(c => c.id !== editing.id).map(c => (
                    <option key={c.id} value={c.id}>{c.clientCode ? `${c.clientCode} — ` : ''}{c.companyName}</option>
                  ))}
                </select>
              </div>

              {/* Row 8: Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
                <textarea value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} rows={2} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm resize-none" />
              </div>

              {/* Active toggle */}
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
