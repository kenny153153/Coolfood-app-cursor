import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Vite plugin that runs Vercel-style API handlers locally during development.
 * Intercepts /api/* requests, loads the matching .ts handler via SSR, and
 * creates Vercel-compatible req/res wrappers. Falls through to the proxy
 * for routes without a local handler file.
 */
function localApiPlugin(envVars: Record<string, string>): Plugin {
  return {
    name: 'local-api',
    configureServer(server: ViteDevServer) {
      for (const [key, val] of Object.entries(envVars)) {
        if (!process.env[key]) process.env[key] = val;
      }

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/api/')) return next();

        const urlPath = req.url.replace(/\?.*$/, '');
        const filePath = path.resolve(__dirname, `.${urlPath}.ts`);
        if (!fs.existsSync(filePath)) return next();

        let mod: any;
        try {
          mod = await server.ssrLoadModule(`${urlPath}.ts`);
        } catch {
          return next();
        }
        if (typeof mod.default !== 'function') return next();

        console.log(`[local-api] ${req.method} ${urlPath}`);

        const body: any = await new Promise((resolve) => {
          if (req.method === 'GET' || req.method === 'HEAD') return resolve({});
          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf-8');
            try { resolve(JSON.parse(raw)); } catch { resolve({}); }
          });
          req.on('error', () => resolve({}));
        });

        const vercelReq = { method: req.method, body, headers: req.headers };
        let responded = false;
        const vercelRes = {
          status: (code: number) => ({
            json: (obj: any) => {
              if (responded) return;
              responded = true;
              res.writeHead(code, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(obj));
            },
          }),
        };

        try {
          await mod.default(vercelReq, vercelRes);
        } catch (e: any) {
          if (!responded) {
            console.error(`[local-api] Error in ${urlPath}:`, e?.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e?.message || 'Internal server error' }));
          }
        }
      });
    },
  };
}

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
      plugins: [localApiPlugin(env), tailwindcss(), react()],
      define: {
        'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(env.GOOGLE_MAPS_API_KEY ?? env.VITE_GOOGLE_MAPS_API_KEY ?? ''),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? env.VITE_PUBLIC_SUPABASE ?? ''),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? env.VITE_PUBLIC_SUPABASE_ANON_KEY ?? ''),
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
