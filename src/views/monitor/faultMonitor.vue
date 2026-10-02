<template>
  <div class="app-container fault-monitor">
    <div class="filter-container">
      <el-date-picker
        v-model="dateRange"
        class="filter-item"
        style="width: 260px; margin-right: 20px;"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilter"
      />
      <el-select
        v-model="listQuery.merchantId"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        filterable
        clearable
        placeholder="归属商户"
        @change="handleMerchantChange"
      >
        <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select
        v-model="listQuery.stationId"
        class="filter-item"
        style="width: 220px; margin-right: 20px;"
        filterable
        clearable
        placeholder="请选择充电站"
        @change="handleFilter"
      >
        <el-option v-for="item in filteredStationList" :key="item.id" :label="item.networkName" :value="item.id" />
      </el-select>
      <el-button type="primary" size="mini" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button size="mini" class="filter-item" icon="el-icon-refresh" @click="handleReset">重置</el-button>
      <el-button size="mini" class="filter-item" icon="el-icon-tickets" @click="goWorkOrders">工单列表</el-button>
    </div>

    <div v-loading="loading">
      <div class="kpi-grid">
        <el-card
          v-for="item in kpiCards"
          :key="item.key"
          class="kpi-card"
          :class="{ 'kpi-card--link': item.link }"
          shadow="never"
          @click.native="goKpi(item)"
        >
          <div class="kpi-card__label">{{ item.label }}</div>
          <div class="kpi-card__value">
            <span>{{ item.value }}</span>
            <em v-if="item.unit">{{ item.unit }}</em>
          </div>
          <div class="kpi-card__hint">{{ item.hint }}</div>
          <div v-if="item.link" class="kpi-card__more">查看工单<i class="el-icon-arrow-right" /></div>
        </el-card>
      </div>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="24" :md="8">
          <el-card class="chart-card" shadow="never">
            <div slot="header" class="chart-card__head">
              <span>处理分布</span>
              <span class="chart-card__hint">按工单状态统计</span>
            </div>
            <div v-show="hasStatusData" ref="statusChart" class="chart-canvas chart-canvas--small" />
            <div v-show="!hasStatusData" class="chart-empty">暂无分布数据</div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="16">
          <el-card class="chart-card" shadow="never">
            <div slot="header" class="chart-card__head">
              <span>故障趋势</span>
              <span class="chart-card__hint">新建工单数 / 成功率</span>
            </div>
            <div v-show="hasTrendData" ref="trendChart" class="chart-canvas" />
            <div v-show="!hasTrendData" class="chart-empty">暂无趋势数据</div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="table-card" shadow="never">
        <div slot="header" class="chart-card__head">
          <span>每日明细</span>
          <span class="chart-card__hint">用于核对图表数据</span>
        </div>
        <el-table :data="dailyTrends" size="small" fit highlight-current-row>
          <el-table-column prop="day" label="日期" min-width="120" />
          <el-table-column prop="openedCount" label="新建工单" min-width="100" align="center" />
          <el-table-column prop="faultNoResponseCount" label="无响应订单" min-width="110" align="center" />
          <el-table-column prop="startedCount" label="启动订单" min-width="100" align="center" />
          <el-table-column prop="completedCount" label="成功订单" min-width="100" align="center" />
          <el-table-column prop="orderSuccessRate" label="成功率" min-width="100" align="center">
            <template slot-scope="scope">{{ percent(scope.row.orderSuccessRate) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getFaultKpi } from '@/api/monitor/faultMonitor'
import { getMerchant } from '@/api/merchant/merchant'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import { parseTime } from '@/utils/index'

const STATUS_MAP = {
  OPEN: { label: '待处理', type: 'warning' },
  IN_PROGRESS: { label: '处理中', type: 'primary' },
  CLOSED: { label: '已结案', type: 'success' },
  CANCELLED: { label: '已取消', type: 'info' }
}

export default {
  name: 'FaultMonitor',
  data() {
    return {
      loading: false,
      dateRange: [],
      listQuery: {
        start: '',
        end: '',
        merchantId: '',
        stationId: ''
      },
      merchantList: [],
      stationList: [],
      kpi: {},
      statusChart: null,
      trendChart: null
    }
  },
  computed: {
    filteredStationList() {
      if (!this.listQuery.merchantId) return this.stationList
      return this.stationList.filter(item => String(item.merchantId || item.merchant_id || '') === String(this.listQuery.merchantId))
    },
    dailyTrends() {
      return Array.isArray(this.kpi.dailyTrends) ? this.kpi.dailyTrends : []
    },
    hasStatusData() {
      const dist = this.kpi.statusDist || {}
      return Object.keys(dist).some(key => Number(dist[key]) > 0)
    },
    hasTrendData() {
      const keys = ['openedCount', 'startedCount', 'completedCount', 'faultNoResponseCount', 'orderSuccessRate']
      return this.dailyTrends.some(item => keys.some(key => Number(item[key]) > 0))
    },
    kpiCards() {
      return [
        { key: 'openedCount', label: '新增故障工单', value: this.num(this.kpi.openedCount), unit: '单', hint: '统计周期内新建且未取消', link: { statusIn: 'OPEN,IN_PROGRESS,CLOSED' }},
        { key: 'openCount', label: '待处理工单', value: this.num(this.kpi.openCount), unit: '单', hint: '待处理 + 处理中', link: { statusIn: 'OPEN,IN_PROGRESS' }},
        { key: 'rate', label: '故障发生率', value: this.percent(this.kpi.rate), unit: '', hint: `枪数 ${this.num(this.kpi.gunCount)} / 天数 ${this.num(this.kpi.dayCount)}` },
        { key: 'orderSuccessRate', label: '订单成功率', value: this.percent(this.kpi.orderSuccessRate), unit: '', hint: `无响应 ${this.num(this.kpi.faultNoResponseCount)} 单` },
        { key: 'avgCloseHours', label: '平均结案时长', value: this.decimal(this.kpi.avgCloseHours), unit: '小时', hint: '已结案工单平均处理时长', link: { status: 'CLOSED' }}
      ]
    }
  },
  created() {
    this.initDefaultDate()
    this.loadOptions()
    this.loadData()
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.disposeCharts()
  },
  methods: {
    initDefaultDate() {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      this.dateRange = [parseTime(start, '{y}-{m}-{d}'), parseTime(end, '{y}-{m}-{d}')]
      this.syncDateQuery()
    },
    loadOptions() {
      getMerchant().then(res => {
        this.merchantList = res && Number(res.code) === 200 ? (res.data || []) : []
      }).catch(() => {
        this.merchantList = []
      })
      getChargingStationList({}).then(res => {
        this.stationList = res && Number(res.code) === 200 ? (res.data || []) : []
      }).catch(() => {
        this.stationList = []
      })
    },
    syncDateQuery() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.listQuery.start = this.dateRange[0] + ' 00:00:00'
        this.listQuery.end = this.dateRange[1] + ' 23:59:59'
      } else {
        this.listQuery.start = ''
        this.listQuery.end = ''
      }
    },
    handleMerchantChange() {
      if (this.listQuery.stationId && !this.filteredStationList.some(item => String(item.id) === String(this.listQuery.stationId))) {
        this.listQuery.stationId = ''
      }
      this.handleFilter()
    },
    handleFilter() {
      this.syncDateQuery()
      this.loadData()
    },
    handleReset() {
      this.listQuery.merchantId = ''
      this.listQuery.stationId = ''
      this.initDefaultDate()
      this.loadData()
    },
    loadData() {
      this.loading = true
      getFaultKpi(this.cleanQuery(this.listQuery)).then(res => {
        this.loading = false
        if (res && Number(res.code) === 200) {
          this.kpi = res.data || {}
          this.$nextTick(() => this.renderCharts())
          return
        }
        this.kpi = {}
        this.$message.error((res && res.msg) || '故障看板加载失败')
      }).catch(() => {
        this.loading = false
      })
    },
    cleanQuery(query) {
      const result = {}
      Object.keys(query).forEach(key => {
        if (query[key] !== '' && query[key] !== null && query[key] !== undefined) {
          result[key] = query[key]
        }
      })
      return result
    },
    renderCharts() {
      this.renderStatusChart()
      this.renderTrendChart()
    },
    renderStatusChart() {
      if (!this.$refs.statusChart) return
      if (!this.hasStatusData) {
        if (this.statusChart) this.statusChart.clear()
        return
      }
      if (!this.statusChart) this.statusChart = echarts.init(this.$refs.statusChart, 'macarons')
      const dist = this.kpi.statusDist || {}
      const data = Object.keys(dist).map(key => ({
        name: this.statusLabel(key),
        value: Number(dist[key]) || 0
      })).filter(item => item.value > 0)
      this.statusChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 0, top: 'middle' },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['38%', '50%'],
          label: { formatter: '{b}\n{c}' },
          data
        }]
      }, true)
    },
    renderTrendChart() {
      if (!this.$refs.trendChart) return
      if (!this.hasTrendData) {
        if (this.trendChart) this.trendChart.clear()
        return
      }
      if (!this.trendChart) this.trendChart = echarts.init(this.$refs.trendChart, 'macarons')
      const days = this.dailyTrends.map(item => item.day)
      this.trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['新建工单', '成功率'] },
        grid: { left: 48, right: 56, top: 48, bottom: 36 },
        xAxis: { type: 'category', boundaryGap: false, data: days },
        yAxis: [
          { type: 'value', name: '工单数', minInterval: 1 },
          { type: 'value', name: '成功率', axisLabel: { formatter: '{value}%' }}
        ],
        series: [
          {
            name: '新建工单',
            type: 'line',
            smooth: true,
            data: this.dailyTrends.map(item => Number(item.openedCount) || 0)
          },
          {
            name: '成功率',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: this.dailyTrends.map(item => this.rateNumber(item.orderSuccessRate))
          }
        ]
      }, true)
    },
    resizeCharts() {
      if (this.statusChart) this.statusChart.resize()
      if (this.trendChart) this.trendChart.resize()
    },
    disposeCharts() {
      if (this.statusChart) {
        this.statusChart.dispose()
        this.statusChart = null
      }
      if (this.trendChart) {
        this.trendChart.dispose()
        this.trendChart = null
      }
    },
    goWorkOrders() {
      this.$router.push({
        path: '/device/faultWorkOrders',
        query: this.cleanQuery({
          start: this.listQuery.start,
          end: this.listQuery.end,
          merchantId: this.listQuery.merchantId,
          stationId: this.listQuery.stationId
        })
      })
    },
    goKpi(item) {
      if (!item || !item.link) return
      this.$router.push({
        path: '/device/faultWorkOrders',
        query: this.cleanQuery(Object.assign({
          start: this.listQuery.start,
          end: this.listQuery.end,
          merchantId: this.listQuery.merchantId,
          stationId: this.listQuery.stationId
        }, item.link))
      })
    },
    statusLabel(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].label : (status || '-')
    },
    num(v) {
      const n = Number(v)
      return Number.isNaN(n) ? 0 : n
    },
    decimal(v) {
      const n = Number(v)
      return Number.isNaN(n) ? '0.00' : n.toFixed(2)
    },
    rateNumber(v) {
      const n = Number(v)
      return Number.isNaN(n) ? 0 : Number((n * 100).toFixed(2))
    },
    percent(v) {
      return this.rateNumber(v).toFixed(2) + '%'
    }
  }
}
</script>

<style scoped>
.fault-monitor .filter-container {
  margin-bottom: 16px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.kpi-card {
  min-height: 118px;
}
.kpi-card--link {
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.kpi-card--link:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.kpi-card__more {
  margin-top: 8px;
  color: #409eff;
  font-size: 12px;
}
.kpi-card__label {
  color: #909399;
  font-size: 13px;
}
.kpi-card__value {
  margin-top: 12px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}
.kpi-card__value em {
  margin-left: 6px;
  font-size: 13px;
  color: #606266;
  font-style: normal;
}
.kpi-card__hint {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}
.chart-card,
.table-card {
  margin-bottom: 16px;
}
.chart-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #303133;
  font-weight: 600;
}
.chart-card__hint {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}
.chart-canvas {
  width: 100%;
  height: 320px;
}
.chart-canvas--small {
  height: 300px;
}
.chart-empty {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 13px;
}
</style>
