<template>
  <div class="app-container settlement-ledger-page">
    <el-alert
      class="ledger-role-tip"
      type="info"
      :closable="false"
      show-icon
      title="使用说明"
      description="正向台账由订单结算完成后的实时入账写入；异常单可看下方「实时入账任务监控」或依赖异步队列重试。分账由调度任务按日/周/月发起（见 doc/定期分账-账期状态流转与调度说明.md）。账期按商户+结算方式拆分，period_key 形如 M商户ID|SM结算方式|DAY|日期。"
    />
    <div class="task-monitor-container">
      <div class="task-monitor-header">
        <div class="task-monitor-title">实时入账任务监控</div>
        <div class="task-monitor-actions">
          <span class="task-monitor-time">最近刷新：{{ taskStats.lastRefreshTime || '—' }}</span>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:ingestTask:stats')"
            class="task-monitor-refresh-btn"
            size="mini"
            type="primary"
            :loading="taskStatsLoading"
            @click="loadTaskStats(false)"
          >刷新</el-button>
        </div>
      </div>
      <el-row :gutter="12" class="task-monitor-cards">
        <el-col :span="4"><div class="task-card"><div class="k">待处理</div><div class="v">{{ taskStats.pending }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">运行中</div><div class="v">{{ taskStats.running }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">成功</div><div class="v">{{ taskStats.success }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">失败</div><div class="v warn">{{ taskStats.failed }}</div></div></el-col>
        <el-col :span="4"><div class="task-card"><div class="k">死信</div><div class="v danger">{{ taskStats.dead }}</div></div></el-col>
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
            <el-option :value="0" label="待关账" />
            <el-option :value="1" label="已关账" />
            <el-option :value="2" label="已分账" />
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
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:page')"
            type="primary"
            icon="el-icon-search"
            @click="search"
          >查询</el-button>
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
        <el-table-column type="index" width="50" label="序号" align="center" :index="indexMethod" />
        <el-table-column label="商户" min-width="140" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.merchantName || '—' }}</span>
          </template>
        </el-table-column>
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
            <el-tag
              v-if="scope.row.status === 0 || scope.row.status === 1 || scope.row.status === 2"
              :type="scope.row.status === 0 ? 'info' : scope.row.status === 1 ? 'warning' : 'success'"
              size="small"
            >{{ statusLabel(scope.row.status) }}</el-tag>
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
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:detail')"
              type="text"
              size="small"
              @click="openDrawer(scope.row)"
            >台账明细</el-button>
            <el-button
              v-if="scope.row.status !== 2 && btnAuthen.permsVerifAuthention(':web:settlementLedger:payout:submit')"
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

        <el-row v-if="drawer.summary.merchantName || drawer.summary.stationNames" :gutter="16" class="summary-row" style="margin-top: 8px">
          <el-col v-if="drawer.summary.merchantName" :span="12">
            <div class="summary-card">
              <div class="summary-label">商户</div>
              <div class="summary-value">{{ drawer.summary.merchantName }}</div>
            </div>
          </el-col>
          <el-col v-if="drawer.summary.stationNames" :span="12">
            <div class="summary-card">
              <div class="summary-label">涉及站点</div>
              <div class="summary-value" style="font-size: 13px; font-weight: 500">{{ drawer.summary.stationNames }}</div>
            </div>
          </el-col>
        </el-row>

        <el-divider content-position="left">分账执行记录</el-divider>
        <div class="payout-batch-toolbar">
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:payoutBatch:list')"
            size="mini"
            type="primary"
            plain
            :loading="payoutBatchLoading"
            @click="loadPayoutBatches"
          >刷新批次</el-button>
        </div>
        <el-table v-loading="payoutBatchLoading" :data="payoutBatches" border size="small" style="width: 100%; margin-bottom: 12px">
          <el-table-column label="执行时间" width="168" align="center">
            <template slot-scope="scope">{{ scope.row.createTime | formatDate }}</template>
          </el-table-column>
          <el-table-column label="触发" width="88" align="center">
            <template slot-scope="scope">{{ payoutTriggerLabel(scope.row.triggerType) }}</template>
          </el-table-column>
          <el-table-column label="批次状态" width="108" align="center">
            <template slot-scope="scope">{{ payoutBatchStatusLabel(scope.row.batchStatus) }}</template>
          </el-table-column>
          <el-table-column label="成功/跳过/失败" width="130" align="center">
            <template slot-scope="scope">
              {{ scope.row.successCount }}/{{ scope.row.skipCount }}/{{ scope.row.failCount }}
            </template>
          </el-table-column>
          <el-table-column prop="operatorUserName" label="操作人" width="100" show-overflow-tooltip />
          <el-table-column prop="failSummary" label="失败摘要" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="88" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:payoutBatch:items')"
                type="text"
                size="small"
                @click="openPayoutBatchItemDialog(scope.row)"
              >明细</el-button>
            </template>
          </el-table-column>
        </el-table>

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
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:lines')"
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="loadLines"
            >筛选</el-button>
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
          <el-table-column label="商户" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.merchantName || '—' }}
              <span v-if="scope.row.merchantId != null" class="sub-id">（{{ scope.row.merchantId }}）</span>
            </template>
          </el-table-column>
          <el-table-column label="站点" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.stationName || '—' }}
              <span v-if="scope.row.stationId != null" class="sub-id">（{{ scope.row.stationId }}）</span>
            </template>
          </el-table-column>
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

    <el-dialog
      title="分账批次 — 逐单结果"
      :visible.sync="payoutItemDialog.visible"
      width="900px"
      append-to-body
      @close="onPayoutItemDialogClose"
    >
      <div v-if="payoutItemDialog.currentBatch" class="payout-item-meta">
        <span>批次 #{{ payoutItemDialog.currentBatch.id }}</span>
        <span class="sep">|</span>
        <span>{{ payoutBatchStatusLabel(payoutItemDialog.currentBatch.batchStatus) }}</span>
        <span class="sep">|</span>
        <span>成功 {{ payoutItemDialog.currentBatch.successCount }} / 跳过 {{ payoutItemDialog.currentBatch.skipCount }} / 失败 {{ payoutItemDialog.currentBatch.failCount }}</span>
      </div>
      <el-form :inline="true" size="small" style="margin: 10px 0">
        <el-form-item label="状态筛选">
          <el-select v-model="payoutItemDialog.itemStatus" clearable placeholder="全部" style="width: 130px" @change="loadPayoutItemPage(1)">
            <el-option label="全部" value="" />
            <el-option label="成功" value="SUCCESS" />
            <el-option label="跳过" value="SKIPPED" />
            <el-option label="失败" value="FAILED" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-table v-loading="payoutItemDialog.loading" :data="payoutItemDialog.items" border size="small" style="width: 100%">
        <el-table-column prop="orderCode" label="订单号" min-width="160" show-overflow-tooltip />
        <el-table-column label="结果" width="96" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.itemStatus === 'SUCCESS'" type="success" size="mini">成功</el-tag>
            <el-tag v-else-if="scope.row.itemStatus === 'SKIPPED'" type="info" size="mini">跳过</el-tag>
            <el-tag v-else-if="scope.row.itemStatus === 'FAILED'" type="danger" size="mini">失败</el-tag>
            <span v-else>{{ scope.row.itemStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="skipReason" label="跳过原因" min-width="160" show-overflow-tooltip />
        <el-table-column prop="failMessage" label="失败原因" min-width="200" show-overflow-tooltip />
        <el-table-column prop="payTrace" label="支付摘要" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.itemStatus === 'FAILED' && payoutItemDialog.periodId && btnAuthen.permsVerifAuthention(':web:settlementLedger:payout:retry')"
              type="text"
              size="small"
              :loading="payoutItemDialog.retryingOrderCode === scope.row.orderCode"
              @click="onRetryPayoutSingleOrder(scope.row)"
            >
              重试分账
            </el-button>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container" style="margin-top: 10px">
        <el-pagination
          small
          :current-page="payoutItemDialog.page"
          :page-size="payoutItemDialog.limit"
          :total="payoutItemDialog.total"
          layout="total, prev, pager, next"
          @current-change="onPayoutItemPageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  periodPage,
  periodDetail,
  linePage,
  submitPayout,
  ingestTaskStats,
  payoutBatchList,
  payoutBatchDetail,
  payoutBatchItems,
  retryPayoutSingleOrder
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
      },
      payoutBatches: [],
      payoutBatchLoading: false,
      payoutItemDialog: {
        visible: false,
        batchId: null,
        periodId: null,
        currentBatch: null,
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        itemStatus: '',
        loading: false,
        retryingOrderCode: null
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
    if (this.btnAuthen && this.btnAuthen.permsVerifAuthention(':web:settlementLedger:ingestTask:stats')) {
      this.loadTaskStats(true)
      this.startTaskStatsAutoRefresh()
    }
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
      if (s === 0) return '待关账'
      if (s === 1) return '已关账'
      if (s === 2) return '已分账'
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
        this.loadPayoutBatches()
      })
    },
    loadPayoutBatches() {
      if (!this.drawer.periodId) return
      if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:settlementLedger:payoutBatch:list')) {
        this.payoutBatches = []
        return
      }
      this.payoutBatchLoading = true
      payoutBatchList(this.drawer.periodId)
        .then(res => {
          if (res.code === 200) {
            this.payoutBatches = res.data || []
          } else {
            this.$message.error(res.msg || '加载分账批次失败')
          }
        })
        .finally(() => {
          this.payoutBatchLoading = false
        })
    },
    payoutTriggerLabel(t) {
      if (t === 2) return '调度'
      return '手工'
    },
    payoutBatchStatusLabel(s) {
      if (s === 0) return '进行中'
      if (s === 1) return '成功'
      if (s === 2) return '部分失败'
      return '—'
    },
    openPayoutBatchItemDialog(batchRow) {
      if (!batchRow || !batchRow.id) return
      this.payoutItemDialog.batchId = batchRow.id
      this.payoutItemDialog.periodId = batchRow.periodId != null ? batchRow.periodId : this.drawer.periodId
      this.payoutItemDialog.currentBatch = { ...batchRow }
      this.payoutItemDialog.visible = true
      this.payoutItemDialog.page = 1
      this.payoutItemDialog.itemStatus = ''
      this.loadPayoutItemPage(1)
      payoutBatchDetail(batchRow.id).then(res => {
        if (res.code === 200 && res.data && res.data.batch) {
          this.payoutItemDialog.currentBatch = res.data.batch
        }
      })
    },
    onPayoutItemDialogClose() {
      this.payoutItemDialog.batchId = null
      this.payoutItemDialog.periodId = null
      this.payoutItemDialog.retryingOrderCode = null
      this.payoutItemDialog.currentBatch = null
      this.payoutItemDialog.items = []
      this.payoutItemDialog.total = 0
      this.payoutItemDialog.itemStatus = ''
    },
    onPayoutItemPageChange(p) {
      this.loadPayoutItemPage(p)
    },
    loadPayoutItemPage(page) {
      if (!this.payoutItemDialog.batchId) return
      this.payoutItemDialog.page = page || 1
      this.payoutItemDialog.loading = true
      const params = {
        page: this.payoutItemDialog.page,
        limit: this.payoutItemDialog.limit
      }
      if (this.payoutItemDialog.itemStatus) {
        params.itemStatus = this.payoutItemDialog.itemStatus
      }
      payoutBatchItems(this.payoutItemDialog.batchId, params)
        .then(res => {
          if (res.code === 200 && res.data) {
            this.payoutItemDialog.items = res.data.records || []
            this.payoutItemDialog.total = res.data.total || 0
          } else {
            this.$message.error((res && res.msg) || '加载明细失败')
          }
        })
        .finally(() => {
          this.payoutItemDialog.loading = false
        })
    },
    onRetryPayoutSingleOrder(row) {
      const periodId = this.payoutItemDialog.periodId
      const orderCode = row && row.orderCode
      if (!periodId || !orderCode) return
      this.$confirm(`确认对订单「${orderCode}」单独重试分账？不会整账期重跑。`, '单笔重试', { type: 'warning' })
        .then(() => {
          this.payoutItemDialog.retryingOrderCode = orderCode
          return retryPayoutSingleOrder(periodId, orderCode)
        })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '重试成功')
            if (this.drawer.visible && this.drawer.periodId === periodId) {
              periodDetail(periodId).then(r => {
                if (r.code === 200 && r.data) {
                  this.drawer.summary = r.data.summary
                }
              })
              this.loadPayoutBatches()
            }
            this.getList()
            payoutBatchDetail(this.payoutItemDialog.batchId).then(r => {
              if (r.code === 200 && r.data && r.data.batch) {
                this.payoutItemDialog.currentBatch = r.data.batch
              }
            })
            this.loadPayoutItemPage(this.payoutItemDialog.page)
          } else {
            this.$message.error(res.msg || '重试失败')
          }
        })
        .catch(() => {})
        .finally(() => {
          this.payoutItemDialog.retryingOrderCode = null
        })
    },
    onDrawerClose() {
      this.drawer.summary = null
      this.drawer.lines = []
      this.drawer.lineTotal = 0
      this.drawer.periodId = null
      this.payoutBatches = []
    },
    loadLines() {
      if (!this.drawer.periodId) return
      if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:settlementLedger:lines')) {
        this.drawer.lines = []
        this.drawer.lineTotal = 0
        return
      }
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
          const data = res && res.data
          const payload = data && data.batchId != null ? data : null
          const hasFails = payload && Number(payload.failCount) > 0
          const allOk = res.code === 200 && (!payload || !hasFails)
          const partialOk = res.code !== 200 && hasFails

          if (allOk || partialOk) {
            if (allOk) {
              this.$message.success(res.msg || '分账完成')
            } else {
              this.$message.warning(res.msg || '分账已结束，存在失败订单，账期未标记为已支付')
            }
            if (hasFails && payload.batchId) {
              this.$confirm(
                `本账期存在 ${payload.failCount} 笔订单分账失败，可在「台账明细」内「分账执行记录」追溯，或立即查看失败明细。`,
                '分账部分失败',
                {
                  confirmButtonText: '查看失败明细',
                  cancelButtonText: '关闭',
                  type: 'warning'
                }
              )
                .then(() => {
                  this.openDrawer(row)
                  this.$nextTick(() => {
                    this.openPayoutBatchItemDialog({ id: payload.batchId })
                    this.payoutItemDialog.itemStatus = 'FAILED'
                    this.loadPayoutItemPage(1)
                  })
                })
                .catch(() => {})
            }
            this.getList()
            if (this.drawer.visible && this.drawer.periodId === row.id) {
              periodDetail(row.id).then(r => {
                if (r.code === 200 && r.data) {
                  this.drawer.summary = r.data.summary
                }
              })
              this.loadPayoutBatches()
            }
          } else {
            this.$message.error(res.msg || '分账失败')
            if (hasFails && payload.batchId) {
              this.$confirm('存在失败订单，是否打开失败明细？', '分账失败', {
                confirmButtonText: '查看',
                cancelButtonText: '关闭',
                type: 'warning'
              })
                .then(() => {
                  this.openDrawer(row)
                  this.$nextTick(() => {
                    this.openPayoutBatchItemDialog({ id: payload.batchId })
                    this.payoutItemDialog.itemStatus = 'FAILED'
                    this.loadPayoutItemPage(1)
                  })
                })
                .catch(() => {})
            }
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
.task-monitor-refresh-btn.el-button--primary {
  color: #fff;
}
.task-monitor-refresh-btn.el-button--primary:focus,
.task-monitor-refresh-btn.el-button--primary:hover {
  color: #fff;
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
.payout-batch-toolbar {
  margin-bottom: 8px;
}
.payout-item-meta {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}
.payout-item-meta .sep {
  margin: 0 8px;
  color: #dcdfe6;
}
.sub-id {
  color: #909399;
  font-size: 12px;
  font-weight: normal;
}
</style>
