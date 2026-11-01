# 营销中心收尾：P2 自动发券 + 兑换码导出 + 结算汇总 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 打通注册/充值/充电三类活动的自动发券；补齐兑换码 Excel 导出与 Web 提示；回填订单结算汇总中的平台/商户优惠金额。

**Architecture:** 在 `sharecharge-biz` 新增 `MarketingTriggerEvent` + `MarketingEventIssueService`（查进行中活动 → 带上下文发券），业务入口只 `ApplicationEventPublisher.publishEvent`，避免计费/支付强耦合。现有 `MarketingIssueService.issue` 扩展为支持「金额/度数上下文」的重载，充值只发最高匹配档位奖励。结算侧仅做 `t_order_settlement_info` 按 `discount_source` 聚合填实（双轨台账/补款另立计划）。

**Tech Stack:** Java 8 / Spring Events / MyBatis-Plus / EasyExcel / Vue 2 Element UI / UniApp（本计划不改小程序发券页）

**Out of scope（另立计划）:** 台账双基数、`split_base_type`、营销补款出款、首页券角标、独立 `couponDetail` 页、OCPP 释券。

**Specs:**  
- P2 触发：`docs/superpowers/specs/marketing-center/2026-06-14-marketing-center-design.md` §Phase 2  
- 结算汇总：`charging-cloud/doc/marketing-settlement-split-qa.md` 附录 A Phase 1 / A.6 P0

---

## 进度状态（2026-07-14 更新）

| 项 | 状态 |
|----|------|
| **本计划 Task 1–10** | ✅ **已完成**（分支 `develop/charging-marketing`，不合并主干，发布时再合） |
| **联调验收清单** | ⏳ 待业务/测试环境手工验收（见下方清单，尚未打勾） |
| **本计划 Out of scope** | ❌ 未做（见「剩余未完成」） |

### 本计划完成记录

| Task | 内容 | 仓库 | Commit |
|------|------|------|--------|
| 1 | 事件模型 + 监听骨架 | cloud | `c3b06c7f` |
| 2 | Issue 充值档位过滤 | cloud | `2a19fe40` + `2e37de04` |
| 3 | EventIssue 注册/充值/充电逻辑 | cloud | `068c8637` |
| 4 | 注册钩子 | cloud | `25636c48` |
| 5 | 充值钩子 | cloud | `3e49ea1d` |
| 6 | 充电结算钩子 | cloud | `d78d4497` |
| 6+ | 补全 `noPeriodElectricOrderSettlement` 路径 | cloud | `68d51532` |
| 7 | Web 自动发放 tip | web | `b288c73` |
| 8 | 兑换码导出 API | cloud | `fa0d8c6b` |
| 9 | Web 导出按钮 | web | `dd5b56c` |
| 10 | 结算汇总填实 | cloud | `caf5a7e8` |

### 剩余未完成（营销整体，含本计划外）

> **收尾计划：** [`2026-07-14-marketing-remaining-gaps.md`](./2026-07-14-marketing-remaining-gaps.md)（A/B ✅，C ❌）

| 优先级 | 项 | 说明 | 状态 |
|--------|----|------|------|
| P0 | 联调验收 | 下方 8 条场景尚未在测试环境打勾 | ⏳ Gate 0 |
| P1 | 台账双基数 / `split_base_type` | QA 附录 A | ✅ Workstream A |
| P1 | 平台营销补款台账 + 出款 | QA 附录 A P2–P3（线下确认） | ✅ Workstream A |
| P2 | 首页未使用券角标 | 已被 B UX 取代为站列表「X张券可用」 | ✅ Workstream B（已修订） |
| P2 | 独立 `couponDetail` 页 | 独立页；样式对齐列表（07-17） | ✅ Workstream B |
| P2 | `getActivityList` 运营位 | 活动中心页已删；现行仅充值页「充值有礼」用 list API | ✅ Workstream B（已调整） |
| P2 | 过期券日更 Job | `TaskService.expireMarketingUserCoupons` | ✅ Workstream B |
| P3 | 使用记录回滚态展示 | Web `confirm_status=2` | ✅ Workstream B |
| P3 | 异常单结算路径营销 | `abnormalOrderSettlement` 未挂 CHARGE/营销结算 | ❌ Workstream C |
| P3 | OCPP 起充失败释券 | 部分协议已接，OCPP 未全覆盖 | ❌ Workstream C |
| — | 单车营销 | 按设计不接（仅汽车 `ruleId=2`） | 排除 |

