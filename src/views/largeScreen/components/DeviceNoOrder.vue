<template>
	<div>
		<div :class="['DeviceNoOrderBox',isDark ? 'dark_DeviceNoOrderBox' : 'light_DeviceNoOrderBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				15天内设备无订单列表
			</div>
			<div class="tableBox">
				<vue-seamless-scroll :data="list" class="seamless-warp">
					<div class="tableList flex" v-for="(item,index) in list" :key="index">
						<div :class="['deviceCode','textLine1',isDark ? 'dark_deviceCode' : 'light_deviceCode']">设备号
							<span>{{item.deviceCode}}</span>
						</div>
						<div :class="['time','textLine1',isDark ? 'dark_time' : 'light_time'] ">最后使用日期
							{{item.lastUseTime}}
						</div>
					</div>
				</vue-seamless-scroll>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getOrderByGe15Day
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'DeviceNoOrder',
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
			getOrderByGe15Day() {
				getOrderByGe15Day().then(res => {
					if (res.code === 200) {
						this.list = res.data
					}
				})
			}
		},
		mounted() {

		},
		created() {
			this.getOrderByGe15Day()
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.dark_DeviceNoOrderBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_DeviceNoOrderBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.DeviceNoOrderBox {
		width: 500px;
		height: 200px;
		border-radius: 20px 20px 20px 20px;
		margin-top: 15px;

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
				justify-content: space-between;
				height: 40px;

				.dark_deviceCode {
					color: #fff;

					span {
						color: #fff;
					}
				}

				.light_deviceCode {
					color: rgba(58, 56, 113, 1);

					span {
						color: rgba(40, 40, 40, 0.50);
					}
				}

				.deviceCode {
					font-size: 15px;
				}

				.dark_time {
					color: #fff;
				}

				.light_time {
					color: rgba(58, 56, 113, 0.50);
				}

				.time {
					font-size: 15px;
				}
			}
		}
	}
</style>