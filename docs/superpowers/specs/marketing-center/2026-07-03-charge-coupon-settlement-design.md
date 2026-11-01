# 汽车充电用券与营销抵扣设计

**Date:** 2026-07-03  
**Scope:** 汽车充电（`ruleId=2`）— Web 发券/活动 → App 启动前选券 → 服务端结算抵扣闭环  
**Related:** [营销中心功能设计](./2026-06-14-marketing-center-design.md)、[汽车站点折扣 C 端展示设计](../../../../charging-cloud-uniapp/docs/superpowers/specs/2026-06-27-station-discount-miniapp-design.md)

## Goal

在营销中心 P1（卡券管理 + 定向/扫码/券码发券）和电站折扣 C 端展示已完成的基础上，实现 **P3 充电用券与折扣活动计费抵扣** 闭环：

```
Web 发券/发起活动 → App 汽车充电选券 → 服务端结算减免 → 使用记录/结算明细可查
```

**本期不做：** 注册/充值/充电自动发券（P2）、单车充电、运营商分账/抽成字段回填（仅写用户侧优惠明细）。

## Product Decisions

| 决策项 | 结论 |
|---|---|
| 选券时机 | **启动前选券 + 结算校验**：下单锁定，结算时重新校验门槛 |
| 叠加规则 | 读卡券模板 `discount_share_flag`：`1`=与折扣活动共享，`0`=互斥 |
| 共享券结算 | 折扣活动（分费项叠加）→ 卡券在折后价上抵扣 |
| 互斥券结算 | 分别计算折扣路径与卡券路径，**取用户实付更低者** |
| 校验失败 | 自动释放券，按无券/最优折扣结算，记录 `use_record.fail_reason` |
| 场景范围 | 汽车充 `ruleId=2`；余额付 + 微信预付 + 企业余额付 |
| 不支持用券 | `FREE`、`MONTH_CARD`、微信支付分等 |
| 结算信息存储 | **`t_order_settlement_info` 独立子表**（1:1 `order_id`），不扩展 `t_order_info` |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ App bPay.vue（汽车充电）                                              │
│  优惠券卡片 → 选券弹层 → saveOrder(userCardCouponId)                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│ AppOrderController.saveOrder                                         │
│  → MarketingChargeSettlementService.lockCoupon()                     │
│  → lockCoupon() 写 use_record（confirm_status=0）                    │
│  → INSERT t_order_settlement_info（order_id，金额待结算）             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 充电中…
┌──────────────────────────────▼──────────────────────────────────────┐
│ ChargeOrderBillServiceImpl.orderSettlement                           │
│  1. 原有计费 → order.electricityPrice + order.servicePrice           │
│  2. MarketingChargeSettlementService.settle(order)                   │
│     → 写 settlement 金额字段 + 活动/卡券分项                          │
│     → 校验门槛：失败 release；成功 confirm + use_record              │
│  3. order.actualPrice = 实付总额 → toPayment()                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 模块边界

| 模块 | 职责 |
|---|---|
| `MarketingChargeSettlementService` | 算价、锁定、确认、回滚；读写 `t_order_settlement_info` |
| `MarketingStationDiscountPriceService` | 复用分费项叠加，匹配 type=7/8 |
| `MarketingUserCouponService` | 扩展 `available`、新增 `preview` |
| `OrderSettlementInfoService` | settlement 子表 CRUD（按 `order_id`） |
| `ChargeOrderBillServiceImpl` | 计费后增加一步 settle 调用 |

## Data Model

### `t_order_settlement_info` 字段映射

基表为业务库已有 **订单结算信息表**（`uk_order_id`）。营销中心 P3 **复用现有金额字段**，仅补充订单级活动命中与综合生效结果。

**表职责划分（避免冗余）：**

| 信息 | 归属表 | 说明 |
|---|---|---|
| 用了哪张券、确认状态、抵扣金额 | `t_marketing_user_card_coupon_use_record` | 卡券域单一事实来源 |
| 锁券时 `discount_share_flag` 快照、失败原因 | `use_record`（补丁新增） | 不在 settlement 重复 |
| 活动命中、订单级生效类型、分项实付金额 | `t_order_settlement_info` | 订单财务结算视图 |

> settlement 补丁：`doc/sql/t_order_settlement_info_20260703.sql`（仅 2 列）  
> use_record 补丁：`doc/sql/t_marketing_user_card_coupon_use_record_patch_20260703.sql`  
> 字段重命名：`doc/sql/t_marketing_user_card_coupon_use_record_order_code_20260705.sql`（`order_id` → `order_code` varchar(64)）

#### 已有字段（本期写入）

