# 运营商工作台设计

**Date:** 2026-10-26  
**Status:** Approved  
**Approach:** 方案 B — Web 新建独立「运营商工作台」页  
**Scope:** `charging-cloud`（预统计表 + Job + 聚合 API）+ `charging-cloud-web`（工作台页面）  
**Audience:** 一线运营与财务/管理员共用一页，区块按权限显隐

## Goal

在现有「量类报表」（首页、经营/趋势六页、站点财务日账单、台账分账、故障监控、大屏）之上，提供一张**可行动的经营总览**：看得见今日经营、该处理的异常站、钱的结构、营销粗效果，并一键下钻到现有明细页。新产生的工作台衍生指标**落日统计表**，支持历史查询且对查询友好。

## Background

| 能力 | 现状 |
|------|------|
| 首页 / 六页趋势 / 大屏 | 成熟；偏展示与导出，非「今日该干什么」 |
| 站点财务日账单 / 台账 | 成熟；财务深挖在子页，总览入口弱 |
| 故障监控 | 有 `t_statistics_station_fault_order_day` |
| 营销 | 活动/卡券/补款台账有；无效果看板 |
| 功能清单愿景 | RFM、预测、零收入预警等多数未落地 |

商户痛点不在「再多一张总表」，而在预警、收益拆解、营销值不值。

## Requirements（已确认）

| # | 需求 |
|---|------|
| R1 | 独立菜单「运营商工作台」，不替换首页/大屏职责 |
| R2 | 四区块：今日经营、该处理、钱从哪来、营销值不值；只读数 + Top 预警 + 跳转 |
| R3 | 运营与财务共用一页；无权限则整块不渲染 |
| R4 | 有营销权限但无活动/时段无发券：**仍展示区块，指标为 0** |
| R5 | 筛选：时间（今日/本周/本月）、商户与电站（随 `@DataScope`） |
| R6 | 实收等核心口径与首页/经营报表/日账单对齐，禁止两套「实收」 |
| R7 | 工作台新增衍生统计**存表**（日粒度），T+1 Job 回填，可按日重跑；历史只查表 |
| R8 | 财务块 V1 复用已有日账单与台账/结算 snapshot，不新建财务表 |
| R9 | V1 不做自定义看板、严格增量归因、预测、RFM 全量 |

## Information Architecture

```
运营商工作台
├─ 筛选：时段 | 商户 | 电站（多选）
├─ 今日经营     [operatorWorkbench:view]
├─ 该处理       [operatorWorkbench:alerts]
├─ 钱从哪来     [operatorWorkbench:finance]
└─ 营销值不值   [operatorWorkbench:marketing]
```

| 区块 | 内容 | 下钻 |
|------|------|------|
| 今日经营 | 实收、电量、订单、环比；费用结构迷你条 | 经营报表、充电趋势 |
| 该处理 | 零收入 / 收入骤降 / 故障高发 / 启动失败偏高（Top N） | 电站监控、故障监控、站点 |
| 钱从哪来 | 应收/实收/已结算/待提现；昨日日账单摘要 | 站点财务日账单、台账与分账 |
| 营销值不值 | 进行中活动、发券/核销、优惠成本、粗 ROI | 营销中心、补款台账 |

时段为「今日」时：财务块以**昨日已关账日账单**为主，并提示「今日实时见上方经营」。页面展示 `dataAsOf`。

## Metrics & Data Sources

### 今日经营

| 指标 | 口径 | 数据源 |
|------|------|--------|
| 实收 / 电量 / 订单 | 与首页、经营报表一致 | 优先工作台日表汇总；字段可对齐充电日账单 |
| 环比 | 同等时段对比 | 日表计算 |
| 费用结构 | 电费、服务费、优惠；占桩费 V1 不准则隐藏或标「试算」 | 日表 / 日账单字段 |

### 该处理（V1 规则写死，阈值可后续配置）

| 预警 | 默认规则 | 数据源 |
|------|----------|--------|
| 零收入站 | 营业日实收=0 且站正常/有枪在线 | `t_statistics_station_workbench_day` + 设备状态 |
| 收入骤降 | 较近 7 日均值下降 ≥50%，且基线 ≥ 门槛 | 工作台日表衍生字段 |
| 故障高发 | 当日新建工单 ≥ N 或环比升高 | `t_statistics_station_fault_order_day` |
| 启动失败偏高 | 启动成功率 < 阈值 | 故障监控 KPI 同源 |

列表：站点、类型、关键指标、环比、跳转；默认 Top 20，按严重度排序。

### 钱从哪来

| 指标 | 口径 | 数据源 |
|------|------|--------|
| 应收 / 实收 | 与站点财务日账单一致 | `t_statistics_station_finance_day_bill` |
| 已结算 / 待提现 | 与现有台账/提现语义一致，不新造词 | SettlementLedger / settlement snapshot |
| 昨日摘要 | 昨日实收、订单、电量 | 日账单 summary |

### 营销值不值

