<template>
  <div class="dashboard-editor-container">
    <panel-group :chart-data="panelData" />

    <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper borRadduis10">
          <raddar-chart :chart-data="raddarData" />
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
  import GithubCorner from '@/components/GithubCorner'
  import PanelGroup from './components/PanelGroup'
  import LineChart from './components/LineChart'
  import RaddarChart from './components/RaddarChart'
  import PieChart from './components/PieChart'
  import BarChart from './components/BarChart'
  import TransactionTable from './components/TransactionTable'
  import TodoList from './components/TodoList'
  import BoxCard from './components/BoxCard'
  import {
    findHomeData,
    findHomeDataByNetWork
  } from '@/api/index/index.js'
  const lineChartData = {
    orderCount: [],
    orderPrice: [],
    electricityPrice: [],
    servicePrice: [],
    DAY: []
  }
  const raddarData = {
    items: []
  }
  const pieData = {
    expectedData: [],
    actualData: []
  }
  const barData = {
    deviceCount: [],
    orderPrice: [],
    electricityPrice: [],
    servicePrice: [],
    DAY: []
  }
  export default {
    name: 'DashboardAdmin1',
    components: {
      GithubCorner,
      PanelGroup,
      LineChart,
      RaddarChart,
      PieChart,
      BarChart,
      TransactionTable,
      TodoList,
      BoxCard
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
          totalDevice: 0,
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
          deviceCount: [],
          orderPrice: [],
          electricityPrice: [],
          servicePrice: [],
          DAY: []
        },
        totalDevice: '',
        totalUser: '',
        totalMoney: '',
        totalOrder: ''
      }
    },
    created() {
      this.onfindHomeData()
      this.onfindHomeDataByNetWork()
    },
    methods: {
      onfindHomeDataByNetWork() {
        findHomeDataByNetWork().then(res => {
          if (res.code === 200) {
            let pieData = res.data || []
            let newpieData = []
            let actualData = []
            if (pieData.length != 0) {
              pieData.forEach((item, index) => {
                let obj = {
                  value: 320,
                  name: ''
                }
                obj.value = item.count
                obj.name = item.province
                actualData.push(item.province)
                newpieData.push(obj)
              })
            }
            this.pieData.expectedData = newpieData
            this.pieData.actualData = actualData
          }
        })
      },
      onfindHomeData() {
        findHomeData().then(res => {
          if (res.code == 200) {
            //统计
            this.panelData = res.data.homeData

            //订单类型
            const orderType = res.data.orderType || {}
            raddarData.items = [
              {
                key: 'smOrder',
                name: '扫码订单',
                count: Number(orderType.smOrderCount) || 0,
                rate: Number(orderType.smOrderRate) || 0,
                color: '#4CD263'
              },
              {
                key: 'skOrder',
                name: '刷卡订单',
                count: Number(orderType.skOrderCount) || 0,
                rate: Number(orderType.skOrderRate) || 0,
                color: '#F4A261'
              },
              {
                key: 'freeOrder',
                name: '免费订单',
                count: Number(orderType.freeOrderCount) || 0,
                rate: Number(orderType.freeOrderRate) || 0,
                color: '#E76F51'
              },
              {
                key: 'monthOrder',
                name: '包月订单',
                count: Number(orderType.monthOrderCount) || 0,
                rate: Number(orderType.monthOrderRate) || 0,
                color: '#2A9D8F'
              }
            ]
            this.raddarData = raddarData

            //曲线
            let orderUser = res.data.orderUser || []
            let lineChartData = {
              orderCount: [],
              orderPrice: [],
              electricityPrice: [],
              servicePrice: [],
              DAY: []
            }
            if (orderUser.length != 0) {
              orderUser.forEach((item, index) => {
                lineChartData.orderCount.push(item.orderCount)
                lineChartData.orderPrice.push(item.orderPrice)
                lineChartData.electricityPrice.push(item.electricityPrice)
                lineChartData.servicePrice.push(item.servicePrice)
                lineChartData.DAY.push(item.DAY)
              })
            }
            this.lineChartData = lineChartData

            //柱状图
            let yearMonthCount = res.data.yearMonthCount || []
            let barData = {
              deviceCount: [],
              orderPrice: [],
              electricityPrice: [],
              servicePrice: [],
              DAY: []
            }
            if (yearMonthCount.length != 0) {
              yearMonthCount.forEach((item, index) => {
                barData.deviceCount.push(item.deviceCount)
                barData.orderPrice.push(item.orderPrice)
                barData.electricityPrice.push(item.electricityPrice)
                barData.servicePrice.push(item.servicePrice)
                let day = item.DAY + '月'
                barData.DAY.push(day)
              })
            }
            this.barData = barData


            this.$forceUpdate()
          }
        })
      },
      handleSetLineChartData(type) {
        this.lineChartData = lineChartData[type]
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
