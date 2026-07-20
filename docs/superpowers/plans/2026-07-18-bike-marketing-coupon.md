# 电单车营销用券 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 电单车（`ruleId=1`）支持满减/折扣手选预锁、抵用卡/电量卡自动抵、结算后 CHARGE 充电领取；不参与电站/用户折扣活动；`mPay` 选券；起充失败释券。

**Architecture:** 放开 `saveOrder` 锁券与结算入口到 Bike+Car；`MarketingChargeSettlementServiceImpl.settle` 对 Bike **跳过** `applyActivityDiscountToOrder`，其余锁券/自动卡复用；`resolveOrderPayableAmount` 对 Bike 同样读 settlement；WJ 电单车开电失败路径挂 `MarketingOrderCouponLockCoordinator`；UniApp `mPay` 对齐 `bPay` 选券（仅类型 2/4）。

**Tech Stack:** Java 8 / UniApp Vue 2 / 现有 marketing settle + `CouponPickerPopup`

**Branch:** `develop/charging-marketing`

**权威设计：** `docs/superpowers/specs/2026-07-18-bike-marketing-coupon-design.md`

## Global Constraints

- 电单车：**不做**站折扣、用户折扣；**不做**列表「X张券可用」
- 满减(2)/折扣(4)：手选预锁；抵用卡(1)/电量卡(3)：结算自动抵（同汽车）
- 支付：余额 / 企业余额 / 微信可用；包月、免费不可用（`isCouponBlockedPayType`）
- CHARGE（充电领取）电单车结算后也发
- 起充失败即时释券：WJ MQTT / WJ TCP 必挂；HHXG 开电响应无失败字段时依赖现有起充超时任务释券并在注释中写明
- 不改汽车行为（除共享分支判断）
- 英文 conventional commits；仓库各自提交
- 无现成单测框架时以编译 + 手工验收为准

---

## File Map

| 路径 | 职责 |
|------|------|
| `.../AppOrderController.java` | 锁券闸门含 Bike |
| `.../ChargeOrderBillServiceImpl.java` | 营销入口 + CHARGE + 应付含 Bike |
| `.../MarketingChargeSettlementServiceImpl.java` | Bike 跳过活动折 |
| `.../WJBikeMqttMessageService.java` | 开电失败释券 |
| `.../WJBikeTcpMessageService.java` | 开电失败释券 |
| `.../XGBikeMqttMessageService.java` | 注释：无失败字段 / 超时兜底（若无可判定失败则不改逻辑） |
| `charging-cloud-uniapp/pages/mPay/mPay.vue` | 选券 UI + `userCardCouponId` |
| `charging-cloud-uniapp/components/CouponPickerPopup/` | 复用（已有） |
| `charging-cloud-web/docs/...` | 本计划 + 设计已有 |

---

### Task 1: 后端 — 锁券闸门 + settle 跳过活动折 + 应付 + CHARGE

**Files:**
- Modify: `charging-cloud/sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppOrderController.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/ChargeOrderBillServiceImpl.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/marketing/impl/MarketingChargeSettlementServiceImpl.java`

**Interfaces:**
- Consumes: `RuleId.Bike` / `RuleId.Car`；现有 `lockCoupon` / `settle` / `MarketingTriggerEvent.charge`
- Produces: Bike 订单可锁券、可营销 settle（无活动折）、折后应付、CHARGE 事件

- [x] **Step 1: AppOrderController 锁券闸门**

将：

```java
if (RuleId.Car.getId().equals(deviceVo.getRuleId())
        && StringUtils.isNotBlank(dto.getUserCardCouponId())
        && !isCouponBlockedPayType(effectivePayType)) {
```

改为：

```java
if ((RuleId.Car.getId().equals(deviceVo.getRuleId()) || RuleId.Bike.getId().equals(deviceVo.getRuleId()))
        && StringUtils.isNotBlank(dto.getUserCardCouponId())
        && !isCouponBlockedPayType(effectivePayType)) {
```

确认已 import `com.sharecharge.core.enums.RuleId`。

- [x] **Step 2: ChargeOrderBillServiceImpl — 营销入口**

`settleCarMarketingAndPublishChargeEvent`：

1. 将闸门改为允许 `ruleId` 为 1 或 2：

```java
Integer ruleId = chargeOrder.getRuleId();
if (!Integer.valueOf(2).equals(ruleId) && !Integer.valueOf(1).equals(ruleId)) {
    return;
}
```

2. 更新方法注释为：汽车/电单车营销结算与充电领取事件。  
3. CHARGE 发布逻辑保持在 settle 之后（对 1/2 均执行，勿再包一层仅汽车判断）。

- [x] **Step 3: resolveOrderPayableAmount**

将仅汽车读 settlement 改为汽车或电单车：

