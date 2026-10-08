<template>
  <el-drawer
    title="异常明细"
    :visible.sync="visible"
    direction="rtl"
    size="720px"
    append-to-body
    custom-class="exception-log-drawer-wrap"
    @closed="onClosed"
  >
    <div class="exception-log-drawer">
      <el-tabs v-model="activeType" class="exception-log-drawer__tabs" @tab-click="onTabClick">
        <el-tab-pane label="故障明细" name="fault" />
        <el-tab-pane label="离线明细" name="offline" />
      </el-tabs>

      <div class="exception-log-drawer__hint">
        <span>由于设备状态会实时变化，若获取最新数据，请点击 刷新</span>
        <el-link type="primary" :underline="false" @click="refresh">刷新</el-link>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        size="small"
        height="100%"
        class="exception-log-drawer__table"
      >
        <el-table-column prop="gunName" label="枪名称" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.gunName) }}</template>
        </el-table-column>
        <el-table-column prop="gunCode" label="枪编号" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.gunCode) }}</template>
        </el-table-column>
        <el-table-column prop="typeLabel" label="类型" width="80" align="center">
          <template slot-scope="scope">{{ disp(scope.row.typeLabel) }}</template>
        </el-table-column>
        <el-table-column prop="networkName" label="所属电站" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.networkName) }}</template>
        </el-table-column>
        <el-table-column prop="reason" :label="reasonLabel" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.reason) }}</template>
        </el-table-column>
        <el-table-column prop="alarmCode" :label="codeLabel" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ disp(scope.row.alarmCode) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="canTransferToWorkOrder(scope.row)"
              size="mini"
              type="primary"
              :loading="transferLoadingId === rowKey(scope.row)"
              @click="transferToWorkOrder(scope.row)"
            >
              转工单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="exception-log-drawer__pager">
        <el-pagination
          layout="total, prev, pager, next"
          :current-page="page"
          :page-size="limit"
          :total="total"
          @current-change="onPageChange"
        />
      </div>

      <div class="exception-log-drawer__footer">
        <el-button size="small" @click="visible = false">关闭</el-button>
        <el-button size="small" type="primary" :loading="exporting" @click="exportList">导出列表</el-button>
      </div>
    </div>
    <download-progress ref="downloadProgress" />
    <el-dialog title="转工单" :visible.sync="createDialog.visible" width="560px" append-to-body>
      <el-form :model="createDialog.form" label-width="90px">
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
        <el-button type="primary" :loading="createDialog.loading" @click="submitCreateWorkOrder">确定</el-button>
      </span>
    </el-dialog>
  </el-drawer>
</template>

<script>
import { getStationExceptionLogs, exportStationExceptionLogs } from '@/api/monitor/stationMonitor'
import { findOpenWorkOrderByAlarm, createFaultWorkOrder } from '@/api/monitor/faultMonitor'
import downloadProgress from '@/components/Common/downloadProgress.vue'

