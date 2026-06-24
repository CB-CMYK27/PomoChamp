import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Strip console.* and debugger statements from production builds only;
  // keep them during local development for debugging.
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