> 双轨资金完整方案见：`charging-cloud/doc/marketing-settlement-split-qa.md` 附录 A。

---

## File Map

| 路径 | 职责 |
|------|------|
| `charging-cloud/.../enums/marketing/MarketingTriggerTypeEnum.java` | REGISTER / RECHARGE / CHARGE |
| `charging-cloud/.../event/MarketingTriggerEvent.java` | Spring 应用事件载荷 |
| `charging-cloud/.../service/MarketingEventIssueService.java` | 按触发类型匹配活动并发券 |
| `charging-cloud/.../service/impl/MarketingEventIssueServiceImpl.java` | 实现：查活动、档位/度数校验、调 Issue |
| `charging-cloud/.../listener/MarketingEventListener.java` | `@EventListener` + `@Async` 消费 |
| `charging-cloud/.../MarketingIssueService.java` (+ Impl) | 新增带上下文发券重载 |
| `charging-cloud/.../AppUserController.java` | 新用户注册后 publish REGISTER |
| `charging-cloud/.../AppPayController.java` | 余额充值 checkout 成功后 publish RECHARGE |
| `charging-cloud/.../ChargeOrderBillServiceImpl.java` | 汽车结算后 publish CHARGE |
| `charging-cloud/.../MarketingActivityService.java` (+ Impl) | `exportExchangeCodes` |
| `charging-cloud/.../MarketingController.java` | `GET .../exportCodes` |
| `charging-cloud-web/.../api/marketing/marketing.js` | `exportCodes` |
| `charging-cloud-web/.../exchangeCodeList.vue` | 导出按钮 |
| `charging-cloud-web/.../activityTypes.js` | 类型 1/2/4 的 tip 文案 |
| `charging-cloud-web/.../ActivityFormDrawer.vue` / `ActivityDetailDrawer.vue` | 展示 tip |
| `charging-cloud/.../MarketingChargeSettlementServiceImpl.java` | 汇总字段填实 |

---

## Phase A — P2 自动发券

### Task 1: 事件模型 + 监听骨架

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/enums/marketing/MarketingTriggerTypeEnum.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/event/MarketingTriggerEvent.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingEventIssueService.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingEventIssueServiceImpl.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/listener/MarketingEventListener.java`

- [x] **Step 1: 新增触发类型枚举**

```java
package com.sharecharge.biz.enums.marketing;

import lombok.Getter;

@Getter
public enum MarketingTriggerTypeEnum {
    REGISTER("1", "注册领取"),
    RECHARGE("2", "充值领取"),
    CHARGE("4", "充电领取");

    private final String activityType;
    private final String label;

    MarketingTriggerTypeEnum(String activityType, String label) {
        this.activityType = activityType;
        this.label = label;
    }
}
```

- [x] **Step 2: 新增事件类**

```java
package com.sharecharge.biz.event;

import com.sharecharge.biz.enums.marketing.MarketingTriggerTypeEnum;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;

@Getter
public class MarketingTriggerEvent extends ApplicationEvent {
    private final MarketingTriggerTypeEnum triggerType;
    private final Integer userId;
    private final String tenantId;
    /** 充值实付金额（RECHARGE）；其它类型可为 null */
    private final BigDecimal amount;
    /** 本单充电度数（CHARGE）；其它类型可为 null */
    private final BigDecimal orderPower;
    /** 本单电站 ID（CHARGE）；其它类型可为 null */
    private final Integer networkDotId;
    private final String orderCode;

    public MarketingTriggerEvent(Object source,
                                 MarketingTriggerTypeEnum triggerType,
                                 Integer userId,
                                 String tenantId,
                                 BigDecimal amount,
                                 BigDecimal orderPower,
                                 Integer networkDotId,
                                 String orderCode) {
        super(source);
        this.triggerType = triggerType;
        this.userId = userId;
        this.tenantId = tenantId;
        this.amount = amount;
        this.orderPower = orderPower;
        this.networkDotId = networkDotId;
        this.orderCode = orderCode;
    }

    public static MarketingTriggerEvent register(Object source, Integer userId, String tenantId) {
        return new MarketingTriggerEvent(source, MarketingTriggerTypeEnum.REGISTER, userId, tenantId,
                null, null, null, null);
    }

    public static MarketingTriggerEvent recharge(Object source, Integer userId, String tenantId, BigDecimal amount) {
        return new MarketingTriggerEvent(source, MarketingTriggerTypeEnum.RECHARGE, userId, tenantId,
                amount, null, null, null);
    }

