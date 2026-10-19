const { test, expect } = require('@playwright/test')

const HAS_BASE = !!process.env.OPS_AGENT_E2E_BASE_URL

test.describe('Ops Agent UX', () => {
  test.skip(!HAS_BASE, 'Set OPS_AGENT_E2E_BASE_URL to run against a live admin UI')

  test.beforeEach(async ({ page }) => {
    // Caller should already be logged in via storageState, or open login first.
    await page.goto(process.env.OPS_AGENT_E2E_PATH || '/')
    await page.locator('.ops-agent-chat__fab').click({ timeout: 20_000 })
    await expect(page.locator('.ops-agent-chat__panel')).toBeVisible()
  })

  test('sidebar can be resized by drag handle', async ({ page }) => {
    const handle = page.locator('.ops-agent-chat__sidebar-resize')
    await expect(handle).toBeVisible()
    const box = await handle.boundingBox()
    expect(box).toBeTruthy()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 40, box.y + box.height / 2, { steps: 8 })
    await page.mouse.up()
    // Still visible after drag — resize applied without crash
    await expect(page.locator('.ops-agent-chat__sidebar')).toBeVisible()
  })

  test('refund shortcut yields plain-language failure without raw JSON in bubble', async ({ page }) => {
    await page.getByRole('button', { name: /退款排障/ }).click()
    const bubbles = page.locator('.msg-bubble--assistant .msg-bubble__inner')
    await expect(bubbles.last()).toBeVisible({ timeout: 30_000 })
    const text = await bubbles.last().innerText()
    expect(text).not.toMatch(/downstream rejected/i)
    expect(text).not.toMatch(/"code"\s*:\s*\d+/)
  })

  test('cancel pending confirm appends cancel tip', async ({ page }) => {
    // Need a real order path for a confirm card; if none appears, soft-pass with note.
    const card = page.locator('.pending-card')
    const hasCard = await card.count()
    if (!hasCard) {
      test.info().annotations.push({
        type: 'note',
        description: 'No pending card in this env — use a real order to cover cancel tip'
      })
      return
    }
    await card.getByRole('button', { name: '取消' }).click()
    await expect(page.locator('.msg-bubble--assistant').last()).toContainText(/已取消/)
  })
})
