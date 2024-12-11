<template>
	<div style="display: inline-block;">
		<el-button type="primary" size="mini" @click="openDialog()" style="margin-left: 10px;"
			v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:findDevicePowerDetails')">
      功率图
		</el-button>
		<!-- 功率图 -->
		<el-dialog :visible.sync="showChart" title="订单功率图" @close="closeDialog" width="75%" :append-to-body="true">
			<div class="borderFather">
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						订单号
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.orderCode}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						订单状态
					</div>
					<div class="itemright  borsa itemdivs">
						{{$dict.getOrderStatus(OrderListData.orderStatus) }}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						设备号
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.deviceCode}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						端口号
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.devicePort}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						创建时间
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.createTime}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						开始时间
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.startTime}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv">
						结束时间
					</div>
					<div class="itemright  borsa itemdivs borenone">
						{{OrderListData.endTime}}
					</div>
				</div>
				<!-- <div class="borderItem">
					<div class="itemleft borsa itemdiv">
						省份
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.networkProvince}}
					</div>
				</div> -->
				<div class="borderItem">
					<div class="itemleft borsa itemdiv ">
						站点名称
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.networkName}}
					</div>
				</div>
        <div class="borderItem">
        	<div class="itemleft borsa itemdiv">
        		设备地址
        	</div>
        	<div class="itemright  borsa itemdivs">
        		{{OrderListData.networkAddress}}
        	</div>
        </div>
				<div class="borderItem ">
					<div class="itemleft borsa itemdiv ">
						总金额
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.totalPrice}}
					</div>
				</div>
				<div class="borderItem ">
					<div class="itemleft borsa itemdiv ">
						实际支付金额
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.actualPrice}}
					</div>
				</div>
				<div class="borderItem ">
					<div class="itemleft borsa itemdiv ">
						小程序名称
					</div>
					<div class="itemright  borsa itemdivs">
						{{OrderListData.wxName}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv ">
						计费类型
					</div>
					<div class="itemright  borsa itemdivs">
						{{priceTypeText}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv ">
						计费名称
					</div>
					<div class="itemright  borsa itemdivs">
						{{feeName}}
					</div>
				</div>
				<div class="borderItem">
					<div class="itemleft borsa itemdiv ">
						计费标准
					</div>
					<div class="itemright  borsa itemdivs" style="width: 510px;" v-if="OrderListData.ruleId === 1">
						{{details}}
					</div>
				</div>
			</div>
			<line-chart :chart-data="lineChartData" ref='lineChart' />
		</el-dialog>
	</div>
	</div>
</template>

<script>
	import {
		getList,
		deleteOrder,
		findOrderInfoById,
		updateOrderStatus,
		downloadExcel,
		updateOrder,
		findDevicePowerDetails
	} from '@/api/order/scanOrderList.js'
  import {
    findDevicePriceById
  } from '@/api/netWorkDot/charge/chargeList.js'
	import {
		getRouter
	} from '@/api/user'
	import {
		parseTime,
		numTime,
		formatSeconds
	} from '@/utils/index'
	import LineChart from './LineChart'
	const lineChartData = {
		newVisitis: {
			expectedData: [],
			time: [],
		},
	}
	export default {
		name: 'powerChart',
		components: {
			LineChart,
		},
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				showChart: false,
				lineChartData: lineChartData.newVisitis,
				OrderListData: {},
				priceTypeText: '',
				feeName: '',
				details: '',
			}
		},
		mounted() {

		},
		computed: {

		},
		methods: {
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
			//功耗计时停止
			closeDialog() {
				clearInterval(this.setTime)
				lineChartData.newVisitis.expectedData = []
				lineChartData.newVisitis.time = []
			},
			//显示功率图
			openDialog() {
        this.showChart = true
				this.OrderListData = this.row_data;
				this.deviceCode1 = this.row_data.deviceCode
				this.startTime = this.row_data.startTimeAll
				this.endTime = this.row_data.endTimeAll
				this.devicePort = this.row_data.devicePort
				this.deviceCode = this.row_data.deviceCode
				this.findDevicePriceById(this.row_data.devicePriceId || 0)
				this.$nextTick(() => {
					this.DevicePowerDetails()
				})
				let setTime = setInterval(() => {
					this.DevicePowerDetails()
				}, 300000)
				this.setTime = setTime;
			},
			findDevicePriceById(devicePriceId) {
				let data = {
					devicePriceId: devicePriceId
				}
				findDevicePriceById(data).then(res => {
					if (res.code === 200) {
						let priceData = res.data
						if (priceData) {
							this.feeName = priceData.feeName
							let priceType = priceData.priceType
							let priceContentList = priceData.priceContents
              console.log(priceContentList,"方案详情")
							let details = ''
							let arr = []
							let priceTypeText = ''
							priceContentList.forEach((item, index) => {
								let detail
								if (priceType === 0) {
									detail = item.duration + '小时' + "/" + item.money + "元"
									priceTypeText = '计时'
								} else if (priceType === 1) {
									priceTypeText = '电量'
									detail = item.duration + '度电' + "/" + item.money + "元"
								} else if (priceType === 2) {
									priceTypeText = '功率'
									detail = item.powerSectionBefore + '-' + item.powerSectionAfter + 'W,' + item.duration + '小时' + "/" + item.money + "元"
								}
								arr[index] = detail
							})
							details = arr.join(";")
							this.details = details
							this.priceTypeText = priceTypeText
							console.log(details,"方案详情")
						}
					}
				})
			},
			//功率图数据
			DevicePowerDetails() {
        let orderCode = this.OrderListData.orderCode;
				let data = {
					orderCode: orderCode
				}
				this.$nextTick(() => {
					this.$refs.lineChart.showLoading()
				})
				findDevicePowerDetails(data).then(res => {
					if (res.code == 200) {
						let time = []
						let expectedData = []
            let tip = []
						let listData = res.data || []
						if (listData.length != 0) {
							listData.forEach((item, index) => {
								expectedData.push(item.power)
                tip.push(item)
								let date = item.createTime.slice(11, 16)
								time.push(date)
							})
						}
						lineChartData.newVisitis.expectedData = expectedData
            lineChartData.newVisitis.tip = tip
						lineChartData.newVisitis.time = time
						this.$nextTick(() => {
							this.$refs.lineChart.hideLoading()
						})
					}
				})
			},
		},
		created() {

		},

	}
</script>

<style>
	.boerdno {
		border-top: none;
	}

	.itemdivs {
		display: flex;
		align-items: center;
		width: 205px;
		height: 50px;
		text-indent: 10px;
	}

	.itemdiv {
		width: 100px;
		height: 50px;
		display: flex;
		padding: 12px;
		justify-content: center;
		align-items: center;
		background-color: #EEEEEE;
		color: #666666;
	}

	.borsa {
		/* border: 1px solid #EEEEEE; */
		border-bottom: 1px solid #EEEEEE;
		border-right: 1px solid #EEEEEE;
	}

	.borenone {
		border-top: 1px solid #EEEEEE;
		;
		/* border-bottom: none; */
	}

	.borderItem {
		/* overflow: ; */
		/* width: 100%; */
		display: flex;
	}

	.borderFather {
		display: flex;
		/* justify-content: center; */
		flex-wrap: wrap;
		width: 101%;
		/* background-color: pink; */
	}
</style>
