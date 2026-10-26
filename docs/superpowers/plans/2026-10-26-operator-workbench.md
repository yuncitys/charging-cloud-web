# 运营商工作台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 落地 Web「运营商工作台」：预统计落表 + Job + 分块 API + 四区块页面（经营 / 预警 / 财务 / 营销），只读下钻到现有报表。

**Architecture:** T+1（及日内）Job 写入 `t_statistics_station_workbench_day`、`t_statistics_merchant_marketing_day`；查询只读预聚合 + 复用财务日账单 / 故障日表 / settlement snapshot；前端按权限懒加载四块 API。

**Tech Stack:** Java Spring Boot, MyBatis, Sa-Token `@DataScope` / `@SaCheckPermission`, XXL-JOB via `TaskService`, Vue 2 + Element UI

**Spec:** `docs/superpowers/specs/2026-10-26-operator-workbench-design.md`

**Branches:**
- Web: `charging-cloud-web` → `feature/operator-workbench-web`
- Backend: `charging-cloud` → `feature/operator-workbench`

## Global Constraints

- 实收口径与站点充电日账单 `merchant_actual_income` / 首页经营报表一致；财务块应收实收与 `t_statistics_station_finance_day_bill` 一致
- 权限码使用项目惯例前缀：`:web:operatorWorkbench:view|alerts|finance|marketing`（对应 spec 四码）
- 有营销权限无活动/无发券：接口返回全 0，前端仍渲染区块
- 昨日及更早只查统计表；今日允许读当日已同步的日表行（依赖日内 Job）
- V1 不做自定义看板、严格增量归因、预测、RFM、占桩费真实统计
- 禁止 `git push codeup-cld`

---

## File Map

| 文件 | 职责 |
|------|------|
| `charging-cloud/docs/sql/t_statistics_station_workbench_day_20261026.sql` | 工作台站点日表 DDL |
| `charging-cloud/docs/sql/t_statistics_merchant_marketing_day_20261026.sql` | 营销日表 DDL |
| `charging-cloud/docs/sql/t_menu_operator_workbench_20261026.sql` | 菜单与按钮权限 |
| `StatisticsStationWorkbenchDay.java` + Mapper/XML | 实体与同步/查询 SQL |
| `StatisticsMerchantMarketingDay.java` + Mapper/XML | 营销日实体与 SQL |
| `WorkbenchDayStatSyncService(.java\|Impl)` | 从充电日账单聚合 + 衍生预警字段 |
| `MarketingDayStatSyncService(.java\|Impl)` | 发券/核销/优惠/活动快照 |
| `MerchantAppStatisticsApi` + InternalController | Job 可调 sync 接口 |
| `TaskService` | 挂载日批与日内、backfill |
| `OperatorWorkbench*Pagination/Vo` | 查询入参与出参 |
| `OperatorWorkbenchQueryService(.java\|Impl)` | overview/alerts/finance/marketing |
| `OperatorWorkbenchController.java` | 四个 POST 端点 |
| `charging-cloud-web/src/api/business/operatorWorkbench.js` | 前端 API |
| `charging-cloud-web/src/views/business/operatorWorkbench/index.vue` | 工作台页 |
| `charging-cloud-web/src/router/modules/business.js` | 路由 |

---

### Task 1: DDL — 工作台站点日表

**Files:**
- Create: `charging-cloud/docs/sql/t_statistics_station_workbench_day_20261026.sql`

**Interfaces:**
- Produces: 表 `t_statistics_station_workbench_day`，唯一键 `(stat_date, station_id)`

- [ ] **Step 1: 编写 DDL**

