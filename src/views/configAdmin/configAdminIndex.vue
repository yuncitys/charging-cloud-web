<template>
	<div class="app-container">
      	<el-tabs :tab-position='tabPosition' style="height: 100%;">
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
					<el-button type="primary" @click="onSubmit(1)">保存</el-button>
					<el-button>取消</el-button>
				</div>
			</el-tab-pane>
			<el-tab-pane label="支付方式配置"></el-tab-pane>
			<el-tab-pane label="提现规则配置">
				<el-form ref="form" :model="formData" label-width="80px">
					<el-form-item  label="提现阈值">
					<el-input  style="width: 200px;" type="number" v-model="formData.MAX_CASH_WITHDRAW" placeholder="提现阈值" clearable />
					</el-form-item>
					<el-form-item  label="提现费率">
					<el-input style="width: 200px;" type="number" v-model="formData.RATE_WITHDRAW" placeholder="提现费率" clearable>
						<template slot="append">%</template>
					</el-input>
					</el-form-item>
				</el-form>
				<div class="" style="display: flex; margin-left: 50px;">
					<el-button type="primary" @click="onSubmit(2)">保存</el-button>
					<el-button>取消</el-button>
				</div>
			</el-tab-pane>
			<el-tab-pane label="微信开发配置">
				<el-form ref="form" :model="formData" label-width="150px">
					<el-form-item  label="小程序AppId">
						<el-input style="width: 200px;" type="text" v-model="formData.MINI_APPID" placeholder="小程序AppId" clearable>
						</el-input>
					</el-form-item>
					<el-form-item  label="小程序Secret">
						<el-input style="width: 200px;" type="text" v-model="formData.MINI_APPSECRET" placeholder="小程序Secret" clearable>
						</el-input>
					</el-form-item>
					<el-form-item  label="公众号AppId">
						<el-input style="width: 200px;" type="text" v-model="formData.WECHAT_APPID" placeholder="公众号AppId" clearable>
						</el-input>
					</el-form-item>
					<el-form-item  label="公众号Secret">
						<el-input style="width: 200px;" type="text" v-model="formData.WECHAT_APPSECRET" placeholder="公众号Secret" clearable>
						</el-input>
					</el-form-item>
					<el-form-item  label="公众号AccessToken">
						<el-input style="width: 400px;" type="text" v-model="formData.WECHAT_ACCESS_TOKEN" placeholder="公众号AccessToken" clearable>
						</el-input>
					</el-form-item>
					<div class="" style="display: flex; margin-left: 50px;">
						<el-button type="primary" @click="onSubmit(3)">保存</el-button>
						<el-button>取消</el-button>
					</div>
				</el-form>
			</el-tab-pane>
			<el-tab-pane label="充电通知推送配置">
				<el-form ref="form" :model="formData" label-width="150px">
					<el-form-item  label="开始充电消息模板ID">
						<el-input style="width: 400px;" type="text" v-model="formData.TEMPLATE_KSCD_ID" placeholder="开始充电消息模板ID" clearable>
						</el-input>
					</el-form-item>
					<el-form-item  label="结束充电消息模板ID">
						<el-input style="width: 400px;" type="text" v-model="formData.TEMPLATE_JSCD_ID" placeholder="开始充电消息模板ID" clearable>
						</el-input>
					</el-form-item>
					<div class="" style="display: flex; margin-left: 50px;">
						<el-button type="primary" @click="onSubmit(4)">保存</el-button>
						<el-button>取消</el-button>
					</div>
				</el-form>
			</el-tab-pane>
		</el-tabs>
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
					RATE_WITHDRAW: 0,
					MINI_APPID: '',
					MINI_APPSECRET: '',
					WECHAT_APPID: '',
					WECHAT_APPSECRET: '',
					WECHAT_ACCESS_TOKEN: '',
					TEMPLATE_KSCD_ID: '',
					TEMPLATE_JSCD_ID: ''
				}
			}
		},
		methods:{
			onSubmit(type){
				let data = ''
				if (type === 1){
					let IS_PRESTORE = this.formData.IS_PRESTORE
					if(IS_PRESTORE == null || IS_PRESTORE == undefined){
						this.$message.error('请选择充值类型')
						return false
					}
					data = {
						IS_PRESTORE: IS_PRESTORE
					}
				} else if (type === 2){
					let MAX_CASH_WITHDRAW = this.formData.MAX_CASH_WITHDRAW
					let RATE_WITHDRAW = this.formData.RATE_WITHDRAW
					if( MAX_CASH_WITHDRAW == '' || MAX_CASH_WITHDRAW == null || MAX_CASH_WITHDRAW == undefined){
						this.$message.error('请输入提现阈值')
						return false
					}
					if ( RATE_WITHDRAW == '' || RATE_WITHDRAW == undefined || RATE_WITHDRAW == null){
						this.$message.error('请输入提现费率')
						return false
					}
					data = {
						MAX_CASH_WITHDRAW: MAX_CASH_WITHDRAW,
						RATE_WITHDRAW: RATE_WITHDRAW
					}
				} else if (type === 3){
					let MINI_APPID = this.formData.MINI_APPID
					let MINI_APPSECRET = this.formData.MINI_APPSECRET
					let WECHAT_APPID = this.formData.WECHAT_APPID
					let WECHAT_APPSECRET = this.formData.WECHAT_APPSECRET
					let WECHAT_ACCESS_TOKEN = this.formData.WECHAT_ACCESS_TOKEN
					if( MINI_APPID == '' || MINI_APPID == null || MINI_APPID == undefined){
						this.$message.error('小程序AppId不能为空')
						return false
					}
					if ( MINI_APPSECRET == '' || MINI_APPSECRET == undefined || MINI_APPSECRET == null){
						this.$message.error('小程序Secret不能为空')
						return false
					}
					data = {
						MINI_APPID: MINI_APPID,
						MINI_APPSECRET: MINI_APPSECRET,
						WECHAT_APPID: WECHAT_APPID,
						WECHAT_APPSECRET: WECHAT_APPSECRET,
						WECHAT_ACCESS_TOKEN: WECHAT_ACCESS_TOKEN
					}
				} else if (type === 4){
					let TEMPLATE_KSCD_ID = this.formData.TEMPLATE_KSCD_ID
					let TEMPLATE_JSCD_ID = this.formData.TEMPLATE_JSCD_ID
					if( TEMPLATE_KSCD_ID == '' || TEMPLATE_KSCD_ID == null || TEMPLATE_KSCD_ID == undefined){
						this.$message.error('开始充电消息模板ID不能为空')
						return false
					}
					if ( TEMPLATE_JSCD_ID == '' || TEMPLATE_JSCD_ID == undefined || TEMPLATE_JSCD_ID == null){
						this.$message.error('结束充电消息模板ID不能为空')
						return false
					}
					data = {
						TEMPLATE_KSCD_ID: TEMPLATE_KSCD_ID,
						TEMPLATE_JSCD_ID: TEMPLATE_JSCD_ID
					}
				}
				if (data == '' || data == null || data == undefined){
					this.$message.error('参数不能为空')
					return false
				}
				saveConfig(data).then(res => {
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
