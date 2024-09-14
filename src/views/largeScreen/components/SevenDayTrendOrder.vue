<template>
	<div>
		<div :class="['DeviceNoOrderBox',isDark ? 'dark_DeviceNoOrderBox' : 'light_DeviceNoOrderBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				近七日充电趋势
			</div>
      <SevenDayTrend :chartData="lineChartData" width="470px" height="230px" />
		</div>
	</div>
</template>

<script>
	import {
		getSevenDayTrendByOrder
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
  import SevenDayTrend from '@/components/Charts/SevenDayTrend'
	export default {
		name: 'DeviceNoOrder',
    components: {
    	SevenDayTrend
    },
		data() {
			return {
				list: [],
        lineChartData: {
        	chargingAmount: [],
        	chargingOrder: [],
        	chargingDegree: [],
        	DAY: []
        },
			}
		},
		watch: {

		},
		methods: {
			getSevenDayTrendByOrder() {
				getSevenDayTrendByOrder().then(res => {
					if (res.code === 200) {
						let sevenDayTrendByOrder = res.data
						let lineChartData = {
							chargingAmount: [],
							chargingOrder: [],
							chargingDegree: [],
							DAY: []
						}
						sevenDayTrendByOrder.forEach((item, index) => {
							lineChartData.DAY.push(item.DAY)
							lineChartData.chargingAmount.push(item.chargingAmount)
							lineChartData.chargingOrder.push(item.chargingOrder)
							lineChartData.chargingDegree.push(item.chargingDegree)
						})
						this.lineChartData = lineChartData
					}
				})
			}
		},
		mounted() {

		},
		created() {
			this.getSevenDayTrendByOrder()
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.dark_DeviceNoOrderBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_DeviceNoOrderBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.DeviceNoOrderBox {
		width: 500px;
		height: 300px;
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

		.tableBox {
			width: 436px;
			margin: 0 auto;
			margin-top: 10px;

			.seamless-warp {
				height: 120px;
				overflow: hidden;
			}

			.tableList {
				width: 436px;
				align-items: center;
				justify-content: space-between;
				height: 40px;

				.dark_deviceCode {
					color: #fff;

					span {
						color: #fff;
					}
				}

				.light_deviceCode {
					color: rgba(58, 56, 113, 1);

					span {
						color: rgba(40, 40, 40, 0.50);
					}
				}

				.deviceCode {
					font-size: 15px;
				}

				.dark_time {
					color: #fff;
				}

				.light_time {
					color: rgba(58, 56, 113, 0.50);
				}

				.time {
					font-size: 15px;
				}
			}
		}
	}
</style>
