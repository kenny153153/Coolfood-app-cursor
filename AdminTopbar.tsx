
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Layers } from 'lucide-react';
import { useWorkspace, WORKSPACE_META, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { AdminAccount, Workspace, AdminModuleId, WholesaleBrand } from './types';

// ─── Module title mapping ───────────────────────────────────────

const MODULE_TITLES: Record<string, string> = {
  global_dashboard: '總儀表版',
  new_order: '＋新訂單',
  dashboard: '儀表板',
  inventory: '產品/分類',
  orders: '訂單管理',
  members: '會員管理',
  slideshow: '廣告輪播',
  pricing: '價錢設定',
  recipes: '食譜',
  ingredients: '原材料管理',
  costs: '成本管理',
  language: '語言翻譯',
  settings: '系統設定',
  admin_management: '管理員管理',
  dispatch: '派車表',
  warehouse_ops: '材料與倉務',
  production: '工場',
  accounting: '會計',
  wholesale_clients: '批發客資料庫',
};

// ─── Component ──────────────────────────────────────────────────

export interface AdminTopbarProps {
  adminModule: AdminModuleId;
  moduleWorkspace: Workspace | null;
  adminUser: AdminAccount | null;
  onWorkspaceSwitch: (ws: Workspace | null) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  t: any;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({
  adminModule,
  moduleWorkspace,
  adminUser,
  onWorkspaceSwitch,
  showToast,
  t,
}) => {
  const {
    activeWorkspace, setActiveWorkspace,
    canSwitchWorkspace, availableWorkspaces,
    wholesaleBrand, setWholesaleBrand, availableWholesaleBrands,
  } = useWorkspace();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWorkspace = (ws: Workspace | null) => {
    setActiveWorkspace(ws);
    onWorkspaceSwitch(ws);
    setDropdownOpen(false);
  };

  const currentTitle = MODULE_TITLES[adminModule] || adminModule;
  const isInWholesale = moduleWorkspace === 'WHOLESALE';

  return (
    <header className="mb-10 space-y-4">
      {/* ── Main row ── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">

          {/* ── Workspace Switcher Dropdown ── */}
          {canSwitchWorkspace && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                {activeWorkspace ? (
                  <>
                    <span className="text-lg">{WORKSPACE_META[activeWorkspace].icon}</span>
                    <span className="text-sm font-black text-slate-700">
                      {WORKSPACE_META[activeWorkspace].shortLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <Layers size={18} className="text-slate-400"/>
                    <span className="text-sm font-black text-slate-700">全品牌</span>
                  </>
                )}
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  <button
                    onClick={() => handleSelectWorkspace(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                      activeWorkspace === null
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Layers size={18} className={activeWorkspace === null ? 'text-blue-500' : 'text-slate-400'}/>
                    <span>全品牌總覽</span>
                  </button>
                  <div className="h-px bg-slate-100" />
                  {availableWorkspaces.map(ws => {
                    const meta = WORKSPACE_META[ws];
                    return (
                      <button
                        key={ws}
                        onClick={() => handleSelectWorkspace(ws)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                          activeWorkspace === ws ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">{meta.icon}</span>
                        <span className="font-black">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Module Title ── */}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{currentTitle}</h1>
              {moduleWorkspace && (
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                  WORKSPACE_META[moduleWorkspace].colorClasses.accent
                } ${WORKSPACE_META[moduleWorkspace].colorClasses.text}`}>
                  {WORKSPACE_META[moduleWorkspace].label}
                </span>
              )}
            </div>
            <p className="text-slate-400 font-bold text-sm">{t.admin.realtimeAdmin}</p>
          </div>
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('通知功能開發中', 'error')}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 shadow-sm hover:shadow-md transition-shadow"
          >
            <Bell size={20}/>
          </button>
          {adminUser && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-2 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                {adminUser.name.charAt(0)}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 leading-none">{adminUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {adminUser.role === 'super_admin' ? '超級管理員' : '管理員'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Wholesale brand tabs (only shown when in wholesale workspace) ── */}
      {isInWholesale && availableWholesaleBrands.length > 1 && (
        <div className="flex items-center gap-2">
          {availableWholesaleBrands.map(brand => {
            const meta = WHOLESALE_BRAND_META[brand];
            const isActive = wholesaleBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setWholesaleBrand(brand)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  isActive
                    ? `${meta.colorClasses.accent} ${meta.colorClasses.text} ${meta.colorClasses.border} border shadow-sm`
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
          <span className="text-[10px] text-slate-400 font-bold ml-2">
            目前顯示：{WHOLESALE_BRAND_META[wholesaleBrand].label} 的資料
          </span>
        </div>
      )}
    </header>
  );
};

export default AdminTopbar;
