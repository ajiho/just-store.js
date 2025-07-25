import eslintPluginUnicorn from "eslint-plugin-unicorn"
import tseslint from "typescript-eslint"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    //语言选项
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // 启用类型服务，就可以无需手动指定 project
        projectService: true,
        //  ts配置文件的查找目录
        tsconfigRootDir: path.resolve(__dirname, ".."),
      },
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
      "@typescript-eslint": tseslint.plugin,
    },
    // 检查器的配置
    linterOptions: {
      // 允许使用 // eslint-disable 等指令
      noInlineConfig: false,
      //提示无效的 eslint-disable 指令，帮助清理冗余
      reportUnusedDisableDirectives: "warn",
    },
    //具体规则
    rules: {
      "no-var": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          caughtErrorsIgnorePattern: "^_", // 忽略catch的_开头参数
        },
      ],
    },
  },
]
