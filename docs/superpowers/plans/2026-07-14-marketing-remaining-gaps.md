# 营销中心剩余收尾 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收口营销中心当前剩余缺口：结算双轨资金（台账/补款）、C 端体验边角、起充失败释券与异常结算钩子补齐。

**Architecture:** 财务轨按 `doc/marketing-settlement-split-qa.md` 附录 A 落地（`split_base_type` → 台账 `bill_*`/`channel_*` 双基数 → 出款 cap → 营销补款台账）；体验轨在现有 UniApp/Web 上做小步增强；可靠性轨复用已有 `MarketingOrderCouponLockCoordinator` / `settleCarMarketingAndPublishChargeEvent` 补齐遗漏入口。

**Tech Stack:** Java 8 / MyBatis-Plus / XXL-JOB / Vue 2 Element UI / UniApp

**Branch:** `develop/charging-marketing`（不直接合主干；发布时再合）

**前置已完成：** `docs/superpowers/plans/2026-07-13-marketing-p2-auto-issue-and-gaps.md`（P2 自动发券、兑换码导出、结算汇总填实）

**权威设计：**  
- `docs/superpowers/specs/2026-06-14-marketing-center-design.md`  
- `charging-cloud/doc/marketing-settlement-split-qa.md` 附录 A  

### 进度总览（2026-07-15）

| Workstream | 状态 | 说明 |
|------------|------|------|
| **A 双轨资金** | ✅ 代码完成 | 合入 `develop/charging-marketing`；待 DBA 跑 SQL + 验收 A-1～A-5 |
| **B 体验边角** | ✅ 代码完成 | 合入各仓同分支；B4 需配置 XXL-JOB；**B UX 修订（2026-07-16）：** ✅ 代码完成（[`plan`](./2026-07-16-marketing-b-ux-revision.md) / [`design`](../specs/2026-07-16-marketing-b-ux-revision-design.md)），待手工 QA S1–S4 / R1–R4 |
| **C 可靠性补齐** | ❌ 待做 | 异常单营销钩子、OCPP 起充失败释券 |
| Gate 0 联调 | ⏳ 待测 | 上一计划 8 条场景 |

---

## 范围说明（过目用）

本计划拆为 **3 个可独立交付的 Workstream**。可整份执行，也可拆成 3 份计划分别开工。

| Workstream | 内容 | 风险 | 建议顺序 | 状态 |
|------------|------|------|----------|------|
| **A 双轨资金** | `split_base_type`、台账双基数、出款 cap、补款台账/批次 | 高（动分账钱） | **先做** | ✅ |
| **B 体验边角** | 首页角标、券详情页、运营位、过期 Job、使用记录回滚态 | 低 | 可并行 | ✅ |
| **C 可靠性补齐** | 异常单营销钩子、OCPP 起充失败释券 | 中 | 可与 B 并行 | ❌ 下一批 |

**明确不做：**

| 项 | 原因 |
|----|------|
| 单车（`ruleId≠2`）营销价/用券 | 产品设计排除 |
| 会员/积分商城 | 无表、不在营销中心范围 |
| 领券订阅消息推送 | 可选增强，本计划不纳入 |
| P2 自动发券 / 兑换码导出 / 结算汇总填实 | **已完成**，见上一计划 |
| Workstream A / B | **已完成**（见文首进度总览）；补款代付通道不做 |

**Gate 0（非开发）：** 上一计划 8 条联调验收仍待测；A/B 验收清单亦可并行。

---

## File Map（总览）

