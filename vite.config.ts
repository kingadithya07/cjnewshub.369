import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to resolve Property 'cwd' does not exist on type 'Process' error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env for compatibility with existing code
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY),
        NODE_ENV: JSON.stringify(mode)
      }
    }
  }
})