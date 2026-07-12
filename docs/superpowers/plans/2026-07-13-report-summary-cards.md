# Report Summary Cards Full-Total Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为充电趋势 / 电站趋势 / 充电汇总三个页面提供独立 `/summary` 全量合计接口，前端卡片改为读统一字段，不再对当前页列表求和。

**Architecture:** 后端新增统一 `ReportSummaryVo` + 三条全量 `SUM/COUNT` SQL + Controller 路由；前端新增 3 个 API 方法，Two/Three/Five 在查询与首屏并行请求 summary，翻页不重拉。设计见 [`docs/superpowers/specs/2026-07-13-report-summary-cards-design.md`](../specs/2026-07-13-report-summary-cards-design.md)。

**Tech Stack:** Java / Spring Boot / MyBatis / Vue 2 / Element UI

---

## File Map

### charging-cloud

| 路径 | 职责 |
|------|------|
| `sharecharge-biz/.../vo/ReportSummaryVo.java` | **新建** 统一合计 VO |
| `sharecharge-biz/.../mapper/HomeStatisticsMapper.java` | **修改** 声明 3 个 summary 方法 |
| `sharecharge-biz/.../resources/mapper/HomeStatisticsMapper.xml` | **修改** 3 条 summary SQL |
| `sharecharge-biz/.../service/HomeStatisticsService.java` | **修改** 声明 3 个 service 方法 |
| `sharecharge-biz/.../service/impl/HomeStatisticsServiceImpl.java` | **修改** 实现（空结果补 0） |
| `sharecharge-web/.../controller/HomeStatisticsController.java` | **修改** 3 个 `/summary` 路由 |

### charging-cloud-web

| 路径 | 职责 |
|------|------|
| `src/api/business/businessStatistics.js` | **修改** 3 个 summary 请求 |
| `src/views/business/businessStatisticsTwo.vue` | **修改** 接 summary + 统一字段 |
| `src/views/business/businessStatisticsThree.vue` | **修改** 接 summary |
| `src/views/business/businessStatisticsFive.vue` | **修改** 接 summary + 实收卡片 |

**不做：** Four、Six、占桩费真实统计。

---

### Task 1: 新建 `ReportSummaryVo`

**Files:**
- Create: `/Users/guanzilan/DevelopProject/charging-cloud/sharecharge-biz/src/main/java/com/sharecharge/biz/vo/ReportSummaryVo.java`

- [ ] **Step 1: 创建 VO**

```java
package com.sharecharge.biz.vo;

import lombok.Data;

/**
 * 业务统计页 summary-cards 全量合计（统一字段）
 */
@Data
public class ReportSummaryVo {
    /** 应收（元） */
    private Double actualPrice;
    /** 实收（元） */
    private Double realityPayMoney;
    /** 电费（元） */
    private Double electricityPrice;
    /** 服务费（元） */
    private Double servicePrice;
    /** 电量（度） */
    private Double totalPower;
    /** 订单数 */
    private Long totalChargeNumber;
    /** 时长（分钟） */
    private Long totalChargeDurations;
    /** 商户实收（元），充电趋势用 */
    private Double merchantReceiptTotal;
    /** 设备总数，电站趋势用 */
    private Long totalDevice;
}
```

- [ ] **Step 2: Commit（charging-cloud）**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz/src/main/java/com/sharecharge/biz/vo/ReportSummaryVo.java
git commit -m "$(cat <<'EOF'
feat(stats): add ReportSummaryVo for report summary cards

