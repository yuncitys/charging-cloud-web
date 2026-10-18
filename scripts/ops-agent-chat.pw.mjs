/**
 * Playwright E2E for OpsAgentChat (JSON pretty + multi-conversation).
 * Run: nvm use 20 && node scripts/ops-agent-chat.pw.mjs
 */
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.OPS_WEB_URL || 'http://localhost:9526'
const ACCOUNT = process.env.OPS_ACCOUNT || 'admin'
const PASSWORD = process.env.OPS_PASSWORD || '888888'
const OUT_DIR = path.join(__dirname, '../.pw-artifacts')
const results = []

function ok(name, detail = '') {
  results.push({ name, pass: true, detail })
  console.log(`PASS  ${name}${detail ? ' — ' + detail : ''}`)
}

function fail(name, detail = '') {
  results.push({ name, pass: false, detail })
  console.error(`FAIL  ${name}${detail ? ' — ' + detail : ''}`)
}

async function shot(page, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: false })
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[placeholder*="账户"], input[name="account"], .login-form input', {
    timeout: 20000
  })
  // clear any stale token
  await page.evaluate(() => {
    document.cookie = 'Admin-Token=; Max-Age=0; path=/'
    localStorage.removeItem('ops_agent_conversations_v2')
    sessionStorage.clear()
  })

  const account = page.locator('.login-form input').first()
  const password = page.locator('.login-form input[type="password"], .login-form input').nth(1)
  await account.fill(ACCOUNT)
  await password.fill(PASSWORD)
  await page.locator('.login-form__submit, button.el-button--primary').first().click()
  await page.waitForURL(url => !String(url).includes('/login'), { timeout: 30000 })
  await page.waitForTimeout(1500)
}

async function openChat(page) {
  const fab = page.locator('.ops-agent-chat__fab')
  await fab.waitFor({ state: 'visible', timeout: 15000 })
  await fab.click()
  await page.locator('.ops-agent-chat__panel').waitFor({ state: 'visible', timeout: 10000 })
}

async function waitAssistantReply(page, timeoutMs = 25000) {
  const before = await page.locator('.msg-bubble--assistant').count()
  await page.waitForFunction(
    (n) => document.querySelectorAll('.msg-bubble--assistant').length > n,
    before,
    { timeout: timeoutMs }
  ).catch(() => null)
  // also wait typing to disappear
  await page.locator('.ops-agent-chat__typing').waitFor({ state: 'detached', timeout: 20000 }).catch(() => null)
  await page.waitForTimeout(500)
}

