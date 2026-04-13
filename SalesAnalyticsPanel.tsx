import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Users, Package, Calendar,
  ChevronDown, RefreshCw, DollarSign, ShoppingBag, Award,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import type { OrderLineItem, WholesaleBrand } from './types';
import { formatMoney } from './money';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface OrderRow {
  id: number | string;
  customer_name: string;
  total: number;
  order_date: string;
  order_type?: string | null;
  wholesale_brand?: string | null;
  line_items?: OrderLineItem[];
  status: string;
}

interface CommissionRow {
  salesperson_name: string;
  client_name: string;
  order_amount: number;
  commission_amount: number;
  order_date?: string;
  brand?: string;
}

type AnalyticsTab = 'overview' | 'clients' | 'products' | 'monthly' | 'salesperson';

const VALID_STATUSES = ['paid', 'preparing', 'shipping', 'shipped', 'delivered'];

const fmtK = (v: number) => `$${formatMoney(v)}`;

const SalesAnalyticsPanel: React.FC<Props> = ({ showToast }) => {
  const [tab, setTab] = useState<AnalyticsTab>('overview');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);

  const now = new Date();
  const [monthFrom, setMonthFrom] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthTo, setMonthTo] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [bizFilter, setBizFilter] = useState<'all' | 'retail' | 'GHFOODS' | 'COOLFOOD'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const dateFrom = `${monthFrom}-01`;
    const dateTo = `${monthTo}-31`;

    const [ordersRes, commRes] = await Promise.all([
      supabase.from('orders')
        .select('id, customer_name, total, order_date, order_type, wholesale_brand, line_items, status')
        .gte('order_date', dateFrom)
        .lte('order_date', dateTo)
        .in('status', VALID_STATUSES)
        .order('order_date', { ascending: false }),
      supabase.from('sales_commissions')
        .select('salesperson_name, client_name, order_amount, commission_amount, order_date, brand'),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as OrderRow[]);
    if (commRes.data) setCommissions(commRes.data as CommissionRow[]);
    setLoading(false);
  }, [monthFrom, monthTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    if (bizFilter === 'all') return orders;
    if (bizFilter === 'retail') return orders.filter(o => o.order_type !== 'wholesale');
    return orders.filter(o => o.order_type === 'wholesale' && o.wholesale_brand === bizFilter);
  }, [orders, bizFilter]);

  // ─── Computed analytics ──────────────────────────────────────

  const totalRevenue = useMemo(() => filtered.reduce((s, o) => s + o.total, 0), [filtered]);
  const totalOrders = filtered.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const prevMonthStr = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthRev = useMemo(() => filtered.filter(o => o.order_date.startsWith(thisMonthStr)).reduce((s, o) => s + o.total, 0), [filtered, thisMonthStr]);
  const prevMonthRev = useMemo(() => filtered.filter(o => o.order_date.startsWith(prevMonthStr)).reduce((s, o) => s + o.total, 0), [filtered, prevMonthStr]);
  const momChange = prevMonthRev > 0 ? ((thisMonthRev - prevMonthRev) / prevMonthRev * 100) : 0;

  // Top clients
  const topClients = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; orders: number }> = {};
    for (const o of filtered) {
      const k = o.customer_name;
      if (!map[k]) map[k] = { name: k, revenue: 0, orders: 0 };
      map[k].revenue += o.total;
      map[k].orders += 1;
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // Top products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const o of filtered) {
      for (const item of o.line_items || []) {
        const k = item.name;
        if (!map[k]) map[k] = { name: k, qty: 0, revenue: 0 };
        map[k].qty += item.qty;
        map[k].revenue += item.line_total;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  // Monthly trend (last 12 months)
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; orders: number }> = {};
    for (const o of filtered) {
      const m = o.order_date.slice(0, 7);
      if (!map[m]) map[m] = { month: m, revenue: 0, orders: 0 };
      map[m].revenue += o.total;
      map[m].orders += 1;
    }
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const maxMonthlyRev = useMemo(() => Math.max(...monthlyData.map(m => m.revenue), 1), [monthlyData]);

  // By salesperson
  const salesPersonData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; commission: number; clients: Set<string> }> = {};
    for (const c of commissions) {
      if (bizFilter !== 'all') {
        if (bizFilter === 'retail') continue;
        if (c.brand && c.brand !== bizFilter) continue;
      }
      const k = c.salesperson_name;
      if (!map[k]) map[k] = { name: k, revenue: 0, commission: 0, clients: new Set() };
      map[k].revenue += c.order_amount;
      map[k].commission += c.commission_amount;
      map[k].clients.add(c.client_name);
    }
    return Object.values(map)
      .map(v => ({ ...v, clientCount: v.clients.size }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [commissions, bizFilter]);

  const TABS: { id: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '總覽', icon: <BarChart3 size={14} /> },
    { id: 'clients', label: '客戶排名', icon: <Users size={14} /> },
    { id: 'products', label: '商品排名', icon: <Package size={14} /> },
    { id: 'monthly', label: '每月趨勢', icon: <TrendingUp size={14} /> },
    { id: 'salesperson', label: '銷售員', icon: <Award size={14} /> },
  ];

  const BIZ_OPTS: { value: typeof bizFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'retail', label: '零售' },
    { value: 'GHFOODS', label: '進興批發' },
    { value: 'COOLFOOD', label: 'Coolfood 批發' },
  ];

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-blue-500" /> 營業分析
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">跨品牌銷售數據一覽</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="month" value={monthFrom} onChange={e => setMonthFrom(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300" />
          <span className="text-xs text-slate-400 font-bold">至</span>
          <input type="month" value={monthTo} onChange={e => setMonthTo(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-300" />
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {BIZ_OPTS.map(opt => (
              <button key={opt.value} onClick={() => setBizFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${bizFilter === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchData} disabled={loading}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin text-slate-400' : 'text-slate-500'} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw size={24} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: '總營收', value: fmtK(totalRevenue), icon: <DollarSign className="text-emerald-500" size={18} />, sub: `${totalOrders} 筆訂單` },
                  { label: '平均單價', value: `$${formatMoney(avgOrderValue)}`, icon: <ShoppingBag className="text-blue-500" size={18} />, sub: `${topClients.length} 位客戶` },
                  { label: '本月營收', value: fmtK(thisMonthRev), icon: <Calendar className="text-violet-500" size={18} />,
                    sub: momChange !== 0 ? `${momChange > 0 ? '↑' : '↓'} ${Math.abs(momChange).toFixed(1)}% MoM` : '—' },
                  { label: '上月營收', value: fmtK(prevMonthRev), icon: <TrendingUp className="text-amber-500" size={18} />, sub: prevMonthStr },
                ].map((card, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-slate-50 rounded-xl">{card.icon}</div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{card.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Mini bar chart */}
              {monthlyData.length > 0 && (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-700 mb-4">月營收趨勢</h3>
                  <div className="flex items-end gap-1 h-40">
                    {monthlyData.map(m => (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] font-black text-slate-500">{fmtK(m.revenue)}</span>
                        <div className="w-full bg-blue-500 rounded-t-lg transition-all"
                          style={{ height: `${(m.revenue / maxMonthlyRev) * 100}%`, minHeight: 4 }} />
                        <span className="text-[8px] font-bold text-slate-400">{m.month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top 5 clients + products side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-700 mb-3">Top 5 客戶</h3>
                  {topClients.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{i + 1}</span>
                      <span className="flex-1 text-sm font-bold text-slate-700 truncate">{c.name}</span>
                      <span className="text-xs font-bold text-slate-400">{c.orders}單</span>
                      <span className="text-sm font-black text-slate-900">${formatMoney(c.revenue)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-black text-slate-700 mb-3">Top 5 商品</h3>
                  {topProducts.slice(0, 5).map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{i + 1}</span>
                      <span className="flex-1 text-sm font-bold text-slate-700 truncate">{p.name}</span>
                      <span className="text-xs font-bold text-slate-400">{p.qty}件</span>
                      <span className="text-sm font-black text-slate-900">${formatMoney(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Clients ranking ── */}
          {tab === 'clients' && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">客戶名稱</th>
                    <th className="px-4 py-3 text-right">訂單數</th>
                    <th className="px-4 py-3 text-right">營收</th>
                    <th className="px-4 py-3 text-right">佔比</th>
                    <th className="px-4 py-3 text-left" style={{ width: 200 }}>營收比例</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((c, i) => {
                    const pct = totalRevenue > 0 ? (c.revenue / totalRevenue * 100) : 0;
                    return (
                      <tr key={c.name} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-6 py-2.5 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{c.name}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-600">{c.orders}</td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-900">${formatMoney(c.revenue)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-500">{pct.toFixed(1)}%</td>
                        <td className="px-4 py-2.5">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {topClients.length === 0 && <p className="text-center py-10 text-sm text-slate-400 font-bold">此期間無數據</p>}
            </div>
          )}

          {/* ── Products ranking ── */}
          {tab === 'products' && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">商品名稱</th>
                    <th className="px-4 py-3 text-right">數量</th>
                    <th className="px-4 py-3 text-right">營收</th>
                    <th className="px-4 py-3 text-right">佔比</th>
                    <th className="px-4 py-3 text-left" style={{ width: 200 }}>營收比例</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => {
                    const pct = totalRevenue > 0 ? (p.revenue / totalRevenue * 100) : 0;
                    return (
                      <tr key={p.name} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-6 py-2.5 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{p.name}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-600">{p.qty}</td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-900">${formatMoney(p.revenue)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-500">{pct.toFixed(1)}%</td>
                        <td className="px-4 py-2.5">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {topProducts.length === 0 && <p className="text-center py-10 text-sm text-slate-400 font-bold">此期間無數據</p>}
            </div>
          )}

          {/* ── Monthly trend ── */}
          {tab === 'monthly' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-end gap-2 h-52">
                  {monthlyData.map(m => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-slate-600">{fmtK(m.revenue)}</span>
                      <div className="w-full bg-blue-500 rounded-t-lg transition-all"
                        style={{ height: `${(m.revenue / maxMonthlyRev) * 100}%`, minHeight: 4 }} />
                      <span className="text-[9px] font-bold text-slate-400">{m.month.slice(2).replace('-', '/')}</span>
                      <span className="text-[8px] font-bold text-slate-400">{m.orders}單</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3 text-left">月份</th>
                      <th className="px-4 py-3 text-right">訂單數</th>
                      <th className="px-4 py-3 text-right">營收</th>
                      <th className="px-4 py-3 text-right">平均單價</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...monthlyData].reverse().map(m => (
                      <tr key={m.month} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="px-6 py-2.5 font-bold text-slate-700">{m.month}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-600">{m.orders}</td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-900">${formatMoney(m.revenue)}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-600">${m.orders > 0 ? formatMoney(m.revenue / m.orders) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Salesperson ── */}
          {tab === 'salesperson' && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">銷售員</th>
                    <th className="px-4 py-3 text-right">客戶數</th>
                    <th className="px-4 py-3 text-right">銷售額</th>
                    <th className="px-4 py-3 text-right">佣金</th>
                  </tr>
                </thead>
                <tbody>
                  {salesPersonData.map((sp, i) => (
                    <tr key={sp.name} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-2.5 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{sp.name}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-600">{sp.clientCount}</td>
                      <td className="px-4 py-2.5 text-right font-black text-slate-900">${formatMoney(sp.revenue)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-600">${formatMoney(sp.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesPersonData.length === 0 && <p className="text-center py-10 text-sm text-slate-400 font-bold">尚無佣金數據</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesAnalyticsPanel;
