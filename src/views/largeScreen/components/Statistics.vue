<template>
	<div>
		<div class="statisticsBox flex">
			<div :class="['statisticsItem',isDark ? 'dark_statisticsItem' : 'light_statisticsItem']">
				<div class="box1 flex">
					<div class="box1_left">
						<div :class="['label',isDark ? 'dark_label' : 'light_label']">总交易金额</div>
						<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{countData.countOrderMoney.totalMoeny}}
						</div>
						<div class="lineListBox">
							<div class="flex lineList">
								<div v-for="(item,index) in 12" :key="index"
									:class="['lineItem',isDark ? 'dark_lineItem' : 'light_lineItem']"></div>
							</div>
						</div>
					</div>
					<div class="box1_right">
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice422.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice385.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">本月交易金额</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countData.countOrderMoney.currentMonth}}
								</div>
							</div>
						</div>
						<div class="line"></div>
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice423.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice388.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">今日交易金额</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countData.countOrderMoney.currentDay}}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div :class="['statisticsItem',isDark ? 'dark_statisticsItem' : 'light_statisticsItem']">
				<div class="box1 flex">
					<div class="box1_left">
						<div :class="['label',isDark ? 'dark_label' : 'light_label']">扫码订单</div>
						<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{countOrderWx.totalOrder}}
						</div>
						<img src="../../../assets/largeScreen/Slice429.png" class="img" v-if="isDark" />
						<img src="../../../assets/largeScreen/Slice420.png" class="img" v-if="!isDark" />
					</div>
					<div class="box1_right">
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice424.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice386.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">本周订单</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countOrderWx.currentWeek}}
								</div>
							</div>
						</div>
						<div class="line"></div>
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice425.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice389.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">今日订单</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countOrderWx.currentDay}}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div :class="['statisticsItem',isDark ? 'dark_statisticsItem' : 'light_statisticsItem']">
				<div class="box1 flex">
					<div class="box1_left">
						<div :class="['label',isDark ? 'dark_label' : 'light_label']">刷卡订单</div>
						<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{countOrderCard.totalOrder}}
						</div>
						<img src="../../../assets/largeScreen/Slice4212.png" class="img" v-if="isDark" />
						<img src="../../../assets/largeScreen/Slice421.png" class="img" v-if="!isDark" />
					</div>
					<div class="box1_right">
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice426.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice387.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">本周订单</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countOrderCard.currentWeek}}
								</div>
							</div>
						</div>
						<div class="line"></div>
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice427.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice390.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">今日订单</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countOrderCard.currentDay}}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div :class="['statisticsItem',isDark ? 'dark_statisticsItem' : 'light_statisticsItem']">
				<div class="box2 flex">
					<div class="box2_left">
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice434.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice391.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">用户总数</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countData.countUser.totalUser}}人
								</div>
							</div>
						</div>
						<div class="line"></div>
						<div class="flex childBox">
							<img src="../../../assets/largeScreen/Slice433.png" class="img" v-if="isDark" />
							<img src="../../../assets/largeScreen/Slice392.png" class="img" v-if="!isDark" />
							<div class="textBox">
								<div :class="['label',isDark ? 'dark_label' : 'light_label']">今日新增用户</div>
								<div :class="['val',isDark ? 'dark_val' : 'light_val']">
									{{countData.countUser.currentDay}}人
								</div>
							</div>
						</div>
					</div>
					<img src="../../../assets/largeScreen/Slice432.png" class="box2_right" v-if="isDark" />
					<img src="../../../assets/largeScreen/Slice393.png" class="box2_right" v-if="!isDark" />
				</div>
			</div>
			<div
				:class="['statisticsItem','bgAnimationChange',isDark ? 'dark_bgAnimationChange' : 'light_bgAnimationChange'] ">
				<div class="flex box3">
					<div class="box3_left">
						<div :class="['label',isDark ? 'dark_label' : 'light_label']">进行中订单</div>
						<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{countData.orderCountByOrderStatus1}}
						</div>
					</div>
					<img src="../../../assets/largeScreen/Slice394.png" class="box3_right" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getCount
	} from '@/api/largeScreen/largeScreen.js'
	import {
		mapGetters
	} from 'vuex'
	export default {
		name: 'Statistics',
		components: {

		},
		data() {
			return {
				dateDay: null,
				dateYear: null,
				dateWeek: null,
				weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
				countOrderCard: {
					currentDay: 0,
					currentWeek: 0,
					totalOrder: 0,
				},
				countOrderWx: {
					currentDay: 0,
					currentWeek: 0,
					totalOrder: 0,
				},
				countData: {
					countOrderMoney: {
						totalMoeny: 0,
						currentMonth: 0,
						currentDay: 0
					},
					countUser: {
						totalUser: 0,
						currentDay: 0,

					},
					orderCountByOrderStatus1: 0
				}
			}
		},
		watch: {

		},
		methods: {
			getCount() {
				getCount().then(res => {
					if (res.code === 200) {
						this.countData = res.data
						let countOrder = res.data.countOrder
						countOrder.forEach((item, index) => {
							if (item.orderType === 0) {
								this.countOrderCard = item
							} else if (item.orderType === 2) {
								this.countOrderWx = item
							}
						})
					}
				})
			},
			timeFn() {
				this.timing = setInterval(() => {
					this.dateDay = this.formatTime(new Date(), 'HH: mm: ss')
					this.dateYear = this.formatTime(new Date(), 'yyyy-MM-dd')
					this.dateWeek = this.weekday[new Date().getDay()]
				}, 1000)
			},
			formatTime(time, fmt) {
				if (!time) return '';
				else {
					const date = new Date(time);
					const o = {
						'M+': date.getMonth() + 1,
						'd+': date.getDate(),
						'H+': date.getHours(),
						'm+': date.getMinutes(),
						's+': date.getSeconds(),
						'q+': Math.floor((date.getMonth() + 3) / 3),
						S: date.getMilliseconds(),
					};
					if (/(y+)/.test(fmt))
						fmt = fmt.replace(
							RegExp.$1,
							(date.getFullYear() + '').substr(4 - RegExp.$1.length)
						);
					for (const k in o) {
						if (new RegExp('(' + k + ')').test(fmt)) {
							fmt = fmt.replace(
								RegExp.$1,
								RegExp.$1.length === 1 ?
								o[k] :
								('00' + o[k]).substr(('' + o[k]).length)
							);
						}
					}
					return fmt;
				}
			}
		},
		mounted() {

		},
		created() {
			this.timeFn()
			this.getCount()
		},
		destroyed() {
			clearInterval(this.setInt)
		}
	}
