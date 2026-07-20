# 营销 B UX 修订 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 去掉首页卡券角标，在汽车站列表展示「X张券可用」；新建独立充值活动页，档位对齐后台「充值领取」配置并用自定义金额钱包充值。

**Architecture:** 列表侧在 `getNetWorkList` enrich 路径批量写入 `availableCouponCount`（复用 available/matchStation 口径）；充值活动侧新增 App `recharge/detail` 聚合档位，UniApp 独立页调 `callUpPayment(tradeType=1, bizRecordId 空)`，发券仍走现有 RECHARGE 事件。

**Tech Stack:** Java 8 / MyBatis-Plus / UniApp Vue 2 / 现有 `callUpPayment`

**Branch:** `develop/charging-marketing`（三仓；不直接合主干）

**权威设计：** `docs/superpowers/specs/2026-07-16-marketing-b-ux-revision-design.md`

## Global Constraints

- 「X张券可用」仅展示，不可点击跳转
- 充值成功仅 toast，不跳转「我的卡券」
- **初版：** 不改 `recharge.vue` 套餐逻辑 → **2026-07-17：** 已加活动入口条 + 套餐 UI 简化（见设计文档「后续调整」）
- 单车站本轮不展示券数
- 活动页支付必须 `bizRecordId` 为空，走自定义金额（`giftMoney=0`）
- 提交信息用英文 conventional commits；仓库各自提交

---

## File Map

| 路径 | 职责 |
|------|------|
| `charging-cloud/.../vo/NetworkDotListVo.java` | 新增 `availableCouponCount` |
| `charging-cloud/.../MarketingUserCouponService.java` (+ Impl) | `countAvailableByStations` |
| `charging-cloud/.../NetworkDotServiceImpl.java` | enrich 写入券数 |
| `charging-cloud/.../vo/MarketingRechargeActivityDetailVo.java`（新建） | App 充值活动详情 DTO |
| `charging-cloud/.../MarketingActivityService.java` (+ Impl) | `rechargeDetail` |
| `charging-cloud/.../AppMarketingController.java` | `GET .../activity/recharge/detail` |
| `charging-cloud-uniapp/pages/home/home.vue` | 去角标；`car-site-tags` 券数文案（现行） |
| `charging-cloud-uniapp/pages/subPack/siteList/siteList.vue` | 同首页汽车卡片券数 |
| `charging-cloud-uniapp/api/marketing.js` | `getRechargeActivityDetail`；list 传 `activityType` |
| `charging-cloud-uniapp/pages/subPack/marketing/rechargeActivity/rechargeActivity.vue` | 充值活动页 |
| `charging-cloud-uniapp/pages/subPack/recharge/recharge.vue` | 余额充值 Tab「充值有礼」入口（2026-07-17） |
| `charging-cloud-uniapp/pages/mine/mine.vue` | 移除「活动中心」（2026-07-17） |
| `charging-cloud-uniapp/pages.json` | 注册路由；**2026-07-18 移除** activityList / codeExchange |
| ~~activityList / codeExchange~~ | **2026-07-18 已删除页面** |

---

### Task 1: 后端 — 按站批量可用券数 + 列表 enrich

**Files:**
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/NetworkDotListVo.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingUserCouponService.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingUserCouponServiceImpl.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/NetworkDotServiceImpl.java`

**Interfaces:**
- Produces: `Map<Integer, Integer> countAvailableByStations(Integer userId, String tenantId, Collection<Integer> stationIds)`
- Produces: `NetworkDotListVo.availableCouponCount`（Integer，无可用时 0）

- [x] **Step 1: VO 加字段**

在 `NetworkDotListVo` 的 `activityTags` 后增加：

```java
/**
 * 当前用户在该站可用卡券数（未登录或不适用可为 null/0）
 */
private Integer availableCouponCount;
```

- [x] **Step 2: Service 接口方法**

```java
/**
 * 按站点统计用户已持有且可用的卡券数（口径对齐 available）
 */
