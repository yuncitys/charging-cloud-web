<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.activityName" style="width: 200px;margin-right: 20px;" class="filter-item"
        placeholder="活动名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-input v-model="listQuery.userAccount" style="width: 200px;margin-right: 20px;" class="filter-item"
        placeholder="用户账号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-select v-model="listQuery.activityType" style="width: 160px;margin-right: 20px;" class="filter-item"
        placeholder="活动类型" clearable @change="handleFilter">
        <el-option v-for="item in activityTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="activityName" label="活动名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="activityType" label="类型" align="center" width="110">
          <template slot-scope="scope"><span>{{ activityTypeLabel(scope.row.activityType) }}</span></template>
        </el-table-column>
        <el-table-column prop="userAccount" label="用户账号" align="center" min-width="120" />
        <el-table-column prop="userGroupName" label="用户分组" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="receiveTime" label="领取时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.receiveTime | formatDate }}</span></template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="listQuery.page" :page-sizes="[10, 20, 30, 50]" :page-size="listQuery.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import { receiveRecordPage } from '@/api/marketing/marketing'
import { parseTime } from '@/utils/index'

const ACTIVITY_TYPES = [
  { value: '1', label: '注册领取' },
  { value: '2', label: '充值领取' },
  { value: '3', label: '定向发放' },
  { value: '4', label: '充电领取' },
  { value: '5', label: '扫码领取' },
  { value: '6', label: '券码兑换' }
]

export default {
  name: 'receiveRecordList',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  data() {
    return {
      listLoading: false,
      page: 1,
      limit: 10,
      list: [],
      total: 0,
      listQuery: { page: 1, limit: 10, activityName: '', userAccount: '', activityType: '' },
      activityTypeOptions: ACTIVITY_TYPES
    }
  },
  created() {
    this.getList()
  },
  methods: {
    activityTypeLabel(type) {
      const item = ACTIVITY_TYPES.find(t => t.value === type)
      return item ? item.label : type
    },
    getList() {
      this.listLoading = true
      receiveRecordPage(this.listQuery).then(res => {
        this.listLoading = false
        this.list = res.data || []
        this.total = res.count || 0
      }).catch(() => { this.listLoading = false })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.page = val
      this.getList()
    }
  }
}
</script>
