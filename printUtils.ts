// printUtils.ts — Shared HTML generators for picking slips and aggregate picking lists.
// Used by App.tsx (retail + wholesale batch print) and NewOrderPanel.tsx (wholesale per-order).
import { formatMoney } from './money';

export interface PickingLineItem {
  productCode?: string;
  productName: string;
  qty: number;
  unit?: string;
  processingType?: string;
  processingSpec?: string;
  lineNote?: string;
}

export interface PickingOrderData {
  orderId: string;
  customerName: string;
  clientCode?: string;
  phone?: string;
  address?: string;
  deliveryDate?: string;
  routeName?: string;
  businessLabel: string;
  timestamp: string;
  items: PickingLineItem[];
  orderNotes?: string;
}

export interface AggregatePickingItem {
  name: string;
  qty: number;
  unit?: string;
}

export interface AggregatePickingData {
  businessLabel: string;
  date: string;
  orderCount: number;
  items: AggregatePickingItem[];
  orderIds: string[];
}

export function getBusinessLabel(orderType?: string | null, wholesaleBrand?: string | null): string {
  if (orderType === 'wholesale') {
    if (wholesaleBrand === 'GHFOODS') return '進興食品';
    return 'Coolfood 批發';
  }
  return 'Coolfood 零售';
}

// ─── Per-order picking slip (A5 portrait) ───────────────────────

