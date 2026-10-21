import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: ["index.html"],
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
