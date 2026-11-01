<template>
  <div class="app-container">
    <div class="filter-container">
      <StatsTimeRangeFilter
        :time-type.sync="listQuery.timeType"
        :start.sync="listQuery.startDate"
        :end.sync="listQuery.endDate"
        @change="onTimeChange"
      />
      <el-select
        v-model="listQuery.ruleId"
        class="filter-item"
        style="width: 130px; margin-right: 20px;"
        clearable
        placeholder="全部业态"
      >
        <el-option v-for="item in ruleIdOptions" :key="'rule-' + item.value" :label="item.label" :value="item.value" />
      </el-select>
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

    <div class="report-header">
      <div class="title-section">
        <span class="title">时期统计</span>
        <StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
      </div>
      <DownOrgPeriodStatistics :query-data="buildQuery()" />
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
        <el-table-column label="日期" prop="summaryDate" align="center" min-width="110" />
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
import { orgPeriodStatisticsList, orgPeriodStatisticsSummary } from '@/api/business/orgChargeStatistics.js'
import { ORG_METRICS, groupOrgMetrics, formatNumber } from './orgStatisticsMetrics.js'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList.js'
import StatsSummaryCards from './components/StatsSummaryCards.vue'
import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
import StatsTimeRangeFilter, { defaultRangeForTimeType } from './components/StatsTimeRangeFilter.vue'
import DownOrgPeriodStatistics from './components/DownOrgPeriodStatistics.vue'
import { caliberForPage, buildOrgSummaryCardItems } from './statsCaliberCopy.js'
import './styles/statsNestedTable.css'

export default {
  name: 'orgPeriodStatistics',
  components: { StatsSummaryCards, StatsCaliberDialog, StatsTimeRangeFilter, DownOrgPeriodStatistics },
  data() {
    const range = defaultRangeForTimeType(3)
    return {
      listQuery: {
        timeType: 3,
        startDate: range[0],
        endDate: range[1],
        ruleId: null,
        stationIds: '',
        page: 1,
        limit: 10
      },
      stationIdList: [],
      chargingStationList: [],
      ruleIdOptions: [],
      metricGroups: groupOrgMetrics(ORG_METRICS),
      list: [],
      total: 0,
      tableKey: 0,
      listLoading: false,
      summary: {},
      caliber: caliberForPage('period')
    }
  },
  computed: {
    summaryCards() {
      return buildOrgSummaryCardItems(this.summary, formatNumber)
    }
  },
  created() {
    this.$dict.getDeviceRuleOptions().then(list => { this.ruleIdOptions = list || [] })
    this.getStationList()
    this.getList()
    this.getSummary()
  },
  methods: {
    formatNumber,
    buildQuery() {
      const q = Object.assign({}, this.listQuery, { stationIds: this.stationIdList.join(',') })
      if (q.ruleId == null || q.ruleId === '') delete q.ruleId
      return q
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
