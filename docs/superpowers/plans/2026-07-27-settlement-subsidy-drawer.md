# 台账抽屉内嵌营销补款 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将营销补款台账/出款批次嵌入「台账与分账」抽屉 Tab，列表行增加「营销补款」入口，并弃用独立页与侧栏菜单。

**Architecture:** 从 `subsidyLedgerList.vue` 抽出 `SubsidyLedgerPanel.vue`（props: `periodId` 锁定、`merchantId` 可选预填）；`settlementLedger/index.vue` 抽屉顶层加 `el-tabs`（台账与分账 / 营销补款），行操作打开对应 Tab；删除独立路由与页面，菜单 SQL 将页菜单 867 置删并把功能权限 907–909 改挂营销父菜单 820。

**Tech Stack:** Vue 2 / Element UI / 现有 `@/api/marketing/marketing` 补款接口 / `MARKETING_PERMS`

**Spec:** [`docs/superpowers/specs/2026-07-27-settlement-subsidy-drawer-design.md`](../specs/2026-07-27-settlement-subsidy-drawer-design.md)

## Global Constraints

- 不新增财务侧权限码；按钮与面板继续用 `MARKETING_PERMS.subsidyLedgerPage` / `subsidyBatchPage` / `subsidyConfirmOffline`
- 不改后端补款 Job / API 契约
- 抽屉内账期 ID 只读，禁止改查其它 `periodId`
- 切到「营销补款」Tab 再加载面板数据（懒加载）
- 操作列宽度按需加宽以容纳新按钮

---

## File Map

| 路径 | 职责 |
|------|------|
| `src/views/marketing/components/SubsidyLedgerPanel.vue` | **新建** 补款台账 + 出款批次面板 |
| `src/views/finance/settlementLedger/index.vue` | **修改** 行按钮 + 抽屉 Tabs + 挂载面板 |
| `src/views/marketing/subsidyLedgerList.vue` | **删除** |
| `src/router/index.js` | **删除** `subsidyLedgerList` 路由 |
| `charging-cloud/doc/code-wiki/marketing/sql/t_marketing_subsidy_menu_hide_20260727.sql` | **新建** 隐藏页菜单 + 权限改挂 |

---

### Task 1: 抽出 `SubsidyLedgerPanel`

**Files:**
- Create: `charging-cloud-web/src/views/marketing/components/SubsidyLedgerPanel.vue`
- Reference: `charging-cloud-web/src/views/marketing/subsidyLedgerList.vue`（整页逻辑来源，本 Task 不删）

**Interfaces:**
- Produces: 组件 `SubsidyLedgerPanel`
  - props: `periodId: [Number, String]`（required）、`merchantId: [Number, String]`（optional，default `''`）
  - 无对外 events（确认打款后内部刷新即可）
- Consumes: `pageSubsidyLedger` / `pageSubsidyBatch` / `confirmSubsidyBatch`；`MARKETING_PERMS`；`hasMarketingPerm`；`parseTime`

- [ ] **Step 1: 创建面板组件**

将原列表页逻辑迁入组件，关键差异如下（完整文件按此实现）：

