<template>
	<div>
		<div :class="['DailyBox',isDark? 'dark_DailyBox' : 'light_DailyBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				每日数据走势
			</div>
			<line-chart :chartData="lineChartData" width="470px" height="340px" />
		</div>
	</div>
</template>

<script>
	import {
		getCurve
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	import LineChart from '@/components/Charts/LineChart'
	export default {
		name: 'Daily',
		components: {
			LineChart
		},
		data() {
			return {
				lineChartData: {
					userCount: [],
					orderCount: [],
					orderPrice: [],
					DAY: []
				},
			}
		},
		watch: {

		},
		methods: {
			getCurve() {
				getCurve().then(res => {
					if (res.code === 200) {
						let curveData = res.data
						let lineChartData = {
							userCount: [],
							orderCount: [],
							orderPrice: [],
							DAY: []
						}
						curveData.forEach((item, index) => {
							lineChartData.DAY.push(item.DAY)
							lineChartData.userCount.push(item.userCount)
							lineChartData.orderCount.push(item.orderCount)
							lineChartData.orderPrice.push(item.totalMoney)
						})
						this.lineChartData = lineChartData
					}
				})
			}
		},
		mounted() {

		},
		created() {
			this.getCurve()
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.light_DailyBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.dark_DailyBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.DailyBox {
		width: 500px;
		height: 400px;
		border-radius: 20px 20px 20px 20px;
		margin-top: 15px;

		.light_TipBox {
			background: linear-gradient(90deg, #00BBE9 0%, rgba(255, 255, 255, 0) 100%);
		}

		.dark_TipBox {
			background: linear-gradient(90deg, #001571 0%, rgba(0, 21, 112, 0) 71%);
		}

		.TipBox {
			width: 470px;
			height: 45px;
			border-radius: 10px 10px 10px 10px;
			opacity: 1;
			line-height: 45px;
			padding: 0 13px;
			font-size: 20px;
			color: rgba(255, 255, 255, 1);
			margin: 15px auto;
		}
	}
</style>