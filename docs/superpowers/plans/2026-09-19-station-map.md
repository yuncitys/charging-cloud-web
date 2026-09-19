# Station Map (Gaode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Web「站点地图」page under 站点设备 that plots permission-scoped stations on Gaode with DC/AC status counts in an InfoWindow and a link into 电站监控.

**Architecture:** One monitor-module API returns stations with coordinates and pre-aggregated DC/AC gun counts. Web page loads Gaode via existing `loadMap.js`, paints markers, filters by city/name client-triggered re-fetch. City dropdown options come from a lightweight distinct-cities endpoint (same dataScope).

**Tech Stack:** Java/Spring/MyBatis, Vue 2 + Element UI 2.13, Gaode JS API 1.4.x via `loadMap.js`

## Global Constraints

- InfoWindow groups: 直流 / 交流; `electric_out_type=1` → DC; `0` or `null` → AC
- Status buckets: idle / charging / fault / offline / other; **occupy folded into other**
- Filters: exact `network_city`, fuzzy `network_name`
- Only stations with parseable longitude/latitude are returned (or filtered out in SQL)
- Route `/device/stationMap`; permission `:ops:stationMap:page`
- Theme accent `#07b161` for InfoWindow close / link OK
- Link: `/device/stationMonitor?stationId=`
- Reuse Amap key already used by charge station form: `87331a23c6a4e734969f8621bc166eff`
- No clustering, no auto-poll in v1; optional manual refresh button OK
- Sidebar menu row is ops/config (document SQL snippet); code ships route + API

---

## File map

| File | Role |
|---|---|
| `StationMapQuery.java` | city, networkName + QueryRequest params |
| `StationMapPointVo.java` | station + dc/ac count nested objects |
| `StationMapGunCountVo.java` | total/idle/charging/fault/offline/other |
| `StationMonitorMapper.java` + `.xml` | listStationMapPoints, listStationMapCities |
| `StationMonitorService(+Impl)` | listStationMap / listStationMapCities |
| `StationMonitorController` | GET `/monitor/station-map`, GET `/monitor/station-map/cities` |
| `StationMonitorServiceTest` | status folding + AC/DC null→AC smoke via mocked mapper |
| `src/api/monitor/stationMap.js` | API helpers |
| `src/views/monitor/stationMap.vue` | page |
| `src/router/modules/device.js` | route entry |

---

### Task 1: Backend station-map API

