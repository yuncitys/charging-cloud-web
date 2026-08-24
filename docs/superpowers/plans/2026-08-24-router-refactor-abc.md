# 路由改造方案 A / B / C

**日期：** 2026-08-24  
**分支：** `feature/menu-permission-refactor`  
**关联 commits：**
- `d0f68e0` refactor(router): split static routes into menu-aligned modules（方案 A）
- `44ffb07` feat(layout): build breadcrumbs from the backend menu tree（方案 C）
- `f4ce55e` refactor(router): flatten route modules into full-path pages and auto-build layouts（方案 B）
- `b1f4b7f` feat(layout): rebuild header search from menu tree（HeaderSearch，方案 C 延伸）
- `ff8d4e4` feat(layout): add header search entry to top bar（顶栏入口）

---

## 背景：改造前的问题

### 路由文件

改造前所有路由写在 `src/router/index.js` 一个文件里，约 **1400 行**，结构类似：

```js
// 改造前（简化示意）
const routeDefinitions = [
  { path: '/charge',   component: Layout, meta: { title: '运营管理' }, children: [...] },
  { path: '/recharge', component: Layout, meta: { title: '运营管理' }, children: [...] },
  { path: '/AD',       component: Layout, meta: { title: '运营管理' }, children: [...] },
  { path: '/join',     component: Layout, meta: { title: '运营管理' }, children: [...] },
  { path: '/finance',  component: Layout, meta: { title: '财务管理' }, children: [...] },
  { path: '/card',     component: Layout, meta: { title: '用户管理' }, children: [...] },  // ← 菜单里其实在财务
  { path: '/agent',    component: Layout, meta: { title: '财务管理' }, children: [...] },
  { path: '/configAdmin', component: Layout, meta: { title: '运营管理' }, children: [...] },
  { path: '/platform', component: Layout, meta: { title: '系统管理' }, children: [...] },  // ← 菜单里其实在运营
  // ... 还有十几个模块
]
```

**核心矛盾：**

| 维度 | 菜单树（`db_menu`） | 路由树（`router/index.js`） |
|------|-------------------|-----------------------------|
| 分组依据 | 业务（运营管理 > 计费策略 > 页面） | URL 前缀（`/charge`、`/recharge`、`/AD`）|
| 层级数 | 任意深度（最多 4 级） | Layout + 1 级 children，共 2 级 |
| 「分账设置」归属 | 财务管理 > 分账与结算 | `/charge` Layout 下 |
| 新增页面 | 菜单填 href | 要猜在 1400 行里找哪个 Layout |

### 面包屑

```
菜单：运营管理 / 计费策略 / 计时收费方案   ← 3 级
面包屑：运营管理 / 计时收费方案             ← 只有 2 级（缺「计费策略」）
```

面包屑读 `$route.matched`，路由只有 `/charge` Layout + `timeCharge` 子路由两层，「计费策略」这个中间目录只存在于 DB 菜单树，不会出现在面包屑。

### 顶栏搜索（HeaderSearch）

搜索结果按**路由模块**分组，不按菜单目录，结果类似：

```
运营管理 > 计时收费方案   ← 缺「计费策略」，与侧栏层级不符
财务管理 > 分账设置       ← 但实际路由挂在 /charge，元信息写着「运营管理」
```

---

## 方案 A：按菜单一级模块拆分路由文件

**目标：** 解决「1400 行难维护、对照菜单难查」  
**性质：** 纯代码组织，不改变任何运行时行为

### 做了什么

把 `routeDefinitions` 按菜单一级拆到 `src/router/modules/` 下：

```
src/router/modules/
  base.js         # 登录 / 404 / 首页（不走权限过滤）
  user.js         # 用户管理
  business.js     # 数据统计
  device.js       # 站点设备
  operations.js   # 运营管理（/charge /recharge /AD /join /configAdmin /platform /goods）
  finance.js      # 财务管理（/finance /card /agent /tradeEntry /iotCard /payment /charge/stationSplitConfig）
  order.js        # 订单管理
  marketing.js    # 营销中心
  ops.js          # 运维管理（/log /command /report /monitor）
  system.js       # 系统管理 + 互联互通
  customer.js     # 充电客户
```

`index.js` 只负责 import 和组装，从 1400 行缩到 ~100 行：

```js
// 改造后 index.js（方案 A 阶段）
import operationsRoutes from './modules/operations'
import financeRoutes    from './modules/finance'
// ...
export const asyncRoutes = [
  ...userRoutes,
  ...operationsRoutes,
  ...financeRoutes,
  // ...
]
```

### 关键设计：注释标明「菜单归属 vs URL 归属」

跨前缀页面（菜单在财务、URL 在运营）在文件头明确注释，杜绝混淆：

```js
// finance.js 头部注释
// 财务管理（菜单一级）
// - URL 可能跨 /finance /charge /card /iotCard /tradeEntry /payment /agent
// 注：/charge/stationSplitConfig 菜单在财务，URL 历史遗留在 /charge
```