    public static MarketingTriggerEvent charge(Object source, Integer userId, String tenantId,
                                               BigDecimal orderPower, Integer networkDotId, String orderCode) {
        return new MarketingTriggerEvent(source, MarketingTriggerTypeEnum.CHARGE, userId, tenantId,
                null, orderPower, networkDotId, orderCode);
    }
}
```

- [x] **Step 3: 接口 + 空实现 + Listener（先打日志，后续任务填逻辑）**

```java
// MarketingEventIssueService.java
package com.sharecharge.biz.service;

import com.sharecharge.biz.event.MarketingTriggerEvent;

public interface MarketingEventIssueService {
    void handle(MarketingTriggerEvent event);
}
```

```java
// MarketingEventIssueServiceImpl.java — 先空实现
@Service
@Slf4j
public class MarketingEventIssueServiceImpl implements MarketingEventIssueService {
    @Override
    public void handle(MarketingTriggerEvent event) {
        if (event == null || event.getTriggerType() == null || event.getUserId() == null
                || StringUtils.isBlank(event.getTenantId())) {
            return;
        }
        log.info("[营销事件] received type={} userId={} tenantId={} amount={} power={} station={} order={}",
                event.getTriggerType(), event.getUserId(), event.getTenantId(),
                event.getAmount(), event.getOrderPower(), event.getNetworkDotId(), event.getOrderCode());
    }
}
```

```java
// MarketingEventListener.java
@Component
@Slf4j
public class MarketingEventListener {
    @Autowired
    private MarketingEventIssueService marketingEventIssueService;

    @Async
    @EventListener
    public void onMarketingTrigger(MarketingTriggerEvent event) {
        try {
            marketingEventIssueService.handle(event);
        } catch (Exception e) {
            log.warn("[营销事件] handle failed type={} userId={}: {}",
                    event == null ? null : event.getTriggerType(),
                    event == null ? null : event.getUserId(),
                    e.getMessage(), e);
        }
    }
}
```

确认项目已有 `@EnableAsync`（若无，在现有启动配置类增加，勿新建多余配置类）。

- [x] **Step 4: Commit**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz/src/main/java/com/sharecharge/biz/enums/marketing/MarketingTriggerTypeEnum.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/event/MarketingTriggerEvent.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingEventIssueService.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingEventIssueServiceImpl.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/listener/MarketingEventListener.java
git commit -m "$(cat <<'EOF'
feat(marketing): add P2 trigger event skeleton

EOF
)"
```

---

### Task 2: 扩展 IssueService 支持上下文发券

**Files:**
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/MarketingIssueService.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/MarketingIssueServiceImpl.java`

**行为约定：**
- 现有 `issue(activityId, userId, tenantId, channel)` 保持不变（定向/扫码/兑换发全部 reward）。
- 新增 `issue(activityId, userId, tenantId, channel, MarketingIssueContext ctx)`：
  - `ctx.rechargeAmount != null`（充值）：只发放 `rewardThreshold` **等于**「`<= amount` 的最大档位」的奖励行；无匹配档返回业务错误「未达充值档位」。
  - `ctx` 为空或无金额：行为同旧接口。

- [x] **Step 1: 增加上下文 DTO + 接口重载**

```java
// 可放在 entity/model/marketing/MarketingIssueContext.java
@Data
public class MarketingIssueContext {
    /** 充值实付金额，用于筛选 reward_threshold */
    private BigDecimal rechargeAmount;
}
```

```java
public interface MarketingIssueService {
    ResultUtil issue(String activityId, Integer userId, String tenantId, IssueChannelEnum channel);

    ResultUtil issue(String activityId, Integer userId, String tenantId, IssueChannelEnum channel,
                     MarketingIssueContext context);
}
```

- [x] **Step 2: Impl 中原 `issue` 委托到带 context 的重载；筛选档位**

在 `MarketingIssueServiceImpl`：

```java
@Override
@Transactional(rollbackFor = Exception.class)
public ResultUtil issue(String activityId, Integer userId, String tenantId, IssueChannelEnum channel) {
    return issue(activityId, userId, tenantId, channel, null);
}

