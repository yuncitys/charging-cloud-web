<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" @click="showAdd=true" class="filter-item"
		v-if="btnAuthen.permsVerifAuthention(':sys:recharge:addRecharge')">
		新增方案
		</el-button>

		<!-- 新增方案-->
		<el-dialog :visible.sync="showAdd" title="新增方案" @close="showAdd = false" :append-to-body="true">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px"  :rules="rules">
				<!-- <el-form-item :label="'运营商'" prop="adminId">
					<el-select style="width: 100%;" class="filter-item" v-model="addData.adminId" filterable clearable placeholder="请选择运营商">
						<el-option
							v-for="item in operatorList"
							:key="item.id"
							:label="item.adminFullname"
							:value="item.id">
						</el-option>
					</el-select>
				</el-form-item> -->
				<el-form-item :label="'充值金额'" prop="rechargeAmount">
					<el-input v-model="addData.rechargeAmount" placeholder="请输入充值金额" clearable
						type="number" />
				</el-form-item>
				<el-form-item :label="'赠送金额'" prop="giftAmount">
					<el-input v-model="addData.giftAmount" placeholder="请输入赠送金额" clearable
						type="number" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onaddData('addData')">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		addRecharge,
	} from '@/api/netWorkDot/charge/recharge.js'
	import {
		getOperator
	} from '@/api/agent/agentList.js'
	export default {
		name: 'recharge1',
		props:{
			recharge_type:{
				type:Number
			}
		},
		data() {
			return {
				showAdd: false,
				addData: {
          			adminId: '',
					type: 0,
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
      		getOperator() {
				getOperator().then(res => {
					if (res.code == 200) {
						this.operatorList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onaddData(formName) {
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						this.addData.type=this.recharge_type
						addRecharge(this.addData).then(res => {
							if (res.code == 200) {
								this.showAdd = false
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
      this.getOperator()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}
</style>
