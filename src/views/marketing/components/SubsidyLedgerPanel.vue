<template>
  <div class="subsidy-ledger-panel">
    <el-tabs v-model="activeTab" @tab-click="loadActive">
      <el-tab-pane v-if="canLedgerPage" label="补款台账" name="ledger">
        <div class="filter-container">
          <el-select
            v-model="ledgerQuery.status"
            class="filter-item"
            style="width: 150px;"
            placeholder="补款状态"
            clearable
          >
            <el-option v-for="item in ledgerStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="searchLedger">查询</el-button>
        </div>
        <el-table v-loading="ledgerLoading" :data="ledgerRows" fit highlight-current-row>
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="periodId" label="账期ID" width="100" align="center" />
          <el-table-column prop="merchantId" label="商户ID" width="100" align="center" />
          <el-table-column prop="stationId" label="站点ID" width="100" align="center" />
          <el-table-column prop="bizOrderCode" label="订单号" min-width="180" show-overflow-tooltip />
          <el-table-column prop="subsidyAmount" label="补款金额" width="120" align="right" />
          <el-table-column label="状态" width="110" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="ledgerStatusType(scope.row.status)">{{ ledgerStatusLabel(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="payoutBatchId" label="出款批次" width="110" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination-container"
          :current-page="ledgerQuery.page"
          :page-size="ledgerQuery.limit"
          :page-sizes="[10, 20, 30, 50]"
          :total="ledgerTotal"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="ledgerSizeChange"
          @current-change="ledgerPageChange"
        />
      </el-tab-pane>

      <el-tab-pane v-if="canBatchPage" label="出款批次" name="batch">
        <div class="filter-container">
          <el-select
            v-model="batchQuery.status"
            class="filter-item"
            style="width: 170px;"
            placeholder="批次状态"
            clearable
          >
            <el-option v-for="item in batchStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" icon="el-icon-search" @click="searchBatch">查询</el-button>
        </div>
        <el-table v-loading="batchLoading" :data="batchRows" fit highlight-current-row>
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="id" label="批次ID" width="100" align="center" />
          <el-table-column prop="periodId" label="账期ID" width="100" align="center" />
          <el-table-column prop="merchantId" label="商户ID" width="100" align="center" />
          <el-table-column prop="totalAmount" label="补款总额" width="120" align="right" />
          <el-table-column label="出款状态" width="150" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="batchStatusType(scope.row.status)">{{ batchStatusLabel(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="更新时间" width="160">
            <template slot-scope="scope">{{ scope.row.updateTime | formatDate }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="canConfirmOffline && String(scope.row.status) === '0'"
                type="primary"
                size="mini"
                @click="confirmOffline(scope.row)"
              >确认线下打款</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination-container"
          :current-page="batchQuery.page"
          :page-size="batchQuery.limit"
          :page-sizes="[10, 20, 30, 50]"
          :total="batchTotal"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="batchSizeChange"
          @current-change="batchPageChange"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { confirmSubsidyBatch, pageSubsidyBatch, pageSubsidyLedger } from '@/api/marketing/marketing'
import { MARKETING_PERMS } from '../constants/marketingPermissions'
import { hasMarketingPerm } from '../utils/marketingActivityAuth'
import { parseTime } from '@/utils/index'
import { formatDictLabel } from '@/utils/dictionary'

export default {
  name: 'SubsidyLedgerPanel',
  filters: {
    formatDate(value) {
      return value ? parseTime(value) : ''
    }
  },
  props: {
    periodId: { type: [Number, String], required: true },
    merchantId: { type: [Number, String], default: '' }
  },
  data() {
    return {
      activeTab: 'ledger',
      ledgerLoading: false,
      batchLoading: false,
      ledgerRows: [],
      batchRows: [],
      ledgerTotal: 0,
      batchTotal: 0,
      ledgerStatusOptions: [],
      batchStatusOptions: [],
      ledgerQuery: { page: 1, limit: 10, merchantId: '', status: '' },
      batchQuery: { page: 1, limit: 10, merchantId: '', status: '' }
    }
  },
  computed: {
    canLedgerPage() { return hasMarketingPerm(MARKETING_PERMS.subsidyLedgerPage) },
    canBatchPage() { return hasMarketingPerm(MARKETING_PERMS.subsidyBatchPage) },
    canConfirmOffline() { return hasMarketingPerm(MARKETING_PERMS.subsidyConfirmOffline) }
  },
  created() {
    this.loadDictOptions()
  },
  watch: {
    periodId: {
      immediate: true,
      handler(val) {
        if (val === null || val === undefined || val === '') return
        this.resetQueriesFromProps()
        this.bootstrapTab()
        this.loadActive()
      }
    },
    merchantId() {
      this.resetQueriesFromProps()
      this.loadActive()
    }
  },
  methods: {
    resetQueriesFromProps() {
      const mid = this.merchantId === null || this.merchantId === undefined ? '' : String(this.merchantId)
      this.ledgerQuery = { page: 1, limit: this.ledgerQuery.limit || 10, merchantId: mid, status: '' }
      this.batchQuery = { page: 1, limit: this.batchQuery.limit || 10, merchantId: mid, status: '' }
    },
    bootstrapTab() {
      if (this.canLedgerPage) this.activeTab = 'ledger'
      else if (this.canBatchPage) this.activeTab = 'batch'
    },
    buildLedgerParams() {
      return { ...this.ledgerQuery, periodId: this.periodId }
    },
    buildBatchParams() {
      return { ...this.batchQuery, periodId: this.periodId }
    },
    getLedger() {
      if (!this.canLedgerPage || !this.periodId) return
      this.ledgerLoading = true
      pageSubsidyLedger(this.buildLedgerParams()).then(res => {
        this.ledgerRows = res.data || []
        this.ledgerTotal = res.count || 0
      }).finally(() => { this.ledgerLoading = false })
    },
    getBatch() {
      if (!this.canBatchPage || !this.periodId) return
      this.batchLoading = true
      pageSubsidyBatch(this.buildBatchParams()).then(res => {
        this.batchRows = res.data || []
        this.batchTotal = res.count || 0
      }).finally(() => { this.batchLoading = false })
    },
    loadActive() {
      if (this.activeTab === 'ledger') this.getLedger()
      else this.getBatch()
    },
    searchLedger() {
      this.ledgerQuery.page = 1
      this.getLedger()
    },
    searchBatch() {
      this.batchQuery.page = 1
      this.getBatch()
    },
    ledgerSizeChange(limit) {
      this.ledgerQuery.limit = limit
      this.getLedger()
    },
    ledgerPageChange(page) {
      this.ledgerQuery.page = page
      this.getLedger()
    },
    batchSizeChange(limit) {
      this.batchQuery.limit = limit
      this.getBatch()
    },
    batchPageChange(page) {
      this.batchQuery.page = page
      this.getBatch()
    },
    confirmOffline(row) {
      if (!this.canConfirmOffline) return
      this.$confirm(`确认批次 ${row.id} 已完成线下打款？`, '确认线下打款', { type: 'warning' }).then(() => {
        return confirmSubsidyBatch(row.id)
      }).then(() => {
        this.$message.success('已确认线下打款')
        this.getBatch()
        this.getLedger()
      }).catch(() => {})
    },
    loadDictOptions() {
      this.$dict.getSelectorOptions('marketing_subsidy_ledger_status').then(list => {
        this.ledgerStatusOptions = list || []
      })
      this.$dict.getSelectorOptions('marketing_subsidy_batch_status').then(list => {
        this.batchStatusOptions = list || []
      })
    },
    ledgerStatusLabel(status) {
      if (status === null || status === undefined || status === '') return '未知'
      const label = formatDictLabel('marketing_subsidy_ledger_status', status)
      return label === String(status) ? '未知' : label
    },
    ledgerStatusType(status) {
      return ({ 0: 'warning', 1: 'success', 2: 'danger' })[status] || 'info'
    },
    batchStatusLabel(status) {
      if (status === null || status === undefined || status === '') return '未知'
      const label = formatDictLabel('marketing_subsidy_batch_status', status)
      return label === String(status) ? '未知' : label
    },
    batchStatusType(status) {
      return ({ 0: 'warning', 1: 'success', 2: 'danger' })[status] || 'info'
    }
  }
}
</script>

<style scoped>
.filter-item {
  margin-right: 12px;
}
.pagination-container {
  margin-top: 18px;
}
</style>