```vue
<template>
  <div class="subsidy-ledger-panel">
    <div class="period-lock-tip">
      <span>当前账期 ID：</span>
      <strong>{{ periodId }}</strong>
    </div>
    <el-tabs v-model="activeTab" @tab-click="loadActive">
      <el-tab-pane v-if="canLedgerPage" label="补款台账" name="ledger">
        <div class="filter-container">
          <el-input
            v-model="ledgerQuery.merchantId"
            class="filter-item"
            style="width: 150px;"
            placeholder="商户ID"
            clearable
          />
          <el-select
            v-model="ledgerQuery.status"
            class="filter-item"
            style="width: 150px;"
            placeholder="补款状态"
            clearable
          >
            <el-option label="待补款" value="0" />
            <el-option label="已补款" value="1" />
            <el-option label="失败" value="2" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="searchLedger">查询</el-button>
        </div>
        <!-- 表格列与原 subsidyLedgerList 补款台账 Tab 一致（保留 periodId 列便于核对） -->
        <!-- 分页同原页 -->
      </el-tab-pane>
      <el-tab-pane v-if="canBatchPage" label="出款批次" name="batch">
        <!-- 筛选：merchantId + status（无 periodId 输入框）；表格与确认线下打款同原页 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { confirmSubsidyBatch, pageSubsidyBatch, pageSubsidyLedger } from '@/api/marketing/marketing'
import { MARKETING_PERMS } from '../constants/marketingPermissions'
import { hasMarketingPerm } from '../utils/marketingActivityAuth'
import { parseTime } from '@/utils/index'

export default {
  name: 'SubsidyLedgerPanel',
  filters: {
    formatDate(value) {
      return value ? parseTime(value) : ''
    }
  },
  props: {
    periodId: { type: [Number, String], required: true },
    merchantId: { type: [Number, String], default: '' }
  },
  data() {
    return {
      activeTab: 'ledger',
      ledgerLoading: false,
      batchLoading: false,
      ledgerRows: [],
      batchRows: [],
      ledgerTotal: 0,
      batchTotal: 0,
      ledgerQuery: { page: 1, limit: 10, merchantId: '', status: '' },
      batchQuery: { page: 1, limit: 10, merchantId: '', status: '' }
    }
  },
  computed: {
    canLedgerPage() { return hasMarketingPerm(MARKETING_PERMS.subsidyLedgerPage) },
    canBatchPage() { return hasMarketingPerm(MARKETING_PERMS.subsidyBatchPage) },
    canConfirmOffline() { return hasMarketingPerm(MARKETING_PERMS.subsidyConfirmOffline) }
  },
  watch: {
    periodId: {
      immediate: true,
      handler(val) {
        if (val === null || val === undefined || val === '') return
        this.resetQueriesFromProps()
        this.bootstrapTab()
        this.loadActive()
      }
    },
    merchantId() {
      this.resetQueriesFromProps()
      this.loadActive()
    }
  },
  methods: {
    resetQueriesFromProps() {
      const mid = this.merchantId === null || this.merchantId === undefined ? '' : String(this.merchantId)
      this.ledgerQuery = { page: 1, limit: this.ledgerQuery.limit || 10, merchantId: mid, status: '' }
      this.batchQuery = { page: 1, limit: this.batchQuery.limit || 10, merchantId: mid, status: '' }
    },
    bootstrapTab() {
      if (this.canLedgerPage) this.activeTab = 'ledger'
      else if (this.canBatchPage) this.activeTab = 'batch'
    },
    buildLedgerParams() {
      return { ...this.ledgerQuery, periodId: this.periodId }
    },
    buildBatchParams() {
      return { ...this.batchQuery, periodId: this.periodId }
    },
    getLedger() {
      if (!this.canLedgerPage || !this.periodId) return
      this.ledgerLoading = true
      pageSubsidyLedger(this.buildLedgerParams()).then(res => {
        this.ledgerRows = res.data || []
        this.ledgerTotal = res.count || 0
      }).finally(() => { this.ledgerLoading = false })
    },
    getBatch() {
      if (!this.canBatchPage || !this.periodId) return
      this.batchLoading = true
      pageSubsidyBatch(this.buildBatchParams()).then(res => {
        this.batchRows = res.data || []
        this.batchTotal = res.count || 0
      }).finally(() => { this.batchLoading = false })
    },
    loadActive() {
      if (this.activeTab === 'ledger') this.getLedger()
      else this.getBatch()
    },
    searchLedger() {
      this.ledgerQuery.page = 1
      this.getLedger()
    },
    searchBatch() {
      this.batchQuery.page = 1
      this.getBatch()
    }
    // 其余：ledgerSizeChange / ledgerPageChange / batchSizeChange / batchPageChange /
    // confirmOffline / ledgerStatusLabel / ledgerStatusType / batchStatusLabel / batchStatusType
    // 与原 subsidyLedgerList.vue 相同；confirmOffline 成功后调用 getBatch + getLedger
  }
}
</script>

<style scoped>
.period-lock-tip {
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
}
.filter-item {
  margin-right: 12px;
}
.pagination-container {
  margin-top: 18px;
}
</style>
```

实现时把模板里表格/分页从 `subsidyLedgerList.vue` 原样拷贝，仅去掉两个 Tab 上的「账期ID」输入框。

- [ ] **Step 2: 本地冒烟**

确认组件无语法错误：项目若有 `npm run lint` 则跑一遍，或确认 IDE 诊断无报错。

- [ ] **Step 3: Commit**

```bash
git add src/views/marketing/components/SubsidyLedgerPanel.vue
git commit -m "$(cat <<'EOF'
feat(marketing): extract SubsidyLedgerPanel for period-scoped subsidy view

EOF
)"
```