```sql
-- 运营商工作台 · 站点日统计（经营摘要 + 预警衍生）
-- 同步：T+1 / 日内；依赖 t_statistics_station_charge_day_bill 先写完
-- 幂等：CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS `t_statistics_station_workbench_day` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `stat_date` date NOT NULL COMMENT '统计日',
  `station_id` int(11) NOT NULL COMMENT 't_network_dot.id',
  `merchant_id` int(11) NOT NULL COMMENT '商户ID',
  `tenant_id` varchar(32) DEFAULT NULL,
  `order_count` int(11) NOT NULL DEFAULT 0,
  `charge_kwh` decimal(14,4) NOT NULL DEFAULT 0 COMMENT '对齐 charge_day_bill.total_degree',
  `actual_income` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '对齐 merchant_actual_income',
  `electric_fee` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '对齐 total_standard_charge_fee 汇总',
  `service_fee` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '对齐 total_standard_service_fee 汇总',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '优惠合计(活动+卡券电费服务费抵扣)',
  `is_zero_income` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=当日实收为0',
  `income_vs_7d_avg_ratio` decimal(8,4) DEFAULT NULL COMMENT '当日实收/近7日均值；无基线则 NULL',
  `alert_drop_flag` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=骤降预警',
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_station` (`stat_date`, `station_id`),
  KEY `idx_merchant_date` (`merchant_id`, `stat_date`),
  KEY `idx_date_drop` (`stat_date`, `alert_drop_flag`),
  KEY `idx_date_zero` (`stat_date`, `is_zero_income`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营商工作台站点日统计';
```

- [ ] **Step 2: 在开发库执行 DDL，确认 `SHOW CREATE TABLE` 成功**

- [ ] **Step 3: Commit（backend 仓库）**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add docs/sql/t_statistics_station_workbench_day_20261026.sql
git commit -m "$(cat <<'EOF'
docs(sql): add station workbench day statistics table

EOF
)"
```

---

### Task 2: DDL — 营销日表

**Files:**
- Create: `charging-cloud/docs/sql/t_statistics_merchant_marketing_day_20261026.sql`

**Interfaces:**
- Produces: 表 `t_statistics_merchant_marketing_day`，唯一键 `(stat_date, merchant_id)`

- [ ] **Step 1: 编写 DDL**

```sql
CREATE TABLE IF NOT EXISTS `t_statistics_merchant_marketing_day` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `stat_date` date NOT NULL,
  `merchant_id` int(11) NOT NULL,
  `tenant_id` varchar(32) DEFAULT NULL,
  `active_activity_count` int(11) NOT NULL DEFAULT 0 COMMENT '日末进行中活动数快照',
  `issue_count` int(11) NOT NULL DEFAULT 0 COMMENT '当日发放用户券数',
  `redeem_count` int(11) NOT NULL DEFAULT 0 COMMENT '当日核销次数',
  `discount_cost` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '订单优惠成本',
  `redeem_order_actual_income` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '核销相关订单实收代理',
  `subsidy_cost` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '当日补贴台账支出，可选',
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_merchant` (`stat_date`, `merchant_id`),
  KEY `idx_tenant_date` (`tenant_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营商工作台营销日统计';
```

- [ ] **Step 2: 开发库执行并验证**

- [ ] **Step 3: Commit**

```bash
git add docs/sql/t_statistics_merchant_marketing_day_20261026.sql
git commit -m "$(cat <<'EOF'
docs(sql): add merchant marketing day statistics table

EOF
)"
```

---

### Task 3: 工作台日表 Entity + Mapper

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/entity/StatisticsStationWorkbenchDay.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/mapper/StatisticsStationWorkbenchDayMapper.java`
- Create: `charging-cloud/sharecharge-biz/src/main/resources/mapper/StatisticsStationWorkbenchDayMapper.xml`

**Interfaces:**
- Produces:
  - `void deleteByDate(String statDate)`
  - `int insertBatch(@Param("list") List<StatisticsStationWorkbenchDay> list)`
  - `List<StatisticsStationWorkbenchDay> aggregateFromChargeDayBill(@Param("statDate") String statDate)` — 按 station 汇总 rule 维度
  - `List<StationIncomeAvg>` `selectAvgIncomePrev7Days(@Param("statDate") String statDate)` — 前 7 日（不含当日）按 station 的 AVG(actual_income)
  - 查询用：`sumOverview` / `listZeroIncome` / `listDropAlerts`（可在 Task 6 补全，本任务至少同步所需方法）

- [ ] **Step 1: Entity 字段与表列一一对应**（`@TableName("t_statistics_station_workbench_day")`）

- [ ] **Step 2: `aggregateFromChargeDayBill` SQL**

从 `t_statistics_station_charge_day_bill` 按 `summary_date = #{statDate}`、`station_id` 分组：

| 目标列 | 源 |
|--------|-----|
| `order_count` | `SUM(total_order_count)` |
| `charge_kwh` | `SUM(total_degree)` |
| `actual_income` | `SUM(merchant_actual_income)` |
| `electric_fee` | `SUM(total_standard_charge_fee)` |
| `service_fee` | `SUM(total_standard_service_fee)` |
| `discount_amount` | `SUM(merchant_charge_discount_amount + merchant_service_discount_amount + merchant_card_charge_discount_amount + merchant_card_service_discount_amount)` |
| `merchant_id` / `tenant_id` | `MAX(...)` 或取任意非空 |

- [ ] **Step 3: `deleteByDate` + `insertBatch`（batch 500）**，对齐 `StatisticsStationFaultOrderDayMapper`

- [ ] **Step 4: Commit**

```bash
git add sharecharge-biz/src/main/java/com/sharecharge/biz/entity/StatisticsStationWorkbenchDay.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/mapper/StatisticsStationWorkbenchDayMapper.java \
  sharecharge-biz/src/main/resources/mapper/StatisticsStationWorkbenchDayMapper.xml
git commit -m "$(cat <<'EOF'
feat(biz): add workbench day entity and mapper

EOF
)"
```

---

### Task 4: WorkbenchDayStatSyncService + 单测

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/WorkbenchDayStatSyncService.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/WorkbenchDayStatSyncServiceImpl.java`
- Create: `charging-cloud/sharecharge-biz/src/test/java/com/sharecharge/biz/service/WorkbenchDayStatSyncServiceTest.java`

**Interfaces:**
- Produces: `ResultUtil syncDate(String statDate)`
- Constants (V1 写死):
  - `DROP_RATIO_THRESHOLD = 0.50`（当日/7日均值 ≤ 0.5 触发）
  - `DROP_BASELINE_MIN = 100.00`（7 日均值 ≥ 100 才预警，避免小站误报）

**Consumes:** Task 3 Mapper

- [ ] **Step 1: 写失败单测**（mock mapper）

```java
@Test
public void syncDate_setsZeroAndDropFlags() {
    // charge 聚合返回站1 income=0；站2 income=40；7日均值站2=200
    // 期望：站1 is_zero_income=1；站2 alert_drop_flag=1, ratio=0.2
}
```

- [ ] **Step 2: 跑测确认失败（类不存在）**

```bash
cd sharecharge-biz && mvn -Dtest=WorkbenchDayStatSyncServiceTest test
```

Expected: 编译失败或测试失败

- [ ] **Step 3: 实现 `syncDate`**

1. 校验 `statDate` 为 `yyyy-MM-dd`
2. `rows = aggregateFromChargeDayBill(statDate)`
3. 加载前 7 日均值 map
4. 对每行：`is_zero_income = actual_income == 0`；算 `income_vs_7d_avg_ratio`；`alert_drop_flag = avg != null && avg >= 100 && ratio != null && ratio <= 0.5`
5. `deleteByDate` + `insertBatch`
6. 返回 `ResultUtil.success()`，日志含 rows/cost

对齐 `FaultOrderDayStatSyncServiceImpl` 的事务与 batch 写法。无站点无充电日账单行时：允许 0 行删除后插入空（不强制补全所有站，零收入预警仅针对「当日有 charge 日账单行且实收为 0」的站；若产品要坚持「营业站无账单也算零收入」，在实现时用 `listStatStations` 补 0 行——**V1 采用：仅有 charge_day_bill 行的站**，与聚合源一致，在类注释写明）。

- [ ] **Step 4: 单测通过**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): sync workbench day stats with drop and zero flags

EOF
)"
```

---

### Task 5: 营销日表 Entity + Mapper + SyncService

**Files:**
- Create: `StatisticsMerchantMarketingDay.java` / Mapper / XML（路径同 Task 3 包结构）
- Create: `MarketingDayStatSyncService.java` + `MarketingDayStatSyncServiceImpl.java`
- Create: `MarketingDayStatSyncServiceTest.java`

**Interfaces:**
- Produces: `ResultUtil syncDate(String statDate)`
- Mapper 聚合建议：
  - `issue_count`: `t_marketing_user_card_coupon` 按 `DATE(issue_time)=statDate`、`is_delete=0`，按商户（`admin_id` 或活动/券上的商户字段——**实现时对照卡券表与活动表的商户归属列**；若券表无 `merchant_id`，经 `activity_id` join `t_marketing_card_coupon_activity` / 定向活动等取商户；多活动类型时 V1 以卡券活动发券为主，注释标明范围）
  - `redeem_count`: `t_marketing_user_card_coupon_use_record` 按使用日归天
  - `discount_cost` / `redeem_order_actual_income`: 优先从订单优惠字段按结束日归天且存在券核销关联；若关联复杂，V1 可用「当日用户实付优惠差额」代理并在方法注释标明
  - `active_activity_count`: 日末仍进行中的活动数（卡券活动 + 站点折扣等 **status=进行中** 且时间覆盖 `statDate` 的 COUNT）；按商户分组
  - `subsidy_cost`: `t_marketing_subsidy_ledger` 当日支出 SUM，无则 0

- [ ] **Step 1: 写单测** — mock 聚合结果写入后验证 `delete + insertBatch` 调用

- [ ] **Step 2: 实现 DDL 对应 Entity/Mapper/Sync**（无商户有数据时跳过或写 0 行均可；查询层对缺失商户返回 0）

- [ ] **Step 3: `mvn -Dtest=MarketingDayStatSyncServiceTest test` 通过**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): sync merchant marketing day statistics

EOF
)"
```

---

### Task 6: Job 暴露与调度挂载

**Files:**
- Modify: `charging-cloud/sharecharge-web/sharecharge-web-api/.../MerchantAppStatisticsApi.java`
- Modify: Internal controller 实现类（与现有 `syncFaultOrderDay` 同文件）
- Modify: `charging-cloud/sharecharge-job/.../TaskService.java`
- Modify/Create: `TaskService` 相关测试（参考 `TaskServiceFaultOrderDayTest`）

**Interfaces:**
- Produces API:
  - `POST syncWorkbenchDay?statDate=`
  - `POST syncMarketingDay?statDate=`
- `TaskService.syncMerchantChargeDayBill`：在 `syncStationFinanceDayBill` **之后** quietly 调二者（昨日）
- `TaskService.syncMerchantAppIntraday`：在站点日账单同步后 quietly 调二者（今日）
- `TaskService.backfillWorkbenchDay(String params)`：`"start,end"`，逐日或按 range 循环，最多 93 天

- [ ] **Step 1: 增加 Feign/API 方法与 Controller 委托 SyncService**

- [ ] **Step 2: TaskService 挂载 + quietly 包装（失败只打日志）**

- [ ] **Step 3: 单测验证调用顺序**（finance day bill 之后调 workbench/marketing）

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(job): schedule workbench and marketing day sync

EOF
)"
```

