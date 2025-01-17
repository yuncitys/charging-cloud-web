<template>
	<el-row :gutter="40" class="panel-group">
		<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col " v-if="roleId <= 3">
			<div class="card-panel borRadduis15 user-panel-color" @click="handleSetLineChartData('newVisitis')">
				<div class="panel-img user-panel-img"></div>
				<div class="card-panel-description">
					<div class="card-panel-text">
						用户数量
					</div>
					<count-to :start-val="0" :end-val="chartData.totalUser ? chartData.totalUser : 0" :duration="2600"
						class="card-panel-num" :decimals="0" />
				</div>
			</div>
		</el-col>
		<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
			<div class="card-panel borRadduis15 device-panel-color" @click="handleSetLineChartData('messages')">
        <div class="device-panel-img panel-img"></div>
        <div class="card-panel-description">
					<div class="card-panel-text">
						设备总数
					</div>
					<count-to :start-val="0" :end-val="chartData.totalDevice ? chartData.totalDevice : 0"
						:duration="3000" class="card-panel-num" :decimals="0" />
				</div>
			</div>
		</el-col>
		<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
			<div class="card-panel borRadduis15 trade-panel-color" @click="handleSetLineChartData('purchases')">
        <div class="trade-panel-img panel-img"></div>
        <div class="card-panel-description">
					<div class="card-panel-text">
						交易额
					</div>
					<count-to :start-val="0" :end-val="chartData.totalMoney ? chartData.totalMoney : 0" :duration="3200"
						class="card-panel-num" :decimals="2" />
				</div>
			</div>
		</el-col>
		<el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
			<div class="card-panel borRadduis15 order-panel-color" @click="handleSetLineChartData('shoppings')">
        <div class="order-panel-img panel-img"></div>
        <div class="card-panel-description">
					<div class="card-panel-text">
						总订单
					</div>
					<count-to :start-val="0" :end-val="chartData.totalOrder ? chartData.totalOrder : 0" :duration="3600"
						class="card-panel-num" :decimals="2" />
				</div>
			</div>
		</el-col>
	</el-row>
</template>

<script>
	import CountTo from 'vue-count-to'

	export default {
		components: {
			CountTo
		},
		props: {
			chartData: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				chart: null
			}
		},
		computed:{
			roleId(){
				console.log(this.$store.getters.adminUser.roleId,"角色id")
				return this.$store.getters.adminUser.roleId
			}
		},
		methods: {
			handleSetLineChartData(type) {
				this.$emit('handleSetLineChartData', type)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.panel-group {
		margin-top: 18px;

		.card-panel-col {
			margin-bottom: 32px;
		}
    .user-panel-color{
      background-color: #15c350;
    }
    .panel-img{
      width: 80px;
      height: 80px;
      position: absolute;
      right: 0;
      bottom: 0;
    }
    .user-panel-img{
      background: url(../../../../assets/home-panel/user-panel.png) no-repeat;
      background-size: 100% 100%;
    }
    .device-panel-color{
      background-color: rgb(7, 120, 246);
    }
    .device-panel-img{
      background: url(../../../../assets/home-panel/device-panel.png) no-repeat;
      background-size: 100% 100%;
    }
    .trade-panel-color{
      background-color: rgb(2, 193, 255);
    }
    .trade-panel-img{
      background: url(../../../../assets/home-panel/trade-panel.png) no-repeat;
      background-size: 100% 100%;
    }
    .order-panel-color{
      background-color: rgb(124, 126, 255);
    }
    .order-panel-img{
      background: url(../../../../assets/home-panel/order-panel.png) no-repeat;
      background-size: 100% 100%;
    }
		.card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #ffffff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgb(149 255 189 / 5%);

			&:hover {
				.card-panel-icon-wrapper {
					color: #fff;
				}

				.icon-people {
					background: #40c9c6;
				}

				.icon-message {
					background: #36a3f7;
				}

				.icon-money {
					background: #f4516c;
				}

				.icon-shopping {
					background: #34bfa3
				}
			}

			.icon-people {
				color: #40c9c6;
			}

			.icon-message {
				color: #36a3f7;
			}

			.icon-money {
				color: #f4516c;
			}

			.icon-shopping {
				color: #34bfa3
			}

			.card-panel-icon-wrapper {
				float: left;
				margin: 14px 0 0 14px;
				padding: 16px;
				transition: all 0.38s ease-out;
				border-radius: 6px;
			}

			.card-panel-icon {
				float: left;
				font-size: 48px;
			}

			.card-panel-description {
				float: left;
				font-weight: bold;
				margin: 26px;
				margin-left: 59px;

				.card-panel-text {
					line-height: 18px;
					color: white;
					font-size: 16px;
          font-weight: bolder;
					margin-bottom: 12px;
				}

				.card-panel-num {
					font-size: 30px;
				}
			}
		}
	}

	@media (max-width:550px) {
		.card-panel-description {
			display: block;
			float: none !important;
			text-align: center;
		}

		.card-panel-icon-wrapper {
			display: none;
		}
	}
</style>