@Override
@Transactional(rollbackFor = Exception.class)
public ResultUtil issue(String activityId, Integer userId, String tenantId, IssueChannelEnum channel,
                        MarketingIssueContext context) {
    // ... 复制现有校验至「取得 rewards 列表」处 ...
    List<MarketingCardCouponActivityReward> rewards = rewardMapper.selectList(...);
    if (rewards.isEmpty()) {
        return ResultUtil.error("活动未配置奖励");
    }
    if (context != null && context.getRechargeAmount() != null
            && "2".equals(activity.getActivityType())) {
        rewards = filterRechargeTierRewards(rewards, context.getRechargeAmount());
        if (rewards.isEmpty()) {
            return ResultUtil.error("未达充值档位");
        }
    }
    // ... 后续扣库存/发卡逻辑不变 ...
}

/**
 * 取 rewardThreshold <= amount 的最大档，仅保留该档所有 reward 行。
 * threshold 为 null 的行忽略。
 */
private List<MarketingCardCouponActivityReward> filterRechargeTierRewards(
        List<MarketingCardCouponActivityReward> rewards, BigDecimal amount) {
    BigDecimal best = null;
    for (MarketingCardCouponActivityReward r : rewards) {
        if (r.getRewardThreshold() == null) {
            continue;
        }
        if (r.getRewardThreshold().compareTo(amount) <= 0) {
            if (best == null || r.getRewardThreshold().compareTo(best) > 0) {
                best = r.getRewardThreshold();
            }
        }
    }
    if (best == null) {
        return Collections.emptyList();
    }
    final BigDecimal matched = best;
    List<MarketingCardCouponActivityReward> matchedList = new ArrayList<>();
    for (MarketingCardCouponActivityReward r : rewards) {
        if (r.getRewardThreshold() != null && r.getRewardThreshold().compareTo(matched) == 0) {
            matchedList.add(r);
        }
    }
    return matchedList;
}
```

- [x] **Step 3: 手工验证档位过滤（可写临时 main 或本地调试断点）**

用例：档位 50/100/200；充 120 → 只发 100 档；充 40 → 错误「未达充值档位」。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): support recharge tier filtering on issue

EOF
)"
```

---

### Task 3: 实现 MarketingEventIssueService（注册 / 充值 / 充电）

**Files:**
- Modify: `MarketingEventIssueServiceImpl.java`
- 可能复用: `MarketingCardCouponActivityMapper`、`MarketingChargeActivityMapper`、`MarketingCardCouponActivityStationScopeMapper`、`ChargeOrder` 查询 Service/Mapper

**规则：**

| 触发 | 活动 type | 匹配条件 | 发券 |
|------|-----------|----------|------|
| REGISTER | `1` | `activity_status=进行中`，用户范围通过（Issue 内校验） | `issue(..., EVENT)` |
| RECHARGE | `2` | 同上 + `payMoney` 达档 | `issue(..., EVENT, context.amount)` |
| CHARGE | `4` | 同上 + 电站范围 + **活动期内用户在范围内电站累计充电度数 ≥ limitPower** | `issue(..., EVENT)` |

充电累计口径（按设计「累计度数」）：
1. 活动 `start_time`～`end_time` 内；
2. `rule_id=2`（汽车）已完成订单；
3. `user_id` + `tenant_id` 匹配；
4. 若 `station_scope` 非「全部」，订单 `network_dot_id` 须在 `t_marketing_card_coupon_activity_station_scope`；
5. `SUM(total_power) >= limit_power` 才发；`limit_type/limit_count` 仍由 IssueService 领取次数控制。

- [x] **Step 1: 注入依赖并实现 `handle` 分发**

```java
@Override
public void handle(MarketingTriggerEvent event) {
    if (event == null || event.getTriggerType() == null || event.getUserId() == null
            || StringUtils.isBlank(event.getTenantId())) {
        return;
    }
    switch (event.getTriggerType()) {
        case REGISTER:
            issueRunningActivities(event, "1", null);
            break;
        case RECHARGE:
            if (event.getAmount() == null || event.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                return;
            }
            MarketingIssueContext ctx = new MarketingIssueContext();
            ctx.setRechargeAmount(event.getAmount());
            issueRunningActivities(event, "2", ctx);
            break;
        case CHARGE:
            issueChargeActivities(event);
            break;
        default:
            break;
    }
}
```

- [x] **Step 2: 查询进行中活动并逐个发券（失败只打日志，不中断其它活动）**

