<template>
	<div>
		<div :class="['RealOrderBox',isDark ? 'dark_RealOrderBox' : 'light_RealOrderBox']">
			<div :class="['TipBox',isDark? 'dark_TipBox' : 'light_TipBox']">
				实时订单列表
			</div>
			<div class="tableBox">
				<div class="tableHead flex">
					<div :class="['headItem',isDark ? 'dark_fontColor' : 'light_fontColor']">订单号</div>
					<div :class="['headItem',isDark ? 'dark_fontColor' : 'light_fontColor']">充电站点</div>
          <div :class="['headItem',isDark ? 'dark_fontColor' : 'light_fontColor']">充电时长</div>
					<div :class="['headItem',isDark ? 'dark_fontColor' : 'light_fontColor']">开始时间</div>
				</div>
				<vue-seamless-scroll :data="list" class="seamless-warp">
					<div class="tableList flex" v-for="(item,index) in list" :key="index">
						<div :class="['tableItem',isDark ? 'dark_fontColor' : 'light_fontColor']">
              {{item.orderCode}}
						</div>
						<div :class="['tableItem',isDark ? 'dark_fontColor' : 'light_fontColor']">
							{{item.networkName}}
						</div>
            <div :class="['tableItem',isDark ? 'dark_fontColor' : 'light_fontColor']">
            	{{item.chargingDuration}}分钟
            </div>
						<div :class="['tableItem',isDark ? 'dark_fontColor' : 'light_fontColor']">
              {{item.startTime}}
						</div>
					</div>
				</vue-seamless-scroll>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getOrderList
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'RealOrder',
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
			getOrderList() {
				getOrderList().then(res => {
					if (res.code === 200) {
						this.list = res.data
					}
				})
			}
		},
		mounted() {

		},
		created() {
			this.getOrderList()
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


	.dark_RealOrderBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_RealOrderBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.RealOrderBox {
		width: 500px;
		height: 330px;
    margin: 15px 0;
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
			width: 470px;
			margin: 0 auto;
			margin-top: 10px;

			.tableHead {
				width: 100%;
				align-items: center;
				margin-bottom: 10px;

				.headItem {
					width: 33%;
					text-align: center;
					font-size: 14px;
				}
			}

			.seamless-warp {
				// height: 100px;
        height: auto;
				overflow: hidden;
			}

			.tableList {
				width: 470px;
				align-items: center;
				justify-content: space-between;
				height: 40px;

				.tableItem {
					width: 33%;
					text-align: center;
					font-size: 12px;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
				}
			}
		}
	}
</style>
