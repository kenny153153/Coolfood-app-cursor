import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const root = path.resolve(__dirname);
    const fileEnv = loadEnv(mode, root, '');
    const env = { ...fileEnv, ...process.env };
    const apiTarget = env.VITE_API_PROXY_TARGET || 'https://coolfood-app-cursor.vercel.app';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: apiTarget.startsWith('http') ? apiTarget : `https://${apiTarget}`,
            changeOrigin: true,
            secure: true,
          },
        },
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(env.GOOGLE_MAPS_API_KEY ?? env.VITE_GOOGLE_MAPS_API_KEY ?? ''),
      },
      build: {
        sourcemap: 'hidden',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
