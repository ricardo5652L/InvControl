import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // En desarrollo, /api se reenvía al Express local (puerto 3000).
  // En Vercel/producción usa VITE_API_URL (ver .env.example y DEPLOY.md).
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
