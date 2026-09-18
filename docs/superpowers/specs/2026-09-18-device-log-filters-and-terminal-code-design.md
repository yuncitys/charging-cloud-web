# Web 设备日志：筛选增强 + 终端编号拼接

日期：2026-09-18  
范围：`charging-cloud-web` 设备日志页 + `charging-cloud` `/log/device` 分页/导出  
页面：`src/views/log/upDownRecordList.vue`  
非目标：不改正文上下线/故障写入；不做设备级日志按枪展开

## 已确认结论

| 项 | 选择 |
|---|---|
| 日志编号筛选 | **A**：按 `alarm_code`（与列表「日志编号」列一致） |
| 终端编号筛选 | **A**：对拼接后的终端编号做模糊 `LIKE` |
| 站点筛选 | **A**：远程下拉选站，按 `network_dot_id` 精确过滤 |
| 实现路径 | **A**：SQL 内拼接终端编号，列表/导出/筛选同源 |

## 1. 查询条件

在现有「设备号」「时间范围」之外新增：

| 条件 | UI | 参数 | 后端条件 |
|---|---|---|---|
| 站点 | 远程下拉（交互对齐站点监控选站） | `networkDotId`（Integer） | `tdl.network_dot_id = #{networkDotId}` |
| 日志编号 | 输入框 | `alarmCode`（String） | `tdl.alarm_code LIKE CONCAT('%', #{alarmCode}, '%')` |
| 终端编号 | 输入框 | `connectorCode`（String，展示语义） | 对拼接表达式 `LIKE CONCAT('%', #{connectorCode}, '%')` |

导出沿用同一套查询参数。

## 2. 终端编号展示与导出

列表列、导出 Excel「终端编号」均返回拼接后的字符串（仍映射字段名 `connectorCode`，避免前端大改）：

```text
IFNULL(connector_code, 0) > 0
  → CONCAT(device_code, LPAD(connector_code, 2, '0'))
否则（设备级日志）
  → device_code
```

不拼 `00`，避免与真实 00 枪混淆。

## 3. 后端改动

- `DeviceLogPagination`：新增 `networkDotId`、`alarmCode`、`connectorCode`（String，筛选用）
- `DeviceLogMapper.xml`：`list` / `count` / `exportDeviceLog` 同步
  - SELECT 终端编号用上述 CASE/IF 表达式
  - WHERE 增加站点、日志编号、终端编号条件
- Controller/Service：透传分页对象即可，无需新接口

## 4. 前端改动

- `upDownRecordList.vue`
  - 筛选区增加：站点远程下拉、日志编号输入、终端编号输入
  - `listQuery` 增加对应字段；查询/清空/导出带参
  - 「终端编号」列直接展示接口返回的拼接值（不再二次拼）
- 站点搜索 API：复用站点监控已用的站点列表接口（或现有 networkDot 搜索），保持数据权限一致

## 5. 非目标

- 修改 `t_device_log` 写入（上下线仍可只写 `connector_code=0`）
- 设备日志列表按枪展开成多行
- 改全局告警码枚举文案
