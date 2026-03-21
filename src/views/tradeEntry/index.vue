<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.merName" placeholder="商户名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.busTradeMerNo" placeholder="业务方商户编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.merchantNo" placeholder="渠道商户号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.serviceProviderId" placeholder="渠道代码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.managerMobile" placeholder="管理员手机号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.merCertNo" placeholder="证件号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="入驻状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="(item, key) in statusMap" :key="key" :label="item" :value="key" />
      </el-select>
      <el-select v-model="listQuery.auditStatus" placeholder="审核状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="(item, key) in auditStatusMap" :key="key" :label="item" :value="key" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        class="filter-item"
        style="width: 260px;"
        @change="handleDateChange"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增进件
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户编号" prop="busTradeMerNo" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.busTradeMerNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户名称" prop="merName" min-width="150">
        <template slot-scope="{row}">
          <span>{{ row.merName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户类型" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.merType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="联系人" width="110" align="center">
        <template slot-scope="{row}">
          <span>{{ row.managerName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="120" align="center">
        <template slot-scope="{row}">
          <span>{{ row.managerMobile }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入驻状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusTypeFilter">{{ row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.auditStatus | auditStatusTypeFilter">{{ row.auditStatus | auditStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="320" class-name="operation-col small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="info" size="mini" @click="handleDetail(row)">
            详情
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button size="mini" type="warning" @click="handleCancel(row)">
            注销
          </el-button>
          <el-button size="mini" type="danger" @click="handleRemove(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { listTradeEntry, delTradeEntry, removeTradeEntry } from '@/api/pay/tradeEntry'
import Pagination from '@/components/Pagination'

export default {
  name: 'TradeEntryList',
  components: { Pagination },
  filters: {
    typeFilter(status) {
      const statusMap = {
        '0': '交易商户',
        '1': '普通商户'
      }
      return statusMap[status] || status
    },
    statusFilter(status) {
      const statusMap = {
        0: '待提交',
        10: '入网中',
        20: '认证中',
        21: '待签署协议',
        30: '正常',
        31: '修改中',
        32: '修改失败',
        40: '冻结',
        50: '注销',
        60: '入网失败'
      }
      return statusMap[status] || status
    },
    statusTypeFilter(status) {
      const statusMap = {
        0: 'info',
        10: 'info',
        20: 'warning',
        21: 'warning',
        30: 'success',
        31: 'info',
        32: 'danger',
        40: 'danger',
        50: 'info',
        60: 'danger'
      }
      return statusMap[status] || ''
    },
    auditStatusFilter(status) {
      const statusMap = {
        10: '待审核',
        20: '审核拒绝',
        30: '审核通过'
      }
      return statusMap[status] || status
    },
    auditStatusTypeFilter(status) {
      const statusMap = {
        10: 'warning',
        20: 'danger',
        30: 'success'
      }
      return statusMap[status] || ''
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      dateRange: [],
      statusMap: {
        0: '待提交',
        10: '入网中',
        20: '认证中',
        21: '待签署协议',
        30: '正常',
        31: '修改中',
        32: '修改失败',
        40: '冻结',
        50: '注销',
        60: '入网失败'
      },
      auditStatusMap: {
        10: '待审核',
        20: '审核拒绝',
        30: '审核通过'
      },
      listQuery: {
        page: 1,
        limit: 20,
        merName: undefined,
        busTradeMerNo: undefined,
        merchantNo: undefined,
        serviceProviderId: undefined,
        managerMobile: undefined,
        merCertNo: undefined,
        status: undefined,
        auditStatus: undefined,
        createTimeStart: undefined,
        createTimeEnd: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleDateChange(val) {
      if (val) {
        this.listQuery.createTimeStart = val[0]
        this.listQuery.createTimeEnd = val[1]
      } else {
        this.listQuery.createTimeStart = undefined
        this.listQuery.createTimeEnd = undefined
      }
    },
    getList() {
      this.listLoading = true
      listTradeEntry(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.count
        this.listLoading = false
      }).catch(() => {
        this.$message({
            type: 'error',
            message: '获取失败'
          })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/tradeEntry/add')
    },
    handleUpdate(row) {
      this.$router.push('/tradeEntry/edit/' + row.id)
    },
    handleDetail(row) {
      this.$router.push('/tradeEntry/detail/' + row.id)
    },
    handleCancel(row) {
      this.$confirm('确认注销该商户？注销后该账户将无法使用，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTradeEntry(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '注销成功'
          })
          this.getList()
        })
      })
    },
    handleRemove(row) {
      this.$confirm('此操作将永久删除该商户，是否继续？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeTradeEntry(row.id).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getList()
        })
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
}
.filter-item {
  margin: 0 12px 12px 0 !important;
}

.operation-col >>> .cell {
  white-space: nowrap;
}

.operation-col >>> .el-button + .el-button {
  margin-left: 6px;
}
</style>