| 路径 | Workstream | 职责 |
|------|------------|------|
| `charging-cloud/doc/sql/t_order_discount_info_split_base_20260714.sql` | A | 优惠明细扩展字段 |
| `charging-cloud/doc/sql/t_order_settlement_info_dual_track_20260714.sql` | A | 结算汇总扩展字段 |
| `charging-cloud/doc/sql/t_settlement_ledger_dual_track_20260714.sql` | A | 台账行 / 预分账扩展字段 |
| `charging-cloud/doc/sql/t_marketing_subsidy_20260714.sql` | A | 补款台账 + 出款批次表 |
| `.../entity/OrderDiscountInfo.java` | A | `splitBaseType` 等 |
| `.../MarketingChargeSettlementServiceImpl.java` | A | 写 `split_base_type`；出账口径 |
| `.../SettlementLedgerSyncServiceImpl.java` | A | `buildOriginalLine` 双基数 |
| `.../SettlementLedgerPayoutServiceImpl.java` | A | 渠道出款 cap |
| `.../MarketingSubsidyLedgerService*.java` | A | 补款台账 |
| `charging-cloud-web/.../marketing/subsidy*.vue`（可选） | A | 补款记录页 |
| `charging-cloud-uniapp/pages/home/home.vue` | B | 券角标 |
| `charging-cloud-uniapp/pages/subPack/marketing/couponDetail/` | B | 独立详情页 |
| `charging-cloud-uniapp/...` 运营入口 | B | `getActivityList` 消费 |
| `.../MarketingUserCouponServiceImpl.java` + Job | B | 过期券日更 |
| `charging-cloud-web/.../useRecordList.vue` | B | 回滚态展示 |
| `.../ChargeOrderBillServiceImpl.java` | C | `abnormalOrderSettlement` 挂营销 |
| OCPP 起充失败应答处理类 | C | 调 `onChargeStartFailed` |

---

# Workstream A — 双轨资金（附录 A P0→P3）

> **状态：✅ 代码已完成（2026-07-14）** — 待 DBA SQL + 验收 A-1～A-5。完成记录见文末「交付进度」。

> 数值口径与字段定义以 `marketing-settlement-split-qa.md` §A.3 / §A.4 为准。  
> **默认规则（本计划落地版）：** 平台承担（`discount_source=1`）→ `split_base_type=1`（折前，**不**扣商户出账）；商户承担（`discount_source=2`）→ `split_base_type=2`（折后，**扣**商户出账）。首期不做活动表单独配置「平台折后」；若后续要配，再加活动字段覆盖默认。

### Task A1: SQL — `t_order_discount_info` 扩展

**Files:**
- Create: `charging-cloud/doc/sql/t_order_discount_info_split_base_20260714.sql`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/entity/OrderDiscountInfo.java`

- [x] **Step 1: 写 SQL**

```sql
ALTER TABLE t_order_discount_info
  ADD COLUMN split_base_type TINYINT NULL COMMENT '1折前BEFORE 2折后AFTER' AFTER discount_source,
  ADD COLUMN split_affect_billing TINYINT NULL COMMENT '是否影响商户出账 1是0否' AFTER split_base_type,
  ADD COLUMN platform_subsidy_amount DECIMAL(12,2) NULL DEFAULT 0.00 COMMENT '本行平台待补款金额' AFTER service_discount_amount;
```

- [x] **Step 2: 实体加字段**

```java
/** 1=折前 BEFORE，2=折后 AFTER */
private Integer splitBaseType;
/** 1=影响商户出账，0=不影响 */
private Integer splitAffectBilling;
private BigDecimal platformSubsidyAmount;
```

- [x] **Step 3: Commit**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add doc/sql/t_order_discount_info_split_base_20260714.sql \
  sharecharge-biz/src/main/java/com/sharecharge/biz/entity/OrderDiscountInfo.java
git commit -m "$(cat <<'EOF'
feat(marketing): add split_base_type columns on order discount info

EOF
)"
```

---

### Task A2: 结算写 `split_base_type` + 按折后重算运营商汇总

**Files:**
- Modify: `.../MarketingChargeSettlementServiceImpl.java`（`buildDiscountRecords`、`persistSettlement`）

**规则：**

```text
discount_source == 1 → splitBaseType=1, splitAffectBilling=0,
                       platformSubsidyAmount = elec+svc（本行优惠额）
discount_source == 2 → splitBaseType=2, splitAffectBilling=1,
                       platformSubsidyAmount = 0
```

`persistSettlement` 中运营商优惠合计改为：