export default {
  name: 'ExceptionLogDrawer',
  components: { downloadProgress },
  data() {
    return {
      visible: false,
      stationId: '',
      activeType: 'fault',
      list: [],
      page: 1,
      limit: 10,
      total: 0,
      loading: false,
      exporting: false,
      transferLoadingId: null,
      createDialog: {
        visible: false,
        loading: false,
        form: this.emptyCreateForm()
      }
    }
  },
  computed: {
    reasonLabel() {
      return this.activeType === 'offline' ? '离线原因' : '故障名称'
    },
    codeLabel() {
      return this.activeType === 'offline' ? '告警码' : '故障码'
    }
  },
  methods: {
    open(stationId, type) {
      this.stationId = stationId || ''
      this.activeType = type === 'offline' ? 'offline' : 'fault'
      this.page = 1
      this.list = []
      this.total = 0
      this.visible = true
      this.load()
    },
    disp(v) {
      if (v == null || v === '') return '-'
      return v
    },
    emptyCreateForm() {
      return {
        stationId: '',
        deviceLogId: '',
        deviceCode: '',
        connectorCode: '',
        alarmCode: '',
        alarmItem: '',
        title: '',
        description: ''
      }
    },
    onTabClick() {
      this.page = 1
      this.load()
    },
    onPageChange(page) {
      this.page = page
      this.load()
    },
    onClosed() {
      this.list = []
      this.total = 0
      this.exporting = false
      this.transferLoadingId = null
      this.createDialog = {
        visible: false,
        loading: false,
        form: this.emptyCreateForm()
      }
    },
    refresh() {
      this.page = 1
      this.load()
    },
    load() {
      if (!this.stationId) return
      this.loading = true
      getStationExceptionLogs(this.stationId, {
        type: this.activeType,
        page: this.page,
        limit: this.limit
      }).then(res => {
        this.loading = false
        if (res && Number(res.code) === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
          this.total = res.count != null ? Number(res.count) : this.list.length
          return
        }
        this.$message.error((res && res.msg) || '异常明细加载失败')
      }).catch(() => {
        this.loading = false
      })
    },
    exportList() {
      if (!this.stationId || this.exporting) return
      this.exporting = true
      exportStationExceptionLogs(this.stationId, {
        type: this.activeType
      }).then(res => {
        this.exporting = false
        if (res && Number(res.code) === 200 && res.data && res.data.id != null) {
          this.$refs.downloadProgress.open(res.data.id)
          return
        }
        this.$message.error((res && res.msg) || '导出失败，请重试')
      }).catch(() => {
        this.exporting = false
      })
    },
    canTransferToWorkOrder(row) {
      if (!row) return false
      if (!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(':ops:faultWorkOrder:create'))) return false
      if (row.type != null) return String(row.type).toLowerCase() === 'fault'
      if (row.typeLabel != null) return row.typeLabel === '故障'
      return this.activeType === 'fault'
    },
    transferToWorkOrder(row) {
      if (!this.canTransferToWorkOrder(row)) return
      const form = this.buildWorkOrderForm(row)
      const query = this.cleanQuery({
        deviceLogId: form.deviceLogId,
        deviceCode: form.deviceCode,
        connectorCode: form.connectorCode,
        alarmCode: form.alarmCode
      })
      this.transferLoadingId = this.rowKey(row)
      findOpenWorkOrderByAlarm(query).then(res => {
        this.transferLoadingId = null
        if (res && Number(res.code) === 200) {
          const order = res.data
          if (order && order.id != null) {
            this.goWorkOrder(order.id)
            return
          }
          this.openCreateWorkOrderDialog(form)
          return
        }
        this.$message.error((res && res.msg) || '查询工单失败')
      }).catch(() => {
        this.transferLoadingId = null
      })
    },
    openCreateWorkOrderDialog(form) {
      this.createDialog = {
        visible: true,
        loading: false,
        form: { ...this.emptyCreateForm(), ...form }
      }
    },
    submitCreateWorkOrder() {
      const form = this.createDialog.form
      if (!form.stationId || !form.title) {
        this.$message.warning('请确认站点并填写标题')
        return
      }
      this.createDialog.loading = true
      createFaultWorkOrder(this.cleanQuery(form)).then(res => {
        this.createDialog.loading = false
        if (res && Number(res.code) === 200) {
          this.$message.success('建单成功')
          this.createDialog.visible = false
          const id = res.data && res.data.id
          if (id != null) this.goWorkOrder(id)
          return
        }
        this.$message.error((res && res.msg) || '建单失败')
      }).catch(() => {
        this.createDialog.loading = false
      })
    },
    buildWorkOrderForm(row) {
      const deviceCode = this.firstValue(row.deviceCode, row.device, row.deviceNo, row.gunCode)
      const connectorCode = this.firstValue(row.connectorCode, row.connector, row.gunNumber)
      const alarmItem = this.firstValue(row.alarmItem, row.reason)
      const title = alarmItem || this.firstValue(row.title, row.alarmName, row.alarmCode)
      return {
        stationId: this.firstValue(row.stationId, this.stationId),
        deviceLogId: this.firstValue(row.deviceLogId, row.id),
        deviceCode,
        connectorCode,
        alarmCode: this.firstValue(row.alarmCode, row.code),
        alarmItem,
        title,
        description: this.firstValue(row.description, row.reason, alarmItem)
      }
    },
    firstValue(...values) {
      const match = values.find(value => value !== null && value !== undefined && value !== '')
      return match === undefined ? '' : match
    },
    rowKey(row) {
      return row && this.firstValue(row.id, row.deviceLogId, row.gunCode, row.alarmCode)
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
    goWorkOrder(id) {
      this.$router.push({
        path: '/device/faultWorkOrders',
        query: { id, workOrderId: id }
      })
    }
  }
}
</script>

<style scoped>
.exception-log-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px 16px;
  box-sizing: border-box;
}

.exception-log-drawer__tabs {
  flex: 0 0 auto;
}

.exception-log-drawer__hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 8px 12px;
  color: #909399;
  font-size: 13px;
  background: #f5f7fa;
  border-radius: 4px;
}

.exception-log-drawer__table {
  flex: 1;
  min-height: 240px;
}

.exception-log-drawer__pager {
  flex: 0 0 auto;
  margin-top: 12px;
  text-align: right;
}

.exception-log-drawer__footer {
  flex: 0 0 auto;
  margin-top: 16px;
  text-align: right;
}
</style>

<style>
.exception-log-drawer-wrap .el-drawer__body {
  padding: 0;
  overflow: hidden;
  height: calc(100% - 55px);
}
</style>
