<template>
	<div class="app-container" id="businessStatisticsPage">
		<div class="filter-container">
			<div class="statistics-search-bar">
				<el-input style="width: 200px; margin-right: 20px ;" placeholder="请输入设备号" v-model="listQuery.deviceCode" class="filter-item" clearable
					@keyup.enter.native="handleFilter" @clear="handleFilter()" />
				<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.merchantId" filterable clearable @change="handleFilter()"
				placeholder="请选择商户">
					<el-option
					v-for="item in merchantList"
					:key="item.id"
					:label="item.name"
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
				<StatsTimeRangeFilter
					:time-type.sync="statsTimeType"
					:start.sync="statsStart"
					:end.sync="statsEnd"
					@change="onStatsTimeChange"
				/>
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
					查询
				</el-button>
				<downDeviceReportsExcel :queryData="listQuery" />
			</div>
			<div class="report-header">
				<div class="title-section">
					<span class="title">经营统计</span>
					<StatsCaliberDialog :intro="caliber.intro" :fields="caliber.fields" />
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
				<el-table v-loading="listLoading" :key="tableKey" :data="list" class="stats-nested-table" element-loading-text="拼命加载中......" fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
					<el-table-column type="index" width="55" label="序号" align="center">
						<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
					</el-table-column>
					<el-table-column label="统计维度" align="center">
						<el-table-column prop="ruleId" label="产品类型" align="center" min-width="100" show-overflow-tooltip>
							<template slot-scope="scope">
								<span>{{ $dict.formatDeviceRule(scope.row.ruleId) }}桩</span>
							</template>
						</el-table-column>
						<el-table-column prop="deviceCode" label="设备号" align="center" min-width="140" show-overflow-tooltip />
						<el-table-column prop="deviceName" label="设备名称" align="center" min-width="120" show-overflow-tooltip />
						<el-table-column prop="deviceTypeName" label="设备类型" align="center" min-width="110" show-overflow-tooltip />
						<el-table-column prop="networkName" label="站点名称" align="center" min-width="150" show-overflow-tooltip />
						<el-table-column prop="networkAddress" label="站点地址" align="center" min-width="160" show-overflow-tooltip />
					</el-table-column>
					<el-table-column label="充电概况" align="center">
						<el-table-column prop="orderCount" label="订单总数" align="center" sortable min-width="100" />
						<el-table-column prop="totalDuration" label="充电时长（小时）" align="center" sortable min-width="140">
							<template slot-scope="scope">
								<span>{{ formatChargeDurationHours(scope.row.totalDuration) }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="totalPower" label="使用电量（度）" align="center" sortable min-width="130" />
					</el-table-column>
					<el-table-column label="原价费用" align="center">
						<el-table-column prop="totalElectricityPrice" label="电费（元）" align="center" sortable min-width="110" />
						<el-table-column prop="totalServicePrice" label="服务费（元）" align="center" sortable min-width="110" />
						<el-table-column prop="totalActualMoney" label="应收金额（元）" align="center" sortable min-width="130" />
					</el-table-column>
					<el-table-column label="优惠抵扣" align="center">
						<el-table-column prop="operatorCouponDiscountAmount" label="运营商优惠券抵扣（元）" align="center" sortable min-width="180" />
						<el-table-column prop="operatorStationActivityDiscountAmount" label="运营商电站活动抵扣（元）" align="center" sortable min-width="190" />
						<el-table-column prop="platformCouponDiscountAmount" label="平台优惠券抵扣（元）" align="center" sortable min-width="170" />
						<el-table-column prop="platformStationActivityDiscountAmount" label="平台电站活动抵扣（元）" align="center" sortable min-width="180" />
					</el-table-column>
					<el-table-column label="用户实付" align="center">
						<el-table-column prop="userActualElectricityAmount" label="用户实付电费（元）" align="center" sortable min-width="150" />
						<el-table-column prop="userActualServiceAmount" label="用户实付服务费（元）" align="center" sortable min-width="160" />
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
		getReportsStatistics,
    	getDeviceStatistics
	} from '@/api/business/businessStatistics.js'
	import { getMerchant } from '@/api/merchant/merchant.js'
	import {
		getChargingStationList
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		parseTime,
		trim
	} from '@/utils/index'
	import businessDevList from './businessDevList.vue'
	import businessBusList from './businessBusList.vue'
	import deviceAdmin from '../device/components/deviceAdmin.vue'
	import downDeviceReportsExcel from './components/downDeviceReportsExcel.vue'
	import StatsCaliberDialog from './components/StatsCaliberDialog.vue'
	import StatsTimeRangeFilter, { defaultRangeForTimeType, dayBoundsToDateTime, monthBoundsToDateTime } from './components/StatsTimeRangeFilter.vue'
	import { caliberForPage } from './statsCaliberCopy.js'
	import './styles/statsNestedTable.css'

	const _defaultStatsRange = defaultRangeForTimeType(3)
	const _defaultDayBounds = dayBoundsToDateTime(_defaultStatsRange[0], _defaultStatsRange[1])

	export default {
		name: 'businessStatistics1',
		components: {
      		deviceAdmin,
			businessDevList,
			businessBusList,
      		downDeviceReportsExcel,
			StatsCaliberDialog,
			StatsTimeRangeFilter
		},
		data() {
			return {
				statsTimeType: 3,
				statsStart: _defaultStatsRange[0],
				statsEnd: _defaultStatsRange[1],
				activeName: 'first',
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					merchantId: '',
					deviceCode: '',
					allocationStatus: 1,
					chargingStationIds:'',
					createTimeStart: _defaultDayBounds.start,
					createTimeEnd: _defaultDayBounds.end
				},
				tableKey: 0,
				isChildUpdate1: true,
				isChildUpdate2: false,
				loading: false,
        		listLoading: false,
				caliber: caliberForPage('business'),
				statisticsList: [
					{
						title: '实收总金额（元）',
						data: ''
					},
					{
						title: '应收总金额（元）',
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
						title: '总充电时长（小时）',
						data: ''
					},
					{
						title: '总充电电费（元）',
						data: ''
					},
          			{
						title: '总充电服务费（元）',
						data: ''
					},
				],
				merchantList: [],
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
				if (title.indexOf('实收总金额') !== -1) return 'cardItem--charge-fee'
				if (title.indexOf('应收总金额') !== -1) return 'cardItem--receivable-total'
				if (title.indexOf('总使用电量') !== -1) return 'cardItem--power'
				if (title.indexOf('总充电次数') !== -1) return 'cardItem--order-count'
				if (title.indexOf('总充电时长') !== -1) return 'cardItem--duration'
				if (title.indexOf('总充电电费') !== -1) return 'cardItem--electricity'
				if (title.indexOf('总充电服务费') !== -1) return 'cardItem--service-fee'
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
				  title.indexOf('实收总金额') !== -1 ||
				  title.indexOf('应收总金额') !== -1 ||
				  title.indexOf('总使用电量') !== -1 ||
				  title.indexOf('总充电电费') !== -1 ||
				  title.indexOf('总充电服务费') !== -1
				) {
					return this.formatNumber(value, 4)
				}
				if (
				  title.indexOf('金额') !== -1 ||
				  title.indexOf('费用') !== -1 ||
				  title.indexOf('电费') !== -1 ||
				  title.indexOf('服务费') !== -1
				) {
					return this.formatMoney(value)
				}
				if (title.indexOf('电量') !== -1) {
					return this.formatNumber(value, 2)
				}
				if (title.indexOf('时长') !== -1) {
					return this.formatNumber(value, 2)
				}
				if (
				  title.indexOf('次数') !== -1 ||
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
			 * 将接口返回的充电时长（分钟）格式化为小时，保留两位小数
			 * @param {number|string} minutes 分钟
			 * @returns {string}
			 */
			formatChargeDurationHours(minutes) {
				if (minutes === null || minutes === undefined || minutes === '') return '-'
				const num = Number(minutes)
				if (Number.isNaN(num)) return '-'
				return this.formatNumber(num / 60, 2)
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
			getReportsStatistics() {
				this.loading = true
				let listQuery = this.listQuery
				let statisticsList = this.statisticsList
				getReportsStatistics(listQuery).then(res => {
					if (res.code == 200) {
						let reportCount = res.data
						statisticsList.forEach((item, index) => {
							if (item.title == '总使用电量（度）') {
								item.data = reportCount.totalPower || 0
							} else if (item.title == '总充电次数（笔）') {
								item.data = reportCount.totalOrder || 0
							} else if (item.title == '总充电时长（小时）') {
								item.data = ((reportCount.totalDuration || 0) / 60)
							} else if (item.title == '总充电电费（元）') {
								item.data = reportCount.totalElectricityPrice || 0
							} else if (item.title == '总充电服务费（元）') {
								item.data = reportCount.totalServicePrice || 0
							} else if (item.title == '实收总金额（元）') {
								item.data = reportCount.totalRealityPayMoney || 0
							} else if (item.title == '应收总金额（元）') {
								item.data = reportCount.totalActualMoney || 0
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
				return getChargingStationList(0).then(res => {
					if (res.code == 200) {
						this.chargingStationList = res.data;
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			// 工作台下钻：route.query.stationId 命中站点列表时预填；非法 id 静默忽略
			applyRouteStation() {
				const q = this.$route && this.$route.query ? this.$route.query.stationId : ''
				const id = Array.isArray(q) ? q[0] : q
				if (id === undefined || id === null || id === '') return
				const hit = (this.chargingStationList || []).find(item => String(item.id) === String(id))
				if (hit) {
					this.listQuery.chargingStationIds = [hit.id]
					const mid = hit.merchantId !== undefined && hit.merchantId !== null ? hit.merchantId : hit.merchant_id
					this.listQuery.merchantId = (mid === undefined || mid === null) ? '' : mid
				}
			},
			getMerchantList() {
				getMerchant().then(res => {
					if (res.code == 200) {
						this.merchantList = res.data || []
					} else {
						this.$message.error(res.msg)
					}
				}).catch(() => {
					this.merchantList = []
				})
			},
			applyStatsTimeToQuery(timeType, start, end) {
				const bounds = timeType === 2
					? monthBoundsToDateTime(start, end)
					: dayBoundsToDateTime(start, end)
				this.listQuery.createTimeStart = bounds.start
				this.listQuery.createTimeEnd = bounds.end
			},
			onStatsTimeChange({ timeType, start, end }) {
				this.applyStatsTimeToQuery(timeType, start, end)
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
			}
		},
		created() {
			this.$dict.getSelector('device_rule')
			this.$dict.getSelector('device_status')
			// this.getRouters()
			this.getMerchantList()
			const drillStationId = this.$route && this.$route.query ? this.$route.query.stationId : ''
			if (drillStationId) {
				// keep-alive 首次会连着触发 activated；跳过一次避免双查
				this._skipDrillActivatedOnce = true
				// 下钻场景：等站点列表返回后预填，再统一发起一次查询
				this.getChargingStationList().catch(() => {}).then(() => {
					this.applyRouteStation()
					this.handleFilter()
				})
			} else {
				this.getChargingStationList()
				this.getReportsStatistics()
				this.getLists()
			}
		},
		activated() {
			const q = this.$route && this.$route.query ? this.$route.query.stationId : ''
			const id = Array.isArray(q) ? q[0] : q
			if (id === undefined || id === null || id === '') return
			if (this._skipDrillActivatedOnce) {
				this._skipDrillActivatedOnce = false
				return
			}
			const ensure = (this.chargingStationList && this.chargingStationList.length)
				? Promise.resolve()
				: this.getChargingStationList().catch(() => {})
			ensure.then(() => {
				this.applyRouteStation()
				this.handleFilter()
			})
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

	.cardItem--charge-fee {
		background: linear-gradient(135deg, #10b981, #22c55e);
	}

	.cardItem--receivable-total {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
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


	.cardItem--charge-fee .cardIcon,
	.cardItem--receivable-total .cardIcon,
	.cardItem--electricity .cardIcon {
		background-image: url(../../assets/home-panel/trade-panel.png);
	}

	.cardItem--power .cardIcon {
		background-image: url(../../assets/home-panel/device-panel.png);
	}

	.cardItem--order-count .cardIcon,
	.cardItem--service-fee .cardIcon {
		background-image: url(../../assets/home-panel/order-panel.png);
	}

	.cardItem--duration .cardIcon {
		background-image: url(../../assets/home-panel/order-panel.png);
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

</style>
