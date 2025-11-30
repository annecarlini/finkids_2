/* copiado da documentação do shadcn/ui */
import path from "path"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuração do dev server para proxy de chamadas API durante o desenvolvimento.
  // Isso permite que o frontend faça requests para '/auth' ou '/api' e o Vite encaminhe
  // automaticamente para o backend em http://localhost:3000, sem necessidade de alterar
  // o código do frontend (útil para development local).
  server: {
    proxy: {
      // encaminhar /api/* para http://localhost:3000/api/*
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // encaminhar /auth/* para http://localhost:3000/api/auth/* (rewriter ajusta o caminho)
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '/api/auth'),
      },
      // encaminhar /avatars para backend caso frontend use /avatars
      '/avatars': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/avatars/, '/api/avatars'),
      }
    }
  }
  /* a partir de tailwindcss() foi copiado da documentação shadcnui */
})
