# 运营商工作台 V2 打磨（分页 / 商户鉴权 / 文案小修）

**Date:** 2026-10-27  
**Status:** Approved（对话确认）  
**Parent:** V2 + batch-dismiss  
**Branches:** `feature/operator-workbench` + `feature/operator-workbench-web`

## Goal

1. 异常预警服务端分页，避免 Top20 截断漏看零收入等告警  
2. 预警设置 / 已忽略：无站点商户也能按权限读写，不再误报「无权访问该商户」  
3. 财务标签对齐日账单；忽略时间格式化；阈值比例精度 4 位  

## Out of Scope

- 放开候选 SQL LIMIT 500  
- 批量改多商户阈值、占桩费、枪在线  
- 跨页勾选批量忽略  

---

## 1. 预警分页

### API

`POST /operatorWorkbench/alerts` 请求体沿用 `OperatorWorkbenchQuery`（已有 `page`/`limit`，来自 `QueryRequest`）：

| 字段 | 默认 | 上限 | 说明 |
|------|------|------|------|
| `page` | 1（≤0 时按 1） | — | 页码 |
| `limit` | 20（≤0 时按 20） | 100 | 页大小 |

处理顺序（不变段 + 分页段）：

1. 按现逻辑拉四类候选（各类仍 `CANDIDATE_LIMIT=500`）  
2. 按商户配置过滤 → 扣未过期忽略 → 按 severity 排序  
3. `total = ranked.size()`；再 `subList` 当前页  
4. 响应：`ResultUtil` 的 `data` = 当前页 `List<OperatorWorkbenchAlertVo>`，`count` = total（与项目列表接口一致）

去掉硬截断 `ALERT_LIMIT=20` 作为唯一出口；分页 limit 替代之。

### 前端

- 预警表下方 `el-pagination`：`total`、`page`/`limit` 双向；`page-sizes` 含 20/50/100  
- 查询/换筛选条件时重置 `page=1`  
- **换页清空勾选**（仅当前页可批量忽略）  
- `loadAlerts` 把 `page`/`limit` 写入 `buildParams()`  

---

## 2. 配置 / 已忽略商户鉴权

### 问题

当前 `inScope` 查 `t_network_dot` 且要求至少 1 个未删站点 → 下拉能选到的无站点商户会失败。

### 方案

新增（或扩展）`merchantInScope(OperatorWorkbenchQuery query)`：

- 查 `t_user_merchant`（别名与 `@DataScope` 一致，建议 `tum`，`merchantIdRef=PRIMARY`）  
- `WHERE tum.id = #{merchantId}` + dataScope；`COUNT >= 1` 即通过  
- **不要求**有网点  

调用点：

| API | 鉴权 |
|-----|------|
| GET/PUT `alertConfig` | `merchantInScope` |
| GET `alerts/dismissed` | `merchantInScope`（列表内站点过滤仍可按现有 dismiss list scope） |
| POST `alerts/dismiss`、batch、DELETE cancel | **仍用**网点 `inScope`（必须看见该站） |

Controller 上对应方法的 `@DataScope`：`alertConfig` / `dismissed` 改为面向商户主表（`alias="tum", merchantColumn=true, merchantIdRef=PRIMARY, stationColumn=false, …`），与 `UserMerchantController.merchantList` 同口径；忽略相关接口保持网点 `alias="w"`。

---

## 3. 文案与展示

| 项 | 改动 |
|----|------|
| 财务卡 | 「应收（元）」→「出账合计（元）」（字段仍 `finance.receivable`） |
| `OperatorWorkbenchAlertDismissVo` | `expireAt`、`createTime` 加 `@JsonFormat(pattern="yyyy-MM-dd HH:mm:ss", timezone="GMT+8")` |
| 预警设置 | `dropRatioThreshold`、`startSuccessRateMin` 的 `el-input-number`：`precision=4` |

经营块「经营实收」副文案若与 V2 spec「用户实付汇总口径」不一致，本迭代可顺手改成与 spec 一致（可选，非阻塞）。

---

## Acceptance

1. 预警超过 20 条时可翻页看到后续；`count` 与页数据正确  
2. 换页后勾选清空；批量忽略只作用于当前页勾选  
3. 无站点但权限内商户：可打开预警设置并保存；已忽略抽屉可选该商户  
4. 电站账号仍不能忽略不可见站点  
5. 财务卡显示「出账合计」；已忽略抽屉时间可读；比例可输入四位小数  

## Rollout

无新 DDL。部署 cloud + web 当前工作台分支即可。
