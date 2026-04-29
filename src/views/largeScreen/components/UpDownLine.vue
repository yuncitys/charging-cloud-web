<template>
	<div>
		<div :class="['UpDownLineBox',isDark? 'dark_UpDownLineBox' : 'light_UpDownLineBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				设备告警日志
			</div>
			<div class="tableBox">
				<vue-seamless-scroll :data="list" :class-option="classOption" class="seamless-warp">
					<div class="tableList flex" v-for="(item,index) in list" :key="index">
						<div :class="['deviceCode','textLine1',isDark? 'dark_fontColor' : 'light_fontColor']">设备号
							<span :class="[isDark? 'dark_fontColor' : 'light_fontColor']" :title="item.deviceCode">{{item.deviceCode}}</span>
						</div>
						<div :class="['time','textLine1',isDark? 'dark_fontColor' : 'light_fontColor']">
							{{item.createTime}}
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
		getDeviceLogList
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'UpDownLine',
		components: {

		},
		data() {
			return {
				list: [],
				classOption: {
					step: 0.35,
					hoverStop: true,
					openWatch: true,
					direction: 1,
					singleHeight: 40,
					waitTime: 2500,
					limitMoveNum: 3,
				},
			}
		},
		watch: {

		},
		methods: {
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
			this.getDeviceLogList()
		},
		destroyed() {

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

	.dark_UpDownLineBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_UpDownLineBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.UpDownLineBox {
		width: 500px;
		height: 200px;
		border-radius: 20px 20px 20px 20px;


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
				height: 40px;

				.deviceCode {
					font-size: 15px;
					color: rgba(58, 56, 113, 1);
					max-width: 200px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;

					span {
						color: rgba(40, 40, 40, 0.50);
						display: inline-block;
						max-width: 160px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						vertical-align: bottom;
					}
				}

				.time {
					font-size: 15px;
					color: rgba(58, 56, 113, 1);
					margin-left: 30px;

					.alarmTag {
						display: inline-block;
						margin-left: 15px;
						max-width: 100px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						vertical-align: bottom;
					}
				}
			}
		}
	}
</style>