### 对比改造前

| 对比项 | 改造前 | 方案 A 后 |
|--------|--------|----------|
| 路由主文件行数 | ~1400 行 | ~100 行 |
| 新增财务页面 | 在 1400 行里搜 `/finance` 再手动加 | 打开 `modules/finance.js` 直接加 |
| 分账设置归哪 | 夹在 `/charge` Layout 里，不直观 | `finance.js` 有注释说明 |
| 运行时影响 | — | **零影响**，URL/name/component 全部不变 |

---

## 方案 B：扁平页面表 + 自动构建 Layout

**目标：** 消除「手动维护 Layout 嵌套」——不再需要关心哪个页面挂在哪个 Layout 下  
**性质：** 注册层重构，不改 URL 和 name

### 做了什么

**① 每个模块改为纯页面数组（完整 path + component）**

```js
// 改造前 operations.js（方案 A 阶段）——需要手工写 Layout 嵌套
export default [
  {
    path: '/charge',
    component: Layout,
    children: [
      { path: 'timeCharge', component: () => import('@/views/charge/timeCharge'), name: 'timeCharge', ... },
      { path: 'electricCharge', ... },
    ]
  },
  {
    path: '/recharge',
    component: Layout,
    children: [
      { path: 'balanceList', ... },
    ]
  },
  // ...
]

// 改造后 operations.js（方案 B）——只写完整 path，不碰 Layout
export default [
  { path: '/charge/timeCharge',    name: 'timeCharge',    component: () => import('...'), meta: { title: '计时收费方案' } },
  { path: '/charge/electricCharge',name: 'electricCharge',component: () => import('...'), meta: { title: '电量收费方案' } },
  { path: '/recharge/balanceList', name: 'balanceList',   component: () => import('...'), meta: { title: '余额充值方案' } },
  // ...
]
```

**② `buildRoutes.js` 按 URL 第一段自动包 Layout**

```js
// src/router/buildRoutes.js（核心逻辑简化示意）
export function buildLayoutRoutes(pages) {
  const groups = groupBy(pages, page => page.path.split('/')[1])
  // pages 中的 /charge/timeCharge、/charge/electricCharge → group 'charge'
  // pages 中的 /recharge/balanceList                     → group 'recharge'
  return Object.entries(groups).map(([root, list]) => ({
    path: '/' + root,
    component: Layout,
    children: list.map(p => ({ ...p, path: p.path.replace('/' + root + '/', '') }))
  }))
}
```

**③ 跨前缀页面（分账设置）写在 `finance.js` 里**

```js
// finance.js — 财务模块，但 URL 是 /charge/stationSplitConfig
{ path: '/charge/stationSplitConfig', name: 'stationSplitConfig', component: () => import('...') },
// buildLayoutRoutes 会把它自动归到 /charge Layout，运行时 URL 不变
```

### 对比改造前

| 对比项 | 改造前 | 方案 B 后 |
|--------|--------|----------|
| 新增一个财务页面 | 找到 `/finance` Layout，在 children 里加对象 | `finance.js` 末尾加一行 `{ path: '/finance/xxx', component, name }` |
| 跨前缀（财务菜单 + 运营 URL） | 不直观，`/charge` Layout 里夹着财务用的页面 | 写在 `finance.js`，`buildRoutes` 自动放回 `/charge` Layout |
| Layout 嵌套手误 | 容易把子路由写成顶级 / 忘写 `Layout` / 放错 parent | 完全由 `buildRoutes` 生成，不存在 |
| URL / name / keep-alive | — | **全部不变** |

---

## 方案 C：面包屑 + 顶栏搜索读菜单树

**目标：** 让面包屑、顶栏搜索与侧栏菜单的层级完全一致  
**性质：** 展示层改造，不改路由/权限逻辑

### 改造前后对比

#### 面包屑

```
改造前（读 $route.matched）：
  首页 / 运营管理 / 计时收费方案         ← 只有 2 级，缺「计费策略」

改造后（读 menuList 祖先链）：
  首页 / 运营管理 / 计费策略 / 计时收费方案  ← 完整 4 级，与侧栏一致
```

hidden 详情页：

```
// 路由上加 meta.authFollow
{ path: 'rechargeRecordDetail', hidden: true, meta: { authFollow: '/finance/rechargeRecord' } }

// 面包屑结果
首页 / 财务管理 / 资金流水 / 充值记录 / 充值记录详情
```

#### 顶栏搜索

```
改造前（遍历 permission_routes）：
  运营管理 > 计时收费方案       ← 缺「计费策略」，同路由结构

改造后（遍历 menuList）：
  运营管理 > 计费策略 > 计时收费方案  ← 完整层级
  财务管理 > 分账与结算 > 分账设置    ← 菜单归属正确（不是「运营管理」）
```

### 核心实现

**① `menuNav.js` — `findMenuTrailByHref`（面包屑祖先链）**

