<template>
	<div>
		<Echart id="centreLeft2Chart" ref="centreLeft2ChartRef" :options="options" style="width: 100%;height: 100%">
		</Echart>
	</div>
</template>

<script>
	import Echart from '@/common/echart';
	export default {
		data() {
			return {
				options: {},
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
			mapName: {
				type: String,
				default: '全国'
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
			cdata: {
				handler(newData) {
					this.updateOptions(newData);
				},
				immediate: true,
				deep: true,
			},
			mapName() {
				this.updateOptions(this.cdata);
			}
		},
		methods: {
			updateOptions(newData) {
				if (this.isDark) {
					this.options = {
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
							// 如果需要自定义 tooltip样式，需要使用formatter
							/*
							  formatter: params => {
							    return `<div style=""> ... </div>`
							  }
							*/
						},
						visualMap: {
							min: 0,
							max: 10,
							show: false,
							seriesIndex: 0,
							// 颜色
							inRange: {
								color: ['rgba(147, 168, 255, 1)', 'rgba(48, 78, 203, 1)'],
							},
						},
						// 底部背景
						geo: {
							show: true,
							aspectScale: 0.85, //长宽比
							zoom: 1.2,
							top: '10%',
							left: '16%',
							map: this.mapName,
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
						series: [{
							name: '设备数',
							type: 'map',
							aspectScale: 0.85, //长宽比
							zoom: 1.2,
							mapType: this.mapName, // 自定义扩展图表类型
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
						}, ],
					};
				} else {
					this.options = {
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
							// 如果需要自定义 tooltip样式，需要使用formatter
							/*
							  formatter: params => {
							    return `<div style=""> ... </div>`
							  }
							*/
						},
						visualMap: {
							min: 0,
							max: 10,
							show: false,
							seriesIndex: 0,
							// 颜色
							inRange: {
								color: ['rgba(41,166,206, .5)', 'rgba(69,117,245, .9)'],
							},
						},
						// 底部背景
						geo: {
							show: true,
							aspectScale: 0.85, //长宽比
							zoom: 1.2,
							top: '10%',
							left: '16%',
							map: this.mapName,
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
						series: [{
							name: '设备数',
							type: 'map',
							aspectScale: 0.85, //长宽比
							zoom: 1.2,
							mapType: this.mapName, // 自定义扩展图表类型
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
						}, ],
					};
				}
				// 重新选择区域
				this.handleMapRandomSelect();
			},
			/**
			 * 开启定时器：用于随机高亮地图区域并展示提示
			 */
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
			/**
			 * 重新随机选中地图区域：取消上次选中并随机选择新区域
			 */
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
			/**
			 * 绑定地图交互事件并启动随机高亮：
			 * - 鼠标移入时高亮当前区域并停止随机选择
			 * - 鼠标移出时恢复随机选择
			 * - 点击时向外部抛出事件（map-click）供父组件处理下钻
			 */
			handleMapRandomSelect() {
				this.$nextTick(() => {
					try {
						const map = this.$refs.centreLeft2ChartRef.chart;
						const _self = this;
						setTimeout(() => {
							_self.reSelectMapRandomArea();
						}, 0);
						map.off('click');
						map.on('click', function(params) {
							_self.$emit('map-click', params);
						});
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
