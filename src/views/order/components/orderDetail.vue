<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="onShowDialog" style="margin-left: 10px;"
			v-if="btnAuthen.permsVerifAuthention(':sys:orderInfo:findOrderInfoById')" size="mini">详情
		</el-button>
		<!-- 订单详情 -->
		<el-dialog :visible.sync="showOrder" title="订单详情" @close="showOrder = false" :append-to-body="true">
			<el-form ref="orderInfo" :model="orderInfo" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
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
        <!-- <el-form-item :label="'一级分润'" prop="firstAgentProfit">
        	<el-input v-model="orderInfo.firstAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'二级分润'">
        	<el-input v-model="orderInfo.secondAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'三级分润'" prop="thirdAgentProfit">
        	<el-input v-model="orderInfo.thirdAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'四级分润'" prop="fourAgentProfit">
        	<el-input v-model="orderInfo.fourAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'五级分润'" prop="fiveAgentProfit">
        	<el-input v-model="orderInfo.fiveAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'六级分润'" prop="sixAgentProfit">
        	<el-input v-model="orderInfo.sixAgentProfit" disabled="" />
        </el-form-item>
        <el-form-item :label="'平台分润'" prop="adminProfit">
        	<el-input v-model="orderInfo.adminProfit" disabled="" />
        </el-form-item> -->
        <el-form-item :label="'是否分成'" prop="isProxy">
        	<el-input v-model="orderInfo.isProxy" disabled="" />
        </el-form-item>
				<el-form-item :label="roleId <= 3 ? '一级分润' : '分润'" prop="firstAgentProfit"
					v-if="showData.firstAgentProfit">
					<el-input v-model="orderInfo.firstAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="roleId <= 3 ? '二级分润' : '分润'" prop="secondAgentProfit"
					v-if="showData.secondAgentProfit">
					<el-input v-model="orderInfo.secondAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="roleId <= 3 ? '三级分润' : '分润'" prop="thirdAgentProfit"
					v-if="showData.thirdAgentProfit">
					<el-input v-model="orderInfo.thirdAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="roleId <= 3 ? '四级分润' : '分润'" prop="fourAgentProfit"
					v-if="showData.fourAgentProfit">
					<el-input v-model="orderInfo.fourAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="roleId <= 3 ? '五级分润' : '分润'" prop="fiveAgentProfit"
					v-if="showData.fiveAgentProfit">
					<el-input v-model="orderInfo.fiveAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="roleId <= 3 ? '六级分润' : '分润'" prop="sixAgentProfit" v-if="showData.sixAgentProfit">
					<el-input v-model="orderInfo.sixAgentProfit" disabled="" />
				</el-form-item>
				<el-form-item :label="'平台分润'" prop="adminProfit" v-if="roleId <= 3">
					<el-input v-model="orderInfo.adminProfit" disabled="" />
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
				this.getRouters()
			},
			getRouters() {
				getRouter().then(res => {
					console.log(res)
					let roleId = res.data.adminUser.roleId
					this.roleId = roleId
					if (roleId <= 3) {
						this.showData = {
							firstAgentProfit: true,
							secondAgentProfit: true,
							thirdAgentProfit: true,
							fourAgentProfit: true,
							fiveAgentProfit: true,
							sixAgentProfit: true,
						}
					} else if (roleId === 4) {
						this.showData = {
							firstAgentProfit: false,
							secondAgentProfit: true,
							thirdAgentProfit: false,
							fourAgentProfit: false,
							fiveAgentProfit: false,
							sixAgentProfit: false,
						}
					} else if (roleId === 5) {
						this.showData = {
							firstAgentProfit: false,
							secondAgentProfit: false,
							thirdAgentProfit: true,
							fourAgentProfit: false,
							fiveAgentProfit: false,
							sixAgentProfit: false,
						}
					} else if (roleId === 6) {
						this.showData = {
							firstAgentProfit: false,
							secondAgentProfit: false,
							thirdAgentProfit: false,
							fourAgentProfit: true,
							fiveAgentProfit: false,
							sixAgentProfit: false,
						}
					} else if (roleId === 7) {
						this.showData = {
							firstAgentProfit: false,
							secondAgentProfit: false,
							thirdAgentProfit: false,
							fourAgentProfit: false,
							fiveAgentProfit: true,
							sixAgentProfit: false,
						}
					} else if (roleId === 8) {
						this.showData = {
							firstAgentProfit: false,
							secondAgentProfit: false,
							thirdAgentProfit: false,
							fourAgentProfit: false,
							fiveAgentProfit: false,
							sixAgentProfit: true,
						}
					}
					this.showOrder = true
				})
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
