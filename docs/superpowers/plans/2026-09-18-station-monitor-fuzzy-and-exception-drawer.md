# Station Monitor Fuzzy Search + Exception Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support fuzzy pile/gun-code search on station monitor, restyle status chips with fault/offline「详情」, and open a station-scoped `t_device_log` exception drawer (page + export).

**Architecture:** Keep piles query filters on `StationMonitorMapper`; add dedicated exception-log list/count/export on the same monitor module (join `t_device_log` → network + guns). Web adds `ExceptionLogDrawer` and restyles status chips; export mirrors existing DeviceLog async Task pattern.

**Tech Stack:** Java/Spring, MyBatis XML, JUnit4 + Mockito, Vue 2 + Element UI 2.13, existing `AsyncService` / `TaskService`

## Global Constraints

- Fuzzy: `device_code LIKE %kw%`; gun input binds `gunCode` with `gun_code LIKE %kw%`; keep legacy `gunNumber` exact AND if present
- Exception data: historical `t_device_log` for current `network_dot_id`; fault=`DEVICE_FAULT`, offline=`DEVICE_ACTION_DOWNLINE`
- Theme accent `#07b161`; uniapp out of scope
- Permission reuse `:ops:stationMonitor:page`
- Controller paths under `/monitor/stations/{stationId}/...` (existing plural `stations`)

---

## File map

| File | Role |
|---|---|
| `StationMonitorGunQuery.java` | add `gunCode` |
| `StationMonitorMapper.xml` | LIKE filters; exception list/count/export SQL |
| `StationMonitorMapper.java` | new mapper methods |
| `StationExceptionLogQuery.java` | page query + type |
| `StationExceptionLogVo.java` | list row VO |
| `StationExceptionLogExportVo.java` | EasyExcel export row |
| `StationMonitorService(+Impl)` | pageExceptionLogs / exportExceptionLogs |
| `StationMonitorServiceTest` | fuzzy + exception filter tests |
| `StationMonitorController` | GET exception-logs, POST export |
| `AsyncService` | `exportStationExceptionLogs` |
| `stationMonitor.js` | API helpers |
| `ExceptionLogDrawer.vue` | drawer UI |
| `stationMonitor.vue` | filters, chips, open drawer |

---

### Task 1: Backend fuzzy search on piles query

**Files:**
- Modify: `sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/StationMonitorGunQuery.java`
- Modify: `sharecharge-biz/src/main/resources/mapper/StationMonitorMapper.xml`
- Modify: `sharecharge-biz/src/test/java/com/sharecharge/biz/service/StationMonitorServiceTest.java` (optional assert query field passthrough only if mocking mapper args)

**Interfaces:**
- Produces: `StationMonitorGunQuery.gunCode: String`; XML uses `query.gunCode` LIKE and `query.deviceCode` LIKE; `query.gunNumber` exact kept

- [ ] **Step 1: Add `gunCode` field**

```java
private String gunCode;
```

Keep existing `Integer gunNumber`.

- [ ] **Step 2: Update `listCarGunRows` filters in XML**

Replace exact device/gun blocks with:

```xml
<if test="query.deviceCode != null and query.deviceCode != ''">
    AND d.device_code LIKE CONCAT('%', #{query.deviceCode}, '%')
</if>
<if test="query.gunCode != null and query.gunCode != ''">
    AND g.gun_code LIKE CONCAT('%', #{query.gunCode}, '%')
</if>
<if test="query.gunNumber != null">
    AND g.gun_number = #{query.gunNumber}
</if>
```

- [ ] **Step 3: Commit (cloud)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/StationMonitorGunQuery.java \
  sharecharge-biz/src/main/resources/mapper/StationMonitorMapper.xml
