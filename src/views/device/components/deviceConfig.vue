<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='onShowConfig'
			icon="el-icon-download" v-if="btnAuthen.permsVerifAuthention(':device:deviceList:generate')">
      生成设备
		</el-button>
		<el-dialog :visible.sync="showConfig" title="生成设备" @close="showConfig = false" :append-to-body="true">
			<el-form ref="configData" :model="configData" :rules="configrules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'产品类型'" prop="ruleId">
					<el-radio-group v-model="configData.ruleId" @change="ruleIdChange">
						<el-radio :label="1">单车</el-radio>
						<el-radio :label="2">汽车</el-radio>
					</el-radio-group>
				</el-form-item>
        <el-form-item :label="'导出条数'" prop="number">
        	<el-input v-model="configData.number" clearable placeholder="请输入导出条数" type="number" />
        </el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="configData.deviceTypeId" placeholder="请选择端口数" style="width: 100%;">
						<el-option v-for="item in dectinoType" :key="item.value" :label="item.label" :value="item.value"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'运营商'" prop="domainName">
					<el-autocomplete style="width: 100%;margin-right: 20px ;" class="filter-item" v-model="adminName"
						:fetch-suggestions="querySearch" placeholder="请选择运营商" @select="handleSelect" clearable
						:debounce='0' @change="changeName"></el-autocomplete>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="DownloadConfig('configData')" v-loading.fullscreen.lock="loading">
						确定</el-button>
					<el-button @click="showConfig = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

	</div>
</template>

