import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const alvo = env.API_PROXY_ALVO || 'http://localhost:8000'
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      watch: { usePolling: true },
      proxy: {
        '/api': { target: alvo },
        '/media': { target: alvo },
      },
    },
  }
})
