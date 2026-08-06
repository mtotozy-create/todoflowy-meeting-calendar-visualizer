import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/core/types.ts", "src/sidebar-view.css.ts"],
      provider: "v8",
      thresholds: {
        branches: 55,
        functions: 70,
        lines: 75,
        statements: 75,
      },
    },
  },
});