```java
// 仅折后（split_base_type=2 或 source=2）计入 operator_total_*
// 平台折前不计入 operator 出账扣减
if (Integer.valueOf(2).equals(row.getSplitBaseType())
        || (row.getSplitBaseType() == null && Integer.valueOf(2).equals(row.getDiscountSource()))) {
    operatorElecDisc = operatorElecDisc.add(elec);
    operatorSvcDisc = operatorSvcDisc.add(svc);
    operatorTotal = operatorTotal.add(elec.add(svc));
}
if (Integer.valueOf(1).equals(row.getDiscountSource())) {
    platformTotal = platformTotal.add(elec.add(svc));
}
```

（当前 Task10 已按 source 汇总；本 Task 对齐「折前不扣商户出账」。）

- [x] **Step 1: `buildDiscountRecords` 每行 setSplitBaseType / setSplitAffectBilling / setPlatformSubsidyAmount**
- [x] **Step 2: 调整 `persistSettlement` 聚合口径如上**
- [x] **Step 3: 手工验算** — 平台券 −20 + 商户活动 −5：原价 100 → 实付 75；`operator_actual_income` 应为 95（仅扣商户 5），`platform_total_discount_amount=20`
- [x] **Step 4: Commit** `feat(marketing): write split_base_type and billing-aware totals`

---

### Task A3: SQL — settlement / ledger 双轨字段

**Files:**
- Create: `doc/sql/t_order_settlement_info_dual_track_20260714.sql`
- Create: `doc/sql/t_settlement_ledger_dual_track_20260714.sql`
- Modify: `OrderSettlementInfo.java`、`SettlementLedgerLine.java`（及 split_plan_item 实体若存在）

- [x] **Step 1: settlement 扩展**

```sql
ALTER TABLE t_order_settlement_info
  ADD COLUMN billing_total_amount DECIMAL(12,2) NULL COMMENT '出账总额' AFTER operator_actual_income,
  ADD COLUMN channel_settle_amount DECIMAL(12,2) NULL COMMENT '渠道分账基数=用户实付' AFTER billing_total_amount,
  ADD COLUMN platform_subsidy_amount DECIMAL(12,2) NULL COMMENT '本单平台待补款' AFTER channel_settle_amount;
```

- [x] **Step 2: ledger_line 扩展**

```sql
ALTER TABLE t_settlement_ledger_line
  ADD COLUMN channel_electric_fee DECIMAL(12,2) NULL COMMENT '渠道电费' AFTER bill_total_amount,
  ADD COLUMN channel_service_fee DECIMAL(12,2) NULL COMMENT '渠道服务费' AFTER channel_electric_fee,
  ADD COLUMN channel_total_amount DECIMAL(12,2) NULL COMMENT '渠道总额=实付' AFTER channel_service_fee,
  ADD COLUMN origin_electric_fee DECIMAL(12,2) NULL COMMENT '原价电费' AFTER channel_total_amount,
  ADD COLUMN origin_service_fee DECIMAL(12,2) NULL COMMENT '原价服务费' AFTER origin_electric_fee,
  ADD COLUMN platform_subsidy_amount DECIMAL(12,2) NULL COMMENT '本单待补款' AFTER origin_service_fee;
```

（`split_plan_item` 的 `commission_base_amount` / `channel_amount` / `subsidy_amount` 按附录 A.4.4 一并加；实现时对照实体类名。）

- [x] **Step 3: 实体字段对齐 + Commit** `feat(settlement): add dual-track amount columns`

---

### Task A4: `buildOriginalLine` 双基数

**Files:**
- Modify: `sharecharge-biz/.../SettlementLedgerSyncServiceImpl.java`（约 L237+ `buildOriginalLine`）

**现状问题：** `billTotal = realityPayMoney`，再拆到 `bill_*`，导致平台承担优惠也压低商户出账。

**改造要点：**

```java
// 1. 读 OrderSettlementInfo（优先）与 OrderDiscountInfo
// 2. origin_* ← settlement.electricityAmount / serviceAmount（或 order.actual 拆分）
// 3. bill_*   ← settlement.operatorElectricityActualIncome / operatorServiceActualIncome
//               （出账=原价−商户折后承担）；若无 settlement 则回退现状
// 4. channel_*← realityPayMoney 按原价电/服比例拆分
// 5. settle_* ← 先等于 bill_*（退款调减逻辑保持现有）
// 6. platform_subsidy_amount ← max(0, 商户出账应得示意 − 渠道可分商户份额)
//    首期可简化为：max(0, billTotal − channelTotal) 中平台折前部分已在 discount 汇总，
//    差额记 platform_subsidy_amount 供轨 3 使用（与附录 A.3 推演对齐后微调公式）
```

