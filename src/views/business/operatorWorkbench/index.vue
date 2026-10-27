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
        <el-button size="mini" type="primary" @click="loadOverview">重试</el-button>
      </div>
      <div v-else class="wb-cards">
        <div class="wb-card">
          <div class="wb-card__label">经营实收（元）</div>
          <div class="wb-card__value">{{ money(overview.actualIncome) }}</div>
          <div class="wb-card__sub">与经营报表一致（订单实收口径）</div>
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
        <span class="wb-block__asof">{{ alertAsOfText }}</span>
        <el-button class="wb-block__btn" size="mini" icon="el-icon-setting" @click="openConfig">预警设置</el-button>
        <el-button size="mini" icon="el-icon-view" @click="openDismissed">已忽略</el-button>
        <el-button size="mini" icon="el-icon-close" :disabled="!alertSelection.length" @click="openBatchDismiss">
          批量忽略<template v-if="alertSelection.length">（{{ alertSelection.length }}）</template>
        </el-button>
        <el-link class="wb-block__link wb-block__link--inline" type="primary" :underline="false" @click="go('/device/faultMonitor')">
          故障监控 <i class="el-icon-arrow-right" />
        </el-link>
      </div>
      <div v-if="blocks.alerts.error" class="wb-error">
        <span>{{ blocks.alerts.error }}</span>
        <el-button size="mini" type="primary" @click="loadAlerts">重试</el-button>
      </div>
      <template v-else>
        <el-table :data="alerts" size="small" style="width: 100%" empty-text="暂无预警" @selection-change="onAlertSelectionChange">
          <el-table-column type="selection" width="45" align="center" />
          <el-table-column label="站点" prop="stationName" min-width="160" show-overflow-tooltip />
          <el-table-column label="预警类型" width="120" align="center">
            <template slot-scope="scope">
              <el-tag size="small" :type="alertMeta(scope.row.alertType).tag">{{ alertMeta(scope.row.alertType).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="260">
            <template slot-scope="scope">{{ alertDesc(scope.row) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="goAlert(scope.row)">去处理</el-button>
              <el-button type="text" size="small" @click="openDismiss(scope.row)">忽略</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="wb-pagination"
          background
          layout="total, sizes, prev, pager, next"
          :total="alertTotal"
          :current-page="alertPage"
          :page-size="alertLimit"
          :page-sizes="[20, 50, 100]"
          @size-change="onAlertSizeChange"
          @current-change="onAlertPageChange"
        />
      </template>
    </div>

    <!-- 预警设置抽屉：自定义 class + 底栏固定，避免说明文案过长把「保存」顶出可视区 -->
    <el-drawer
      title="预警设置"
      :visible.sync="configDrawer"
      direction="rtl"
      size="480px"
      append-to-body
      custom-class="wb-alert-config-drawer"
    >
      <div class="wb-drawer">
        <div class="wb-drawer__body">
          <el-form label-position="top" size="small">
            <el-form-item v-if="!searchForm.merchantId" label="商户">
              <el-select v-model="configMerchantId" filterable placeholder="请选择商户" style="width: 100%" @change="loadConfig">
                <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
              </el-select>
            </el-form-item>
          </el-form>
          <el-form v-loading="configLoading" label-position="top" size="small" class="wb-config-form">
            <el-form-item label="收入骤降比例">
              <el-input-number v-model="configForm.dropRatioThreshold" :min="0.01" :max="1" :step="0.05" :precision="4" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.dropRatioThreshold }}</div>
            </el-form-item>
            <el-form-item label="骤降基线金额（元）">
              <el-input-number v-model="configForm.dropBaselineMin" :min="0" :step="10" :precision="2" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.dropBaselineMin }}</div>
            </el-form-item>
            <el-form-item label="故障高发（新建工单数）">
              <el-input-number v-model="configForm.faultHighMinOrders" :min="1" :step="1" :precision="0" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.faultHighMinOrders }}</div>
            </el-form-item>
            <el-form-item label="启动成功率下限">
              <el-input-number v-model="configForm.startSuccessRateMin" :min="0.01" :max="1" :step="0.05" :precision="4" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.startSuccessRateMin }}</div>
            </el-form-item>
            <el-form-item label="启动失败最少订单数">
              <el-input-number v-model="configForm.startFailMinSamples" :min="1" :step="1" :precision="0" style="width: 200px" />
              <div class="wb-tip">{{ FIELD_TIPS.startFailMinSamples }}</div>
            </el-form-item>
          </el-form>
          <div class="wb-drawer__note">{{ CONFIG_FOOTER_NOTE }}</div>
        </div>
        <div class="wb-drawer__footer">
          <el-button size="small" @click="configDrawer = false">取消</el-button>
          <el-button size="small" type="primary" :loading="configSaving" :disabled="!configMerchantId" @click="saveConfig">保存</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 忽略时长 -->
    <el-dialog title="忽略预警" :visible.sync="dismissDialog" width="420px" append-to-body>
      <div v-if="dismissMode === 'batch'" class="wb-dismiss-info">已选 {{ dismissTargets.length }} 条预警</div>
      <div v-else-if="dismissTarget" class="wb-dismiss-info">
        {{ dismissTarget.stationName }} · {{ alertMeta(dismissTarget.alertType).label }}
      </div>
      <el-form label-width="80px" size="small">
        <el-form-item label="忽略时长">
          <el-radio-group v-model="dismissDays">
            <el-radio-button :label="3">3 天</el-radio-button>
            <el-radio-button :label="7">7 天</el-radio-button>
            <el-radio-button :label="30">30 天</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="wb-tip">忽略后该站点该类型预警在期限内不再出现在列表，到期自动恢复；商户内共享，可在「已忽略」中取消。</div>
      <span slot="footer">
        <el-button size="small" @click="dismissDialog = false">取消</el-button>
        <el-button size="small" type="primary" :loading="dismissing" @click="confirmDismiss">确定</el-button>
      </span>
    </el-dialog>

    <!-- 已忽略抽屉 -->
    <el-drawer title="已忽略的预警" :visible.sync="dismissedDrawer" direction="rtl" size="560px" append-to-body>
      <div class="wb-drawer">
        <el-form v-if="!searchForm.merchantId" label-position="top" size="small">
          <el-form-item label="商户">
            <el-select v-model="dismissedMerchantId" filterable placeholder="请选择商户" style="width: 100%" @change="loadDismissed">
              <el-option v-for="m in merchantList" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <el-table v-loading="dismissedLoading" :data="dismissedList" size="small" empty-text="暂无已忽略预警">
          <el-table-column label="站点" prop="stationName" min-width="140" show-overflow-tooltip />
          <el-table-column label="类型" width="110" align="center">
            <template slot-scope="scope">
              <el-tag size="small" :type="alertMeta(scope.row.alertType).tag">{{ alertMeta(scope.row.alertType).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="到期时间" prop="expireAt" min-width="150" />
          <el-table-column label="操作" width="90" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="cancelOne(scope.row)">取消忽略</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

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
        <el-button size="mini" type="primary" @click="loadFinance">重试</el-button>
      </div>
      <template v-else>
        <el-alert v-if="finance.hint" class="wb-hint" type="info" :closable="false" show-icon :title="finance.hint" />
        <div class="wb-cards wb-cards--3">
          <div class="wb-card">
            <div class="wb-card__label">出账合计（元）</div>
            <div class="wb-card__value">{{ money(finance.receivable) }}</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">结算实收（元）</div>
            <div class="wb-card__value">{{ money(finance.actualReceived) }}</div>
            <div class="wb-card__sub">与站点财务日账单一致</div>
          </div>
          <div class="wb-card">
            <div class="wb-card__label">已结算（元）</div>
            <div class="wb-card__value">{{ money(finance.settledAmount) }}</div>
            <div class="wb-card__sub">{{ settledSubText }}</div>
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
        <el-button size="mini" type="primary" @click="loadMarketing">重试</el-button>
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
  workbenchMarketing,
  getAlertConfig,
  saveAlertConfig,
  dismissAlert,
  batchDismissAlerts,
  listDismissed,
  cancelDismiss
} from '@/api/business/operatorWorkbench'

const ALERT_META = {
  START_FAIL: { label: '启动失败率高', tag: 'danger' },
  FAULT_HIGH: { label: '故障工单多', tag: 'danger' },
  INCOME_DROP: { label: '收入骤降', tag: 'warning' },
  ZERO_INCOME: { label: '零收入', tag: 'info' }
}

// 字段提示全文（spec：设置 UI）
const FIELD_TIPS = {
  dropRatioThreshold: '含义：判定日经营实收相对近 7 日均值的比例上限。作用：比例越低越「严」（更容易报骤降）。填 0.5 表示实收不到均价一半才告警。',
  dropBaselineMin: '含义：近 7 日均值的最低门槛。作用：均值低于该金额的站点不报骤降，避免长期低流水小站误报。',
  faultHighMinOrders: '含义：判定日新建故障工单数的下限。作用：达到或超过该笔数则进入「故障高发」列表，便于优先派修。',
  startSuccessRateMin: '含义：启动成功订单占比的最低可接受值。作用：成功率低于该值则告警；调低可减少告警，调高更敏感。',
  startFailMinSamples: '含义：参与成功率计算的最少样本（启动+无响应）。作用：样本不足不告警，避免「仅 1 单失败」刷屏。'
}
const CONFIG_FOOTER_NOTE = '修改后立即作用于预警列表，无需重跑统计任务。预警判定日规则与 V1 相同（选「今日」时看昨日已收口日）。'
const DEFAULT_CONFIG = {
  dropRatioThreshold: 0.5,
  dropBaselineMin: 100,
  faultHighMinOrders: 3,
  startSuccessRateMin: 0.9,
  startFailMinSamples: 10
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
      FIELD_TIPS,
      CONFIG_FOOTER_NOTE,
      configDrawer: false,
      configLoading: false,
      configSaving: false,
      configMerchantId: null,
      configForm: { ...DEFAULT_CONFIG },
      dismissDialog: false,
      dismissing: false,
      dismissTarget: null,
      dismissMode: 'one', // 'one' | 'batch'
      dismissTargets: [], // 批量模式下的已选行
      alertSelection: [],
      dismissDays: 7,
      dismissedDrawer: false,
      dismissedLoading: false,
      dismissedMerchantId: null,
      dismissedList: [],
      overview: {},
      alerts: [],
      alertPage: 1,
      alertLimit: 20,
      alertTotal: 0,
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
    alertAsOfText() {
      const first = this.alerts.length ? this.alerts[0] : null
      const day = first && first.alertDate
      return (day ? `判定日：${day}` : '按已收口营业日判定') + '（今日未收口，周期含今日时取昨日）'
    },
    settledSubText() {
      const f = this.finance
      if (!f.settlementPeriodStart) return '商户结算快照汇总'
      const range = f.settlementPeriodStart === f.settlementPeriodEnd
        ? f.settlementPeriodStart
        : `${f.settlementPeriodStart} ~ ${f.settlementPeriodEnd}`
      return `结算快照汇总（${range}），待结算暂无`
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
    buildParams(withPage) {
      const f = this.searchForm
      const p = { periodType: f.periodType }
      if (f.merchantId) p.merchantId = f.merchantId
      if (f.stationIds && f.stationIds.length) p.stationIds = f.stationIds
      if (withPage) {
        p.page = this.alertPage
        p.limit = this.alertLimit
      }
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
      // 无权限不请求；四块互不阻断；查询/换筛选条件回到第 1 页
      this.alertPage = 1
      if (this.canView) this.loadOverview()
      if (this.canAlerts) this.loadAlerts()
      if (this.canFinance) this.loadFinance()
      if (this.canMarketing) this.loadMarketing()
    },
    // 通用块加载：失败只影响本块
    runBlock(key, api, onOk, withPage) {
      const block = this.blocks[key]
      block.loading = true
      block.error = ''
      return api(this.buildParams(withPage)).then(res => {
        if (res && res.code === 200) {
          onOk(res.data, res)
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
      // 刷新/失败重试前清空勾选，避免表格销毁后「批量忽略（N）」仍指向不可见旧行
      this.alertSelection = []
      return this.runBlock('alerts', workbenchAlerts, (d, res) => {
        this.alerts = Array.isArray(d) ? d : []
        const count = Number(res && res.count)
        this.alertTotal = isNaN(count) ? this.alerts.length : count
        // 忽略/取消后当前页已越界：回退到最后一页重新加载
        if (!this.alerts.length && this.alertTotal > 0 && this.alertPage > 1) {
          this.alertPage = Math.max(1, Math.ceil(this.alertTotal / this.alertLimit))
          this.$nextTick(() => this.loadAlerts()) // 等外层 loading 复位后再重载
        }
      }, true)
    },
    onAlertPageChange(page) {
      this.alertPage = page
      this.loadAlerts() // loadAlerts 内会清空勾选
    },
    onAlertSizeChange(size) {
      this.alertLimit = size
      this.alertPage = 1
      this.loadAlerts()
    },
    loadFinance() {
      return this.runBlock('finance', workbenchFinance, d => { this.finance = d || {} })
    },
    loadMarketing() {
      return this.runBlock('marketing', workbenchMarketing, d => { this.marketing = d || {} })
    },
    // 默认商户：筛选商户 > 唯一商户 > 空（需在抽屉内选择）
    defaultMerchantId() {
      if (this.searchForm.merchantId) return this.searchForm.merchantId
      return this.merchantList.length === 1 ? this.merchantList[0].id : null
    },
    openConfig() {
      this.configMerchantId = this.defaultMerchantId()
      this.configForm = { ...DEFAULT_CONFIG }
      this.configDrawer = true
      if (this.configMerchantId) this.loadConfig()
    },
    loadConfig() {
      if (!this.configMerchantId) return
      this.configLoading = true
      getAlertConfig(this.configMerchantId).then(res => {
        if (res && res.code === 200 && res.data) {
          const d = res.data
          this.configForm = {
            dropRatioThreshold: Number(d.dropRatioThreshold),
            dropBaselineMin: Number(d.dropBaselineMin),
            faultHighMinOrders: Number(d.faultHighMinOrders),
            startSuccessRateMin: Number(d.startSuccessRateMin),
            startFailMinSamples: Number(d.startFailMinSamples)
          }
        } else {
          this.$message.error((res && res.msg) || '读取预警设置失败')
        }
      }).catch(() => {}).then(() => { this.configLoading = false })
    },
    saveConfig() {
      if (!this.configMerchantId) return this.$message.warning('请选择商户')
      this.configSaving = true
      saveAlertConfig({ merchantId: this.configMerchantId, ...this.configForm }).then(res => {
        if (res && res.code === 200) {
          this.$message.success('保存成功')
          this.configDrawer = false
          this.loadAlerts() // 保存后立即刷新预警列表
        } else {
          this.$message.error((res && res.msg) || '保存失败')
        }
      }).catch(() => {}).then(() => { this.configSaving = false })
    },
    onAlertSelectionChange(rows) {
      this.alertSelection = rows || []
    },
    openDismiss(row) {
      this.dismissMode = 'one'
      this.dismissTarget = row
      this.dismissTargets = []
      this.dismissDays = 7
      this.dismissDialog = true
    },
    openBatchDismiss() {
      if (!this.alertSelection.length) return
      this.dismissMode = 'batch'
      this.dismissTarget = null
      this.dismissTargets = this.alertSelection.slice()
      this.dismissDays = 7
      this.dismissDialog = true
    },
    // 批量：缺 merchantId（行内与筛选商户均无）的行在提交前过滤，计入失败条数并提示
    confirmBatchDismiss() {
      const items = []
      let skipped = 0
      this.dismissTargets.forEach(row => {
        const merchantId = row.merchantId || this.searchForm.merchantId
        if (!merchantId) {
          skipped++
          return
        }
        items.push({ merchantId, stationId: row.stationId, alertType: row.alertType })
      })
      if (!items.length) {
        return this.$message.warning('所选预警缺少商户信息，请先在筛选中选择商户')
      }
      this.dismissing = true
      batchDismissAlerts({ days: this.dismissDays, items }).then(res => {
        if (res && res.code === 200) {
          const d = res.data || {}
          const ok = Number(d.successCount) || 0
          const fail = (Number(d.failCount) || 0) + skipped
          const firstMsg = d.failures && d.failures.length ? d.failures[0].msg : ''
          if (fail > 0) {
            this.$message.warning(`已忽略 ${ok} 条，失败 ${fail} 条${firstMsg ? '（' + firstMsg + '）' : ''}`)
          } else {
            this.$message.success(`已忽略 ${ok} 条`)
          }
          this.dismissDialog = false
          this.dismissTargets = []
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '批量忽略失败')
          this.loadAlerts()
        }
      }).catch(() => {
        this.loadAlerts()
      }).then(() => { this.dismissing = false })
    },
    confirmDismiss() {
      if (this.dismissMode === 'batch') return this.confirmBatchDismiss()
      const row = this.dismissTarget
      if (!row) return
      const merchantId = row.merchantId || this.searchForm.merchantId
      this.dismissing = true
      dismissAlert({
        merchantId,
        stationId: row.stationId,
        alertType: row.alertType,
        days: this.dismissDays
      }).then(res => {
        if (res && res.code === 200) {
          this.$message.success(`已忽略 ${this.dismissDays} 天`)
          this.dismissDialog = false
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '忽略失败')
        }
      }).catch(() => {}).then(() => { this.dismissing = false })
    },
    openDismissed() {
      this.dismissedMerchantId = this.defaultMerchantId()
      this.dismissedList = []
      this.dismissedDrawer = true
      if (this.dismissedMerchantId) this.loadDismissed()
    },
    loadDismissed() {
      if (!this.dismissedMerchantId) return
      this.dismissedLoading = true
      listDismissed(this.dismissedMerchantId).then(res => {
        if (res && res.code === 200) {
          this.dismissedList = Array.isArray(res.data) ? res.data : []
        } else {
          this.$message.error((res && res.msg) || '加载失败')
        }
      }).catch(() => {}).then(() => { this.dismissedLoading = false })
    },
    cancelOne(row) {
      cancelDismiss(row.id, this.dismissedMerchantId).then(res => {
        if (res && res.code === 200) {
          this.$message.success('已取消忽略')
          this.loadDismissed()
          this.loadAlerts()
        } else {
          this.$message.error((res && res.msg) || '取消失败')
        }
      }).catch(() => {})
    },
    alertMeta(type) {
      return ALERT_META[type] || { label: type || '-', tag: 'info' }
    },
    alertDesc(row) {
      const m = row.metricValue
      const c = row.compareValue
      switch (row.alertType) {
        case 'ZERO_INCOME': return '判定日实收为 0'
        case 'INCOME_DROP': return `较前7日均值降幅 ${this.percent(m)}，判定日实收 ${this.money(c)} 元`
        case 'FAULT_HIGH': return `判定日新建故障工单 ${this.int(m)} 个（阈值 ${this.int(c)}）`
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
  .wb-block__btn {
    margin-left: auto;
  }
  .wb-block__link {
    margin-left: auto;
    & + .wb-block__link {
      margin-left: 16px;
    }
  }
  .wb-block__btn + .el-button {
    margin-left: 8px;
  }
  .wb-block__link--inline {
    margin-left: 16px;
  }
  .wb-pagination {
    margin-top: 12px;
    text-align: right;
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
    &--3 {
      grid-template-columns: repeat(3, 1fr);
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

// 抽屉 / 对话框 append-to-body，不在页面根节点内，样式需放在外层
.wb-tip {
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
  margin-top: 4px;
}
.wb-dismiss-info {
  margin-bottom: 12px;
  color: #303133;
  font-weight: 600;
}
.wb-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.wb-drawer__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 16px;
}
.wb-drawer__note {
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  background: #f7f9fc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 8px;
}
.wb-drawer__footer {
  flex-shrink: 0;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  text-align: right;
  background: #fff;
}
</style>

<style>
/* append-to-body 抽屉须用非 scoped，否则无法作用到 .el-drawer__body */
.wb-alert-config-drawer.el-drawer .el-drawer__body {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.wb-alert-config-drawer.el-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
</style>
