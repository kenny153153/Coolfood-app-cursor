
import React, { useState } from 'react';
import {
  BarChart3, Package, Truck, Users, DollarSign, BookOpen,
  Globe, Settings, ShieldCheck, LogOut,
  ChevronLeft, ChevronDown,
  ClipboardList, Cpu, Wallet, Image as ImageIcon,
  PlusCircle, Factory, FileText, Layers,
} from 'lucide-react';
import { useWorkspace, WORKSPACE_META } from './WorkspaceContext';
import type { AdminPermissions, AdminAccount, Workspace, AdminModuleId } from './types';

// ─── Sidebar menu structure ─────────────────────────────────────

interface SidebarItem {
  id: AdminModuleId;
  label: string;
  icon: React.ReactNode;
}

const WHOLESALE_ITEMS: SidebarItem[] = [
  { id: 'orders', label: '訂單列表', icon: <ClipboardList size={18}/> },
  { id: 'wholesale_clients', label: '批發客資料庫', icon: <Users size={18}/> },
  { id: 'sales_reps', label: '銷售員', icon: <Users size={18}/> },
  { id: 'quotations', label: '報價單', icon: <FileText size={18}/> },
  { id: 'inventory', label: '產品/分類', icon: <Package size={18}/> },
  { id: 'pricing', label: '價錢設定', icon: <DollarSign size={18}/> },
];

const RETAIL_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: '儀表板', icon: <BarChart3 size={18}/> },
  { id: 'inventory', label: '產品/分類', icon: <Package size={18}/> },
  { id: 'orders', label: '訂單管理', icon: <Truck size={18}/> },
  { id: 'members', label: '會員管理', icon: <Users size={18}/> },
  { id: 'slideshow', label: '廣告輪播', icon: <ImageIcon size={18}/> },
  { id: 'pricing', label: '價錢設定', icon: <DollarSign size={18}/> },
  { id: 'recipes', label: '食譜', icon: <BookOpen size={18}/> },
  { id: 'language', label: '語言翻譯', icon: <Globe size={18}/> },
];

const WORKSPACE_SECTIONS: { workspace: Workspace; items: SidebarItem[] }[] = [
  { workspace: 'WHOLESALE', items: WHOLESALE_ITEMS },
  { workspace: 'COOLFOOD_RETAIL', items: RETAIL_ITEMS },
];

const SHARED_ITEMS: SidebarItem[] = [
  { id: 'dispatch', label: '派車表', icon: <Truck size={18}/> },
  { id: 'warehouse_ops', label: '材料與倉務', icon: <Package size={18}/> },
  { id: 'production', label: '工場', icon: <Factory size={18}/> },
  { id: 'accounting', label: '會計', icon: <Wallet size={18}/> },
  { id: 'legacy_features', label: '進階功能', icon: <Layers size={18}/> },
  { id: 'settings', label: '系統設定', icon: <Settings size={18}/> },
  { id: 'admin_management', label: '管理員', icon: <ShieldCheck size={18}/> },
];

const SHARED_PERMISSION_MAP: Partial<Record<AdminModuleId, keyof AdminPermissions>> = {
  dispatch: 'dispatch',
  warehouse_ops: 'warehouse_ops',
  production: 'production',
  accounting: 'accounting',
  legacy_features: 'accounting',
  settings: 'settings',
  admin_management: 'admin_management',
};

// ─── Component ──────────────────────────────────────────────────

