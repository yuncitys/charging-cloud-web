# 「我的」页资产汇总 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 App `GET/POST /user/assetSummary`，一次返回钱包三字段 + 未使用卡券数；「我的」页用该接口替换 `coupon/myList` 取 count。

**Architecture:** `AppUserController` 查 `AppUser` 钱包字段，并调用 `MarketingUserCouponService.countUnused`（内部 `markExpiredCoupons` + `selectMyCount(status=0)`）；UniApp `mine.vue` 资料仍走 `getUserInfoById`，钱包数字以 `assetSummary` 覆盖。

**Tech Stack:** Java 8 / MyBatis-Plus / UniApp Vue 2 / 现有 `ResultUtil` + `utils/http.js`

**Branch:** `develop/charging-marketing`（cloud + uniapp；web 仅文档）

**权威设计：** `docs/superpowers/specs/2026-07-18-mine-asset-summary-design.md`

## Global Constraints

- 接口挂在 `AppUserController`（`/user`），不挂 marketing
- 仅返回：`cash` / `realityPayMoney` / `giveMoney` / `unusedCouponCount`
- 券数口径：未使用（`UserCouponStatusEnum.UNUSED` = `"0"`），与「我的卡券」未使用 Tab 一致
- count 前必须 `markExpiredCoupons`（与 `myList` 同）
- 不改 `coupon/myList`；资料区仍用 `getUserInfoById`
- 提交用英文 conventional commits；仓库各自提交
- 本仓无现成 AppUserController 单测时，Task 验证以编译/手工验收为准（勿为造测而引入新测试框架）

---

## File Map

| 路径 | 职责 |
|------|------|
| `charging-cloud/.../vo/AppUserAssetSummaryVo.java` | 资产汇总 DTO |
| `charging-cloud/.../MarketingUserCouponService.java` | 新增 `countUnused` |
| `charging-cloud/.../MarketingUserCouponServiceImpl.java` | 实现 count |
| `charging-cloud/.../AppUserController.java` | `/user/assetSummary` |
| `charging-cloud-uniapp/utils/http.js` | `getUserAssetSummary` |
| `charging-cloud-uniapp/pages/mine/mine.vue` | 接资产接口，去掉列表 count |
| `charging-cloud-web/docs/superpowers/specs/2026-07-18-mine-asset-summary-design.md` | 设计（已有） |
| `charging-cloud-web/docs/superpowers/plans/2026-07-18-mine-asset-summary.md` | 本计划 |

---

### Task 1: 后端 — `countUnused` + VO + `assetSummary`

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/AppUserAssetSummaryVo.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingUserCouponService.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingUserCouponServiceImpl.java`
- Modify: `charging-cloud/sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppUserController.java`

**Interfaces:**
- Produces: `int countUnused(Integer userId, String tenantId)`
- Produces: `AppUserAssetSummaryVo` fields: `BigDecimal cash`, `BigDecimal realityPayMoney`, `BigDecimal giveMoney`, `Integer unusedCouponCount`
- Produces: `ResultUtil assetSummary(userId, tenantId)` via `POST/GET /user/assetSummary`（与同文件其它接口一样用 `@RequestMapping`，不强制 method）

- [x] **Step 1: 新建 VO**

```java
package com.sharecharge.biz.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AppUserAssetSummaryVo {
    private BigDecimal cash;
    private BigDecimal realityPayMoney;
    private BigDecimal giveMoney;
    /** 未使用卡券数 */
    private Integer unusedCouponCount;
}
```

- [x] **Step 2: Service 接口增加方法**

在 `MarketingUserCouponService` 中增加：

```java
/**
 * 未使用卡券数量（先 markExpired，再 COUNT，口径对齐 myList status=0）
 */