java.util.Map<Integer, Integer> countAvailableByStations(Integer userId, String tenantId,
        java.util.Collection<Integer> stationIds);
```

- [x] **Step 3: Impl — 一次查券，按站匹配计数**

实现要点（放在 `MarketingUserCouponServiceImpl`）：

1. `userId`/`tenantId` 空或 `stationIds` 空 → 返回空 Map  
2. `markExpiredCoupons(userId, tenantId)`  
3. 查该用户 `used_status=未使用` 且 `end_time >= now` 的全部用户券（与 `available` 相同条件）  
4. 对每个 `stationId`：`count = coupons.stream().filter(c -> matchStation(c.getCardCouponId(), tenantId, stationId)).count()`  
5. 写入 Map（即使 0 也 put，便于调用方统一）

```java
@Override
public Map<Integer, Integer> countAvailableByStations(Integer userId, String tenantId,
                                                      Collection<Integer> stationIds) {
    Map<Integer, Integer> result = new HashMap<>();
    if (userId == null || StringUtils.isBlank(tenantId) || stationIds == null || stationIds.isEmpty()) {
        return result;
    }
    markExpiredCoupons(userId, tenantId);
    List<MarketingUserCardCoupon> coupons = userCardCouponMapper.selectList(
            new LambdaQueryWrapper<MarketingUserCardCoupon>()
                    .eq(MarketingUserCardCoupon::getUserId, String.valueOf(userId))
                    .eq(MarketingUserCardCoupon::getTenantId, tenantId)
                    .eq(MarketingUserCardCoupon::getUsedStatus, UserCouponStatusEnum.UNUSED.getCode())
                    .ge(MarketingUserCardCoupon::getEndTime, DateUtils.getNowDate()));
    for (Integer stationId : stationIds) {
        if (stationId == null) {
            continue;
        }
        int count = 0;
        for (MarketingUserCardCoupon coupon : coupons) {
            if (matchStation(coupon.getCardCouponId(), tenantId, stationId)) {
                count++;
            }
        }
        result.put(stationId, count);
    }
    return result;
}
```

- [x] **Step 4: NetworkDotServiceImpl enrich**

在 `enrichDiscountPricing` 末尾（或同方法内汽车循环之后）增加券数 enrich：

```java
private void enrichAvailableCouponCount(List<NetworkDotListVo> list, ChargeStationPagination pagination) {
    if (list == null || pagination == null || pagination.getUserId() == null
            || StringUtils.isBlank(pagination.getTenantId())) {
        return;
    }
    List<Integer> stationIds = new ArrayList<>();
    for (NetworkDotListVo vo : list) {
        if (vo != null && Integer.valueOf(2).equals(vo.getRuleId()) && vo.getId() != null) {
            stationIds.add(vo.getId());
        }
    }
    if (stationIds.isEmpty()) {
        return;
    }
    Map<Integer, Integer> counts = marketingUserCouponService.countAvailableByStations(
            pagination.getUserId(), pagination.getTenantId(), stationIds);
    for (NetworkDotListVo vo : list) {
        if (vo == null || !Integer.valueOf(2).equals(vo.getRuleId()) || vo.getId() == null) {
            continue;
        }
        Integer c = counts.get(vo.getId());
        vo.setAvailableCouponCount(c == null ? 0 : c);
    }
}
```

在调用 `enrichDiscountPricing` 的同一处调用 `enrichAvailableCouponCount`（`NetworkDotServiceImpl` 里 App/Map 列表组装后）。注入 `MarketingUserCouponService`（若尚未注入）。

- [x] **Step 5: 本地编译**

在 `charging-cloud` 相关模块编译通过（至少 biz + applet 依赖）。

- [x] **Step 6: Commit（cloud）**

```bash
git add sharecharge-biz/src/main/java/com/sharecharge/biz/vo/NetworkDotListVo.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingUserCouponService.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingUserCouponServiceImpl.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/NetworkDotServiceImpl.java
git commit -m "$(cat <<'EOF'
feat(marketing): expose per-station available coupon counts on list

