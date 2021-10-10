var path = require('path');
var process = require('process');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  devtool: 'source-map',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    devtoolModuleFilenameTemplate: '.[resource-path]'
  },
  resolveLoader: {
    modules: ['node_modules', process.env.NODE_PATH]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', ".css"],
    alias: { 'react': 'preact/compat', 'react-dom': 'preact/compat' },
    modules: ['node_modules', process.env.NODE_PATH],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [ { loader: 'ts-loader' } ]
      },
      {
        test: /\.css?$/,
        use: [ "style-loader", "css-loader" ]
      }
    ]
  },
}