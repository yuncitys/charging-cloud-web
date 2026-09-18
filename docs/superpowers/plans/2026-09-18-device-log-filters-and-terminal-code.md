# Device Log Filters + Terminal Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add station / alarmCode / terminal-code filters on the Web device-log page, and show terminal number as `device_code + two-digit gun` (device-level logs stay bare `device_code`).

**Architecture:** Extend existing `/log/device` page + export query objects and MyBatis SQL; compute display `connectorCode` in SELECT; filter with the same CASE expression via LIKE. Web adds remote station select (reuse `getList` from `netWorkDotList.js`) and two inputs.

**Tech Stack:** Java/MyBatis, Vue 2 + Element UI 2.13

## Global Constraints

- Station param: `networkDotId` → `tdl.network_dot_id = #{networkDotId}`
- Log code filter: `alarm_code LIKE %#{alarmCode}%`
- Terminal filter: fuzzy LIKE on concatenated terminal expression
- Display/export terminal: `connector_code > 0` → `CONCAT(device_code, LPAD(connector_code,2,'0'))`; else `device_code`
- Do not expand device-level logs into per-gun rows
- Keep field name `connectorCode` on VO/export for list column compatibility

---

## File map

| File | Role |
|---|---|
| `DeviceLogPagination.java` | add `networkDotId`, `alarmCode`, `connectorCode` |
| `DeviceLogMapper.xml` | SELECT concat + WHERE filters on list/count/export |
| `upDownRecordList.vue` | filter UI + station remote select |

---

### Task 1: Backend pagination fields + mapper SQL

**Files:**
- Modify: `charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/DeviceLogPagination.java`
- Modify: `charging-cloud/sharecharge-biz/src/main/resources/mapper/DeviceLogMapper.xml`

**Interfaces:**
- Produces: `DeviceLogPagination.networkDotId: Integer`, `alarmCode: String`, `connectorCode: String`
- Produces: list/count/export return `connectorCode` as concatenated display string

- [ ] **Step 1: Extend `DeviceLogPagination`**

```java
private Integer networkDotId;
private String alarmCode;
/** 筛选用：模糊匹配拼接后的终端编号；列表返回值同字段为拼接结果 */
private String connectorCode;
```

Keep existing `deviceCode`, `createTimeStart`, `createTimeEnd`.

- [ ] **Step 2: Add reusable SQL fragments in `DeviceLogMapper.xml`**

```xml
<sql id="terminalCodeExpr">
    CASE
        WHEN IFNULL(tdl.connector_code, 0) &gt; 0 THEN CONCAT(tdl.device_code, LPAD(tdl.connector_code, 2, '0'))
        ELSE tdl.device_code
    END
</sql>

<sql id="deviceLogWhere">
    <where>
        <if test="deviceCode!=null and deviceCode!=''">
            and tdl.device_code = #{deviceCode}
        </if>
        <if test="networkDotId!=null">
            and tdl.network_dot_id = #{networkDotId}
        </if>
        <if test="alarmCode!=null and alarmCode!=''">
            and tdl.alarm_code LIKE CONCAT('%', #{alarmCode}, '%')
        </if>
        <if test="connectorCode!=null and connectorCode!=''">
            and (<include refid="terminalCodeExpr"/>) LIKE CONCAT('%', #{connectorCode}, '%')
        </if>
        <if test="createTimeStart!=null and createTimeStart!='' and createTimeEnd!='' and createTimeEnd!=null">
            and tdl.create_time between #{createTimeStart} and #{createTimeEnd}
        </if>
        <if test="createTimeEnd!=null and createTimeEnd!=''">
            and tdl.create_time<![CDATA[ >= ]]>#{createTimeStart}
        </if>
        <if test="createTimeStart!=null and createTimeStart!=''">
            and tdl.create_time<![CDATA[ <= ]]>#{createTimeEnd}
        </if>
        ${params.dataScope}
    </where>
</sql>
```

- [ ] **Step 3: Wire list / count / exportDeviceLog**

