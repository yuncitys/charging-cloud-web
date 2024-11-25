<template>
	<div class="app-container">
		<div class="filter-container">
			<el-card>
				<div slot="header" class="clearfix">
					<div class="headerBox">
						<span class="headerSpan1">实时经营统计</span>
						<span class="headerSpan2">数据更新至{{dateYear}}</span>
					</div>
				</div>
				<div class="">
					<div class="cardBox flex">
						<div class="cardItem" v-loading="loading" v-for="(item,index) in statisticsList" :key="index">
							<div class="cardText1">{{item.title}}</div>
							<div class="cardText2">{{item.data}}</div>
						</div>
					</div>
				</div>
			</el-card>
			<!-- <businessDevList></businessDevList> -->
      <div id="page">
        <el-input style="width: 200px; margin-right: 20px ;" placeholder="请输入设备号" v-model="listQuery.deviceCode" class="filter-item" clearable
        	@keyup.enter.native="handleFilter" @clear="handleFilter()" />
        <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.dealerId" filterable clearable @change="handleFilter()"
          placeholder="请选择代理商">
            <el-option
              v-for="item in dealerList"
              :key="item.id"
              :label="item.adminFullname"
              :value="item.id">
            </el-option>
        </el-select>
        <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.chargingStationIds" multiple filterable clearable
          @change="handleFilter()" placeholder="请选择充电站">
            <el-option
              v-for="item in chargingStationList"
              :key="item.id"
              :label="item.networkName"
              :value="item.id">
            </el-option>
        </el-select>
        <el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
        	style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
        	format="yyyy-MM-dd" value-format="yyyy-MM-dd">
        </el-date-picker>
        <el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
          查询
        </el-button>

        <!-- 导出Excel -->
        <downDeviceReportsExcel :queryData="listQuery" />

      	<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" border fit
      		highlight-current-row style="width: 100%;" align="center" id="tableBox">
      		<el-table-column type="index" width="55" label="序号" align="center">
      			<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
      		</el-table-column>
          <el-table-column prop="ruleId" label="产品类型" align="center" :show-overflow-tooltip="isPc">
            <template slot-scope="scope">
            	<span v-if="scope.row.ruleId == 1">单车桩</span>
            	<span v-if="scope.row.ruleId == 2">汽车桩</span>
            </template>
          </el-table-column>
      		<el-table-column prop="deviceCode" label="设备号" align="center" :show-overflow-tooltip="isPc">
      		</el-table-column>
          <el-table-column prop="deviceStatus" label="设备状态" align="center" :show-overflow-tooltip="isPc">
            <template slot-scope="scope">
            	<el-tag type="danger" v-if="scope.row.deviceStatus == 0">离线</el-tag>
            	<el-tag type="success" v-if="scope.row.deviceStatus == 1">在线</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" align="center" :show-overflow-tooltip="isPc">
          </el-table-column>
          <el-table-column prop="deviceTypeName" label="设备类型" align="center" :show-overflow-tooltip="isPc">
          </el-table-column>
          <el-table-column prop="networkName" label="站点名称" align="center" :show-overflow-tooltip="isPc">
          </el-table-column>
          <el-table-column prop="networkAddress" label="站点地址" align="center" :show-overflow-tooltip="isPc">
          </el-table-column>
      		<el-table-column prop="orderCount" label="订单总数" align="center" sortable :show-overflow-tooltip="isPc">
      		</el-table-column>
      		<el-table-column prop="countCashByCard" label="刷卡收入" align="center" sortable :show-overflow-tooltip="isPc">
      		</el-table-column>
      		<el-table-column prop="countCashByScan" label="扫码收入" align="center" sortable :show-overflow-tooltip="isPc">
      		</el-table-column>
      		<el-table-column prop="adminId" label="代理商" align="center" :show-overflow-tooltip="isPc">
      			<template slot-scope="scope">
      				<div v-if="scope.row.adminId">
      					<deviceAdmin :row_data="scope.row"></deviceAdmin>
      				</div>
      			</template>
      		</el-table-column>
      	</el-table>
      	<div class="pagination-container">
      		<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="limit" :total="total"
      			background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      			@current-change="handleCurrentChange" />
      	</div>
      </div>
		</div>
	</div>