```java
private BigDecimal resolveOrderPayableAmount(ChargeOrder order) {
    requireOrderField(order.getActualPrice(), "actualPrice", order.getOrderCode());
    Integer ruleId = order.getRuleId();
    boolean marketingOrder = Integer.valueOf(2).equals(ruleId) || Integer.valueOf(1).equals(ruleId);
    if (order.getId() == null || !marketingOrder) {
        return order.getActualPrice();
    }
    OrderSettlementInfo settlement = orderSettlementInfoService.getByOrderId(Long.valueOf(order.getId()));
    if (settlement == null
            || settlement.getElectricityAmountAfterDiscount() == null
            || settlement.getServiceAmountAfterDiscount() == null) {
        return order.getActualPrice();
    }
    return settlement.getElectricityAmountAfterDiscount()
            .add(settlement.getServiceAmountAfterDiscount())
            .setScale(2, RoundingMode.HALF_UP);
}
```

同步更新方法注释。

- [x] **Step 4: MarketingChargeSettlementServiceImpl.settle — Bike 跳过活动折**

在调用 `stationDiscountPriceService.applyActivityDiscountToOrder(...)` 之前分支：

```java
MarketingActivityDiscountResult activityResult;
if (Integer.valueOf(1).equals(order.getRuleId())) {
    activityResult = new MarketingActivityDiscountResult(); // 空结果：无活动折
    // 若该类无公共无参构造，则用现有工厂/setter：activityElec/SvcDiscount=0，activityItems=emptyList
    log.info("{} settle skip activity discount for bike orderCode={}", LOG_PREFIX, orderCode);
} else {
    activityResult = stationDiscountPriceService.applyActivityDiscountToOrder(
            stationId, order.getUserId(), tenantId, lines, settlementTime);
}
```

查阅 `MarketingActivityDiscountResult` 实际构造方式，保证后续 `getActivityElecDiscount()` 等为 0 / 空列表，**不要** NPE。  
其后锁券 / `tryAutoApply` / 写 settlement **保持不变**。

- [x] **Step 5: 编译**

```bash
mvn -pl sharecharge-applet/sharecharge-applet-controller -am compile -DskipTests -q
```

Expected: BUILD SUCCESS

- [x] **Step 6: Commit（charging-cloud）**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): enable bike order coupon settle without activity discounts

EOF
)"
```

---

### Task 2: 后端 — 电单车起充失败释券

**Files:**
- Modify: `charging-cloud/sharecharge-transport/sharecharge-transport-biz/src/main/java/com/sharecharge/transport/biz/service/WJBikeMqttMessageService.java`
- Modify: `charging-cloud/sharecharge-transport/sharecharge-transport-biz/src/main/java/com/sharecharge/transport/biz/service/WJBikeTcpMessageService.java`
- Optional comment only: `XGBikeMqttMessageService.java`（HHXG `StartChargeResponse` 仅 port/order，无失败标志）

**Interfaces:**
- Consumes: `MarketingOrderCouponLockCoordinator.onChargeStartFailed(orderCode, reason)`
- Produces: 开电失败时释放 PENDING 锁券

- [x] **Step 1: WJBikeMqttMessageService**

注入（与汽车一致）：

```java
@Autowired(required = false)
private MarketingOrderCouponLockCoordinator marketingOrderCouponLockCoordinator;
```

在 `startChargingResponse` 的 `else`（`!getResult()`、已置 Fault）分支末尾：

```java
if (marketingOrderCouponLockCoordinator != null) {
    marketingOrderCouponLockCoordinator.onChargeStartFailed(
            chargeOrder.getOrderCode(), startChargingResponse.getStatus());
}
```

- [x] **Step 2: WJBikeTcpMessageService**

同样注入 coordinator。在 `startOrStopChargingResponse` 中 `ack != 0` 失败分支（置 Fault 之后）：

```java
if (marketingOrderCouponLockCoordinator != null) {
    marketingOrderCouponLockCoordinator.onChargeStartFailed(
            chargeOrder.getOrderCode(), ackMsg);
}
```

注意：仅「开启失败」调用；已在 Progress 的关闭应答 early-return 分支**不要**释券。

- [x] **Step 3: XGBikeMqttMessageService**

在 `startCharging` 方法上方增加简短注释：协议响应无成功/失败字段，预锁券依赖 `OrderRefundTask` 起充超时释放；若后续协议补失败码再挂 coordinator。

- [x] **Step 4: 编译 transport 相关模块并 Commit**

```bash
mvn -pl sharecharge-transport/sharecharge-transport-biz -am compile -DskipTests -q
git commit -m "$(cat <<'EOF'
feat(marketing): release bike coupon lock on charge start failure

