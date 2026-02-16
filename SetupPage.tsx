import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';
import { hashPassword } from './authHelpers';

const SetupPage: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('id')
          .eq('role', 'admin')
          .limit(1);
        if (!error && data && data.length > 0) {
          setAlreadyExists(true);
        }
      } catch {
        // If table doesn't exist yet, allow setup
      }
      setChecking(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('請輸入名稱'); return; }
    if (!form.phone.trim() || form.phone.trim().length < 8) { setError('請輸入有效電話號碼 (至少8位)'); return; }
    if (form.password.length < 6) { setError('密碼至少需要6位'); return; }
    if (form.password !== form.confirmPassword) { setError('兩次輸入的密碼不一致'); return; }

    setSubmitting(true);
    try {
      // Double-check no admin exists
      const { data: existing } = await supabase.from('members').select('id').eq('role', 'admin').limit(1);
      if (existing && existing.length > 0) {
        setAlreadyExists(true);
        setSubmitting(false);
        return;
      }

      const passwordHash = await hashPassword(form.password);
      const { error: insertError } = await supabase.from('members').insert({
        name: form.name.trim(),
        phone_number: form.phone.trim(),
        role: 'admin',
        password_hash: passwordHash,
        tier: 'VIP',
        wallet_balance: 0,
        total_spent: 0,
        points: 0,
        join_date: new Date().toISOString().slice(0, 10),
      });

      if (insertError) {
        setError(`建立失敗: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      setDone(true);
    } catch (err: any) {
      setError(`系統錯誤: ${err.message}`);
    }
    setSubmitting(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (alreadyExists) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">初始設定已完成</h2>
          <p className="text-sm text-slate-500 font-bold">管理員帳號已存在，此頁面已停用。</p>
          <button
            onClick={() => { window.location.hash = 'admin'; }}
            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm"
          >
            前往管理後台登入
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">管理員帳號已建立！</h2>
          <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100">
            <p className="text-xs text-slate-400 font-bold">登入資料</p>
            <p className="text-sm font-black text-slate-700">電話：{form.phone}</p>
            <p className="text-sm font-black text-slate-700">密碼：（你剛才設定的）</p>
          </div>
          <p className="text-xs text-slate-400 font-bold">請牢記以上資料，此頁面將不再可用。</p>
          <button
            onClick={() => { window.location.hash = 'admin'; }}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl"
          >
            立即進入管理後台
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full space-y-6 border border-slate-100">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">初始管理員設定</h2>
          <p className="text-sm text-slate-400 font-bold">建立第一個管理員帳號以管理你的網店</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">管理員名稱</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100 focus:border-blue-300 outline-none"
              placeholder="例：老闆"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">電話號碼（用於登入）</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100 focus:border-blue-300 outline-none"
              placeholder="例：63611672"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">設定密碼（至少6位）</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100 focus:border-blue-300 outline-none pr-10"
                placeholder="設定密碼"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">確認密碼</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-2xl font-bold text-sm border border-slate-100 focus:border-blue-300 outline-none"
              placeholder="再次輸入密碼"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <ShieldCheck size={16} />
              建立管理員帳號
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupPage;
