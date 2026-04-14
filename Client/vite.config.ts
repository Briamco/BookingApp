import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget = (env.VITE_API_URL || 'http://localhost:5134').replace(/\/?api\/?$/, '')
  const wsTarget = env.VITE_WS_URL || apiTarget.replace(/^http/, 'ws')

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: wsTarget,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
