<template>
  <div class="app-container station-pricing-schedule">
    <div class="filter-container">
      <el-input
        v-model="query.scheduleName"
        class="filter-item"
        style="width: 220px; margin-right: 10px;"
        placeholder="任务名称"
        clearable
        @keyup.enter.native="onSearch"
      />
      <el-select
        v-model="query.status"
        class="filter-item"
        style="width: 140px; margin-right: 10px;"
        placeholder="计划状态"
        clearable
      >
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="query.dateRange"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        range-separator="至"
        start-placeholder="生效时间起"
        end-placeholder="生效时间止"
        class="filter-item"
        style="margin-right: 10px;"
      />
      <el-button class="filter-item" type="primary" size="mini" icon="el-icon-search" @click="onSearch">查询</el-button>
      <el-button
        v-if="btnAuthen.permsVerifAuthention(':station:charge:carSchedule:add')"
        class="filter-item"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="openDrawer('create')"
      >新建调价任务</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      element-loading-text="加载中..."
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column type="index" label="序号" width="60" align="center" header-align="center" />
      <el-table-column prop="scheduleName" label="任务名称" min-width="150" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column prop="stationNames" label="站点" min-width="180" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column prop="toDevicePriceId" label="目标模板ID" width="110" align="center" header-align="center" />
      <el-table-column prop="templateName" label="计费规则模板" min-width="160" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column prop="effectiveTimeText" label="生效时间" width="170" align="center" header-align="center" />
      <el-table-column prop="status" label="状态" width="110" align="center" header-align="center">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ formatStatus(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" align="center" header-align="center" show-overflow-tooltip />
      <el-table-column label="操作" width="220" align="center" header-align="center" fixed="right">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="viewDetail(scope.row)">详情</el-button>
          <el-button
            v-if="canEdit(scope.row) && btnAuthen.permsVerifAuthention(':station:charge:carSchedule:edit')"
            type="warning"
            size="mini"
            @click="openDrawer('edit', scope.row)"
          >编辑</el-button>
          <el-button
            v-if="canCancel(scope.row) && btnAuthen.permsVerifAuthention(':station:charge:carSchedule:cancel')"
            type="danger"
            size="mini"
            @click="cancelSchedule(scope.row)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="query.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <el-drawer
      :title="drawerMode === 'edit' ? '编辑调价任务' : '新建调价任务'"
      :visible.sync="drawerVisible"
      size="680px"
      :wrapper-closable="false"
    >
      <div class="station-pricing-schedule__drawer-body">
        <el-form ref="scheduleFormRef" :model="scheduleForm" label-width="92px">
          <el-form-item label="任务名称">
            <el-input
              v-model="scheduleForm.scheduleName"
              maxlength="64"
              show-word-limit
              placeholder="请输入任务名称"
            />
          </el-form-item>
          <el-form-item label="选择站点">
            <div class="station-select-box">
              <div class="station-select-box__actions">
                <el-button class="station-select-box__action-btn" type="primary" size="mini" @click="expandStationTree(true)">全部展开</el-button>
                <el-button class="station-select-box__action-btn" type="primary" size="mini" @click="expandStationTree(false)">全部收起</el-button>
              </div>
              <el-tree
                ref="stationTreeRef"
                :data="stationTreeData"
                show-checkbox
                node-key="id"
                :props="stationTreeProps"
                @check-change="onStationTreeCheckChange"
              />
            </div>
            <div class="station-selected-tip">
              已选择 {{ scheduleForm.stationIds.length }} 个站点
            </div>
          </el-form-item>
          <el-form-item label="计费模板">
            <el-select
              v-model="selectedTemplateId"
              filterable
              clearable
              placeholder="请选择汽车计费模板"
              :loading="templateLoading"
              class="station-pricing-schedule__template-select"
              @change="onTemplateSelected"
            >
              <el-option
                v-for="item in templateOptions"
                :key="item.id"
                :label="item.optionLabel"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生效时间">
            <el-date-picker
              v-model="scheduleForm.effectiveTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择生效时间"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="scheduleForm.remark"
              type="textarea"
              :rows="3"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>
        </el-form>

        <div v-if="selectedTemplateId" v-loading="templateDetailLoading" class="station-pricing-schedule__template-preview">
          <div class="station-pricing-schedule__template-title">计费模板详情</div>
          <div class="price-item" v-for="(item, index) in previewData.priceTier" :key="'tier_' + index">
            <el-input disabled :value="item.periodTypeName" class="price-item__period-tag" />
            <el-input class="price-input" size="medium" type="number" :value="item.powerPrice" disabled>
              <template slot="prepend">电费</template>
              <template slot="append">元/度</template>
            </el-input>
            <el-input class="price-input" size="medium" type="number" :value="item.serviceFee" disabled>
              <template slot="prepend">服务费</template>
              <template slot="append">元/度</template>
            </el-input>
          </div>

          <div
            v-for="(item, index) in previewData.periodTimePrices.periodPriceList"
            :key="'period_' + index"
            class="price-period-item"
          >
            <div class="price-period-item__time">
              <select-time
                :st-time="item.stTime"
                :en-time="item.enTime"
                :item-index="index"
                :disabled-items="previewData.disabledItems"
                :disabled="true"
              />
            </div>
            <div class="price-period-item__type">
              <el-select class="select-priod-type" :value="item.periodTypeId" disabled>
                <el-option
                  v-for="(tier, tierIndex) in previewData.priceTier"
                  :key="'opt_' + tierIndex"
                  :value="tier.periodTypeId"
                  :label="tier.periodTypeName + ': 电费[' + tier.powerPrice + '元/度] 服务费[' + tier.serviceFee + '元/度]'"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <div class="station-pricing-schedule__drawer-footer">
        <el-button size="mini" @click="drawerVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" :loading="drawerSubmitting" @click="submitSchedule">确 定</el-button>
      </div>
    </el-drawer>

    <el-drawer
      title="任务详情"
      :visible.sync="detailDrawerVisible"
      size="1300px"
      :wrapper-closable="false"
    >
      <div class="station-pricing-schedule__drawer-body">
        <div class="station-pricing-schedule__section-title">基本信息</div>
        <el-form label-width="96px" class="station-pricing-schedule__detail-form station-pricing-schedule__detail-card">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="任务名称">
                <div class="station-pricing-schedule__detail-value">{{ detail.scheduleName || '-' }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生效站点">
                <div class="station-pricing-schedule__detail-value">{{ detail.stationNames || '-' }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目标模板ID">
                <div class="station-pricing-schedule__detail-value">{{ detail.toDevicePriceId || '-' }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计费模板">
                <div class="station-pricing-schedule__detail-value">{{ detail.templateName || '-' }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="生效时间">
                <div class="station-pricing-schedule__detail-value">{{ detail.effectiveTime || '-' }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <div class="station-pricing-schedule__detail-value">{{ formatStatus(detail.status) }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <div class="station-pricing-schedule__detail-value station-pricing-schedule__detail-value--textarea">{{ detail.remark || '-' }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div v-loading="detailTemplateLoading" class="station-pricing-schedule__template-preview">
          <div class="station-pricing-schedule__section-title">规则模板详情</div>
          <div class="price-item" v-for="(item, index) in detailPreviewData.priceTier" :key="'detail_tier_' + index">
            <div class="station-pricing-schedule__detail-value">{{ item.periodTypeName }}</div>
            <div class="station-pricing-schedule__detail-value">电费：{{ item.powerPrice }} 元/度</div>
            <div class="station-pricing-schedule__detail-value">服务费：{{ item.serviceFee }} 元/度</div>
          </div>

          <div
            v-for="(item, index) in detailPreviewData.periodTimePrices.periodPriceList"
            :key="'detail_period_' + index"
            class="price-period-item price-period-item--detail"
          >
            <div class="price-period-item__lead">
              <div class="station-pricing-schedule__detail-value">{{ getPeriodTypeName(item.periodTypeId, detailPreviewData.priceTier) }}</div>
            </div>
            <div class="price-period-item__time">
              <div class="station-pricing-schedule__detail-value">{{ item.stTime }} 至 {{ item.enTime }}</div>
            </div>
            <div class="price-period-item__type">
              <div class="station-pricing-schedule__detail-value">
                {{ formatPeriodTypeLabel(item.periodTypeId, detailPreviewData.priceTier) }}
              </div>
            </div>
          </div>
        </div>

        <div class="station-pricing-schedule__section-title">执行日志</div>
        <div class="station-pricing-schedule__log-filter">
          <el-input
            v-model="detailLogQuery.deviceCode"
            placeholder="设备编码"
            clearable
            style="width: 220px; margin-right: 10px;"
            @keyup.enter.native="onDetailLogSearch"
          />
          <el-select
            v-model="detailLogQuery.result"
            clearable
            placeholder="执行结果"
            style="width: 160px; margin-right: 10px;"
          >
            <el-option v-for="item in logResultOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" size="mini" icon="el-icon-search" @click="onDetailLogSearch">查询</el-button>
        </div>

        <el-table
          v-loading="detailLogLoading"
          :data="detailLogTableData"
          element-loading-text="加载中..."
          fit
          highlight-current-row
          style="width: 100%;"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="stationName" label="归属电站" min-width="140" align="center" show-overflow-tooltip />
          <el-table-column prop="deviceCode" label="电堆编号" min-width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="resultLabel" label="调价结果" width="120" align="center" />
          <el-table-column prop="errorMsg" label="调价结果说明" min-width="200" align="center" show-overflow-tooltip />
          <el-table-column prop="responseTimeText" label="设备响应时间" width="110" align="center" />
          <el-table-column prop="executeTimeText" label="平台执行时间" width="170" align="center" />
          <el-table-column label="操作" width="110" align="center">
            <template slot-scope="scope">
              <el-button
                v-if="btnAuthen.permsVerifAuthention(':station:charge:carSchedule:retry')"
                type="primary"
                size="mini"
                :disabled="!canRetryDetailLog(scope.row)"
                @click="onRetryDetailLog(scope.row)"
              >重试校价</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            :current-page="detailLogQuery.page"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="detailLogQuery.limit"
            :total="detailLogTotal"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="onDetailLogPageSizeChange"
            @current-change="onDetailLogPageChange"
          />
        </div>
      </div>
      <div class="station-pricing-schedule__drawer-footer">
        <el-button type="primary" size="mini" @click="detailDrawerVisible = false">关 闭</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import SelectTime from '@/components/SelectTime/index'
import { getChargeStationTreeByMerchant } from '@/api/netWorkDot/netWorkDotList.js'
import {
  createPricingSchedule,
  updatePricingSchedule,
  cancelPricingSchedule,
  getPricingSchedulePage,
  getPricingScheduleLogPage,
  retryPricingScheduleLog,
  getCarPricingTemplateOptions,
  getCarPricingTemplateDetail
} from '@/api/netWorkDot/stationPricingRule.js'
import { parseTime } from '@/utils/index'

function buildEmptyPreviewData() {
  return {
    priceTier: [
      { periodTypeId: '0', periodTypeName: '尖', powerPrice: '0.0', serviceFee: '0.0' },
      { periodTypeId: '1', periodTypeName: '峰', powerPrice: '0.0', serviceFee: '0.0' },
      { periodTypeId: '2', periodTypeName: '平', powerPrice: '0.0', serviceFee: '0.0' },
      { periodTypeId: '3', periodTypeName: '谷', powerPrice: '0.0', serviceFee: '0.0' }
    ],
    disabledItems: [],
    periodTimePrices: {
      defaultPeriodTypeId: '',
      periodPriceList: []
    }
  }
}

export default {
  name: 'StationPricingScheduleList',
  components: {
    SelectTime
  },
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      query: {
        page: 1,
        limit: 10,
        scheduleName: '',
        status: '',
        dateRange: []
      },
      statusOptions: [
        { value: 0, label: '待执行' },
        { value: 1, label: '执行中' },
        { value: 2, label: '执行成功' },
        { value: 3, label: '执行失败' },
        { value: 4, label: '已取消' }
      ],
      logResultOptions: [
        { value: 0, label: '待执行' },
        { value: 1, label: '待响应' },
        { value: 2, label: '成功' },
        { value: 3, label: '失败' }
      ],
      templateLoading: false,
      templateOptions: [],
      templateNameMap: {},
      templateDetailLoading: false,
      drawerVisible: false,
      drawerMode: 'create',
      drawerSubmitting: false,
      editingScheduleId: null,
      selectedTemplateId: null,
      stationTreeData: [],
      stationTreeProps: {
        children: 'children',
        label: 'label'
      },
      stationNameMap: {},
      scheduleForm: {
        scheduleName: '',
        stationIds: [],
        effectiveTime: '',
        remark: ''
      },
      previewData: buildEmptyPreviewData(),
      detailDrawerVisible: false,
      detail: {},
      detailTemplateLoading: false,
      detailPreviewData: buildEmptyPreviewData(),
      detailLogLoading: false,
      detailLogTableData: [],
      detailLogTotal: 0,
      detailLogQuery: {
        scheduleId: null,
        page: 1,
        limit: 10,
        deviceCode: '',
        result: ''
      }
    }
  },
  created() {
    this.loadStationTree()
    this.loadTemplateOptions()
    this.onSearch()
  },
  methods: {
    formatStatus(val) {
      const map = { 0: '待执行', 1: '执行中', 2: '执行成功', 3: '执行失败', 4: '已取消' }
      return map[val] || '-'
    },
    statusTagType(val) {
      if (val === 0) return 'info'
      if (val === 1) return 'warning'
      if (val === 2) return 'success'
      if (val === 3) return 'danger'
      if (val === 4) return ''
      return 'info'
    },
    formatLogResult(val) {
      const map = {
        0: '待执行',
        1: '待响应',
        2: '成功',
        3: '失败'
      }
      return map[val] || '-'
    },
    formatPeriodTypeLabel(periodTypeId, tiers) {
      const list = Array.isArray(tiers) ? tiers : []
      const target = list.find((item) => String(item.periodTypeId) === String(periodTypeId))
      if (!target) return '-'
      // return `${target.periodTypeName}电费 ${target.powerPrice}元/度` + `；${target.periodTypeName}服务费 ${target.serviceFee}元/度`
      return `电费 ${target.powerPrice} 元/度` + `；服务费 ${target.serviceFee} 元/度`
    },
    getPeriodTypeName(periodTypeId, tiers) {
      const list = Array.isArray(tiers) ? tiers : []
      const target = list.find((item) => String(item.periodTypeId) === String(periodTypeId))
      return target && target.periodTypeName ? target.periodTypeName : '-'
    },
    canCancel(row) {
      return row && row.status === 0
    },
    canEdit(row) {
      return row && row.status === 0
    },
    onSearch() {
      this.query.page = 1
      this.loadPage()
    },
    onPageSizeChange(limit) {
      this.query.limit = limit
      this.query.page = 1
      this.loadPage()
    },
    onPageChange(page) {
      this.query.page = page
      this.loadPage()
    },
    loadPage() {
      const payload = {
        page: this.query.page,
        limit: this.query.limit
      }
      if (this.query.scheduleName) {
        payload.scheduleName = this.query.scheduleName.trim()
      }
      if (this.query.status !== '') {
        payload.status = Number(this.query.status)
      }
      if (this.query.dateRange && this.query.dateRange.length === 2) {
        payload.beginEffectiveTime = this.query.dateRange[0]
        payload.endEffectiveTime = this.query.dateRange[1]
      }
      this.loading = true
      getPricingSchedulePage(payload).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '获取任务列表失败')
          this.tableData = []
          this.total = 0
          return
        }
        const rows = Array.isArray(res.data) ? res.data : []
        this.tableData = rows.map((row) => {
          const toDevicePriceId = row.toDevicePriceId != null ? Number(row.toDevicePriceId) : null
          return {
            ...row,
            id: row.id,
            stationIdsArr: this.parseStationIdsFromString(row.stationIds),
            scheduleName: row.scheduleName || '-',
            stationNames: row.stationNames || '-',
            toDevicePriceId,
            templateName: this.templateNameMap[toDevicePriceId] || '-',
            effectiveTimeText: row.effectiveTime ? parseTime(row.effectiveTime) : '-',
            status: row.status != null ? Number(row.status) : null
          }
        })
        this.total = Number(res.count || 0)
      }).catch(() => {
        this.$message.error('获取任务列表失败')
      }).finally(() => {
        this.loading = false
      })
    },
    resetDrawerForm() {
      this.editingScheduleId = null
      this.selectedTemplateId = null
      this.scheduleForm = {
        scheduleName: '',
        stationIds: [],
        effectiveTime: '',
        remark: ''
      }
      this.previewData = buildEmptyPreviewData()
    },
    openDrawer(mode, row) {
      this.drawerMode = mode
      this.resetDrawerForm()
      if (mode === 'edit' && row) {
        this.editingScheduleId = row.id
        this.scheduleForm.scheduleName = row.scheduleName || ''
        this.scheduleForm.stationIds = Array.isArray(row.stationIdsArr) ? row.stationIdsArr.slice() : []
        this.scheduleForm.effectiveTime = row.effectiveTime ? parseTime(row.effectiveTime) : row.effectiveTimeText
        this.scheduleForm.remark = row.remark || ''
        if (row.toDevicePriceId != null) {
          this.selectedTemplateId = Number(row.toDevicePriceId)
          this.onTemplateSelected(this.selectedTemplateId)
        }
      }
      this.drawerVisible = true
      this.syncTreeCheckedKeys()
    },
    parseStationIdsFromString(value) {
      if (!value) return []
      return String(value).split(',').map((x) => Number(x)).filter((x) => Number.isFinite(x))
    },
    loadStationTree() {
      getChargeStationTreeByMerchant({ ruleId: 2 }).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '加载站点树失败')
          return
        }
        const rows = Array.isArray(res.data) ? res.data : []
        const stationNameMap = {}
        this.stationTreeData = rows.map((merchant) => ({
          id: `merchant-${merchant.id}`,
          label: merchant.name,
          children: (merchant.chargingStationInfoVoList || []).map((station) => {
            const sid = Number(station.id)
            stationNameMap[sid] = station.networkName || String(sid)
            return {
              id: sid,
              label: station.networkName || String(sid)
            }
          })
        }))
        this.stationNameMap = stationNameMap
      }).catch(() => {
        this.$message.error('加载站点树失败')
      })
    },
    expandStationTree(expand) {
      const tree = this.$refs.stationTreeRef
      if (!tree || !tree.store || !tree.store.nodesMap) return
      Object.keys(tree.store.nodesMap).forEach((key) => {
        const node = tree.store.nodesMap[key]
        if (node && node.childNodes && node.childNodes.length) {
          node.expanded = expand
        }
      })
    },
    onStationTreeCheckChange() {
      const tree = this.$refs.stationTreeRef
      if (!tree) return
      const checked = tree.getCheckedKeys()
      this.scheduleForm.stationIds = checked.filter((id) => Number.isFinite(Number(id))).map((id) => Number(id))
    },
    syncTreeCheckedKeys() {
      this.$nextTick(() => {
        const tree = this.$refs.stationTreeRef
        if (!tree) return
        tree.setCheckedKeys(this.scheduleForm.stationIds)
      })
    },
    loadTemplateOptions() {
      this.templateLoading = true
      getCarPricingTemplateOptions({ ruleId: 2, priceType: 1 }).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '加载计费模板失败')
          return
        }
        const rows = Array.isArray(res.data) ? res.data : []
        const map = {}
        this.templateOptions = rows
          .map((item) => {
            const id = item && item.id != null ? Number(item.id) : null
            const feeName = item && item.feeName != null ? String(item.feeName) : ''
            const status = item && item.status != null ? Number(item.status) : null
            if (id != null) {
              map[id] = feeName || '-'
            }
            return {
              id,
              optionLabel: status === 1 ? feeName : `${feeName}（未启用）`
            }
          })
          .filter((x) => x.id != null)
        this.templateNameMap = map
        if (this.tableData.length) {
          this.tableData = this.tableData.map((item) => ({
            ...item,
            templateName: map[item.toDevicePriceId] || '-'
          }))
        }
      }).catch(() => {
        this.$message.error('加载计费模板失败')
      }).finally(() => {
        this.templateLoading = false
      })
    },
    onTemplateSelected(value) {
      const id = value != null && value !== '' ? Number(value) : null
      this.selectedTemplateId = id
      if (id == null) {
        this.previewData = buildEmptyPreviewData()
        return
      }
      this.templateDetailLoading = true
      getCarPricingTemplateDetail({ devicePriceId: id }).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '加载模板详情失败')
          return
        }
        this.applyPricingFromDetail(res.data || {})
      }).catch(() => {
        this.$message.error('加载模板详情失败')
      }).finally(() => {
        this.templateDetailLoading = false
      })
    },
    buildPricingPreviewData(item) {
      let bill = {}
      try {
        bill = typeof item.bill === 'string' ? JSON.parse(item.bill) : (item.bill || {})
      } catch (e) {
        bill = {}
      }
      const priceTier = [
        { periodTypeName: '尖', powerPrice: bill.jian, serviceFee: bill.jianEx, periodTypeId: '0' },
        { periodTypeName: '峰', powerPrice: bill.feng, serviceFee: bill.fengEx, periodTypeId: '1' },
        { periodTypeName: '平', powerPrice: bill.ping, serviceFee: bill.pingEx, periodTypeId: '2' },
        { periodTypeName: '谷', powerPrice: bill.gu, serviceFee: bill.guEx, periodTypeId: '3' }
      ]
      const periodPriceList = []
      const contents = Array.isArray(item.priceContents) ? item.priceContents : []
      contents.forEach((pc) => {
        const bt = pc && pc.beginTime ? String(pc.beginTime) : ''
        const et = pc && pc.endTime ? String(pc.endTime) : ''
        periodPriceList.push({
          stTime: bt.length >= 4 ? `${bt.substring(0, 2)}:${bt.substring(2, 4)}` : '',
          enTime: et.length >= 4 ? `${et.substring(0, 2)}:${et.substring(2, 4)}` : '',
          periodTypeId: pc && pc.flag != null ? String(pc.flag) : ''
        })
      })
      return {
        priceTier,
        disabledItems: [],
        periodTimePrices: {
          defaultPeriodTypeId: item.remainFlag != null ? String(item.remainFlag) : '',
          periodPriceList
        }
      }
    },
    applyPricingFromDetail(item) {
      this.previewData = this.buildPricingPreviewData(item)
    },
    loadDetailTemplatePreview(devicePriceId) {
      const id = Number(devicePriceId)
      if (!Number.isFinite(id) || id <= 0) {
        this.detailPreviewData = buildEmptyPreviewData()
        return
      }
      this.detailTemplateLoading = true
      getCarPricingTemplateDetail({ devicePriceId: id }).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '加载规则模板详情失败')
          this.detailPreviewData = buildEmptyPreviewData()
          return
        }
        this.detailPreviewData = this.buildPricingPreviewData(res.data || {})
      }).catch(() => {
        this.$message.error('加载规则模板详情失败')
        this.detailPreviewData = buildEmptyPreviewData()
      }).finally(() => {
        this.detailTemplateLoading = false
      })
    },
    submitSchedule() {
      const stationIds = this.scheduleForm.stationIds
      if (!this.scheduleForm.scheduleName || this.scheduleForm.scheduleName.trim() === '') {
        this.$message.error('请输入任务名称')
        return
      }
      if (!stationIds.length) {
        this.$message.error('请选择至少一个站点')
        return
      }
      if (!this.selectedTemplateId) {
        this.$message.error('请选择计费模板')
        return
      }
      if (!this.scheduleForm.effectiveTime) {
        this.$message.error('请选择生效时间')
        return
      }
      const payload = {
        scheduleName: this.scheduleForm.scheduleName.trim(),
        stationIds,
        devicePriceId: Number(this.selectedTemplateId),
        effectiveTime: this.scheduleForm.effectiveTime,
        remark: this.scheduleForm.remark || ''
      }
      if (this.drawerMode === 'edit') {
        payload.scheduleId = this.editingScheduleId
      }
      const req = this.drawerMode === 'edit' ? updatePricingSchedule(payload) : createPricingSchedule(payload)
      this.drawerSubmitting = true
      req.then((res) => {
        if (res && res.code === 200) {
          this.$message.success(res.msg || (this.drawerMode === 'edit' ? '编辑成功' : '创建成功'))
          this.drawerVisible = false
          this.onSearch()
          return
        }
        this.$message.error((res && res.msg) || (this.drawerMode === 'edit' ? '编辑失败' : '创建失败'))
      }).catch(() => {
        this.$message.error(this.drawerMode === 'edit' ? '编辑失败' : '创建失败')
      }).finally(() => {
        this.drawerSubmitting = false
      })
    },
    viewDetail(row) {
      if (!row || !row.id) return
      this.detail = {
        ...row,
        effectiveTime: row.effectiveTimeText,
        stationNames: row.stationNames || '-'
      }
      this.detailLogQuery = {
        scheduleId: row.id,
        page: 1,
        limit: 10,
        deviceCode: '',
        result: ''
      }
      this.detailLogTableData = []
      this.detailLogTotal = 0
      this.detailDrawerVisible = true
      this.loadDetailTemplatePreview(row.toDevicePriceId)
      this.loadDetailLogPage()
    },
    onDetailLogSearch() {
      this.detailLogQuery.page = 1
      this.loadDetailLogPage()
    },
    onDetailLogPageSizeChange(limit) {
      this.detailLogQuery.limit = limit
      this.detailLogQuery.page = 1
      this.loadDetailLogPage()
    },
    onDetailLogPageChange(page) {
      this.detailLogQuery.page = page
      this.loadDetailLogPage()
    },
    canRetryDetailLog(row) {
      if (!row || !row.id) return false
      return Number(row.result) !== 1 && Number(row.result) !== 2
    },
    onRetryDetailLog(row) {
      if (!this.canRetryDetailLog(row)) return
      this.$confirm(`确认重试设备【${row.deviceCode || '-'}】校价吗？`, '提示', { type: 'warning' }).then(() => {
        retryPricingScheduleLog({ logId: row.id }).then((res) => {
          if (res && res.code === 200) {
            this.$message.success(res.msg || '重试指令已下发')
            this.loadDetailLogPage()
            return
          }
          this.$message.error((res && res.msg) || '重试失败')
        }).catch(() => {
          this.$message.error('重试失败')
        })
      }).catch(() => {})
    },
    loadDetailLogPage() {
      if (!this.detailLogQuery.scheduleId) return
      const payload = {
        scheduleId: this.detailLogQuery.scheduleId,
        page: this.detailLogQuery.page,
        limit: this.detailLogQuery.limit
      }
      if (this.detailLogQuery.deviceCode) {
        payload.deviceCode = this.detailLogQuery.deviceCode.trim()
      }
      if (this.detailLogQuery.result !== '') {
        payload.result = Number(this.detailLogQuery.result)
      }
      this.detailLogLoading = true
      getPricingScheduleLogPage(payload).then((res) => {
        if (!res || res.code !== 200) {
          this.$message.error((res && res.msg) || '获取执行日志失败')
          this.detailLogTableData = []
          this.detailLogTotal = 0
          return
        }
        const rows = Array.isArray(res.data) ? res.data : []
        this.detailLogTableData = rows.map((item) => ({
          ...item,
          stationName: item.stationName || this.stationNameMap[Number(item.stationId)] || '-',
          resultLabel: this.formatLogResult(item.result),
          responseTimeText: item.responseTime != null ? `${item.responseTime}ms` : '--',
          executeTimeText: item.executeTime ? parseTime(item.executeTime) : '--'
        }))
        this.detailLogTotal = Number(res.count || 0)
      }).catch(() => {
        this.$message.error('获取执行日志失败')
      }).finally(() => {
        this.detailLogLoading = false
      })
    },
    cancelSchedule(row) {
      if (!row || !row.id) return
      this.$confirm('确定取消该调价任务吗？', '提示', { type: 'warning' }).then(() => {
        cancelPricingSchedule({ scheduleId: row.id }).then((res) => {
          if (res && res.code === 200) {
            this.$message.success(res.msg || '取消成功')
            this.onSearch()
            return
          }
          this.$message.error((res && res.msg) || '取消失败')
        }).catch(() => {
          this.$message.error('取消失败')
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.station-pricing-schedule .filter-container {
  margin-bottom: 16px;
}

.station-select-box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 10px;
}

.station-select-box__actions {
  text-align: right;
  margin-bottom: 6px;
}

.station-select-box__action-btn,
.station-select-box__action-btn:hover,
.station-select-box__action-btn:focus,
.station-select-box__action-btn:active {
  color: #fff !important;
}

.station-selected-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.station-pricing-schedule__drawer-body {
  flex: 1;
  min-height: 0;
  padding: 0 20px 70px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.station-pricing-schedule__detail-card {
  margin-bottom: 14px;
}

.station-pricing-schedule__detail-form {
  padding: 10px 0 0;
}

.station-pricing-schedule__detail-value {
  min-height: 32px;
  line-height: 20px;
  padding: 6px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  font-weight: normal;
  color: #303133;
  background: #fff;
  word-break: break-all;
}

.station-pricing-schedule__detail-value--textarea {
  min-height: 54px;
  white-space: pre-wrap;
}

.station-pricing-schedule__section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 8px 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.station-pricing-schedule__log-filter {
  margin-bottom: 10px;
}

.station-pricing-schedule__drawer-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  text-align: right;
  background: #fff;
}

.station-pricing-schedule__template-select {
  width: 100%;
}

.station-pricing-schedule__template-preview {
  margin-top: 8px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #303133;
}

.station-pricing-schedule__template-preview .station-pricing-schedule__detail-value {
  font-size: 14px;
  font-weight: normal;
  color: #303133;
}

.station-pricing-schedule__template-title {
  padding-bottom: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.price-item {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.price-item__period-tag {
  width: 100% !important;
}

.price-input {
  width: 100% !important;
}

.price-period-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.price-period-item--detail {
  grid-template-columns: 100px 1fr 1fr;
}

.price-period-item--detail .price-period-item__lead {
  width: 100px;
  min-width: 0;
}

.price-period-item--detail .price-period-item__time,
.price-period-item--detail .price-period-item__type {
  min-width: 0;
}

::v-deep .el-drawer__body {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.price-period-item__type .select-priod-type {
  width: 100%;
}

::v-deep .price-period-item__time .select-container {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
}

::v-deep .price-period-item__time .select-container .el-select {
  flex: 1;
  min-width: 0;
}
</style>

