<template>
	<div class="app-container">
		<div class="filter-container">
			  <el-form ref="form" :model="formData" label-width="80px">
			    <el-form-item label="充值类型:">
					<el-radio-group v-model="formData.IS_PRESTORE">
					    <el-radio :label="'0'">预存充值</el-radio>
					    <el-radio :label="'1'">单次充值</el-radio>
					</el-radio-group>
			    </el-form-item>
				<el-form-item  label="提现阈值:">
					<el-input  style="width: 200px;" type="number" v-model="formData.MAX_CASH_WITHDRAW" placeholder="提现阈值" clearable />
				</el-form-item>
			  </el-form>
			<div class="" style="margin-top: 300px; display: flex; justify-content: center;">
				<el-button type="primary" @click="onSubmit">保存</el-button>
				<el-button>取消</el-button>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		saveConfig
	} from '@/api/configAdmin/configAdmin.js'
	export default{
		name: 'configAdminIndex',
		data(){
			return {
				formData:{
          IS_PRESTORE:'',
          MAX_CASH_WITHDRAW:'',
				}
			}
		},
		methods:{
			onSubmit(){
				let IS_PRESTOREnamevalue = this.formData.IS_PRESTORE
				let MAX_CASH_WITHDRAW = this.formData.MAX_CASH_WITHDRAW
				// let IS_REAL=this.formData.IS_REAL
				console.log(MAX_CASH_WITHDRAW)
				if(IS_PRESTOREnamevalue == null || IS_PRESTOREnamevalue == undefined){
					this.$message.error('请选择充值类型')
					return false
				}
				if(MAX_CASH_WITHDRAW == '' || MAX_CASH_WITHDRAW == null || MAX_CASH_WITHDRAW == undefined || MAX_CASH_WITHDRAW == 0){
					this.$message.error('请输入提现阈值')
					return false
				}
				// let jsonConfig ={
				// 	IS_PRESTORE:IS_PRESTOREnamevalue,
				// 	MAX_CASH_WITHDRAW:MAX_CASH_WITHDRAW
				// }
				saveConfig(this.formData).then(res => {
					console.log(res)
					if (res.code == 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			getLists() {
				getList().then(res => {
					console.log(res)
					if (res.code == 200) {
						console.log(res.data[0])
						this.formData = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			this.getLists()
		}
	}
</script>

<style>
	.itemBody{
		display: flex;
	}
</style>
