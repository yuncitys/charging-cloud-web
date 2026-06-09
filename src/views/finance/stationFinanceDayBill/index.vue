<template>
  <div class="app-container station-finance-day-bill-page">
    <el-alert
      class="bill-role-tip"
      type="info"
      :closable="false"
      show-icon
      title="数据说明"
      description="按充电结束日统计，T+1 同步；仅展示已出账订单；查询结束日不超过昨日。"
    />

    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="form left" @submit.native.prevent="search">
        <el-form-item label="账单粒度">
          <el-radio-group v-model="searchForm.billType" size="small" @change="onBillTypeChange">
            <el-radio-button label="day">日</el-radio-button>
            <el-radio-button label="month">月</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="dateRangeLabel">
          <el-date-picker
            :key="searchForm.billType"
            v-model="dateRange"
            :type="datePickerType"
            range-separator="至"
            :start-placeholder="dateStartPlaceholder"
            :end-placeholder="dateEndPlaceholder"
            :format="dateFormat"
            :value-format="dateValueFormat"
            :picker-options="pickerOptions"
            unlink-panels
            :clearable="false"
            style="width: 260px"
            @change="onDateRange"
          />
        </el-form-item>
        <el-form-item label="商户">
          <el-select
            v-model="searchForm.merchantId"
            clearable
            filterable
            placeholder="全部"
            style="width: 200px"
            @change="onMerchantChange"
          >
            <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="站点">
          <el-select
            v-model="searchForm.stationIds"
            clearable
            filterable
            multiple
            collapse-tags
            placeholder="全部"
            style="width: 240px"
          >
            <el-option
              v-for="s in filteredStationList"
              :key="s.id"
              :label="s.networkName"
              :value="s.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业态">
          <el-select v-model="searchForm.ruleId" clearable placeholder="全部" style="width: 130px">
            <el-option :value="1" label="单车桩" />
            <el-option :value="2" label="汽车桩" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="summaryLoading || listLoading"
            @click="search"
          >搜索</el-button>
          <el-button
            v-if="canExport"
            type="primary"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
      <div v-if="summary.statHint" class="stat-hint">{{ summary.statHint }}</div>
    </div>

    <div v-loading="summaryLoading" class="kpi-row">
      <div class="kpi-card kpi-card--settle">
        <div class="kpi-card__label">结算金额（元）</div>
        <div class="kpi-card__value">{{ money(summary.settledTotalAmount) }}</div>
      </div>
      <div class="kpi-card kpi-card--order">
        <div class="kpi-card__label">出账合计（元）</div>
        <div class="kpi-card__value">{{ money(summary.orderTotalAmount) }}</div>
      </div>
      <div class="kpi-card kpi-card--count">
        <div class="kpi-card__label">出账笔数</div>
        <div class="kpi-card__value">{{ summary.billedOrderCount != null ? summary.billedOrderCount : 0 }}</div>
      </div>
      <div class="kpi-card kpi-card--degree">
        <div class="kpi-card__label">出账电量（度）</div>
        <div class="kpi-card__value">{{ degree(summary.billedTotalDegree) }}</div>
      </div>
    </div>

    <div v-loading="summaryLoading" class="chart-panel">
      <div class="chart-panel__title">周期结算金额趋势</div>
      <finance-bill-trend-line-chart v-if="hasTrendData" :chart-data="lineChartData" />
      <div v-else-if="!summaryLoading" class="chart-empty">
        <span class="chart-empty__text">暂无数据</span>
      </div>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @row-click="openDetail"
    >
      <el-table-column type="index" width="50" label="序号" align="center" :index="indexMethod" />
      <el-table-column prop="summaryDate" label="统计日" min-width="110" align="center" />
      <el-table-column prop="merchantName" label="商户" min-width="140" align="center" show-overflow-tooltip />
      <el-table-column prop="stationName" label="站点" min-width="160" align="center" show-overflow-tooltip />
      <!-- <el-table-column label="业态" width="90" align="center">
        <template slot-scope="scope">{{ ruleLabel(scope.row.ruleId) }}</template>
      </el-table-column> -->
      <el-table-column prop="billedOrderCount" label="出账笔数" width="100" align="center" />
      <el-table-column label="出账电量" width="110" align="center">
        <template slot-scope="scope">{{ degree(scope.row.billedTotalDegree) }}</template>
      </el-table-column>
      <el-table-column label="出账电费" width="110" align="center">
        <template slot-scope="scope">{{ money(scope.row.electricityAmount) }}</template>
      </el-table-column>
      <el-table-column label="出账服务费" width="110" align="center">
        <template slot-scope="scope">{{ money(scope.row.serviceAmount) }}</template>
      </el-table-column>
      <el-table-column label="出账合计" width="110" align="center">
        <template slot-scope="scope">{{ money(scope.row.orderTotalAmount) }}</template>
      </el-table-column>
      <el-table-column label="结算金额" width="110" align="center">
        <template slot-scope="scope">{{ money(scope.row.settledTotalAmount) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click.stop="openDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="searchForm.page"
        :page-size="searchForm.limit"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer
      title="账单详情"
      :visible.sync="detailVisible"
      size="60%"
      direction="rtl"
      :wrapper-closable="true"
      append-to-body
    >
      <div v-if="detailRow" class="detail-drawer-body">
        <div class="detail-head">
          <div class="detail-head__item"><span class="k">统计日</span><span class="v">{{ detailRow.summaryDate || '—' }}</span></div>
          <div class="detail-head__item"><span class="k">商户</span><span class="v">{{ detailRow.merchantName || '—' }}</span></div>
          <div class="detail-head__item"><span class="k">站点</span><span class="v">{{ detailRow.stationName || '—' }}</span></div>
          <div class="detail-head__item"><span class="k">业态</span><span class="v">{{ ruleLabel(detailRow.ruleId) }}</span></div>
        </div>

        <div class="detail-block">
          <div class="detail-block__title">出账收入</div>
          <div v-for="row in incomeRows" :key="row.key" class="detail-row">
            <span class="detail-row__label">{{ row.label }}</span>
            <span class="detail-row__val">{{ row.display }}</span>
          </div>
        </div>

        <div class="detail-block">
          <div class="detail-block__title">支出项目</div>
          <div v-for="row in expenseRows" :key="row.key" class="detail-row">
            <span class="detail-row__label">{{ row.label }}</span>
            <span class="detail-row__val">{{ row.display }}</span>
          </div>
        </div>

        <div class="detail-settle">
          <div class="detail-settle__head">
            <span class="detail-settle__label">结算金额</span>
            <span class="detail-settle__val">{{ money(detailRow.settledTotalAmount) }}</span>
          </div>
          <div class="detail-settle__hint">温馨提示：实际打款可能扣除平台抽成、通道费、三方分账等。</div>
        </div>
      </div>
      <div class="detail-drawer-footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-drawer>

    <downloadProgress ref="downloadProgress" />
  </div>
</template>

<script>
import { getMerchant } from '@/api/merchant/merchant'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import { summary, page, exportBill } from '@/api/finance/stationFinanceDayBill'
import downloadProgress from '@/components/Common/downloadProgress.vue'
import FinanceBillTrendLineChart from '../components/FinanceBillTrendLineChart.vue'

const MIN_DATE = '2024-09-01'

function formatDate(d) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatMonth(d) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  return `${y}-${m}`
}

function lastDayOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return formatDate(new Date(y, m, 0))
}

