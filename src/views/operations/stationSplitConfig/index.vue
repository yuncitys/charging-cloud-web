<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form class="form left" ref="form" :model="searchForm" :inline="true" label-width="auto">
        <el-form-item label="">
          <el-input v-model="searchForm.stationName" placeholder="电站名称" clearable @keyup.enter.native="search" />
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.merchantId" clearable placeholder="归属商户" style="width: 220px">
            <el-option v-for="item in merchantList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="searchForm.isConfigured" clearable placeholder="配置状态" style="width: 160px">
            <el-option :value="true" label="已配置" />
            <el-option :value="false" label="未配置" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:batchSave')"
            type="primary"
            icon="el-icon-setting"
            @click="onBatchSet"
          >
            批量设置
          </el-button>
        </el-form-item>
      </el-form>

      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane v-for="item in ruleIdList" :key="item.id" :label="item.title" :name="item.id" />
      </el-tabs>

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
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center" />
        <el-table-column type="index" width="55" label="序号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + (searchForm.page - 1) * searchForm.limit + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stationName" label="电站名称" align="center" width="280" show-overflow-tooltip />
        <el-table-column prop="merchantName" label="归属商户" align="center" show-overflow-tooltip />
        <el-table-column prop="isSplitConfigured" label="配置状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.isSplitConfigured" type="success">已配置</el-tag>
            <el-tag v-else type="info">未配置</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="splitPartyCount" label="分账方数" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.isSplitConfigured ? scope.row.splitPartyCount : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateUser" label="修改用户" align="center" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="修改时间" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.updateTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template v-slot="{ row }">
            <el-button
              v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:save')"
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="onEdit(row)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="searchForm.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="searchForm.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-drawer
      :title="editDrawer.title"
      :visible.sync="editDrawer.visible"
      custom-class="station-split-drawer"
      direction="rtl"
      size="72%"
      append-to-body
      @close="onEditDrawerClose"
    >
      <div class="split-drawer-shell">
        <div class="split-drawer-body">
          <div v-if="editDrawer.stationName" class="drawer-station-block">
            <div class="drawer-station-label">电站名称</div>
            <div class="drawer-station-name">{{ editDrawer.stationName }}</div>
          </div>
          <el-alert title="温馨提示" type="warning" :closable="false" show-icon class="split-tip">
            <div class="split-tip__text">
              <div>1）分成比例仅支持填写整数（例如：分成 60% 则填写“60”）。</div>
              <div>2）如无需分成给第三方，请将 100% 设置给站点归属方。</div>
              <div>3）电费/服务费/预约费/占位费分别校验：所有分账方合计必须等于 100%。</div>
              <div>4）到账金额按“平台抽成后的剩余金额 × 分成比例”计算。</div>
            </div>
          </el-alert>
          <el-table :data="splitTableData" border style="width: 100%;" v-loading="splitLoading" element-loading-text="loading……">
            <el-table-column label="分账主体" align="center" min-width="280">
              <template slot-scope="scope">
                <el-select v-model="scope.row.merchantNo" filterable clearable placeholder="请选择分账方" style="width: 100%;">
                  <el-option
                    v-for="item in payeeList"
                    :key="item.id"
                    :label="formatPayeeLabel(item)"
                    :value="item.merchantNo"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="电费" align="center">
              <el-table-column label="分账比例(%)" align="center" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.electricRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="服务费" align="center">
              <el-table-column label="分账比例(%)" align="center" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.serviceRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="预约费" align="center">
              <el-table-column label="分账比例(%)" align="center" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.reserveRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="占位费" align="center">
              <el-table-column label="分账比例(%)" align="center" min-width="120">
                <template slot-scope="scope">
                  <el-input v-model.number="scope.row.occupyRate" type="number" />
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template slot-scope="scope">
                <el-button
                  v-if="splitTableData.length > 1"
                  type="danger"
                  size="mini"
                  @click="removeSplitRow(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="split-toolbar">
            <el-button type="primary" @click="addSplitRow">+ 新增分账方</el-button>
            <el-link type="primary" style="margin-left: 10px;" @click="toAddAccount">点击此处去创建收款账号</el-link>
          </div>
        </div>
        <div class="split-drawer-footer">
          <el-button @click="editDrawer.visible = false">取消</el-button>
          <el-button
            v-if="btnAuthen.permsVerifAuthention(':web:splitAccount:save') || btnAuthen.permsVerifAuthention(':web:splitAccount:batchSave')"
            type="primary"
            :loading="splitSaving"
            @click="onDrawerSubmit"
          >
            确定
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getList, getByStationId, batchSave, batchSaveStations } from '@/api/finance/stationSplitConfig'
import { listCompleted as listCompletedTradeMerchant } from '@/api/pay/tradeEntry'
import { getMerchant } from '@/api/merchant/merchant'
import { parseTime } from '@/utils/index'
import { getRuleIdTabs, getDefaultRuleIdTabName } from '@/utils/ruleIdTabs'

