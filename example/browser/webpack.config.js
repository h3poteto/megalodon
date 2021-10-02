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
    extensions: ['.ts', '.js'],
    fallback: {
      net: false,
      tls: false,
      dns: false,
      zlib: false,
      stream: require.resolve('stream-browserify'),
      events: require.resolve('events/'),
      buffer: require.resolve('buffer/'),
      url: require.resolve('url/'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      querystring: require.resolve('querystring-es3'),
      os: require.resolve('os-browserify/browser'),
      assert: require.resolve('assert/')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env.NODE_DEBUG': false
    })
  ]
  // https-proxy-agent and socks-proxy-agent is node library, so can't compile for browser.
  // So replace net, tls and dns which are node libraries.
  // node: {
  //   net: 'empty',
  //   tls: 'empty',
  //   dns: 'empty'
  // }
}
