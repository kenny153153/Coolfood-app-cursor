
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Trash2, Save, RefreshCw, Info } from 'lucide-react';
import { supabase } from './supabaseClient';
import { useWorkspace, WHOLESALE_BRAND_META } from './WorkspaceContext';
import type { WholesalePriceTier } from './types';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const WholesalePricingPanel: React.FC<Props> = ({ showToast }) => {
  const { wholesaleBrand } = useWorkspace();
  const brandMeta = WHOLESALE_BRAND_META[wholesaleBrand];

  const [targetMarginFactor, setTargetMarginFactor] = useState(0.88);
  const [priceTiers, setPriceTiers] = useState<WholesalePriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPricing = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wholesale_brand_pricing')
      .select('*')
      .eq('brand', wholesaleBrand)
      .single();
    if (!error && data) {
      setTargetMarginFactor(data.target_margin_factor ?? 0.88);
      setPriceTiers(data.price_tiers ?? []);
    }
    setLoading(false);
  }, [wholesaleBrand]);

  useEffect(() => { loadPricing(); }, [loadPricing]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('wholesale_brand_pricing')
      .upsert({
        brand: wholesaleBrand,
        target_margin_factor: targetMarginFactor,
        // Keep legacy page as P0-only controller. P1/P2/P3 are managed in Material Flow Tab 4.
        updated_at: new Date().toISOString(),
      });
    if (error) showToast(`儲存失敗：${error.message}`, 'error');
    else showToast(`${brandMeta.label} 批發定價已更新`);
    setSaving(false);
  };

  const addTier = () => {
    const nextNum = priceTiers.length > 0
      ? Math.max(...priceTiers.map(t => parseInt(t.name.replace(/\D/g, '') || '0', 10))) + 2
      : 3;
    setPriceTiers([...priceTiers, {
      name: `P${nextNum}`,
      factor: +(1 - nextNum / 100).toFixed(4),
      description: `${nextNum}% 加成`,
    }]);
  };

  const removeTier = (idx: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== idx));
  };

  const updateTier = (idx: number, field: keyof WholesalePriceTier, value: string | number) => {
    setPriceTiers(priceTiers.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const marginPercent = ((1 - targetMarginFactor) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Brand indicator */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black ${brandMeta.colorClasses.accent} ${brandMeta.colorClasses.text} ${brandMeta.colorClasses.border} border`}>
        <span className="text-lg">{brandMeta.icon}</span>
        <span>{brandMeta.label} 批發定價設定</span>
      </div>

      {/* Target margin factor */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">目標利潤率 (P0 基準)</h3>
            <p className="text-sm text-slate-400 font-bold mt-1">
              P0 價格 = 原材料成本 ÷ 利潤率因子 → 毛利率 ≈ {marginPercent}%
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <DollarSign size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">利潤率因子</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <input
            type="range"
            min="0.70"
            max="0.98"
            step="0.01"
            value={targetMarginFactor}
            onChange={e => setTargetMarginFactor(+e.target.value)}
            className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0.50"
              max="0.99"
              value={targetMarginFactor}
              onChange={e => setTargetMarginFactor(+e.target.value)}
              className="w-24 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl py-2"
            />
            <span className="text-sm font-bold text-slate-400">≈ {marginPercent}% 毛利</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-600 font-bold">
            例：原材料成本 $100，因子 {targetMarginFactor} → P0 = ${(100 / targetMarginFactor).toFixed(0)}，毛利 ${(100 / targetMarginFactor - 100).toFixed(0)}
          </p>
        </div>
      </div>

      {/* P-tier management */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">批發客等級 (P-Tier)</h3>
            <p className="text-sm text-slate-400 font-bold mt-1">
              P1/P2/P3 已由材料工作台 Tab 4 鎖定管理，此區僅作歷史參考。
            </p>
          </div>
          <button
            disabled
            onClick={addTier}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-black cursor-not-allowed"
          >
            <Plus size={14} /> 新增等級
          </button>
        </div>

        {/* P0 row (always exists, not editable) */}
        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="w-16 text-center">
            <span className="text-sm font-black text-emerald-700">P0</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-600">基準價格（成本 ÷ {targetMarginFactor}）</p>
          </div>
          <div className="text-xs font-black text-emerald-500 bg-emerald-100 px-3 py-1 rounded-lg">
            0% 加成
          </div>
        </div>

        {/* Custom tiers */}
        {priceTiers.length === 0 && (
          <p className="text-center text-slate-400 font-bold text-sm py-4">尚未設定自訂等級，點擊「新增等級」開始</p>
        )}

        <div className="space-y-3">
          {priceTiers.map((tier, idx) => {
            const markupPercent = tier.factor > 0 ? ((1 / tier.factor - 1) * 100).toFixed(1) : '0';
            return (
              <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 group">
                <input
                  value={tier.name}
                  onChange={e => updateTier(idx, 'name', e.target.value)}
                  disabled
                  className="w-20 text-center text-sm font-black bg-white border border-slate-200 rounded-lg py-2"
                  placeholder="P3"
                />
                <div className="flex-1 flex items-center gap-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">除數</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    max="1.00"
                    value={tier.factor}
                    onChange={e => updateTier(idx, 'factor', +e.target.value)}
                    disabled
                    className="w-20 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg py-2"
                  />
                  <span className="text-xs text-slate-400 font-bold">≈ +{markupPercent}%</span>
                </div>
                <input
                  value={tier.description || ''}
                  onChange={e => updateTier(idx, 'description', e.target.value)}
                  disabled
                  className="w-40 text-xs font-bold bg-white border border-slate-200 rounded-lg py-2 px-3"
                  placeholder="備註"
                />
                <button
                  disabled
                  onClick={() => removeTier(idx)}
                  className="p-2 text-slate-300 opacity-30 cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          儲存 {brandMeta.label} 定價
        </button>
      </div>
    </div>
  );
};

export default WholesalePricingPanel;
