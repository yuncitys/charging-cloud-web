<template>
  <div class="app-container settlement-ledger-page">
    <el-alert
      class="ledger-role-tip"
      type="info"
      :closable="false"
      show-icon
      title="使用说明"
      description="每日「日结同步」请选昨天：会把该日已关单按各场站结算周期（日/周/月）写入对应账期。周/月全量同步按钮仅作补账。分账：日结随每日任务走；周结请周一任务、月结请月初任务（见后台 doc/定期分账-账期状态流转与调度说明.md）。账期按商户+结算方式拆分，period_key 形如 M商户ID|SM结算方式|DAY|日期。"
    />
    <div class="task-monitor-container">
      <div class="task-monitor-header">
        <div class="task-monitor-title">实时入账任务监控</div>
        <div class="task-monitor-actions">
          <span class="task-monitor-time">最近刷新：{{ taskStats.lastRefreshTime || '—' }}</span>
          <el-button size="mini" type="primary" plain :loading="taskStatsLoading" @click="loadTaskStats(false)">刷新</el-button>
        </div>
      </div>
      <el-row :gutter="12" class="task-monitor-cards">
        <el-col :span="4"><div class="task-card"><div class="k">Pending</div><div class="v">{{ taskStats.pending }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">Running</div><div class="v">{{ taskStats.running }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">Success</div><div class="v">{{ taskStats.success }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">Failed</div><div class="v warn">{{ taskStats.failed }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">Dead</div><div class="v danger">{{ taskStats.dead }}</div></div></el-col>
      </el-row>
      <el-alert
        v-if="taskStatsError"
        class="task-monitor-alert"
        type="warning"
        :closable="false"
        show-icon
        :title="taskStatsError"
      />
      <el-table
        v-if="taskStats.deadSamples && taskStats.deadSamples.length"
        :data="taskStats.deadSamples"
        border
        size="mini"
        style="width: 100%; margin-top: 10px"
      >
        <el-table-column prop="id" label="任务ID" width="90" align="center" />
        <el-table-column prop="orderCode" label="业务订单" min-width="170" show-overflow-tooltip />
        <el-table-column label="重试" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.retryCount }}/{{ scope.row.maxRetry }}</template>
        </el-table-column>
        <el-table-column prop="triggerRemark" label="触发备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="lastError" label="最近错误" min-width="240" show-overflow-tooltip />
        <el-table-column label="更新时间" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.updateTime | formatDate }}</template>
        </el-table-column>
      </el-table>
    </div>

    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="form left" @submit.native.prevent="search">
        <el-form-item label="账期类型">
          <el-select v-model="searchForm.periodType" clearable placeholder="全部" style="width: 120px">
            <el-option :value="1" label="日结" />
            <el-option :value="2" label="周结" />
            <el-option :value="3" label="月结" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 130px">
            <el-option :value="0" label="OPEN（待关账）" />
            <el-option :value="1" label="LOCKED（已关账）" />
            <el-option :value="2" label="PAID（已分账）" />
          </el-select>
        </el-form-item>
        <el-form-item label="结算方式">
          <el-select v-model="searchForm.settlementMode" clearable placeholder="全部" style="width: 130px">
            <el-option :value="1" label="自动" />
            <el-option :value="2" label="手动" />
          </el-select>
        </el-form-item>
        <el-form-item label="商户">
          <el-select v-model="searchForm.merchantId" clearable filterable placeholder="全部" style="width: 200px">
            <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="账期主键">
          <el-input v-model="searchForm.periodKey" clearable placeholder="如 M12|SM1|DAY|2026-04-10" style="width: 260px" />
        </el-form-item>
        <el-form-item label="起始日">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="从"
            end-placeholder="到"
            value-format="yyyy-MM-dd"
            unlink-panels
            style="width: 260px"
            @change="onDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="syncDay"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择归属日"
            style="width: 150px"
          />
          <el-button type="warning" plain style="margin-left: 8px" @click="onSyncDaily">日结同步</el-button>
          <el-button type="warning" plain @click="onSyncWeekly">周结同步</el-button>
          <el-button type="warning" plain @click="onSyncMonthly">月结同步</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="index" width="50" label="#" align="center" :index="indexMethod" />
        <el-table-column prop="merchantId" label="商户ID" width="88" align="center" />
        <el-table-column prop="periodKey" label="账期主键" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" width="88" align="center">
          <template slot-scope="scope">{{ periodTypeLabel(scope.row.periodType) }}</template>
        </el-table-column>
        <el-table-column label="结算方式" width="100" align="center">
          <template slot-scope="scope">{{ settlementModeLabel(scope.row.settlementMode) }}</template>
        </el-table-column>
        <el-table-column label="账期起止" min-width="200" align="center">
          <template slot-scope="scope">
            <span>{{ fmtDate(scope.row.startDate) }} ~ {{ fmtDate(scope.row.endDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="info">OPEN</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="warning">LOCKED</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="success">PAID</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="正向笔数" width="100" align="center" prop="forwardLineCount" />
        <el-table-column label="正向金额" width="110" align="right">
          <template slot-scope="scope">{{ money(scope.row.forwardAmount) }}</template>
        </el-table-column>
        <el-table-column label="退款调减" width="110" align="right">
          <template slot-scope="scope">{{ money(scope.row.refundAmount) }}</template>
        </el-table-column>
        <el-table-column label="应结净额" width="110" align="right">
          <template slot-scope="scope">
            <strong>{{ money(scope.row.netAmount) }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.updateTime | formatDate }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openDrawer(scope.row)">台账明细</el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="text"
              size="small"
              @click="onRebuild(scope.row)"
            >
              重算
            </el-button>
            <el-button
              v-if="scope.row.status !== 2"
              type="text"
              size="small"
              :disabled="scope.row.settlementMode !== 2"
              @click="onPayout(scope.row)"
            >
              提交分账
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="searchForm.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="searchForm.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawer.visible"
      direction="rtl"
      size="86%"
      append-to-body
      @close="onDrawerClose"
    >
      <div v-if="drawer.summary" class="drawer-body">
        <el-row :gutter="16" class="summary-row">
          <el-col :span="6">
            <div class="summary-card">
              <div class="summary-label">正向金额</div>
              <div class="summary-value">{{ money(drawer.summary.forwardAmount) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card">
              <div class="summary-label">退款调减</div>
              <div class="summary-value">{{ money(drawer.summary.refundAmount) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card">
              <div class="summary-label">应结净额</div>
              <div class="summary-value primary">{{ money(drawer.summary.netAmount) }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-card">
              <div class="summary-label">状态</div>
              <div class="summary-value">{{ statusLabel(drawer.summary.status) }}</div>
            </div>
          </el-col>
        </el-row>

        <el-form :inline="true" :model="lineQuery" class="line-filter" @submit.native.prevent="loadLines">
          <el-form-item label="商户">
            <el-select v-model="lineQuery.merchantId" clearable filterable placeholder="全部" style="width: 200px">
              <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="站点ID">
            <el-input v-model="lineQuery.stationId" clearable placeholder="站点 id" style="width: 120px" />
          </el-form-item>
          <el-form-item label="业务订单号">
            <el-input v-model="lineQuery.bizOrderCode" clearable placeholder="模糊" style="width: 180px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" icon="el-icon-search" @click="loadLines">筛选</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="drawer.lineLoading" :data="drawer.lines" border size="small" style="width: 100%">
          <el-table-column type="expand" width="44">
            <template slot-scope="scope">
              <div class="split-expand-wrap">
                <div class="split-expand-title">预分账明细</div>
                <el-table
                  v-if="scope.row.splitItems && scope.row.splitItems.length"
                  :data="scope.row.splitItems"
                  border
                  size="mini"
                  style="width: 100%"
                >
                  <el-table-column label="分账接收方" min-width="190" show-overflow-tooltip>
                    <template slot-scope="itemScope">
                      <el-tag v-if="itemScope.row.isPlatformMerchant" type="warning" size="mini">平台</el-tag>
                      <el-tag v-else type="success" size="mini">商户</el-tag>
                      <span style="margin-left: 6px">{{ splitMerchantLabel(itemScope.row) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="费率(电/服)" width="130" align="center">
                    <template slot-scope="itemScope">
                      {{ percent(itemScope.row.electricRate) }} / {{ percent(itemScope.row.serviceRate) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="电费分账" width="110" align="right">
                    <template slot-scope="itemScope">{{ money(itemScope.row.electricAmount) }}</template>
                  </el-table-column>
                  <el-table-column label="服务费分账" width="110" align="right">
                    <template slot-scope="itemScope">{{ money(itemScope.row.serviceAmount) }}</template>
                  </el-table-column>
                  <el-table-column label="预约费分账" width="110" align="right">
                    <template slot-scope="itemScope">{{ money(itemScope.row.reserveAmount) }}</template>
                  </el-table-column>
                  <el-table-column label="占位费分账" width="110" align="right">
                    <template slot-scope="itemScope">{{ money(itemScope.row.occupyAmount) }}</template>
                  </el-table-column>
                  <el-table-column label="合计" width="110" align="right">
                    <template slot-scope="itemScope">
                      <strong>{{ money(itemScope.row.totalAmount) }}</strong>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-else :image-size="64" description="暂无预分账明细" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="bizOrderCode" label="业务订单" min-width="160" show-overflow-tooltip />
          <el-table-column prop="payOrderCode" label="支付单号" min-width="160" show-overflow-tooltip />
          <el-table-column label="行类型" width="100" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.lineType === 1">正向</span>
              <span v-else-if="scope.row.lineType === 2">退款调减</span>
              <span v-else>{{ scope.row.lineType }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="merchantId" label="商户ID" width="88" align="center" />
          <el-table-column prop="stationId" label="站点ID" width="88" align="center" />
          <el-table-column label="预分账概览" min-width="180" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" type="info">明细 {{ splitItemCount(scope.row) }} 条</el-tag>
              <span style="margin-left: 6px">合计 {{ money(splitItemTotal(scope.row)) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结算合计" width="110" align="right">
            <template slot-scope="scope">{{ money(scope.row.settleTotalAmount) }}</template>
          </el-table-column>
          <el-table-column label="计费合计" width="110" align="right">
            <template slot-scope="scope">{{ money(scope.row.billTotalAmount) }}</template>
          </el-table-column>
          <el-table-column label="充电结束" width="160" align="center">
            <template slot-scope="scope">{{ scope.row.chargeEndTime | formatDate }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            small
            :current-page="lineQuery.page"
            :page-size="lineQuery.limit"
            :total="drawer.lineTotal"
            layout="total, prev, pager, next"
            @current-change="onLinePage"
          />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  periodPage,
  periodDetail,
  linePage,
  rebuildOpenPeriod,
  syncDailyCycle,
  syncWeeklyLastWeek,
  syncMonthlyLastMonth,
  submitPayout,
  ingestTaskStats
} from '@/api/finance/settlementLedger'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'

export default {
  name: 'SettlementLedger',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      dateRange: null,
      syncDay: null,
      merchantList: [],
      taskStatsLoading: false,
      taskStatsError: '',
      taskStatsTimer: null,
      taskStats: {
        pending: 0,
        running: 0,
        success: 0,
        failed: 0,
        dead: 0,
        deadSamples: [],
        lastRefreshTime: ''
      },
      searchForm: {
        page: 1,
        limit: 10,
        merchantId: '',
        periodType: '',
        settlementMode: '',
        status: '',
        periodKey: '',
        startDateFrom: '',
        startDateTo: ''
      },
      drawer: {
        visible: false,
        periodId: null,
        summary: null,
        lines: [],
        lineTotal: 0,
        lineLoading: false
      },
      lineQuery: {
        page: 1,
        limit: 10,
        merchantId: '',
        stationId: '',
        bizOrderCode: ''
      }
    }
  },
  computed: {
    drawerTitle() {
      if (!this.drawer.summary) return '台账明细'
      return `台账明细 — ${this.drawer.summary.periodKey || ''}`
    }
  },
  created() {
    this.initMerchant()
    this.loadTaskStats(true)
    this.startTaskStatsAutoRefresh()
    this.getList()
  },
  beforeDestroy() {
    this.stopTaskStatsAutoRefresh()
  },
  methods: {
    indexMethod(i) {
      return (this.searchForm.page - 1) * this.searchForm.limit + i + 1
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) {
          this.merchantList = res.data || []
        }
      })
    },
    onDateRange(val) {
      if (val && val.length === 2) {
        this.searchForm.startDateFrom = val[0]
        this.searchForm.startDateTo = val[1]
      } else {
        this.searchForm.startDateFrom = ''
        this.searchForm.startDateTo = ''
      }
    },
    money(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toFixed(2)
    },
    percent(v) {
      if (v === null || v === undefined || v === '') return '0.00%'
      const n = Number(v)
      if (Number.isNaN(n)) return '0.00%'
      return `${n.toFixed(2)}%`
    },
    splitItemCount(row) {
      const items = row && row.splitItems
      return Array.isArray(items) ? items.length : 0
    },
    splitItemTotal(row) {
      const items = row && row.splitItems
      if (!Array.isArray(items) || items.length === 0) return 0
      return items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0)
    },
    splitMerchantLabel(item) {
      if (!item) return '—'
      if (item.isPlatformMerchant) return '平台抽成'
      const name = item.merchantName || ''
      const no = item.merchantNo || ''
      if (name && no) return `${name} (${no})`
      if (name) return name
      if (no) return no
      return `商户ID:${item.merchantId || '—'}`
    },
    fmtDate(d) {
      if (!d) return '—'
      if (typeof d === 'string') return d.length >= 10 ? d.slice(0, 10) : d
      return d
    },
    periodTypeLabel(t) {
      if (t === 1) return '日结'
      if (t === 2) return '周结'
      if (t === 3) return '月结'
      return '—'
    },
    settlementModeLabel(mode) {
      if (mode === 1) return '自动'
      if (mode === 2) return '手动'
      return '—'
    },
    statusLabel(s) {
      if (s === 0) return 'OPEN（待关账）'
      if (s === 1) return 'LOCKED（已关账）'
      if (s === 2) return 'PAID（已分账）'
      return '—'
    },
    search() {
      this.searchForm.page = 1
      this.getList()
    },
    startTaskStatsAutoRefresh() {
      this.stopTaskStatsAutoRefresh()
      this.taskStatsTimer = setInterval(() => {
        this.loadTaskStats(true)
      }, 60000)
    },
    stopTaskStatsAutoRefresh() {
      if (this.taskStatsTimer) {
        clearInterval(this.taskStatsTimer)
        this.taskStatsTimer = null
      }
    },
    loadTaskStats(silent) {
      this.taskStatsLoading = true
      ingestTaskStats()
        .then(res => {
          if (res.code === 200 && res.data) {
            const d = res.data
            this.taskStats.pending = d.pending || 0
            this.taskStats.running = d.running || 0
            this.taskStats.success = d.success || 0
            this.taskStats.failed = d.failed || 0
            this.taskStats.dead = d.dead || 0
            this.taskStats.deadSamples = d.deadSamples || []
            this.taskStats.lastRefreshTime = parseTime(new Date())
            this.taskStatsError = ''
          } else {
            this.taskStatsError = (res && res.msg) || '任务统计加载失败'
            if (!silent) this.$message.error(this.taskStatsError)
          }
        })
        .catch(() => {
          this.taskStatsError = '任务统计加载异常'
          if (!silent) this.$message.error(this.taskStatsError)
        })
        .finally(() => {
          this.taskStatsLoading = false
        })
    },
    getList() {
      this.listLoading = true
      const payload = {
        page: this.searchForm.page,
        limit: this.searchForm.limit,
        merchantId: this.searchForm.merchantId === '' ? null : this.searchForm.merchantId,
        periodType: this.searchForm.periodType === '' ? null : this.searchForm.periodType,
        settlementMode: this.searchForm.settlementMode === '' ? null : this.searchForm.settlementMode,
        status: this.searchForm.status === '' ? null : this.searchForm.status,
        periodKey: this.searchForm.periodKey || null,
        startDateFrom: this.searchForm.startDateFrom || null,
        startDateTo: this.searchForm.startDateTo || null
      }
      periodPage(payload)
        .then(res => {
          if (res.code === 200) {
            this.list = res.data || []
            this.total = res.count || 0
          } else {
            this.$message.error(res.msg || '加载失败')
          }
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getList()
    },
    openDrawer(row) {
      this.drawer.visible = true
      this.drawer.periodId = row.id
      this.lineQuery = {
        page: 1,
        limit: 10,
        merchantId: '',
        stationId: '',
        bizOrderCode: ''
      }
      periodDetail(row.id).then(res => {
        if (res.code === 200 && res.data) {
          this.drawer.summary = res.data.summary || row
        } else {
          this.drawer.summary = row
          this.$message.error(res.msg || '加载账期详情失败')
        }
        this.loadLines()
      })
    },
    onDrawerClose() {
      this.drawer.summary = null
      this.drawer.lines = []
      this.drawer.lineTotal = 0
      this.drawer.periodId = null
    },
    loadLines() {
      if (!this.drawer.periodId) return
      this.drawer.lineLoading = true
      const sid = this.lineQuery.stationId
      const payload = {
        periodId: this.drawer.periodId,
        page: this.lineQuery.page,
        limit: this.lineQuery.limit,
        merchantId: this.lineQuery.merchantId === '' ? null : this.lineQuery.merchantId,
        stationId: sid === '' || sid === null ? null : Number(sid),
        bizOrderCode: this.lineQuery.bizOrderCode || null
      }
      linePage(payload)
        .then(res => {
          if (res.code === 200) {
            this.drawer.lines = res.data || []
            this.drawer.lineTotal = res.count || 0
          } else {
            this.$message.error(res.msg || '加载台账行失败')
          }
        })
        .finally(() => {
          this.drawer.lineLoading = false
        })
    },
    onLinePage(p) {
      this.lineQuery.page = p
      this.loadLines()
    },
    onRebuild(row) {
      this.$confirm(`确认重算账期「${row.periodKey}」的正向台账？仅 OPEN 状态有效。`, '重算台账', {
        type: 'warning'
      }).then(() => {
        rebuildOpenPeriod(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '已提交重算')
            this.getList()
          } else {
            this.$message.error(res.msg || '重算失败')
          }
        })
      }).catch(() => {})
    },
    onPayout(row) {
      if (row.settlementMode !== 2) {
        this.$message.warning('仅手动结算方式账期允许提交分账')
        return
      }
      this.$confirm(
        `确认对账期「${row.periodKey}」发起支付分账？仅手动结算方式允许手动提交。`,
        '提交分账',
        { type: 'warning' }
      ).then(() => {
        submitPayout({ periodId: row.id }).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '分账完成')
            this.getList()
            if (this.drawer.visible && this.drawer.periodId === row.id) {
              periodDetail(row.id).then(r => {
                if (r.code === 200 && r.data) {
                  this.drawer.summary = r.data.summary
                }
              })
            }
          } else {
            this.$message.error(res.msg || '分账失败')
          }
        })
      }).catch(() => {})
    },
    onSyncDaily() {
      if (!this.syncDay) {
        this.$message.warning('请选择订单归属日')
        return
      }
      this.$confirm(`按归属日 ${this.syncDay} 执行日结台账同步？`, '日结同步', { type: 'warning' }).then(() => {
        syncDailyCycle(this.syncDay).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '同步成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '同步失败')
          }
        })
      }).catch(() => {})
    },
    onSyncWeekly() {
      this.$confirm('执行上一 ISO 自然周的周结台账同步？', '周结同步', { type: 'warning' }).then(() => {
        syncWeeklyLastWeek().then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '同步成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '同步失败')
          }
        })
      }).catch(() => {})
    },
    onSyncMonthly() {
      this.$confirm('执行上一自然月的月结台账同步？', '月结同步', { type: 'warning' }).then(() => {
        syncMonthlyLastMonth().then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '同步成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '同步失败')
          }
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.settlement-ledger-page .ledger-role-tip {
  margin-bottom: 16px;
}
.task-monitor-container {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 14px;
  background: #fff;
}
.task-monitor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.task-monitor-title {
  font-weight: 600;
  color: #303133;
}
.task-monitor-actions {
  display: flex;
  align-items: center;
}
.task-monitor-time {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
}
.task-monitor-cards {
  margin-bottom: 8px;
}
.task-card {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px 10px;
}
.task-card .k {
  font-size: 12px;
  color: #909399;
}
.task-card .v {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.task-card .v.warn {
  color: #e6a23c;
}
.task-card .v.danger {
  color: #f56c6c;
}
.task-monitor-alert {
  margin-top: 6px;
}
.summary-row {
  margin-bottom: 16px;
}
.summary-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px 14px;
}
.summary-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.summary-value.primary {
  color: #409eff;
}
.line-filter {
  margin-bottom: 12px;
}
.drawer-body {
  padding: 0 16px 24px;
}
.split-expand-wrap {
  padding: 10px 16px;
  background: #fafafa;
}
.split-expand-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
</style>