---

### Task 7: 查询模型 VO + QueryService — overview / alerts

**Files:**
- Create: `OperatorWorkbenchQuery.java`（或 Pagination）：`periodType`(`TODAY|WEEK|MONTH`)、`merchantId`、`List<Integer> stationIds`、`statDate` 可选
- Create: `OperatorWorkbenchOverviewVo`：`actualIncome`, `chargeKwh`, `orderCount`, `incomeWow`（环比）, `electricFee`, `serviceFee`, `discountAmount`, `dataAsOf`, `periodStart`, `periodEnd`
- Create: `OperatorWorkbenchAlertVo`：`stationId`, `stationName`, `alertType`(`ZERO_INCOME|INCOME_DROP|FAULT_HIGH|START_FAIL`), `metricValue`, `compareValue`, `severity`
- Create: `OperatorWorkbenchQueryService` + Impl
- Create: Mapper 查询方法（可放 `OperatorWorkbenchQueryMapper`）
- Test: overview 日期解析 + alerts Top20 排序

**Interfaces:**
- Produces:
  - `ResultUtil overview(OperatorWorkbenchQuery q)`
  - `ResultUtil alerts(OperatorWorkbenchQuery q)` — 默认 limit 20
- 日期：`TODAY` → 当天；`WEEK` → 本周一至今天（或至昨日若只要闭账，**V1：含今天已同步数据**）；`MONTH` 同理
- 环比：对比上一同等长度时段的 `SUM(actual_income)`
- alerts：
  - ZERO：`is_zero_income=1` 且 `stat_date` 在筛选末日（今日用今日）
  - DROP：`alert_drop_flag=1`
  - FAULT_HIGH：读 `t_statistics_station_fault_order_day`，新建工单数字段若在故障表不存在则 join 工单日汇总或复用 FaultMonitor KPI 同源 SQL；V1 阈值 `new_order_count >= 3`（实现时字段名对齐故障监控）
  - START_FAIL：启动成功率 `< 0.90`（有现成 KPI SQL 则复用）
  - 严重度排序：START_FAIL > FAULT_HIGH > INCOME_DROP > ZERO_INCOME，同级按 metric 降序

