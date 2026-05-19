<template>
  <div class="app-container settlement-ledger-page">
    <el-alert
      class="ledger-role-tip"
      type="info"
      :closable="false"
      show-icon
      title="使用说明"
      description="正向台账由订单结算完成后的实时入账写入；异常单可看下方「实时入账任务监控」或依赖异步队列重试。分账由调度任务按日/周/月发起。账期按商户+结算方式拆分，账期主键 形如 M商户ID|SM结算方式|DAY|日期。"
    />
    <div v-if="taskMonitorVisible" class="task-monitor-container">
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
              :loading="payoutSubmittingId === scope.row.id"
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
      custom-class="settlement-ledger-drawer"
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
            class="payout-batch-refresh-btn"
            size="mini"
            type="primary"
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
          <el-form-item label="站点">
            <el-select v-model="lineQuery.stationId" clearable filterable placeholder="全部站点" style="width: 220px">
              <el-option v-for="station in stationList" :key="station.id" :label="station.networkName" :value="station.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务订单号">
            <el-input v-model="lineQuery.bizOrderCode" clearable placeholder="模糊" style="width: 180px" />
          </el-form-item>
          <el-form-item label="支付单号">
            <el-input v-model="lineQuery.payCode" clearable placeholder="模糊" style="width: 180px" />
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
          <el-form-item>
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:settlementLedger:lines:export')"
              type="primary"
              size="small"
              icon="el-icon-download"
              :loading="lineExportLoading"
              @click="exportLines"
            >导出</el-button>
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
                  class="split-items-table"
                  style="width: 100%"
                >
                  <el-table-column label="收款方" min-width="190" header-align="center" show-overflow-tooltip>
                    <template slot-scope="itemScope">
                      <el-tag v-if="itemScope.row.isPlatformMerchant" type="warning" size="mini">平台</el-tag>
                      <el-tag v-else type="success" size="mini">商户</el-tag>
                      <span style="margin-left: 6px">{{ splitMerchantLabel(itemScope.row) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="收款信息" align="center" header-align="center">
                    <el-table-column label="电费费率" width="88" align="center" header-align="center">
                      <template slot-scope="itemScope">{{ percent(itemScope.row.electricRate) }}</template>
                    </el-table-column>
                    <el-table-column label="服务费费率" width="88" align="center" header-align="center">
                      <template slot-scope="itemScope">{{ percent(itemScope.row.serviceRate) }}</template>
                    </el-table-column>
                    <el-table-column label="预约费率" width="88" align="center" header-align="center">
                      <template slot-scope="itemScope">{{ percent(itemScope.row.reserveRate) }}</template>
                    </el-table-column>
                    <el-table-column label="占位费率" width="88" align="center" header-align="center">
                      <template slot-scope="itemScope">{{ percent(itemScope.row.occupyRate) }}</template>
                    </el-table-column>
                    <el-table-column label="电费" width="92" align="right" header-align="center">
                      <template slot-scope="itemScope">{{ money(itemScope.row.electricAmount) }}</template>
                    </el-table-column>
                    <el-table-column label="服务费" width="92" align="right" header-align="center">
                      <template slot-scope="itemScope">{{ money(itemScope.row.serviceAmount) }}</template>
                    </el-table-column>
                    <el-table-column label="预约费" width="92" align="right" header-align="center">
                      <template slot-scope="itemScope">{{ money(itemScope.row.reserveAmount) }}</template>
                    </el-table-column>
                    <el-table-column label="占位费" width="92" align="right" header-align="center">
                      <template slot-scope="itemScope">{{ money(itemScope.row.occupyAmount) }}</template>
                    </el-table-column>
                    <el-table-column label="合计" width="92" align="right" header-align="center">
                      <template slot-scope="itemScope">
                        <strong>{{ money(itemScope.row.totalAmount) }}</strong>
                      </template>
                    </el-table-column>
                  </el-table-column>
                  <el-table-column label="通道费" align="center" header-align="center">
                    <el-table-column label="金额" width="108" align="right" header-align="center">
                      <template slot-scope="itemScope">
                        <span
                          v-if="formatSignedChannelFee(itemScope.row) !== '—'"
                          :class="itemScope.row.isPlatformMerchant ? 'channel-fee-platform' : 'channel-fee-deduct'"
                        >
                          {{ formatSignedChannelFee(itemScope.row) }}
                        </span>
                        <span v-else>—</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="详情" width="88" align="center" header-align="center">
                      <template slot-scope="itemScope">
                        <el-button
                          v-if="itemScope.row.isPlatformMerchant && hasChannelFeeDetail(scope.row)"
                          type="text"
                          size="mini"
                          class="channel-fee-detail-link"
                          @click="openChannelFeeDetailDialog(scope.row)"
                        >
                          查看
                        </el-button>
                        <span v-else>—</span>
                      </template>
                    </el-table-column>
                  </el-table-column>
                </el-table>
                <div
                  v-if="!scope.row.splitItems || !scope.row.splitItems.length"
                  class="ledger-empty-tip"
                >暂无预分账明细</div>
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
            </template>
          </el-table-column>
          <el-table-column label="站点" min-width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.stationName || '—' }}
            </template>
          </el-table-column>
          <el-table-column label="预分账概览" min-width="220" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" type="info">明细 {{ splitItemCount(scope.row) }} 条</el-tag>
              <span style="margin-left: 6px">合计 {{ money(splitItemTotal(scope.row)) }}</span>
              <span v-if="splitChannelFeeTotal(scope.row) > 0" style="margin-left: 6px; color: #e6a23c">
                通道费 {{ money(splitChannelFeeTotal(scope.row)) }}
              </span>
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
          <el-table-column label="操作" width="108" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
                v-if="canRecalcLineSplit(scope.row)"
                type="text"
                size="mini"
                :loading="recalcLineSplitLoadingId === scope.row.id"
                @click="onRecalcLineSplit(scope.row)"
              >
                重算预分账
              </el-button>
              <span v-else>—</span>
            </template>
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
      custom-class="settlement-ledger-dialog"
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

    <el-dialog
      title="通道费详情"
      :visible.sync="channelFeeDetailDialog.visible"
      width="720px"
      custom-class="settlement-ledger-dialog"
      append-to-body
      @close="onChannelFeeDetailDialogClose"
    >
      <div v-if="channelFeeDetailDialog.ledgerRow" class="channel-fee-dialog-meta">
        <span>业务订单：{{ channelFeeDetailDialog.ledgerRow.bizOrderCode || '—' }}</span>
        <span class="sep">|</span>
        <span>通道费合计：<span class="channel-fee-platform">{{ money(splitChannelFeeTotal(channelFeeDetailDialog.ledgerRow)) }}</span> 元</span>
      </div>
      <div v-if="channelFeeDetailDialog.payDetails.length" class="channel-fee-section">
        <div class="split-expand-subtitle">支付单通道费（计费基数）</div>
        <el-table
          :data="channelFeeDetailDialog.payDetails"
          border
          size="small"
          style="width: 100%"
        >
          <el-table-column type="index" width="48" label="序号" align="center" />
          <el-table-column prop="payCode" label="支付单号" min-width="160" show-overflow-tooltip />
          <el-table-column label="计费基数(元)" width="120" align="right">
            <template slot-scope="ps">{{ money(ps.row.payMoney) }}</template>
          </el-table-column>
          <el-table-column label="费率(%)" width="90" align="right">
            <template slot-scope="ps">{{ formatChannelFeeRate(ps.row.rate) }}</template>
          </el-table-column>
          <el-table-column label="通道费(元)" width="100" align="right">
            <template slot-scope="ps">
              <span class="channel-fee-platform">{{ money(ps.row.fee) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="channelFeeDetailDialog.merchantAlloc.length" class="channel-fee-section">
        <div class="split-expand-subtitle">商户通道费分摊扣减</div>
        <el-table
          :data="channelFeeDetailDialog.merchantAlloc"
          border
          size="small"
          style="width: 100%"
        >
          <el-table-column label="商户" min-width="180" show-overflow-tooltip>
            <template slot-scope="ma">
              {{ ma.row.merchantName || ('商户ID:' + ma.row.merchantId) }}
              <span v-if="ma.row.merchantNo" class="sub-text">({{ ma.row.merchantNo }})</span>
            </template>
          </el-table-column>
          <el-table-column label="通道费(元)" width="130" align="right">
            <template slot-scope="ma">
              <span class="channel-fee-deduct">{{ formatSignedChannelFee(ma.row) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div
        v-if="!channelFeeDetailDialog.payDetails.length && !channelFeeDetailDialog.merchantAlloc.length"
        class="ledger-empty-tip"
      >暂无通道费明细</div>
    </el-dialog>
    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import {
  periodPage,
  periodDetail,
  linePage,
  exportLinePage,
  submitPayout,
  ingestTaskStats,
  payoutBatchList,
  payoutBatchDetail,
  payoutBatchItems,
  retryPayoutSingleOrder,
  recalcLineSplitPlan
} from '@/api/finance/settlementLedger'
import { getMerchant } from '@/api/merchant/merchant'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import downloadProgress from '@/components/Common/downloadProgress.vue'
import { parseTime } from '@/utils/index'

export default {
  name: 'SettlementLedger',
  components: {
    downloadProgress
  },
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
      stationList: [],
      lineExportLoading: false,
      payoutSubmittingId: null,
      taskMonitorVisible: true,
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
        bizOrderCode: '',
        payCode: ''
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
      },
      channelFeeDetailDialog: {
        visible: false,
        ledgerRow: null,
        payDetails: [],
        merchantAlloc: []
      },
      recalcLineSplitLoadingId: null
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
    this.initStationList()
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
    initStationList() {
      getChargingStationList({})
        .then(res => {
          if (res.code === 200) {
            this.stationList = res.data || []
          } else {
            this.stationList = []
          }
        })
        .catch(() => {
          this.stationList = []
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
    splitChannelFeeTotal(row) {
      const items = row && row.splitItems
      if (!Array.isArray(items) || items.length === 0) return 0
      return items.reduce((sum, item) => {
        if (!item || !item.isPlatformMerchant) return sum
        return sum + (Number(item.channelFeeAmount) || 0)
      }, 0)
    },
    parseChannelFeeDetailRoot(ledgerRow) {
      const items = ledgerRow && ledgerRow.splitItems
      if (!Array.isArray(items)) return null
      const platform = items.find(i => i && i.isPlatformMerchant && i.channelFeeDetail)
      if (!platform || !platform.channelFeeDetail) return null
      try {
        return typeof platform.channelFeeDetail === 'string'
          ? JSON.parse(platform.channelFeeDetail)
          : platform.channelFeeDetail
      } catch (e) {
        return null
      }
    },
    /** 支付单维度通道费（兼容旧版 JSON 数组与新结构 { paySources: [] }） */
    splitChannelFeePayDetails(ledgerRow) {
      const root = this.parseChannelFeeDetailRoot(ledgerRow)
      if (!root) return []
      if (Array.isArray(root)) {
        return root.map(row => ({
          payCode: row.payCode || row.pay_code || '—',
          payMoney: row.payMoney != null ? row.payMoney : row.pay_money,
          rate: row.rate != null ? row.rate : row.channelFeeRate,
          fee: row.fee != null ? row.fee : row.channelFeeAmount
        }))
      }
      const list = root.paySources || root.pay_sources
      if (!Array.isArray(list)) return []
      return list.map(row => ({
        payCode: row.payCode || row.pay_code || '—',
        payMoney: row.payMoney != null ? row.payMoney : row.pay_money,
        rate: row.rate != null ? row.rate : row.channelFeeRate,
        fee: row.fee != null ? row.fee : row.channelFeeAmount
      }))
    },
    /** 商户分摊扣减（新结构 merchantAlloc；否则从各行有符号 channelFeeAmount 汇总） */
    splitChannelFeeMerchantAlloc(ledgerRow) {
      const root = this.parseChannelFeeDetailRoot(ledgerRow)
      if (root && !Array.isArray(root)) {
        const list = root.merchantAlloc || root.merchant_alloc
        if (Array.isArray(list) && list.length) return list
      }
      const items = ledgerRow && ledgerRow.splitItems
      if (!Array.isArray(items)) return []
      return items
        .filter(i => i && !i.isPlatformMerchant && this.resolveSignedChannelFee(i) < 0)
        .map(i => ({
          merchantId: i.merchantId,
          merchantName: i.merchantName,
          merchantNo: i.merchantNo,
          channelFeeAmount: Number(i.channelFeeAmount)
        }))
    },
    resolveSignedChannelFee(item) {
      if (!item) return 0
      const n = Number(item.channelFeeAmount)
      return Number.isNaN(n) ? 0 : n
    },
    formatSignedChannelFee(item) {
      if (!item) return '—'
      const n = this.resolveSignedChannelFee(item)
      if (n === 0) return '—'
      if (n > 0) return `+${this.money(n)}`
      return `−${this.money(Math.abs(n))}`
    },
    hasChannelFeeAmount(item) {
      return this.resolveSignedChannelFee(item) !== 0
    },
    formatChannelFeeRate(val) {
      if (val === null || val === undefined || val === '') return '—'
      const n = Number(val)
      if (Number.isNaN(n)) return '—'
      return `${n.toFixed(4)}%`
    },
    hasChannelFeeDetail(ledgerRow) {
      if (!ledgerRow) return false
      return this.splitChannelFeeTotal(ledgerRow) > 0
        || this.splitChannelFeePayDetails(ledgerRow).length > 0
        || this.splitChannelFeeMerchantAlloc(ledgerRow).length > 0
    },
    openChannelFeeDetailDialog(ledgerRow) {
      if (!ledgerRow) return
      this.channelFeeDetailDialog.ledgerRow = ledgerRow
      this.channelFeeDetailDialog.payDetails = this.splitChannelFeePayDetails(ledgerRow)
      this.channelFeeDetailDialog.merchantAlloc = this.splitChannelFeeMerchantAlloc(ledgerRow)
      this.channelFeeDetailDialog.visible = true
    },
    onChannelFeeDetailDialogClose() {
      this.channelFeeDetailDialog.ledgerRow = null
      this.channelFeeDetailDialog.payDetails = []
      this.channelFeeDetailDialog.merchantAlloc = []
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
      if (!this.taskMonitorVisible) return
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
          } else if (res && Number(res.code) === 401) {
            this.taskMonitorVisible = false
            this.taskStatsError = ''
            this.stopTaskStatsAutoRefresh()
          } else {
            this.taskStatsError = (res && res.msg) || '任务统计加载失败'
            if (!silent) this.$message.error(this.taskStatsError)
          }
        })
        .catch(err => {
          if (err && err.response && Number(err.response.status) === 401) {
            this.taskMonitorVisible = false
            this.taskStatsError = ''
            this.stopTaskStatsAutoRefresh()
            return
          }
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
        bizOrderCode: '',
        payCode: ''
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
      this.lineExportLoading = false
    },
    buildLinePayload(exportMode) {
      const sid = this.lineQuery.stationId
      return {
        periodId: this.drawer.periodId,
        page: exportMode ? 1 : this.lineQuery.page,
        limit: exportMode ? 2000 : this.lineQuery.limit,
        merchantId: this.lineQuery.merchantId === '' ? null : this.lineQuery.merchantId,
        stationId: sid === '' || sid === null ? null : Number(sid),
        bizOrderCode: this.lineQuery.bizOrderCode || null,
        payCode: this.lineQuery.payCode || null
      }
    },
    canRecalcLineSplit(row) {
      if (!row || !row.id) return false
      if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:settlementLedger:line:recalcSplit')) {
        return false
      }
      const status = this.drawer.summary && this.drawer.summary.status
      return status !== 2
    },
    onRecalcLineSplit(row) {
      if (!row || !row.id) return
      this.$confirm(
        `确认对业务订单「${row.bizOrderCode || row.id}」重算预分账明细？台账行金额不变，仅覆盖预分账结果。`,
        '预分账重算',
        { type: 'warning' }
      )
        .then(() => {
          this.recalcLineSplitLoadingId = row.id
          return recalcLineSplitPlan(row.id)
        })
        .then(res => {
          if (res && res.code === 200) {
            this.$message.success(res.msg || '预分账重算成功')
            const updated = res.data && res.data.line
            if (updated && updated.id) {
              const idx = this.drawer.lines.findIndex(l => l.id === updated.id)
              if (idx >= 0) {
                this.$set(this.drawer.lines, idx, updated)
              } else {
                this.loadLines()
              }
            } else {
              this.loadLines()
            }
          } else {
            this.$message.error((res && res.msg) || '预分账重算失败')
          }
        })
        .catch(() => {})
        .finally(() => {
          this.recalcLineSplitLoadingId = null
        })
    },
    loadLines() {
      if (!this.drawer.periodId) return
      if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:settlementLedger:lines')) {
        this.drawer.lines = []
        this.drawer.lineTotal = 0
        return
      }
      this.drawer.lineLoading = true
      const payload = this.buildLinePayload(false)
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
    exportLines() {
      if (!this.drawer.periodId) return
      if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:settlementLedger:lines:export')) {
        this.$message.error('暂无导出权限')
        return
      }
      this.lineExportLoading = true
      exportLinePage(this.buildLinePayload(true))
        .then(res => {
          if (res.code === 200 && res.data && res.data.id) {
            this.$refs.downloadProgress.open(res.data.id)
          } else {
            this.$message.error((res && res.msg) || '导出失败')
          }
        })
        .finally(() => {
          this.lineExportLoading = false
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
        `确认对账期「${row.periodKey}」提交分账任务？任务将在后台执行，提交后可在「台账明细」-「分账执行记录」查看进度与结果。`,
        '提交分账',
        { type: 'warning' }
      ).then(() => {
        this.payoutSubmittingId = row.id
        submitPayout({ periodId: row.id })
          .then(res => {
            if (res.code === 200) {
              this.$message.success(
                res.msg || '分账任务已提交，请在「台账明细」-「分账执行记录」查看进度'
              )
              this.getList()
              if (this.drawer.visible && this.drawer.periodId === row.id) {
                this.loadPayoutBatches()
              }
            } else {
              this.$message.error(res.msg || '提交失败')
            }
          })
          .catch(() => {
            this.$message.error('提交失败，请稍后重试')
          })
          .finally(() => {
            this.payoutSubmittingId = null
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
.payout-batch-refresh-btn.el-button--primary {
  color: #fff;
}
.payout-batch-refresh-btn.el-button--primary:focus,
.payout-batch-refresh-btn.el-button--primary:hover {
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
.split-expand-wrap ::v-deep .el-table th > .cell {
  text-align: center;
}
.split-expand-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.ledger-empty-tip {
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  color: #909399;
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
.split-expand-subtitle {
  font-size: 12px;
  color: #606266;
  margin: 12px 0 8px;
  font-weight: 600;
}
.channel-fee-section {
  margin-top: 4px;
  margin-bottom: 8px;
}
.channel-fee-platform {
  color: #e6a23c;
  font-weight: 600;
}
.channel-fee-deduct {
  color: #f56c6c;
  font-weight: 500;
}
.channel-fee-detail-link {
  color: #409eff;
  padding: 0;
}
.channel-fee-dialog-meta {
  margin-bottom: 12px;
  font-size: 13px;
  color: #606266;
}
.channel-fee-dialog-meta .sep {
  margin: 0 8px;
  color: #dcdfe6;
}
.sub-text {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}
</style>

<style>
/* append-to-body 时抽屉/弹窗挂到 body，scoped 无法命中 */
.settlement-ledger-drawer .el-drawer__body {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
.settlement-ledger-page .el-table th > .cell,
.settlement-ledger-drawer .el-table th > .cell,
.settlement-ledger-dialog .el-table th > .cell {
  text-align: center;
}
</style>
