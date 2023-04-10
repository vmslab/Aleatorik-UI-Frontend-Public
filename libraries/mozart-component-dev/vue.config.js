const path = require("path");
const webpack = require("webpack");

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
    ],
    output: {
      filename: "mozart-component-dev.js",
      chunkFilename: "mozart-component-dev.js",
    },
  },
  chainWebpack: config => {
    config.optimization.delete("splitChunks");
  },
  css: {
    extract: {
      filename: "mozart-component-dev.css",
    },
  },
};
