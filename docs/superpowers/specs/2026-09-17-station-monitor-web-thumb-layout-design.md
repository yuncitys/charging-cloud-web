# Web 站点监控：默认站点、多枪布局、缩略字段对齐 Uniapp

日期：2026-09-17  
范围：`charging-cloud-web` `src/views/monitor/stationMonitor.vue`  
对齐：`charging-cloud-uniapp/admin/pages/adminStationMonitor/adminStationMonitor.vue`  
目标：进入页有默认站；多枪不挤；实时缩略枪头/字段与 Uniapp 一致。

## 1. 默认站点

- URL 无 `stationId`：`searchStations('')` 成功后取列表**第一条**设为 `stationId`，再 `loadAll` + 轮询。
- URL 有 `stationId`：不覆盖。
- 用户清空站点后不自动再选。

## 2. 多枪布局

- `.gun-row`：`flex-wrap`；`.gun-col`：`flex: 1 1 180px`，放不下换行。
- 枪数 **>2**：桩卡片 `pile-card--wide` → `width: 100%`。
- ≤2 枪：保持半宽双列（窄屏仍 100%）。

## 3. 实时缩略字段（对齐 Uniapp）

**头：**

- 主：`gunName`，空则回退枪编号（`formatGun`）
- 有 `parkingNo` 时：` · 车位 {parkingNo}`
- 状态文案同现有 `statusText`

**KV：** 与 Uniapp `cardFields` 同分支（充电中 / 占用充后 / 占用 / 故障离线 / 默认空闲）。

## 4. 非目标

- 不改后端接口  
- 不改实时详情字段集（可顺带头展示枪名，非必须）  
- 不做 Uniapp 占用/急停子筛  

## 5. 操作区与摘要条

- 枪卡底部固定两列：`状态日志` | `更多操作`（`type=text` 原色，无停充高亮色）
- `更多操作` 下拉：充电中含「停止充电」；始终含「设备详情」
- 摘要条左右布局：左额定/实时功率（大数字+kW），竖线分隔，右状态 chips
