# 工作台查询收紧：优先读同步日表

**Date:** 2026-10-27  
**Status:** Approved（对话：先 P0，再 P1/P2）  
**Parent:** 营销/充电用户分析

## Goal

能预聚合的指标统一从 Job 同步表读取；实时仅保留终端状态（及可选 Top10 枪功率）。

## P0（本期立刻做）

营销块「参与电站数 / 参与用户数」：

- **改为** `SUM(t_statistics_merchant_marketing_day.participate_*)` 区间求和  
- **不再**调用 `countMarketingParticipants` 订单 DISTINCT  
- 文案 / VO 注释标明：**日去重之和，非区间严格去重**（跨日同一站/用户会重复累计）  
- `activity_order_kwh` 继续 SUM（本就可加）

## P1

新建活动维营销日表 + sync；营销分析趋势/Top 只读同步表。

## P2

充电用户站维日表（+ 可选月快照）；周月/站 Top/站点角色尽量读表；区间严格去重用月快照或接受日 SUM 并文案说明。

## Out of Scope

- 终端状态仍实时  
- Top10 枪数/额定功率暂仍实时快照  
