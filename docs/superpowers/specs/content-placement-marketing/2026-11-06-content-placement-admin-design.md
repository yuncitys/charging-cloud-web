# 管理端：运营内容管理与活动推广内容设计

- 日期：2026-11-06
- 仓库：`charging-cloud-web`，分支 `feature/content-placement-marketing`（基于 `main`）
- 总体方案：见后端仓库 `charging-cloud/docs/superpowers/specs/content-placement-marketing/2026-11-06-content-placement-design.md`

## 1. 目标

把“广告管理”（`ADList`）升级为“运营内容管理”，支持按展示位投放、生效时间、活动绑定，并支持从营销活动一键生成推广内容。

## 2. 现状

- `src/views/AD/ADList.vue`、`src/views/AD/components/addPage.vue`、`editPage.vue` 管理 `t_image_carousel`。
- `src/api/AD/ADList.js` 调用 `/imageCarousel/*`。
- 路由在 `src/router/modules/operations.js`，权限码 `:AD:ADList:*`。

## 3. 改造内容

### 3.1 API

新建：

- `src/api/AD/contentItem.js`：`page`、`save`、`status`、`delete`、`activityOptions`、`fromActivity`、`preview`。
- `src/api/AD/contentPlacement.js`：`list`、`save`。

旧 `src/api/AD/ADList.js` 保留，不再被新页面引用，待后端旧接口下线后删除。

### 3.2 列表页 `ADList.vue` → 运营内容管理

- 筛选：展示位（下拉）、上线状态、生效状态（生效中/未生效/已过期/活动已停用）。
- 列：缩略图、标题、展示位、跳转（类型 + 目标）、生效时间段、排序、状态开关、操作（编辑/预览/删除）。
- “生效状态”由后端计算返回，前端只展示。

### 3.3 编辑表单（`addPage.vue` / `editPage.vue` 合并为一套）

- 标题（必填）。
- 素材：沿用 `src/components/Common/uploadFile.vue`。
- 展示位：多选（来自 `contentPlacement/list`）。
- 跳转类型：`ACTIVITY` / `STATION` / `GOODS` / `PAGE` / `H5` / `NONE`。
  - `ACTIVITY`：远程搜索活动（调用 `activityOptions`，可按 2/4/7/8 四类类型过滤），选中后写入 `activity_id`。
  - `STATION` / `GOODS`：输入 id。
  - `PAGE` / `H5`：输入路径或 URL。
- 生效时间：起止日期时间选择器，可空。
- 排序、上线开关。
- 表单校验：`ACTIVITY` 必须选活动；`H5` 必须为 `http(s)://`。

### 3.4 预览

- 按钮调用 `/contentItem/preview`，弹窗展示用户侧效果（图片、标题、是否生效、不生效原因）。

### 3.5 活动详情页增加“生成推广内容”

- 范围：充值领取、充电领取、电站折扣、用户折扣的活动详情页。
- 按钮仅在活动为进行中或未开始时显示。
- 点击后选择展示位（默认 `HOME_TOP`）与素材（可选），调用 `contentItem/fromActivity`。
- 同一活动重复生成时，后端返回提示，前端展示该提示。

### 3.6 权限

- 新增权限码 `:AD:Content:*`（查看/新增/编辑/删除/上下线），菜单层面沿用 AD 菜单。
- 按钮级 `v-hasPermi` 控制。

## 4. 验收

1. 能按展示位、状态、生效状态筛选。
2. 新增 `ACTIVITY` 内容：活动选择可搜索四类活动；保存后列表显示“活动已停用”等正确状态。
3. 预览与后端生效规则一致。
4. 在充值/充电/电站折扣/用户折扣活动详情页能一键生成推广内容，重复生成有提示。
5. 旧数据（迁移后）在列表中展示为 `HOME_TOP` 位置、跳转类型正确。

## 5. 风险

- 活动详情页分布在四个模块，需逐个确认入口组件，避免漏接。
- `uploadFile` 返回的素材地址需与后端 `media_url` 字段兼容。
