import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError && this.state.error) {
      const envUrl = import.meta.env.VITE_SUPABASE_URL ?? '(not set)';
      const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY ? '***set***' : '(not set)';
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 700 }}>
          <h1 style={{ color: '#b91c1c' }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', padding: 16, overflow: 'auto', fontSize: 13 }}>
            {this.state.error.message}
          </pre>
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', color: '#64748b', fontSize: 13 }}>Stack trace</summary>
            <pre style={{ background: '#f8fafc', padding: 12, overflow: 'auto', fontSize: 11, marginTop: 8 }}>
              {this.state.error.stack}
            </pre>
          </details>
          <p style={{ color: '#64748b', marginTop: 12, fontSize: 13 }}>
            Env check — VITE_SUPABASE_URL: {envUrl.slice(0, 30)}… | VITE_SUPABASE_ANON_KEY: {envKey}
          </p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>重新載入</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
);
