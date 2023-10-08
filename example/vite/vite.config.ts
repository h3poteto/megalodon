import { defineConfig } from 'vite'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      process: 'process/browser'
    }
  },
  define: {
    'process.browser': true,
    'process.env.NODE_DEBUG': false
  },
  plugins: [
    nodePolyfills({
      include: ['buffer']
    })
  ]
})
