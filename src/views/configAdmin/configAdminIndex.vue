<template>
	<div class="app-container">
      <el-tabs :tab-position='tabPosition' style="height: 160px;">
        <el-tab-pane label="充值规则配置">
          <el-form ref="form" :model="formData" label-width="80px">
            <el-form-item label="充值规则">
              <el-radio-group v-model="formData.IS_PRESTORE">
                  <el-radio :label="'0'">预存充值</el-radio>
                  <el-radio :label="'1'">单次充值</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div class="" style="display: flex; margin-left: 50px;">
          	<el-button type="primary" @click="onSubmit">保存</el-button>
          	<el-button>取消</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="支付方式配置"></el-tab-pane>
        <el-tab-pane label="提现规则配置">
          <el-form ref="form" :model="formData" label-width="80px">
            <el-form-item  label="提现阈值">
              <el-input  style="width: 200px;" type="number" v-model="formData.MAX_CASH_WITHDRAW" placeholder="提现阈值" clearable />
            </el-form-item>
          </el-form>
          <el-form ref="form" :model="formData" label-width="80px">
            <el-form-item  label="提现费率">
              <el-input style="width: 200px;" type="number" v-model="formData.RATE_WITHDRAW" placeholder="提现费率" clearable>
                  <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </el-form>
          <div class="" style="display: flex; margin-left: 50px;">
          	<el-button type="primary" @click="onSubmit">保存</el-button>
          	<el-button>取消</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="基本业务配置"></el-tab-pane>
      </el-tabs>

		<!-- <div class="filter-container">
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
		</div> -->
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
        tabPosition: 'left',

				formData:{
          IS_PRESTORE: '',
          MAX_CASH_WITHDRAW: '',
          RATE_WITHDRAW: 0
				}
			}
		},
		methods:{
			onSubmit(){
				let IS_PRESTOREnamevalue = this.formData.IS_PRESTORE
				let MAX_CASH_WITHDRAW = this.formData.MAX_CASH_WITHDRAW
				if(IS_PRESTOREnamevalue == null || IS_PRESTOREnamevalue == undefined){
					this.$message.error('请选择充值类型')
					return false
				}
				if(MAX_CASH_WITHDRAW == '' || MAX_CASH_WITHDRAW == null || MAX_CASH_WITHDRAW == undefined || MAX_CASH_WITHDRAW == 0){
					this.$message.error('请输入提现阈值')
					return false
				}
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