---

### Task 2: 台账页接入抽屉 Tab + 行按钮

**Files:**
- Modify: `charging-cloud-web/src/views/finance/settlementLedger/index.vue`
- Consumes: `SubsidyLedgerPanel`（Task 1）

**Interfaces:**
- `openDrawer(row, tab = 'ledger')`：`tab` 为 `'ledger' | 'subsidy'`
- data 增加 `drawerActiveTab: 'ledger'`
- computed `canOpenSubsidy`：`hasMarketingPerm(ledgerPage) || hasMarketingPerm(batchPage)`

- [ ] **Step 1: script 引入与状态**

在 `<script>` 顶部增加：

```js
import SubsidyLedgerPanel from '@/views/marketing/components/SubsidyLedgerPanel'
import { MARKETING_PERMS } from '@/views/marketing/constants/marketingPermissions'
import { hasMarketingPerm } from '@/views/marketing/utils/marketingActivityAuth'
```

`components: { SubsidyLedgerPanel }`（若已有 components 对象则合并）。

`data` 增加：

```js
drawerActiveTab: 'ledger'
```

`computed` 增加：

```js
canOpenSubsidy() {
  return hasMarketingPerm(MARKETING_PERMS.subsidyLedgerPage)
    || hasMarketingPerm(MARKETING_PERMS.subsidyBatchPage)
},
subsidyPanelMerchantId() {
  const s = this.drawer.summary
  if (s && s.merchantId != null && s.merchantId !== '') return s.merchantId
  return ''
}
```

- [ ] **Step 2: 改造 `openDrawer` / `onDrawerClose`**

```js
openDrawer(row, tab = 'ledger') {
  this.drawerActiveTab = tab === 'subsidy' ? 'subsidy' : 'ledger'
  this.drawer.visible = true
  this.drawer.periodId = row.id
  this.lineQuery = {
    page: 1,
    limit: 10,
    merchantId: '',
    stationId: '',
    bizOrderCode: '',
    payCode: ''
  }
  // 先用行数据占位，便于营销补款 Tab 立刻拿到 merchantId
  this.drawer.summary = row
  periodDetail(row.id).then(res => {
    if (res.code === 200 && res.data) {
      this.drawer.summary = res.data.summary || row
    } else {
      this.drawer.summary = row
      this.$message.error(res.msg || '加载账期详情失败')
    }
    if (this.drawerActiveTab === 'ledger') {
      this.loadLines()
      this.loadPayoutBatches()
    }
  })
},
onDrawerTabClick() {
  if (this.drawerActiveTab === 'ledger' && this.drawer.periodId) {
    this.loadLines()
    this.loadPayoutBatches()
  }
},
onDrawerClose() {
  this.drawer.summary = null
  this.drawer.lines = []
  this.drawer.lineTotal = 0
  this.drawer.periodId = null
  this.payoutBatches = []
  this.lineExportLoading = false
  this.drawerActiveTab = 'ledger'
}
```

- [ ] **Step 3: 模板 — 行操作按钮**

将操作列 `width` 从 `280` 改为 `380`（或按实际按钮宽度微调）。在「提交分账」按钮后增加：

```vue
<el-button
  v-if="canOpenSubsidy"
  size="mini"
  type="primary"
  icon="el-icon-wallet"
  @click="openDrawer(scope.row, 'subsidy')"
>营销补款</el-button>
```

「台账明细」保持：

```vue
@click="openDrawer(scope.row, 'ledger')"
```

- [ ] **Step 4: 模板 — 抽屉 Tabs**

将 `el-drawer` 内 `v-if="drawer.summary"` 的内容改为：

```vue
<div v-if="drawer.summary" class="drawer-body">
  <el-tabs v-model="drawerActiveTab" @tab-click="onDrawerTabClick">
    <el-tab-pane label="台账与分账" name="ledger">
      <!-- 原摘要卡片、分账执行记录、行筛选、台账行表、分页：整块原样移入此 pane -->
    </el-tab-pane>
    <el-tab-pane v-if="canOpenSubsidy" label="营销补款" name="subsidy" lazy>
      <SubsidyLedgerPanel
        v-if="drawer.visible && drawer.periodId && drawerActiveTab === 'subsidy'"
        :period-id="drawer.periodId"
        :merchant-id="subsidyPanelMerchantId"
      />
    </el-tab-pane>
  </el-tabs>
</div>
```

