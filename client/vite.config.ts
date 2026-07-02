import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Proxy token requests to the Node token backend so the browser talks to one origin.
    proxy: {
      '/token': 'http://localhost:3001',
    },
  },
})
