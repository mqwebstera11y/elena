import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // When running `npm run dev`, proxy /api/* to the Vercel dev server.
    // Start both with: `vercel dev` (port 3000) OR run `npm run dev` alongside
    // a separate `vercel dev --listen 3001` and adjust the target below.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