function monthToComparable(ym) {
  const [y, m] = ym.split('-').map(Number)
  return y * 100 + m
}

export default {
  name: 'StationFinanceDayBill',
  components: { downloadProgress, FinanceBillTrendLineChart },
  data() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dayStart = new Date(yesterday)
    dayStart.setDate(dayStart.getDate() - 29)
    const maxDate = formatDate(yesterday)
    const defaultDayStart = formatDate(dayStart)
    const monthEnd = formatMonth(yesterday)
    const monthStartDate = new Date(yesterday)
    monthStartDate.setMonth(monthStartDate.getMonth() - 2)
    const defaultMonthStart = formatMonth(monthStartDate)
    return {
      maxDate,
      maxMonth: monthEnd,
      dateRange: [defaultDayStart, maxDate],
      searchForm: {
        startDate: defaultDayStart,
        endDate: maxDate,
        merchantId: null,
        stationIds: [],
        ruleId: null,
        billType: 'day',
        page: 1,
        limit: 10
      },
      defaultDayRange: [defaultDayStart, maxDate],
      defaultMonthRange: [defaultMonthStart, monthEnd],
      merchantList: [],
      stationList: [],
      summary: {
        settledTotalAmount: 0,
        orderTotalAmount: 0,
        billedOrderCount: 0,
        billedTotalDegree: 0,
        trendPoints: [],
        statHint: ''
      },
      list: [],
      total: 0,
      summaryLoading: false,
      listLoading: false,
      exportLoading: false,
      detailVisible: false,
      detailRow: null
    }
  },
  computed: {
    canExport() {
      return this.btnAuthen && this.btnAuthen.permsVerifAuthention(':web:stationFinanceDayBill:export')
    },
    datePickerType() {
      return this.searchForm.billType === 'month' ? 'monthrange' : 'daterange'
    },
    dateFormat() {
      return this.searchForm.billType === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd'
    },
    dateValueFormat() {
      return this.searchForm.billType === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd'
    },
    dateRangeLabel() {
      return this.searchForm.billType === 'month' ? '统计月份' : '统计日期'
    },
    dateStartPlaceholder() {
      return this.searchForm.billType === 'month' ? '开始月份' : '开始日期'
    },
    dateEndPlaceholder() {
      return this.searchForm.billType === 'month' ? '结束月份' : '结束日期'
    },
    pickerOptions() {
      const billType = this.searchForm.billType
      const maxDate = this.maxDate
      const maxMonth = this.maxMonth
      const minMonth = monthToComparable('2024-09')
      if (billType === 'month') {
        return {
          disabledDate(time) {
            const ym = formatMonth(time)
            const cmp = monthToComparable(ym)
            return cmp > monthToComparable(maxMonth) || cmp < minMonth
          }
        }
      }
      return {
        disabledDate(time) {
          const t = formatDate(time)
          return t > maxDate || t < MIN_DATE
        }
      }
    },
    filteredStationList() {
      if (!this.searchForm.merchantId) {
        return this.stationList
      }
      return this.stationList.filter(s => s.merchantId === this.searchForm.merchantId)
    },
    hasTrendData() {
      return this.summary.trendPoints && this.summary.trendPoints.length > 0
    },
    lineChartData() {
      const points = this.summary.trendPoints || []
      return {
        datetime: points.map(p => p.summaryDate),
        income: points.map(p => Number(p.income) || 0)
      }
    },
    incomeRows() {
      const l = this.detailRow || {}
      return [
        { key: 'billed', label: '出账订单数', display: this.fmtCount(l.billedOrderCount) },
        { key: 'degree', label: '出账电量(度)', display: this.degree(l.billedTotalDegree) },
        { key: 'elec', label: '出账电费', display: this.money(l.electricityAmount) },
        { key: 'service', label: '出账服务费', display: this.money(l.serviceAmount) },
        { key: 'orderTotal', label: '出账合计', display: this.money(l.orderTotalAmount) },
        { key: 'userPay', label: '用户实付', display: this.money(l.userActualPayAmount) },
        { key: 'orderElec', label: '订单原价电费', display: this.money4(l.orderElectricityAmount) },
        { key: 'orderService', label: '订单原价服务费', display: this.money4(l.orderServiceAmount) },
        { key: 'settledCount', label: '已结算笔数', display: this.fmtCount(l.settledOrderCount) }
      ]
    },
    expenseRows() {
      const l = this.detailRow || {}
      return [
        { key: 'platform', label: '平台抽成', display: this.money(l.platformCommissionAmount) },
        { key: 'channel', label: '主商户通道费', display: this.money(l.channelFeeAmount) },
        { key: 'thirdChannel', label: '三方通道费', display: this.money(l.thirdPartyChannelFeeAmount) },
        { key: 'thirdSplit', label: '三方分账', display: this.money(l.thirdPartySplitAmount) },
        { key: 'merchantRefund', label: '主商户退款调减', display: this.money(l.merchantRefundAdjustAmount) },
        { key: 'thirdRefund', label: '三方退款调减', display: this.money(l.thirdPartyRefundAdjustAmount) },
        { key: 'platformRefund', label: '平台退款调减', display: this.money(l.platformRefundAdjustAmount) }
      ]
    }
  },
  created() {
    this.initMerchant()
    this.initStationList()
    this.loadAll()
  },
  methods: {
    indexMethod(i) {
      return (this.searchForm.page - 1) * this.searchForm.limit + i + 1
    },
    resolveApiDateRange() {
      if (this.searchForm.billType === 'month') {
        const startMonth = (this.dateRange && this.dateRange[0]) || this.defaultMonthRange[0]
        const endMonth = (this.dateRange && this.dateRange[1]) || this.defaultMonthRange[1]
        let startDate = `${startMonth}-01`
        let endDate = lastDayOfMonth(endMonth)
        if (endDate > this.maxDate) {
          endDate = this.maxDate
        }
        if (startDate < MIN_DATE) {
          startDate = MIN_DATE
        }
        return { startDate, endDate }
      }
      return {
        startDate: this.searchForm.startDate,
        endDate: this.searchForm.endDate
      }
    },
    buildQuery() {
      const { startDate, endDate } = this.resolveApiDateRange()
      return {
        startDate,
        endDate,
        merchantId: this.searchForm.merchantId || undefined,
        stationIds: this.searchForm.stationIds && this.searchForm.stationIds.length ? this.searchForm.stationIds : undefined,
        ruleId: this.searchForm.ruleId || undefined,
        billType: this.searchForm.billType,
        page: this.searchForm.page,
        limit: this.searchForm.limit
      }
    },
    onBillTypeChange(billType) {
      if (billType === 'month') {
        this.dateRange = this.defaultMonthRange.slice()
        this.searchForm.startDate = `${this.dateRange[0]}-01`
        this.searchForm.endDate = lastDayOfMonth(this.dateRange[1])
        if (this.searchForm.endDate > this.maxDate) {
          this.searchForm.endDate = this.maxDate
        }
      } else {
        this.dateRange = this.defaultDayRange.slice()
        this.searchForm.startDate = this.dateRange[0]
        this.searchForm.endDate = this.dateRange[1]
      }
      this.searchForm.page = 1
      this.loadAll()
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) {
          this.merchantList = res.data || []
        }
      })
    },
    initStationList() {
      getChargingStationList({}).then(res => {
        if (res.code === 200) {
          this.stationList = res.data || []
        }
      }).catch(() => {
        this.stationList = []
      })
    },
    onDateRange(val) {
      if (!val || val.length !== 2) {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
        return
      }
      if (this.searchForm.billType === 'month') {
        this.searchForm.startDate = `${val[0]}-01`
        let endDate = lastDayOfMonth(val[1])
        if (endDate > this.maxDate) {
          endDate = this.maxDate
        }
        this.searchForm.endDate = endDate
      } else {
        this.searchForm.startDate = val[0]
        this.searchForm.endDate = val[1]
      }
    },
    onMerchantChange() {
      if (!this.searchForm.merchantId || !this.searchForm.stationIds.length) {
        return
      }
      const allowed = new Set(this.filteredStationList.map(s => s.id))
      this.searchForm.stationIds = this.searchForm.stationIds.filter(id => allowed.has(id))
    },
    search() {
      this.searchForm.page = 1
      this.loadAll()
    },
    loadAll() {
      this.loadSummary()
      this.loadPage()
    },
    loadSummary() {
      this.summaryLoading = true
      summary(this.buildQuery()).then(res => {
        if (res.code === 200 && res.data) {
          this.summary = Object.assign({
            settledTotalAmount: 0,
            orderTotalAmount: 0,
            billedOrderCount: 0,
            billedTotalDegree: 0,
            trendPoints: [],
            statHint: ''
          }, res.data)
        } else {
          this.$message.error((res && res.msg) || '加载汇总失败')
        }
      }).finally(() => {
        this.summaryLoading = false
      })
    },
    loadPage() {
      this.listLoading = true
      page(this.buildQuery()).then(res => {
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error((res && res.msg) || '加载列表失败')
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.searchForm.page = 1
      this.loadPage()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.loadPage()
    },
    handleExport() {
      if (!this.canExport) {
        this.$message.warning('暂无导出权限')
        return
      }
      this.exportLoading = true
      const payload = this.buildQuery()
      delete payload.page
      delete payload.limit
      exportBill(payload).then(res => {
        if (res.code === 200 && res.data && res.data.id) {
          this.$refs.downloadProgress.open(res.data.id)
        } else {
          this.$message.error((res && res.msg) || '导出失败')
        }
      }).finally(() => {
        this.exportLoading = false
      })
    },
    openDetail(row) {
      this.detailRow = row
      this.detailVisible = true
    },
    ruleLabel(ruleId) {
      if (ruleId === 1) return '单车桩'
      if (ruleId === 2) return '汽车桩'
      return '—'
    },
    money(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toFixed(2)
    },
    money4(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toFixed(4)
    },
    degree(v) {
      if (v === null || v === undefined || v === '') return '—'
      const n = Number(v)
      if (Number.isNaN(n)) return '—'
      return n.toFixed(4)
    },
    fmtCount(v) {
      if (v === null || v === undefined || v === '') return '—'
      return String(v)
    }
  }
}
</script>

