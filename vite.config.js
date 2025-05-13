import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true // This prevents Vite from trying another port if 5173 is in use
  }
})