# 站点管理列表字段布局优化

日期：2026-09-19  
范围：`charging-cloud-web` 站点管理列表 + `charging-cloud` 网点列表读模型  
非目标：改导出 Excel 列、改筛选区、新增运营类型字段

## 已确认结论

| 项 | 选择 |
|---|---|
| 建设状态 | `operateStatus`，文案对齐互联 `StationStatus` |
| 电站信息 ID | 同时展示 `externalStationId` + 内部 `id` |
| 设备数直/交 | 按枪口 `electric_out_type`（1=直，0/空=交），未删且已启用 |
| 运营类型 | 不展示 |
| 运营商户 / App展示 / 操作 | 保留 |

## 列表列

序号 → 电站信息 → 运营商户 → 设备数(直/交) → 枪总数 → 额定功率 → 建设状态 → App展示 → 操作  

去掉：投放地、经纬度、创建/更新用户与时间。

## 建设状态 / operateStatus

- 字段：`t_network_dot.operate_status`
- 互联同步：原样写入对方 `StationStatus`（0/1/5/6/50），不做 0/1 转换
- 出站查询站点：`StationStatus` 原样回推 `operateStatus`
- 列表展示文案对齐互联枚举：未知/建设中/关闭下线/维护中/正常使用

