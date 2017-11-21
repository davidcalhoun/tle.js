const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'tle.js',
    library: 'tle',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ],
            plugins: [
              require('babel-plugin-add-module-exports'),
              require('babel-plugin-transform-es2015-modules-umd')
            ]
          }
        }
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    // Set a prod flag.  May use this in the future to handle errors.
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    // Minifies JavaScript.
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      mangle: {
        // ALSO compress properties matching this regexp.
        props: {
          regex: /^_/
        }
      },
      sourceMap: true,
      compress: {
        warnings: true,
        passes: 3
      },
      output: {
        comments: false
      },
      beautify: false,
      preserveComments: false
    })
  ]
};
