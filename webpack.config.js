const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        include: [path.resolve(__dirname, 'src/client')],
        loader: 'babel-loader',

        options: {
          plugins: ['syntax-dynamic-import'],

          presets: [
            [
              'env',
              {
                modules: false
              }
            ]
          ]
        },

        test: /\.js$/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ]
  },

  devtool: 'source-map',

  entry: {
    editor: './src/client/editor.js',
    player: './src/client/player.js'
  },

  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'public')
  },

  mode: process.env.NODE_ENV || 'development',

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      chunks: ['player'],
      template: path.resolve(__dirname, 'src/client/player.html')
    }),
    new HtmlWebpackPlugin({
      filename: 'editor.html',
      hash: true,
      chunks: ['editor'],
      template: path.resolve(__dirname, 'src/client/editor.html')
    }),
  ],
};
