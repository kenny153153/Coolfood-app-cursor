import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Edit, Trash2, Save, X, Search,
  Send, Check, Copy, ArrowRight, Calendar, RefreshCw,
  ChevronDown, Eye, Printer,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { WholesaleBrand, Quotation, QuotationStatus, QuotationLineItem } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface ClientOption {
  id: string;
  companyName: string;
  brand: WholesaleBrand;
  clientCode: string;
  priceTier: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

const STATUS_MAP: Record<QuotationStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  sent: { label: '已發送', color: 'bg-blue-50 text-blue-600' },
  accepted: { label: '已接受', color: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: '已拒絕', color: 'bg-rose-50 text-rose-600' },
  expired: { label: '已過期', color: 'bg-amber-50 text-amber-600' },
  converted: { label: '已轉訂單', color: 'bg-violet-50 text-violet-600' },
};

const EMPTY_LINE: QuotationLineItem = {
  productName: '', qty: 0, unit: '磅', unitPrice: 0, lineTotal: 0,
};

const QuotationPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand } = useWorkspace();

  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<(Partial<Quotation> & { isNew?: boolean; lines?: QuotationLineItem[] }) | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [qRes, cRes, pRes] = await Promise.all([
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
      supabase.from('wholesale_clients').select('id, company_name, brand, client_code, price_tier').eq('is_active', true),
      supabase.from('products').select('id, name, price').order('name'),
    ]);

    if (qRes.data) {
      setQuotes(qRes.data.map((r: any) => ({
        id: r.id,
        quoteNumber: r.quote_number || '',
        clientId: r.client_id,
        clientName: r.client_name || '',
        clientCode: r.client_code || '',
        brand: r.brand,
        status: r.status || 'draft',
        quoteDate: r.quote_date || '',
        validUntil: r.valid_until || '',
        lineItems: r.line_items || [],
        subtotal: r.subtotal || 0,
        total: r.total || 0,
        notes: r.notes || '',
        convertedOrderId: r.converted_order_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })));
    }
    if (cRes.data) setClients(cRes.data.map((c: any) => ({ id: c.id, companyName: c.company_name, brand: c.brand, clientCode: c.client_code || '', priceTier: c.price_tier || 'P0' })));
    if (pRes.data) setProducts(pRes.data.map((p: any) => ({ id: p.id, name: p.name, price: p.price })));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    let list = quotes;
    if (statusFilter !== 'all') list = list.filter(q => q.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(q => q.clientName.toLowerCase().includes(s) || q.quoteNumber.toLowerCase().includes(s));
    }
    return list;
  }, [quotes, statusFilter, search]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const lines = (editing.lines || []).filter(l => l.productName);
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

    const payload = {
      quote_number: editing.quoteNumber || `QT-${Date.now()}`,
      client_id: editing.clientId || null,
      client_name: editing.clientName || '',
      client_code: editing.clientCode || null,
      brand: editing.brand || wholesaleBrand || null,
      status: editing.status || 'draft',
      quote_date: editing.quoteDate || new Date().toISOString().slice(0, 10),
      valid_until: editing.validUntil || null,
      line_items: lines,
      subtotal,
      total: subtotal,
      notes: editing.notes || null,
    };

    if (editing.isNew) {
      const { error } = await supabase.from('quotations').insert(payload);
      if (error) { showToast(`儲存失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('報價單已建立');
    } else {
      const { error } = await supabase.from('quotations').update(payload).eq('id', editing.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('報價單已更新');
    }
    setSaving(false);
    setEditing(null);
    loadData();
  };

  const handleConvertToOrder = async (quote: Quotation) => {
    if (quote.status === 'converted') { showToast('此報價單已轉為訂單', 'error'); return; }
    if (!confirm(`確認將報價單 ${quote.quoteNumber} 轉為訂單？`)) return;

    const lineItems = quote.lineItems.map(l => ({
      product_id: l.productId || '',
      name: l.productName,
      unit_price: l.unitPrice,
      qty: l.qty,
      line_total: l.lineTotal,
      unit: l.unit,
      processing_type_name: l.processingTypeName,
      processing_spec: l.processingSpec,
      line_note: l.lineNote,
    }));

    const orderPayload = {
      id: Date.now(),
      customer_name: quote.clientName,
      total: quote.total,
      subtotal: quote.subtotal,
      status: 'paid',
      order_date: new Date().toISOString(),
      items_count: lineItems.length,
      line_items: lineItems,
      order_type: 'wholesale',
      wholesale_brand: quote.brand,
      wholesale_client_id: quote.clientId,
      client_code: quote.clientCode,
      payment_method: 'credit',
    };

    const { data: orderData, error: orderErr } = await supabase.from('orders').insert(orderPayload).select('id').single();
    if (orderErr) { showToast(`訂單建立失敗：${orderErr.message}`, 'error'); return; }

    await supabase.from('quotations').update({ status: 'converted', converted_order_id: orderData.id?.toString() }).eq('id', quote.id);
    showToast(`報價單已轉為訂單 ORD-${orderData.id}`);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此報價單？')) return;
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) showToast(`刪除失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadData(); }
  };

  const updateLine = (idx: number, field: keyof QuotationLineItem, value: any) => {
    if (!editing) return;
    const lines = [...(editing.lines || [])];
    lines[idx] = { ...lines[idx], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      lines[idx].lineTotal = (lines[idx].qty || 0) * (lines[idx].unitPrice || 0);
    }
    setEditing({ ...editing, lines });
  };

  const addLine = () => {
    if (!editing) return;
    setEditing({ ...editing, lines: [...(editing.lines || []), { ...EMPTY_LINE }] });
  };

  const removeLine = (idx: number) => {
    if (!editing) return;
    const lines = [...(editing.lines || [])];
    lines.splice(idx, 1);
    setEditing({ ...editing, lines });
  };

  const startNew = () => {
    const d = new Date();
    const validUntil = new Date(d);
    validUntil.setDate(validUntil.getDate() + 30);
    setEditing({
      isNew: true,
      quoteNumber: `QT-${Date.now()}`,
      clientName: '',
      brand: wholesaleBrand,
      status: 'draft',
      quoteDate: d.toISOString().slice(0, 10),
      validUntil: validUntil.toISOString().slice(0, 10),
      lines: [{ ...EMPTY_LINE }],
      notes: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="text-violet-500" /> 報價單管理
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">建立、發送報價單並轉換為訂單</p>
        </div>
        <button onClick={startNew}
          className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-violet-500 transition-colors">
          <Plus size={16} /> 新增報價單
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索客戶或報價編號..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-violet-300" />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['all', 'draft', 'sent', 'accepted', 'converted', 'rejected', 'expired'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              {s === 'all' ? '全部' : STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw size={24} className="animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
          <FileText className="mx-auto text-slate-200 mb-4" size={48} />
          <p className="text-sm text-slate-400 font-bold">尚無報價單</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3 text-left">報價編號</th>
                <th className="px-4 py-3 text-left">客戶</th>
                <th className="px-4 py-3 text-center">狀態</th>
                <th className="px-4 py-3 text-left">日期</th>
                <th className="px-4 py-3 text-left">有效至</th>
                <th className="px-4 py-3 text-right">金額</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-mono font-bold text-violet-600 text-xs">{q.quoteNumber}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{q.clientCode ? `(${q.clientCode}) ` : ''}{q.clientName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${STATUS_MAP[q.status]?.color || ''}`}>
                      {STATUS_MAP[q.status]?.label || q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-bold">{q.quoteDate}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-bold">{q.validUntil || '—'}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">${q.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditing({ ...q, isNew: false, lines: [...q.lineItems] })}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="編輯">
                        <Edit size={14} />
                      </button>
                      {(q.status === 'accepted' || q.status === 'sent') && (
                        <button onClick={() => handleConvertToOrder(q)}
                          className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-500" title="轉為訂單">
                          <ArrowRight size={14} />
                        </button>
                      )}
                      {q.status === 'draft' && (
                        <button onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-400" title="刪除">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-[9000] flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">{editing.isNew ? '新增報價單' : '編輯報價單'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">客戶名稱 *</label>
                <select value={editing.clientId || ''} onChange={e => {
                  const c = clients.find(cl => cl.id === e.target.value);
                  if (c) setEditing(prev => prev ? { ...prev, clientId: c.id, clientName: c.companyName, clientCode: c.clientCode, brand: c.brand } : null);
                }} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-300">
                  <option value="">— 選擇客戶 —</option>
                  {clients.filter(c => !wholesaleBrand || c.brand === wholesaleBrand).map(c => (
                    <option key={c.id} value={c.id}>{c.clientCode ? `(${c.clientCode}) ` : ''}{c.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">狀態</label>
                <select value={editing.status || 'draft'} onChange={e => setEditing(prev => prev ? { ...prev, status: e.target.value as QuotationStatus } : null)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-300">
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">報價日期</label>
                <input type="date" value={editing.quoteDate || ''} onChange={e => setEditing(prev => prev ? { ...prev, quoteDate: e.target.value } : null)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-300" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">有效至</label>
                <input type="date" value={editing.validUntil || ''} onChange={e => setEditing(prev => prev ? { ...prev, validUntil: e.target.value } : null)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-300" />
              </div>
            </div>

            {/* Line items */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">報價項目</h4>
                <button onClick={addLine} className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-500">
                  <Plus size={12} /> 新增行
                </button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">產品</th>
                    <th className="px-3 py-2 text-center w-20">數量</th>
                    <th className="px-3 py-2 text-center w-16">單位</th>
                    <th className="px-3 py-2 text-center w-24">單價 ($)</th>
                    <th className="px-3 py-2 text-right w-24">小計</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {(editing.lines || []).map((line, idx) => (
                    <tr key={idx} className="border-t border-slate-50">
                      <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input value={line.productName} onChange={e => updateLine(idx, 'productName', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none" placeholder="產品名稱" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" value={line.qty || ''} onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none text-center" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input value={line.unit || ''} onChange={e => updateLine(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none text-center" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input type="number" step="0.01" value={line.unitPrice || ''} onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none text-center" />
                      </td>
                      <td className="px-3 py-2 text-right font-black text-slate-800">${line.lineTotal.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeLine(idx)} className="p-1 rounded hover:bg-rose-50 text-rose-400"><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-4">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 mr-4">合計</span>
                <span className="text-xl font-black text-slate-900">
                  ${(editing.lines || []).reduce((s, l) => s + l.lineTotal, 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">備註</label>
              <textarea value={editing.notes || ''} onChange={e => setEditing(prev => prev ? { ...prev, notes: e.target.value } : null)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-300 resize-none h-16" placeholder="報價條款、付款方式等" />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-colors">取消</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-black hover:bg-violet-500 disabled:opacity-50 transition-colors">
                <Save size={14} /> {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPanel;
