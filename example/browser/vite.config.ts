import { defineConfig } from 'vite'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills()],
  resolve: {}
})