EOF
)"
```

---

### Task 2: 充电趋势 summary（Two）

**Files:**
- Modify: `sharecharge-biz/.../mapper/HomeStatisticsMapper.java`
- Modify: `sharecharge-biz/src/main/resources/mapper/HomeStatisticsMapper.xml`（在 `chargingTrendStatisticsCount` 之后插入）
- Modify: `sharecharge-biz/.../service/HomeStatisticsService.java`
- Modify: `sharecharge-biz/.../service/impl/HomeStatisticsServiceImpl.java`
- Modify: `sharecharge-web/.../controller/HomeStatisticsController.java`（紧挨 `chargingTrend/list`）

- [ ] **Step 1: Mapper 接口增加方法**

在 `HomeStatisticsMapper.java` 的 `chargingTrendStatisticsByCurve` 附近增加：

```java
ReportSummaryVo chargingTrendStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination);
```

- [ ] **Step 2: 编写 XML（日/月/年同源，无 GROUP BY / LIMIT）**

在 `HomeStatisticsMapper.xml` 中 `chargingTrendStatisticsCount` 的 `</select>` 之后插入。别名必须用统一字段：

```xml
<select id="chargingTrendStatisticsSummary" resultType="com.sharecharge.biz.vo.ReportSummaryVo" parameterType="com.sharecharge.biz.entity.model.TrendStatisticsPagination">
    <choose>
        <when test="timeType == 3">
            SELECT
                ROUND(IFNULL(SUM(b.order_total_amount), 0), 2) AS actualPrice,
                ROUND(IFNULL(SUM(b.user_actual_pay_amount), 0), 2) AS realityPayMoney,
                ROUND(IFNULL(SUM(b.total_standard_charge_fee), 0), 4) AS electricityPrice,
                ROUND(IFNULL(SUM(b.total_standard_service_fee), 0), 4) AS servicePrice,
                ROUND(IFNULL(SUM(b.total_degree), 0), 4) AS totalPower,
                CAST(IFNULL(SUM(b.total_order_count), 0) AS SIGNED) AS totalChargeNumber,
                CAST(ROUND(IFNULL(SUM(b.total_duration), 0)) AS SIGNED) AS totalChargeDurations,
                ROUND(IFNULL(SUM(b.merchant_actual_income), 0), 2) AS merchantReceiptTotal
            FROM t_statistics_merchant_charge_day_bill b
            <where>
                DATE_FORMAT(b.summary_date, '%Y-%m-%d') <![CDATA[ >= ]]> #{startTime}
                AND DATE_FORMAT(b.summary_date, '%Y-%m-%d') <![CDATA[ <= ]]> #{endTime}
                <if test="merchantId != null and merchantId != ''">
                    AND b.merchant_id = #{merchantId}
                </if>
                ${params.dataScope}
            </where>
        </when>
        <when test="timeType == 2">
            SELECT
                ROUND(IFNULL(SUM(b.order_total_amount), 0), 2) AS actualPrice,
                ROUND(IFNULL(SUM(b.user_actual_pay_amount), 0), 2) AS realityPayMoney,
                ROUND(IFNULL(SUM(b.total_standard_charge_fee), 0), 4) AS electricityPrice,
                ROUND(IFNULL(SUM(b.total_standard_service_fee), 0), 4) AS servicePrice,
                ROUND(IFNULL(SUM(b.total_degree), 0), 4) AS totalPower,
                CAST(IFNULL(SUM(b.total_order_count), 0) AS SIGNED) AS totalChargeNumber,
                CAST(ROUND(IFNULL(SUM(b.total_duration), 0)) AS SIGNED) AS totalChargeDurations,
                ROUND(IFNULL(SUM(b.merchant_actual_income), 0), 2) AS merchantReceiptTotal
            FROM t_statistics_merchant_charge_month_bill b
            <where>
                DATE_FORMAT(b.summary_date, '%Y-%m') <![CDATA[ >= ]]> #{startTime}
                AND DATE_FORMAT(b.summary_date, '%Y-%m') <![CDATA[ <= ]]> #{endTime}
                <if test="merchantId != null and merchantId != ''">
                    AND b.merchant_id = #{merchantId}
                </if>
                ${params.dataScope}
            </where>
        </when>
        <otherwise>
            SELECT
                ROUND(IFNULL(SUM(b.order_total_amount), 0), 2) AS actualPrice,
                ROUND(IFNULL(SUM(b.user_actual_pay_amount), 0), 2) AS realityPayMoney,
                ROUND(IFNULL(SUM(b.total_standard_charge_fee), 0), 4) AS electricityPrice,
                ROUND(IFNULL(SUM(b.total_standard_service_fee), 0), 4) AS servicePrice,
                ROUND(IFNULL(SUM(b.total_degree), 0), 4) AS totalPower,
                CAST(IFNULL(SUM(b.total_order_count), 0) AS SIGNED) AS totalChargeNumber,
                CAST(ROUND(IFNULL(SUM(b.total_duration), 0)) AS SIGNED) AS totalChargeDurations,
                ROUND(IFNULL(SUM(b.merchant_actual_income), 0), 2) AS merchantReceiptTotal
            FROM t_statistics_merchant_charge_month_bill b
            <where>
                DATE_FORMAT(b.summary_date, '%Y') >= #{startTime} AND DATE_FORMAT(b.summary_date, '%Y') <![CDATA[ <= ]]> #{endTime}
                <if test="merchantId!=null and merchantId!=''">
                    AND b.merchant_id = #{merchantId}
                </if>
                ${params.dataScope}
            </where>
        </otherwise>
    </choose>
