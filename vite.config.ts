import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from "@sentry/vite-plugin"
import fs from 'fs'
import path from 'path'

const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith('/api/')) {
        try {
          const apiFile = '.' + req.url.split('?')[0] + '.ts';
          if (fs.existsSync(apiFile)) {
            const handler = await server.ssrLoadModule(apiFile);
            
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk; });
            req.on('end', async () => {
              if (body) {
                try { req.body = JSON.parse(body); } catch(e) {}
              }
              
              // Mock VercelResponse methods
              res.status = (code: number) => { res.statusCode = code; return res; };
              res.json = (data: any) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              };
              
              await handler.default(req, res);
            });
            return;
          }
        } catch(err) {
          console.error('API Error:', err);
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    server: {
      port: 3000
    },
    plugins: [
      react(),
      vercelApiPlugin(),
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        // Only upload source maps in production build if token is provided
        disable: process.env.NODE_ENV !== 'production' || !process.env.SENTRY_AUTH_TOKEN
      })
    ],
    build: {
      sourcemap: true,
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts')) {
              return 'vendor-ui';
            }
            if (id.includes('node_modules/sonner') || id.includes('node_modules/zustand') || id.includes('node_modules/immer') || id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
              return 'vendor-utils';
            }
          }
        }
      }
    }
  }
})
