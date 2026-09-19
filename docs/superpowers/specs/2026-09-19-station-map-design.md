# Web 站点地图（高德）设计

日期：2026-09-19  
范围：`charging-cloud-web` 新页「站点地图」+ `charging-cloud` 站点地图列表 API  
对齐例图：高德底图 + 蓝点 + 信息窗（站名/地址/直流·交流状态计数）  
配套：与「电站监控」同属「站点设备」目录；信息窗可进入站点监控  
非目标：uniapp、点聚合、自动轮询、改站点坐标录入

## 已确认结论

| 项 | 选择 |
|---|---|
| 信息窗设备分组 | **B**：直流 / 交流；单车与汽车均按枪口 `electric_out_type` 分桶（`null` 归交流） |
| 筛选 | **C**：城市 + 站点名称 |
| 点击交互 | **A**：信息窗 +「进入站点监控」 |
| 数据加载 | **A**：一次接口返回坐标 + 交直流状态计数 |
| 地图 | 高德 JS API；复用 `src/utils/loadMap.js` 与站点表单同款 Key |

## 1. 页面与菜单

- 路由：`/device/stationMap`  
  - 注册于 `src/router/modules/device.js`（与 `stationMonitor` 同级）  
  - `meta.title`：站点地图  
- 侧栏：后端菜单挂在「站点设备」下；前端路由就绪后由运营/脚本配置菜单与权限  
- 建议权限码：`:ops:stationMap:page`（实现时若菜单体系统一用其它前缀，与现网 `device`/`ops` 惯例对齐即可）

## 2. UI / 交互

- 布局：内容区全幅高德地图  
- 右上筛选：  
  - 城市：下拉（选项来自权限内站点去重 `network_city`，或独立城市接口；无城市站点不进选项）  
  - 站点名称：输入框，模糊匹配 `network_name`；查询按钮或回车触发重新拉点  
- 标记：蓝点（可用高德默认蓝标，对齐例图）  
- 仅展示有有效经纬度的站点（`network_longitude` / `network_latitude` 非空且可解析）  
- 信息窗字段：  
  - 电站名称、电站地址  
  - **直流设备** `N个`：空闲 / 充电 / 故障 / 离线 / 其它  
  - **交流设备** `N个`：同上五态  
  - 链接：「进入站点监控」→ `/device/stationMonitor?stationId={id}`（电单车站若监控页仅支持汽车，仍带参跳转；无权限则隐藏链接或 toast）  
- 关闭信息窗：例图橙/主题色关闭按钮即可；主题色可用系统绿 `#07b161`（不必强制例图橙）

## 3. 状态统计口径

与站点监控枪状态一致，按枪（`t_device_guns`）计数：

| 桶 | 条件（示意） |
|---|---|
| 空闲 | `status=0` 且未处于插枪占用 |
| 充电 | `status=1` |
| 离线 | `status=2` |
| 故障 | `status=3` |
| 其它 | 其余；**占用**（`status in (4,5)` 或 `connect_status=1` 且非充电）计入「其它」或单独并入其它——与例图五态对齐时：**占用并入「其它」** |

交直流：

- `electric_out_type = 1` → 直流  
- `electric_out_type = 0` 或 `null` → 交流  

过滤：枪 `is_delete=0`、`start_status` 可用；设备 `is_delete=0`；站点 `is_delete=0`；`dataScope` 同监控。

## 4. API

```
GET /api/web/monitor/station-map
    query: city?, networkName?, (可选 ruleId)
```

响应 `data`：数组，元素例如：

```json
{
  "stationId": 1,
  "networkName": "天台雷迪森充电站",
  "networkAddress": "浙江省台州市天台县寒山路468号",
  "networkCity": "台州市",
  "longitude": "121.00",
  "latitude": "29.00",
  "ruleId": 2,
  "dc": { "total": 16, "idle": 14, "charging": 2, "fault": 0, "offline": 0, "other": 0 },
  "ac": { "total": 0, "idle": 0, "charging": 0, "fault": 0, "offline": 0, "other": 0 }
}
```

实现建议：

- Controller：挂 `StationMonitorController` 或新建 `StationMapController`（同 monitor 模块）  
- Mapper：按站点聚合枪状态 × `electric_out_type`；一次查询或站点列表 LEFT JOIN 聚合子查询  
- 城市筛：`tnd.network_city = #{city}` 或 `LIKE`（精确优先）  
- 名称：`tnd.network_name LIKE CONCAT('%', #{networkName}, '%')`

可选辅助：`GET /monitor/station-map/cities` 返回去重城市列表；若首版用主接口结果前端去重城市，可省略。

## 5. 前端文件

| 文件 | 职责 |
|---|---|
| `src/views/monitor/stationMap.vue`（或 `src/views/device/stationMap.vue`） | 地图页 |
| `src/api/monitor/stationMap.js` | API |
| `src/router/modules/device.js` | 路由 |
| `src/utils/loadMap.js` | 已有，复用 |

## 6. 非目标

- 点聚合 / 海量点优化（站点量级先全量打点；若后续 >500 再议）  
- 定时轮询刷新计数（可提供手动「刷新」）  
- Uniapp 站点地图  
- 修改高德 Key 管理方式（本轮继续页内/现有常量；后续可抽环境变量）

## 7. 验收要点

1. 「站点设备」下可打开站点地图（菜单配置后）  
2. 城市 + 名称筛选后点位正确减少  
3. 点击标记信息窗展示直流/交流五态；总数等于五态之和  
4. 电单车站枪口计入交流（或按其 `electric_out_type`）  
5. 「进入站点监控」带 `stationId` 跳转  
6. 无坐标站点不出现在地图上  
