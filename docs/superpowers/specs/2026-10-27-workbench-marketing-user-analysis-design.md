# 工作台 · 营销加字段 / 营销分析 · 充电用户 / 用户分析

**Date:** 2026-10-27  
**Status:** Approved（2026-10-27；新增字段须带注释）  
**Parent:** 工作台 V3 后置  
**Branches:** 继续 `feature/operator-workbench` + `feature/operator-workbench-web`

## Goal

1. 营销块补齐「活动订单电量 / 参与电站数 / 参与用户数」，并增加「营销分析」  
2. 新增「充电用户」块（参考友商口径），并增加「用户分析」  
3. 充电用户块 **跟随顶栏周期**，今日映射为昨日已收口，避免盘中抖动  

## Out of Scope

- 完整用户画像 / 留存 / 复购漏斗  
- 独立 BI 大屏  
- 放开候选 500 等其它 V2 外能力  
- 修改财务 TODAY→昨日以外的既有财务口径  

---

## 1. 营销：三字段

### 工作台卡片（随顶栏 `periodType` / `statDate`）

在现有营销卡片上增加：

| 字段 | 类型 | 口径 |
|---|---|---|
| 活动订单电量 | 度，2～4 位小数 | 区间内「有核销关联」订单的 `SUM(total_power)`，订单集与现有「核销订单实收」一致（按 `order_code` 去重） |
| 参与电站数 | int | 上述订单 `COUNT(DISTINCT station_id / network_dot_id)` |
| 参与用户数 | int | 上述订单 `COUNT(DISTINCT user_id)` |

仍受商户 / 站点 / 业态 / DataScope 约束；营销日表为商户维时，业态过滤保持 V3「商户是否存在该业态网点」软过滤（已知限制，本期不改为站维营销表）。

### 落库

`t_statistics_merchant_marketing_day` 增列（幂等 DDL；**每列必须有 COMMENT**）：

- `activity_order_kwh` decimal(14,4) NOT NULL DEFAULT 0 COMMENT '当日有核销关联订单的充电量合计（度）'  
- `participate_station_count` int NOT NULL DEFAULT 0 COMMENT '当日有核销关联订单的去重电站数'  
- `participate_user_count` int NOT NULL DEFAULT 0 COMMENT '当日有核销关联订单的去重用户数'  

Java VO / Entity 字段同步写清 Javadoc 或行内注释（口径与 COMMENT 一致）。  

`MarketingDayStatSyncService` 日内/夜间同步写入；`sumMarketing` / `OperatorWorkbenchMarketingVo` / 前端营销块展示。历史日可回填或等自然同步。

---

## 2. 营销分析（方案 A）

- 入口：营销块右上「营销分析」（权限 `:web:operatorWorkbench:marketing`）  
- 形态：**抽屉**（与预警设置一致，不新开菜单亦可；若抽屉过重可改为同模块子路由，实现时二选一，默认抽屉）  
- 筛选：继承工作台当前商户 / 业态 / 站点；周期默认近 30 日（可切 7 / 30 / 与顶栏一致）  
- 内容：  
  1. **日趋势**：发券数、核销数、优惠成本、活动订单电量（折线或组合图）  
  2. **活动 Top 表**：活动名称、发券、核销、活动订单电量、优惠成本；按核销或电量倒序，限制 Top N（如 20）  
- 数据：日表聚合 + 按活动维实时/日汇总查询（活动维若无预聚合，允许读核销/发券明细表按活动 GROUP，需注意 DataScope 与性能；大商户可后续再落活动日表）  

---

## 3. 充电用户块（跟顶栏周期）

### 布局

- 区块标题「充电用户」+ `?` 口径提示 + 右上「用户分析」  
- **单组指标**（随周期变，不做友商式昨日|本月双行）：  
  - 充电用户数  
  - 新增充电用户数  
  - 环图：新增 / 充电用户（分母 0 → 环图空或 0%）  
- 副文案展示实际统计起止日（尤其今日→昨日时标明）  

### 周期映射（末日最多到昨日）

| 顶栏 | 统计区间 | 标题文案 |
|---|---|---|
| TODAY | **昨日单日** | 昨日充电用户；副文案「今日未收口，按昨日统计」 |
| WEEK | 本周一 ～ min(周日, **昨日**) | 本周充电用户 |
| MONTH | 本月 1 日 ～ min(月末, **昨日**) | 本月充电用户 |

自定义 `statDate` 时：区间解析与 `OperatorWorkbenchPeriodHelper` 对齐，但 **end 仍 clamp 到昨日**（不得含今天未收口日）。

