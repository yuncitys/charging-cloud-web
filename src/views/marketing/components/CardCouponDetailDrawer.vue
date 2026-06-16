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
            <el-tag v-if="coupon.cancelFlag === '1'" size="mini" type="info">已作废</el-tag>
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
              <span class="detail-grid__label">承担方</span>
              <span class="detail-grid__value">{{ undertakerLabel }}</span>
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
          <div class="detail-grid detail-grid--2">
            <template v-if="coupon.cardCouponType === '1'">
              <div class="detail-grid__item">
                <span class="detail-grid__label">电费优惠</span>
                <span class="detail-grid__value">{{ formatPercent(coupon.powerPercentage) }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">服务费优惠</span>
                <span class="detail-grid__value">{{ formatPercent(coupon.servicePercentage) }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">抵用卡面额</span>
                <span class="detail-grid__value">{{ coupon.faceValue }} 元</span>
              </div>
            </template>
            <template v-else>
              <div class="detail-grid__item">
                <span class="detail-grid__label">优惠类型</span>
                <span class="detail-grid__value">{{ deductionLabel }}</span>
              </div>
              <div class="detail-grid__item">
                <span class="detail-grid__label">满减规则</span>
                <span class="detail-grid__value">
                  满 {{ coupon.amountLimit != null ? coupon.amountLimit : '—' }} 元减 {{ coupon.faceValue }} 元
                </span>
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
          <div v-else-if="coupon.scopeType === '3' && !stationList.length" class="detail-scope-hint">
            按电站分组配置，具体分组信息请至电站分组管理查看。
          </div>
          <template v-else>
            <el-input
              v-model="stationKeyword"
              placeholder="搜索电站名称"
              clearable
              size="small"
              style="width: 240px; margin-bottom: 12px;"
            />
            <el-table :data="filteredStations" border size="small" max-height="320">
              <el-table-column type="index" width="50" label="#" align="center" />
              <el-table-column prop="stationId" label="电站ID" align="center" width="100" />
              <el-table-column prop="stationName" label="电站名称" align="center" min-width="200" show-overflow-tooltip />
            </el-table>
            <div v-if="!stationList.length" class="detail-scope-hint">暂无关联电站</div>
          </template>
        </div>
      </template>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">关闭</el-button>
      <el-button v-if="coupon && coupon.cancelFlag !== '1'" type="primary" @click="handleEdit">编辑</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { cardCouponDetail } from '@/api/marketing/marketing'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import {
  CARD_COUPON_TYPE,
  USE_TYPE,
  EFFECTIVE_TIME_TYPE,
  getDeductionTypeLabel,
  getScopeTypeLabel,
  UNDERTAKER_TYPE
} from '../constants/cardCoupon'
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
      stationNameMap: {},
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
      return CARD_COUPON_TYPE[this.coupon.cardCouponType] || this.coupon.cardCouponType
    },
    deductionLabel() {
      return getDeductionTypeLabel(this.coupon && this.coupon.deductionType)
    },
    preferentialLabel() {
      if (!this.coupon) return '—'
      if (this.coupon.cardCouponType === '1') return '折扣比例'
      return this.deductionLabel
    },
    useTypeLabel() {
      if (!this.coupon) return '—'
      const prefix = this.coupon.cardCouponType === '1' ? '抵用卡' : '券'
      const t = USE_TYPE[this.coupon.useType] || ''
      return t ? `${t}${prefix}` : '—'
    },
    undertakerLabel() {
      if (!this.coupon) return '—'
      return UNDERTAKER_TYPE[this.coupon.undertakerType] || this.coupon.undertakerType
    },
    effectiveTimeTypeLabel() {
      if (!this.coupon) return '—'
      return EFFECTIVE_TIME_TYPE[this.coupon.effectiveTimeType] || this.coupon.effectiveTimeType
    },
    scopeTypeLabel() {
      return getScopeTypeLabel(this.coupon && this.coupon.scopeType)
    },
    showAllStations() {
      return this.coupon && this.coupon.scopeType === '4'
    },
    filteredStations() {
      const kw = (this.stationKeyword || '').trim()
      if (!kw) return this.stationList
      return this.stationList.filter(s => (s.stationName || '').indexOf(kw) !== -1)
    }
  },
  methods: {
    onOpen() {
      this.loadDetail()
    },
    onClose() {
      this.coupon = null
      this.stationList = []
      this.stationKeyword = ''
    },
    formatPercent(val) {
      if (val == null || val === '') return '—'
      return `${val}%`
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
        this.stationNameMap = map
        this.stationList = stationIds.map(id => ({
          stationId: String(id),
          stationName: map[String(id)] || '—'
        }))
      })
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
        const stationIds = res.data.stationIds || []
        this.loadStationNames(stationIds).finally(() => {
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
  margin-bottom: 20px;
}
.detail-header__name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.detail-header__tags {
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
.detail-grid--2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
.detail-grid--1 {
  display: grid;
  grid-template-columns: 1fr;
}
.detail-grid__item {
  display: flex;
  min-height: 40px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}
.detail-grid--2 .detail-grid__item:nth-child(odd) {
  border-right: 1px solid #ebeef5;
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
