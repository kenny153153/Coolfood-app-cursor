
import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingDown, TrendingUp, FileText,
  Plus, Edit, Trash2, Save, X, RefreshCw, Search,
  ChevronDown, Check, Calendar, DollarSign, AlertTriangle,
  Users, Download, Filter, UserCircle, BookOpen,
  Star, Building2, Phone, Mail, CreditCard, Copy,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { WHOLESALE_BRAND_META } from './WorkspaceContext';
import type {
  AccountPayable, AccountReceivable, ExpenseRecord,
  APStatus, ARStatus, ExpenseCategory, WholesaleBrand, Supplier,
  SalesCommission, CommissionStatus,
  AccountingAccount, AccountingContact, PaymentTemplate,
  AccountType, ContactType,
} from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SubTab = 'payable' | 'receivable' | 'expenses' | 'commissions' | 'reports' | 'directory';

type DirectorySection = 'accounts' | 'contacts' | 'templates';

const ACCOUNT_TYPE_MAP: Record<AccountType, { label: string; color: string }> = {
  bank: { label: '銀行', color: 'bg-blue-50 text-blue-600' },
  cash: { label: '現金', color: 'bg-emerald-50 text-emerald-600' },
  expense: { label: '支出', color: 'bg-rose-50 text-rose-600' },
  revenue: { label: '收入', color: 'bg-green-50 text-green-600' },
  payable: { label: '應付', color: 'bg-amber-50 text-amber-600' },
  receivable: { label: '應收', color: 'bg-teal-50 text-teal-600' },
  other: { label: '其他', color: 'bg-slate-100 text-slate-500' },
};

const CONTACT_TYPE_MAP: Record<ContactType, { label: string; color: string }> = {
  supplier: { label: '供應商', color: 'bg-blue-50 text-blue-600' },
  client: { label: '客戶', color: 'bg-emerald-50 text-emerald-600' },
  employee: { label: '員工', color: 'bg-violet-50 text-violet-600' },
  government: { label: '政府', color: 'bg-amber-50 text-amber-600' },
  landlord: { label: '業主', color: 'bg-orange-50 text-orange-600' },
  other: { label: '其他', color: 'bg-slate-100 text-slate-500' },
};

