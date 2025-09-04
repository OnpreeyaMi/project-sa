
/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
}) */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    proxy: {
      '/employees': 'http://localhost:8080',
      '/order': 'http://localhost:8080',
      '/order-histories': 'http://localhost:8080',
      // หรือ proxy '/api' => 'http://localhost:8080' แล้วเปลี่ยน backend ให้มี /api prefix
    }
  }
})

