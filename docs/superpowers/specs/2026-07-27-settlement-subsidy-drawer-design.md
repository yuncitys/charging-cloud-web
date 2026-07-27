# 台账抽屉内嵌营销补款 — 设计说明

**日期：** 2026-07-27  
**范围：** `charging-cloud-web`（财务台账页入口整合 + 弃用独立营销补款页）  
**状态：** 待实现

## 背景与目标

营销补款是定期分账双轨中的「平台补款轨」，与台账账期（`periodId`）强相关。当前独立页 `subsidyLedgerList.vue` 挂在营销菜单下，财务对账路径割裂。

**目标：** 在「台账与分账」列表行操作中进入补款能力，并在现有台账明细抽屉内用 Tab 统一查看；弃用独立补款页面与侧栏菜单入口。

## 已确认决策

| 项 | 决策 |
|----|------|
| 入口位置 | 列表行「操作」列，与「台账明细」「提交分账」并列 |
| 交互形态 | 与「台账明细」共用大抽屉；顶部 Tab 切换 |
| 独立页 | 弃用并删除 `subsidyLedgerList.vue` |
| 路由 / 菜单 | 删除前端路由；菜单 SQL 将「营销补款台账」页菜单隐藏/删除 |
| 权限 | 沿用现有营销补款权限常量，不新增财务侧权限码 |
| API | 补款相关 API 与 `MARKETING_PERMS` 保留，供面板复用 |

## 交互设计

### 列表行操作

- 新增按钮：**营销补款**
- 显示条件：具备补款台账或出款批次查看权限之一（`MARKETING_PERMS.subsidyLedgerPage` / `subsidyBatchPage`）
- 点击：打开现有抽屉，`activeTab = 'subsidy'`，传入当前行 `periodId = row.id`、`merchantId = row.merchantId`
- 「台账明细」点击：打开同一抽屉，`activeTab = 'ledger'`（现有行为）

### 抽屉结构

```
抽屉标题：台账明细 — {periodKey}
┌─────────────────────────────────────┐
│ [台账与分账]  [营销补款]              │  ← el-tabs
├─────────────────────────────────────┤
│ Tab「台账与分账」：现有摘要 / 分账批次 │
│                 / 台账行明细          │
│ Tab「营销补款」：SubsidyLedgerPanel   │
└─────────────────────────────────────┘
```

- 切到「营销补款」时再触发面板加载（懒加载），避免无谓请求
- 关闭抽屉时重置 Tab、清空面板入参

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

- 操作列加「营销补款」按钮与 `openDrawer(row, 'subsidy')`（或等价）
- 抽屉内容外包 `el-tabs`：`ledger` / `subsidy`
- `subsidy` 页签内挂载 `SubsidyLedgerPanel`，传入 `drawer.periodId`、`drawer.summary.merchantId`
- 操作列宽度按需微调（约 +90～110px）

### 删除 / 下线

| 项 | 动作 |
|----|------|
| `src/views/marketing/subsidyLedgerList.vue` | 删除 |
| `src/router/index.js` → `subsidyLedgerList` | 删除路由项 |
| 菜单 id=867「营销补款台账」 | 新 SQL：`delete_status=1`（或隐藏），幂等；**保留**子权限 868/869（或等价 API 权限）供按钮鉴权 |
| `@/api/marketing/marketing` 补款接口 | 保留 |
| `MARKETING_PERMS` 补款常量 | 保留 |

> 若线上角色仅通过页面菜单 867 继承到子权限，隐藏 867 后需确认 868/869 仍挂在可授权树上；实现时优先「页面菜单 delete_status=1，子权限菜单保留且仍授权」，必要时把 868/869 的 `parent_id` 改挂到营销父菜单 820。

## 数据流

```
行点击「营销补款」
  → drawer.visible=true, periodId=row.id, tab=subsidy
  → SubsidyLedgerPanel(periodId, merchantId)
  → pageSubsidyLedger / pageSubsidyBatch（query 含 periodId）
  → confirmSubsidyBatch（批次操作，成功后刷新台账+批次）
```

后端接口不变，仅前端入口与展示位置变更。

## 非目标

- 不改补款汇总 Job、出款批次业务规则
- 不把补款 API 迁到 finance 命名空间
- 不在台账列表页做补款金额汇总列（可后续另开需求）

## 验收要点

1. 有权限用户在台账列表行可见「营销补款」，点击进入抽屉「营销补款」Tab，数据按该账期过滤
2. 「台账明细」仍打开同一抽屉且默认「台账与分账」Tab，原功能不受影响
3. 无补款权限时不显示「营销补款」按钮；有权限时可在面板内确认线下打款
4. 侧栏不再出现「营销补款台账」；访问旧路由 `/marketing/subsidyLedgerList` 应 404 或被移除
5. 抽屉内账期不可改查其它 periodId
