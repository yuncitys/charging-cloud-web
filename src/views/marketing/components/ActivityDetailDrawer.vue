<template>
  <el-drawer
    title="活动详情"
    :visible.sync="visibleSync"
    direction="rtl"
    size="720px"
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

        <el-alert
          v-if="typeMeta && typeMeta.autoIssueTip"
          :title="typeMeta.autoIssueTip"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px;"
        />

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
            <div v-if="showInitiator || showActivityTime" class="detail-grid__row">
              <div
                v-if="showInitiator"
                class="detail-grid__item"
                :class="{ 'detail-grid__item--full': !showActivityTime }"
              >
                <span class="detail-grid__label">发起方</span>
                <span class="detail-grid__value">{{ initiatorLabel }}</span>
              </div>
              <div
                v-if="showActivityTime"
                class="detail-grid__item"
                :class="{ 'detail-grid__item--full': !showInitiator }"
              >
                <span class="detail-grid__label">活动时间</span>
                <span class="detail-grid__value">
                  {{ activity.activityBeginTime | formatDate }} ~ {{ activity.activityEndTime | formatDate }}
                </span>
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
          </div>
        </div>

        <div v-if="activity.activityRemark || activity.activityRule || ruleImageUrl" class="detail-section">
          <div class="detail-section__title">活动说明</div>
          <div class="detail-grid">
            <div v-if="activity.activityRemark" class="detail-grid__row">
              <div class="detail-grid__item detail-grid__item--full">
                <span class="detail-grid__label">活动说明</span>
                <span class="detail-grid__value">{{ activity.activityRemark }}</span>
              </div>
            </div>
            <div v-if="activityType === '2' && ruleImageUrl" class="detail-grid__row">
              <div class="detail-grid__item detail-grid__item--full">
                <span class="detail-grid__label">规则图片</span>
                <span class="detail-grid__value">
                  <el-image :src="ruleImageUrl" fit="contain" class="detail-image" :preview-src-list="[ruleImageUrl]" />
                </span>
              </div>
            </div>
            <div v-else-if="activity.activityRule" class="detail-grid__row">
              <div class="detail-grid__item detail-grid__item--full">
                <span class="detail-grid__label">活动规则</span>
                <span class="detail-grid__value">{{ activity.activityRule }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasTypeConfig" class="detail-section">
          <div class="detail-section__title">活动配置</div>
          <div class="detail-grid">
            <template v-if="activityType === '2'">
              <div class="detail-grid__row">
                <div class="detail-grid__item detail-grid__item--full">
                  <span class="detail-grid__label">限制次数</span>
                  <span class="detail-grid__value">{{ subConfig.limitCount }} {{ limitTypeLabel }}</span>
                </div>
              </div>
            </template>
            <template v-if="activityType === '3'">
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">发放方式</span>
                  <span class="detail-grid__value">{{ sendTypeLabel }}</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">发放状态</span>
                  <span class="detail-grid__value">{{ sendStatusLabel }}</span>
                </div>
              </div>
              <div v-if="subConfig.sendType === '2'" class="detail-grid__row">
                <div class="detail-grid__item detail-grid__item--full">
                  <span class="detail-grid__label">定时时间</span>
                  <span class="detail-grid__value">{{ subConfig.sendTime | formatDate }}</span>
                </div>
              </div>
              <div class="detail-grid__row">
                <div class="detail-grid__item detail-grid__item--full">
                  <span class="detail-grid__label">用户维度</span>
                  <span class="detail-grid__value">{{ userScopeLabel }}</span>
                </div>
              </div>
            </template>
            <template v-if="activityType === '4'">
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">发放条件</span>
                  <span class="detail-grid__value">充电满 {{ subConfig.limitPower }} 度发放</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">限制次数</span>
                  <span class="detail-grid__value">{{ subConfig.limitCount }} {{ limitTypeLabel }}</span>
                </div>
              </div>
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">电站维度</span>
                  <span class="detail-grid__value">{{ stationScopeLabel }}</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">用户维度</span>
                  <span class="detail-grid__value">{{ userScopeLabel }}</span>
                </div>
              </div>
            </template>
            <template v-if="activityType === '5'">
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">活动标题</span>
                  <span class="detail-grid__value">{{ subConfig.activityTitle || '—' }}</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">限制次数</span>
                  <span class="detail-grid__value">{{ subConfig.limitCount }} {{ limitTypeLabel }}</span>
                </div>
              </div>
              <div class="detail-grid__row">
                <div class="detail-grid__item detail-grid__item--full">
                  <span class="detail-grid__label">用户维度</span>
                  <span class="detail-grid__value">{{ userScopeLabel }}</span>
                </div>
              </div>
              <div v-if="subConfig.activityImage" class="detail-grid__row">
                <div class="detail-grid__item detail-grid__item--full">
                  <span class="detail-grid__label">活动图片</span>
                  <span class="detail-grid__value">
                    <el-image :src="subConfig.activityImage" fit="contain" class="detail-image" :preview-src-list="[subConfig.activityImage]" />
                  </span>
                </div>
              </div>
            </template>
            <template v-if="activityType === '6'">
              <div class="detail-grid__row">
                <div class="detail-grid__item">
                  <span class="detail-grid__label">发放总数量</span>
                  <span class="detail-grid__value">{{ subConfig.sendTotalCount }} 个</span>
                </div>
                <div class="detail-grid__item">
                  <span class="detail-grid__label">用户维度</span>
                  <span class="detail-grid__value">{{ userScopeLabel }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">卡券奖励</div>
          <template v-if="activityType === '2'">
            <div v-for="(tier, idx) in rechargeTiers" :key="idx" class="reward-tier">
              <div class="reward-tier__title">充值满 {{ tier.threshold }} 元</div>
              <el-table :data="tier.rewards" border size="small">
                <el-table-column type="index" width="50" label="序号" align="center" />
                <el-table-column label="卡券名称" align="center" min-width="180" show-overflow-tooltip>
                  <template slot-scope="scope">{{ couponName(scope.row.rewardId) }}</template>
                </el-table-column>
                <el-table-column label="数量" align="center" width="100">
                  <template slot-scope="scope">{{ scope.row.rewardCount }} 张/人</template>
                </el-table-column>
              </el-table>
            </div>
            <div v-if="!rechargeTiers.length" class="detail-scope-hint">暂无卡券配置</div>
          </template>
          <template v-else>
            <el-table :data="rewards" border size="small">
              <el-table-column type="index" width="50" label="序号" align="center" />
              <el-table-column label="卡券名称" align="center" min-width="180" show-overflow-tooltip>
                <template slot-scope="scope">{{ couponName(scope.row.rewardId) }}</template>
              </el-table-column>
              <el-table-column label="数量" align="center" width="100">
                <template slot-scope="scope">{{ scope.row.rewardCount }} 张/人</template>
              </el-table-column>
            </el-table>
            <div v-if="!rewards.length" class="detail-scope-hint">暂无卡券配置</div>
          </template>
        </div>

        <div v-if="showUserScopeList" class="detail-section">
          <div class="detail-section__title">用户范围</div>
          <div v-if="isAllUsers" class="detail-scope-hint">全部用户，无需单独配置。</div>
          <el-table v-else :data="userScopes" border size="small" max-height="280">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="dataName" label="名称" align="center" min-width="200" show-overflow-tooltip />
          </el-table>
          <div v-if="!isAllUsers && !userScopes.length" class="detail-scope-hint">暂无配置</div>
        </div>

        <div v-if="showStationScopeList" class="detail-section">
          <div class="detail-section__title">电站范围</div>
          <div v-if="isAllStations" class="detail-scope-hint">全部电站，无需单独配置。</div>
          <el-table v-else :data="stationScopes" border size="small" max-height="280">
            <el-table-column type="index" width="50" label="序号" align="center" />
            <el-table-column prop="dataName" label="名称" align="center" min-width="200" show-overflow-tooltip />
          </el-table>
          <div v-if="!isAllStations && !stationScopes.length" class="detail-scope-hint">暂无配置</div>
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
import { activityDetail, cardCouponRewardOptions } from '@/api/marketing/marketing'
import { getMerchant } from '@/api/merchant/merchant'
import { getActivityStatusLabel, getActivityStatusTagType, getActivityTypeMeta, getLimitTypeLabel, getSendTypeLabel, getSendStatusLabel, getActivityUserScopeLabel, getActivityStationScopeLabel } from '../constants/activityTypes'
import { canEditMarketingActivity, hasActivityEditAction } from '../utils/marketingActivityAuth'
import { MARKETING_PERMS } from '../constants/marketingPermissions'
import { parseTime } from '@/utils/index'
import '../styles/marketing.scss'

export default {
  name: 'ActivityDetailDrawer',
  filters: {
    formatDate(time) {
      if (!time) return '—'
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  props: {
    visible: { type: Boolean, default: false },
    activityId: { type: String, default: '' },
    activityType: { type: String, default: '' }
  },
  data() {
    return {
      loading: false,
      activity: null,
      rewards: [],
      userScopes: [],
      stationScopes: [],
      subConfig: {},
      couponNameMap: {},
      merchantNameMap: {}
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    typeMeta() {
      return getActivityTypeMeta(this.activityType)
    },
    typeLabel() {
      return this.typeMeta ? this.typeMeta.label : this.activityType
    },
    statusLabel() {
      return getActivityStatusLabel(this.activity && this.activity.activityStatus)
    },
    statusTagType() {
      return getActivityStatusTagType(this.activity && this.activity.activityStatus)
    },
    canShowEdit() {
      return this.activity &&
        hasActivityEditAction(this.activityType, MARKETING_PERMS.activityUpdate) &&
        canEditMarketingActivity(this.activity)
    },
    showInitiator() {
      return ['3', '4', '5', '6'].includes(this.activityType)
    },
    showActivityTime() {
      return this.activityType !== '3' && this.activityType !== '6'
    },
    ruleImageUrl() {
      if (this.activityType !== '2' || !this.activity) return ''
      return this.activity.activityRule || ''
    },
    hasTypeConfig() {
      return ['2', '3', '4', '5', '6'].includes(this.activityType) && this.subConfig
    },
    userScopeLabel() {
      return getActivityUserScopeLabel(this.subConfig && this.subConfig.userScope)
    },
    stationScopeLabel() {
      return getActivityStationScopeLabel(this.subConfig && this.subConfig.stationScope)
    },
    sendTypeLabel() {
      return getSendTypeLabel(this.subConfig && this.subConfig.sendType)
    },
    sendStatusLabel() {
      return getSendStatusLabel(this.subConfig && this.subConfig.sendStatus)
    },
    limitTypeLabel() {
      return getLimitTypeLabel(this.subConfig && this.subConfig.limitType)
    },
    initiatorLabel() {
      if (!this.activity) return '—'
      if (this.activity.activityInitiator === '1') return '平台'
      const id = this.activity.activityInitiatorId
      if (id && this.merchantNameMap[String(id)]) {
        return `商户 · ${this.merchantNameMap[String(id)]}`
      }
      return '商户'
    },
    rechargeTiers() {
      if (!this.rewards || !this.rewards.length) return []
      const map = {}
      this.rewards.forEach(r => {
        const key = String(r.rewardThreshold != null ? r.rewardThreshold : 0)
        if (!map[key]) map[key] = { threshold: r.rewardThreshold, rewards: [] }
        map[key].rewards.push(r)
      })
      return Object.values(map)
    },
    showUserScopeList() {
      return ['3', '4', '5', '6'].includes(this.activityType)
    },
    showStationScopeList() {
      return this.activityType === '4'
    },
    isAllUsers() {
      return this.subConfig && this.subConfig.userScope === '3'
    },
    isAllStations() {
      return this.subConfig && this.subConfig.stationScope === '3'
    }
  },
  created() {
    ;['marketing_activity_status', 'marketing_send_type', 'marketing_send_status', 'marketing_limit_type', 'marketing_activity_user_scope', 'marketing_activity_station_scope'].forEach(code => {
      this.$dict.getSelector(code)
    })
  },
  methods: {
    onOpen() {
      this.loadCouponOptions()
      this.loadMerchantOptions()
      this.loadDetail()
    },
    onClose() {
      this.activity = null
      this.rewards = []
      this.userScopes = []
      this.stationScopes = []
      this.subConfig = {}
    },
    loadCouponOptions() {
      cardCouponRewardOptions().then(res => {
        const map = {}
        ;(res.data || []).forEach(c => {
          map[c.cardCouponId] = c.cardCouponName
        })
        this.couponNameMap = map
      })
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
    couponName(rewardId) {
      return this.couponNameMap[rewardId] || rewardId || '—'
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
        const { activity, rewards, userScopes, stationScopes, subConfig } = res.data
        this.activity = activity || null
        this.rewards = rewards || []
        this.userScopes = userScopes || []
        this.stationScopes = stationScopes || []
        this.subConfig = subConfig || {}
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
.detail-image {
  max-width: 280px;
  max-height: 120px;
}
.reward-tier {
  margin-bottom: 16px;
}
.reward-tier__title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}
</style>
