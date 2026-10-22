import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "dist",
    "docs",
    "ds-bundle",
    ".design-sync",
    ".ds-sync",
    "playwright-report",
    "test-results",
  ]),
  tseslint.configs.recommended,
);
