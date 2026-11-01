# 站点财务日账单 Web 端展示设计

**Date:** 2026-06-09  
**Status:** Approved  
**Approach:** 方案 1 — 独立 Web 模块  
**Scope:** `charging-cloud`（后端 API）+ `charging-cloud-web`（管理端页面）

## Goal

在 Web 管理端展示 `t_statistics_station_finance_day_bill` 数据，供平台/租户/商户统一使用；UI 符合现有 SaaS 管理后台风格；数据权限由后端 `@DataScope` 处理，不同角色看到不同范围的数据。

## Background

| 能力 | 现状 |
|------|------|
| 数据源 | `t_statistics_station_finance_day_bill`，T+1 由 `syncStationFinanceDayBill` 同步 |
| uniapp | 收益中心 `GET /merchant/app/finance/bill`，按**日期**聚合（多站点合并） |
| Web | 无对应页面；财务模块已有分账台账、退款记录等 |

uniapp 接口限制租户/商户角色，且聚合粒度为日期维度，**不可直接复用**于 Web 平台管理场景。

## Requirements（已确认）

| # | 需求 |
|---|------|
| R1 | 受众：平台/租户/商户均可用，**同一套 UI**，不按角色分 Tab |
| R2 | 筛选：日期范围、商户、站点（均需支持）；另加业态、日/月账单粒度 |
| R3 | 列表粒度：一行 = **某商户 · 某站点 · 某统计日**（月账单则按 `yyyy-MM` 聚合，仍保留站点维度） |
| R4 | 页面结构：KPI 卡 + 趋势图 + 表格（对齐 uniapp 收益中心信息层级） |
| R5 | 详情：右侧抽屉，分组展示出账收入 / 支出项目 / 结算金额 |
| R6 | 导出：导出当前筛选结果 Excel，列与表格一致 |
| R7 | 数据权限：`@DataScope` 按角色过滤，前端不做 ID 白名单拼接 |

## Architecture

### 模块边界

```
┌─────────────────────────────────────────────────────────┐
│  charging-cloud-web                                      │
│  stationFinanceDayBill/index.vue                         │
│    ├─ 筛选 / KPI / 图表 / 表格 / 抽屉 / 导出             │
│    └─ api/finance/stationFinanceDayBill.js               │
└───────────────────────┬─────────────────────────────────┘
                        │ POST /stationFinanceDayBill/*
┌───────────────────────▼─────────────────────────────────┐
│  charging-cloud (sharecharge-web-controller)             │
│  StationFinanceDayBillController                         │
│    └─ StationFinanceDayBillQueryService                  │
│         └─ StationFinanceDayBillQueryMapper.xml          │
│              └─ t_statistics_station_finance_day_bill s  │
│                   JOIN t_user_merchant / t_network_dot   │
└─────────────────────────────────────────────────────────┘
```

不复用 `MerchantAppController` / `MerchantAppFinanceQueryService`。

### 菜单位置

- 路径：`财务管理` → `站点财务日账单`
- 路由：`/finance/stationFinanceDayBill`
- 与「分账台账」并列，不嵌入台账页

## API Design

### Endpoints

| 路径 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/stationFinanceDayBill/summary` | POST | `:web:stationFinanceDayBill:page` | KPI 四项 + 趋势点列表 |
| `/stationFinanceDayBill/page` | POST | `:web:stationFinanceDayBill:page` | 分页列表 |
| `/stationFinanceDayBill/export` | POST | `:web:stationFinanceDayBill:export` | 异步导出 Excel |

### Request：`StationFinanceDayBillPagination`

```java
String startDate;          // yyyy-MM-dd，必填
String endDate;            // yyyy-MM-dd，必填，≤ 昨日
Integer merchantId;        // 可选
List<Integer> stationIds;  // 可选，多选
Integer ruleId;            // 可选，1=单车桩 2=汽车桩
String billType;           // day | month，默认 day
int page;
int limit;
```

### Response：`StationFinanceDayBillSummaryVo`

```java
BigDecimal settledTotalAmount;    // SUM(merchant_settle_amount)
BigDecimal orderTotalAmount;      // SUM(order_total_amount)
Integer billedOrderCount;         // SUM(billed_order_count)
BigDecimal billedTotalDegree;     // SUM(billed_total_degree)
List<TrendPoint> trendPoints;     // [{ summaryDate, income }]
String statHint;                  // "数据统计截止到昨日"
String statTime;
```

### Response：`StationFinanceDayBillLineVo`

在 `MerchantAppFinanceBillLineVo` 基础上增加：

```java
Integer stationId;
String stationName;      // t_network_dot.network_name
Integer merchantId;
String merchantName;     // t_user_merchant.name
Integer ruleId;
```

金额字段与 uniapp 一致，列表行包含抽屉所需的全部明细字段，**无需独立详情接口**。

### DataScope

```java
@DataScope(alias = "s",
    merchantColumn = true,
    stationColumn = true,
    stationIdRef = StationIdRef.STATION_ID,
    tenantColumn = true,
    adminColumn = false)
