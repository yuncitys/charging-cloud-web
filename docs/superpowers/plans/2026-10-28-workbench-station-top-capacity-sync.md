# Workbench Station Top Capacity Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Top10 终端数 / 额定功率改读 `t_statistics_station_workbench_day` 区间末日快照，不再实时扫枪/设备表。

**Architecture:** Sync 日表时批量写入 `operating_gun_count` / `rated_power_w`；`listStationPowerTop` LEFT JOIN 日表取区间内最近一日（通常为 endDate）容量；前端 meta 去掉「部分实时」。

**Tech Stack:** MyBatis XML、JUnit4（sharecharge-biz）、Jest（charging-cloud-web）

**Spec:** `docs/superpowers/specs/2026-10-28-workbench-station-top-capacity-sync-design.md`

## Global Constraints

- 枪数口径：枪未删 + `IFNULL(start_status,1)=1` + 设备未删（同现 Top10）
- 功率口径：站下未删设备 `SUM(device_total_power)`（瓦）
- 多日：区间内 `MAX(stat_date) ≤ endDate`（有末日则用末日）
- 不改利用率公式；不改终端状态实时块
- 禁止 push `codeup-cld`

---

### Task 1: DDL + Entity + insertBatch

**Files:**
- Create: `charging-cloud/docs/sql/t_statistics_station_workbench_day_capacity_20261028.sql`
- Modify: `StatisticsStationWorkbenchDay.java`
- Modify: `StatisticsStationWorkbenchDayMapper.xml` insertBatch
- Test: extend mapper XML render or sync unit tests in later tasks

- [ ] **Step 1:** Add ALTER TABLE for `operating_gun_count INT NOT NULL DEFAULT 0`, `rated_power_w BIGINT NOT NULL DEFAULT 0`
- [ ] **Step 2:** Entity 加字段 + insertBatch 列
- [ ] **Step 3:** Commit cloud：`feat(biz): workbench day 增加投运枪数与额定功率列`

### Task 2: Sync 写入容量快照

**Files:**
- Modify: `StatisticsStationWorkbenchDayMapper.java` + `.xml` — `listStationCapacityByStation`
- Modify: `WorkbenchDayStatSyncServiceImpl.java`
- Test: `WorkbenchDayStatSyncServiceTest.java`

- [ ] **Step 1:** 失败测试：sync 后行上 gun/power 来自 mapper 返回的 map
- [ ] **Step 2:** 实现 `listStationCapacityByStation`（按站聚合枪数/功率）+ sync 填字段
- [ ] **Step 3:** 绿测 + commit：`feat(biz): workbench day sync 写入枪数与额定功率`

### Task 3: Top10 查询改 JOIN 日表

**Files:**
- Modify: `OperatorWorkbenchQueryMapper.xml` `listStationPowerTop`
- Modify: `OperatorWorkbenchStationPowerTopMapperXmlTest.java`

- [ ] **Step 1:** 改 XML 测试：断言 JOIN `t_statistics_station_workbench_day`、含 `operating_gun_count` / `rated_power_w`；断言**不再**含 `t_device_guns` / `device_total_power` 实时子查询
- [ ] **Step 2:** 改 SQL：电量内层不变；外层 `LEFT JOIN` 日表，`stat_date = (SELECT MAX(...) BETWEEN start AND end)`
- [ ] **Step 3:** 绿测 + commit：`feat(biz): Top10 枪数功率改读 workbench 日表`

### Task 4: 前端 meta / tip

**Files:**
- Modify: `blockMeta.js`, `blockMeta.spec.js`, `index.vue` tips
- [ ] **Step 1:** 测 `SYNC.STATION_TOP` → 短标签 `15分钟`，全文约每15分钟
- [ ] **Step 2:** 改文案 + tip（末日快照）
- [ ] **Step 3:** 绿测 + commit：`fix(web): Top10 sync meta 去掉部分实时`

### Task 5: Verify

- [ ] Cloud：跑 PowerTop mapper XML + WorkbenchDayStatSync + StationPowerTop service 相关测
- [ ] Web：`npm test -- blockMeta.spec`
