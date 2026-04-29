<template>
	<div>
		<div :class="['DeviceBox',isDark? 'dark_DeviceBox' : 'light_DeviceBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				设备数据
			</div>
			<div class="statisticsBox flex">
				<div class="statisticsItem flex">
					<img src="../../../assets/largeScreen/Slice435.png" class="img" v-if="isDark" />
					<img src="../../../assets/largeScreen/Slice398.png" class="img" v-if="!isDark" />
					<div class="textBox">
						<div :class="['label',isDark? 'dark_fontColor' : 'light_fontColor']">电站数量</div>
						<div :class="['val',isDark? 'dark_fontColor' : 'light_fontColor']">
              				{{countDevice.chargingStationCount}}
						</div>
					</div>
				</div>
				<div class="statisticsItem flex">
					<img src="../../../assets/largeScreen/Slice436.png" class="img" v-if="isDark" />
					<img src="../../../assets/largeScreen/Slice397.png" class="img" v-if="!isDark" />
					<div class="textBox">
						<div :class="['label',isDark? 'dark_fontColor' : 'light_fontColor']">在线终端数量</div>
						<div :class="['val',isDark? 'dark_fontColor' : 'light_fontColor']">
							{{countDevice.onLineCount}}
						</div>
					</div>
				</div>
				<div class="statisticsItem flex">
					<img src="../../../assets/largeScreen/Slice437.png" class="img" v-if="isDark" />
					<img src="../../../assets/largeScreen/Slice396.png" class="img" v-if="!isDark" />
					<div class="textBox">
						<div :class="['label',isDark? 'dark_fontColor' : 'light_fontColor']">离线终端数量</div>
						<div :class="['val',isDark? 'dark_fontColor' : 'light_fontColor']">
              				{{countDevice.unLineCount}}
						</div>
					</div>
				</div>
			</div>
			<div class="tableBox">
				<div :class="['title',isDark ? 'dark_fontColor' : 'light_fontColor']">设备告警日志</div>
				<vue-seamless-scroll :data="list" :class-option="classOption" class="seamless-warp">
					<div class="tableList flex" v-for="(item,index) in list" :key="index">
						<div :class="['deviceCode','textLine1',isDark? 'dark_fontColor' : 'light_fontColor'] ">
							<span class="deviceLabel">设备号</span>
							<span :class="['codeValue',isDark? 'dark_fontColor' : 'light_fontColor']" :title="item.deviceCode">
								{{item.deviceCode}}
							</span>
						</div>
						<div :class="['time','textLine1',isDark? 'dark_fontColor' : 'light_fontColor']">
							<span class="timeText">{{item.createTime}}</span>
							<span class="alarmTag" :style="{color: alarmColor(item)}" :title="alarmText(item)">{{alarmText(item)}}</span>
						</div>
					</div>
				</vue-seamless-scroll>
			</div>
		</div>
	</div>
</template>

