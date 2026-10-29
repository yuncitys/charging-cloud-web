<template>
  <div class="app-container business-overview">
    <div class="filter-container overview-filter">
      <el-select
        v-model="listQuery.stationId"
        class="filter-item station-select"
        filterable
        clearable
        placeholder="全部电站"
      >
        <el-option label="全部电站" value="" />
        <el-option
          v-for="item in chargingStationList"
          :key="item.id"
          :label="item.networkName"
          :value="item.id"
        />
      </el-select>

      <el-radio-group v-model="activePreset" class="filter-item preset-group" @change="applyPreset">
        <el-radio-button label="7d">前7天</el-radio-button>
        <el-radio-button label="30d">前30天</el-radio-button>
        <el-radio-button label="12m">前12个月</el-radio-button>
      </el-radio-group>

      <el-date-picker
        v-model="customRange"
        class="filter-item custom-range"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        unlink-panels
        @change="applyCustomRange"
      />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <section class="overview-panel">
      <div class="panel-header">
        <div class="title-section">
          <span class="title">核心指标</span>
          <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
        </div>
        <span class="data-tip"><i class="el-icon-warning-outline" /> 数据来自日汇总同步表（T+1），非实时</span>
      </div>

      <el-tabs v-model="activeMetric" class="metric-tabs">
        <el-tab-pane
          v-for="metric in metrics"
          :key="metric.key"
          :label="metric.label"
          :name="metric.key"
        />
      </el-tabs>
      <div ref="trendChart" v-loading="trendLoading" class="trend-chart" />
    </section>

    <section class="overview-panel station-panel">
      <div class="panel-header">
        <span class="title">电站数据</span>
        <DownBusinessOverviewStations :query-data="exportQuery" />
      </div>

      <el-table
        v-loading="listLoading"
        :data="stationRows"
        element-loading-text="拼命加载中......"
        style="width: 100%;"
      >
        <el-table-column type="index" width="70" label="序号" align="center">
          <template slot-scope="scope">{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</template>
        </el-table-column>
        <el-table-column prop="stationName" label="电站信息" min-width="220" show-overflow-tooltip />
        <el-table-column prop="totalDegree" label="总充电量(度)" min-width="140" align="right" sortable>
          <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 4) }}</template>
        </el-table-column>
        <el-table-column prop="totalOrderCount" label="总充电次数" min-width="130" align="right" sortable>
          <template slot-scope="scope">{{ formatNumber(scope.row.totalOrderCount, 0) }}</template>
        </el-table-column>
        <el-table-column prop="orderTotalAmount" label="总充电金额(元)" min-width="150" align="right" sortable>
          <template slot-scope="scope">{{ formatNumber(scope.row.orderTotalAmount, 2) }}</template>
        </el-table-column>
        <el-table-column prop="totalStandardServiceFee" label="总充电服务费(元)" min-width="170" align="right" sortable>
          <template slot-scope="scope">{{ formatNumber(scope.row.totalStandardServiceFee, 2) }}</template>
        </el-table-column>
        <el-table-column prop="gunDailyAvgDegree" label="枪日均电量(度)" min-width="150" align="right" sortable>
          <template slot-scope="scope">{{ formatGunDailyAvg(scope.row.gunDailyAvgDegree) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList.js'
import {
  businessOverviewCoreTrend,
  businessOverviewStationList
} from '@/api/business/businessOverview.js'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import DownBusinessOverviewStations from './components/DownBusinessOverviewStations.vue'
import { caliberForPage } from './statsCaliberCopy.js'
import { buildOverviewRange } from './businessOverviewRange.js'

const METRICS = [
  { key: 'totalDegreeSeries', label: '总充电量', unit: '度', color: '#409EFF' },
  { key: 'totalOrderCountSeries', label: '总充电次数', unit: '次', color: '#67C23A' },
  { key: 'orderTotalAmountSeries', label: '总充电金额', unit: '元', color: '#E6A23C' },
  { key: 'totalStandardServiceFeeSeries', label: '总充电服务费', unit: '元', color: '#F56C6C' }
]

export default {
  name: 'BusinessOverview',
  components: { StatsCaliberDialog, DownBusinessOverviewStations },
  data() {
    const range = buildOverviewRange('7d')
    return {
      activePreset: '7d',
      activeMetric: METRICS[0].key,
      metrics: METRICS,
      customRange: [],
      chargingStationList: [],
      listQuery: Object.assign({
        stationId: '',
        page: 1,
        limit: 10
      }, range),
      trend: { dates: [] },
      stationRows: [],
      total: 0,
      trendLoading: false,
      listLoading: false,
      chart: null,
      caliber: caliberForPage('overview')
    }
  },
  computed: {
    exportQuery() {
      return Object.assign({}, this.listQuery)
    },
    currentMetric() {
      return this.metrics.find(item => item.key === this.activeMetric) || this.metrics[0]
    }
  },
  watch: {
    activeMetric() {
      this.renderChart()
    }
  },
  created() {
    this.loadStationOptions()
    this.fetchData()
  },
  mounted() {
    this.chart = echarts.init(this.$refs.trendChart)
    window.addEventListener('resize', this.resizeChart)
    this.renderChart()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    applyPreset(preset) {
      Object.assign(this.listQuery, buildOverviewRange(preset))
      this.customRange = []
      this.handleFilter()
    },
    applyCustomRange(range) {
      if (!range || range.length !== 2) return
      this.activePreset = ''
      this.listQuery.timeType = 3
      this.listQuery.startDate = range[0]
      this.listQuery.endDate = range[1]
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    fetchData() {
      this.fetchTrend()
      this.fetchStationRows()
    },
    loadStationOptions() {
      getChargingStationList(0).then(res => {
        this.chargingStationList = res.code === 200 ? (res.data || []) : []
      }).catch(() => {
        this.chargingStationList = []
      })
    },
    fetchTrend() {
      this.trendLoading = true
      businessOverviewCoreTrend(this.listQuery).then(res => {
        if (res.code === 200) {
          this.trend = res.data || { dates: [] }
          this.renderChart()
        } else {
          this.$message.error(res.msg || '核心指标查询失败')
        }
      }).catch(() => {
        this.trend = { dates: [] }
      }).finally(() => {
        this.trendLoading = false
      })
    },
    fetchStationRows() {
      this.listLoading = true
      businessOverviewStationList(this.listQuery).then(res => {
        if (res.code === 200) {
          this.stationRows = res.data || []
          this.total = Number(res.count) || 0
        } else {
          this.$message.error(res.msg || '电站数据查询失败')
        }
      }).catch(() => {
        this.stationRows = []
        this.total = 0
      }).finally(() => {
        this.listLoading = false
      })
    },
    renderChart() {
      if (!this.chart) return
      const metric = this.currentMetric
      const values = this.trend[metric.key] || []
      this.chart.setOption({
        color: [metric.color],
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            const point = params[0]
            return `${point.axisValue}<br/>${point.marker}${metric.label}：${point.value} ${metric.unit}`
          }
        },
        grid: { left: 28, right: 28, top: 30, bottom: 30, containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.trend.dates || [],
          axisLine: { lineStyle: { color: '#DCDFE6' }},
          axisLabel: { color: '#606266' }
        },
        yAxis: {
          type: 'value',
          name: metric.unit,
          minInterval: metric.key === 'totalOrderCountSeries' ? 1 : 0,
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: '#EBEEF5' }}
        },
        series: [{
          name: metric.label,
          type: 'line',
          smooth: true,
          showSymbol: values.length <= 31,
          symbolSize: 7,
          lineStyle: { width: 3 },
          areaStyle: { opacity: 0.08 },
          data: values
        }]
      }, true)
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    formatNumber(value, digits) {
      const number = Number(value)
      if (value === null || value === undefined || value === '' || Number.isNaN(number)) return '--'
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      })
    },
    formatGunDailyAvg(value) {
      return value === null || value === undefined ? '--' : this.formatNumber(value, 4)
    },
    handleSizeChange(limit) {
      this.listQuery.limit = limit
      this.listQuery.page = 1
      this.fetchStationRows()
    },
    handleCurrentChange(page) {
      this.listQuery.page = page
      this.fetchStationRows()
    }
  }
}
</script>

<style scoped>
.business-overview {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.overview-filter,
.overview-panel {
  background: #fff;
  border-radius: 8px;
  padding: 18px 20px;
}
.overview-filter {
  margin-bottom: 16px;
}
.station-select {
  width: 260px;
  margin-right: 16px;
}
.preset-group,
.custom-range {
  margin-right: 16px;
}
.custom-range {
  width: 360px;
}
.overview-panel {
  margin-bottom: 16px;
}
.panel-header,
.title-section {
  display: flex;
  align-items: center;
}
.panel-header {
  justify-content: space-between;
  min-height: 40px;
}
.title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}
.data-tip {
  color: #909399;
  font-size: 13px;
}
.data-tip i {
  color: #E6A23C;
}
.metric-tabs {
  margin-top: 4px;
}
.trend-chart {
  width: 100%;
  height: 360px;
}
.station-panel {
  padding-bottom: 4px;
}
</style>