</template>

<script>
	import {
    findDealerList,
		getReportsStatistics,
    getDeviceStatistics
	} from '@/api/business/businessStatistics.js'
  import {
    getChargingStationList
  } from '@/api/netWorkDot/netWorkDotList.js'
	import {
		parseTime,
		trim
	} from '@/utils/index'
	import {
		getRouter
	} from '@/api/user'
	import businessDevList from './businessDevList.vue'
	import businessBusList from './businessBusList.vue'
  import deviceAdmin from '../device/components/deviceAdmin.vue'
  import downDeviceReportsExcel from './components/downDeviceReportsExcel.vue'
	export default {
		name: 'businessStatistics1',
		components: {
      deviceAdmin,
			businessDevList,
			businessBusList,
      downDeviceReportsExcel
		},
		data() {
			return {
				activeName: 'first',
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
          dearId: '',
          deviceCode: '',
          allocationStatus: 1,
          chargingStationIds:'',
          createTimeStart: '',
          createTimeEnd: ''
				},
				tableKey: 0,
				isChildUpdate1: true,
				isChildUpdate2: false,
				loading: false,
        listLoading: false,
				dateYear: '',
        time: '',
				statisticsList: [{
						title: '交易金额（元）',
						data: ''
					},
					{
						title: '扫码充值金额（元）',
						data: ''
					},
					{
						title: 'IC卡充值金额（元）',
						data: ''
					},
					{
						title: '套餐充值金额（元）',
						data: ''
					},
					{
						title: '总使用电量（度）',
						data: ''
					},
					{
						title: '总充电次数（笔）',
						data: ''
					},
					{
						title: '总充电时长（分）',
						data: ''
					},
					{
						title: '在线设备总数（台）',
						data: ''
					},
        ],
        dealerList: [],
        chargingStationList: [],
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		methods: {
			//切换导航
			handleClick(tab, event) {
				console.log(tab, event);
				if (tab.name == "first") {
					this.isChildUpdate1 = true;
					this.isChildUpdate2 = false;
				} else if (tab.name == "second") {
					this.isChildUpdate1 = false;
					this.isChildUpdate2 = true;
				}
			},
			permsVerifAuthention(perms, authentionList) {
				perms = trim(perms)
				for (var i = 0; i < authentionList.length; i++) {
					let authPerms = trim(authentionList[i].perms)
					if (perms == authPerms) {
						return true;
					}
				}
				return false;
			},
			// getRouters() {
			// 	getRouter().then(res => {
			// 		let authentionList = res.data.authentionList
			// 		let flag = this.permsVerifAuthention(':business:showMoney', authentionList)
			// 		if (!flag) {
			// 			this.statisticsList = [{
			// 					title: '交易金额',
			// 					data: ''
			// 				},
			// 				{
			// 					title: '总电量',
			// 					data: ''
			// 				},
			// 				{
			// 					title: '订单数量',
			// 					data: ''
			// 				},
			// 				{
			// 					title: '可提现金额',
			// 					data: ''
			// 				},
			// 				{
			// 					title: '在线设备总数',
			// 					data: ''
			// 				},
			// 			]
			// 		}
			// 		this.getLists()
			// 	})
			// },
			getReportsStatistics() {
				this.loading = true
				let listQuery = this.listQuery
				let statisticsList = this.statisticsList
				getReportsStatistics(listQuery).then(res => {
					if (res.code == 200) {
						let reportCount = res.data
						statisticsList.forEach((item, index) => {
							if (item.title == '交易金额（元）') {
								item.data = reportCount.totalMoney || 0
							} else if (item.title == '扫码充值金额（元）') {
								item.data = reportCount.scanQRMoney || 0
							} else if (item.title == 'IC卡充值金额（元）') {
								item.data = reportCount.icCardMoney || 0
							} else if (item.title == '套餐充值金额（元）') {
								item.data = reportCount.preMoney || 0
							} else if (item.title == '总使用电量（度）') {
								item.data = reportCount.totalPower || 0
							} else if (item.title == '总充电次数（笔）') {
								item.data = reportCount.totalOrder || 0
							} else if (item.title == '总充电时长（分）') {
								item.data = reportCount.totalDuration || 0
							} else if (item.title == '在线设备总数（台）') {
								item.data = reportCount.deviceCount || 0
							}
						})
						this.statisticsList = statisticsList
						this.loading = false
					} else {
						this.statisticsList = statisticsList
						this.$message.error(res.msg)
						this.loading = false
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
      findDealerList() {
      	findDealerList().then(res => {
      		if (res.code == 200) {
      			this.dealerList = res.data;
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      dateChange(e) {
      	console.log(e)
      	if (e) {
      		this.listQuery.createTimeStart = e[0]
      		this.listQuery.createTimeEnd = e[1]
      	} else {
      		this.listQuery.createTimeStart = ''
      		this.listQuery.createTimeEnd = ''
      	}
      	this.handleFilter()
      },
      getLists() {
      	this.listLoading = true
      	getDeviceStatistics(this.listQuery).then(res => {
      		if (res.code == 200) {
      			this.list = res.data
      			this.total = res.count
      			this.listLoading = false
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
        this.getReportsStatistics()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			formatTime(time, fmt) {
				if (!time) return '';
				else {
					const date = new Date(time);
					const o = {
						'M+': date.getMonth() + 1,
						'd+': date.getDate(),
						'H+': date.getHours(),
						'm+': date.getMinutes(),
						's+': date.getSeconds(),
						'q+': Math.floor((date.getMonth() + 3) / 3),
						S: date.getMilliseconds(),
					};
					if (/(y+)/.test(fmt))
						fmt = fmt.replace(
							RegExp.$1,
							(date.getFullYear() + '').substr(4 - RegExp.$1.length)
						);
					for (const k in o) {
						if (new RegExp('(' + k + ')').test(fmt)) {
							fmt = fmt.replace(
								RegExp.$1,
								RegExp.$1.length === 1 ?
								o[k] :
								('00' + o[k]).substr(('' + o[k]).length)
							);
						}
					}
					return fmt;
				}
			}
		},
		created() {
			// this.getRouters()
      this.findDealerList()
      this.getChargingStationList()
      this.getReportsStatistics()
      this.getLists()
			this.dateYear = this.formatTime(new Date(), 'yyyy-MM-dd')
		},
	}
</script>

<style scoped="scoped">
  #page {
  	margin-top: 30px;
  	margin-left: 20px;
  }

	.flex {
		display: flex;
	}

	.headerSpan1 {
		font-size: 20px;
		color: #333;
		font-weight: 700;
	}

	.headerSpan2 {
		font-size: 14px;
		color: #aaa;
		display: inline-block;
		margin-left: 30px;
	}

	.cardBox {
		width: 100%;
		justify-content: space-between;
		flex-wrap: wrap;
		background: #fff;
		/* height: 163px; */
	}

	.cardItem {
		width: 22%;
		padding-top: 20px;
		padding-bottom: 20px;
		padding-left: 20px;
		border: 1px solid #eee;
		color: #333;
		margin: 5px 0;
	}

	.cardText1 {
		font-size: 16px;
		font-weight: bold;
	}

	.cardText2 {
		font-size: 32px;
		line-height: 46px;
		padding-bottom: 4px;
	}

	.cardText3 {
		font-size: 12px;
		padding-bottom: 5px;
		color: #666;
	}

	.cardText3 span {
		color: rgb(112, 182, 3);
	}

	.box-card {
		margin-top: 50px;
	}
</style>
