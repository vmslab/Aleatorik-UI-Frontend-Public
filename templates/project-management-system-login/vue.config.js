if (process.env.NODE_ENV === "production") {
  const webpack = require("webpack");
  var WCAnalyzerPlugin = require("./wc-analyzer");
  // const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

  const pgName = process.env.VUE_APP_PLUGIN_NAME;

  module.exports = {
    parallel: false,
    configureWebpack: {
      plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
        new WCAnalyzerPlugin({
          sourceDir: "src",
          outputDir: "dist",
          fileName: "wc-manifest.json",
          pgName,
        }),
      ],
      optimization: {
        splitChunks: {
          chunks: "all",
        },
      },
      entry: "./src/prod.ts",
      output: {
        filename: `${pgName}.js`,
        chunkFilename: `${pgName}.js`,
      },
    },
    chainWebpack: config => {
      config.optimization.delete("splitChunks");
      config.plugin("html").tap(args => {
        args[0].title = pgName;
        args[0].inject = false;
        args[0].minify.collapseWhitespace = false;
        args[0].minify.removeAttributeQuotes = false;
        return args;
      });
    },
    css: {
      extract: {
        filename: `${pgName}.css`,
      },
    },
  };
} else {
  const path = require("path");
  const CopyWebpackPlugin = require("copy-webpack-plugin");

  module.exports = {
    devServer: {
      proxy: {
        // proxyTable 설정
        "/api": {
          target: process.env.VUE_APP_SERVER,
          changeOrigin: true,
        },
      },
    },
    productionSourceMap: false,
    configureWebpack: {
      devtool: "source-map",
      entry: "./src/dev.ts",
      plugins: [
        new CopyWebpackPlugin([
          {
            from: path.join(__dirname, "../../libraries/mozart-component-dev/src/styles/css"),
            to: "css",
          },
        ]),
      ],
    },
    chainWebpack: config => {
      config.module
        .rule("vue")
        .use("vue-loader")
        .loader("vue-loader")
        .tap(options => {
          options.transpileOptions = {
            transforms: {
              dangerousTaggedTemplateString: true,
            },
          };
          return options;
        });
    },
  };
}
