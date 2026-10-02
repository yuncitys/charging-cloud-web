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
      <el-input
        v-model="listQuery.assigneeName"
        class="filter-item"
        style="width: 140px; margin-right: 20px;"
        placeholder="指派人"
        clearable
        @keyup.enter.native="handleFilter"
        @clear="handleFilter"
      />
      <el-checkbox v-model="listQuery.mine" class="filter-item" style="margin-right: 20px;" @change="handleFilter">只看我的</el-checkbox>
      <el-checkbox v-model="listQuery.overdue" class="filter-item" style="margin-right: 20px;" @change="handleFilter">只看超时</el-checkbox>
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
    </div>

    <el-tabs v-model="activeStatus" class="status-tabs" @tab-click="handleStatusTab">
      <el-tab-pane v-for="tab in statusTabs" :key="tab.name" :name="tab.name">
        <span slot="label">{{ tab.label }}<em class="status-tabs__count">{{ statusCounts[tab.name] || 0 }}</em></span>
      </el-tab-pane>
    </el-tabs>
    <div v-if="listQuery.statusIn" class="status-in-tag">
      <el-tag size="small" closable @close="clearStatusIn">{{ statusInLabel }}</el-tag>
    </div>

    <div v-if="selection.length" class="batch-bar">
      <span class="batch-bar__count">已选 <b>{{ selection.length }}</b> 单</span>
      <el-button v-if="hasPerm('assign')" size="mini" icon="el-icon-user" @click="openBatch('assign')">批量指派</el-button>
      <el-button v-if="hasPerm('close')" size="mini" icon="el-icon-circle-check" @click="openBatch('close')">批量结案</el-button>
      <el-button v-if="hasPerm('cancel')" size="mini" icon="el-icon-circle-close" @click="openBatch('cancel')">批量取消</el-button>
      <el-button size="mini" type="text" @click="clearSelection">清空</el-button>
    </div>

    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      element-loading-text="拼命加载中......"
      fit
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" align="center" :selectable="isActive" />
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
      <el-table-column label="已持续" min-width="130" align="center">
        <template slot-scope="scope">
          <span :class="{ 'duration--overdue': overdue(scope.row) }">{{ duration(scope.row) }}</span>
          <el-tag v-if="overdue(scope.row)" size="mini" type="danger" effect="plain" class="duration__tag">超时</el-tag>
        </template>
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
            <el-tooltip v-if="canReopen(scope.row)" :content="actionTip('reopen')" placement="top" :open-delay="400">
              <el-button type="text" size="mini" class="row-actions__reopen" @click="openReopen(scope.row)">重新打开</el-button>
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
        <template v-if="detail.workOrder">
          <div class="detail-card detail-hero">
            <div class="detail-hero__head">
              <div class="detail-hero__title">{{ disp(detail.workOrder.title || detail.workOrder.alarmItem) }}</div>
              <el-tag size="small" effect="dark" :type="statusType(detail.workOrder.status)">{{ statusLabel(detail.workOrder.status) }}</el-tag>
            </div>
            <div class="detail-hero__meta">
              <span>{{ disp(detail.workOrder.workOrderNo) }}</span>
              <span class="detail-hero__dot" />
              <span>{{ sourceLabel(detail.workOrder.source) }}</span>
              <span class="detail-hero__dot" />
              <span>{{ time(detail.workOrder.openedAt) }} 打开</span>
            </div>
            <el-steps
              class="detail-hero__steps"
              :active="detailProgress.active"
              finish-status="success"
              align-center
            >
              <el-step
                v-for="step in detailProgress.steps"
                :key="step.title"
                :title="step.title"
                :description="step.time"
                :status="step.status"
              />
            </el-steps>
          </div>

          <div v-for="section in detailSections" :key="section.title" class="detail-card">
            <div class="detail-card__title"><i :class="section.icon" />{{ section.title }}</div>
            <div class="detail-fields">
              <div
                v-for="item in section.fields"
                :key="item.label"
                class="detail-field"
                :class="{ 'detail-field--wide': item.wide, 'detail-field--highlight': item.highlight }"
              >
                <div class="detail-field__label">{{ item.label }}</div>
                <div class="detail-field__value">{{ item.value }}</div>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card__title"><i class="el-icon-time" />处理流水</div>
            <el-timeline v-if="detailActions.length" class="detail-timeline">
              <el-timeline-item
                v-for="item in detailActions"
                :key="item.id"
                :timestamp="time(item.createTime)"
                placement="top"
                size="normal"
              >
                <div class="action-item">
                  <span class="action-item__title">{{ actionLabel(item.actionType) }}</span>
                  <span class="action-item__meta">{{ disp(item.operatorName || item.operatorUserId) }}</span>
                </div>
                <div v-if="item.remark" class="action-item__remark">{{ item.remark }}</div>
                <div v-if="item.attachments && item.attachments.length" class="action-item__images">
                  <el-image
                    v-for="file in item.attachments"
                    :key="file.id || file.fileUrl"
                    class="action-item__image"
                    :src="fileUrl(file.fileUrl)"
                    :preview-src-list="item.attachments.map(f => fileUrl(f.fileUrl))"
                    fit="cover"
                  />
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="empty-hint">暂无处理流水</div>
          </div>
        </template>
      </div>

      <div v-if="detail.workOrder && hasDetailActions" class="drawer-footer">
        <div class="drawer-footer__left">
          <el-button v-if="canRemark(detail.workOrder)" size="small" icon="el-icon-edit-outline" @click="openRemark(detail.workOrder)">备注</el-button>
          <el-button v-if="canCancel(detail.workOrder)" size="small" type="text" class="drawer-footer__danger" @click="openFinish(detail.workOrder, 'cancel')">取消工单</el-button>
        </div>
        <div class="drawer-footer__right">
          <el-button v-if="canReopen(detail.workOrder)" size="small" type="warning" plain icon="el-icon-refresh-left" @click="openReopen(detail.workOrder)">重新打开</el-button>
          <el-button v-if="canAssign(detail.workOrder)" size="small" type="primary" icon="el-icon-user" @click="openAssign(detail.workOrder)">{{ assignLabel(detail.workOrder) }}</el-button>
          <el-button
            v-if="canClose(detail.workOrder)"
            size="small"
            icon="el-icon-circle-check"
            :type="detail.workOrder.status === 'IN_PROGRESS' ? 'primary' : 'default'"
            @click="openFinish(detail.workOrder, 'close')"
          >结案</el-button>
          <el-button v-if="canStart(detail.workOrder)" size="small" type="primary" icon="el-icon-video-play" @click="startOrder(detail.workOrder)">开始处理</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog :title="actionDialogTitle" :visible.sync="actionDialog.visible" width="560px">
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
            <div v-if="actionDialog.batch" class="form-hint">只列出能处理全部所选站点工单的账号</div>
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
          <el-form-item v-if="supportsAttachments" label="现场照片">
            <fault-image-upload v-model="actionDialog.form.attachments" />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button @click="actionDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="actionDialog.loading" @click="submitAction">确定</el-button>
      </span>
    </el-dialog>

    <el-drawer
      title="手工建单"
      :visible.sync="createDialog.visible"
      direction="rtl"
      size="560px"
      append-to-body
      :wrapper-closable="false"
      custom-class="fault-order-drawer-wrap"
    >
      <div class="create-drawer">
        <el-alert :title="actionTip('create')" type="info" :closable="false" show-icon class="action-dialog-tip" />
        <el-form ref="createForm" :model="createDialog.form" label-position="top" class="create-form">
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
          <el-row :gutter="16">
            <el-col :span="14">
              <el-form-item label="设备" required>
                <el-select
                  v-model="createDialog.form.deviceCode"
                  style="width: 100%;"
                  filterable
                  clearable
                  :disabled="!createDialog.form.stationId"
                  :placeholder="createDevicePlaceholder"
                  @change="handleCreateDeviceChange"
                >
                  <el-option v-for="item in createDialog.devices" :key="item.deviceCode" :label="deviceLabel(item)" :value="item.deviceCode" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
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
            </el-col>
          </el-row>
          <el-form-item label="告警项" required>
            <el-select v-model="createDialog.form.alarmCode" style="width: 100%;" clearable placeholder="请选择告警项">
              <el-option v-for="item in alarmOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="标题" required>
            <el-input v-model="createDialog.form.title" maxlength="128" show-word-limit clearable placeholder="请输入工单标题，例如：3号桩急停无法复位" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="createDialog.form.description" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请描述故障现象、发现方式和现场情况" />
          </el-form-item>
        </el-form>
      </div>
      <div class="drawer-footer drawer-footer--end">
        <el-button size="small" @click="createDialog.visible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="createDialog.loading" @click="submitCreate">确定</el-button>
      </div>
    </el-drawer>

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

    <el-dialog title="批量处理结果" :visible.sync="batchResult.visible" width="560px" append-to-body>
      <div class="batch-result__summary">
        成功 <b class="batch-result__success">{{ batchResult.successCount }}</b> 单，
        失败 <b class="batch-result__fail">{{ batchResult.failures.length }}</b> 单
      </div>
      <el-table v-if="batchResult.failures.length" :data="batchResult.failures" size="small" max-height="300">
        <el-table-column label="工单编号" min-width="170">
          <template slot-scope="scope">{{ disp(scope.row.workOrderNo || scope.row.id) }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="200" show-overflow-tooltip />
      </el-table>
      <span slot="footer">
        <el-button type="primary" @click="batchResult.visible = false">知道了</el-button>
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
  exportFaultWorkOrders,
  getFaultWorkOrderStatusCounts,
  reopenFaultWorkOrder,
  batchAssignFaultWorkOrders,
  batchCloseFaultWorkOrders,
  batchCancelFaultWorkOrders
} from '@/api/monitor/faultMonitor'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import { parseTime } from '@/utils/index'
import downloadProgress from '@/components/Common/downloadProgress.vue'
import FaultImageUpload from './components/FaultImageUpload.vue'
import { orderDurationMs, isOverdue, formatDuration } from './faultWorkOrderMeta'

