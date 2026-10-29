<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.summaryDate"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        type="date"
        placeholder="统计日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        :clearable="false"
        @change="handleFilter"
      />
      <el-select
        v-model="listQuery.merchantId"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        filterable
        clearable
        placeholder="请选择商户"
        @change="handleFilter"
      >
        <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select
        v-model="listQuery.stationId"
        class="filter-item"
        style="width: 240px; margin-right: 20px;"
        filterable
        clearable
        placeholder="请选择充电站"
        @change="handleFilter"
      >
        <el-option v-for="item in chargingStationList" :key="item.id" :label="item.networkName" :value="item.id" />
      </el-select>
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <div class="report-header">
      <div class="title-section">
        <span class="title">小时统计</span>
        <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
      </div>
      <DownStationChargeHourStatistics :query-data="listQuery" />
    </div>

    <StatsSummaryCards :items="summaryCards" />

    <div ref="chart" class="hour-chart" />

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      style="width: 100%;"
      align="center"
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column label="时段" prop="hourLabel" align="center" min-width="120" />
      <el-table-column label="电量(度)" prop="totalDegree" align="center" min-width="110" />
      <el-table-column label="充电时长(h)" align="center" min-width="120">
        <template slot-scope="scope">{{ ((scope.row.totalDuration || 0) / 60).toFixed(2) }}</template>
      </el-table-column>
      <el-table-column label="充电次数" prop="totalOrderCount" align="center" min-width="100" />
      <el-table-column label="电费(元)" prop="totalStandardChargeFee" align="center" min-width="110" />
      <el-table-column label="服务费(元)" prop="totalStandardServiceFee" align="center" min-width="110" />
      <el-table-column label="订单总金额(元)" prop="orderTotalAmount" align="center" min-width="130" />
      <el-table-column label="用户实付合计(元)" prop="userActualPayAmount" align="center" min-width="140" />
      <el-table-column label="运营商优惠券抵扣(元)" prop="operatorCouponDiscountAmount" align="center" min-width="170" />
      <el-table-column label="运营商电站活动抵扣(元)" prop="operatorStationActivityDiscountAmount" align="center" min-width="180" />
      <el-table-column label="平台优惠券抵扣(元)" prop="platformCouponDiscountAmount" align="center" min-width="160" />
      <el-table-column label="平台电站活动抵扣(元)" prop="platformStationActivityDiscountAmount" align="center" min-width="170" />
      <el-table-column label="用户实付电费(元)" prop="userActualElectricityAmount" align="center" min-width="140" />
      <el-table-column label="用户实付服务费(元)" prop="userActualServiceAmount" align="center" min-width="150" />
    </el-table>
  </div>
</template>

<script>
import echarts from 'echarts'
import { stationChargeHourStatisticsList } from '@/api/business/businessStatistics.js'
import { getMerchant } from '@/api/merchant/merchant.js'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList.js'
import StatsSummaryCards from './components/StatsSummaryCards.vue'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import DownStationChargeHourStatistics from './components/DownStationChargeHourStatistics.vue'
import { caliberForPage, buildOrgSummaryCardItems, sumHourListToSummary } from './statsCaliberCopy.js'
import { formatNumber } from './orgStatisticsMetrics.js'

function today() {
  const d = new Date()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// 汇总行需要累加的列（prop -> 小数位）
const SUM_COLUMNS = {
  totalDegree: 4,
  totalOrderCount: 0,
  totalStandardChargeFee: 4,
  totalStandardServiceFee: 4,
  orderTotalAmount: 2,
  userActualPayAmount: 2,
  operatorCouponDiscountAmount: 2,
  operatorStationActivityDiscountAmount: 2,
  platformCouponDiscountAmount: 2,
  platformStationActivityDiscountAmount: 2,
  userActualElectricityAmount: 2,
  userActualServiceAmount: 2
}

export default {
  name: 'stationChargeHourStatistics',
  components: { StatsSummaryCards, StatsCaliberDialog, DownStationChargeHourStatistics },
  data() {
    return {
      listQuery: {
        summaryDate: today(),
        stationId: '',
        merchantId: ''
      },
      merchantList: [],
      chargingStationList: [],
      list: [],
      listLoading: false,
      chart: null,
      caliber: caliberForPage('hour')
    }
  },
  computed: {
    summaryCards() {
      return buildOrgSummaryCardItems(sumHourListToSummary(this.list), formatNumber)
    }
  },
  created() {
    this.getMerchantList()
    this.getStationList()
    this.getList()
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    getMerchantList() {
      getMerchant().then(res => {
        this.merchantList = res.code == 200 ? (res.data || []) : []
      }).catch(() => { this.merchantList = [] })
    },
    getStationList() {
      getChargingStationList(0).then(res => {
        this.chargingStationList = res.code == 200 ? (res.data || []) : []
      }).catch(() => { this.chargingStationList = [] })
    },
    getList() {
      if (!this.listQuery.summaryDate) {
        this.$message.warning('请选择统计日期')
        return
      }
      this.listLoading = true
      stationChargeHourStatisticsList(this.listQuery).then(res => {
        this.listLoading = false
        if (res.code == 200) {
          this.list = res.data || []
          this.renderChart()
        } else {
          this.$message.error(res.msg)
        }
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() {
      this.getList()
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.chart) return
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['电量(度)', '充电次数'] },
        grid: { left: 40, right: 40, top: 40, bottom: 30 },
        xAxis: { type: 'category', data: this.list.map(i => i.hourOfDay + '时') },
        yAxis: [
          { type: 'value', name: '电量(度)' },
          { type: 'value', name: '次数', minInterval: 1 }
        ],
        series: [
          { name: '电量(度)', type: 'bar', data: this.list.map(i => Number(i.totalDegree) || 0) },
          { name: '充电次数', type: 'line', yAxisIndex: 1, data: this.list.map(i => Number(i.totalOrderCount) || 0) }
        ]
      })
    },
    getSummaries({ columns, data }) {
      return columns.map((col, index) => {
        if (index === 0) return '合计'
        if (col.label === '充电时长(h)') {
          const mins = data.reduce((s, r) => s + (Number(r.totalDuration) || 0), 0)
          return (mins / 60).toFixed(2)
        }
        const digits = SUM_COLUMNS[col.property]
        if (digits === undefined) return ''
        const sum = data.reduce((s, r) => s + (Number(r[col.property]) || 0), 0)
        return sum.toFixed(digits)
      })
    }
  }
}
</script>

<style scoped>
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}
.title-section {
  display: flex;
  align-items: center;
}
.title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
}
.hour-chart {
  width: 100%;
  height: 320px;
  margin-bottom: 16px;
  background: #fff;
}
</style>