<style scoped>
.station-finance-day-bill-page {
  padding-bottom: 20px;
}
.bill-role-tip {
  margin-bottom: 16px;
}
.stat-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
}
.filter-actions .el-button + .el-button {
  margin-left: 8px;
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.kpi-card {
  border-radius: 12px;
  padding: 16px 18px;
  color: #fff;
  min-height: 88px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.kpi-card__label {
  font-size: 13px;
  opacity: 0.92;
}
.kpi-card__value {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}
.kpi-card--settle { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.kpi-card--order { background: linear-gradient(135deg, #10b981, #22c55e); }
.kpi-card--count { background: linear-gradient(135deg, #f97316, #fb923c); }
.kpi-card--degree { background: linear-gradient(135deg, #8b5cf6, #4f46e5); }
.chart-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 14px 16px 8px;
  margin-bottom: 16px;
}
.chart-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  color: #909399;
  font-size: 14px;
}
.detail-drawer-body {
  padding: 8px 20px 72px;
}
.detail-head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-bottom: 16px;
  padding: 14px;
  background: #f5f7fa;
  border-radius: 8px;
}
.detail-head__item .k {
  display: block;
  font-size: 12px;
  color: #909399;
}
.detail-head__item .v {
  display: block;
  margin-top: 4px;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}
.detail-block {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}
.detail-block__title {
  padding: 10px 14px;
  font-weight: 600;
  color: #303133;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid #f2f3f5;
  font-size: 13px;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-row__label { color: #606266; }
.detail-row__val { color: #303133; font-weight: 600; }
.detail-settle {
  padding: 14px;
  border-radius: 8px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
}
.detail-settle__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-settle__label {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}
.detail-settle__val {
  font-size: 22px;
  color: #409EFF;
  font-weight: 700;
}
.detail-settle__hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
.detail-drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
</style>
