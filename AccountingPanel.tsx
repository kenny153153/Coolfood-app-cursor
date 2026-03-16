
import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingDown, TrendingUp, FileText, Settings,
  Plus, Edit, Trash2, Save, X, RefreshCw, Search,
  ChevronDown, Check, Calendar, DollarSign, AlertTriangle,
  Users, Download, Filter,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { WHOLESALE_BRAND_META } from './WorkspaceContext';
import type {
  Supplier, AccountPayable, AccountReceivable, ExpenseRecord,
  APStatus, ARStatus, ExpenseCategory, WholesaleBrand,
} from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SubTab = 'payable' | 'receivable' | 'expenses' | 'reports' | 'settings';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'salary', label: '人工', emoji: '👷' },
  { value: 'rent', label: '租金', emoji: '🏢' },
  { value: 'vehicle', label: '車輛', emoji: '🚛' },
  { value: 'packaging', label: '包裝', emoji: '📦' },
  { value: 'equipment', label: '設備', emoji: '🔧' },
  { value: 'license', label: '牌照', emoji: '📋' },
  { value: 'utilities', label: '水電煤', emoji: '💡' },
  { value: 'insurance', label: '保險', emoji: '🛡️' },
  { value: 'misc', label: '雜項', emoji: '📌' },
];

const AP_STATUS_MAP: Record<APStatus, { label: string; color: string }> = {
  unpaid: { label: '未付', color: 'bg-rose-50 text-rose-600' },
  partial: { label: '部份', color: 'bg-amber-50 text-amber-600' },
  paid: { label: '已付', color: 'bg-emerald-50 text-emerald-600' },
  overdue: { label: '逾期', color: 'bg-red-100 text-red-700' },
};

const AR_STATUS_MAP: Record<ARStatus, { label: string; color: string }> = {
  pending: { label: '待收', color: 'bg-amber-50 text-amber-600' },
  partial: { label: '部份', color: 'bg-blue-50 text-blue-600' },
  received: { label: '已收', color: 'bg-emerald-50 text-emerald-600' },
  overdue: { label: '逾期', color: 'bg-red-100 text-red-700' },
};

