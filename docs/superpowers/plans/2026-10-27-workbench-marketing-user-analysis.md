# 工作台营销加字段 / 营销分析 / 充电用户 / 用户分析 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 营销块补三字段并加营销分析；新增充电用户块（跟顶栏周期，今日→昨日）与用户分析。

**Architecture:** 营销三指标写入 `t_statistics_merchant_marketing_day` 并由现有 sync 扩展；营销分析用日趋势 + 活动维聚合。充电用户新建商户日表 + Job 写昨日；工作台单日读日表，周/月走区间去重查询；分析抽屉提供昨日|本月对照、近 30 日趋势、站 Top。

**Tech Stack:** Java/Spring/MyBatis、Vue2 Element UI、Sa-Token、`@DataScope`、现有工作台 PeriodHelper

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-27-workbench-marketing-user-analysis-design.md`
- Branches: `feature/operator-workbench` + `feature/operator-workbench-web`
- **所有新增表字段 DDL 必须带 COMMENT；Entity/VO 字段必须有中文注释（与 COMMENT 口径一致）**
- 不 push `codeup-cld`
- 充电用户：C 端 `user_type='1'`；按结束时间；手机号去重；区间 end clamp 到昨日
- 营销三字段订单集与「核销订单实收」一致（有核销关联、order_code 去重）
- 权限：营销相关 `:web:operatorWorkbench:marketing`；充电用户 `:web:operatorWorkbench:view`

---

### Task 1: 营销日表 DDL 三列 + Entity（云）

**Files:**
- Create: `charging-cloud/docs/sql/t_statistics_merchant_marketing_day_alter_20261027.sql`
- Modify: marketing day Entity（若有）字段 + 注释

```sql
-- 幂等：先检查 information_schema 或使用可重复执行的 ALTER 说明
ALTER TABLE `t_statistics_merchant_marketing_day`
  ADD COLUMN `activity_order_kwh` decimal(14,4) NOT NULL DEFAULT 0
    COMMENT '当日有核销关联订单的充电量合计（度）' AFTER `subsidy_cost`,
  ADD COLUMN `participate_station_count` int(11) NOT NULL DEFAULT 0
    COMMENT '当日有核销关联订单的去重电站数' AFTER `activity_order_kwh`,
  ADD COLUMN `participate_user_count` int(11) NOT NULL DEFAULT 0
    COMMENT '当日有核销关联订单的去重用户数' AFTER `participate_station_count`;
```

- [ ] **Step 1:** 写 DDL（含 COMMENT）并在本地库执行验证
- [ ] **Step 2:** Entity 三字段 + JavaDoc
- [ ] **Step 3:** Commit `docs(sql): add marketing day activity kwh and participate counts`

---

### Task 2: 营销 sync 写入三字段（云）

**Files:**
- Modify: `MarketingDayStatSyncServiceImpl` + 相关 Mapper XML  
  在现有「核销订单」聚合上增加：`SUM(total_power)`、`COUNT(DISTINCT station)`、`COUNT(DISTINCT user_id)`（与 redeem_order_actual_income 同订单集）
- Test: sync 单测或 Mapper 断言三列有值/无核销为 0

- [ ] **Step 1:** 失败测试（无核销 → 三指标 0；有核销 → 与订单集一致）
- [ ] **Step 2:** 实现
- [ ] **Step 3:** Commit `feat(biz): sync marketing activity kwh and participate metrics`

---

### Task 3: sumMarketing + VO + Controller 透出（云）

**Files:**
- Modify: `OperatorWorkbenchMarketingVo`（三字段 + 注释）
- Modify: `OperatorWorkbenchQueryMapper.xml` `sumMarketing` SUM 三列
- Service 已调 sumMarketing 则补 set；前端暂可下一切
- Test: sum 空表返回 0

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(workbench): expose marketing participate metrics on workbench`

---

### Task 4: marketingAnalysis API（云）

**Files:**
- VO: trend 点（date, issueCount, redeemCount, discountCost, activityOrderKwh）；activityTop 行（activityId, activityName, issue, redeem, kwh, discountCost）
- `POST /operatorWorkbench/marketingAnalysis`，权限 marketing，DataScope 与 marketing 一致
- 默认近 30 日；可用 query.periodType 或独立 start/end（实现选一种，与 spec 抽屉筛选一致，推荐：body 带 `analysisDays` 默认 30，或复用 period）
- Test: 空数据空列表；权限注解

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(workbench): add marketing analysis trend and activity top`

---

### Task 5: 充电用户日表 DDL + Entity（云）

**Files:**
- Create: `charging-cloud/docs/sql/t_statistics_merchant_charge_user_day_20261027.sql`
- Entity + Mapper 骨架

表 COMMENT：`运营商工作台商户充电用户日统计`  
列 COMMENT 按 spec §3（stat_date / merchant_id / tenant_id / charge_user_count / new_charge_user_count）。

- [ ] **Step 1–2:** DDL + Entity
- [ ] **Step 3:** Commit `docs(sql): add merchant charge user day statistics table`

---

### Task 6: 充电用户 sync + Job 挂载（云）

**Files:**
- `ChargeUserDayStatSyncService`：按日聚合 C 端结束订单 → 当日充电用户 / 新增（首次落在当日）
- Internal API + `TaskService`：夜间写昨日；日内任务可重刷昨日（不写今天）
- Test: user_type 过滤；新增定义

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(biz): sync merchant charge user day stats`

---

### Task 7: chargeUsers + chargeUserAnalysis API（云）

**Files:**
- `POST .../chargeUsers`：解析周期（TODAY→昨日；WEEK/MONTH end clamp 昨日）；单日读日表，周/月区间去重查询；返回 count + newCount + periodStart/End + titleHint
- `POST .../chargeUserAnalysis`：yesterday 卡、monthToDate 卡、近 30 日 trend（日表）、stationTop
- 权限 view；DataScope
- Test: TODAY clamp；WEEK 不含今天；分母 0

- [ ] **Step 1–3:** TDD → 实现 → Commit `feat(workbench): add charge user summary and analysis APIs`

---

### Task 8: 前端营销三字段 + 营销分析抽屉（web）

**Files:**
- `operatorWorkbench.js` API
- `index.vue` 营销卡片三字段；「营销分析」抽屉（趋势可用简单 table 或已有图表组件；活动 Top 表）
- 表头/卡片对计算字段可加 `?`（可选）

- [ ] **Step 1–2:** UI
- [ ] **Step 3:** Commit `feat(web): marketing participate metrics and analysis drawer`

---

### Task 9: 前端充电用户块 + 用户分析抽屉（web）

**Files:**
- 布局：概览 → 终端 → **充电用户** → 预警 → …  
- 充电用户：环图（可用 CSS/已有图表）、指标、`?` 口径、副文案 period  
- 「用户分析」抽屉：对照卡 + 趋势 + 站 Top  
- `canView` 控制

- [ ] **Step 1–2:** UI + 单测要点（period title / TODAY hint）
- [ ] **Step 3:** Commit `feat(web): charge user block and user analysis drawer`

---

### Task 10: 验收

- [ ] `.superpowers/sdd/workbench-marketing-user-checklist.md` 对照 spec Acceptance；浏览器 PENDING_HUMAN；不 push

---

## Spec coverage

| Spec | Task |
|------|------|
| 营销三字段 + COMMENT | 1–3, 8 |
| 营销分析 | 4, 8 |
| 充电用户周期映射 | 6–7, 9 |
| 用户分析 | 7, 9 |
| 字段注释 | Global + 1, 5 |