export interface AdminSidebarProps {
  adminModule: AdminModuleId;
  moduleWorkspace: Workspace | null;
  onNavigate: (module: AdminModuleId, workspace?: Workspace | null) => void;
  adminUser: AdminAccount | null;
  isOpen: boolean;
  setIsOpen: (fn: boolean | ((prev: boolean) => boolean)) => void;
  hasAdminPermission: (module: keyof AdminPermissions | string) => boolean;
  onLogout: () => void;
  t: any;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminModule,
  moduleWorkspace,
  onNavigate,
  adminUser,
  isOpen,
  setIsOpen,
  hasAdminPermission,
  onLogout,
  t,
}) => {
  const { activeWorkspace, availableWorkspaces } = useWorkspace();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    WHOLESALE: false,
    COOLFOOD_RETAIL: true,
  });

  const toggleSection = (ws: Workspace) => {
    if (!isOpen) {
      setIsOpen(true);
      setExpandedSections(prev => ({ ...prev, [ws]: true }));
      return;
    }
    setExpandedSections(prev => ({ ...prev, [ws]: !prev[ws] }));
  };

  const isItemActive = (itemId: AdminModuleId, sectionWs?: Workspace | null) => {
    if (sectionWs) {
      return adminModule === itemId && moduleWorkspace === sectionWs;
    }
    return adminModule === itemId && !moduleWorkspace;
  };

  const visibleSections = WORKSPACE_SECTIONS.filter(s =>
    availableWorkspaces.includes(s.workspace) &&
    (activeWorkspace === null || activeWorkspace === s.workspace)
  );

  const visibleSharedItems = SHARED_ITEMS.filter(item => {
    const permKey = SHARED_PERMISSION_MAP[item.id];
    if (permKey) return hasAdminPermission(permKey);
    return true;
  });

  return (
    <aside className={`bg-slate-900 text-white flex-shrink-0 flex flex-col py-4 overflow-y-auto hide-scrollbar border-r border-slate-800 transition-[width] duration-200 ${isOpen ? 'w-60 px-3' : 'w-16 px-2'}`}>

      {/* ── Logo ── */}
      <div className={`flex items-center ${isOpen ? 'gap-3 w-full px-1' : 'justify-center flex-col gap-1'}`}>
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40 flex-shrink-0">
          <Cpu size={24}/>
        </div>
        {isOpen && (
          <div className="min-w-0">
            <h2 className="text-base font-black tracking-tight truncate">{t.admin.controlCenter}</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">REAR-LINK 5.0</p>
          </div>
        )}
      </div>

      {/* ── Logged-in admin info ── */}
      {adminUser && isOpen && (
        <div className="w-full mt-3 px-3 py-2 bg-white/5 rounded-xl flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-black">
            {adminUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{adminUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate">
              {adminUser.roleDisplayName || (adminUser.role === 'super_admin' ? '超級管理員' : '管理員')}
            </p>
          </div>
        </div>
      )}

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setIsOpen((prev: boolean) => !prev)}
        className={`w-full flex items-center ${isOpen ? 'gap-2 px-3' : 'justify-center'} py-2 mt-4 bg-white/5 rounded-2xl text-xs font-black text-white/70 hover:text-white transition-all flex-shrink-0`}
      >
        <ChevronLeft size={16} className={isOpen ? '' : 'rotate-180'} />
        {isOpen && <span>{t.admin.collapseSidebar}</span>}
      </button>

      {/* ── Navigation ── */}
      <nav className="flex-1 mt-4 w-full min-w-0 space-y-0.5 overflow-y-auto hide-scrollbar">

        {/* ── 總儀表版 ── */}
        {hasAdminPermission('global_dashboard') && (
          <SidebarBtn
            active={isItemActive('global_dashboard')}
            icon={<BarChart3 size={18}/>}
            label="總儀表版"
            isOpen={isOpen}
            onClick={() => onNavigate('global_dashboard', null)}
            highlight
          />
        )}

        {/* ── ＋新訂單 ── */}
        {hasAdminPermission('new_order') && (
          <SidebarBtn
            active={isItemActive('new_order')}
            icon={<PlusCircle size={18}/>}
            label="＋新訂單"
            isOpen={isOpen}
            onClick={() => onNavigate('new_order', null)}
            accentClass="text-emerald-400"
          />
        )}

        {/* ── Divider ── */}
        <div className="py-2">{isOpen && <div className="h-px bg-white/10 mx-2" />}</div>

        {/* ── Workspace sections ── */}
        {visibleSections.map(section => {
          const ws = section.workspace;
          const meta = WORKSPACE_META[ws];
          const isExpanded = expandedSections[ws];
          const isSectionActive = moduleWorkspace === ws;

          return (
            <div key={ws} className="space-y-0.5">
              {/* Section header */}
              <button
                onClick={() => toggleSection(ws)}
                className={`w-full flex items-center ${isOpen ? 'gap-2.5 px-3' : 'justify-center px-0'} py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isExpanded
                    ? `${meta.colorClasses.accent} ${meta.colorClasses.text} ${meta.colorClasses.border} border`
                    : isSectionActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base flex-shrink-0">{meta.icon}</span>
                {isOpen && (
                  <>
                    <span className="truncate text-xs font-black">{meta.label}</span>
                    <ChevronDown
                      size={14}
                      className={`ml-auto transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </>
                )}
              </button>

              {/* Sub-items */}
              {isExpanded && isOpen && (
                <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5 pb-1">
                  {section.items.filter(item => {
                    const permKey = item.id as keyof AdminPermissions;
                    return hasAdminPermission(permKey);
                  }).map(item => (
                    <button
                      key={`${ws}-${item.id}`}
                      onClick={() => onNavigate(item.id, ws)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        isItemActive(item.id, ws)
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Divider ── */}
        <div className="py-2">{isOpen && <div className="h-px bg-white/10 mx-2" />}</div>

        {/* ── Shared items ── */}
        {visibleSharedItems.map(item => (
          <SidebarBtn
            key={item.id}
            active={isItemActive(item.id)}
            icon={item.icon}
            label={item.label}
            isOpen={isOpen}
            onClick={() => onNavigate(item.id, null)}
          />
        ))}
      </nav>

      {/* ── Logout ── */}
      <button
        onClick={onLogout}
        className={`w-full flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-0'} py-3 text-slate-500 font-bold text-sm hover:text-white border-t border-white/5 pt-4 mt-auto transition-colors flex-shrink-0`}
      >
        <LogOut size={20}/>
        {isOpen && <span className="truncate">{t.admin.exitAdmin}</span>}
      </button>
    </aside>
  );
};

// ─── Sidebar button helper ──────────────────────────────────────

const SidebarBtn: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  highlight?: boolean;
  accentClass?: string;
}> = ({ active, icon, label, isOpen, onClick, highlight, accentClass }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
      active
        ? highlight
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-900/30'
          : 'bg-blue-600 text-white shadow-xl'
        : accentClass
        ? `${accentClass} hover:bg-white/5`
        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    {icon}
    {isOpen && <span className="truncate text-xs">{label}</span>}
  </button>
);

export default AdminSidebar;
