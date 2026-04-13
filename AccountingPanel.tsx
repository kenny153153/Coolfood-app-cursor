
import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingDown, TrendingUp, FileText,
  Plus, Edit, Trash2, Save, X, RefreshCw, Search,
  ChevronDown, Check, Calendar, DollarSign, AlertTriangle,
  Users, Download, Filter, UserCircle, BookOpen,
  Star, Building2, Phone, Mail, CreditCard, Copy,
  BarChart3, ChevronRight, Layers, ArrowUpDown, Eye, EyeOff, CornerDownRight,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { WHOLESALE_BRAND_META } from './WorkspaceContext';
import { buildStatementHtml } from './printUtils';
import { formatMoney } from './money';
import type { StatementData, StatementEntry } from './printUtils';
import type {
  AccountPayable, AccountReceivable, ExpenseRecord,
  APStatus, ARStatus, ExpenseCategory, WholesaleBrand, Supplier,
  SalesCommission, CommissionStatus,
  AccountingAccount, AccountingContact, PaymentTemplate,
  AccountType, ContactType,
  JournalEntry, JournalEntryLine,
} from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SubTab = 'payable' | 'receivable' | 'expenses' | 'commissions' | 'credit_debit' | 'journal' | 'reports' | 'directory';

type DirectorySection = 'accounts' | 'contacts' | 'templates';

type ReportSection = 'summary' | 'pnl' | 'trial' | 'ledger' | 'aging' | 'balance_sheet' | 'statements';

const ACCOUNT_TYPE_MAP: Record<AccountType, { label: string; color: string }> = {
  asset: { label: '資產', color: 'bg-sky-50 text-sky-600' },
  liability: { label: '負債', color: 'bg-pink-50 text-pink-600' },
  equity: { label: '權益', color: 'bg-purple-50 text-purple-600' },
  bank: { label: '銀行', color: 'bg-blue-50 text-blue-600' },
  cash: { label: '現金', color: 'bg-emerald-50 text-emerald-600' },
  expense: { label: '支出', color: 'bg-rose-50 text-rose-600' },
  revenue: { label: '收入', color: 'bg-green-50 text-green-600' },
  payable: { label: '應付', color: 'bg-amber-50 text-amber-600' },
  receivable: { label: '應收', color: 'bg-teal-50 text-teal-600' },
  other: { label: '其他', color: 'bg-slate-100 text-slate-500' },
};

const GL_ACCOUNTS = {
  bankCash:   { code: '1100', name: '銀行/現金' },
  ar:         { code: '1200', name: '應收賬款' },
  inventory:  { code: '1300', name: '存貨' },
  ap:         { code: '2100', name: '應付賬款' },
  sales:      { code: '4000', name: '銷售收入' },
  otherInc:   { code: '4100', name: '其他收入' },
  cogs:       { code: '5000', name: '銷售成本' },
} as const;