**Files:**
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/StationMapQuery.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/monitor/StationMapGunCountVo.java`
- Create: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/monitor/StationMapPointVo.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/mapper/StationMonitorMapper.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/resources/mapper/StationMonitorMapper.xml`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/StationMonitorService.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/StationMonitorServiceImpl.java`
- Modify: `charging-cloud/sharecharge-web/sharecharge-web-controller/src/main/java/com/sharecharge/web/controller/StationMonitorController.java`
- Modify: `charging-cloud/sharecharge-biz/src/test/java/com/sharecharge/biz/service/StationMonitorServiceTest.java`

**Interfaces:**
- Produces: `List<StationMapPointVo> listStationMap(StationMapQuery query)`
- Produces: `List<String> listStationMapCities(StationMapQuery query)`
- Produces HTTP: `GET /monitor/station-map`, `GET /monitor/station-map/cities`

- [ ] **Step 1: Add query + VOs**

```java
@Data
public class StationMapQuery extends QueryRequest {
    private String city;
    private String networkName;
}
```

```java
@Data
public class StationMapGunCountVo {
    private Integer total;
    private Integer idle;
    private Integer charging;
    private Integer fault;
    private Integer offline;
    private Integer other;
}
```

```java
@Data
public class StationMapPointVo {
    private Integer stationId;
    private String networkName;
    private String networkAddress;
    private String networkCity;
    private String longitude;
    private String latitude;
    private Integer ruleId;
    private StationMapGunCountVo dc;
    private StationMapGunCountVo ac;
}
```

Mapper may return flat columns (`dcIdle`, `acCharging`, …); Service maps into nested `dc`/`ac`. Prefer flat MyBatis result + assemble in service for simplicity.

Flat row type (same package as other monitor models or reuse PointVo with flat fields then assemble):

```java
@Data
public class StationMapPointRow {
    private Integer stationId;
    private String networkName;
    private String networkAddress;
    private String networkCity;
    private String longitude;
    private String latitude;
    private Integer ruleId;
    private Integer dcIdle;
    private Integer dcCharging;
    private Integer dcFault;
    private Integer dcOffline;
    private Integer dcOther;
    private Integer acIdle;
    private Integer acCharging;
    private Integer acFault;
    private Integer acOffline;
    private Integer acOther;
}
```

- [ ] **Step 2: Mapper methods + SQL**

`StationMonitorMapper.java`:

```java
List<StationMapPointRow> listStationMapPoints(@Param("query") StationMapQuery query);
List<String> listStationMapCities(@Param("query") StationMapQuery query);
```

SQL fragment for one polarity (example DC: `IFNULL(g.electric_out_type,0)=1`):

```sql
SUM(IFNULL(g.electric_out_type,0)=1 AND g.status=0 AND IFNULL(g.connect_status,0)<>1) AS dcIdle,
SUM(IFNULL(g.electric_out_type,0)=1 AND g.status=1) AS dcCharging,
SUM(IFNULL(g.electric_out_type,0)=1 AND g.status=3) AS dcFault,
SUM(IFNULL(g.electric_out_type,0)=1 AND g.status=2) AS dcOffline,
SUM(
  IFNULL(g.electric_out_type,0)=1
  AND NOT (
    (g.status=0 AND IFNULL(g.connect_status,0)<>1)
    OR g.status=1 OR g.status=2 OR g.status=3
  )
) AS dcOther
```

AC: `IFNULL(g.electric_out_type,0)=0` (null treated as 0 → AC).

`listStationMapPoints`:

```xml
<select id="listStationMapPoints" resultType="...StationMapPointRow">
  SELECT
    tnd.id AS stationId,
    tnd.network_name AS networkName,
    tnd.network_address AS networkAddress,
    tnd.network_city AS networkCity,
    tnd.network_longitude AS longitude,
    tnd.network_latitude AS latitude,
    tnd.rule_id AS ruleId,
    CAST(IFNULL(st.dc_idle,0) AS SIGNED) AS dcIdle,
    ...
  FROM t_network_dot tnd
  LEFT JOIN (
    SELECT d.network_dot_id,
           -- all dc*/ac* SUMs above
    FROM t_device_guns g
    JOIN t_device d ON d.id=g.device_id AND d.is_delete=0
    WHERE g.is_delete=0 AND IFNULL(g.start_status,1)=1
    GROUP BY d.network_dot_id
  ) st ON st.network_dot_id = tnd.id
  WHERE tnd.is_delete=0
    AND tnd.network_longitude IS NOT NULL AND tnd.network_longitude &lt;&gt; ''
    AND tnd.network_latitude IS NOT NULL AND tnd.network_latitude &lt;&gt; ''
    <if test="query.city != null and query.city != ''">
      AND tnd.network_city = #{query.city}
    </if>
    <if test="query.networkName != null and query.networkName != ''">
      AND tnd.network_name LIKE CONCAT('%', #{query.networkName}, '%')
    </if>
    <if test="query.params != null and query.params.dataScope != null and query.params.dataScope != ''">
      ${query.params.dataScope}
    </if>
</select>
```

`listStationMapCities`:

```xml
SELECT DISTINCT tnd.network_city
FROM t_network_dot tnd
WHERE tnd.is_delete=0
  AND tnd.network_city IS NOT NULL AND tnd.network_city &lt;&gt; ''
  ... dataScope ...
ORDER BY tnd.network_city
```

- [ ] **Step 3: Service assemble + controller**

```java
private StationMapGunCountVo counts(Integer idle, Integer charging, Integer fault, Integer offline, Integer other) {
    StationMapGunCountVo c = new StationMapGunCountVo();
    c.setIdle(nz(idle));
    c.setCharging(nz(charging));
    c.setFault(nz(fault));
    c.setOffline(nz(offline));
    c.setOther(nz(other));
    c.setTotal(c.getIdle()+c.getCharging()+c.getFault()+c.getOffline()+c.getOther());
    return c;
}
```

Controller:

```java
@DataScope(alias = "tnd", merchantColumn = true, stationColumn = true,
        stationIdRef = StationIdRef.DOT_PRIMARY, adminColumn = true)
@SaCheckPermission(":ops:stationMap:page")
@GetMapping("/station-map")
@ApiOperation("站点地图-点位列表")
public ResultUtil stationMap(StationMapQuery query) { ... }

@DataScope(... same ...)
@SaCheckPermission(":ops:stationMap:page")
@GetMapping("/station-map/cities")
@ApiOperation("站点地图-城市列表")
public ResultUtil stationMapCities(StationMapQuery query) { ... }
```

- [ ] **Step 4: Unit test**

In `StationMonitorServiceTest`, mock mapper rows and assert:
- null electric type path is AC (row with only acIdle populated → `ac.total` includes them)
- occupy-style residual lands in `other` (mapper-provided `dcOther` passes through)
- `dc.total == sum of five buckets`

- [ ] **Step 5: Commit (cloud)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz sharecharge-web/sharecharge-web-controller/src/main/java/com/sharecharge/web/controller/StationMonitorController.java
git commit -m "$(cat <<'EOF'
feat(monitor): add station map points and cities API

EOF
)"
```

---

### Task 2: Web station map page

**Files:**
- Create: `charging-cloud-web/src/api/monitor/stationMap.js`
- Create: `charging-cloud-web/src/views/monitor/stationMap.vue`
- Modify: `charging-cloud-web/src/router/modules/device.js`

**Interfaces:**
- Consumes: `GET /api/web/monitor/station-map`, `GET /api/web/monitor/station-map/cities`
- Produces: route `/device/stationMap`

- [ ] **Step 1: API module**

```js
import request from '@/utils/request'

export function getStationMapPoints(params) {
  return request({ url: '/api/web/monitor/station-map', method: 'get', params })
}

export function getStationMapCities(params) {
  return request({ url: '/api/web/monitor/station-map/cities', method: 'get', params })
}
```

- [ ] **Step 2: Route**

Insert after `stationMonitor` entry in `device.js`:

```js
{
  path: '/device/stationMap',
  component: () => import('@/views/monitor/stationMap'),
  name: 'stationMap',
  meta: {
    title: '站点地图',
    icon: 'el-icon-map-location'
  }
}
```

- [ ] **Step 3: Page shell**

`stationMap.vue` structure:
- Absolute full-area `#station-map` div
- Floating filter bar top-right: city `el-select` (clearable), name `el-input`, 查询 / 刷新 buttons
- `mounted`: `loadCities()` then `loadMap(key, [], '1.4.4').then(initMap)` then `loadPoints()`
- Amap key: `87331a23c6a4e734969f8621bc166eff` (same as `editPage.vue`)
- On points load: clear markers, create `AMap.Marker` with default blue icon `https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png`, click → `InfoWindow` HTML
- InfoWindow HTML (string): station name, address, DC block, AC block (五态), link `<a href="javascript:;" data-station-id="...">进入站点监控</a>`
- Bind link via DOM click or `window.__stationMapGo = id => this.$router.push(...)`
- `map.setFitView(markers)` when ≥1 point
- Omit points with invalid lat/lng client-side as safety

InfoWindow count line format match example:

```
直流设备16个
空闲 14   充电 2   故障 0   离线 0   其它 0
```

- [ ] **Step 4: Manual checklist**

1. Open `/device/stationMap` (temp grant permission or login as admin with menu)
2. Cities populate; filter city + name refreshes markers
3. Click marker → InfoWindow DC/AC totals match five buckets
4. 「进入站点监控」 navigates with `stationId`
5. Stations without coordinates absent

- [ ] **Step 5: Commit (web)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/api/monitor/stationMap.js src/views/monitor/stationMap.vue src/router/modules/device.js
git commit -m "$(cat <<'EOF'
feat(monitor): add Gaode station map page with DC/AC info windows

EOF
)"
```

---

### Task 3: Menu permission note (docs only)

**Files:**
- Modify: `charging-cloud-web/docs/superpowers/specs/2026-09-19-station-map-design.md` (append ops checklist) **or** add short note in plan acceptance — prefer append to spec §1:

```markdown
### 菜单配置（上线时）

在「站点设备」下新增菜单：
- 名称：站点地图
- 路由：`/device/stationMap`
- 权限：`:ops:stationMap:page`
```

- [ ] **Step 1: Append menu checklist to spec and commit**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add docs/superpowers/specs/2026-09-19-station-map-design.md
git commit -m "$(cat <<'EOF'
docs(monitor): add station map menu permission checklist

EOF
)"
```

---

## Spec coverage check

| Spec item | Task |
|---|---|
| Route under 站点设备 | 2 |
| Gaode + blue markers | 2 |
| City + name filter | 1+2 |
| DC/AC five-state InfoWindow | 1+2 |
| Occupy → other | 1 |
| null electric_out → AC | 1 |
| Enter station monitor link | 2 |
| One-shot points API | 1 |
| Menu/permission ops note | 3 |
| No cluster / no auto-poll | n/a |