const COMMISSION_STATUS_MAP: Record<CommissionStatus, { label: string; color: string }> = {
  pending: { label: '待批', color: 'bg-amber-50 text-amber-600' },
  approved: { label: '已批', color: 'bg-blue-50 text-blue-600' },
  paid: { label: '已付', color: 'bg-emerald-50 text-emerald-600' },
};

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
  const [commissions, setCommissions] = useState<SalesCommission[]>([]);

  // Directory data
  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [contacts, setContacts] = useState<AccountingContact[]>([]);
  const [templates, setTemplates] = useState<PaymentTemplate[]>([]);
  const [dirSection, setDirSection] = useState<DirectorySection>('contacts');

  // Filters
  const [apFilter, setApFilter] = useState<APStatus | 'all'>('all');
  const [arFilter, setArFilter] = useState<ARStatus | 'all'>('all');
  const [commFilter, setCommFilter] = useState<CommissionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modals
  const [editingAP, setEditingAP] = useState<(Partial<AccountPayable> & { isNew?: boolean }) | null>(null);
  const [editingAR, setEditingAR] = useState<(Partial<AccountReceivable> & { isNew?: boolean }) | null>(null);
  const [editingExpense, setEditingExpense] = useState<(Partial<ExpenseRecord> & { isNew?: boolean }) | null>(null);
  const [editingAccount, setEditingAccount] = useState<(Partial<AccountingAccount> & { isNew?: boolean }) | null>(null);
  const [editingContact, setEditingContact] = useState<(Partial<AccountingContact> & { isNew?: boolean }) | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<(Partial<PaymentTemplate> & { isNew?: boolean }) | null>(null);
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

  const loadCommissions = useCallback(async () => {
    const { data } = await supabase.from('sales_commissions').select('*').order('order_date', { ascending: false });
    if (data) setCommissions(data.map(mapCommission));
  }, []);

  const loadAccounts = useCallback(async () => {
    const { data } = await supabase.from('accounting_accounts').select('*').order('account_code');
    if (data) setAccounts(data.map(mapAccount));
  }, []);

  const loadContacts = useCallback(async () => {
    const { data } = await supabase.from('accounting_contacts').select('*').order('is_frequent', { ascending: false }).order('name');
    if (data) setContacts(data.map(mapContact));
  }, []);

  const loadTemplates = useCallback(async () => {
    const { data } = await supabase.from('payment_templates').select('*').order('template_name');
    if (data) setTemplates(data.map(mapTemplate));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPayables(), loadReceivables(), loadExpenses(), loadSuppliers(), loadCommissions(), loadAccounts(), loadContacts(), loadTemplates()]);
    setLoading(false);
  }, [loadPayables, loadReceivables, loadExpenses, loadSuppliers, loadCommissions, loadAccounts, loadContacts, loadTemplates]);

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

  const mapCommission = (r: any): SalesCommission => ({
    id: r.id, salespersonId: r.salesperson_id, salespersonName: r.salesperson_name,
    clientId: r.client_id, clientName: r.client_name, brand: r.brand,
    orderId: r.order_id, orderDate: r.order_date, orderAmount: r.order_amount,
    priceTier: r.price_tier, commissionRate: r.commission_rate,
    commissionAmount: r.commission_amount, status: r.status,
    approvedBy: r.approved_by, approvedAt: r.approved_at,
    paidDate: r.paid_date, paymentMethod: r.payment_method,
    notes: r.notes, createdAt: r.created_at,
  });

  const mapAccount = (r: any): AccountingAccount => ({
    id: r.id, accountCode: r.account_code, accountName: r.account_name,
    accountType: r.account_type, bankName: r.bank_name,
    bankAccountNumber: r.bank_account_number, currency: r.currency,
    isDefault: r.is_default, notes: r.notes, isActive: r.is_active,
    createdAt: r.created_at,
  });

  const mapContact = (r: any): AccountingContact => ({
    id: r.id, name: r.name, contactType: r.contact_type,
    contactPerson: r.contact_person, phone: r.phone, email: r.email,
    bankName: r.bank_name, bankAccountNumber: r.bank_account_number,
    bankAccountName: r.bank_account_name, fpsId: r.fps_id,
    defaultPaymentMethod: r.default_payment_method, address: r.address,
    notes: r.notes, isFrequent: r.is_frequent, isActive: r.is_active,
    createdAt: r.created_at,
  });

  const mapTemplate = (r: any): PaymentTemplate => ({
    id: r.id, templateName: r.template_name, contactId: r.contact_id,
    contactName: r.contact_name, accountId: r.account_id,
    accountName: r.account_name, defaultAmount: r.default_amount,
    category: r.category, description: r.description, notes: r.notes,
    createdAt: r.created_at,
  });

  // ── Commission handlers ─────────────────────────────────────────

  const handleApproveCommission = async (comm: SalesCommission) => {
    const { error } = await supabase.from('sales_commissions')
      .update({ status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', comm.id);
    if (error) showToast(`批核失敗：${error.message}`, 'error');
    else { showToast('佣金已批核'); loadCommissions(); }
  };

  const handlePayCommission = async (comm: SalesCommission) => {
    const method = prompt('付款方式（FPS / 現金 / 轉帳）：', 'FPS');
    if (!method) return;
    const { error } = await supabase.from('sales_commissions')
      .update({ status: 'paid', paid_date: new Date().toISOString().slice(0, 10), payment_method: method })
      .eq('id', comm.id);
    if (error) showToast(`付款失敗：${error.message}`, 'error');
    else { showToast('佣金已標記為已付'); loadCommissions(); }
  };

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

  // Supplier CRUD moved to WarehousePanel

  // ── Directory CRUD ──────────────────────────────────────────────

  const handleSaveAccount = async () => {
    if (!editingAccount) return;
    setSaving(true);
    const payload = {
      account_code: editingAccount.accountCode || '',
      account_name: editingAccount.accountName || '',
      account_type: editingAccount.accountType || 'other',
      bank_name: editingAccount.bankName || null,
      bank_account_number: editingAccount.bankAccountNumber || null,
      currency: editingAccount.currency || 'HKD',
      is_default: editingAccount.isDefault || false,
      notes: editingAccount.notes || null,
      is_active: editingAccount.isActive !== false,
    };
    if (editingAccount.isNew) {
      const { error } = await supabase.from('accounting_accounts').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('帳戶已新增');
    } else {
      const { error } = await supabase.from('accounting_accounts').update(payload).eq('id', editingAccount.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('帳戶已更新');
    }
    setEditingAccount(null); setSaving(false); loadAccounts();
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('確定刪除此帳戶？')) return;
    await supabase.from('accounting_accounts').delete().eq('id', id);
    showToast('已刪除'); loadAccounts();
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;
    setSaving(true);
    const payload = {
      name: editingContact.name || '',
      contact_type: editingContact.contactType || 'other',
      contact_person: editingContact.contactPerson || null,
      phone: editingContact.phone || null,
      email: editingContact.email || null,
      bank_name: editingContact.bankName || null,
      bank_account_number: editingContact.bankAccountNumber || null,
      bank_account_name: editingContact.bankAccountName || null,
      fps_id: editingContact.fpsId || null,
      default_payment_method: editingContact.defaultPaymentMethod || null,
      address: editingContact.address || null,
      notes: editingContact.notes || null,
      is_frequent: editingContact.isFrequent || false,
      is_active: editingContact.isActive !== false,
    };
    if (editingContact.isNew) {
      const { error } = await supabase.from('accounting_contacts').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('聯絡人已新增');
    } else {
      const { error } = await supabase.from('accounting_contacts').update(payload).eq('id', editingContact.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('聯絡人已更新');
    }
    setEditingContact(null); setSaving(false); loadContacts();
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('確定刪除此聯絡人？')) return;
    await supabase.from('accounting_contacts').delete().eq('id', id);
    showToast('已刪除'); loadContacts();
  };

  const handleToggleFrequent = async (c: AccountingContact) => {
    await supabase.from('accounting_contacts').update({ is_frequent: !c.isFrequent }).eq('id', c.id);
    loadContacts();
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    const payload = {
      template_name: editingTemplate.templateName || '',
      contact_id: editingTemplate.contactId || null,
      contact_name: editingTemplate.contactName || '',
      account_id: editingTemplate.accountId || null,
      account_name: editingTemplate.accountName || '',
      default_amount: editingTemplate.defaultAmount || null,
      category: editingTemplate.category || null,
      description: editingTemplate.description || null,
      notes: editingTemplate.notes || null,
    };
    if (editingTemplate.isNew) {
      const { error } = await supabase.from('payment_templates').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('範本已新增');
    } else {
      const { error } = await supabase.from('payment_templates').update(payload).eq('id', editingTemplate.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('範本已更新');
    }
    setEditingTemplate(null); setSaving(false); loadTemplates();
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('確定刪除此範本？')) return;
    await supabase.from('payment_templates').delete().eq('id', id);
    showToast('已刪除'); loadTemplates();
  };

  const handleUseTemplate = (tpl: PaymentTemplate) => {
    const contact = tpl.contactId ? contacts.find(c => c.id === tpl.contactId) : null;
    setEditingAP({
      isNew: true,
      supplierName: tpl.contactName || contact?.name || '',
      description: tpl.description || tpl.templateName,
      amount: tpl.defaultAmount || 0,
      paidAmount: 0,
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: 'unpaid',
      notes: tpl.notes || undefined,
    });
    setSubTab('payable');
  };

  // ── Computed ──────────────────────────────────────────────────

  const apUnpaidTotal = payables.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount - p.paidAmount, 0);
  const arPendingTotal = receivables.filter(r => r.status !== 'received').reduce((s, r) => s + r.amount - r.paidAmount, 0);
  const expenseMonthTotal = expenses.filter(e => e.type === 'expense' && e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.amount, 0);
  const incomeMonthTotal = expenses.filter(e => e.type === 'income' && e.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, e) => s + e.amount, 0);

  const commPendingTotal = commissions.filter(c => c.status !== 'paid').reduce((s, c) => s + c.commissionAmount, 0);

  const filteredAP = payables.filter(p => apFilter === 'all' || p.status === apFilter).filter(p => !searchTerm || p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAR = receivables.filter(r => arFilter === 'all' || r.status === arFilter).filter(r => !searchTerm || r.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExpenses = expenses.filter(e => !searchTerm || e.description.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCommissions = commissions.filter(c => commFilter === 'all' || c.status === commFilter).filter(c => !searchTerm || c.salespersonName.toLowerCase().includes(searchTerm.toLowerCase()) || c.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredAccounts = accounts.filter(a => !searchTerm || a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || a.accountCode.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredContacts = contacts.filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTemplates = templates.filter(t => !searchTerm || t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) || t.contactName.toLowerCase().includes(searchTerm.toLowerCase()));

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {([
          { id: 'payable' as SubTab, label: '應付賬款', icon: <TrendingDown size={14} /> },
          { id: 'receivable' as SubTab, label: '應收賬款', icon: <TrendingUp size={14} /> },
          { id: 'expenses' as SubTab, label: '收支記錄', icon: <DollarSign size={14} /> },
          { id: 'commissions' as SubTab, label: '佣金', icon: <UserCircle size={14} /> },
          { id: 'reports' as SubTab, label: '報表', icon: <FileText size={14} /> },
          { id: 'directory' as SubTab, label: '常用資料', icon: <BookOpen size={14} /> },
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

          {/* ═══ COMMISSIONS ═══ */}
          {subTab === 'commissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋銷售員/客戶..." />
                  <StatusFilter<CommissionStatus | 'all'>
                    value={commFilter}
                    onChange={v => setCommFilter(v)}
                    options={[
                      { value: 'all', label: '全部' },
                      ...Object.entries(COMMISSION_STATUS_MAP).map(([k, v]) => ({ value: k as CommissionStatus, label: v.label })),
                    ]}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-black text-slate-400">
                    待付佣金: <span className="text-amber-600">${commPendingTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {filteredCommissions.length === 0 ? (
                <EmptyState message="尚無佣金記錄" />
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-5 py-3">銷售員</th>
                        <th className="text-left px-3 py-3">客戶</th>
                        <th className="text-left px-3 py-3">訂單日期</th>
                        <th className="text-left px-3 py-3">P 等級</th>
                        <th className="text-right px-3 py-3">訂單金額</th>
                        <th className="text-right px-3 py-3">佣金率</th>
                        <th className="text-right px-3 py-3">佣金</th>
                        <th className="text-center px-3 py-3">狀態</th>
                        <th className="text-right px-5 py-3">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommissions.map(comm => (
                        <tr key={comm.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-black text-slate-800">{comm.salespersonName}</td>
                          <td className="px-3 py-3 font-bold text-slate-600">{comm.clientName}</td>
                          <td className="px-3 py-3 text-slate-500">{comm.orderDate || '—'}</td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">{comm.priceTier}</span>
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-600">${comm.orderAmount.toLocaleString()}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-500">{comm.commissionRate}%</td>
                          <td className="px-3 py-3 text-right font-black text-slate-800">${comm.commissionAmount.toLocaleString()}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${COMMISSION_STATUS_MAP[comm.status]?.color || ''}`}>
                              {COMMISSION_STATUS_MAP[comm.status]?.label || comm.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {comm.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveCommission(comm)}
                                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black hover:bg-blue-100"
                                >
                                  批核
                                </button>
                              )}
                              {comm.status === 'approved' && (
                                <button
                                  onClick={() => handlePayCommission(comm)}
                                  className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black hover:bg-emerald-100"
                                >
                                  付款
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

          {/* ═══ DIRECTORY (常用資料) ═══ */}
          {subTab === 'directory' && (
            <div className="space-y-4">
              {/* Inner section toggle */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    {([
                      { id: 'contacts' as DirectorySection, label: '聯絡人' },
                      { id: 'accounts' as DirectorySection, label: '帳戶' },
                      { id: 'templates' as DirectorySection, label: '付款範本' },
                    ]).map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setDirSection(s.id); setSearchTerm(''); }}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${dirSection === s.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋..." />
                </div>
                <button
                  onClick={() => {
                    if (dirSection === 'contacts') setEditingContact({ isNew: true, contactType: 'supplier', isFrequent: false, isActive: true });
                    else if (dirSection === 'accounts') setEditingAccount({ isNew: true, accountType: 'bank', isActive: true, currency: 'HKD' });
                    else setEditingTemplate({ isNew: true, contactName: '', accountName: '' });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800"
                >
                  <Plus size={14} /> {dirSection === 'contacts' ? '新增聯絡人' : dirSection === 'accounts' ? '新增帳戶' : '新增範本'}
                </button>
              </div>

              {/* ── Contacts ── */}
              {dirSection === 'contacts' && (
                filteredContacts.length === 0 ? <EmptyState message="暫無聯絡人" /> : (
                  <div className="space-y-2">
                    {filteredContacts.map(c => (
                      <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 group hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                          <Users size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-sm text-slate-900">{c.name}</p>
                            {c.isFrequent && <Star size={12} className="text-amber-400 fill-amber-400" />}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${CONTACT_TYPE_MAP[c.contactType]?.color || ''}`}>
                              {CONTACT_TYPE_MAP[c.contactType]?.label || c.contactType}
                            </span>
                            {!c.isActive && <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-400">停用</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-bold">
                            {c.contactPerson && <span className="flex items-center gap-1"><UserCircle size={11} /> {c.contactPerson}</span>}
                            {c.phone && <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>}
                            {c.email && <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>}
                            {c.fpsId && <span className="flex items-center gap-1"><CreditCard size={11} /> FPS: {c.fpsId}</span>}
                            {c.bankName && <span className="flex items-center gap-1"><Building2 size={11} /> {c.bankName}{c.bankAccountNumber ? ` · ${c.bankAccountNumber}` : ''}</span>}
                            {c.defaultPaymentMethod && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[9px] font-black">{c.defaultPaymentMethod}</span>}
                          </div>
                          {c.address && <p className="text-[10px] text-slate-400 mt-1 truncate">{c.address}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => handleToggleFrequent(c)} className={`p-1.5 rounded-lg hover:bg-amber-50 ${c.isFrequent ? 'text-amber-400' : 'text-slate-300'}`} title="常用">
                            <Star size={13} />
                          </button>
                          <button onClick={() => setEditingContact({ ...c, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                          <button onClick={() => handleDeleteContact(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Accounts ── */}
              {dirSection === 'accounts' && (
                filteredAccounts.length === 0 ? <EmptyState message="暫無帳戶" /> : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-5 py-3 text-left">編號</th>
                          <th className="px-4 py-3 text-left">名稱</th>
                          <th className="px-4 py-3 text-center">類型</th>
                          <th className="px-4 py-3 text-left">銀行</th>
                          <th className="px-4 py-3 text-left">帳號</th>
                          <th className="px-4 py-3 text-center">幣種</th>
                          <th className="px-4 py-3 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.map(a => (
                          <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                            <td className="px-5 py-3 font-black text-blue-600">{a.accountCode}</td>
                            <td className="px-4 py-3 font-black text-slate-800">
                              {a.accountName}
                              {a.isDefault && <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-500 rounded text-[9px] font-black">預設</span>}
                              {!a.isActive && <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black">停用</span>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ACCOUNT_TYPE_MAP[a.accountType]?.color || ''}`}>
                                {ACCOUNT_TYPE_MAP[a.accountType]?.label || a.accountType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 font-bold">{a.bankName || '—'}</td>
                            <td className="px-4 py-3 text-slate-500 font-bold">{a.bankAccountNumber || '—'}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{a.currency || 'HKD'}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingAccount({ ...a, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                                <button onClick={() => handleDeleteAccount(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── Templates ── */}
              {dirSection === 'templates' && (
                filteredTemplates.length === 0 ? <EmptyState message="暫無付款範本" /> : (
                  <div className="space-y-2">
                    {filteredTemplates.map(tpl => (
                      <div key={tpl.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Copy size={18} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-slate-900">{tpl.templateName}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 font-bold mt-0.5">
                            {tpl.contactName && <span>收款人: {tpl.contactName}</span>}
                            {tpl.accountName && <span>帳戶: {tpl.accountName}</span>}
                            {tpl.category && <span>分類: {EXPENSE_CATEGORIES.find(c => c.value === tpl.category)?.label || tpl.category}</span>}
                            {tpl.description && <span className="text-slate-400 truncate max-w-[200px]">{tpl.description}</span>}
                          </div>
                        </div>
                        {tpl.defaultAmount != null && tpl.defaultAmount > 0 && (
                          <p className="text-lg font-black text-slate-800">${tpl.defaultAmount.toLocaleString()}</p>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => handleUseTemplate(tpl)} className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-100" title="使用此範本新增應付">
                            使用
                          </button>
                          <button onClick={() => setEditingTemplate({ ...tpl, isNew: false })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={13} /></button>
                          <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
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
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">供應商 *</label>
              <div className="flex gap-2">
                <input
                  value={editingAP.supplierName || ''}
                  onChange={e => setEditingAP({ ...editingAP, supplierName: e.target.value })}
                  placeholder="輸入或從常用選擇"
                  className="flex-1 p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm outline-none focus:border-blue-300"
                />
                {contacts.filter(c => c.isActive).length > 0 && (
                  <select
                    value=""
                    onChange={e => {
                      const c = contacts.find(ct => ct.id === e.target.value);
                      if (c) setEditingAP({ ...editingAP, supplierName: c.name });
                    }}
                    className="w-10 p-2 bg-slate-50 rounded-xl border border-slate-100 text-sm cursor-pointer"
                    title="從常用聯絡人選擇"
                  >
                    <option value="">📋</option>
                    {contacts.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>
            </div>
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
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">客戶名稱 *</label>
              <div className="flex gap-2">
                <input
                  value={editingAR.clientName || ''}
                  onChange={e => setEditingAR({ ...editingAR, clientName: e.target.value })}
                  placeholder="輸入或從常用選擇"
                  className="flex-1 p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm outline-none focus:border-blue-300"
                />
                {contacts.filter(c => c.isActive && c.contactType === 'client').length > 0 && (
                  <select
                    value=""
                    onChange={e => {
                      const c = contacts.find(ct => ct.id === e.target.value);
                      if (c) setEditingAR({ ...editingAR, clientName: c.name });
                    }}
                    className="w-10 p-2 bg-slate-50 rounded-xl border border-slate-100 text-sm cursor-pointer"
                    title="從常用聯絡人選擇"
                  >
                    <option value="">📋</option>
                    {contacts.filter(c => c.isActive && c.contactType === 'client').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>
            </div>
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

      {/* Account Edit Modal */}
      {editingAccount && (
        <Modal title={editingAccount.isNew ? '新增帳戶' : '編輯帳戶'} onClose={() => setEditingAccount(null)} onSave={handleSaveAccount} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="帳戶編號 *" value={editingAccount.accountCode || ''} onChange={v => setEditingAccount({ ...editingAccount, accountCode: v })} placeholder="如 1001" />
            <FieldInput label="帳戶名稱 *" value={editingAccount.accountName || ''} onChange={v => setEditingAccount({ ...editingAccount, accountName: v })} placeholder="如 恒生銀行" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">類型</label>
              <select value={editingAccount.accountType || 'other'} onChange={e => setEditingAccount({ ...editingAccount, accountType: e.target.value as AccountType })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                {Object.entries(ACCOUNT_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <FieldInput label="幣種" value={editingAccount.currency || 'HKD'} onChange={v => setEditingAccount({ ...editingAccount, currency: v })} />
            <FieldInput label="銀行名稱" value={editingAccount.bankName || ''} onChange={v => setEditingAccount({ ...editingAccount, bankName: v })} />
            <FieldInput label="銀行帳號" value={editingAccount.bankAccountNumber || ''} onChange={v => setEditingAccount({ ...editingAccount, bankAccountNumber: v })} />
            <div className="col-span-2 flex items-center gap-4">
              <button
                onClick={() => setEditingAccount({ ...editingAccount, isDefault: !editingAccount.isDefault })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${editingAccount.isDefault ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}
              >
                <Star size={14} /> 預設帳戶
              </button>
              <button
                onClick={() => setEditingAccount({ ...editingAccount, isActive: !editingAccount.isActive })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${editingAccount.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
              >
                <Check size={14} /> {editingAccount.isActive !== false ? '啟用中' : '已停用'}
              </button>
            </div>
            <div className="col-span-2">
              <FieldInput label="備註" value={editingAccount.notes || ''} onChange={v => setEditingAccount({ ...editingAccount, notes: v })} />
            </div>
          </div>
        </Modal>
      )}

      {/* Contact Edit Modal */}
      {editingContact && (
        <Modal title={editingContact.isNew ? '新增聯絡人' : '編輯聯絡人'} onClose={() => setEditingContact(null)} onSave={handleSaveContact} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="名稱 *" value={editingContact.name || ''} onChange={v => setEditingContact({ ...editingContact, name: v })} placeholder="公司或個人名稱" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">類型</label>
              <select value={editingContact.contactType || 'other'} onChange={e => setEditingContact({ ...editingContact, contactType: e.target.value as ContactType })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                {Object.entries(CONTACT_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <FieldInput label="聯絡人" value={editingContact.contactPerson || ''} onChange={v => setEditingContact({ ...editingContact, contactPerson: v })} />
            <FieldInput label="電話" value={editingContact.phone || ''} onChange={v => setEditingContact({ ...editingContact, phone: v })} />
            <FieldInput label="電郵" value={editingContact.email || ''} onChange={v => setEditingContact({ ...editingContact, email: v })} />
            <FieldInput label="FPS 識別碼" value={editingContact.fpsId || ''} onChange={v => setEditingContact({ ...editingContact, fpsId: v })} placeholder="電話/電郵/FPS ID" />
            <FieldInput label="銀行名稱" value={editingContact.bankName || ''} onChange={v => setEditingContact({ ...editingContact, bankName: v })} />
            <FieldInput label="銀行帳號" value={editingContact.bankAccountNumber || ''} onChange={v => setEditingContact({ ...editingContact, bankAccountNumber: v })} />
            <FieldInput label="帳戶持有人" value={editingContact.bankAccountName || ''} onChange={v => setEditingContact({ ...editingContact, bankAccountName: v })} />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">常用付款方式</label>
              <select value={editingContact.defaultPaymentMethod || ''} onChange={e => setEditingContact({ ...editingContact, defaultPaymentMethod: e.target.value || undefined })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                <option value="">—</option>
                <option value="FPS">FPS</option>
                <option value="支票">支票</option>
                <option value="銀行轉帳">銀行轉帳</option>
                <option value="現金">現金</option>
                <option value="到付">到付</option>
              </select>
            </div>
            <div className="col-span-2">
              <FieldInput label="地址" value={editingContact.address || ''} onChange={v => setEditingContact({ ...editingContact, address: v })} />
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <button
                onClick={() => setEditingContact({ ...editingContact, isFrequent: !editingContact.isFrequent })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${editingContact.isFrequent ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}
              >
                <Star size={14} /> 常用
              </button>
              <button
                onClick={() => setEditingContact({ ...editingContact, isActive: editingContact.isActive === false ? true : false })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${editingContact.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
              >
                <Check size={14} /> {editingContact.isActive !== false ? '啟用中' : '已停用'}
              </button>
            </div>
            <div className="col-span-2">
              <FieldInput label="備註" value={editingContact.notes || ''} onChange={v => setEditingContact({ ...editingContact, notes: v })} />
            </div>
          </div>
        </Modal>
      )}

      {/* Template Edit Modal */}
      {editingTemplate && (
        <Modal title={editingTemplate.isNew ? '新增付款範本' : '編輯付款範本'} onClose={() => setEditingTemplate(null)} onSave={handleSaveTemplate} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FieldInput label="範本名稱 *" value={editingTemplate.templateName || ''} onChange={v => setEditingTemplate({ ...editingTemplate, templateName: v })} placeholder="如「每月租金」「水費」" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">聯絡人</label>
              <select
                value={editingTemplate.contactId || ''}
                onChange={e => {
                  const sel = contacts.find(c => c.id === e.target.value);
                  setEditingTemplate({ ...editingTemplate, contactId: e.target.value || undefined, contactName: sel?.name || '' });
                }}
                className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
              >
                <option value="">— 選擇聯絡人 —</option>
                {contacts.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">帳戶</label>
              <select
                value={editingTemplate.accountId || ''}
                onChange={e => {
                  const sel = accounts.find(a => a.id === e.target.value);
                  setEditingTemplate({ ...editingTemplate, accountId: e.target.value || undefined, accountName: sel?.accountName || '' });
                }}
                className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
              >
                <option value="">— 選擇帳戶 —</option>
                {accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.id}>{a.accountCode} · {a.accountName}</option>)}
              </select>
            </div>
            <FieldInput label="預設金額" type="number" value={editingTemplate.defaultAmount?.toString() || ''} onChange={v => setEditingTemplate({ ...editingTemplate, defaultAmount: parseFloat(v) || undefined })} />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">分類</label>
              <select value={editingTemplate.category || ''} onChange={e => setEditingTemplate({ ...editingTemplate, category: e.target.value || undefined })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm">
                <option value="">—</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <FieldInput label="說明" value={editingTemplate.description || ''} onChange={v => setEditingTemplate({ ...editingTemplate, description: v })} />
            </div>
            <div className="col-span-2">
              <FieldInput label="備註" value={editingTemplate.notes || ''} onChange={v => setEditingTemplate({ ...editingTemplate, notes: v })} />
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
