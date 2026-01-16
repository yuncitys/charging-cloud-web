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
      <el-input style="width: 200px; margin-right: 20px ;" placeholder="请输入用户编号" v-model="listQuery.userCode" class="filter-item" clearable
      	@keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-input style="width: 200px; margin-right: 20px ;" placeholder="请输入用户手机号" v-model="listQuery.phoneNumber" class="filter-item" clearable
      	@keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <!-- <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
        placeholder="请选择代理商">
          <el-option
            v-for="item in dealerList"
            :key="item.id"
            :label="item.adminFullname"
            :value="item.id">
          </el-option>
      </el-select> -->
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
        查询
      </el-button>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">交易趋势</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
      </div>
      <div class="summary-cards">
        <div class="summary-card summary-card--service-count">
          <div class="summary-label">支付总数(次)</div>
          <div class="summary-value summary-count">{{ formatNumber(summaryTotal.payCount, 0) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--amount">
          <div class="summary-label">支付金额(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.payMoneyCount) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--duration">
          <div class="summary-label">退款总数(次)</div>
          <div class="summary-value summary-duration">{{ formatNumber(summaryTotal.refundCount, 0) }}</div>
          <div class="summary-card-icon" />
        </div>
        <div class="summary-card summary-card--electric">
          <div class="summary-label">退款金额(元)</div>
          <div class="summary-value summary-money">{{ formatMoney(summaryTotal.refundMoneyCount) }}</div>
          <div class="summary-card-icon" />
        </div>
      </div>
      <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <!-- <user-trading-line-chart :chart-data="lineChartData"></user-trading-line-chart> -->
        <user-trading-line-stacked-area-chart :chart-data="lineChartData"></user-trading-line-stacked-area-chart>
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
        <DownChargingUserTradingSingle :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading1" :key="chargingUserTradingSingleList.userCode" :data="chargingUserTradingSingleList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(listQuery.page - 1) * listQuery.limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="用户编号" prop="userCode" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="用户名称" prop="userName" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="用户手机" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="支付总数(次)" prop="payCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="支付金额(元)" prop="payMoneyCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="退款总数(次)" prop="refundCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
        <el-table-column label="退款金额(元)" prop="refundMoneyCount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingUserTradingSingleTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange1" @current-change="handleCurrentChange1" />
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
        <DownChargingUserTradingSection :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading" :key="chargingUserTradingList.userCode" :data="chargingUserTradingList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(listQuery.page - 1) * listQuery.limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="用户编号" prop="userCode" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="用户名称" prop="userName" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="用户手机" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="支付总数(次)" prop="payCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="支付金额(元)" prop="payMoneyCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="退款总数(次)" prop="refundCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
        <el-table-column label="退款金额(元)" prop="refundMoneyCount" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingUserTradingSectionTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
  import UserTradingLineChart from './components/UserTradingLineChart.vue'
  import UserTradingLineStackedAreaChart from './components/UserTradingLineStackedAreaChart.vue'
  import DownChargingUserTradingSingle from './components/DownChargingUserTradingSingle'
  import DownChargingUserTradingSection from './components/DownChargingUserTradingSection'
  import {
    findDealerList,
    chargingUserTradingCurve,
    chargingUserTradingSingle,
    chargingUserTradingSection
  } from '@/api/business/businessStatistics.js'
  const lineChartData = {
    payCount: [],
    payMoneyCount: [],
    refundMoneyCount: [],
    datetime: []
  }
  export default {
    name: 'chargingUserTradingStatistics',
    components: {
      UserTradingLineChart,
      UserTradingLineStackedAreaChart,
      DownChargingUserTradingSingle,
      DownChargingUserTradingSection
    },
    data() {
      return {
        lineChartData: {
          payCount: [],
          payMoneyCount: [],
          refundMoneyCount: [],
          datetime: []
        },
        summaryTotal: {
          payCount: 0,
          payMoneyCount: 0,
          refundCount: 0,
          refundMoneyCount: 0
        },
        chargingUserTradingSectionTotal: 10,
        chargingUserTradingSingleTotal: 10,
        listLoading: false,
        listLoading1: false,
        chargingUserTradingList: [],
        chargingUserTradingSingleList: [],
        listQuery: {
        	timeType: 3,
        	startTime: this.formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),3),
        	endTime: this.formatDate(new Date(),3),
        	adminId: '',
        	userCode: '',
          phoneNumber: '',
        	page: 1,
        	limit: 20,
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
            // return time.getTime() > Date.now() + 7 * 24 * 60 * 60 * 1000 || time.getTime() < Date.now();
          }
        },
        dealerList: [],
        chargingStationList: [],
      }
    },
    methods: {
      /**
       * 根据用户交易汇总列表数据汇总顶部统计卡片展示的数据
       * @param {Array} list 用户交易汇总数据列表
       */
      updateSummaryTotalFromSectionList(list) {
        const total = {
          payCount: 0,
          payMoneyCount: 0,
          refundCount: 0,
          refundMoneyCount: 0
        }
        if (Array.isArray(list) && list.length) {
          list.forEach(item => {
            total.payCount += Number(item.payCount) || 0
            total.payMoneyCount += Number(item.payMoneyCount) || 0
            total.refundCount += Number(item.refundCount) || 0
            total.refundMoneyCount += Number(item.refundMoneyCount) || 0
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
      getChargingUserTradingCurve() {
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserTradingCurve(listQuery).then(res => {
          if (res.code == 200) {
            let chargingUserTradingCurve = res.data;
            let lineChartData = {
              payCount: [],
              payMoneyCount: [],
              refundMoneyCount: [],
              datetime: []
            }
            if (chargingUserTradingCurve.length != 0) {
              chargingUserTradingCurve.forEach((item, index) => {
                lineChartData.payCount.push(item.payCount)
                lineChartData.payMoneyCount.push(item.payMoneyCount)
                lineChartData.refundMoneyCount.push(item.refundMoneyCount)
                lineChartData.datetime.push(item.datetime)
              })
            }
            this.lineChartData = lineChartData

            this.$forceUpdate()
          }
        })
      },
      getChargingUserTradingSectionList() {
        this.listLoading = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserTradingSection(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading = false
            this.chargingUserTradingSectionTotal = res.count
            this.chargingUserTradingList = res.data
            this.updateSummaryTotalFromSectionList(res.data)
            this.$forceUpdate()
          }else {
						this.$message.error(res.msg)
					}
        })
      },
      getChargingUserTradingSingleList() {
        this.listLoading1 = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserTradingSingle(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading1 = false
            this.chargingUserTradingSingleTotal = res.count
            this.chargingUserTradingSingleList = res.data
            this.$forceUpdate()
          }else {
      			this.$message.error(res.msg)
      		}
        })
      },
      handleSetLineChartData(type) {
        this.lineChartData = lineChartData[type]
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
        this.listQuery.limit = 20
      	this.getChargingUserTradingCurve()
        this.getChargingUserTradingSingleList()
        this.getChargingUserTradingSectionList()
      },
      handleSizeChange(val) {
      	this.listQuery.limit = val
      	this.getChargingUserTradingSectionList()
      },
      handleCurrentChange(val) {
      	this.listQuery.page = val
      	this.getChargingUserTradingSectionList()
      },
      handleSizeChange1(val) {
      	this.listQuery.limit = val
      	this.getChargingUserTradingSingleList()
      },
      handleCurrentChange1(val) {
      	this.listQuery.page = val
      	this.getChargingUserTradingSingleList()
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
      // this.getDealerList()
      this.getChargingUserTradingCurve()
      this.getChargingUserTradingSingleList()
      this.getChargingUserTradingSectionList()
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

#userChargingPage {
  	margin-top: 80px;
  	/* margin-left: 10px; */
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
