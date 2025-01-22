import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'dev.flo-g.de', 
      protocol: 'wss',       
      port: 5173,            
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
