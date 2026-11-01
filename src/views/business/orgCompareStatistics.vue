<template>
  <div class="app-container">
    <div class="filter-container">
      <StatsTimeRangeFilter
        day-only
        :start.sync="listQuery.startDate"
        :end.sync="listQuery.endDate"
        @change="onTimeChange"
      />
      <el-select
        v-model="listQuery.metricKey"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        placeholder="请选择比对内容"
        @change="handleFilter"
      >
        <el-option v-for="m in metricOptions" :key="m.key" :label="m.label" :value="m.key" />
      </el-select>
      <el-input
        v-model="listQuery.orgName"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        clearable
        placeholder="机构名称"
        @keyup.enter.native="handleFilter"
      />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <div class="report-header">
      <div class="title-section">
        <span class="title">机构比对</span>
        <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
      </div>
      <DownOrgCompareStatistics :query-data="listQuery" />
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="tableRows"
      element-loading-text="拼命加载中......"
      style="width: 100%;"
      border
      :row-class-name="rowClassName"
    >
      <el-table-column align="center" fixed min-width="180" show-overflow-tooltip>
        <template slot="header">
          <div class="corner-header">
            <span class="corner-header-time">时间</span>
            <span class="corner-header-org">机构名称</span>
          </div>
        </template>
        <template slot-scope="scope">
          <span :class="{ 'org-name-link': !scope.row.isTotal }">{{ scope.row.orgName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(d, idx) in dates"
        :key="d"
        :label="d"
        align="center"
        min-width="110"
      >
        <template slot-scope="scope">{{ cell(scope.row.values[idx]) }}</template>
      </el-table-column>
      <el-table-column label="合计" align="center" fixed="right" min-width="120">
        <template slot-scope="scope"><b>{{ cell(rowSum(scope.row.values)) }}</b></template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { orgCompareStatistics } from '@/api/business/orgChargeStatistics.js'
import { ORG_COMPARE_METRICS, formatNumber } from './orgStatisticsMetrics.js'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import DownOrgCompareStatistics from './components/DownOrgCompareStatistics.vue'
import StatsTimeRangeFilter, { defaultRangeForTimeType } from './components/StatsTimeRangeFilter.vue'
import { caliberForPage } from './statsCaliberCopy.js'

export default {
  name: 'orgCompareStatistics',
  components: { StatsCaliberDialog, DownOrgCompareStatistics, StatsTimeRangeFilter },
  data() {
    const range = defaultRangeForTimeType(3)
    return {
      listQuery: {
        startDate: range[0],
        endDate: range[1],
        orgName: '',
        metricKey: 'totalDegree'
      },
      metricOptions: ORG_COMPARE_METRICS,
      dates: [],
      rows: [],
      totals: [],
      tableKey: 0,
      listLoading: false,
      caliber: caliberForPage('compare')
    }
  },
  computed: {
    currentMetric() {
      return ORG_COMPARE_METRICS.find(m => m.key === this.listQuery.metricKey) || ORG_COMPARE_METRICS[0]
    },
    tableRows() {
      if (!this.rows.length) return []
      return [{ orgId: -1, orgName: '总计', values: this.totals, isTotal: true }].concat(this.rows)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    cell(v) {
      return formatNumber(v === undefined || v === null ? 0 : v, this.currentMetric.digits)
    },
    rowSum(values) {
      return (values || []).reduce((acc, v) => acc + Number(v || 0), 0)
    },
    rowClassName({ row }) {
      return row.isTotal ? 'org-compare-total-row' : ''
    },
    getList() {
      this.listLoading = true
      orgCompareStatistics(this.listQuery).then(res => {
        this.listLoading = false
        if (res.code == 200 && res.data) {
          this.dates = res.data.dates || []
          this.rows = res.data.rows || []
          this.totals = res.data.totals || []
          this.tableKey += 1
        } else {
          this.dates = []
          this.rows = []
          this.totals = []
          this.$message.error(res.msg)
        }
      }).catch(() => { this.listLoading = false })
    },
    onTimeChange() {
      this.handleFilter()
    },
    handleFilter() {
      this.getList()
    }
  }
}
</script>

<style>
.org-compare-total-row {
  font-weight: bold;
  background: #f5f7fa;
}
</style>

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
.org-name-link {
  color: #409EFF;
}
.corner-header {
  position: relative;
  height: 48px;
  width: 100%;
  background: linear-gradient(
    to top right,
    transparent calc(50% - 0.5px),
    #dcdfe6 calc(50% - 0.5px),
    #dcdfe6 calc(50% + 0.5px),
    transparent calc(50% + 0.5px)
  );
}
.corner-header-time {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 12px;
  color: #606266;
}
.corner-header-org {
  position: absolute;
  bottom: 4px;
  left: 8px;
  font-size: 12px;
  color: #606266;
}
</style>
