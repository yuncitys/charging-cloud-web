<template>
	<div :class="className" :style="{height:height,width:width}" />
</template>

<script>
	import echarts from 'echarts'
	// require('echarts/theme/macarons') // echarts theme
	import resize from './mixins/resize'
	import {
		mapGetters
	} from 'vuex'
	export default {
		mixins: [resize],
		props: {
			className: {
				type: String,
				default: 'chart'
			},
			width: {
				type: String,
				default: '100%'
			},
			height: {
				type: String,
				default: '100%'
			},
			autoResize: {
				type: Boolean,
				default: true
			},
			chartData: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				chart: null,
			}
		},
		computed: {
			isDark() {
				let isDark = window.sessionStorage.getItem('isDark') ? window.sessionStorage.getItem('isDark') : 0
				if (typeof(isDark) !== Number) {
					isDark = Number(isDark)
				}
				return isDark
			}
		},
		watch: {
			chartData: {
				deep: true,
				handler(val) {
					// this.hideLoading()
					this.setOptions(val)
				}
			},
			isDark: {
				deep: true,
				handler(val) {
					// this.hideLoading()
					this.setOptions(this.chartData)
				}
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initChart()
			})
		},
		beforeDestroy() {
			if (!this.chart) {
				return
			}
			this.chart.dispose()
			this.chart = null
		},
		methods: {
			showLoading() {
				this.chart.showLoading()
			},
			hideLoading() {
				this.chart.hideLoading()
			},
			initChart() {
				this.chart = echarts.init(this.$el, 'macarons')
				console.log(this.chartData)
				this.setOptions(this.chartData)
				// this.showLoading()
			},
			setOptions(chartData) {
				if (this.isDark) {
					this.chart.setOption({
						xAxis: {
							data: chartData.DAY,
							boundaryGap: false,
							axisTick: {
								show: false,
							},
							axisLine: {
								lineStyle: {
									color: '#fff',
								}
							}
						},
						yAxis: {
							axisTick: {
								show: false,
							},
							axisLine: {
								show: false,
								lineStyle: {
									color: '#fff'
								}
							}
						},
						grid: {
							left: 10,
							right: 10,
							bottom: 20,
							top: 30,
							containLabel: true
						},
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'cross',
								label: {
									backgroundColor: '#26262A'
								}
							},
							padding: [5, 10]
						},
						legend: {
							data: ['充电订单','充电度数','充电金额'],
							textStyle: {
								color: '#fff'
							}
						},
						series: [{
								name: '充电度数',
								itemStyle: {
									normal: {
										color: '#FF7B58',
										lineStyle: {
											color: '#FF7B58',
											width: 2
										}
									}
								},
								smooth: true,
								type: 'line',
								data: chartData.chargingDegree,
								animationDuration: 2800,
								animationEasing: 'cubicInOut'
							},
							{
								name: '充电订单',
								smooth: true,
								type: 'line',
								itemStyle: {
									normal: {
										color: '#735FFF',
										lineStyle: {
											color: '#735FFF',
											width: 2
										},
									}
								},
								data: chartData.chargingOrder,
								animationDuration: 2800,
								animationEasing: 'quadraticOut'
							},
              {
								name: '充电金额',
								smooth: true,
								type: 'line',
								itemStyle: {
									normal: {
										color: '#00BBE9',
										lineStyle: {
											color: '#00BBE9',
											width: 2
										},
									}
								},
								data: chartData.chargingAmount,
								animationDuration: 2800,
								animationEasing: 'quadraticOut'
							}
						]
					})
				} else {
					this.chart.setOption({
						xAxis: {
							data: chartData.DAY,
							boundaryGap: false,
							axisTick: {
								show: false,
							},
							axisLine: {
								lineStyle: {
									color: 'rgba(40, 40, 40, 0.70)'
								}
							}
						},
						yAxis: {
							axisTick: {
								show: false,
							},
							axisLine: {
								show: false,
								lineStyle: {
									color: 'rgba(40, 40, 40, 0.70)'
								}
							}
						},
						grid: {
							left: 10,
							right: 10,
							bottom: 20,
							top: 30,
							containLabel: true
						},
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'cross'
							},
							padding: [5, 10]
						},
						legend: {
							data: ['充电订单','充电度数','充电金额'],
						},
						series: [{
								name: '充电度数',
								itemStyle: {
									normal: {
										color: '#FF7B58',
										lineStyle: {
											color: '#FF7B58',
											width: 2
										}
									}
								},
								smooth: true,
								type: 'line',
								data: chartData.chargingDegree,
								animationDuration: 2800,
								animationEasing: 'cubicInOut'
							},
							{
								name: '充电订单',
								smooth: true,
								type: 'line',
								itemStyle: {
									normal: {
										color: '#735FFF',
										lineStyle: {
											color: '#735FFF',
											width: 2
										},
									}
								},
								data: chartData.chargingOrder,
								animationDuration: 2800,
								animationEasing: 'quadraticOut'
							}, {
								name: '充电金额',
								smooth: true,
								type: 'line',
								itemStyle: {
									normal: {
										color: '#00BBE9',
										lineStyle: {
											color: '#00BBE9',
											width: 2
										},
									}
								},
								data: chartData.chargingAmount,
								animationDuration: 2800,
								animationEasing: 'quadraticOut'
							}
						]
					})
				}
			}
		}
	}
</script>
