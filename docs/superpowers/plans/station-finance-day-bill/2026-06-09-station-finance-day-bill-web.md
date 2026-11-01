# 站点财务日账单 Web 端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Web 管理端新增「站点财务日账单」页面，只读展示 `t_statistics_station_finance_day_bill`，含 KPI、趋势图、分页表格、抽屉详情与导出。

**Architecture:** 独立 `StationFinanceDayBillController` + QueryService + Mapper（按站点×日期聚合）；前端单页 `stationFinanceDayBill/index.vue`；`@DataScope` 统一数据权限；异步 Task 导出。

**Tech Stack:** Java Spring Boot, MyBatis-Plus, Sa-Token 权限, Vue 2 + Element UI, ECharts

**Spec:** `docs/superpowers/specs/station-finance-day-bill/2026-06-09-station-finance-day-bill-web-design.md`

---

## File Map

| 文件 | 职责 |
|------|------|
| `StationFinanceDayBillPagination.java` | 查询入参 |
| `StationFinanceDayBillLineVo.java` | 列表/导出行 |
| `StationFinanceDayBillSummaryVo.java` | KPI + 趋势 |
| `StationFinanceDayBillQueryMapper.java/.xml` | SQL（WHERE/GROUP BY/分页） |
| `StationFinanceDayBillQueryService(.java\|Impl)` | 日期校验、金额 normalize、组装 VO |
| `StationFinanceDayBillController.java` | 三个 HTTP 端点 + DataScope + 权限 |
| `AsyncService` + impl | 异步 Excel 导出 |
| `stationFinanceDayBill.js` | 前端 API |
| `stationFinanceDayBill/index.vue` | 页面 |
| `router/index.js` | 路由注册 |

---

### Task 1: 查询模型与 VO

**Files:**
- Create: `charging-cloud/sharecharge-biz/.../entity/model/StationFinanceDayBillPagination.java`
- Create: `charging-cloud/sharecharge-biz/.../vo/StationFinanceDayBillLineVo.java`
- Create: `charging-cloud/sharecharge-biz/.../vo/StationFinanceDayBillSummaryVo.java`

- [ ] **Step 1:** 创建 `StationFinanceDayBillPagination`，字段：`startDate`, `endDate`, `merchantId`, `stationIds`, `ruleId`, `billType`, `page`, `limit`；继承或复用项目现有 `Pagination` 基类（参考 `SettlementLedgerPeriodPagination`）
- [ ] **Step 2:** 创建 `StationFinanceDayBillLineVo`，在 `MerchantAppFinanceBillLineVo` 字段基础上加 `stationId`, `stationName`, `merchantId`, `merchantName`, `ruleId`；`settledTotalAmount` 映射表字段 `merchant_settle_amount`
- [ ] **Step 3:** 创建 `StationFinanceDayBillSummaryVo`，含四个 KPI 字段 + 内部类 `TrendPoint(summaryDate, income)` + `statHint` + `statTime`
- [ ] **Step 4:** 编译 `sharecharge-biz` 模块确认无语法错误

---

### Task 2: Mapper SQL

**Files:**
- Create: `charging-cloud/sharecharge-biz/.../mapper/StationFinanceDayBillQueryMapper.java`
- Create: `charging-cloud/sharecharge-biz/.../resources/mapper/StationFinanceDayBillQueryMapper.xml`