EOF
)"
```

---

### Task 2: 后端 — App 充值活动详情 API

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/MarketingRechargeActivityDetailVo.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/MarketingRechargeTierVo.java`（可内嵌静态类，二选一；推荐独立小 VO）
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingActivityService.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingActivityServiceImpl.java`
- Modify: `charging-cloud/sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppMarketingController.java`

**Interfaces:**
- Produces: `ResultUtil rechargeDetail(String activityId, String tenantId)`
- HTTP: `GET /marketing/activity/recharge/detail?activityId=&tenantId=`

- [x] **Step 1: VO**

```java
@Data
public class MarketingRechargeActivityDetailVo {
    private String activityId;
    private String activityName;
    private String activityType;
    private String activityStatus;
    private Date activityBeginTime;
    private Date activityEndTime;
    private String activityRemark;
    /** 规则图，对应 activity.activityRule */
    private String ruleImage;
    private List<MarketingRechargeTierVo> tiers;
}

@Data
public class MarketingRechargeTierVo {
    private BigDecimal threshold;
    private List<MarketingRechargeTierRewardVo> rewards;
}

@Data
public class MarketingRechargeTierRewardVo {
    private String cardCouponId;
    private String cardCouponName;
    private Integer rewardCount;
}
```

- [x] **Step 2: Service 方法签名**

```java
ResultUtil rechargeDetail(String activityId, String tenantId);
```

- [x] **Step 3: Impl**

逻辑：

1. 查活动；不存在 → error「活动不存在」  
2. `refreshActivityStatus(activity)`  
3. `activityType` 必须为 `"2"`，否则 error「非充值领取活动」  
4. `activityStatus` 必须为 `ActivityStatusEnum.RUNNING.getCode()`（`"1"`），否则 error「活动未开始/已结束」等（可用现有文案）  
5. 查 rewards；按 `rewardThreshold` 分组排序（threshold 升序）  
6. 每条 reward 的 `rewardId` 查 `MarketingCardCoupon` 取 `cardCouponName`  
7. `ruleImage = activity.getActivityRule()`  
8. `ResultUtil.success(vo)`

- [x] **Step 4: Controller**

在 `AppMarketingController` 增加：

```java
@GetMapping("/activity/recharge/detail")
@ApiOperation("充值领取活动详情")
public ResultUtil rechargeDetail(@RequestParam("activityId") String activityId,
                                 @RequestParam("tenantId") String tenantId) {
    if (StringUtils.isBlank(activityId) || StringUtils.isBlank(tenantId)) {
        return ResultUtil.error("参数不合格");
    }
    return marketingActivityService.rechargeDetail(activityId, tenantId);
}
```

- [x] **Step 5: Commit（cloud）**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): add app recharge activity detail with tiers

EOF
)"
```

---

### Task 3: UniApp — 去角标 + 站列表「X张券可用」

**Files:**
- Modify: `charging-cloud-uniapp/pages/home/home.vue`
- Modify: `charging-cloud-uniapp/pages/subPack/siteList/siteList.vue`

**Interfaces:**
- Consumes: 列表项 `item.availableCouponCount`（Task 1）

- [x] **Step 1: home.vue 删除悬浮卡券**

删除模板中：

```html
<view v-if="loggedIn" class="coupon-entry" ...>...</view>
```

删除 `data.couponCount`、`computed.couponBadgeText`、`loadCouponCount`、`toMyCoupons`（若仅角标使用）、`onShow` 中对 `loadCouponCount` 的调用，以及相关 `import { getMyCouponList }`（若无其它用途）、样式 `.coupon-entry*`。

- [x] **Step 2: home.vue 汽车价格旁展示**

