import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          if (id.includes('node_modules/@tanstack')) {
            return 'query-vendor';
          }

          if (
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/@radix-ui')
          ) {
            return 'ui-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
