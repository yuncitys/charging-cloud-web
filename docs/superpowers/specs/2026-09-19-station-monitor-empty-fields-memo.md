# 站点监控：空值 / 未赋值字段处理备忘

日期：2026-09-19  
范围：`StationMonitorServiceImpl.assembleGun` + Web/Uniapp 监控展示  
原则（已确认）：

1. **有可靠数据源 → 接线赋值**
2. **暂无数据源 → 前端继续显示 `-`，不隐藏；本表登记，待业务决定后续**

---

## 1. 本轮已接线

| VO 字段 | 展示文案 | 数据源 | 改动 |
|---|---|---|---|
| `plugTime` | 插枪时间 | `t_device_guns.plug_session_start`（行字段 `plugSessionStart`，查询已 SELECT） | `assembleGun` / `fillOccupyDuration` 旁：`vo.setPlugTime(row.getPlugSessionStart())` |

说明：占用开始时间原先只用该字段算时长，未回填 `plugTime`，导致详情「插枪时间」恒为 `-`。

---

## 2. 暂无可靠数据源（保持 `-`，待决策）

| VO 字段 | 展示位置 | 为何空 | 可选后续方案 | 决策（待填） |
|---|---|---|---|---|
| `parkingNo` | 缩略空闲卡「车位」、枪头旁车位 | `t_device_guns` **无车位列**；Row/Mapper 也未查 | A. 枪表加 `parking_no` 主数据并 join<br>B. 长期保留 `-`<br>C. 以后再隐藏 UI | |
| `startSoc` | 详情「初始 SOC」 | 监控链路未取；本库 `t_charge_order` 亦无稳定 SOC 起始列；`LastPowerRecord` 只有当前 `soc` | A. 协议侧落库开始 SOC 后再接<br>B. 用首包 SOC 近似（语义不准）<br>C. 保留 `-` | |
| `requirePowerKw` | 缩略「实时/需求功率」右侧 | `t_last_power_record` 无需求功率字段；`applyRealtime` 未 set | A. 扩展实时报文落库<br>B. 仅展示实时功率，改文案<br>C. 保留 `-` | |
| `requireCurrent` | 详情「需求电流」 | 同上，无列 | 同需求功率 | |
| `requireVoltage` | 详情「需求电压」 | 同上，无列 | 同需求功率 | |
| `batteryTemperature` | 详情「电池温度」 | `LastPowerRecord` 仅有 `portTemp`（枪口）与 `temp`（环境），**不是电池温度**；禁止误用 `temp` | A. 协议增加电池温并落库<br>B. 改展示为「环境温度」并接 `temp`<br>C. 保留 `-` | |

---

## 3. 有值但「场景性为空」（正常业务空，不是未接线）

这些已接线；无进行中订单 / 无 `LastPowerRecord` / 非占用态时为空，前端 `-` **合理**：

| 字段 | 条件 |
|---|---|
| `realtimePowerKw` / `realtimeSoc` / `remainMinutes` / `chargedKwh` / `outputCurrent` / `outputVoltage` / `gunTemperature` | 仅进行中订单 + 有实时记录时 |
| `plateNumber` / `userLabel` / `vinCode` / `cardNo` / `orderCode` | 依赖进行中或已结束订单摘要 |
| `occupyMinutes` / `occupyStartTime` | 仅占用池状态 |
| `lastSoc` / `lastPlateNumber` / `stopReason` / `lastEndTime` | 依赖已结束订单 / 相位 |
| `lastAlarmReason` | 依赖摘要告警 |

---

## 4. 非目标（本备忘）

- 不隐藏「第 2 节」字段 UI
- 不扩展协议落库（除非另行立项）
- 不把环境温度 `temp` 冒充电池温度

---

## 5. 请你拍板（第 2 节）

请在上表「决策」列勾选 A/B/C，或补充方案后，再开实现任务。