git commit -m "feat(monitor): fuzzy match deviceCode and gunCode on piles query"
```

---

### Task 2: Web fuzzy search form

**Files:**
- Modify: `charging-cloud-web/src/views/monitor/stationMonitor.vue`

**Interfaces:**
- Consumes: piles API accepts `gunCode` string
- Produces: `listQuery.gunCode`; no longer sends `gunNumber` from web

- [ ] **Step 1: Form + query params**

- Change input `v-model` from `listQuery.gunNumber` → `listQuery.gunCode`
- Placeholder: `请输入枪编码`
- `data.listQuery`: `{ deviceCode: '', gunCode: '', sort: '' }`
- `handleReset`: clear `gunCode`
- In piles params builder:

```js
const deviceCode = (this.listQuery.deviceCode || '').trim()
if (deviceCode) params.deviceCode = deviceCode
const gunCode = (this.listQuery.gunCode || '').trim()
if (gunCode) params.gunCode = gunCode
```

- [ ] **Step 2: Commit (web)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/views/monitor/stationMonitor.vue
git commit -m "feat(monitor): send fuzzy gunCode from station monitor filters"
```

---

### Task 3: Exception log query VO + mapper SQL

**Files:**
- Create: `sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/StationExceptionLogQuery.java`
- Create: `sharecharge-biz/src/main/java/com/sharecharge/biz/vo/monitor/StationExceptionLogVo.java`
- Create: `sharecharge-biz/src/main/java/com/sharecharge/biz/vo/monitor/StationExceptionLogExportVo.java`
- Modify: `sharecharge-biz/src/main/java/com/sharecharge/biz/mapper/StationMonitorMapper.java`
- Modify: `sharecharge-biz/src/main/resources/mapper/StationMonitorMapper.xml`

**Interfaces:**
- Produces:
  - `StationExceptionLogQuery` extends `QueryRequest`: `Integer stationId`, `String type` (`fault`|`offline`), `params`
  - `StationExceptionLogVo`: `gunName`, `gunCode`, `typeLabel`, `networkName`, `reason`, `alarmCode`, `createTime`
  - Mapper: `List<StationExceptionLogVo> listExceptionLogs(StationExceptionLogQuery q)`, `long countExceptionLogs(...)`, `List<StationExceptionLogExportVo> exportExceptionLogs(...)`

- [ ] **Step 1: Create query + VOs**

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class StationExceptionLogQuery extends QueryRequest {
    private Integer stationId;
    /** fault | offline */
    private String type;
}
```

```java
@Data
public class StationExceptionLogVo {
    private String gunName;
    private String gunCode;
    private String typeLabel;
    private String networkName;
    private String reason;
    private String alarmCode;
    private Date createTime;
}
```

Export VO: same fields with `@ExcelProperty` labels 枪名称/枪编号/类型/所属电站/故障名称/故障码 (export always uses these headers; offline reasons still in 故障名称 column is OK, or use 原因 — use **原因** + **告警码** for export headers to cover both tabs).

- [ ] **Step 2: Mapper interface methods**

```java
List<StationExceptionLogVo> listExceptionLogs(@Param("query") StationExceptionLogQuery query);
long countExceptionLogs(@Param("query") StationExceptionLogQuery query);
List<StationExceptionLogExportVo> exportExceptionLogs(@Param("query") StationExceptionLogQuery query);
```

- [ ] **Step 3: XML SQL**

Shared `<sql id="exceptionLogFromWhere">`:

```xml
FROM t_device_log tdl
LEFT JOIN t_network_dot tnd ON tnd.id = tdl.network_dot_id
LEFT JOIN t_device d ON d.device_code = tdl.device_code AND d.is_delete = 0
LEFT JOIN t_device_guns g ON g.device_id = d.id AND g.gun_number = tdl.connector_code AND g.is_delete = 0
WHERE tdl.network_dot_id = #{query.stationId}
  AND tdl.alarm_code = #{query.alarmCode}
<!-- dataScope on tnd -->
${query.params.dataScope}
```

Service sets `alarmCode` from type before call **or** XML chooses:

```xml
<choose>
  <when test="query.type == 'offline'">
    AND tdl.alarm_code = 'DEVICE_ACTION_DOWNLINE'
  </when>
  <otherwise>
    AND tdl.alarm_code = 'DEVICE_FAULT'
  </otherwise>