const EXPENSE_ACCT_MAP: Record<ExpenseCategory, { code: string; name: string }> = {
  salary:    { code: '6100', name: '人工' },
  rent:      { code: '6200', name: '租金' },
  vehicle:   { code: '6300', name: '車輛' },
  packaging: { code: '6400', name: '包裝' },
  equipment: { code: '6500', name: '設備' },
  license:   { code: '6600', name: '牌照' },
  utilities: { code: '6700', name: '水電煤' },
  insurance: { code: '6800', name: '保險' },
  misc:      { code: '6900', name: '雜項' },
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

  // Journal entries
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalLines, setJournalLines] = useState<JournalEntryLine[]>([]);

  // Filters
  const [apFilter, setApFilter] = useState<APStatus | 'all'>('all');
  const [arFilter, setArFilter] = useState<ARStatus | 'all'>('all');
  const [commFilter, setCommFilter] = useState<CommissionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Report state
  const [reportSection, setReportSection] = useState<ReportSection>('summary');
  const [pnlMonth, setPnlMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [pnlMode, setPnlMode] = useState<'month' | 'ytd'>('month');
  const [ledgerAccountCode, setLedgerAccountCode] = useState<string>('');
  const [detailExpanded, setDetailExpanded] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState(false);
  const [lockDate, setLockDate] = useState<string>('');
  const [lockDateInput, setLockDateInput] = useState<string>('');

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

  const loadJournalEntries = useCallback(async () => {
    const { data } = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false });
    if (data) setJournalEntries(data.map(mapJournalEntry));
  }, []);

  const loadJournalLines = useCallback(async () => {
    const { data } = await supabase.from('journal_entry_lines').select('*').order('created_at');
    if (data) setJournalLines(data.map(mapJournalEntryLine));
  }, []);

  const loadLockDate = useCallback(async () => {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'accounting_lock_date').maybeSingle();
    if (data?.value) { setLockDate(data.value); setLockDateInput(data.value); }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPayables(), loadReceivables(), loadExpenses(), loadSuppliers(), loadCommissions(), loadAccounts(), loadContacts(), loadTemplates(), loadJournalEntries(), loadJournalLines(), loadLockDate()]);
    setLoading(false);
  }, [loadPayables, loadReceivables, loadExpenses, loadSuppliers, loadCommissions, loadAccounts, loadContacts, loadTemplates, loadJournalEntries, loadJournalLines, loadLockDate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const isBeforeLockDate = (dateStr: string) => lockDate && dateStr <= lockDate;

  const saveLockDate = async () => {
    const { error } = await supabase.from('app_settings').upsert({ key: 'accounting_lock_date', value: lockDateInput }, { onConflict: 'key' });
    if (error) { showToast(`設定失敗：${error.message}`, 'error'); return; }
    setLockDate(lockDateInput);
    showToast('上鎖日期已更新');
  };

  // Statement month state
  const [stmtMonth, setStmtMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const handleGenerateARStatements = () => {
    const monthPrefix = stmtMonth;
    const clientNames = [...new Set(receivables.filter(r => r.invoiceDate.startsWith(monthPrefix)).map(r => r.clientName))];
    if (clientNames.length === 0) { showToast('該月份無應收帳款記錄', 'error'); return; }

    const statements: StatementData[] = clientNames.map(name => {
      const prevEntries = receivables.filter(r => r.clientName === name && r.invoiceDate < `${monthPrefix}-01`);
      const openingBalance = prevEntries.reduce((s, r) => s + r.amount - r.paidAmount, 0);
      const monthEntries = receivables.filter(r => r.clientName === name && r.invoiceDate.startsWith(monthPrefix));
      const entries: StatementEntry[] = monthEntries.map(r => ({
        date: r.invoiceDate,
        voucherNumber: r.voucherNumber,
        description: r.notes || `訂單 ${r.orderId || '—'}`,
        debit: r.amount,
        credit: r.paidAmount,
      }));
      const closingBalance = openingBalance + entries.reduce((s, e) => s + e.debit - e.credit, 0);
      const brand = monthEntries[0]?.brand;
      return {
        type: 'client' as const,
        name,
        statementMonth: monthPrefix,
        openingBalance,
        entries,
        closingBalance,
        businessLabel: brand === 'GHFOODS' ? '進興食品' : brand === 'COOLFOOD' ? 'Coolfood' : 'Coolfood',
      };
    });

    const html = buildStatementHtml(statements);
    const w = window.open('', '_blank');
    if (!w) { showToast('無法開啟列印視窗', 'error'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    showToast(`已生成 ${statements.length} 份客戶月結單`);
  };

  const handleGenerateAPStatements = () => {
    const monthPrefix = stmtMonth;
    const supplierNames = [...new Set(payables.filter(p => p.invoiceDate.startsWith(monthPrefix)).map(p => p.supplierName))];
    if (supplierNames.length === 0) { showToast('該月份無應付帳款記錄', 'error'); return; }

    const statements: StatementData[] = supplierNames.map(name => {
      const prevEntries = payables.filter(p => p.supplierName === name && p.invoiceDate < `${monthPrefix}-01`);
      const openingBalance = prevEntries.reduce((s, p) => s + p.amount - p.paidAmount, 0);
      const monthEntries = payables.filter(p => p.supplierName === name && p.invoiceDate.startsWith(monthPrefix));
      const entries: StatementEntry[] = monthEntries.map(p => ({
        date: p.invoiceDate,
        voucherNumber: p.voucherNumber,
        description: p.description || `發票 ${p.invoiceNumber || '—'}`,
        debit: p.paidAmount,
        credit: p.amount,
      }));
      const closingBalance = openingBalance + entries.reduce((s, e) => s + e.debit - e.credit, 0);
      return { type: 'supplier' as const, name, statementMonth: monthPrefix, openingBalance, entries, closingBalance, businessLabel: '' };
    });

    const html = buildStatementHtml(statements);
    const w = window.open('', '_blank');
    if (!w) { showToast('無法開啟列印視窗', 'error'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
    showToast(`已生成 ${statements.length} 份供應商月結單`);
  };

  // ── Mappers ───────────────────────────────────────────────────

  const mapAP = (r: any): AccountPayable => ({
    id: r.id, voucherNumber: r.voucher_number,
    supplierId: r.supplier_id, supplierName: r.supplier_name,
    invoiceNumber: r.invoice_number, invoiceDate: r.invoice_date,
    description: r.description, amount: r.amount, dueDate: r.due_date,
    status: r.status, paidAmount: r.paid_amount, paymentMethod: r.payment_method,
    paymentDate: r.payment_date, notes: r.notes, createdAt: r.created_at,
  });

  const mapAR = (r: any): AccountReceivable => ({
    id: r.id, voucherNumber: r.voucher_number,
    clientId: r.client_id, clientName: r.client_name,
    brand: r.brand, orderId: r.order_id, invoiceDate: r.invoice_date,
    amount: r.amount, paidAmount: r.paid_amount, status: r.status,
    creditTerms: r.credit_terms, paymentMethod: r.payment_method,
    receivedDate: r.received_date, notes: r.notes, createdAt: r.created_at,
  });

  const mapExpense = (r: any): ExpenseRecord => ({
    id: r.id, voucherNumber: r.voucher_number,
    category: r.category, description: r.description,
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
    accountType: r.account_type, parentId: r.parent_id, bankName: r.bank_name,
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

  const mapJournalEntry = (r: any): JournalEntry => ({
    id: r.id, voucherNumber: r.voucher_number, entryDate: r.entry_date,
    description: r.description, sourceType: r.source_type, sourceId: r.source_id,
    isPosted: r.is_posted, createdAt: r.created_at,
  });

  const mapJournalEntryLine = (r: any): JournalEntryLine => ({
    id: r.id, journalEntryId: r.journal_entry_id, accountId: r.account_id,
    accountCode: r.account_code, accountName: r.account_name,
    debit: Number(r.debit), credit: Number(r.credit),
    description: r.description, createdAt: r.created_at,
  });

  // ── Voucher number generation ──────────────────────────────────

  const generateVoucherNumber = async (prefix: string, table: string): Promise<string> => {
    const monthStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const likePattern = `${prefix}-${monthStr}-%`;
    const { data } = await supabase.from(table)
      .select('voucher_number')
      .like('voucher_number', likePattern)
      .order('voucher_number', { ascending: false })
      .limit(1);
    let seq = 1;
    if (data && data.length > 0 && data[0].voucher_number) {
      const parts = (data[0].voucher_number as string).split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `${prefix}-${monthStr}-${seq.toString().padStart(4, '0')}`;
  };

  // ── Journal entry auto-sync ────────────────────────────────────

  type JELine = { accountCode: string; accountName: string; debit: number; credit: number; description?: string };

  const syncJournalEntry = async (
    sourceType: string, sourceId: string, date: string,
    description: string, lines: JELine[],
  ) => {
    const { data: existing } = await supabase.from('journal_entries')
      .select('id').eq('source_type', sourceType).eq('source_id', sourceId);
    if (existing && existing.length > 0) {
      for (const je of existing) {
        await supabase.from('journal_entry_lines').delete().eq('journal_entry_id', je.id);
        await supabase.from('journal_entries').delete().eq('id', je.id);
      }
    }
    const validLines = lines.filter(l => l.debit > 0 || l.credit > 0);
    if (validLines.length === 0) return;
    const vn = await generateVoucherNumber('JE', 'journal_entries');
    const { data: newJE } = await supabase.from('journal_entries').insert({
      voucher_number: vn, entry_date: date, description,
      source_type: sourceType, source_id: sourceId,
    }).select('id').single();
    if (!newJE) return;
    await supabase.from('journal_entry_lines').insert(
      validLines.map(l => ({
        journal_entry_id: newJE.id, account_code: l.accountCode,
        account_name: l.accountName, debit: l.debit, credit: l.credit,
        description: l.description || null,
      }))
    );
  };

  const buildAPLines = (ap: { amount: number; paidAmount: number; supplierName: string }): JELine[] => [
    { accountCode: GL_ACCOUNTS.inventory.code, accountName: GL_ACCOUNTS.inventory.name, debit: ap.amount, credit: 0, description: ap.supplierName },
    ...(ap.amount - ap.paidAmount > 0 ? [{ accountCode: GL_ACCOUNTS.ap.code, accountName: GL_ACCOUNTS.ap.name, debit: 0, credit: ap.amount - ap.paidAmount }] : []),
    ...(ap.paidAmount > 0 ? [{ accountCode: GL_ACCOUNTS.bankCash.code, accountName: GL_ACCOUNTS.bankCash.name, debit: 0, credit: ap.paidAmount }] : []),
  ];

  const buildARLines = (ar: { amount: number; paidAmount: number; clientName: string }): JELine[] => [
    ...(ar.amount - ar.paidAmount > 0 ? [{ accountCode: GL_ACCOUNTS.ar.code, accountName: GL_ACCOUNTS.ar.name, debit: ar.amount - ar.paidAmount, credit: 0 }] : []),
    ...(ar.paidAmount > 0 ? [{ accountCode: GL_ACCOUNTS.bankCash.code, accountName: GL_ACCOUNTS.bankCash.name, debit: ar.paidAmount, credit: 0 }] : []),
    { accountCode: GL_ACCOUNTS.sales.code, accountName: GL_ACCOUNTS.sales.name, debit: 0, credit: ar.amount, description: ar.clientName },
  ];

  const buildExpenseLines = (exp: { type: string; category: ExpenseCategory; amount: number; description: string }): JELine[] => {
    if (exp.type === 'income') return [
      { accountCode: GL_ACCOUNTS.bankCash.code, accountName: GL_ACCOUNTS.bankCash.name, debit: exp.amount, credit: 0 },
      { accountCode: GL_ACCOUNTS.otherInc.code, accountName: GL_ACCOUNTS.otherInc.name, debit: 0, credit: exp.amount, description: exp.description },
    ];
    const acct = EXPENSE_ACCT_MAP[exp.category] || EXPENSE_ACCT_MAP.misc;
    return [
      { accountCode: acct.code, accountName: acct.name, debit: exp.amount, credit: 0, description: exp.description },
      { accountCode: GL_ACCOUNTS.bankCash.code, accountName: GL_ACCOUNTS.bankCash.name, debit: 0, credit: exp.amount },
    ];
  };

  const handleSyncAll = async () => {
    if (!confirm('此操作會重新產生所有日記帳憑單，確定繼續？')) return;
    setSyncing(true);
    try {
      for (const ap of payables) {
        await syncJournalEntry('ap', ap.id, ap.invoiceDate, `AP: ${ap.supplierName} - ${ap.description}`, buildAPLines(ap));
      }
      for (const ar of receivables) {
        await syncJournalEntry('ar', ar.id, ar.invoiceDate, `AR: ${ar.clientName}`, buildARLines(ar));
      }
      for (const exp of expenses) {
        await syncJournalEntry('expense', exp.id, exp.date, `${exp.type === 'income' ? 'INC' : 'EXP'}: ${exp.description}`, buildExpenseLines(exp));
      }
      await loadJournalEntries();
      await loadJournalLines();
      showToast('全部日記帳已同步完成');
    } catch {
      showToast('同步失敗', 'error');
    }
    setSyncing(false);
  };

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
    const apDate = editingAP.invoiceDate || new Date().toISOString().slice(0, 10);
    if (isBeforeLockDate(apDate)) { showToast(`日期 ${apDate} 在上鎖日期 (${lockDate}) 之前，無法儲存`, 'error'); return; }
    setSaving(true);
    const vn = editingAP.isNew ? await generateVoucherNumber('AP', 'accounts_payable') : (editingAP.voucherNumber || null);
    const payload = {
      voucher_number: vn,
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
    let savedId = editingAP.id;
    if (editingAP.isNew) {
      const { data, error } = await supabase.from('accounts_payable').insert(payload).select('id').single();
      if (error || !data) { showToast(`新增失敗：${error?.message}`, 'error'); setSaving(false); return; }
      savedId = data.id;
      showToast('應付賬已新增');
    } else {
      const { error } = await supabase.from('accounts_payable').update(payload).eq('id', editingAP.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('應付賬已更新');
    }
    if (savedId) {
      await syncJournalEntry('ap', savedId, payload.invoice_date,
        `AP: ${payload.supplier_name} - ${payload.description}`,
        buildAPLines({ amount: payload.amount, paidAmount: payload.paid_amount, supplierName: payload.supplier_name }));
      loadJournalEntries(); loadJournalLines();
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
    if (error) { showToast(`失敗：${error.message}`, 'error'); return; }
    showToast('已確認收款');
    await syncJournalEntry('ar', ar.id, ar.invoiceDate,
      `AR: ${ar.clientName}`,
      buildARLines({ amount: ar.amount, paidAmount: ar.amount, clientName: ar.clientName }));
    loadReceivables(); loadJournalEntries(); loadJournalLines();
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;
    const expDate = editingExpense.date || new Date().toISOString().slice(0, 10);
    if (isBeforeLockDate(expDate)) { showToast(`日期 ${expDate} 在上鎖日期 (${lockDate}) 之前，無法儲存`, 'error'); return; }
    setSaving(true);
    const vn = editingExpense.isNew ? await generateVoucherNumber('EX', 'expense_records') : (editingExpense.voucherNumber || null);
    const payload = {
      voucher_number: vn,
      category: editingExpense.category || 'misc',
      description: editingExpense.description || '',
      amount: editingExpense.amount || 0,
      type: editingExpense.type || 'expense',
      date: editingExpense.date || new Date().toISOString().slice(0, 10),
      is_recurring: editingExpense.isRecurring || false,
      recurring_period: editingExpense.recurringPeriod || null,
      notes: editingExpense.notes || null,
    };
    let savedId = editingExpense.id;
    if (editingExpense.isNew) {
      const { data, error } = await supabase.from('expense_records').insert(payload).select('id').single();
      if (error || !data) { showToast(`新增失敗：${error?.message}`, 'error'); setSaving(false); return; }
      savedId = data.id;
      showToast('收支記錄已新增');
    } else {
      const { error } = await supabase.from('expense_records').update(payload).eq('id', editingExpense.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSaving(false); return; }
      showToast('收支記錄已更新');
    }
    if (savedId) {
      await syncJournalEntry('expense', savedId, payload.date,
        `${payload.type === 'income' ? 'INC' : 'EXP'}: ${payload.description}`,
        buildExpenseLines({ type: payload.type, category: payload.category as ExpenseCategory, amount: payload.amount, description: payload.description }));
      loadJournalEntries(); loadJournalLines();
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
      parent_id: editingAccount.parentId || null,
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
          { id: 'credit_debit' as SubTab, label: '借/貸項通知', icon: <CreditCard size={14} /> },
          { id: 'journal' as SubTab, label: '日記帳', icon: <Layers size={14} /> },
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
                        <th className="px-5 py-3 text-left">憑單</th>
                        <th className="px-4 py-3 text-left">供應商</th>
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
                          <td className="px-5 py-3 text-[10px] font-bold text-blue-500 font-mono">{ap.voucherNumber || '—'}</td>
                          <td className="px-4 py-3 font-black text-slate-800">{ap.supplierName}</td>
                          <td className="px-4 py-3 text-slate-600 font-bold max-w-[200px] truncate">{ap.description}</td>
                          <td className="px-4 py-3 text-center text-slate-500 font-bold">{ap.invoiceDate}</td>
                          <td className="px-4 py-3 text-center text-slate-500 font-bold">{ap.dueDate || '—'}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(ap.amount)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-500">${formatMoney(ap.paidAmount)}</td>
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
                        <th className="px-5 py-3 text-left">憑單</th>
                        <th className="px-4 py-3 text-left">客戶</th>
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
                            <td className="px-5 py-3 text-[10px] font-bold text-blue-500 font-mono">{ar.voucherNumber || '—'}</td>
                            <td className="px-4 py-3 font-black text-slate-800">{ar.clientName}</td>
                            <td className="px-4 py-3">
                              {bMeta ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${bMeta.colorClasses.accent} ${bMeta.colorClasses.text}`}>
                                  {bMeta.label}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{ar.orderId ? `#${ar.orderId.toString().slice(-6)}` : '—'}</td>
                            <td className="px-4 py-3 text-center text-slate-500 font-bold">{ar.invoiceDate}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(ar.amount)}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-500">${formatMoney(ar.paidAmount)}</td>
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
                          <p className="text-[10px] text-slate-400 font-bold">{exp.voucherNumber && <span className="text-blue-500 font-mono mr-1.5">{exp.voucherNumber}</span>}{exp.date} · {catInfo?.label || exp.category}</p>
                        </div>
                        <p className={`text-lg font-black ${exp.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {exp.type === 'income' ? '+' : '-'}${formatMoney(exp.amount)}
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
                    待付佣金: <span className="text-amber-600">${formatMoney(commPendingTotal)}</span>
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
                          <td className="px-3 py-3 text-right font-bold text-slate-600">${formatMoney(comm.orderAmount)}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-500">{comm.commissionRate}%</td>
                          <td className="px-3 py-3 text-right font-black text-slate-800">${formatMoney(comm.commissionAmount)}</td>
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

          {/* ═══ CREDIT / DEBIT NOTES ═══ */}
          {subTab === 'credit_debit' && (() => {
            const notes = expenses.filter(e => e.type === 'credit_note' || e.type === 'debit_note');
            const creditNotes = notes.filter(e => e.type === 'credit_note');
            const debitNotes = notes.filter(e => e.type === 'debit_note');
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CreditCard className="text-violet-500" /> 借/貸項通知單</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingExpense({ isNew: true, type: 'credit_note', amount: 0, date: new Date().toISOString().slice(0, 10), category: 'misc', description: '', isRecurring: false })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 transition-colors">
                      <Plus size={14} /> 新增貸項通知 (Credit Note)
                    </button>
                    <button onClick={() => setEditingExpense({ isNew: true, type: 'debit_note', amount: 0, date: new Date().toISOString().slice(0, 10), category: 'misc', description: '', isRecurring: false })}
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-500 transition-colors">
                      <Plus size={14} /> 新增借項通知 (Debit Note)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-[2rem] border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">貸項通知 (Credit Notes)</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">${formatMoney(creditNotes.reduce((s, n) => s + n.amount, 0))}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{creditNotes.length} 筆</p>
                  </div>
                  <div className="bg-white p-5 rounded-[2rem] border border-rose-100 shadow-sm">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">借項通知 (Debit Notes)</p>
                    <p className="text-2xl font-black text-rose-700 mt-1">${formatMoney(debitNotes.reduce((s, n) => s + n.amount, 0))}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{debitNotes.length} 筆</p>
                  </div>
                </div>

                {notes.length === 0 ? (
                  <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                    <p className="text-sm text-slate-400 font-bold">尚無借/貸項通知</p>
                    <p className="text-xs text-slate-300 mt-1">貸項通知 (Credit Note) 用於退貨退款；借項通知 (Debit Note) 用於額外費用或調整</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-6 py-3 text-left">類型</th>
                          <th className="px-4 py-3 text-left">日期</th>
                          <th className="px-4 py-3 text-left">憑單</th>
                          <th className="px-4 py-3 text-left">說明</th>
                          <th className="px-4 py-3 text-right">金額</th>
                          <th className="px-4 py-3 text-center">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notes.sort((a, b) => b.date.localeCompare(a.date)).map(n => (
                          <tr key={n.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                            <td className="px-6 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${n.type === 'credit_note' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {n.type === 'credit_note' ? '貸項 CN' : '借項 DN'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs font-bold text-slate-600">{n.date}</td>
                            <td className="px-4 py-2.5 text-xs font-mono text-blue-500">{n.voucherNumber || '—'}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-800">{n.description}</td>
                            <td className={`px-4 py-2.5 text-right font-black ${n.type === 'credit_note' ? 'text-emerald-600' : 'text-rose-600'}`}>${formatMoney(n.amount)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <button onClick={() => setEditingExpense({ ...n, isNew: false })} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <Edit size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ═══ JOURNAL ENTRIES ═══ */}
          {subTab === 'journal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="搜尋憑單..." />
                <button
                  onClick={handleSyncAll}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 disabled:opacity-50"
                >
                  {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
                  {syncing ? '同步中...' : '同步全部日記帳'}
                </button>
              </div>

              {journalEntries.length === 0 ? (
                <EmptyState message="暫無日記帳記錄，按「同步全部」可從現有數據生成" />
              ) : (
                <div className="space-y-2">
                  {journalEntries
                    .filter(je => !searchTerm || je.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) || je.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(je => {
                      const lines = journalLines.filter(l => l.journalEntryId === je.id);
                      const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
                      const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
                      const isExpanded = detailExpanded[je.id];
                      return (
                        <div key={je.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                          <div
                            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50"
                            onClick={() => setDetailExpanded(prev => ({ ...prev, [je.id]: !prev[je.id] }))}
                          >
                            <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-blue-500">{je.voucherNumber}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{je.entryDate}</span>
                                {je.sourceType && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">{je.sourceType}</span>}
                              </div>
                              <p className="font-bold text-sm text-slate-700 truncate mt-0.5">{je.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] font-bold text-slate-400">借 <span className="text-slate-800 font-black">${formatMoney(totalDebit)}</span></p>
                              <p className="text-[10px] font-bold text-slate-400">貸 <span className="text-slate-800 font-black">${formatMoney(totalCredit)}</span></p>
                            </div>
                          </div>
                          {isExpanded && lines.length > 0 && (
                            <div className="border-t border-slate-100 bg-slate-50/50">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-2 text-left">帳戶編號</th>
                                    <th className="px-4 py-2 text-left">帳戶名稱</th>
                                    <th className="px-4 py-2 text-left">說明</th>
                                    <th className="px-4 py-2 text-right">借方</th>
                                    <th className="px-4 py-2 text-right">貸方</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lines.map(line => (
                                    <tr key={line.id} className="border-t border-slate-100/50">
                                      <td className="px-6 py-2 font-mono font-bold text-blue-600">{line.accountCode}</td>
                                      <td className="px-4 py-2 font-bold text-slate-700">{line.accountName}</td>
                                      <td className="px-4 py-2 text-slate-500">{line.description || '—'}</td>
                                      <td className="px-4 py-2 text-right font-black text-slate-800">{line.debit > 0 ? `$${formatMoney(line.debit)}` : ''}</td>
                                      <td className="px-4 py-2 text-right font-black text-slate-800">{line.credit > 0 ? `$${formatMoney(line.credit)}` : ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
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
              {/* Lock date + report tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 w-fit">
                {([
                  { id: 'summary' as ReportSection, label: '摘要', icon: <FileText size={12} /> },
                  { id: 'pnl' as ReportSection, label: '損益表', icon: <BarChart3 size={12} /> },
                  { id: 'balance_sheet' as ReportSection, label: '資產負債表', icon: <Layers size={12} /> },
                  { id: 'trial' as ReportSection, label: '試算表', icon: <ArrowUpDown size={12} /> },
                  { id: 'ledger' as ReportSection, label: '分類帳', icon: <BookOpen size={12} /> },
                  { id: 'aging' as ReportSection, label: '帳齡分析', icon: <Calendar size={12} /> },
                  { id: 'statements' as ReportSection, label: '月結單', icon: <Download size={12} /> },
                ]).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setReportSection(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${reportSection === s.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">上鎖日期</span>
                <input type="date" value={lockDateInput} onChange={e => setLockDateInput(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-blue-300 w-36" />
                <button onClick={saveLockDate} disabled={lockDateInput === lockDate}
                  className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black disabled:opacity-30 hover:bg-slate-800 transition-colors">
                  <Save size={12} />
                </button>
                {lockDate && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">{lockDate} 前已鎖定</span>}
              </div>
              </div>

              {/* ── Summary with detail toggle ── */}
              {reportSection === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AP Summary */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm flex items-center gap-2"><TrendingDown size={16} className="text-rose-500" /> 應付賬款摘要</h4>
                      <button onClick={() => setDetailExpanded(p => ({ ...p, rptAP: !p.rptAP }))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="切換明細">
                        {detailExpanded.rptAP ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {!detailExpanded.rptAP ? (
                      <div className="space-y-2">
                        {Object.entries(AP_STATUS_MAP).map(([status, meta]) => {
                          const items = payables.filter(p => p.status === status);
                          const total = items.reduce((s, p) => s + p.amount, 0);
                          return (
                            <div key={status} className="flex items-center justify-between py-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${meta.color}`}>{meta.label}</span>
                              <div className="text-right">
                                <span className="font-black text-sm text-slate-800">${formatMoney(total)}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-2">({items.length}筆)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {payables.map(ap => (
                          <div key={ap.id} className="flex items-center justify-between py-1 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${AP_STATUS_MAP[ap.status].color}`}>{AP_STATUS_MAP[ap.status].label}</span>
                              <span className="font-bold text-slate-700 truncate">{ap.supplierName}</span>
                              {ap.voucherNumber && <span className="text-[9px] font-mono text-blue-400">{ap.voucherNumber}</span>}
                            </div>
                            <span className="font-black text-slate-800 flex-shrink-0">${formatMoney(ap.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AR Summary */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> 應收賬款摘要</h4>
                      <button onClick={() => setDetailExpanded(p => ({ ...p, rptAR: !p.rptAR }))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="切換明細">
                        {detailExpanded.rptAR ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {!detailExpanded.rptAR ? (
                      <div className="space-y-2">
                        {Object.entries(AR_STATUS_MAP).map(([status, meta]) => {
                          const items = receivables.filter(r => r.status === status);
                          const total = items.reduce((s, r) => s + r.amount, 0);
                          return (
                            <div key={status} className="flex items-center justify-between py-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${meta.color}`}>{meta.label}</span>
                              <div className="text-right">
                                <span className="font-black text-sm text-slate-800">${formatMoney(total)}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-2">({items.length}筆)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {receivables.map(ar => (
                          <div key={ar.id} className="flex items-center justify-between py-1 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${AR_STATUS_MAP[ar.status].color}`}>{AR_STATUS_MAP[ar.status].label}</span>
                              <span className="font-bold text-slate-700 truncate">{ar.clientName}</span>
                              {ar.voucherNumber && <span className="text-[9px] font-mono text-blue-400">{ar.voucherNumber}</span>}
                            </div>
                            <span className="font-black text-slate-800 flex-shrink-0">${formatMoney(ar.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expense by category */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm flex items-center gap-2"><DollarSign size={16} className="text-slate-500" /> 本月支出分佈</h4>
                      <button onClick={() => setDetailExpanded(p => ({ ...p, rptExp: !p.rptExp }))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="切換明細">
                        {detailExpanded.rptExp ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {!detailExpanded.rptExp ? (
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
                                <p className="font-black text-sm text-slate-800">${formatMoney(total)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {EXPENSE_CATEGORIES.map(cat => {
                          const items = expenses.filter(e => e.type === 'expense' && e.category === cat.value && e.date.startsWith(new Date().toISOString().slice(0, 7)));
                          if (items.length === 0) return null;
                          return (
                            <div key={cat.value}>
                              <p className="text-[10px] font-black text-slate-400 mb-1">{cat.emoji} {cat.label} ({items.length}筆)</p>
                              {items.map(e => (
                                <div key={e.id} className="flex items-center justify-between py-0.5 text-xs pl-4">
                                  <span className="text-slate-600 font-bold truncate">{e.date} · {e.description || '—'}</span>
                                  <span className="font-black text-slate-800 flex-shrink-0">${formatMoney(e.amount)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── P&L (損益表) ── */}
              {reportSection === 'pnl' && (() => {
                const year = pnlMonth.slice(0, 4);
                const filterDate = (d: string) => pnlMode === 'month' ? d.startsWith(pnlMonth) : (d >= `${year}-01-01` && d <= `${pnlMonth}-31`);

                const salesRevenue = receivables.filter(ar => ar.status === 'received' && filterDate(ar.invoiceDate)).reduce((s, ar) => s + ar.paidAmount, 0);
                const otherIncome = expenses.filter(e => e.type === 'income' && filterDate(e.date)).reduce((s, e) => s + e.amount, 0);
                const totalRevenue = salesRevenue + otherIncome;
                const cogs = payables.filter(ap => filterDate(ap.invoiceDate)).reduce((s, ap) => s + ap.paidAmount, 0);
                const grossProfit = totalRevenue - cogs;
                const opexByCat = EXPENSE_CATEGORIES.map(cat => ({
                  ...cat,
                  total: expenses.filter(e => e.type === 'expense' && e.category === cat.value && filterDate(e.date)).reduce((s, e) => s + e.amount, 0),
                }));
                const totalOpex = opexByCat.reduce((s, c) => s + c.total, 0);
                const netProfit = grossProfit - totalOpex;
                const pct = (v: number) => totalRevenue > 0 ? `${(v / totalRevenue * 100).toFixed(1)}%` : '—';

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <input type="month" value={pnlMonth} onChange={e => setPnlMonth(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300" />
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button onClick={() => setPnlMode('month')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${pnlMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>本月</button>
                        <button onClick={() => setPnlMode('ytd')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${pnlMode === 'ytd' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>年度累計</button>
                      </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-3 text-left">項目</th>
                            <th className="px-4 py-3 text-right">金額 (HKD)</th>
                            <th className="px-4 py-3 text-right">佔收入%</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-100 bg-green-50/30">
                            <td className="px-6 py-2 font-black text-green-700 text-xs" colSpan={3}>收入 Revenue</td>
                          </tr>
                          <tr className="border-t border-slate-50">
                            <td className="px-6 py-2 pl-10 text-slate-600 font-bold">銷售收入</td>
                            <td className="px-4 py-2 text-right font-black text-slate-800">${formatMoney(salesRevenue)}</td>
                            <td className="px-4 py-2 text-right text-slate-500 font-bold">{pct(salesRevenue)}</td>
                          </tr>
                          <tr className="border-t border-slate-50">
                            <td className="px-6 py-2 pl-10 text-slate-600 font-bold">其他收入</td>
                            <td className="px-4 py-2 text-right font-black text-slate-800">${formatMoney(otherIncome)}</td>
                            <td className="px-4 py-2 text-right text-slate-500 font-bold">{pct(otherIncome)}</td>
                          </tr>
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-900">總收入</td>
                            <td className="px-4 py-2 text-right font-black text-slate-900">${formatMoney(totalRevenue)}</td>
                            <td className="px-4 py-2 text-right font-black text-slate-500">100%</td>
                          </tr>

                          <tr className="border-t border-slate-100 bg-amber-50/30">
                            <td className="px-6 py-2 font-black text-amber-700 text-xs" colSpan={3}>銷售成本 Cost of Goods Sold</td>
                          </tr>
                          <tr className="border-t border-slate-50">
                            <td className="px-6 py-2 pl-10 text-slate-600 font-bold">供應商採購</td>
                            <td className="px-4 py-2 text-right font-black text-slate-800">${formatMoney(cogs)}</td>
                            <td className="px-4 py-2 text-right text-slate-500 font-bold">{pct(cogs)}</td>
                          </tr>
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-900">毛利 Gross Profit</td>
                            <td className={`px-4 py-2 text-right font-black ${grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${formatMoney(grossProfit)}</td>
                            <td className="px-4 py-2 text-right font-black text-slate-500">{pct(grossProfit)}</td>
                          </tr>

                          <tr className="border-t border-slate-100 bg-rose-50/30">
                            <td className="px-6 py-2 font-black text-rose-700 text-xs" colSpan={3}>經營開支 Operating Expenses</td>
                          </tr>
                          {opexByCat.filter(c => c.total > 0).map(cat => (
                            <tr key={cat.value} className="border-t border-slate-50">
                              <td className="px-6 py-2 pl-10 text-slate-600 font-bold">{cat.emoji} {cat.label}</td>
                              <td className="px-4 py-2 text-right font-black text-slate-800">${formatMoney(cat.total)}</td>
                              <td className="px-4 py-2 text-right text-slate-500 font-bold">{pct(cat.total)}</td>
                            </tr>
                          ))}
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-900">總開支</td>
                            <td className="px-4 py-2 text-right font-black text-slate-900">${formatMoney(totalOpex)}</td>
                            <td className="px-4 py-2 text-right font-black text-slate-500">{pct(totalOpex)}</td>
                          </tr>

                          <tr className="border-t-2 border-slate-300 bg-slate-100">
                            <td className="px-6 py-3 font-black text-lg text-slate-900">淨利 / 虧損</td>
                            <td className={`px-4 py-3 text-right font-black text-lg ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${formatMoney(netProfit)}</td>
                            <td className="px-4 py-3 text-right font-black text-slate-500">{pct(netProfit)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* ── Trial Balance (試算表) ── */}
              {reportSection === 'trial' && (() => {
                const balanceMap: Record<string, { code: string; name: string; debit: number; credit: number }> = {};
                for (const line of journalLines) {
                  if (!balanceMap[line.accountCode]) balanceMap[line.accountCode] = { code: line.accountCode, name: line.accountName, debit: 0, credit: 0 };
                  balanceMap[line.accountCode].debit += line.debit;
                  balanceMap[line.accountCode].credit += line.credit;
                }
                const rows = Object.values(balanceMap).sort((a, b) => a.code.localeCompare(b.code));
                const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
                const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
                const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {isBalanced && rows.length > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
                          <Check size={12} /> 借貸平衡
                        </span>
                      )}
                      {!isBalanced && rows.length > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">
                          <AlertTriangle size={12} /> 借貸不平衡 (差額 ${formatMoney(Math.abs(totalDebit - totalCredit))})
                        </span>
                      )}
                      {rows.length === 0 && (
                        <span className="text-xs text-slate-400 font-bold">尚無日記帳數據，請先在「日記帳」頁面同步數據</span>
                      )}
                    </div>

                    {rows.length > 0 && (
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-3 text-left">帳戶編號</th>
                              <th className="px-4 py-3 text-left">帳戶名稱</th>
                              <th className="px-4 py-3 text-right">借方 Debit</th>
                              <th className="px-4 py-3 text-right">貸方 Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(row => (
                              <tr key={row.code} className="border-t border-slate-50 hover:bg-slate-50/50">
                                <td className="px-6 py-2.5 font-mono font-bold text-blue-600">{row.code}</td>
                                <td className="px-4 py-2.5 font-bold text-slate-700">{row.name}</td>
                                <td className="px-4 py-2.5 text-right font-black text-slate-800">{row.debit > 0 ? `$${formatMoney(row.debit)}` : ''}</td>
                                <td className="px-4 py-2.5 text-right font-black text-slate-800">{row.credit > 0 ? `$${formatMoney(row.credit)}` : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-300 bg-slate-100">
                              <td className="px-6 py-3 font-black text-slate-900" colSpan={2}>合計 Total</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(totalDebit)}</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(totalCredit)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Per-Account Ledger (分類帳) ── */}
              {reportSection === 'ledger' && (() => {
                const uniqueAccounts = Array.from(new Map(journalLines.map(l => [l.accountCode, { code: l.accountCode, name: l.accountName }])).values()).sort((a, b) => a.code.localeCompare(b.code));
                const selectedLines = ledgerAccountCode ? journalLines.filter(l => l.accountCode === ledgerAccountCode) : [];
                const relatedEntries = new Map(journalEntries.map(je => [je.id, je]));
                let runningBalance = 0;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={ledgerAccountCode}
                        onChange={e => setLedgerAccountCode(e.target.value)}
                        className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300 min-w-[200px]"
                      >
                        <option value="">— 選擇帳戶 —</option>
                        {uniqueAccounts.map(a => <option key={a.code} value={a.code}>{a.code} · {a.name}</option>)}
                      </select>
                      {uniqueAccounts.length === 0 && (
                        <span className="text-xs text-slate-400 font-bold">尚無日記帳數據，請先在「日記帳」頁面同步數據</span>
                      )}
                    </div>

                    {ledgerAccountCode && selectedLines.length > 0 && (
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-3 text-left">日期</th>
                              <th className="px-4 py-3 text-left">憑單編號</th>
                              <th className="px-4 py-3 text-left">說明</th>
                              <th className="px-4 py-3 text-right">借方</th>
                              <th className="px-4 py-3 text-right">貸方</th>
                              <th className="px-4 py-3 text-right">餘額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => { runningBalance = 0; return null; })()}
                            {selectedLines.map(line => {
                              const je = relatedEntries.get(line.journalEntryId);
                              runningBalance += line.debit - line.credit;
                              return (
                                <tr key={line.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                                  <td className="px-6 py-2.5 text-slate-500 font-bold">{je?.entryDate || '—'}</td>
                                  <td className="px-4 py-2.5 font-mono text-[10px] font-bold text-blue-500">{je?.voucherNumber || '—'}</td>
                                  <td className="px-4 py-2.5 text-slate-600 font-bold truncate max-w-[200px]">{line.description || je?.description || '—'}</td>
                                  <td className="px-4 py-2.5 text-right font-black text-slate-800">{line.debit > 0 ? `$${formatMoney(line.debit)}` : ''}</td>
                                  <td className="px-4 py-2.5 text-right font-black text-slate-800">{line.credit > 0 ? `$${formatMoney(line.credit)}` : ''}</td>
                                  <td className={`px-4 py-2.5 text-right font-black ${runningBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>${formatMoney(runningBalance)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-300 bg-slate-100">
                              <td className="px-6 py-3 font-black text-slate-900" colSpan={3}>合計</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(selectedLines.reduce((s, l) => s + l.debit, 0))}</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(selectedLines.reduce((s, l) => s + l.credit, 0))}</td>
                              <td className={`px-4 py-3 text-right font-black ${runningBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>${formatMoney(runningBalance)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {ledgerAccountCode && selectedLines.length === 0 && (
                      <EmptyState message="此帳戶暫無交易記錄" />
                    )}
                  </div>
                );
              })()}

              {/* ── Aging Analysis (帳齡分析) ── */}
              {reportSection === 'aging' && (() => {
                const today = new Date();
                const daysDiff = (dateStr: string) => {
                  const d = new Date(dateStr);
                  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                };
                const bucket = (days: number) => days <= 30 ? '0-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : days <= 120 ? '91-120' : '120+';
                const BUCKETS = ['0-30', '31-60', '61-90', '91-120', '120+'] as const;
                const BUCKET_COLORS: Record<string, string> = { '0-30': 'text-emerald-600 bg-emerald-50', '31-60': 'text-blue-600 bg-blue-50', '61-90': 'text-amber-600 bg-amber-50', '91-120': 'text-orange-600 bg-orange-50', '120+': 'text-rose-600 bg-rose-50' };

                const arOpen = receivables.filter(r => r.status !== 'received');
                const apOpen = payables.filter(p => p.status !== 'paid');

                const arByBucket: Record<string, { count: number; total: number; items: typeof arOpen }> = {};
                const apByBucket: Record<string, { count: number; total: number; items: typeof apOpen }> = {};
                BUCKETS.forEach(b => { arByBucket[b] = { count: 0, total: 0, items: [] }; apByBucket[b] = { count: 0, total: 0, items: [] }; });

                for (const ar of arOpen) {
                  const b = bucket(daysDiff(ar.invoiceDate));
                  arByBucket[b].count++;
                  arByBucket[b].total += ar.amount - ar.paidAmount;
                  arByBucket[b].items.push(ar);
                }
                for (const ap of apOpen) {
                  const b = bucket(daysDiff(ap.invoiceDate));
                  apByBucket[b].count++;
                  apByBucket[b].total += ap.amount - ap.paidAmount;
                  apByBucket[b].items.push(ap);
                }

                const arTotal = arOpen.reduce((s, r) => s + r.amount - r.paidAmount, 0);
                const apTotal = apOpen.reduce((s, p) => s + p.amount - p.paidAmount, 0);

                const renderAgingTable = (title: string, data: Record<string, { count: number; total: number }>, grandTotal: number, color: string) => (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h4 className="font-black text-sm text-slate-800">{title}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">未結餘額：<span className={`font-black ${color}`}>${formatMoney(grandTotal)}</span></p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="px-6 py-3 text-left">帳齡 (天)</th>
                          <th className="px-4 py-3 text-right">筆數</th>
                          <th className="px-4 py-3 text-right">金額</th>
                          <th className="px-4 py-3 text-right">佔比</th>
                          <th className="px-4 py-3 text-left" style={{ width: 160 }}>分佈</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BUCKETS.map(b => {
                          const d = data[b];
                          const pct = grandTotal > 0 ? (d.total / grandTotal * 100) : 0;
                          return (
                            <tr key={b} className="border-t border-slate-50 hover:bg-slate-50/50">
                              <td className="px-6 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${BUCKET_COLORS[b]}`}>{b} 天</span></td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-600">{d.count}</td>
                              <td className="px-4 py-2.5 text-right font-black text-slate-900">${formatMoney(d.total)}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-slate-500">{pct.toFixed(1)}%</td>
                              <td className="px-4 py-2.5">
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div className={`h-2 rounded-full transition-all ${b === '120+' ? 'bg-rose-500' : b === '91-120' ? 'bg-orange-500' : b === '61-90' ? 'bg-amber-500' : b === '31-60' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 bg-slate-100">
                          <td className="px-6 py-3 font-black text-slate-900">合計</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">{Object.values(data).reduce((s, d) => s + d.count, 0)}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">${formatMoney(grandTotal)}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-500">100%</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );

                return (
                  <div className="space-y-6">
                    {renderAgingTable('應收帳款帳齡 (AR Aging)', arByBucket, arTotal, 'text-emerald-600')}
                    {renderAgingTable('應付帳款帳齡 (AP Aging)', apByBucket, apTotal, 'text-rose-600')}
                  </div>
                );
              })()}

              {/* ── Balance Sheet (資產負債表) ── */}
              {reportSection === 'balance_sheet' && (() => {
                const acctBalances: Record<string, { code: string; name: string; type: string; balance: number }> = {};
                for (const acct of accounts) {
                  acctBalances[acct.accountCode] = { code: acct.accountCode, name: acct.accountName, type: acct.accountType, balance: 0 };
                }
                for (const line of journalLines) {
                  if (!acctBalances[line.accountCode]) {
                    acctBalances[line.accountCode] = { code: line.accountCode, name: line.accountName, type: 'other', balance: 0 };
                  }
                  acctBalances[line.accountCode].balance += line.debit - line.credit;
                }

                const isAsset = (t: string) => ['asset', 'bank', 'cash', 'receivable'].includes(t);
                const isLiability = (t: string) => ['liability', 'payable'].includes(t);
                const isEquity = (t: string) => t === 'equity';

                const assets = Object.values(acctBalances).filter(a => isAsset(a.type) && Math.abs(a.balance) > 0.01).sort((a, b) => a.code.localeCompare(b.code));
                const liabilities = Object.values(acctBalances).filter(a => isLiability(a.type) && Math.abs(a.balance) > 0.01).sort((a, b) => a.code.localeCompare(b.code));
                const equity = Object.values(acctBalances).filter(a => isEquity(a.type) && Math.abs(a.balance) > 0.01).sort((a, b) => a.code.localeCompare(b.code));

                // Net income from P&L (revenue - expenses)
                const revenueAccts = Object.values(acctBalances).filter(a => a.type === 'revenue');
                const expenseAccts = Object.values(acctBalances).filter(a => a.type === 'expense');
                const totalRevenue = revenueAccts.reduce((s, a) => s + a.balance, 0);
                const totalExpenses = expenseAccts.reduce((s, a) => s + a.balance, 0);
                const netIncome = -(totalRevenue) - totalExpenses;

                const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
                const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0);
                const totalEquity = equity.reduce((s, a) => s + Math.abs(a.balance), 0) + netIncome;
                const totalLiabEquity = totalLiabilities + totalEquity;
                const isBalanced = Math.abs(totalAssets - totalLiabEquity) < 0.01;

                const renderSection = (title: string, items: typeof assets, color: string) => (
                  <>
                    <tr className={`border-t border-slate-100 ${color}`}>
                      <td className="px-6 py-2 font-black text-xs" colSpan={3}>{title}</td>
                    </tr>
                    {items.map(item => (
                      <tr key={item.code} className="border-t border-slate-50">
                        <td className="px-6 py-2 pl-10 font-mono text-blue-600 text-xs">{item.code}</td>
                        <td className="px-4 py-2 font-bold text-slate-600">{item.name}</td>
                        <td className="px-4 py-2 text-right font-black text-slate-800">${formatMoney(Math.abs(item.balance))}</td>
                      </tr>
                    ))}
                  </>
                );

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {isBalanced && totalAssets > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
                          <Check size={12} /> 資產 = 負債 + 權益
                        </span>
                      )}
                      {!isBalanced && totalAssets > 0 && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">
                          <AlertTriangle size={12} /> 不平衡 (差額 ${formatMoney(Math.abs(totalAssets - totalLiabEquity))})
                        </span>
                      )}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-3 text-left">科目編號</th>
                            <th className="px-4 py-3 text-left">科目名稱</th>
                            <th className="px-4 py-3 text-right">金額 (HKD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderSection('資產 Assets', assets, 'bg-sky-50/30')}
                          <tr className="border-t-2 border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-900" colSpan={2}>總資產</td>
                            <td className="px-4 py-2 text-right font-black text-slate-900">${formatMoney(totalAssets)}</td>
                          </tr>

                          {renderSection('負債 Liabilities', liabilities, 'bg-pink-50/30')}
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-700" colSpan={2}>總負債</td>
                            <td className="px-4 py-2 text-right font-black text-slate-700">${formatMoney(totalLiabilities)}</td>
                          </tr>

                          {renderSection('權益 Equity', equity, 'bg-purple-50/30')}
                          <tr className="border-t border-slate-50">
                            <td className="px-6 py-2 pl-10 font-bold text-slate-600 italic" colSpan={2}>本期損益 (Net Income)</td>
                            <td className={`px-4 py-2 text-right font-black ${netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${formatMoney(netIncome)}</td>
                          </tr>
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td className="px-6 py-2 font-black text-slate-700" colSpan={2}>總權益</td>
                            <td className="px-4 py-2 text-right font-black text-slate-700">${formatMoney(totalEquity)}</td>
                          </tr>

                          <tr className="border-t-2 border-slate-300 bg-slate-100">
                            <td className="px-6 py-3 font-black text-lg text-slate-900" colSpan={2}>負債 + 權益</td>
                            <td className="px-4 py-3 text-right font-black text-lg text-slate-900">${formatMoney(totalLiabEquity)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
              {/* ── Monthly Statements (月結單) ── */}
              {reportSection === 'statements' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h4 className="font-black text-sm text-slate-800 mb-4">生成月結單</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">結算月份</label>
                        <input type="month" value={stmtMonth} onChange={e => setStmtMonth(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300" />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button onClick={handleGenerateARStatements}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 transition-colors">
                          <Download size={14} /> 客戶月結單 (AR)
                        </button>
                        <button onClick={handleGenerateAPStatements}
                          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-500 transition-colors">
                          <Download size={14} /> 供應商月結單 (AP)
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-3">月結單會為該月份每位客戶/供應商分別生成一頁，顯示期初餘額、本月交易及期末結存。</p>
                  </div>
                </div>
              )}
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
                        {filteredAccounts.map(a => {
                          const isChild = !!a.parentId;
                          const parentAcct = isChild ? accounts.find(p => p.id === a.parentId) : null;
                          return (
                          <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50 group">
                            <td className="px-5 py-3 font-black text-blue-600">
                              {isChild && <CornerDownRight size={11} className="inline mr-1 text-slate-300" />}
                              {a.accountCode}
                            </td>
                            <td className="px-4 py-3 font-black text-slate-800">
                              {isChild && <span className="text-[9px] text-slate-400 font-bold mr-1">({parentAcct?.accountCode})</span>}
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
                          );
                        })}
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
                          <p className="text-lg font-black text-slate-800">${formatMoney(tpl.defaultAmount)}</p>
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
          const arDate = editingAR.invoiceDate || new Date().toISOString().slice(0, 10);
          if (isBeforeLockDate(arDate)) { showToast(`日期 ${arDate} 在上鎖日期 (${lockDate}) 之前，無法儲存`, 'error'); return; }
          setSaving(true);
          const vn = editingAR.isNew ? await generateVoucherNumber('AR', 'accounts_receivable') : (editingAR.voucherNumber || null);
          const payload = {
            voucher_number: vn,
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
          let savedId = editingAR.id;
          if (editingAR.isNew) {
            const { data } = await supabase.from('accounts_receivable').insert(payload).select('id').single();
            if (data) savedId = data.id;
            showToast('已新增');
          } else {
            await supabase.from('accounts_receivable').update(payload).eq('id', editingAR.id);
            showToast('已更新');
          }
          if (savedId) {
            await syncJournalEntry('ar', savedId, payload.invoice_date,
              `AR: ${payload.client_name}`,
              buildARLines({ amount: payload.amount, paidAmount: payload.paid_amount, clientName: payload.client_name }));
            loadJournalEntries(); loadJournalLines();
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
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">上級帳戶</label>
              <select
                value={editingAccount.parentId || ''}
                onChange={e => setEditingAccount({ ...editingAccount, parentId: e.target.value || undefined })}
                className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm"
              >
                <option value="">— 無（頂級帳戶）—</option>
                {accounts.filter(a => a.id !== editingAccount.id && a.isActive).map(a => (
                  <option key={a.id} value={a.id}>{a.accountCode} · {a.accountName}</option>
                ))}
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
      <p className="text-xl font-black text-slate-900 mt-1">${formatMoney(value)}</p>
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
