<template>
  <div class="app-container operator-workbench-page">
    <div class="filter-container">
      <el-form :inline="true" :model="searchForm" class="form left" @submit.native.prevent="search">
        <el-form-item label="统计周期">
          <el-radio-group v-model="searchForm.periodType" size="small" @change="search">
            <el-radio-button label="TODAY">今日</el-radio-button>
            <el-radio-button label="WEEK">本周</el-radio-button>
            <el-radio-button label="MONTH">本月</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商户">
          <el-select
            v-model="searchForm.merchantId"
            clearable
            filterable
            placeholder="全部"
            style="width: 200px"
            @change="onMerchantChange"
          >
            <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="站点">
          <el-select
            v-model="searchForm.stationIds"
            clearable
            filterable
            multiple
            collapse-tags
            placeholder="全部"
            style="width: 240px"
          >
            <el-option v-for="s in filteredStationList" :key="s.id" :label="s.networkName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="anyLoading" @click="search">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 经营概览 -->
    <div v-if="canView" class="wb-block" v-loading="blocks.overview.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">经营概览</span>
        <span v-if="overview.dataAsOf" class="wb-block__asof">数据时点：{{ overview.dataAsOf }}</span>
        <span v-if="overview.periodStart" class="wb-block__asof">
          统计区间：{{ overview.periodStart }} ~ {{ overview.periodEnd }}
        </span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/business/businessStatistics')">
          经营报表 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.overview.error" class="wb-error">
        <span>{{ blocks.overview.error }}</span>
        <el-button size="mini" type="primary" plain @click="loadOverview">重试</el-button>
      </div>
      <div v-else class="wb-cards">
        <div class="wb-card">
          <div class="wb-card__label">实收（元）</div>
          <div class="wb-card__value">{{ money(overview.actualIncome) }}</div>
          <div class="wb-card__sub">
            环比
            <span v-if="overview.incomeWow != null" :class="overview.incomeWow >= 0 ? 'up' : 'down'">
              {{ overview.incomeWow >= 0 ? '↑' : '↓' }} {{ percent(Math.abs(overview.incomeWow)) }}
            </span>
            <span v-else>--</span>
          </div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">充电量（度）</div>
          <div class="wb-card__value">{{ money(overview.chargeKwh) }}</div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">订单数</div>
          <div class="wb-card__value">{{ overview.orderCount != null ? overview.orderCount : 0 }}</div>
        </div>
        <div class="wb-card">
          <div class="wb-card__label">优惠金额（元）</div>
          <div class="wb-card__value">{{ money(overview.discountAmount) }}</div>
        </div>
      </div>
      <div v-if="!blocks.overview.error" class="wb-fee">
        <div class="wb-fee__title">费用结构</div>
        <div class="wb-fee__bar">
          <div class="wb-fee__seg wb-fee__seg--elec" :style="{ width: feeElecPercent + '%' }" />
          <div class="wb-fee__seg wb-fee__seg--service" :style="{ width: feeServicePercent + '%' }" />
        </div>
        <div class="wb-fee__legend">
          <span><i class="dot dot--elec" />电费 {{ money(overview.electricFee) }} 元（{{ feeElecPercent }}%）</span>
          <span><i class="dot dot--service" />服务费 {{ money(overview.serviceFee) }} 元（{{ feeServicePercent }}%）</span>
        </div>
      </div>
    </div>

    <!-- 异常预警 -->
    <div v-if="canAlerts" class="wb-block" v-loading="blocks.alerts.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">异常预警</span>
        <span class="wb-block__asof">按时段末日判定，最多展示 Top20</span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/device/faultMonitor')">
          故障监控 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.alerts.error" class="wb-error">
        <span>{{ blocks.alerts.error }}</span>
        <el-button size="mini" type="primary" plain @click="loadAlerts">重试</el-button>
      </div>
      <el-table v-else :data="alerts" size="small" style="width: 100%" empty-text="暂无预警">
        <el-table-column label="站点" prop="stationName" min-width="160" show-overflow-tooltip />
        <el-table-column label="预警类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag size="small" :type="alertMeta(scope.row.alertType).tag">{{ alertMeta(scope.row.alertType).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="260">
          <template slot-scope="scope">{{ alertDesc(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goAlert(scope.row)">去处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 财务 -->
    <div v-if="canFinance" class="wb-block" v-loading="blocks.finance.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">财务</span>
        <span v-if="finance.dataAsOf" class="wb-block__asof">数据时点：{{ finance.dataAsOf }}</span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/finance/stationFinanceDayBill')">
          站点日账单 <i class="el-icon-arrow-right" />
        </el-link>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/finance/settlementLedger')">
          结算台账 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.finance.error" class="wb-error">
        <span>{{ blocks.finance.error }}</span>
        <el-button size="mini" type="primary" plain @click="loadFinance">重试</el-button>
      </div>
      <template v-else>
        <el-alert v-if="finance.hint" class="wb-hint" type="info" :closable="false" show-icon :title="finance.hint" />
        <div class="wb-cards">
          <div class="wb-card">
            <div class="wb-card__label">应收（元）</div>
            <div class="wb-card__value">{{ money(finance.receivable) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">实收（元）</div>
            <div class="wb-card__value">{{ money(finance.actualReceived) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">已结算（元）</div>
            <div class="wb-card__value">{{ money(finance.settledAmount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">待结算（元）</div>
            <div class="wb-card__value">{{ money(finance.pendingSettlementAmount) }}</div>
          </div>
        </div>
        <div class="wb-yesterday">
          昨日：收入 {{ money(finance.yesterdayIncome) }} 元 ｜ 订单 {{ finance.yesterdayOrders != null ? finance.yesterdayOrders : 0 }} 笔 ｜
          电量 {{ money(finance.yesterdayKwh) }} 度
        </div>
      </template>
    </div>

    <!-- 营销：有权限即展示，数据全 0 也显示 -->
    <div v-if="canMarketing" class="wb-block" v-loading="blocks.marketing.loading">
      <div class="wb-block__head">
        <span class="wb-block__title">营销</span>
        <el-link class="wb-block__link" type="primary" :underline="false" @click="go('/marketing/activityHub')">
          营销中心 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.marketing.error" class="wb-error">
        <span>{{ blocks.marketing.error }}</span>
        <el-button size="mini" type="primary" plain @click="loadMarketing">重试</el-button>
      </div>
      <template v-else>
        <div class="wb-cards wb-cards--6">
          <div class="wb-card">
            <div class="wb-card__label">进行中活动</div>
            <div class="wb-card__value">{{ int(marketing.activeActivityCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">发券数</div>
            <div class="wb-card__value">{{ int(marketing.issueCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">核销数</div>
            <div class="wb-card__value">{{ int(marketing.redeemCount) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">核销率</div>
            <div class="wb-card__value">{{ percent(marketing.redeemRate) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">优惠成本（元）</div>
            <div class="wb-card__value">{{ money(marketing.discountCost) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">补贴成本（元）</div>
            <div class="wb-card__value">{{ money(marketing.subsidyCost) }}</div>
          </div>
        </div>
        <div class="wb-roi">
          核销订单实收 {{ money(marketing.redeemOrderActualIncome) }} 元 ｜ 粗略 ROI：
          <b>{{ marketing.roughRoi != null ? Number(marketing.roughRoi).toFixed(2) : '--' }}</b>
          <el-tag size="mini" type="warning" effect="plain" style="margin-left: 8px">
            {{ marketing.roiNote || '非严格增量' }}
          </el-tag>
        </div>
      </template>
    </div>

    <div v-if="!canView && !canAlerts && !canFinance && !canMarketing" class="wb-block wb-error">暂无工作台数据权限</div>
  </div>
</template>

<script>
import { getMerchant } from '@/api/merchant/merchant'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import {
  workbenchOverview,
  workbenchAlerts,
  workbenchFinance,
  workbenchMarketing
} from '@/api/business/operatorWorkbench'

const ALERT_META = {
  START_FAIL: { label: '启动失败率高', tag: 'danger' },
  FAULT_HIGH: { label: '故障工单多', tag: 'danger' },
  INCOME_DROP: { label: '收入骤降', tag: 'warning' },
  ZERO_INCOME: { label: '零收入', tag: 'info' }
}

function newBlock() {
  return { loading: false, error: '' }
}

export default {
  name: 'OperatorWorkbench',
  data() {
    return {
      searchForm: { periodType: 'TODAY', merchantId: null, stationIds: [] },
      merchantList: [],
      stationList: [],
      blocks: {
        overview: newBlock(),
        alerts: newBlock(),
        finance: newBlock(),
        marketing: newBlock()
      },
      overview: {},
      alerts: [],
      finance: {},
      marketing: {}
    }
  },
  computed: {
    canView() { return this.perm(':web:operatorWorkbench:view') },
    canAlerts() { return this.perm(':web:operatorWorkbench:alerts') },
    canFinance() { return this.perm(':web:operatorWorkbench:finance') },
    canMarketing() { return this.perm(':web:operatorWorkbench:marketing') },
    anyLoading() {
      return Object.keys(this.blocks).some(k => this.blocks[k].loading)
    },
    filteredStationList() {
      if (!this.searchForm.merchantId) return this.stationList
      return this.stationList.filter(s => s.merchantId === this.searchForm.merchantId)
    },
    feeTotal() {
      return (Number(this.overview.electricFee) || 0) + (Number(this.overview.serviceFee) || 0)
    },
    feeElecPercent() {
      if (!this.feeTotal) return 0
      return Math.round((Number(this.overview.electricFee) || 0) / this.feeTotal * 1000) / 10
    },
    feeServicePercent() {
      if (!this.feeTotal) return 0
      return Math.round((100 - this.feeElecPercent) * 10) / 10
    }
  },
  created() {
    this.initMerchant()
    this.initStationList()
    this.search()
  },
  methods: {
    perm(code) {
      return !!(this.btnAuthen && this.btnAuthen.permsVerifAuthention(code))
    },
    buildParams() {
      const f = this.searchForm
      const p = { periodType: f.periodType }
      if (f.merchantId) p.merchantId = f.merchantId
      if (f.stationIds && f.stationIds.length) p.stationIds = f.stationIds
      return p
    },
    initMerchant() {
      getMerchant().then(res => {
        if (res.code === 200) this.merchantList = res.data || []
      }).catch(() => {})
    },
    initStationList() {
      getChargingStationList({}).then(res => {
        if (res.code === 200) this.stationList = res.data || []
      }).catch(() => { this.stationList = [] })
    },
    onMerchantChange() {
      const allowed = new Set(this.filteredStationList.map(s => s.id))
      this.searchForm.stationIds = this.searchForm.stationIds.filter(id => allowed.has(id))
      this.search()
    },
    search() {
      // 无权限不请求；四块互不阻断
      if (this.canView) this.loadOverview()
      if (this.canAlerts) this.loadAlerts()
      if (this.canFinance) this.loadFinance()
      if (this.canMarketing) this.loadMarketing()
    },
    // 通用块加载：失败只影响本块
    runBlock(key, api, onOk) {
      const block = this.blocks[key]
      block.loading = true
      block.error = ''
      return api(this.buildParams()).then(res => {
        if (res && res.code === 200) {
          onOk(res.data)
        } else {
          block.error = (res && res.msg) || '加载失败，请重试'
        }
      }).catch(e => {
        block.error = (e && e.message) || '加载失败，请重试'
      }).then(() => {
        block.loading = false
      })
    },
    loadOverview() {
      return this.runBlock('overview', workbenchOverview, d => { this.overview = d || {} })
    },
    loadAlerts() {
      return this.runBlock('alerts', workbenchAlerts, d => { this.alerts = Array.isArray(d) ? d : [] })
    },
    loadFinance() {
      return this.runBlock('finance', workbenchFinance, d => { this.finance = d || {} })
    },
    loadMarketing() {
      return this.runBlock('marketing', workbenchMarketing, d => { this.marketing = d || {} })
    },
    alertMeta(type) {
      return ALERT_META[type] || { label: type || '-', tag: 'info' }
    },
    alertDesc(row) {
      const m = row.metricValue
      const c = row.compareValue
      switch (row.alertType) {
        case 'ZERO_INCOME': return '当日实收为 0'
        case 'INCOME_DROP': return `较前7日均值降幅 ${this.percent(m)}，当日实收 ${this.money(c)} 元`
        case 'FAULT_HIGH': return `当日新建故障工单 ${this.int(m)} 个（阈值 ${this.int(c)}）`
        case 'START_FAIL': return `启动成功率 ${this.percent(m)}（阈值 ${this.percent(c)}）`
        default: return ''
      }
    },
    go(path, query) {
      this.$router.push({ path, query: query || {} })
    },
    goAlert(row) {
      const query = { stationId: row.stationId }
      if (row.alertType === 'FAULT_HIGH' || row.alertType === 'START_FAIL') {
        this.go('/device/faultMonitor', query)
      } else {
        this.go('/business/businessStatistics', query)
      }
    },
    money(v) {
      const n = Number(v)
      return isNaN(n) || v == null ? '0.00' : n.toFixed(2)
    },
    int(v) {
      return v == null ? 0 : v
    },
    percent(v) {
      const n = Number(v)
      return isNaN(n) || v == null ? '0.0%' : (n * 100).toFixed(1) + '%'
    }
  }
}
</script>

<style lang="scss" scoped>
.operator-workbench-page {
  .wb-block {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 16px;
    min-height: 96px;
  }
  .wb-block__head {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }
  .wb-block__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-right: 16px;
  }
  .wb-block__asof {
    font-size: 12px;
    color: #909399;
    margin-right: 16px;
  }
  .wb-block__link {
    margin-left: auto;
    & + .wb-block__link {
      margin-left: 16px;
    }
  }
  .wb-error {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #f56c6c;
    padding: 12px 0;
  }
  .wb-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    &--6 {
      grid-template-columns: repeat(6, 1fr);
    }
  }
  .wb-card {
    background: #f7f9fc;
    border-radius: 6px;
    padding: 14px 16px;
  }
  .wb-card__label {
    font-size: 13px;
    color: #909399;
  }
  .wb-card__value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-top: 6px;
  }
  .wb-card__sub {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    .up { color: #f56c6c; }
    .down { color: #67c23a; }
  }
  .wb-hint {
    margin-bottom: 12px;
  }
  .wb-yesterday,
  .wb-roi {
    margin-top: 12px;
    font-size: 13px;
    color: #606266;
  }
  .wb-fee {
    margin-top: 16px;
  }
  .wb-fee__title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }
  .wb-fee__bar {
    display: flex;
    height: 14px;
    border-radius: 7px;
    overflow: hidden;
    background: #ebeef5;
  }
  .wb-fee__seg {
    height: 100%;
    &--elec { background: #409eff; }
    &--service { background: #e6a23c; }
  }
  .wb-fee__legend {
    display: flex;
    gap: 24px;
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    &--elec { background: #409eff; }
    &--service { background: #e6a23c; }
  }
}
</style>
