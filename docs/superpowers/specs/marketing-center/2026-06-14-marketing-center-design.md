# 营销中心功能设计

**Date:** 2026-06-14  
**Approach:** 方案 1 — 统一活动引擎 + 分阶段触发  
**Scope:** 全栈（Java 服务端 + Web 管理端 + 小程序用户端）  
**Phase 1:** 界面 + 管理 API + 半自动领取闭环 ✅  
**Phase 2:** 注册/充值/充电自动触发 ✅（2026-07-13 计划已落地，见 `plans/2026-07-13-marketing-p2-auto-issue-and-gaps.md`）  
**Phase 3:** 订单抵扣 ✅ 汽车核心已通；分账双轨/补款仍待（见结算 Q&A 附录 A）

## Goal

基于现有 **26 张** `t_marketing_*` 表，建设 SaaS 多租户营销中心：租户运营可在 Web 后台创建卡券、配置 **8 类**营销活动（含电站折扣/用户折扣）、管理分组与发放记录；C 端用户可在小程序查看「我的卡券」、扫码领券、券码兑换。第一期交付全部管理界面与用户界面及完整 CRUD/查询 API；注册/充值/充电自动发券、充电订单用券抵扣及折扣活动计费抵扣在后续阶段接入。

## Decisions

| 决策项 | 结论 |
|---|---|
| 实现路径 | **方案 1**：活动基表 + 策略模式，共享发券/范围/奖励逻辑 |
| 表范围 | 以数据库 **`t_marketing_center_20260614.sql`** 归档为准，当前 **26 张**表；会员/积分商城等未建表能力不在本期 |
| 活动类型 | **8 种**全覆盖 UI 与配置 API：注册/充值/定向/充电/扫码/券码兑换/电站折扣/用户折扣 |
| 第一期闭环 | 卡券 CRUD → 活动配置 → **定向发放 / 扫码领取 / 券码兑换** 真实发券 → App 我的卡券 |
| 第二期 | 注册成功、充值支付成功、充电完成 事件钩子自动发券 |
| 第三期 | 充电下单选券、计费抵扣、`t_marketing_user_card_coupon_use_record` 确认/回滚；折扣活动计费抵扣 |
| 租户隔离 | 所有写操作带 `tenant_id`；列表 `@DataScope(tenantColumn=true)` |
| 发起方 | `activity_initiator`：1=平台，2=商户；平台超管可建平台级活动 |
| 成本承担 | `undertaker_type` 记录平台/商户；结算对接留第三期后 |
| ID 生成 | `card_coupon_id`、`activity_id`、`user_card_coupon_id` 使用雪花或 `MK`+时间戳+随机段，保证业务可读 |
| 参考实现 | 对齐意见反馈模块：`sharecharge-biz` Service → web/applet Controller → Web views / UniApp pages |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Web 管理端 (charging-cloud-web)                                     │
│  /marketing                                                          │
│  ├── cardCouponList / cardCouponEdit      卡券管理                   │
│  ├── stationGroupList / userGroupList       分组管理                   │
│  ├── activityHub / activityList             活动管理（8 类型入口 + 列表/抽屉） │
│  ├── receiveRecordList                      领取记录                   │
│  ├── useRecordList                          使用记录（P1 只读）          │
│  └── exchangeCodeList                       兑换码管理（券码活动）       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ /marketing/*
┌──────────────────────────────▼──────────────────────────────────────┐
│  Java (charging-cloud)                                               │
│  sharecharge-biz                                                     │
│  ├── MarketingCardCouponService                                     │
│  ├── MarketingGroupService          (station + user group)          │
│  ├── MarketingActivityService       + 8 × ActivityTypeStrategy      │
│  ├── MarketingIssueService          统一发券（库存/幂等/记录）       │
│  └── MarketingUserCouponService                                     │
│  sharecharge-web-controller    MarketingController (+ 子路由)        │
│  sharecharge-applet-controller AppMarketingController               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│  MySQL t_marketing_* (26 表) + OSS/本地存储（活动图、二维码）          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  App (charging-cloud-uniapp)  pages/subPack/marketing/               │
│  ├── myCoupon          我的卡券                                      │
│  ├── couponDetail      卡券详情                                      │
│  ├── scanReceive       扫码领券                                      │
│  └── codeExchange      券码兑换                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 模块边界

| 模块 | 职责 | 依赖 |
|---|---|---|
| `MarketingCardCouponService` | 卡券模板 CRUD、电站范围、作废、库存统计 | `t_marketing_card_coupon`, `t_marketing_card_coupon_station` |
| `MarketingGroupService` | 电站分组、用户分组及关联维护 | `t_marketing_station_group*`, `t_marketing_user_group*` |
| `MarketingActivityService` | 活动创建/编辑/启停/状态计算；按类型委托 Strategy | 基表 + 8 子表 + scope + reward |
| `MarketingIssueService` | 校验活动规则 → 扣库存 → 写用户卡券 → 写领取记录；幂等 | card_coupon + user_card_coupon + receive_record |
| `MarketingUserCouponService` | 用户卡券分页、详情、后台作废 | `t_marketing_user_card_coupon` |
| `ActivityTypeStrategy` ×8 | 各类型专属字段校验、子表读写、领取入口差异 | 对应 `t_marketing_*_activity` 子表 |
| P2 `MarketingEventListener` | 监听注册/充值/充电事件，调用 IssueService | 第二期 |
| P3 `MarketingCouponSettlementHook` | 订单计费前后选券、抵扣、确认/回滚；折扣活动费率抵扣 | `ChargeOrderBillServiceImpl`，第三期 |

## Data Model

### 表总览（26 张）

| 分组 | 表 |
|------|-----|
| 卡券模板 | `t_marketing_card_coupon`, `t_marketing_card_coupon_station` |
| 活动核心 | `t_marketing_card_coupon_activity`, `t_marketing_card_coupon_activity_reward`, `t_marketing_card_coupon_activity_station_scope`, `t_marketing_card_coupon_activity_user_scope` |
| 发券类子配置 | `t_marketing_recharge_activity`, `t_marketing_directional_activity`, `t_marketing_charge_activity`, `t_marketing_scan_activity`, `t_marketing_exchange_activity`, `t_marketing_exchange_activity_conversion_code` |
| 折扣类子配置 | `t_marketing_station_discount_activity`, `t_marketing_station_discount_activity_station`, `t_marketing_station_discount_activity_time_slot`, `t_marketing_user_discount_activity`, `t_marketing_user_discount_activity_participant`, `t_marketing_user_discount_activity_time_slot` |
| 分组主数据 | `t_marketing_station_group`, `t_marketing_station_group_relation_station`, `t_marketing_user_group`, `t_marketing_user_group_relation_station`, `t_marketing_user_group_relation_user` |
| 运行时 | `t_marketing_card_coupon_activity_receive_record`, `t_marketing_user_card_coupon`, `t_marketing_user_card_coupon_use_record` |

### 全局 ER 关系（逻辑）

```
t_marketing_card_coupon ──< t_marketing_card_coupon_station
        │
        │ reward_id
        ▼
t_marketing_card_coupon_activity ──< t_marketing_card_coupon_activity_reward
        │                          ──< t_marketing_card_coupon_activity_station_scope
        │                          ──< t_marketing_card_coupon_activity_user_scope
        │
        ├── (type=2) t_marketing_recharge_activity
        ├── (type=3) t_marketing_directional_activity
        ├── (type=4) t_marketing_charge_activity
        ├── (type=5) t_marketing_scan_activity
        ├── (type=6) t_marketing_exchange_activity
        │              └── t_marketing_exchange_activity_conversion_code
        ├── (type=7) t_marketing_station_discount_activity
        │              ├── t_marketing_station_discount_activity_station
        │              └── t_marketing_station_discount_activity_time_slot
        └── (type=8) t_marketing_user_discount_activity
                       ├── t_marketing_user_discount_activity_participant
                       └── t_marketing_user_discount_activity_time_slot

t_marketing_station_group ──< t_marketing_station_group_relation_station
t_marketing_user_group    ──< t_marketing_user_group_relation_user
                          ──< t_marketing_user_group_relation_station

t_marketing_card_coupon_activity_receive_record
t_marketing_user_card_coupon ──< t_marketing_user_card_coupon_use_record
```

**说明：** 注册领取（type=1）无专属子表。类型 7/8 为折扣活动，不写 `reward`；类型 8 参与用户写 `participant` 表，**不写** `user_scope` 表。

---

### 活动录入数据表关系（按类型）

> Web 管理端新建/编辑活动时实际落库。统一入口：`MarketingActivityServiceImpl.save()` → 各 `ActivityTypeStrategy.saveSubConfig()`。关联键均为 `activity_id`。

#### 统一保存流程

```
MarketingActivitySaveDTO
├── activity          → t_marketing_card_coupon_activity（INSERT/UPDATE）
├── rewards[]         → t_marketing_card_coupon_activity_reward（先删后插）
├── stationScopes[]   → t_marketing_card_coupon_activity_station_scope（先删后插，按类型可选）
├── userScopes[]      → t_marketing_card_coupon_activity_user_scope（先删后插，按类型可选；类型 8 不写）
└── subConfig         → 各活动类型专属子表（Strategy 内先物理/逻辑删后插）
```

#### 公共表说明

| 表名 | 作用 | 使用范围 |
|------|------|----------|
| `t_marketing_card_coupon_activity` | 活动主表：名称、类型、发起方、时间、状态、说明/规则 | 全部 8 种活动 |
| `t_marketing_card_coupon_activity_reward` | 活动关联卡券及数量；充值活动含 `reward_threshold` | 类型 1–6；类型 7/8 无 |
| `t_marketing_card_coupon_activity_station_scope` | 参与电站明细（`data_id`=电站 ID） | 类型 4（非全部电站）、7、8 |
| `t_marketing_card_coupon_activity_user_scope` | 参与用户/客户明细 | 类型 3–6（非全部用户时）；**类型 8 不用** |

#### 类型 1：注册领取（activity_type=1）

```
t_marketing_card_coupon_activity
└── t_marketing_card_coupon_activity_reward
```

| 表 | 作用 |
|----|------|
| `t_marketing_card_coupon_activity` | 活动基础信息；`activity_rule` 可存注册规则图 |
| `t_marketing_card_coupon_activity_reward` | 注册成功后发放的卡券列表 |

#### 类型 2：充值领取（activity_type=2）

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_reward
└── t_marketing_recharge_activity（1:1，uk_activity_id）
```

| 表 | 作用 |
|----|------|
| `t_marketing_card_coupon_activity` | 活动基础信息；`activity_rule` 存规则图 |
| `t_marketing_card_coupon_activity_reward` | 多档位卡券；`reward_threshold` 区分充值金额档 |
| `t_marketing_recharge_activity` | `limit_type`、`limit_count` 限领规则 |

#### 类型 3：定向发放（activity_type=3）

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_reward
├── t_marketing_card_coupon_activity_user_scope
└── t_marketing_directional_activity（1:1）
```

| 表 | 作用 |
|----|------|
| `t_marketing_card_coupon_activity_reward` | 定向发放的卡券 |
| `t_marketing_card_coupon_activity_user_scope` | 发放对象；`org_type`：1=客户、2=用户分组、4=指定手机号 |
| `t_marketing_directional_activity` | `send_type`、`send_time`、`user_scope`、`send_status` |

#### 类型 4：充电领取（activity_type=4）

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_reward
├── t_marketing_card_coupon_activity_station_scope（station_scope≠3 时）
├── t_marketing_card_coupon_activity_user_scope（user_scope≠3 时）
└── t_marketing_charge_activity（1:1）
```

| 表 | 作用 |
|----|------|
| `t_marketing_card_coupon_activity_station_scope` | 限定电站；商户发起仅可选归属电站 |
| `t_marketing_card_coupon_activity_user_scope` | 限定参与用户 |
| `t_marketing_charge_activity` | `limit_power`、`limit_type`/`limit_count`、`station_scope`/`user_scope` |

#### 类型 5：扫码领取（activity_type=5）

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_reward
├── t_marketing_card_coupon_activity_user_scope
└── t_marketing_scan_activity（1:1，含 qrcode）
```

#### 类型 6：券码兑换（activity_type=6）

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_reward
├── t_marketing_card_coupon_activity_user_scope
├── t_marketing_exchange_activity（1:1）
└── t_marketing_exchange_activity_conversion_code（批量生成，非创建时写入）
```

#### 类型 7：电站折扣（activity_type=7）

> 不发卡券。参与电站走 scope 表；费率走专属子表。编辑时子表 **物理删除** 后重插（避免 `uk_activity_id` 冲突）。

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_station_scope（必选）
└── t_marketing_station_discount_activity（1:1，uk_activity_id）
    ├── t_marketing_station_discount_activity_station（discount_value_mode=2 时）
    └── t_marketing_station_discount_activity_time_slot
```

| 表 | 作用 |
|----|------|
| `t_marketing_station_discount_activity` | 折扣类型、优惠方式、费率、`discount_value_mode`、`station_scope_type`、`week_days` |
| `t_marketing_station_discount_activity_station` | 分电站差异化费率 |
| `t_marketing_station_discount_activity_time_slot` | 每日可用时段 HH:mm |

#### 类型 8：用户折扣（activity_type=8）

> 不发卡券。参与电站走 scope 表；参与用户写 **participant** 表（不写 `user_scope`）。

```
t_marketing_card_coupon_activity
├── t_marketing_card_coupon_activity_station_scope（必选）
└── t_marketing_user_discount_activity（1:1，uk_activity_id）
    ├── t_marketing_user_discount_activity_participant
    └── t_marketing_user_discount_activity_time_slot
```

| 表 | 作用 |
|----|------|
| `t_marketing_user_discount_activity` | 折扣/费率、`user_scope_type`（1=用户分组，2=选择客户）、`station_scope_type` |
| `t_marketing_user_discount_activity_participant` | 参与对象；`participant_type`：1=用户分组、2=客户 |
| `t_marketing_user_discount_activity_time_slot` | 生效时段 HH:mm |

#### 卡券模板录入（非活动）

```
t_marketing_card_coupon
└── t_marketing_card_coupon_station（scope_type=按电站时）
```

#### 分组主数据（圈选前置配置）

```
t_marketing_station_group → t_marketing_station_group_relation_station
t_marketing_user_group → relation_station / relation_user
```

---

**卡券类型 `card_coupon_type`**

| 值 | 含义 | 使用逻辑 |
|---|---|---|
| 1 | 抵用卡 | `available_amount` 面额余额，可多次扣减直至用完（P3） |
| 2 | 满减券 | 满 `amount_limit` 减 `face_value` |
| 3 | 电量卡 | 面额单位「度」，`daily_limit_value`/`order_limit_value` 限额 |
| 4 | 折扣券 | `face_value` 为折扣%；`amount_limit` 为折扣上限（元） |

**活动类型 `activity_type`**

| 值 | 名称 | 子表 | P1 能力 |
|---|---|---|---|
| 1 | 注册领取 | 无 | 仅配置；P2 注册钩子发券 |
| 2 | 充值领取 | `t_marketing_recharge_activity` | 仅配置；P2 充值回调按门槛发券 |
| 3 | 定向发放 | `t_marketing_directional_activity` | **立即/定时发放** |
| 4 | 充电领取 | `t_marketing_charge_activity` | 仅配置；P2 充电完成发券 |
| 5 | 扫码领取 | `t_marketing_scan_activity` | **扫码领取** |
| 6 | 券码兑换 | `t_marketing_exchange_activity` + conversion_code | **券码兑换** |
| 7 | 电站折扣 | `t_marketing_station_discount_activity` + station + time_slot | **配置保存**；P3 计费抵扣 |
| 8 | 用户折扣 | `t_marketing_user_discount_activity` + participant + time_slot | **配置保存**；P3 计费抵扣 |

**活动状态 `activity_status`**

| 值 | 含义 | 触发 |
|---|---|---|
| 1 | 进行中 | 当前时间在 begin~end 且库存充足 |
| 2 | 未开始 | 当前时间 < begin |
| 3 | 已结束(手动停用) | 运营点击停用 |
| 4 | 已结束(活动到期) | 当前时间 > end |
| 5 | 已结束(卡券不足) | `issued_num >= stock_num` |
| 6 | 已结束(卡券失效) | 关联卡券 `cancel_flag=1` |

**用户卡券状态 `used_status`**

| 值 | 含义 |
|---|---|
| 0 | 未使用 |
| 1 | 使用中（订单锁定，P3） |
| 2 | 已使用 |
| 3 | 已过期（定时任务或查询时标记） |
| 4 | 已作废 |

### 卡券模板 `t_marketing_card_coupon` 关键字段

| 字段 | 说明 |
|---|---|
| card_coupon_id | 业务主键 |
| card_coupon_type | 1 抵用卡 / 2 满减券 / 3 电量卡 / 4 折扣券 |
| undertaker_type / undertaker_id | 成本承担方 |
| deduction_type | 1 电费 / 2 服务费 / 3 总费用 |
| power_percentage / service_percentage | 折扣比例（优惠券） |
| face_value | 面额 |
| amount_limit | 满减门槛 |
| effective_time_type | 1 领取后 N 天 / 2 固定起止 |
| scope_type | 1 城市 / 2 商户 / 3 电站分组 / 4 全部 / 5 指定电站 |
| stock_num / issued_num / cancel_num | 库存三态 |
| lock_activity_id | 被活动锁定库存时填写 |

### 活动基表 `t_marketing_card_coupon_activity` 关键字段

| 字段 | 说明 |
|---|---|
| activity_id | 业务主键 |
| activity_type | 1~8 |
| activity_initiator / activity_initiator_id | 平台(0) 或商户 ID |
| activity_begin_time / activity_end_time | 活动窗口 |
| activity_stop_time | 手动停用时间 |
| activity_status | 见上表 |

### 各活动子表差异（配置向导第二步）

| 类型 | 子表特有字段 | 配置要点 |
|---|---|---|
| 注册(1) | — | 仅基表 + 奖励 + 用户范围；每人限领在 reward 或全局默认 1 次 |
| 充值(2) | limit_type, limit_count | reward.reward_threshold 充值满额阶梯 |
| 定向(3) | send_type, send_time, user_scope, send_status | 用户范围含「指定用户」；P1 支持立即发放 |
| 充电(4) | limit_power, limit_type, limit_count, station_scope, user_scope | 满 N 度可领；电站/用户范围 |
| 扫码(5) | activity_title, activity_image, limit_*, user_scope, qrcode | 保存后生成小程序码 URL |
| 券码(6) | send_total_count, user_scope | 批量生成 conversion_code；导出 Excel |
| 电站折扣(7) | discount_value_mode, discount_type, rate_*, station_scope_type, week_days | + station_scope；分电站费率写 `station_discount_activity_station` |
| 用户折扣(8) | discount_type, rate_*, user_scope_type, station_scope_type | + station_scope + participant（不写 user_scope） |

## Backend API Design

### 约定

- Web 前缀：`/marketing`，权限 `:marketing:<resource>:<action>`
- App 前缀：`/marketing`，参数带 `tenantId`，用户身份从 token 取 `userId`
- 响应：`ResultUtil` 统一包装
- 分页：沿用 `page` + `limit`；Web 列表返回 `total` + `records`
- 写操作：事务 + `tenant_id` + `admin_id` 写入

### Web 管理端 API

#### 卡券管理

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/marketing/cardCoupon/page` | `:marketing:cardCoupon:view` | 分页列表，筛：名称/类型/状态/批次 |
| GET | `/marketing/cardCoupon/{cardCouponId}` | view | 详情含电站范围 |
| POST | `/marketing/cardCoupon` | edit | 新增 |
| PUT | `/marketing/cardCoupon` | edit | 编辑（已发放不可改面额/类型） |
| POST | `/marketing/cardCoupon/cancel` | edit | 作废；`cancel_flag=1`，未使用用户券同步作废 |
| GET | `/marketing/cardCoupon/stations` | view | 按 scope_type 查可选电站/分组 |

#### 分组管理

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/marketing/stationGroup/page` | `:marketing:group:view` | 电站分组列表 |
| POST | `/marketing/stationGroup` | edit | 新增含关联电站 |
| PUT | `/marketing/stationGroup` | edit | 编辑 |
| DELETE | `/marketing/stationGroup/{id}` | edit | 软删；被活动引用时禁止 |
| GET | `/marketing/userGroup/page` | view | 用户分组列表 |
| POST | `/marketing/userGroup` | edit | 新增；支持导入用户手机号 |
| PUT | `/marketing/userGroup` | edit | 编辑 |
| DELETE | `/marketing/userGroup/{id}` | edit | 软删 |

#### 活动管理

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/marketing/activity/page` | `:marketing:activity:view` | 统一活动列表，筛：类型/状态/名称 |
| GET | `/marketing/activity/{activityId}` | view | 详情聚合：基表+子表+rewards+scopes |
| POST | `/marketing/activity` | edit | 创建（body 含 `activityType` + 子表 DTO） |
| PUT | `/marketing/activity` | edit | 编辑（进行中限制字段） |
| POST | `/marketing/activity/stop` | edit | 手动停用 → status=3 |
| POST | `/marketing/activity/directional/send` | edit | **定向发放执行**（P1） |
| GET | `/marketing/activity/scan/qrcode` | view | 重新生成扫码活动二维码 |
| POST | `/marketing/activity/exchange/generateCodes` | edit | 批量生成兑换码 |
| GET | `/marketing/activity/exchange/exportCodes` | view | 导出兑换码 Excel |

#### 记录查询

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/marketing/receiveRecord/page` | `:marketing:record:view` | 领取记录 |
| GET | `/marketing/useRecord/page` | view | 使用记录（P1 只读，P3 有数据） |
| GET | `/marketing/userCoupon/page` | view | 按用户查持卡（客服查询） |
| POST | `/marketing/userCoupon/cancel` | edit | 作废单张用户券 |

### App 用户端 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/marketing/coupon/myList` | 我的卡券；参：`status`(0/2/3)、`page`、`limit` |
| GET | `/marketing/coupon/detail` | 参：`userCardCouponId`；含可用电站摘要 |
| GET | `/marketing/coupon/available` | 当前站点可用券（P1 返回列表；P3 下单用） |
| GET | `/marketing/activity/scan/detail` | 参：`activityId`；扫码落地页信息 |
| POST | `/marketing/activity/scan/receive` | 扫码领取 |
| POST | `/marketing/activity/exchange/redeem` | 券码兑换；body：`conversionCode` |
| GET | `/marketing/activity/list` | 进行中活动列表（运营位，P1 可选） |

### 统一发券核心流程 `MarketingIssueService#issue`

```
输入: activityId, userId, issueChannel(定向/扫码/兑换/事件)
  1. 加载活动+子表+rewards，校验 activity_status=1
  2. 校验用户范围（user_scope + user_group / org / 指定用户）
  3. 校验限领次数（limit_type + limit_count + receive_record 计数）
  4. 对每个 reward：
       a. 加载 card_coupon，校验未作废、库存充足
       b. UPDATE card_coupon SET issued_num = issued_num + count WHERE stock - issued - cancel >= count
       c. INSERT t_marketing_user_card_coupon（计算 start_time/end_time）
       d. 抵用卡：available_amount = face_value
  5. INSERT receive_record
  6. 若库存不足 → 更新活动 status=5
  7. 返回用户卡券列表
```

**幂等：** 扫码/兑换接口以 `(activity_id, user_id, 自然日)` 或 `conversion_code` 唯一约束防重复。

## Web 管理端设计

### 菜单位置

新建一级菜单 **营销中心**（`db_menu`，`parent_id=0` 或挂运营管理下，建议独立一级便于 SaaS 运营）。

| 菜单 | 路由 | 组件 |
|---|---|---|
| 卡券管理 | `/marketing/cardCouponList` | `views/marketing/cardCouponList.vue` |
| 电站分组 | `/marketing/stationGroupList` | `views/marketing/stationGroupList.vue` |
| 用户分组 | `/marketing/userGroupList` | `views/marketing/userGroupList.vue` |
| 活动管理 | `/marketing/activityHub` | `views/marketing/activityHub.vue`（8 类型入口） |
| 活动列表 | `/marketing/activityList` | `views/marketing/activityList.vue`（按类型筛选） |
| 领取记录 | `/marketing/receiveRecordList` | `views/marketing/receiveRecordList.vue` |
| 使用记录 | `/marketing/useRecordList` | `views/marketing/useRecordList.vue` |

隐藏路由：`cardCouponEdit`、`exchangeCodeList`。活动新建/编辑/详情使用 **Drawer 抽屉**（`ActivityFormDrawer`、`DiscountActivityFormDrawer` 等），不再使用五步向导页。

### 页面要点

**卡券列表** — 列：名称、类型（抵用卡/满减券/电量卡/折扣券）、面额、库存/已发/作废、承担方、状态、创建时间；操作：编辑、作废、发放明细。

**活动 Hub** — 8 张活动类型卡片，点击进入对应 `activityList?activityType=`。

**活动列表** — 按类型展示；类型 1–6 用 `ActivityFormDrawer`；类型 7/8 用 `DiscountActivityFormDrawer`/`DiscountActivityDetailDrawer`。

**卡券编辑** — 分步表单：基本信息 → 优惠规则（类型联动显示折扣/面额/门槛）→ 有效期 → 可用范围（scope_type 联动城市/商户/分组/电站多选）。

**活动列表** — 列：名称、类型标签、发起方、状态、时间窗、已领取人数；操作：编辑、停用、定向发放（type=3）、下载二维码（type=5）、管理兑换码（type=6）。类型 7/8 无发券操作。

**活动编辑** — Drawer 分步/分区表单：基础信息 → 类型配置（子表字段）→ 卡券奖励（1–6）/ 折扣费率（7/8）→ 电站/用户范围。

**定向发放** — 弹窗确认用户范围人数 → 立即发放或展示定时任务已创建；列表刷新 `send_status`。

**兑换码管理** — 生成数量、已兑换/未兑换筛选、导出；码状态与 `conversion_status` 同步。

### 权限 seed（SQL 模板）

```sql
-- 父菜单 营销中心 id=820（示例，实施时查 max id）
-- 子菜单 + 按钮权限 :marketing:cardCoupon:view/edit 等
-- 角色授权：role 1,2,3（平台/租户/商户管理员）
```

## App 用户端设计

### 页面路径（`pages/subPack/marketing/`）

| 页面 | 路径 | 入口 |
|---|---|---|
| 我的卡券 | `myCoupon/myCoupon` | 个人中心「我的卡券」；页内含券码兑换 |
| 充值活动页 | `rechargeActivity/rechargeActivity` | 充值页「充值有礼」入口 |
| 卡券详情 | `couponDetail/couponDetail` | 我的卡券点击 |
| 扫码领券 | `scanReceive/scanReceive` | 扫描活动小程序码 `scene=activityId` |

**已移除（2026-07-18）：** 独立页 `codeExchange`、`activityList`（活动中心）及 `pages.json` 路由；兑换能力保留在「我的卡券」页内。

### 我的卡券

- Tab：未使用 / 已使用 / 已过期
- 卡片：名称、面额、有效期、适用说明摘要
- 抵用卡显示剩余 `available_amount`
- 页内券码兑换（调用 `exchangeRedeem`，无独立兑换页）
- 下拉刷新 + 分页加载

### 扫码领券

- 展示 `activity_title`、`activity_image`、规则
- 领取按钮 → 调用 `scan/receive` → 成功跳转我的卡券
- 失败提示：已领完、不在范围、活动结束等

## Phase 1 详细开发步骤

以下步骤按依赖顺序排列，每步完成后可独立联调验证。

### 步骤 1：数据库与基础实体（Java）

**仓库：** `charging-cloud`

- [ ] 1.1 将 26 张表 DDL 归档至 `doc/sql/t_marketing_center_20260614.sql`（含折扣增量补丁）
- [ ] 1.2 `sharecharge-biz` 新增 entity：26 个 `@TableName` 实体，字段与表一一对应
- [ ] 1.3 新增 Mapper 接口 + `mapper/*.xml`（MyBatis-Plus `BaseMapper` 为主，复杂查询写 XML）
- [ ] 1.4 新增枚举类：`CardCouponTypeEnum`（含折扣券）、`ActivityTypeEnum`（含 7/8）、`ActivityStatusEnum`、`UserCouponStatusEnum`、`ScopeTypeEnum`

**验证：** 单元测试 Mapper 插入/查询一条卡券记录。

### 步骤 2：卡券管理服务

- [ ] 2.1 `MarketingCardCouponService`：分页、详情、新增、编辑、作废
- [ ] 2.2 作废逻辑：模板 `cancel_flag=1`；未使用用户券 `used_status=4`；活动关联检查
- [ ] 2.3 电站范围：按 `scope_type` 写入 `t_marketing_card_coupon_station`
- [ ] 2.4 `MarketingCardCouponController`（web）+ 权限注解

**验证：** Postman 创建抵用卡、满减券、电量卡、折扣券各一张，列表可查。

### 步骤 3：分组管理服务

- [ ] 3.1 `MarketingGroupService`：电站分组、用户分组 CRUD
- [ ] 3.2 用户分组支持批量导入 `relation_user`（手机号匹配 `t_app_user`）
- [ ] 3.3 Web API + 删除前引用检查（被活动 scope 引用则拒绝）

**验证：** 创建一个电站分组（3 个站）、一个用户分组（10 个用户）。

### 步骤 4：活动策略框架

- [ ] 4.1 定义 `ActivityTypeStrategy` 接口：`saveSubConfig`、`loadSubConfig`、`validateOnSave`
- [ ] 4.2 实现 **8** 个 Strategy 类（含 `StationDiscountActivityStrategy`、`UserDiscountActivityStrategy`）
- [ ] 4.3 `MarketingActivityService`：创建/编辑时写基表 + 委托 Strategy + 写 reward/scope 关联表
- [ ] 4.4 `calcActivityStatus` 定时或查询时刷新状态（未开始→进行中→到期）
- [ ] 4.5 活动创建时：若奖励锁定库存，更新 `card_coupon.lock_activity_id`

**验证：** 为 8 种类型各创建一条活动（可先不发放/不抵扣），详情接口返回完整聚合 DTO。

### 步骤 5：统一发券服务

- [ ] 5.1 `MarketingIssueService#issue` 实现（见上文流程）
- [ ] 5.2 用户范围校验器：按 org / user_group / 指定用户 / 全部
- [ ] 5.3 限领校验：查 `receive_record` 按 `limit_type` 计数
- [ ] 5.4 库存乐观锁 SQL：`UPDATE ... WHERE issued_num + ? <= stock_num - cancel_num`
- [ ] 5.5 计算用户券有效期：相对天数 or 模板固定区间

**验证：** 单元测试：库存扣减、超限拒绝、范围外用户拒绝。

### 步骤 6：P1 可测领取能力

- [x] 6.1 定向发放：`POST /marketing/activity/directional/send` → 批量调用 IssueService
- [x] 6.2 扫码活动：保存时生成 `qrcode`（小程序码 scene）；`AppMarketingController` 扫码详情+领取
- [x] 6.3 券码兑换：批量生成码；兑换接口校验 `conversion_status=0` 后发券并更新码状态
- [x] 6.4 注册/充值/充电活动：P2 自动发券已接通（事件 + IssueService）

**验证端到端：** Web 建券 → 建扫码活动 → 手机扫码 → 我的卡券可见。

### 步骤 7：用户卡券查询

- [x] 7.1 `MarketingUserCouponService`：分页、详情、后台作废
- [x] 7.2 App `myList` / `detail`；过期券定时任务（`TaskService.expireMarketingUserCoupons`，需配 XXL-JOB）
- [x] 7.3 Web 领取记录、用户持卡查询页 API

**验证：** App 三个 Tab 列表正确；后台可按活动查领取记录。

### 步骤 8：Web 管理端页面

**仓库：** `charging-cloud-web`

- [x] 8.1 `src/api/marketing.js` 封装全部 API
- [x] 8.2 `router/index.js` 注册 `/marketing` 路由组
- [x] 8.3 `doc/sql/t_marketing_menu_permissions_20260614.sql` 菜单与权限 seed
- [x] 8.4 卡券列表 + 编辑页（含范围选择器组件 `StationScopePicker`、`UserScopePicker`）
- [x] 8.5 分组列表 + 编辑弹窗
- [x] 8.6 `activityHub` + `activityList` + 各类型 Form/Detail Drawer
- [x] 8.7 定向发放弹窗、兑换码管理页、领取/使用记录列表

**验证：** 运营全流程仅通过 Web 完成配置，无需 Postman。

### 步骤 9：App 用户端页面

**仓库：** `charging-cloud-uniapp`

- [x] 9.1 `api/marketing.js`
- [x] 9.2 `pages.json` 注册营销相关页面
- [x] 9.3 `myCoupon` + `couponDetail`（独立详情页）
- [x] 9.4 `scanReceive`（`onLoad` 解析 `scene` 或 `activityId` 参数）
- [x] 9.5 券码兑换：曾独立 `codeExchange` 页 → **2026-07-18 已删除页面**；兑换保留在 `myCoupon` 页内
- [x] 9.6 C 端入口演进：个人中心「我的卡券」保留；首页悬浮角标 → 站列表「X张券可用」；「活动中心」/`activityList` 于 2026-07-17 去入口、**2026-07-18 删页**；充值领取走 `recharge.vue`「充值有礼」（见 `2026-07-16-marketing-b-ux-revision-design.md`）

**验证：** 真机扫码 → 领券 → 个人中心查看详情。

### 步骤 10：联调与文档收尾

- [ ] 10.1 三端联调清单走一遍（见下表）
- [ ] 10.2 Swagger 补充 `@Api` 标签「营销中心」
- [ ] 10.3 编写 `docs/superpowers/plans/marketing-center/2026-06-14-marketing-center.md` 实施计划（本设计审批后）

#### P1 联调验收清单

| # | 场景 | 预期 |
|---|---|---|
| 1 | 租户 A 创建卡券 | 租户 B 不可见 |
| 2 | 创建扫码活动并领取 | 库存减 1，receive_record 有记录 |
| 3 | 同一用户超限领取 | 返回明确错误 |
| 4 | 定向发放指定用户分组 | 仅组内用户 myList 可见 |
| 5 | 券码兑换 | 码状态变已兑换，二次兑换失败 |
| 6 | 作废卡券模板 | 未使用用户券同步作废 |
| 7 | 停用活动 | status=3，不可再领取 |
| 8 | 注册/充值/充电活动 | 可保存、可展示，领取按钮隐藏或提示待开通 |
| 9 | 电站/用户折扣活动 | 可保存参与电站与用户/客户；计费抵扣待 P3 |

## Phase 2：自动触发

> **状态：✅ 已实现**（分支 `develop/charging-marketing`，计划 `2026-07-13-marketing-p2-auto-issue-and-gaps.md`）

| 触发点 | 接入位置 | 行为 | 状态 |
|---|---|---|---|
| 注册领取 | `AppUserController.loginOrRegisterByPhone` 新用户 `save` 后 | 查 type=1 进行中活动，`IssueChannelEnum.EVENT` | ✅ |
| 充值领取 | `AppPayController.checkout` 余额充值成功后 | 按 `reward_threshold` 最高匹配档发券 | ✅ |
| 充电领取 | `ChargeOrderBillServiceImpl`（`orderSettlement` + `noPeriodElectricOrderSettlement`） | 累计度数达 `limit_power`，type=4 发券 | ✅ |

实现方式：Spring 事件 `MarketingTriggerEvent` + `MarketingEventListener` + `MarketingEventIssueService`。

## Phase 3：订单抵扣

> **状态：核心 ✅ / 分账补款代码 ✅**（汽车选券、折扣活动、抵用卡/电量卡结算已通；双轨与补款见计划 `2026-07-14-marketing-remaining-gaps.md` Workstream A；待 DBA SQL + 联调）

| 步骤 | 说明 | 状态 |
|---|---|---|
| 下单选券 | App 充电支付页调用 `coupon/available`，用户选择 `userCardCouponId` | ✅ 汽车 |
| 卡券计费抵扣 | 结算链路营销结算服务 | ✅ 汽车 |
| 折扣活动抵扣 | 匹配 type=7/8 活动 | ✅ 汽车 |
| 锁定 | 用户券预锁 + use_record | ✅ |
| 确认 | 支付成功确认 | ✅ |
| 回滚 | 订单取消/退款回滚 | ✅ 部分协议；OCPP 起充失败释券待 Workstream C |
| 结算汇总 | `platform_total_*` / `operator_total_*` 按 `discount_source` 聚合 | ✅ |
| 分账双轨 / 平台补款 | `split_base_type`、台账双基数、出款 cap、补款台账+线下确认 | ✅ 代码完成（待 SQL/验收） |

## Error Handling

| 场景 | 处理 |
|---|---|
| 库存不足 | 活动置 status=5；接口返回「卡券已领完」 |
| 不在用户范围 | 返回「不在活动范围」 |
| 超限领取 | 返回「已达领取上限」 |
| 活动未开始/已结束 | 返回对应文案，不写库 |
| 并发领取 | 库存 UPDATE 行锁 + 领取记录唯一约束 |
| 作废已使用券 | 拒绝，提示已使用 |

## Testing

| 层级 | 范围 |
|---|---|
| 单元测试 | IssueService 库存/限领/范围；ActivityStatus 计算 |
| 集成测试 | Web API 创建活动全链路；App 领取 API |
| 手工 | P1 联调验收清单 9 项 |

## Out of Scope（相对营销中心首期设计）

- 会员等级、积分、积分商城相关表与界面
- ~~注册/充值/充电自动发券（P2）~~ → **已完成**（`2026-07-13-marketing-p2-auto-issue-and-gaps.md`）
- ~~折扣活动（7/8）计费侧抵扣（P3 核心）~~ → **汽车已完成**
- ~~营销成本分账双轨 / 平台补款入账~~ → **代码已完成**（`2026-07-14-marketing-remaining-gaps.md` Workstream A；待 SQL/验收；代付自动打款仍不做）
- 异常单结算营销钩子 / OCPP 起充失败释券（Workstream C，待做）
- 订阅消息推送（领券成功通知可作为增强）
- 单车（`ruleId≠2`）营销价与用券

## References

- 表结构：`doc/sql/t_marketing_center_20260614.sql`（26 张表）；折扣增量见 `doc/sql/t_marketing_*_discount_*_20260614.sql`
- 活动录入表关系：本文 **Data Model → 活动录入数据表关系** 章节
- 实施计划：`docs/superpowers/plans/marketing-center/2026-06-14-marketing-center.md`
- 参考模块：意见反馈 `FeedbackController` / `FeedbackConfigServiceImpl` / `pages/subPack/feedback/`
- 数据权限：`@DataScope` + `tenant_id`
- 菜单 seed 参考：`doc/sql/t_feedback_menu_permissions_20260613.sql`
