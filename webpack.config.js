const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        include: [path.resolve(__dirname, "src/client/images")],
        loader: "url-loader"
      },
      {
        include: [path.resolve(__dirname, "src/client")],
        loader: "babel-loader",

        options: {
          plugins: ["syntax-dynamic-import", "transform-object-rest-spread"],

          presets: [
            [
              "env",
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
        use: ["style-loader", "css-loader"]
      }
    ]
  },

  devtool: "source-map",

  entry: {
    editor: "./src/client/editor",
    player: "./src/client/player"
  },

  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "public")
  },

  mode: process.env.NODE_ENV || "development",

  plugins: [
    ...(process.env.NODE_ENV === "production"
      ? [
          // p5.min.js is not just a minification of p5.js, it also omits the
          // embedded documentation, so it's a win to use p5.min.js even though
          // we minimize everything in the end
          new webpack.NormalModuleReplacementPlugin(/.*\/p5.js$/, "p5.min.js"),
          new CompressionPlugin()
        ]
      : []),

    new HtmlWebpackPlugin({
      filename: "index.html",
      hash: true,
      chunks: ["player"],
      template: path.resolve(__dirname, "src/client/template.html")
    }),

    new HtmlWebpackPlugin({
      filename: "editor.html",
      hash: true,
      chunks: ["editor"],
      template: path.resolve(__dirname, "src/client/template.html")
    })
  ],

  devServer: {
    compress: true,
    host: "0.0.0.0",
    overlay: true,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true
      }
    }
  }
};
