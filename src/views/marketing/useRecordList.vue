<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.userCardCouponId" style="width: 220px;margin-right: 20px;" class="filter-item"
        placeholder="用户卡券ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-input v-model="listQuery.orderCode" style="width: 200px;margin-right: 20px;" class="filter-item"
        placeholder="订单号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter" />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>

      <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%;margin-top: 20px;">
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (page - 1) * limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column prop="userCardCouponId" label="用户卡券ID" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="orderCode" label="订单号" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="discountAmount" label="抵扣金额" align="center" width="100" />
        <el-table-column prop="confirmStatus" label="确认状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag size="mini">{{ scope.row.confirmStatus === '1' ? '已确认' : '待确认' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="useTime" label="使用时间" align="center" width="160">
          <template slot-scope="scope"><span>{{ scope.row.useTime | formatDate }}</span></template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination :current-page="listQuery.page" :page-sizes="[10, 20, 30, 50]" :page-size="listQuery.limit"
          :total="total" background layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <div v-if="!listLoading && !list.length" class="list-empty">暂无使用记录</div>
    </div>
  </div>
</template>

<script>
import { useRecordPage } from '@/api/marketing/marketing'
import { parseTime } from '@/utils/index'

export default {
  name: 'useRecordList',
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
      listQuery: { page: 1, limit: 10, userCardCouponId: '', orderCode: '' }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      useRecordPage(this.listQuery).then(res => {
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
.list-empty {
  margin-top: 20px;
  padding: 40px 16px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