</select>
```

- [ ] **Step 3: Service 接口 + 实现**

`HomeStatisticsService.java` 增加：

```java
ResultUtil chargingTrendStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination);
```

`HomeStatisticsServiceImpl.java` 增加（放在 `chargingTrendStatisticsByCurve` 附近）：

```java
@Override
public ResultUtil chargingTrendStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination) {
    ReportSummaryVo data = homeStatisticsMapper.chargingTrendStatisticsSummary(trendStatisticsPagination);
    if (data == null) {
        data = new ReportSummaryVo();
        data.setActualPrice(0D);
        data.setRealityPayMoney(0D);
        data.setElectricityPrice(0D);
        data.setServicePrice(0D);
        data.setTotalPower(0D);
        data.setTotalChargeNumber(0L);
        data.setTotalChargeDurations(0L);
        data.setMerchantReceiptTotal(0D);
    }
    ResultUtil resultUtil = new ResultUtil();
    resultUtil.setCode(200);
    resultUtil.setData(data);
    resultUtil.setMsg("统计成功");
    return resultUtil;
}
```

记得 import `ReportSummaryVo`。

- [ ] **Step 4: Controller 路由**

在 `chargingTrend/list` 方法后增加（`@DataScope` 与 list 一致）：

```java
@RequestMapping("/reports/chargingTrend/summary")
@DataScope(alias = "b", merchantColumn = true, adminColumn = false)
@ApiOperation(value = "充电趋势合计")
public ResultUtil chargingTrendStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination) {
    try{
        if (trendStatisticsPagination.getTimeType() == null){
            return ResultUtil.error("时间范围不能为空");
        }
        if (null == trendStatisticsPagination.getStartTime() || trendStatisticsPagination.getStartTime().isEmpty()){
            return ResultUtil.error("开始时间参数异常");
        }
        if (null == trendStatisticsPagination.getEndTime() || trendStatisticsPagination.getEndTime().isEmpty()){
            return ResultUtil.error("结束时间参数异常");
        }
        return homeStatisticsService.chargingTrendStatisticsSummary(trendStatisticsPagination);
    }catch (Exception e){
        log.error("充电趋势合计失败：{}",e.getMessage());
        return ResultUtil.error("充电趋势合计失败");
    }
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud
git add sharecharge-biz/src/main/java/com/sharecharge/biz/mapper/HomeStatisticsMapper.java \
  sharecharge-biz/src/main/resources/mapper/HomeStatisticsMapper.xml \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/HomeStatisticsService.java \
  sharecharge-biz/src/main/java/com/sharecharge/biz/service/impl/HomeStatisticsServiceImpl.java \
  sharecharge-web/sharecharge-web-controller/src/main/java/com/sharecharge/web/controller/HomeStatisticsController.java
git commit -m "$(cat <<'EOF'
feat(stats): add chargingTrend summary API

EOF
)"
```

---

### Task 3: 电站趋势 summary（Three）

**Files:**
- Modify: 同上 Mapper / Service / Controller / XML

- [ ] **Step 1: Mapper 方法**

```java
ReportSummaryVo chargingStationStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination);
```

- [ ] **Step 2: XML — 外包一层对 Section 全量结果 SUM（去掉 LIMIT，语义=列表行相加）**

将现有 `chargingStationStatisticsBySection` 整段 SELECT 复制为子查询（**删掉**末尾 `LIMIT`），外包：

```xml
<select id="chargingStationStatisticsSummary" resultType="com.sharecharge.biz.vo.ReportSummaryVo" parameterType="com.sharecharge.biz.entity.model.TrendStatisticsPagination">
    SELECT
        IFNULL(SUM(sec.actualPrice), 0) AS actualPrice,
        IFNULL(SUM(sec.realityPayMoney), 0) AS realityPayMoney,
        IFNULL(SUM(sec.electricityPrice), 0) AS electricityPrice,
        IFNULL(SUM(sec.servicePrice), 0) AS servicePrice,
        IFNULL(SUM(sec.totalPower), 0) AS totalPower,
        IFNULL(SUM(sec.totalChargeNumber), 0) AS totalChargeNumber,
        IFNULL(SUM(sec.totalChargeDurations), 0) AS totalChargeDurations,
        IFNULL(SUM(sec.totalDevice), 0) AS totalDevice
    FROM (
        SELECT
            tnd.id,
            tnd.network_name as networkName,
            tnd.operator_name as operatorName,
            CONCAT_WS('至',#{startTime},#{endTime}) AS datetime,
            IFNULL(tnd.totalDevice,0) AS totalDevice,
            IFNULL(SUM(toi.total_power),0) AS totalPower,
            IFNULL(SUM(toi.electricity_price),0)  AS electricityPrice,
            IFNULL(SUM(toi.service_price),0)  AS servicePrice,
            IFNULL(SUM(toi.actual_price),0)  AS actualPrice,
            IFNULL(SUM(toi.reality_pay_money),0)  AS realityPayMoney,
            IFNULL(SUM(toi.actual_duration),0)  as totalChargeDurations,
            COUNT(toi.id) as totalChargeNumber
        FROM (
            SELECT
            tnd.id,
            tnd.network_name,
            tum.name as operator_name,
            td.totalDevice
            FROM t_network_dot tnd
            LEFT JOIN t_user_merchant tum on tum.id = tnd.merchant_id
            LEFT JOIN
            (
                SELECT
                td.network_dot_id,
                COUNT(td.id) as totalDevice
                FROM t_device td
                WHERE td.is_delete = 0
                GROUP BY td.network_dot_id
            ) td on td.network_dot_id = tnd.id
            WHERE tnd.is_delete = 0
            <if test="chargingStationIds!=null and chargingStationIds!=''">
                <foreach collection="chargingStationIds.split(',')" item="chargingStationId" open="and tnd.id in(" separator="," close=")">
                    #{chargingStationId}
                </foreach>
            </if>
            <if test="merchantId!=null and merchantId!=''">
                and tnd.merchant_id = #{merchantId}
            </if>
            ${params.dataScope}
        ) as tnd
        LEFT JOIN (
            SELECT
                toi.network_dot_id,
                toi.id,
                toi.end_time,
                toi.actual_price,
                toi.reality_pay_money,
                toi.electricity_price,
                toi.service_price,
                toi.order_type,
                toi.total_power,
                toi.actual_duration
            FROM t_order_info toi
            WHERE toi.is_delete = 0
            <if test="timeType == 1">
                and DATE_FORMAT(toi.end_time, '%Y') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y') <![CDATA[ <= ]]> #{endTime}
            </if>
            <if test="timeType == 2">
                and DATE_FORMAT(toi.end_time, '%Y-%m') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y-%m') <![CDATA[ <= ]]> #{endTime}
            </if>
            <if test="timeType == 3">
                and DATE_FORMAT(toi.end_time, '%Y-%m-%d') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y-%m-%d') <![CDATA[ <= ]]> #{endTime}
            </if>
            <if test="chargingStationIds!=null and chargingStationIds!=''">
                <foreach collection="chargingStationIds.split(',')" item="chargingStationId" open="and toi.network_dot_id in(" separator="," close=")">
                    #{chargingStationId}
                </foreach>
            </if>
        ) toi on toi.network_dot_id = tnd.id
        GROUP BY id,networkName,totalDevice
    ) sec
</select>
```

- [ ] **Step 3: Service + Controller**

Service 方法名：`chargingStationStatisticsSummary`，空结果补 0（含 `totalDevice`）。

Controller：

```java
@RequestMapping("/reports/chargingStationSection/summary")
@DataScope(alias = "tnd",merchantColumn = true, stationColumn = true, adminColumn = false)
@ApiOperation(value = "充电站点汇总合计")
public ResultUtil chargingStationStatisticsSummary(TrendStatisticsPagination trendStatisticsPagination) {
    // 与 chargingStationSection 相同的 timeType/startTime/endTime 校验
    return homeStatisticsService.chargingStationStatisticsSummary(trendStatisticsPagination);
}
```

（校验逻辑完整复制 `chargingStationStatisticsBySection` 的 try/catch。）

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(stats): add chargingStationSection summary API

EOF
)"
```

---

### Task 4: 充电汇总 summary（Five）

**Files:**
- Modify: Mapper / XML / Service / Controller

- [ ] **Step 1: Mapper 方法**

```java
ReportSummaryVo chargingUserChargeStatisticsSummary(TradingStatisticsPagination tradingStatisticsPagination);
```

- [ ] **Step 2: XML（订单全量 SUM，关联用户以支持筛选与 dataScope）**

```xml
<select id="chargingUserChargeStatisticsSummary" resultType="com.sharecharge.biz.vo.ReportSummaryVo" parameterType="com.sharecharge.biz.entity.model.TradingStatisticsPagination">
    SELECT
        IFNULL(SUM(toi.actual_price), 0) AS actualPrice,
        IFNULL(SUM(toi.reality_pay_money), 0) AS realityPayMoney,
        IFNULL(SUM(toi.electricity_price), 0) AS electricityPrice,
        IFNULL(SUM(toi.service_price), 0) AS servicePrice,
        IFNULL(SUM(toi.total_power), 0) AS totalPower,
        IFNULL(COUNT(toi.id), 0) AS totalChargeNumber,
        IFNULL(SUM(toi.actual_duration), 0) AS totalChargeDurations
    FROM t_order_info toi
    INNER JOIN t_app_user tau ON toi.user_id = tau.id AND tau.is_delete = 0
    WHERE toi.is_delete = 0
    <if test="timeType == 1">
        AND DATE_FORMAT(toi.end_time, '%Y') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y') <![CDATA[ <= ]]> #{endTime}
    </if>
    <if test="timeType == 2">
        AND DATE_FORMAT(toi.end_time, '%Y-%m') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y-%m') <![CDATA[ <= ]]> #{endTime}
    </if>
    <if test="timeType == 3">
        AND DATE_FORMAT(toi.end_time, '%Y-%m-%d') >= #{startTime} and DATE_FORMAT(toi.end_time, '%Y-%m-%d') <![CDATA[ <= ]]> #{endTime}
    </if>
    <if test="userCode!=null and userCode!=''">
        AND tau.user_code like concat('%',#{userCode},'%')
    </if>
    <if test="phoneNumber!=null and phoneNumber!=''">
        AND tau.phone_number like concat('%',#{phoneNumber},'%')
    </if>
    ${params.dataScope}
</select>
```

- [ ] **Step 3: Service + Controller**

```java
@RequestMapping("/reports/chargingUserChargeSection/summary")
@DataScope(alias = "tau")
@ApiOperation(value = "用户充电汇总合计")
public ResultUtil chargingUserChargeStatisticsSummary(TradingStatisticsPagination tradingStatisticsPagination) {
    // 与 chargingUserChargeSection 相同校验
    return homeStatisticsService.chargingUserChargeStatisticsSummary(tradingStatisticsPagination);
}
```

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(stats): add chargingUserChargeSection summary API

EOF
)"
```

---

### Task 5: 前端 API 方法

**Files:**
- Modify: `/Users/guanzilan/DevelopProject/charging-cloud-web/src/api/business/businessStatistics.js`

- [ ] **Step 1: 增加三个方法**（复用现有 `transformRequest` 写法）

在对应 list/section 方法旁增加：

```javascript
// 充电趋势合计
export function chargingTrendSummary(data) {
  return request({
    url: '/api/web/reports/chargingTrend/summary',
    method: 'post',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  })
}

