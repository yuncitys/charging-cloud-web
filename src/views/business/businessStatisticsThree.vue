<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.timeType" style="width: 150px;margin-right: 20px ;" class="filter-item"
      	placeholder="时间维度" @change="handleDimensionChange">
      	<el-option v-for="item in timeType" :key="item.id" :label="item.title" :value="item.id"/>
      </el-select>
      <el-date-picker
        class="filter-item"
        style="margin-right: 20px ;"
        v-model="defaultDateRange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="dateChange"
        :type="datePickerType"
        :format="dateFormat"
        :value-format="dateValueFormat"
        :default-value="defaultDateRange"
        :picker-options="pickerOptions"
        :clearable="false">
      </el-date-picker>
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
        placeholder="请选择代理商">
          <el-option
            v-for="item in dealerList"
            :key="item.id"
            :label="item.adminFullname"
            :value="item.id">
          </el-option>
      </el-select>
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.chargingStationIds" multiple filterable clearable
        placeholder="请选择充电站">
          <el-option
            v-for="item in chargingStationList"
            :key="item.id"
            :label="item.networkName"
            :value="item.id">
          </el-option>
      </el-select>
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
        查询
      </el-button>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">充电趋势</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="summary-cards">
        <div class="summary-card summary-card--service-count">
          <div class="summary-label">订单总数(笔)</div>
          <div class="summary-value summary-count">{{ formatNumber(summaryTotal.totalChargeNumber, 0) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--duration">
          <div class="summary-label">总充电时长(分)</div>
          <div class="summary-value summary-duration">{{ formatNumber(summaryTotal.totalChargeDurations, 0) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--amount">
          <div class="summary-label">扫码收入(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.scanActualPrice) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--electric">
          <div class="summary-label">刷卡收入(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.swipeActualPrice) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--servicefee">
          <div class="summary-label">实际收益(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.actualPrice) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--power">
          <div class="summary-label">总使用电量(度)</div>
          <div class="summary-value summary-energy">{{ formatNumber(summaryTotal.totalPower, 2) }}</div>
          <div class="summary-card-icon" />
        </div>
      </div>
      <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <charging-trend-line-chart :chart-data="lineChartData"></charging-trend-line-chart>
      </el-row>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">明细列表</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
        <!-- 靠右的导出按钮 -->
        <!-- <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button> -->
        <DownChargingStationSingleStatistics :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading" :key="chargingStationSectionList.networkName" :data="chargingStationSingleList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="归属运营商" prop="operatorName" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="总设备数(台)" prop="totalDevice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="充电次数(笔)" prop="totalChargeNumber" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="充电时长(分)" prop="totalChargeDurations" sortable align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="扫码收入(元)" prop="scanActualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="刷卡收入(元)" prop="swipeActualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="实际收益(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingStationSingleTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">金额明细</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
        <!-- 靠右的导出按钮 -->
        <!-- <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button> -->
        <DownChargingStationFundStatistics :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading2" :key="chargingStationSectionList.networkName" :data="chargingStationFundList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox2">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="归属运营商" prop="operatorName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="运营设备总数(台)" prop="deviceCount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="在线设备总数(台)" prop="onlineDeviceCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="离线设备总数(台)" prop="offlineDeviceCount" sortable align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="充电口总数(个)" prop="portCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="总充电收益(元)" prop="totalIncome" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="余额支付(元)" prop="balancePaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
        <el-table-column label="微信支付(元)" prop="wechatPaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="微信支付分(元)" prop="wechatScorePaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="刷卡支付(元)" prop="swipeCardPaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="投币支付(元)" prop="insertCoinsPaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="支付宝支付(元)" prop="alipayPaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="月卡支付(元)" prop="monthCardPaymentAmount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingStationFundTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange2" @current-change="handleCurrentChange2" />
      </div>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">汇总列表</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
        <!-- 靠右的导出按钮 -->
        <!-- <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button> -->
        <DownChargingStationStatistics :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading1" :key="chargingStationSectionList.networkName" :data="chargingStationSectionList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox1">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="充电站名称" prop="networkName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="归属运营商" prop="operatorName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="总设备数(台)" prop="totalDevice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="充电次数(笔)" prop="totalChargeNumber" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="充电时长(分)" prop="totalChargeDurations" sortable align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="扫码收入(元)" prop="scanActualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="刷卡收入(元)" prop="swipeActualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="实际收益(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingStationSectionTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange1" @current-change="handleCurrentChange1" />
      </div>
    </div>
  </div>
</template>

<script>
  import ChargingTrendLineChart from './components/ChargingTrendLineChart'
  import DownChargingStationStatistics from './components/DownChargingStationStatistics'
  import DownChargingStationFundStatistics from './components/DownChargingStationFundStatistics'
  import DownChargingStationSingleStatistics from './components/DownChargingStationSingleStatistics'
  import {
    findDealerList,
    chargingTrend,
    chargingTrendList,
    chargingStationSection,
    chargingStationSingle,
    chargingStationFund
  } from '@/api/business/businessStatistics.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'

  const lineChartData = {
    totalPower: [],
    orderCount: [],
    orderPrice: [],
    datetime: []
  }
  export default {
    name: 'chargingStationStatistics',
    components: {
      ChargingTrendLineChart,
      DownChargingStationStatistics,
      DownChargingStationFundStatistics,
      DownChargingStationSingleStatistics
    },
    data() {
      return {
        lineChartData: {
          userCount: [],
          orderCount: [],
          orderPrice: [],
          datetime: []
        },
        summaryTotal: {
          totalChargeNumber: 0,
          totalChargeDurations: 0,
          scanActualPrice: 0,
          swipeActualPrice: 0,
          actualPrice: 0,
          totalPower: 0
        },
        page: 1,
        limit: 10,
        chargingStationSectionTotal: 10,
        chargingStationSingleTotal: 10,
        chargingStationFundTotal: 10,
        tableKey: 0,
        tableKey1: 0,
        tableKey2: 0,
        listLoading: false,
        listLoading1: false,
        listLoading2: false,
        chargingStationSingleList: [],
        chargingStationSectionList: [],
        chargingStationFundList: [],
        listQuery: {
        	timeType: 3,
        	startTime: this.formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),3),
        	endTime: this.formatDate(new Date(),3),
        	adminId: '',
        	chargingStationIds: '',
        	page: 1,
        	limit: 10,
        },
        timeType: [
          {
            title: '日',
            id: 3,
          },
          {
            title: '月',
            id: 2,
          },
        ],
        datePickerType: 'daterange',  // 日期选择器的类型
        dateFormat: 'yyyy-MM-dd',  // 默认日期格式
        dateValueFormat: 'yyyy-MM-dd', // 默认传递的值的格式
        defaultDateRange: [
          this.formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),3), // 一周前的日期
          this.formatDate(new Date(),3)  // 今天的日期
        ],
        pickerOptions: {
          disabledDate(time) {
            return false;
            // return time.getTime() > Date.now() + 6 * 24 * 60 * 60 * 1000 || time.getTime() < Date.now();
          }
        },
        dealerList: [],
        chargingStationList: [],
      }
    },
    methods: {
      /**
       * 根据充电站汇总列表数据汇总顶部统计卡片展示的数据
       * @param {Array} list 充电站汇总数据列表
       */
      updateSummaryTotalFromSectionList(list) {
        const total = {
          totalChargeNumber: 0,
          totalChargeDurations: 0,
          scanActualPrice: 0,
          swipeActualPrice: 0,
          actualPrice: 0,
          totalPower: 0
        }
        if (Array.isArray(list) && list.length) {
          list.forEach(item => {
            total.totalChargeNumber += Number(item.totalChargeNumber) || 0
            total.totalChargeDurations += Number(item.totalChargeDurations) || 0
            total.scanActualPrice += Number(item.scanActualPrice) || 0
            total.swipeActualPrice += Number(item.swipeActualPrice) || 0
            total.actualPrice += Number(item.actualPrice) || 0
            total.totalPower += Number(item.totalPower) || 0
          })
        }
        this.summaryTotal = total
      },
      /**
       * 金额格式化，保留两位小数并添加千分位分隔
       * @param {number|string} value 原始数值
       * @returns {string}
       */
      formatMoney(value) {
        return this.formatNumber(value, 2)
      },
      /**
       * 通用数字格式化，可控制小数位并添加千分位分隔
       * @param {number|string} value 原始数值
       * @param {number} fractionDigits 小数位，默认 0
       * @returns {string}
       */
      formatNumber(value, fractionDigits = 0) {
        if (value === null || value === undefined || value === '') return '-'
        const num = Number(value)
        if (Number.isNaN(num)) return value
        const fixed = fractionDigits >= 0 ? num.toFixed(fractionDigits) : String(num)
        const parts = fixed.split('.')
        const intWithComma = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts[1] ? `${intWithComma}.${parts[1]}` : intWithComma
      },
      handleDimensionChange(value) {
        console.log("value：",value)
        if (value === 3) {
          // 日维度，设置为日期范围选择
          this.datePickerType = 'daterange';
          this.dateFormat = 'yyyy-MM-dd';
          this.dateValueFormat = 'yyyy-MM-dd';
          this.defaultDateRange = [
            this.formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),value), // 一周前的日期
            this.formatDate(new Date(),value)  // 今天的日期
          ]
          console.log("defaultDateRange",this.defaultDateRange)
        } else if (value === 2) {
          // 月维度，设置为月份范围选择
          this.datePickerType = 'monthrange';
          this.dateFormat = 'yyyy-MM';
          this.dateValueFormat = 'yyyy-MM';
          //当前时间
          let currentDate = new Date();
          // 设置三个月前的日期
          let threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
          // 格式化日期输出
          this.defaultDateRange = [
            this.formatDate(threeMonthsAgo, value),  // 三个月前的日期
            this.formatDate(new Date(), value)      // 今天的日期
          ]
          console.log("defaultDateRange",this.defaultDateRange)
        }
        this.listQuery.startTime = this.defaultDateRange[0]
        this.listQuery.endTime = this.defaultDateRange[1]
      },
      getDealerList() {
      	findDealerList().then(res => {
      		if (res.code == 200) {
      			this.dealerList = res.data;
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      getChargingStationList() {
      	getChargingStationList(0).then(res => {
      		if (res.code == 200) {
      			this.chargingStationList = res.data;
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      getChargingTrend() {
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingTrend(listQuery).then(res => {
          if (res.code == 200) {
            //曲线
            let chargingTrendStatistics = res.data;
            console.log("chargingTrendStatistics：",chargingTrendStatistics)
            let lineChartData = {
              totalPower: [],
              orderCount: [],
              orderPrice: [],
              datetime: []
            }
            if (chargingTrendStatistics.length != 0) {
              chargingTrendStatistics.forEach((item, index) => {
                lineChartData.totalPower.push(item.totalPower)
                lineChartData.orderCount.push(item.totalChargeNumber)
                lineChartData.orderPrice.push(item.actualPrice)
                lineChartData.datetime.push(item.datetime)
              })
            }
            this.lineChartData = lineChartData

            this.$forceUpdate()
          }
        })
      },
      getChargingStationSingleList() {
        this.listLoading = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingStationSingle(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading = false
            this.chargingStationSingleTotal = res.count
            this.chargingStationSingleList = res.data
            // console.log("chargingStationSingleList：",res.data)
            // this.$forceUpdate()
          }else {
						this.$message.error(res.msg)
					}
        })
      },
      getChargingStationSectionList() {
        this.listLoading1 = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingStationSection(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading1 = false
            this.chargingStationSectionTotal = res.count
            this.chargingStationSectionList = res.data
            this.updateSummaryTotalFromSectionList(res.data)
            // console.log("chargingStationSectionList：",res.data)
            // this.$forceUpdate()
          }else {
      			this.$message.error(res.msg)
      		}
        })
      },
      getChargingStationFundList() {
        this.listLoading2 = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingStationFund(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading2 = false
            this.chargingStationFundTotal = res.count
            this.chargingStationFundList = res.data
            // console.log("chargingStationFundList：",res.data)
            // this.$forceUpdate()
          }else {
      			this.$message.error(res.msg)
      		}
        })
      },
      dateChange(e) {
      	if (e) {
      		this.listQuery.startTime = e[0]
      		this.listQuery.endTime = e[1]
      	} else {
      		this.listQuery.startTime = ''
      		this.listQuery.endTime = ''
      	}
      	this.handleFilter()
      },
      handleFilter() {
      	this.listQuery.page = 1
        this.listQuery.limit = 10
      	this.getChargingTrend()
        this.getChargingStationSingleList()
        this.getChargingStationFundList()
        this.getChargingStationSectionList()
      },
      handleSizeChange(val) {
      	this.listQuery.limit = val
      	this.getChargingStationSingleList()()
      },
      handleCurrentChange(val) {
      	this.listQuery.page = val
      	this.getChargingStationSingleList()
      },
      handleSizeChange1(val) {
      	this.listQuery.limit = val
      	this.getChargingStationSectionList()
      },
      handleCurrentChange1(val) {
      	this.listQuery.page = val
      	this.getChargingStationSectionList()
      },
      handleSizeChange2(val) {
      	this.listQuery.limit = val
      	this.getChargingStationFundList()
      },
      handleCurrentChange2(val) {
      	this.listQuery.page = val
      	this.getChargingStationFundList()
      },
      // 将日期格式化为 'yyyy-MM-dd' 的方法
      formatDate(date,timeType) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份补齐两位
        const day = date.getDate().toString().padStart(2, '0'); // 日期补齐两位
        if (timeType === 3) {
          return `${year}-${month}-${day}`;
        } else{
          return `${year}-${month}`;
        }
      }
    },
    created() {
      this.getDealerList()
      this.getChargingStationList()
      this.getChargingTrend()
      this.getChargingStationSingleList()
      this.getChargingStationFundList()
      this.getChargingStationSectionList()
    },
  }