In each SELECT, replace `tdl.connector_code as connectorCode` with:

```xml
<include refid="terminalCodeExpr"/> as connectorCode,
```

Replace each duplicated `<where>...</where>` with:

```xml
<include refid="deviceLogWhere"/>
```

- [ ] **Step 4: Commit (cloud)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz/src/main/java/com/sharecharge/biz/entity/model/DeviceLogPagination.java \
  sharecharge-biz/src/main/resources/mapper/DeviceLogMapper.xml
git commit -m "$(cat <<'EOF'
feat(log): filter device logs by station, alarm code, terminal code

EOF
)"
```

---

### Task 2: Web device log filter UI

**Files:**
- Modify: `charging-cloud-web/src/views/log/upDownRecordList.vue`

**Interfaces:**
- Consumes: `getList` from `@/api/netWorkDot/netWorkDotList` (same as station monitor alias `getNetworkDotPage`)
- Consumes: page API already posting `listQuery` fields

- [ ] **Step 1: Extend filter template**

Above or beside existing device/time filters, add:

```vue
<el-select
  v-model="listQuery.networkDotId"
  class="filter-item"
  style="width: 220px; margin-right: 20px;"
  filterable
  remote
  clearable
  reserve-keyword
  placeholder="请选择充电站"
  :remote-method="searchStations"
  :loading="stationLoading"
  @visible-change="onStationVisible"
  @change="handleFilter"
  @clear="handleFilter"
>
  <el-option
    v-for="item in stationOptions"
    :key="item.id"
    :label="item.networkName"
    :value="item.id"
  />
</el-select>
<el-input
  v-model="listQuery.alarmCode"
  class="filter-item"
  style="width: 180px; margin-right: 20px;"
  placeholder="请输入日志编号"
  clearable
  @keyup.enter.native="handleFilter"
  @clear="handleFilter"
/>
<el-input
  v-model="listQuery.connectorCode"
  class="filter-item"
  style="width: 180px; margin-right: 20px;"
  placeholder="请输入终端编号"
  clearable
  @keyup.enter.native="handleFilter"
  @clear="handleFilter"
/>
```

Keep existing deviceCode + date range + query button + export.

- [ ] **Step 2: Script data + station search methods**

```js
import { getList as getNetworkDotPage } from '@/api/netWorkDot/netWorkDotList'
```

`listQuery` add:

```js
networkDotId: null,
alarmCode: '',
connectorCode: ''
```

Also add `stationOptions: []`, `stationLoading: false`.

Methods (align station monitor):

```js
searchStations(query) {
  this.stationLoading = true
  return getNetworkDotPage({
    page: 1,
    limit: 20,
    type: 1,
    ruleId: 2,
    networkName: (query || '').trim()
  }).then(res => {
    this.stationLoading = false
    if (res && Number(res.code) === 200) {
      this.stationOptions = Array.isArray(res.data) ? res.data : []
    }
  }).catch(() => {
    this.stationLoading = false
  })
},
onStationVisible(visible) {
  if (visible && !this.stationOptions.length) {
    this.searchStations('')
  }
}
```

- [ ] **Step 3: Manual check**

1. Open 设备日志：站点下拉可搜可选；选站后列表仅该站
2. 日志编号输入 `DEVICE` 可模糊命中 `DEVICE_FAULT` 等
3. 终端编号输入枪后缀或完整拼接码可模糊命中；`connector_code=0` 行显示为设备号
4. 导出带上新筛选条件；Excel 终端编号为拼接值

- [ ] **Step 4: Commit (web)**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/views/log/upDownRecordList.vue
git commit -m "$(cat <<'EOF'
feat(log): add station, alarm code and terminal filters on device log page

EOF
)"
```

---

## Spec coverage check

| Spec item | Task |
|---|---|
| networkDotId station filter | 1 + 2 |
| alarmCode LIKE | 1 + 2 |
| terminal LIKE on concat | 1 + 2 |
| display/export concat terminal | 1 |
| remote station select | 2 |
| no write-path / no expand | n/a (out of scope) |
