<template>
  <div class="app-container fleet-stat-page">
    <div class="filter-container">
      <div class="search-row">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 260px;"
          :clearable="false"
          @change="search"
        />
        <el-select v-model="query.fleetId" placeholder="全部车队" clearable filterable style="width: 200px;" @change="search">
          <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-select v-model="query.orgId" placeholder="全部机构" clearable filterable style="width: 220px;" @change="search">
          <el-option v-for="o in orgOptions" :key="o.id" :label="o.name" :value="o.id" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button plain @click="resetQuery">重置</el-button>
      </div>
    </div>

    <!-- 汇总卡 -->
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">充电电量</div>
          <div class="stat-card__value">{{ formatNumber(summary.totalDegree, 2) }}<span class="unit">度</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">充电金额（实付）</div>
          <div class="stat-card__value">￥{{ formatNumber(summary.actualPayAmount, 2) }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">订单量</div>
          <div class="stat-card__value">{{ summary.totalOrderCount || 0 }}<span class="unit">单</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card__label">单均金额</div>
          <div class="stat-card__value">￥{{ avgAmount }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 趋势 -->
    <el-card shadow="never" class="stat-card-block">
      <div slot="header" class="card-head">
        <span>充电趋势</span>
        <el-radio-group v-model="trendMetric" size="mini" @change="renderTrend">
          <el-radio-button label="totalDegree">电量</el-radio-button>
          <el-radio-button label="actualPayAmount">金额</el-radio-button>
          <el-radio-button label="totalOrderCount">订单量</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="trendChart" class="trend-chart" />
    </el-card>

    <!-- 明细 -->
    <el-tabs v-model="activeTab" class="stat-tabs">
      <el-tab-pane label="车队汇总" name="fleet">
        <el-table v-loading="loading" :data="fleetRows" size="small" border>
          <el-table-column prop="fleetName" label="车队" min-width="140">
            <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
          </el-table-column>
          <el-table-column prop="orgName" label="所属机构" min-width="160" show-overflow-tooltip />
          <el-table-column prop="totalDegree" label="电量(度)" width="110" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalOrderCount" label="订单量" width="90" align="right" />
          <el-table-column prop="actualPayAmount" label="实付金额(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualPayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="enterprisePayAmount" label="企业支付(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.enterprisePayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="actualElectricityAmount" label="电费(元)" width="110" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualElectricityAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="actualServiceAmount" label="服务费(元)" width="110" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualServiceAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalDuration" label="时长(分钟)" width="110" align="right" />
          <el-table-column prop="driverCount" label="司机数" width="90" align="right" />
          <el-table-column prop="carCount" label="车辆数" width="90" align="right" />
          <el-table-column label="单均" width="100" align="right">
            <template slot-scope="scope">{{ avgOf(scope.row) }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            :current-page="query.page"
            :page-size="query.limit"
            :page-sizes="[10, 20, 50]"
            :total="total"
            background
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="车辆明细" name="car">
        <el-table v-loading="carLoading" :data="carRows" size="small" border>
          <el-table-column prop="plateNumber" label="车牌号" width="150" />
          <el-table-column prop="vinCode" label="车架号VIN" min-width="170" show-overflow-tooltip />
          <el-table-column prop="fleetName" label="车队" width="140">
            <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
          </el-table-column>
          <el-table-column prop="totalDegree" label="电量(度)" width="110" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalOrderCount" label="订单量" width="90" align="right" />
          <el-table-column prop="actualPayAmount" label="实付金额(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualPayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="enterprisePayAmount" label="企业支付(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.enterprisePayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalDuration" label="时长(分钟)" width="110" align="right" />
        </el-table>
        <div class="pagination-container">
          <el-pagination
            :current-page="carQuery.page"
            :page-size="carQuery.limit"
            :page-sizes="[10, 20, 50]"
            :total="carTotal"
            background
            layout="total, sizes, prev, pager, next"
            @size-change="handleCarSizeChange"
            @current-change="handleCarCurrentChange"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="车辆 TOP10" name="rank">
        <div class="rank-bar">
          <el-radio-group v-model="rankMetric" size="mini" @change="loadRank">
            <el-radio-button label="totalDegree">按电量</el-radio-button>
            <el-radio-button label="actualPayAmount">按金额</el-radio-button>
          </el-radio-group>
        </div>
        <el-table v-loading="rankLoading" :data="rankRows" size="small" border>
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column prop="plateNumber" label="车牌号" width="150" />
          <el-table-column prop="fleetName" label="车队" width="150">
            <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
          </el-table-column>
          <el-table-column prop="totalDegree" label="电量(度)" width="120" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 2) }}</template>
          </el-table-column>
          <el-table-column prop="actualPayAmount" label="实付金额(元)" width="140" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualPayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalOrderCount" label="订单量" width="100" align="right" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import echarts from 'echarts'
import { getOrganizationOptions } from '@/api/organization/organization'
import { getFleetPage } from '@/api/enterpriseFleet/fleet'
import { getFleetCarStatPage, getFleetCarStatRank, getFleetStatPage, getFleetStatTrend } from '@/api/enterpriseFleet/stat'

function defaultRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 29)
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return [fmt(start), fmt(end)]
}

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致，keep-alive include 才能命中
  name: 'chargingFleetStat',
  data() {
    return {
      dateRange: defaultRange(),
      query: { page: 1, limit: 10, fleetId: null, orgId: null },
      carQuery: { page: 1, limit: 10, fleetId: null, orgId: null },
      fleetOptions: [],
      orgOptions: [],
      fleetRows: [],
      total: 0,
      carRows: [],
      carTotal: 0,
      rankRows: [],
      loading: false,
      carLoading: false,
      rankLoading: false,
      activeTab: 'fleet',
      trendMetric: 'totalDegree',
      rankMetric: 'totalDegree',
      summary: {},
      trendData: [],
      chart: null
    }
  },
  computed: {
    avgAmount() {
      const count = Number(this.summary.totalOrderCount || 0)
      if (!count) return '0.00'
      return (Number(this.summary.actualPayAmount || 0) / count).toFixed(2)
    }
  },
  created() {
    this.loadOptions()
  },
  mounted() {
    this.$nextTick(() => this.initChart())
    this.loadAll()
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
    hasPerm(permission) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(permission))
    },
    dateParams() {
      const range = this.dateRange || defaultRange()
      return { startDate: range[0], endDate: range[1] }
    },
    loadOptions() {
      getFleetPage({ page: 1, limit: 200 }).then(res => {
        if (res.code === 200) this.fleetOptions = res.data || []
      }).catch(() => {})
      getOrganizationOptions({}).then(res => {
        if (res.code === 200) this.orgOptions = res.data || []
      }).catch(() => {})
    },
    loadAll() {
      this.loadFleet()
      this.loadCars()
      this.loadRank()
      this.loadTrend()
    },
    loadFleet() {
      this.loading = true
      const params = Object.assign({}, this.query, this.dateParams())
      getFleetStatPage(params).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.fleetRows = res.data || []
          this.total = res.count || 0
          this.computeSummary()
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => { this.loading = false })
    },
    // 汇总卡按当前页 + 车队/机构合计（后端 page 已按车队聚合，取全量再求和更准）
    computeSummary() {
      const params = Object.assign({}, this.query, this.dateParams(), { page: 0, limit: 0 })
      getFleetStatPage(params).then(res => {
        if (res.code !== 200) return
        const rows = res.data || []
        const summary = { totalDegree: 0, actualPayAmount: 0, totalOrderCount: 0 }
        rows.forEach(r => {
          summary.totalDegree += Number(r.totalDegree || 0)
          summary.actualPayAmount += Number(r.actualPayAmount || 0)
          summary.totalOrderCount += Number(r.totalOrderCount || 0)
        })
        this.summary = summary
      }).catch(() => {})
    },
    loadTrend() {
      const params = Object.assign({}, this.dateParams(), {
        fleetId: this.query.fleetId,
        orgId: this.query.orgId
      })
      getFleetStatTrend(params).then(res => {
        if (res.code === 200) {
          this.trendData = res.data || []
          this.renderTrend()
        }
      }).catch(() => {})
    },
    initChart() {
      if (!this.$refs.trendChart) return
      this.chart = echarts.init(this.$refs.trendChart)
      this.renderTrend()
    },
    renderTrend() {
      if (!this.chart) return
      const metric = this.trendMetric
      const x = this.trendData.map(r => String(r.summaryDate || '').slice(5))
      const y = this.trendData.map(r => Number(r[metric] || 0))
      const labelMap = { totalDegree: '电量(度)', actualPayAmount: '金额(元)', totalOrderCount: '订单量' }
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 48, right: 20, top: 30, bottom: 30 },
        xAxis: { type: 'category', data: x, boundaryGap: false },
        yAxis: { type: 'value', name: labelMap[metric] },
        series: [{
          type: 'line',
          smooth: true,
          symbolSize: 6,
          areaStyle: { opacity: 0.12 },
          data: y,
          itemStyle: { color: '#409EFF' }
        }]
      }, true)
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    loadCars() {
      this.carLoading = true
      const params = Object.assign({}, this.carQuery, this.dateParams())
      getFleetCarStatPage(params).then(res => {
        this.carLoading = false
        if (res.code === 200) {
          this.carRows = res.data || []
          this.carTotal = res.count || 0
        }
      }).catch(() => { this.carLoading = false })
    },
    loadRank() {
      this.rankLoading = true
      const params = Object.assign({}, this.dateParams(), {
        fleetId: this.query.fleetId,
        orgId: this.query.orgId,
        topN: 10
      })
      getFleetCarStatRank(params).then(res => {
        this.rankLoading = false
        if (res.code === 200) {
          const rows = res.data || []
          const metric = this.rankMetric
          rows.sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0))
          this.rankRows = rows
        }
      }).catch(() => { this.rankLoading = false })
    },
    search() {
      this.query.page = 1
      this.carQuery.fleetId = this.query.fleetId
      this.carQuery.orgId = this.query.orgId
      this.carQuery.page = 1
      this.loadFleet()
      this.loadCars()
      this.loadRank()
      this.loadTrend()
    },
    resetQuery() {
      this.dateRange = defaultRange()
      this.query = { page: 1, limit: this.query.limit, fleetId: null, orgId: null }
      this.carQuery = { page: 1, limit: this.carQuery.limit, fleetId: null, orgId: null }
      this.loadAll()
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.loadFleet()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.loadFleet()
    },
    handleCarSizeChange(val) {
      this.carQuery.limit = val
      this.loadCars()
    },
    handleCarCurrentChange(val) {
      this.carQuery.page = val
      this.loadCars()
    },
    avgOf(row) {
      const count = Number(row.totalOrderCount || 0)
      if (!count) return '-'
      return (Number(row.actualPayAmount || 0) / count).toFixed(2)
    },
    formatNumber(value, scale) {
      const n = Number(value || 0)
      return n.toFixed(scale == null ? 2 : scale)
    }
  }
}
</script>

<style scoped>
.fleet-stat-page .search-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.stat-cards {
  margin-bottom: 12px;
}
.stat-card {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 14px 16px;
}
.stat-card__label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}
.stat-card__value {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}
.stat-card__value .unit {
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  margin-left: 4px;
}
.stat-card-block {
  margin-bottom: 12px;
  border-radius: 4px;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.trend-chart {
  height: 280px;
  width: 100%;
}
.rank-bar {
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 10px;
  text-align: right;
}
</style>