export default {
  name: 'StationSplitConfig',
  data() {
    return {
      activeName: getDefaultRuleIdTabName(),
      listLoading: false,
      tableKey: 0,
      total: 0,
      list: [],
      merchantList: [],
      searchForm: {
        page: 1,
        limit: 10,
        stationName: '',
        merchantId: '',
        isConfigured: '',
        ruleId: getDefaultRuleIdTabName()
      },
      selectedRows: [],
      editDrawer: {
        visible: false,
        mode: 'edit',
        title: '分账设置',
        stationId: null,
        stationName: '',
        merchantId: null
      },
      splitTableData: [],
      splitLoading: false,
      splitSaving: false,
      payeeList: []
    }
  },
  computed: {
    ruleIdList() {
      return getRuleIdTabs()
    }
  },
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time)
    }
  },
  created() {
    this.initMerchant()
    this.search()
  },
  methods: {
    handleTabClick(tab) {
      this.searchForm.ruleId = tab.name
      this.searchForm.page = 1
      this.getLists()
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) {
          this.merchantList = res.data || []
        }
      })
    },
    search() {
      this.searchForm.page = 1
      this.getLists()
    },
    getLists() {
      this.listLoading = true
      const payload = { ...this.searchForm }
      if (payload.isConfigured === '') {
        delete payload.isConfigured
      }
      getList(payload).then(res => {
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '加载失败')
        }
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.searchForm.limit = val
      this.getLists()
    },
    handleCurrentChange(val) {
      this.searchForm.page = val
      this.getLists()
    },
    onSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    onBatchSet() {
      if (!this.selectedRows.length) {
        this.$message.error('请选择需要批量设置的站点')
        return
      }
      this.editDrawer.mode = 'batch'
      this.editDrawer.title = '批量分账设置'
      this.editDrawer.stationId = null
      this.editDrawer.stationName = ''
      this.editDrawer.merchantId = null
      this.splitTableData = [this.createEmptySplitRow()]
      this.loadPayeeList()
      this.editDrawer.visible = true
    },
    onEdit(row) {
      this.editDrawer.mode = 'edit'
      this.editDrawer.title = '分账设置'
      this.editDrawer.stationId = row.stationId
      this.editDrawer.stationName = row.stationName
      this.editDrawer.merchantId = row.merchantId
      this.splitLoading = true
      this.loadPayeeList()
      getByStationId(row.stationId).then(res => {
        if (res && res.code === 200) {
          const data = res.data
          const list = Array.isArray(data) ? data : (data ? [data] : [])
          this.splitTableData = list.length
            ? list.map(item => this.mapSplitRow(item, row.stationId))
            : [this.createEmptySplitRow(row.stationId)]
        } else {
          this.splitTableData = [this.createEmptySplitRow(row.stationId)]
        }
      }).catch(() => {
        this.splitTableData = [this.createEmptySplitRow(row.stationId)]
      }).finally(() => {
        this.splitLoading = false
        this.editDrawer.visible = true
      })
    },
    onEditDrawerClose() {
      this.splitTableData = []
      this.splitSaving = false
    },
    createEmptySplitRow(stationId) {
      return {
        stationId: stationId || null,
        merchantNo: '',
        electricRate: 0,
        serviceRate: 0,
        reserveRate: 0,
        occupyRate: 0
      }
    },
    mapSplitRow(item, stationId) {
      return {
        id: item.id,
        stationId: item.stationId || stationId,
        merchantNo: item.merchantNo || this.matchPayeeMerchantNoFromConfigRow(item),
        electricRate: item.electricRate ?? item.powerRate ?? 0,
        serviceRate: item.serviceRate ?? 0,
        reserveRate: item.reserveRate ?? 0,
        occupyRate: item.occupyRate ?? 0
      }
    },
    loadPayeeList() {
      listCompletedTradeMerchant({ roleType: 'SETTLE', status: '30' }).then(res => {
        if (res && res.code === 200) {
          this.payeeList = res.data || []
        } else {
          this.payeeList = []
        }
      }).catch(() => {
        this.payeeList = []
      })
    },
    findPayeeById(merchantNo) {
      if (!merchantNo) return null
      return (this.payeeList || []).find(i => String(i.merchantNo) === String(merchantNo)) || null
    },
    matchPayeeMerchantNoFromConfigRow(item) {
      if (!item) return ''
      const merchantNo = item.merchantNo || item.merchant_no || ''
      if (merchantNo) return merchantNo
      const busTradeMerNo = item.busTradeMerNo || item.bus_trade_mer_no || ''
      const settBankAccNo = item.settBankAccNo || item.sett_bank_acc_no || ''
      const hit = (this.payeeList || []).find(i => {
        const iBusTradeMerNo = i.busTradeMerNo || i.bus_trade_mer_no || ''
        const iSettBankAccNo = i.settBankAccNo || i.sett_bank_acc_no || ''
        return (busTradeMerNo && iBusTradeMerNo && String(busTradeMerNo) === String(iBusTradeMerNo)) ||
          (settBankAccNo && iSettBankAccNo && String(settBankAccNo) === String(iSettBankAccNo))
      })
      return hit ? hit.merchantNo : ''
    },
    buildSettlementPayloadFromPayee(payee, fallbackMerchantId) {
      if (!payee) return null
      return {
        merchantId: payee.merchantId || payee.merchant_id || fallbackMerchantId || '',
        merchantName: payee.merchantName || payee.merchant_name || '',
        merchantNo: payee.merchantNo,
        busTradeMerNo: payee.busTradeMerNo,
        settBankAccType: payee.settBankAccType,
        settBankAccName: payee.settBankAccName,
        settBankBranchId: payee.settBankBranchId,
        settBankBranchName: payee.settBankBranchName,
        settBankAccNo: payee.settBankAccNo
      }
    },
    formatPayeeLabel(item) {
      if (!item) return ''
      const name = item.name || item.merchantName || ''
      const accame = item.settBankAccName || item.merchantName || item.merchant_name || item.name || ''
      const acc = item.settBankAccNo || item.merchantNo || item.busTradeMerNo || item.no || ''
      if (accame && acc && name) return `${name}  ${accame} ${acc}`
      return name || accame || acc || ''
    },
    toAddAccount() {
      this.$router.push({ path: '/tradeEntry/add' })
    },
    normalizeRate(val) {
      const n = Number(val)
      if (!Number.isFinite(n)) return 0
      if (n < 0) return 0
      if (n > 100) return 100
      return Math.floor(n)
    },
    sumByKey(key) {
      return (this.splitTableData || []).reduce((sum, row) => sum + this.normalizeRate(row[key]), 0)
    },
    validateSplitTable() {
      const rows = this.splitTableData || []
      const seen = new Set()
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (!r.merchantNo) {
          this.$message.error('请选择分账方')
          return false
        }
        const k = String(r.merchantNo)
        if (seen.has(k)) {
          this.$message.error('分账方不可重复')
          return false
        }
        seen.add(k)
        r.electricRate = this.normalizeRate(r.electricRate)
        r.serviceRate = this.normalizeRate(r.serviceRate)
        r.reserveRate = this.normalizeRate(r.reserveRate)
        r.occupyRate = this.normalizeRate(r.occupyRate)
      }
      const keys = [
        { key: 'electricRate', label: '电费' },
        { key: 'serviceRate', label: '服务费' },
        { key: 'reserveRate', label: '预约费' },
        { key: 'occupyRate', label: '占位费' }
      ]
      for (const item of keys) {
        const sum = this.sumByKey(item.key)
        if (sum > 100) {
          this.$message.error(`${item.label}分账比例总和不能超过100%`)
          return false
        }
        if (sum !== 100) {
          this.$message.error(`${item.label}分账比例总和需等于100%`)
          return false
        }
      }
      return true
    },
    buildSavePayload(stationId, fallbackMerchantId) {
      return (this.splitTableData || []).map(row => {
        const payee = this.findPayeeById(row.merchantNo)
        const base = this.buildSettlementPayloadFromPayee(payee, fallbackMerchantId) || {}
        return {
          ...base,
          id: row.id,
          stationId,
          electricRate: this.normalizeRate(row.electricRate),
          serviceRate: this.normalizeRate(row.serviceRate),
          reserveRate: this.normalizeRate(row.reserveRate),
          occupyRate: this.normalizeRate(row.occupyRate)
        }
      })
    },
    addSplitRow() {
      if (this.splitTableData.length > 0) {
        const last = this.splitTableData[this.splitTableData.length - 1]
        if (!last.merchantNo) {
          this.$message.error('请选择分账方')
          return
        }
      }
      this.splitTableData.push(this.createEmptySplitRow(this.editDrawer.stationId))
    },
    removeSplitRow(index) {
      this.splitTableData.splice(index, 1)
    },
    onDrawerSubmit() {
      if (!this.validateSplitTable()) return
      this.splitSaving = true
      if (this.editDrawer.mode === 'batch') {
        const stationIds = this.selectedRows.map(r => r.stationId)
        const payload = {
          stationIds,
          accounts: this.buildSavePayload(null, null)
        }
        batchSaveStations(payload).then(res => {
          if (res && res.code === 200) {
            this.$message.success(res.msg || '批量设置成功')
            this.editDrawer.visible = false
            this.getLists()
          } else {
            this.$message.error((res && res.msg) || '批量设置失败')
          }
        }).catch(() => {
          this.$message.error('批量设置失败')
        }).finally(() => {
          this.splitSaving = false
        })
        return
      }
      const payload = this.buildSavePayload(this.editDrawer.stationId, this.editDrawer.merchantId)
      batchSave(this.editDrawer.stationId, payload).then(res => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || '保存成功')
          this.editDrawer.visible = false
          this.getLists()
        } else {
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {
        this.$message.error('保存失败')
      }).finally(() => {
        this.splitSaving = false
      })
    }
  }
}
</script>

<style scoped>
.split-tip {
  margin-bottom: 12px;
}
.split-tip__text {
  line-height: 22px;
}
.split-toolbar {
  margin: 12px 0 0;
}
.drawer-station-block {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
.drawer-station-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.drawer-station-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}
</style>

<style>
.station-split-drawer {
  display: flex;
  flex-direction: column;
}
.station-split-drawer .el-drawer__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
}
.split-drawer-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.split-drawer-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px 20px;
  box-sizing: border-box;
}
.split-drawer-footer {
  flex-shrink: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
</style>
