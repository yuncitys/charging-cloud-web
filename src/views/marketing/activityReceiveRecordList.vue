<template>
  <div class="app-container">
    <div class="marketing-page-header__back">
      <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回活动列表</el-button>
    </div>

    <div class="issue-page-title">{{ pageTitle }}</div>

    <div class="filter-container">
      <el-date-picker
        v-model="receiveTimeRange"
        class="filter-item"
        type="datetimerange"
        range-separator="—"
        start-placeholder="领取开始"
        end-placeholder="领取结束"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 340px; margin-right: 20px;"
        @change="onReceiveTimeChange"
      />
      <el-input
        v-model="listQuery.userAccount"
        class="filter-item"
        placeholder="领取用户"
        clearable
        style="width: 140px; margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.userOrgName"
        class="filter-item"
        placeholder="归属客户"
        clearable
        style="width: 160px; margin-right: 20px;"
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">确认</el-button>
      <el-button class="filter-item" @click="handleReset">清空</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
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
  name: 'activityReceiveRecordList',
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
      receiveTimeRange: [],
      listQuery: {
        page: 1,
        limit: 10,
        activityId: '',
        activityType: '',
        userAccount: '',
        userOrgName: '',
        receiveTimeStart: '',
        receiveTimeEnd: ''
      }
    }
  },
  computed: {
    pageTitle() {
      const name = this.$route.query.activityName || '活动'
      return `${name}领取记录`
    }
  },
  created() {
    this.listQuery.activityId = this.$route.query.activityId || ''
    this.listQuery.activityType = this.$route.query.activityType || ''
    if (!this.listQuery.activityId) {
      this.goBack()
      return
    }
    this.getList()
  },
  methods: {
    activityTypeLabel(type) {
      const item = ACTIVITY_TYPES.find(t => t.value === String(type))
      return item ? item.label : type
    },
    goBack() {
      const query = {}
      if (this.$route.query.activityType) {
        query.activityType = this.$route.query.activityType
      }
      if (this.$route.query.typeName) {
        query.typeName = this.$route.query.typeName
      }
      this.$router.push({ name: 'activityList', query })
    },
    onReceiveTimeChange(val) {
      if (val && val.length === 2) {
        this.listQuery.receiveTimeStart = val[0]
        this.listQuery.receiveTimeEnd = val[1]
      } else {
        this.listQuery.receiveTimeStart = ''
        this.listQuery.receiveTimeEnd = ''
      }
    },
    handleReset() {
      this.receiveTimeRange = []
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit,
        activityId: this.$route.query.activityId || '',
        activityType: this.$route.query.activityType || '',
        userAccount: '',
        userOrgName: '',
        receiveTimeStart: '',
        receiveTimeEnd: ''
      }
      this.getList()
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

<style scoped>
.issue-page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}
</style>
