
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0', //  ให้เครื่องอื่นในเครือข่ายเข้าถึงได้
    port: 5173,       // เลือกพอร์ตที่ต้องการ (ค่า default คือ 5173)
  },
})

