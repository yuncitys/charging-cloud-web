# 业务统计页 Summary Cards 全量合计设计

**Date:** 2026-07-13  
**Status:** Approved  
**Approach:** 方案 1 — 每个报表单独增加 `/summary` 合计接口  
**Scope:** `charging-cloud`（后端 API）+ `charging-cloud-web`（管理端页面）

## Goal

业务统计页顶部 `summary-cards` 展示当前筛选条件下的**全量合计**，不再对当前页列表行做前端累加。

## Background

| 能力 | 现状 |
|------|------|
| Two / Three / Five | 卡片数据来自对应汇总列表 `res.data` 前端求和 |
| 问题 | 列表带 `LIMIT` 分页，翻页或改 pageSize 会改变顶部合计，无法看全量 |
| Four / Six | 同类问题，**本次不做** |

## Requirements（已确认）

| # | 需求 |
|---|------|
| R1 | 采用独立 `/summary` 接口，不用扩展列表响应、不拉全量再前端求和 |
| R2 | 覆盖页面：Two 充电趋势、Three 电站趋势、Five 充电汇总 |
| R3 | **不做** Four 用户交易、Six 分账汇总 |
| R4 | Five「总占桩费」暂不接真实数据，保持 0 / 占位 |
| R5 | 三个 summary 接口**统一核心字段名**；缺的后端补齐 |
| R6 | 时长字段统一为 `totalChargeDurations`，单位**分钟**；Two 卡片展示小时时前端 `/60` |
| R7 | Two 保留额外字段 `merchantReceiptTotal`（商户实收） |
| R8 | 筛选条件、数据权限与对应列表接口一致；忽略 `page`/`limit` |
| R9 | 仅在查询/首屏加载时请求 summary；翻页不重拉卡片 |

## Unified Response Fields

三个 `/summary` 接口的 `data` 必须包含：

| 字段 | 含义 | 单位 |
|------|------|------|
| `actualPrice` | 应收 | 元 |
| `realityPayMoney` | 实收 | 元 |
| `electricityPrice` | 电费 | 元 |
| `servicePrice` | 服务费 | 元 |
| `totalPower` | 电量 | 度 |
| `totalChargeNumber` | 订单数 | 笔/次 |
| `totalChargeDurations` | 时长 | **分钟** |

可选扩展（仅相关页使用）：

| 字段 | 含义 | 使用页 |
|------|------|--------|
| `merchantReceiptTotal` | 商户实收 | Two |
| `totalDevice` | 设备总数 | Three |

无数据时数字字段返回 `0`。不返回占桩费字段。

### 字段映射（旧 → 新）

| 旧字段（前端卡片） | 统一字段 | 备注 |
|--------------------|----------|------|
| `orderTotalAmount`（Two） | `actualPrice` | 应收 |
| `userActualPayTotal`（Two） | `realityPayMoney` | 实收 |
| `electricityFee` / `serviceFee`（Two） | `electricityPrice` / `servicePrice` | |
| `chargeDurationHours`（Two） | `totalChargeDurations` | 后端分钟；前端展示小时 |
| `chargingCount`（Five） | `totalChargeNumber` | |
| `chargingPowerCount`（Five） | `totalPower` | |
| `actualDuration`（Five） | `totalChargeDurations` | |
| Five 无实收 | `realityPayMoney` | 后端从订单补齐；前端卡片增加实收 |

列表行字段名可保持现状，**仅卡片与 summary 接口**统一。

## API

| 页面 | 路径 | 参数模型 | 数据权限 |
|------|------|----------|----------|
| Two | `POST /api/web/reports/chargingTrend/summary` | 与 `chargingTrend/list` 相同 | 与 list 一致 |
| Three | `POST /api/web/reports/chargingStationSection/summary` | 与 `chargingStationSection` 相同 | 与 section 一致 |
| Five | `POST /api/web/reports/chargingUserChargeSection/summary` | 与 `chargingUserChargeSection` 相同 | 与 section 一致（`alias = tau`） |

