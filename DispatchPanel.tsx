
import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Plus, Edit, Trash2, Save, X, RefreshCw,
  Calendar, Printer, ChevronDown, ChevronRight,
  Package, MapPin, Phone, Hash, Check, GripVertical,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { DeliveryRoute, WholesaleBrand } from './types';
import { formatMoney } from './money';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface DispatchOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  itemsCount: number;
  lineItems: any[];
  wholesaleBrand: WholesaleBrand | null;
  wholesaleClientId: string | null;
  routeId: string | null;
  deliveryAddress: string | null;
  status: string;
  orderDate: string;
}

interface ClientInfo {
  id: string;
  companyName: string;
  phone: string;
  routeId: string | null;
  brand: WholesaleBrand;
  address: string;
}

// ─── Component ──────────────────────────────────────────────────

const DispatchPanel: React.FC<Props> = ({ showToast }) => {
  const [subTab, setSubTab] = useState<'dispatch' | 'routes'>('dispatch');
  const [dispatchDate, setDispatchDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  // Route editing
  const [editingRoute, setEditingRoute] = useState<(Partial<DeliveryRoute> & { isNew?: boolean }) | null>(null);
  const [savingRoute, setSavingRoute] = useState(false);

  const loadRoutes = useCallback(async () => {
    const { data } = await supabase.from('delivery_routes').select('*').order('sort_order');
    if (data) setRoutes(data.map(mapRoute));
  }, []);

  const loadDispatchData = useCallback(async () => {
    setLoading(true);
    const [routesRes, ordersRes, clientsRes] = await Promise.all([
      supabase.from('delivery_routes').select('*').order('sort_order'),
      supabase.from('orders')
        .select('*')
        .eq('order_type', 'wholesale')
        .gte('delivery_date', dispatchDate)
        .lt('delivery_date', dispatchDate + 'T23:59:59')
        .in('status', ['paid', 'confirmed', 'preparing', 'shipping']),
      supabase.from('members').select('id, company_name, name, phone_number, route_id, wholesale_brand, delivery_address').eq('member_type', 'wholesale'),
    ]);

    if (routesRes.data) {
      const r = routesRes.data.map(mapRoute);
      setRoutes(r);
      const expanded: Record<string, boolean> = {};
      r.forEach(rt => { expanded[rt.id] = true; });
      expanded['unassigned'] = true;
      setExpandedRoutes(expanded);
    }
    if (ordersRes.data) {
      setOrders(ordersRes.data.map(mapOrder));
    }
    if (clientsRes.data) {
      setClients(clientsRes.data.map((c: any) => ({
        id: c.id, companyName: c.company_name || c.name, phone: c.phone_number || '',
        routeId: c.route_id, brand: c.wholesale_brand, address: c.delivery_address || '',
      })));
    }
    setLoading(false);
  }, [dispatchDate]);

  useEffect(() => { loadDispatchData(); }, [loadDispatchData]);

  const mapRoute = (r: any): DeliveryRoute => ({
    id: r.id, name: r.name, description: r.description,
    color: r.color || '#6366f1', sortOrder: r.sort_order, isActive: r.is_active,
  });

  const mapOrder = (r: any): DispatchOrder => ({
    id: r.id, customerName: r.customer_name, customerPhone: r.customer_phone || '',
    total: r.total, itemsCount: r.items_count, lineItems: r.line_items || [],
    wholesaleBrand: r.wholesale_brand, wholesaleClientId: r.wholesale_client_id,
    routeId: r.route_id, deliveryAddress: r.delivery_address,
    status: r.status, orderDate: r.order_date,
  });

  const getOrderRoute = (order: DispatchOrder): string | null => {
    if (order.routeId) return order.routeId;
    const client = clients.find(c =>
      (order.wholesaleClientId && c.id === order.wholesaleClientId) ||
      c.phone === order.customerPhone
    );
    return client?.routeId || null;
  };

  const getOrderBrand = (order: DispatchOrder): WholesaleBrand | null => {
    if (order.wholesaleBrand) return order.wholesaleBrand;
    const client = clients.find(c =>
      (order.wholesaleClientId && c.id === order.wholesaleClientId) ||
      c.phone === order.customerPhone
    );
    return client?.brand || null;
  };

  const getOrderAddress = (order: DispatchOrder): string => {
    if (order.deliveryAddress) return order.deliveryAddress;
    const client = clients.find(c =>
      (order.wholesaleClientId && c.id === order.wholesaleClientId) ||
      c.phone === order.customerPhone
    );
    return client?.address || '';
  };

  const groupedOrders = (() => {
    const groups: Record<string, DispatchOrder[]> = {};
    routes.filter(r => r.isActive).forEach(r => { groups[r.id] = []; });
    groups['unassigned'] = [];
    orders.forEach(o => {
      const routeId = getOrderRoute(o);
      if (routeId && groups[routeId]) groups[routeId].push(o);
      else groups['unassigned'].push(o);
    });
    return groups;
  })();

  const toggleRoute = (id: string) => {
    setExpandedRoutes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Route CRUD ──

  const handleSaveRoute = async () => {
    if (!editingRoute || !editingRoute.name?.trim()) {
      showToast('請輸入車線名稱', 'error'); return;
    }
    setSavingRoute(true);
    const payload = {
      name: editingRoute.name.trim(),
      description: editingRoute.description || '',
      color: editingRoute.color || '#6366f1',
      sort_order: editingRoute.sortOrder ?? routes.length,
      is_active: editingRoute.isActive ?? true,
    };
    if (editingRoute.isNew) {
      const { error } = await supabase.from('delivery_routes').insert(payload);
      if (error) { showToast(`新增失敗：${error.message}`, 'error'); setSavingRoute(false); return; }
      showToast('車線已新增');
    } else {
      const { error } = await supabase.from('delivery_routes').update(payload).eq('id', editingRoute.id);
      if (error) { showToast(`更新失敗：${error.message}`, 'error'); setSavingRoute(false); return; }
      showToast('車線已更新');
    }
    setEditingRoute(null);
    setSavingRoute(false);
    loadRoutes();
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('確定刪除此車線？相關客戶的車線會被清除。')) return;
    const { error } = await supabase.from('delivery_routes').delete().eq('id', id);
    if (error) showToast(`刪除失敗：${error.message}`, 'error');
    else { showToast('已刪除'); loadRoutes(); }
  };

  // ── Route dispatched status ──
  const [dispatchedRoutes, setDispatchedRoutes] = useState<Record<string, boolean>>({});

  const markRouteDispatched = async (routeId: string) => {
    setDispatchedRoutes(prev => ({ ...prev, [routeId]: true }));
    showToast('已標記為已出車');
  };

  const printRouteDocuments = (routeId: string) => {
    const routeOrders = groupedOrders[routeId] || [];
    if (routeOrders.length === 0) { showToast('此車線無訂單', 'error'); return; }
    const route = routes.find(r => r.id === routeId);
    const routeName = route?.name || '未分配';

    // Generate combined print document for all orders in this route
    const printHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${routeName} 派車單</title>
    <style>
      body{font-family:sans-serif;padding:20px}
      table{width:100%;border-collapse:collapse;margin:8px 0}
      th,td{border:1px solid #333;padding:5px 8px;text-align:left;font-size:12px}
      th{background:#eee;font-weight:bold}
      .route-header{font-size:18px;font-weight:bold;border-bottom:3px solid ${route?.color || '#333'};padding-bottom:6px;margin-bottom:12px}
      .order-block{page-break-inside:avoid;margin-bottom:16px;padding:12px;border:1px solid #ccc;border-radius:8px}
      .summary{margin-top:20px;padding:12px;background:#f5f5f5;border-radius:8px}
      @media print{body{margin:0;padding:10px}.order-block{break-inside:avoid}}
    </style></head><body>
    <div class="route-header">${routeName} — ${dispatchDate} 派車單</div>
    <p style="font-size:13px;margin-bottom:12px">共 ${routeOrders.length} 單 · 總額 $${formatMoney(routeOrders.reduce((s, o) => s + o.total, 0))}</p>
    ${routeOrders.map((order, idx) => {
      const brand = getOrderBrand(order);
      const bLabel = brand ? WHOLESALE_BRAND_META[brand].label : '';
      const addr = getOrderAddress(order);
      return `<div class="order-block">
        <p style="font-weight:bold;font-size:14px">#${idx + 1} ${order.customerName} ${bLabel ? `(${bLabel})` : ''}</p>
        <p style="font-size:11px;color:#666">電話：${order.customerPhone} · 地址：${addr || '—'}</p>
        <table><thead><tr><th>品名</th><th>數量</th><th>金額</th></tr></thead><tbody>
        ${(order.lineItems || []).map((li: any) => `<tr><td>${li.name}</td><td>${li.qty}</td><td>$${formatMoney(li.line_total)}</td></tr>`).join('')}
        </tbody></table>
        <p style="text-align:right;font-weight:bold;font-size:13px">小計：$${formatMoney(order.total)}</p>
      </div>`;
    }).join('')}
    <div class="summary">
      <p style="font-weight:bold;font-size:14px">車線總結</p>
      <p>總單數：${routeOrders.length} · 總金額：$${formatMoney(routeOrders.reduce((s, o) => s + o.total, 0))}</p>
    </div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) { win.document.write(printHtml); win.document.close(); win.focus(); win.print(); }
  };

  const ROUTE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setSubTab('dispatch')}
          className={`px-5 py-2.5 rounded-lg text-sm font-black transition-all ${subTab === 'dispatch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Truck size={16} className="inline mr-2" /> 今日派車表
        </button>
        <button
          onClick={() => { setSubTab('routes'); loadRoutes(); }}
          className={`px-5 py-2.5 rounded-lg text-sm font-black transition-all ${subTab === 'routes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <GripVertical size={16} className="inline mr-2" /> 車線管理
        </button>
      </div>

      {subTab === 'dispatch' && (
        <>
          {/* Date + controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-400" />
              <input
                type="date"
                value={dispatchDate}
                onChange={e => setDispatchDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-black text-sm"
              />
              <button onClick={loadDispatchData} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
              <span>批發訂單：<strong className="text-slate-900">{orders.length}</strong> 張</span>
              <span>總額：<strong className="text-slate-900">${formatMoney(orders.reduce((s, o) => s + o.total, 0))}</strong></span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw size={24} className="animate-spin text-slate-300" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-16 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <Package size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-lg">今日暫無批發訂單</p>
              <p className="text-slate-300 font-bold text-sm mt-1">選擇其他日期或等待新訂單</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Route groups */}
              {routes.filter(r => r.isActive).map(route => {
                const routeOrders = groupedOrders[route.id] || [];
                const isExpanded = expandedRoutes[route.id];
                const routeTotal = routeOrders.reduce((s, o) => s + o.total, 0);
                return (
                  <div key={route.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Route header */}
                    <div className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                      <button onClick={() => toggleRoute(route.id)} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
                        <span className="text-base font-black text-slate-900">{route.name}</span>
                        {route.description && <span className="text-xs text-slate-400 font-bold">{route.description}</span>}
                        {dispatchedRoutes[route.id] && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black flex items-center gap-1">
                            <Check size={10} /> 已出車
                          </span>
                        )}
                      </button>
                      <div className="flex items-center gap-3 text-sm flex-shrink-0">
                        <span className="font-bold text-slate-500">{routeOrders.length} 單</span>
                        <span className="font-black text-slate-700">${formatMoney(routeTotal)}</span>
                        {routeOrders.length > 0 && (
                          <>
                            <button
                              onClick={() => printRouteDocuments(route.id)}
                              title="列印整條車線"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Printer size={14} />
                            </button>
                            {!dispatchedRoutes[route.id] && (
                              <button
                                onClick={() => markRouteDispatched(route.id)}
                                title="標記已出車"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </>
                        )}
                        <button onClick={() => toggleRoute(route.id)}>
                          {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                    {/* Orders */}
                    {isExpanded && routeOrders.length > 0 && (
                      <div className="border-t border-slate-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-2.5 text-left">單號</th>
                              <th className="px-4 py-2.5 text-left">品牌</th>
                              <th className="px-4 py-2.5 text-left">客戶</th>
                              <th className="px-4 py-2.5 text-left">地址</th>
                              <th className="px-4 py-2.5 text-right">件數</th>
                              <th className="px-6 py-2.5 text-right">金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {routeOrders.map(order => {
                              const brand = getOrderBrand(order);
                              const bMeta = brand ? WHOLESALE_BRAND_META[brand] : null;
                              const addr = getOrderAddress(order);
                              return (
                                <tr key={order.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                                  <td className="px-6 py-3 font-bold text-slate-600">
                                    <Hash size={12} className="inline text-slate-300 mr-1" />{String(order.id).slice(-6)}
                                  </td>
                                  <td className="px-4 py-3">
                                    {bMeta ? (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${bMeta.colorClasses.accent} ${bMeta.colorClasses.text}`}>
                                        {bMeta.icon} {bMeta.label}
                                      </span>
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="font-bold text-slate-800">{order.customerName}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><Phone size={10} /> {order.customerPhone}</p>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-slate-500 font-bold max-w-[200px] truncate">
                                    {addr || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-600">{order.itemsCount}</td>
                                  <td className="px-6 py-3 text-right font-black text-slate-900">${formatMoney(order.total)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {isExpanded && routeOrders.length === 0 && (
                      <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-300 font-bold text-center">此車線今日暫無訂單</div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned */}
              {groupedOrders['unassigned']?.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleRoute('unassigned')}
                    className="w-full flex items-center gap-3 px-6 py-4 bg-amber-50 hover:bg-amber-100/50 transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-base font-black text-amber-700">未分配車線</span>
                    <div className="ml-auto flex items-center gap-4 text-sm">
                      <span className="font-bold text-amber-600">{groupedOrders['unassigned'].length} 單</span>
                      {expandedRoutes['unassigned'] ? <ChevronDown size={16} className="text-amber-400" /> : <ChevronRight size={16} className="text-amber-400" />}
                    </div>
                  </button>
                  {expandedRoutes['unassigned'] && (
                    <div className="border-t border-amber-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-amber-50/50 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            <th className="px-6 py-2.5 text-left">單號</th>
                            <th className="px-4 py-2.5 text-left">品牌</th>
                            <th className="px-4 py-2.5 text-left">客戶</th>
                            <th className="px-4 py-2.5 text-right">件數</th>
                            <th className="px-6 py-2.5 text-right">金額</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedOrders['unassigned'].map(order => {
                            const brand = getOrderBrand(order);
                            const bMeta = brand ? WHOLESALE_BRAND_META[brand] : null;
                            return (
                              <tr key={order.id} className="border-t border-amber-50 hover:bg-amber-50/30">
                                <td className="px-6 py-3 font-bold text-slate-600"><Hash size={12} className="inline text-slate-300 mr-1" />{String(order.id).slice(-6)}</td>
                                <td className="px-4 py-3">
                                  {bMeta ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${bMeta.colorClasses.accent} ${bMeta.colorClasses.text}`}>
                                      {bMeta.icon} {bMeta.label}
                                    </span>
                                  ) : <span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-800">{order.customerName}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-600">{order.itemsCount}</td>
                                <td className="px-6 py-3 text-right font-black text-slate-900">${formatMoney(order.total)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Routes Management Tab ── */}
      {subTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-bold">管理派送車線，每位批發客可指定所屬車線</p>
            <button
              onClick={() => setEditingRoute({ name: '', description: '', color: ROUTE_COLORS[routes.length % ROUTE_COLORS.length], sortOrder: routes.length, isActive: true, isNew: true })}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
            >
              <Plus size={14} /> 新增車線
            </button>
          </div>

          {routes.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <Truck size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">尚未建立車線</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map(route => {
                const clientCount = clients.filter(c => c.routeId === route.id).length;
                return (
                  <div key={route.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-inner" style={{ backgroundColor: route.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{route.name}</h4>
                        {!route.isActive && <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-black">停用</span>}
                      </div>
                      {route.description && <p className="text-xs text-slate-400 font-bold mt-0.5">{route.description}</p>}
                    </div>
                    <div className="text-right text-sm mr-4">
                      <p className="font-black text-slate-700">{clientCount}</p>
                      <p className="text-[10px] text-slate-400 font-bold">批發客</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingRoute({ ...route, isNew: false })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteRoute(route.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Route edit modal */}
          {editingRoute && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9000] flex items-center justify-center p-4" onClick={() => setEditingRoute(null)}>
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">{editingRoute.isNew ? '新增車線' : '編輯車線'}</h3>
                  <button onClick={() => setEditingRoute(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">車線名稱 *</label>
                    <input value={editingRoute.name || ''} onChange={e => setEditingRoute({ ...editingRoute, name: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="例：K線、A線" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">說明</label>
                    <input value={editingRoute.description || ''} onChange={e => setEditingRoute({ ...editingRoute, description: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-100 text-sm" placeholder="觀塘→九龍灣→新蒲崗" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">顏色</label>
                    <div className="flex gap-2 flex-wrap">
                      {ROUTE_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditingRoute({ ...editingRoute, color: c })}
                          className={`w-8 h-8 rounded-lg transition-all ${editingRoute.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        >
                          {editingRoute.color === c && <Check size={14} className="text-white mx-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRoute({ ...editingRoute, isActive: !editingRoute.isActive })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black transition-colors ${editingRoute.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Check size={14} /> {editingRoute.isActive ? '啟用中' : '已停用'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
                  <button onClick={() => setEditingRoute(null)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-50">取消</button>
                  <button onClick={handleSaveRoute} disabled={savingRoute} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 disabled:opacity-50">
                    {savingRoute ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} 儲存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DispatchPanel;