const BATCH_LIMIT = 100

const STATUS_OPTIONS = [
  { value: 'OPEN', label: '待处理', type: 'warning' },
  { value: 'IN_PROGRESS', label: '处理中', type: 'primary' },
  { value: 'CLOSED', label: '已结案', type: 'success' },
  { value: 'CANCELLED', label: '已取消', type: 'info' }
]

const STATUS_IN_LABELS = {
  'OPEN,IN_PROGRESS': '未关闭（待处理 + 处理中）',
  'OPEN,IN_PROGRESS,CLOSED': '不含已取消'
}

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
  { key: 'reopen', name: '重新打开', when: '仅已结案', desc: '结案后同一故障复现或处理不彻底时使用，需填写原因；工单回到「处理中」，保留原指派人并通知其继续处理。' },
  { key: 'batch', name: '批量指派 / 结案 / 取消', when: '勾选待处理、处理中的工单', desc: '一次最多 100 单，逐单处理；状态已变化或无权处理的工单会被跳过，并在结果中列出原因。' },
  { key: 'export', name: '导出', when: '任意时候', desc: '按当前筛选条件导出全部工单为 Excel，生成后在下载进度框中下载。' }
]

const ACTION_LABELS = {
  CREATE: '创建工单',
  DUP_ALARM: '重复告警',
  ASSIGN: '指派工单',
  START: '开始处理',
  REMARK: '备注',
  CLOSE: '结案',
  CANCEL: '取消',
  REOPEN: '重新打开'
}

