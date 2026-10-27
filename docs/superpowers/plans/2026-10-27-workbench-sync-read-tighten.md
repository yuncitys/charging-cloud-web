# 工作台同步表收紧 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** P0 营销参与读日表 SUM（已完成）；P1 活动维营销日表；P2 充电用户站维日表并收紧查询。

**Architecture:** Job 写入预聚合表；工作台/分析 API 优先 SUM/读日表；终端状态保持实时。

**Tech Stack:** 同工作台现有 Java/MyBatis/Vue2

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-27-workbench-sync-read-tighten-design.md`
- Branches: `feature/operator-workbench` + `feature/operator-workbench-web`
- **新增表/列必须 COMMENT；Entity/VO 中文注释**
- 不 push codeup-cld
- P0 已落地：cloud `b188bc9e4`，web `0f8e215`

---

### Task P0（DONE）

营销 participate SUM 日表；删除 `countMarketingParticipants`。

---

### Task P1-1: 活动维营销日表 DDL + Entity

**Files:**
- Create: `docs/sql/t_statistics_merchant_marketing_activity_day_20261027.sql`
- Entity + Mapper 骨架

建议列（均 COMMENT）：
- `stat_date`, `merchant_id`, `activity_id`, `tenant_id`
- `issue_count`, `redeem_count`, `discount_cost`, `activity_order_kwh`
- UNIQUE `(stat_date, merchant_id, activity_id)`

- [ ] DDL + Entity + Commit `docs(sql): add merchant marketing activity day table`

---

### Task P1-2: Sync 写入活动维日表

- 扩展 `MarketingDayStatSyncService`（或独立 sync）：按日按活动聚合发券/核销/电量/成本（口径对齐现有 aggregateRedeem / issue）
- Job 已有 marketing day 调用链上挂上
- TDD
- Commit `feat(biz): sync marketing activity day stats`

---

### Task P1-3: marketingAnalysis 改读活动日表

- `listMarketingTrend` 可仍读商户营销日表
- `listMarketingActivityTop` 改为 SUM 活动日表，去掉明细 UNION
- Tests
- Commit `refactor(workbench): read marketing activity top from day table`

---

### Task P2-1: 充电用户站维日表 DDL

- `t_statistics_station_charge_user_day`：`stat_date, merchant_id, station_id, tenant_id, charge_user_count, new_charge_user_count` + COMMENT
- UNIQUE `(stat_date, station_id)`
- Commit `docs(sql): add station charge user day statistics table`

---

### Task P2-2: Sync 站维充电用户 + Job

- 按站聚合（同 C 端/手机号/order_type 口径）；写昨日
- Commit `feat(biz): sync station charge user day stats`

---

### Task P2-3: chargeUsers / analysis 优先读表

- 有站点过滤或站 Top：读站维日表
- 商户级单日：可读商户日表
- 周月：默认 **SUM 日去重** + 文案「日去重之和」；或另加月快照（实现选 SUM 先上，月快照可选后置）
- 去掉/缩小订单全历史扫（保留 fallback 仅缺表时）
- Commit `refactor(workbench): prefer charge-user day tables over live order scans`
- Web：更新充电用户相关 tip 文案

---

### Task P-验收

- Checklist + PENDING_HUMAN DDL
- Commit docs if needed

## Spec coverage

| Spec | Task |
|------|------|
| P0 | DONE |
| P1 | P1-1..3 |
| P2 | P2-1..3 |