```js
// 从菜单树中按 href 找完整祖先链
export function findMenuTrailByHref(menus, href, trail = []) {
  for (const node of menus || []) {
    const next = trail.concat(node)
    if (node.href === href) return next                       // 命中，返回从一级到当前页
    const found = findMenuTrailByHref(node.children, href, next)
    if (found) return found
  }
  return null
}

// 示例：href = '/charge/timeCharge'
// 返回：[ { title: '运营管理' }, { title: '计费策略' }, { title: '计时收费方案', href: '/charge/timeCharge' } ]
```

**② `Breadcrumb/index.vue` — 菜单优先，路由兜底**

```js
getBreadcrumb() {
  // 1. 先从 menuList 找祖先链
  const fromMenu = this.getBreadcrumbFromMenu()
  // 2. 找不到（登录前 / 首页 / hidden 且无 authFollow）则回退到 $route.matched
  this.levelList = fromMenu || this.getBreadcrumbFromRoute()
}

getBreadcrumbFromMenu() {
  // 当前页有菜单 → 直接用祖先链
  let trail = findMenuTrailByHref(menus, currentPath)
  if (trail) return buildItems(trail)

  // hidden 页没有菜单 → 找 authFollow 的祖先链，末尾补当前页标题
  const follow = meta.authFollow || meta.activeMenu
  if (follow) {
    trail = findMenuTrailByHref(menus, follow)
    if (trail) return buildItems(trail, meta.title)  // 如「充值记录 + 充值记录详情」
  }
}
```

**③ `menuNav.js` — `collectMenuSearchItems`（顶栏搜索候选项）**

```js
// 递归收集所有有 href 的叶子页面，带完整层级 title 数组
export function collectMenuSearchItems(menus, prefixTitle = [], items = []) {
  for (const node of menus || []) {
    if (!isNavNode(node)) continue
    const titles = prefixTitle.concat(node.title)
    if (getLeafHref(node)) items.push({ path: node.href, title: titles })
    collectMenuSearchItems(getNavChildren(node), titles, items)
  }
  return items
}
// 结果示例：{ path: '/charge/timeCharge', title: ['运营管理', '计费策略', '计时收费方案'] }
```

### meta.authFollow 的双重作用

```js
// 路由定义
{
  path: 'rechargeRecordDetail',
  hidden: true,
  meta: {
    title: '充值记录详情',
    authFollow: '/finance/rechargeRecord'  // ← 一个字段，两个用途
  }
}
```

| 用途 | 触发位置 | 效果 |
|------|---------|------|
| **权限放行** | `routePermission.js` `isHiddenRouteAllowed` | 只要有充值记录的菜单权限，详情页自动放行 |
| **面包屑父链** | `Breadcrumb` `getBreadcrumbFromMenu` | 面包屑从「充值记录」的菜单位置往上拼 |

---

## 三方案协作全貌

```
db_menu（菜单树）
  │
  ├─ 侧栏 / 顶栏（menuList）          ← 不变，一直读菜单
  │
  ├─ 面包屑（方案 C）                 ← findMenuTrailByHref
  │    meta.authFollow 处理 hidden 页
  │
  ├─ 顶栏搜索（方案 C 延伸）          ← collectMenuSearchItems
  │
  └─ href 集合（authorizationList）   ← routePermission 过滤路由

router/modules/*.js（方案 A）
  每个文件对应菜单一级；注释标明跨前缀页面

buildRoutes.js（方案 B）
  pages（完整 path + component）→ Layout 嵌套路由树
  ↓ asyncRoutes → 登录后 addRoutes
```

---

## 新增页面标准流程（改造后）

### 有菜单的列表页

1. **菜单管理**：新增页面节点，填 `href`（如 `/finance/newPage`）
2. **路由文件**：在 `modules/finance.js` 加一行：
   ```js
   { path: '/finance/newPage', name: 'newPage', component: () => import('@/views/finance/newPage'), meta: { title: '新页面' } }
   ```
3. **权限**：角色授权后自动放行，面包屑自动按菜单树显示

### 无菜单的详情/编辑页

1. **路由文件**：在对应模块加 hidden 页，带 `authFollow`：
   ```js
   { path: '/finance/newPageDetail/:id', name: 'newPageDetail', hidden: true,
     component: () => import('...'),
     meta: { title: '详情', authFollow: '/finance/newPage' } }
   ```
2. **无需菜单配置**：权限和面包屑都跟父页自动处理

---

## 哪些没有改动

| 项目 | 说明 |
|------|------|
| 所有页面 URL / href | 完全不变，书签和外链不失效 |
| 路由 `name`（keep-alive） | 完全不变，标签页缓存不受影响 |
| `routePermission.js` 过滤逻辑 | 不变，仍按 href 集合过滤 |
| 侧栏导航 | 不变，一直读 `menuList` |
| 权限按钮 `btnAuthen` | 不变 |
| `constantRoutes`（login/404/首页） | 不变 |