在 `activity-price` 同级或紧后（`.car-site-price` 内）：

```html
<text
  v-if="item.availableCouponCount > 0"
  class="car-site-coupon-tip"
>{{ item.availableCouponCount }}张券可用</text>
```

样式示例（与现有蓝色体系协调，字号略小于价格）：

```scss
.car-site-coupon-tip {
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #ff6a00;
  white-space: nowrap;
}
```

**不要**加 `@click`。

- [x] **Step 3: siteList.vue 对齐同一展示与样式**

汽车卡片价格区同样增加文案；确认该页列表同样走 `getNetWorkList`（已带 userId）。

- [x] **Step 4: Commit（uniapp）**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): show station available coupon count on car list

EOF
)"
```

---

### Task 4: UniApp — 充值活动页 + 活动中心跳转

**Files:**
- Modify: `charging-cloud-uniapp/api/marketing.js`
- Create: `charging-cloud-uniapp/pages/subPack/marketing/rechargeActivity/rechargeActivity.vue`
- Modify: `charging-cloud-uniapp/pages.json`
- Modify: `charging-cloud-uniapp/pages/subPack/marketing/activityList/activityList.vue`

**Interfaces:**
- Consumes: Task 2 `GET /marketing/activity/recharge/detail`
- Consumes: `$http.callUpPayment`（与 `recharge.vue` 相同），`tradeType=1`，`bizRecordId` 不传

- [x] **Step 1: API 封装**

```js
/** 充值领取活动详情（档位） */
export function getRechargeActivityDetail(params = {}) {
  return Request.request({
    method: 'GET',
    url: `${PREFIX}/activity/recharge/detail`,
    data: {
      activityId: params.activityId,
      tenantId: params.tenantId || getTenantId()
    }
  })
}
```

- [x] **Step 2: pages.json 注册**

在 marketing 子包、`activityList` 旁增加：

```json
{
  "path": "marketing/rechargeActivity/rechargeActivity",
  "style": {
    "navigationBarTitleText": "充值有礼",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f7f7fa",
    "enablePullDownRefresh": false
  }
}
```

- [x] **Step 3: 新建 rechargeActivity.vue**

页面职责：

1. `onLoad(options)` 读 `activityId`，调 `getRechargeActivityDetail`  
2. 展示名称、时间、`ruleImage`（有则 `image`）、档位列表  
3. `selectedIndex` 选档；主按钮「立即充值」  
4. 支付：复制 `recharge.vue` 的 `callUpPayment` / 台州收银 / 微信 `handlePayment` 成功失败分支；关键差异：

```js
// 金额：档位元 → 分
const yuan = Number(this.tiers[this.selectedIndex].threshold)
const tradeAmount = Math.round(yuan * 100)
// tradeType=1，bizRecordId 不传或传 null/''
this.callUpPayment(1, null, tradeAmount)
```

`callUpPayment` 的 `data` **不要**设置 `bizRecordId`（或显式 `undefined`），确保走自定义金额。`goodsName` 用活动名或「充值有礼」。

5. 支付成功：`uni.showToast({ title: '充值成功，卡券将自动到账', icon: 'none' })`；**不** `navigateTo` 我的卡券  
6. 详情失败 / 非进行中：展示错误，禁用按钮

UI 保持现有营销页简洁风格（对齐 `scanReceive` / `activityList`），不做花哨营销落地页。

- [x] **Step 4: activityList 跳转**

在 `resolveActivityKind` / `handleItemTap`：

- type `'2'` → kind `'recharge'`  
- `handleItemTap`：navigateTo  
  `/pages/subPack/marketing/rechargeActivity/rechargeActivity?activityId=...`  
- `actionHint`：`'去充值领券'`

- [x] **Step 5: Commit（uniapp）**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): add recharge activity page with activity tiers

EOF
)"
```

---

## 代码完成记录（2026-07-16）

