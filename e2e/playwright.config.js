const { defineConfig } = require('@playwright/test')

/**
 * Set OPS_AGENT_E2E_BASE_URL to the admin origin (e.g. http://localhost:9528).
 * Tests skip when unset so CI without a running UI stays green.
 */
module.exports = defineConfig({
  testDir: './specs',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.OPS_AGENT_E2E_BASE_URL || 'http://127.0.0.1:9528',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  reporter: [['list']]
})
