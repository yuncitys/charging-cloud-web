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
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
        placeholder="请选择代理商">
          <el-option
            v-for="item in dealerList"
            :key="item.id"
            :label="item.adminFullname"
            :value="item.id">
          </el-option>
      </el-select>
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
      <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <user-charging-line-stacked-area-chart :chart-data="lineChartData"></user-charging-line-stacked-area-chart>
      </el-row>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">充电明细</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
        <!-- 靠右的导出按钮 -->
        <!-- <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button> -->
        <DownChargingUserChargeSingle :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading1" :key="chargingUserChargingSingleList.userCode" :data="chargingUserChargingSingleList" element-loading-text="拼命加载中......"
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
      	<el-table-column label="服务次数(次)" prop="chargingCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="消费金额(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(次)" prop="chargingPowerCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
        <el-table-column label="充电时长(分)" prop="actualDuration" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="电费(元)" prop="electricityPrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="服务费(元)" prop="servicePrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="占桩费(元)" prop="placeholderPrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingUserChargingSingleTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange1" @current-change="handleCurrentChange1" />
      </div>

      <div class="report-header">
        <div class="title-section">
          <!-- 标题 -->
          <span class="title">充电汇总</span>
          <!-- 带有统计说明的图标提示 -->
          <el-tooltip content="报告统计口径说明" placement="top" effect="dark">
            <el-icon><i class="el-icon-question"></i></el-icon>
          </el-tooltip>
        </div>
        <!-- 靠右的导出按钮 -->
        <!-- <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button> -->
        <DownChargingUserChargeSection :queryData="listQuery" />
      </div>
      <el-table v-loading="listLoading2" :key="chargingUserChargingSectionList.userCode" :data="chargingUserChargingSectionList" element-loading-text="拼命加载中......"
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
      	<el-table-column label="服务次数(次)" prop="chargingCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="消费金额(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(次)" prop="chargingPowerCount" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
        <el-table-column label="充电时长(分)" prop="actualDuration" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="电费(元)" prop="electricityPrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="服务费(元)" prop="servicePrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="占桩费(元)" prop="placeholderPrice" align="center" sortable :show-overflow-tooltip="isPc">
        </el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30,50]" :page-size="listQuery.limit"
      		:total="chargingUserChargingSectionTotal" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange2" @current-change="handleCurrentChange2" />
      </div>
    </div>
  </div>
</template>

<script>
  import UserChargingLineStackedAreaChart from './components/UserChargingLineStackedAreaChart.vue'
  import DownChargingUserChargeSingle from './components/DownChargingUserChargeSingle'
  import DownChargingUserChargeSection from './components/DownChargingUserChargeSection'
  import {
    findDealerList,
    chargingUserChargeCurve,
    chargingUserChargeSingle,
    chargingUserChargeSection
  } from '@/api/business/businessStatistics.js'
  const lineChartData = {
    chargingOrderCount: [],
    chargingActualPrice: [],
    chargingUserCount: [],
    datetime: []
  }
  export default {
    name: 'chargingUserTradingStatistics',
    components: {
      UserChargingLineStackedAreaChart,
      DownChargingUserChargeSingle,
      DownChargingUserChargeSection
    },
    data() {
      return {
        lineChartData: {
          chargingOrderCount: [],
          chargingActualPrice: [],
          chargingUserCount: [],
          datetime: []
        },
        chargingUserChargingSectionTotal: 10,
        chargingUserChargingSingleTotal: 10,
        listLoading1: false,
        listLoading2: false,
        chargingUserChargingSingleList: [],
        chargingUserChargingSectionList: [],
        listQuery: {
        	timeType: 3,
        	startTime: this.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),3),
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
          this.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),3), // 一周前的日期
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
      handleDimensionChange(value) {
        console.log("value：",value)
        if (value === 3) {
          // 日维度，设置为日期范围选择
          this.datePickerType = 'daterange';
          this.dateFormat = 'yyyy-MM-dd';
          this.dateValueFormat = 'yyyy-MM-dd';
          this.defaultDateRange = [
            this.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),value), // 一周前的日期
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
      getChargingUserChargeCurve() {
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserChargeCurve(listQuery).then(res => {
          if (res.code == 200) {
            let chargingUserChargeCurve = res.data;
            let lineChartData = {
              chargingOrderCount: [],
              chargingActualPrice: [],
              chargingUserCount: [],
              datetime: []
            }
            if (chargingUserChargeCurve.length != 0) {
              chargingUserChargeCurve.forEach((item, index) => {
                lineChartData.chargingOrderCount.push(item.chargingOrderCount)
                lineChartData.chargingActualPrice.push(item.chargingActualPrice)
                lineChartData.chargingUserCount.push(item.chargingUserCount)
                lineChartData.datetime.push(item.datetime)
              })
            }
            this.lineChartData = lineChartData

            this.$forceUpdate()
          }
        })
      },
      getChargingUserChargeSingle() {
        this.listLoading1 = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserChargeSingle(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading1 = false
            this.chargingUserChargingSingleTotal = res.count
            this.chargingUserChargingSingleList = res.data
            this.$forceUpdate()
          }else {
      			this.$message.error(res.msg)
      		}
        })
      },
      getChargingUserChargeSection() {
        this.listLoading2 = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingUserChargeSection(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading2 = false
            this.chargingUserChargingSectionTotal = res.count
            this.chargingUserChargingSectionList = res.data
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
        this.getChargingUserChargeCurve()
        this.getChargingUserChargeSingle()
        this.getChargingUserChargeSection()
      },
      handleSizeChange1(val) {
      	this.listQuery.limit = val
      	this.getChargingUserChargeSingle()
      },
      handleCurrentChange1(val) {
      	this.listQuery.page = val
      	this.getChargingUserChargeSingle()
      },
      handleSizeChange2(val) {
      	this.listQuery.limit = val
      	this.getChargingUserChargeSection()
      },
      handleCurrentChange2(val) {
      	this.listQuery.page = val
      	this.getChargingUserChargeSection()
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
      this.getChargingUserChargeCurve()
      this.getChargingUserChargeSingle()
      this.getChargingUserChargeSection()
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
</style>
