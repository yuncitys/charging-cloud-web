<template>
	<div>
		<div :class="['UpDownLineBox',isDark? 'dark_UpDownLineBox' : 'light_UpDownLineBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				设备上下线通知
			</div>
			<div class="tableBox">
				<vue-seamless-scroll :data="list" class="seamless-warp">
					<div class="tableList flex" v-for="(item,index) in list" :key="index">
						<div :class="['deviceCode','textLine1',isDark? 'dark_fontColor' : 'light_fontColor']">设备号
							<span :class="[isDark? 'dark_fontColor' : 'light_fontColor']">{{item.deviceCode}}</span>
						</div>
						<div :class="['time','textLine1',isDark? 'dark_fontColor' : 'light_fontColor']">
							{{item.createTime}}
							<span :style="{color:isDark ? 'rgba(69, 102, 246, 1)' : 'rgba(72, 219, 195, 1)'}"
								v-if="item.Type === 1">上线</span>
							<span :style="{color:isDark ? 'rgba(255, 16, 112, 1)' : 'rgba(255, 114, 132, 1)'}"
								v-if="item.Type === 0">离线</span>
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
			}
		},
		watch: {

		},
		methods: {
			getDeviceLogList() {
				getDeviceLogList().then(res => {
					if (res.code === 200) {
						this.list = res.data
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

					span {
						color: rgba(40, 40, 40, 0.50);
					}
				}

				.time {
					font-size: 15px;
					color: rgba(58, 56, 113, 1);
					margin-left: 30px;

					span {
						color: rgba(72, 219, 195, 1);
						display: inline-block;
						margin-left: 15px;
					}
				}
			}
		}
	}
</style>