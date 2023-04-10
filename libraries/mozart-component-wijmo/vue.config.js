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
      filename: "mozart-component-wijmo.js",
      chunkFilename: "mozart-component-wijmo.js",
    },
  },
  chainWebpack: config => {
    config.optimization.delete("splitChunks");
  },
  css: {
    extract: {
      filename: "mozart-component-wijmo.css",
    },
  },
};