```java
private void issueRunningActivities(MarketingTriggerEvent event, String activityType,
                                    MarketingIssueContext context) {
    List<MarketingCardCouponActivity> list = activityMapper.selectList(
            new LambdaQueryWrapper<MarketingCardCouponActivity>()
                    .eq(MarketingCardCouponActivity::getTenantId, event.getTenantId())
                    .eq(MarketingCardCouponActivity::getActivityType, activityType)
                    .eq(MarketingCardCouponActivity::getActivityStatus, ActivityStatusEnum.RUNNING.getCode()));
    for (MarketingCardCouponActivity activity : list) {
        try {
            ResultUtil r = context == null
                    ? marketingIssueService.issue(activity.getActivityId(), event.getUserId(),
                    event.getTenantId(), IssueChannelEnum.EVENT)
                    : marketingIssueService.issue(activity.getActivityId(), event.getUserId(),
                    event.getTenantId(), IssueChannelEnum.EVENT, context);
            log.info("[营销事件] issue type={} activityId={} userId={} code={} msg={}",
                    activityType, activity.getActivityId(), event.getUserId(), r.getCode(), r.getMsg());
        } catch (Exception e) {
            log.warn("[营销事件] issue exception activityId={}: {}", activity.getActivityId(), e.getMessage(), e);
        }
    }
}
```

- [x] **Step 3: 充电活动 — 电站范围 + 累计度数**

```java
private void issueChargeActivities(MarketingTriggerEvent event) {
    List<MarketingCardCouponActivity> list = activityMapper.selectList(... type=4 RUNNING ...);
    for (MarketingCardCouponActivity activity : list) {
        MarketingChargeActivity sub = chargeActivityMapper.selectOne(...);
        if (sub == null || sub.getLimitPower() == null) {
            continue;
        }
        if (!matchStationScope(activity, sub, event.getNetworkDotId(), event.getTenantId())) {
            continue;
        }
        BigDecimal accumulated = sumUserChargePower(event.getUserId(), event.getTenantId(),
                activity, sub);
        if (accumulated.compareTo(sub.getLimitPower()) < 0) {
            log.info("[营销事件] charge power not enough activityId={} accumulated={} need={}",
                    activity.getActivityId(), accumulated, sub.getLimitPower());
            continue;
        }
        // issue EVENT ...
    }
}
```

`matchStationScope`：`station_scope` 为全部（与前端约定值，通常 `"3"`）则 true；否则查 station_scope 表是否包含 `networkDotId`。

`sumUserChargePower`：用现有 `ChargeOrder` Mapper/Service，条件：`userId`、`tenantId`、`ruleId=2`、订单状态为已结算/已完成（与项目现有已结算状态码对齐，实现时对照 `ChargeOrder` 状态枚举）、`createTime/endTime` 落在活动时间内；非全电站时 `networkDotId in (...)`；`SUM(total_power)`。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): implement event-driven auto coupon issue

EOF
)"
```

---

### Task 4: 接入注册成功钩子

**Files:**
- Modify: `charging-cloud/sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppUserController.java`

**触发点（仅「新用户」）：** `loginOrRegisterByPhone` 中 `appUserService.save(nu)` 成功之后。  
**不触发：** 已有用户登录、仅绑定手机号到已有 openId 用户、`wxLogin` 无手机号的临时用户创建（避免未完成注册就发券）。

- [x] **Step 1: 注入 `ApplicationEventPublisher`**

```java
@Autowired
private ApplicationEventPublisher applicationEventPublisher;
```

- [x] **Step 2: 在 `save(nu)` 成功后发布事件**

```java
appUserService.save(nu);
try {
    applicationEventPublisher.publishEvent(
            MarketingTriggerEvent.register(this, nu.getId(), tenantId));
} catch (Exception e) {
    log.warn("[营销事件] publish REGISTER failed userId={}: {}", nu.getId(), e.getMessage());
}
return ResultUtil.success(toMiniAppUserInfoVo(nu));
```

- [x] **Step 3: 手工验证**

1. 后台创建进行中「注册领取」活动并配置卡券库存。  
2. 用新手机号走小程序 `loginOrRegisterByPhone`。  
3. 查 `t_marketing_user_card_coupon` / 领取记录有该用户；「我的卡券」可见。  
4. 同一用户再次登录不重复发（限领=1）。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): publish register trigger on new phone signup

EOF
)"
```

---

### Task 5: 接入充值成功钩子

**Files:**
- Modify: `charging-cloud/sharecharge-applet/sharecharge-applet-controller/src/main/java/com/sharecharge/wxma/AppPayController.java` 的 `checkout(AppPayDetails payDetails)`（**非**月卡重载）

