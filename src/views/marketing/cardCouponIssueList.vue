<template>
  <div class="app-container">
    <div class="marketing-page-header__back">
      <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回卡券管理</el-button>
    </div>

    <div class="issue-page-title">{{ pageTitle }}</div>

    <div class="filter-container">
      <el-input v-model="listQuery.userCardCouponId" class="filter-item" placeholder="优惠券编号" clearable style="width: 180px;margin-right: 20px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-select v-model="listQuery.usedStatus" class="filter-item" placeholder="使用状态" clearable style="width: 120px;margin-right: 20px;" @change="handleFilter">
        <el-option v-for="item in usedStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-input v-model="listQuery.userAccount" class="filter-item" placeholder="领取用户" clearable style="width: 140px;margin-right: 20px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-input v-model="listQuery.activityName" class="filter-item" placeholder="关联活动" clearable style="width: 160px;margin-right: 20px;" @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-date-picker
        v-model="issueTimeRange"
        class="filter-item"
        type="datetimerange"
        range-separator="—"
        start-placeholder="发放开始"
        end-placeholder="发放结束"
        value-format="yyyy-MM-dd HH:mm:ss"
        style="width: 340px;margin-right: 20px;"
        @change="onIssueTimeChange"
      />
      <el-date-picker
        v-model="useTimeRange"
        class="filter-item"
        type="datetimerange"
        range-separator="—"
        start-placeholder="使用开始"
        end-placeholder="使用结束"
        value-format="yyyy-MM-dd HH:mm:ss"
        style="width: 340px;margin-right: 20px;"
        @change="onUseTimeChange"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">确认</el-button>
      <el-button class="filter-item" @click="handleReset">清空</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="userCardCouponId" label="优惠券编号" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="usedStatus" label="使用状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag size="mini" :type="statusTagType(scope.row.usedStatus)">{{ statusLabel(scope.row.usedStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userAccount" label="领取用户" align="center" min-width="120" />
        <el-table-column prop="orgName" label="归属客户" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="activityName" label="关联活动" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="issueTime" label="发放时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.issueTime | formatDate }}</span></template>
        </el-table-column>
        <el-table-column label="使用时间" align="center" width="160">
          <template slot-scope="scope">
            <span>{{ (scope.row.useTime || scope.row.firstUseTime) | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="canCancelUserCoupon(scope.row)"
              type="text"
              size="small"
              @click="handleCancelUserCoupon(scope.row)"
            >作废</el-button>
            <el-button
              v-if="scope.row.orderCode"
              type="text"
              size="small"
              @click="viewOrder(scope.row)"
            >查看订单</el-button>
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
    </div>
  </div>
</template>

<script>
import { userCouponPage, cancelUserCoupon } from '@/api/marketing/marketing'
import { loadUserCouponStatusOptions, getUserCouponStatusLabel, getUserCouponStatusTagType } from './constants/cardCoupon'
import { MARKETING_PERMS } from './constants/marketingPermissions'
import { hasMarketingPerm } from './utils/marketingActivityAuth'
import { parseTime } from '@/utils/index'
import './styles/marketing.scss'

export default {
  name: 'cardCouponIssueList',
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
    }
  },
  data() {
    return {
      listLoading: false,
      page: 1,
      limit: 10,
      list: [],
      total: 0,
      issueTimeRange: [],
      useTimeRange: [],
      usedStatusOptions: [],
      listQuery: {
        page: 1,
        limit: 10,
        cardCouponId: '',
        userCardCouponId: '',
        usedStatus: '',
        userAccount: '',
        activityName: '',
        issueTimeBegin: '',
        issueTimeEnd: '',
        firstUseTimeBegin: '',
        firstUseTimeEnd: ''
      }
    }
  },
  computed: {
    pageTitle() {
      const name = this.$route.query.cardCouponName || '卡券'
      return `${name}发放明细`
    }
  },
  created() {
    loadUserCouponStatusOptions().then(list => { this.usedStatusOptions = list || [] })

    this.listQuery.cardCouponId = this.$route.query.cardCouponId || ''
    if (!this.listQuery.cardCouponId) {
      this.goBack()
      return
    }
    this.getList()
  },
  methods: {
    statusLabel(status) {
      return getUserCouponStatusLabel(status)
    },
    statusTagType(status) {
      return getUserCouponStatusTagType(status)
    },
    canCancelUserCoupon(row) {
      if (!hasMarketingPerm(MARKETING_PERMS.userCouponCancel)) return false
      return row.usedStatus === '0' || row.usedStatus === '3'
    },
    goBack() {
      this.$router.push({ name: 'cardCouponList' })
    },
    onIssueTimeChange(val) {
      if (val && val.length === 2) {
        this.listQuery.issueTimeBegin = val[0]
        this.listQuery.issueTimeEnd = val[1]
      } else {
        this.listQuery.issueTimeBegin = ''
        this.listQuery.issueTimeEnd = ''
      }
    },
    onUseTimeChange(val) {
      if (val && val.length === 2) {
        this.listQuery.firstUseTimeBegin = val[0]
        this.listQuery.firstUseTimeEnd = val[1]
      } else {
        this.listQuery.firstUseTimeBegin = ''
        this.listQuery.firstUseTimeEnd = ''
      }
    },
    handleReset() {
      this.issueTimeRange = []
      this.useTimeRange = []
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit,
        cardCouponId: this.$route.query.cardCouponId || '',
        userCardCouponId: '',
        usedStatus: '',
        userAccount: '',
        activityName: '',
        issueTimeBegin: '',
        issueTimeEnd: '',
        firstUseTimeBegin: '',
        firstUseTimeEnd: ''
      }
      this.getList()
    },
    getList() {
      this.listLoading = true
      userCouponPage(this.listQuery).then(res => {
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
    },
    handleCancelUserCoupon(row) {
      if (!hasMarketingPerm(MARKETING_PERMS.userCouponCancel)) return
      this.$confirm('确认作废该用户卡券？', '提示', { type: 'warning' }).then(() => {
        cancelUserCoupon(row.userCardCouponId).then(res => {
          if (res.code === 200) {
            this.$message.success('作废成功')
            this.getList()
          } else {
            this.$message.error(res.msg || '作废失败')
          }
        })
      }).catch(() => {})
    },
    viewOrder(row) {
      if (!row.orderCode) return
      this.$router.push({
        name: 'orderDetail',
        query: { orderCode: row.orderCode }
      })
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
