var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [],
  // https-proxy-agent and socks-proxy-agent is node library, so can't compile for browser.
  // So replace net, tls and dns which are node libraries.
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  }
}
