<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 12px;">
      <el-button type="primary" icon="el-icon-back" @click="handleBack">返回</el-button>
    </div>
    <el-alert
      title="净额仅为微信账单入金净额，不等于真实钱包余额。"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 12px;"
    />

    <div v-loading="summaryLoading">
      <el-divider content-position="left">用户汇总</el-divider>
      <el-descriptions v-if="summary" :column="3" border size="small">
        <el-descriptions-item label="用户标识" :span="3">{{ summary.userOpenid }}</el-descriptions-item>
        <el-descriptions-item label="钱包支付">{{ summary.walletPayAmount }}</el-descriptions-item>
        <el-descriptions-item label="钱包退款">{{ summary.walletRefundAmount }}</el-descriptions-item>
        <el-descriptions-item label="钱包净额">{{ summary.walletNetAmount }}</el-descriptions-item>
        <el-descriptions-item label="预缴支付">{{ summary.prepayPayAmount }}</el-descriptions-item>
        <el-descriptions-item label="预缴退款">{{ summary.prepayRefundAmount }}</el-descriptions-item>
        <el-descriptions-item label="预缴净额">{{ summary.prepayNetAmount }}</el-descriptions-item>
        <el-descriptions-item label="停车净额">{{ summary.parkingNetAmount }}</el-descriptions-item>
        <el-descriptions-item label="全部净额">{{ summary.totalNetAmount }}</el-descriptions-item>
        <el-descriptions-item label="明细条数">{{ summary.lineCount }}</el-descriptions-item>
        <el-descriptions-item label="账单起止" :span="3">
          {{ formatRange(summary.billTimeMin, summary.billTimeMax) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <el-divider content-position="left">账单明细</el-divider>
    <div style="margin-bottom: 12px;">
      <el-select
        v-model="lineQuery.tradeState"
        clearable
        placeholder="交易状态"
        style="width: 140px; margin-right: 12px;"
        @change="handleLineFilter"
      >
        <el-option label="SUCCESS" value="SUCCESS" />
        <el-option label="REFUND" value="REFUND" />
      </el-select>
      <el-select
        v-model="lineQuery.bizType"
        clearable
        placeholder="业务类型"
        style="width: 180px; margin-right: 12px;"
        @change="handleLineFilter"
      >
        <el-option label="充值钱包" value="WALLET_RECHARGE" />
        <el-option label="充电预缴费" value="CHARGE_PREPAY" />
        <el-option label="停车" value="PARKING" />
        <el-option label="其它" value="OTHER" />
      </el-select>
    </div>
    <el-table v-loading="lineLoading" :data="lines" border size="mini" style="width: 100%;">
      <el-table-column label="交易时间" prop="tradeTime" min-width="160" align="center" show-overflow-tooltip />
      <el-table-column label="状态" prop="tradeState" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.tradeState === 'SUCCESS' ? 'success' : 'warning'" size="mini">
            {{ scope.row.tradeState }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务类型" prop="bizType" min-width="120" align="center">
        <template slot-scope="scope">{{ formatBizType(scope.row.bizType) }}</template>
      </el-table-column>
      <el-table-column label="支付金额" prop="settlementAmount" width="100" align="center" />
      <el-table-column label="退款金额" prop="refundAmount" width="100" align="center" />
      <el-table-column label="商品名称" prop="body" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column label="商户订单号" prop="outTradeNo" min-width="180" align="center" show-overflow-tooltip />
      <el-table-column label="微信订单号" prop="transactionId" min-width="200" align="center" show-overflow-tooltip />
    </el-table>
    <div class="pagination-container">
      <el-pagination
        :current-page="lineQuery.page"
        :page-sizes="[10, 20, 50]"
        :page-size="lineQuery.limit"
        :total="lineTotal"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleLineSizeChange"
        @current-change="handleLineCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { getUserDetail, getLinePage } from '@/api/finance/wechatBillReconcile.js'

export default {
  name: 'WechatBillReconcileDetail',
  data() {
    return {
      userOpenid: '',
      summaryLoading: false,
      summary: null,
      lineLoading: false,
      lines: [],
      lineTotal: 0,
      lineQuery: {
        page: 1,
        limit: 10,
        tradeState: '',
        bizType: ''
      }
    }
  },
  created() {
    this.userOpenid = (this.$route.query && this.$route.query.userOpenid) || ''
    if (!this.userOpenid) {
      this.$message.error('缺少 userOpenid')
      return
    }
    this.loadSummary()
    this.loadLines()
  },
  methods: {
    handleBack() {
      this.$router.push({ name: 'wechatBillReconcile' })
    },
    loadSummary() {
      this.summaryLoading = true
      getUserDetail({ userOpenid: this.userOpenid }).then(res => {
        if (res.code === 200) {
          this.summary = res.data
        } else {
          this.$message.error(res.msg || '加载汇总失败')
        }
      }).catch(() => {}).finally(() => {
        this.summaryLoading = false
      })
    },
    loadLines() {
      this.lineLoading = true
      getLinePage({
        userOpenid: this.userOpenid,
        page: this.lineQuery.page,
        limit: this.lineQuery.limit,
        tradeState: this.lineQuery.tradeState || '',
        bizType: this.lineQuery.bizType || ''
      }).then(res => {
        if (res.code === 200) {
          this.lines = res.data || []
          this.lineTotal = res.count || 0
        } else {
          this.$message.error(res.msg || '加载明细失败')
        }
      }).catch(() => {}).finally(() => {
        this.lineLoading = false
      })
    },
    handleLineFilter() {
      this.lineQuery.page = 1
      this.loadLines()
    },
    handleLineSizeChange(val) {
      this.lineQuery.limit = val
      this.loadLines()
    },
    handleLineCurrentChange(val) {
      this.lineQuery.page = val
      this.loadLines()
    },
    formatBizType(t) {
      const map = {
        WALLET_RECHARGE: '充值钱包',
        CHARGE_PREPAY: '充电预缴费',
        PARKING: '停车',
        OTHER: '其它'
      }
      return map[t] || t || '-'
    },
    formatRange(min, max) {
      if (!min && !max) return '-'
      return `${min || '-'} ~ ${max || '-'}`
    }
  }
}
</script>
