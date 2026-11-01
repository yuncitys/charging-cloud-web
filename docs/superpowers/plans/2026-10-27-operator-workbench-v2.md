# 运营商工作台 V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 V1 工作台上增加商户级预警阈值配置与忽略、经营/结算实收文案区分，以及预警下钻预填站点筛选。

**Architecture:** 配置/忽略落新表；alerts **查询层**读配置并过滤 dismiss（改阈值立即生效）；前端设置抽屉（字段旁固定提示文案）+ 忽略交互；经营报表/故障监控消费 `route.query.stationId`。

**Tech Stack:** Java Spring Boot, MyBatis, Sa-Token, Vue 2 + Element UI

**Spec:** `docs/superpowers/specs/2026-10-27-operator-workbench-v2-design.md`

**Branches:** `feature/operator-workbench`（cloud）+ `feature/operator-workbench-web`（web）

## Global Constraints

- 占桩费不做；零收入不加枪在线过滤
- 忽略：商户共享；天数仅 3 / 7 / 30，默认 7
- 阈值查询层生效；TODAY 判定日仍为昨日（V1）
- 预警设置五字段提示文案必须用 spec 表格语义（可微调标点）
- 权限沿用 `:web:operatorWorkbench:alerts`
- 禁止 push `codeup-cld`

---

## File Map

| 文件 | 职责 |
|------|------|
| `docs/sql/t_operator_workbench_alert_config_20261027.sql` | 配置表 DDL |
| `docs/sql/t_operator_workbench_alert_dismiss_20261027.sql` | 忽略表 DDL |
| `OperatorWorkbenchAlertConfig` + Mapper/Service | 配置 CRUD + 默认值 |
| `OperatorWorkbenchAlertDismiss` + Mapper/Service | 忽略写入/列表/取消 |
| `OperatorWorkbenchQueryServiceImpl` | alerts 用配置判定 + 过滤 dismiss |
| `OperatorWorkbenchQueryMapper.xml` | drop/startFail SQL 参数化阈值与最少样本 |
| `OperatorWorkbenchController` | config/dismiss API |
| `operatorWorkbench.js` + `index.vue` | 设置抽屉、忽略、文案 |
| `businessStatistics.vue` | 读 `stationId` → `chargingStationIds` |
| `faultMonitor.vue` | 读 `stationId` → `listQuery.stationId` |

---

### Task 1: DDL — 配置表与忽略表

**Files:**
- Create: `charging-cloud/docs/sql/t_operator_workbench_alert_config_20261027.sql`
- Create: `charging-cloud/docs/sql/t_operator_workbench_alert_dismiss_20261027.sql`

**Interfaces:**
- Produces: `t_operator_workbench_alert_config`（uk `merchant_id`）、`t_operator_workbench_alert_dismiss`（建议 uk `(merchant_id, station_id, alert_type)` 便于 upsert）

- [ ] **Step 1: 编写配置表 DDL**

```sql
CREATE TABLE IF NOT EXISTS `t_operator_workbench_alert_config` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `merchant_id` int(11) NOT NULL,
  `tenant_id` varchar(32) DEFAULT NULL,
  `drop_ratio_threshold` decimal(8,4) NOT NULL DEFAULT 0.5000,
  `drop_baseline_min` decimal(12,2) NOT NULL DEFAULT 100.00,
  `fault_high_min_orders` int(11) NOT NULL DEFAULT 3,
  `start_success_rate_min` decimal(8,4) NOT NULL DEFAULT 0.9000,
  `start_fail_min_samples` int(11) NOT NULL DEFAULT 10,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营商工作台预警阈值（商户级）';
```

- [ ] **Step 2: 编写忽略表 DDL**

```sql
CREATE TABLE IF NOT EXISTS `t_operator_workbench_alert_dismiss` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `merchant_id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `alert_type` varchar(32) NOT NULL COMMENT 'ZERO_INCOME|INCOME_DROP|FAULT_HIGH|START_FAIL',
  `dismiss_days` int(11) NOT NULL DEFAULT 7,
  `expire_at` datetime NOT NULL,
  `operator_user_id` varchar(64) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant_station_type` (`merchant_id`, `station_id`, `alert_type`),
  KEY `idx_expire` (`merchant_id`, `expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运营商工作台预警忽略（商户共享）';
```

- [ ] **Step 3: 本地库执行并 `SHOW CREATE TABLE` 验证**

- [ ] **Step 4: Commit（cloud）**

```bash
git add docs/sql/t_operator_workbench_alert_config_20261027.sql \
  docs/sql/t_operator_workbench_alert_dismiss_20261027.sql
