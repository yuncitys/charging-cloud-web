<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="" style="margin-left: 10px;" @click="showDidlaoEditData()" size="mini"
			v-if="btnAuthen.permsVerifAuthention(':sys:recharge:updateRecharge')">编辑
		</el-button>
		<!-- 编辑方案-->
		<el-dialog :visible.sync="showEdit" title="编辑方案" @close="showEdit = false" :append-to-body="true">
			<el-form ref="editData" :model="editData" label-position="left" label-width="100px" :rules="rules">
				<!-- <el-form-item :label="'运营商'" prop="adminId">
				<el-select style="width: 100%;" class="filter-item" v-model="editData.adminId" filterable clearable placeholder="请选择运营商">
					<el-option
						v-for="item in operatorList"
						:key="item.id"
						:label="item.adminFullname"
						:value="item.id">
					</el-option>
				</el-select>
				</el-form-item> -->
				<el-form-item :label="'充值金额'" prop="rechargeAmount">
					<el-input v-model="editData.rechargeAmount" placeholder="请输入充值金额" clearable
						type="number" />
				</el-form-item>
				<el-form-item :label="'赠送金额'" prop="giftAmount">
					<el-input v-model="editData.giftAmount" placeholder="请输入赠送金额" clearable
						type="number" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onEditData('editData')">确定</el-button>
					<el-button @click="showEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		updateRecharge
	} from '@/api/netWorkDot/charge/recharge.js'
	import {
		getOperator
	} from '@/api/agent/agentList.js'
	export default {
		name: 'recharge1',
		props:{
			recharge_type:{
				type:Number,
			},
			row_data:{
				type:Object
			}
		},
		data() {
			return {
				showEdit: false,
				editData: {
					id: '',
					rechargeAmount: '',
					giftAmount: ''
				},
        		operatorList: [],
				rules: {
					rechargeAmount: [{
						required: true,
						message: '请输入充值金额',
						trigger: 'blur'
					}],
					giftAmount: [{
						required: true,
						message: '请输入赠送金额',
						trigger: 'blur'
					}],
					adminId: [{
						required: true,
						message: '请选择运营商',
						trigger: 'blur'
					}],
				},
			}
		},
		methods: {
			showDidlaoEditData() {
				let item = this.row_data
				this.showEdit = true
				this.editData.id = item.id
				this.editData.type = item.type
        		this.editData.adminId = item.adminId
				this.editData.giftAmount = item.giftAmount
				this.editData.rechargeAmount = item.rechargeAmount
			},
			getOperator() {
				getOperator().then(res => {
					if (res.code == 200) {
						this.operatorList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onEditData(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						updateRecharge(this.editData).then(res => {
							if (res.code == 200) {
								this.showEdit = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.$emit('getLists')
							} else {
								this.$message.error(res.msg)
							}
						})
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
      		// this.getOperator()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}
</style>
