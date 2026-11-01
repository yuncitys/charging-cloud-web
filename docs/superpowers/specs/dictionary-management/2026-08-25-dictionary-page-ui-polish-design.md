# 字典管理页 UI 抛光（方案 A）

**日期：** 2026-08-25  
**仓库：** charging-cloud-web  
**分支：** `feature/dictionary-management`  
**范围：** 仅 `src/views/permission/dictionary/index.vue`

## 目标

1. 修复「字典分类 / 字典数据」操作列按钮因宽度不足折行错位。  
2. 做轻度 SaaS 抛光：卡片、间距、选中行；不改交互与 API。

## 决策

- 操作列保留实心 `mini` 按钮（编辑 / 停用|启用 / 删除）。  
- 左侧操作列宽 `180` → `240`；右侧 `200` → `240`。  
- 按钮容器 `.table-action-btns`：`inline-flex` + `nowrap` + `gap`，清除默认 `margin-left` 叠宽。  
- 卡片浅边框 / 小圆角 / 轻阴影；选中行主题色淡底 + 左侧色条。  
- 不改全局主题、其他权限页、按钮颜色类型与文案。

## 验收

- 两侧操作列三按钮同一行，不折行。  
- 选中左侧分类有清晰高亮。  
- 功能行为与改前一致。