响应形状：

```json
{
  "code": 200,
  "msg": "统计成功",
  "data": {
    "actualPrice": 0,
    "realityPayMoney": 0,
    "electricityPrice": 0,
    "servicePrice": 0,
    "totalPower": 0,
    "totalChargeNumber": 0,
    "totalChargeDurations": 0,
    "merchantReceiptTotal": 0,
    "totalDevice": 0
  }
}
```

无关可选字段可省略或固定为 `0`；核心七字段必须存在。

## Architecture

```
查询 / 首屏
  ├─ curve / trend chart API（不变）
  ├─ list / section API（分页，不变）
  └─ /summary API（全量合计 → summaryTotal）

翻页 / 改 pageSize
  └─ 仅 list / section（卡片不变）
```

### 后端（charging-cloud）

| 层 | 改动 |
|----|------|
| VO | 新增统一 `ReportSummaryVo`（核心七字段 + 可选 `merchantReceiptTotal`、`totalDevice`） |
| Mapper XML | 三条 `…Summary` SQL：复用现有列表 WHERE / 数据源，去掉按日/用户/站点分组与 `LIMIT`，一次 `SUM/COUNT` |
| Mapper / Service / Controller | 各增 summary 方法与路由 |

**SQL 口径原则**

- 与对应汇总列表同源、同筛选、同 `@DataScope`
- 合计语义 = 列表全部分页行相加（不是只加当前页）
- Two：基于现有充电趋势账单表（日/月 bill，与 list/curve 一致）；`order_total_amount`→`actualPrice`，`user_actual_pay_amount`→`realityPayMoney`，`total_duration` 分钟→`totalChargeDurations`，`merchant_actual_income`→`merchantReceiptTotal`
- Three：基于 `chargingStationStatisticsBySection` 同源；`SUM` 订单指标；`totalDevice` 为筛选范围内站点设备数合计（与现列表行 `totalDevice` 相加语义一致）
- Five：基于 `t_order_info`（`is_delete=0`，按 `end_time`）；`COUNT`→`totalChargeNumber`，`SUM(actual_duration)`→`totalChargeDurations`，`SUM(total_power)`→`totalPower`，并 `SUM(reality_pay_money)`→`realityPayMoney`

### 前端（charging-cloud-web）

| 文件 | 改动 |
|------|------|
| `src/api/business/businessStatistics.js` | 新增 3 个 summary 请求方法 |
| `businessStatisticsTwo.vue` | 调 summary；卡片改读统一字段；时长 `/60` 展示小时；保留商户实收 |
| `businessStatisticsThree.vue` | 调 summary；卡片改读统一字段 |
| `businessStatisticsFive.vue` | 调 summary；增加实收卡片；去掉页内累加；占桩费仍 0 |

移除（或停用）`updateSummaryTotalFromSectionList` / `updateSummaryTotalFromTrendList` 对卡片的赋值。

**错误处理：** summary 失败 toast；卡片数值置 `0`；不影响列表/曲线加载。

## Out of Scope

- Four / Six summary
- 占桩费真实统计
- 曲线图、明细分页、导出
- 列表行字段重命名
- 变更底层统计口径（订单状态过滤等）

## Testing

| # | 场景 | 期望 |
|---|------|------|
| T1 | 默认筛选查询 | 卡片 = 全量合计，与导出/全量列表相加一致（允许浮点误差） |
| T2 | 翻页 / 改 pageSize | 卡片数字不变 |
| T3 | 改时间/用户/站点后再查 | 卡片随新筛选更新 |
| T4 | 无数据 | 核心字段为 0 |
| T5 | Two 时长 | 接口为分钟；卡片显示小时（÷60） |
| T6 | Five 实收 | 卡片展示 `realityPayMoney`；占桩费仍为 0 |
| T7 | 数据权限 | 与对应列表可见范围一致 |