</script>

<style>
/* 父容器，用于布局 */
.report-header {
  display: flex;
  justify-content: space-between; /* 标题部分和按钮部分两端对齐 */
  align-items: center;
  padding: 10px;
}

/* 标题和提示图标 */
.title-section {
  display: flex;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
}

.export-button {
  background-color: #409EFF;
  color: white;
}

/* 顶部统计卡片统一样式 */
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 24px;
  margin: 12px 0 24px;
}

.summary-card {
  position: relative;
  flex: 0 0 260px;
  height: 94px;
  border-radius: 15px;
  padding: 14px 18px;
  box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  color: #ffffff;
  overflow: hidden;
}

.summary-card-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 80px;
  height: 80px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.summary-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
}

.summary-card--service-count {
  background: linear-gradient(135deg, #2ecc71, #1abc9c);
}

.summary-card--amount {
  background: linear-gradient(135deg, #409EFF, #2d8cf0);
}

.summary-card--power {
  background: linear-gradient(135deg, #00c9ff, #92fe9d);
}

.summary-card--duration {
  background: linear-gradient(135deg, #a855f7, #6366f1);
}

.summary-card--electric {
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.summary-card--servicefee {
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
}

.summary-card--placeholder {
  background: linear-gradient(135deg, #f97373, #fb7185);
}

.summary-card--service-count .summary-card-icon {
  background-image: url(../../assets/home-panel/user-panel.png);
}

.summary-card--amount .summary-card-icon {
  background-image: url(../../assets/home-panel/trade-panel.png);
}

.summary-card--power .summary-card-icon {
  background-image: url(../../assets/home-panel/device-panel.png);
}

.summary-card--duration .summary-card-icon {
  background-image: url(../../assets/home-panel/order-panel.png);
}

.summary-card--electric .summary-card-icon {
  background-image: url(../../assets/home-panel/trade-panel.png);
}

.summary-card--servicefee .summary-card-icon {
  background-image: url(../../assets/home-panel/order-panel.png);
}

.summary-card--placeholder .summary-card-icon {
  background-image: url(../../assets/home-panel/device-panel.png);
}
</style>
