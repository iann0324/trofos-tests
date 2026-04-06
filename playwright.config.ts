import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  // Run auth setup first, then other tests
  webServer: undefined,
  // This suite hits a shared remote app, so keep execution serialized for stability
  fullyParallel: false,
  // Fail the build on CI if test.only was accidentally committed
  forbidOnly: !!process.env.CI,
  // Retry once on CI to absorb flakiness from server load; no retries locally
  retries: process.env.CI ? 1 : 0,
  // Use a single worker because the remote Trofos environment is stateful
  workers: 1,
  // Increase timeout to 180 seconds for delete user test with backend polling (WebKit needs more time)
  timeout: 180_000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://trofos-production.comp.nus.edu.sg',
    // Keep a trace on first retry to aid debugging
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
    // Give the remote app plenty of time to respond (Firefox needs more time)
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    // Slow down every action by 500ms in headed mode so you can watch the test
    ...(process.env.CI ? {} : { launchOptions: { slowMo: 500 } }),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'auth-state-chromium.json' },
      dependencies: ['chromium-setup'],
    },
    // Setup project - run once before tests
    {
      name: 'chromium-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