- [x] **Step 1: 注入 `OrderSettlementInfoService` / `OrderDiscountInfoService`（若尚未注入）**
- [x] **Step 2: 按上改 `buildOriginalLine`，无营销 settlement 时保持旧逻辑兜底**
- [x] **Step 3: 手工对照附录 A.3 样例单（原价 49.74 / 出账 48 / 实付 44.70）验 `bill_total`≈48、`channel_total`≈44.70**
- [x] **Step 4: Commit** `feat(settlement): dual-base bill vs channel in ledger ingest`

---

### Task A5: 预分账抽成基数 + 渠道出款 cap

**Files:**
- Modify: 预分账刷新服务（附录称 `SettlementLedgerSplitPlanItemServiceImpl`；以仓库实际类名为准）
- Modify: `SettlementLedgerPayoutServiceImpl`（`aggregatePresetSplitNet` 或等价汇总方法）

- [x] **Step 1: 抽成基数改用台账行 `bill_service_fee`（出账服务费），写入 `commission_base_amount`**
- [x] **Step 2: 出款前：**

```java
BigDecimal channelCap = nz(ledgerLine.getChannelTotalAmount()); // 实付上限
if (channelCap.compareTo(BigDecimal.ZERO) > 0 && netTotal.compareTo(channelCap) > 0) {
    // 等比压缩各商户 channel_amount，差额累加到待补款（写 subsidy 或行上 subsidy_amount）
    scaleDownToCap(net, channelCap);
}
```

- [x] **Step 3: 验：传给台州 `orderSharingProfitWithPresetSplit` 的总额 ≤ `reality_pay_money`**
- [x] **Step 4: Commit** `feat(settlement): cap channel payout to reality pay and use bill commission base`

---

### Task A6: 营销补款台账 + 账期汇总任务（最小闭环）

**Files:**
- Create: `doc/sql/t_marketing_subsidy_20260714.sql`（`t_marketing_subsidy_ledger` + `t_marketing_subsidy_payout_batch`，DDL 见附录 A.4.5 / A.4.6）
- Create: `.../entity/marketing/MarketingSubsidyLedger.java` 等
- Create: `.../service/marketing/MarketingSubsidyLedgerService.java` + Impl
- Modify: 台账入账成功后调用「记补款行」（从 ledger_line.platform_subsidy_amount 或 discount 汇总）
- Create: Job 入口（对齐 `MarketingDirectionalSendJobApi` 模式）`processMarketingSubsidyForClosedPeriod`
- Optional Web: `charging-cloud-web/src/views/marketing/subsidyLedgerList.vue`（列表 + 状态筛选；线下打款手动确认）

**首期行为（YAGNI）：**

1. 入账时写 `t_marketing_subsidy_ledger`（`status=0` 待补）  
2. 账期 CLOSED 后 Job 按 `merchant_id` 汇总生成 `payout_batch`（`status=待确认`）  
3. Web 运营点「确认已线下打款」→ `status=1`  
4. **不做**自动企业代付对接（附录 P3 代付通道留后续）

- [x] **Step 1: DDL + 实体 + Mapper**
- [x] **Step 2: 入账写补款行**
- [x] **Step 3: Job 汇总 batch + Web 确认（可选同 PR）**
- [x] **Step 4: Commit** `feat(marketing): subsidy ledger and period payout batch`

---


# Workstream B — 体验边角

> **状态：✅ 已完成（2026-07-15）** — 完成记录见下方 Task 列表之后 / 文末交付进度。

### Workstream B 完成记录（2026-07-15）

| Task | Commit | 仓库 |
|------|--------|------|
| B1 首页券角标 | `f8a6b46` | uniapp |
| B2 独立卡券详情 | `42837db` | uniapp |
| B3 活动中心入口+列表 | `1619ac7` | uniapp |
| B4 过期券日更 Job | `c2bc7328` | cloud |
| B5 使用记录回滚态 | `e80a78a` | web |