git commit -m "$(cat <<'EOF'
docs(sql): add workbench alert config and dismiss tables

EOF
)"
```

---

### Task 2: 配置 Entity / Mapper / Service

**Files:**
- Create: `sharecharge-biz/.../entity/OperatorWorkbenchAlertConfig.java`
- Create: Mapper + XML（`selectByMerchantId`, `insert`, `updateByMerchantId`）
- Create: `OperatorWorkbenchAlertConfigService` + Impl
- Test: `OperatorWorkbenchAlertConfigServiceTest`

**Interfaces:**
- Produces:
  - `OperatorWorkbenchAlertConfig defaults()` — 内存默认：0.5 / 100 / 3 / 0.9 / 10
  - `OperatorWorkbenchAlertConfig getOrDefault(Integer merchantId)`
  - `void save(OperatorWorkbenchAlertConfig cfg)` — upsert；校验：比例 (0,1]、基线≥0、工单≥1、样本≥1

- [ ] **Step 1: 单测** — null merchant → defaults；save 后 get 回写值

- [ ] **Step 2: 实现 Entity/Mapper/Service**

- [ ] **Step 3: `mvn -o -pl sharecharge-biz -am -Dtest=OperatorWorkbenchAlertConfigServiceTest test` 通过**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): workbench alert config service with defaults

EOF
)"
```

---

### Task 3: 忽略 Entity / Mapper / Service

**Files:**
- Create: entity `OperatorWorkbenchAlertDismiss`
- Create: Mapper + XML — `upsert`（INSERT ... ON DUPLICATE KEY UPDATE expire_at）、`listActive(merchantId, now)`、`listActiveByMerchants`、`deleteById`、`selectById`
- Create: Service + Impl
- Test: `OperatorWorkbenchAlertDismissServiceTest`

**Interfaces:**
- Produces:
  - `void dismiss(merchantId, stationId, alertType, days, operatorUserId)` — days ∈ {3,7,30}，默认 7；`expire_at = now + days`
  - `List<DismissVo> listActive(merchantId)`
  - `void cancel(id, merchantId)` — 校验归属后删除
  - `Set<String> activeKeys(Collection<Integer> merchantIds)` — key=`merchantId|stationId|alertType` 供 alerts 过滤

- [ ] **Step 1: 单测** — 非法 days 拒绝；upsert 延长过期；cancel

- [ ] **Step 2: 实现**

- [ ] **Step 3: 测试通过 + Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): workbench alert dismiss (merchant-shared)

EOF
)"
```

---

### Task 4: alerts 查询层接入配置与忽略

**Files:**
- Modify: `OperatorWorkbenchQueryMapper.java` / `.xml`
  - `listDropAlerts`: **不要**只靠 `alert_drop_flag`；改为  
    `income_vs_7d_avg_ratio IS NOT NULL AND income_vs_7d_avg_ratio <= #{dropRatio}`  
    且需能表达基线：应用层可先查出候选再滤，或 SQL  
    `AND (s.actual_income / NULLIF(s.income_vs_7d_avg_ratio,0))` 不便 → 推荐：查判定日有 ratio 的行，**Service 内**用 `avg = actual/ratio`（ratio=当日/均）判断 `avg >= baseline && ratio <= threshold`  
    更稳妥：Mapper 增加 `listDropCandidates(alertDate)` 返回 `stationId, merchantId, actualIncome, incomeVs7dAvgRatio`，Service 过滤  
  - `listStartFailAlerts`: 增加 `@Param("minSamples")`，HAVING  
    `(SUM(started)+SUM(no_response)) >= #{minSamples}` 且成功率 `< #{threshold}`
  - `listFaultHighAlerts`: 已有 `threshold` 参数，改为传入配置值
- Modify: `OperatorWorkbenchQueryServiceImpl.alerts`
- Modify/扩展: `OperatorWorkbenchQueryServiceTest`

**Interfaces:**
- Consumes: ConfigService.getOrDefault、DismissService.activeKeys
- 多商户：对每个 alert 行的 `merchantId` 取配置（候选 SQL 需选出 `merchant_id`）

- [ ] **Step 1: 改单测** — mock 配置 drop=0.3 时入选规则变化；minSamples=10 时过滤；dismiss key 过滤

- [ ] **Step 2: 实现 drop 候选 + Service 过滤；fault/startFail 传配置；alerts 末尾去掉已忽略**

- [ ] **Step 3: 测试通过 + Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(biz): apply alert config and dismiss in workbench alerts query

