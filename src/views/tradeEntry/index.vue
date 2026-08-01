<template>
  <div class="app-container trade-entry-page">
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
      <el-button
        v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:add')"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增进件
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      element-loading-text="拼命加载中......"
      fit
      highlight-current-row
      style="width: 100%;"
      align="center"
      id="tableBox"
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
      <el-table-column label="商户名称" prop="merName" min-width="150" align="center" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.merName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商户类型" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.merType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="渠道服务商" width="120" align="center">
        <template slot-scope="{row}">
          <span>{{ formatServiceProvider(row.serviceProviderId) }}</span>
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
      <el-table-column label="审核状态" width="120" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.auditStatus | auditStatusTypeFilter">{{ row.auditStatus | auditStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="310" fixed="right" class-name="table-action-cell">
        <template slot-scope="{row}">
          <div class="table-action-btns">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:info')"
              size="mini"
              type="primary"
              icon="el-icon-view"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:delete')"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="handleRemove(row)"
            >
              删除
            </el-button>
            <el-dropdown
              v-if="hasMoreActions(row)"
              size="mini"
              trigger="click"
              @command="(command) => handleMoreCommand(command, row)"
            >
              <el-button size="mini" type="primary" icon="el-icon-more">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-if="canAuditEntry(row) && btnAuthen.permsVerifAuthention(':payment:tradeMerchant:audit')"
                  command="auditPass"
                  icon="el-icon-check"
                  :disabled="row._auditing"
                >
                  审核通过
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="canAuditEntry(row) && btnAuthen.permsVerifAuthention(':payment:tradeMerchant:audit')"
                  command="auditReject"
                  icon="el-icon-close"
                  :disabled="row._auditing"
                >
                  驳回进件
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="canSubmitEntry(row) && btnAuthen.permsVerifAuthention(':payment:tradeMerchant:submit')"
                  command="submit"
                  icon="el-icon-upload2"
                  :disabled="row._submitting"
                >
                  提交进件
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:edit')"
                  command="edit"
                  icon="el-icon-edit"
                >
                  修改进件
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="btnAuthen.permsVerifAuthention(':payment:tradeMerchant:cancel')"
                  command="cancel"
                  icon="el-icon-circle-close"
                  divided
                >
                  注销进件
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { listTradeEntry, delTradeEntry, removeTradeEntry, submitTradeEntry, auditTradeEntry } from '@/api/pay/tradeEntry'
import { formatServiceProvider } from '@/utils/payChannel'
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
        10: '待平台审核',
        20: '平台驳回',
        30: '平台已通过'
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
      tableKey: 0,
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
        10: '待平台审核',
        20: '平台驳回',
        30: '平台已通过'
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
    formatServiceProvider,
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
        this.listLoading = false
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
    hasMoreActions(row) {
      return (this.canAuditEntry(row) && this.btnAuthen.permsVerifAuthention(':payment:tradeMerchant:audit'))
        || (this.canSubmitEntry(row) && this.btnAuthen.permsVerifAuthention(':payment:tradeMerchant:submit'))
        || this.btnAuthen.permsVerifAuthention(':payment:tradeMerchant:edit')
        || this.btnAuthen.permsVerifAuthention(':payment:tradeMerchant:cancel')
    },
    handleMoreCommand(command, row) {
      switch (command) {
        case 'auditPass':
          this.handleAuditEntry(row, true)
          break
        case 'auditReject':
          this.handleAuditEntry(row, false)
          break
        case 'submit':
          this.handleSubmitEntry(row)
          break
        case 'edit':
          this.handleUpdate(row)
          break
        case 'cancel':
          this.handleCancel(row)
          break
        default:
          break
      }
    },
    canAuditEntry(row) {
      return Number(row && row.status) === 0 && Number(row && row.auditStatus) === 10
    },
    canSubmitEntry(row) {
      const status = Number(row && row.status)
      const auditStatus = Number(row && row.auditStatus)
      return [0, 60].includes(status) && auditStatus === 30 && row && row.busTradeMerNo
    },
    handleAuditEntry(row, approved) {
      if (!this.canAuditEntry(row)) {
        this.$message.warning('当前状态不可审核')
        return
      }
      if (approved) {
        this.$confirm('确认通过该进件资料的平台审核？通过后方可提交至支付渠道。', '平台审核', {
          confirmButtonText: '审核通过',
          cancelButtonText: '取消',
          type: 'success'
        }).then(() => {
          this.$set(row, '_auditing', true)
          auditTradeEntry(row.id, { approved: true }).then(res => {
            this.$set(row, '_auditing', false)
            if (res && res.code === 200) {
              this.$message.success('审核通过')
              this.getList()
            } else {
              this.$message.error((res && res.msg) || '审核失败')
            }
          }).catch(() => {
            this.$set(row, '_auditing', false)
            this.$message.error('审核失败')
          })
        }).catch(() => {})
        return
      }
      this.$prompt('请输入驳回原因', '平台审核驳回', {
        confirmButtonText: '确定驳回',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputValidator: value => !!(value && value.trim()) || '请填写驳回原因'
      }).then(({ value }) => {
        this.$set(row, '_auditing', true)
        auditTradeEntry(row.id, { approved: false, auditRemark: value.trim() }).then(res => {
          this.$set(row, '_auditing', false)
          if (res && res.code === 200) {
            this.$message.success('已驳回')
            this.getList()
          } else {
            this.$message.error((res && res.msg) || '操作失败')
          }
        }).catch(() => {
          this.$set(row, '_auditing', false)
          this.$message.error('操作失败')
        })
      }).catch(() => {})
    },
    handleSubmitEntry(row) {
      if (!this.canSubmitEntry(row)) {
        this.$message.warning('当前状态不可提交进件')
        return
      }
      this.$confirm('确认将该商户资料提交至支付渠道？提交后将进入渠道审核流程。', '提交进件', {
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$set(row, '_submitting', true)
        submitTradeEntry(row.busTradeMerNo).then(res => {
          this.$set(row, '_submitting', false)
          if (res && res.code === 200) {
            this.$message.success('提交进件成功')
            this.getList()
          } else {
            this.$message.error((res && res.msg) || '提交进件失败')
          }
        }).catch(() => {
          this.$set(row, '_submitting', false)
          this.$message.error('提交进件失败')
        })
      }).catch(() => {})
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

</style>

<style>
.trade-entry-page #tableBox td.table-action-cell {
  height: auto !important;
  line-height: normal !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
.trade-entry-page .table-action-btns {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  vertical-align: middle;
}
.trade-entry-page .table-action-btns .el-button + .el-button {
  margin-left: 0;
}
</style>
