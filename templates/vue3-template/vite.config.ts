import { defineConfig, loadEnv, normalizePath } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
import vue from "@vitejs/plugin-vue";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, __dirname);

  return defineConfig({
    plugins: [
      vue(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            appTitle: env.VITE_APP_TITLE.replace(/_/gi, " "),
          },
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(path.join(__dirname, "../../libraries/common-ui/src/styles/css/*")),
            dest: "assets",
          },
        ],
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_APP_SERVER,
          changeOrigin: true,
          ws: true,
        },
      },
    },
    resolve: {
      alias: [
        {
          // this is required for the SCSS modules
          find: /^~(.*)$/,
          replacement: "$1",
        },
      ],
    },
  });
};
