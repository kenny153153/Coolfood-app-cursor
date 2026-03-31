
import React from 'react';
import { Users } from 'lucide-react';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const WholesaleClientsPanel: React.FC<Props> = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Users size={48} className="text-slate-300" />
      <p className="text-lg font-black text-slate-500">批發客資料已合併至「批發客管理」</p>
      <p className="text-sm text-slate-400 font-bold">請使用側欄的「批發客管理」查看和管理所有批發客</p>
    </div>
  );
};

export default WholesaleClientsPanel;
