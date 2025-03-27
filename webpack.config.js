const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/demo/demo.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/demo'),
  },
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'src/demo'),
    },
    hot: true,
    port: 9000,
    open: true,
  },
}; 