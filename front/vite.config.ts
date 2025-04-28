import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',            // ← chemins relatifs pour build
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'build'
  }
});
