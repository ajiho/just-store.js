import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/**/*.test.{js,ts}"],
    // 覆盖率配置
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"], // 控制输出哪些格式的报告
      reportsDirectory: "./coverage", // 报告输出目录
      include: ["src/**/*.ts"], // 指定包含的文件
      exclude: ["**/*.test.ts", "**/__tests__/**"], // 排除测试文件
    },
  },
})
