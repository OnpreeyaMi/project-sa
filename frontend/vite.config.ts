import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/verify-slip-base64': {
        target: 'http://127.0.0.1:18080', // พอร์ตเดียวกับ Gin
        changeOrigin: true,
      },
      '/employees': 'http://localhost:8080',
      '/order': 'http://localhost:8080',
      '/order-histories': 'http://localhost:8080',
    },
  },
})