export function buildPickingSlipHtml(orders: PickingOrderData[]): string {
  const pages = orders.map((order, pageIdx) => {
    const n = order.items.length;
    const namePx = n <= 6 ? 18 : n <= 10 ? 16 : n <= 15 ? 14 : 12;
    const qtyPx  = namePx + 2;
    const emptyTarget = n <= 6 ? 10 : n <= 10 ? 13 : 16;
    const emptyRows = Math.max(0, emptyTarget - n);

    const displayName = order.clientCode
      ? `(${order.clientCode}) ${order.customerName}`
      : order.customerName;

    const itemRows = order.items.map((item, i) => {
      const procTag = item.processingType && item.processingType !== '原件'
        ? `【${item.processingType}${item.processingSpec ? ' ' + item.processingSpec : ''}】`
        : '';
      const qtyStr = `${item.qty}${item.unit || ''}`;
      return `<tr>
        <td class="num">${i + 1}</td>
        <td class="name" style="font-size:${namePx}px">${procTag ? `<span class="proc">${procTag}</span> ` : ''}${item.productName}</td>
        <td class="qty" style="font-size:${qtyPx}px">${qtyStr}</td>
        <td class="note">${item.lineNote || ''}</td>
        <td class="chk">☐</td>
      </tr>`;
    }).join('');

    const emptyHtml = Array(emptyRows)
      .fill('<tr class="empty"><td></td><td></td><td></td><td></td><td></td></tr>')
      .join('');

    const routeTag = order.routeName ? ` · ${order.routeName}` : '';

    return `<div class="page"${pageIdx < orders.length - 1 ? ' style="page-break-after:always"' : ''}>
      <div class="top-row">
        <div class="customer">${displayName}</div>
        <div class="meta">${order.orderId}&ensp;${order.deliveryDate || ''}</div>
      </div>
      <div class="info-bar">
        <span>${order.businessLabel} · 執貨單${routeTag}</span>
        <span>${order.timestamp}</span>
      </div>
      <table>
        <thead><tr>
          <th style="width:7mm">#</th>
          <th>貨物名稱</th>
          <th style="width:24mm;text-align:right;padding-right:1mm">數量</th>
          <th style="width:20mm">備註</th>
          <th class="ctr" style="width:11mm">✓</th>
        </tr></thead>
        <tbody>${itemRows}${emptyHtml}</tbody>
      </table>
      ${order.orderNotes ? `<p class="order-notes"><strong>備註：</strong>${order.orderNotes}</p>` : ''}
      <div class="footer">
        <div class="sig-group">
          <div class="sig-box"><div class="sig-label">執貨</div><div class="sig-field"></div></div>
          <div class="sig-box"><div class="sig-label">箱</div><div class="sig-field"></div></div>
        </div>
        <div class="page-num">${n} 項&ensp;${pageIdx + 1}/${orders.length}</div>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>執貨單</title>
<style>
  @page{size:A5 portrait;margin:5mm}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,'Helvetica Neue',Arial,'Microsoft JhengHei',sans-serif;font-size:11px;color:#000;width:148mm}
  .page{padding:4mm}
  .top-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:1.5mm}
  .customer{font-size:18px;font-weight:900;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .meta{font-size:11px;text-align:right;color:#333;font-weight:700;white-space:nowrap;margin-left:3mm}
  .info-bar{display:flex;justify-content:space-between;font-size:10px;color:#555;font-weight:700;padding:1.5mm 0;border-bottom:2.5px solid #000;margin-bottom:2mm}
  table{width:100%;border-collapse:collapse}
  th{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#555;border-bottom:1.5px solid #000;padding:2px 3px;text-align:left}
  th.ctr{text-align:center}
  td{padding:4px 3px;border-bottom:.5px solid #ccc;vertical-align:middle}
  td.num{text-align:center;font-size:10px;color:#888;width:7mm}
  td.name{font-weight:800}
  td.qty{font-weight:900;text-align:right;padding-right:1mm;width:24mm}
  td.note{font-size:10px;color:#555;max-width:20mm;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}
  td.chk{width:11mm;text-align:center;font-size:16px}
  .proc{color:#7c3aed;font-weight:800}
  .empty td{border-bottom:.5px solid #eee;height:7mm}
  .order-notes{margin-top:2mm;font-size:9px;color:#555;padding:1.5mm;background:#fffde7;border:.5px solid #e0d97a;border-radius:2px}
  .footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:4mm;padding-top:3mm;border-top:1.5px solid #000}
  .sig-group{display:flex;gap:6mm}
  .sig-box{text-align:center}
  .sig-label{font-size:9px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6mm}
  .sig-field{border:1px solid #999;width:22mm;height:10mm;border-radius:2px}
  .page-num{font-size:9px;color:#888;font-weight:600}
  @media print{body{margin:0;padding:0;width:148mm}}
</style></head><body>${pages}</body></html>`;
}

// ─── Aggregate picking list (大執貨表, A4 portrait) ─────────────

export function buildAggregatePickingHtml(sections: AggregatePickingData[]): string {
  const pages = sections.map((data, secIdx) => {
    const rows = data.items.map((item, i) =>
      `<tr>
        <td style="font-size:14px;padding:8px 12px;width:40px;color:#666">${i + 1}</td>
        <td class="name-cell">${item.name}</td>
        <td class="qty-cell">${item.qty}${item.unit || ''}</td>
      </tr>`
    ).join('');

    return `<div class="section"${secIdx < sections.length - 1 ? ' style="page-break-after:always"' : ''}>
      <h1>${data.businessLabel} 大執貨表</h1>
      <p class="meta">日期：${data.date} ｜ 共 ${data.orderCount} 筆訂單 ｜ ${data.items.length} 種商品</p>
      <table>
        <thead><tr><th style="width:40px">#</th><th>貨物名稱</th><th style="text-align:center;width:120px">總數量</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="order-ids">
        <h3>包含訂單（共 ${data.orderIds.length} 筆）</h3>
        <p>${data.orderIds.map(id => '#' + id).join('、')}</p>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>大執貨表</title>
<style>
  @page{size:A4;margin:15mm}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft JhengHei',sans-serif;color:#1e293b}
  h1{font-size:28px;font-weight:900;margin-bottom:4px}
  .meta{color:#64748b;font-size:13px;margin-bottom:24px;font-weight:600}
  table{width:100%;border-collapse:collapse;line-height:1.8}
  th{background:#f1f5f9;padding:10px 14px;text-align:left;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0}
  td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:18px;font-weight:700;line-height:1.8}
  tr:nth-child(even){background:#f8fafc}
  .name-cell{font-size:20px;font-weight:900}
  .qty-cell{font-size:24px;font-weight:900;color:#0f172a;text-align:center;width:120px}
  .order-ids{margin-top:32px;padding-top:16px;border-top:2px solid #e2e8f0}
  .order-ids h3{font-size:13px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
  .order-ids p{font-size:13px;font-weight:700;color:#334155;line-height:1.8;word-break:break-all}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>${pages}</body></html>`;
}

// ─── Invoice PDF (A4 portrait) ──────────────────────────────────

export interface InvoiceOrderData {
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  clientCode?: string;
  phone?: string;
  address?: string;
  invoiceDate: string;
  dueDate?: string;
  paymentTerms?: string;
  businessLabel: string;
  items: { name: string; qty: number; unit?: string; unitPrice: number; lineTotal: number; processingTag?: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
}

export function buildInvoiceHtml(invoices: InvoiceOrderData[]): string {
  const pages = invoices.map((inv, idx) => {
    const itemRows = inv.items.map((item, i) =>
      `<tr>
        <td class="num">${i + 1}</td>
        <td class="desc">${item.processingTag ? `<span class="proc">${item.processingTag}</span> ` : ''}${item.name}</td>
        <td class="qty">${item.qty}${item.unit || ''}</td>
        <td class="price">$${item.unitPrice.toFixed(2)}</td>
        <td class="amt">$${item.lineTotal.toFixed(2)}</td>
      </tr>`
    ).join('');

    const displayName = inv.clientCode ? `(${inv.clientCode}) ${inv.customerName}` : inv.customerName;

    return `<div class="page"${idx < invoices.length - 1 ? ' style="page-break-after:always"' : ''}>
      <div class="inv-header">
        <div>
          <h1>${inv.businessLabel}</h1>
          <p class="inv-label">發票 INVOICE</p>
        </div>
        <div class="inv-meta">
          <div class="meta-row"><span class="meta-key">發票編號</span><span class="meta-val">${inv.invoiceNumber}</span></div>
          <div class="meta-row"><span class="meta-key">訂單編號</span><span class="meta-val">${inv.orderId}</span></div>
          <div class="meta-row"><span class="meta-key">日期</span><span class="meta-val">${inv.invoiceDate}</span></div>
          ${inv.dueDate ? `<div class="meta-row"><span class="meta-key">到期日</span><span class="meta-val">${inv.dueDate}</span></div>` : ''}
          ${inv.paymentTerms ? `<div class="meta-row"><span class="meta-key">付款條款</span><span class="meta-val">${inv.paymentTerms}</span></div>` : ''}
        </div>
      </div>

      <div class="bill-to">
        <p class="bill-label">客戶 Bill To</p>
        <p class="bill-name">${displayName}</p>
        ${inv.phone ? `<p class="bill-detail">${inv.phone}</p>` : ''}
        ${inv.address ? `<p class="bill-detail">${inv.address}</p>` : ''}
      </div>

      <table>
        <thead><tr>
          <th style="width:30px">#</th>
          <th>項目</th>
          <th style="width:70px;text-align:right">數量</th>
          <th style="width:80px;text-align:right">單價</th>
          <th style="width:90px;text-align:right">金額</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="totals">
        <div class="total-row"><span>小計</span><span>$${inv.subtotal.toFixed(2)}</span></div>
        ${inv.deliveryFee > 0 ? `<div class="total-row"><span>運費</span><span>$${inv.deliveryFee.toFixed(2)}</span></div>` : ''}
        <div class="total-row grand"><span>合計 Total</span><span>$${inv.total.toFixed(2)}</span></div>
      </div>

      ${inv.notes ? `<div class="inv-notes"><strong>備註：</strong>${inv.notes}</div>` : ''}

      <div class="inv-footer">
        <p>感謝惠顧 Thank you for your business</p>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>發票</title>
<style>
  @page{size:A4;margin:15mm}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft JhengHei',sans-serif;color:#1e293b;font-size:13px}
  .page{padding:10px 0}
  .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:3px solid #0f172a}
  h1{font-size:22px;font-weight:900;color:#0f172a}
  .inv-label{font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
  .inv-meta{text-align:right}
  .meta-row{display:flex;gap:12px;justify-content:flex-end;margin-bottom:3px}
  .meta-key{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;min-width:60px;text-align:right}
  .meta-val{font-size:13px;font-weight:800;color:#0f172a;min-width:100px;text-align:right}
  .bill-to{margin-bottom:24px;padding:12px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0}
  .bill-label{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
  .bill-name{font-size:16px;font-weight:900;color:#0f172a}
  .bill-detail{font-size:12px;font-weight:600;color:#64748b;margin-top:2px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#f1f5f9;padding:8px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0;text-align:left}
  td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-weight:600}
  td.num{color:#94a3b8;text-align:center;font-size:11px}
  td.desc{font-weight:700}
  td.qty{text-align:right;font-weight:700}
  td.price{text-align:right;color:#64748b}
  td.amt{text-align:right;font-weight:800;color:#0f172a}
  .proc{color:#7c3aed;font-weight:800}
  tr:nth-child(even){background:#fafbfc}
  .totals{margin-left:auto;width:260px}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;font-weight:700;color:#475569}
  .total-row.grand{border-top:2px solid #0f172a;margin-top:6px;padding-top:10px;font-size:18px;font-weight:900;color:#0f172a}
  .inv-notes{margin-top:20px;padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:11px;color:#92400e}
  .inv-footer{margin-top:40px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>${pages}</body></html>`;
}

// ─── Monthly Statement (月結單, A4 portrait) ─────────────────────

export interface StatementEntry {
  date: string;
  voucherNumber?: string;
  description: string;
  debit: number;
  credit: number;
}

export interface StatementData {
  type: 'client' | 'supplier';
  name: string;
  statementMonth: string;
  openingBalance: number;
  entries: StatementEntry[];
  closingBalance: number;
  businessLabel: string;
}

export function buildStatementHtml(statements: StatementData[]): string {
  const pages = statements.map((st, idx) => {
    let running = st.openingBalance;
    const rows = st.entries.map(e => {
      running += e.debit - e.credit;
      return `<tr>
        <td class="date">${e.date}</td>
        <td class="voucher">${e.voucherNumber || ''}</td>
        <td class="desc">${e.description}</td>
        <td class="amt">${e.debit > 0 ? '$' + formatMoney(e.debit) : ''}</td>
        <td class="amt">${e.credit > 0 ? '$' + formatMoney(e.credit) : ''}</td>
        <td class="bal">${running >= 0 ? '' : '-'}$${formatMoney(Math.abs(running))}</td>
      </tr>`;
    }).join('');

    return `<div class="page"${idx < statements.length - 1 ? ' style="page-break-after:always"' : ''}>
      <div class="st-header">
        <div><h1>月結單</h1><p class="st-label">${st.type === 'client' ? 'Customer Statement' : 'Supplier Statement'}</p></div>
        <div class="st-meta">
          <p><strong>結算月份</strong> ${st.statementMonth}</p>
          <p><strong>${st.type === 'client' ? '客戶' : '供應商'}</strong> ${st.name}</p>
        </div>
      </div>
      <table>
        <thead><tr><th style="width:80px">日期</th><th style="width:80px">憑單</th><th>說明</th><th style="width:90px;text-align:right">借方</th><th style="width:90px;text-align:right">貸方</th><th style="width:100px;text-align:right">餘額</th></tr></thead>
        <tbody>
          <tr class="opening"><td colspan="5" class="desc">上期結存 Opening Balance</td><td class="bal">${st.openingBalance >= 0 ? '' : '-'}$${formatMoney(Math.abs(st.openingBalance))}</td></tr>
          ${rows}
        </tbody>
        <tfoot><tr class="closing"><td colspan="5" class="desc">本期結存 Closing Balance</td><td class="bal">${st.closingBalance >= 0 ? '' : '-'}$${formatMoney(Math.abs(st.closingBalance))}</td></tr></tfoot>
      </table>
      <div class="st-footer"><p>如有疑問請於 10 天內提出 · Any discrepancies must be reported within 10 days</p></div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>月結單</title>
<style>
  @page{size:A4;margin:15mm}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft JhengHei',sans-serif;color:#1e293b;font-size:12px}
  .page{padding:10px 0}
  .st-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #0f172a}
  h1{font-size:22px;font-weight:900}
  .st-label{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
  .st-meta{text-align:right;font-size:12px;font-weight:600;color:#475569;line-height:1.8}
  .st-meta strong{font-weight:800;color:#0f172a;margin-right:8px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#f1f5f9;padding:8px 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0;text-align:left}
  td{padding:6px 10px;border-bottom:1px solid #f1f5f9;font-weight:600}
  td.date{font-size:11px;color:#64748b}
  td.voucher{font-family:monospace;font-size:10px;color:#94a3b8}
  td.desc{font-weight:700;color:#334155}
  td.amt{text-align:right;font-weight:700}
  td.bal{text-align:right;font-weight:800;color:#0f172a}
  tr.opening{background:#f8fafc}
  tr.opening td.desc{font-weight:800;color:#64748b;font-style:italic}
  tr.closing{border-top:2px solid #0f172a;background:#f1f5f9}
  tr.closing td.desc{font-weight:900}
  tr.closing td.bal{font-size:14px;font-weight:900}
  .st-footer{margin-top:30px;text-align:center;font-size:10px;font-weight:600;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:14px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>${pages}</body></html>`;
}
