import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  section: string;
  children: React.ReactNode;
}

function FallbackCard({ section, error, resetError }: { section: string; error: Error; resetError: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8 animate-fade-in">
      <div className="bg-rose-50 rounded-2xl p-6 max-w-md text-center shadow-sm border border-rose-100">
        <AlertTriangle className="mx-auto mb-3 text-rose-400" size={32} />
        <h3 className="font-black text-rose-700 text-sm mb-1">「{section}」載入出錯</h3>
        <p className="text-xs text-rose-400 mb-4 break-all">{error.message.slice(0, 200)}</p>
        <button
          onClick={resetError}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-colors"
        >
          <RefreshCw size={12} /> 重試
        </button>
      </div>
    </div>
  );
}

const SectionErrorBoundary: React.FC<Props> = ({ section, children }) => (
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <FallbackCard section={section} error={error as Error} resetError={resetError} />
    )}
    beforeCapture={(scope) => { scope.setTag('section', section); }}
  >
    {children}
  </Sentry.ErrorBoundary>
);

export default SectionErrorBoundary;
