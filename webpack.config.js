var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    devtoolModuleFilenameTemplate: '.[resource-path]'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', ".css"],
    alias: { 'react': 'preact/compat', 'react-dom': 'preact/compat' },
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