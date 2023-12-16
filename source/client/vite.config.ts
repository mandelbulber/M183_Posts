import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
    headers: {
      'x-frame-options': 'DENY',
      'content-security-policy': 'frame-ancestors none',
    },
  },
  plugins: [react()],
})
