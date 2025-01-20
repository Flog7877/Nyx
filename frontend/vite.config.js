import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import fs from 'fs';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('./192.168.0.51-key.pem'),
      cert: fs.readFileSync('./192.168.0.51.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://192.168.0.51:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    svgr(),
  ],
  base: '/',
  worker: {
    format: 'es',
    plugins: () => [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          worker: ['src/workers/timerWorker.js'],
        },
      },
    },
  },
});
