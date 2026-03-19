import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Edit, Trash2, Save, X, RefreshCw, Search,
  ChevronDown, Check, Calendar, DollarSign, AlertTriangle,
  Download, Filter, BookOpen, Lock, Unlock,
  BarChart3, Layers, Eye, Printer, ClipboardList,
  Building2, CreditCard, Globe, ArrowUpDown, Package,
  TrendingUp, TrendingDown, CheckCircle, Clock,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import type {
  StandardRemark, RemarkCategory,
  Invoice, InvoiceLineItem, InvoiceStatus,
  ClientPriceHistory,
  Settlement, SettlementItem, SettlementType,
  ModuleLockDate, LockableModule,
  Currency,
  StockValuationLine, ValuationMethod,
  OutstandingOrderLine,
  WholesaleClient, Supplier,
  AccountReceivable, AccountPayable,
  AccountingAccount, JournalEntry, JournalEntryLine,
  WholesaleBrand,
} from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SubTab =
  | 'remarks' | 'invoices' | 'outstanding_orders'
  | 'settlements' | 'price_history' | 'lock_dates'
  | 'currencies' | 'stock_valuation' | 'year_end';

const SUB_TABS: { key: SubTab; label: string; icon: React.ReactNode }[] = [
  { key: 'remarks',            label: '備註庫',      icon: <BookOpen size={16}/> },
  { key: 'invoices',           label: '發票管理',    icon: <FileText size={16}/> },
  { key: 'outstanding_orders', label: '未交貨訂單',  icon: <ClipboardList size={16}/> },
  { key: 'settlements',        label: '批量結數',    icon: <CreditCard size={16}/> },
  { key: 'price_history',      label: '價格記錄',    icon: <DollarSign size={16}/> },
  { key: 'lock_dates',         label: '上鎖日期',    icon: <Lock size={16}/> },
  { key: 'currencies',         label: '貨幣管理',    icon: <Globe size={16}/> },
  { key: 'stock_valuation',    label: '庫存估值',    icon: <Package size={16}/> },
  { key: 'year_end',           label: '總帳年結',    icon: <BarChart3 size={16}/> },
];

const REMARK_CATEGORIES: { key: RemarkCategory; label: string }[] = [
  { key: 'general',   label: '一般' },
  { key: 'delivery',  label: '送貨' },
  { key: 'invoice',   label: '發票' },
  { key: 'payment',   label: '付款' },
  { key: 'order',     label: '訂單' },
  { key: 'quotation', label: '報價' },
  { key: 'product',   label: '產品' },
];

