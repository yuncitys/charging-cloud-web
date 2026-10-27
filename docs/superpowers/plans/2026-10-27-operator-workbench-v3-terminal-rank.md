# 运营商工作台 V3（业态 / 终端状态 / Top10）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 工作台增加 `ruleId` 业态筛选；新增终端状态实时汇总与电站电量 Top10（含利用率等完整字段）。

**Architecture:** `OperatorWorkbenchQuery.ruleId` 贯穿现有 overview/alerts/finance/marketing SQL（日表有 `rule_id` 则滤列；无则 `JOIN t_network_dot` 滤 `rule_id`）。新接口 `terminalStatus`（枪表实时按交直流×六态聚合）、`stationPowerTop`（充电日账单 Top10 + 枪数/功率/利用率公式）。前端顶栏业态 + 两区块。

**Tech Stack:** Java/Spring/MyBatis、Vue2 Element UI、Sa-Token、`@DataScope`

## Global Constraints

- Branches: `feature/operator-workbench` + `feature/operator-workbench-web`
- Spec: `docs/superpowers/specs/2026-10-27-operator-workbench-v3-terminal-rank-design.md`
- 不 push codeup-cld；不做用户统计/营销加字段
- `actual_duration` / `total_duration` 单位：**分钟**；利用率小时 = 分钟/60
- 利用率：`SUM(durationMin)/60 / (gunCount × 24 × D) × 100`；`D≥1`
- 权限：新接口 `:web:operatorWorkbench:view`（与 overview 相同）
- 无法判定交直流的枪：计入 **交流·其他**

---

### Task 1: Query.ruleId + 现有 SQL 过滤（云）

**Files:**
- Modify: `OperatorWorkbenchQuery.java` — `Integer ruleId`
- Modify: `OperatorWorkbenchQueryMapper.xml` — `scopeWhere` 或各 select 增加 rule 条件：
  - 工作台日表 / 营销日表若无 `rule_id`：`AND EXISTS (SELECT 1 FROM t_network_dot nd WHERE nd.id = s.station_id AND nd.rule_id = #{query.ruleId})` 或 JOIN
  - 充电/财务日账单有 `rule_id`：`AND s.rule_id = #{query.ruleId}`
  - 故障/启动失败等以站为准：经站点关联 `rule_id`
- Test: XML render 或 service 测 — ruleId 非空时 SQL 含过滤

- [ ] **Step 1:** 失败测试 / XML 断言
- [ ] **Step 2:** 实现
- [ ] **Step 3:** Commit `feat(workbench): filter workbench queries by ruleId`

---

### Task 2: terminalStatus API（云）

**Files:**
- Create VO: `OperatorWorkbenchTerminalStatusVo`（内嵌 ac/dc 六态 Integer）
- Mapper SQL：参考 `StationMonitorMapper` / `MerchantAppQueryMapper.stationCardFrom` 枪态分桶 + `electric_out_type`；主过滤 `t_network_dot` + DataScope alias 与 Controller 一致（建议枪联查时网点别名 `w` 或 `tnd`，`DOT_PRIMARY`）
- Service + Controller `POST /operatorWorkbench/terminalStatus`
- Test: 分桶边界（空闲 vs 插枪占用、交直流）

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(workbench): add realtime terminal status by AC/DC`

---

### Task 3: stationPowerTop API（云）

**Files:**
- Create VO: `OperatorWorkbenchStationPowerTopVo`（rank, stationId, stationName, totalKwh, avgDailyKwh, avgDailyKwhPerGun, gunCount, utilizationRate, ratedPowerKw）
- Mapper：日账单按站 SUM degree/duration；LEFT JOIN 枪数（投运）、设备额定功率；LIMIT 10；ruleId/merchant/station/scope
- Service：解析 period → D；算日均/单枪日均/利用率；赋 rank 1..n
- Controller `POST /operatorWorkbench/stationPowerTop`
- Test: D=1、gunCount=0 → util null；利用率公式样例

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(workbench): add station power top10 with utilization`

---

### Task 4: 前端业态 + 两区块（web）

**Files:**
- `operatorWorkbench.js` — `workbenchTerminalStatus` / `workbenchStationPowerTop`
- `index.vue`：
  - 业态下拉（`$dict.getSelector('device_rule')`）；`searchForm.ruleId`；站点列表按 rule 过滤；`buildParams` 带 ruleId
  - 区块「终端状态」（概览后）；「电站电量前 10」（营销后）；标题随 periodType
  - `canView` 控制展示；独立 loading/error
- 链接：异常明细 → `/device/faultMonitor`；电站监控 → 现有监控路由；电站报表 → `/business/businessStatistics`（或现网电站报表 path）

- [ ] **Step 1–2:** API + UI
- [ ] **Step 3:** Commit `feat(web): ruleId filter, terminal status, station power top10 on workbench`

---

### Task 5: 验收

- [ ] `.superpowers/sdd/v3-terminal-rank-checklist.md` 对照 Acceptance 1–4；浏览器 PENDING_HUMAN；不 push

---

## Spec coverage

| Spec | Task |
|------|------|
| ruleId 筛选 | 1, 4 |
| 终端状态 | 2, 4 |
| Top10 + 公式 | 3, 4 |
| 用户/营销加字段 | Out of scope |