**状态：** ✅ Workstream B 代码已合入各仓库 `develop/charging-marketing`（未合主干）。

**备注：**
- B3 入口放在个人中心「活动中心」
- B4 XXL-JOB 目标：`TaskService.expireMarketingUserCoupons`（需运维配置日调度）
- B5 未加 confirmStatus 筛选（后端分页暂不支持）
- **B UX 修订（2026-07-16）：** 见 [`2026-07-16-marketing-b-ux-revision.md`](./2026-07-16-marketing-b-ux-revision.md)。Task 1–4 已合入 `develop/charging-marketing`（cloud `bec6b321`/`91a55569`，uniapp `11839fd`/`1d88726`）；验收 S1–S4 / R1–R4 待测。

### Task B1: 首页未使用券角标

**Files:**
- Modify: `charging-cloud-uniapp/pages/home/home.vue`
- Reuse: `api/marketing.js` → `getMyCouponList`

- [x] **Step 1: data 增加 `couponCount: 0`**
- [x] **Step 2: `onShow` 登录后调**

```js
getMyCouponList({ page: 1, limit: 1, usedStatus: '0' }).then(res => {
  this.couponCount = res.count != null ? res.count : 0
}).catch(() => { this.couponCount = 0 })
```

（`usedStatus` 参数名以 `getMyCouponList` / 后端 `myList` 实际字段为准；对齐 `mine.vue` 写法。）

- [x] **Step 3: UI** — 在首页合适入口（如「我的卡券」快捷入口或顶栏）展示角标数字；`couponCount===0` 不显示红点
- [x] **Step 4: Commit**（uniapp 仓库）`feat(marketing): show unused coupon badge on home`

---

### Task B2: 独立卡券详情页

**Files:**
- Create: `charging-cloud-uniapp/pages/subPack/marketing/couponDetail/couponDetail.vue`
- Modify: `pages.json` 注册 subPack 路由
- Modify: `myCoupon.vue` — 列表点击改为 `navigateTo` 详情（可保留弹层作 fallback，优先路由）

- [x] **Step 1: 从 `myCoupon.vue` 抽出详情展示区块到新页，入参 `userCardCouponId`**
- [x] **Step 2: 调已有 `getCouponDetail`（或等价 API）**
- [x] **Step 3: `pages.json` + 跳转**
- [x] **Step 4: Commit** `feat(marketing): add standalone coupon detail page`

---

### Task B3: 运营位消费 `getActivityList`

**Files:**
- Modify: 选定入口页（建议 `pages/mine/mine.vue` 增加「活动中心」入口，或首页运营 banner 区）
- Create（可选）: `pages/subPack/marketing/activityList/activityList.vue`
- Reuse: `api/marketing.js` → `getActivityList`

- [x] **Step 1: 确认后端 App `GET /marketing/activity/list` 返回字段（进行中扫码/兑换类即可）**
- [x] **Step 2: 列表页展示活动名、时间、跳转扫码领券 / 券码兑换**
- [x] **Step 3: 个人中心入口**
- [x] **Step 4: Commit** `feat(marketing): wire activity list entry for users`

---

### Task B4: 过期券日更 Job

**Files:**
- Modify: `MarketingUserCouponServiceImpl` — 抽出包级/接口方法 `expireCouponsBatch(int limit)`（全量扫描 `end_time < now AND used_status=未使用`，更新为过期态）
- Create: Web 内部 Job Controller（对齐 `MarketingDirectionalSendJobInternalController`）
- Create: Feign API + `TaskService.expireMarketingUserCoupons`
- XXL-JOB：配置每日凌晨调用

现有 `markExpiredCoupons(userId, tenantId)` 保留给查询路径。

- [x] **Step 1: Service 批量过期（分页 limit，防一次扫太多）**
- [x] **Step 2: Job 链路接通**
- [x] **Step 3: Commit** `feat(marketing): daily job to expire unused coupons`

---

### Task B5: Web 使用记录回滚态

**Files:**
- Modify: `charging-cloud-web/src/views/marketing/useRecordList.vue`

- [x] **Step 1: 替换确认状态展示**