const INVOICE_STATUS_MAP: Record<InvoiceStatus, { label: string; color: string }> = {
  draft:        { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  confirmed:    { label: '已確認', color: 'bg-blue-50 text-blue-600' },
  sent:         { label: '已發送', color: 'bg-indigo-50 text-indigo-600' },
  partial_paid: { label: '部份已付', color: 'bg-amber-50 text-amber-600' },
  paid:         { label: '已付清', color: 'bg-emerald-50 text-emerald-600' },
  cancelled:    { label: '已取消', color: 'bg-red-50 text-red-500' },
  void:         { label: '作廢', color: 'bg-gray-100 text-gray-400' },
};

const LOCKABLE_MODULES: { key: LockableModule; label: string }[] = [
  { key: 'quotations',       label: '報價單' },
  { key: 'orders',           label: '訂單' },
  { key: 'invoices',         label: '發票' },
  { key: 'purchase_orders',  label: '採購單' },
  { key: 'goods_receiving',  label: '收貨單' },
  { key: 'inventory',        label: '貨倉管理' },
  { key: 'ar',               label: '應收帳' },
  { key: 'ap',               label: '應付帳' },
  { key: 'gl',               label: '總帳' },
  { key: 'production',       label: '工場' },
];

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-HK') : '-';

const LegacyFeaturesPanel: React.FC<Props> = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('remarks');

  // ─── Standard Remarks state ────────────────────────────────────
  const [remarks, setRemarks] = useState<StandardRemark[]>([]);
  const [editingRemark, setEditingRemark] = useState<Partial<StandardRemark> | null>(null);
  const [remarkFilter, setRemarkFilter] = useState('');

  // ─── Invoices state ────────────────────────────────────────────
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<Partial<InvoiceLineItem>[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [clients, setClients] = useState<WholesaleClient[]>([]);

  // ─── Outstanding Orders state ──────────────────────────────────
  const [outstandingLines, setOutstandingLines] = useState<OutstandingOrderLine[]>([]);
  const [outstandingSort, setOutstandingSort] = useState<'client' | 'date' | 'product'>('client');

  // ─── Settlements state ─────────────────────────────────────────
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [editingSettlement, setEditingSettlement] = useState<Partial<Settlement> | null>(null);
  const [settlementItems, setSettlementItems] = useState<Partial<SettlementItem>[]>([]);
  const [arList, setArList] = useState<AccountReceivable[]>([]);
  const [apList, setApList] = useState<AccountPayable[]>([]);
  const [bankAccounts, setBankAccounts] = useState<AccountingAccount[]>([]);

  // ─── Price History state ───────────────────────────────────────
  const [priceHistory, setPriceHistory] = useState<ClientPriceHistory[]>([]);
  const [priceFilter, setPriceFilter] = useState('');

  // ─── Lock Dates state ──────────────────────────────────────────
  const [lockDates, setLockDates] = useState<ModuleLockDate[]>([]);
  const [editingLocks, setEditingLocks] = useState<Record<string, string>>({});

  // ─── Currencies state ──────────────────────────────────────────
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingCurrency, setEditingCurrency] = useState<Partial<Currency> | null>(null);

  // ─── Stock Valuation state ─────────────────────────────────────
  const [valuationLines, setValuationLines] = useState<StockValuationLine[]>([]);
  const [valuationMethod, setValuationMethod] = useState<ValuationMethod>('average_cost');
  const [valuationDate, setValuationDate] = useState(new Date().toISOString().slice(0, 10));

  // ─── Year-End state ────────────────────────────────────────────
  const [yearEndYear, setYearEndYear] = useState(new Date().getFullYear() - 1);
  const [yearEndRunning, setYearEndRunning] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // DATA LOADERS
  // ═══════════════════════════════════════════════════════════════

  const loadRemarks = useCallback(async () => {
    const { data } = await supabase.from('standard_remarks').select('*').order('sort_order');
    if (data) setRemarks(data.map((r: any) => ({
      id: r.id, code: r.code, contentZh: r.content_zh, contentEn: r.content_en,
      category: r.category, sortOrder: r.sort_order, isActive: r.is_active,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  }, []);

  const loadInvoices = useCallback(async () => {
    const { data } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false }).limit(200);
    if (data) setInvoices(data.map((r: any) => ({
      id: r.id, invoiceNumber: r.invoice_number, invoiceDate: r.invoice_date,
      dueDate: r.due_date, clientId: r.client_id, clientName: r.client_name,
      clientCode: r.client_code, brand: r.brand, salespersonId: r.salesperson_id,
      salespersonName: r.salesperson_name, deliveryAddress: r.delivery_address,
      currency: r.currency || 'HKD', exchangeRate: r.exchange_rate || 1,
      subtotal: Number(r.subtotal), discountPercent: Number(r.discount_percent || 0),
      discountAmount: Number(r.discount_amount || 0), total: Number(r.total),
      status: r.status, paymentMethod: r.payment_method, warehouseId: r.warehouse_id,
      deliveryDate: r.delivery_date, remarksTop: r.remarks_top,
      remarksBottom: r.remarks_bottom, notes: r.notes,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  }, []);

  const loadClients = useCallback(async () => {
    const { data } = await supabase.from('wholesale_clients').select('*').eq('is_active', true).order('company_name');
    if (data) setClients(data.map((r: any) => ({
      id: r.id, companyName: r.company_name, contactName: r.contact_name,
      phone: r.phone, brand: r.brand, priceTier: r.price_tier || 'P0',
      clientCode: r.client_code, address: r.address, district: r.district,
      creditLimit: Number(r.credit_limit || 0), isActive: r.is_active,
      paymentTermsDays: r.payment_terms_days || 0, paymentTermsType: r.payment_terms_type || 'cod',
      discountPercent: Number(r.discount_percent || 0),
    })) as any);
  }, []);

  const loadOutstandingOrders = useCallback(async () => {
    const { data } = await supabase.from('orders').select('*')
      .in('status', ['paid', 'preparing'])
      .eq('order_type', 'wholesale')
      .order('order_date', { ascending: false });
    if (!data) return;
    const lines: OutstandingOrderLine[] = [];
    for (const o of data) {
      const items = (o.line_items as any[]) || [];
      for (const item of items) {
        lines.push({
          orderId: String(o.id), orderDate: o.order_date,
          deliveryDate: o.delivery_date || undefined,
          clientName: o.customer_name, clientCode: o.client_code || undefined,
          productName: item.name, orderedQty: item.qty, deliveredQty: 0,
          outstandingQty: item.qty, unit: item.unit,
          unitPrice: item.unit_price, outstandingAmount: item.line_total,
        });
      }
    }
    setOutstandingLines(lines);
  }, []);

  const loadSettlements = useCallback(async () => {
    const { data } = await supabase.from('settlements').select('*').order('settlement_date', { ascending: false }).limit(100);
    if (data) setSettlements(data.map((r: any) => ({
      id: r.id, settlementNumber: r.settlement_number, settlementType: r.settlement_type,
      settlementDate: r.settlement_date, clientId: r.client_id, clientName: r.client_name,
      supplierId: r.supplier_id, supplierName: r.supplier_name,
      bankAccountId: r.bank_account_id, bankName: r.bank_name,
      chequeNumber: r.cheque_number, chequeDate: r.cheque_date,
      currency: r.currency || 'HKD', totalAmount: Number(r.total_amount),
      discount: Number(r.discount || 0), otherCharges: Number(r.other_charges || 0),
      netAmount: Number(r.net_amount), notes: r.notes,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  }, []);

  const loadARForSettlement = useCallback(async () => {
    const { data } = await supabase.from('accounts_receivable').select('*').in('status', ['pending', 'partial', 'overdue']);
    if (data) setArList(data.map((r: any) => ({
      id: r.id, voucherNumber: r.voucher_number, clientId: r.client_id,
      clientName: r.client_name, brand: r.brand, orderId: r.order_id,
      invoiceDate: r.invoice_date, amount: Number(r.amount),
      paidAmount: Number(r.paid_amount || 0), status: r.status,
      creditTerms: r.credit_terms, paymentMethod: r.payment_method,
      receivedDate: r.received_date, notes: r.notes, createdAt: r.created_at,
    })));
  }, []);

  const loadAPForSettlement = useCallback(async () => {
    const { data } = await supabase.from('accounts_payable').select('*').in('status', ['unpaid', 'partial', 'overdue']);
    if (data) setApList(data.map((r: any) => ({
      id: r.id, voucherNumber: r.voucher_number, supplierId: r.supplier_id,
      supplierName: r.supplier_name, invoiceNumber: r.invoice_number,
      invoiceDate: r.invoice_date, description: r.description || '',
      amount: Number(r.amount), dueDate: r.due_date, status: r.status,
      paidAmount: Number(r.paid_amount || 0), paymentMethod: r.payment_method,
      paymentDate: r.payment_date, notes: r.notes, createdAt: r.created_at,
    })));
  }, []);

  const loadBankAccounts = useCallback(async () => {
    const { data } = await supabase.from('accounting_accounts').select('*')
      .in('account_type', ['bank', 'cash']).eq('is_active', true);
    if (data) setBankAccounts(data.map((r: any) => ({
      id: r.id, accountCode: r.account_code, accountName: r.account_name,
      accountType: r.account_type, bankName: r.bank_name,
      bankAccountNumber: r.bank_account_number, currency: r.currency,
      isDefault: r.is_default, isActive: r.is_active, createdAt: r.created_at,
    })));
  }, []);

  const loadPriceHistory = useCallback(async () => {
    const { data } = await supabase.from('client_price_history').select('*').order('source_date', { ascending: false }).limit(500);
    if (data) setPriceHistory(data.map((r: any) => ({
      id: r.id, clientId: r.client_id, clientName: r.client_name,
      productId: r.product_id, productName: r.product_name,
      unitPrice: Number(r.unit_price), qty: r.qty ? Number(r.qty) : undefined,
      unit: r.unit, currency: r.currency || 'HKD', sourceType: r.source_type,
      sourceId: r.source_id, sourceDate: r.source_date, createdAt: r.created_at,
    })));
  }, []);

  const loadLockDates = useCallback(async () => {
    const { data } = await supabase.from('module_lock_dates').select('*').order('module_key');
    if (data) {
      const ld = data.map((r: any) => ({
        moduleKey: r.module_key as LockableModule,
        lockDate: r.lock_date, updatedBy: r.updated_by, updatedAt: r.updated_at,
      }));
      setLockDates(ld);
      const edits: Record<string, string> = {};
      ld.forEach(l => { edits[l.moduleKey] = l.lockDate; });
      setEditingLocks(edits);
    }
  }, []);

  const loadCurrencies = useCallback(async () => {
    const { data } = await supabase.from('currencies').select('*').order('is_base', { ascending: false });
    if (data) setCurrencies(data.map((r: any) => ({
      code: r.code, nameZh: r.name_zh, nameEn: r.name_en, symbol: r.symbol,
      exchangeRate: Number(r.exchange_rate), isBase: r.is_base, isActive: r.is_active,
      updatedAt: r.updated_at,
    })));
  }, []);

  const loadStockValuation = useCallback(async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    if (!data) return;
    setValuationLines(data.filter((r: any) => (r.stock_qty || 0) > 0).map((r: any) => {
      const cost = Number(r.base_cost_per_lb || 0);
      const qty = Number(r.stock_qty || 0);
      return {
        ingredientId: r.id, ingredientName: r.name, unit: r.unit || 'lb',
        stockQty: qty, averageCost: cost, standardCost: cost,
        lastPurchasePrice: cost,
        valuationAmount: qty * cost,
      };
    }));
  }, []);

  useEffect(() => {
    if (activeTab === 'remarks') loadRemarks();
    else if (activeTab === 'invoices') { loadInvoices(); loadClients(); }
    else if (activeTab === 'outstanding_orders') loadOutstandingOrders();
    else if (activeTab === 'settlements') { loadSettlements(); loadARForSettlement(); loadAPForSettlement(); loadBankAccounts(); }
    else if (activeTab === 'price_history') loadPriceHistory();
    else if (activeTab === 'lock_dates') loadLockDates();
    else if (activeTab === 'currencies') loadCurrencies();
    else if (activeTab === 'stock_valuation') loadStockValuation();
  }, [activeTab]);

  // ═══════════════════════════════════════════════════════════════
  // SAVE HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const saveRemark = async () => {
    if (!editingRemark) return;
    const payload = {
      code: editingRemark.code || '', content_zh: editingRemark.contentZh || '',
      content_en: editingRemark.contentEn || '', category: editingRemark.category || 'general',
      sort_order: editingRemark.sortOrder || 0, is_active: editingRemark.isActive !== false,
    };
    if (editingRemark.id) {
      await supabase.from('standard_remarks').update(payload).eq('id', editingRemark.id);
    } else {
      await supabase.from('standard_remarks').insert(payload);
    }
    setEditingRemark(null);
    showToast('備註已儲存', 'success');
    loadRemarks();
  };

  const deleteRemark = async (id: string) => {
    await supabase.from('standard_remarks').delete().eq('id', id);
    showToast('備註已刪除', 'success');
    loadRemarks();
  };

  const saveInvoice = async () => {
    if (!editingInvoice) return;
    const payload: any = {
      invoice_number: editingInvoice.invoiceNumber || `INV-${Date.now()}`,
      invoice_date: editingInvoice.invoiceDate || new Date().toISOString().slice(0, 10),
      due_date: editingInvoice.dueDate || null,
      client_id: editingInvoice.clientId || null,
      client_name: editingInvoice.clientName || '',
      client_code: editingInvoice.clientCode || null,
      brand: editingInvoice.brand || null,
      salesperson_name: editingInvoice.salespersonName || null,
      delivery_address: editingInvoice.deliveryAddress || null,
      currency: editingInvoice.currency || 'HKD',
      exchange_rate: editingInvoice.exchangeRate || 1,
      subtotal: invoiceLines.reduce((s, l) => s + (l.lineTotal || 0), 0),
      discount_percent: editingInvoice.discountPercent || 0,
      discount_amount: editingInvoice.discountAmount || 0,
      total: invoiceLines.reduce((s, l) => s + (l.lineTotal || 0), 0) - (editingInvoice.discountAmount || 0),
      status: editingInvoice.status || 'draft',
      payment_method: editingInvoice.paymentMethod || null,
      remarks_top: editingInvoice.remarksTop || null,
      remarks_bottom: editingInvoice.remarksBottom || null,
      notes: editingInvoice.notes || null,
    };

    let invoiceId = editingInvoice.id;
    if (invoiceId) {
      await supabase.from('invoices').update(payload).eq('id', invoiceId);
      await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);
    } else {
      const { data } = await supabase.from('invoices').insert(payload).select('id').single();
      invoiceId = data?.id;
    }

    if (invoiceId && invoiceLines.length > 0) {
      const linePayloads = invoiceLines.map((l, i) => ({
        invoice_id: invoiceId, product_id: l.productId || null,
        product_name: l.productName || '', description: l.description || null,
        qty: l.qty || 0, unit: l.unit || 'pc', unit_price: l.unitPrice || 0,
        discount: l.discount || 0, line_total: l.lineTotal || 0, sort_order: i,
        order_id: l.orderId || null, notes: l.notes || null,
      }));
      await supabase.from('invoice_line_items').insert(linePayloads);
    }

    setEditingInvoice(null);
    setInvoiceLines([]);
    showToast('發票已儲存', 'success');
    loadInvoices();
  };

  const saveSettlement = async () => {
    if (!editingSettlement || settlementItems.length === 0) return;
    const net = settlementItems.reduce((s, i) => s + (i.settledAmount || 0), 0);
    const payload: any = {
      settlement_number: editingSettlement.settlementNumber || `STL-${Date.now()}`,
      settlement_type: editingSettlement.settlementType || 'ar',
      settlement_date: editingSettlement.settlementDate || new Date().toISOString().slice(0, 10),
      client_id: editingSettlement.clientId || null,
      client_name: editingSettlement.clientName || null,
      supplier_id: editingSettlement.supplierId || null,
      supplier_name: editingSettlement.supplierName || null,
      bank_account_id: editingSettlement.bankAccountId || null,
      bank_name: editingSettlement.bankName || null,
      cheque_number: editingSettlement.chequeNumber || null,
      cheque_date: editingSettlement.chequeDate || null,
      currency: editingSettlement.currency || 'HKD',
      total_amount: net,
      discount: editingSettlement.discount || 0,
      other_charges: editingSettlement.otherCharges || 0,
      net_amount: net - (editingSettlement.discount || 0) + (editingSettlement.otherCharges || 0),
      notes: editingSettlement.notes || null,
    };

    const { data: stl } = await supabase.from('settlements').insert(payload).select('id').single();
    if (stl) {
      const itemPayloads = settlementItems.map(i => ({
        settlement_id: stl.id, document_type: i.documentType || 'ar',
        document_id: i.documentId, document_number: i.documentNumber || '',
        document_date: i.documentDate || null, original_amount: i.originalAmount || 0,
        settled_amount: i.settledAmount || 0,
      }));
      await supabase.from('settlement_items').insert(itemPayloads);

      for (const item of settlementItems) {
        const table = editingSettlement.settlementType === 'ar' ? 'accounts_receivable' : 'accounts_payable';
        const paidCol = editingSettlement.settlementType === 'ar' ? 'paid_amount' : 'paid_amount';
        const { data: doc } = await supabase.from(table).select('amount, paid_amount').eq('id', item.documentId).single();
        if (doc) {
          const newPaid = Number(doc.paid_amount || 0) + (item.settledAmount || 0);
          const newStatus = newPaid >= Number(doc.amount) ? (editingSettlement.settlementType === 'ar' ? 'received' : 'paid') : 'partial';
          await supabase.from(table).update({
            paid_amount: newPaid, status: newStatus,
            settlement_id: stl.id, bank_account_id: editingSettlement.bankAccountId || null,
            cheque_number: editingSettlement.chequeNumber || null,
            cheque_date: editingSettlement.chequeDate || null,
          }).eq('id', item.documentId);
        }
      }
    }

    setEditingSettlement(null);
    setSettlementItems([]);
    showToast('結數已完成', 'success');
    loadSettlements();
    loadARForSettlement();
    loadAPForSettlement();
  };

  const saveLockDates = async () => {
    for (const [key, date] of Object.entries(editingLocks)) {
      await supabase.from('module_lock_dates').upsert({
        module_key: key, lock_date: date, updated_at: new Date().toISOString(),
      });
    }
    showToast('上鎖日期已更新', 'success');
    loadLockDates();
  };

  const saveCurrency = async () => {
    if (!editingCurrency) return;
    const payload = {
      code: editingCurrency.code || '', name_zh: editingCurrency.nameZh || '',
      name_en: editingCurrency.nameEn || '', symbol: editingCurrency.symbol || '$',
      exchange_rate: editingCurrency.exchangeRate || 1, is_base: editingCurrency.isBase || false,
      is_active: editingCurrency.isActive !== false,
    };
    await supabase.from('currencies').upsert(payload);
    setEditingCurrency(null);
    showToast('貨幣已儲存', 'success');
    loadCurrencies();
  };

  const runYearEnd = async () => {
    setYearEndRunning(true);
    try {
      const startDate = `${yearEndYear}-04-01`;
      const endDate = `${yearEndYear + 1}-03-31`;

      const { data: lines } = await supabase.from('journal_entry_lines').select(`
        account_code, account_name, debit, credit,
        journal_entries!inner(entry_date, is_posted)
      `);

      if (!lines) { showToast('無法讀取帳目資料', 'error'); return; }

      const plLines = lines.filter((l: any) => {
        const code = l.account_code || '';
        const date = l.journal_entries?.entry_date;
        return (code.startsWith('4') || code.startsWith('5') || code.startsWith('6')) &&
          date >= startDate && date <= endDate;
      });

      let totalDebit = 0, totalCredit = 0;
      plLines.forEach((l: any) => {
        totalDebit += Number(l.debit || 0);
        totalCredit += Number(l.credit || 0);
      });

      const retainedEarnings = totalCredit - totalDebit;

      const voucherNumber = `GLYEAREND-${yearEndYear + 1}-04-01`;
      const { data: je } = await supabase.from('journal_entries').insert({
        voucher_number: voucherNumber,
        entry_date: `${yearEndYear + 1}-04-01`,
        description: `年結 ${yearEndYear}/${yearEndYear + 1} — 結轉損益至保留盈餘`,
        source_type: 'manual', is_posted: true,
      }).select('id').single();

      if (je) {
        const closingLines: any[] = [];

        const acctTotals: Record<string, { code: string; name: string; debit: number; credit: number }> = {};
        plLines.forEach((l: any) => {
          const key = l.account_code;
          if (!acctTotals[key]) acctTotals[key] = { code: key, name: l.account_name, debit: 0, credit: 0 };
          acctTotals[key].debit += Number(l.debit || 0);
          acctTotals[key].credit += Number(l.credit || 0);
        });

        for (const acct of Object.values(acctTotals)) {
          const netDebit = acct.debit - acct.credit;
          if (Math.abs(netDebit) > 0.001) {
            closingLines.push({
              journal_entry_id: je.id,
              account_code: acct.code, account_name: acct.name,
              debit: netDebit < 0 ? Math.abs(netDebit) : 0,
              credit: netDebit > 0 ? netDebit : 0,
              description: '年結結轉',
            });
          }
        }

        if (Math.abs(retainedEarnings) > 0.001) {
          closingLines.push({
            journal_entry_id: je.id,
            account_code: '3200', account_name: '保留盈餘',
            debit: retainedEarnings < 0 ? Math.abs(retainedEarnings) : 0,
            credit: retainedEarnings > 0 ? retainedEarnings : 0,
            description: '年結結轉損益',
          });
        }

        if (closingLines.length > 0) {
          await supabase.from('journal_entry_lines').insert(closingLines);
        }
      }

      showToast(`年結完成：${yearEndYear}/${yearEndYear + 1}，保留盈餘 $${fmt(retainedEarnings)}`, 'success');
    } catch (err) {
      showToast('年結失敗: ' + (err as Error).message, 'error');
    } finally {
      setYearEndRunning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTERED / SORTED DATA
  // ═══════════════════════════════════════════════════════════════

  const filteredRemarks = useMemo(() => {
    const q = remarkFilter.toLowerCase();
    return remarks.filter(r =>
      !q || r.code.toLowerCase().includes(q) || r.contentZh.includes(q) || r.contentEn.toLowerCase().includes(q)
    );
  }, [remarks, remarkFilter]);

  const filteredInvoices = useMemo(() => {
    const q = invoiceFilter.toLowerCase();
    return invoices.filter(inv =>
      !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.clientName.toLowerCase().includes(q)
    );
  }, [invoices, invoiceFilter]);

  const sortedOutstanding = useMemo(() => {
    const sorted = [...outstandingLines];
    if (outstandingSort === 'client') sorted.sort((a, b) => a.clientName.localeCompare(b.clientName));
    else if (outstandingSort === 'date') sorted.sort((a, b) => (a.deliveryDate || '').localeCompare(b.deliveryDate || ''));
    else sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    return sorted;
  }, [outstandingLines, outstandingSort]);

  const filteredPriceHistory = useMemo(() => {
    const q = priceFilter.toLowerCase();
    return priceHistory.filter(p =>
      !q || p.clientName.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q)
    );
  }, [priceHistory, priceFilter]);

  const totalValuation = useMemo(() =>
    valuationLines.reduce((s, l) => s + l.valuationAmount, 0),
  [valuationLines]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto bg-white flex-shrink-0">
        {SUB_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeTab === t.key ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 1. STANDARD REMARKS LIBRARY                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'remarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">備註庫 Standard Remarks</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input className="pl-8 pr-3 py-2 border rounded-lg text-sm w-48" placeholder="搜尋..."
                    value={remarkFilter} onChange={e => setRemarkFilter(e.target.value)} />
                </div>
                <button onClick={() => setEditingRemark({ isActive: true, category: 'general', sortOrder: 0 })}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Plus size={14} /> 新增備註
                </button>
              </div>
            </div>

            {editingRemark && (
              <div className="bg-white border rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">編號</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingRemark.code || ''}
                      onChange={e => setEditingRemark(p => ({ ...p!, code: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">類別</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editingRemark.category || 'general'}
                      onChange={e => setEditingRemark(p => ({ ...p!, category: e.target.value as RemarkCategory }))}>
                      {REMARK_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">排序</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingRemark.sortOrder || 0}
                      onChange={e => setEditingRemark(p => ({ ...p!, sortOrder: Number(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">中文內容</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={editingRemark.contentZh || ''}
                    onChange={e => setEditingRemark(p => ({ ...p!, contentZh: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">English Content</label>
                  <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} value={editingRemark.contentEn || ''}
                    onChange={e => setEditingRemark(p => ({ ...p!, contentEn: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingRemark(null)} className="px-3 py-1.5 border rounded-lg text-sm">取消</button>
                  <button onClick={saveRemark} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">
                    <Save size={14} /> 儲存
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">編號</th>
                  <th className="text-left px-4 py-2">類別</th>
                  <th className="text-left px-4 py-2">中文</th>
                  <th className="text-left px-4 py-2">English</th>
                  <th className="text-center px-4 py-2">操作</th>
                </tr></thead>
                <tbody>{filteredRemarks.map(r => (
                  <tr key={r.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs">{r.code}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                        {REMARK_CATEGORIES.find(c => c.key === r.category)?.label || r.category}
                      </span>
                    </td>
                    <td className="px-4 py-2">{r.contentZh}</td>
                    <td className="px-4 py-2 text-slate-500">{r.contentEn}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => setEditingRemark(r)} className="p-1 hover:bg-slate-100 rounded"><Edit size={14} /></button>
                      <button onClick={() => deleteRemark(r.id)} className="p-1 hover:bg-red-50 text-red-500 rounded ml-1"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredRemarks.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無備註</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 2. INVOICES                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">發票管理 Invoices</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input className="pl-8 pr-3 py-2 border rounded-lg text-sm w-48" placeholder="搜尋..."
                    value={invoiceFilter} onChange={e => setInvoiceFilter(e.target.value)} />
                </div>
                <button onClick={() => {
                  setEditingInvoice({ currency: 'HKD', exchangeRate: 1, status: 'draft' as InvoiceStatus, discountPercent: 0, discountAmount: 0 });
                  setInvoiceLines([{ productName: '', qty: 1, unit: 'pc', unitPrice: 0, discount: 0, lineTotal: 0, sortOrder: 0 }]);
                }} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  <Plus size={14} /> 新增發票
                </button>
              </div>
            </div>

            {editingInvoice && (
              <div className="bg-white border rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">發票編號</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingInvoice.invoiceNumber || ''}
                      onChange={e => setEditingInvoice(p => ({ ...p!, invoiceNumber: e.target.value }))}
                      placeholder={`INV-${Date.now().toString().slice(-6)}`} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">日期</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingInvoice.invoiceDate || new Date().toISOString().slice(0, 10)}
                      onChange={e => setEditingInvoice(p => ({ ...p!, invoiceDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">客戶</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editingInvoice.clientId || ''}
                      onChange={e => {
                        const c = clients.find(c => c.id === e.target.value);
                        setEditingInvoice(p => ({ ...p!, clientId: e.target.value, clientName: c?.companyName || '', clientCode: c?.clientCode }));
                      }}>
                      <option value="">選擇客戶</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">狀態</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editingInvoice.status || 'draft'}
                      onChange={e => setEditingInvoice(p => ({ ...p!, status: e.target.value as InvoiceStatus }))}>
                      {Object.entries(INVOICE_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">備註(上)</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingInvoice.remarksTop || ''}
                    onChange={e => setEditingInvoice(p => ({ ...p!, remarksTop: e.target.value }))} placeholder="顯示在發票頂部的備註" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-slate-500 font-medium">貨物明細</label>
                    <button onClick={() => setInvoiceLines(p => [...p, { productName: '', qty: 1, unit: 'pc', unitPrice: 0, discount: 0, lineTotal: 0, sortOrder: p.length }])}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} />新增行</button>
                  </div>
                  <table className="w-full text-sm border rounded-lg overflow-hidden">
                    <thead className="bg-slate-50"><tr>
                      <th className="text-left px-3 py-1.5">貨物名稱</th>
                      <th className="text-right px-3 py-1.5 w-20">數量</th>
                      <th className="text-left px-3 py-1.5 w-16">單位</th>
                      <th className="text-right px-3 py-1.5 w-24">單價</th>
                      <th className="text-right px-3 py-1.5 w-16">折扣%</th>
                      <th className="text-right px-3 py-1.5 w-24">金額</th>
                      <th className="w-8"></th>
                    </tr></thead>
                    <tbody>{invoiceLines.map((line, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1"><input className="w-full border rounded px-2 py-1 text-sm" value={line.productName || ''}
                          onChange={e => { const nl = [...invoiceLines]; nl[i] = { ...nl[i], productName: e.target.value }; setInvoiceLines(nl); }} /></td>
                        <td className="px-2 py-1"><input type="number" className="w-full border rounded px-2 py-1 text-sm text-right" value={line.qty || ''}
                          onChange={e => {
                            const nl = [...invoiceLines]; const q = Number(e.target.value); const lt = q * (nl[i].unitPrice || 0) * (1 - (nl[i].discount || 0) / 100);
                            nl[i] = { ...nl[i], qty: q, lineTotal: lt }; setInvoiceLines(nl);
                          }} /></td>
                        <td className="px-2 py-1"><input className="w-full border rounded px-2 py-1 text-sm" value={line.unit || 'pc'}
                          onChange={e => { const nl = [...invoiceLines]; nl[i] = { ...nl[i], unit: e.target.value }; setInvoiceLines(nl); }} /></td>
                        <td className="px-2 py-1"><input type="number" className="w-full border rounded px-2 py-1 text-sm text-right" value={line.unitPrice || ''}
                          onChange={e => {
                            const nl = [...invoiceLines]; const p = Number(e.target.value); const lt = (nl[i].qty || 0) * p * (1 - (nl[i].discount || 0) / 100);
                            nl[i] = { ...nl[i], unitPrice: p, lineTotal: lt }; setInvoiceLines(nl);
                          }} /></td>
                        <td className="px-2 py-1"><input type="number" className="w-full border rounded px-2 py-1 text-sm text-right" value={line.discount || ''}
                          onChange={e => {
                            const nl = [...invoiceLines]; const d = Number(e.target.value); const lt = (nl[i].qty || 0) * (nl[i].unitPrice || 0) * (1 - d / 100);
                            nl[i] = { ...nl[i], discount: d, lineTotal: lt }; setInvoiceLines(nl);
                          }} /></td>
                        <td className="px-2 py-1 text-right font-mono">${fmt(line.lineTotal || 0)}</td>
                        <td className="px-1"><button onClick={() => setInvoiceLines(p => p.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><X size={14} /></button></td>
                      </tr>
                    ))}</tbody>
                    <tfoot className="bg-slate-50 font-bold"><tr>
                      <td colSpan={5} className="text-right px-3 py-2">合計</td>
                      <td className="text-right px-3 py-2 font-mono">${fmt(invoiceLines.reduce((s, l) => s + (l.lineTotal || 0), 0))}</td>
                      <td></td>
                    </tr></tfoot>
                  </table>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingInvoice(null); setInvoiceLines([]); }} className="px-3 py-1.5 border rounded-lg text-sm">取消</button>
                  <button onClick={saveInvoice} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">
                    <Save size={14} /> 儲存發票
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">發票編號</th>
                  <th className="text-left px-4 py-2">日期</th>
                  <th className="text-left px-4 py-2">客戶</th>
                  <th className="text-right px-4 py-2">金額</th>
                  <th className="text-center px-4 py-2">狀態</th>
                  <th className="text-center px-4 py-2">操作</th>
                </tr></thead>
                <tbody>{filteredInvoices.map(inv => {
                  const st = INVOICE_STATUS_MAP[inv.status] || INVOICE_STATUS_MAP.draft;
                  return (
                    <tr key={inv.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-4 py-2">{fmtDate(inv.invoiceDate)}</td>
                      <td className="px-4 py-2">{inv.clientName}</td>
                      <td className="px-4 py-2 text-right font-mono">${fmt(inv.total)}</td>
                      <td className="px-4 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${st.color}`}>{st.label}</span></td>
                      <td className="px-4 py-2 text-center">
                        <button onClick={() => { setEditingInvoice(inv); setInvoiceLines(inv.lineItems || []); }} className="p-1 hover:bg-slate-100 rounded"><Edit size={14} /></button>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
              {filteredInvoices.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無發票</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 3. OUTSTANDING ORDERS                                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'outstanding_orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">未交貨訂單 Outstanding Orders</h2>
              <div className="flex items-center gap-2">
                <select className="border rounded-lg px-3 py-2 text-sm" value={outstandingSort}
                  onChange={e => setOutstandingSort(e.target.value as any)}>
                  <option value="client">按客戶</option>
                  <option value="date">按交貨日期</option>
                  <option value="product">按產品</option>
                </select>
                <button onClick={loadOutstandingOrders} className="p-2 border rounded-lg hover:bg-slate-50"><RefreshCw size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-600">未交訂單數</p>
                <p className="text-2xl font-bold text-amber-800">{new Set(sortedOutstanding.map(l => l.orderId)).size}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-600">未交貨品項</p>
                <p className="text-2xl font-bold text-blue-800">{sortedOutstanding.length}</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-sm text-rose-600">未交金額</p>
                <p className="text-2xl font-bold text-rose-800">${fmt(sortedOutstanding.reduce((s, l) => s + l.outstandingAmount, 0))}</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">訂單</th>
                  <th className="text-left px-4 py-2">訂單日期</th>
                  <th className="text-left px-4 py-2">交貨日期</th>
                  <th className="text-left px-4 py-2">客戶</th>
                  <th className="text-left px-4 py-2">產品</th>
                  <th className="text-right px-4 py-2">訂購</th>
                  <th className="text-right px-4 py-2">已交</th>
                  <th className="text-right px-4 py-2">未交</th>
                  <th className="text-right px-4 py-2">金額</th>
                </tr></thead>
                <tbody>{sortedOutstanding.map((l, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs">{l.orderId}</td>
                    <td className="px-4 py-2">{fmtDate(l.orderDate)}</td>
                    <td className="px-4 py-2">{l.deliveryDate ? fmtDate(l.deliveryDate) : <span className="text-slate-300">-</span>}</td>
                    <td className="px-4 py-2">{l.clientName}</td>
                    <td className="px-4 py-2">{l.productName}</td>
                    <td className="px-4 py-2 text-right">{l.orderedQty}</td>
                    <td className="px-4 py-2 text-right">{l.deliveredQty}</td>
                    <td className="px-4 py-2 text-right font-bold text-amber-600">{l.outstandingQty}</td>
                    <td className="px-4 py-2 text-right font-mono">${fmt(l.outstandingAmount)}</td>
                  </tr>
                ))}</tbody>
              </table>
              {sortedOutstanding.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">所有訂單已交貨</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 4. BATCH SETTLEMENT                                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'settlements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">批量結數 Batch Settlement</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingSettlement({ settlementType: 'ar', currency: 'HKD', discount: 0, otherCharges: 0 }); setSettlementItems([]); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                  <Plus size={14} /> 應收結數
                </button>
                <button onClick={() => { setEditingSettlement({ settlementType: 'ap', currency: 'HKD', discount: 0, otherCharges: 0 }); setSettlementItems([]); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  <Plus size={14} /> 應付結數
                </button>
              </div>
            </div>

            {editingSettlement && (
              <div className="bg-white border rounded-xl p-4 space-y-4">
                <h3 className="font-bold">{editingSettlement.settlementType === 'ar' ? '應收帳結數' : '應付帳結數'}</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">結數日期</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.settlementDate || new Date().toISOString().slice(0, 10)}
                      onChange={e => setEditingSettlement(p => ({ ...p!, settlementDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">銀行帳戶</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.bankAccountId || ''}
                      onChange={e => {
                        const b = bankAccounts.find(b => b.id === e.target.value);
                        setEditingSettlement(p => ({ ...p!, bankAccountId: e.target.value, bankName: b ? `${b.accountName}` : '' }));
                      }}>
                      <option value="">選擇銀行</option>
                      {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.accountCode} - {b.accountName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">支票號碼</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.chequeNumber || ''}
                      onChange={e => setEditingSettlement(p => ({ ...p!, chequeNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">支票日期</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.chequeDate || ''}
                      onChange={e => setEditingSettlement(p => ({ ...p!, chequeDate: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">選擇要結數的文件（點擊加入）</p>
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    {(editingSettlement.settlementType === 'ar' ? arList : apList).map((doc: any) => {
                      const outstanding = doc.amount - (doc.paidAmount || 0);
                      const isSelected = settlementItems.some(i => i.documentId === doc.id);
                      return (
                        <div key={doc.id} onClick={() => {
                          if (isSelected) { setSettlementItems(p => p.filter(i => i.documentId !== doc.id)); }
                          else {
                            setSettlementItems(p => [...p, {
                              documentType: editingSettlement.settlementType === 'ar' ? 'ar' : 'ap',
                              documentId: doc.id,
                              documentNumber: doc.voucherNumber || doc.invoiceNumber || doc.id.slice(0, 8),
                              documentDate: doc.invoiceDate,
                              originalAmount: doc.amount,
                              settledAmount: outstanding,
                            }]);
                          }
                        }} className={`flex items-center justify-between px-3 py-2 border-b cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            {isSelected ? <CheckCircle size={14} className="text-indigo-600" /> : <div className="w-3.5 h-3.5 border rounded" />}
                            <span className="font-mono text-xs">{doc.voucherNumber || doc.invoiceNumber || '-'}</span>
                            <span className="text-slate-500">{editingSettlement.settlementType === 'ar' ? doc.clientName : doc.supplierName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 mr-2">{fmtDate(doc.invoiceDate)}</span>
                            <span className="font-mono font-bold">${fmt(outstanding)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {settlementItems.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>已選 {settlementItems.length} 張文件</span>
                      <span className="font-bold font-mono">合計: ${fmt(settlementItems.reduce((s, i) => s + (i.settledAmount || 0), 0))}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">折扣</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.discount || 0}
                      onChange={e => setEditingSettlement(p => ({ ...p!, discount: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">其他費用</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingSettlement.otherCharges || 0}
                      onChange={e => setEditingSettlement(p => ({ ...p!, otherCharges: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => { setEditingSettlement(null); setSettlementItems([]); }} className="px-3 py-1.5 border rounded-lg text-sm">取消</button>
                  <button onClick={saveSettlement} disabled={settlementItems.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50">
                    <Save size={14} /> 確認結數
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">結數編號</th>
                  <th className="text-center px-4 py-2">類型</th>
                  <th className="text-left px-4 py-2">日期</th>
                  <th className="text-left px-4 py-2">對象</th>
                  <th className="text-left px-4 py-2">銀行/支票</th>
                  <th className="text-right px-4 py-2">淨額</th>
                </tr></thead>
                <tbody>{settlements.map(s => (
                  <tr key={s.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs">{s.settlementNumber}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${s.settlementType === 'ar' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {s.settlementType === 'ar' ? '應收' : '應付'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{fmtDate(s.settlementDate)}</td>
                    <td className="px-4 py-2">{s.clientName || s.supplierName || '-'}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{s.bankName}{s.chequeNumber ? ` / ${s.chequeNumber}` : ''}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">${fmt(s.netAmount)}</td>
                  </tr>
                ))}</tbody>
              </table>
              {settlements.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無結數記錄</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 5. PRICE HISTORY                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'price_history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">客戶價格記錄 Price History</h2>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input className="pl-8 pr-3 py-2 border rounded-lg text-sm w-56" placeholder="搜尋客戶或產品..."
                  value={priceFilter} onChange={e => setPriceFilter(e.target.value)} />
              </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">日期</th>
                  <th className="text-left px-4 py-2">客戶</th>
                  <th className="text-left px-4 py-2">產品</th>
                  <th className="text-right px-4 py-2">單價</th>
                  <th className="text-right px-4 py-2">數量</th>
                  <th className="text-left px-4 py-2">來源</th>
                </tr></thead>
                <tbody>{filteredPriceHistory.map(p => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{fmtDate(p.sourceDate)}</td>
                    <td className="px-4 py-2">{p.clientName}</td>
                    <td className="px-4 py-2">{p.productName}</td>
                    <td className="px-4 py-2 text-right font-mono">${fmt(p.unitPrice)}</td>
                    <td className="px-4 py-2 text-right">{p.qty || '-'} {p.unit || ''}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.sourceType === 'order' ? 'bg-blue-50 text-blue-600' : p.sourceType === 'invoice' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.sourceType === 'order' ? '訂單' : p.sourceType === 'invoice' ? '發票' : '報價'}
                      </span>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {filteredPriceHistory.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無價格記錄</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 6. MODULE LOCK DATES                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'lock_dates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">上鎖日期設定 Module Lock Dates</h2>
              <button onClick={saveLockDates} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                <Save size={14} /> 儲存設定
              </button>
            </div>

            <p className="text-sm text-slate-500">設定每個模組的上鎖日期。上鎖日期之前的文件將不能修改。日期格式: YYYY-MM-DD，設為 1900-01-01 代表不上鎖。</p>

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-3">模組</th>
                  <th className="text-left px-4 py-3">上鎖日期</th>
                  <th className="text-center px-4 py-3">狀態</th>
                </tr></thead>
                <tbody>{LOCKABLE_MODULES.map(m => {
                  const dateVal = editingLocks[m.key] || '1900-01-01';
                  const isLocked = dateVal > '1900-01-01';
                  return (
                    <tr key={m.key} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{m.label}</td>
                      <td className="px-4 py-3">
                        <input type="date" className="border rounded-lg px-3 py-1.5 text-sm w-48" value={dateVal}
                          onChange={e => setEditingLocks(p => ({ ...p, [m.key]: e.target.value }))} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs"><Lock size={12} /> 已鎖</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs"><Unlock size={12} /> 未鎖</span>
                        )}
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 7. CURRENCIES                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'currencies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">貨幣管理 Currencies</h2>
              <button onClick={() => setEditingCurrency({ exchangeRate: 1, isBase: false, isActive: true })}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                <Plus size={14} /> 新增貨幣
              </button>
            </div>

            {editingCurrency && (
              <div className="bg-white border rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">代碼</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingCurrency.code || ''}
                      onChange={e => setEditingCurrency(p => ({ ...p!, code: e.target.value.toUpperCase() }))} placeholder="HKD" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">中文名稱</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingCurrency.nameZh || ''}
                      onChange={e => setEditingCurrency(p => ({ ...p!, nameZh: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">English Name</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingCurrency.nameEn || ''}
                      onChange={e => setEditingCurrency(p => ({ ...p!, nameEn: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">符號</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm" value={editingCurrency.symbol || ''}
                      onChange={e => setEditingCurrency(p => ({ ...p!, symbol: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">兌換率 (vs HKD)</label>
                    <input type="number" step="0.000001" className="w-full border rounded-lg px-3 py-2 text-sm" value={editingCurrency.exchangeRate || 1}
                      onChange={e => setEditingCurrency(p => ({ ...p!, exchangeRate: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingCurrency(null)} className="px-3 py-1.5 border rounded-lg text-sm">取消</button>
                  <button onClick={saveCurrency} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm">
                    <Save size={14} /> 儲存
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">代碼</th>
                  <th className="text-left px-4 py-2">符號</th>
                  <th className="text-left px-4 py-2">中文</th>
                  <th className="text-left px-4 py-2">English</th>
                  <th className="text-right px-4 py-2">兌換率</th>
                  <th className="text-center px-4 py-2">基準</th>
                  <th className="text-center px-4 py-2">操作</th>
                </tr></thead>
                <tbody>{currencies.map(c => (
                  <tr key={c.code} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono font-bold">{c.code}</td>
                    <td className="px-4 py-2">{c.symbol}</td>
                    <td className="px-4 py-2">{c.nameZh}</td>
                    <td className="px-4 py-2 text-slate-500">{c.nameEn}</td>
                    <td className="px-4 py-2 text-right font-mono">{c.exchangeRate}</td>
                    <td className="px-4 py-2 text-center">{c.isBase && <Check size={14} className="mx-auto text-emerald-600" />}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => setEditingCurrency(c)} className="p-1 hover:bg-slate-100 rounded"><Edit size={14} /></button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 8. STOCK VALUATION                                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'stock_valuation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">期末庫存估值 Stock Valuation</h2>
              <div className="flex items-center gap-2">
                <select className="border rounded-lg px-3 py-2 text-sm" value={valuationMethod}
                  onChange={e => setValuationMethod(e.target.value as ValuationMethod)}>
                  <option value="average_cost">平均成本</option>
                  <option value="standard_cost">標準成本</option>
                  <option value="last_purchase">最後採購價</option>
                </select>
                <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={valuationDate}
                  onChange={e => setValuationDate(e.target.value)} />
                <button onClick={loadStockValuation} className="p-2 border rounded-lg hover:bg-slate-50"><RefreshCw size={14} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-indigo-600">庫存品項</p>
                <p className="text-2xl font-bold text-indigo-800">{valuationLines.length}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-600">庫存總值</p>
                <p className="text-2xl font-bold text-emerald-800">${fmt(totalValuation)}</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr>
                  <th className="text-left px-4 py-2">材料</th>
                  <th className="text-right px-4 py-2">庫存數量</th>
                  <th className="text-left px-4 py-2">單位</th>
                  <th className="text-right px-4 py-2">平均成本</th>
                  <th className="text-right px-4 py-2">標準成本</th>
                  <th className="text-right px-4 py-2">最後採購價</th>
                  <th className="text-right px-4 py-2">估值</th>
                </tr></thead>
                <tbody>{valuationLines.map(l => {
                  const cost = valuationMethod === 'average_cost' ? l.averageCost
                    : valuationMethod === 'standard_cost' ? l.standardCost : l.lastPurchasePrice;
                  return (
                    <tr key={l.ingredientId} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2">{l.ingredientName}</td>
                      <td className="px-4 py-2 text-right font-mono">{l.stockQty}</td>
                      <td className="px-4 py-2">{l.unit}</td>
                      <td className="px-4 py-2 text-right font-mono">${fmt(l.averageCost)}</td>
                      <td className="px-4 py-2 text-right font-mono">${fmt(l.standardCost)}</td>
                      <td className="px-4 py-2 text-right font-mono">${fmt(l.lastPurchasePrice)}</td>
                      <td className="px-4 py-2 text-right font-mono font-bold">${fmt(l.stockQty * cost)}</td>
                    </tr>
                  );
                })}</tbody>
                {valuationLines.length > 0 && (
                  <tfoot className="bg-slate-50 font-bold"><tr>
                    <td colSpan={6} className="text-right px-4 py-2">庫存總值</td>
                    <td className="text-right px-4 py-2 font-mono">${fmt(totalValuation)}</td>
                  </tr></tfoot>
                )}
              </table>
              {valuationLines.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無庫存資料</p>}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 9. YEAR-END GL CLOSING                                     */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'year_end' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">總帳年結 Year-End GL Closing</h2>

            <div className="bg-white border rounded-xl p-6 space-y-4 max-w-xl">
              <p className="text-sm text-slate-600">
                年結功能會將損益表 (P&L) 帳戶的結餘結轉至保留盈餘，並清除 P&L 帳戶。
                資產負債表 (B/S) 帳戶的結餘會帶往新年度。
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-bold">注意事項：</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>請確保沒有其他使用者正在使用系統</li>
                    <li>年結前請先備份資料</li>
                    <li>會計年度為 4月1日 至 3月31日</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-600 mb-2 block font-medium">年結年份</label>
                <div className="flex items-center gap-2">
                  <input type="number" className="border rounded-lg px-3 py-2 text-sm w-32" value={yearEndYear}
                    onChange={e => setYearEndYear(Number(e.target.value))} />
                  <span className="text-sm text-slate-500">
                    即結算 {yearEndYear}/04/01 至 {yearEndYear + 1}/03/31 的帳目
                  </span>
                </div>
              </div>

              <button onClick={runYearEnd} disabled={yearEndRunning}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 font-medium">
                {yearEndRunning ? <RefreshCw size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                {yearEndRunning ? '年結處理中...' : '執行年結'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LegacyFeaturesPanel;
