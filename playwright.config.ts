import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: baseURL ?? "http://localhost:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: baseURL
    ? undefined
    : {
        command: "pnpm build && pnpm preview",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: "chromium", grepInvert: /no WebGL 2/ },
    {
      name: "no-webgl",
      grep: /no WebGL 2/,
      use: { launchOptions: { args: ["--disable-3d-apis"] } },
    },
  ],
});
