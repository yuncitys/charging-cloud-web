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
      <el-input
        v-model="listQuery.deviceCode"
        class="filter-item"
        style="width: 160px; margin-right: 20px;"
        placeholder="设备编号"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-select
        v-model="listQuery.source"
        class="filter-item"
        style="width: 130px; margin-right: 20px;"
        clearable
        placeholder="来源"
        @change="handleFilter"
      >
        <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select
        v-model="listQuery.alarmCode"
        class="filter-item"
        style="width: 170px; margin-right: 20px;"
        clearable
        placeholder="告警项"
        @change="handleFilter"
      >
        <el-option v-for="item in alarmOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-button v-if="hasPerm('create')" size="mini" class="filter-item" icon="el-icon-plus" @click="openCreateDialog">手工建单</el-button>
      <el-button v-if="hasPerm('export')" size="mini" class="filter-item" icon="el-icon-download" :loading="exporting" @click="exportList">导出</el-button>
      <el-popover placement="bottom-end" width="560" trigger="click">
        <div class="action-guide">
          <div class="action-guide__flow">处理流程：待处理 →（指派）→ 开始处理 → 处理中 →（备注）→ 结案；误报或无需处理时直接取消。</div>
          <div v-for="item in actionGuide" :key="item.key" class="action-guide__item">
            <span class="action-guide__name">{{ item.name }}</span>
            <span class="action-guide__when">{{ item.when }}</span>
            <span class="action-guide__desc">{{ item.desc }}</span>
          </div>
        </div>
        <el-button slot="reference" size="mini" class="filter-item" icon="el-icon-question">操作说明</el-button>
      </el-popover>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
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
        <template slot-scope="scope">{{ rowStationName(scope.row) }}</template>
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
      <el-table-column label="操作" align="center" width="230" fixed="right">
        <template slot-scope="scope">
          <div class="row-actions">
            <el-tooltip :content="actionTip('detail')" placement="top" :open-delay="400">
              <el-button type="text" size="mini" @click="openDetail(scope.row)">详情</el-button>
            </el-tooltip>
            <el-tooltip v-if="canAssign(scope.row)" :content="actionTip('assign')" placement="top" :open-delay="400">
              <el-button type="text" size="mini" @click="openAssign(scope.row)">{{ assignLabel(scope.row) }}</el-button>
            </el-tooltip>
            <el-tooltip v-if="canStart(scope.row)" :content="actionTip('start')" placement="top" :open-delay="400">
              <el-button type="text" size="mini" class="row-actions__start" @click="startOrder(scope.row)">开始处理</el-button>
            </el-tooltip>
            <el-dropdown v-if="hasMoreActions(scope.row)" trigger="click" @command="cmd => handleActionCommand(cmd, scope.row)">
              <el-button type="text" size="mini">
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown" class="fault-action-menu">
                <el-dropdown-item v-if="canRemark(scope.row)" command="remark">
                  <div class="fault-action-menu__title">备注</div>
                  <div class="fault-action-menu__desc">{{ actionTip('remark') }}</div>
                </el-dropdown-item>
                <el-dropdown-item v-if="canClose(scope.row)" command="close">
                  <div class="fault-action-menu__title">结案</div>
                  <div class="fault-action-menu__desc">{{ actionTip('close') }}</div>
                </el-dropdown-item>
                <el-dropdown-item v-if="canCancel(scope.row)" command="cancel">
                  <div class="fault-action-menu__title">取消</div>
                  <div class="fault-action-menu__desc">{{ actionTip('cancel') }}</div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
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
          <el-tooltip v-if="canAssign(detail.workOrder)" :content="actionTip('assign')" placement="top" :open-delay="400">
            <el-button size="small" type="primary" @click="openAssign(detail.workOrder)">{{ assignLabel(detail.workOrder) }}</el-button>
          </el-tooltip>
          <el-tooltip v-if="canStart(detail.workOrder)" :content="actionTip('start')" placement="top" :open-delay="400">
            <el-button size="small" type="success" @click="startOrder(detail.workOrder)">开始处理</el-button>
          </el-tooltip>
          <el-tooltip v-if="canRemark(detail.workOrder)" :content="actionTip('remark')" placement="top" :open-delay="400">
            <el-button size="small" @click="openRemark(detail.workOrder)">备注</el-button>
          </el-tooltip>
          <el-tooltip v-if="canClose(detail.workOrder)" :content="actionTip('close')" placement="top" :open-delay="400">
            <el-button size="small" type="primary" @click="openFinish(detail.workOrder, 'close')">结案</el-button>
          </el-tooltip>
          <el-tooltip v-if="canCancel(detail.workOrder)" :content="actionTip('cancel')" placement="top" :open-delay="400">
            <el-button size="small" type="warning" @click="openFinish(detail.workOrder, 'cancel')">取消</el-button>
          </el-tooltip>
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

    <el-dialog :title="actionDialogTitle" :visible.sync="actionDialog.visible" width="460px">
      <el-alert
        v-if="actionDialog.type"
        :title="actionTip(actionDialog.type)"
        type="info"
        :closable="false"
        show-icon
        class="action-dialog-tip"
      />
      <el-form ref="actionForm" :model="actionDialog.form" label-width="90px">
        <template v-if="actionDialog.type === 'assign'">
          <el-form-item label="指派人">
            <el-select
              v-model="actionDialog.form.assigneeUserId"
              style="width: 100%;"
              filterable
              clearable
              :loading="actionDialog.candidatesLoading"
              :placeholder="assigneePlaceholder"
            >
              <el-option
                v-for="item in actionDialog.candidates"
                :key="item.adminId"
                :label="candidateLabel(item)"
                :value="String(item.adminId)"
              />
            </el-select>
            <div v-if="!actionDialog.candidatesLoading && !actionDialog.candidates.length" class="form-hint">暂无可指派账号</div>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :label="remarkField.label">
            <el-input
              v-model="actionDialog.form.remark"
              type="textarea"
              :rows="4"
              clearable
              :placeholder="remarkField.placeholder"
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
      <el-alert :title="actionTip('create')" type="info" :closable="false" show-icon class="action-dialog-tip" />
      <el-form ref="createForm" :model="createDialog.form" label-width="90px">
        <el-form-item label="所属站点" required>
          <el-select
            v-model="createDialog.form.stationId"
            style="width: 100%;"
            filterable
            clearable
            placeholder="请选择充电站"
            @change="handleCreateStationChange"
          >
            <el-option v-for="item in stationList" :key="item.id" :label="item.networkName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备" required>
          <el-select
            v-model="createDialog.form.deviceCode"
            style="width: 100%;"
            filterable
            clearable
            :disabled="!createDialog.form.stationId"
            :placeholder="createDialog.devicesLoading ? '加载中...' : '请选择设备'"
            @change="handleCreateDeviceChange"
          >
            <el-option v-for="item in createDialog.devices" :key="item.deviceCode" :label="deviceLabel(item)" :value="item.deviceCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="枪口">
          <el-select
            v-model="createDialog.form.connectorCode"
            style="width: 100%;"
            clearable
            :disabled="!createDialog.form.deviceCode"
            placeholder="不选则为整桩"
          >
            <el-option v-for="item in createGuns" :key="item.gunNumber" :label="gunLabel(item)" :value="item.gunNumber" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警项">
          <el-select v-model="createDialog.form.alarmCode" style="width: 100%;" clearable placeholder="可选">
            <el-option v-for="item in alarmOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" required>
          <el-input v-model="createDialog.form.title" maxlength="128" show-word-limit clearable placeholder="请输入工单标题" />
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

    <el-dialog title="该设备已有未结束工单" :visible.sync="duplicateDialog.visible" width="680px" append-to-body>
      <el-table :data="duplicateDialog.list" size="small">
        <el-table-column prop="workOrderNo" label="工单编号" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">{{ statusLabel(scope.row.status) }}</template>
        </el-table-column>
        <el-table-column label="枪口" width="70" align="center">
          <template slot-scope="scope">{{ disp(scope.row.connectorCode) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="140" show-overflow-tooltip />
        <el-table-column label="打开时间" min-width="150">
          <template slot-scope="scope">{{ time(scope.row.openedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="viewDuplicate(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button @click="duplicateDialog.visible = false">返回修改</el-button>
        <el-button type="primary" :loading="createDialog.loading" @click="confirmDuplicateCreate">仍然创建</el-button>
      </span>
    </el-dialog>

    <download-progress ref="downloadProgress" />
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
  cancelFaultWorkOrder,
  listFaultStationDevices,
  checkOpenWorkOrders,
  getAssigneeCandidates,
  exportFaultWorkOrders
} from '@/api/monitor/faultMonitor'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import { parseTime } from '@/utils/index'
import downloadProgress from '@/components/Common/downloadProgress.vue'

const STATUS_OPTIONS = [
  { value: 'OPEN', label: '待处理', type: 'warning' },
  { value: 'IN_PROGRESS', label: '处理中', type: 'primary' },
  { value: 'CLOSED', label: '已结案', type: 'success' },
  { value: 'CANCELLED', label: '已取消', type: 'info' }
]

const SOURCE_OPTIONS = [
  { value: 'AUTO_ALARM', label: '自动告警' },
  { value: 'MANUAL', label: '手工建单' }
]

const ALARM_OPTIONS = [
  { value: 'DEVICE_FAULT', label: '电桩故障' },
  { value: 'DEVICE_ACTION_DOWNLINE', label: '设备下线' },
  { value: 'DEVICE_ACTION_ONLINE', label: '设备上线' },
  { value: 'VOLTAGE_CURRENT_ABNORMAL', label: '电压电流异常' },
  { value: 'REALTIME_DATA_ABNORMAL', label: '实时数据异常' },
  { value: 'SOC_ABNORMAL', label: 'SOC异常' },
  { value: 'TEMPERATURE_ABNORMAL', label: '温度超高' },
  { value: 'CHARGING_BMS_END', label: '充电阶段BMS中止' },
  { value: 'CHARGING_MACHINE_END', label: '充电阶段充电机中止' }
]

const ACTION_GUIDE = [
  { key: 'create', name: '手工建单', when: '系统未自动开单时', desc: '巡检、用户反馈或电话报修发现故障，但系统没有自动生成工单时，手工登记一张工单。' },
  { key: 'detail', name: '详情', when: '任意状态', desc: '查看工单完整信息和处理流水（谁在什么时间做了什么）。' },
  { key: 'assign', name: '指派 / 改派', when: '待处理、处理中', desc: '把工单交给能看到该站点的运维人员负责；已有负责人时为改派。不改变工单状态。' },
  { key: 'start', name: '开始处理', when: '仅待处理', desc: '运维人员已接单、开始排查或到场时点击，工单变为「处理中」。' },
  { key: 'remark', name: '备注', when: '待处理、处理中', desc: '记录处理进展，如已联系厂家、等待配件、已远程重启等。只写流水，不改变状态。' },
  { key: 'close', name: '结案', when: '待处理、处理中', desc: '故障已修复、设备恢复正常时使用，需填写处理说明（原因和处理方式），工单变为「已结案」。' },
  { key: 'cancel', name: '取消', when: '待处理、处理中', desc: '误报、重复工单或确认无需处理时使用，需填写取消原因，工单变为「已取消」。' },
  { key: 'export', name: '导出', when: '任意时候', desc: '按当前筛选条件导出全部工单为 Excel，生成后在下载进度框中下载。' }
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
  components: { downloadProgress },
  data() {
    return {
      listLoading: false,
      detailLoading: false,
      exporting: false,
      list: [],
      total: 0,
      stationList: [],
      dateRange: [],
      listQuery: {
        page: 1,
        limit: 10,
        workOrderNo: '',
        status: '',
        deviceCode: '',
        source: '',
        alarmCode: '',
        merchantId: '',
        stationId: '',
        start: '',
        end: ''
      },
      detailVisible: false,
      detail: {
        workOrder: null,
        actions: []
      },
      routeDetailId: '',
      actionDialog: {
        visible: false,
        loading: false,
        type: '',
        row: null,
        candidates: [],
        candidatesLoading: false,
        form: {
          assigneeUserId: '',
          remark: ''
        }
      },
      createDialog: {
        visible: false,
        loading: false,
        devicesLoading: false,
        devices: [],
        form: {
          stationId: '',
          deviceCode: '',
          connectorCode: '',
          alarmCode: '',
          title: '',
          description: ''
        }
      },
      duplicateDialog: {
        visible: false,
        list: []
      },
      actionGuide: ACTION_GUIDE,
      statusOptions: STATUS_OPTIONS,
      sourceOptions: SOURCE_OPTIONS,
      alarmOptions: ALARM_OPTIONS
    }
  },
  computed: {
    detailActions() {
      return Array.isArray(this.detail.actions) ? this.detail.actions : []
    },
    actionDialogTitle() {
      if (this.actionDialog.type === 'assign') {
        return this.actionDialog.row && this.actionDialog.row.assigneeUserId ? '改派工单' : '指派工单'
      }
      if (this.actionDialog.type === 'remark') return '工单备注'
      if (this.actionDialog.type === 'cancel') return '取消工单'
      return '结案工单'
    },
    remarkField() {
      if (this.actionDialog.type === 'remark') {
        return { label: '备注', placeholder: '例如：已联系厂家，等待配件到货' }
      }
      if (this.actionDialog.type === 'cancel') {
        return { label: '取消原因', placeholder: '例如：误报，现场确认设备正常；或与工单 FW… 重复' }
      }
      return { label: '处理说明', placeholder: '请填写故障原因和处理方式，例如：急停按钮卡住，复位后恢复正常' }
    },
    assigneePlaceholder() {
      const row = this.actionDialog.row
      return row && row.assigneeName ? `当前：${row.assigneeName}，请选择新的指派人` : '请选择指派人'
    },
    createGuns() {
      const device = this.createDialog.devices.find(item => item.deviceCode === this.createDialog.form.deviceCode)
      return device && Array.isArray(device.guns) ? device.guns : []
    },
    detailFields() {
      const row = this.detail.workOrder || {}
      return [
        { label: '工单编号', value: this.disp(row.workOrderNo) },
        { label: '状态', value: this.statusLabel(row.status), tag: true },
        { label: '所属站点', value: this.rowStationName(row) },
        { label: '来源', value: this.sourceLabel(row.source) },
        { label: '设备编号', value: this.disp(row.deviceCode) },
        { label: '枪口', value: this.disp(row.connectorCode) },
        { label: '告警码', value: this.disp(row.alarmCode) },
        { label: '告警项', value: this.disp(row.alarmItem) },
        { label: '创建人', value: this.disp(this.detail.createUserName) },
        { label: '指派人', value: this.disp(row.assigneeName) },
        { label: '打开时间', value: this.time(row.openedAt) },
        { label: '指派时间', value: this.time(row.assignedAt) },
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
  mounted() {
    this.openRouteDetail()
  },
  activated() {
    this.openRouteDetail()
  },
  watch: {
    $route() {
      this.openRouteDetail()
    }
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
    routeWorkOrderId() {
      const q = (this.$route && this.$route.query) || {}
      return this.firstValue(q.id, q.workOrderId)
    },
    openRouteDetail() {
      const id = this.routeWorkOrderId()
      if (!id) return
      if (String(this.routeDetailId) === String(id) && this.detailVisible) return
      this.openDetail({ id })
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
      this.listQuery = {
        page: 1,
        limit: 10,
        workOrderNo: '',
        status: '',
        deviceCode: '',
        source: '',
        alarmCode: '',
        merchantId: this.routeMerchantId(),
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
      this.routeDetailId = row.id
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
        candidates: [],
        candidatesLoading: true,
        form: {
          assigneeUserId: '',
          remark: ''
        }
      }
      getAssigneeCandidates(row.id).then(res => {
        this.actionDialog.candidatesLoading = false
        if (res && Number(res.code) === 200) {
          this.actionDialog.candidates = Array.isArray(res.data) ? res.data : []
          return
        }
        this.$message.error((res && res.msg) || '候选指派人加载失败')
      }).catch(() => {
        this.actionDialog.candidatesLoading = false
      })
    },
    openRemark(row) {
      this.actionDialog = {
        visible: true,
        loading: false,
        type: 'remark',
        row,
        candidates: [],
        candidatesLoading: false,
        form: { assigneeUserId: '', remark: '' }
      }
    },
    openFinish(row, type) {
      this.actionDialog = {
        visible: true,
        loading: false,
        type,
        row,
        candidates: [],
        candidatesLoading: false,
        form: { assigneeUserId: '', remark: '' }
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
      if (type === 'assign' && !this.actionDialog.form.assigneeUserId) {
        this.$message.warning('请选择指派人')
        return
      }
      this.actionDialog.loading = true
      let request
      if (type === 'assign') {
        request = assignFaultWorkOrder(row.id, { assigneeUserId: this.actionDialog.form.assigneeUserId })
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
        if (this.detailVisible && this.detail.workOrder && this.detail.workOrder.id) {
          this.openDetail({ id: this.detail.workOrder.id })
        }
        return
      }
      this.$message.error((res && res.msg) || '操作失败')
    },
    openCreateDialog() {
      this.createDialog.visible = true
      this.createDialog.loading = false
      this.createDialog.devices = []
      this.createDialog.form = {
        stationId: '',
        deviceCode: '',
        connectorCode: '',
        alarmCode: '',
        title: '',
        description: ''
      }
    },
    handleCreateStationChange(stationId) {
      this.createDialog.form.deviceCode = ''
      this.createDialog.form.connectorCode = ''
      this.createDialog.devices = []
      if (!stationId) return
      this.createDialog.devicesLoading = true
      listFaultStationDevices(stationId).then(res => {
        this.createDialog.devicesLoading = false
        if (String(this.createDialog.form.stationId) !== String(stationId)) return
        if (res && Number(res.code) === 200) {
          this.createDialog.devices = Array.isArray(res.data) ? res.data : []
          return
        }
        this.$message.error((res && res.msg) || '设备列表加载失败')
      }).catch(() => {
        this.createDialog.devicesLoading = false
      })
    },
    handleCreateDeviceChange() {
      this.createDialog.form.connectorCode = ''
    },
    deviceLabel(item) {
      return item.deviceName ? `${item.deviceCode}（${item.deviceName}）` : item.deviceCode
    },
    gunLabel(item) {
      return item.gunName ? `${item.gunNumber}号枪（${item.gunName}）` : `${item.gunNumber}号枪`
    },
    submitCreate() {
      const form = this.createDialog.form
      if (!form.stationId) {
        this.$message.warning('请选择站点')
        return
      }
      if (!form.deviceCode) {
        this.$message.warning('请选择设备')
        return
      }
      if (!String(form.title || '').trim()) {
        this.$message.warning('请填写标题')
        return
      }
      this.createDialog.loading = true
      checkOpenWorkOrders(this.cleanQuery({
        deviceCode: form.deviceCode,
        connectorCode: form.connectorCode
      })).then(res => {
        const list = res && Number(res.code) === 200 && Array.isArray(res.data) ? res.data : []
        if (list.length) {
          this.createDialog.loading = false
          this.duplicateDialog = { visible: true, list }
          return
        }
        this.doCreate()
      }).catch(() => {
        this.createDialog.loading = false
      })
    },
    confirmDuplicateCreate() {
      this.createDialog.loading = true
      this.doCreate()
    },
    viewDuplicate(row) {
      this.duplicateDialog.visible = false
      this.createDialog.visible = false
      this.openDetail(row)
    },
    doCreate() {
      const form = this.createDialog.form
      const alarm = ALARM_OPTIONS.find(item => item.value === form.alarmCode)
      createFaultWorkOrder(this.cleanQuery({
        stationId: form.stationId,
        deviceCode: form.deviceCode,
        connectorCode: form.connectorCode,
        alarmCode: form.alarmCode,
        alarmItem: alarm ? alarm.label : '',
        title: String(form.title || '').trim(),
        description: form.description
      })).then(res => {
        this.createDialog.loading = false
        if (res && Number(res.code) === 200) {
          this.$message.success('建单成功')
          this.duplicateDialog.visible = false
          this.createDialog.visible = false
          this.handleFilter()
          return
        }
        this.$message.error((res && res.msg) || '建单失败')
      }).catch(() => {
        this.createDialog.loading = false
      })
    },
    hasPerm(action) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(`:ops:faultWorkOrder:${action}`))
    },
    isActive(row) {
      return !!row && (row.status === 'OPEN' || row.status === 'IN_PROGRESS')
    },
    canAssign(row) {
      return this.hasPerm('assign') && this.isActive(row)
    },
    canStart(row) {
      return this.hasPerm('start') && !!row && row.status === 'OPEN'
    },
    canRemark(row) {
      return this.hasPerm('remark') && this.isActive(row)
    },
    canClose(row) {
      return this.hasPerm('close') && this.isActive(row)
    },
    canCancel(row) {
      return this.hasPerm('cancel') && this.isActive(row)
    },
    hasMoreActions(row) {
      return this.canRemark(row) || this.canClose(row) || this.canCancel(row)
    },
    actionTip(key) {
      const item = ACTION_GUIDE.find(guide => guide.key === key)
      return item ? item.desc : ''
    },
    assignLabel(row) {
      return row && row.assigneeUserId ? '改派' : '指派'
    },
    candidateLabel(item) {
      if (item.adminFullname && item.adminName) return `${item.adminFullname}（${item.adminName}）`
      return item.adminFullname || item.adminName || String(item.adminId)
    },
    exportList() {
      if (this.exporting) return
      this.syncDateQuery()
      const params = this.cleanQuery(Object.assign({}, this.listQuery))
      delete params.page
      delete params.limit
      this.exporting = true
      exportFaultWorkOrders(params).then(res => {
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
    cleanQuery(query) {
      const result = {}
      Object.keys(query).forEach(key => {
        if (query[key] !== '' && query[key] !== null && query[key] !== undefined) {
          result[key] = query[key]
        }
      })
      return result
    },
    rowStationName(row) {
      if (row && row.stationName) return row.stationName
      return this.stationName(row && row.stationId)
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
      const match = SOURCE_OPTIONS.find(item => item.value === source)
      return match ? match.label : this.disp(source)
    },
    actionLabel(actionType) {
      return ACTION_LABELS[actionType] || this.disp(actionType)
    },
    disp(v) {
      if (v === null || v === undefined || v === '') return '-'
      return v
    },
    firstValue(...values) {
      const match = values.find(value => value !== null && value !== undefined && value !== '')
      return match === undefined ? '' : match
    },
    routeMerchantId() {
      const q = (this.$route && this.$route.query) || {}
      return this.firstValue(q.merchantId)
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
.form-hint {
  color: #909399;
  font-size: 12px;
  line-height: 20px;
}
.row-actions {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.row-actions .el-button + .el-button,
.row-actions > * + * {
  margin-left: 12px;
}
.row-actions .el-button--text {
  padding: 0;
}
.row-actions__start {
  color: #67c23a;
}
.action-dialog-tip {
  margin-bottom: 16px;
}
.action-guide {
  font-size: 13px;
  line-height: 1.6;
}
.action-guide__flow {
  margin-bottom: 10px;
  padding: 8px 10px;
  color: #606266;
  background: #f4f4f5;
  border-radius: 4px;
}
.action-guide__item {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}
.action-guide__item:last-child {
  border-bottom: none;
}
.action-guide__name {
  flex: 0 0 80px;
  color: #303133;
  font-weight: 600;
}
.action-guide__when {
  flex: 0 0 100px;
  color: #909399;
}
.action-guide__desc {
  flex: 1;
  color: #606266;
}
</style>

<style>
.fault-action-menu .el-dropdown-menu__item {
  max-width: 280px;
  line-height: 1.5;
  padding-top: 6px;
  padding-bottom: 6px;
}
.fault-action-menu__title {
  color: #303133;
}
.fault-action-menu__desc {
  color: #909399;
  font-size: 12px;
  white-space: normal;
}
.fault-order-drawer-wrap .el-drawer__body {
  padding: 0;
  overflow: auto;
  height: calc(100% - 55px);
}
</style>
