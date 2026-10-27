# 充电用户按开始日 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 充电用户日表改按 `COALESCE(start_time,create_time)` + `order_status IN (1,2,3)`；今日由现有 15 分钟 intraday 写入；工作台 TODAY 读今日。

**Architecture:** 改 Mapper 聚合 SQL；Job 取消跳过今日并在 intraday 写 today(+yesterday)；`closePeriod` clamp 到今天；Web tip 文案同步。无 DDL。

**Tech Stack:** Java/MyBatis、XXL TaskService、Vue2 工作台

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-27-workbench-charge-user-start-day-design.md`
- Branches: `feature/operator-workbench` + `feature/operator-workbench-web`
- 不改财务/营销/日账单；不新建 XXL 任务
- 不 push `codeup-cld`

---

### Task 1: Mapper 聚合 SQL + XML 测试

**Files:**
- Modify: `sharecharge-biz/.../StatisticsMerchantChargeUserDayMapper.xml`
- Modify: `sharecharge-biz/.../StatisticsStationChargeUserDayMapper.xml`
- Modify: `*ChargeUserDayMapperXmlTest.java`（merchant + station）
- Modify: Entity 类注释（merchant/station charge user day）

- [ ] 更新 XML 测试断言（start 归天、status IN、无 end_time 必填）
- [ ] 改两份 Mapper SQL
- [ ] 跑 XML 相关测试
- [ ] Commit `refactor(biz): charge-user day by start_time and status 1/2/3`

---

### Task 2: Job 允许写今天 + intraday 挂今日

**Files:**
- Modify: `TaskService.java`（`syncChargeUserDayQuietly`、`syncMerchantAppIntraday`）
- Modify: `TaskServiceWorkbenchDayTest.java`
- Check: `ChargeUserDayStatSyncServiceImpl` 若有跳过今日则改

- [ ] 仅跳过未来日；intraday 写 today + yesterday
- [ ] 更新 Job 单测
- [ ] Commit `feat(job): sync charge-user day for today on intraday`

---

### Task 3: closePeriod / 分析末日含今天

**Files:**
- Modify: `OperatorWorkbenchQueryServiceImpl.java`（`closePeriod`、本月卡 end、hints）
- Modify: `OperatorWorkbenchChargeUserServiceTest.java` 等
- Modify: VO Javadoc

- [ ] TODAY=今日；WEEK/MONTH clamp 今天；去掉周一/1 号回退昨日
- [ ] 分析：昨日卡仍昨日；本月～今日
- [ ] 单测全绿
- [ ] Commit `feat(workbench): charge-users period includes today`

---

### Task 4: Web 文案

**Files:**
- Modify: `chargeUser.js`、`index.vue` 注释
- Modify: unit specs if any

- [ ] tip / note 对齐新口径
- [ ] Commit `fix(web): charge-user tips for start-day sync`

---
