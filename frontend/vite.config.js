import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    // Fixo em 5173 e falha alto se a porta já estiver ocupada, em vez de
    // silenciosamente subir em 5174/5175/... — o backend (SecurityConfig
    // CORS) só libera origens em localhost:5173, então um dev server "à
    // deriva" numa porta diferente quebra o login com um erro enganoso
    // ("Servidor indisponível") mesmo com o Spring Boot rodando normalmente.
    port: 5173,
    strictPort: true,
  },
})
