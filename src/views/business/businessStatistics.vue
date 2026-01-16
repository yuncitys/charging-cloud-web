<template>
	<div class="app-container" id="businessStatisticsPage">
		<div class="filter-container">
			<div class="statistics-search-bar">
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
					format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']">
				</el-date-picker>
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
					查询
				</el-button>
				<downDeviceReportsExcel :queryData="listQuery" />
			</div>
			<div class="report-header">
				<div class="title-section">
					<span class="title">实时经营统计</span>
					<span class="headerSpan2">数据更新至{{dateYear}}</span>
				</div>
			</div>
			<div class="">
				<div class="cardBox flex">
					<div
					  class="cardItem"
					  v-loading="loading"
					  v-for="(item,index) in statisticsList"
					  :key="index"
					  :class="getCardClass(item, index)"
					>
						<div class="cardText-content">
							<div class="cardText1">{{ item.title }}</div>
							<div class="cardText2">{{ formatStatistic(item) }}</div>
						</div>
						<div class="cardIcon" />
					</div>
				</div>
			</div>
			<!-- <businessDevList></businessDevList> -->
			<div id="page">
				<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
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
					<el-table-column prop="orderCount" label="订单总数" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-count" label-class-name="col-header-count">
					</el-table-column>
					<el-table-column prop="totalDuration" label="充电时长" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-duration" label-class-name="col-header-duration">
					</el-table-column>
					<el-table-column prop="totalPower" label="使用电量" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-energy" label-class-name="col-header-energy">
					</el-table-column>
					<el-table-column prop="totalElectricityPrice" label="电费" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-money" label-class-name="col-header-money">
					</el-table-column>
					<el-table-column prop="totalServicePrice" label="服务费" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-money" label-class-name="col-header-money">
					</el-table-column>
					<el-table-column prop="countCashByCard" label="刷卡收入" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-money" label-class-name="col-header-money">
					</el-table-column>
					<el-table-column prop="countCashByScan" label="扫码收入" align="center" sortable :show-overflow-tooltip="isPc" class-name="col-money" label-class-name="col-header-money">
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
					dealerId: '',
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
				statisticsList: [
					{
						title: '交易总金额（元）',
						data: ''
					},
					{
						title: '扫码充值金额（元）',
						data: ''
					},
					{
						title: '套餐充值金额（元）',
						data: ''
					},
					{
						title: '月卡充值金额（元）',
						data: ''
					},
					{
						title: '充电总费用（元）',
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
						title: '总充电电费（元）',
						data: ''
					},
					{
						title: '运营设备数（台）',
						data: ''
					},
					{
						title: '可提现金额（元）',
						data: ''
					},
          			{
						title: '总充电服务费（元）',
						data: ''
					},
				],
				currentUser: {"totalAmount":0,"balanceAmount":0},
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
			/**
			 * 根据统计项标题返回卡片样式类，用于控制渐变背景和图标
			 * @param {Object} item 统计项对象
			 * @param {number} index 下标
			 * @returns {string}
			 */
			getCardClass(item, index) {
				const title = item && item.title ? item.title : ''
				if (title.indexOf('交易总金额') !== -1) return 'cardItem--total-money'
				if (title.indexOf('扫码充值金额') !== -1) return 'cardItem--scan-money'
				if (title.indexOf('套餐充值金额') !== -1) return 'cardItem--package-money'
				if (title.indexOf('月卡充值金额') !== -1) return 'cardItem--month-money'
				if (title.indexOf('充电总费用') !== -1) return 'cardItem--charge-fee'
				if (title.indexOf('总使用电量') !== -1) return 'cardItem--power'
				if (title.indexOf('总充电次数') !== -1) return 'cardItem--order-count'
				if (title.indexOf('总充电时长') !== -1) return 'cardItem--duration'
				if (title.indexOf('总充电电费') !== -1) return 'cardItem--electricity'
				if (title.indexOf('总充电服务费') !== -1) return 'cardItem--service-fee'
				if (title.indexOf('运营设备数') !== -1) return 'cardItem--device-count'
				if (title.indexOf('可提现金额') !== -1) return 'cardItem--withdraw'
				return ''
			},
			/**
			 * 按统计项类型选择合适的数字格式
			 * @param {Object} item 统计项对象
			 * @returns {string}
			 */
			formatStatistic(item) {
				const title = item && item.title ? item.title : ''
				const value = item ? item.data : ''
				if (
				  title.indexOf('金额') !== -1 ||
				  title.indexOf('费用') !== -1 ||
				  title.indexOf('电费') !== -1 ||
				  title.indexOf('服务费') !== -1 ||
				  title.indexOf('可提现金额') !== -1
				) {
					return this.formatMoney(value)
				}
				if (title.indexOf('电量') !== -1) {
					return this.formatNumber(value, 2)
				}
				if (
				  title.indexOf('次数') !== -1 ||
				  title.indexOf('时长') !== -1 ||
				  title.indexOf('订单') !== -1 ||
				  title.indexOf('设备数') !== -1
				) {
					return this.formatNumber(value, 0)
				}
				return this.formatNumber(value, 2)
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
			getCurrentUser() {
				getRouter().then(res => {
					if(res.code === 200){
						this.currentUser = res.data
					}
				})
			},
			getReportsStatistics() {
				this.loading = true
				let listQuery = this.listQuery
				let statisticsList = this.statisticsList
				getReportsStatistics(listQuery).then(res => {
					if (res.code == 200) {
						let reportCount = res.data
						statisticsList.forEach((item, index) => {
							if (item.title == '交易总金额（元）') {
								item.data = reportCount.totalMoney || 0
							} else if (item.title == '扫码充值金额（元）') {
								item.data = reportCount.scanQRMoney || 0
							} else if (item.title == '月卡充值金额（元）') {
								item.data = reportCount.monthCardMoney || 0
							} else if (item.title == '套餐充值金额（元）') {
								item.data = reportCount.packageMoney || 0
							} else if (item.title == '总使用电量（度）') {
								item.data = reportCount.totalPower || 0
							} else if (item.title == '总充电次数（笔）') {
								item.data = reportCount.totalOrder || 0
							} else if (item.title == '总充电时长（分）') {
								item.data = reportCount.totalDuration || 0
							} else if (item.title == '总充电电费（元）') {
								item.data = reportCount.totalElectricityPrice || 0
							} else if (item.title == '总充电服务费（元）') {
								item.data = reportCount.totalServicePrice || 0
							} else if (item.title == '充电总费用（元）') {
								item.data = reportCount.totalRealityPayMoney || 0
							} else if (item.title == '运营设备数（台）') {
								item.data = reportCount.totalDevice || 0
							} else if (item.title == '可提现金额（元）') {
								item.data = this.currentUser.balanceAmount || 0
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
				getChargingStationList(0).then(res => {
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
			this.getCurrentUser()
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
	}

	.flex {
		display: flex;
	}

	.report-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 0;
	}

	.title-section {
		display: flex;
		align-items: center;
	}

	.title {
		font-size: 16px;
		font-weight: bold;
		margin-right: 8px;
	}

	.statistics-search-bar {
		margin-bottom: 20px;
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

	.business-statistics-header {
		margin-bottom: 10px;
	}

	.cardBox {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		background: transparent;
	}

	.cardItem {
		position: relative;
		flex: 0 0 calc(16.66% - 16px);
		min-width: 200px;
		height: 94px;
		margin: 5px 0;
		border-radius: 15px;
		padding: 14px 18px;
		box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
		color: #ffffff;
		overflow: hidden;
	}

	.cardText-content {
		position: relative;
		z-index: 1;
	}

	.cardText1 {
		font-size: 16px;
		font-weight: bold;
	}

	.cardText2 {
		font-size: 26px;
		line-height: 40px;
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

	.cardIcon {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 80px;
		height: 80px;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	.cardItem--total-money {
		background: linear-gradient(135deg, #409EFF, #2d8cf0);
	}

	.cardItem--scan-money {
		background: linear-gradient(135deg, #13c2c2, #36cfc9);
	}

	.cardItem--package-money {
		background: linear-gradient(135deg, #facc15, #f97316);
	}

	.cardItem--month-money {
		background: linear-gradient(135deg, #a855f7, #6366f1);
	}

	.cardItem--charge-fee {
		background: linear-gradient(135deg, #10b981, #22c55e);
	}

	.cardItem--power {
		background: linear-gradient(135deg, #00c9ff, #92fe9d);
	}

	.cardItem--order-count {
		background: linear-gradient(135deg, #f97373, #fb7185);
	}

	.cardItem--duration {
		background: linear-gradient(135deg, #8b5cf6, #4f46e5);
	}

	.cardItem--electricity {
		background: linear-gradient(135deg, #f97316, #fb923c);
	}

	.cardItem--service-fee {
		background: linear-gradient(135deg, #14b8a6, #06b6d4);
	}

	.cardItem--device-count {
		background: linear-gradient(135deg, #22c55e, #4ade80);
	}

	.cardItem--withdraw {
		background: linear-gradient(135deg, #ec4899, #f97373);
	}

	.cardItem--total-money .cardIcon,
	.cardItem--charge-fee .cardIcon,
	.cardItem--electricity .cardIcon,
	.cardItem--withdraw .cardIcon {
		background-image: url(../../assets/home-panel/trade-panel.png);
	}

	.cardItem--power .cardIcon,
	.cardItem--device-count .cardIcon {
		background-image: url(../../assets/home-panel/device-panel.png);
	}

	.cardItem--order-count .cardIcon,
	.cardItem--service-fee .cardIcon {
		background-image: url(../../assets/home-panel/order-panel.png);
	}

	.cardItem--duration .cardIcon {
		background-image: url(../../assets/home-panel/order-panel.png);
	}

	.cardItem--scan-money .cardIcon,
	.cardItem--package-money .cardIcon,
	.cardItem--month-money .cardIcon {
		background-image: url(../../assets/home-panel/user-panel.png);
	}
</style>

<style>
/* 页面内边距，避免右侧紧贴 */
#businessStatisticsPage {
	padding: 20px 16px 20px;
	box-sizing: border-box;
}

/* 去除表格外边框 */
#businessStatisticsPage .el-table {
  border: none;
}

#businessStatisticsPage .el-table::before,
#businessStatisticsPage .el-table::after {
  display: none;
}

/* 表头不换行 */
#businessStatisticsPage .el-table th .cell {
  white-space: nowrap;
}

/* 去除列之间竖线，保留行分隔线 */
#businessStatisticsPage .el-table td,
#businessStatisticsPage .el-table th {
  border-right: none !important;
}
</style>

<style>
/* Field specific styling */
.el-table th.col-header-money,
.el-table td.col-money {
  color: #ff7043;
  font-weight: 500;
}

.el-table th.col-header-count,
.el-table td.col-count {
  color: #409EFF;
  font-weight: 500;
}

.el-table th.col-header-energy,
.el-table td.col-energy {
  color: #26a69a;
  font-weight: 500;
}

.el-table th.col-header-duration,
.el-table td.col-duration {
  color: #8e44ad;
  font-weight: 500;
}
</style>