### 统计口径（对齐友商提示）

- 按订单 **结束时间** 归天；**同一手机号计 1 人**（优先 `t_app_user.phone`，无手机号时回退 `user_id`，实现时注释标明）  
- 仅 **C 端**：`user_type = '1'`；排除客户机构 / 内部 / 互联机构专用账号；排除互联/漫游发起订单（实现时对照订单来源字段，与现网一致）  
- **充电用户**：区间内至少有 1 笔符合条件的结束订单的去重人数  
- **新增充电用户**：该用户在统计范围内（商户/站点/业态 DataScope）的 **首次** 符合条件结束订单落在本区间内  
- 数据截至昨日 24:00（与 Job 收口一致）  

### 落库建议

新建商户日表（名称实现时可定为 `t_statistics_merchant_charge_user_day`；**表 COMMENT + 每列 COMMENT**）：

- `stat_date` date NOT NULL COMMENT '统计日'  
- `merchant_id` int NOT NULL COMMENT '商户 ID'  
- `tenant_id` varchar(32) DEFAULT NULL COMMENT '租户'  
- `charge_user_count` int NOT NULL DEFAULT 0 COMMENT '当日去重充电用户数（C端，按手机号）'  
- `new_charge_user_count` int NOT NULL DEFAULT 0 COMMENT '当日新增充电用户数（范围内首次结束订单落在当日）'  
- 唯一键 `(stat_date, merchant_id)`  

Entity / VO 字段同样带注释。  

- **日指标**：直接读日表  
- **周/月去重**：不能简单 SUM 日表人数。  
  - **本期推荐**：查询层对区间做一次订单侧去重聚合（或专用区间 API），日表仅服务「单日/趋势」；若性能不足再补「月快照表」或 HyperLogLog 类方案（后置）。  
  - 工作台 WEEK/MONTH：Service 调「区间去重」查询；TODAY（昨日）：读日表单日行。  
- Job：挂 `syncMerchantAppIntraday` / 夜间任务写 **昨日**（及可选回补），不写当日盘中。  

权限：建议 `:web:operatorWorkbench:view`（与概览同页可见）；若需独立码可后加。

---

## 4. 用户分析（方案 A）

- 入口：充电用户块「用户分析」  
- 形态：抽屉 / 子页（默认抽屉）  
- 内容：  
  1. **对照卡（可选，对齐友商）**：昨日充电/新增 | 本月充电/新增（本月为 1 日～昨日的去重）  
  2. **近 30 日趋势**：每日充电用户、每日新增（读日表，非去重累加误解——图例标明「当日人数」）  
  3. **本月按站 Top**：站名、充电用户数（站维去重；受 DataScope）  
- 筛选：继承商户 / 业态 / 站点  

---

## 5. 布局顺序（工作台）

概览 → 终端状态 → **充电用户** → 异常预警 → 财务 → 营销 → Top10  

（充电用户放预警前，与「经营+人」信息靠近；可微调。）

---

## 6. API 草案

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| 扩展 | `POST .../marketing` | marketing | VO 增加三字段 |
| 新增 | `POST .../marketingAnalysis` | marketing | `{ trend: [], activityTop: [] }` |
| 新增 | `POST .../chargeUsers` | view | 当前周期：`chargeUserCount`, `newChargeUserCount`, `periodStart`, `periodEnd`, `titleHint` |
| 新增 | `POST .../chargeUserAnalysis` | view | `{ yesterday, monthToDate, trend, stationTop }` |

均带 `OperatorWorkbenchQuery` + `@DataScope`。

---

## 7. Acceptance

1. 营销三字段随周期变化；无核销日为 0；与核销订单实收订单集一致可抽查  
2. 营销分析：趋势与活动 Top 在权限内；无数据空态  
3. 充电用户：切今日→昨日数；切本周/本月区间末日不含今天；`?` 文案正确  
4. 用户分析：对照卡 / 趋势 / 站 Top 可用；C 端过滤生效  
5. DataScope 不越权  

## 8. Rollout

- DDL：营销三列 + 充电用户日表  
- Job：营销 sync 扩字段；充电用户 sync 写昨日  
- 部署 cloud + web；可选回填近 30 日  

## 9. 实施顺序

1. 营销三字段（DDL + sync + VO + 卡片）  
2. 营销分析抽屉  
3. 充电用户日表 + sync + `chargeUsers` + 工作台块  
4. 用户分析抽屉  