EOF
)"
```

---

### Task 5: Controller API

**Files:**
- Modify: `OperatorWorkbenchController.java`
- Optional: 小 DTO `AlertConfigSaveRequest`、`AlertDismissRequest(days, stationId, alertType)`

**Interfaces:**
- `GET /operatorWorkbench/alertConfig?merchantId=` → `@SaCheckPermission(":web:operatorWorkbench:alerts")` + `@DataScope` 商户
- `PUT /operatorWorkbench/alertConfig` body 含 merchantId + 五字段
- `POST /operatorWorkbench/alerts/dismiss`
- `GET /operatorWorkbench/alerts/dismissed?merchantId=`
- `DELETE /operatorWorkbench/alerts/dismiss/{id}`
- 现有 `POST /alerts` 无需改签名（内部已过滤）

- [ ] **Step 1: 实现四/五端点，校验 dismiss days**

- [ ] **Step 2: 编译 web-controller**

- [ ] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): expose workbench alert config and dismiss APIs

EOF
)"
```

---

### Task 6: 前端 — API、设置抽屉、忽略、文案（C）

**Files:**
- Modify: `charging-cloud-web/src/api/business/operatorWorkbench.js`
- Modify: `charging-cloud-web/src/views/business/operatorWorkbench/index.vue`
- Optional: `components/AlertConfigDrawer.vue`、`AlertDismissedDrawer.vue`

**Interfaces:**
- API: `getAlertConfig` / `saveAlertConfig` / `dismissAlert` / `listDismissed` / `cancelDismiss`
- UI「该处理」：按钮「预警设置」「已忽略」；行操作「忽略」
- 设置抽屉：五字段 + **每项下方灰色说明 = spec 提示全文**；底栏固定说明「修改后立即作用于…」
- 忽略：`el-dialog`/`el-dropdown` 选 3/7/30，默认 7
- 文案 C：
  - 经营主卡：`经营实收` + 副文案「与经营报表一致…」
  - 财务：`结算实收`（原实收）+ 副文案「与站点财务日账单一致」
  - 无占桩费

- [ ] **Step 1: API 方法**

- [ ] **Step 2: 设置 / 忽略 / 已忽略 UI + 文案**

- [ ] **Step 3: 保存配置后自动 `loadAlerts()`**

- [ ] **Step 4: Commit（web）**

```bash
git commit -m "$(cat <<'EOF'
feat(web): alert settings, dismiss, and income label copy on workbench

EOF
)"
```

---

### Task 7: 下钻预填（D）

**Files:**
- Modify: `src/views/business/businessStatistics.vue`
- Modify: `src/views/monitor/faultMonitor.vue`（路由组件实际路径）

**Interfaces:**
- workbench 已 `query: { stationId }`（保持）
- **经营报表**：`mounted`/`created` 若 `this.$route.query.stationId` 有值，设 `listQuery.chargingStationIds`（或页面实际站点控件字段；实现时核对站点多选组件绑定名，当前 listQuery 为 `chargingStationIds`）为该 id（字符串/数组按控件要求），再调用现有查询方法
- **故障监控**：`listQuery.stationId` 已存在 — 在 `created` 中：`const id = this.$route.query.stationId`；合法则赋值并 `getList`/`loadKpi`
- 非法 id：清空，不 toast 打断

- [ ] **Step 1: businessStatistics 预填 + 触发查询**

- [ ] **Step 2: faultMonitor 预填 + 触发刷新**

- [ ] **Step 3: 手动点预警跳转验证（或文档 PENDING_HUMAN）**

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(web): prefill station filter from workbench alert drill-down

EOF
)"
```

---

### Task 8: 联调验收

- [ ] **Step 1: 执行两张新 DDL**

- [ ] **Step 2: 对照 Spec Acceptance 1–6 打勾**（写入 `.superpowers/sdd/` checklist 可选）

- [ ] **Step 3: 不强制 push**（除非用户要求）

---

## Spec coverage

| Spec | Task |
|------|------|
| 配置表 + 默认 | 1–2 |
| 设置提示文案 | 6 |
| 查询层阈值 / min samples | 4 |
| 忽略 3/7/30 商户共享 | 3–6 |
| 经营/结算实收文案 | 6 |
| stationId 下钻 | 7 |
| 不做占桩费/在线 | Global |

## Risk notes

- `businessStatistics` 站点字段名是 `chargingStationIds`，不是 `stationId` — Task 7 必须映射。
- Drop 判定用 `income_vs_7d_avg_ratio`：均 = `actual_income / ratio`（ratio 为当日/均）；ratio 为 0 或 null 则不报骤降。