const AccountingPanel: React.FC<Props> = ({ showToast }) => {
  const [subTab, setSubTab] = useState<SubTab>('payable');
  const [loading, setLoading] = useState(true);

  // Data
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Filters
  const [apFilter, setApFilter] = useState<APStatus | 'all'>('all');
  const [arFilter, setArFilter] = useState<ARStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modals
  const [editingAP, setEditingAP] = useState<(Partial<AccountPayable> & { isNew?: boolean }) | null>(null);
  const [editingAR, setEditingAR] = useState<(Partial<AccountReceivable> & { isNew?: boolean }) | null>(null);
  const [editingExpense, setEditingExpense] = useState<(Partial<ExpenseRecord> & { isNew?: boolean }) | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<(Partial<Supplier> & { isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Data loading ──────────────────────────────────────────────

  const loadPayables = useCallback(async () => {
    const { data } = await supabase.from('accounts_payable').select('*').order('invoice_date', { ascending: false });
    if (data) setPayables(data.map(mapAP));
  }, []);

  const loadReceivables = useCallback(async () => {
    const { data } = await supabase.from('accounts_receivable').select('*').order('invoice_date', { ascending: false });
    if (data) setReceivables(data.map(mapAR));
  }, []);

  const loadExpenses = useCallback(async () => {
    const { data } = await supabase.from('expense_records').select('*').order('date', { ascending: false });
    if (data) setExpenses(data.map(mapExpense));
  }, []);

  const loadSuppliers = useCallback(async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) setSuppliers(data.map(mapSupplier));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPayables(), loadReceivables(), loadExpenses(), loadSuppliers()]);
    setLoading(false);
  }, [loadPayables, loadReceivables, loadExpenses, loadSuppliers]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Mappers ───────────────────────────────────────────────────

  const mapAP = (r: any): AccountPayable => ({
    id: r.id, supplierId: r.supplier_id, supplierName: r.supplier_name,
    invoiceNumber: r.invoice_number, invoiceDate: r.invoice_date,
    description: r.description, amount: r.amount, dueDate: r.due_date,
    status: r.status, paidAmount: r.paid_amount, paymentMethod: r.payment_method,
    paymentDate: r.payment_date, notes: r.notes, createdAt: r.created_at,
  });

  const mapAR = (r: any): AccountReceivable => ({
    id: r.id, clientId: r.client_id, clientName: r.client_name,
    brand: r.brand, orderId: r.order_id, invoiceDate: r.invoice_date,
    amount: r.amount, paidAmount: r.paid_amount, status: r.status,
    creditTerms: r.credit_terms, paymentMethod: r.payment_method,
    receivedDate: r.received_date, notes: r.notes, createdAt: r.created_at,
  });

  const mapExpense = (r: any): ExpenseRecord => ({
    id: r.id, category: r.category, description: r.description,
    amount: r.amount, type: r.type, date: r.date,
    isRecurring: r.is_recurring, recurringPeriod: r.recurring_period,
    notes: r.notes, createdAt: r.created_at,
  });

  const mapSupplier = (r: any): Supplier => ({
    id: r.id, name: r.name, contactName: r.contact_name,
    phone: r.phone, address: r.address, paymentTerms: r.payment_terms,
    notes: r.notes, isActive: r.is_active, createdAt: r.created_at,
  });

  // ── CRUD handlers ─────────────────────────────────────────────

  const handleSaveAP = async () => {
    if (!editingAP) return;
    setSaving(true);
    const payload = {
      supplier_id: editingAP.supplierId || null,
      supplier_name: editingAP.supplierName || '',
      invoice_number: editingAP.invoiceNumber || null,
      invoice_date: editingAP.invoiceDate || new Date().toISOString().slice(0, 10),
      description: editingAP.description || '',
      amount: editingAP.amount || 0,
      due_date: editingAP.dueDate || null,
      status: editingAP.status || 'unpaid',
      paid_amount: editingAP.paidAmount || 0,
      payment_method: editingAP.paymentMethod || null,
      payment_date: editingAP.paymentDate || null,
      notes: editingAP.notes || null,
    };
    if (editingAP.isNew) {
      const { error } = await supabase.from('accounts_payable').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('應付賬已新增');
    } else {
      const { error } = await supabase.from('accounts_payable').update(payload).eq('id', editingAP.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('應付賬已更新');
    }
    setEditingAP(null); setSaving(false); loadPayables();
  };

  const handleDeleteAP = async (id: string) => {
    if (!confirm('確定刪除此應付賬？')) return;
    await supabase.from('accounts_payable').delete().eq('id', id);
    showToast('已刪除'); loadPayables();
  };

  const handleConfirmAR = async (ar: AccountReceivable) => {
    const method = prompt('收款方式（FPS / 到付 / 數期 / 現金）：', 'FPS');
    if (!method) return;
    const { error } = await supabase.from('accounts_receivable').update({
      status: 'received',
      paid_amount: ar.amount,
      payment_method: method,
      received_date: new Date().toISOString().slice(0, 10),
    }).eq('id', ar.id);
    if (error) showToast(`失敗：${error.message}`, 'error');
    else { showToast('已確認收款'); loadReceivables(); }
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;
    setSaving(true);
    const payload = {
      category: editingExpense.category || 'misc',
      description: editingExpense.description || '',
      amount: editingExpense.amount || 0,
      type: editingExpense.type || 'expense',
      date: editingExpense.date || new Date().toISOString().slice(0, 10),
      is_recurring: editingExpense.isRecurring || false,
      recurring_period: editingExpense.recurringPeriod || null,
      notes: editingExpense.notes || null,
    };
    if (editingExpense.isNew) {
      const { error } = await supabase.from('expense_records').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('收支記錄已新增');
    } else {
      const { error } = await supabase.from('expense_records').update(payload).eq('id', editingExpense.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('收支記錄已更新');
    }
    setEditingExpense(null); setSaving(false); loadExpenses();
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('確定刪除此記錄？')) return;
    await supabase.from('expense_records').delete().eq('id', id);
    showToast('已刪除'); loadExpenses();
  };

  const handleSaveSupplier = async () => {
    if (!editingSupplier || !editingSupplier.name?.trim()) { showToast('請輸入供應商名稱', 'error'); return; }
    setSaving(true);
    const payload = {
      name: editingSupplier.name.trim(),
      contact_name: editingSupplier.contactName || null,
      phone: editingSupplier.phone || null,
      address: editingSupplier.address || null,
      payment_terms: editingSupplier.paymentTerms || 'cod',
      notes: editingSupplier.notes || null,
      is_active: editingSupplier.isActive ?? true,
    };
    if (editingSupplier.isNew) {
      const { error } = await supabase.from('suppliers').insert(payload);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('供應商已新增');
    } else {
      const { error } = await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id);
      if (error) { showToast(`失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('供應商已更新');
    }
    setEditingSupplier(null); setSaving(false); loadSuppliers();
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!confirm('確定刪除此供應商？')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    showToast('已刪除'); loadSuppliers();
  };

  // ── Computed ──────────────────────────────────────────────────

  const apUnpaidTotal = payables.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount - p.paidAmount, 0);
  const arPendingTotal = receivables.filter(r => r.status !== 'received').reduce((s, r) => s + r.amount - r.paidAmount, 0);
  const expenseMonthTotal = expenses.filter(e => e.type === 'expense' && e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.amount, 0);
  const incomeMonthTotal = expenses.filter(e => e.type === 'income' && e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.amount, 0);

  const filteredAP = payables.filter(p => apFilter === 'all' || p.status === apFilter).filter(p => !searchTerm || p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAR = receivables.filter(r => arFilter === 'all' || r.status === arFilter).filter(r => !searchTerm || r.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExpenses = expenses.filter(e => !searchTerm || e.description.toLowerCase().includes(searchTerm.toLowerCase()));

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {([
          { id: 'payable' as SubTab, label: '應付賬款', icon: <TrendingDown size={14} /> },
          { id: 'receivable' as SubTab, label: '應收賬款', icon: <TrendingUp size={14} /> },
          { id: 'expenses' as SubTab, label: '收支記錄', icon: <DollarSign size={14} /> },
          { id: 'reports' as SubTab, label: '報表', icon: <FileText size={14} /> },
          { id: 'settings' as SubTab, label: '設定', icon: <Settings size={14} /> },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSubTab(tab.id); setSearchTerm(''); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black transition-all ${
              subTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="應付未結" value={apUnpaidTotal} color="rose" />
        <SummaryCard label="應收未結" value={arPendingTotal} color="amber" />
        <SummaryCard label="本月支出" value={expenseMonthTotal} color="slate" />
        <SummaryCard label="本月收入" value={incomeMonthTotal} color="emerald" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {/* ═══ ACCOUNTS PAYABLE ═══ */}
          {subTab === 'payable' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋供應商..." />
                  <StatusFilter<APStatus | 'all'>
                    value={apFilter}
                    onChange={v => setApFilter(v)}
                    options={[{ value: 'all', label: '全部' }, ...Object.entries(AP_STATUS_MAP).map(([k, v]) => ({ value: k as APStatus, label: v.label }))]}
                  />
                </div>
                <button
                  onClick={() => setEditingAP({ isNew: true, invoiceDate: new Date().toISOString().slice(0, 10), status: 'unpaid', amount: 0, paidAmount: 0 })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
                >
                  <Plus size={14} /> 新增應付
                </button>
              </div>

              {filteredAP.length === 0 ? (
                <EmptyState message="暫無應付賬款記錄" />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3 text-left">供應商</th>
                        <th className="px-4 py-3 text-left">說明</th>
                        <th className="px-4 py-3 text-center">發票日</th>
                        <th className="px-4 py-3 text-center">到期日</th>
                        <th className="px-4 py-3 text-right">金額</th>
                        <th className="px-4 py-3 text-right">已付</th>
                        <th className="px-4 py-3 text-center">狀態</th>
                        <th className="px-4 py-3 w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAP.map(ap => (
                        <tr key={ap.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                          <td className="px-5 py-3 font-black text-slate-800">{ap.supplierName}</td>
                          <td className="px-4 py-3 text-slate-600 font-bold max-w-[200px] truncate">{ap.description}</td>
                          <td className="px-4 py-3 text-center text-slate-500 font-bold">{ap.invoiceDate}</td>
                          <td className="px-4 py-3 text-center text-slate-500 font-bold">{ap.dueDate || '—'}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">${ap.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-500">${ap.paidAmount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${AP_STATUS_MAP[ap.status].color}`}>
                              {AP_STATUS_MAP[ap.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingAP({ ...ap, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                              <button onClick={() => handleDeleteAP(ap.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ ACCOUNTS RECEIVABLE ═══ */}
          {subTab === 'receivable' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋客戶..." />
                  <StatusFilter<ARStatus | 'all'>
                    value={arFilter}
                    onChange={v => setArFilter(v)}
                    options={[{ value: 'all', label: '全部' }, ...Object.entries(AR_STATUS_MAP).map(([k, v]) => ({ value: k as ARStatus, label: v.label }))]}
                  />
                </div>
                <button
                  onClick={() => setEditingAR({ isNew: true, invoiceDate: new Date().toISOString().slice(0, 10), status: 'pending', amount: 0, paidAmount: 0 })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
                >
                  <Plus size={14} /> 新增應收
                </button>
              </div>

              {filteredAR.length === 0 ? (
                <EmptyState message="暫無應收賬款記錄" />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-5 py-3 text-left">客戶</th>
                        <th className="px-4 py-3 text-left">品牌</th>
                        <th className="px-4 py-3 text-center">單號</th>
                        <th className="px-4 py-3 text-center">發票日</th>
                        <th className="px-4 py-3 text-right">金額</th>
                        <th className="px-4 py-3 text-right">已收</th>
                        <th className="px-4 py-3 text-center">狀態</th>
                        <th className="px-4 py-3 w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAR.map(ar => {
                        const bMeta = ar.brand ? WHOLESALE_BRAND_META[ar.brand] : null;
                        return (
                          <tr key={ar.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                            <td className="px-5 py-3 font-black text-slate-800">{ar.clientName}</td>
                            <td className="px-4 py-3">
                              {bMeta ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${bMeta.colorClasses.accent} ${bMeta.colorClasses.text}`}>
                                  {bMeta.label}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{ar.orderId ? `#${ar.orderId.toString().slice(-6)}` : '—'}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{ar.invoiceDate}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">${ar.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-500">${ar.paidAmount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${AR_STATUS_MAP[ar.status].color}`}>
                                {AR_STATUS_MAP[ar.status].label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {ar.status !== 'received' && (
                                  <button onClick={() => handleConfirmAR(ar)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-500" title="確認收款">
                                    <Check size={13} />
                                  </button>
                                )}
                                <button onClick={() => setEditingAR({ ...ar, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══ EXPENSES / INCOME ═══ */}
          {subTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋收支..." />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingExpense({ isNew: true, type: 'expense', category: 'misc', date: new Date().toISOString().slice(0, 10), amount: 0, isRecurring: false })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700"
                  >
                    <TrendingDown size={14} /> 記支出
                  </button>
                  <button
                    onClick={() => setEditingExpense({ isNew: true, type: 'income', category: 'misc', date: new Date().toISOString().slice(0, 10), amount: 0, isRecurring: false })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700"
                  >
                    <TrendingUp size={14} /> 記收入
                  </button>
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <EmptyState message="暫無收支記錄" />
              ) : (
                <div className="space-y-2">
                  {filteredExpenses.map(exp => {
                    const catInfo = EXPENSE_CATEGORIES.find(c => c.value === exp.category);
                    return (
                      <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
                          {catInfo?.emoji || '📌'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm text-slate-900 truncate">{exp.description || catInfo?.label || '—'}</p>
                            {exp.isRecurring && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-black">定期</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">{exp.date} · {catInfo?.label || exp.category}</p>
                        </div>
                        <p className={`text-lg font-black ${exp.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {exp.type === 'income' ? '+' : '-'}${exp.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingExpense({ ...exp, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ REPORTS ═══ */}
          {subTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AP Summary */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-black text-sm flex items-center gap-2"><TrendingDown size={16} className="text-rose-500" /> 應付賬款摘要</h4>
                  <div className="space-y-2">
                    {Object.entries(AP_STATUS_MAP).map(([status, meta]) => {
                      const items = payables.filter(p => p.status === status);
                      const total = items.reduce((s, p) => s + p.amount, 0);
                      return (
                        <div key={status} className="flex items-center justify-between py-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${meta.color}`}>{meta.label}</span>
                          <div className="text-right">
                            <span className="font-black text-sm text-slate-800">${total.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-2">({items.length}筆)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AR Summary */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-black text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> 應收賬款摘要</h4>
                  <div className="space-y-2">
                    {Object.entries(AR_STATUS_MAP).map(([status, meta]) => {
                      const items = receivables.filter(r => r.status === status);
                      const total = items.reduce((s, r) => s + r.amount, 0);
                      return (
                        <div key={status} className="flex items-center justify-between py-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${meta.color}`}>{meta.label}</span>
                          <div className="text-right">
                            <span className="font-black text-sm text-slate-800">${total.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-2">({items.length}筆)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expense by category */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                  <h4 className="font-black text-sm flex items-center gap-2"><DollarSign size={16} className="text-slate-500" /> 本月支出分佈</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPENSE_CATEGORIES.map(cat => {
                      const total = expenses
                        .filter(e => e.type === 'expense' && e.category === cat.value && e.date.startsWith(new Date().toISOString().slice(0, 7)))
                        .reduce((s, e) => s + e.amount, 0);
                      return (
                        <div key={cat.value} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                          <span className="text-lg">{cat.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400">{cat.label}</p>
                            <p className="font-black text-sm text-slate-800">${total.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {subTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-lg text-slate-900">供應商管理</h4>
                  <p className="text-xs text-slate-400 font-bold">管理貨源供應商資料，方便入賬時快速選擇</p>
                </div>
                <button
                  onClick={() => setEditingSupplier({ isNew: true, isActive: true })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
                >
                  <Plus size={14} /> 新增供應商
                </button>
              </div>

              {suppliers.length === 0 ? (
                <EmptyState message="尚未建立供應商" />
              ) : (
                <div className="space-y-3">
                  {suppliers.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm text-slate-900">{s.name}</p>
                          {!s.isActive && <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-black">停用</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">{s.contactName || '—'} · {s.phone || '—'}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingSupplier({ ...s, isNew: false })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteSupplier(s.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ MODALS ═══ */}

      {/* AP Edit Modal */}
      {editingAP && (
        <Modal title={editingAP.isNew ? '新增應付賬款' : '編輯應付賬款'} onClose={() => setEditingAP(null)} onSave={handleSaveAP} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="供應商 *" value={editingAP.supplierName || ''} onChange={v => setEditingAP({ ...editingAP, supplierName: v })} />
            <FieldInput label="發票號" value={editingAP.invoiceNumber || ''} onChange={v => setEditingAP({ ...editingAP, invoiceNumber: v })} />
            <FieldInput label="發票日期 *" type="date" value={editingAP.invoiceDate || ''} onChange={v => setEditingAP({ ...editingAP, invoiceDate: v })} />
            <FieldInput label="到期日" type="date" value={editingAP.dueDate || ''} onChange={v => setEditingAP({ ...editingAP, dueDate: v })} />
            <FieldInput label="金額 *" type="number" value={editingAP.amount?.toString() || '0'} onChange={v => setEditingAP({ ...editingAP, amount: parseFloat(v) || 0 })} />
            <FieldInput label="已付金額" type="number" value={editingAP.paidAmount?.toString() || '0'} onChange={v => setEditingAP({ ...editingAP, paidAmount: parseFloat(v) || 0 })} />
            <div className="col-span-2">
              <FieldInput label="說明" value={editingAP.description || ''} onChange={v => setEditingAP({ ...editingAP, description: v })} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">狀態</label>
              <select value={editingAP.status || 'unpaid'} onChange={e => setEditingAP({ ...editingAP, status: e.target.value as APStatus })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                {Object.entries(AP_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* AR Edit Modal */}
      {editingAR && (
        <Modal title={editingAR.isNew ? '新增應收賬款' : '編輯應收賬款'} onClose={() => setEditingAR(null)} onSave={async () => {
          if (!editingAR) return;
          setSaving(true);
          const payload = {
            client_name: editingAR.clientName || '',
            brand: editingAR.brand || null,
            order_id: editingAR.orderId || null,
            invoice_date: editingAR.invoiceDate || new Date().toISOString().slice(0, 10),
            amount: editingAR.amount || 0,
            paid_amount: editingAR.paidAmount || 0,
            status: editingAR.status || 'pending',
            credit_terms: editingAR.creditTerms || 'cod',
            notes: editingAR.notes || null,
          };
          if (editingAR.isNew) {
            await supabase.from('accounts_receivable').insert(payload);
            showToast('已新增');
          } else {
            await supabase.from('accounts_receivable').update(payload).eq('id', editingAR.id);
            showToast('已更新');
          }
          setEditingAR(null); setSaving(false); loadReceivables();
        }} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="客戶名稱 *" value={editingAR.clientName || ''} onChange={v => setEditingAR({ ...editingAR, clientName: v })} />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">品牌</label>
              <select value={editingAR.brand || ''} onChange={e => setEditingAR({ ...editingAR, brand: (e.target.value || undefined) as WholesaleBrand | undefined })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                <option value="">—</option>
                <option value="GHFOODS">進興</option>
                <option value="COOLFOOD">Coolfood</option>
              </select>
            </div>
            <FieldInput label="發票日期" type="date" value={editingAR.invoiceDate || ''} onChange={v => setEditingAR({ ...editingAR, invoiceDate: v })} />
            <FieldInput label="金額 *" type="number" value={editingAR.amount?.toString() || '0'} onChange={v => setEditingAR({ ...editingAR, amount: parseFloat(v) || 0 })} />
            <FieldInput label="已收金額" type="number" value={editingAR.paidAmount?.toString() || '0'} onChange={v => setEditingAR({ ...editingAR, paidAmount: parseFloat(v) || 0 })} />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">狀態</label>
              <select value={editingAR.status || 'pending'} onChange={e => setEditingAR({ ...editingAR, status: e.target.value as ARStatus })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                {Object.entries(AR_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Expense Edit Modal */}
      {editingExpense && (
        <Modal title={editingExpense.isNew ? (editingExpense.type === 'income' ? '記錄收入' : '記錄支出') : '編輯收支'} onClose={() => setEditingExpense(null)} onSave={handleSaveExpense} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">類別</label>
              <select value={editingExpense.category || 'misc'} onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseCategory })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <FieldInput label="金額 *" type="number" value={editingExpense.amount?.toString() || '0'} onChange={v => setEditingExpense({ ...editingExpense, amount: parseFloat(v) || 0 })} />
            <FieldInput label="日期 *" type="date" value={editingExpense.date || ''} onChange={v => setEditingExpense({ ...editingExpense, date: v })} />
            <div className="flex items-end gap-2">
              <button
                onClick={() => setEditingExpense({ ...editingExpense, isRecurring: !editingExpense.isRecurring })}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-black ${editingExpense.isRecurring ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
              >
                <Check size={14} /> 定期
              </button>
              {editingExpense.isRecurring && (
                <select value={editingExpense.recurringPeriod || 'monthly'} onChange={e => setEditingExpense({ ...editingExpense, recurringPeriod: e.target.value as any })} className="p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-xs">
                  <option value="monthly">每月</option>
                  <option value="quarterly">每季</option>
                  <option value="yearly">每年</option>
                </select>
              )}
            </div>
            <div className="col-span-2">
              <FieldInput label="說明" value={editingExpense.description || ''} onChange={v => setEditingExpense({ ...editingExpense, description: v })} />
            </div>
          </div>
        </Modal>
      )}

      {/* Supplier Edit Modal */}
      {editingSupplier && (
        <Modal title={editingSupplier.isNew ? '新增供應商' : '編輯供應商'} onClose={() => setEditingSupplier(null)} onSave={handleSaveSupplier} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="名稱 *" value={editingSupplier.name || ''} onChange={v => setEditingSupplier({ ...editingSupplier, name: v })} />
            <FieldInput label="聯絡人" value={editingSupplier.contactName || ''} onChange={v => setEditingSupplier({ ...editingSupplier, contactName: v })} />
            <FieldInput label="電話" value={editingSupplier.phone || ''} onChange={v => setEditingSupplier({ ...editingSupplier, phone: v })} />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">付款條件</label>
              <select value={editingSupplier.paymentTerms || 'cod'} onChange={e => setEditingSupplier({ ...editingSupplier, paymentTerms: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                <option value="cod">到付</option>
                <option value="7days">7天數期</option>
                <option value="14days">14天數期</option>
                <option value="30days">30天數期</option>
                <option value="60days">60天數期</option>
              </select>
            </div>
            <div className="col-span-2">
              <FieldInput label="地址" value={editingSupplier.address || ''} onChange={v => setEditingSupplier({ ...editingSupplier, address: v })} />
            </div>
            <div className="col-span-2">
              <FieldInput label="備註" value={editingSupplier.notes || ''} onChange={v => setEditingSupplier({ ...editingSupplier, notes: v })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── Shared sub-components ──────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-slate-900 mt-1">${value.toLocaleString()}</p>
    </div>
  );
};

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 w-52"
    />
  </div>
);

function StatusFilter<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${
            value === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
    <Wallet size={32} className="text-slate-200 mx-auto mb-3" />
    <p className="text-slate-400 font-bold">{message}</p>
  </div>
);

const Modal: React.FC<{ title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode }> = ({ title, onClose, onSave, saving, children }) => (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-[2rem]">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
      </div>
      <div className="p-6">{children}</div>
      <div className="flex justify-end gap-3 p-6 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-[2rem]">
        <button onClick={onClose} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
        </button>
      </div>
    </div>
  </div>
);

const FieldInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm outline-none focus:border-blue-300"
    />
  </div>
);

export default AccountingPanel;
