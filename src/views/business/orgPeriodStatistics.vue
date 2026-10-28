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
        v-model="stationIdList"
        class="filter-item"
        style="width: 260px; margin-right: 20px;"
        multiple
        collapse-tags
        filterable
        clearable
        placeholder="请选择充电站"
      >
        <el-option v-for="item in chargingStationList" :key="item.id" :label="item.networkName" :value="item.id" />
      </el-select>
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <div class="org-summary">
      <div v-for="m in summaryMetrics" :key="m.key" class="org-summary-item">
        <span>{{ m.label }}</span><b>{{ formatNumber(summary[m.key], m.digits) }}</b>
      </div>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      style="width: 100%;"
      align="center"
    >
      <el-table-column type="index" width="55" label="序号" align="center">
        <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
      </el-table-column>
      <el-table-column label="日期" prop="summaryDate" align="center" min-width="110" />
      <el-table-column
        v-for="m in metrics"
        :key="m.key"
        :label="m.label"
        :prop="m.key"
        align="center"
        sortable
        :min-width="m.minWidth"
      >
        <template slot-scope="scope">{{ formatNumber(scope.row[m.key], m.digits) }}</template>
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
  </div>
</template>

<script>
import { orgPeriodStatisticsList, orgPeriodStatisticsSummary } from '@/api/business/orgChargeStatistics.js'
import { ORG_METRICS, ORG_SUMMARY_KEYS, formatNumber, fmtDate } from './orgStatisticsMetrics.js'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList.js'

export default {
  name: 'orgPeriodStatistics',
  data() {
    const start = fmtDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    const end = fmtDate(new Date())
    return {
      dateRange: [start, end],
      listQuery: {
        startDate: start,
        endDate: end,
        stationIds: '',
        page: 1,
        limit: 10
      },
      stationIdList: [],
      chargingStationList: [],
      metrics: ORG_METRICS,
      summaryMetrics: ORG_METRICS.filter(m => ORG_SUMMARY_KEYS.indexOf(m.key) >= 0),
      list: [],
      total: 0,
      tableKey: 0,
      listLoading: false,
      summary: {}
    }
  },
  created() {
    this.getStationList()
    this.getList()
    this.getSummary()
  },
  methods: {
    formatNumber,
    buildQuery() {
      return Object.assign({}, this.listQuery, { stationIds: this.stationIdList.join(',') })
    },
    getStationList() {
      getChargingStationList(0).then(res => {
        this.chargingStationList = res.code == 200 ? (res.data || []) : []
      }).catch(() => { this.chargingStationList = [] })
    },
    getList() {
      this.listLoading = true
      orgPeriodStatisticsList(this.buildQuery()).then(res => {
        this.listLoading = false
        if (res.code == 200) {
          this.total = res.count
          this.list = res.data || []
          this.tableKey += 1
        } else {
          this.$message.error(res.msg)
        }
      }).catch(() => { this.listLoading = false })
    },
    getSummary() {
      orgPeriodStatisticsSummary(this.buildQuery()).then(res => {
        this.summary = res.code == 200 && res.data ? res.data : {}
      }).catch(() => { this.summary = {} })
    },
    dateChange(e) {
      this.listQuery.startDate = e ? e[0] : ''
      this.listQuery.endDate = e ? e[1] : ''
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
      this.getSummary()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.listQuery.page = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    }
  }
}
</script>

<style scoped>
.org-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 8px 0 16px;
}
.org-summary-item {
  min-width: 150px;
  padding: 10px 16px;
  border-radius: 8px;
  background: #f5f7fa;
}
.org-summary-item span {
  display: block;
  font-size: 12px;
  color: #909399;
}
.org-summary-item b {
  font-size: 18px;
  color: #303133;
}
</style>
