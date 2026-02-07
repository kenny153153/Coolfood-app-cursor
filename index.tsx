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
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 600 }}>
          <h1 style={{ color: '#b91c1c' }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', padding: 16, overflow: 'auto' }}>
            {this.state.error.message}
          </pre>
          <p style={{ color: '#64748b' }}>
            Check Vercel env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
          </p>
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
