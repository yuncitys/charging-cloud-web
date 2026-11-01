# 台账抽屉内嵌营销补款 — 设计说明

**日期：** 2026-07-27  
**范围：** `charging-cloud-web`（财务台账页入口整合 + 弃用独立营销补款页）  
**状态：** 待实现

## 背景与目标

营销补款是定期分账双轨中的「平台补款轨」，与台账账期（`periodId`）强相关。当前独立页 `subsidyLedgerList.vue` 挂在营销菜单下，财务对账路径割裂。

**目标：** 在「台账与分账」列表行操作中进入补款能力，用**独立抽屉**展示补款台账/批次；台账明细抽屉保持原样；弃用独立补款页面与侧栏菜单入口。

## 已确认决策

| 项 | 决策 |
|----|------|
| 入口位置 | 列表行「操作」列，与「台账明细」「提交分账」并列 |
| 交互形态 | **独立抽屉**打开营销补款；「台账明细」抽屉保持原样、不做改动 |
| 独立页 | 弃用并删除 `subsidyLedgerList.vue` |
| 路由 / 菜单 | 删除前端路由；菜单 SQL 将「营销补款台账」页菜单隐藏/删除；功能权限 907–909 改挂台帐页菜单 **754**（勿挂 820，否则侧栏会出现假菜单） |
| 权限 | 沿用现有营销补款权限常量，不新增财务侧权限码 |
| API | 补款相关 API 与 `MARKETING_PERMS` 保留，供面板复用 |

## 交互设计

### 列表行操作

- 新增按钮：**营销补款**
- 显示条件：具备补款台账或出款批次查看权限之一（`MARKETING_PERMS.subsidyLedgerPage` / `subsidyBatchPage`）
- 点击：打开**独立**营销补款抽屉，传入 `periodId = row.id`、`merchantId = row.merchantId`、`periodKey` 仅用于标题
- 「台账明细」：保持原 `openDrawer(row)`，抽屉内容与逻辑零改动

### 抽屉结构

```
抽屉 A（原样）：台账明细 — {periodKey}
  摘要 / 分账批次 / 台账行 …

抽屉 B（新增）：营销补款 — {periodKey}
  SubsidyLedgerPanel(periodId, merchantId)
```

- 两个抽屉互不影响；打开补款抽屉不调用 `periodDetail`
- 关闭补款抽屉时清空 `subsidyDrawer` 入参

## 组件拆分

### 新增 `SubsidyLedgerPanel.vue`

路径建议：`src/views/marketing/components/SubsidyLedgerPanel.vue`

| Props | 类型 | 说明 |
|-------|------|------|
| `periodId` | Number/String，必填 | 当前账期 id，查询锁定 |
| `merchantId` | Number/String，可选 | 预填商户筛选 |

行为：

- 内含子 Tab：补款台账 / 出款批次（迁自 `subsidyLedgerList.vue`）
- 账期 ID：只读展示（来自 prop），不允许在抽屉内改查其它账期
- 商户 / 补款状态等其它筛选可保留可编辑
- 「确认线下打款」逻辑与权限校验原样迁入
- 监听 `periodId` 变化时重置分页并重新拉取

### 修改 `settlementLedger/index.vue`

- 操作列加「营销补款」→ `openSubsidyDrawer(row)`
- **新增**独立 `el-drawer` + `subsidyDrawer` 状态，内挂 `SubsidyLedgerPanel`
- **不改**原台账明细抽屉模板与 `openDrawer` / `onDrawerClose` 行为
- 操作列宽度按需加宽（约 +90～110px）

### 删除 / 下线

| 项 | 动作 |
|----|------|
| `src/views/marketing/subsidyLedgerList.vue` | 删除 |
| `src/router/index.js` → `subsidyLedgerList` | 删除路由项 |
| 菜单 id=867「营销补款台账」 | 新 SQL：`delete_status=1`（或隐藏），幂等；**保留**子权限 907/908/909，改挂父菜单 **754（台帐与分账）** |
| `@/api/marketing/marketing` 补款接口 | 保留 |
| `MARKETING_PERMS` 补款常量 | 保留 |

> 勿把 907–909 挂到营销顶级菜单 820：侧栏会把二级子项全部渲染为可点菜单，导致假入口进 404。挂到 754 与现有台帐按钮权限（755–782）同级。旧 868/869 已软删可保持。

## 数据流

```
行点击「营销补款」
  → subsidyDrawer.visible=true, periodId=row.id, merchantId=row.merchantId
  → SubsidyLedgerPanel(periodId, merchantId)
  → pageSubsidyLedger / pageSubsidyBatch（query 含 periodId）
  → confirmSubsidyBatch（批次操作，成功后刷新台账+批次）

行点击「台账明细」
  → 原 drawer 流程不变（periodDetail + lines + payoutBatches）
```

后端接口不变，仅前端入口与展示位置变更。

## 非目标

- 不改补款汇总 Job、出款批次业务规则
- 不把补款 API 迁到 finance 命名空间
- 不在台账列表页做补款金额汇总列（可后续另开需求）

## 验收要点

1. 有权限用户在台账列表行可见「营销补款」，点击进入**独立**补款抽屉，数据按该账期过滤
2. 「台账明细」仍打开原抽屉，内容与逻辑与改前一致
3. 无补款权限时不显示「营销补款」按钮；有权限时可在面板内确认线下打款
4. 侧栏不再出现「营销补款台账」；访问旧路由 `/marketing/subsidyLedgerList` 应 404 或被移除
5. 补款抽屉内账期不可改查其它 periodId
6. 打开补款抽屉不调用 `periodDetail`（不依赖台账 detail 权限）
