# 营销中心 P1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付营销中心 P1：Web 全界面 + App 卡券页 + Java 管理/领取 API，跑通卡券创建→活动配置→定向/扫码/券码发券→我的卡券闭环。

**Architecture:** 方案 1 — `MarketingActivityService` + 8 活动策略 + `MarketingIssueService` 统一发券；对齐意见反馈模块分层。设计详见 `docs/superpowers/specs/marketing-center/2026-06-14-marketing-center-design.md`。

**Tech Stack:** Java 8+ / Spring Boot / MyBatis-Plus / Sa-Token / Vue 2 Element UI / UniApp

---

## 活动录入数据表关系

> **权威文档：** 详见设计规格 [`2026-06-14-marketing-center-design.md`](../specs/2026-06-14-marketing-center-design.md) 的 **Data Model → 活动录入数据表关系** 章节。以下为实施要点摘要。

### 统一保存流程

```
MarketingActivitySaveDTO
├── activity          → t_marketing_card_coupon_activity
├── rewards[]         → t_marketing_card_coupon_activity_reward（类型 1–6）
├── stationScopes[]   → t_marketing_card_coupon_activity_station_scope（类型 4/7/8）
├── userScopes[]      → t_marketing_card_coupon_activity_user_scope（类型 3–6；类型 8 不写）
└── subConfig         → 各活动类型专属子表（Strategy 内先物理删后插）
```

### 类型速查

| 类型 | 名称 | 关键子表 | 备注 |
|------|------|----------|------|
| 1 | 注册领取 | 无 | 仅 reward |
| 2 | 充值领取 | `recharge_activity` | reward 含 `reward_threshold` |
| 3 | 定向发放 | `directional_activity` + user_scope | |
| 4 | 充电领取 | `charge_activity` + station/user scope | |
| 5 | 扫码领取 | `scan_activity` + user_scope | |
| 6 | 券码兑换 | `exchange_activity` + conversion_code | |
| 7 | 电站折扣 | `station_discount_activity` + station + time_slot | 无 reward；参与电站走 station_scope |
| 8 | 用户折扣 | `user_discount_activity` + participant + time_slot | 无 reward；参与用户写 participant，**不写 user_scope** |

---

## File Map

### charging-cloud (Java)

| 路径 | 职责 |
|---|---|
| `doc/sql/t_marketing_center_20260614.sql` | DDL 归档 |
| `doc/sql/t_marketing_menu_permissions_20260614.sql` | 菜单权限 |
| `sharecharge-biz/.../entity/marketing/*.java` | 26 实体 |
| `sharecharge-biz/.../enums/marketing/*.java` | 枚举 |
| `sharecharge-biz/.../mapper/marketing/*.java` | Mapper |
| `sharecharge-biz/.../entity/model/marketing/*.java` | DTO/VO/Pagination |
| `sharecharge-biz/.../service/marketing/*.java` | Service 接口 |
| `sharecharge-biz/.../service/marketing/impl/*.java` | Service 实现 |
| `sharecharge-biz/.../service/marketing/strategy/*.java` | 8 活动策略 |
| `sharecharge-web-controller/.../MarketingController.java` | Web API |
| `sharecharge-applet-controller/.../AppMarketingController.java` | App API |

### charging-cloud-web

| 路径 | 职责 |
|---|---|
| `src/api/marketing.js` | API 封装 |
| `src/router/index.js` | 路由 |
| `src/views/marketing/*.vue` | 管理页面（含 `activityHub`、Drawer 表单/详情） |

### charging-cloud-uniapp

| 路径 | 职责 |
|---|---|
| `api/marketing.js` | API 封装 |
| `pages/subPack/marketing/*.vue` | 用户页面 |
| `pages.json` | 页面注册 |

---

## Task 1: DDL + Entities + Enums + Mappers

**Files:** `doc/sql/`, `entity/marketing/`, `enums/marketing/`, `mapper/marketing/`

- [ ] 导出 26 表 DDL 至 `doc/sql/t_marketing_center_20260614.sql`（含折扣增量补丁）
- [ ] 创建 5 个枚举：`CardCouponTypeEnum`（含折扣券）, `ActivityTypeEnum`（含 7/8）, `ActivityStatusEnum`, `UserCouponStatusEnum`, `ScopeTypeEnum`
- [ ] 创建 26 个 `@TableName` 实体（`@TableId AUTO`，`@TableLogic isDelete`）
- [ ] 创建 26 个 `BaseMapper` 接口

---

## Task 2: 卡券管理

- [ ] `MarketingCardCouponService` + Impl：page/detail/save/cancel
- [ ] `MarketingCardCouponPagination` DTO
- [ ] `MarketingCardCouponController` Web 端 6 个接口
- [ ] ID 生成：`MK-CC-` + 雪花 ID

---

## Task 3: 分组管理

- [ ] `MarketingGroupService` + Impl：stationGroup/userGroup CRUD
- [ ] 用户分组批量导入手机号
- [ ] `MarketingGroupController` Web 端接口

---

## Task 4: 活动引擎

- [ ] `ActivityTypeStrategy` 接口 + 8 实现类
- [ ] `MarketingActivityService` + Impl：save/detail/page/stop
- [ ] `MarketingActivitySaveDTO` 聚合 DTO
- [ ] `MarketingActivityController` Web 端接口

---

## Task 5: 发券 + 领取

- [ ] `MarketingIssueService` + Impl
- [ ] 定向发放 `directional/send`
- [ ] 兑换码生成/兑换
- [ ] 扫码详情/领取（App）

---

## Task 6: 用户卡券 + 记录

- [ ] `MarketingUserCouponService` + Impl
- [ ] 领取记录/使用记录分页
- [ ] App `myList`/`detail`
- [ ] 过期券定时任务

---

## Task 7: Web 前端

- [ ] `api/marketing.js` + 路由 + 菜单 SQL
- [ ] `cardCouponList.vue` + `CardCouponFormDrawer` / `CardCouponDetailDrawer`
- [ ] `stationGroupList.vue` + `userGroupList.vue`
- [ ] `activityHub.vue` + `activityList.vue` + `ActivityFormDrawer` / `DiscountActivityFormDrawer`
- [ ] `receiveRecordList.vue` + `useRecordList.vue` + `exchangeCodeList.vue`

---

## Task 8: App 前端

- [ ] `api/marketing.js` + `pages.json`
- [ ] `myCoupon.vue` + `couponDetail.vue`
- [ ] `scanReceive.vue` + `codeExchange.vue`
- [ ] 个人中心入口

---

## Task 9: 验收

- [ ] 走 P1 联调验收清单 9 项（见 design spec）
