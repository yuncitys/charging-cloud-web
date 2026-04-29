<template>
	<div :id="id" :class="className" :style="{ height: height, width: width }" />
</template>

<script>
	import echarts from 'echarts'
	import '../map/china.js'
	function walkCoords(coords, onPoint) {
		if (!Array.isArray(coords)) return
		if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
			onPoint(coords)
			return
		}
		for (let i = 0; i < coords.length; i++) {
			walkCoords(coords[i], onPoint)
		}
	}
	function getGeometryBBox(geometry) {
		const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
		if (!geometry) return null
		walkCoords(geometry.coordinates, (pt) => {
			const x = pt[0]
			const y = pt[1]
			if (x < bbox.minX) bbox.minX = x
			if (y < bbox.minY) bbox.minY = y
			if (x > bbox.maxX) bbox.maxX = x
			if (y > bbox.maxY) bbox.maxY = y
		})
		if (!Number.isFinite(bbox.minX) || !Number.isFinite(bbox.minY) || !Number.isFinite(bbox.maxX) || !Number.isFinite(bbox.maxY)) {
			return null
		}
		return bbox
	}
	function mergeBBox(a, b) {
		if (!a) return b
		if (!b) return a
		return {
			minX: Math.min(a.minX, b.minX),
			minY: Math.min(a.minY, b.minY),
			maxX: Math.max(a.maxX, b.maxX),
			maxY: Math.max(a.maxY, b.maxY),
		}
	}
	function getBBoxSize(bbox) {
		return {
			w: bbox.maxX - bbox.minX,
			h: bbox.maxY - bbox.minY,
		}
	}
	function transformGeometry(geometry, transformPoint) {
		if (!geometry) return
		walkCoords(geometry.coordinates, (pt) => {
			const res = transformPoint(pt[0], pt[1])
			pt[0] = res[0]
			pt[1] = res[1]
		})
	}
	function normalizeHainanSanshaInset(geoJson) {
		if (!geoJson || !Array.isArray(geoJson.features)) return geoJson
		const features = geoJson.features
		const sansha = features.find(f => f && f.properties && f.properties.name === '三沙市')
		if (!sansha || !sansha.geometry) return geoJson

		let mainBBox = null
		features.forEach(f => {
			if (!f || !f.geometry) return
			if (f.properties && f.properties.name === '三沙市') return
			mainBBox = mergeBBox(mainBBox, getGeometryBBox(f.geometry))
		})
		const sanshaBBox = getGeometryBBox(sansha.geometry)
		if (!mainBBox || !sanshaBBox) return geoJson

		const mainSize = getBBoxSize(mainBBox)
		const sanshaSize = getBBoxSize(sanshaBBox)
		if (mainSize.w <= 0 || mainSize.h <= 0 || sanshaSize.w <= 0 || sanshaSize.h <= 0) return geoJson

		const paddingX = mainSize.w * 0.02
		const paddingY = mainSize.h * 0.02
		const targetW = mainSize.w * 0.22
		const targetH = mainSize.h * 0.22
		const targetMinX = mainBBox.maxX - targetW - paddingX
		const targetMinY = mainBBox.minY + paddingY
		const scale = Math.min(targetW / sanshaSize.w, targetH / sanshaSize.h)
		const scaledW = sanshaSize.w * scale
		const scaledH = sanshaSize.h * scale
		const offsetX = targetMinX + (targetW - scaledW) / 2
		const offsetY = targetMinY + (targetH - scaledH) / 2

		transformGeometry(sansha.geometry, (x, y) => {
			const nx = (x - sanshaBBox.minX) * scale + offsetX
			const ny = (y - sanshaBBox.minY) * scale + offsetY
			return [nx, ny]
		})
		return geoJson
	}
	const provinceMapContext = require.context('../map/province', false, /\.json$/)
	provinceMapContext.keys().forEach((key) => {
		const mod = provinceMapContext(key)
		const geoJson = mod && mod.default ? mod.default : mod
		const mapName = key.replace('./', '').replace('.json', '')
		if (mapName === '海南省') {
			echarts.registerMap(mapName, normalizeHainanSanshaInset(geoJson))
		} else {
			echarts.registerMap(mapName, geoJson)
		}
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