// 充电站汇总合计
export function chargingStationSectionSummary(data) {
  return request({
    url: '/api/web/reports/chargingStationSection/summary',
    method: 'post',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  })
}

// 用户充电汇总合计
export function chargingUserChargeSectionSummary(data) {
  return request({
    url: '/api/web/reports/chargingUserChargeSection/summary',
    method: 'post',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  })
}
```

- [ ] **Step 2: Commit（charging-cloud-web）**

```bash
cd /Users/guanzilan/DevelopProject/charging-cloud-web
git add src/api/business/businessStatistics.js
git commit -m "$(cat <<'EOF'
feat(stats): add report summary API clients

EOF
)"
```

---

### Task 6: 改造 `businessStatisticsTwo.vue`

**Files:**
- Modify: `src/views/business/businessStatisticsTwo.vue`

- [ ] **Step 1: import `chargingTrendSummary`**

- [ ] **Step 2: 重置 `summaryTotal` 为统一字段**

```javascript
summaryTotal: {
  actualPrice: 0,
  realityPayMoney: 0,
  electricityPrice: 0,
  servicePrice: 0,
  totalPower: 0,
  totalChargeNumber: 0,
  totalChargeDurations: 0,
  merchantReceiptTotal: 0
}
```

- [ ] **Step 3: 模板卡片改绑定**

| 卡片 | 绑定 |
|------|------|
| 充电次数 | `summaryTotal.totalChargeNumber` |
| 充电时长合计(h) | `formatNumber((summaryTotal.totalChargeDurations \|\| 0) / 60, 2)` |
| 订单总金额 | `formatMoney(summaryTotal.actualPrice)` |
| 用户实付合计 | `formatMoney(summaryTotal.realityPayMoney)` |
| 商户实收合计 | `formatMoney(summaryTotal.merchantReceiptTotal)` |
| 总使用电量 | `formatNumber(summaryTotal.totalPower, 4)` |
| 总电费 | `formatNumber(summaryTotal.electricityPrice, 4)` |
| 总服务费 | `formatNumber(summaryTotal.servicePrice, 4)` |

- [ ] **Step 4: 新增 `getChargingTrendSummary`，删除/停用 `updateSummaryTotalFromTrendList` 对卡片的赋值**

```javascript
getChargingTrendSummary() {
  const listQuery = JSON.parse(JSON.stringify(this.listQuery))
  chargingTrendSummary(listQuery).then(res => {
    if (res.code == 200 && res.data) {
      this.summaryTotal = {
        actualPrice: Number(res.data.actualPrice) || 0,
        realityPayMoney: Number(res.data.realityPayMoney) || 0,
        electricityPrice: Number(res.data.electricityPrice) || 0,
        servicePrice: Number(res.data.servicePrice) || 0,
        totalPower: Number(res.data.totalPower) || 0,
        totalChargeNumber: Number(res.data.totalChargeNumber) || 0,
        totalChargeDurations: Number(res.data.totalChargeDurations) || 0,
        merchantReceiptTotal: Number(res.data.merchantReceiptTotal) || 0
      }
    } else {
      this.$message.error(res.msg || '合计统计失败')
      this.summaryTotal = {
        actualPrice: 0,
        realityPayMoney: 0,
        electricityPrice: 0,
        servicePrice: 0,
        totalPower: 0,
        totalChargeNumber: 0,
        totalChargeDurations: 0,
        merchantReceiptTotal: 0
      }
    }
  }).catch(() => {
    this.$message.error('合计统计失败')
  })
}
```

在 `handleFilter` 与 `created/mounted` 中调用 `getChargingTrendSummary()`；**`getChargingTrendList` 成功回调里不再调用** `updateSummaryTotalFromTrendList`；翻页方法只调 list。

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(stats): wire charging trend page to summary API

EOF
)"
```

