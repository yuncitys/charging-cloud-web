# 营销 Workstream B UX 修订设计

**日期：** 2026-07-16  
**分支：** `develop/charging-marketing`  
**关联：** `docs/superpowers/plans/2026-07-14-marketing-remaining-gaps.md` Workstream B  

## 背景

Workstream B 已落地首页「卡券」角标与活动中心入口，但存在两处体验问题：

1. 首页角标展示的是**全局未使用券数**，与「当前电站能否用」无关，决策价值弱。
2. 「充值领取」活动在活动中心无独立落地页；用户只能走钱包 `recharge.vue`（套餐档位与营销活动无关），支付成功后靠后端事件自动发券，活动规则/档位对用户不可见。

## 目标

| # | 目标 |
|---|------|
| 1 | 去掉首页悬浮卡券角标；在汽车站列表按站展示「X张券可用」 |
| 2 | 新建独立「充值活动页」，档位与后台充值领取活动配置一致；支付复用现有统一支付接口 |

## 非目标

- 不改 `recharge.vue` 套餐配置与页面逻辑
- 「X张券可用」不可点击、不跳转（仅展示）
- 充值成功后不跳转「我的卡券」，仅提示
- 单车站本轮不展示券数
- Workstream C、订阅消息、企业代付不在范围

---

## 一、电站「X张券可用」

### 1.1 口径

- **统计：** 当前登录用户在该站**已持有且可用**的卡券数量  
- **对齐：** 与起充页 `GET /marketing/coupon/available`（`MarketingUserCouponService.available` + `matchStation`）同一套规则  
- **未登录：** 不展示文案（字段可 null / 0）  
- **单车（`ruleId≠2`）：** 本轮不展示

### 1.2 后端

- `NetworkDotListVo` 增加 `availableCouponCount`（Integer）
- 在 `NetworkDotServiceImpl.enrichDiscountPricing` 同路径扩展：对登录用户 + 汽车站，批量计算并写入  
  - 复用现有用户未使用券列表 + `matchStation`，避免按站 N 次 HTTP  
  - 实现可抽包级方法（如 `countAvailableByStations(userId, tenantId, stationIds)`）供列表复用
- 列表接口 `getNetWorkList` 对 App 返回该字段即可，无需新 URL

### 1.3 前端（uniapp）

- **删除** `home.vue` 悬浮「卡券」入口及 `couponCount` / `loadCouponCount` 相关逻辑
- **汽车站卡片**（`home.vue`、`siteList.vue` 对齐）：价格行旁（紧挨 `ActivityPrice`）  
  - 当 `availableCouponCount > 0` 显示文案：`{{n}}张券可用`  
  - **仅展示**，不绑定点击跳转
- 个人中心「我的卡券」入口保留（不受影响）

### 1.4 验收

| # | 场景 | 期望 |
|---|------|------|
| S1 | 登录用户，某站有 2 张可用券 | 该站卡片显示「2张券可用」；其它站按各自数量 |
| S2 | 有券但该站不匹配 | 该站不显示文案 |
| S3 | 未登录 | 无「X张券可用」、无悬浮角标 |
| S4 | 首页 | 无右下角「卡券」悬浮入口 |

---

## 二、独立充值活动页

### 2.1 产品关系

| 页面 | 档位来源 | 用途 |
|------|----------|------|
| `recharge.vue` | `findPayMoney` 充值套餐（可含赠送余额） | 日常钱包充值，与营销活动无关 |
| **新页** `rechargeActivity` | 后台「充值领取」活动 `rewardThreshold` 梯度 | 展示活动档位与赠券，按档充值余额 |

两者**不共用 UI、不共用档位数据**；支付通道一致。

### 2.2 页面与路由

- 新建：`pages/subPack/marketing/rechargeActivity/rechargeActivity.vue`
- `pages.json` 注册；标题建议「充值有礼」或活动名
- 入参：`activityId`（必填）

**展示内容：**

- 活动名称、有效时间
- 规则图（若活动有 `ruleImage` / 等价字段）
- 档位列表：按 `rewardThreshold` 聚合，展示「充值满 X 元」及该档卡券名称、张数
- 用户选择一档 → 主按钮「立即充值」

**活动中心（`activityList.vue`）：**

