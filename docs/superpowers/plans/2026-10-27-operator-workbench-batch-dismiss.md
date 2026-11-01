# 运营商工作台批量忽略 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 异常预警列表支持多选后一次忽略（3/7/30 天），部分失败返回计数。

**Architecture:** 后端新增 `POST /alerts/dismiss/batch`：Controller 对每项独立 `inScope` 后调用现有 `alertDismissService.dismiss`；前端表格多选 + 复用天数弹窗。不做分页、不做批量阈值。

**Tech Stack:** Java/Spring + MyBatis（cloud）、Vue2 + Element UI（web）、Sa-Token + `@DataScope`

## Global Constraints

- Branches: `feature/operator-workbench`（cloud）+ `feature/operator-workbench-web`（web）
- 不 push `codeup-cld`；不强制 push origin
- `days` ∈ {3,7,30}，默认 7；`items` 上限 100
- 单条 dismiss API 保留；权限 `:web:operatorWorkbench:alerts`
- Spec: `docs/superpowers/specs/2026-10-27-operator-workbench-batch-dismiss-design.md`

---

### Task 1: Batch request/response + Controller API（cloud）

**Files:**
- Create: `sharecharge-biz/.../entity/model/OperatorWorkbenchAlertDismissBatchRequest.java`
- Create: `sharecharge-biz/.../vo/OperatorWorkbenchAlertDismissBatchResultVo.java`（含内嵌 Failure 或独立类）
- Modify: `sharecharge-web/.../controller/OperatorWorkbenchController.java`
- Test: `sharecharge-web/.../controller/OperatorWorkbenchControllerScopeTest.java`（或新建 batch 测试类）

**Interfaces:**
- `POST /operatorWorkbench/alerts/dismiss/batch`
- Body: `{ days?: Integer, items: [{ merchantId, stationId, alertType }] }`
- Response data: `{ successCount, failCount, failures: [{ merchantId, stationId, alertType, msg }] }`（failures 最多 20）
- 每项：拷贝 scope 到临时 Query（`merchantId` + `stationIds=[stationId]`）→ `inScope` → `dismiss(...)`；失败记 msg，继续下一项
- items 空 / 超 100 → `ResultUtil.error`

- [ ] **Step 1: 写失败测试** — 无权限项 failCount+1；合法项调 dismiss；空 items 报错

- [ ] **Step 2: 实现 DTO + Controller 批量方法**（`@DataScope` / `@SaCheckPermission` 同单条）

- [ ] **Step 3: 跑测试至绿**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
mvn -o -pl sharecharge-web/sharecharge-web-controller,sharecharge-biz -am test -Dtest='OperatorWorkbench*Test'
```

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): batch dismiss workbench alerts with per-item scope

EOF
)"
```

---

### Task 2: 前端多选 + 批量忽略（web）

**Files:**
- Modify: `src/api/business/operatorWorkbench.js` — 增加 `batchDismissAlerts`
- Modify: `src/views/business/operatorWorkbench/index.vue`

**Interfaces:**
- 表格 `type="selection"`；`@selection-change` 存 `alertSelection`
- 标题旁按钮「批量忽略」：`disabled=!alertSelection.length`
- 弹窗：单条仍用 `dismissTarget`；批量用 `dismissTargets`（数组）或统一 `dismissMode: 'one'|'batch'`；标题/说明显示 N 条
- 确认：batch → `batchDismissAlerts({ days, items })`；按 `successCount/failCount` toast；成功清空 selection + `loadAlerts`
- items 字段取自行：`merchantId, stationId, alertType`（缺 merchantId 的行跳过或计入前端提示）

- [ ] **Step 1: API 方法**

- [ ] **Step 2: 表格多选 + 批量按钮 + 弹窗复用**

- [ ] **Step 3: 手动路径 PENDING_HUMAN 或自检逻辑；Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): multi-select batch dismiss on operator workbench alerts

EOF
)"
```

---

### Task 3: 验收打勾

- [ ] **Step 1:** 对照 Spec Acceptance 1–4 写入 `.superpowers/sdd/batch-dismiss-checklist.md`（浏览器项可 PENDING_HUMAN）

- [ ] **Step 2:** 不强制 push

---

## Spec coverage

| Spec | Task |
|------|------|
| 多选 + 批量忽略 UI | 2 |
| 共用 3/7/30 弹窗 | 2 |
| batch API + 部分失败 | 1 |
| 单条路径保留 | 1–2 |
| 不做分页/批量阈值 | Global |
