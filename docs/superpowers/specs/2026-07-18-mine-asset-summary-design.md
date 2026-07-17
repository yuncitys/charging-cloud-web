# 「我的」页资产汇总接口设计

**日期：** 2026-07-18  
**分支：** `develop/charging-marketing`  
**关联：** UniApp `pages/mine/mine.vue` 钱包卡（余额 / 充值金额 / 赠送金额 / 优惠卡券数）

## 背景

「我的」页当前：

| 字段 | 来源 |
|------|------|
| 余额、充值金额、赠送金额 | `GET /user/getUserInfoById` |
| 优惠卡券数（未使用） | `GET /marketing/coupon/myList`（`page=1&limit=1`，只用 `count`） |

为拿券总数白跑列表查询，开销与语义都不合适。需要轻量「资产汇总」接口，专供钱包卡展示。

## 目标

| # | 目标 |
|---|------|
| 1 | 一次接口返回钱包三字段 + 未使用卡券数 |
| 2 | 券数用 `COUNT`，不返回列表 |
| 3 | 资料区（昵称、归属等）仍走 `getUserInfoById`，资产接口不掺资料字段 |

## 非目标

- 不改「我的卡券」列表 / 详情接口
- 不返回已使用、已过期分数字段
- 资产接口不返回头像、昵称、`userCode` 等资料字段
- 不合并/废弃 `getUserInfoById`

## 拍板记录

| # | 问题 | 结论 |
|---|------|------|
| 1 | 卡券口径 | 仅未使用数量（与现「优惠卡券」一致） |
| 2 | 是否含钱包三字段 | 是：`cash` / `realityPayMoney` / `giveMoney` |
| 3 | 与资料接口关系 | 资产只管钱包卡四字段；资料仍 `getUserInfoById` |
| 4 | 控制器归属 | **挂在用户模块 `AppUserController`**（`/user`） |

---

## 一、接口

**Controller：** `AppUserController`  
**路径：**

```
GET /api/app/user/assetSummary
  ?userId=&tenantId=
```

（与现有 `/user/getUserInfoById` 同前缀；网关实际前缀以现网 App 为准。）

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `userId` | 是 | 当前钱包对应账号（切钱包后与 storage 中 `userId` 一致） |
| `tenantId` | 是 | 租户；用于卡券 count 与过期标记 |

**成功返回 `data`：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `cash` | Decimal/Number | 余额 |
| `realityPayMoney` | Decimal/Number | 充值金额 |
| `giveMoney` | Decimal/Number | 赠送金额 |
| `unusedCouponCount` | Integer | 未使用卡券数（≥0） |

用户不存在：返回业务错误（与 `getUserInfoById` 一致风格）。  
参数缺失：参数不合格。

## 二、后端实现要点

1. 按 `userId` 查 `AppUser`，取出 `cash` / `realityPayMoney` / `giveMoney`（空按 0）
2. 卡券：复用 `MarketingUserCouponService` 能力  
   - 先 `markExpiredCoupons(userId, tenantId)`（与 `myList` 同，避免过期仍算未使用）  
   - 再 `COUNT`：`userId` + `tenantId` + `used_status = 未使用(0)`  
   - 可抽 `countUnused(userId, tenantId)`，供本接口调用；**不要**走 `myList` 分页
3. 组装 VO（如 `AppUserAssetSummaryVo`）返回
4. `AppUserController` 注入营销 count 所需 Service；用户模块依赖 biz 营销服务（现有工程已具备同类依赖时可直接用）

## 三、前端（`mine.vue`）

1. `api`：新增 `getUserAssetSummary({ userId, tenantId })`（可放 `api/user` 或现有 http 封装旁，与用户接口同域）
2. `onShow` 登录态：  
   - 保留 `getCash()` → `getUserInfoById`：更新资料、`userInfo` storage、`userCode` / `userType` / `attributionLabel`  
   - **钱包数字以资产接口为准**：`loadAssetSummary()` 写入 `cash` / `realityPayMoney` / `giveMoney` / `couponCount`  
3. 删除 `loadCouponCount()` 对 `getMyCouponList` 的调用及相关 import（若本页无其它用途）
4. 未登录：四字段置 0，不调资产接口

**双源说明：** `getUserInfoById` 仍可能带回余额字段，但 UI 展示以 `assetSummary` 覆盖，避免两处不一致时闪动（建议先资料后资产，或并行后以资产结果覆盖钱包字段）。

## 四、验收

| # | 场景 | 期望 |
|---|------|------|
| A1 | 登录有余额、有 2 张未使用券 | 四字段正确；无 `coupon/myList` 请求 |
| A2 | 有过期未使用券 | count 前标记过期后，不计入 `unusedCouponCount` |
| A3 | 切换钱包 | `userId` 变化后汇总对应当前账号 |
| A4 | 未登录 | 不调接口；展示为 0 / 引导登录 |
| A5 | 资料区 | 仍依赖 `getUserInfoById` / 缓存，行为不变 |

## 五、仓库改动面

| 仓库 | 改动 |
|------|------|
| `charging-cloud` | `AppUserController` + VO；营销侧 `countUnused`（或等价） |
| `charging-cloud-uniapp` | `mine.vue` + API 封装 |
| `charging-cloud-web` | 本文档 |

## 六、实现顺序

1. 后端：`countUnused` + `assetSummary`  
2. UniApp：接接口，替换券列表 count  
3. 手工验收 A1–A5  

---

## 实现状态

| 仓库 | Commit | 说明 |
|------|--------|------|
| `charging-cloud` | `6f9ef2f9` | `feat(user): add assetSummary for wallet and unused coupon count` |
| `charging-cloud-uniapp` | `d59fd69` | `feat(mine): load wallet card via user assetSummary` |
| `charging-cloud-web` | （本提交） | 计划勾选 + 本文实现状态 |

**手工验收 A1–A5：** 待执行（未勾选）。