- [ ] **Step 1: 实现日期工具 `resolvePeriod(periodType)` → start/end**

- [ ] **Step 2: overview SQL SUM + 环比二次查询**

- [ ] **Step 3: alerts 合并四类，截断 20**

- [ ] **Step 4: 单测 mock mapper**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): query workbench overview and alerts

EOF
)"
```

---

### Task 8: QueryService — finance / marketing

**Files:**
- Create: `OperatorWorkbenchFinanceVo`：`receivable`, `actualReceived`, `settledAmount`, `pendingSettlementAmount`, `yesterdayIncome`, `yesterdayOrders`, `yesterdayKwh`, `hint`（今日时段提示文案）, `dataAsOf`
- Create: `OperatorWorkbenchMarketingVo`：`activeActivityCount`, `issueCount`, `redeemCount`, `redeemRate`, `discountCost`, `redeemOrderActualIncome`, `subsidyCost`, `roughRoi`, `roiNote`（固定：「非严格增量」）
- Modify: `OperatorWorkbenchQueryService` 增加 `finance` / `marketing`

**Interfaces:**
- finance：
  - 应收/实收：对 `t_statistics_station_finance_day_bill` 在**昨日**（若 period=TODAY）或 period 范围内 SUM；字段对齐日账单页（`order_list_amount` 或账单原价作应收，`user_actual_pay_amount` / `merchant_settle_amount` 作实收——**与 StationFinanceDayBill summary 同一组字段**，实现时打开现有 summary SQL 复制）
  - `settledAmount` / `pendingSettlementAmount`：从 `t_statistics_merchant_settlement_snapshot` 按商户取最新快照（多商户则 SUM）；无站点筛选时用商户快照；有站点筛选时 pending/settled 若无法拆站则返回商户级并在 `hint` 说明
- marketing：
  - SUM `t_statistics_merchant_marketing_day` 区间；无行 → 全 0
  - `redeemRate = issue==0 ? 0 : redeem/issue`
  - `roughRoi = discount_cost==0 ? null : redeem_order_actual_income/discount_cost`

- [ ] **Step 1: 对照 `StationFinanceDayBillQueryMapper` summary 复制口径**

- [ ] **Step 2: 实现 finance/marketing + 单测（无营销行返回 0）**

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): query workbench finance and marketing blocks

EOF
)"
```

