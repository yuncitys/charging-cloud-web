<template>
	<div :class="className" :style="{height:height,width:width}" />
</template>

<script>
	import echarts from 'echarts'
	require('echarts/theme/macarons') // echarts theme
	import resize from './mixins/resize'

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
				default: '350px'
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
				chart: null
			}
		},
		watch: {
			chartData: {
				deep: true,
				handler(val) {
					this.setOptions(val)
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
			showLoading(){
				this.chart.showLoading()
			},
			hideLoading(){
				this.chart.hideLoading()
			},
			initChart() {
				this.chart = echarts.init(this.$el, 'macarons')
				this.setOptions(this.chartData)
				console.log(this.chartData)
			},
			setOptions({
				expectedData,
        		tip,
				time
			} = {}) {
				this.chart.setOption({
					xAxis: {
						data: time,
						boundaryGap: false,
						axisTick: {
							show: false
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
						// formatter: function (data) {
						//   console.log(data)
						// //   return data[i].marker + data[i].seriesName  + ': '+ data[i].value+'<br/>';
						// },
						padding: [5, 10]
					},
					yAxis: {
						axisTick: {
							show: false
						}
					},
					dataZoom: [{
							type: 'slider',
							show: true,
							xAxisIndex: [0],
							start: 1,
							end: 100
						},
						{
							type: 'inside',
							xAxisIndex: [0],
							start: 1,
							end: 30
						},
					],
					legend: {
						data: ['功率']
					},
					series: [{
						name: '功率',
						itemStyle: {
							normal: {
								color: '#FF005A',
								lineStyle: {
									color: '#FF005A',
									width: 2
								}
							}
						},
						smooth: true,
						type: 'line',
						data: expectedData,
						animationDuration: 2800,
						animationEasing: 'cubicInOut'
					}]
				})
			}
		}
	}
</script>
