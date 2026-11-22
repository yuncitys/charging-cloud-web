<template>
  <div class="app-container fleet-reconcile-page">
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
          value-format="yyyy-MM-dd"
          style="width: 160px;"
          :clearable="false"
        />
        <el-date-picker
          v-else
          v-model="query.periodDate"
          type="month"
          value-format="yyyy-MM"
          style="width: 150px;"
          :clearable="false"
        />
        <el-select v-model="query.fleetId" placeholder="全部车队" clearable filterable style="width: 190px;">
          <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
        </el-select>
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px;">
          <el-option :value="0" label="待处理" />
          <el-option :value="1" label="已处理" />
          <el-option :value="2" label="已忽略" />
        </el-select>
        <el-select v-model="query.diffType" placeholder="全部类型" clearable style="width: 150px;">
          <el-option value="UNDER_ALLOC" label="少分配" />
          <el-option value="OVER_ALLOC" label="多分配" />
          <el-option value="BALANCED" label="已平账" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button plain @click="resetQuery">重置</el-button>
        <el-button v-if="canEdit" type="success" icon="el-icon-refresh" @click="openRun">生成对账</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" size="small" border>
      <el-table-column prop="fleetName" label="车队" min-width="150">
        <template slot-scope="scope">{{ scope.row.fleetName || '未编队' }}</template>
      </el-table-column>
      <el-table-column prop="orgName" label="所属机构" min-width="170" show-overflow-tooltip />
      <el-table-column label="周期" width="80" align="center">
        <template slot-scope="scope">{{ scope.row.periodType === 1 ? '日' : '月' }}</template>
      </el-table-column>
      <el-table-column prop="periodKey" label="期间" width="130" />
      <el-table-column prop="billAmount" label="账单金额(元)" width="130" align="right">
        <template slot-scope="scope">{{ formatNumber(scope.row.billAmount) }}</template>
      </el-table-column>
      <el-table-column prop="allocatedAmount" label="已分配(元)" width="130" align="right">
        <template slot-scope="scope">{{ formatNumber(scope.row.allocatedAmount) }}</template>
      </el-table-column>
      <el-table-column prop="diffAmount" label="差额(元)" width="120" align="right">
        <template slot-scope="scope">
          <span :class="{ 'diff-negative': Number(scope.row.diffAmount) < 0 }">{{ formatNumber(scope.row.diffAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="diffTagType(scope.row.diffType)">{{ diffText(scope.row.diffType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="处理说明" min-width="160" show-overflow-tooltip />
      <el-table-column prop="handler" label="处理人" width="110" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="canEdit && scope.row.status === 0" size="mini" type="primary" @click="openHandle(scope.row)">处理</el-button>
          <span v-else>-</span>
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

    <!-- 生成对账 -->
    <el-dialog title="生成/重算对账" :visible.sync="runVisible" width="460px" append-to-body :close-on-click-modal="false">
      <el-form label-width="90px" size="small">
        <el-form-item label="车队" required>
          <el-select v-model="runForm.fleetId" placeholder="请选择车队" filterable style="width: 100%;">
            <el-option v-for="f in fleetOptions" :key="f.id" :label="f.name" :value="f.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="周期" required>
          <el-radio-group v-model="runForm.periodType" @change="syncRunKey">
            <el-radio :label="1">日账单</el-radio>
            <el-radio :label="2">月账单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="期间" required>
          <el-date-picker
            v-if="runForm.periodType === 1"
            v-model="runForm.day"
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 100%;"
            @change="syncRunKey"
          />
          <el-date-picker
            v-else
            v-model="runForm.month"
            type="month"
            value-format="yyyy-MM"
            style="width: 100%;"
            @change="syncRunKey"
          />
        </el-form-item>
        <el-form-item label="说明">
          <div class="hint">对账口径：账单实付金额 vs 机构钱包向该车队司机的分配净额（分配 - 扣回）。</div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="runVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="running" @click="submitRun">生成</el-button>
      </span>
    </el-dialog>

    <!-- 处理差异 -->
    <el-dialog title="处理对账差异" :visible.sync="handleVisible" width="460px" append-to-body :close-on-click-modal="false">
      <el-form label-width="90px" size="small">
        <el-form-item label="车队">{{ handleRow.fleetName || '-' }}</el-form-item>
        <el-form-item label="期间">{{ handleRow.periodKey }}</el-form-item>
        <el-form-item label="差额">
          {{ formatNumber(handleRow.billAmount) }} - {{ formatNumber(handleRow.allocatedAmount) }} =
          <strong>{{ formatNumber(handleRow.diffAmount) }}</strong> 元
        </el-form-item>
        <el-form-item label="处理结果" required>
          <el-radio-group v-model="handleForm.status">
            <el-radio :label="1">已处理</el-radio>
            <el-radio :label="2">忽略</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="handleForm.remark" type="textarea" :rows="3" maxlength="255" show-word-limit placeholder="如：线下已补分配" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="handleVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="handling" @click="submitHandle">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getFleetPage } from '@/api/enterpriseFleet/fleet'
import { getFleetReconcilePage, handleFleetReconcile, runFleetReconcile } from '@/api/enterpriseFleet/bill'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default {
  // eslint-disable-next-line vue/name-property-casing, vue/component-definition-name-casing -- 与路由 name 保持一致
  name: 'chargingFleetReconcile',
  data() {
    return {
      query: { page: 1, limit: 10, periodType: 2, periodDate: todayStr().slice(0, 7), fleetId: null, status: null, diffType: null },
      list: [],
      total: 0,
      loading: false,
      fleetOptions: [],
      runVisible: false,
      running: false,
      runForm: { fleetId: null, periodType: 2, day: todayStr(), month: todayStr().slice(0, 7), periodKey: '' },
      handleVisible: false,
      handling: false,
      handleRow: {},
      handleForm: { status: 1, remark: '' }
    }
  },
  computed: {
    canEdit() {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(':charging:customer:fleet:bill:edit'))
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
    },
    loadList() {
      this.loading = true
      getFleetReconcilePage(this.query).then(res => {
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
      this.query = { page: 1, limit: this.query.limit, periodType: 2, periodDate: todayStr().slice(0, 7), fleetId: null, status: null, diffType: null }
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
    openRun() {
      this.runForm = {
        fleetId: this.query.fleetId || null,
        periodType: this.query.periodType || 2,
        day: todayStr(),
        month: todayStr().slice(0, 7),
        periodKey: ''
      }
      this.syncRunKey()
      this.runVisible = true
    },
    syncRunKey() {
      const form = this.runForm
      form.periodKey = form.periodType === 1 ? 'D' + form.day : 'M' + form.month
    },
    submitRun() {
      const form = this.runForm
      if (!form.fleetId) {
        this.$message.warning('请选择车队')
        return
      }
      this.syncRunKey()
      this.running = true
      runFleetReconcile({ fleetId: form.fleetId, periodType: form.periodType, periodKey: form.periodKey }).then(res => {
        this.running = false
        if (res.code === 200) {
          this.$message.success(res.msg || '对账完成')
          this.runVisible = false
          this.loadList()
        } else {
          this.$message.error(res.msg || '对账失败')
        }
      }).catch(() => { this.running = false })
    },
    openHandle(row) {
      this.handleRow = row || {}
      this.handleForm = { status: 1, remark: '' }
      this.handleVisible = true
    },
    submitHandle() {
      if (!this.handleRow.id) return
      this.handling = true
      handleFleetReconcile({ id: this.handleRow.id, status: this.handleForm.status, remark: this.handleForm.remark }).then(res => {
        this.handling = false
        if (res.code === 200) {
          this.$message.success(res.msg || '已处理')
          this.handleVisible = false
          this.loadList()
        } else {
          this.$message.error(res.msg || '处理失败')
        }
      }).catch(() => { this.handling = false })
    },
    diffText(type) {
      return { UNDER_ALLOC: '少分配', OVER_ALLOC: '多分配', BALANCED: '已平账' }[type] || (type || '-')
    },
    diffTagType(type) {
      return { UNDER_ALLOC: 'warning', OVER_ALLOC: 'danger', BALANCED: 'success' }[type] || 'info'
    },
    statusText(status) {
      return { 0: '待处理', 1: '已处理', 2: '已忽略' }[status] || '-'
    },
    statusTagType(status) {
      return { 0: 'warning', 1: 'success', 2: 'info' }[status] || 'info'
    },
    formatNumber(value) {
      return Number(value || 0).toFixed(2)
    }
  }
}
</script>

<style scoped>
.fleet-reconcile-page .search-row {
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
.diff-negative {
  color: #f56c6c;
}
.hint {
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}
</style>