```js
confirmStatusLabel(status) {
  const map = { '0': '待确认', '1': '已确认', '2': '已回滚' }
  return map[String(status)] || '未知'
}
```

```html
<el-tag size="mini" :type="scope.row.confirmStatus === '1' ? 'success' : (scope.row.confirmStatus === '2' ? 'info' : 'warning')">
  {{ confirmStatusLabel(scope.row.confirmStatus) }}
</el-tag>
```

- [ ] ~~**Step 2: 筛选下拉增加「已回滚」**~~ → **跳过**（后端分页暂不支持 `confirmStatus` 筛选；列表展示已覆盖）
- [x] **Step 3: Commit** `fix(marketing): show rolled-back confirm status on use records`

---

# Workstream C — 可靠性补齐

> **状态：❌ 待做** — 下一批开工项（C1 异常单营销钩子、C2 OCPP 起充失败释券）。

### Task C1: `abnormalOrderSettlement` 挂营销

**Files:**
- Modify: `ChargeOrderBillServiceImpl.java` → `abnormalOrderSettlement`

- [ ] **Step 1: 在费用落库后、`toPayment` 前调用已有方法**

```java
settleCarMarketingAndPublishChargeEvent(chargeOrder, chargeOrderExpenseInfos);
```

（若异常结算没有 `chargeOrderExpenseInfos` 列表，则先按现有逻辑构建/查询后再调；`ruleId!=2` 时方法内部直接 return。）

- [ ] **Step 2: 确认不会与正常结算路径双重 settle（异常单通常不会再走 `orderSettlement`）**
- [ ] **Step 3: Commit** `fix(marketing): run marketing settle on abnormal car settlement`

---

### Task C2: OCPP 起充失败释券

**Files:**
- 定位 OCPP 远程启动失败 / StartTransaction 拒绝应答处理（`sharecharge-transport-biz` 下 OCPP handler，对照 YKC/WM/WJ 已调用点）
- Modify: 在明确「起充失败」分支注入并调用：

```java
marketingOrderCouponLockCoordinator.onChargeStartFailed(orderCode, reason);
```

参考已接线：

- `YKCCarTcpMessageService`  
- `WMCarTcpMessageService`  
- `WJCarTcpMessageService`  

- [ ] **Step 1: Grep OCPP 起充失败路径，列出所有失败应答入口**
- [ ] **Step 2: 每个入口调用 `onChargeStartFailed`（try/catch 不影响协议主流程）**
- [ ] **Step 3: 手工：锁券下单 → 模拟 OCPP 起充失败 → 用户券回到未使用、`use_record` 回滚/释放**
- [ ] **Step 4: Commit** `fix(marketing): release coupon lock on OCPP charge start failure`

---

## 推荐执行顺序

```text
Gate 0  联调上一计划（可选但建议）
   │
   ▼
A1 → A2 → A3 → A4 → A5 → A6     （财务闭环，顺序依赖）
   │
   ├── B1 → B2 → B3 → B4 → B5   （可与 A4 之后并行）
   └── C1 → C2                  （可与 B 并行）
```

---

## 验收清单

### Workstream A

| # | 场景 | 期望 |
|---|------|------|
| A-1 | 仅平台折前券 | 出账≈原价；实付减少；`platform_total`>0；`operator` 出账不因平台券减少 |
| A-2 | 仅商户折后活动 | 出账=原价−商户优惠；台账 `bill_*` 反映出账 |
| A-3 | 台账行 | `bill_total` ≠ `channel_total`（有平台折前时） |
| A-4 | 出款 | 台州分账请求总额 ≤ 实付 |
| A-5 | 补款 | 有待补记录；账期可汇总；可手动确认 |

### Workstream B

| # | 场景 | 期望 |
|---|------|------|
| B-1 | 首页登录有未使用券 | 角标数字正确 |
| B-2 | 我的卡券点详情 | 进独立详情页 |
| B-3 | 活动中心入口 | 能看到进行中活动并跳转 |
| B-4 | Job 跑完 | 过期未使用券状态更新 |
| B-5 | 使用记录 | 回滚显示「已回滚」 |

### Workstream C

