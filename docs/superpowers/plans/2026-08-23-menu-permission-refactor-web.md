# 菜单权限体系重构 — Web 端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** 菜单管理 UI 支持类型区分、多级导航渲染、权限驱动路由过滤。

**Architecture:** 消费后端 `menuType` + `authorizationList`；`asyncRouteMap` 按 href 过滤。设计详见 charging-cloud 仓库 [`docs/superpowers/specs/2026-08-23-menu-permission-refactor-design.md`](../../../charging-cloud/docs/superpowers/specs/2026-08-23-menu-permission-refactor-design.md)（相对路径供参考，以 charging-cloud 仓库为准）。

**Tech Stack:** Vue 2 / Element UI / Vue Router (history) / Vuex

**分支：** `feature/menu-permission-refactor`

**依赖：** charging-cloud Task 1-2 已部署（`menuType` 字段可用）

---

## Task 1: 菜单管理 UI

**Files:**
- Modify: `src/views/permission/menu.vue`
- Modify: `src/views/permission/components/menu/addPage.vue`
- Modify: `src/views/permission/components/menu/editPage.vue`
- Modify: `src/api/permission/menu.js`（传 `menuType`）
- Create: `src/views/permission/constants/menuType.js`

- [x] **Step 1:** 新建 `menuType.js` 常量与标签映射 `{0:'目录',1:'页面',2:'按钮'}`
- [x] **Step 2:** `addPage.vue` — 类型 radio；按钮隐藏 icon；页面 href 必填
- [x] **Step 3:** `editPage.vue` — 同步类型编辑；按钮不可改 href 为路由
- [x] **Step 4:** `menu.vue` — 表格加 menuType 列；操作区按行类型显示「添加子目录/页面/按钮」
- [x] **Step 5:** `role.vue` — 授权树节点按类型显示不同 icon/样式

---

## Task 2: 多级导航

**Files:**
- Modify: `src/layout/components/SidebarOnly/SidebarOnlyItem.js`
- Modify: `src/layout/components/SidebarOnly/index.vue`
- Modify: `src/layout/components/Sidebar/index.vue`
- Modify: `src/layout/components/topSidebar/topSidebar.vue`
- Create: `src/utils/menuNav.js`（找首个叶子 href、过滤按钮）

- [ ] **Step 1:** `menuNav.js` — `isNavNode(menu)`：`menuType !== 2` 且（目录或有效 href）
- [ ] **Step 2:** `SidebarOnlyItem.js` — 去掉 `depth < 1`；递归 `isNavNode` 过滤
- [ ] **Step 3:** `SidebarOnly/index.vue` — 多级 active/expanded 状态
- [ ] **Step 4:** `Sidebar/index.vue` — mix 侧栏改嵌套 `el-submenu`
- [ ] **Step 5:** `topSidebar.vue` — 点击顶级目录跳首个叶子；localStorage active 路径

---

## Task 3: 权限驱动路由

**Files:**
- Modify: `src/router/index.js`
- Create: `src/router/routePermission.js`
- Modify: `src/store/modules/permission.js`
- Modify: `src/permission.js`

- [ ] **Step 1:** 从 `constantRoutes` 拆出 `asyncRouteMap`（所有需授权业务路由）
- [ ] **Step 2:** `routePermission.js`:

```javascript
export function collectAllowedHrefs(authorizationList) {
  return authorizationList
    .filter(m => m.menuType === 1 && m.href)
    .map(m => m.href)
}

export function filterRoutesByHref(routes, allowedHrefs, parentPath = '') {
  // 递归过滤；hidden 路由检查 meta.authFollow
}
```

- [ ] **Step 3:** `permission.js` store — 登录后 `resetRouter()` + `router.addRoutes(filtered)`
- [ ] **Step 4:** `permission.js` 守卫 — 白名单外 path 不在 allowed + hidden 规则 → `/401`
- [ ] **Step 5:** 给 hidden 编辑页加 `meta: { authFollow: '/marketing/cardCouponList' }`（逐模块补全，优先营销/订单）

---

## Task 4: 回归测试清单

- [ ] 超级管理员：全部菜单可见、全部路由可访问
- [ ] 受限角色：无权限菜单不可见、直链 401
- [ ] 有页面无按钮：页面进得去、操作按钮隐藏
- [ ] 3 级目录：sidebar-only 正确展开/高亮
- [ ] mix 布局：顶栏切换 + 侧栏嵌套
- [ ] 刷新浏览器：路由仍在、不 404
- [ ] hidden 编辑页：有列表权限时可打开编辑页
