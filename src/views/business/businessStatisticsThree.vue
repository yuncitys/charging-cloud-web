<template>
  <div class="app-container">
    <div class="filter-container">
      <StatsTimeRangeFilter
        :time-type.sync="listQuery.timeType"
        :start.sync="listQuery.startTime"
        :end.sync="listQuery.endTime"
        @change="onTimeChange"
      />
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.merchantId" filterable clearable @change="handleFilter()"
        placeholder="请选择商户">
          <el-option
            v-for="item in merchantList"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
      </el-select>
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.chargingStationIds" multiple filterable clearable
        placeholder="请选择充电站">
          <el-option
            v-for="item in chargingStationList"
            :key="item.id"
            :label="item.networkName"
            :value="item.id">
          </el-option>
      </el-select>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
        查询
      </el-button>

      <div class="report-header">
        <div class="title-section">
          <span class="title">电站趋势</span>
          <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
        </div>
      </div>
      <div class="summary-cards">
        <div class="summary-card summary-card--service-count">
          <div class="summary-label">订单总数(笔)</div>
          <div class="summary-value summary-count">{{ formatNumber(summaryTotal.totalChargeNumber, 0) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--duration">
          <div class="summary-label">总充电时长(小时)</div>
          <div class="summary-value summary-duration">{{ formatChargeDurationHours(summaryTotal.totalChargeDurations) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--amount">
          <div class="summary-label">应收金额(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.actualPrice) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--servicefee">
          <div class="summary-label">实收金额(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.realityPayMoney) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--electric">
          <div class="summary-label">电费(元)</div>
          <div class="summary-value summary-money">{{ formatNumber(summaryTotal.electricityPrice, 4) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--service-price">
          <div class="summary-label">服务费(元)</div>
          <div class="summary-value summary-money">{{ formatNumber(summaryTotal.servicePrice, 4) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--power">
          <div class="summary-label">总使用电量(度)</div>
          <div class="summary-value summary-energy">{{ formatNumber(summaryTotal.totalPower, 4) }}</div>
          <div class="summary-card-icon" />
        </div>
      </div>

      <div class="report-header">
        <div class="title-section">
          <span class="title">明细列表</span>
          <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
        </div>
        <DownChargingStationSingleStatistics :queryData="singleQuery" />
      </div>
      <el-table v-loading="listLoading" :data="chargingStationSingleList" class="stats-nested-table" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{ scope.$index + (singlePage.page - 1) * singlePage.limit + 1 }}</span></template>
      	</el-table-column>
        <el-table-column label="统计维度" align="center">
          <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="归属运营商" prop="operatorName" align="center" sortable :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="充电概况" align="center">
          <el-table-column label="充电次数(笔)" prop="totalChargeNumber" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="充电时长(小时)" prop="totalChargeDurations" sortable align="center" :show-overflow-tooltip="isPc">
            <template slot-scope="scope">
              <span>{{ formatChargeDurationHours(scope.row.totalChargeDurations) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="原价费用" align="center">
          <el-table-column label="应收金额(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="实收金额(元)" prop="realityPayMoney" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="电费(元)" prop="electricityPrice" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="服务费(元)" prop="servicePrice" align="center" sortable :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="优惠抵扣" align="center">
          <el-table-column label="运营商优惠券抵扣(元)" prop="operatorCouponDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
          <el-table-column label="运营商电站活动抵扣(元)" prop="operatorStationActivityDiscountAmount" align="center" sortable min-width="170" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台优惠券抵扣(元)" prop="platformCouponDiscountAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台电站活动抵扣(元)" prop="platformStationActivityDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="用户实付" align="center">
          <el-table-column label="用户实付电费(元)" prop="userActualElectricityAmount" align="center" sortable min-width="140" :show-overflow-tooltip="isPc" />
          <el-table-column label="用户实付服务费(元)" prop="userActualServiceAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="singlePage.page" :page-sizes="[10,20,30,50]" :page-size="singlePage.limit"
      		:total="chargingStationSingleTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <div class="report-header">
        <div class="title-section">
          <span class="title">金额明细</span>
          <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
        </div>
        <DownChargingStationFundStatistics :queryData="fundQuery" />
      </div>
      <el-table v-loading="listLoading2" :data="chargingStationFundList" class="stats-nested-table" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox2">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{ scope.$index + (fundPage.page - 1) * fundPage.limit + 1 }}</span></template>
      	</el-table-column>
        <el-table-column label="统计维度" align="center">
          <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="归属运营商" prop="operatorName" align="center" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="充电概况" align="center">
          <el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable min-width="110" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="原价费用" align="center">
          <el-table-column label="原价电费(元)" prop="electricityPrice" align="center" sortable min-width="110" :show-overflow-tooltip="isPc" />
          <el-table-column label="原价服务费(元)" prop="servicePrice" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
          <el-table-column label="充电总收益(元)" prop="totalIncome" align="center" sortable min-width="130" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="支付方式" align="center">
          <el-table-column label="余额支付(元)" prop="balancePaymentAmount" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
          <el-table-column label="微信支付(元)" prop="wechatPaymentAmount" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
          <el-table-column label="微信支付分(元)" prop="wechatScorePaymentAmount" align="center" sortable min-width="130" :show-overflow-tooltip="isPc" />
          <el-table-column label="刷卡支付(元)" prop="swipeCardPaymentAmount" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
          <el-table-column label="投币支付(元)" prop="insertCoinsPaymentAmount" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
          <el-table-column label="支付宝支付(元)" prop="alipayPaymentAmount" align="center" sortable min-width="130" :show-overflow-tooltip="isPc" />
          <el-table-column label="月卡支付(元)" prop="monthCardPaymentAmount" align="center" sortable min-width="120" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="优惠抵扣" align="center">
          <el-table-column label="运营商优惠券抵扣(元)" prop="operatorCouponDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
          <el-table-column label="运营商电站活动抵扣(元)" prop="operatorStationActivityDiscountAmount" align="center" sortable min-width="170" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台优惠券抵扣(元)" prop="platformCouponDiscountAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台电站活动抵扣(元)" prop="platformStationActivityDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="用户实付" align="center">
          <el-table-column label="用户实付电费(元)" prop="userActualElectricityAmount" align="center" sortable min-width="140" :show-overflow-tooltip="isPc" />
          <el-table-column label="用户实付服务费(元)" prop="userActualServiceAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
          <el-table-column label="用户实付合计(元)" prop="userActualPayAmount" align="center" sortable min-width="140" :show-overflow-tooltip="isPc" />
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="fundPage.page" :page-sizes="[10,20,30,50]" :page-size="fundPage.limit"
      		:total="chargingStationFundTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange2" @current-change="handleCurrentChange2" />
      </div>

      <div class="report-header">
        <div class="title-section">
          <span class="title">汇总列表</span>
          <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
        </div>
        <DownChargingStationStatistics :queryData="sectionQuery" />
      </div>
      <el-table v-loading="listLoading1" :data="chargingStationSectionList" class="stats-nested-table" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox1">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{ scope.$index + (sectionPage.page - 1) * sectionPage.limit + 1 }}</span></template>
      	</el-table-column>
        <el-table-column label="统计维度" align="center">
          <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc" />
          <el-table-column label="归属运营商" prop="operatorName" align="center" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="充电概况" align="center">
          <el-table-column label="充电次数(笔)" prop="totalChargeNumber" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="充电时长(小时)" prop="totalChargeDurations" sortable align="center" :show-overflow-tooltip="isPc">
            <template slot-scope="scope">
              <span>{{ formatChargeDurationHours(scope.row.totalChargeDurations) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="原价费用" align="center">
          <el-table-column label="应收金额(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="实收金额(元)" prop="realityPayMoney" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="电费(元)" prop="electricityPrice" align="center" sortable :show-overflow-tooltip="isPc" />
          <el-table-column label="服务费(元)" prop="servicePrice" align="center" sortable :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="优惠抵扣" align="center">
          <el-table-column label="运营商优惠券抵扣(元)" prop="operatorCouponDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
          <el-table-column label="运营商电站活动抵扣(元)" prop="operatorStationActivityDiscountAmount" align="center" sortable min-width="170" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台优惠券抵扣(元)" prop="platformCouponDiscountAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
          <el-table-column label="平台电站活动抵扣(元)" prop="platformStationActivityDiscountAmount" align="center" sortable min-width="160" :show-overflow-tooltip="isPc" />
        </el-table-column>
        <el-table-column label="用户实付" align="center">
          <el-table-column label="用户实付电费(元)" prop="userActualElectricityAmount" align="center" sortable min-width="140" :show-overflow-tooltip="isPc" />
          <el-table-column label="用户实付服务费(元)" prop="userActualServiceAmount" align="center" sortable min-width="150" :show-overflow-tooltip="isPc" />
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="sectionPage.page" :page-sizes="[10,20,30,50]" :page-size="sectionPage.limit"
      		:total="chargingStationSectionTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange1" @current-change="handleCurrentChange1" />
      </div>
    </div>
  </div>
</template>

<script>
  import DownChargingStationStatistics from './components/DownChargingStationStatistics'
  import DownChargingStationFundStatistics from './components/DownChargingStationFundStatistics'
  import DownChargingStationSingleStatistics from './components/DownChargingStationSingleStatistics'
  import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
  import StatsTimeRangeFilter, { defaultRangeForTimeType } from './components/StatsTimeRangeFilter.vue'
  import { caliberForPage } from './statsCaliberCopy.js'
  import './styles/statsNestedTable.css'
  import {
    chargingStationSection,
    chargingStationSectionSummary,
    chargingStationSingle,
    chargingStationFund
  } from '@/api/business/businessStatistics.js'
  import { getMerchant } from '@/api/merchant/merchant.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'

  export default {
    name: 'chargingStationStatistics',
    components: {
      DownChargingStationStatistics,
      DownChargingStationFundStatistics,
      DownChargingStationSingleStatistics,
      StatsCaliberDialog,
      StatsTimeRangeFilter
    },
    data() {
      const range = defaultRangeForTimeType(3)
      return {
        summaryTotal: {
          totalChargeNumber: 0,
          totalChargeDurations: 0,
          actualPrice: 0,
          realityPayMoney: 0,
          electricityPrice: 0,
          servicePrice: 0,
          totalPower: 0
        },
        chargingStationSectionTotal: 0,
        chargingStationSingleTotal: 0,
        chargingStationFundTotal: 0,
        listLoading: false,
        listLoading1: false,
        listLoading2: false,
        chargingStationSingleList: [],
        chargingStationSectionList: [],
        chargingStationFundList: [],
        singlePage: { page: 1, limit: 10 },
        fundPage: { page: 1, limit: 10 },
        sectionPage: { page: 1, limit: 10 },
        listQuery: {
        	timeType: 3,
        	startTime: range[0],
        	endTime: range[1],
        	merchantId: '',
        	chargingStationIds: '',
        },
        caliber: caliberForPage('station'),
        merchantList: [],
        chargingStationList: [],
        isPc: true,
      }
    },
    computed: {
      filterQuery() {
        const q = Object.assign({}, this.listQuery)
        if (Array.isArray(q.chargingStationIds)) {
          q.chargingStationIds = q.chargingStationIds.join(',')
        }
        return q
      },
      singleQuery() {
        return Object.assign({}, this.filterQuery, this.singlePage)
      },
      fundQuery() {
        return Object.assign({}, this.filterQuery, this.fundPage)
      },
      sectionQuery() {
        return Object.assign({}, this.filterQuery, this.sectionPage)
      }
    },
    methods: {
      getChargingStationSectionSummary() {
        chargingStationSectionSummary(this.filterQuery).then(res => {
          if (res.code == 200 && res.data) {
            this.summaryTotal = {
              actualPrice: Number(res.data.actualPrice) || 0,
              realityPayMoney: Number(res.data.realityPayMoney) || 0,
              electricityPrice: Number(res.data.electricityPrice) || 0,
              servicePrice: Number(res.data.servicePrice) || 0,
              totalPower: Number(res.data.totalPower) || 0,
              totalChargeNumber: Number(res.data.totalChargeNumber) || 0,
              totalChargeDurations: Number(res.data.totalChargeDurations) || 0
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
              totalChargeDurations: 0
            }
          }
        }).catch(() => {
          this.$message.error('合计统计失败')
          this.summaryTotal = {
            actualPrice: 0,
            realityPayMoney: 0,
            electricityPrice: 0,
            servicePrice: 0,
            totalPower: 0,
            totalChargeNumber: 0,
            totalChargeDurations: 0
          }
        })
      },
      /**
       * 金额格式化，保留两位小数并添加千分位分隔
       * @param {number|string} value 原始数值
       * @returns {string}
       */
      formatMoney(value) {
        return this.formatNumber(value, 2)
      },
      /**
       * 接口充电时长为分钟时，展示为小时（两位小数）
       */
      formatChargeDurationHours(minutes) {
        if (minutes === null || minutes === undefined || minutes === '') return '-'
        const num = Number(minutes)
        if (Number.isNaN(num)) return '-'
        return this.formatNumber(num / 60, 2)
      },
      /**
       * 通用数字格式化，可控制小数位并添加千分位分隔
       * @param {number|string} value 原始数值
       * @param {number} fractionDigits 小数位，默认 0
       * @returns {string}
       */
      formatNumber(value, fractionDigits = 0) {
        if (value === null || value === undefined || value === '') return '-'
        const num = Number(value)
        if (Number.isNaN(num)) return value
        const fixed = fractionDigits >= 0 ? num.toFixed(fractionDigits) : String(num)
        const parts = fixed.split('.')
        const intWithComma = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts[1] ? `${intWithComma}.${parts[1]}` : intWithComma
      },
      onTimeChange() {
        this.handleFilter()
      },
      getMerchantList() {
        getMerchant().then(res => {
          if (res.code == 200) {
            this.merchantList = res.data || []
          } else {
            this.$message.error(res.msg)
          }
        }).catch(() => {
          this.merchantList = []
        })
      },
      getChargingStationList() {
      	getChargingStationList(0).then(res => {
      		if (res.code == 200) {
      			this.chargingStationList = res.data;
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      getChargingStationSingleList() {
        this.listLoading = true
        chargingStationSingle(this.singleQuery).then(res => {
          this.listLoading = false
          if (res.code == 200) {
            this.chargingStationSingleTotal = res.count
            this.chargingStationSingleList = res.data
          } else {
            this.$message.error(res.msg)
          }
        }).catch(() => {
          this.listLoading = false
          this.$message.error('明细列表加载失败')
        })
      },
      getChargingStationSectionList() {
        this.listLoading1 = true
        chargingStationSection(this.sectionQuery).then(res => {
          this.listLoading1 = false
          if (res.code == 200) {
            this.chargingStationSectionTotal = res.count
            this.chargingStationSectionList = res.data
          } else {
            this.$message.error(res.msg)
          }
        }).catch(() => {
          this.listLoading1 = false
          this.$message.error('汇总列表加载失败')
        })
      },
      getChargingStationFundList() {
        this.listLoading2 = true
        chargingStationFund(this.fundQuery).then(res => {
          this.listLoading2 = false
          if (res.code == 200) {
            this.chargingStationFundTotal = res.count
            this.chargingStationFundList = res.data
          } else {
            this.$message.error(res.msg)
          }
        }).catch(() => {
          this.listLoading2 = false
          this.$message.error('金额明细加载失败')
        })
      },
      handleFilter() {
        this.singlePage.page = 1
        this.fundPage.page = 1
        this.sectionPage.page = 1
        this.getChargingStationSingleList()
        this.getChargingStationFundList()
        this.getChargingStationSectionList()
        this.getChargingStationSectionSummary()
      },
      handleSizeChange(val) {
        this.singlePage.limit = val
        this.singlePage.page = 1
      	this.getChargingStationSingleList()
      },
      handleCurrentChange(val) {
        this.singlePage.page = val
      	this.getChargingStationSingleList()
      },
      handleSizeChange1(val) {
        this.sectionPage.limit = val
        this.sectionPage.page = 1
      	this.getChargingStationSectionList()
      },
      handleCurrentChange1(val) {
        this.sectionPage.page = val
      	this.getChargingStationSectionList()
      },
      handleSizeChange2(val) {
        this.fundPage.limit = val
        this.fundPage.page = 1
      	this.getChargingStationFundList()
      },
      handleCurrentChange2(val) {
        this.fundPage.page = val
      	this.getChargingStationFundList()
      },
    },
    created() {
      this.getMerchantList()
      this.getChargingStationList()
      this.getChargingStationSingleList()
      this.getChargingStationFundList()
      this.getChargingStationSectionList()
      this.getChargingStationSectionSummary()
    },
  }


</script>

<style>
/* 父容器，用于布局 */
.report-header {
  display: flex;
  justify-content: space-between; /* 标题部分和按钮部分两端对齐 */
  align-items: center;
  padding: 10px;
}

/* 标题和提示图标 */
.title-section {
  display: flex;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
}

.export-button {
  background-color: #409EFF;
  color: white;
}

/* 顶部统计卡片统一样式 */
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 24px;
  margin: 12px 0 24px;
}

.summary-card {
  position: relative;
  flex: 0 0 260px;
  height: 94px;
  border-radius: 15px;
  padding: 14px 18px;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  color: #ffffff;
  overflow: hidden;
}

.summary-card-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 80px;
  height: 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.summary-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.summary-card--service-count {
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
}

.summary-card--amount {
  background: linear-gradient(135deg, #409EFF, #2d8cf0);
}

.summary-card--power {
  background: linear-gradient(135deg, #00c9ff, #92fe9d);
}

.summary-card--duration {
  background: linear-gradient(135deg, #a855f7, #6366f1);
}

.summary-card--electric {
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.summary-card--servicefee {
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
}

.summary-card--placeholder {
  background: linear-gradient(135deg, #f97373, #fb7185);
}

.summary-card--service-price {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.summary-card--service-price .summary-card-icon {
  background-image: url(../../assets/home-panel/order-panel.png);
}

.summary-card--service-count .summary-card-icon {
  background-image: url(../../assets/home-panel/user-panel.png);
}

.summary-card--amount .summary-card-icon {
  background-image: url(../../assets/home-panel/trade-panel.png);
}

.summary-card--power .summary-card-icon {
  background-image: url(../../assets/home-panel/device-panel.png);
}

.summary-card--duration .summary-card-icon {
  background-image: url(../../assets/home-panel/order-panel.png);
}

.summary-card--electric .summary-card-icon {
  background-image: url(../../assets/home-panel/trade-panel.png);
}

.summary-card--servicefee .summary-card-icon {
  background-image: url(../../assets/home-panel/order-panel.png);
}

.summary-card--placeholder .summary-card-icon {
  background-image: url(../../assets/home-panel/device-panel.png);
}
</style>
