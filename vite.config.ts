import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  appType: "mpa",
  build: {
    rolldownOptions: {
      input: ["index.html", "tawaf/index.html", "perf/index.html"],
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
