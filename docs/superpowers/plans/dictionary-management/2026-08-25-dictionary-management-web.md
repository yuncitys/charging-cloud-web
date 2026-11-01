# 字典管理（Web）实施说明

**分支：** `feature/dictionary-management`

完整设计与跨仓任务清单在后端仓库：

- 设计：`charging-cloud/docs/superpowers/specs/2026-08-25-dictionary-management-design.md`
- 计划：`charging-cloud/docs/superpowers/plans/2026-08-25-dictionary-management.md`（Task 5–6 为本仓库）

## 本仓库范围

| Task | 内容 |
|------|------|
| Task 5 | `src/api/permission/dictionary*.js` + `src/views/permission/dictionary/index.vue` + 路由映射 |
| Task 6 | `$dict.getSelector` + job 页试点 |

**约束：** Selector 登录即可；管理页按钮走 `:permission:dictionaryType|Data:*`。
