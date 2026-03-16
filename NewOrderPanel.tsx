
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle, Search, Plus, Trash2, Save, Printer,
  RefreshCw, ChevronDown, Sparkles, User, Phone, MapPin,
  Calendar, FileText, Package, X, Check, Copy, Zap,
  ClipboardList, AlertTriangle,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { WholesaleBrand, WholesaleOrderLine } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface ClientOption {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  address: string;
  brand: WholesaleBrand;
  priceTier: string;
  routeId: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  unit: string;
}

interface ParsedLine {
  productName: string;
  qty: number;
  unit: string;
  matched?: ProductOption;
}

const EMPTY_LINE: WholesaleOrderLine = {
  productId: undefined,
  productName: '',
  qty: 0,
  unit: '磅',
  unitPrice: 0,
  discount: 0,
  lineTotal: 0,
};

const UNITS = ['磅', '斤', '件', '包', '盒', '箱', 'kg', 'pc'];

const NewOrderPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand, availableWholesaleBrands, setWholesaleBrand } = useWorkspace();

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp parse
  const [waMessage, setWaMessage] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);

  // Client selection
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientRef = useRef<HTMLDivElement>(null);

  // Order form
  const [orderLines, setOrderLines] = useState<WholesaleOrderLine[]>([{ ...EMPTY_LINE }]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);

  // Product search per row
  const [activeProductRow, setActiveProductRow] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [clientsRes, productsRes] = await Promise.all([
      supabase.from('wholesale_clients').select('id, company_name, contact_name, phone, address, brand, price_tier, route_id').eq('is_active', true),
      supabase.from('products').select('id, name, price').order('name'),
    ]);
    if (clientsRes.data) {
      setClients(clientsRes.data.map((c: any) => ({
        id: c.id, companyName: c.company_name, contactName: c.contact_name || '',
        phone: c.phone || '', address: c.address || '', brand: c.brand,
        priceTier: c.price_tier || 'P0', routeId: c.route_id,
      })));
    }
    if (productsRes.data) {
      setProducts(productsRes.data.map((p: any) => ({
        id: p.id, name: p.name, price: p.price, unit: '磅',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── WhatsApp parsing (local regex) ────────────────────────────

  const parseWhatsAppMessage = () => {
    if (!waMessage.trim()) return;
    setIsParsing(true);

    const lines = waMessage.split('\n').filter(l => l.trim());
    const parsed: ParsedLine[] = [];

    const qtyPattern = /(\d+(?:\.\d+)?)\s*(磅|斤|件|包|盒|箱|kg|pc|lb)/i;
    const nameQtyPattern = /^(.+?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(磅|斤|件|包|盒|箱|kg|pc|lb)?/;
    const qtyNamePattern = /^(\d+(?:\.\d+)?)\s*(磅|斤|件|包|盒|箱|kg|pc|lb)?\s*(.+)/;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || /^(你好|hi|hello|ok|好|thanks|謝|thx|收到|明天|後天|\d{1,2}[月/]\d{1,2})/i.test(trimmed)) continue;

      let productName = '';
      let qty = 0;
      let unit = '磅';

      const m1 = trimmed.match(nameQtyPattern);
      const m2 = trimmed.match(qtyNamePattern);
      const m3 = trimmed.match(qtyPattern);

      if (m1) {
        productName = m1[1].trim();
        qty = parseFloat(m1[2]);
        unit = m1[3] || '磅';
      } else if (m2 && m2[3]) {
        productName = m2[3].trim();
        qty = parseFloat(m2[1]);
        unit = m2[2] || '磅';
      } else if (m3) {
        qty = parseFloat(m3[1]);
        unit = m3[2];
        productName = trimmed.replace(m3[0], '').trim();
      } else {
        productName = trimmed;
        qty = 1;
      }

      if (productName) {
        const matched = products.find(p =>
          p.name.toLowerCase().includes(productName.toLowerCase()) ||
          productName.toLowerCase().includes(p.name.toLowerCase())
        );
        parsed.push({ productName, qty, unit, matched: matched || undefined });
      }
    }

    setParsedLines(parsed);

    if (parsed.length > 0) {
      const newLines: WholesaleOrderLine[] = parsed.map(p => ({
        productId: p.matched?.id,
        productName: p.matched?.name || p.productName,
        qty: p.qty,
        unit: p.unit,
        unitPrice: p.matched?.price || 0,
        discount: 0,
        lineTotal: p.qty * (p.matched?.price || 0),
      }));
      setOrderLines(newLines);
    }

    // Try to auto-detect client from message
    if (!selectedClient) {
      const allText = waMessage.toLowerCase();
      const match = clients.filter(c => c.brand === wholesaleBrand).find(c =>
        allText.includes(c.companyName.toLowerCase()) ||
        allText.includes(c.phone)
      );
      if (match) setSelectedClient(match);
    }

    setIsParsing(false);
    showToast(`已解析 ${parsed.length} 項產品`);
  };

  const applyParsedLines = () => {
    if (parsedLines.length === 0) return;
    const newLines: WholesaleOrderLine[] = parsedLines.map(p => ({
      productId: p.matched?.id,
      productName: p.matched?.name || p.productName,
      qty: p.qty,
      unit: p.unit,
      unitPrice: p.matched?.price || 0,
      discount: 0,
      lineTotal: p.qty * (p.matched?.price || 0),
    }));
    setOrderLines(newLines);
  };

  // ── Line item operations ──────────────────────────────────────

  const updateLine = (idx: number, field: keyof WholesaleOrderLine, value: any) => {
    setOrderLines(prev => {
      const next = [...prev];
      const line = { ...next[idx], [field]: value };
      if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
        line.lineTotal = line.qty * line.unitPrice * (1 - line.discount / 100);
      }
      next[idx] = line;
      return next;
    });
  };

  const selectProduct = (idx: number, product: ProductOption) => {
    setOrderLines(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        lineTotal: next[idx].qty * product.price * (1 - next[idx].discount / 100),
      };
      return next;
    });
    setActiveProductRow(null);
    setProductSearch('');
  };

  const addLine = () => setOrderLines(prev => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (idx: number) => setOrderLines(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const subtotal = orderLines.reduce((s, l) => s + l.lineTotal, 0);

  // ── Save order ────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedClient) { showToast('請選擇客戶', 'error'); return; }
    if (orderLines.every(l => !l.productName)) { showToast('請添加至少一項產品', 'error'); return; }

    setSaving(true);
    const lineItems = orderLines
      .filter(l => l.productName)
      .map(l => ({
        product_id: l.productId || '',
        name: l.productName,
        unit_price: l.unitPrice,
        qty: l.qty,
        line_total: l.lineTotal,
      }));

    const payload = {
      customer_name: selectedClient.companyName,
      customer_phone: selectedClient.phone,
      total: subtotal,
      subtotal: subtotal,
      status: 'paid',
      order_date: new Date().toISOString(),
      items_count: lineItems.length,
      line_items: lineItems,
      delivery_date: deliveryDate,
      delivery_address: selectedClient.address,
      order_type: 'wholesale',
      wholesale_brand: wholesaleBrand,
      wholesale_client_id: selectedClient.id,
      route_id: selectedClient.routeId,
      payment_method: 'credit',
    };

    const { data, error } = await supabase.from('orders').insert(payload).select('id').single();
    if (error) {
      showToast(`儲存失敗：${error.message}`, 'error');
      setSaving(false);
      return;
    }

    // Auto-create accounts receivable entry
    await supabase.from('accounts_receivable').insert({
      client_id: selectedClient.id,
      client_name: selectedClient.companyName,
      brand: wholesaleBrand,
      order_id: data.id?.toString(),
      invoice_date: new Date().toISOString().slice(0, 10),
      amount: subtotal,
      paid_amount: 0,
      status: 'pending',
      credit_terms: 'cod',
    });

    setSavedOrderId(data.id?.toString() || null);
    setSaving(false);
    showToast('訂單已儲存');
  };

  const handlePrint = (type: 'tricolor' | 'picking' | 'delivery') => {
    const titles: Record<string, string> = {
      tricolor: '三色單',
      picking: '執貨紙',
      delivery: '送貨單',
    };
    showToast(`正在生成 ${titles[type]}...`);
    // Print generation would trigger browser print dialog with formatted content
    setTimeout(() => {
      const printContent = generatePrintHtml(type);
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }, 300);
  };

  const generatePrintHtml = (type: string) => {
    const brandLabel = WHOLESALE_BRAND_META[wholesaleBrand].label;
    const validLines = orderLines.filter(l => l.productName);
    const colors: Record<string, string> = { tricolor: '#fff', picking: '#ffffcc', delivery: '#ccffcc' };
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${type}</title>
    <style>body{font-family:sans-serif;padding:20px;background:${colors[type] || '#fff'}}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{border:1px solid #333;padding:6px 8px;text-align:left;font-size:13px}
    th{background:#eee;font-weight:bold}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:12px}
    .total{text-align:right;font-size:16px;font-weight:bold;margin-top:12px}
    @media print{body{margin:0;padding:10px}}</style></head><body>
    <div class="header"><div><h2 style="margin:0">${brandLabel}</h2>
    <p style="margin:4px 0;font-size:12px">${type === 'tricolor' ? '訂單確認單' : type === 'picking' ? '執貨紙（工場用）' : '送貨單（司機用）'}</p></div>
    <div style="text-align:right"><p style="margin:0;font-size:12px">單號：${savedOrderId || '—'}</p>
    <p style="margin:2px 0;font-size:12px">日期：${new Date().toLocaleDateString('zh-TW')}</p>
    <p style="margin:2px 0;font-size:12px">送貨日：${deliveryDate}</p></div></div>
    <p><strong>客戶：</strong>${selectedClient?.companyName || '—'}</p>
    <p><strong>電話：</strong>${selectedClient?.phone || '—'}</p>
    <p><strong>地址：</strong>${selectedClient?.address || '—'}</p>
    <table><thead><tr><th>#</th><th>品名</th><th>數量</th><th>單位</th>
    ${type !== 'picking' ? '<th>單價</th><th>金額</th>' : ''}</tr></thead><tbody>
    ${validLines.map((l, i) => `<tr><td>${i + 1}</td><td>${l.productName}</td><td>${l.qty}</td><td>${l.unit}</td>
    ${type !== 'picking' ? `<td>$${l.unitPrice.toFixed(1)}</td><td>$${l.lineTotal.toFixed(1)}</td>` : ''}</tr>`).join('')}
    </tbody></table>
    ${type !== 'picking' ? `<p class="total">合計：$${subtotal.toFixed(2)}</p>` : ''}
    ${orderNotes ? `<p style="margin-top:12px;font-size:12px"><strong>備註：</strong>${orderNotes}</p>` : ''}
    </body></html>`;
  };

  const resetForm = () => {
    setSelectedClient(null);
    setClientSearch('');
    setOrderLines([{ ...EMPTY_LINE }]);
    setOrderNotes('');
    setWaMessage('');
    setParsedLines([]);
    setSavedOrderId(null);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDeliveryDate(d.toISOString().slice(0, 10));
  };

  const filteredClients = clients
    .filter(c => c.brand === wholesaleBrand)
    .filter(c =>
      !clientSearch ||
      c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch) ||
      c.contactName.toLowerCase().includes(clientSearch.toLowerCase())
    );

  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Already saved → show print options ────────────────────────
  if (savedOrderId) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <Check size={36} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">訂單已儲存</h2>
            <p className="text-sm text-slate-400 font-bold mt-1">
              單號 #{savedOrderId} · {selectedClient?.companyName} · {WHOLESALE_BRAND_META[wholesaleBrand].label}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handlePrint('tricolor')}
              className="flex flex-col items-center gap-2 p-5 bg-rose-50 border border-rose-200 rounded-2xl hover:bg-rose-100 transition-colors"
            >
              <Printer size={24} className="text-rose-500" />
              <span className="text-xs font-black text-rose-600">三色單</span>
            </button>
            <button
              onClick={() => handlePrint('picking')}
              className="flex flex-col items-center gap-2 p-5 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors"
            >
              <ClipboardList size={24} className="text-amber-500" />
              <span className="text-xs font-black text-amber-600">執貨紙</span>
            </button>
            <button
              onClick={() => handlePrint('delivery')}
              className="flex flex-col items-center gap-2 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-colors"
            >
              <FileText size={24} className="text-emerald-500" />
              <span className="text-xs font-black text-emerald-600">送貨單</span>
            </button>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700"
            >
              <Plus size={16} /> 繼續下一張訂單
            </button>
            <button
              onClick={() => { handlePrint('tricolor'); handlePrint('picking'); handlePrint('delivery'); }}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800"
            >
              <Printer size={16} /> 全部列印
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Brand selector */}
      {availableWholesaleBrands.length > 1 && (
        <div className="flex items-center gap-2">
          {availableWholesaleBrands.map(brand => {
            const meta = WHOLESALE_BRAND_META[brand];
            const isActive = wholesaleBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => { setWholesaleBrand(brand); setSelectedClient(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  isActive
                    ? `${meta.colorClasses.accent} ${meta.colorClasses.text} ${meta.colorClasses.border} border shadow-sm`
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>{meta.icon}</span> {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: WhatsApp paste area ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <MessageCircle size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">WhatsApp 智能解析</h3>
                <p className="text-[10px] text-slate-400 font-bold">貼上客人訊息，一鍵自動填單</p>
              </div>
            </div>

            <textarea
              value={waMessage}
              onChange={e => setWaMessage(e.target.value)}
              placeholder="貼上 WhatsApp 對話內容...&#10;例：&#10;肥牛 x5磅&#10;豬扒 3件&#10;雞翼 10磅"
              className="w-full h-48 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={parseWhatsAppMessage}
                disabled={!waMessage.trim() || isParsing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {isParsing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                智能解析
              </button>
              <button
                onClick={() => { setWaMessage(''); setParsedLines([]); }}
                className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-black hover:bg-slate-200"
              >
                清除
              </button>
            </div>

            {/* Parsed results preview */}
            {parsedLines.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  解析結果 · {parsedLines.length} 項
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {parsedLines.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-bold">
                      {p.matched ? (
                        <Check size={12} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                      )}
                      <span className="truncate flex-1">{p.productName}</span>
                      <span className="text-slate-400">{p.qty} {p.unit}</span>
                      {p.matched && <span className="text-emerald-500 text-[10px]">→ {p.matched.name}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Client info card (shown when selected) */}
          {selectedClient && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-900">客戶資料</h4>
                <button onClick={() => { setSelectedClient(null); setClientSearch(''); }} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-slate-600"><User size={12} className="text-slate-400" /> {selectedClient.companyName}</div>
                <div className="flex items-center gap-1.5 text-slate-600"><Phone size={12} className="text-slate-400" /> {selectedClient.phone}</div>
                <div className="flex items-center gap-1.5 text-slate-600 col-span-2"><MapPin size={12} className="text-slate-400" /> {selectedClient.address || '—'}</div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${WHOLESALE_BRAND_META[selectedClient.brand].colorClasses.accent} ${WHOLESALE_BRAND_META[selectedClient.brand].colorClasses.text}`}>
                  {WHOLESALE_BRAND_META[selectedClient.brand].label}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-50 text-blue-600">{selectedClient.priceTier}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order form ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Client selector + date */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client search */}
              <div ref={clientRef} className="relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">客戶 *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={selectedClient ? selectedClient.companyName : clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setSelectedClient(null); setShowClientDropdown(true); }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="搜尋客戶名稱 / 電話..."
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
                {showClientDropdown && !selectedClient && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-slate-400 font-bold text-center">找不到符合的客戶</p>
                    ) : (
                      filteredClients.slice(0, 8).map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedClient(c); setShowClientDropdown(false); setClientSearch(''); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{c.companyName}</p>
                            <p className="text-[10px] text-slate-400">{c.phone} · {c.priceTier}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${WHOLESALE_BRAND_META[c.brand].colorClasses.accent} ${WHOLESALE_BRAND_META[c.brand].colorClasses.text}`}>
                            {WHOLESALE_BRAND_META[c.brand].label}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Delivery date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">送貨日期 *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order lines table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                <h3 className="font-black text-sm text-slate-900">訂單明細</h3>
                <span className="text-[10px] font-bold text-slate-400">{orderLines.filter(l => l.productName).length} 項</span>
              </div>
              <button onClick={addLine} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black hover:bg-slate-200">
                <Plus size={12} /> 添加行
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-2.5 text-left w-8">#</th>
                    <th className="px-3 py-2.5 text-left">產品名稱</th>
                    <th className="px-3 py-2.5 text-center w-24">數量</th>
                    <th className="px-3 py-2.5 text-center w-20">單位</th>
                    <th className="px-3 py-2.5 text-center w-28">單價 ($)</th>
                    <th className="px-3 py-2.5 text-center w-20">折扣%</th>
                    <th className="px-3 py-2.5 text-right w-28">小計</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {orderLines.map((line, idx) => (
                    <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-3 py-2 relative">
                        <input
                          value={line.productName}
                          onChange={e => { updateLine(idx, 'productName', e.target.value); setProductSearch(e.target.value); setActiveProductRow(idx); }}
                          onFocus={() => { setActiveProductRow(idx); setProductSearch(line.productName); }}
                          onBlur={() => setTimeout(() => setActiveProductRow(null), 200)}
                          placeholder="輸入或搜尋產品..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold outline-none focus:border-blue-300"
                        />
                        {activeProductRow === idx && productSearch && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-36 overflow-y-auto">
                            {filteredProducts.map(p => (
                              <button
                                key={p.id}
                                onMouseDown={() => selectProduct(idx, p)}
                                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left"
                              >
                                <span className="text-xs font-bold text-slate-700 truncate">{p.name}</span>
                                <span className="text-xs text-slate-400">${p.price}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.qty || ''}
                          onChange={e => updateLine(idx, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          step="0.5"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={line.unit}
                          onChange={e => updateLine(idx, 'unit', e.target.value)}
                          className="w-full px-1 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none"
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.unitPrice || ''}
                          onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          step="0.1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={line.discount || ''}
                          onChange={e => updateLine(idx, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-center outline-none focus:border-blue-300"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-black text-slate-800">${line.lineTotal.toFixed(1)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeLine(idx)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <textarea
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="訂單備註（可選）"
                    className="w-64 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold resize-none h-16 outline-none focus:border-blue-300"
                  />
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-slate-400 font-bold">
                    {orderLines.filter(l => l.productName).length} 項產品
                  </p>
                  <p className="text-2xl font-black text-slate-900">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-slate-200 bg-white text-slate-500 rounded-xl text-sm font-black hover:bg-slate-50"
            >
              清空重填
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedClient}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              儲存訂單
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPanel;