- `activityType === '2'`：跳转  
  `/pages/subPack/marketing/rechargeActivity/rechargeActivity?activityId=...`  
- 不再 toast「请到我的卡券查看」

### 2.3 活动详情 API

新增 App 接口（只读）：

```
GET /api/app/marketing/activity/recharge/detail
  ?activityId=&tenantId=&userId=（userId 可选，用于后续限领提示）
```

**返回（示意）：**

- 活动基础：`activityId`、`activityName`、`activityBeginTime`、`activityEndTime`、`activityStatus`、规则图 URL
- `tiers[]`：`{ threshold, rewards: [{ cardCouponId, cardCouponName, rewardCount }] }`  
  - 数据来自活动奖励表 `rewardThreshold` 聚合，与 Web `RechargeTierEditor` 一致
- 非 type=2、或非进行中：返回明确错误，前端禁止支付

### 2.4 支付

- 调用现有 `POST /api/app/pay/callUpPayment`
- `tradeType = 1`（充值余额）
- **`bizRecordId` 不传 / 空**（走自定义金额分支：`giftMoney=0`，`payMoney = tradeAmount/100`）
- `tradeAmount` = 所选档位金额（元）× 100（分）
- `goodsName` 可用「充值有礼」或活动名

**发券：** 支付成功后现有 `AppPayController.checkout` 已发布 `MarketingTriggerEvent.RECHARGE(payMoney)`，按最高匹配档发券，**无需改发券链路**。

**成功交互：**

- Toast / 提示：「充值成功，卡券将自动到账」（文案可微调）
- **不跳转**其它页面；可刷新余额展示（若页上有余额区）

### 2.5 验收

| # | 场景 | 期望 |
|---|------|------|
| R1 | 活动中心点充值领取 | 进入活动页，档位与后台配置一致 |
| R2 | 选「满 50」支付成功 | 余额 +50；发券为 ≤50 的最高匹配档；页内提示，不跳转 |
| R3 | 日常 `recharge.vue` | 仍为套餐档位，行为不变 |
| R4 | 活动非进行中 | 详情失败或按钮不可用 |

---

## 三、仓库与改动面

| 仓库 | 改动 |
|------|------|
| `charging-cloud` | VO 字段；列表 enrich 券数；App `recharge/detail` |
| `charging-cloud-uniapp` | 去角标；站卡片文案；活动中心跳转；新充值活动页 |
| `charging-cloud-web` | 本修订无必须改动（后台档位编辑已有） |

## 四、风险与注意

- 列表 enrich 券数需控制性能：一次拉用户未使用券再按站匹配，避免 N+1 查询卡券范围
- `callUpPayment` 空 `bizRecordId` 分支已存在（`AppUnifiedPaymentController` case 1），活动页必须走该分支，**勿**传套餐 id，以免金额被套餐覆盖、赠送余额与活动混淆
- RECHARGE 事件会对租户下**所有进行中** type=2 活动尝试发券（现有行为）；活动页只负责引导充值金额，不改变多活动并发发券语义

## 五、实现顺序建议

1. 后端：列表 `availableCouponCount` + App recharge detail  
2. 前端：去角标 + 站卡片展示  
3. 前端：充值活动页 + 活动中心跳转  
4. 联调验收 S1–S4、R1–R4  

---

## 拍板记录

| # | 问题 | 结论 |
|---|------|------|
| 1 | 券数口径 | A：用户已持有且该站可用 |
| 2 | 列表实现 | 方案 1：列表接口带 `availableCouponCount` |
| 3 | 充值活动 | 独立页，档位=活动配置；支付=同 `callUpPayment` |
| 4 | 「X张券可用」点击 | **不需要**，仅展示 |
| 5 | 充值成功 | **仅提示**，不跳转 |

---

## 实现状态（2026-07-16）

| 模块 | 状态 | Commit |
|------|------|--------|
| 一、电站「X张券可用」 | ✅ 代码完成 | cloud `bec6b321` + uniapp `11839fd` |
| 二、独立充值活动页 | ✅ 代码完成 | cloud `91a55569` + uniapp `1d88726` |

**待验收：** S1–S4（站券数）、R1–R4（充值活动页）手工联调未执行。
