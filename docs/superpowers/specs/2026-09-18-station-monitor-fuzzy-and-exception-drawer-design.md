# Web 站点监控：编号模糊搜索 + 异常明细抽屉

日期：2026-09-18  
范围：`charging-cloud-web` 站点监控页 + `charging-cloud` 监控查询/导出 API  
对齐例图：状态卡「详情 >」→ 异常明细抽屉；数据源 `t_device_log`  
非目标：uniapp 本轮不做；不改全局 `/log/device` 列表语义

## 已确认结论

| 项 | 选择 |
|---|---|
| 异常明细数据 | **A**：当前站点 `t_device_log` **历史日志**（可与状态卡实时计数不一致） |
| 模糊搜索 | **B**：桩编号模糊 `device_code`；枪编号输入改为模糊 `gun_code` |
| 导出 | **A**：抽屉内可导出当前 tab 列表 |
| 实现路径 | 监控专用 page + export 接口；不硬拼全局 device-log |

## 1. 模糊搜索

### 行为

- 桩编号输入：`d.device_code LIKE CONCAT('%', #{deviceCode}, '%')`
- 枪编号输入：字段语义改为**枪编码**；`g.gun_code LIKE CONCAT('%', #{gunCode}, '%')`
- 查询参数：后端 `StationMonitorGunQuery` 将原 `gunNumber`（Integer 精确）改为 `gunCode`（String 模糊），或保留 `gunNumber` 仅当纯数字时精确、同时新增 `gunCode`——本设计采用 **`gunCode` 字符串模糊**，前端把原枪编号框绑到 `listQuery.gunCode`，placeholder 改为「请输入枪编码」

### 影响面

- `StationMonitorMapper.xml` `listCarGunRows` 条件
- Web `stationMonitor.vue` 查询表单
- 若 applet/uniapp 共用同一 piles API：本轮 **web 传 `gunCode`**；旧 `gunNumber` 精确条件可保留兼容（有值则精确 AND），web 不再传 `gunNumber`

## 2. 状态卡片栏（例图 1）

### UI

- 摘要条右侧状态卡：白底圆角、浅灰边；选中态描边 + 右下角勾选角标
- **故障 / 离线**：标签右侧「详情 >」链接（系统主色 `#07b161`）
  - 点击「详情」：`stopPropagation`，打开异常明细抽屉，并切到对应 tab（故障 / 离线）
  - 点击卡片其它区域：仍按现有逻辑切换 `tabStatus` 筛选枪列表
- **占用**：标签旁 `?`，`el-tooltip` 文案：  
  `占用分为占用·充电前与占用·充电后；占用·充电前：即为未开启充电前的插枪占用；占用·充电后：即为充电结束后的插枪占用。`
- 配色与系统主色统一（`#07b161`），不用例图橙色

### 交互注意

- 无站点时「详情」禁用或 toast「请先选择站点」

## 3. 异常明细抽屉（例图 2）

### 结构

- 右侧 `el-drawer`，标题「异常明细」
- Tabs：`故障明细` | `离线明细`
- 提示：「由于设备状态会实时变化，若获取最新数据，请点击 **刷新**」+ 刷新动作
- 表格 + 分页
- 底栏：关闭、导出列表

### 数据规则

- 范围：`tdl.network_dot_id = 当前 stationId` + 数据权限 `dataScope`
- 故障 tab：`alarm_code = 'DEVICE_FAULT'`
- 离线 tab：`alarm_code = 'DEVICE_ACTION_DOWNLINE'`
- 排序：`create_time DESC`
- 刷新：重新请求当前 tab 第一页（或当前页）

### 列映射

| 列 | 来源 |
|---|---|
| 枪名称 | `t_device_guns.gun_name`（按 device_code + connector_code/gun_number join；无则 `-`） |
| 枪编号 | 优先 `gun_code`，否则 `device_code` + 补零枪号 |
| 类型 | 固定或由 `alarm_item` 推导：故障→「故障」；离线→「离线」 |
| 所属电站 | `t_network_dot.network_name` |
| 故障名称 / 离线原因 | `reason`（空则回落 `alarm_item`） |
| 故障码 / 离线码 | `alarm_code` |

离线 tab 表头可用「离线原因」「告警码」等同义文案，字段同源。

### 导出

- 导出当前 tab 过滤条件（站点 + alarm_code），异步任务风格对齐现有 `DeviceLogService.download`（写任务中心 / 返回提示「导出任务已创建」）
- 权限：复用监控页访问权限即可；若需独立 perms，与站点监控路由同级声明（实现时跟现有 monitor 权限走）

## 4. 后端 API

挂在现有 `StationMonitorController`（或同模块）：

```
GET  /monitor/station/{stationId}/exception-logs
     query: type=fault|offline, page, limit
POST /monitor/station/{stationId}/exception-logs/export
     body/query: type=fault|offline
```

- Service：查询 `t_device_log` + join 枪/站点；分页返回 list + total
- 单测：type 过滤、station 过滤、空数据

## 5. 前端文件

- `stationMonitor.vue`：状态卡 UI + 打开抽屉
- 新组件如 `ExceptionLogDrawer.vue`（仿 `GunStatusEventDialog`）
- `api/monitor/stationMonitor.js`：page + export

## 6. 非目标

- uniapp 状态卡/抽屉
- 修改全局上下线记录页默认行为
- 用实时枪状态列表冒充明细（已否决方案 B）