---

### Task 7: 改造 `businessStatisticsThree.vue`

**Files:**
- Modify: `src/views/business/businessStatisticsThree.vue`

- [ ] **Step 1: import `chargingStationSectionSummary`**

- [ ] **Step 2: `summaryTotal` 已基本统一，确保含核心七字段 + `totalDevice`**

- [ ] **Step 3: 新增 `getChargingStationSectionSummary`，从 `getChargingStationSectionList` 中移除 `updateSummaryTotalFromSectionList`**

赋值逻辑同 Task 6（字段含 `totalDevice`）。`handleFilter` / 首屏并行调用；翻页只调 section list。

- [ ] **Step 4: 时长卡片继续用现有 `formatChargeDurationHours(summaryTotal.totalChargeDurations)`（输入为分钟）**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(stats): wire station section page to summary API

EOF
)"
```

---

### Task 8: 改造 `businessStatisticsFive.vue`

**Files:**
- Modify: `src/views/business/businessStatisticsFive.vue`

- [ ] **Step 1: import `chargingUserChargeSectionSummary`**

- [ ] **Step 2: 重置 `summaryTotal`**

```javascript
summaryTotal: {
  actualPrice: 0,
  realityPayMoney: 0,
  electricityPrice: 0,
  servicePrice: 0,
  totalPower: 0,
  totalChargeNumber: 0,
  totalChargeDurations: 0,
  placeholderPrice: 0
}
```

- [ ] **Step 3: 模板卡片改绑定 + 增加实收**

| 卡片文案（建议） | 绑定 |
|------------------|------|
| 总服务次数(次) / 订单数 | `totalChargeNumber` |
| 总消费金额 / 应收 | `actualPrice` |
| 实收金额(元) **新增** | `realityPayMoney` |
| 总使用电量 | `totalPower` |
| 总充电时长(分) | `totalChargeDurations` |
| 总电费 | `electricityPrice` |
| 总服务费 | `servicePrice` |
| 总占桩费 | `placeholderPrice`（恒 0） |

- [ ] **Step 4: `getChargingUserChargeSectionSummary`；从 section list 回调移除页内累加**

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(stats): wire user charge page to summary API

EOF
)"
```

