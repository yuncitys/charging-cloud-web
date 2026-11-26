<template>
  <div class="app-container abnormal-order-list">
    <el-row :gutter="12" class="summary-row">
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">待处理</div>
          <div class="summary-value warning">{{ summary.pendingCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">今日新增</div>
          <div class="summary-value">{{ summary.todayNewCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">结算失败</div>
          <div class="summary-value danger">{{ summary.settleFailedCount || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">今日已结算</div>
          <div class="summary-value success">{{ summary.todaySettledCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-form :inline="true" size="small" class="filter-row" @submit.native.prevent>
      <el-form-item label="状态">
        <el-select v-model="listQuery.status" clearable style="width: 130px;" @change="handleFilter">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="异常类型">
        <el-select v-model="listQuery.abnormalType" clearable style="width: 190px;" @change="handleFilter">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单号">
        <el-input v-model="listQuery.orderCode" clearable placeholder="业务单号" style="width: 190px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      </el-form-item>
      <el-form-item label="设备号">
        <el-input v-model="listQuery.deviceCode" clearable placeholder="精确设备号" style="width: 170px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      </el-form-item>
      <el-form-item label="检测时间">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 340px;"
          @change="onTimeChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" icon="el-icon-search" @click="handleFilter">查询</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="resetSearch">重置</el-button>
        <el-button
          v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:abnormal:export')"
          size="small"
          type="primary"
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出凭证</el-button>
        <download-progress ref="downloadProgress" />
      </el-form-item>
    </el-form>

    <el-table
      id="tableBox"
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      fit
      :max-height="tableMaxHeight"
      style="width: 100%;"
      class="order-layout-table abnormal-data-table"
    >
      <el-table-column label="异常单" min-width="300">
        <template slot-scope="scope">
          <div class="order-layout-col order-layout-col--order">
            <div class="order-layout-item">
              <span>订单号：</span>
              <span class="order-layout-value">{{ scope.row.orderCode }}</span>
            </div>
            <div class="order-layout-item">
              <span>异常类型：</span>
              <span class="order-layout-value">
                <el-tag size="mini" :type="typeTag(scope.row.abnormalType)">{{ typeText(scope.row.abnormalType) }}</el-tag>
              </span>
            </div>
            <div class="order-layout-item">
              <span>异常原因：</span>
              <span class="order-layout-value" :title="scope.row.abnormalReason">{{ scope.row.abnormalReason || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="设备 / 用户" min-width="240">
        <template slot-scope="scope">
          <div class="order-layout-col order-layout-col--station">
            <div class="order-layout-item">
              <span>设备/枪：</span>
              <span class="order-layout-value">{{ scope.row.deviceCode || '-' }} / {{ scope.row.devicePort == null ? '-' : scope.row.devicePort }}</span>
            </div>
            <div class="order-layout-item">
              <span>用户：</span>
              <span class="order-layout-value">{{ scope.row.phoneNumber || scope.row.userCode || scope.row.plateNumber || '-' }}</span>
            </div>
            <div class="order-layout-item">
              <span>支付方式：</span>
              <span class="order-layout-value">{{ scope.row.payType || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="上报凭证" min-width="260">
        <template slot-scope="scope">
          <div class="order-layout-col order-layout-col--charge">
            <div class="order-layout-item">
              <span>上报电量：</span>
              <span class="order-layout-value">{{ money(scope.row.reportedPower) }} 度</span>
            </div>
            <div class="order-layout-item">
              <span>上报金额：</span>
              <span class="order-layout-value">{{ money(scope.row.reportedAmount) }} 元</span>
            </div>
            <div class="order-layout-item">
              <span>容量/来源：</span>
              <span class="order-layout-value">{{ scope.row.deviceCapacityW || '-' }}W / {{ capacityText(scope.row.capacitySource) }}</span>
            </div>
            <div class="order-layout-item">
              <span>电表起止：</span>
              <span class="order-layout-value">{{ money(scope.row.meterStart) }} → {{ money(scope.row.meterEnd) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="处理状态" min-width="230">
        <template slot-scope="scope">
          <div class="order-layout-col order-layout-col--pay">
            <div class="order-layout-item">
              <span>状态：</span>
              <span class="order-layout-value">
                <el-tag size="mini" :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
              </span>
            </div>
            <div class="order-layout-item">
              <span>检测时间：</span>
              <span class="order-layout-value">{{ formatTime(scope.row.detectTime) }}</span>
            </div>
            <div class="order-layout-item">
              <span>失败原因：</span>
              <span class="order-layout-value" :title="scope.row.lastError">{{ scope.row.lastError || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="190" fixed="right" align="center">
        <template slot-scope="scope">
          <div class="abnormal-actions">
            <el-button size="mini" type="primary" icon="el-icon-view" @click="openDetail(scope.row)">详情</el-button>
            <el-dropdown
              v-if="canSettle && scope.row.status === 1"
              size="mini"
              trigger="click"
              @command="(command) => handleCommand(command, scope.row)"
            >
              <el-button size="mini" type="primary" icon="el-icon-d-arrow-right">更多</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="settle" icon="el-icon-edit-outline">确认结算</el-dropdown-item>
                <el-dropdown-item command="retry" icon="el-icon-refresh">重新结算</el-dropdown-item>
                <el-dropdown-item command="void" icon="el-icon-delete" divided>作废</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
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

    <abnormal-settle-dialog
      :visible.sync="settleVisible"
      :row="currentRow"
      @success="loadData"
    />

    <el-drawer
      title="异常订单详情"
      :visible.sync="detailVisible"
      direction="rtl"
      size="1000px"
      append-to-body
      custom-class="abnormal-detail-drawer"
    >
      <template v-if="detail">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="订单号">{{ detail.orderCode }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ detail.payType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusText(detail.status) }}</el-descriptions-item>
          <el-descriptions-item label="异常类型">{{ typeText(detail.abnormalType) }}</el-descriptions-item>
          <el-descriptions-item label="检测来源">{{ detectSourceText(detail.detectSource) }}</el-descriptions-item>
          <el-descriptions-item label="检测时间">{{ formatTime(detail.detectTime) }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">{{ money(detail.orderTotalPrice || detail.totalPrice) }} 元</el-descriptions-item>
          <el-descriptions-item label="上报电量">{{ money(detail.reportedPower) }} 度</el-descriptions-item>
          <el-descriptions-item label="上报金额">{{ money(detail.reportedAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="容量/来源">{{ detail.deviceCapacityW || '-' }}W / {{ capacityText(detail.capacitySource) }}</el-descriptions-item>
          <el-descriptions-item label="电表起止">{{ money(detail.meterStart) }} → {{ money(detail.meterEnd) }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ detail.durationMinutes == null ? '-' : detail.durationMinutes + ' 分钟' }}</el-descriptions-item>
          <el-descriptions-item label="计算/结算">{{ money(detail.calcAmount) }} → {{ money(detail.settleAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="结算阶段">{{ stageText(detail.settleStage) }}</el-descriptions-item>
          <el-descriptions-item label="重试次数">{{ detail.settleRetryCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="异常原因" :span="3">{{ detail.abnormalReason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最近失败" :span="3">{{ detail.lastError || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">上报四段电量（凭证）</el-divider>
        <el-table :data="reportedPeriods" size="mini" border>
          <el-table-column prop="name" label="时段" width="70" align="center" />
          <el-table-column prop="electric" label="电量(度)" align="right" />
          <el-table-column prop="price" label="单价(元/度)" align="right" />
          <el-table-column prop="money" label="金额(元)" align="right" />
        </el-table>

        <el-divider content-position="left">处理记录</el-divider>
        <el-table :data="logs" size="mini" border max-height="260">
          <el-table-column prop="action" label="动作" width="120" />
          <el-table-column prop="reason" label="原因" min-width="180" show-overflow-tooltip />
          <el-table-column prop="operatorName" label="操作人" width="110" />
          <el-table-column prop="createTime" label="时间" width="160">
            <template slot-scope="scope">{{ formatTime(scope.row.createTime) }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script>
import { getAbnormalPage, getAbnormalSummary, getAbnormalDetail, voidAbnormal, retryAbnormal, exportAbnormal } from '@/api/order/abnormalOrder.js'
import AbnormalSettleDialog from './components/AbnormalSettleDialog.vue'
import downloadProgress from '@/components/Common/downloadProgress.vue'
import { parseTime } from '@/utils/index'

const TYPE_OPTIONS = [
  { value: 'POWER_OVER_MAX', label: '超绝对上限' },
  { value: 'POWER_OVER_CAPACITY', label: '超功率×时长' },
  { value: 'METER_MISMATCH', label: '电表不符' },
  { value: 'PERIOD_MISMATCH', label: '四段不符' },
  { value: 'AMOUNT_OVER_MAX', label: '金额超上限' },
  { value: 'AMOUNT_OVER_ORDER_TOTAL', label: '金额超订单金额' },
  { value: 'POWER_INVALID', label: '电量/时长非法' },
  { value: 'SETTLE_FAILED', label: '结算失败' },
  { value: 'MANUAL_MARK', label: '人工标记' },
  { value: 'AUTO_ESTIMATE', label: '兜底估算' }
]

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致，keep-alive include 才能命中
  name: 'abnormalOrderList',
  components: { AbnormalSettleDialog, downloadProgress },
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      tableKey: 0,
      tableMaxHeight: 620,
      summary: {},
      timeRange: [],
      listQuery: {
        page: 1,
        limit: 10,
        status: 1,
        abnormalType: '',
        orderCode: '',
        deviceCode: '',
        createTimeStart: '',
        createTimeEnd: ''
      },
      statusOptions: [
        { value: 1, label: '待处理' },
        { value: 2, label: '已结算' },
        { value: 5, label: '已放行' },
        { value: 4, label: '已作废' }
      ],
      typeOptions: TYPE_OPTIONS,
      settleVisible: false,
      currentRow: null,
      detailVisible: false,
      detail: null,
      logs: [],
      exportLoading: false
    }
  },
  computed: {
    canSettle() {
      return this.btnAuthen.permsVerifAuthention(':sys:orderInfo:abnormal:settle')
    },
    reportedPeriods() {
      if (!this.detail) return []
      return [
        { name: '尖', electric: this.detail.reportedJele, price: this.detail.reportedJprice, money: this.detail.reportedJmoney },
        { name: '峰', electric: this.detail.reportedFele, price: this.detail.reportedFprice, money: this.detail.reportedFmoney },
        { name: '平', electric: this.detail.reportedPele, price: this.detail.reportedPprice, money: this.detail.reportedPmoney },
        { name: '谷', electric: this.detail.reportedGele, price: this.detail.reportedGprice, money: this.detail.reportedGmoney }
      ]
    }
  },
  created() {
    const orderCode = this.$route.query.orderCode
    if (orderCode) {
      this.listQuery.orderCode = orderCode
    }
    this.loadData()
  },
  methods: {
    loadData() {
      this.listLoading = true
      Promise.all([getAbnormalPage(this.listQuery), getAbnormalSummary({})]).then(([pageRes, sumRes]) => {
        if (pageRes.code === 200) {
          this.list = pageRes.data || []
          this.total = pageRes.count || 0
        } else {
          this.$message.error(pageRes.msg || '查询失败')
        }
        if (sumRes.code === 200) {
          this.summary = sumRes.data || {}
        }
      }).catch(() => {
        this.$message.error('查询失败')
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.loadData()
    },
    resetSearch() {
      this.timeRange = []
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit,
        status: 1,
        abnormalType: '',
        orderCode: '',
        deviceCode: '',
        createTimeStart: '',
        createTimeEnd: ''
      }
      this.loadData()
    },
    onTimeChange(val) {
      this.listQuery.createTimeStart = val && val[0] ? val[0] : ''
      this.listQuery.createTimeEnd = val && val[1] ? val[1] : ''
      this.handleFilter()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.loadData()
    },
    handleCommand(command, row) {
      if (command === 'settle') {
        this.openSettle(row)
      } else if (command === 'retry') {
        this.retryRow(row)
      } else if (command === 'void') {
        this.voidRow(row)
      }
    },
    openSettle(row) {
      this.currentRow = row
      this.settleVisible = true
    },
    openDetail(row) {
      getAbnormalDetail({ id: row.id }).then((res) => {
        if (res.code === 200 && res.data) {
          this.detail = res.data.record
          this.logs = res.data.logs || []
          this.detailVisible = true
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => {
        this.$message.error('查询失败')
      })
    },
    handleExport() {
      this.exportLoading = true
      exportAbnormal(this.listQuery).then((res) => {
        if (res.code === 200 && res.data && res.data.id) {
          this.$refs.downloadProgress.open(res.data.id)
        } else {
          this.$message.error(res.msg || '导出失败')
        }
      }).catch(() => {
        this.$message.error('导出失败')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    retryRow(row) {
      this.$confirm('将按订单当前金额重试结算（可能重新扣款/退款），确认继续？', '重新结算', { type: 'warning' }).then(() => {
        return retryAbnormal({ id: row.id, orderCode: row.orderCode, reason: '异常订单重新结算' })
      }).then((res) => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || '重试成功')
          this.loadData()
          return
        }
        if (res && res.msg && res.msg.indexOf('扣款状态未知') >= 0) {
          return this.$confirm(res.msg + '\n确认已核对余额且强制重试？', '阶段不明确', { type: 'error' }).then(() => {
            return retryAbnormal({ id: row.id, orderCode: row.orderCode, force: true, reason: '人工核对后强制重试' })
          }).then((forceRes) => {
            if (forceRes.code === 200) {
              this.$message.success(forceRes.msg || '重试成功')
              this.loadData()
            } else {
              this.$message.error(forceRes.msg || '重试失败')
            }
          })
        }
        this.$message.error((res && res.msg) || '重试失败')
      }).catch(() => {})
    },
    voidRow(row) {
      this.$prompt('请输入作废原因', '作废异常单', { inputValidator: (v) => !!(v && v.trim()) }).then(({ value }) => {
        return voidAbnormal({ id: row.id, orderCode: row.orderCode, reason: value })
      }).then((res) => {
        if (res && res.code === 200) {
          this.$message.success('已作废')
          this.loadData()
        } else if (res) {
          this.$message.error(res.msg || '作废失败')
        }
      }).catch(() => {})
    },
    formatTime(value) {
      return value ? parseTime(value) : '-'
    },
    money(value) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      return Number.isFinite(num) ? num.toFixed(2) : value
    },
    statusText(status) {
      return { 1: '待处理', 2: '修正后已结算', 3: '按上报值已结算', 4: '已作废', 5: '已放行' }[status] || '-'
    },
    statusTag(status) {
      return { 1: 'warning', 2: 'success', 3: 'success', 4: 'info', 5: 'info' }[status] || ''
    },
    typeText(type) {
      const item = TYPE_OPTIONS.find((t) => t.value === type)
      return item ? item.label : (type || '-')
    },
    typeTag(type) {
      if (type === 'SETTLE_FAILED') return 'danger'
      if (type === 'MANUAL_MARK' || type === 'AUTO_ESTIMATE') return 'info'
      return 'warning'
    },
    capacityText(source) {
      return {
        CAPACITY_FIELD: '功率上限',
        DEVICE_TOTAL_POWER: '设备总功率',
        DEFAULT: '默认7000W'
      }[source] || '-'
    },
    detectSourceText(source) {
      return { device: '设备上报', job: '兜底任务', manual: '人工' }[source] || (source || '-')
    },
    stageText(stage) {
      return { NONE: '未结算', BILLED: '已计费待支付', PAYING: '支付中', PAID: '已支付' }[stage] || (stage || '-')
    }
  }
}
</script>

<style scoped>
.summary-row {
  margin-bottom: 12px;
}
.summary-card {
  text-align: center;
}
.summary-label {
  color: #909399;
  font-size: 13px;
}
.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.summary-value.warning {
  color: #e6a23c;
}
.summary-value.danger {
  color: #f56c6c;
}
.summary-value.success {
  color: #67c23a;
}
.filter-row {
  margin-bottom: 8px;
}
.abnormal-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.abnormal-data-table ::v-deep .el-table__cell {
  padding: 0 !important;
}
.abnormal-data-table ::v-deep .el-table__header-wrapper th .cell {
  text-align: center;
}
.abnormal-data-table ::v-deep .el-table__body tr:hover > td.el-table__cell,
.abnormal-data-table ::v-deep.el-table--enable-row-hover .el-table__body tr:hover > td,
.abnormal-data-table ::v-deep .el-table__body tr.hover-row > td,
.abnormal-data-table ::v-deep .el-table__body tr.current-row > td,
.abnormal-data-table ::v-deep .el-table__body tr.current-row:hover > td {
  background-color: #fff !important;
}
.abnormal-data-table .order-layout-col {
  padding: 10px 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.abnormal-data-table .order-layout-item {
  font-size: 14px;
  color: #000;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
}
.abnormal-data-table .order-layout-item > span:first-child {
  color: #909399;
  flex-shrink: 0;
  margin-right: 6px;
  text-align: left;
}
.abnormal-data-table .order-layout-col--order .order-layout-item > span:first-child { width: 70px; }
.abnormal-data-table .order-layout-col--station .order-layout-item > span:first-child { width: 70px; }
.abnormal-data-table .order-layout-col--charge .order-layout-item > span:first-child { width: 98px; }
.abnormal-data-table .order-layout-col--pay .order-layout-item > span:first-child { width: 98px; }
.abnormal-data-table .order-layout-value {
  color: #000;
  flex: 1;
  text-align: left;
  display: block;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
