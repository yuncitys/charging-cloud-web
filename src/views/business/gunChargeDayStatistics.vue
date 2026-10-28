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
        v-model="listQuery.merchantId"
        class="filter-item"
        style="width: 200px; margin-right: 20px;"
        filterable
        clearable
        placeholder="请选择商户"
      >
        <el-option v-for="item in merchantList" :key="item.id" :label="item.name" :value="item.id" />
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
      <el-input
        v-model="listQuery.deviceId"
        class="filter-item"
        style="width: 140px; margin-right: 20px;"
        clearable
        placeholder="设备ID"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.gunCode"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        clearable
        placeholder="枪编码"
        @keyup.enter.native="handleFilter"
      />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <div class="gun-summary">
      <div class="gun-summary-item"><span>充电次数</span><b>{{ formatNumber(summary.totalOrderCount, 0) }}</b></div>
      <div class="gun-summary-item"><span>电量(度)</span><b>{{ formatNumber(summary.totalDegree, 4) }}</b></div>
      <div class="gun-summary-item"><span>时长(h)</span><b>{{ formatNumber((summary.totalDuration || 0) / 60, 2) }}</b></div>
      <div class="gun-summary-item"><span>订单总金额(元)</span><b>{{ formatNumber(summary.orderTotalAmount, 2) }}</b></div>
      <div class="gun-summary-item"><span>用户实付(元)</span><b>{{ formatNumber(summary.userActualPayAmount, 2) }}</b></div>
      <div class="gun-summary-item"><span>电费(元)</span><b>{{ formatNumber(summary.totalStandardChargeFee, 4) }}</b></div>
      <div class="gun-summary-item"><span>服务费(元)</span><b>{{ formatNumber(summary.totalStandardServiceFee, 4) }}</b></div>
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
      <el-table-column label="电站" prop="stationName" align="center" min-width="150" show-overflow-tooltip />
      <el-table-column label="设备编号" prop="deviceCode" align="center" min-width="140" show-overflow-tooltip />
      <el-table-column label="枪编码" prop="gunCode" align="center" min-width="150" show-overflow-tooltip />
      <el-table-column label="枪名称" prop="gunName" align="center" min-width="100" show-overflow-tooltip />
      <el-table-column label="电量(度)" prop="totalDegree" align="center" sortable min-width="110" />
      <el-table-column label="充电时长(h)" align="center" sortable min-width="120" :sort-by="'totalDuration'">
        <template slot-scope="scope">{{ formatNumber((scope.row.totalDuration || 0) / 60, 2) }}</template>
      </el-table-column>
      <el-table-column label="充电次数" prop="totalOrderCount" align="center" sortable min-width="100" />
      <el-table-column label="电费(元)" prop="totalStandardChargeFee" align="center" sortable min-width="110" />
      <el-table-column label="服务费(元)" prop="totalStandardServiceFee" align="center" sortable min-width="110" />
      <el-table-column label="订单总金额(元)" prop="orderTotalAmount" align="center" sortable min-width="130" />
      <el-table-column label="用户实付合计(元)" prop="userActualPayAmount" align="center" sortable min-width="140" />
      <el-table-column label="运营商优惠券抵扣(元)" prop="operatorCouponDiscountAmount" align="center" sortable min-width="170" />
      <el-table-column label="运营商电站活动抵扣(元)" prop="operatorStationActivityDiscountAmount" align="center" sortable min-width="180" />
      <el-table-column label="平台优惠券抵扣(元)" prop="platformCouponDiscountAmount" align="center" sortable min-width="160" />
      <el-table-column label="平台电站活动抵扣(元)" prop="platformStationActivityDiscountAmount" align="center" sortable min-width="170" />
      <el-table-column label="用户实付电费(元)" prop="userActualElectricityAmount" align="center" sortable min-width="140" />
      <el-table-column label="用户实付服务费(元)" prop="userActualServiceAmount" align="center" sortable min-width="150" />
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
import { gunChargeDayStatisticsList, gunChargeDayStatisticsSummary } from '@/api/business/businessStatistics.js'
import { getMerchant } from '@/api/merchant/merchant.js'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList.js'

function fmt(date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default {
  name: 'gunChargeDayStatistics',
  data() {
    const start = fmt(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
    const end = fmt(new Date())
    return {
      dateRange: [start, end],
      listQuery: {
        startDate: start,
        endDate: end,
        merchantId: '',
        stationIds: '',
        deviceId: '',
        gunCode: '',
        page: 1,
        limit: 10
      },
      stationIdList: [],
      merchantList: [],
      chargingStationList: [],
      list: [],
      total: 0,
      tableKey: 0,
      listLoading: false,
      summary: {}
    }
  },
  created() {
    this.getMerchantList()
    this.getStationList()
    this.getList()
    this.getSummary()
  },
  methods: {
    buildQuery() {
      return Object.assign({}, this.listQuery, { stationIds: this.stationIdList.join(',') })
    },
    getMerchantList() {
      getMerchant().then(res => {
        this.merchantList = res.code == 200 ? (res.data || []) : []
      }).catch(() => { this.merchantList = [] })
    },
    getStationList() {
      getChargingStationList(0).then(res => {
        this.chargingStationList = res.code == 200 ? (res.data || []) : []
      }).catch(() => { this.chargingStationList = [] })
    },
    getList() {
      this.listLoading = true
      gunChargeDayStatisticsList(this.buildQuery()).then(res => {
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
      gunChargeDayStatisticsSummary(this.buildQuery()).then(res => {
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
    },
    formatNumber(value, fractionDigits = 0) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      if (Number.isNaN(num)) return value
      const parts = num.toFixed(fractionDigits).split('.')
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts[1] ? `${intPart}.${parts[1]}` : intPart
    }
  }
}
</script>

<style scoped>
.gun-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 8px 0 16px;
}
.gun-summary-item {
  min-width: 150px;
  padding: 10px 16px;
  border-radius: 8px;
  background: #f5f7fa;
}
.gun-summary-item span {
  display: block;
  font-size: 12px;
  color: #909399;
}
.gun-summary-item b {
  font-size: 18px;
  color: #303133;
}
</style>