<script>
	import {
		getList,
		findDeviceCommand,
		openAllPort,
		openOnePort,
		closePort,
		deleteDevice,
		queryDeviceToCommand,
		queryOneProtStatus,
		chargeOnePort,
		addDevice,
		findDeviceType,
		updateDevice,
		findDeviceInfoById,
		findDealerList,
		findOrderInfo,
		deviceAllocation,
		batchUpdateNetworkDot,
		uploadExcel,
		downloadExcel,
		addDevicePrice,
		batchAddDevicePrice,
		findDevicePriceByPriceType,
		downLoadDeviceCodes,
		updateDeviceStatus,
		operationDevice
	} from '@/api/device/deviceList.js'
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
					deviceTypeId: '',
          adminId:'',
          domainName: '',
					ruleId: 1
				},
				domainName: '',
				adminName: '',
				configrules: {
					number: [{
						required: true,
						message: '请输入导出条数',
						trigger: 'blur',
					}, {
						validator: checkNum,
						trigger: 'blur'
					}],
					deviceTypeId: [{
						required: true,
						message: '请选择端口数',
						trigger: 'blur',
					}],
					domainName: [{
						required: true,
						message: '请选择运营商',
						trigger: 'blur',
					}],
          ruleId: [{
          	required: true,
          	message: '请选择产品',
          	trigger: 'blur',
          }]
				},
				dectinoType: [],
			}
		},
		mounted() {

		},
		methods: {
			getfindDealerList() {
				//查询所有代理商
				findDealerList().then(res => {
					if (res.code == 200) {
						let dealerList = res.data
						let restaurants = []
						dealerList.forEach((item, index) => {
							if (item.roleId === 3) {
								restaurants.push(item)
							}
						})
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
							dealerId: '',
							domainName: ''
						}
						let value = item.adminName + "(" + item.adminFullname + ")"
						obj.value = value
						obj.dealerId = item.id
						obj.domainName = item.domainName
						restaurantsText.push(obj)
					})
				}
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return (restaurant) => {
					return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
				};
			},
			//选择代理商
			handleSelect(item) {
				console.log(item)
				let domainName = item.domainName ? item.domainName : ''
				this.domainName = domainName + ''
				this.adminName = item.value + ''
        this.configData.adminId = item.dealerId
        this.configData.domainName = domainName + ''
			},
			//清除已选择代理商
			changeName() {
				// if (this.adminName == '') {
				// 	this.domainName = ''
				// }
        this.adminName == ''
        this.domainName = ''
			},
			onShowConfig() {
				this.showConfig = true
				this.domainName = ''
				this.adminName = ''
				this.getTypeListss()
				this.getfindDealerList()
			},
			ruleIdChange() {
        this.configData.deviceTypeId = ''
				this.getTypeListss()
			},
			getTypeListss() {
				this.listLoading = true
				let data = {
					ruleId: this.configData.ruleId
				}
				findDeviceType(data).then(res => {
					console.log(res)
					if (res.code == 200) {
						let datas = res.data;
						console.log(datas)
						let linshidata = []
						datas.forEach((item, index) => {
							let obj = {
								label: "",
								value: ""
							};
							obj.label = item.deviceTypeName
							obj.value = item.deviceTypeId
							linshidata.push(obj)
						})
						this.dectinoType = linshidata
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//导出设备配置
			DownloadConfig(formName) {
				let configData = this.configData
				console.log(this.domainName)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						if (!this.domainName) {
							this.$message.error('请选择代理商')
							return false
						}
						this.loading = true
						downLoadDeviceCodes(configData).then(res => {
							if (res.code == 200) {
								let prot = res.data.prot;
								import('@/vendor/Export2Excel').then(excel => {
									const tHeader = ['Broker Address', 'Broker Port', 'Client ID',
										'User Name', 'Password', '发布Topic', '订阅Topic', '设备编号',
										'整机二维码内容'
									]
									for (let i = 0; i < prot; i++) {
										tHeader.push(`第${i+1}路二维码内容`)
									}
									const filterVal = ['brokeAddress',
										'brokePort',
										'clientID',
										'userName',
										'password',
										'upTopic',
										'downTopic',
										'deviceCode',
										'deviceCodeCom'
									]
									for (let i = 0; i < prot; i++) {
										filterVal.push(`port${i+1}`)
									}
									const list = []
									let listData = res.data || {}
									let {
										clientID,
										downTopic,
										password,
										brokePort,
										brokeAddress,
										deviceCode,
										userName,
										upTopic
									} = listData
									if (clientID.length != 0) {
										clientID.forEach((item, index) => {
											let obj = {
												'brokePort': '',
												'clientID': '',
												'userName': '',
												'password': '',
												'upTopic': '',
												'downTopic': '',
												'deviceCode': '',
												'deviceCodeCom': ''
											}
											obj.clientID = clientID[index]
											obj.downTopic = downTopic[index]
											obj.password = password[index]
											obj.brokePort = brokePort[index]
											obj.brokeAddress = brokeAddress[index]
											obj.deviceCode = deviceCode[index]
											obj.userName = userName[index]
											obj.upTopic = upTopic[index]
											let domainName = this.domainName
											domainName = this.getFormat(domainName)
											let ruleId = this.configData.ruleId
											let baseUrl = domainName +
												`weixin${ruleId}/miniprogram`
											let urls = deviceCode[index]
											for (let i = 0; i <= prot; i++) {
												if (i == 0) {
													obj.deviceCodeCom = baseUrl +
														'?qrcode=' + urls
												} else {
													let str = 'port' + i
													obj[str] = baseUrl + '?qrcode=' +
														urls + '&port=' + i
												}
											}
											list.push(obj)
										})

									}
									console.log(list)
									const data = this.formatJson(filterVal, list)
									let filename = '设备配置-' + getNowTime()
									excel.export_json_to_excel({
										header: tHeader,
										data,
										filename: filename
									})
									this.loading = false
									this.showConfig = false
									this.resetForm(formName)
									this.$emit('getLists')
								})
							} else {
								this.loading = false
								this.$message({
									message: '导出失败，请重试',
									type: 'warning'
								})
							}
						})
					} else {
						this.loading = false
						console.log("不通过")
						return false
					}
				})
			},
			getFormat(str) {
				let url = ''
				let lastStr = str.substr(-1)
				if (lastStr !== '/') {
					url = str + '/'
				} else {
					url = str
				}
				return url
			},
			//导出excel格式转化
			formatJson(filterVal, jsonData) {
				return jsonData.map(v => filterVal.map(j => v[j]))
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {

		},
	}
</script>

<style>
</style>
