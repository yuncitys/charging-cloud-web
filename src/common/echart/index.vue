<template>
	<div :id="id" :class="className" :style="{ height: height, width: width }" />
</template>

<script>
	import echarts from 'echarts'
	import '../map/china.js'
	const provinceMapContext = require.context('../map/province', false, /\.json$/)
	provinceMapContext.keys().forEach((key) => {
		const mod = provinceMapContext(key)
		const geoJson = mod && mod.default ? mod.default : mod
		const mapName = key.replace('./', '').replace('.json', '')
		echarts.registerMap(mapName, geoJson)
	})
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
