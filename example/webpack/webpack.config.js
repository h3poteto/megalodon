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
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      querystring: require.resolve('querystring-es3'),
      os: require.resolve('os-browserify/browser')
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
      'process.env.NODE_DEBUG': false,
      'process.env.MASTODON_URL': `"${process.env.MASTODON_URL}"`,
      'process.env.MASTODON_ACCESS_TOKEN': `"${process.env.MASTODON_ACCESS_TOKEN}"`
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
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