| # | 场景 | 期望 |
|---|------|------|
| C-1 | 异常结算汽车单 | 有营销结算/可触发充电领券 |
| C-2 | OCPP 起充失败 | 预锁券释放 |

---

## Self-Review

| 检查项 | 结论 |
|--------|------|
| 上一计划「剩余未完成」表全覆盖 | ✅ 除联调（Gate0）与单车（排除） |
| 附录 A P0–P3 | ✅ A1–A6 |
| 无 TBD 占位 | ✅ 默认 split 规则已写死；代付通道明确不做 |
| 与已完成 Task10 关系 | A2 在其基础上修正「折前不扣商户」 |
| 可拆分交付 | ✅ A / B / C 独立 |

---

## 过目确认点（已拍板 2026-07-14）

| # | 问题 | 结论 | 落地 |
|---|------|------|------|
| 1 | 交付方式 | **按独立交付线**：先完整做 **Workstream A**，再 B，再 C | A ✅ → B ✅ → C 待做 |
| 2 | `split_base_type` 默认 | **接受**：平台承担 → 折前(1)；商户承担 → 折后(2)；活动表暂不配开关 | ✅ A1/A2 |
| 3 | 补款出款 | **接受首期**：台账 + 账期汇总 + **线下确认**；不做企业代付自动打款 | ✅ A6 |
| 4 | B3 运营位 | C 端「进行中活动」入口；入口放个人中心 | ✅ B3「活动中心」 |

### 「活动运营位」是什么？（问题 4）

指 **C 端给用户看的「进行中营销活动」入口/列表**，不是后台管理页。

| | 说明 |
|--|------|
| **背景** | UniApp 已有 API 封装 `getActivityList`（`api/marketing.js`） |
| **计划里的 B3** | 用户可点的入口，拉进行中扫码领券 / 券码兑换等活动并跳转 |
| **和角标的区别** | 首页券角标（B1）=「你有几张未用券」；运营位（B3）=「最近有哪些活动可参与」 |
| **落地** | ✅ 个人中心「活动中心」→ 活动列表页（`1619ac7`） |

---

## 交付进度（A/B 已完成，C 待做）

### Workstream A 完成记录（2026-07-14）

| Task | Commit | 仓库 |
|------|--------|------|
| A1 split_base 字段 | `2dbf5f18` | cloud |
| A2 结算写 split + 出账口径 | `79941f7d` | cloud |
| A3 settlement/ledger 双轨列 | `05c599d6` | cloud |
| A4 buildOriginalLine 双基数 | `1d3fddd2` | cloud |
| A5 抽成基数 + 出款 cap | `3329bbcd` | cloud |
| A6 补款台账 + Job + Web 确认 | `08d3b57a` / `18ee5c4` | cloud / web |
| A6+ 渠道实付口径修复 + 确认权限 | `87fd3819` | cloud |

**状态：** ✅ 代码已合入 `develop/charging-marketing`（未合主干）。待 DBA 执行 SQL 并做验收清单 A-1～A-5。

**上线前必跑 SQL（顺序）：**
1. `doc/sql/t_order_discount_info_split_base_20260714.sql`
2. `doc/sql/t_order_settlement_info_dual_track_20260714.sql`
3. `doc/sql/t_settlement_ledger_dual_track_20260714.sql`
4. `doc/sql/t_marketing_subsidy_20260714.sql`

### Workstream B 完成记录（2026-07-15）

见上文「Workstream B 完成记录」表（B1–B5）。验收清单 B-1～B-5 待测；B4 需运维配置 XXL-JOB。

**B UX 修订（2026-07-16）：** Task 1–4 代码已完成（cloud `bec6b321`/`91a55569`，uniapp `11839fd`/`1d88726`）；手工验收 S1–S4 / R1–R4 待测。详见 [`2026-07-16-marketing-b-ux-revision.md`](./2026-07-16-marketing-b-ux-revision.md)。

### 下一批：Workstream C

| Task | 内容 | 状态 |
|------|------|------|
| C1 | `abnormalOrderSettlement` 挂营销结算 / CHARGE 发券 | ❌ |
| C2 | OCPP 起充失败释放预锁券 | ❌ |