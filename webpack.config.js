const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const { IS_PROD } = require('./gulpfile.js/constants');

module.exports = {
  mode: IS_PROD ? 'production' : 'development',
  entry: {},
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 2,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    },
    minimizer: [
      new TerserPlugin({
        parallel: true,
        cache: true,
        terserOptions: {
          compress: {
            dead_code: true, // remove unreachable code
            toplevel: true, // drop unreferenced functions and variables
            drop_console: true, // discard calls to console.* functions
          },
          mangle: {
            toplevel: true, // mangle names declared in the top level scope
          },
        }
      }),
    ],
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
}