</choose>
```

Select:

```sql
g.gun_name AS gunName,
IFNULL(NULLIF(g.gun_code,''), CONCAT(tdl.device_code, LPAD(IFNULL(tdl.connector_code,0), 2, '0'))) AS gunCode,
CASE WHEN tdl.alarm_code = 'DEVICE_ACTION_DOWNLINE' THEN '离线' ELSE '故障' END AS typeLabel,
tnd.network_name AS networkName,
IFNULL(NULLIF(tdl.reason,''), tdl.alarm_item) AS reason,
tdl.alarm_code AS alarmCode,
tdl.create_time AS createTime
```

`ORDER BY tdl.create_time DESC` + limit for page; export without limit (or high limit consistent with device log export).

- [ ] **Step 4: Commit (cloud)**

```bash
git commit -m "feat(monitor): add station exception log mapper queries"
```

---

### Task 4: Service + controller + async export + tests

**Files:**
- Modify: `StationMonitorService.java` / `StationMonitorServiceImpl.java`
- Modify: `StationMonitorController.java`
- Modify: `AsyncService.java` (add export method near `exportDeviceLog`)
- Modify: `StationMonitorServiceTest.java`

**Interfaces:**
- Produces:
  - `ResultUtil pageExceptionLogs(StationExceptionLogQuery query)`
  - `ResultUtil exportExceptionLogs(StationExceptionLogQuery query)`
  - Controller:
    - `GET /monitor/stations/{stationId}/exception-logs?type=&page=&limit=`
    - `POST /monitor/stations/{stationId}/exception-logs/export?type=`

- [ ] **Step 1: Write failing unit tests**

In `StationMonitorServiceTest`:

```java
@Test
public void pageExceptionLogs_rejectsBlankStation() {
    StationExceptionLogQuery q = new StationExceptionLogQuery();
    q.setType("fault");
    ResultUtil r = service.pageExceptionLogs(q);
    Assert.assertNotEquals(Integer.valueOf(200), r.getCode());
}

@Test
public void pageExceptionLogs_mapsFaultTypeToMapper() {
    StationExceptionLogQuery q = new StationExceptionLogQuery();
    q.setStationId(10);
    q.setType("fault");
    when(stationMonitorMapper.listExceptionLogs(any())).thenReturn(Collections.emptyList());
    when(stationMonitorMapper.countExceptionLogs(any())).thenReturn(0L);
    ResultUtil r = service.pageExceptionLogs(q);
    Assert.assertEquals(Long.valueOf(0L), Long.valueOf(r.getCount()));
    verify(stationMonitorMapper).listExceptionLogs(argThat(x -> "fault".equals(x.getType()) && Integer.valueOf(10).equals(x.getStationId())));
}
```

(Adjust ResultUtil getters to match project.)

- [ ] **Step 2: Run tests — expect fail (methods missing)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
mvn -pl sharecharge-biz -Dtest=StationMonitorServiceTest -Dsurefire.failIfNoSpecifiedTests=false test
```

- [ ] **Step 3: Implement service methods**

```java
public ResultUtil pageExceptionLogs(StationExceptionLogQuery query) {
    if (query == null || query.getStationId() == null) {
        return ResultUtil.error("站点不能为空");
    }
    if (!"fault".equals(query.getType()) && !"offline".equals(query.getType())) {
        query.setType("fault");
    }
    List<StationExceptionLogVo> list = stationMonitorMapper.listExceptionLogs(query);
    long count = stationMonitorMapper.countExceptionLogs(query);
    ResultUtil ru = new ResultUtil();
    ru.setData(list);
    ru.setCount(count);
    ru.setCode(ExceptionConstant.SUCCESS_HTTPREUQEST);
    return ru;
}

public ResultUtil exportExceptionLogs(StationExceptionLogQuery query) {
    // same validation; create Task; asyncService.exportStationExceptionLogs(query, task);
}
```

Inject `TaskService` + `AsyncService` into `StationMonitorServiceImpl` (constructor update + test mocks).

- [ ] **Step 4: AsyncService.exportStationExceptionLogs**

Copy pattern from `exportDeviceLog`: write Excel via EasyExcel using `StationExceptionLogExportVo`, update Task status/file path.

- [ ] **Step 5: Controller endpoints** with `@DataScope` + `@SaCheckPermission(":ops:stationMonitor:page")` same as piles.

- [ ] **Step 6: Run tests — expect pass**

- [ ] **Step 7: Commit (cloud)**