说明：`lazy` + `v-if` 保证仅在营销补款 Tab 激活时挂载面板，满足懒加载。

- [ ] **Step 5: 手动验收（本 Task）**

1. 打开台账列表 → 点「台账明细」→ 默认「台账与分账」，原明细/分账正常
2. 点「营销补款」→ 抽屉打开且在「营销补款」Tab，列表按该账期过滤
3. 无补款权限账号看不到「营销补款」按钮与对应 Tab

- [ ] **Step 6: Commit**

```bash
git add src/views/finance/settlementLedger/index.vue
git commit -m "$(cat <<'EOF'
feat(finance): embed marketing subsidy panel in settlement ledger drawer

EOF
)"
```

---

### Task 3: 弃用独立页、路由与侧栏菜单

**Files:**
- Delete: `charging-cloud-web/src/views/marketing/subsidyLedgerList.vue`
- Modify: `charging-cloud-web/src/router/index.js`（删除 `subsidyLedgerList` 子路由）
- Create: `charging-cloud/doc/code-wiki/marketing/sql/t_marketing_subsidy_menu_hide_20260727.sql`

**Interfaces:**
- 无新前端 API；菜单：`867` 软删；`907/908/909` 的 `parent_id` 改为 `820`；旧 `868/869` 软删

- [ ] **Step 1: 删除路由**

从 `src/router/index.js` 的 marketing children 中删除：

```js
{
  path: 'subsidyLedgerList',
  component: () => import('@/views/marketing/subsidyLedgerList'),
  name: 'subsidyLedgerList',
  meta: {
    title: '营销补款台账',
  }
}
```

- [ ] **Step 2: 删除页面文件**

```bash
git rm src/views/marketing/subsidyLedgerList.vue
```

- [ ] **Step 3: 编写菜单下线 SQL**

创建 `charging-cloud/doc/code-wiki/marketing/sql/t_marketing_subsidy_menu_hide_20260727.sql`：

```sql
USE `sharecharge_cloud`;

-- 营销补款：弃用独立页菜单，功能权限改挂营销中心父菜单，供台账抽屉按钮鉴权
-- 页菜单 867；功能权限 907/908/909（:marketing:subsidy:ledgerPage|batchPage|confirmOffline）
-- 旧按钮 868/869（view/edit）一并软删

UPDATE `db_menu`
SET `delete_status` = 1, `update_time` = NOW()
WHERE `id` = 867;

UPDATE `db_menu`
SET `parent_id` = 820, `delete_status` = 0, `update_time` = NOW()
WHERE `id` IN (907, 908, 909);

UPDATE `db_menu`
SET `delete_status` = 1, `update_time` = NOW()
WHERE `id` IN (868, 869);
```

在目标库执行该 SQL（需库权限时人工执行）。

- [ ] **Step 4: 全量验收**

对照 spec 验收要点：

1. 有权限：行内「营销补款」→ 抽屉 Tab 数据按 `periodId` 过滤；可确认线下打款
2. 「台账明细」默认台账 Tab，功能无损
3. 无权限：无按钮、无营销 Tab
4. 侧栏无「营销补款台账」；`/marketing/subsidyLedgerList` 不可达
5. 面板内无账期 ID 输入框

- [ ] **Step 5: Commit**

```bash
# charging-cloud-web
git add src/router/index.js
git add -u src/views/marketing/subsidyLedgerList.vue
git commit -m "$(cat <<'EOF'
refactor(marketing): retire standalone subsidy ledger page

EOF
)"

# charging-cloud
git add doc/code-wiki/marketing/sql/t_marketing_subsidy_menu_hide_20260727.sql
git commit -m "$(cat <<'EOF'
docs(sql): hide subsidy ledger menu and reparent function perms

EOF
)"
```

---

## Spec Coverage Checklist

| Spec 要求 | Task |
|-----------|------|
| 行操作「营销补款」 | Task 2 |
| 共用抽屉 + Tabs | Task 2 |
| `SubsidyLedgerPanel` + periodId 锁定 | Task 1 |
| 懒加载 | Task 2（`lazy` + `v-if`） |
| 删除独立页与路由 | Task 3 |
| 菜单隐藏 + 权限保留/改挂 | Task 3 |
| 沿用 MARKETING_PERMS / API | Task 1–2（无新权限） |
| 验收 1–5 | Task 2 Step 5 + Task 3 Step 4 |
