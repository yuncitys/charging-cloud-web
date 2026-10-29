<template>
  <div class="app-container">
    <div class="filter-container">
      <StatsTimeRangeFilter
        :time-type.sync="listQuery.timeType"
        :start.sync="listQuery.startDate"
        :end.sync="listQuery.endDate"
        @change="onTimeChange"
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
      class="stats-nested-table"
      element-loading-text="拼命加载中......"
      style="width: 100%;"
      align="center"
    >
      <el-table-column type="index" width="55" label="序号" align="center">
        <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
      </el-table-column>
      <el-table-column label="统计维度" align="center">
        <el-table-column label="用户帐号" prop="userAccount" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column label="机构名称" prop="orgName" align="center" min-width="180" show-overflow-tooltip />
      </el-table-column>
      <el-table-column v-for="g in metricGroups" :key="g.label" :label="g.label" align="center">
        <el-table-column
          v-for="m in g.metrics"
          :key="m.key"
          :label="m.label"
          :prop="m.key"
          align="center"
          sortable
          :min-width="m.minWidth"
        >
          <template slot-scope="scope">{{ formatNumber(scope.row[m.key], m.digits) }}</template>
        </el-table-column>
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
import { ORG_METRICS, groupOrgMetrics, formatNumber } from './orgStatisticsMetrics.js'
import StatsSummaryCards from './components/StatsSummaryCards.vue'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import StatsTimeRangeFilter, { defaultRangeForTimeType } from './components/StatsTimeRangeFilter.vue'
import DownOrgUserStatistics from './components/DownOrgUserStatistics.vue'
import { caliberForPage, buildOrgSummaryCardItems } from './statsCaliberCopy.js'
import './styles/statsNestedTable.css'

export default {
  name: 'orgUserStatistics',
  components: { StatsSummaryCards, StatsCaliberDialog, StatsTimeRangeFilter, DownOrgUserStatistics },
  data() {
    const range = defaultRangeForTimeType(3)
    return {
      listQuery: {
        timeType: 3,
        startDate: range[0],
        endDate: range[1],
        orgName: '',
        userAccount: '',
        page: 1,
        limit: 10
      },
      metricGroups: groupOrgMetrics(ORG_METRICS),
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
    onTimeChange() {
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
