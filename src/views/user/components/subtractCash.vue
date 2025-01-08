<template>
	<div style="display: inline-block;">
		<el-button type="success" style="margin-right: 10px;" @click='updateMoney()' size="mini"
			v-if="btnAuthen.permsVerifAuthention(':user:wxuserList:updateCash')">
			扣费
		</el-button>
		<!-- 充值 -->
		<el-dialog :visible.sync="updateMoneydialog" title="金额扣除" @close="updateMoneydialog=false" :append-to-body="true">
			<el-form ref="editData" label-position="left" label-width="150px" style="width: 450px; margin-left:50px;">
				<el-form-item :label="'手机号'" prop="phoneNumber">
					<el-input v-model="editData.phoneNumber" disabled />
				</el-form-item>
				<el-form-item :label="'余额'" prop="cash">
					<el-input v-model="editData.cash" disabled />
				</el-form-item>
				<el-form-item :label="'充值金扣除金额'" prop="realityPayMoney">
					<el-input v-model="realityPayMoney" placeholder="请输入充值金扣除金额" type="number" />
				</el-form-item>
        <el-form-item :label="'赠送金扣除金额'" prop="giveMoney">
        	<el-input v-model="giveMoney" placeholder="请输入赠送金扣除金额" type="number" />
        </el-form-item>
				<el-form-item>
					<el-button type="success" @click="updateBalance()">扣除</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		updateBalance
	} from '@/api/user/userList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'userList1',
		props: {
			row_data: {
				type: Object,
				default: () => {
					return {}
				}
			},
		},
		data() {
			return {
				editData: {},
				updateMoneydialog: false,
				realityPayMoney: '',
        giveMoney: '',
				remark: ''
			}
		},
		methods: {
			//显示充值弹窗
			updateMoney() {
				this.editData = this.row_data;
				this.updateMoneydialog = true
			},
			// 充值金额
			updateBalance() {
				// var reg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/;
				// if (!reg.test(this.realityPayMoney)) {
				// 	this.$message.error("请输入正整数或者最多2位正小数")
				// 	this.realityPayMoney = ''
				// 	return false
				// }
				if (this.realityPayMoney == '') {
					this.$message.error("请输入扣除金额")
					return
				}
        if (this.giveMoney == '') {
        	this.$message.error("请输入扣除金额")
        	return
        }
				this.$confirm('是否确认扣除?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
				}).then(() => {
					let data = {
						userId: this.editData.id,
						realityPayMoney: this.realityPayMoney,
						giveMoney: this.giveMoney
					}
					console.log(data)
					updateBalance(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.realityPayMoney = 0
              this.giveMoney = 0
							this.updateMoneydialog = false
							this.$emit('getLists')
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			}
		},
		created() {

		},
	}
</script>

<style scoped="scoped">

</style>