| 字段 | 写入时机 | 营销中心用途 |
|---|---|---|
| `order_id` | 下单/结算 | UK，关联 `t_order_info.id` |
| `settlement_type` | 结算 | 正常单写 `0`（正常单自动结算） |
| `settlement_time` | 结算 | 营销结算完成时间 |
| `payment_time` | 支付完成 | 同现有支付链路 |
| `charged_duration` | 结算 | 充电时长（分） |
| `charged_power` | 结算 | 充电电量；**电量卡**门槛/限额校验 |
| `electricity_amount` | 结算 | **原价电费**（不含优惠） |
| `service_amount` | 结算 | **原价服务费**（不含优惠） |
| `user_electricity_discount_amount_of_activity` | 结算 | 用户侧 **活动** 电费优惠 |
| `user_service_discount_amount_of_activity` | 结算 | 用户侧 **活动** 服务费优惠 |
| `user_electricity_discount_amount_of_coupon` | 结算 | 用户侧 **卡券** 电费优惠 |
| `user_service_discount_amount_of_coupon` | 结算 | 用户侧 **卡券** 服务费优惠 |
| `electricity_amount_after_discount` | 结算 | **实付电费**（含全部优惠后） |
| `service_amount_after_discount` | 结算 | **实付服务费**（含全部优惠后） |
| `platform_total_discount_amount` | 结算 | 平台承担优惠总额（本期可填 0 或按 `undertaker` 预留） |
| `operator_total_discount_amount` | 结算 | 运营商承担优惠总额（本期可填 0 或按 `undertaker` 预留） |
| `operator_electricity_actual_income` | 结算 | 运营商实收电费（本期可不填，留分账模块） |
| `operator_service_actual_income` | 结算 | 运营商实收服务费（本期可不填） |
| `operator_actual_income` | 结算 | 运营商实收总额（本期可不填） |
| `commission_*` | — | **本期不填**，留分账模块 |
| `user_*_discount_amount_of_member` | — | **本期不填**，留会员模块 |

**用户实付总额（同步订单）：**

```
actual_price = electricity_amount_after_discount + service_amount_after_discount
             = (electricity_amount + service_amount)
               - user_electricity_discount_amount_of_activity
               - user_service_discount_amount_of_activity
               - user_electricity_discount_amount_of_coupon
               - user_service_discount_amount_of_coupon
               （会员优惠本期为 0）
```

#### `t_order_settlement_info` 新增字段（仅 2 列）

| 字段 | 写入时机 | 说明 |
|---|---|---|
| `matched_activity_ids` | 结算 | 命中 type=7/8 活动 ID，逗号分隔 |
| `effective_type` | 结算 | `NONE` / `DISCOUNT` / `COUPON` / `BOTH` |

**刻意不在 settlement 新增的字段（改由 use_record 承担）：**

| 原计划字段 | 冗余对象 | 处理 |
|---|---|---|
| `user_card_coupon_id` | `use_record.user_card_coupon_id` | 不新增 |
| `card_coupon_id` | JOIN `user_card_coupon` | 不新增 |
| `discount_share_flag` | 改存 `use_record` 锁券快照 | 见 use_record 补丁 |
| `coupon_confirm_status` | `use_record.confirm_status` | 不新增 |
| `coupon_fail_reason` | 改存 `use_record.fail_reason` | 见 use_record 补丁 |
| `tenant_id` | `use_record.tenant_id` | 不新增 |

**金额字段与 use_record 的关系：** 基表已有 `user_*_discount_amount_of_coupon` 与 use_record 的 `discount_*_amount` 数值一致，但职责不同——前者是**订单财务结算分项**，后者是**营销中心使用流水**；结算时两处同时写入，不做第三份冗余。

#### `t_marketing_user_card_coupon_use_record` 补丁字段

| 字段 | 写入时机 | 说明 |
|---|---|---|
| `order_code` | 锁券 | 关联订单号（varchar(64)，非 `t_order_info.id` 主键） |
| `discount_share_flag` | 锁券 | 模板 `discount_share_flag` 快照，供结算互斥/共享判断 |
| `fail_reason` | 校验失败回滚 | `confirm_status=2` 时写入未生效原因 |

### 与现有表关系

```
t_order_info (id) ── (1) t_order_settlement_info (order_id)
t_order_info (order_code) ── (0..1) t_marketing_user_card_coupon_use_record (order_code)
  下单锁券时创建 use_record；订单详情 JOIN 两表展示优惠明细
```

**`t_order_info` 不新增营销字段**；`actual_price` / `electricity_price` / `service_price` 仍由计费链路写入，营销结算后以 `settlement_info` 实付分项为准更新 `actual_price`。

### `SaveOrderDTO` 增量

| 字段 | 说明 |
|---|---|
| `userCardCouponId` | 可选，启动前选中的用户卡券 |

## Settlement Algorithm

### Step 1 — 折扣活动（type=7/8）

复用 `MarketingStationDiscountPriceService` 分费项叠加，基于 `electricity_amount` / `service_amount`（或 `t_order_expense_info` 汇总）计算：

```
discElec = electricity_amount - user_electricity_discount_amount_of_activity
discSvc  = service_amount     - user_service_discount_amount_of_activity
```

