import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import { I18nProvider } from './i18n';
import { SiteProvider } from './SiteContext';

// ── Sentry (set VITE_SENTRY_DSN in .env.local to enable) ────────
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

const SentryErrorBoundary = Sentry.ErrorBoundary;

function FallbackUI({ error }: { error: Error }) {
  const envUrl = import.meta.env.VITE_SUPABASE_URL ?? '(not set)';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY ? '***set***' : '(not set)';
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 700 }}>
      <h1 style={{ color: '#b91c1c' }}>Something went wrong</h1>
      <pre style={{ background: '#fef2f2', padding: 16, overflow: 'auto', fontSize: 13 }}>
        {error.message}
      </pre>
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: 13 }}>Stack trace</summary>
        <pre style={{ background: '#f8fafc', padding: 12, overflow: 'auto', fontSize: 11, marginTop: 8 }}>
          {error.stack}
        </pre>
      </details>
      <p style={{ color: '#64748b', marginTop: 12, fontSize: 13 }}>
        如遇到問題，請重新載入頁面或聯繫客服。
      </p>
      <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>重新載入</button>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SiteProvider>
      <I18nProvider>
        <SentryErrorBoundary fallback={({ error }) => <FallbackUI error={error as Error} />} showDialog>
          <App />
        </SentryErrorBoundary>
      </I18nProvider>
    </SiteProvider>
  </React.StrictMode>
);
