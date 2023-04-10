import babel from "rollup-plugin-babel";
import pkg from "./package.json";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import resolve from "rollup-plugin-node-resolve";
import scss from "rollup-plugin-scss";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx", ".mjs"];

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "lib/mozart-component-wc.esm.js",
      format: "esm",
      sourcemap: true,
    },
    {
      name: pkg.name,
      file: "lib/mozart-component-wc.min.js",
      format: "iife",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      extensions: extensions,
      exclude: ["./node_modules/@babel/**/*", "./node_modules/core-js/**/*"],
    }),
    scss({
      output: `lib/${pkg.name}.css`,
    }),
    filesize(),
    terser(),
  ],
};
