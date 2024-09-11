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
			<businessDevList></businessDevList>
		</div>
	</div>
</template>

<script>
	import {
		getList,
	} from '@/api/business/businessStatistics.js'
	import {
		parseTime,
		trim
	} from '@/utils/index'
	import {
		getRouter
	} from '@/api/user'
	import businessDevList from './businessDevList.vue'
	import businessBusList from './businessBusList.vue'
	export default {
		name: 'businessStatistics1',
		components: {
			businessDevList,
			businessBusList
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
					dearId: "",
					deviceCode: ""
				},
				tableKey: 0,
				isChildUpdate1: true,
				isChildUpdate2: false,
				fourData: {},
				loading: false,
				dateYear: '',
				statisticsList: [{
						title: '交易金额',
						data: ''
					},
					{
						title: '扫码充值金额',
						data: ''
					},
					{
						title: 'IC卡代人充值金额',
						data: ''
					},
					{
						title: '套餐预充值金额',
						data: ''
					},
					{
						title: '总电量',
						data: ''
					},
					{
						title: '订单数量',
						data: ''
					},
					{
						title: '可提现金额',
						data: ''
					},
					{
						title: '在线设备总数',
						data: ''
					},
				]
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
			getLists() {
				this.loading = true
				let listQuery = this.listQuery
				let statisticsList = this.statisticsList
				getList(listQuery).then(res => {
					if (res.code == 200) {
						let fourData = res.data.reportCount
						statisticsList.forEach((item, index) => {
							if (item.title == '交易金额') {
								item.data = fourData.totalMoney || 0
							} else if (item.title == '扫码充值金额') {
								item.data = fourData.scanQRMoney || 0
							} else if (item.title == 'IC卡代人充值金额') {
								item.data = fourData.icCardMoney || 0
							} else if (item.title == '套餐预充值金额') {
								item.data = fourData.preMoney || 0
							} else if (item.title == '总电量') {
								item.data = fourData.totalPower || 0
							} else if (item.title == '订单数量') {
								item.data = fourData.totalOrder || 0
							} else if (item.title == '可提现金额') {
								item.data = fourData.balanceAmount || 0
							} else if (item.title == '在线设备总数') {
								item.data = fourData.deviceCount || 0
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
      this.getLists()
			this.dateYear = this.formatTime(new Date(), 'yyyy-MM-dd')
		},
	}
</script>

<style scoped="scoped">
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