---

### Task 9: Controller + 菜单权限 SQL

**Files:**
- Create: `charging-cloud/sharecharge-web/sharecharge-web-controller/.../OperatorWorkbenchController.java`
- Create: `charging-cloud/docs/sql/t_menu_operator_workbench_20261026.sql`

**Interfaces:**
- `POST /operatorWorkbench/overview` → `@SaCheckPermission(":web:operatorWorkbench:view")`
- `POST /operatorWorkbench/alerts` → `:web:operatorWorkbench:alerts`
- `POST /operatorWorkbench/finance` → `:web:operatorWorkbench:finance`
- `POST /operatorWorkbench/marketing` → `:web:operatorWorkbench:marketing`
- 均加 `@DataScope(alias=工作台主表别名, merchantColumn=true, stationColumn=true, ...)`；marketing 无 station 列时 station 条件忽略或仅商户范围

- [ ] **Step 1: Controller 四方法委托 QueryService，返回 `ResultUtil`**

- [ ] **Step 2: 菜单 SQL**（参考 `docs/sql/t_menu_fault_monitor_20260921.sql`）

  - 页面：`href=/business/operatorWorkbench`，`title=运营商工作台`，`perms=:web:operatorWorkbench:view`
  - 父级：优先挂「数据统计」同级目录（找 `/business/businessStatistics` 的 `parent_id`）
  - 按钮权限（`menu_type=2`）：alerts / finance / marketing 三个 perms
  - 幂等：按 href / perms 查重

- [ ] **Step 3: 本地调通 overview（需登录 token）或用集成测试**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): add operator workbench APIs and menu SQL

