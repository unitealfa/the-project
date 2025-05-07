// front/vite.config.ts
import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import * as path        from 'path';

export default defineConfig({
  base: './',

  plugins: [react()],

  /* ───── alias pour import '@/...' ───── */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir: 'build',
  },
});
