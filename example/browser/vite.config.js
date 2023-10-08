import { defineConfig } from 'vite';
import path from 'path';
import envCompatible from 'vite-plugin-env-compatible';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: ''
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      }
    ],
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue'
    ]
  },
  plugins: [
    viteCommonjs(),
    envCompatible(),
    createHtmlPlugin({
      inject: {
        data: {
          title: 'browser'
        }
      }
    })
  ],
  build: {
    plugins: [
      nodePolyfills({
         // https-proxy-agent and socks-proxy-agent is node library, so can't compile for browser.
        include: ['net', 'tls', 'dns']
      })
    ]
  }
})