int countUnused(Integer userId, String tenantId);
```

- [x] **Step 3: Impl**

在 `MarketingUserCouponServiceImpl` 实现（复用已有 `userCardCouponMapper.selectMyCount` 与私有 `markExpiredCoupons`）：

```java
@Override
public int countUnused(Integer userId, String tenantId) {
    if (userId == null || StringUtils.isBlank(tenantId)) {
        return 0;
    }
    markExpiredCoupons(userId, tenantId);
    long count = userCardCouponMapper.selectMyCount(
            userId, tenantId, UserCouponStatusEnum.UNUSED.getCode());
    return count > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) count;
}
```

确认类内已 import `UserCouponStatusEnum`、`StringUtils`（已有则勿重复）。

- [x] **Step 4: AppUserController 端点**

注入：

```java
@Autowired
private MarketingUserCouponService marketingUserCouponService;
```

增加 import：`com.sharecharge.biz.vo.AppUserAssetSummaryVo`（`MarketingUserCouponService` 已在 `com.sharecharge.biz.service.*` 通配内则可不再单独 import）。

在 `getUserInfoById` 方法后增加：

```java
/**
 * 小程序「我的」钱包卡：余额 + 未使用卡券数（不返回资料字段）
 */
@RequestMapping("/assetSummary")
@ApiOperation(value = "用户资产汇总（钱包+未使用券数）")
@ApiImplicitParams({
        @ApiImplicitParam(name = "userId", value = "用户ID", dataTypeClass = String.class, required = true),
        @ApiImplicitParam(name = "tenantId", value = "租户ID", dataTypeClass = String.class, required = true),
})
public ResultUtil assetSummary(@RequestParam("userId") String userId,
                               @RequestParam("tenantId") String tenantId) {
    if (StringUtils.isBlank(userId) || StringUtils.isBlank(tenantId)) {
        return ResultUtil.error("参数不合格");
    }
    try {
        AppUser appUser = appUserService.getById(userId);
        if (Objects.isNull(appUser)) {
            return ResultUtil.error("用户不存在");
        }
        AppUserAssetSummaryVo vo = new AppUserAssetSummaryVo();
        vo.setCash(appUser.getCash() != null ? appUser.getCash() : BigDecimal.ZERO);
        vo.setRealityPayMoney(appUser.getRealityPayMoney() != null ? appUser.getRealityPayMoney() : BigDecimal.ZERO);
        vo.setGiveMoney(appUser.getGiveMoney() != null ? appUser.getGiveMoney() : BigDecimal.ZERO);
        Integer uid;
        try {
            uid = Integer.valueOf(userId.trim());
        } catch (NumberFormatException e) {
            return ResultUtil.error("参数不合格");
        }
        vo.setUnusedCouponCount(marketingUserCouponService.countUnused(uid, tenantId));
        return ResultUtil.success(vo);
    } catch (Exception e) {
        log.error("资产汇总错误: " + e.getMessage(), e);
        return ResultUtil.error("系统错误");
    }
}
```

- [x] **Step 5: 编译校验（cloud）**

在 `charging-cloud` 根或 applet 模块执行（按本机习惯，例如）：

```bash
mvn -pl sharecharge-applet/sharecharge-applet-controller -am compile -DskipTests -q
```

Expected: BUILD SUCCESS（若模块坐标不同，改为能编过 `AppUserController` 的等价命令）。

- [x] **Step 6: Commit（charging-cloud）**

```bash
git add sharecharge-biz/src/main/java/com/sharecharge/biz/vo/AppUserAssetSummaryVo.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingUserCouponService.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingUserCouponServiceImpl.java \
  sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppUserController.java
git commit -m "$(cat <<'EOF'
feat(user): add assetSummary for wallet and unused coupon count

