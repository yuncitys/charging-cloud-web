<template>
	<div style="display: inline-block;">
		<el-button type="success" style="margin-right: 10px;" @click='updMoney()' size="mini"
			v-if="btnAuthen.permsVerifAuthention(':user:wxuserList:updateCash')">
			充值
		</el-button>
		<!-- 充值 -->
		<el-dialog :visible.sync="updMoneydialog" title="用户充值" @close="updMoneydialog=false" :append-to-body="true">
			<el-form ref="editData" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
				<el-form-item :label="'手机号'" prop="phoneNumber">
					<el-input v-model="editData.phoneNumber" disabled />
				</el-form-item>
				<el-form-item :label="'余额'" prop="cash">
					<el-input v-model="editData.cash" disabled />
				</el-form-item>
				<el-form-item :label="'充值金额'" prop="uptNumber">
					<el-input v-model="uptNumber" placeholder="请输入充值金额" type="number" />
				</el-form-item>
				<el-form-item :label="'备注'" prop="remark">
					<el-input v-model="remark" placeholder="请输入备注" type = "textarea" />
				</el-form-item>
				<el-form-item>
					<el-button type="success" @click="updNumBer()">充值</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		updateCash
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
				updMoneydialog: false,
				uptNumber: '',
				remark: ''
			}
		},
		methods: {
			//显示充值弹窗
			updMoney() {
				this.editData = this.row_data;
				this.updMoneydialog = true
			},
			// 充值金额
			updNumBer() {
				// var reg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/;
				// if (!reg.test(this.uptNumber)) {
				// 	this.$message.error("请输入正整数或者最多2位正小数")
				// 	this.uptNumber = ''
				// 	return false
				// }
				if (this.uptNumber == 0 || this.uptNumber == "") {
					this.$message.error("请输入充值金额")
					return
				}
				this.$confirm('是否确认充值?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
				}).then(() => {
					let data = {
						userId: this.editData.id,
						money: this.uptNumber,
						remark: this.remark
					}
					console.log(data)
					updateCash(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.uptNumber = ''
							this.updMoneydialog = false
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
