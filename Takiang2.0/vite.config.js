import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ทุก request ที่ขึ้นต้นด้วย /api จะถูกส่งไป Node server
      '/api': {
        target: 'http://localhost:3001', // Node/Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