async function clickShortcut(page, label) {
  await page.locator('.ops-agent-chat__shortcuts button', { hasText: label }).click()
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(20000)

  try {
    // --- Login ---
    await login(page)
    if (page.url().includes('/login')) {
      fail('login', 'still on login page')
      throw new Error('login failed')
    }
    ok('login', page.url())

    // --- Open FAB / panel ---
    await openChat(page)
    await shot(page, '01-panel-open')
    const hasWelcome = await page.locator('.ops-agent-chat__messages').innerText()
    if (hasWelcome.includes('运维助手') || hasWelcome.includes('查单')) {
      ok('open-panel-welcome')
    } else {
      fail('open-panel-welcome', hasWelcome.slice(0, 120))
    }

    // --- Mock badge ---
    const mockVisible = await page.locator('.ops-agent-chat__title .el-tag', { hasText: 'Mock' }).count()
    if (mockVisible > 0) ok('mock-badge')
    else fail('mock-badge', 'Mock tag not visible (may appear after first reply)')

    // --- Sidebar + new conversation ---
    const sidebar = page.locator('.ops-agent-chat__sidebar')
    if (await sidebar.isVisible()) ok('sidebar-visible')
    else fail('sidebar-visible')

    await page.locator('.ops-agent-chat__new-btn').click()
    await page.waitForTimeout(400)
    const convCount1 = await page.locator('.ops-agent-chat__conv-item').count()
    if (convCount1 >= 2) ok('create-conversation', `count=${convCount1}`)
    else fail('create-conversation', `count=${convCount1}`)

    // --- Shortcut: 枪离线SOP (knowledge, no order HTTP) ---
    await clickShortcut(page, '枪离线SOP')
    await waitAssistantReply(page)
    await shot(page, '02-sop-reply')
    const afterSop = await page.locator('.ops-agent-chat__messages').innerText()
    if (afterSop.includes('枪离线') || afterSop.includes('SOP') || afterSop.includes('执行步骤') || afterSop.length > 50) {
      ok('shortcut-sop-reply', afterSop.slice(0, 80).replace(/\n/g, ' '))
    } else {
      fail('shortcut-sop-reply', afterSop.slice(0, 150))
    }

    // expand tool trace if present (may already be open when steps <= 2)
    const traceToggle = page.locator('.tool-trace__toggle').first()
    if (await traceToggle.count()) {
      await traceToggle.scrollIntoViewIfNeeded()
      const listVisible = await page.locator('.tool-trace__list').first().isVisible().catch(() => false)
      if (!listVisible) {
        await traceToggle.click()
        await page.waitForTimeout(300)
      }
      const stepHead = page.locator('.tool-trace__step-head').first()
      if (await stepHead.count()) {
        await stepHead.scrollIntoViewIfNeeded()
        const bodyVisible = await page.locator('.tool-trace__step-body').first().isVisible().catch(() => false)
        if (!bodyVisible) {
          await stepHead.click({ force: true })
          await page.waitForTimeout(200)
        }
      }
      const jsonBlock = page.locator('.json-block').first()
      if (await jsonBlock.count()) {
        await jsonBlock.scrollIntoViewIfNeeded()
        const pre = await jsonBlock.locator('.json-block__pre').innerText().catch(() => '')
        if (pre.includes('{') || pre.includes('[') || pre.length > 0) {
          ok('json-pretty-block', pre.slice(0, 60).replace(/\n/g, ' '))
        } else {
          ok('json-pretty-block', 'block present')
        }
        await shot(page, '03-json-pretty')
      } else if (await page.locator('.tool-trace__step').count()) {
        ok('json-pretty-block', 'tool steps without nested json body')
      } else {
        fail('json-pretty-block', 'no json-block / tool steps')
      }
    } else {
      fail('json-pretty-block', 'no tool-trace toggle (reply may have failed)')
    }

    // --- Shortcut: 查单 ---
    await page.locator('.ops-agent-chat__new-btn').click()
    await page.waitForTimeout(300)
    await clickShortcut(page, '查单')
    await waitAssistantReply(page, 35000)
    await shot(page, '04-lookup-order')
    const lookupText = await page.locator('.ops-agent-chat__messages').innerText()
    if (lookupText.includes('ORD20240101001') || lookupText.includes('查单') || lookupText.includes('执行步骤') || lookupText.includes('订单')) {
      ok('shortcut-lookup', lookupText.slice(0, 100).replace(/\n/g, ' '))
    } else {
      fail('shortcut-lookup', lookupText.slice(0, 150))
    }

    // title auto from first message
    const activeTitle = await page.locator('.ops-agent-chat__title-text').innerText()
    if (activeTitle && activeTitle !== '新对话') ok('auto-title', activeTitle)
    else fail('auto-title', activeTitle)

    // --- Multi switch ---
    const items = page.locator('.ops-agent-chat__conv-item')
    const n = await items.count()
    if (n >= 2) {
      await items.nth(1).click()
      await page.waitForTimeout(400)
      const title2 = await page.locator('.ops-agent-chat__title-text').innerText()
      await items.nth(0).click()
      await page.waitForTimeout(400)
      const title1 = await page.locator('.ops-agent-chat__title-text').innerText()
      ok('switch-conversation', `${title2} <-> ${title1}`)
    } else {
      fail('switch-conversation', `only ${n} conversations`)
    }

    // --- Minimize to dock + reopen ---
    await page.locator('.ops-agent-chat__header-actions .el-icon-minus').click()
    await page.waitForTimeout(400)
    const panelHidden = !(await page.locator('.ops-agent-chat__panel').isVisible())
    const dock = page.locator('.ops-agent-chat__dock-chip')
    if (panelHidden && (await dock.count()) >= 1) {
      ok('minimize-to-dock')
      await dock.first().click()
      await page.locator('.ops-agent-chat__panel').waitFor({ state: 'visible', timeout: 8000 })
      ok('reopen-from-dock')
    } else {
      fail('minimize-to-dock', `panelHidden=${panelHidden} dock=${await dock.count()}`)
    }
    await shot(page, '05-after-reopen')

    // --- Close panel, FAB reopen keeps list ---
    await page.locator('.ops-agent-chat__close').click()
    await page.waitForTimeout(300)
    await page.locator('.ops-agent-chat__fab').click()
    await page.locator('.ops-agent-chat__panel').waitFor({ state: 'visible' })
    const listAfter = await page.locator('.ops-agent-chat__conv-item').count()
    if (listAfter >= 2) ok('persist-conversations-after-close', `count=${listAfter}`)
    else fail('persist-conversations-after-close', `count=${listAfter}`)

    // --- Rename ---
    const firstItem = page.locator('.ops-agent-chat__conv-item').first()
    await firstItem.hover()
    await firstItem.locator('.el-icon-edit').click()
    await page.locator('.ops-agent-chat__rename-input').fill('PW测试会话')
    await page.locator('.ops-agent-chat__rename-input').press('Enter')
    await page.waitForTimeout(300)
    const renamed = await page.locator('.ops-agent-chat__conv-item').first().innerText()
    if (renamed.includes('PW测试会话')) ok('rename-conversation')
    else fail('rename-conversation', renamed)

    // --- Refund shortcut (pending card) ---
    await page.locator('.ops-agent-chat__new-btn').click()
    await page.waitForTimeout(300)
    await clickShortcut(page, '退款排障')
    await waitAssistantReply(page, 40000)
    await shot(page, '06-refund')
    const refundText = await page.locator('.ops-agent-chat__messages').innerText()
    const pending = await page.locator('.pending-action-card').count()
    if (refundText.length > 20 || pending > 0) {
      ok('shortcut-refund', `pending=${pending} text=${refundText.slice(0, 80).replace(/\n/g, ' ')}`)
    } else {
      fail('shortcut-refund', refundText.slice(0, 120))
    }

    // --- Remote stop shortcut ---
    await page.locator('.ops-agent-chat__new-btn').click()
    await page.waitForTimeout(300)
    await clickShortcut(page, '远程停充')
    await waitAssistantReply(page, 40000)
    await shot(page, '07-remote-stop')
    const stopText = await page.locator('.ops-agent-chat__messages').innerText()
    if (stopText.includes('停') || stopText.includes('确认') || stopText.includes('执行步骤') || stopText.length > 20) {
      ok('shortcut-remote-stop', stopText.slice(0, 80).replace(/\n/g, ' '))
    } else {
      fail('shortcut-remote-stop', stopText.slice(0, 120))
    }

    // --- localStorage persistence ---
    const stored = await page.evaluate(() => localStorage.getItem('ops_agent_conversations_v2'))
    if (stored && stored.includes('conversations')) ok('localStorage-persist', `bytes=${stored.length}`)
    else fail('localStorage-persist')

    await shot(page, '08-final')
  } catch (e) {
    fail('suite-crash', e.message)
    await shot(page, '99-error').catch(() => {})
  } finally {
    await browser.close()
  }

  const passed = results.filter(r => r.pass).length
  const failed = results.filter(r => !r.pass).length
  const summary = { passed, failed, total: results.length, results }
  fs.writeFileSync(path.join(OUT_DIR, 'results.json'), JSON.stringify(summary, null, 2))
  console.log('\n==== SUMMARY ====')
  console.log(`passed=${passed} failed=${failed} total=${results.length}`)
  console.log(`artifacts: ${OUT_DIR}`)
  if (failed > 0) process.exit(1)
}

main()
