<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='onShowConfig'
			v-if="btnAuthen.permsVerifAuthention(':sys:qr:generate')">
      批量生产二维码
		</el-button>
		<el-dialog :visible.sync="showConfig" title="批量生产二维码" @close="showConfig = false" :append-to-body="true">
			<el-form ref="configData" :model="configData" :rules="configrules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'生成数量'" prop="number">
					<el-input v-model="configData.number" clearable placeholder="请输入生成数量" type="number" />
				</el-form-item>
				<el-form-item :label="'导出格式'" prop="type">
					<el-select v-model="configData.type" placeholder="请选择导出格式" style="width: 100%;">
						<el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'运营商'" prop="adminId">
					<el-autocomplete style="width: 100%;margin-right: 20px ;" class="filter-item" v-model="adminName"
						:fetch-suggestions="querySearch" placeholder="请选择运营商" @select="handleSelect" clearable
						:debounce='0' @change="changeName">
          </el-autocomplete>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="DownloadConfig('configData')" v-loading.fullscreen.lock="loading">
						确定
          </el-button>
					<el-button @click="showConfig = false">
            取消
          </el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
	  getOperator
	} from '@/api/agent/agentList.js'
	import {
		generateQR,
	} from '@/api/device/deviceQrcode.js'
	import {
		getNowTime
	} from '@/utils/index'
	export default {
		props: {

		},
		data() {
			let checkNum = (rule, value, callback) => {
				if (!value) {
					return new Error('必填信息')
				} else {
					let regx = /(^[1-9]\d*$)/;
					if (!regx.test(value)) {
						callback(new Error('请输入正整数'))
					} else {
						callback()
					}
				}
			}
			return {
				showConfig: false,
				loading: false,
				configData: {
					number: '',
					type: "",
          adminId:''
				},
				adminId: '',
				adminName: '',
				wxAppId: '',
				configrules: {
					number: [{
						required: true,
						message: '请输入生成数量',
						trigger: 'blur',
					}, {
						validator: checkNum,
						trigger: 'blur'
					}],
					type: [{
						required: true,
						message: '请选择导出格式',
						trigger: 'blur',
					}],
					adminId: [{
						required: true,
						message: '请选择运营商',
						trigger: 'blur',
					}]
				},
				typeList: [{
						value: 1,
						label: '图片'
					},
					{
						value: 2,
						label: 'excel'
					},
					{
						value: 3,
						label: '图片和excel'
					}
				],
			}
		},
		mounted() {

		},
		methods: {
			getOperator() {
				//查询所有代理商
				getOperator().then(res => {
					if (res.code == 200) {
						let restaurants = res.data
						this.restaurants = restaurants
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//查询搜索代理商
			querySearch(queryString, cb) {
				var restaurants = this.restaurants;
				let restaurantsText = []
				if (restaurants.length != '') {
					restaurants.forEach((item, index) => {
						let obj = {
							value: '',
							adminId: '',
							wxAppId: ''
						}
						let value = item.adminName + "(" + item.adminFullname + ")"
						obj.value = value
						obj.adminId = item.id
						obj.wxAppId = item.wxAppId
						restaurantsText.push(obj)
					})
				}
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			//筛选
			createFilter(queryString) {
				return (restaurant) => {
					return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
				};
			},
			//选择代理商
			handleSelect(item) {
				console.log(item)
				let adminId = item.adminId ? item.adminId : ''
				this.adminId = adminId + ''
				this.adminName = item.value + ''
				this.wxAppId = item.wxAppId + ''
			},
			//清除已选择代理商
			changeName() {
				if (this.adminName == '') {
					this.adminId = ''
				}
			},
			//显示弹窗
			onShowConfig() {
				this.showConfig = true
				this.adminId = ''
				this.adminName = ''
				this.getOperator()
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			//导出设备配置
			DownloadConfig(formName) {
				let configData = this.configData
				if (!this.adminId) {
					this.$message.error('请选择运营商')
					return false
				}
        let number = configData.number
        if (number > 1000) {
        	this.$message.error('最多导出1000条数据')
        	return false
        }
				configData.adminId = this.adminId
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						// console.log(this.$store.getters.adminUser)
						this.loading = true
						generateQR(configData).then(res => {
							let blob = res
							let objectUrl = URL.createObjectURL(blob);
							let a = document.createElement('a');
							a.href = objectUrl;
							let time = getNowTime()
							a.download = `插座二维码${time}.zip`
							a.click();

							this.loading = false
							this.showConfig = false
							this.resetForm(formName)
							this.$emit('getLists')
						})
					} else {
						this.loading = false
						console.log("不通过")
						return false
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
