<template>
  <div class="app-container abnormal-log-list">
    <el-form :inline="true" size="small" class="filter-row" @submit.native.prevent>
      <el-form-item label="订单号">
        <el-input v-model="listQuery.orderCode" clearable placeholder="业务单号" style="width: 180px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      </el-form-item>
      <el-form-item label="动作">
        <el-select v-model="listQuery.action" clearable placeholder="全部" style="width: 150px;" @change="handleFilter">
          <el-option v-for="item in actionOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人">
        <el-input v-model="listQuery.operatorName" clearable placeholder="姓名" style="width: 140px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      </el-form-item>
      <el-form-item label="操作时间">
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
      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="list" size="small" style="width: 100%;">
      <el-table-column prop="orderCode" label="订单号" min-width="200" show-overflow-tooltip />
      <el-table-column label="动作" width="140">
        <template slot-scope="scope">
          <el-tag size="mini" :type="actionTag(scope.row.action)">{{ actionText(scope.row.action) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" min-width="220" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column prop="operatorName" label="操作人" width="120" />
      <el-table-column prop="operatorIp" label="IP" width="140" show-overflow-tooltip />
      <el-table-column label="操作时间" width="170">
        <template slot-scope="scope">{{ formatTime(scope.row.createTime) }}</template>
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
import { getAbnormalLogs } from '@/api/order/abnormalOrder.js'
import { parseTime } from '@/utils/index'

const ACTION_OPTIONS = [
  { value: 'auto_mark', label: '自动登记' },
  { value: 'manual_mark', label: '人工补标记' },
  { value: 'settle', label: '确认结算' },
  { value: 'settle_reported', label: '按上报值结算' },
  { value: 'settle_failed', label: '结算失败' },
  { value: 'retry', label: '重新结算' },
  { value: 'void', label: '作废' }
]

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致
  name: 'abnormalLogList',
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      timeRange: [],
      actionOptions: ACTION_OPTIONS,
      listQuery: {
        page: 1,
        limit: 10,
        orderCode: '',
        action: '',
        operatorName: '',
        createTimeStart: '',
        createTimeEnd: ''
      }
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
      getAbnormalLogs(this.listQuery).then((res) => {
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
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
        orderCode: '',
        action: '',
        operatorName: '',
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
    formatTime(value) {
      return value ? parseTime(value) : '-'
    },
    actionText(action) {
      const item = ACTION_OPTIONS.find((a) => a.value === action)
      return item ? item.label : (action || '-')
    },
    actionTag(action) {
      if (action === 'settle_failed' || action === 'void') return 'danger'
      if (action === 'settle' || action === 'settle_reported' || action === 'retry') return 'success'
      return 'info'
    }
  }
}
</script>

<style scoped>
.filter-row {
  margin-bottom: 8px;
}
</style>
