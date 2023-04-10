/**
 * Export der Komponente läuft über "rollup"
 * Das scheint die einzige Möglichkeit zu sein die funktioniert
 *
 * Weitere Infos:
 *      https://rollupjs.org/guide/en/
 *
 * Cheat-Sheet:
 *      https://devhints.io/rollup
 */
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";
import commonjs from "rollup-plugin-commonjs"; // Convert CommonJS modules to ES6
import resolve from "@rollup/plugin-node-resolve";
import del from "rollup-plugin-delete";
import css from "rollup-plugin-css-porter";
import sass from "rollup-plugin-sass";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts", // our source file
  output: [
    {
      file: "./lib/mozart-common.esm.js",
      format: "esm", // the preferred format
      sourcemap: true,
    },
    {
      name: pkg.name,
      file: "./lib/mozart-common.min.js",
      format: "iife",
      sourcemap: true,
      plugins: [terser()],
    },
    {
      name: pkg.name,
      file: "./lib/mozart-common.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  // Unterdrückt die Fehlermeldung "Mixing named and default exports"
  // (Kommt von index.ts - da wird das so gemacht)
  // exports: 'named',

  external: [
    ...Object.keys(pkg.dependencies || {}),
    "tslib",
  ],
  plugins: [
    typescript({
      typescript: require("typescript"),
      // objectHashIgnoreUnknownHack: true,
      module: "esnext",

      tsconfig: "tsconfig.json",
      tsconfigOverride: { exclude: ["node_modules", "tests"] },
    }),
    commonjs(),
    sass(),
    css(),
    resolve(),
    terser(), // minifies generated bundles
    del({
      targets: "lib/main.d.ts",
      hook: "generateBundle",
    }),
  ],
};
