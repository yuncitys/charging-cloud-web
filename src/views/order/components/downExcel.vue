<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="downloadOrder"
			:loading="downloadLoading" icon="el-icon-download"
			v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:export')">导出Excel
		</el-button>

    	<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
		downloadExcel,
		exportExcel
	} from '@/api/order/orderList.js'
	import {
		parseTime,
		numTime,
		formatSeconds,
		getNowTime
	} from '@/utils/index'
  	import downloadProgress from '@/components/Common/downloadProgress.vue'
	export default {
		name: 'downExcel',
		components: {
			downloadProgress
		},
		props: {
			queryData: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		data() {
			return {
				downloadLoading: false,
			}
		},
		mounted() {

		},
		computed: {

		},
		methods: {
			//订单导出（进度条
			downloadOrder() {
				let downloadData = {
					limit: 5000,
					payStatus: this.queryData.payStatus,
					orderStatus: this.queryData.orderStatus,
					orderCode: this.queryData.orderCode,
					deviceCode: this.queryData.deviceCode,
					orderType: this.queryData.orderType,
					userCode: this.queryData.userCode,
					phoneNumber: this.queryData.phoneNumber,
					adminId: this.queryData.adminId,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd,
					networkProvince: this.queryData.networkProvince,
					networkName: this.queryData.networkName,
					ruleId: this.queryData.ruleId
				}
				downloadExcel(downloadData).then(res => {
					if (res.code == 200) {
						let taskId = res.data.id
						this.$refs.downloadProgress.open(taskId)
					}
				})
			},
			//导出订单（流
			handleDownloadNew() {
				this.downloadLoading = true
				let downloadData = {
					orderStatus: this.queryData.orderStatus,
					orderCode: this.queryData.orderCode,
					deviceCode: this.queryData.deviceCode,
					orderType: this.queryData.orderType,
					userCode: this.queryData.userCode,
					phoneNumber: this.queryData.phoneNumber,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd,
					networkProvince: this.queryData.networkProvince,
					networkName: this.queryData.networkName,
					ruleId: this.queryData.ruleId
				}
				exportExcel(downloadData).then(res => {
					let blob = res
					let objectUrl = URL.createObjectURL(blob);
					let a = document.createElement('a');
					a.href = objectUrl;
					let time = getNowTime()
					a.download = `订单列表${time}.xlsx`
					a.click();
					this.downloadLoading = false
				})
			},
			//导出订单（数据
			handleDownload() {
				this.downloadLoading = true
				let downloadData = {
					orderStatus: this.queryData.orderStatus,
					orderCode: this.queryData.orderCode,
					deviceCode: this.queryData.deviceCode,
					orderType: this.queryData.orderType,
					userCode: this.queryData.userCode,
					phoneNumber: this.queryData.phoneNumber,
					createTimeStart: this.queryData.createTimeStart,
					createTimeEnd: this.queryData.createTimeEnd,
					networkProvince: this.queryData.networkProvince,
					networkName: this.queryData.networkName
				}
				downloadExcel(downloadData).then(res => {
					this.downloadLoading = false
					if (res.code == 200) {
						import('@/vendor/Export2Excel').then(excel => {
							const tHeader = ['订单号', '用户ID', '开始前余额', '扣费后余额', '设备号', '卡号', '小程序名称', '总用电量',
								'起始功率',
								'订单总价', '消费金额', '退款操作IP', '退款操作人员', '端口号', '电费', '收费类型',
								'网点名称', '设备地址',
								'状态',
								'工作时长/电量', '实际时长', '剩余时间', '开始时间',
								'结束时间', '订单创建'
							]
							const filterVal = ['orderCode', 'userCode', 'startCash', 'endCash', 'deviceCode',
								'cardNo', 'wxName',
								'totalPower', 'power', 'totalPrice',
								'actualPrice', 'refundIp', 'refundUser',
								'devicePort',
								'electricityPrice',
								'priceTypeStr',
								'networkName', 'networkAddress', 'orderStatusStr', 'hoursStr',
								'userdTimeStr', 'hasTimeStr',
								'startTimeAll', 'endTimeAll', 'createTime'
							]
							const list = res.data || []
							if (list.length != 0) {
								list.forEach((item, index) => {
									item.eleNum = item.hours
									let userdTime = ''
									if (item.orderStatus != 1) {
										userdTime = numTime(item.endTimeAll, item.startTimeAll,
											1) || '00:00:00'
										item.userdTime = numTime(item.endTimeAll, item
											.startTimeAll, 0)
									} else {
										let nowDate = this.getTime()
										userdTime = numTime(nowDate, item.startTimeAll, 1) ||
											'00:00:00'
										item.userdTime = numTime(nowDate, item.startTimeAll, 0)
									}
									userdTime = userdTime.split(':')
									let num1 = parseFloat(userdTime[0]) * 60 * 60 + parseFloat(
											userdTime[1]) *
										60 + parseFloat(userdTime[2])
									let num2 = parseFloat(item.hours) * 60
									let num3 = num2 - num1
									item.hasTime = formatSeconds(num3)
									item.hours = formatSeconds(num2)

									if (item.priceType === 0) {
										item.priceTypeStr = '计时'
									} else if (item.priceType === 1) {
										item.priceTypeStr = '电量'
									} else if (item.priceType === 2) {
										item.priceTypeStr = '功耗'
									}

									item.orderStatusStr = this.$dict.getOrderStatus(item
										.orderStatus)

									if (item.priceType === 0) {
										item.hoursStr = item.hours
									} else if (item.priceType === 1) {
										item.hoursStr = item.eleNum
									}

									if (item.orderStatus !== 0) {
										item.userdTimeStr = item.userdTime
									} else {
										item.userdTimeStr = '0分钟'
									}

									if (item.orderStatus !== 0) {
										if (item.orderStatus === 2) {
											item.hasTimeStr = '0分钟'
										} else {
											item.hasTimeStr = item.hasTime
										}
									} else {
										item.hasTimeStr = item.hours
									}

								})
							}
							const data = this.formatJson(filterVal, list)
							let filename = '订单列表' + getNowTime()
							excel.export_json_to_excel({
								header: tHeader,
								data,
								filename: filename
							})
							this.downloadLoading = false
						})
					} else {
						this.$message({
							message: '导出失败，请重试',
							type: 'warning'
						})
					}
				}).catch(err => {
					this.downloadLoading = false
				})
			},
			formatJson(filterVal, jsonData) {
				return jsonData.map(v => filterVal.map(j => v[j]))
			},
			//获取当前时间
			getTime() {
				var date = new Date()
				var y = date.getFullYear()
				var m = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
				var d = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
				var hh = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours())
				var mm = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes())
				var ss = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
				return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
			},
		},
		created() {

		},
	}
</script>

<style>

</style>
