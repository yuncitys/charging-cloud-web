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
				default: '300px'
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
			initChart() {
				this.chart = echarts.init(this.$el, 'macarons')
				this.setOptions(this.chartData)
			},
			setOptions({
				expectedData,
				actualData
			} = {}) {
				this.chart.setOption({
					tooltip: {
						trigger: 'item',
						formatter: '{b} : {c} ({d}%)'
					},
					legend: {
						left: 'center',
						bottom: '10',
						data: actualData
					},
					series: [{
						name: '占比',
						type: 'pie',
						radius: ['40%', '70%'],
						center: ['50%', '50%'],
						data: expectedData,
						animationEasing: 'cubicInOut',
						animationDuration: 2600,
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						},
						label: {
							show: true,
							formatter: '{b}'
						},
						labelLine: {
							show: true
						}
					}]
				})
			},
		}
	}
</script>
