<template>
  <div class="app-container marketing-page">
    <div class="marketing-banner">
      <div class="marketing-banner__content">
        <h2 class="marketing-banner__title">玩转营销，提升运营收益</h2>
        <p class="marketing-banner__subtitle">
          快速掌握各类活动玩法与规则，助力商户提高收益与用户粘性。先配置卡券，再选择下方活动类型创建专属营销方案。
        </p>
        <el-button type="primary" round @click="$router.push({ name: 'cardCouponList' })">管理卡券资产</el-button>
      </div>
      <i class="el-icon-present marketing-banner__deco" />
    </div>

    <el-alert
      class="marketing-page-alert"
      type="info"
      :closable="false"
      show-icon
      title="营销活动工具"
      description="选择活动类型进入专属管理页，配置规则、发放卡券并查看该活动的领取与使用数据。"
    />

    <div v-if="!activityTypes.length" class="marketing-empty-hint">
      <i class="el-icon-warning-outline marketing-empty-hint__icon" />
      <p>暂无可用活动类型，请联系管理员分配权限</p>
    </div>

    <div v-else class="marketing-tool-grid">
      <div
        v-for="item in activityTypes"
        :key="item.value"
        class="marketing-tool-card"
        @click="goTypeList(item)"
      >
        <div class="marketing-tool-card__icon" :style="hubIconStyle">
          <i :class="item.icon" />
        </div>
        <div class="marketing-tool-card__body">
          <div class="marketing-tool-card__title-row">
            <h4 class="marketing-tool-card__title">{{ item.label }}</h4>
            <span class="marketing-tool-card__tag">{{ item.tag }}</span>
          </div>
          <p class="marketing-tool-card__desc">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getActivityTypeMeta } from './constants/activityTypes'
import { getVisibleActivityTypes } from './utils/marketingActivityAuth'
import { mapGetters } from 'vuex'
import './styles/marketing.scss'

const RECHARGE_TYPE = getActivityTypeMeta('2')

export default {
  name: 'activityHub',
  computed: {
    ...mapGetters(['adminUser']),
    activityTypes() {
      return getVisibleActivityTypes(this.adminUser)
    },
    hubIconStyle() {
      return {
        background: `linear-gradient(135deg, ${RECHARGE_TYPE.color}, ${RECHARGE_TYPE.colorLight})`
      }
    }
  },
  methods: {
    goTypeList(item) {
      this.$router.push({
        name: 'activityList',
        query: { activityType: item.value, typeName: item.label }
      })
    }
  }
}
</script>

<style scoped>
.marketing-empty-hint {
  margin-top: 24px;
  padding: 48px 24px;
  text-align: center;
  color: #909399;
  background: #fafafa;
  border-radius: 8px;
}
.marketing-empty-hint__icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.marketing-empty-hint p {
  margin: 0;
  font-size: 14px;
}
</style>
