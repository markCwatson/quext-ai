const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
    'content-script': path.resolve(__dirname, 'src/content-script.ts'),
    popup: path.resolve(__dirname, 'src/popup.ts'),
    options: path.resolve(__dirname, 'src/options.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
  ],
  mode: 'development',
  devtool: 'source-map', // Enable sourcemaps for debugging webpack's output in a csp-compliant way
};