| Task | Commit | 仓库 |
|------|--------|------|
| Task 1 按站批量可用券数 + 列表 enrich | `bec6b321` | charging-cloud |
| Task 2 App 充值活动详情 API | `91a55569` | charging-cloud |
| Task 3 去角标 + 站列表「X张券可用」 | `11839fd` | charging-cloud-uniapp |
| Task 4 充值活动页 + 活动中心跳转 | `1d88726` | charging-cloud-uniapp |

**状态：** ✅ Task 1–4 代码已完成，合入 `develop/charging-marketing`（未合主干）。Task 5 手工验收（S1–S4 / R1–R4）待测。

### 后续体验调整（2026-07-17，非本计划 Task，已合入同分支）

| 项 | Commit | 仓库 |
|----|--------|------|
| 站券 tip → `car-site-tags` | `81cd2a6` 等 | uniapp |
| 充值页活动入口条 | `736cd01` | uniapp |
| list `activityType` / `activityRemark` | `87afc4e9` / `1c07b55` | cloud / uniapp |
| 活动页蓝系 UI | `cddaedb` 等 | uniapp |
| 充值套餐档位 UI 简化 | `a708fa6` | uniapp |
| 卡券详情对齐列表 + 状态 icon | `ab66e9f` 等 | uniapp |
| 移除「我的」活动中心 | `2047a7e` | uniapp |
| matchStation 按卡券缓存 | `d7a85042` | cloud |

权威现行口径见设计文档「后续调整」节。

---

### Task 5: 文档勾选 + 联调清单

**Files:**
- Modify: `charging-cloud-web/docs/superpowers/plans/2026-07-16-marketing-b-ux-revision.md`（本计划，执行时勾 checkbox）
- Modify: `charging-cloud-web/docs/superpowers/specs/2026-07-16-marketing-b-ux-revision-design.md`（可选：文末加「实现状态」）
- Modify: `charging-cloud-web/docs/superpowers/plans/2026-07-14-marketing-remaining-gaps.md`（进度备注「B UX 修订进行中/完成」）

- [ ] **Step 1: 手工验收（对照设计现行口径）**

| # | 场景 | 期望 |
|---|------|------|
| S1 | 登录，站有可用券 | `car-site-tags` 显示「N张券可用」 |
| S2 | 券不匹配该站 | 不显示 |
| S3 | 未登录 | 无文案、无角标 |
| S4 | 首页 | 无右下角卡券 FAB |
| R1 | 充值页「充值有礼」 | 进活动页，档位=后台 |
| R2 | 选档支付成功 | 余额增加；提示到账；不跳转 |
| R3 | `recharge.vue` 套餐区 | 套餐充值仍可用；有活动时有入口条 |
| R4 | 活动非进行中 | 不可充；入口条不展示 |
| R5 | 「我的」页 | 无活动中心；有「我的卡券」（页内可兑换） |

- [ ] **Step 2: Commit 文档（web）**

```bash
git commit -m "$(cat <<'EOF'
docs(marketing): mark B UX revision plan progress

EOF
)"
```

---

## Self-Review

| 检查项 | 结论 |
|--------|------|
| Spec 一（站券数） | Task 1 + 3 |
| Spec 二（充值活动页） | Task 2 + 4 |
| 仅展示 / 成功不跳转 | Task 3/4 步骤写死 |
| 不改 recharge.vue（初版） | ⚠️ 已被 07-17 调整覆盖（入口条 + 套餐 UI） |
| 无 TBD 占位 | ✅ |
| `bizRecordId` 空 | Task 4 Step 3 写死 |

---

## 执行说明

Plan 写于：`docs/superpowers/plans/2026-07-16-marketing-b-ux-revision.md`。

实现时可选用：

1. **Subagent-Driven（推荐）** — 每 Task 独立子代理 + 任务间 review  
2. **Inline Execution** — 本会话按 executing-plans 连续做
