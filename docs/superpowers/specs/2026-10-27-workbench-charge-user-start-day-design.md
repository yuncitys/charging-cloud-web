# 工作台充电用户：按开始日 + 状态 1/2/3，今日随 15 分钟同步

**Date:** 2026-10-27  
**Status:** Approved（对话确认方案 1 + 挂现有 15 分钟 intraday）  
**Parent:** 运营商工作台 · 充电用户 / 用户分析  
**Branches:** `feature/operator-workbench` + `feature/operator-workbench-web`

## Goal

充电用户为**独立日表指标**，不与日账单/财务对齐。统一改为：

- 归天：`COALESCE(start_time, create_time)`
- 订单：`order_status IN (1,2,3)`（进行中 / 已完成 / 待结算）
- 今日随现有 **`syncMerchantAppIntraday`（约 15 分钟）** 写入日表；工作台 TODAY 读**今日**行，不再映射昨日

## Non-Goals

- 不改财务块、日账单、营销块口径或任务
- 不新增 XXL 任务（挂现有 intraday，与概览/工作台其它日统计一致）
- 不改表结构（无 DDL）
- 不做接口实时扫订单（查询仍优先读日表）

## 口径（商户日表 / 站维日表 / 新增 同一套）

| 项 | 规则 |
|---|---|
| 订单 | `t_order_info.is_delete = 0`，`order_status IN (1, 2, 3)` |
| 用户 | `t_app_user.user_type = '1'`（C 端）；排除 `order_type = 4`（互联/漫游），与现网一致 |
| 归天时刻 | `COALESCE(toi.start_time, toi.create_time)`；两者皆空则该单不计入 |
| 去重键 | 优先 `TRIM(phone_number)`；无手机号回退 `'u' + user_id` |
| 充电用户数 | 统计日内至少 1 笔符合条件订单的去重人数 |
| 新增充电用户数 | 该去重键在**当前聚合范围**（商户日表=商户；站维日表=站点）内，首笔符合条件订单的归天时刻落在统计日 |

表仍为：

- `t_statistics_merchant_charge_user_day`
- `t_statistics_station_charge_user_day`

Entity / Mapper 注释与前端 `?` / `subHint` 同步改为「按开始时间；含进行中/已完成/待结算；约每 15 分钟同步」。

## Sync / Job

### 聚合 SQL

`StatisticsMerchantChargeUserDayMapper` / `StatisticsStationChargeUserDayMapper` 的 `aggregateChargeUsers` / `aggregateNewChargeUsers`：

- 去掉 `end_time IS NOT NULL` 及按 `end_time` 的日界
- 改为对 `COALESCE(start_time, create_time)` 做 `[statDate, statDate+1day)` 范围比较
- 增加 `order_status IN (1, 2, 3)`

### 允许写今天

- `TaskService.syncChargeUserDayQuietly`：**取消**「今日及未来日跳过」；仅跳过**严格未来日**（`statDate > today`）
- `ChargeUserDayStatSyncService`（若有同等守卫）一并调整

### 挂现有 15 分钟任务

`TaskService.syncMerchantAppIntraday`（与站点日账单 / workbench day / marketing day 同链）：

1. **写今天** `syncChargeUserDay(today)`（盘中含进行中）
2. **可选保留**再写昨日一次（吸收补单/延迟落库）；若与「只关心今日盘中」冲突可只写今天——**推荐今日 + 昨日各一次**，成本可接受且与「刷昨日」习惯一致

夜间 `syncMerchantChargeDayBill` 链上对**昨日**的 `syncChargeUserDay` 保持不变（收口）。

`backfillWorkbenchDay`：对区间内每一天（含今日若落在区间）调用 sync；不再因「今天」跳过。

## 工作台查询 / 文案

### `chargeUsers` 周期

| 顶栏 | 统计区间 | 标题 / 副文案方向 |
|---|---|---|
| TODAY | **今日单日**（读日表今日行） | 「今日充电用户」；副文案如「约每 15 分钟同步，含进行中」 |
| WEEK | 本周一 ～ min(周日, **今日**) | 「本周充电用户」；区间文案；多日注明日去重之和 |
| MONTH | 本月 1 日 ～ min(月末, **今日**) | 「本月充电用户」；同上 |

- 删除「TODAY→昨日」「周一/1 号回退昨日」逻辑（`closePeriod` 改为末日 clamp 到**今天**，允许起日=末日=今天）
- 自定义 `statDate`：仍跟 `OperatorWorkbenchPeriodHelper`；末日 clamp 到今天（不得含未来日）

### `chargeUserAnalysis`

- **昨日卡**：最近已收口对照——锚点为今天时仍展示**昨天**单日（对照用，不变成「今日」）
- **本月卡**：本月 1 日 ～ **今日**（日表 SUM）；1 号当天若今日行尚未写出可为 0，副文案如实
- 趋势 / 站 Top：末日可含今天；文案与块上口径一致

### 前端

- `CHARGE_USER_TIP` / 分析抽屉说明：开始时间、状态 1/2/3、15 分钟同步、与财务无关
- `dataAsOf` 类提示（若已有）：与营销块风格一致即可

## 上线

1. 部署 cloud（含 job）+ web  
2. 确认 XXL `syncMerchantAppIntraday` 仍约 15 分钟（不改代码侧新任务）  
3. 建议执行一次 `backfillWorkbenchDay` 近 30 日，用新口径覆盖旧 `end_time` 行  
4. 无 DDL

## 测试要点

- Mapper XML / sync：进行中（无 `end_time`、有 `start_time`）计入开始日；`order_status=0` 不计入；`start_time` 空则用 `create_time`
- Job：intraday 调用 `syncChargeUserDay(today)`；未来日仍跳过
- `closePeriod`：TODAY=今日；周一 WEEK 含今天单日；不再回退昨日
- Web 单测：tip / 标题文案
- 回归：财务 / 营销块行为不变

## Acceptance

1. 今日充电用户随 intraday 约 15 分钟更新，含进行中订单（按开始日）  
2. 本周/本月含今天；周一/1 号不再显示「回退昨日」  
3. 历史日回填后与新口径一致；未回填的旧日数据可能仍偏旧口径直至回填  
4. 财务、营销、日账单无回归  

## Out of Scope / 已知

- 日去重之和跨日重复计人：保持现文案说明  
- 进行中订单结束后仍占「开始日」；不迁到结束日  
- `order_status=0`（未响应）明确不计  