---

### Task 9: 联调验收

- [ ] **Step 1: 启动后端 web 服务，确认三个 summary 接口 200**

用管理端登录态，对三个路径 POST 与对应 list 相同筛选参数，检查 `data` 含核心七字段。

- [ ] **Step 2: 打开 Two / Three / Five 页面按 spec Testing 表验收**

| # | 场景 | 期望 |
|---|------|------|
| T1 | 默认查询 | 卡片为全量合计 |
| T2 | 翻页 | 卡片不变 |
| T3 | 改筛选再查 | 卡片更新 |
| T4 | 无数据区间 | 核心字段 0 |
| T5 | Two 时长 | 接口分钟，卡片小时 |
| T6 | Five 实收有值；占桩费 0 | |
| T7 | 权限账号 | 与列表范围一致 |

- [ ] **Step 3: 若有问题，修完后补 commit，不要 amend 已推送提交**

---

## Spec Coverage Check

| Spec 项 | Task |
|---------|------|
| R1 独立 `/summary` | 2–4 |
| R2 Two/Three/Five | 2–4, 6–8 |
| R3 不做 Four/Six | File Map / Out of scope |
| R4 占桩费占位 | Task 8 |
| R5 统一字段 | Task 1 + SQL aliases |
| R6 时长分钟 + Two ÷60 | Task 2 SQL + Task 6 |
| R7 merchantReceiptTotal | Task 2 + 6 |
| R8 同筛选/权限 | Controller `@DataScope` |
| R9 翻页不重拉 | Task 6–8 |
| Testing T1–T7 | Task 9 |

## Placeholder / Consistency Check

- 无 TBD；方法名统一 `*StatisticsSummary` / 前端 `*Summary`
- VO 字段与 spec 七字段 + 两可选字段一致
- 三个接口路径与 spec API 表一致
