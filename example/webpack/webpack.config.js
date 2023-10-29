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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': false,
      'process.env.MASTODON_URL': `"${process.env.MASTODON_URL}"`,
      'process.env.MASTODON_ACCESS_TOKEN': `"${process.env.MASTODON_ACCESS_TOKEN}"`
    })
  ]
}
