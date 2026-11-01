# 运营商工作台 V3（业态筛选 / 终端状态 / 电站电量 Top10）

**Date:** 2026-10-27  
**Status:** Approved（对话确认）  
**Parent:** 工作台 V1/V2  
**Branches:** 继续 `feature/operator-workbench` + `feature/operator-workbench-web`  
**Phase:** B（本期）；用户统计、营销加字段后置

## Goal

在工作台增加业态（`ruleId`）筛选；补「终端状态」实时汇总（图 1）；补「电站电量前 10」并带齐图 3 字段（图 3）。

## Out of Scope（本期）

- 用户统计 / 用户分析（图 2）  
- 营销「活动订单电量 / 参与电站数 / 参与用户数」  
- 候选 500 放开、其它 V2 之外能力  

---

## 1. 业态筛选

- 顶栏新增「业态」：`全部` / 字典 `device_rule` 选项（电动单车、新能源汽车等）  
- 查询参数：`ruleId`（Integer，可空=全部）写入 `OperatorWorkbenchQuery`  
- 生效范围：经营概览、预警、财务、营销、**终端状态**、**电站电量 Top10**；站点下拉选项按 `t_network_dot.rule_id` 过滤  
- 日表类查询：有 `rule_id` 列的用 `s.rule_id = #{ruleId}`；网点/枪表用 `tnd.rule_id`  

---

## 2. 终端状态（实时）

### UI

- 区块标题「终端状态」  
- 右上链接：「异常明细」（故障监控或工单列表，实现时选现有路由）、「电站监控」  
- 两栏：**直流** / **交流**；每栏六态计数：故障、离线、占用、充电中、空闲、其他  

### 口径

- **实时**枪口状态汇总，**不随**顶栏「统计周期」变化；仍受商户 / 站点 / 业态筛选  
- 状态分桶对齐电站监控：  
  - 空闲：`status=0` 且非插枪占用  
  - 充电中：`status=1`  
  - 离线：`status=2`  
  - 故障：`status=3`  
  - 占用：`status∈{4,5}` 或（插枪且非充电中）  
  - 其他：其余  
- 交直流：`IFNULL(gun.electric_out_type, device_type.electric_out)`；`0=交流`，`1=直流`（与现网字典一致；无法判定计入「其他」所在电流类型时：归入交流栏「其他」或单独不展示——实现选 **无法判定记入交流·其他**）  
- 仅统计 `gun.is_delete=0` 且 `start_status=1`（投运）的枪  

### API

`POST /operatorWorkbench/terminalStatus`  
权限：建议 `:web:operatorWorkbench:view`（或与 overview 相同）  
响应示例：

```json
{
  "dc": { "fault": 2, "offline": 0, "occupy": 1, "charging": 0, "idle": 13, "other": 0 },
  "ac": { "fault": 0, "offline": 0, "occupy": 0, "charging": 0, "idle": 0, "other": 0 }
}
```

---

## 3. 电站电量 Top10

### UI

- 标题随周期：`今日/本周/本月电站电量前 10`  
- 右上「电站报表」→ 现有经营/电站相关报表路由  
- 表格列（不可缺）：排名、电站名称、总电量(度)、日均电量(度)、单枪日均电量(度)、终端数量(个)、充电利用率(%)、额定功率(kW)  

### 时段

- 与顶栏 `periodType`（及可选 `statDate`）一致，复用 `OperatorWorkbenchPeriodHelper` 解析起止日  

### 数据与公式

- 主源：`t_statistics_station_charge_day_bill` 按 `station_id` 汇总区间；`ORDER BY SUM(total_degree) DESC LIMIT 10`  
- 业态：`rule_id` 过滤（日表维度）  
- **总电量** = `SUM(total_degree)`  
- **区间天数** `D` = 起止自然日差（至少 1）  
- **日均电量** = 总电量 / D  
- **终端数量** = 站下投运枪数（与终端状态同口径，实时快照）  
- **单枪日均** = 日均 / 终端数；终端数 0 → null/`--`  
- **额定功率(kW)** = `SUM(device.device_total_power)/1000`（站下未删设备）  
- **充电利用率(%)** = `总充电时长(h) / (终端数 × 24 × D) × 100`  
  - 总充电时长来自区间 `SUM(total_duration)`；订单侧 `actual_duration` 为**分钟**（`DateUnit.MINUTE`），故小时 = `SUM(total_duration) / 60`  
  - 终端数 0 → null/`--`  
- 可复用商户 App `listStationTop` 思路，但 **Top10 + 补字段**，不要直接把 App Top5 VO 原样塞进工作台  

### API

`POST /operatorWorkbench/stationPowerTop`  
权限：同 view / overview  
响应：`List<{ rank, stationId, stationName, totalKwh, avgDailyKwh, avgDailyKwhPerGun, gunCount, utilizationRate, ratedPowerKw }>`

---

## 4. 前端布局建议

顺序（在现有区块中插入，可微调）：经营概览 → **终端状态** → 异常预警 → 钱从哪来 → 营销 → **电站电量 Top10**  
业态下拉放在商户/站点旁。

---

## Acceptance

1. 选业态后，概览/预警/财务/营销/终端/Top10 与站点下拉均按业态收窄；清空业态恢复全部  
2. 终端状态交直流六态与电站监控单站汇总同口径；改枪状态后刷新可见变化  
3. Top10 标题随今日/本周/本月变化；列齐全；利用率按「时长/(枪数×24×天数)」  
4. 无对应权限不展示新区块；DataScope 不越权  

## Rollout

无强制新 DDL（沿用日账单与枪/设备表）。部署 cloud + web 当前工作台分支。
