<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.userCode"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请输入用户ID"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-input
        v-model="listQuery.phone"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请输入用户手机号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-input
        v-model="listQuery.payCode"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请输入付款编号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-input
        v-model="listQuery.userName"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请输入用户昵称"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter()"
      />
      <el-select
        v-model="listQuery.type"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请选择交易类型"
        clearable
        @change="handleFilter"
      >
        <el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
      <el-select
        v-model="listQuery.payStatus"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="请选择交易状态"
        clearable
        @change="handleFilter"
      >
        <el-option v-for="item in payStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select
        v-model="listQuery.isProfitSharing"
        style="width: 200px;margin-right: 20px ;"
        class="filter-item"
        placeholder="是否分账"
        clearable
        @change="handleFilter"
      >
        <el-option v-for="item in yesNoOptions" :key="'yn'+item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="time"
        type="datetimerange"
        range-separator="至"
        class="filter-item"
        style="margin-right: 20px ;"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        @change="dateChange"
      />

      <div style="margin: 15px 0;">
        <el-button
          type="primary"
          style="margin-right: 20px ;"
          class="filter-item"
          icon="el-icon-search"
          @click="handleFilter"
        >查询</el-button>
        <downExcel :query-data="listQuery" />
      </div>

      <el-table
        id="tableBox"
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        element-loading-text="拼命加载中......"
        fit
        highlight-current-row
        style="width: 100%;"
        align="center"
      >
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
        </el-table-column>
        <el-table-column label="付款编号" prop="payCode" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column label="用户ID" prop="userCode" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="payMoney" label="付款金额" align="center" min-width="100" show-overflow-tooltip />
        <el-table-column prop="giftMoney" label="赠送金额" align="center" min-width="100" show-overflow-tooltip sortable />
        <el-table-column prop="refundMoney" label="退款金额" align="center" min-width="100" show-overflow-tooltip sortable />
        <el-table-column prop="remainingShareMoney" label="剩余分账金额" align="center" min-width="120" show-overflow-tooltip sortable>
          <template slot-scope="scope">
            <span>{{ formatMoney(scope.row.remainingShareMoney) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="交易类型" align="center" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ formatTradeType(scope.row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" label="状态" align="center" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag :type="payStatusTagType(scope.row.payStatus)">{{ formatPayStatus(scope.row.payStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10,20,30, 50]"
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
import {
  getList
} from '@/api/finance/rechargeRecord.js'
import { formatDictLabel } from '@/utils/dictionary'
import downExcel from './components/downExcel.vue'
export default {
  name: 'RechargeRecord',
  components: {
    downExcel
  },
  data() {
    return {
      listLoading: true,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        payCode: '',
        userName: '',
        userCode: '',
        phone: '',
        type: '',
        payStatus: '',
        isProfitSharing: '',
        createTimeStart: '',
        createTimeEnd: ''
      },
      tableKey: 0,
      tags: [],
      payStatusOptions: [],
      yesNoOptions: [],
      time: ''
    }
  },
  watch: {
    '$route.query.payCode': {
      handler() {
        this.initFromRoute()
        this.getLists()
      }
    }
  },
  created() {
    this.initFromRoute()
    this.$dict.getSelectorOptions('recharge_pay_status', { numeric: true }).then(list => {
      this.payStatusOptions = list || []
    })
    this.$dict.getSelectorOptions('recharge_trade_type').then(list => {
      this.tags = (list || []).map(item => ({ id: item.value, title: item.label }))
    })
    this.$dict.getSelectorOptions('common_yes_no', { numeric: true }).then(list => {
      this.yesNoOptions = list || []
    })
    this.getLists()
  },
  methods: {
    initFromRoute() {
      const payCode = this.$route && this.$route.query ? this.$route.query.payCode : ''
      if (payCode === null || payCode === undefined || payCode === '') return
      this.listQuery.payCode = payCode
      this.listQuery.page = 1
    },
    handleDetail(row) {
      const payCode = row && row.payCode
      if (!payCode) {
        this.$message.error('payCode不能为空')
        return
      }
      this.$router.push({
        name: 'rechargeRecordDetail',
        query: { payCode }
      })
    },
    getLists() {
      this.listLoading = true
      const listQuery = JSON.parse(JSON.stringify(this.listQuery))
      if (listQuery.createTimeStart == null) {
        listQuery.createTimeStart = ''
      }
      if (listQuery.createTimeEnd == null) {
        listQuery.createTimeEnd = ''
      }
      getList(listQuery).then(res => {
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg)
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getLists()
    },
    dateChange(e) {
      if (e) {
        this.listQuery.createTimeStart = e[0]
        this.listQuery.createTimeEnd = e[1]
      } else {
        this.listQuery.createTimeStart = ''
        this.listQuery.createTimeEnd = ''
      }
      this.handleFilter()
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getLists()
    },
    formatMoney(val) {
      if (val === 0 || val === '0') return val
      if (val === null || val === undefined || val === '') return '-'
      return val
    },
    formatPayStatus(code) {
      return formatDictLabel('recharge_pay_status', code)
    },
    formatTradeType(code) {
      return formatDictLabel('recharge_trade_type', code)
    },
    payStatusTagType(code) {
      const v = Number(code)
      if (v === 0 || v === 2) return 'danger'
      if (v === 10) return 'info'
      if (v === 1 || v === 3) return 'success'
      if (v === 30) return 'warning'
      return ''
    }
  }
}
</script>

<style>

</style>
