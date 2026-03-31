<template>
  <div class="order-detail-page app-container">
    <div class="toolbar">
      <el-button icon="el-icon-back" size="small" @click="goBack" type="primary">返回</el-button>
    </div>

    <div v-loading="detailLoading" class="detail-body">
      <template v-if="orderInfo && orderInfo.id != null">
        <!-- 概要 -->
        <el-card class="block-card" shadow="never">
          <div class="block-title">订单概要</div>
          <el-row :gutter="16" class="kv-grid">
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">订单号</span>
              <span class="kv-value">{{ disp(orderInfo.orderCode) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">订单类型</span>
              <span class="kv-value">{{ ruleLabel(orderInfo.ruleId) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">订单状态</span>
              <span class="kv-value">{{ $dict.getOrderStatus(orderInfo.orderStatus) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">支付状态</span>
              <span class="kv-value">{{ payStatusText(orderInfo.payStatus) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">启动方式</span>
              <span class="kv-value">{{ orderTypeText(orderInfo.orderType) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item" v-if="orderInfo.payCode">
              <span class="kv-label">支付单号</span>
              <span class="kv-value">{{ disp(orderInfo.payCode) }}</span>
            </el-col>
          </el-row>
        </el-card>

        <!-- 电站 / 设备 -->
        <el-card class="block-card" shadow="never">
          <div class="block-title">电站信息</div>
          <el-row :gutter="16" class="kv-grid">
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">电站名称</span>
              <span class="kv-value">{{ disp(orderInfo.networkName) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">设备号</span>
              <span class="kv-value">{{ disp(orderInfo.deviceCode) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">枪 / 端口</span>
              <span class="kv-value">{{ disp(orderInfo.devicePort) }} 号</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">设备地址</span>
              <span class="kv-value">{{ disp(orderInfo.networkAddress) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item" v-if="orderInfo.electricOut != null">
              <span class="kv-label">设备类型</span>
              <span class="kv-value">{{ orderInfo.electricOut === 1 ? '直流' : '交流' }}</span>
            </el-col>
          </el-row>
        </el-card>

        <!-- 用户 -->
        <el-card class="block-card" shadow="never">
          <div class="block-title">用户信息</div>
          <el-row :gutter="16" class="kv-grid">
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">手机号</span>
              <span class="kv-value">{{ disp(orderInfo.phoneNumber) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">用户昵称</span>
              <span class="kv-value">{{ disp(orderInfo.userName) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">用户编码</span>
              <span class="kv-value">{{ disp(orderInfo.userCode) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item" v-if="isCarOrder">
              <span class="kv-label">车牌号</span>
              <span class="kv-value">{{ disp(orderInfo.carNo || orderInfo.plateNo || orderInfo.licensePlate) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item" v-if="isCarOrder">
              <span class="kv-label">Vin 码</span>
              <span class="kv-value">{{ disp(orderInfo.vinCode || orderInfo.vin) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">卡号</span>
              <span class="kv-value">{{ disp(orderInfo.cardNo) }}</span>
            </el-col>
          </el-row>
        </el-card>

        <!-- 充电过程 -->
        <el-card class="block-card" shadow="never">
          <div class="block-title">充电信息</div>
          <el-row :gutter="16" class="kv-grid">
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">创建时间</span>
              <span class="kv-value">{{ formatDt(orderInfo.createTime) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">开始时间</span>
              <span class="kv-value">{{ formatDt(orderInfo.startTime) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">结束时间</span>
              <span class="kv-value">{{ formatDt(orderInfo.endTime) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">停止原因</span>
              <span class="kv-value">{{ disp(orderInfo.stopReason) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">计费类型</span>
              <span class="kv-value">{{ priceTypeText(orderInfo.priceType) }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">充电电量</span>
              <span class="kv-value">{{ disp(orderInfo.totalPower) }} {{ orderInfo.totalPower != null ? '度' : '' }}</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">充电时长</span>
              <span class="kv-value">{{ disp(orderInfo.actualDuration) }} {{ orderInfo.actualDuration != null ? '分钟' : '' }}</span>
            </el-col>
          </el-row>
        </el-card>

        <!-- 费用 -->
        <el-card class="block-card" shadow="never">
          <div class="block-title">费用信息</div>
          <el-row :gutter="16" class="kv-grid">
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">预付金额</span>
              <span class="kv-value">{{ disp(orderInfo.totalPrice) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">结算金额</span>
              <span class="kv-value">{{ disp(orderInfo.actualPrice) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">用户实付</span>
              <span class="kv-value">{{ disp(orderInfo.realityPayMoney) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">电费</span>
              <span class="kv-value">{{ disp(orderInfo.electricityPrice) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">服务费</span>
              <span class="kv-value">{{ disp(orderInfo.servicePrice) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">充电前余额</span>
              <span class="kv-value">{{ disp(orderInfo.startCash) }} 元</span>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" class="kv-item">
              <span class="kv-label">支付后余额</span>
              <span class="kv-value">{{ disp(orderInfo.endCash) }} 元</span>
            </el-col>
          </el-row>
        </el-card>

        <!-- 充电明细 -->
        <el-card class="block-card charge-details" shadow="never">
          <div class="block-title">充电明细（分段计费）</div>
          <el-table :data="chargeDetails" style="width: 100%" size="small" border>
            <el-table-column prop="timeFrame" label="充电时段" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.timeFrame == '0'">尖</span>
                <span v-else-if="scope.row.timeFrame == '1'">峰</span>
                <span v-else-if="scope.row.timeFrame == '2'">平</span>
                <span v-else-if="scope.row.timeFrame == '3'">谷</span>
                <span v-else>{{ scope.row.timeFrame }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="timeInterval" label="计费区间" align="center" />
            <el-table-column prop="electricityPrice" label="电费单价(元/度)" align="center" />
            <el-table-column prop="servicePrice" label="服务费单价(元/度)" align="center" />
            <el-table-column prop="electric" label="充电度数(度)" align="center" />
            <el-table-column prop="electricityCharge" label="电费(元)" align="center" />
            <el-table-column prop="serviceCharge" label="服务费(元)" align="center" />
          </el-table>
        </el-card>

        <!-- 过程曲线 -->
        <div v-if="canViewCharts" class="charts-block">
          <div class="block-title charts-block-title">过程曲线</div>
          <div v-loading="chartsLoading">
            <order-trend-chart
              title="功率折线图"
              unit="瓦"
              :hint="isCarOrder ? '说明：车端功率为实时电压×车端电流估算，桩端上报可能存在误差，仅供排查参考。' : ''"
              :times="chartTimes"
              :series-list="seriesPower"
            />
            <template v-if="isCarOrder">
              <order-trend-chart
                title="电压折线图"
                unit="伏"
                :times="chartTimes"
                :series-list="seriesVoltage"
              />
              <el-row :gutter="16">
                <el-col :xs="24" :lg="12">
                  <order-trend-chart
                    title="电流折线图"
                    unit="安培"
                    :times="chartTimes"
                    :series-list="seriesCurrent"
                  />
                </el-col>
                <el-col :xs="24" :lg="12">
                  <order-trend-chart
                    title="SOC 折线图"
                    unit="%"
                    :times="chartTimes"
                    :series-list="seriesSoc"
                  />
                </el-col>
              </el-row>
              <order-trend-chart
                title="温度折线图"
                unit="度"
                :times="chartTimes"
                :series-list="seriesTemperature"
              />
            </template>
          </div>
        </div>
      </template>
      <el-empty v-else-if="!detailLoading" description="未找到订单或缺少 orderId 参数" />
    </div>
  </div>
</template>

<script>
import { findOrderInfoById, findDevicePowerDetails } from '@/api/order/scanOrderList.js'
import { getOrderExpenseInfo } from '@/api/orderExpenseInfo/orderExpenseInfo.js'
import { parseTime } from '@/utils/index'
import OrderTrendChart from './OrderTrendChart.vue'

const RULE_BIKE = 1
const RULE_CAR = 2

function axisTime(t) {
  if (t == null || t === '') return ''
  const s = typeof t === 'string' ? t : parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}')
  if (s && s.length >= 19) return s.slice(11, 19)
  return s || ''
}

function toNum(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function pickNum(row, keys) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    if (row[k] != null && row[k] !== '') return toNum(row[k])
  }
  return null
}

export default {
  name: 'OrderDetailPage',
  components: { OrderTrendChart },
  data() {
    return {
      detailLoading: false,
      chartsLoading: false,
      orderInfo: {},
      chargeDetails: [],
      chartTimes: [],
      chartRawList: []
    }
  },
  computed: {
    orderId() {
      const q = this.$route.query || {}
      const id = q.orderId != null && q.orderId !== '' ? q.orderId : q.id
      return id != null && id !== '' ? Number(id) : NaN
    },
    isCarOrder() {
      return this.orderInfo.ruleId === RULE_CAR
    },
    canViewCharts() {
      return this.btnAuthen && this.btnAuthen.permsVerifAuthention(':sys:orderInfo:findDevicePowerDetails')
    },
    seriesPower() {
      return [{
        name: '功率',
        data: this.chartRawList.map(i => toNum(i.power)),
        color: '#70C6E8'
      }]
    },
    seriesVoltage() {
      return [{
        name: '电压',
        data: this.chartRawList.map(i => toNum(i.voltage)),
        color: '#70C6E8'
      }]
    },
    seriesCurrent() {
      return [{
        name: '电流',
        data: this.chartRawList.map(i => toNum(i.electricity)),
        color: '#70C6E8'
      }]
    },
    seriesSoc() {
      return [{
        name: 'SOC',
        data: this.chartRawList.map(i => pickNum(i, ['soc', 'SOC', 'carSoc'])),
        color: '#70C6E8'
      }]
    },
    seriesTemperature() {
      const list = this.chartRawList
      const env = list.map(r => pickNum(r, ['envTemperature', 'envTemp']))
      const port = list.map(r => pickNum(r, ['portTemperature', 'portTemp']))
      return [
        { name: '环境温度', data: env, color: '#94a3b8' },
        { name: '枪线温度', data: port, color: '#52c41a' }
      ]
    }
  },
  watch: {
    '$route.query.orderId'() {
      this.bootstrap()
    },
    '$route.query.id'() {
      this.bootstrap()
    }
  },
  created() {
    this.bootstrap()
  },
  methods: {
    disp(v) {
      if (v == null || v === '') return '—'
      return v
    },
    formatDt(t) {
      if (t == null || t === '') return '—'
      return parseTime(t, '{y}-{m}-{d} {h}:{i}:{s}') || '—'
    },
    ruleLabel(ruleId) {
      if (ruleId === RULE_CAR) return '汽车'
      if (ruleId === RULE_BIKE) return '单车'
      return '—'
    },
    orderTypeText(t) {
      if (t === 0) return '刷卡启动'
      if (t === 1) return '扫码启动'
      if (t === 2) return '免费充电'
      return this.disp(t)
    },
    payStatusText(s) {
      if (s === 0) return '未支付'
      if (s === 1) return '已支付'
      if (s === 2) return '已退款'
      return this.disp(s)
    },
    priceTypeText(p) {
      if (p === 0) return '计时'
      if (p === 1) return '电量'
      if (p === 2) return '功率'
      return this.disp(p)
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/order/scanOrderList')
      }
    },
    bootstrap() {
      if (!Number.isFinite(this.orderId)) {
        this.orderInfo = {}
        this.chargeDetails = []
        this.chartRawList = []
        this.chartTimes = []
        return
      }
      this.loadDetail()
    },
    loadDetail() {
      this.detailLoading = true
      findOrderInfoById({ orderId: this.orderId }).then(res => {
        this.detailLoading = false
        if (res.code === 200 && res.data) {
          this.orderInfo = res.data
          const code = this.orderInfo.orderCode
          if (code) {
            this.loadExpense(code)
            if (this.canViewCharts) {
              this.loadCharts(code)
            }
          }
        } else {
          this.orderInfo = {}
          this.$message.error(res.msg || '加载订单详情失败')
        }
      }).catch(() => {
        this.detailLoading = false
        this.orderInfo = {}
      })
    },
    loadExpense(orderCode) {
      getOrderExpenseInfo(orderCode).then(res => {
        if (res.code === 200) {
          this.chargeDetails = res.data || []
        } else {
          this.chargeDetails = []
        }
      }).catch(() => {
        this.chargeDetails = []
      })
    },
    loadCharts(orderCode) {
      this.chartsLoading = true
      findDevicePowerDetails({ orderCode }).then(res => {
        this.chartsLoading = false
        if (res.code === 200) {
          const list = res.data || []
          this.chartRawList = list
          this.chartTimes = list.map(i => axisTime(i.createTime))
        } else {
          this.chartRawList = []
          this.chartTimes = []
          if (res.msg) this.$message.warning(res.msg)
        }
      }).catch(() => {
        this.chartsLoading = false
        this.chartRawList = []
        this.chartTimes = []
      })
    }
  }
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
.detail-body {
  min-height: 240px;
}
.block-card {
  margin-bottom: 16px;
}
.block-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #303133;
}
.charts-block-title {
  margin-top: 8px;
  margin-bottom: 12px;
}
.kv-grid .kv-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}
.kv-label {
  color: #909399;
  min-width: 96px;
  flex-shrink: 0;
}
.kv-value {
  color: #303133;
  word-break: break-all;
}
.charge-details {
  margin-top: 8px;
}
.charts-block {
  margin-top: 8px;
}
</style>