写入：

- `user_electricity_discount_amount_of_activity`
- `user_service_discount_amount_of_activity`
- `matched_activity_ids`

### Step 2 — 卡券抵扣

按 `card_coupon_type` + `deduction_type` 计算卡券分项抵扣，写入：

- `user_electricity_discount_amount_of_coupon`
- `user_service_discount_amount_of_coupon`

### Step 3 — 共享 / 互斥

```
if discount_share_flag == '1':
  elecAfter = electricity_amount - activityElecDisc - couponElecDisc
  svcAfter  = service_amount     - activitySvcDisc  - couponSvcDisc
  effectiveType = BOTH | DISCOUNT | COUPON | NONE
else:  // 互斥，取用户实付更低
  pathDiscount = 仅活动折后 elec + svc
  pathCoupon   = 原价 - 仅卡券抵扣
  取 min 路径，重算四项 user_*_discount 与 effectiveType
```

最终写入：

- `electricity_amount_after_discount` = elecAfter
- `service_amount_after_discount` = svcAfter

### Step 4 — 结算校验

- 满减/门槛/电量卡限额等以**对应路径计费金额**校验
- **不满足** → `releaseCoupon()`，`use_record.confirm_status=2`，写 `use_record.fail_reason`，settlement 卡券分项清零后按活动折后或无优惠结算
- **满足** → `confirmCoupon()`，`use_record.confirm_status=1`，写入 `discount_*_amount`

### 券状态流转

| 时机 | `used_status` | `use_record.confirm_status` |
|---|---|---|
| 下单锁定 | 0→1 | 0（写 `discount_share_flag` 快照） |
| 结算确认 | 1→2（单次券）/ 保持1（抵用卡） | 1（写 `discount_*_amount`） |
| 校验失败/取消 | 1→0 | 2（写 `fail_reason`） |
| 退款 | 回滚 | 2 |

抵用卡确认后：`available_amount -= 本次卡券抵扣总额`，余额为 0 时 `used_status=2`。

## API Design

### App 增量

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/marketing/coupon/available` | **增强**：`stationId` 必填；返回 `estimatedDiscount`、`unusableReason`、`discountShareFlag` |
| POST | `/marketing/coupon/preview` | **新增**：启动页预估抵扣 |
| — | `saveOrder` | 增 `userCardCouponId`；写/更新 `t_order_settlement_info` |

## App UI（bPay.vue · 汽车充电）

- 支付方式下方增加**优惠券卡片**（选券弹层、预计可省）
- `FREE` / `MONTH_CARD` 隐藏选券
- 下单传 `userCardCouponId`
- 订单详情 JOIN `settlement_info` + `use_record`：原价、活动优惠、卡券优惠、实付；有 `use_record.fail_reason` 时提示

## Payment Modes

| 支付方式 | 营销抵扣影响 |
|---|---|
| 余额付 / 企业余额 | `toPayment` 按 `electricity_amount_after_discount + service_amount_after_discount` 扣余额 |
| 微信预付 | 预付不变；结算退 `预付 - 实付总额` |
| 混合支付 | 补差价按折后实付总额 |

券抵扣在**结算时**确定；启动前 `preview` 仅为估算。

## Error Handling

| 场景 | 处理 |
|---|---|
| 下单锁券失败 | 拒绝下单，提示重新选券 |
| 结算校验不满足 | 自动释放，无券/仅活动结算，写 `use_record.fail_reason` |
| 结算服务异常 | 降级无营销抵扣，记日志；`settlement_type=0` 仍走正常结算 |
| 退款 | 回滚 `use_record.confirm_status=2`；抵用卡恢复 `available_amount` |

## Testing

| 层级 | 范围 |
|---|---|
| 单元测试 | `MarketingChargeSettlementService` 四种券型 + 共享/互斥 + 校验失败；字段映射到 settlement 表 |
| 集成测试 | saveOrder 写选券快照 → orderSettlement 写金额字段 → use_record 确认 |
| 手工 | 余额/预付/企业余额；共享叠加；互斥取优；门槛不满足释放；核对 settlement 分项与 `actual_price` |

## Out of Scope

- 注册/充值/充电自动发券（P2）
- 单车 `mPay.vue`
- `commission_*`、`operator_*_actual_income` 分账回填
- `user_*_discount_amount_of_member` 会员优惠
- 平台/运营商优惠承担金额精确分摊（`platform_total_discount_amount` / `operator_total_discount_amount` 本期可置 0）

## References

- settlement 补丁：`doc/sql/t_order_settlement_info_20260703.sql`
- use_record 补丁：`doc/sql/t_marketing_user_card_coupon_use_record_patch_20260703.sql`
- 卡券共享字段：`doc/sql/t_marketing_card_coupon_discount_share_20260614.sql`
- 折扣算价：`MarketingStationDiscountPriceService`
- 计费入口：`ChargeOrderBillServiceImpl.orderSettlement`