EOF
)"
```

---

### Task 2: UniApp — `getUserAssetSummary` + `mine.vue`

**Files:**
- Modify: `charging-cloud-uniapp/utils/http.js`
- Modify: `charging-cloud-uniapp/pages/mine/mine.vue`

**Interfaces:**
- Consumes: `POST /api/app/user/assetSummary` → `data.{ cash, realityPayMoney, giveMoney, unusedCouponCount }`
- Produces: `mine.vue` 钱包卡四字段；无 `getMyCouponList` 调用

- [x] **Step 1: http.js 增加方法**

紧挨 `getUserInfoById` 后增加：

```javascript
getUserAssetSummary(data) {
	return Request.request({
		method: 'POST',
		url: '/api/app/user/assetSummary',
		header: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data
	})
},
```

- [x] **Step 2: mine.vue — 去掉 marketing 列表依赖**

删除：

```javascript
import { getMyCouponList } from '@/api/marketing.js'
```

- [x] **Step 3: mine.vue — 用资产接口覆盖钱包数字**

将 `loadCouponCount` 替换为：

```javascript
loadAssetSummary() {
	const userId = uni.getStorageSync('userId')
	const tenantId = uni.getStorageSync('tenantId')
	if (!userId || !tenantId) {
		this.cash = 0
		this.realityPayMoney = 0
		this.giveMoney = 0
		this.couponCount = 0
		return
	}
	this.$http.getUserAssetSummary({
		userId: String(userId),
		tenantId: String(tenantId)
	}).then((res) => {
		if (res.code == 200 && res.data) {
			this.cash = res.data.cash || 0
			this.realityPayMoney = res.data.realityPayMoney || 0
			this.giveMoney = res.data.giveMoney || 0
			this.couponCount = res.data.unusedCouponCount != null ? res.data.unusedCouponCount : 0
		} else {
			this.couponCount = 0
		}
	}).catch(() => {
		this.couponCount = 0
	})
},
```

`getCash()` **保留**：继续 `getUserInfoById` 更新资料与 storage，但**不要再依赖它写钱包三字段**（删除或注释 `getCash` 内对 `this.cash` / `realityPayMoney` / `giveMoney` 的赋值），避免与资产接口双源闪动。建议 `getCash` 内仅保留：

```javascript
uni.setStorageSync('userId', res.data.id)
uni.setStorageSync('userInfo', res.data)
this.userCode = res.data.userCode
this.userType = res.data.userType != null && res.data.userType !== '' ? String(res.data.userType) : ''
this.attributionLabel = this.pickAttributionLabel(res.data)
```

- [x] **Step 4: onShow 调用**

登录分支中把 `this.loadCouponCount()` 改为 `this.loadAssetSummary()`（`getCash()` 仍调用）。

- [x] **Step 5: Commit（uniapp）**

```bash
git add utils/http.js pages/mine/mine.vue
git commit -m "$(cat <<'EOF'
feat(mine): load wallet card via user assetSummary

EOF
)"
```

---

### Task 3: 文档进度 + 验收清单勾选

**Files:**
- Modify: `charging-cloud-web/docs/superpowers/plans/2026-07-18-mine-asset-summary.md`（本文件勾选）
- Modify: `charging-cloud-web/docs/superpowers/specs/2026-07-18-mine-asset-summary-design.md`（文末加实现状态）

- [x] **Step 1: 设计文档文末增加实现状态表**（代码合入后填 commit）

- [ ] **Step 2: 手工验收（对照设计 A1–A5）**

| # | 场景 | 期望 |
|---|------|------|
| A1 | 登录有余额、有未使用券 | 四字段正确；Network 无 `coupon/myList` |
| A2 | 存在已过期但仍标未使用的券 | 汇总后不计入（或先被 mark 为过期） |
| A3 | 切换钱包 | 数字对应当前 `userId` |
| A4 | 未登录 | 不调资产接口；数字为 0 |
| A5 | 资料区 | 昵称/归属等仍正常 |

- [x] **Step 3: Commit（web docs）**

```bash
git add docs/superpowers/plans/2026-07-18-mine-asset-summary.md \
  docs/superpowers/specs/2026-07-18-mine-asset-summary-design.md
git commit -m "$(cat <<'EOF'
docs(user): add mine assetSummary plan and implementation status

EOF
)"
```

---

## Self-Review

| Spec 项 | Task |
|---------|------|
| `/user/assetSummary` + AppUserController | Task 1 |
| 四字段 VO | Task 1 |
| countUnused + markExpired | Task 1 |
| mine 接接口、去 myList count | Task 2 |
| 资料仍 getUserInfoById | Task 2 |
| 验收 A1–A5 | Task 3 |

无 TBD；路径与设计一致（用户模块）。

---

## 执行说明

Plan 写于：`docs/superpowers/plans/2026-07-18-mine-asset-summary.md`。