<script>
	import {
    getDeviceCount,
		getDeviceLogList,
		getLargeScreenDataMode
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'Device',
		components: {

		},
		data() {
			return {
				list: [],
				refreshTimer: null,
				classOption: {
					step: 0.35,
					hoverStop: true,
					openWatch: true,
					direction: 1,
					singleHeight: 40,
					waitTime: 2500,
					limitMoveNum: 4,
				},
				countDevice: {
					onLineCount: 0,
					unLineCount: 0,
          			chargingStationCount: 0,
				}
			}
		},
		watch: {

		},
		methods: {
			isMockMode() {
				return getLargeScreenDataMode() === 'mock'
			},
			alarmText(item) {
				const ai = item ? item.alarmItem : null
				if (ai && typeof ai === 'object') {
					return ai.name || ai.alarmName || ai.title || ai.typeName || ''
				}
				if (typeof ai === 'string') return ai
				return ''
			},
			alarmColor(item) {
				const text = this.alarmText(item)
				if (text === '设备上线') return this.isDark ? 'rgba(69, 102, 246, 1)' : 'rgba(72, 219, 195, 1)'
				if (text === '设备下线') return this.isDark ? 'rgba(255, 16, 112, 1)' : 'rgba(255, 114, 132, 1)'
				if (text === '电桩故障' || text === '温度超高') return this.isDark ? 'rgba(255, 173, 51, 1)' : 'rgba(255, 140, 0, 1)'
				if (text === '电压电流异常' || text === '实时数据异常' || text === 'SOC异常') return this.isDark ? 'rgba(255, 114, 132, 1)' : 'rgba(255, 85, 105, 1)'
				if (text === '充电阶段BMS中止' || text === '充电阶段充电机中止') return this.isDark ? 'rgba(255, 173, 51, 1)' : 'rgba(255, 140, 0, 1)'
				return this.isDark ? 'rgba(255, 173, 51, 1)' : 'rgba(255, 140, 0, 1)'
			},
			getDeviceCount(){
				getDeviceCount().then(res => {
					if (res.code === 200) {
						this.countDevice = res.data
					}
				})
			},
			getDeviceLogList() {
				getDeviceLogList().then(res => {
					if (res.code === 200) {
						const arr = Array.isArray(res.data) ? res.data : []
						this.list = arr.map((it) => {
							const alarmItem = it && it.alarmItem != null ? it.alarmItem : (it && it.Type === 1 ? { name: '设备上线' } : it && it.Type === 0 ? { name: '设备下线' } : null)
							return {
								...it,
								alarmItem,
							}
						})
					}
				})
			}
		},
		mounted() {

		},
		created() {
			this.getDeviceCount()
			this.getDeviceLogList()
			if (this.isMockMode()) {
				this.refreshTimer = setInterval(() => {
					this.getDeviceCount()
					this.getDeviceLogList()
				}, 20000)
			}
		},
		destroyed() {
			if (this.refreshTimer) clearInterval(this.refreshTimer)
		}
	}
</script>

<style scoped="scoped" lang="scss">
	.dark_fontColor {
		color: #fff !important;
	}

	.light_fontColor {
		color: rgba(58, 56, 113, 1) !important;
	}

	.dark_DeviceBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_DeviceBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.DeviceBox {
		width: 500px;
		height: 430px;
		border-radius: 20px 20px 20px 20px;
		margin: 15px 0;
		display: flex;
		flex-direction: column;

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

		.statisticsBox {
			align-items: center;
			justify-content: space-around;
			border-bottom: 1px solid rgba(40, 40, 40, 0.10);
			padding-bottom: 10px;

			.statisticsItem {
				align-items: center;

				.img {
					width: 30px;
					height: 30px;
				}

				.textBox {
					margin-left: 5px;

					.label {
						font-size: 15px;
						font-weight: 500;
					}

					.val {
						font-size: 17px;
						font-weight: 500;
						margin-top: 5px;
					}
				}
			}
		}

		.tableBox {
			width: 470px;
			margin: 0 auto;
			margin-top: 10px;
			flex: 1;
			display: flex;
			flex-direction: column;

			.title {
				font-size: 15px;
				font-weight: bold;
				margin-bottom: 10px;
			}

			.seamless-warp {
				flex: 1;
				height: auto;
				min-height: 0;
				overflow: hidden;
			}

			.tableList {
				width: 470px;
				align-items: center;
				justify-content: flex-start;
				height: 40px;

				.deviceCode {
					flex: 0 0 215px;
					font-size: 14px;
					color: rgba(40, 40, 40, 1);
					display: flex;
					align-items: center;
					overflow: hidden;
					padding-right: 10px;

					.deviceLabel {
						flex: 0 0 42px;
					}
				}

				.codeValue {
					flex: 1 1 auto;
					min-width: 0;
					display: inline-block;
					margin-left: 10px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.tip {
					width: 50%;
					font-size: 14px;
					color: rgba(255, 114, 132, 1);
				}

				.time {
					flex: 1 1 auto;
					font-size: 14px;
					display: flex;
					align-items: center;
					justify-content: flex-start;
					overflow: hidden;
					white-space: nowrap;
					min-width: 0;
				}

				.timeText {
					flex: 0 0 150px;
					text-align: left;
				}

				.alarmTag {
					display: inline-block;
					flex: 1 1 auto;
					min-width: 0;
					text-align: left;
					margin-left: 10px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					vertical-align: bottom;
				}
			}
		}
	}
</style>
