# 运营商工作台 V2 打磨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 预警服务端分页；配置/已忽略按商户主表鉴权；财务「出账合计」、忽略时间格式、比例 precision=4。

**Architecture:** alerts 在扣忽略+排序后对内存列表分页，`ResultUtil.count=total`；新增 `merchantInScope` 查 `t_user_merchant`；忽略写路径仍用网点 `inScope`。文案与 JsonFormat / 前端精度为小改。

**Tech Stack:** Java/Spring/MyBatis、Vue2 Element UI、`@DataScope`、Sa-Token

## Global Constraints

- Branches: `feature/operator-workbench` + `feature/operator-workbench-web`
- 不 push codeup-cld；不强制 push origin
- Spec: `docs/superpowers/specs/2026-10-27-operator-workbench-v2-polish-design.md`
- 不做候选 500 放开、跨页勾选、批量阈值
- `page` 默认 1，`limit` 默认 20、上限 100

---

### Task 1: merchantInScope（cloud）

**Files:**
- Modify: `OperatorWorkbenchQueryMapper.java` + `.xml` — 增加 `countMerchantInScope`
- Modify: `OperatorWorkbenchQueryService.java` / `Impl` — `merchantInScope(query)`
- Modify: `OperatorWorkbenchController.java` — GET/PUT alertConfig、GET dismissed 改用 `merchantInScope`；`@DataScope(alias="tum", merchantColumn=true, merchantIdRef=PRIMARY, stationColumn=false, tenantColumn=true, adminColumn=false)`
- Test: `OperatorWorkbenchQueryServiceTest` + `OperatorWorkbenchControllerScopeTest`

**SQL sketch (`countMerchantInScope`):**
```sql
SELECT COUNT(1) FROM (
  SELECT 1 FROM t_user_merchant tum
  WHERE tum.id = #{query.merchantId}
  -- + dataScopeMerchantIds / dataScope / tenant 等同 UserMerchant 列表口径
  LIMIT 1
) t
```
（`is_delete` 若商户表有该列则加上；实现时对照 `UserMerchant` 实体。）

- [ ] **Step 1:** 失败测试 — 无网点但 merchant count=1 → merchantInScope true；alertConfig 用 merchantInScope
- [ ] **Step 2:** 实现 mapper + service + controller 切换
- [ ] **Step 3:** 测试绿；Commit `fix(workbench): scope alert config by merchant table not stations`

---

### Task 2: alerts 分页（云）

**Files:**
- Modify: `OperatorWorkbenchQueryServiceImpl.alerts` — 规范化 page/limit；`rank` 全量（或改 rank 不分页）后 `total` + subList；`ResultUtil` setData(list) + setCount(total)
- Modify: `rank(...)` — 去掉固定 `ALERT_LIMIT` 截断，或新增 `rankAll` + `pageSlice`
- Test: `OperatorWorkbenchQueryServiceTest` — 25 条时 page=2 limit=20 返回 5 条且 count=25

**Normalize helper:**
```java
static int normPage(int page) { return page <= 0 ? 1 : page; }
static int normLimit(int limit) {
  if (limit <= 0) return 20;
  return Math.min(limit, 100);
}
```

- [ ] **Step 1:** 失败测试分页
- [ ] **Step 2:** 实现
- [ ] **Step 3:** 测试绿；Commit `feat(workbench): paginate operator workbench alerts`

---

### Task 3: JsonFormat + 前端分页/文案/精度（web + 小 VO）

**Files:**
- Modify: `OperatorWorkbenchAlertDismissVo.java` — `@JsonFormat` on expireAt/createTime
- Modify: `src/views/business/operatorWorkbench/index.vue` — pagination；buildParams page/limit；换页清勾选；「出账合计」；ratio precision 4
- Modify: loadAlerts 解析 `res.count`（或项目字段名）

- [ ] **Step 1:** VO JsonFormat + 单测若有序列化断言则更新
- [ ] **Step 2:** 前端分页与文案精度
- [ ] **Step 3:** Commit cloud VO（若同 repo）+ web：`feat(web): paginate alerts and polish workbench copy`

（若 VO 在 cloud、UI 在 web：分两个 commit。）

---

### Task 4: 验收

- [ ] Checklist `.superpowers/sdd/v2-polish-checklist.md` 对照 Acceptance 1–5；浏览器 PENDING_HUMAN；不 push

---

## Spec coverage

| Spec | Task |
|------|------|
| 分页 API + UI | 2–3 |
| merchantInScope | 1 |
| 出账合计 / JsonFormat / precision | 3 |
| 忽略写路径仍网点 scope | 1（不改 dismiss） |