</script>


<style scoped="scoped" lang="scss">
	.statisticsBox {
		margin-top: 15px;
		margin-bottom: 30px;
		align-items: center;
		justify-content: space-between;

		.dark_statisticsItem {
			border: 1px solid rgba(255, 255, 255, 0.2);
		}

		.light_statisticsItem {
			box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
			border: 1px solid #FFFFFF;
		}

		.statisticsItem {
			width: 344px;
			height: 176px;
			border-radius: 20px 20px 20px 20px;

			.box1 {
				.box1_left {
					margin-left: 15px;
					margin-top: 20px;

					.dark_label {
						color: rgba(255, 255, 255, 1);
					}

					.light_label {
						color: rgba(40, 40, 40, 1);
					}

					.label {
						font-size: 25px;
						font-weight: bold;
					}

					.dark_val {
						color: rgba(255, 255, 255, 1);
					}

					.light_val {
						color: rgba(58, 56, 113, 1);
					}

					.val {
						font-size: 30px;
						margin-top: 12px;
						font-weight: bold;
					}

					.img {
						margin-top: 14px;
						width: 128px;
						height: 45px;
					}

					.lineListBox {
						position: relative;
						height: 44px;
						margin-top: 15px;

						.lineList {
							justify-content: space-between;
							align-items: flex-end;

							position: absolute;
							bottom: 0;
							width: 100%;

							.dark_lineItem {
								background: rgba(255, 16, 112, 1);
							}

							.light_lineItem {
								background: #50DDFF;
							}

							.lineItem {
								width: 7px;
								border-radius: 3px 3px 3px 3px;
								animation: heihgtChange 3s infinite linear;
							}

							.lineItem:nth-child(1) {
								animation-delay: -0.2s;
							}

							.lineItem:nth-child(2) {
								animation-delay: -1.4s;
							}

							.lineItem:nth-child(3) {
								animation-delay: -2.6s;
							}

							.lineItem:nth-child(4) {
								animation-delay: -1.8s;
							}

							.lineItem:nth-child(5) {
								animation-delay: -1s;
							}

							.lineItem:nth-child(6) {
								animation-delay: -1.2s;
							}

							.lineItem:nth-child(7) {
								animation-delay: -2.8s;
							}

							.lineItem:nth-child(8) {
								animation-delay: -0.4s;
							}

							.lineItem:nth-child(9) {
								animation-delay: -0.6s;
							}

							.lineItem:nth-child(10) {
								animation-delay: -1.8s;
							}

							.lineItem:nth-child(11) {
								animation-delay: -1.2s;
							}

							.lineItem:nth-child(12) {
								animation-delay: -2.8s;
							}

							@keyframes heihgtChange {
								0% {
									height: 10px;
								}

								50% {
									height: 40px
								}

								100% {
									height: 10px;
								}
							}
						}
					}
				}

				.box1_right {
					margin-left: 13px;
					margin-top: 20px;

					.childBox {
						align-items: center;

						.img {
							width: 45px;
							height: 45px;
						}

						.textBox {
							margin-left: 14px;

							.dark_label {
								color: rgba(255, 255, 255, 1);
							}

							.light_label {
								color: rgba(58, 56, 113, 1);
							}

							.label {
								font-size: 15px;
								font-weight: 500;
							}

							.dark_val {
								color: rgba(255, 255, 255, 1);
							}

							.light_val {
								color: rgba(58, 56, 113, 1);
							}

							.val {
								font-size: 20px;
								font-weight: 400;
								margin-top: 5px;
							}
						}
					}

					.line {
						width: 161.5px;
						height: 1px;
						background-color: rgba(58, 56, 113, 0.20);
						margin: 19px 0;
					}
				}
			}

			.box2 {
				.box2_left {
					margin-left: 13px;
					margin-top: 20px;

					.childBox {
						align-items: center;

						.img {
							width: 45px;
							height: 45px;
						}

						.textBox {
							margin-left: 14px;

							.dark_label {
								color: rgba(255, 255, 255, 1);
							}

							.light_label {
								color: rgba(58, 56, 113, 1);
							}

							.label {
								font-size: 20px;
								font-weight: bold;
							}

							.dark_val {
								color: rgba(255, 255, 255, 1);
							}

							.light_val {
								color: rgba(58, 56, 113, 1);
							}

							.val {
								font-size: 20px;
								font-weight: 400;
								margin-top: 5px;
							}
						}
					}

					.line {
						width: 161px;
						height: 1px;
						background-color: rgba(58, 56, 113, 0.20);
						margin: 19px 0;
					}
				}

				.box2_right {
					width: 52px;
					height: 52px;
					margin-top: 62px;
					margin-left: 31px;
				}
			}

			.box3 {
				align-items: center;
				margin-left: 50px;
				margin-top: 30px;

				.box3_left {
					.dark_val {
						color: rgba(255, 16, 112, 1);
					}

					.light_val {
						color: rgba(1, 132, 255, 1);
					}

					.val {
						font-size: 45px;
						font-weight: 500;
						margin-top: 10px;
					}

					.dark_label {
						color: rgba(255, 255, 255, 1);
					}

					.light_label {
						color: rgba(58, 56, 113, 1);
					}

					.label {
						font-size: 25px;
						font-weight: bold;
					}
				}

				.box3_right {
					margin-left: 25px;
					width: 77px;
					height: 77px;
				}
			}

			.timeBox {
				font-size: 20px;
				color: rgba(58, 56, 113, 1);
				margin-left: 50px;
				margin-top: 23px;
			}
		}

		.dark_bgAnimationChange {
			background: linear-gradient(125deg, #845AA9, #7948A3, #7E164C, #7E164C);
		}

		.light_bgAnimationChange {
			background: linear-gradient(125deg, rgba(0, 187, 233, 0.2), rgba(0, 187, 233, 0.5), rgba(234, 169, 253, 0.5), rgba(115, 95, 255, 0.5));
		}

		.bgAnimationChange {
			background-size: 500%;
			animation: bgAnimation 15s linear infinite;
		}

		@keyframes bgAnimation {
			0% {
				background-position: 50% 0%;
			}

			20% {
				background-position: 100% 0%;
			}

			40% {
				background-position: 100% 50%;
			}

			60% {
				background-position: 100% 100%;
			}

			80% {
				background-position: 50% 100%;
			}

			100% {
				background-position: 0% 100%;
			}
		}
	}
</style>
