import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import { dts } from "rollup-plugin-dts"
import { defineConfig } from "rollup"

const isProd = process.env.NODE_ENV === "production"

const plugins = [resolve(), commonjs(), typescript()]

if (isProd) {
  // 如果生产环境
  plugins.push(
    terser({
      output: {
        comments() {
          return false
        },
      },
    }),
  )
}

const input = "src/index.ts"
const name = "just-store"

let config = defineConfig([
  // amd
  {
    input,
    output: {
      file: `dist/${name}.amd.${isProd ? "min." : ""}js`,
      format: "amd",
      sourcemap: true,
    },
    plugins,
  },
  // iife
  {
    input,
    output: {
      file: `dist/${name}.browser.${isProd ? "min." : ""}js`,
      format: "iife",
      name: "store",
      sourcemap: true,
    },
    plugins,
  },
  // ESM
  {
    input,
    output: {
      file: "dist/esm/index.mjs",
      format: "esm",
      sourcemap: true,
    },
    plugins,
  },
  // CJS
  {
    input,
    output: {
      file: "dist/cjs/index.js",
      format: "cjs",
      exports: "auto",
      sourcemap: true,
    },
    plugins,
  },
  {
    input,
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
    treeshake: false,
  },
])

if (isProd) {
  // 只保留amd和iife,esm cjs 不需要再次压缩
  config = config.filter((item) => ["iife", "amd"].includes(item.output.format))
}

export default config
