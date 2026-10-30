<template>
  <div class="dashboard-editor-container">
    <panel-group :chart-data="panelData" />

    <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper borRadduis10">
          <raddar-chart :chart-data="raddarData" v-if="raddarData.items.length !== 0" />
          <div v-if="raddarData.items.length === 0" style="height: 300px;text-align: center;line-height: 300px;">暂无数据
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper borRadduis10">
          <pie-chart :chart-data="pieData" v-if="pieData.actualData.length !== 0" />
          <div v-if="pieData.actualData.length === 0" style="height: 300px;text-align: center;line-height: 300px;">暂无数据
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper borRadduis10">
          <bar-chart :chart-data="barData" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import PanelGroup from './components/PanelGroup'
  import LineChart from './components/LineChart'
  import RaddarChart from './components/RaddarChart'
  import PieChart from './components/PieChart'
  import BarChart from './components/BarChart'
  import {
    findHomePanelSummary,
    findHomeDailyTrend,
    findHomePayTypeRatio,
    findHomeMonthTrend,
    findHomeDataByNetWork
  } from '@/api/index/index.js'

  const PAY_TYPE_COLORS = ['#4CD263', '#F4A261', '#E76F51', '#2A9D8F', '#409EFF', '#9B59B6', '#F56C6C', '#909399', '#E6A23C']

  export default {
    name: 'DashboardAdmin1',
    components: {
      PanelGroup,
      LineChart,
      RaddarChart,
      PieChart,
      BarChart
    },
    data() {
      return {
        lineChartData: {
          orderCount: [],
          orderPrice: [],
          electricityPrice: [],
          servicePrice: [],
          DAY: []
        },
        panelData: {
          totalMoney: 0,
          totalOrder: 0,
          totalElectricityMoney: 0,
          totalServicePrice: 0
        },
        raddarData: {
          items: []
        },
        pieData: {
          expectedData: [],
          actualData: []
        },
        barData: {
          orderPrice: [],
          electricityPrice: [],
          servicePrice: [],
          DAY: []
        }
      }
    },
    created() {
      this.loadPanelSummary()
      this.loadDailyTrend()
      this.loadPayTypeRatio()
      this.loadMonthTrend()
      this.loadProvinceRatio()
    },
    methods: {
      loadPanelSummary() {
        findHomePanelSummary().then(res => {
          if (res.code === 200) {
            this.panelData = res.data || {
              totalMoney: 0,
              totalOrder: 0,
              totalElectricityMoney: 0,
              totalServicePrice: 0
            }
          }
        })
      },
      loadDailyTrend() {
        findHomeDailyTrend().then(res => {
          if (res.code !== 200) return
          const list = res.data || []
          const next = {
            orderCount: [],
            orderPrice: [],
            electricityPrice: [],
            servicePrice: [],
            DAY: []
          }
          list.forEach((item) => {
            next.orderCount.push(item.orderCount)
            next.orderPrice.push(item.orderPrice)
            next.electricityPrice.push(item.electricityPrice)
            next.servicePrice.push(item.servicePrice)
            next.DAY.push(item.day)
          })
          this.lineChartData = next
        })
      },
      loadPayTypeRatio() {
        findHomePayTypeRatio().then(res => {
          if (res.code !== 200) return
          const payTypeList = res.data || []
          this.raddarData = {
            items: payTypeList.map((item, index) => ({
              key: item.payType || ('pay-' + index),
              name: item.payTypeName || item.payType || '未知',
              count: Number(item.orderCount) || 0,
              rate: Number(item.rate) || 0,
              color: PAY_TYPE_COLORS[index % PAY_TYPE_COLORS.length]
            }))
          }
        })
      },
      loadMonthTrend() {
        findHomeMonthTrend().then(res => {
          if (res.code !== 200) return
          const list = res.data || []
          const next = {
            orderPrice: [],
            electricityPrice: [],
            servicePrice: [],
            DAY: []
          }
          list.forEach((item) => {
            next.orderPrice.push(item.orderPrice)
            next.electricityPrice.push(item.electricityPrice)
            next.servicePrice.push(item.servicePrice)
            next.DAY.push(item.month)
          })
          this.barData = next
        })
      },
      loadProvinceRatio() {
        findHomeDataByNetWork().then(res => {
          if (res.code !== 200) return
          const pieData = res.data || []
          const newpieData = []
          const actualData = []
          pieData.forEach((item) => {
            const provinceName = item.province || '未知省份'
            newpieData.push({
              value: item.count,
              name: provinceName
            })
            actualData.push(provinceName)
          })
          this.pieData = {
            expectedData: newpieData,
            actualData: actualData
          }
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  .dashboard-editor-container {
    background: #e9eff8;
    position: relative;
    min-height: calc(100vh - 84px);
    padding-bottom: 20px;
    overflow: hidden;

    .github-corner {
      position: absolute;
      top: 0px;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width:1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }

</style>