**触发点：** 余额充值成功、用户账户已加款之后。  
**金额：** 使用 `payDetails.getPayMoney()`（实付，不含赠送）。  
**排除：** `type == 2` 套餐卡充值、月卡 `checkout` 重载。

- [x] **Step 1: 注入 publisher**

- [x] **Step 2: 在用户余额更新成功后发布**

在 `checkout(AppPayDetails)` 的 `else` 分支（用户余额）`appUserService.updateById(appUserById)` 之后：

```java
try {
    applicationEventPublisher.publishEvent(
            MarketingTriggerEvent.recharge(this, payDetails.getUserId(),
                    appUserById.getTenantId(), payDetails.getPayMoney()));
} catch (Exception e) {
    log.warn("[营销事件] publish RECHARGE failed payCode={}: {}", payDetails.getPayCode(), e.getMessage());
}
```

若 `tenantId` 在 `payDetails` 上更可靠，优先用 `payDetails` 上的租户字段（实现时对照实体字段名）。

- [x] **Step 3: 手工验证**

1. 配置充值活动档位 50→券A、100→券B。  
2. 充值 100 元 → 只得券B；领取记录 1 条。  
3. 充值 30 元 → 不发券。  
4. 达限领后再次充值不发。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): publish recharge trigger after balance top-up

EOF
)"
```

---

### Task 6: 接入充电结算钩子

**Files:**
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/ChargeOrderBillServiceImpl.java` 的 `orderSettlement`

**触发点：** `ruleId==2` 营销结算 try/catch **之后**（无论营销结算成功与否都尝试发券；发券自身失败不影响支付）。  
**参数：** `userId`、`tenantId`、`totalPower`、`networkDotId`（或订单上电站字段）、`orderCode`。

- [x] **Step 1: 注入 publisher**

- [x] **Step 2: 在 `if (ruleId==2)` 块末尾（settle 之后）发布**

```java
if (Integer.valueOf(2).equals(chargeOrder.getRuleId())) {
    try {
        marketingChargeSettlementService.settle(chargeOrder, chargeOrderExpenseInfos);
    } catch (Exception e) {
        log.warn(...);
    }
    try {
        BigDecimal power = chargeOrder.getTotalPower() == null
                ? BigDecimal.ZERO : BigDecimal.valueOf(chargeOrder.getTotalPower());
        applicationEventPublisher.publishEvent(
                MarketingTriggerEvent.charge(this, chargeOrder.getUserId(), chargeOrder.getTenantId(),
                        power, chargeOrder.getNetworkDotId(), chargeOrder.getOrderCode()));
    } catch (Exception e) {
        log.warn("[营销事件] publish CHARGE failed orderCode={}: {}",
                chargeOrder.getOrderCode(), e.getMessage());
    }
}
```

（字段名以 `ChargeOrder` 实体为准：电站 ID 可能是 `networkDotId` / `stationId`，实现时对照。）

- [x] **Step 3: 手工验证**

1. 配置充电领取 `limitPower=10`，限电站 A。  
2. 在电站 A 完成一笔 ≥10 度或累计 ≥10 度订单 → 发券。  
3. 电站 B 不发；未达度数不发；达限领后不发。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): publish charge trigger after car order settlement

EOF
)"
```

---

### Task 7: Web 端 P2 提示文案

**Files:**
- Modify: `charging-cloud-web/src/views/marketing/constants/activityTypes.js`
- Modify: `charging-cloud-web/src/views/marketing/components/ActivityFormDrawer.vue`
- Modify: `charging-cloud-web/src/views/marketing/components/ActivityDetailDrawer.vue`

- [x] **Step 1: 为类型 1/2/4 补充 tip（P2 接通后改为「已自动发放」说明）**

```js
// type 1
autoIssueTip: '用户通过手机号完成注册后自动发放卡券。',
// type 2
autoIssueTip: '用户余额充值成功后，按最高匹配档位自动发放卡券。',
// type 4
autoIssueTip: '汽车充电结算后，活动期内累计充电度数达标自动发放卡券。',
```

删除或替换原先未接线的 `p1Tip`。

- [x] **Step 2: 表单/详情顶部展示**

在 `ActivityFormDrawer` / `ActivityDetailDrawer` 对应类型表单顶部：

```html
<el-alert
  v-if="typeMeta && typeMeta.autoIssueTip"
  :title="typeMeta.autoIssueTip"
  type="info"
  :closable="false"
  show-icon
  style="margin-bottom: 16px;"
