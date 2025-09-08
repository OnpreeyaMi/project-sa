import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
    //   '/verify-slip-base64': {
    //     target: 'http://127.0.0.1:8000', // พอร์ตเดียวกับ Gin
    //     changeOrigin: true,
    //   },
      '/verify-slip-base64': {target: 'http://localhost:8000', 
        changeOrigin: true,},
      '/employees': 'http://localhost:8000',
      '/order': 'http://localhost:8000',
      '/order-histories': 'http://localhost:8000',
    },
  },
})


