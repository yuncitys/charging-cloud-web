<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="receiveTimeRange"
        class="filter-item"
        type="datetimerange"
        range-separator="至"
        start-placeholder="请选择开始日期"
        end-placeholder="请选择结束日期"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 360px; margin-right: 20px;"
        @change="handleReceiveTimeChange"
      />
      <el-input
        v-model="listQuery.userAccount"
        class="filter-item"
        placeholder="请输入领取用户"
        clearable
        style="width: 180px; margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.userOrgName"
        class="filter-item"
        placeholder="请输入归属客户"
        clearable
        style="width: 180px; margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.activityName"
        class="filter-item"
        placeholder="请输入活动名称"
        clearable
        style="width: 180px; margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select
        v-model="listQuery.activityType"
        class="filter-item"
        placeholder="请选择活动类型"
        clearable
        style="width: 160px; margin-right: 20px;"
        @change="handleFilter"
      >
        <el-option v-for="item in activityTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">确认</el-button>
      <el-button class="filter-item" @click="handleReset">清空</el-button>

      <div class="table-section-header">
        <span class="table-section-header__title">领取记录清单</span>
      </div>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 12px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="userAccount" label="领取用户" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="userOrgName" label="归属客户" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="userGroupName" label="用户分组" align="center" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope"><span>{{ scope.row.userGroupName || '—' }}</span></template>
        </el-table-column>
        <el-table-column prop="activityName" label="活动名称" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="activityType" label="活动类型" align="center" width="110">
          <template slot-scope="scope"><span>{{ activityTypeLabel(scope.row.activityType) }}</span></template>
        </el-table-column>
        <el-table-column prop="initiatorName" label="承担方" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="receiveTime" label="参与时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.receiveTime | formatDate }}</span></template>
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
  </div>
</template>

<script>
import { receiveRecordPage } from '@/api/marketing/marketing'
import { ACTIVITY_TYPES } from './constants/activityTypes'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'receiveRecordList',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  data() {
    return {
      listLoading: false,
      page: 1,
      limit: 10,
      list: [],
      total: 0,
      receiveTimeRange: null,
      listQuery: {
        page: 1,
        limit: 10,
        activityName: '',
        activityType: '',
        userAccount: '',
        userOrgName: '',
        receiveTimeStart: '',
        receiveTimeEnd: ''
      },
      activityTypeOptions: ACTIVITY_TYPES
    }
  },
  created() {
    this.getList()
  },
  methods: {
    activityTypeLabel(type) {
      const item = ACTIVITY_TYPES.find(t => t.value === String(type))
      return item ? item.label : type
    },
    handleReceiveTimeChange(val) {
      if (val && val.length === 2) {
        this.listQuery.receiveTimeStart = val[0]
        this.listQuery.receiveTimeEnd = val[1]
      } else {
        this.listQuery.receiveTimeStart = ''
        this.listQuery.receiveTimeEnd = ''
      }
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
    handleReset() {
      this.receiveTimeRange = null
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit,
        activityName: '',
        activityType: '',
        userAccount: '',
        userOrgName: '',
        receiveTimeStart: '',
        receiveTimeEnd: ''
      }
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

<style scoped>
.table-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}
.table-section-header__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
</style>