- [ ] **Step 1:** 定义 `<sql id="whereClause">`：日期范围、`merchantId`、`stationIds`（foreach IN）、`ruleId`；嵌入 `${params.dataScope}`
- [ ] **Step 2:** 定义 `<sql id="groupKey">`：日 `s.station_id, s.summary_date`；月 `s.station_id, DATE_FORMAT(s.summary_date,'%Y-%m')`
- [ ] **Step 3:** 实现 `countPage`：子查询 `SELECT 1 ... GROUP BY groupKey`
- [ ] **Step 4:** 实现 `selectPage`：`SELECT` 日期、`tum.name merchantName`、`tnd.network_name stationName`、`s.merchant_id`、`s.station_id`、`s.rule_id`，金额字段 `SUM()`，口径复制 `MerchantAppQueryMapper.listFinanceBillLines`；`ORDER BY summaryDate DESC`；分页 `LIMIT`
- [ ] **Step 5:** 实现 `selectSummaryKpi`：四个 `SUM()` 同 WHERE
- [ ] **Step 6:** 实现 `selectTrendPoints`：按日 `GROUP BY s.summary_date`，`SUM(merchant_settle_amount) AS income`；月账单按 `DATE_FORMAT` 分组
- [ ] **Step 7:** 实现 `selectAllForExport`：无分页版 `selectPage`，供导出使用

---

### Task 3: QueryService

**Files:**
- Create: `charging-cloud/sharecharge-biz/.../service/StationFinanceDayBillQueryService.java`
- Create: `charging-cloud/sharecharge-biz/.../service/impl/StationFinanceDayBillQueryServiceImpl.java`

- [ ] **Step 1:** 抽取 `resolveDateRange(pagination)`：校验格式、end ≤ yesterday、start ≥ 2024-09-01、start ≤ end；非法返回 `ResultUtil.error`
- [ ] **Step 2:** 实现 `getSummary`：调 mapper KPI + trend；金额 `setScale`；`statHint` 固定文案
- [ ] **Step 3:** 实现 `getPage`：count + selectPage；复用 `MerchantAppFinanceQueryServiceImpl.normalizeFinanceBillLines` 逻辑（可抽静态方法或复制 normalize）
- [ ] **Step 4:** 实现 `export`：校验行数 ≤ 50000；创建 `Task`；调 `asyncService.exportStationFinanceDayBill`
- [ ] **Step 5:** 编写 `StationFinanceDayBillQueryServiceImplTest`（可选）：mock mapper 验证日期拦截与空列表

---

### Task 4: Controller

**Files:**
- Create: `charging-cloud/sharecharge-web/sharecharge-web-controller/.../StationFinanceDayBillController.java`

- [ ] **Step 1:** `@RequestMapping("/stationFinanceDayBill")`，注入 `StationFinanceDayBillQueryService`
- [ ] **Step 2:** `POST /summary` + `POST /page`：`@DataScope(alias="s", merchantColumn=true, stationColumn=true, stationIdRef=STATION_ID, tenantColumn=true, adminColumn=false)` + `@SaCheckPermission(":web:stationFinanceDayBill:page")`
- [ ] **Step 3:** `POST /export`：同上 DataScope + `@SaCheckPermission(":web:stationFinanceDayBill:export")`
- [ ] **Step 4:** 本地启动或单元测试验证三个端点返回 200 结构

---

### Task 5: 异步导出

**Files:**
- Modify: `charging-cloud/sharecharge-biz/.../service/AsyncService.java`
- Modify: `charging-cloud/sharecharge-biz/.../service/impl/AsyncServiceImpl.java`（或对应 impl 文件）

- [ ] **Step 1:** 新增 `exportStationFinanceDayBill(StationFinanceDayBillPagination query, Task task)` 方法签名
- [ ] **Step 2:** 分页批量查询 `selectAllForExport`（每批 1000），写入 Excel（EasyExcel 或项目现有 POI 工具）
- [ ] **Step 3:** 列头：统计日、商户、站点、业态、出账笔数、出账电量、出账电费、出账服务费、出账合计、结算金额
- [ ] **Step 4:** 更新 Task 进度百分比，完成后写文件 URL（对齐 `exportSettlementLedgerLine`）
- [ ] **Step 5:** 手动触发导出，确认 `downloadProgress` 可下载

---

### Task 6: 前端 API 与路由

**Files:**
- Create: `charging-cloud-web/src/api/finance/stationFinanceDayBill.js`
- Modify: `charging-cloud-web/src/router/index.js`

