<template>
	<div class="map-chart-wrapper">
		<div class="map-chart-header">
			<span
				class="map-chart-breadcrumb-item"
				:class="{ 'is-clickable': currentLevel !== 'country' }"
				@click="handleBreadcrumbClick(0)"
			>
				全国
			</span>
			<span v-if="currentLevel === 'province' || currentLevel === 'city'" class="map-chart-breadcrumb-separator">/</span>
			<span
				v-if="currentLevel === 'province' || currentLevel === 'city'"
				class="map-chart-breadcrumb-item"
				:class="{ 'is-clickable': currentLevel === 'city' }"
				@click="handleBreadcrumbClick(1)"
			>
				{{ parentRegionName }}
			</span>
		</div>
		<div class="map-chart-body">
			<Echart
				id="centreLeft2Chart"
				ref="centreLeft2ChartRef"
				:options="options"
				style="width: 100%;height: 100%"
			/>
		</div>
	</div>
</template>

<script>
	import Echart from '@/common/echart';
	export default {
			data() {
				return {
					options: {},
					currentMapName: '全国',
					currentLevel: 'country',
					parentRegionName: '全国',
					enableHeatmap: true,
					intervalId: null,
					preSelectMapIndex: 0,
				};
			},
		components: {
			Echart,
		},
		props: {
			cdata: {
				type: Array,
				default: () => [],
			},
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
			cdata: {
				handler(newData) {
						this.currentMapName = '全国';
						this.currentLevel = 'country';
						this.parentRegionName = '全国';
						this.options = this.buildOptionsByTheme(newData);
						this.handleMapRandomSelect();
				},
				immediate: true,
				deep: true,
			},
			},
			methods: {
				/**
				 * 面包屑点击处理，支持从头部返回上级
				 */
				handleBreadcrumbClick(levelIndex) {
					if (levelIndex === 0) {
						if (this.currentLevel !== 'country') {
							this.resetMap();
						}
					} else if (levelIndex === 1 && this.currentLevel === 'city') {
						this.goBackLevel();
					}
				},
				/**
				 * 根据当前主题构建地图与热力图配置
				 */
				buildOptionsByTheme(newData) {
					if (this.isDark) {
						return this.buildDarkOptions(newData);
					}
					return this.buildLightOptions(newData);
				},
				/**
				 * 构建深色主题下的地图与热力图配置
				 */
				buildDarkOptions(newData) {
					const heatmapData = this.buildHeatmapData(this.currentMapName, newData);
					return {
						showLegendSymbol: true,
						tooltip: {
							trigger: 'item',
							textStyle: {
								fontSize: 14,
								lineHeight: 22,
							},
							position: point => {
								return [point[0] + 50, point[1] - 20];
							},
						},
						visualMap: {
							min: 0,
							max: 10,
							show: false,
							seriesIndex: 0,
							inRange: {
								color: ['rgba(147, 168, 255, 1)', 'rgba(48, 78, 203, 1)'],
							},
						},
						geo: {
							show: true,
							aspectScale: 0.85,
							zoom: 1.2,
							top: '10%',
							left: '16%',
							map: this.currentMapName,
							roam: false,
							itemStyle: {
								normal: {
									areaColor: 'rgba(0,0,0,0)',
									shadowColor: 'rgba(7,114,204, .8)',
									shadowOffsetX: 5,
									shadowOffsetY: 5,
								},
								emphasis: {
									areaColor: 'rgba(48, 78, 203, 1)',
								},
							},
						},
						series: [
							{
								name: '设备数',
								type: 'map',
								aspectScale: 0.85,
								zoom: 1.2,
								mapType: this.currentMapName,
								top: '10%',
								left: '16%',
								itemStyle: {
									normal: {
										color: 'red',
										areaColor: 'rgba(19,54,162, .5)',
										borderColor: 'rgba(147, 168, 255, 1)',
										borderWidth: 1,
										shadowBlur: 7,
										shadowColor: 'rgba(147, 168, 255, 1)',
									},
									emphasis: {
										areaColor: '#4f7fff',
										borderColor: 'rgba(48, 78, 203, 1)',
										borderWidth: 2,
										shadowBlur: 10,
										shadowColor: 'rgba(48, 78, 203, 1)',
									},
								},
								label: {
									formatter: params => `${params.name}`,
									show: true,
									position: 'insideRight',
									textStyle: {
										fontSize: 14,
										color: '#efefef',
									},
									emphasis: {
										textStyle: {
											color: '#fff',
										},
									},
								},
								data: newData,
							},
							this.enableHeatmap ? {
								name: '设备热度',
								type: 'heatmap',
								coordinateSystem: 'geo',
								data: heatmapData,
								pointSize: 10,
								blurSize: 20,
							} : null,
						].filter(Boolean),
					};
				},
				/**
				 * 构建浅色主题下的地图与热力图配置
				 */
				buildLightOptions(newData) {
					const heatmapData = this.buildHeatmapData(this.currentMapName, newData);
					return {
						showLegendSymbol: true,
						tooltip: {
							trigger: 'item',
							textStyle: {
								fontSize: 14,
								lineHeight: 22,
							},
							position: point => {
								return [point[0] + 50, point[1] - 20];
							},
						},
						visualMap: {
							min: 0,
							max: 10,
							show: false,
							seriesIndex: 0,
							inRange: {
								color: ['rgba(41,166,206, .5)', 'rgba(69,117,245, .9)'],
							},
						},
						geo: {
							show: true,
							aspectScale: 0.85,
							zoom: 1.2,
							top: '10%',
							left: '16%',
							map: this.currentMapName,
							roam: false,
							itemStyle: {
								normal: {
									areaColor: 'rgba(0,0,0,0)',
									shadowColor: 'rgba(7,114,204, .8)',
									shadowOffsetX: 5,
									shadowOffsetY: 5,
								},
								emphasis: {
									areaColor: '#00aeef',
								},
							},
						},
						series: [
							{
								name: '设备数',
								type: 'map',
								aspectScale: 0.85,
								zoom: 1.2,
								mapType: this.currentMapName,
								top: '10%',
								left: '16%',
								itemStyle: {
									normal: {
										color: 'red',
										areaColor: 'rgba(19,54,162, .5)',
										borderColor: 'rgba(0,242,252,.3)',
										borderWidth: 1,
										shadowBlur: 7,
										shadowColor: '#00f2fc',
									},
									emphasis: {
										areaColor: '#4f7fff',
										borderColor: 'rgba(0,242,252,.6)',
										borderWidth: 2,
										shadowBlur: 10,
										shadowColor: '#00f2fc',
									},
								},
								label: {
									formatter: params => `${params.name}`,
									show: true,
									position: 'insideRight',
									textStyle: {
										fontSize: 14,
										color: '#efefef',
									},
									emphasis: {
										textStyle: {
											color: '#fff',
										},
									},
								},
								data: newData,
							},
							this.enableHeatmap ? {
								name: '设备热度',
								type: 'heatmap',
								coordinateSystem: 'geo',
								data: heatmapData,
								pointSize: 10,
								blurSize: 20,
							} : null,
						].filter(Boolean),
					};
				},
				/**
				 * 构建热力图数据，使用地图要素中心点
				 */
				buildHeatmapData(mapName, regionData) {
					if (!this.enableHeatmap || !this.$echarts || !this.$echarts.getMap) {
						return [];
					}
					const mapInfo = this.$echarts.getMap(mapName);
					if (!mapInfo || !mapInfo.geoJson || !mapInfo.geoJson.features) {
						return [];
					}
					const valueMap = {};
					(regionData || []).forEach(item => {
						if (item && item.name != null && typeof item.value === 'number') {
							valueMap[item.name] = item.value;
						}
					});
					return mapInfo.geoJson.features.map(feature => {
						const props = feature.properties || {};
						const name = props.name;
						const center = props.cp || props.center;
						if (!center || center.length < 2) {
							return null;
						}
						const value = typeof valueMap[name] === 'number' ? valueMap[name] : 0;
						return [center[0], center[1], value];
					}).filter(item => Array.isArray(item));
				},
				/**
				 * 处理地图点击事件，实现省市区下钻
				 */
				handleMapClick(params) {
					if (!params || !params.name) {
						return;
					}
					if (this.currentLevel === 'country') {
						const mapName = this.getProvinceMapName(params.name);
						if (!mapName) {
							return;
						}
						this.currentLevel = 'province';
						this.currentMapName = mapName;
						this.parentRegionName = params.name;
						const provinceValue = this.getRegionValue(params.name);
						const subData = this.buildSubRegionData(mapName, provinceValue);
						this.options = this.buildOptionsByTheme(subData);
					} else if (this.currentLevel === 'province') {
						this.currentLevel = 'city';
						const parentValue = this.getRegionValue(this.parentRegionName);
						const subData = this.buildSubRegionData(this.currentMapName, parentValue);
						this.options = this.buildOptionsByTheme(subData);
					}
				},
				/**
				 * 根据省名称获取对应的地图注册名称
				 */
				getProvinceMapName(regionName) {
					const map = {
						'福建省': '福建',
						'山东省': '山东',
					};
					return map[regionName] || null;
				},
				/**
				 * 获取当前数据中指定区域的值
				 */
				getRegionValue(regionName) {
					const target = (this.cdata || []).find(item => item.name === regionName);
					if (!target) {
						return 0;
					}
					return typeof target.value === 'number' ? target.value : 0;
				},
				/**
				 * 基于子区域特征构建下钻后的数据
				 */
				buildSubRegionData(mapName, parentValue) {
					if (!this.$echarts || !this.$echarts.getMap) {
						return [];
					}
					const mapInfo = this.$echarts.getMap(mapName);
					if (!mapInfo || !mapInfo.geoJson || !mapInfo.geoJson.features) {
						return [];
					}
					const features = mapInfo.geoJson.features;
					if (!features.length) {
						return [];
					}
					const base = parentValue && parentValue > 0 ? parentValue : 1;
					const avg = Math.max(1, Math.round(base / features.length));
					return features.map(feature => {
						const props = feature.properties || {};
						return {
							name: props.name,
							value: avg,
						};
					});
				},
				/**
				 * 重置地图到全国视图
				 */
				resetMap() {
					this.currentMapName = '全国';
					this.currentLevel = 'country';
					this.parentRegionName = '全国';
					this.options = this.buildOptionsByTheme(this.cdata || []);
				},
				goBackLevel() {
					if (this.currentLevel === 'city') {
						this.currentLevel = 'province';
						const parentValue = this.getRegionValue(this.parentRegionName);
						const subData = this.buildSubRegionData(this.currentMapName, parentValue);
						this.options = this.buildOptionsByTheme(subData);
					} else if (this.currentLevel === 'province') {
						this.resetMap();
					}
				},
			// 开启定时器
			startInterval() {
				const _self = this;
				// 应通过接口获取配置时间，暂时写死5s
				const time = 2000;
				if (this.intervalId !== null) {
					clearInterval(this.intervalId);
				}
				this.intervalId = setInterval(() => {
					_self.reSelectMapRandomArea();
				}, time);
			},
			// 重新随机选中地图区域
			reSelectMapRandomArea() {
				const length = this.cdata.length;
				this.$nextTick(() => {
					try {
						const map = this.$refs.centreLeft2ChartRef.chart;
						let index = Math.floor(Math.random() * length);
						while (index === this.preSelectMapIndex || index >= length) {
							index = Math.floor(Math.random() * length);
						}
						map.dispatchAction({
							type: 'mapUnSelect',
							seriesIndex: 0,
							dataIndex: this.preSelectMapIndex,
						});
						map.dispatchAction({
							type: 'showTip',
							seriesIndex: 0,
							dataIndex: index,
						});
						map.dispatchAction({
							type: 'mapSelect',
							seriesIndex: 0,
							dataIndex: index,
						});
						this.preSelectMapIndex = index;
					} catch (error) {
						console.log(error)
					}
				});
			},
			handleMapRandomSelect() {
				this.$nextTick(() => {
					try {
						const map = this.$refs.centreLeft2ChartRef.chart;
						const _self = this;
						setTimeout(() => {
							_self.reSelectMapRandomArea();
						}, 0);
						// 移入区域，清除定时器、取消之前选中并选中当前
						map.on('mouseover', function(params) {
							clearInterval(_self.intervalId);
							map.dispatchAction({
								type: 'mapUnSelect',
								seriesIndex: 0,
								dataIndex: _self.preSelectMapIndex,
							});
							map.dispatchAction({
								type: 'mapSelect',
								seriesIndex: 0,
								dataIndex: params.dataIndex,
							});
							_self.preSelectMapIndex = params.dataIndex;
						});
						// 移出区域重新随机选中地图区域，并开启定时器
						map.on('globalout', function() {
							_self.reSelectMapRandomArea();
							_self.startInterval();
						});
								map.on('click', function(params) {
									_self.handleMapClick(params);
								});
								map.on('dblclick', function() {
									_self.goBackLevel();
								});
						this.startInterval();
					} catch (error) {
						console.log(error)
					}
				});
			},
		},
		beforeDestroy() {
			clearInterval(this.intervalId)
		}
	};
</script>

<style scoped>
.map-chart-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.map-chart-header {
	flex: 0 0 auto;
	padding: 4px 8px;
	font-size: 12px;
	color: #cfd8ff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.map-chart-breadcrumb-item {
	cursor: default;
}

.map-chart-breadcrumb-item.is-clickable {
	cursor: pointer;
	color: #4f7fff;
}

.map-chart-breadcrumb-item.is-clickable:hover {
	text-decoration: underline;
}

.map-chart-breadcrumb-separator {
	margin: 0 4px;
}

.map-chart-body {
	flex: 1 1 auto;
	width: 100%;
	height: calc(100% - 24px);
}
</style>
