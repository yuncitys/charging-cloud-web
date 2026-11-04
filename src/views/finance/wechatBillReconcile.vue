<template>
  <div class="app-container">
    <el-alert
      title="净额 = 微信支付入金 − 退款，仅供账单对账参考，不是用户真实钱包余额。"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 12px;"
    />
    <div class="filter-container">
      <el-input
        v-model="listQuery.userOpenid"
        style="width: 280px; margin-right: 16px;"
        class="filter-item"
        placeholder="用户标识 openid"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-input
        v-model="listQuery.walletNetMin"
        style="width: 140px; margin-right: 8px;"
        class="filter-item"
        placeholder="钱包净额≥"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.walletNetMax"
        style="width: 140px; margin-right: 16px;"
        class="filter-item"
        placeholder="钱包净额≤"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.prepayNetMin"
        style="width: 140px; margin-right: 8px;"
        class="filter-item"
        placeholder="预缴净额≥"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.prepayNetMax"
        style="width: 140px; margin-right: 16px;"
        class="filter-item"
        placeholder="预缴净额≤"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-button type="primary" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>

      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="拼命加载中......"
        fit
        highlight-current-row
        style="width: 100%; margin-top: 16px;"
        align="center"
      >
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户标识" prop="userOpenid" align="center" min-width="220" show-overflow-tooltip />
        <el-table-column label="钱包支付" prop="walletPayAmount" align="center" min-width="100" />
        <el-table-column label="钱包退款" prop="walletRefundAmount" align="center" min-width="100" />
        <el-table-column label="钱包净额" prop="walletNetAmount" align="center" min-width="100" sortable />
        <el-table-column label="预缴支付" prop="prepayPayAmount" align="center" min-width="100" />
        <el-table-column label="预缴退款" prop="prepayRefundAmount" align="center" min-width="100" />
        <el-table-column label="预缴净额" prop="prepayNetAmount" align="center" min-width="100" />
        <el-table-column label="停车净额" prop="parkingNetAmount" align="center" min-width="100" />
        <el-table-column label="全部净额" prop="totalNetAmount" align="center" min-width="100" />
        <el-table-column label="明细条数" prop="lineCount" align="center" width="90" />
        <el-table-column label="账单起止" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ formatRange(scope.row.billTimeMin, scope.row.billTimeMax) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleDetail(scope.row)">明细</el-button>
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
import { getUserPage } from '@/api/finance/wechatBillReconcile.js'

export default {
  name: 'WechatBillReconcile',
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        userOpenid: '',
        walletNetMin: '',
        walletNetMax: '',
        prepayNetMin: '',
        prepayNetMax: ''
      }
    }
  },
  created() {
    this.getLists()
  },
  methods: {
    getLists() {
      this.listLoading = true
      const q = { ...this.listQuery }
      getUserPage(q).then(res => {
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => {}).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    },
    handleDetail(row) {
      if (!row || !row.userOpenid) {
        this.$message.error('openid不能为空')
        return
      }
      this.$router.push({
        name: 'wechatBillReconcileDetail',
        query: { userOpenid: row.userOpenid }
      })
    },
    formatRange(min, max) {
      if (!min && !max) return '-'
      return `${min || '-'} ~ ${max || '-'}`
    }
  }
}
</script>
