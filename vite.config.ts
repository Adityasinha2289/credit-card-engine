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
      // Preload a lazy route's dependencies in parallel with the route chunk
      // instead of discovering them one round trip at a time.
      modulePreload: { polyfill: false },
      rolldownOptions: {
        output: {
          // Rolldown groups also capture each matched module's dependencies, so
          // the order matters: groups with a higher priority claim shared
          // packages (React, zustand's use-sync-external-store) first. With the
          // old single manualChunks function React itself ended up inside the
          // charts chunk, forcing ~390 KB of recharts onto every page.
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /[\/]node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler|react-is)[\/]/,
                priority: 40,
              },
              {
                name: 'vendor-utils',
                test: /[\/]node_modules[\/](sonner|zustand|immer|clsx|tailwind-merge|use-sync-external-store)[\/]/,
                priority: 30,
              },
              {
                name: 'vendor-ui',
                test: /[\/]node_modules[\/](framer-motion|motion-dom|motion-utils|lucide-react)[\/]/,
                priority: 20,
              },
              {
                // Charts are only used on a few app screens and the Methodology page.
                name: 'vendor-charts',
                test: /[\/]node_modules[\/](recharts|d3-[^\/]+|victory-vendor|internmap|decimal\.js-light|es-toolkit|reselect|redux|@reduxjs|eventemitter3)[\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    }
  }
})
