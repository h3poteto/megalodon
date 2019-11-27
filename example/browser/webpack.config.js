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
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  }
}