| 指标 | 口径 | 数据源 |
|------|------|--------|
| 进行中活动数 | 状态=进行中；无则 **0** | 营销活动表 + 日表缓存字段 |
| 发券 / 核销 / 核销率 | 筛选时段内；无则 **0** | `t_statistics_merchant_marketing_day` |
| 优惠成本 | 订单优惠 + 补贴分项展示 | 同上 + subsidy（展示层可补） |
| 粗 ROI | 核销订单实收 / 优惠成本；UI 标明「非严格增量」 | 营销日表 |

无 `operatorWorkbench:marketing` → 整块不渲染。有权限无数据 → 展示 0。

## Persistence（新统计落表）

对齐现有 `t_statistics_*`：XXL-JOB 按日 `DELETE WHERE stat_date=?` + batch insert。

### 新建表（V1）

**`t_statistics_station_workbench_day`**（商户 + 站点 + 日）

用途：经营摘要、费用结构摘要、零收入标记、相对 7 日均值降幅等「该处理」衍生字段。能从 `t_statistics_station_charge_day_bill` / finance day bill 直接得到的字段，以对齐复制或同步任务内计算写入，**工作台查询以本表为主**，避免运行时重算骤降。

建议字段（实现计划可细化 DDL）：

- 维度：`stat_date`, `station_id`, `merchant_id`, `tenant_id`
- 经营：`order_count`, `charge_kwh`, `actual_income`, `electric_fee`, `service_fee`, `discount_amount`（占桩费可选）
- 衍生：`is_zero_income`, `income_vs_7d_avg_ratio`, `alert_drop_flag`
- 唯一键：`(stat_date, station_id)`

**`t_statistics_merchant_marketing_day`**（商户 + 日）

- 维度：`stat_date`, `merchant_id`, `tenant_id`
- 指标：`active_activity_count`（统计日日末「进行中」活动数快照）, `issue_count`, `redeem_count`, `discount_cost`, `redeem_order_actual_income`, `subsidy_cost`（可选）
- 唯一键：`(stat_date, merchant_id)`

### 复用、不新建

- 财务：`t_statistics_station_finance_day_bill`、台账/settlement snapshot  
- 故障：`t_statistics_station_fault_order_day`

### Job

- 每日 T+1 回填昨日；支持指定日期重跑  
- 与现有日统计同窗或紧随其后，保证依赖表先写完  
- 「今日」：近实时或当日粗算；**昨日及更早只读统计表**

## API

分块接口，按权限懒加载；一块失败不影响其它块。统一 `@DataScope`。

| 路径（建议） | 权限 | 说明 |
|--------------|------|------|
| `POST /api/web/operatorWorkbench/overview` | `:view` | 今日经营 + dataAsOf |
| `POST /api/web/operatorWorkbench/alerts` | `:alerts` | 预警 Top N |
| `POST /api/web/operatorWorkbench/finance` | `:finance` | 财务摘要 |
| `POST /api/web/operatorWorkbench/marketing` | `:marketing` | 营销摘要（无数据返回全 0） |

前端：`src/views/operatorWorkbench/`（或 `business/operatorWorkbench`）+ `src/api/...`；路由注册于 business/ops 模块；菜单后端 RBAC 配置。

## Permissions

| 权限码 | 控制 |
|--------|------|
| `operatorWorkbench:view` | 进页 + 今日经营 |
| `operatorWorkbench:alerts` | 该处理 |
| `operatorWorkbench:finance` | 钱从哪来 |
| `operatorWorkbench:marketing` | 营销值不值 |

建议角色：一线运营 = view + alerts；财务 = view + finance；负责人/老板 = 全开。

## Phasing

### V1

- 四区块 UI + 分块 API + 两张日表 + 同步 Job  
- 预警：零收入、骤降、故障高发（启动失败有 KPI 则带上）  
- 财务复用日账单；营销粗 ROI + 0 值空态  
- 筛选今日/本周/本月；展示 dataAsOf  

### V2

- 预警阈值可配置；占桩费纳入；预警已读/忽略  
- 与小程序工作台口径对齐（同表或同 API）  
- 可选：登录落地页配置  

### V3（明确不做进 V1）

- 自定义看板、严格增量归因、预测、完整 RFM  

## Non-functional

- 有权限块首屏目标 ≤ 2s（读预聚合）  
- 口径变更与首页/日账单同步发布  
- 单块超时/失败 → 该块空态 + 重试，其它块可用  

## Acceptance（V1）

1. 仅 view：只见今日经营  
2. 零收入站出现在预警且可跳转  
3. 财务数字与昨日日账单 summary 一致  
4. 无营销权限：营销块不出现；有权限无活动/无发券：营销块展示且指标为 0  
5. 某一 API 失败：其它块仍可用  
6. 重跑某日 Job 后，该日工作台/营销日表可重复查询且结果稳定  
7. 本周/本月筛选结果等于对应日表汇总  

## Out of Scope（V1）

- 替换或大改现有六页趋势与大屏  
- 工作台内复杂图表编辑、导出中心新任务类型（可沿用现有下钻页导出）  
- 严格营销增量因果模型  
