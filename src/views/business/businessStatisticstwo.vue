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
      <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
      	icon="el-icon-search">
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
      <el-row class="borRadduis10" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData" />
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
        <el-button type="primary" icon="el-icon-download" class="export-button">导出</el-button>
      </div>

      <el-table v-loading="listLoading" :key="chargingTrendList.datetime" :data="chargingTrendList" element-loading-text="拼命加载中......"
        fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
      	<el-table-column type="index" width="55" label="序号" align="center">
      		<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      	</el-table-column>
        <el-table-column label="日期" prop="datetime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
      	<el-table-column label="订单总数(笔)" prop="totalChargeNumber" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="充电时长(分)" prop="totalChargeDurations" sortable align="center" :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="扫码收入(元)" prop="scan" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="刷卡收入(元)" prop="swipe" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="实际收益(元)" prop="actualPrice" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      	<el-table-column label="使用电量(度)" prop="totalPower" align="center" sortable :show-overflow-tooltip="isPc">
      	</el-table-column>
      </el-table>
      <div class="pagination-container">
      	<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
      		:total="total" background layout="total, sizes, prev, pager, next, jumper"
      		@size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
  import LineChart from './components/LineChart'
  import {
    findDealerList,
    chargingTrend,
    chargingTrendList,
    chargingStationSection,
    chargingStationSingle
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
    name: 'chargingTrendStatistics',
    components: {
      LineChart,
    },
    data() {
      return {
        lineChartData: {
          userCount: [],
          orderCount: [],
          orderPrice: [],
          datetime: []
        },
        page: 1,
        limit: 10,
        total: 10,
        tableKey: 0,
        listLoading: false,
        chargingTrendList: [],
        listQuery: {
        	timeType: 3,
        	startTime: this.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),3),
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
      getChargingStationList() {
      	getChargingStationList().then(res => {
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
      getChargingTrendList() {
        this.listLoading = true
        let listQuery = JSON.parse(JSON.stringify(this.listQuery))
        chargingTrendList(listQuery).then(res => {
          if (res.code == 200) {
            this.listLoading = false
            this.total = res.count
            this.chargingTrendList = res.data
            // console.log("chargingTrendList：",this.chargingTrendList)
            // this.$forceUpdate()
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
        this.listQuery.limit = 10
      	this.getChargingTrend()
        this.getChargingTrendList()
      },
      handleSizeChange(val) {
      	this.listQuery.limit = val
      	this.getChargingTrendList()
      },
      handleCurrentChange(val) {
      	this.listQuery.page = val
      	this.getChargingTrendList()
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
      this.getChargingTrendList()
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
</style>
