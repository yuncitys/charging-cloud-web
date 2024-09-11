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
    userCount: [],
    orderCount: [],
    orderPrice: [],
    DAY: []
  }
  const raddarData = {
    expectedData: '',
    actualData: ''
  }
  const pieData = {
    expectedData: [],
    actualData: []
  }
  const barData = {
    deviceCount: [],
    orderPrice: [],
    userCount: [],
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
          userCount: [],
          orderCount: [],
          orderPrice: [],
          DAY: []
        },
        panelData: {
          totalUser: 0,
          totalDevice: 0,
          totalMoney: 0,
          totalOrder: 0
        },
        raddarData: {
          expectedData: '',
          actualData: ''
        },
        pieData: {
          expectedData: [],
          actualData: []
        },
        barData: {
          deviceCount: [],
          orderPrice: [],
          userCount: [],
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
            raddarData.expectedData = res.data.orderType.skOrder
            raddarData.actualData = res.data.orderType.smOrder
            raddarData.freeOrderData = res.data.orderType.freeOrder
            raddarData.monthOrderData = res.data.orderType.monthOrder
            this.raddarData = raddarData

            //曲线
            let orderUser = res.data.orderUser || []
            let lineChartData = {
              userCount: [],
              orderCount: [],
              orderPrice: [],
              DAY: []
            }
            if (orderUser.length != 0) {
              orderUser.forEach((item, index) => {
                lineChartData.userCount.push(item.userCount)
                lineChartData.orderCount.push(item.orderCount)
                lineChartData.orderPrice.push(item.orderPrice)
                lineChartData.DAY.push(item.DAY)
              })
            }
            this.lineChartData = lineChartData

            //柱状图
            let yearMonthCount = res.data.yearMonthCount || []
            let barData = {
              deviceCount: [],
              orderPrice: [],
              userCount: [],
              DAY: []
            }
            if (yearMonthCount.length != 0) {
              yearMonthCount.forEach((item, index) => {
                barData.deviceCount.push(item.deviceCount)
                barData.orderPrice.push(item.orderPrice)
                barData.userCount.push(item.userCount)
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
