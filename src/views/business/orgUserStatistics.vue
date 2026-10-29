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
      <el-input
        v-model="listQuery.orgName"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        clearable
        placeholder="机构名称"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.userAccount"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        clearable
        placeholder="用户帐号"
        @keyup.enter.native="handleFilter"
      />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <div class="report-header">
      <div class="title-section">
        <span class="title">用户统计</span>
        <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
      </div>
      <DownOrgUserStatistics :query-data="buildQuery()" />
    </div>

    <StatsSummaryCards :items="summaryCards" />

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
      <el-table-column label="用户帐号" prop="userAccount" align="center" min-width="140" show-overflow-tooltip />
      <el-table-column label="机构名称" prop="orgName" align="center" min-width="180" show-overflow-tooltip />
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
import { orgUserStatisticsList, orgUserStatisticsSummary } from '@/api/business/orgChargeStatistics.js'
import { ORG_METRICS, formatNumber, fmtDate } from './orgStatisticsMetrics.js'
import StatsSummaryCards from './components/StatsSummaryCards.vue'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import DownOrgUserStatistics from './components/DownOrgUserStatistics.vue'
import { caliberForPage, buildOrgSummaryCardItems } from './statsCaliberCopy.js'

export default {
  name: 'orgUserStatistics',
  components: { StatsSummaryCards, StatsCaliberDialog, DownOrgUserStatistics },
  data() {
    const start = fmtDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    const end = fmtDate(new Date())
    return {
      dateRange: [start, end],
      listQuery: {
        startDate: start,
        endDate: end,
        orgName: '',
        userAccount: '',
        page: 1,
        limit: 10
      },
      metrics: ORG_METRICS,
      list: [],
      total: 0,
      tableKey: 0,
      listLoading: false,
      summary: {},
      caliber: caliberForPage('user')
    }
  },
  computed: {
    summaryCards() {
      return buildOrgSummaryCardItems(this.summary, formatNumber)
    }
  },
  created() {
    this.getList()
    this.getSummary()
  },
  methods: {
    formatNumber,
    buildQuery() {
      return Object.assign({}, this.listQuery)
    },
    getList() {
      this.listLoading = true
      orgUserStatisticsList(this.buildQuery()).then(res => {
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
      orgUserStatisticsSummary(this.buildQuery()).then(res => {
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
</style>
