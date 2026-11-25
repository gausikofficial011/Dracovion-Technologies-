import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (!normalized.includes('/node_modules/')) return undefined;
          if (normalized.includes('/react-router')) return 'vendor-router';
          if (
            normalized.includes('/react-dom/') ||
            normalized.includes('/react/') ||
            normalized.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }
          if (normalized.includes('/framer-motion/')) return 'vendor-motion';
          if (normalized.includes('/lucide-react/')) return 'vendor-icons';
          if (normalized.includes('/three/')) return 'vendor-three';
          if (normalized.includes('/gsap/') || normalized.includes('/lenis/')) return 'vendor-anim';
          return undefined;
        },
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Dev proxy: forwards /api calls to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
