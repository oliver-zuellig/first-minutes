import { defineConfig, devices } from '@playwright/test'

const port = 4173

/** One smoke test against the production build, Chromium only (docs/product.md, M2). */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}/first-minutes/`,
    // Decorative motion off; the flight itself still runs in real time.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}/first-minutes/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
