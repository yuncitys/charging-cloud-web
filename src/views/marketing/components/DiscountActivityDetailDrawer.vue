<template>
  <el-drawer
    title="活动详情"
    :visible.sync="visibleSync"
    direction="rtl"
    size="760px"
    append-to-body
    custom-class="marketing-activity-drawer activity-detail-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <template v-if="activity">
        <div class="detail-header">
          <div class="detail-header__name">{{ activity.activityName }}</div>
          <div class="detail-header__tags">
            <el-tag v-if="typeMeta" size="mini" type="success">{{ typeMeta.label }}</el-tag>
            <el-tag size="mini" :type="statusTagType">{{ statusLabel }}</el-tag>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">活动编号</span>
                <span class="detail-grid__value">{{ activity.activityId }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">活动类型</span>
                <span class="detail-grid__value">{{ typeLabel }}</span>
              </div>
            </div>
            <div class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">发起方</span>
                <span class="detail-grid__value">{{ initiatorLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">活动时间</span>
                <span class="detail-grid__value">{{ activity.activityBeginTime | formatDate }} ~ {{ activity.activityEndTime | formatDate }}</span>
              </div>
            </div>
            <div class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">创建人</span>
                <span class="detail-grid__value">{{ activity.createUser || '—' }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">创建时间</span>
                <span class="detail-grid__value">{{ activity.createTime | formatDate }}</span>
              </div>
            </div>
            <div class="detail-grid__row">
              <div class="detail-grid__item detail-grid__item--full">
                <span class="detail-grid__label">活动说明</span>
                <span class="detail-grid__value">{{ activity.activityRemark || '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">折扣配置</div>
          <div class="detail-grid">
            <div v-if="isStationType" class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">优惠值设置方式</span>
                <span class="detail-grid__value">{{ discountValueModeLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">电站范围</span>
                <span class="detail-grid__value">{{ stationScopeTypeLabel }}</span>
              </div>
            </div>
            <div v-if="isUserType" class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">参与用户设置</span>
                <span class="detail-grid__value">{{ userScopeTypeLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">电站范围</span>
                <span class="detail-grid__value">{{ stationScopeTypeLabel }}</span>
              </div>
            </div>
            <div class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">折扣类型</span>
                <span class="detail-grid__value">{{ discountTypeLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">优惠方式</span>
                <span class="detail-grid__value">{{ rateTypeLabel }}</span>
              </div>
            </div>
            <div class="detail-grid__row">
              <div class="detail-grid__item">
                <span class="detail-grid__label">费率配置</span>
                <span class="detail-grid__value">{{ rateSettingTypeLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">全局优惠值</span>
                <span class="detail-grid__value">{{ globalRateText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">参与电站</div>
          <el-table :data="stationRows" border size="small" max-height="320">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="dataId" label="电站ID" align="center" width="110" />
            <el-table-column prop="dataName" label="电站名称" align="center" min-width="180" show-overflow-tooltip />
            <template v-if="showStationRateColumns">
              <el-table-column v-if="isUnifiedRate" :label="'统一优惠值（' + rateUnit + '）'" align="center" min-width="170">
                <template slot-scope="scope">{{ formatRateValue(scope.row.unifiedRateValue, subConfig.rateType) }}</template>
              </el-table-column>
              <template v-else>
                <el-table-column :label="'尖（' + rateUnit + '）'" align="center" min-width="120">
                  <template slot-scope="scope">{{ formatRateValue(scope.row.sharpRateValue, subConfig.rateType) }}</template>
                </el-table-column>
                <el-table-column :label="'峰（' + rateUnit + '）'" align="center" min-width="120">
                  <template slot-scope="scope">{{ formatRateValue(scope.row.peakRateValue, subConfig.rateType) }}</template>
                </el-table-column>
                <el-table-column :label="'平（' + rateUnit + '）'" align="center" min-width="120">
                  <template slot-scope="scope">{{ formatRateValue(scope.row.flatRateValue, subConfig.rateType) }}</template>
                </el-table-column>
                <el-table-column :label="'谷（' + rateUnit + '）'" align="center" min-width="120">
                  <template slot-scope="scope">{{ formatRateValue(scope.row.valleyRateValue, subConfig.rateType) }}</template>
                </el-table-column>
              </template>
            </template>
          </el-table>
          <div v-if="!stationRows.length" class="detail-scope-hint" style="margin-top: 8px;">暂无电站配置</div>

          <template v-if="isUserType">
            <el-divider />
            <div class="detail-section__title">参与用户</div>
            <el-table :data="participants" border size="small" max-height="280">
              <el-table-column type="index" width="50" label="序号" align="center" />
              <el-table-column label="类型" align="center" width="120">
                <template slot-scope="scope">{{ getParticipantTypeLabel(scope.row.participantType) }}</template>
              </el-table-column>
              <el-table-column prop="participantName" label="名称" align="center" min-width="200" show-overflow-tooltip />
            </el-table>
            <div v-if="!participants.length" class="detail-scope-hint" style="margin-top: 8px;">暂无用户配置</div>
          </template>
        </div>

        <div v-if="isStationType" class="detail-section">
          <div class="detail-section__title">使用星期</div>
          <div class="detail-scope-hint">{{ weekDaysLabel }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">生效时段</div>
          <el-table :data="timeSlots" border size="small">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="startTime" label="开始时间" align="center" />
            <el-table-column prop="endTime" label="结束时间" align="center" />
          </el-table>
          <div v-if="!timeSlots.length" class="detail-scope-hint" style="margin-top: 8px;">暂无时段配置</div>
        </div>
      </template>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">关闭</el-button>
      <el-button v-if="canShowEdit" type="primary" @click="handleEdit">编辑</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { activityDetail } from '@/api/marketing/marketing'
import { getMerchant } from '@/api/merchant/merchant'
import { ACTIVITY_STATUS, getActivityTypeMeta } from '../constants/activityTypes'
import { canEditMarketingActivity, hasActivityTypeEdit } from '../utils/marketingActivityAuth'
import {
  DISCOUNT_TYPE,
  RATE_TYPE,
  RATE_SETTING_TYPE,
  DISCOUNT_VALUE_MODE,
  STATION_SCOPE_TYPE,
  USER_SCOPE_TYPE,
  getRateUnit,
  formatRateValue,
  formatRateValues,
  formatWeekDays,
  getParticipantTypeLabel
} from '../constants/discountActivity'
import { parseTime } from '@/utils/index'
import '../styles/marketing.scss'

export default {
  name: 'DiscountActivityDetailDrawer',
  filters: {
    formatDate(time) {
      if (!time) return '—'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  props: {
    visible: { type: Boolean, default: false },
    activityType: { type: String, required: true },
    activityId: { type: String, default: '' }
  },
  data() {
    return {
      loading: false,
      activity: null,
      subConfig: {},
      stationScopes: [],
      participants: [],
      merchantNameMap: {}
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    isStationType() {
      return String(this.activityType) === '7'
    },
    isUserType() {
      return String(this.activityType) === '8'
    },
    typeMeta() {
      return getActivityTypeMeta(this.activityType)
    },
    typeLabel() {
      return this.typeMeta ? this.typeMeta.label : this.activityType
    },
    statusLabel() {
      const item = ACTIVITY_STATUS.find(s => s.value === (this.activity && this.activity.activityStatus))
      return item ? item.label : (this.activity && this.activity.activityStatus) || '—'
    },
    statusTagType() {
      const item = ACTIVITY_STATUS.find(s => s.value === (this.activity && this.activity.activityStatus))
      return item ? item.tagType : 'info'
    },
    canShowEdit() {
      return this.activity && hasActivityTypeEdit(this.activityType) && canEditMarketingActivity(this.activity)
    },
    initiatorLabel() {
      if (!this.activity) return '—'
      if (this.activity.activityInitiator === '1') return '平台'
      const id = String(this.activity.activityInitiatorId || '')
      if (id && this.merchantNameMap[id]) {
        return `商户 · ${this.merchantNameMap[id]}`
      }
      return '商户'
    },
    discountTypeLabel() {
      const key = String(this.subConfig.discountType || '')
      return DISCOUNT_TYPE[key] || key || '—'
    },
    rateTypeLabel() {
      const key = String(this.subConfig.rateType || '')
      return RATE_TYPE[key] || key || '—'
    },
    rateSettingTypeLabel() {
      const key = String(this.subConfig.rateSettingType || '')
      return RATE_SETTING_TYPE[key] || key || '—'
    },
    discountValueModeLabel() {
      const key = String(this.subConfig.discountValueMode || '')
      return DISCOUNT_VALUE_MODE[key] || key || '—'
    },
    stationScopeTypeLabel() {
      const key = String(this.subConfig.stationScopeType || '')
      if (key === '3') return '选择电站'
      return STATION_SCOPE_TYPE[key] || key || '—'
    },
    userScopeTypeLabel() {
      const key = String(this.subConfig.userScopeType || '')
      return USER_SCOPE_TYPE[key] || key || '—'
    },
    globalRateText() {
      return formatRateValues(this.subConfig)
    },
    isUnifiedRate() {
      return String(this.subConfig.rateSettingType || '1') === '1'
    },
    rateUnit() {
      return getRateUnit(this.subConfig.rateType)
    },
    showStationRateColumns() {
      return this.isStationType && String(this.subConfig.discountValueMode) === '2'
    },
    stationRows() {
      if (!this.showStationRateColumns) return this.stationScopes
      const rateMap = {}
      ;(this.subConfig.stationRates || []).forEach(rate => {
        rateMap[String(rate.stationId)] = rate
      })
      return this.stationScopes.map(scope => ({
        ...scope,
        ...(rateMap[String(scope.dataId)] || {})
      }))
    },
    weekDaysLabel() {
      return formatWeekDays(this.subConfig.weekDays)
    },
    timeSlots() {
      const slots = this.subConfig.timeSlots || []
      return [...slots].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
    }
  },
  methods: {
    formatRateValue,
    getParticipantTypeLabel,
    onOpen() {
      this.loadMerchantOptions()
      this.loadDetail()
    },
    onClose() {
      this.activity = null
      this.subConfig = {}
      this.stationScopes = []
      this.participants = []
    },
    loadMerchantOptions() {
      getMerchant({ roleType: 'OPERATOR', type: 1 }).then(res => {
        const map = {}
        ;((res && res.code === 200) ? (res.data || []) : []).forEach(m => {
          map[String(m.id)] = m.name || m.merchantName
        })
        this.merchantNameMap = map
      })
    },
    loadDetail() {
      if (!this.activityId) return
      this.loading = true
      activityDetail(this.activityId).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) {
          this.$message.error(res.msg || '加载失败')
          return
        }
        const { activity, stationScopes, subConfig } = res.data
        this.activity = activity || null
        this.subConfig = subConfig || {}
        this.stationScopes = stationScopes || []
        this.participants = (this.subConfig.participants || []).map(item => ({
          participantType: String(item.participantType || ''),
          participantId: item.participantId,
          participantName: item.participantName
        }))
      }).catch(() => {
        this.loading = false
      })
    },
    handleEdit() {
      this.$emit('edit', this.activity)
      this.visibleSync = false
    }
  }
}
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.detail-header__name {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.detail-header__tags {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}
.detail-section {
  margin-bottom: 24px;
}
.detail-section__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #30B08F;
}
.detail-scope-hint {
  font-size: 13px;
  color: #909399;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}
.detail-grid {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.detail-grid__row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-bottom: 1px solid #ebeef5;
}
.detail-grid__row:last-child {
  border-bottom: none;
}
.detail-grid__item {
  display: flex;
  min-height: 40px;
  font-size: 13px;
}
.detail-grid__row .detail-grid__item:first-child:not(:only-child) {
  border-right: 1px solid #ebeef5;
}
.detail-grid__item--full {
  grid-column: 1 / -1;
}
.detail-grid__label {
  flex-shrink: 0;
  width: 120px;
  padding: 10px 12px;
  background: #fafafa;
  color: #909399;
  border-right: 1px solid #ebeef5;
}
.detail-grid__value {
  flex: 1;
  padding: 10px 12px;
  color: #303133;
  word-break: break-all;
}
</style>
