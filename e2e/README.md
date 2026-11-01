# Ops Agent Playwright UX

覆盖低优先 #11：取消确认、白话失败、侧栏拖宽。

## 准备

```bash
cd e2e
npm install
npx playwright install chromium
```

## 运行

需已启动管理端并登录（或提供 `storageState`）。

```bash
OPS_AGENT_E2E_BASE_URL=http://localhost:9528 npm test
```

未设置 `OPS_AGENT_E2E_BASE_URL` 时用例会 skip，避免无界面环境失败。

可选：

- `OPS_AGENT_E2E_PATH` — 登录后落地页路径，默认 `/`
