<template>
  <div class="app-container fault-work-orders">
    <div class="filter-container">
      <el-input
        v-model="listQuery.workOrderNo"
        class="filter-item"
        style="width: 180px; margin-right: 20px;"
        placeholder="工单编号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        class="filter-item"
        style="width: 140px; margin-right: 20px;"
        clearable
        placeholder="处理状态"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select
        v-model="listQuery.stationId"
        class="filter-item"
        style="width: 220px; margin-right: 20px;"
        filterable
        clearable
        placeholder="请选择充电站"
        @change="handleFilter"
      >
        <el-option v-for="item in stationList" :key="item.id" :label="item.networkName" :value="item.id" />
      </el-select>
      <el-input
        v-model="assigneeKeyword"
        class="filter-item"
        style="width: 160px; margin-right: 20px;"
        placeholder="指派人"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-date-picker
        v-model="dateRange"
        class="filter-item"
        style="width: 260px; margin-right: 20px;"
        type="daterange"
        value-format="yyyy-MM-dd"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilter"
      />
      <el-button type="primary" size="mini" class="filter-item" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button size="mini" class="filter-item" icon="el-icon-refresh" @click="handleReset">重置</el-button>
      <el-button size="mini" class="filter-item" icon="el-icon-plus" @click="openCreateDialog">手工建单</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="displayList"
      element-loading-text="拼命加载中......"
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="index" width="55" label="序号" align="center">
        <template slot-scope="scope"><span>{{ scope.$index + (listQuery.page - 1) * listQuery.limit + 1 }}</span></template>
      </el-table-column>
      <el-table-column prop="workOrderNo" label="工单编号" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ disp(scope.row.workOrderNo) }}</template>
      </el-table-column>
      <el-table-column prop="title" label="告警标题" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ disp(scope.row.title || scope.row.alarmItem) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="stationId" label="所属站点" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ stationName(scope.row.stationId) }}</template>
      </el-table-column>
      <el-table-column prop="deviceCode" label="设备编号" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ disp(scope.row.deviceCode) }}</template>
      </el-table-column>
      <el-table-column prop="connectorCode" label="枪口" width="80" align="center">
        <template slot-scope="scope">{{ disp(scope.row.connectorCode) }}</template>
      </el-table-column>
      <el-table-column prop="assigneeName" label="指派人" min-width="110" show-overflow-tooltip>
        <template slot-scope="scope">{{ disp(scope.row.assigneeName) }}</template>
      </el-table-column>
      <el-table-column prop="openedAt" label="打开时间" min-width="160" show-overflow-tooltip>
        <template slot-scope="scope">{{ time(scope.row.openedAt || scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="260" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" @click="openDetail(scope.row)">详情</el-button>
          <el-button v-if="canAssign(scope.row)" size="mini" type="primary" @click="openAssign(scope.row)">指派</el-button>
          <el-button v-if="canStart(scope.row)" size="mini" type="success" @click="startOrder(scope.row)">开始处理</el-button>
          <el-dropdown v-if="hasMoreActions(scope.row)" trigger="click" @command="cmd => handleActionCommand(cmd, scope.row)">
            <el-button size="mini">
              更多<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="canRemark(scope.row)" command="remark">备注</el-dropdown-item>
              <el-dropdown-item v-if="canFinish(scope.row)" command="close">结案</el-dropdown-item>
              <el-dropdown-item v-if="canFinish(scope.row)" command="cancel">取消</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="listQuery.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-drawer
      title="故障工单详情"
      :visible.sync="detailVisible"
      direction="rtl"
      size="720px"
      append-to-body
      custom-class="fault-order-drawer-wrap"
    >
      <div v-loading="detailLoading" class="fault-order-drawer">
        <div v-if="detail.workOrder" class="detail-grid">
          <div v-for="item in detailFields" :key="item.label" class="detail-grid__item" :class="{ 'detail-grid__item--wide': item.wide }">
            <span class="detail-grid__label">{{ item.label }}</span>
            <span class="detail-grid__value">
              <el-tag v-if="item.tag" size="mini" :type="statusType(detail.workOrder.status)">{{ item.value }}</el-tag>
              <template v-else>{{ item.value }}</template>
            </span>
          </div>
        </div>

        <div v-if="detail.workOrder" class="drawer-actions">
          <el-button v-if="canAssign(detail.workOrder)" size="small" type="primary" @click="openAssign(detail.workOrder)">指派</el-button>
          <el-button v-if="canStart(detail.workOrder)" size="small" type="success" @click="startOrder(detail.workOrder)">开始处理</el-button>
          <el-button v-if="canRemark(detail.workOrder)" size="small" @click="openRemark(detail.workOrder)">备注</el-button>
          <el-button v-if="canFinish(detail.workOrder)" size="small" type="primary" @click="openFinish(detail.workOrder, 'close')">结案</el-button>
          <el-button v-if="canFinish(detail.workOrder)" size="small" type="warning" @click="openFinish(detail.workOrder, 'cancel')">取消</el-button>
        </div>

        <h4 class="drawer-title">处理流水</h4>
        <el-timeline v-if="detailActions.length">
          <el-timeline-item
            v-for="item in detailActions"
            :key="item.id"
            :timestamp="time(item.createTime)"
            placement="top"
          >
            <el-card shadow="never" class="action-card">
              <div class="action-card__title">{{ actionLabel(item.actionType) }}</div>
              <div class="action-card__meta">操作人：{{ disp(item.operatorName || item.operatorUserId) }}</div>
              <div v-if="item.remark" class="action-card__remark">{{ item.remark }}</div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div v-else class="empty-hint">暂无处理流水</div>
      </div>
    </el-drawer>

    <el-dialog :title="actionDialogTitle" :visible.sync="actionDialog.visible" width="420px">
      <el-form ref="actionForm" :model="actionDialog.form" label-width="90px">
        <template v-if="actionDialog.type === 'assign'">
          <el-form-item label="用户ID">
            <el-input v-model="actionDialog.form.userId" clearable placeholder="请输入指派人用户ID" />
          </el-form-item>
          <el-form-item label="指派人">
            <el-input v-model="actionDialog.form.userName" clearable placeholder="请输入指派人姓名" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="actionDialog.type === 'remark' ? '备注' : '说明'">
            <el-input
              v-model="actionDialog.form.remark"
              type="textarea"
              :rows="4"
              clearable
              :placeholder="actionDialog.type === 'remark' ? '请输入备注' : '请输入处理说明'"
            />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="actionDialog.loading" @click="submitAction">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="手工建单" :visible.sync="createDialog.visible" width="560px">
      <el-form ref="createForm" :model="createDialog.form" label-width="90px">
        <el-form-item label="所属站点">
          <el-select v-model="createDialog.form.stationId" style="width: 100%;" filterable clearable placeholder="请选择充电站">
            <el-option v-for="item in stationList" :key="item.id" :label="item.networkName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备编号">
          <el-input v-model="createDialog.form.deviceCode" clearable placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="枪口">
          <el-input v-model="createDialog.form.connectorCode" clearable placeholder="请输入枪口号" />
        </el-form-item>
        <el-form-item label="告警码">
          <el-input v-model="createDialog.form.alarmCode" clearable placeholder="请输入告警码" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="createDialog.form.title" clearable placeholder="请输入工单标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createDialog.form.description" type="textarea" :rows="3" clearable placeholder="请输入故障描述" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="createDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="createDialog.loading" @click="submitCreate">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageFaultWorkOrders,
  getFaultWorkOrder,
  createFaultWorkOrder,
  assignFaultWorkOrder,
  startFaultWorkOrder,
  remarkFaultWorkOrder,
  closeFaultWorkOrder,
  cancelFaultWorkOrder
} from '@/api/monitor/faultMonitor'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import { parseTime } from '@/utils/index'

const STATUS_OPTIONS = [
  { value: 'OPEN', label: '待处理', type: 'warning' },
  { value: 'IN_PROGRESS', label: '处理中', type: 'primary' },
  { value: 'CLOSED', label: '已结案', type: 'success' },
  { value: 'CANCELLED', label: '已取消', type: 'info' }
]

const ACTION_LABELS = {
  CREATE: '创建工单',
  DUP_ALARM: '重复告警',
  ASSIGN: '指派工单',
  START: '开始处理',
  REMARK: '备注',
  CLOSE: '结案',
  CANCEL: '取消'
}

export default {
  name: 'FaultWorkOrderList',
  data() {
    return {
      listLoading: false,
      detailLoading: false,
      list: [],
      total: 0,
      stationList: [],
      assigneeKeyword: '',
      dateRange: [],
      listQuery: {
        page: 1,
        limit: 10,
        workOrderNo: '',
        status: '',
        stationId: '',
        start: '',
        end: ''
      },
      detailVisible: false,
      detail: {
        workOrder: null,
        actions: []
      },
      actionDialog: {
        visible: false,
        loading: false,
        type: '',
        row: null,
        form: {
          userId: '',
          userName: '',
          remark: ''
        }
      },
      createDialog: {
        visible: false,
        loading: false,
        form: {
          stationId: '',
          deviceCode: '',
          connectorCode: '',
          alarmCode: '',
          title: '',
          description: ''
        }
      },
      statusOptions: STATUS_OPTIONS
    }
  },
  computed: {
    displayList() {
      const keyword = (this.assigneeKeyword || '').trim()
      if (!keyword) return this.list
      return this.list.filter(item => String(item.assigneeName || item.assigneeUserId || '').indexOf(keyword) !== -1)
    },
    detailActions() {
      return Array.isArray(this.detail.actions) ? this.detail.actions : []
    },
    actionDialogTitle() {
      if (this.actionDialog.type === 'assign') return '指派工单'
      if (this.actionDialog.type === 'remark') return '工单备注'
      if (this.actionDialog.type === 'cancel') return '取消工单'
      return '结案工单'
    },
    detailFields() {
      const row = this.detail.workOrder || {}
      return [
        { label: '工单编号', value: this.disp(row.workOrderNo) },
        { label: '状态', value: this.statusLabel(row.status), tag: true },
        { label: '所属站点', value: this.stationName(row.stationId) },
        { label: '来源', value: this.sourceLabel(row.source) },
        { label: '设备编号', value: this.disp(row.deviceCode) },
        { label: '枪口', value: this.disp(row.connectorCode) },
        { label: '告警码', value: this.disp(row.alarmCode) },
        { label: '告警项', value: this.disp(row.alarmItem) },
        { label: '指派人', value: this.disp(row.assigneeName) },
        { label: '打开时间', value: this.time(row.openedAt) },
        { label: '关闭时间', value: this.time(row.closedAt) },
        { label: '结案说明', value: this.disp(row.closeRemark) },
        { label: '描述', value: this.disp(row.description), wide: true }
      ]
    }
  },
  created() {
    this.initFromRoute()
    this.loadStations()
    this.getList()
  },
  methods: {
    initFromRoute() {
      const q = this.$route.query || {}
      Object.keys(this.listQuery).forEach(key => {
        if (q[key] !== undefined) this.listQuery[key] = q[key]
      })
      if (q.start && q.end) {
        this.dateRange = [String(q.start).slice(0, 10), String(q.end).slice(0, 10)]
      }
    },
    loadStations() {
      getChargingStationList({}).then(res => {
        this.stationList = res && Number(res.code) === 200 ? (res.data || []) : []
      }).catch(() => {
        this.stationList = []
      })
    },
    syncDateQuery() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.listQuery.start = this.dateRange[0] + ' 00:00:00'
        this.listQuery.end = this.dateRange[1] + ' 23:59:59'
      } else {
        this.listQuery.start = ''
        this.listQuery.end = ''
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.syncDateQuery()
      this.getList()
    },
    handleReset() {
      this.dateRange = []
      this.assigneeKeyword = ''
      this.listQuery = {
        page: 1,
        limit: 10,
        workOrderNo: '',
        status: '',
        stationId: '',
        start: '',
        end: ''
      }
      this.getList()
    },
    handleSizeChange(limit) {
      this.listQuery.limit = limit
      this.listQuery.page = 1
      this.getList()
    },
    handleCurrentChange(page) {
      this.listQuery.page = page
      this.getList()
    },
    getList() {
      this.listLoading = true
      pageFaultWorkOrders(this.cleanQuery(this.listQuery)).then(res => {
        this.listLoading = false
        if (res && Number(res.code) === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
          this.total = res.count != null ? Number(res.count) : this.list.length
          return
        }
        this.list = []
        this.total = 0
        this.$message.error((res && res.msg) || '故障工单加载失败')
      }).catch(() => {
        this.listLoading = false
      })
    },
    openDetail(row) {
      if (!row || !row.id) return
      this.detailVisible = true
      this.detailLoading = true
      getFaultWorkOrder(row.id).then(res => {
        this.detailLoading = false
        if (res && Number(res.code) === 200) {
          this.detail = res.data || { workOrder: row, actions: [] }
          return
        }
        this.$message.error((res && res.msg) || '工单详情加载失败')
      }).catch(() => {
        this.detailLoading = false
      })
    },
    openAssign(row) {
      this.actionDialog = {
        visible: true,
        loading: false,
        type: 'assign',
        row,
        form: {
          userId: row.assigneeUserId || '',
          userName: row.assigneeName || '',
          remark: ''
        }
      }
    },
    openRemark(row) {
      this.actionDialog = {
        visible: true,
        loading: false,
        type: 'remark',
        row,
        form: { userId: '', userName: '', remark: '' }
      }
    },
    openFinish(row, type) {
      this.actionDialog = {
        visible: true,
        loading: false,
        type,
        row,
        form: { userId: '', userName: '', remark: '' }
      }
    },
    handleActionCommand(command, row) {
      if (command === 'remark') this.openRemark(row)
      if (command === 'close') this.openFinish(row, 'close')
      if (command === 'cancel') this.openFinish(row, 'cancel')
    },
    submitAction() {
      const row = this.actionDialog.row
      if (!row || !row.id) return
      const type = this.actionDialog.type
      if ((type === 'close' || type === 'cancel') && !String(this.actionDialog.form.remark || '').trim()) {
        this.$message.warning('请输入处理说明')
        return
      }
      this.actionDialog.loading = true
      let request
      if (type === 'assign') {
        request = assignFaultWorkOrder(row.id, {
          userId: this.actionDialog.form.userId,
          userName: this.actionDialog.form.userName
        })
      } else if (type === 'remark') {
        request = remarkFaultWorkOrder(row.id, { remark: this.actionDialog.form.remark })
      } else if (type === 'cancel') {
        request = cancelFaultWorkOrder(row.id, { closeRemark: this.actionDialog.form.remark })
      } else {
        request = closeFaultWorkOrder(row.id, { closeRemark: this.actionDialog.form.remark })
      }
      request.then(res => this.afterAction(res)).catch(() => {
        this.actionDialog.loading = false
      })
    },
    startOrder(row) {
      this.$confirm('确认开始处理该工单？', '提示', { type: 'warning' }).then(() => {
        return startFaultWorkOrder(row.id)
      }).then(res => {
        this.afterAction(res)
      }).catch(() => {})
    },
    afterAction(res) {
      this.actionDialog.loading = false
      if (res && Number(res.code) === 200) {
        this.$message.success('操作成功')
        this.actionDialog.visible = false
        this.getList()
        if (this.detailVisible && this.actionDialog.row && this.actionDialog.row.id) {
          this.openDetail(this.actionDialog.row)
        }
        return
      }
      this.$message.error((res && res.msg) || '操作失败')
    },
    openCreateDialog() {
      this.createDialog.visible = true
      this.createDialog.form = {
        stationId: '',
        deviceCode: '',
        connectorCode: '',
        alarmCode: '',
        title: '',
        description: ''
      }
    },
    submitCreate() {
      if (!this.createDialog.form.stationId || !this.createDialog.form.title) {
        this.$message.warning('请选择站点并填写标题')
        return
      }
      this.createDialog.loading = true
      createFaultWorkOrder(this.cleanQuery(this.createDialog.form)).then(res => {
        this.createDialog.loading = false
        if (res && Number(res.code) === 200) {
          this.$message.success('建单成功')
          this.createDialog.visible = false
          this.handleFilter()
          return
        }
        this.$message.error((res && res.msg) || '建单失败')
      }).catch(() => {
        this.createDialog.loading = false
      })
    },
    canAssign(row) {
      return row && row.status === 'OPEN'
    },
    canStart(row) {
      return row && row.status === 'OPEN'
    },
    canRemark(row) {
      return row && (row.status === 'OPEN' || row.status === 'IN_PROGRESS')
    },
    canFinish(row) {
      return row && (row.status === 'OPEN' || row.status === 'IN_PROGRESS')
    },
    hasMoreActions(row) {
      return this.canRemark(row) || this.canFinish(row)
    },
    cleanQuery(query) {
      const result = {}
      Object.keys(query).forEach(key => {
        if (query[key] !== '' && query[key] !== null && query[key] !== undefined) {
          result[key] = query[key]
        }
      })
      return result
    },
    stationName(stationId) {
      const match = this.stationList.find(item => String(item.id) === String(stationId))
      return match ? match.networkName : this.disp(stationId)
    },
    statusLabel(status) {
      const match = STATUS_OPTIONS.find(item => item.value === status)
      return match ? match.label : this.disp(status)
    },
    statusType(status) {
      const match = STATUS_OPTIONS.find(item => item.value === status)
      return match ? match.type : 'info'
    },
    sourceLabel(source) {
      if (source === 'AUTO_ALARM') return '自动告警'
      if (source === 'MANUAL') return '手工建单'
      return this.disp(source)
    },
    actionLabel(actionType) {
      return ACTION_LABELS[actionType] || this.disp(actionType)
    },
    disp(v) {
      if (v === null || v === undefined || v === '') return '-'
      return v
    },
    time(v) {
      if (!v) return '-'
      return parseTime(v, '{y}-{m}-{d} {h}:{i}:{s}') || '-'
    }
  }
}
</script>

<style scoped>
.fault-work-orders .filter-container {
  margin-bottom: 16px;
}
.fault-order-drawer {
  padding: 0 20px 20px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}
.detail-grid__item {
  display: flex;
  min-height: 40px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}
.detail-grid__item--wide {
  grid-column: span 2;
}
.detail-grid__label {
  flex: 0 0 90px;
  padding: 11px 10px;
  color: #909399;
  background: #f5f7fa;
  box-sizing: border-box;
}
.detail-grid__value {
  flex: 1;
  padding: 11px 10px;
  color: #303133;
  word-break: break-all;
  box-sizing: border-box;
}
.drawer-actions {
  margin: 16px 0 8px;
  text-align: right;
}
.drawer-title {
  margin: 20px 0 12px;
  color: #303133;
  font-size: 15px;
}
.action-card {
  border-color: #ebeef5;
}
.action-card__title {
  color: #303133;
  font-weight: 600;
}
.action-card__meta {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
.action-card__remark {
  margin-top: 8px;
  color: #606266;
  line-height: 1.5;
}
.empty-hint {
  padding: 32px 0;
  color: #909399;
  text-align: center;
}
</style>

<style>
.fault-order-drawer-wrap .el-drawer__body {
  padding: 0;
  overflow: auto;
  height: calc(100% - 55px);
}
</style>