```

| 角色 | 过滤 |
|------|------|
| 平台 (PLATFORM) | 不过滤 |
| 租户 (TENANT) | `tenant_id IN (...)` |
| 商户 (MERCHANT) | `merchant_id IN (...)` |
| 站点 (STATION) | `station_id IN (...)` |

### SQL 聚合

**日账单：**

```sql
GROUP BY s.station_id, s.summary_date
ORDER BY s.summary_date DESC, s.station_id DESC
```

**月账单：**

```sql
GROUP BY s.station_id, DATE_FORMAT(s.summary_date, '%Y-%m')
```

JOIN：

```sql
FROM t_statistics_station_finance_day_bill s
LEFT JOIN t_user_merchant tum ON tum.id = s.merchant_id
LEFT JOIN t_network_dot tnd ON tnd.id = s.station_id
```

金额字段均 `SUM()`，口径对齐 `MerchantAppQueryMapper.listFinanceBillLines`。

### 日期约束

- `endDate` ≤ 昨日（前后端双重校验）
- `startDate` ≥ 2024-09-01
- `startDate` ≤ `endDate`

## Frontend Design

### 页面结构

```
el-alert（口径说明）
filter-container（日期 | 商户 | 站点 | 业态 | 日/月 | 查询 | 导出）
KPI 卡 × 4
趋势折线图（ECharts，复用 LineChart / ChargingTrendLineChart 模式）
el-table + pagination
el-drawer（详情，size="60%", direction="rtl"）
downloadProgress（异步导出进度）
```

### 筛选默认值

- 日期：近 30 天（结束日 = 昨日）
- 商户/站点/业态：空 = 权限范围内全部
- 账单粒度：日账单

### KPI 卡

| 标题 | 字段 |
|------|------|
| 结算金额 | `settledTotalAmount` |
| 出账合计 | `orderTotalAmount` |
| 出账笔数 | `billedOrderCount` |
| 出账电量 | `billedTotalDegree` |

### 表格列

| 列 | 字段 |
|----|------|
| 统计日 | `summaryDate` |
| 商户 | `merchantName` |
| 站点 | `stationName` |
| 业态 | `ruleId` |
| 出账笔数 | `billedOrderCount` |
| 出账电量 | `billedTotalDegree` |
| 出账电费 | `electricityAmount` |
| 出账服务费 | `serviceAmount` |
| 出账合计 | `orderTotalAmount` |
| 结算金额 | `merchantSettleAmount`（即 `settledTotalAmount` 行级） |
| 操作 | 详情 |

### 抽屉分组

**头部：** 统计日 · 商户 · 站点 · 业态

**出账收入：**

- 出账电费、出账服务费、出账合计
- 用户实付、订单原价电费、订单原价服务费
- 出账笔数、出账电量、已结算笔数

**支出项目：**

- 平台抽成、主商户通道费、三方通道费
- 三方分账
- 主商户/三方/平台退款调减

**结算金额：**

- `merchantSettleAmount` + 温馨提示文案（与 uniapp 一致）

### UI 参考

| 元素 | 参考文件 |
|------|----------|
| 筛选 + alert | `settlementLedger/index.vue` |
| KPI 卡 | `businessStatistics.vue` |
| 趋势图 | `ChargingTrendLineChart.vue` |
| 抽屉 | `chargingCustomer/index.vue` |
| 导出 | `refundRecord.vue` + `downloadProgress` |

## Export

- 权限：`:web:stationFinanceDayBill:export`
- 模式：异步 Task（对齐 `SettlementLedgerAdminServiceImpl.exportLinePage`）
- 列：与表格列一致
- 上限：单次最多 50,000 行，超出返回错误提示缩小范围
- 前端：`downloadProgress` 轮询任务进度

## Permissions（需入库）

| 权限标识 | 说明 |
|----------|------|
| `:web:stationFinanceDayBill:page` | 查询 / 汇总 / 列表 |
| `:web:stationFinanceDayBill:export` | 导出 |

菜单权限绑定 `page`；导出按钮单独校验 `export`。

## Error Handling

| 场景 | 处理 |
|------|------|
| 日期非法 | 返回 `ResultUtil.error` + 前端 message |
| 无数据 | KPI 归零，图表 empty，表格空态 |
| 导出超限 | 提示缩小日期或增加筛选 |
| 无权限 | 菜单/按钮不可见；接口 403 |

## Out of Scope

- 不复用或修改 uniapp 收益中心接口
- 不提供写操作（同步 Job 已有）
- 首期不做三方分账明细下钻（uniapp 有独立接口，Web 可二期加）
- 不嵌入分账台账页

## Test Plan

| # | 用例 |
|---|------|
| T1 | 平台角色：可选任意商户/站点，可见全量 |
| T2 | 商户角色：仅见本商户站点数据 |
| T3 | 站点角色：仅见授权站点 |
| T4 | 日/月切换：月账单按站点+月聚合 |
| T5 | 结束日 > 昨日：前后端均拦截 |
| T6 | 抽屉字段与列表行一致，金额格式 2/4 位小数 |
| T7 | 导出列与表格一致，异步任务可下载 |
| T8 | KPI + 趋势与列表同筛选条件口径一致 |

## File Manifest

### charging-cloud

| 操作 | 路径 |
|------|------|
| Create | `sharecharge-web-controller/.../StationFinanceDayBillController.java` |
| Create | `sharecharge-biz/.../service/StationFinanceDayBillQueryService.java` |
| Create | `sharecharge-biz/.../service/impl/StationFinanceDayBillQueryServiceImpl.java` |
| Create | `sharecharge-biz/.../entity/model/StationFinanceDayBillPagination.java` |
| Create | `sharecharge-biz/.../vo/StationFinanceDayBillLineVo.java` |
| Create | `sharecharge-biz/.../vo/StationFinanceDayBillSummaryVo.java` |
| Create | `sharecharge-biz/.../mapper/StationFinanceDayBillQueryMapper.java` |
| Create | `sharecharge-biz/.../mapper/StationFinanceDayBillQueryMapper.xml` |
| Modify | `sharecharge-biz/.../service/AsyncService` + impl（导出任务） |

### charging-cloud-web

| 操作 | 路径 |
|------|------|
| Create | `src/views/finance/stationFinanceDayBill/index.vue` |
| Create | `src/api/finance/stationFinanceDayBill.js` |
| Modify | `src/router/index.js` |
