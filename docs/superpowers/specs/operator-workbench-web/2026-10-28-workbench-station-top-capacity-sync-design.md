# 电站电量 Top10：终端数 / 额定功率改读同步表

**Date:** 2026-10-28  
**Status:** Approved（对话确认方案 A：区间末日快照）  
**Repos:** `charging-cloud`（DDL / sync / 查询）+ `charging-cloud-web`（meta / tip）

## Goal

Top10 的终端数、额定功率、单枪日均、利用率与电量同属同步口径，避免实时枪/设备表导致利用率与周期电量错位。

## Decision

- 容量快照落在 `t_statistics_station_workbench_day`（随既有 15 分钟 / 夜间 sync 写入，含零收入站）
- 多日周期取**区间末日** `endDate` 的快照（缺则区间内该站最近有数日；仍无则 0）
- 不改电量排序、利用率公式、终端状态块（仍实时）

## Schema

`t_statistics_station_workbench_day` 增列：

| 列 | 类型 | 含义 |
|----|------|------|
| `operating_gun_count` | INT NOT NULL DEFAULT 0 | 枪未删 + 投运 + 设备未删（同现 Top10 / 终端状态投运口径） |
| `rated_power_w` | BIGINT NOT NULL DEFAULT 0 | 站下未删设备 `device_total_power` 之和（瓦） |

DDL 放 `charging-cloud/docs/sql/`；历史可用按日重跑 `WorkbenchDayStatSync` 回填。

## Sync

`WorkbenchDayStatSyncServiceImpl.syncDate` 在经营/预警字段写完后、`insertBatch` 前：

1. 批量查出当日各站 `operating_gun_count` / `rated_power_w`（口径与现 `listStationPowerTop` 子查询一致）
2. 填入每行（含 `fillZeroRows` 补的站）；名单外站不写

## Query

`listStationPowerTop`：

1. 内层仍对 `t_statistics_station_charge_day_bill` 按 `[startDate, endDate]` SUM 电量/时长 → Top N
2. 外层改为 `LEFT JOIN t_statistics_station_workbench_day` 取枪数/功率，**不再**相关子查询 `t_device_guns` / `t_device`
3. Join 优先 `w.stat_date = #{endDate}`；缺行时回退该站区间内 `MAX(stat_date) ≤ endDate`（实现可用子查询或二次 LEFT JOIN）
4. Service 换算（日均 / 单枪日均 / 利用率 / kW）不变

## Frontend

- `SYNC.STATION_TOP` → 「约每15分钟同步」；短标签去掉「部分实时」
- tip：终端数 / 额定功率说明为**统计区间末日**日表快照

## Non-Goals

- 不改 Top10 电量排序与利用率公式分子分母定义
- 不把容量字段写入 `charge_day_bill`
- 不改「终端状态」实时块
- 不做区间内各日枪数平均

## Acceptance

1. 跑 DDL 后 sync 当日：日表新列有值，与当时实时投运枪数 / 额定功率一致（允许设备变更窗口内的短暂差）
2. Top10 SQL / 接口不再访问实时枪表；`gunCount` / `ratedPowerKw` 等于 `endDate` 日表快照
3. 周/月：利用率用末日枪数；改枪数后仅影响有新 sync 的末日，不回溯改历史日行
4. 前端 meta 显示约 15 分钟同步，无「实时 / 部分实时」
