<template>
	<div>
		<div :class="['flex','RechargeBox',isDark ? 'dark_RechargeBox' : 'light_RechargeBox']">
			<div class="flex RechargeItem box1">
				<img src="../../../assets/largeScreen/Slice430.png" class="img" v-if="isDark">
				<img src="../../../assets/largeScreen/Slice410.png" class="img" v-if="!isDark">
				<div class="textBox">
					<div :class="['label',isDark ? 'dark_label' : 'light_label']">用户消费总金额</div>
					<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{netPayMoney}}</div>
				</div>
			</div>
			<div class="flex RechargeItem box2">
				<img src="../../../assets/largeScreen/Slice431.png" class="img" v-if="isDark">
				<img src="../../../assets/largeScreen/Slice411.png" class="img" v-if="!isDark">
				<div class="textBox">
					<div :class="['label',isDark ? 'dark_label' : 'light_label']">用户退款总金额</div>
					<div :class="['val',isDark ? 'dark_val' : 'light_val']">{{icPayMoney}}</div>
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
		name: 'Recharge',
		components: {

		},
		data() {
			return {
				netPayMoney: 0,
				icPayMoney: 0
			}
		},
		watch: {

		},
		methods: {
			getCount() {
				getCount().then(res => {
					if (res.code === 200) {
						let countPayMoney = res.data.countPayMoney
						countPayMoney.forEach((item, index) => {
							if (item.type === 1) {
								this.netPayMoney = item.payMoney
							} else if (item.type === 2) {
								this.icPayMoney = item.payMoney
							}
						})
					}
				})
			},
		},
		mounted() {

		},
		created() {
			this.getCount()
		},
		destroyed() {

		}
	}
</script>

<style scoped="scoped" lang="scss">
	.dark_RechargeBox {
		border: 1px solid rgba(255, 255, 255, 0.20);
	}

	.light_RechargeBox {
		background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
		box-shadow: 5px 5px 30px 0px rgba(204, 217, 255, 0.3), -5px -5px 30px 0px rgba(229, 247, 255, 1);
		border: 1px solid #FFFFFF;
	}

	.RechargeBox {
		width: 500px;
		height: 100px;
		border-radius: 20px 20px 20px 20px;
		align-items: center;
		justify-content: space-between;

		.RechargeItem {
			.img {
				width: 45px;
				height: 45px;
			}

			.textBox {
				margin-left: 15px;

				.dark_label {
					color: #fff;
				}

				.light_label {
					color: rgba(40, 40, 40, 1);
				}

				.label {
					font-size: 20px;
					font-weight: bold;
				}

				.dark_val {
					color: #fff;
				}

				.light_val {
					color: rgba(58, 56, 113, 1);
				}

				.val {
					font-size: 20px;
					margin-top: 5px;
				}
			}
		}

		.box1 {
			margin-left: 22px;
		}

		.box2 {
			margin-right: 22px;
		}
	}
</style>