EOF
)"
```

---

### Task 3: UniApp — `mPay` 选券

**Files:**
- Modify: `charging-cloud-uniapp/pages/mPay/mPay.vue`
- Reuse: `components/CouponPickerPopup/CouponPickerPopup.vue`
- Reuse: `api/marketing.js` → `getAvailableCoupons` / `previewCoupon`

**Interfaces:**
- Produces: `saveOrder` 可选 `userCardCouponId`；仅展示类型 2/4

- [x] **Step 1: template — 券卡片 + picker**

在支付方式区域附近（参考 `bPay.vue` 券卡片位置，避免塞进第一屏无关区）增加：

```html
<view class="card coupon-card" v-if="showCouponSection" @click="openCouponPicker">
  <!-- 与 bPay 同结构：选中名 / N张可用 / 暂无；预计可省 -->
</view>
<coupon-picker-popup
  :show="showCouponPicker"
  :list="usableCouponList"
  :selected-id="selectedCoupon ? selectedCoupon.userCardCouponId : null"
  @close="showCouponPicker = false"
  @select="selectCoupon"
/>
```

按 `mPay` 现有 class 风格微调，可复用 bPay 的 `.coupon-card` 样式片段。

- [x] **Step 2: script — import / data / computed**

```js
import { getAvailableCoupons, previewCoupon } from '@/api/marketing.js'
import CouponPickerPopup from '@/components/CouponPickerPopup/CouponPickerPopup.vue'

components: { CouponPickerPopup },
data() {
  return {
    // ...
    couponList: [],
    selectedCoupon: null,
    estimatedSaving: 0,
    showCouponPicker: false
  }
},
computed: {
  showCouponSection() {
    if (this.payType === 'MONTH_CARD') return false
    if (this.payType === 'FREE') return false
    return true
  },
  usableCouponList() {
    return (this.couponList || []).filter((item) =>
      ['2', '4'].includes(String(item && item.cardCouponType || '')))
  }
}
```

- [x] **Step 3: 加载与预览**

在拿到 `networkDotId` / `chargingStationId`（与现站点 id 字段对齐，读 mPay 现有命名）后调用 `loadAvailableCoupons(stationId)`。

`refreshCouponPreview`：用页面上已有电费/服务费估算字段；若仅有 `totalPrice`，可按电单车当前选中档的电费单价×预估电量与服务费拆分——**优先**用 `deviceInfo` 里已展示的电费单价、服务费推算；若无法拆分，则 `previewElectricityAmount = totalPrice`、`previewServiceAmount = 0`（并在注释标明），**禁止**复制汽车 0.7/0.3。

切换 `payType` 到 MONTH_CARD/FREE 时清空 `selectedCoupon`。

- [x] **Step 4: saveOrder 传券**

在现有 `data = { payType, orderType, ... }` 增加：

```js
userCardCouponId: this.selectedCoupon ? this.selectedCoupon.userCardCouponId : null
```

- [x] **Step 5: Commit（uniapp）**

```bash
git commit -m "$(cat <<'EOF'
feat(mPay): select满减/折扣 coupons for bike charging

EOF
)"
```

（若团队要求英文：`feat(mPay): add manual coupon picker for bike pay`）

---

### Task 4: 文档勾选 + 验收清单

**Files:**
- Modify: `charging-cloud-web/docs/superpowers/plans/2026-07-18-bike-marketing-coupon.md`（本文件勾选）
- Modify: `charging-cloud-web/docs/superpowers/specs/2026-07-18-bike-marketing-coupon-design.md`（文末实现状态）
- Modify: `charging-cloud-web/docs/superpowers/plans/2026-07-14-marketing-remaining-gaps.md`（进度提到电单车营销进行中/完成）

- [x] **Step 1: 设计文档加实现状态表**（填 commit）

- [ ] **Step 2: 手工验收（对照设计 B1–B9）** — 执行前保持 `[ ]`

| # | 场景 | 期望 |
|---|------|------|
| B1 | mPay 满减 + 余额 | 折后应付 + discount |
| B2 | 不选手动券 + 有抵用卡 | 自动抵 |
| B3 | 电量卡 | 自动抵 |
| B4 | 站折扣活动 | 电单车无活动折 |
| B5 | 用户折扣 | 电单车不享受 |
| B6 | 包月 | 无选券 |
| B7 | WJ 开电失败 | 释券 |
| B8 | 充电领取活动 | 电单车可发券 |
| B9 | 汽车回归 | 行为不变 |

- [x] **Step 3: Commit docs**

```bash
git commit -m "$(cat <<'EOF'
docs(marketing): bike coupon plan progress and status

EOF
)"
```

---

## Self-Review

| Spec 项 | Task |
|---------|------|
| mPay 选 2/4 | Task 3 |
| 锁券 Bike | Task 1 |
| settle skip 活动折 + 自动卡 | Task 1 |
| 应付 + CHARGE | Task 1 |
| 起充失败释券 | Task 2 |
| 列表 tip 不做 | 无 Task（约束） |
| 验收 B1–B9 | Task 4 |

---

## 执行说明

Plan：`docs/superpowers/plans/2026-07-18-bike-marketing-coupon.md`。