```bash
git commit -m "feat(monitor): page and export station exception logs"
```

---

### Task 5: Web API + ExceptionLogDrawer

**Files:**
- Modify: `charging-cloud-web/src/api/monitor/stationMonitor.js`
- Create: `charging-cloud-web/src/views/monitor/components/ExceptionLogDrawer.vue`

**Interfaces:**
- Produces: `getStationExceptionLogs(stationId, params)`, `exportStationExceptionLogs(stationId, params)`
- Drawer `open(stationId, type)` where type is `fault`|`offline`

- [ ] **Step 1: API**

```js
export function getStationExceptionLogs(stationId, params) {
  return request({
    url: `/api/web/monitor/stations/${stationId}/exception-logs`,
    method: 'get',
    params
  })
}
export function exportStationExceptionLogs(stationId, params) {
  return request({
    url: `/api/web/monitor/stations/${stationId}/exception-logs/export`,
    method: 'post',
    params
  })
}
```

- [ ] **Step 2: Drawer component**

- `el-drawer` title 异常明细, size ~720px
- `el-tabs` v-model `activeType`: 故障明细=`fault`, 离线明细=`offline`
- Hint row + clickable 刷新
- `el-table` columns: 枪名称, 枪编号, 类型, 所属电站, 故障名称/离线原因 (label by tab), 故障码/告警码
- Pagination
- Footer: 关闭, 导出列表 (`type="primary"`)
- Methods: `open(stationId, type)`, `load()`, `refresh()`, `exportList()` — on export success `$message.success` with task tip like other export pages

- [ ] **Step 3: Commit (web)**

```bash
git commit -m "feat(monitor): add exception log drawer and APIs"
```

---

### Task 6: Status chips UI + wire drawer

**Files:**
- Modify: `charging-cloud-web/src/views/monitor/stationMonitor.vue`

**Interfaces:**
- Consumes: `ExceptionLogDrawer.open(stationId, type)`

- [ ] **Step 1: Chip template**

For each status chip:

```html
<div class="status-chip" ... @click="onTabChange(tab.value)">
  <div class="status-chip__top">
    <span class="status-chip__name">{{ tab.name }}</span>
    <el-tooltip v-if="tab.tone === 'occupy'" ...>
      <i class="el-icon-question status-chip__help" @click.stop />
    </el-tooltip>
    <span
      v-if="tab.tone === 'fault' || tab.tone === 'offline'"
      class="status-chip__detail"
      @click.stop="openExceptionDrawer(tab.tone)"
    >详情 &gt;</span>
  </div>
  <span class="status-chip__num">{{ tabCount(tab.countKey) }}</span>
  <i v-if="isTabActive(tab.value)" class="el-icon-check status-chip__check" />
</div>
```

Occupy tooltip content exactly from spec.

- [ ] **Step 2: Styles**

- Active: border-color `#07b161`, check badge bottom-right
- `.status-chip__detail { color: #07b161; font-size: 12px; }`
- Keep existing tone number colors

- [ ] **Step 3: Methods**

```js
openExceptionDrawer(tone) {
  if (!this.hasStation) {
    this.$message.warning('请先选择站点')
    return
  }
  const type = tone === 'offline' ? 'offline' : 'fault'
  this.$refs.exceptionDrawer.open(this.stationId, type)
}
```

Register component + `<exception-log-drawer ref="exceptionDrawer" />`.

- [ ] **Step 4: Manual check**

- Fuzzy: partial device/gun code returns matches
- 详情 opens drawer on correct tab; chip click still filters
- Refresh/export/close work

- [ ] **Step 5: Commit (web)**

```bash
git commit -m "feat(monitor): status chip detail entry and exception drawer wiring"
```

---

## Spec coverage check

| Spec item | Task |
|---|---|
| device/gun fuzzy | 1–2 |
| status chip UI + 详情 + occupy tip | 6 |
| drawer tabs/refresh/table/export | 5–6 |
| t_device_log fault/offline + station scope | 3–4 |
| API paths + permission | 4 |
| uniapp out of scope | — |

## Placeholder scan

None intentional; export Excel column titles use 原因/告警码 for both tabs.
