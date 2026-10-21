import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // acessível de fora do container
    port: 5173,
    strictPort: true,
    watch: {
      // No Windows/macOS, o Docker nem sempre avisa quando um arquivo muda.
      // O polling garante que a página recarregue ao salvar.
      usePolling: true,
    },
  },
})