EOF
)"
```

---

### Task 10: 前端 API + 路由

**Files:**
- Create: `charging-cloud-web/src/api/business/operatorWorkbench.js`
- Modify: `charging-cloud-web/src/router/modules/business.js`

**Interfaces:**
- `overview(data)` / `alerts(data)` / `finance(data)` / `marketing(data)` → `POST` 对应后端路径（与项目 `request` 封装一致，参考 `src/api/finance/stationFinanceDayBill.js`）

- [ ] **Step 1: API 模块**

```js
import request from '@/utils/request'

export function workbenchOverview(data) {
  return request({ url: '/operatorWorkbench/overview', method: 'post', data })
}
// alerts / finance / marketing 同理
```

- [ ] **Step 2: 路由**

```js
{
  path: '/business/operatorWorkbench',
  component: () => import('@/views/business/operatorWorkbench/index'),
  name: 'operatorWorkbench',
  meta: { title: '运营商工作台', icon: 'el-icon-s-home' }
}
```

- [ ] **Step 3: Commit（web 仓库）**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/api/business/operatorWorkbench.js src/router/modules/business.js
git commit -m "$(cat <<'EOF'
feat(web): add operator workbench api and route

EOF
)"
```

---

### Task 11: 前端工作台页面

**Files:**
- Create: `charging-cloud-web/src/views/business/operatorWorkbench/index.vue`
- Optional: `components/OverviewBlock.vue`, `AlertsBlock.vue`, `FinanceBlock.vue`, `MarketingBlock.vue`（若单文件过大再拆）

**Interfaces:**
- Consumes: Task 10 API；权限用项目现有方式（`this.$store.getters.permissions` 或 `v-if` 检查 `:web:operatorWorkbench:*`，对齐其它页）
- 筛选：`periodType` 单选今日/本周/本月；商户、电站选择器复用现有业务组件（与经营报表同款）
- 四块独立 `loading` / `error`；失败展示重试按钮，不阻断其它块
- 营销块：有权限即 `v-if`，数据全 0 也显示
- 下钻：`this.$router.push` 到 `/business/businessStatistics`、`/device/faultMonitor`、`/finance/stationFinanceDayBill`、`/finance/settlementLedger`、营销中心路由（用现有 path）
- 展示 `dataAsOf` 文案

- [ ] **Step 1: 搭页面骨架 + 筛选**

- [ ] **Step 2: 按权限并行请求四块（无权限不请求）**

- [ ] **Step 3: 预警表、费用结构条、营销 ROI 与「非严格增量」提示**

- [ ] **Step 4: 手动验收**

  1. 仅 view → 只见经营  
  2. 营销权限无数据 → 全 0  
  3. 故意让 finance 接口 500 → 其它块仍在  
  4. 零收入预警可跳转  

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): implement operator workbench page

EOF
)"
```

---

### Task 12: 联调验收与回填

**Files:** 无新文件；操作文档可写在 PR 描述

- [ ] **Step 1:** 两库执行 DDL + 菜单 SQL；给测试角色赋权

- [ ] **Step 2:** 手动触发 `backfillWorkbenchDay` / marketing 近 7 日；确认表有数据

- [ ] **Step 3:** 对照 spec Acceptance 1–7 打勾

- [ ] **Step 4:** 两仓库分别 push **origin**（勿 push codeup-cld），开 PR 指向 `main` / `master`

---

## Spec coverage（自检）

| Spec 项 | Task |
|---------|------|
| R1 独立菜单 | 9, 10 |
| R2 四区块 | 7–8, 11 |
| R3 权限显隐 | 9, 11 |
| R4 营销 0 值 | 8, 11 |
| R5 筛选 | 7, 11 |
| R6 口径对齐 | 3–4, 8 |
| R7 落表 + Job | 1–6 |
| R8 财务复用 | 8 |
| R9 不做预测等 | Global Constraints |
| 预警四类 | 4, 7 |
| dataAsOf / 今日财务提示 | 7–8, 11 |
| 验收项 | 12 |

## Placeholder / 风险备注（实现时钉死，非 TBD 逃逸）

- 营销发券商户归属列：实现 Task 5 时打开 `MarketingCardCouponActivity` 确认 `merchant_id`/`org_id` 映射，在 SyncService 类注释写最终 JOIN。
- 故障「新建工单数」字段：实现 Task 7 时对照 `FaultMonitor` KPI SQL，阈值默认 3、成功率 0.9 写入常量。
- 财务应收/实收字段名：必须复制 `StationFinanceDayBill` summary，禁止另造。