- [ ] **Step 1:** API：`summary(data)`, `page(data)`, `export(data)` → `/api/web/stationFinanceDayBill/*`
- [ ] **Step 2:** 在 `finance` children 中注册路由 `stationFinanceDayBill`，`meta.title = '站点财务日账单'`
- [ ] **Step 3:** 确认菜单需在后台权限系统配置后可见（文档注明权限 SQL 待运维执行）

---

### Task 7: 页面骨架

**Files:**
- Create: `charging-cloud-web/src/views/finance/stationFinanceDayBill/index.vue`

- [ ] **Step 1:** 搭建 `app-container` + `el-alert` 口径说明
- [ ] **Step 2:** 筛选栏：日期 daterange（默认近 30 天）、商户 select（`getMerchant`）、站点 select（联动 `getChargingStationList`）、业态、日/月 radio、查询/导出按钮
- [ ] **Step 3:** 权限：`permsVerifAuthention(':web:stationFinanceDayBill:page')` / `export`
- [ ] **Step 4:** `created` 钩子加载商户列表、默认查询

---

### Task 8: KPI 与趋势图

**Files:**
- Modify: `charging-cloud-web/src/views/finance/stationFinanceDayBill/index.vue`

- [ ] **Step 1:** 四个 KPI 卡（参考 `businessStatistics.vue` cardBox）
- [ ] **Step 2:** 引入 `LineChart` 或内联 ECharts 折线图，绑定 `summary.trendPoints`
- [ ] **Step 3:** `loadSummary()` 与 `loadPage()` 共用 `buildQuery()`；查询时并行请求
- [ ] **Step 4:** 无数据时图表显示 empty 态

---

### Task 9: 表格与分页

**Files:**
- Modify: `charging-cloud-web/src/views/finance/stationFinanceDayBill/index.vue`

- [ ] **Step 1:** `el-table` 列按 spec 定义；金额列右对齐、保留 2 位小数
- [ ] **Step 2:** 业态列：`ruleId==1` 单车桩，`==2` 汽车桩
- [ ] **Step 3:** 操作列「详情」+ 行点击打开抽屉
- [ ] **Step 4:** `el-pagination` 对齐项目通用写法

---

### Task 10: 详情抽屉

**Files:**
- Modify: `charging-cloud-web/src/views/finance/stationFinanceDayBill/index.vue`

- [ ] **Step 1:** `el-drawer` `size="60%"` `direction="rtl"`；头部展示统计日/商户/站点/业态
- [ ] **Step 2:** 三个 `detail-block`：出账收入、支出项目、结算金额；字段分组对齐 uniapp `adminFinanceBillDetail`
- [ ] **Step 3:** 空值显示 `—`；底部关闭按钮
- [ ] **Step 4:** 不发起额外 API，直接使用当前行数据

---

### Task 11: 导出联调

**Files:**
- Modify: `charging-cloud-web/src/views/finance/stationFinanceDayBill/index.vue`

- [ ] **Step 1:** 引入 `downloadProgress` 组件
- [ ] **Step 2:** `handleExport` 调 `export` API，`downloadProgress.open(res.data.id)`
- [ ] **Step 3:** 验证导出 Excel 列与表格一致

---

### Task 12: 权限与验收

- [ ] **Step 1:** 准备权限 SQL 脚本（`menu` + `perms` 两条：`page`、`export`），附在 PR 说明或 `doc/sql/`（如项目有惯例）
- [ ] **Step 2:** 平台账号：全量可见
- [ ] **Step 3:** 商户账号：仅本商户站点
- [ ] **Step 4:** 日/月切换、日期边界、空数据、导出 — 按 spec Test Plan T1–T8 验收

---

## Dependencies

- `syncStationFinanceDayBill` Job 正常运行，表中有数据
- 后台菜单/权限需运维或 SQL 配置后菜单才可见
- 不影响 uniapp 收益中心现有接口

## Notes

- 商户表 JOIN：`t_user_merchant tum ON tum.id = s.merchant_id`
- 站点表 JOIN：`t_network_dot tnd ON tnd.id = s.station_id`
- 趋势图 Y 轴单位：元；X 轴：统计日
