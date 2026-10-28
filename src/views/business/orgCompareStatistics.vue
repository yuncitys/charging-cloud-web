<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="dateRange"
        class="filter-item"
        style="margin-right: 20px;"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        :clearable="false"
        @change="dateChange"
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

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="tableRows"
      element-loading-text="拼命加载中......"
      style="width: 100%;"
      border
      :row-class-name="rowClassName"
    >
      <el-table-column label="机构名称" prop="orgName" align="center" fixed min-width="180" show-overflow-tooltip />
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
import { ORG_COMPARE_METRICS, formatNumber, fmtDate } from './orgStatisticsMetrics.js'

export default {
  name: 'orgCompareStatistics',
  data() {
    const start = fmtDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    const end = fmtDate(new Date())
    return {
      dateRange: [start, end],
      listQuery: {
        startDate: start,
        endDate: end,
        orgName: '',
        metricKey: 'totalDegree'
      },
      metricOptions: ORG_COMPARE_METRICS,
      dates: [],
      rows: [],
      totals: [],
      tableKey: 0,
      listLoading: false
    }
  },
  computed: {
    currentMetric() {
      return ORG_COMPARE_METRICS.find(m => m.key === this.listQuery.metricKey) || ORG_COMPARE_METRICS[0]
    },
    // 第一行为「总计」（后端 totals 与 dates 对齐），其后为各机构
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
    dateChange(e) {
      this.listQuery.startDate = e ? e[0] : ''
      this.listQuery.endDate = e ? e[1] : ''
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
