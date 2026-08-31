<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="720px"
    append-to-body
    custom-class="marketing-activity-drawer card-coupon-detail-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <template v-if="coupon">
        <div class="detail-header">
          <div class="detail-header__name">{{ coupon.cardCouponName }}</div>
          <div class="detail-header__tags">
            <el-tag size="mini" type="success">{{ typeLabel }}</el-tag>
            <el-tag v-if="isCouponCancelled" size="mini" type="danger">已作废</el-tag>
            <el-tag v-else size="mini" type="success">正常</el-tag>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">基本信息</div>
          <div class="detail-grid detail-grid--2">
            <div class="detail-grid__item">
              <span class="detail-grid__label">卡券编号</span>
              <span class="detail-grid__value">{{ coupon.cardCouponId }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">批次号</span>
              <span class="detail-grid__value">{{ coupon.batchNumber || '—' }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">卡券类型</span>
              <span class="detail-grid__value">{{ typeLabel }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">优惠类型</span>
              <span class="detail-grid__value">{{ preferentialLabel }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">是否优惠共享</span>
              <span class="detail-grid__value">{{ discountShareLabel }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">使用类型</span>
              <span class="detail-grid__value">{{ useTypeLabel }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">库存/已发/作废</span>
              <span class="detail-grid__value">{{ coupon.stockNum || 0 }} / {{ coupon.issuedNum || 0 }} / {{ coupon.cancelNum || 0 }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">创建时间</span>
              <span class="detail-grid__value">{{ coupon.createTime | formatDate }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">优惠规则</div>
          <div class="detail-grid">
            <template v-if="isThresholdLimitCard(coupon.cardCouponType)">
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">抵扣类型</span>
                  <span class="detail-grid__value">{{ deductionLabel }}</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">{{ faceValueLabel }}</span>
                  <span class="detail-grid__value">{{ faceValueText }}</span>
                </div>
              </div>
              <div v-if="isDiscountCard(coupon.cardCouponType)" class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">折扣上限</span>
                  <span class="detail-grid__value">{{ discountCapText }}</span>
                </div>
              </div>
              <div class="detail-grid__row">
                <div class="detail-grid__item" :class="{ 'detail-grid__item--full': isDiscountCard(coupon.cardCouponType) }">
                  <span class="detail-grid__label">使用门槛</span>
                  <span class="detail-grid__value">{{ useThresholdLabel }}</span>
                </div>
                <div v-if="!isDiscountCard(coupon.cardCouponType)" class="detail-grid__item">
                  <span class="detail-grid__label">使用限额</span>
                  <span class="detail-grid__value">{{ usageLimitLabel }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">抵扣类型</span>
                  <span class="detail-grid__value">{{ deductionLabel }}</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">满减规则</span>
                  <span class="detail-grid__value">
                    满 {{ coupon.amountLimit != null ? coupon.amountLimit : '—' }} 元减 {{ coupon.faceValue }} 元
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">有效期</div>
          <div class="detail-grid detail-grid--1">
            <div class="detail-grid__item">
              <span class="detail-grid__label">有效时间类型</span>
              <span class="detail-grid__value">{{ effectiveTimeTypeLabel }}</span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">有效时间</span>
              <span v-if="coupon.effectiveTimeType === '1'" class="detail-grid__value">领取后 {{ coupon.afterReceiveDay }} 天</span>
              <span v-else class="detail-grid__value">
                {{ coupon.effectiveStartDate | formatDate }} ~ {{ coupon.effectiveEndDate | formatDate }}
              </span>
            </div>
            <div class="detail-grid__item">
              <span class="detail-grid__label">使用说明</span>
              <span class="detail-grid__value">{{ coupon.useInstructions || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">可用范围</div>
          <div class="detail-grid detail-grid--1" style="margin-bottom: 12px;">
            <div class="detail-grid__item">
              <span class="detail-grid__label">可用维度</span>
              <span class="detail-grid__value">{{ scopeTypeLabel }}</span>
            </div>
          </div>

          <div v-if="showAllStations" class="detail-scope-hint">全部电站可用，无需单独配置站点。</div>
          <div v-else-if="isStationGroupScope">
            <div v-if="!stationGroupList.length" class="detail-scope-hint">暂未配置电站分组。</div>
            <div v-else class="detail-scope-panel">
              <div class="detail-scope-panel__toolbar">
                <span class="detail-scope-panel__summary">
                  共 <strong>{{ stationGroupList.length }}</strong> 个电站分组
                </span>
              </div>
              <el-table
                :data="stationGroupList"
                border
                size="small"
                max-height="320"
                class="detail-scope-panel__table"
              >
                <el-table-column type="index" width="50" label="序号" align="center" />
                <el-table-column prop="groupId" label="分组ID" align="center" width="100" />
                <el-table-column prop="groupName" label="分组名称" align="center" min-width="200" show-overflow-tooltip />
              </el-table>
            </div>
          </div>
          <template v-else>
            <div class="detail-scope-panel">
              <div class="detail-scope-panel__toolbar">
                <span class="detail-scope-panel__summary">
                  共 <strong>{{ stationList.length }}</strong> 个电站
                  <template v-if="stationKeyword.trim()">，匹配 <strong>{{ filteredStations.length }}</strong> 个</template>
                </span>
                <el-input
                  v-model="stationKeyword"
                  placeholder="搜索电站名称"
                  clearable
                  size="small"
                  prefix-icon="el-icon-search"
                  class="detail-scope-panel__search"
                  :disabled="!stationList.length"
                />
              </div>
              <div v-if="!stationList.length" class="detail-scope-hint detail-scope-hint--inset">暂无关联电站</div>
              <el-table
                v-else-if="filteredStations.length"
                :data="filteredStations"
                border
                size="small"
                max-height="320"
                class="detail-scope-panel__table"
              >
                <el-table-column type="index" width="50" label="序号" align="center" />
                <el-table-column prop="stationId" label="电站ID" align="center" width="100" />
                <el-table-column prop="stationName" label="电站名称" align="center" min-width="200" show-overflow-tooltip />
              </el-table>
              <div v-else class="detail-scope-empty">未找到匹配的电站</div>
            </div>
          </template>
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
import { cardCouponDetail, stationGroupOptions } from '@/api/marketing/marketing'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import {
  getUseTypeLabel,
  getEffectiveTimeTypeLabel,
  getDeductionTypeLabel,
  getScopeTypeLabel,
  formatUseThreshold,
  formatUsageLimit,
  formatFaceValue,
  formatDiscountCap,
  getCardCouponTypeLabel,
  isThresholdLimitCardType,
  isDiscountCardType,
  getDiscountShareFlagLabel
} from '../constants/cardCoupon'
import { MARKETING_PERMS } from '../constants/marketingPermissions'
import { hasMarketingPerm } from '../utils/marketingActivityAuth'
import { parseTime } from '@/utils/index'
import '../styles/marketing.scss'

export default {
  name: 'CardCouponDetailDrawer',
  filters: {
    formatDate(time) {
      if (!time) return '—'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  props: {
    visible: { type: Boolean, default: false },
    cardCouponId: { type: String, default: '' }
  },
  data() {
    return {
      loading: false,
      coupon: null,
      stationList: [],
      stationGroupList: [],
      stationKeyword: ''
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    drawerTitle() {
      return this.coupon ? '卡券详情' : '卡券详情'
    },
    typeLabel() {
      if (!this.coupon) return ''
      return getCardCouponTypeLabel(this.coupon.cardCouponType)
    },
    deductionLabel() {
      return getDeductionTypeLabel(this.coupon && this.coupon.deductionType)
    },
    preferentialLabel() {
      if (!this.coupon) return '—'
      return this.deductionLabel
    },
    useThresholdLabel() {
      return formatUseThreshold(this.coupon)
    },
    usageLimitLabel() {
      return formatUsageLimit(this.coupon)
    },
    useTypeLabel() {
      if (!this.coupon) return '—'
      const typeName = getCardCouponTypeLabel(this.coupon.cardCouponType)
      const t = getUseTypeLabel(this.coupon && this.coupon.useType) || ''
      return t ? `${t}${typeName}` : '—'
    },
    faceValueLabel() {
      if (!this.coupon) return '面额'
      return isDiscountCardType(this.coupon.cardCouponType) ? '折扣值' : getCardCouponTypeLabel(this.coupon.cardCouponType) + '面额'
    },
    faceValueText() {
      return formatFaceValue(this.coupon)
    },
    discountCapText() {
      return formatDiscountCap(this.coupon)
    },
    discountShareLabel() {
      return getDiscountShareFlagLabel(this.coupon && this.coupon.discountShareFlag)
    },
    effectiveTimeTypeLabel() {
      if (!this.coupon) return '—'
      return getEffectiveTimeTypeLabel(this.coupon && this.coupon.effectiveTimeType) || (this.coupon && this.coupon.effectiveTimeType)
    },
    scopeTypeLabel() {
      return getScopeTypeLabel(this.coupon && this.coupon.scopeType)
    },
    showAllStations() {
      return this.coupon && String(this.coupon.scopeType) === '4'
    },
    isStationGroupScope() {
      return this.coupon && String(this.coupon.scopeType) === '3'
    },
    isCouponCancelled() {
      return this.coupon && String(this.coupon.cancelFlag) === '1'
    },
    canShowEdit() {
      return this.coupon && !this.isCouponCancelled && hasMarketingPerm(MARKETING_PERMS.cardCouponUpdate)
    },
    filteredStations() {
      const kw = (this.stationKeyword || '').trim()
      if (!kw) return this.stationList
      return this.stationList.filter(s => (s.stationName || '').indexOf(kw) !== -1)
    }
  },
  methods: {
    isThresholdLimitCard(type) {
      return isThresholdLimitCardType(type)
    },
    isDiscountCard(type) {
      return isDiscountCardType(type)
    },
    onOpen() {
      this.loadDetail()
    },
    onClose() {
      this.coupon = null
      this.stationList = []
      this.stationGroupList = []
      this.stationKeyword = ''
    },
    loadStationGroups(groupIds) {
      if (!groupIds || !groupIds.length) {
        this.stationGroupList = []
        return Promise.resolve()
      }
      return stationGroupOptions().then(res => {
        const options = res.data || []
        const nameMap = {}
        options.forEach(item => {
          nameMap[String(item.id)] = item.groupName
        })
        this.stationGroupList = groupIds.map(id => ({
          groupId: String(id),
          groupName: nameMap[String(id)] || '—'
        }))
      })
    },
    loadStationNames(stationIds) {
      if (!stationIds || !stationIds.length) {
        this.stationList = []
        return Promise.resolve()
      }
      return getChargingStationList({ page: 1, limit: 9999 }).then(res => {
        const list = res.data || []
        const map = {}
        list.forEach(s => {
          map[String(s.id)] = s.networkName || s.stationName || String(s.id)
        })
        this.stationList = stationIds.map(id => ({
          stationId: String(id),
          stationName: map[String(id)] || '—'
        }))
      })
    },
    loadScopeDetail(coupon, relationIds) {
      const scopeType = String(coupon && coupon.scopeType)
      if (scopeType === '4') {
        this.stationList = []
        this.stationGroupList = []
        return Promise.resolve()
      }
      if (scopeType === '3') {
        this.stationList = []
        return this.loadStationGroups(relationIds)
      }
      this.stationGroupList = []
      return this.loadStationNames(relationIds)
    },
    loadDetail() {
      if (!this.cardCouponId) return
      this.loading = true
      cardCouponDetail(this.cardCouponId).then(res => {
        if (res.code !== 200 || !res.data) {
          this.loading = false
          this.$message.error(res.msg || '加载失败')
          return
        }
        this.coupon = res.data.coupon || null
        const relationIds = res.data.stationIds || []
        this.loadScopeDetail(this.coupon, relationIds).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    handleEdit() {
      this.$emit('edit', this.coupon)
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
.detail-scope-hint--inset {
  margin: 0;
  border-radius: 0;
  border-top: none;
}
.detail-scope-panel {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.detail-scope-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}
.detail-scope-panel__summary {
  flex-shrink: 0;
  font-size: 13px;
  color: #606266;
}
.detail-scope-panel__summary strong {
  color: #303133;
  font-weight: 600;
}
.detail-scope-panel__search {
  flex: 1;
  max-width: 280px;
}
.detail-scope-panel__search >>> .el-input__inner {
  border-radius: 4px;
}
.detail-scope-panel__table {
  border: none;
}
.detail-scope-panel__table >>> .el-table__header th {
  background: #fafafa;
}
.detail-scope-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #909399;
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
.detail-grid__row .detail-grid__item:only-child {
  grid-column: 1 / -1;
}
.detail-grid--2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
.detail-grid--2 .detail-grid__item {
  border-bottom: 1px solid #ebeef5;
}
.detail-grid--2 .detail-grid__item:nth-child(odd) {
  border-right: 1px solid #ebeef5;
}
.detail-grid--1 {
  display: grid;
  grid-template-columns: 1fr;
}
.detail-grid--1 .detail-grid__item {
  border-bottom: 1px solid #ebeef5;
}
.detail-grid--1 .detail-grid__item:last-child {
  border-bottom: none;
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
