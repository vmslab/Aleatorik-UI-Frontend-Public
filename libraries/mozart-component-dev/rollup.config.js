import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
import commonjs from "@rollup/plugin-commonjs"; // Convert CommonJS modules to ES6
import vue from "rollup-plugin-vue"; // Handle .vue SFC files
import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";
import del from "rollup-plugin-delete";
import css from "rollup-plugin-css-porter";
import scss from "rollup-plugin-scss";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts", // our source file
  output: [
    {
      file: "lib/mozart-component-dev.esm.js",
      format: "esm", // the preferred format
      sourcemap: true,
    },
    {
      name: pkg.name,
      file: "lib/mozart-component-dev.min.js",
      format: "iife",
      sourcemap: true,
      globals: {
        "vue-property-decorator": "vuePropertyDecorator",
      },
      plugins: [terser()],
    },
    {
      name: pkg.name,
      file: "lib/mozart-component-dev.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    "vue",
    "vue-class-component",
    "vue-property-decorator",
    "vuex",
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
      check: false, // disable typechecks if necessary
      module: "esnext",
      tsconfig: "tsconfig.json",
      tsconfigOverride: { exclude: ["node_modules", "tests"] },
    }),
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true, // Explicitly convert template to render function
    }),
    alias({
      entries: [
        {
          find: /^@\/(.+)/,
          replacement: "./$1",
        },
      ],
    }),
    scss(),
    css(),
    copy({
      targets: [
        { src: "src/styles/**/*.scss", dest: "lib/src/styles" },
        { src: "src/fonts/**/*.*", dest: "lib/src/fonts" },
      ],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs({
      extensions: [".js", ".ts", ".vue"],
    }),
    terser(), // minifies generated bundles
    del({
      targets: "lib/main.d.ts",
      hook: "generateBundle",
    }),
  ],
};