export default {
  name: 'FaultWorkOrderList',
  components: { downloadProgress, FaultImageUpload },
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
        statusIn: '',
        deviceCode: '',
        source: '',
        alarmCode: '',
        assigneeName: '',
        mine: false,
        overdue: false,
        merchantId: '',
        stationId: '',
        start: '',
        end: ''
      },
      activeStatus: 'ALL',
      statusCounts: {},
      now: Date.now(),
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
        rows: [],
        batch: false,
        candidates: [],
        candidatesLoading: false,
        form: {
          assigneeUserId: '',
          remark: '',
          attachments: []
        }
      },
      selection: [],
      batchResult: {
        visible: false,
        successCount: 0,
        failures: []
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
      sourceOptions: SOURCE_OPTIONS,
      alarmOptions: ALARM_OPTIONS
    }
  },
  computed: {
    statusTabs() {
      return [{ name: 'ALL', label: '全部' }].concat(STATUS_OPTIONS.map(item => ({ name: item.value, label: item.label })))
    },
    statusInLabel() {
      const key = this.listQuery.statusIn
      if (STATUS_IN_LABELS[key]) return STATUS_IN_LABELS[key]
      return '状态：' + String(key || '').split(',').map(s => this.statusLabel(s)).join(' / ')
    },
    detailActions() {
      return Array.isArray(this.detail.actions) ? this.detail.actions : []
    },
    actionDialogTitle() {
      const type = this.actionDialog.type
      if (this.actionDialog.batch) {
        const names = { assign: '批量指派', close: '批量结案', cancel: '批量取消' }
        return `${names[type] || '批量处理'}（${this.actionDialog.rows.length} 单）`
      }
      if (type === 'assign') {
        return this.actionDialog.row && this.actionDialog.row.assigneeUserId ? '改派工单' : '指派工单'
      }
      if (type === 'remark') return '工单备注'
      if (type === 'cancel') return '取消工单'
      if (type === 'reopen') return '重新打开工单'
      return '结案工单'
    },
    remarkField() {
      if (this.actionDialog.type === 'remark') {
        return { label: '备注', placeholder: '例如：已联系厂家，等待配件到货' }
      }
      if (this.actionDialog.type === 'cancel') {
        return { label: '取消原因', placeholder: '例如：误报，现场确认设备正常；或与工单 FW… 重复' }
      }
      if (this.actionDialog.type === 'reopen') {
        return { label: '重新打开原因', placeholder: '例如：结案后同一故障再次出现，需要继续处理' }
      }
      return { label: '处理说明', placeholder: '请填写故障原因和处理方式，例如：急停按钮卡住，复位后恢复正常' }
    },
    supportsAttachments() {
      return !this.actionDialog.batch && (this.actionDialog.type === 'remark' || this.actionDialog.type === 'close')
    },
    assigneePlaceholder() {
      const row = this.actionDialog.row
      return row && row.assigneeName ? `当前：${row.assigneeName}，请选择新的指派人` : '请选择指派人'
    },
    createDevicePlaceholder() {
      if (!this.createDialog.form.stationId) return '请先选择站点'
      return this.createDialog.devicesLoading ? '加载中...' : '请选择设备'
    },
    createGuns() {
      const device = this.createDialog.devices.find(item => item.deviceCode === this.createDialog.form.deviceCode)
      return device && Array.isArray(device.guns) ? device.guns : []
    },
    detailSections() {
      const row = this.detail.workOrder || {}
      const finished = row.status === 'CLOSED' || row.status === 'CANCELLED'
      const description = [{ label: '故障描述', value: this.disp(row.description), wide: true }]
      if (finished) {
        description.push({
          label: row.status === 'CANCELLED' ? '取消原因' : '结案说明',
          value: this.disp(row.closeRemark),
          wide: true,
          highlight: true
        })
      }
      return [
        {
          title: '设备与告警',
          icon: 'el-icon-cpu',
          fields: [
            { label: '所属站点', value: this.rowStationName(row) },
            { label: '设备编号', value: this.disp(row.deviceCode) },
            { label: '枪口', value: row.connectorCode ? `${row.connectorCode}号枪` : '整桩' },
            { label: '告警项', value: this.disp(row.alarmItem) },
            { label: '告警码', value: this.disp(row.alarmCode) }
          ]
        },
        {
          title: '处理信息',
          icon: 'el-icon-user',
          fields: [
            { label: '创建人', value: this.disp(this.detail.createUserName) },
            { label: '指派人', value: this.disp(row.assigneeName) },
            { label: '打开时间', value: this.time(row.openedAt) },
            { label: '指派时间', value: this.time(row.assignedAt) },
            { label: '关闭时间', value: this.time(row.closedAt) }
          ]
        },
        { title: '描述', icon: 'el-icon-document', fields: description }
      ]
    },
    detailFields() {
      return this.detailSections.reduce((all, section) => all.concat(section.fields), [])
    },
    detailProgress() {
      const row = this.detail.workOrder || {}
      const created = { title: '创建', time: this.time(row.openedAt) }
      const closedTime = row.closedAt ? this.time(row.closedAt) : ''
      if (row.status === 'CANCELLED') {
        return { steps: [created, { title: '已取消', time: closedTime, status: 'error' }], active: 2 }
      }
      const steps = [
        created,
        { title: '指派', time: row.assignedAt ? this.time(row.assignedAt) : '' },
        { title: '处理中', time: '' },
        { title: '结案', time: closedTime }
      ]
      let active = 1
      if (row.status === 'OPEN' && row.assigneeUserId) active = 2
      if (row.status === 'IN_PROGRESS') active = 3
      if (row.status === 'CLOSED') active = 4
      return { steps, active }
    },
    hasDetailActions() {
      const row = this.detail.workOrder
      return this.canAssign(row) || this.canStart(row) || this.canRemark(row) || this.canClose(row) || this.canCancel(row) || this.canReopen(row)
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
      this.listQuery.mine = q.mine === true || q.mine === 'true'
      this.listQuery.overdue = q.overdue === true || q.overdue === 'true'
      this.activeStatus = this.listQuery.status || 'ALL'
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
        statusIn: '',
        deviceCode: '',
        source: '',
        alarmCode: '',
        assigneeName: '',
        mine: false,
        overdue: false,
        merchantId: this.routeMerchantId(),
        stationId: '',
        start: '',
        end: ''
      }
      this.activeStatus = 'ALL'
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
      this.now = Date.now()
      this.loadStatusCounts()
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
    loadStatusCounts() {
      const params = this.cleanQuery(Object.assign({}, this.listQuery))
      delete params.page
      delete params.limit
      delete params.status
      delete params.statusIn
      getFaultWorkOrderStatusCounts(params).then(res => {
        this.statusCounts = res && Number(res.code) === 200 && res.data ? res.data : {}
      }).catch(() => {})
    },
    handleStatusTab() {
      this.listQuery.status = this.activeStatus === 'ALL' ? '' : this.activeStatus
      this.listQuery.statusIn = ''
      this.handleFilter()
    },
    clearStatusIn() {
      this.listQuery.statusIn = ''
      this.handleFilter()
    },
    duration(row) {
      return formatDuration(orderDurationMs(row, this.now))
    },
    overdue(row) {
      return isOverdue(row, this.now)
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
    openActionDialog(type, row, extra = {}) {
      this.actionDialog = Object.assign({
        visible: true,
        loading: false,
        type,
        row,
        rows: [],
        batch: false,
        candidates: [],
        candidatesLoading: false,
        form: { assigneeUserId: '', remark: '', attachments: [] }
      }, extra)
    },
    openAssign(row) {
      this.openActionDialog('assign', row, { candidatesLoading: true })
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
      this.openActionDialog('remark', row)
    },
    openFinish(row, type) {
      this.openActionDialog(type, row)
    },
    openReopen(row) {
      this.openActionDialog('reopen', row)
    },
    handleSelectionChange(rows) {
      this.selection = Array.isArray(rows) ? rows : []
    },
    clearSelection() {
      this.selection = []
      if (this.$refs.table && this.$refs.table.clearSelection) this.$refs.table.clearSelection()
    },
    openBatch(type) {
      if (!this.selection.length) return
      if (this.selection.length > BATCH_LIMIT) {
        this.$message.warning('一次最多处理100单')
        return
      }
      const rows = this.selection.slice()
      this.openActionDialog(type, null, { batch: true, rows, candidatesLoading: type === 'assign' })
      if (type === 'assign') this.loadBatchCandidates(rows)
    },
    loadBatchCandidates(rows) {
      const firstIdByStation = {}
      rows.forEach(row => {
        const key = String(row.stationId)
        if (!firstIdByStation[key]) firstIdByStation[key] = row.id
      })
      const ids = Object.keys(firstIdByStation).map(key => firstIdByStation[key])
      Promise.all(ids.map(id => getAssigneeCandidates(id))).then(results => {
        this.actionDialog.candidatesLoading = false
        const lists = results.map(res => (res && Number(res.code) === 200 && Array.isArray(res.data) ? res.data : []))
        this.actionDialog.candidates = lists.reduce((common, list) =>
          common.filter(item => list.some(other => String(other.adminId) === String(item.adminId))))
      }).catch(() => {
        this.actionDialog.candidatesLoading = false
      })
    },
    submitBatch() {
      const type = this.actionDialog.type
      const ids = this.actionDialog.rows.map(row => row.id)
      const remark = String(this.actionDialog.form.remark || '').trim()
      if (type === 'assign' && !this.actionDialog.form.assigneeUserId) {
        this.$message.warning('请选择指派人')
        return
      }
      if (type !== 'assign' && !remark) {
        this.$message.warning(type === 'cancel' ? '请输入取消原因' : '请输入处理说明')
        return
      }
      this.actionDialog.loading = true
      let request
      if (type === 'assign') {
        request = batchAssignFaultWorkOrders({ ids, assigneeUserId: this.actionDialog.form.assigneeUserId })
      } else if (type === 'cancel') {
        request = batchCancelFaultWorkOrders({ ids, closeRemark: remark })
      } else {
        request = batchCloseFaultWorkOrders({ ids, closeRemark: remark })
      }
      request.then(res => {
        this.actionDialog.loading = false
        if (res && Number(res.code) === 200 && res.data) {
          this.actionDialog.visible = false
          this.batchResult = {
            visible: true,
            successCount: res.data.successCount || 0,
            failures: Array.isArray(res.data.failures) ? res.data.failures : []
          }
          this.clearSelection()
          this.getList()
          return
        }
        this.$message.error((res && res.msg) || '操作失败')
      }).catch(() => {
        this.actionDialog.loading = false
      })
    },
    canReopen(row) {
      return this.hasPerm('reopen') && !!row && row.status === 'CLOSED'
    },
    handleActionCommand(command, row) {
      if (command === 'remark') this.openRemark(row)
      if (command === 'close') this.openFinish(row, 'close')
      if (command === 'cancel') this.openFinish(row, 'cancel')
    },
    submitAction() {
      if (this.actionDialog.batch) {
        this.submitBatch()
        return
      }
      const row = this.actionDialog.row
      if (!row || !row.id) return
      const type = this.actionDialog.type
      const remark = String(this.actionDialog.form.remark || '').trim()
      const attachments = this.actionDialog.form.attachments || []
      if (type === 'remark' && !remark && !attachments.length) {
        this.$message.warning('请填写备注或上传照片')
        return
      }
      if ((type === 'close' || type === 'cancel') && !remark) {
        this.$message.warning('请输入处理说明')
        return
      }
      if (type === 'reopen' && !remark) {
        this.$message.warning('请输入重新打开原因')
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
        request = remarkFaultWorkOrder(row.id, { remark, attachments })
      } else if (type === 'cancel') {
        request = cancelFaultWorkOrder(row.id, { closeRemark: this.actionDialog.form.remark })
      } else if (type === 'reopen') {
        request = reopenFaultWorkOrder(row.id, { reason: remark })
      } else {
        request = closeFaultWorkOrder(row.id, { closeRemark: this.actionDialog.form.remark, attachments })
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
      if (!form.alarmCode) {
        this.$message.warning('请选择告警项')
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
        if (query[key] !== '' && query[key] !== null && query[key] !== undefined && query[key] !== false) {
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
    fileUrl(url) {
      if (!url) return ''
      if (/^https?:/i.test(url)) return url
      return ((this.Global && this.Global.APIURl) || '') + url
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
.status-tabs {
  margin-bottom: 4px;
}
.status-tabs__count {
  margin-left: 4px;
  color: #909399;
  font-size: 12px;
  font-style: normal;
}
.status-in-tag {
  margin-bottom: 12px;
}
.duration--overdue {
  color: #f56c6c;
  font-weight: 600;
}
.duration__tag {
  margin-left: 4px;
}
.fault-order-drawer {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 20px;
  background: #f5f7fa;
}
.detail-card {
  margin-bottom: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.06);
}
.detail-card__title {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}
.detail-card__title i {
  margin-right: 6px;
  color: #409eff;
  font-size: 16px;
}
.detail-hero__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detail-hero__title {
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}
.detail-hero__dot {
  width: 3px;
  height: 3px;
  margin: 0 8px;
  background: #c0c4cc;
  border-radius: 50%;
}
.detail-hero__steps {
  margin-top: 20px;
}
.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
}
.detail-field--wide {
  grid-column: span 2;
}
.detail-field__label {
  margin-bottom: 4px;
  color: #909399;
  font-size: 12px;
}
.detail-field__value {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}
.detail-field--highlight {
  padding: 10px 12px;
  background: #f0f9eb;
  border-radius: 4px;
}
.detail-timeline {
  padding-left: 2px;
}
.action-item {
  display: flex;
  align-items: center;
}
.action-item__title {
  color: #303133;
  font-weight: 600;
}
.action-item__meta {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
.action-item__remark {
  margin-top: 6px;
  padding: 8px 10px;
  color: #606266;
  line-height: 1.5;
  background: #f5f7fa;
  border-radius: 4px;
}
.action-item__images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.action-item__image {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  cursor: pointer;
}
.drawer-footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}
.drawer-footer--end {
  justify-content: flex-end;
}
.create-drawer {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px 8px;
}
.create-form .el-form-item {
  margin-bottom: 18px;
}
.drawer-footer__danger {
  margin-left: 12px;
  color: #f56c6c;
}
.drawer-footer__danger:hover {
  color: #f78989;
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
.row-actions__reopen {
  color: #e6a23c;
}
.batch-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
}
.batch-bar__count {
  margin-right: 16px;
  color: #606266;
}
.batch-bar__count b {
  color: #409eff;
}
.batch-result__summary {
  margin-bottom: 12px;
  color: #606266;
}
.batch-result__success {
  color: #67c23a;
}
.batch-result__fail {
  color: #f56c6c;
}
.action-dialog-tip {
  margin-bottom: 16px;
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
.fault-order-drawer-wrap .el-drawer__header {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}
.fault-order-drawer-wrap .el-drawer__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
.fault-order-drawer-wrap .create-form .el-form-item__label {
  padding-bottom: 4px;
  line-height: 22px;
}
.fault-order-drawer-wrap .el-step__title {
  font-size: 13px;
}
.fault-order-drawer-wrap .el-step__description {
  padding: 0 4px;
  font-size: 11px;
}
</style>
