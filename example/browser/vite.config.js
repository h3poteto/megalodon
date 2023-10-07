import { defineConfig } from 'vite';
import path from 'path';
import envCompatible from 'vite-plugin-env-compatible';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

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
  build: {}
  // THE FOLLOWING IS NOT SUPPORTED BY VITE AND COPIED FROM THE OLD WEBPACK CONFIG
  // May no longer be relevant: https://vitejs.dev/guide/philosophy.html#pushing-the-modern-web
  // https-proxy-agent and socks-proxy-agent is node library, so can't compile for browser.
  // So replace net, tls and dns which are node libraries.
  // node: {
  //   net: 'empty',
  //   tls: 'empty',
  //   dns: 'empty'
  // }
})
