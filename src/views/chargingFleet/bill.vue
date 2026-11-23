<template>
  <div class="app-container fleet-bill-page">
    <div class="filter-container">
      <div class="search-row">
        <el-radio-group v-model="query.periodType" size="small" @change="onTypeChange">
          <el-radio-button :label="1">日账单</el-radio-button>
          <el-radio-button :label="2">月账单</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-if="query.periodType === 1"
          v-model="query.periodDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          style="width: 160px;"
          :clearable="false"
        />
        <el-date-picker
          v-else
          v-model="query.periodDate"
          type="month"
          placeholder="选择月份"
          value-format="yyyy-MM"
          style="width: 150px;"
          :clearable="false"
        />
        <el-select v-model="query.fleetId" placeholder="全部车队" clearable filterable style="width: 190px;">
          <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-select v-model="query.orgId" placeholder="全部机构" clearable filterable style="width: 210px;">
          <el-option v-for="o in orgOptions" :key="o.id" :label="o.name" :value="o.id" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px;">
          <el-option :value="0" label="未锁定" />
          <el-option :value="1" label="已锁定" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button plain @click="resetQuery">重置</el-button>
        <el-button v-if="canEdit" type="success" icon="el-icon-plus" @click="openGenerate">生成账单</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" fit highlight-current-row style="width: 100%">
      <el-table-column prop="fleetName" label="车队" min-width="150">
        <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
      </el-table-column>
      <el-table-column prop="orgName" label="所属机构" min-width="170" show-overflow-tooltip />
      <el-table-column label="周期" width="90" align="center">
        <template slot-scope="scope">{{ scope.row.periodType === 1 ? '日' : '月' }}</template>
      </el-table-column>
      <el-table-column prop="periodKey" label="期间" width="130" />
      <el-table-column prop="totalDegree" label="电量(度)" width="110" align="right">
        <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 2) }}</template>
      </el-table-column>
      <el-table-column prop="totalOrderCount" label="订单量" width="90" align="right" />
      <el-table-column prop="actualPayAmount" label="实付金额(元)" width="130" align="right">
        <template slot-scope="scope">{{ formatNumber(scope.row.actualPayAmount, 2) }}</template>
      </el-table-column>
      <el-table-column prop="enterprisePayAmount" label="企业支付(元)" width="130" align="right">
        <template slot-scope="scope">{{ formatNumber(scope.row.enterprisePayAmount, 2) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '已锁定' : '未锁定' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="生成时间" width="170" />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-button v-if="canEdit && scope.row.status !== 1" size="mini" type="warning" @click="handleLock(scope.row)">锁定</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :page-sizes="[10, 20, 50]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 生成账单 -->
    <el-drawer
      title="生成车队账单"
      :visible.sync="generateVisible"
      size="480px"
      direction="rtl"
      :wrapper-closable="false"
      append-to-body
    >
      <div class="drawer-body">
        <el-form label-width="90px" size="small">
          <el-form-item label="车队" required>
            <el-select v-model="generateForm.fleetId" placeholder="请选择车队" filterable style="width: 100%;">
              <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="周期" required>
            <el-radio-group v-model="generateForm.periodType" @change="syncGenerateKey">
              <el-radio :label="1">日账单</el-radio>
              <el-radio :label="2">月账单</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="期间" required>
            <el-date-picker
              v-if="generateForm.periodType === 1"
              v-model="generateForm.day"
              type="date"
              value-format="yyyy-MM-dd"
              style="width: 100%;"
              @change="syncGenerateKey"
            />
            <el-date-picker
              v-else
              v-model="generateForm.month"
              type="month"
              value-format="yyyy-MM"
              style="width: 100%;"
              @change="syncGenerateKey"
            />
          </el-form-item>
          <el-form-item label="说明">
            <div class="hint">
              同周期重复生成会覆盖未锁定账单；已锁定账单不可重算。<br>
              当月账单按「月初至今」滚动生成，可随时重算查看；月末核对无误后请锁定。
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer">
        <el-button @click="generateVisible = false">取消</el-button>
        <el-button type="primary" :loading="generating" @click="submitGenerate">生成</el-button>
      </div>
    </el-drawer>

    <!-- 详情 -->
    <el-drawer :title="detailTitle" :visible.sync="detailVisible" size="720px" direction="rtl" :wrapper-closable="false" append-to-body>
      <div v-if="detailBill" class="detail-body">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="车队">{{ detailBill.fleetName || detail.fleetName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="期间">{{ detailBill.periodKey }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ detailBill.status === 1 ? '已锁定' : '未锁定' }}</el-descriptions-item>
          <el-descriptions-item label="电量(度)">{{ formatNumber(detailBill.totalDegree, 2) }}</el-descriptions-item>
          <el-descriptions-item label="订单量">{{ detailBill.totalOrderCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="实付金额(元)">{{ formatNumber(detailBill.userActualPayAmount, 2) }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-title">日明细</div>
        <el-table :data="detailDaily" size="mini" fit highlight-current-row max-height="420" style="width: 100%">
          <el-table-column prop="summaryDate" label="日期" width="130" />
          <el-table-column prop="totalDegree" label="电量(度)" width="110" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.totalDegree, 2) }}</template>
          </el-table-column>
          <el-table-column prop="totalOrderCount" label="订单量" width="90" align="right" />
          <el-table-column prop="actualPayAmount" label="实付金额(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.actualPayAmount, 2) }}</template>
          </el-table-column>
          <el-table-column prop="enterprisePayAmount" label="企业支付(元)" width="130" align="right">
            <template slot-scope="scope">{{ formatNumber(scope.row.enterprisePayAmount, 2) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getOrganizationOptions } from '@/api/organization/organization'
import { getFleetPage } from '@/api/enterpriseFleet/fleet'
import { generateFleetBill, getFleetBillDetail, getFleetBillPage, lockFleetBill } from '@/api/enterpriseFleet/bill'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致，keep-alive include 才能命中
  name: 'chargingFleetBill',
  data() {
    return {
      query: { page: 1, limit: 10, periodType: 1, periodDate: todayStr(), fleetId: null, orgId: null, status: null },
      list: [],
      total: 0,
      loading: false,
      fleetOptions: [],
      orgOptions: [],
      generateVisible: false,
      generating: false,
      generateForm: { fleetId: null, periodType: 1, day: todayStr(), month: todayStr().slice(0, 7), periodKey: 'D' + todayStr() },
      detailVisible: false,
      detailBill: null,
      detailDaily: [],
      detail: {}
    }
  },
  computed: {
    canEdit() {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(':charging:customer:fleet:bill:edit'))
    },
    detailTitle() {
      const bill = this.detailBill
      return bill ? `车队账单 ${bill.periodKey}` : '车队账单'
    }
  },
  created() {
    this.loadOptions()
    this.loadList()
  },
  methods: {
    loadOptions() {
      getFleetPage({ page: 1, limit: 200 }).then(res => {
        if (res.code === 200) this.fleetOptions = res.data || []
      }).catch(() => {})
      getOrganizationOptions({}).then(res => {
        if (res.code === 200) this.orgOptions = res.data || []
      }).catch(() => {})
    },
    loadList() {
      this.loading = true
      getFleetBillPage(this.query).then(res => {
        this.loading = false
        if (res.code === 200) {
          this.list = res.data || []
          this.total = res.count || 0
        } else {
          this.$message.error(res.msg || '查询失败')
        }
      }).catch(() => { this.loading = false })
    },
    search() {
      this.query.page = 1
      this.loadList()
    },
    resetQuery() {
      this.query = { page: 1, limit: this.query.limit, periodType: 1, periodDate: todayStr(), fleetId: null, orgId: null, status: null }
      this.loadList()
    },
    onTypeChange(type) {
      this.query.periodDate = type === 1 ? todayStr() : todayStr().slice(0, 7)
      this.query.page = 1
      this.loadList()
    },
    handleSizeChange(val) {
      this.query.limit = val
      this.loadList()
    },
    handleCurrentChange(val) {
      this.query.page = val
      this.loadList()
    },
    openGenerate() {
      this.generateForm = {
        fleetId: this.query.fleetId || null,
        periodType: this.query.periodType || 1,
        day: todayStr(),
        month: todayStr().slice(0, 7),
        periodKey: ''
      }
      this.syncGenerateKey()
      this.generateVisible = true
    },
    syncGenerateKey() {
      const form = this.generateForm
      form.periodKey = form.periodType === 1 ? 'D' + form.day : 'M' + form.month
    },
    submitGenerate() {
      const form = this.generateForm
      if (!form.fleetId) {
        this.$message.warning('请选择车队')
        return
      }
      this.syncGenerateKey()
      if (!form.periodKey || form.periodKey.length < 6) {
        this.$message.warning('请选择期间')
        return
      }
      this.generating = true
      generateFleetBill({ fleetId: form.fleetId, periodType: form.periodType, periodKey: form.periodKey }).then(res => {
        this.generating = false
        if (res.code === 200) {
          this.$message.success(res.msg || '生成成功')
          this.generateVisible = false
          this.loadList()
        } else {
          this.$message.error(res.msg || '生成失败')
        }
      }).catch(() => { this.generating = false })
    },
    openDetail(row) {
      this.detail = row || {}
      this.detailBill = null
      this.detailDaily = []
      getFleetBillDetail(row.id).then(res => {
        if (res.code === 200) {
          this.detailBill = (res.data && res.data.bill) || null
          this.detailDaily = (res.data && res.data.daily) || []
          this.detailVisible = true
        } else {
          this.$message.error(res.msg || '详情加载失败')
        }
      }).catch(() => {})
    },
    handleLock(row) {
      this.$confirm(`锁定后账单不可重算，确认锁定「${row.periodKey}」？`, '锁定账单', {
        type: 'warning',
        confirmButtonText: '确认锁定',
        cancelButtonText: '取消'
      }).then(() => {
        lockFleetBill(row.id).then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg || '已锁定')
            this.loadList()
          } else {
            this.$message.error(res.msg || '锁定失败')
          }
        }).catch(() => {})
      }).catch(() => {})
    },
    formatNumber(value, scale) {
      return Number(value || 0).toFixed(scale == null ? 2 : scale)
    }
  }
}
</script>

<style scoped>
.fleet-bill-page .search-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 10px;
  text-align: right;
}
.detail-body {
  padding: 0 20px 20px;
}
.detail-title {
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.hint {
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
.drawer-body {
  padding: 0 20px 70px;
  overflow-y: auto;
  height: calc(100vh - 120px);
}
.drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
</style>
