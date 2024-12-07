<template>
	<div style="display: inline-block;">
		<el-button type="primary" size="mini" @click="onShowDialog" style="margin-left: 10px;"
			v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:findOrderInfoById')">
      详情
		</el-button>
		<!-- 订单详情 -->
		<el-dialog :visible.sync="showOrder" title="订单详情" @close="showOrder = false" :append-to-body="true">
			<el-form ref="orderInfo" :model="orderInfo" label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'订单号'" prop="orderCode">
					<el-input v-model="orderInfo.orderCode" disabled="" />
				</el-form-item>
				<el-form-item :label="'设备号'" prop="deviceCode">
					<el-input v-model="orderInfo.deviceCode" disabled="" />
				</el-form-item>
				<el-form-item :label="'充电端口'" prop="devicePort">
					<el-input v-model="orderInfo.devicePort" disabled="" />
				</el-form-item>
				<el-form-item :label="'总用电量'" prop="totalPower">
					<el-input v-model="orderInfo.totalPower" disabled="" />
				</el-form-item>
				<el-form-item :label="'分成金额'" prop="realityPayMoney">
					<el-input v-model="orderInfo.realityPayMoney" disabled="" />
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
	</div>
</template>

<script>
	import {
		findOrderInfoById,
	} from '@/api/order/scanOrderList.js'
	import {
		getRouter
	} from '@/api/user'
	export default {
		props: {
			row_data: {
				type: Object
			}
		},
		data() {
			return {
				showOrder: false,
				orderInfo: {},
				showData: {
					firstAgentProfit: true,
					secondAgentProfit: true,
					thirdAgentProfit: true,
					fourAgentProfit: true,
					fiveAgentProfit: true,
					sixAgentProfit: true,
				},
				roleId: 8
			}
		},
		mounted() {

		},
		methods: {
			onShowDialog() {
				this.onfindOrderInfoById()
			},
			onfindOrderInfoById(id) {
				let data = {
					orderId: this.row_data.id
				}
				findOrderInfoById(data).then(res => {
					if (res.code == 200) {
						let orderInfo = res.data
						if (orderInfo.proxyMoneyStatus == 0) {
							orderInfo.isProxy = '否'
						} else if (orderInfo.proxyMoneyStatus == 1) {
							orderInfo.isProxy = '是'
						}
						this.orderInfo = orderInfo
            this.showOrder = true
						console.log(this.orderInfo)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {

		},

	}
</script>

<style>

</style>