/>
```

- [x] **Step 3: Commit（web 仓库）**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/views/marketing/constants/activityTypes.js \
  src/views/marketing/components/ActivityFormDrawer.vue \
  src/views/marketing/components/ActivityDetailDrawer.vue
git commit -m "$(cat <<'EOF'
feat(marketing): show auto-issue tips for register/recharge/charge

EOF
)"
```

---

## Phase B — 兑换码 Excel 导出

### Task 8: 后端 exportCodes

**Files:**
- Modify: `MarketingActivityService.java` / `MarketingActivityServiceImpl.java`
- Modify: `MarketingController.java`
- Create: `.../entity/model/marketing/MarketingExchangeCodeExportDTO.java`（EasyExcel 行模型）

- [x] **Step 1: Export DTO**

```java
@Data
public class MarketingExchangeCodeExportDTO {
    @ExcelProperty("兑换码")
    private String conversionCode;
    @ExcelProperty("状态")
    private String conversionStatusLabel;
    @ExcelProperty("兑换用户")
    private String conversionUserAccount;
    @ExcelProperty("兑换时间")
    private String conversionTime;
}
```

- [x] **Step 2: Service 方法 — 按活动查出全部码（可分批，上限建议 5 万，超限返回错误）**

```java
ResultUtil exportExchangeCodes(String activityId, String tenantId, String status);
```

实现：复用 `listCodes` 的查询条件，`status` 可选；映射为 DTO 列表放入 `ResultUtil.data`。  
Controller 层写响应流（与 `AppUserDriverController` EasyExcel 写法一致）：

```java
@GetMapping("/activity/exchange/exportCodes")
public void exportCodes(@RequestParam String activityId,
                        @RequestParam(required = false) String status,
                        HttpServletResponse response) throws IOException {
    ResultUtil result = marketingActivityService.exportExchangeCodes(
            activityId, resolveTenantId(), status);
    if (result.getCode() != ExceptionConstant.SUCCESS_HTTPREUQEST) {
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(JSON.toJSONString(result));
        return;
    }
    @SuppressWarnings("unchecked")
    List<MarketingExchangeCodeExportDTO> rows = (List<MarketingExchangeCodeExportDTO>) result.getData();
    String fileName = URLEncoder.encode("兑换码-" + activityId, "UTF-8").replaceAll("\\+", "%20");
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setCharacterEncoding("utf-8");
    response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
    EasyExcel.write(response.getOutputStream(), MarketingExchangeCodeExportDTO.class)
            .sheet("兑换码").doWrite(rows);
}
```

权限：与 `listCodes` 相同（`:marketing:activity:exchange:edit` 或 view，与现有菜单对齐）。

- [x] **Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): export exchange codes to excel

