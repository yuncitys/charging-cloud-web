<template>
	<div :id="id" :class="className" :style="{ height: height, width: width }" />
</template>

<script>
	import '../map/china.js'
	export default {
		data() {
			return {

			}
		},
		name: 'echart',
		props: {
			className: {
				type: String,
				default: 'chart'
			},
			id: {
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
			options: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {
				chart: null
			}
		},
		watch: {
			options: {
				handler(options) {
					// 设置true清空echart缓存
					this.chart.setOption(options, true)
				},
				deep: true
			},
		},
		mounted() {
			this.initChart();
		},
		beforeDestroy() {
			this.chart.dispose()
			this.chart = null
		},
		methods: {
			initChart() {
				// 初始化echart
				this.chart = this.$echarts.init(this.$el)
				this.chart.setOption(this.options, true)
			}
		}
	}
</script>

<style>
</style>