EOF
)"
```

---

### Task 9: Web 导出按钮

**Files:**
- Modify: `charging-cloud-web/src/api/marketing/marketing.js`
- Modify: `charging-cloud-web/src/views/marketing/exchangeCodeList.vue`

- [x] **Step 1: API**

```js
export function exportExchangeCodes(params) {
  return request({
    url: `${BASE}/activity/exchange/exportCodes`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}
```

- [x] **Step 2: 页面增加「导出 Excel」按钮**

在筛选区 `状态筛选` 旁增加按钮；点击后用当前 `activityId` + `statusFilter` 调导出，blob 下载为 `兑换码.xlsx`（项目内若已有 `download` 工具则复用）。

- [x] **Step 3: 手工验证生成若干码后导出，Excel 列齐全。**

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): add exchange code excel export button

EOF
)"
```

---

## Phase C — 结算汇总填实（QA P0，不含双轨台账）

### Task 10: 回填 `t_order_settlement_info` 平台/商户优惠合计

**Files:**
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/marketing/impl/MarketingChargeSettlementServiceImpl.java` 的 `persistSettlement`

**规则（与 Q&A Q1 一致）：**
- `platformTotalDiscountAmount` = 明细中 `discountSource==1` 的电费+服务费优惠之和  
- `operatorTotalDiscountAmount` = 明细中 `discountSource==2` 的电费+服务费优惠之和  
- `operatorElectricityActualIncome` = `origElec -` 商户承担电费优惠（`discountSource==2` 的 charged 部分）  
- `operatorServiceActualIncome` = `origSvc -` 商户承担服务费优惠  
- `operatorActualIncome` = 上述两者之和  
- 会员字段继续保持 0  

需把 `buildDiscountRecords(...)` 的结果传入 `persistSettlement`，或在 `persistSettlement` 内根据已算好的 disc 与 initiator 聚合（优先复用已构建的 `List<OrderDiscountInfo>`，避免二次推断）。

- [x] **Step 1: 调整调用链，使 persist 能拿到 discountRecords**

- [x] **Step 2: 替换 ZERO 赋值**

```java
BigDecimal platformTotal = BigDecimal.ZERO;
BigDecimal operatorTotal = BigDecimal.ZERO;
BigDecimal operatorElecDisc = BigDecimal.ZERO;
BigDecimal operatorSvcDisc = BigDecimal.ZERO;
for (OrderDiscountInfo row : discountRecords) {
    if (row == null) continue;
    BigDecimal elec = nz(row.getChargedDiscountAmount());
    BigDecimal svc = nz(row.getServiceDiscountAmount());
    BigDecimal line = elec.add(svc);
    if (Integer.valueOf(1).equals(row.getDiscountSource())) {
        platformTotal = platformTotal.add(line);
    } else if (Integer.valueOf(2).equals(row.getDiscountSource())) {
        operatorTotal = operatorTotal.add(line);
        operatorElecDisc = operatorElecDisc.add(elec);
        operatorSvcDisc = operatorSvcDisc.add(svc);
    }
}
settlement.setPlatformTotalDiscountAmount(scale2(platformTotal));
settlement.setOperatorTotalDiscountAmount(scale2(operatorTotal));
settlement.setOperatorElectricityActualIncome(scale2(origElec.subtract(operatorElecDisc).max(BigDecimal.ZERO)));
settlement.setOperatorServiceActualIncome(scale2(origSvc.subtract(operatorSvcDisc).max(BigDecimal.ZERO)));
settlement.setOperatorActualIncome(scale2(
        settlement.getOperatorElectricityActualIncome()
                .add(settlement.getOperatorServiceActualIncome())));
```

- [x] **Step 3: 手工验证**

1. 平台活动折扣订单 → `platform_total_discount_amount > 0`，商户优惠为 0。  
2. 商户活动/券 → `operator_total_*` 有值，运营商实收 = 原价 − 商户承担。  
3. Web 订单详情营销区块数字与明细一致。

- [x] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(marketing): fill settlement platform/operator discount totals

EOF
)"
```

---

## 联调验收清单

> 代码已就绪；下列为**测试环境手工验收**项（未验收前保持未勾选）。

| # | 场景 | 期望 | 验收 |
|---|------|------|------|
| 1 | 新手机号注册 + 注册活动进行中 | 自动入账卡券 | [ ] |
| 2 | 老用户再登录 | 不重复发 | [ ] |
| 3 | 充值达档 / 未达档 | 仅最高档发 / 不发 | [ ] |
| 4 | 充电累计达 `limitPower` + 电站匹配 | 发券 | [ ] |
| 5 | 充电电站不匹配 | 不发 | [ ] |
| 6 | 兑换码导出 | Excel 可打开，列正确 | [ ] |
| 7 | 活动表单 1/2/4 | 可见自动发放说明 | [ ] |
| 8 | 营销结算订单 | settlement 汇总字段非全 0 | [ ] |

---

## Self-Review

| 检查项 | 结论 |
|--------|------|
| Spec Phase 2 注册/充值/充电 | ✅ Task 1–6 + `68d51532` 多路径补全 |
| 兑换码 exportCodes | ✅ Task 8–9 |
| 结算汇总 P0 | ✅ Task 10；双轨台账仍 out of scope |
| Issue 重载与事件上下文一致 | ✅ Task 2/3 |
| 仓库无 JUnit | 以手工验收表代替单元测试步骤 |

---

## 后续计划（不在本文 / 仍未完成）

1. **双轨台账 + 平台补款**：`charging-cloud/doc/marketing-settlement-split-qa.md` 附录 A P1–P3（`split_base_type`、台账双基数、补款出款）  
2. **体验边角**：站列表「X张券可用」、独立券详情、使用记录回滚态、充值页活动入口（原首页角标/活动中心已演进）  
3. **过期券日更 Job**（当前查询时标记）  
4. **异常单结算**挂营销 / CHARGE；OCPP 起充失败释券全覆盖  
5. **发布时**再将 `develop/charging-marketing` 合并主干（`master` / `main`）
