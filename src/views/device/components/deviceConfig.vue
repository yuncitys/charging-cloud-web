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
						<el-option v-for="item in dectinoType" :key="item.deviceTypeId" :label="item.deviceTypeName" :value="item.deviceTypeId"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</el-form-item>
        <el-form-item :label="'编号长度'" prop="length">
        	<el-select v-model="configData.length" placeholder="请选择设备号长度" style="width: 100%;">
        		<el-option v-for="item in digitData" :key="item.id" :label="item.value + '位'" :value="item.value"
        			:disabled="item.disabled">
        		</el-option>
        	</el-select>
        </el-form-item>
		<el-form-item label="计费规则" prop="deviceChagePattern" v-if="configData.ruleId === 1">
        	<el-radio-group v-model="configData.deviceChagePattern" @change="changeChagePattern">
        		<el-radio :label="0">时间</el-radio>
        		<el-radio :label="1">电量</el-radio>
        		<el-radio :label="2">功率</el-radio>
        	</el-radio-group>
        </el-form-item>
        <el-form-item :label="'收费方案'" prop="devicePriceId">
        	<el-select v-model="configData.devicePriceId" class="filter-item" placeholder="请选择收费方案"
        		clearable style="width: 100%">
        		<el-option v-for="item in devicePriceList" :key="item.id" :label="item.feeName"
        			:value="item.id" />
        	</el-select>
        </el-form-item>
        <el-form-item :label="'运营商'" prop="adminId">
          <el-select style="width: 100%;" class="filter-item" v-model="configData.adminId" filterable clearable placeholder="请选择运营商">
              <el-option
                v-for="item in operatorList"
                :key="item.id"
                :label="item.adminFullname"
                :value="item.id"
                @click.native="handleOptionClick(item)">
              </el-option>
          </el-select>
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
    getOperator
  } from '@/api/agent/agentList.js'
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
					length: '',
					number: '',
					deviceTypeId: '',
					deviceChagePattern: 0,
					devicePriceId: '',
					adminId: '',
					ruleId: 1
				},
        		domainName: '',
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
					deviceChagePattern: [{
						required: true,
						message: '请选择计费类型',
						trigger: 'blur',
					}],
					devicePriceId: [{
						required: true,
						message: '请选择计费规则',
						trigger: 'blur',
					}],
					adminId: [{
						required: true,
						message: '请选择运营商',
						trigger: 'blur',
					}],
					ruleId: [{
						required: true,
						message: '请选择产品',
						trigger: 'blur',
					}],
          			length: [{
						required: true,
						message: '请选择设备号长度',
						trigger: 'blur',
					}],
					},
				dectinoType: [],
				operatorList: [],
				devicePriceList: [],
				digitData:[
					// {
					// 	id: 1,
					// 	value: 8,
					// },
					{
						id: 2,
						value: 14,
					},
				],
				
			}
		},
		mounted() {

		},
		methods: {
			handleOptionClick(item) {
				console.log('选中的值:', item);
				// 在这里可以执行选中后的逻辑
				this.domainName = item.domainName
			},
			//选择收费类型
			changeChagePattern(e) {
				console.log(e)
				this.configData.deviceChagePattern = e
				this.configData.devicePriceId = ''
				this.getDevicePriceByPriceType()
			},
			//获取方案列表
			getDevicePriceByPriceType() {
				let ruleId = this.configData.ruleId
				let deviceChagePattern = this.configData.deviceChagePattern
				if (parseInt(deviceChagePattern) == 3) {
					deviceChagePattern = 2
				}
				if (this.configData.ruleId === 2) {
					deviceChagePattern = 1
				}
				let data = {
					priceType: deviceChagePattern,
					ruleId: ruleId
				}
				findDevicePriceByPriceType(data).then(res => {
					if (res.code == 200) {
						this.devicePriceList = res.data || []
					}
				})
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
			onShowConfig() {
				this.showConfig = true
				this.getTypeListss()
				this.getOperator()
				this.getDevicePriceByPriceType()
			},
			ruleIdChange() {
        		this.configData.deviceTypeId = ''
				this.configData.devicePriceId = ''
				this.getTypeListss()
				this.getDevicePriceByPriceType()
			},
			getTypeListss() {
				this.listLoading = true
				let data = {
					ruleId: this.configData.ruleId
				}
				findDeviceType(data).then(res => {
					if (res.code == 200) {
						this.dectinoType = res.data;
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//导出设备配置
			DownloadConfig(formName) {
				let configData = this.configData
				console.log(configData)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						this.loading = true
						downLoadDeviceCodes(configData).then(res => {
							if (res.code == 200) {
								let port = res.data.port;
								import('@/vendor/Export2Excel').then(excel => {
									const tHeader = ['Broker Address', 'Broker Port', 'Client ID', 'User Name', 'Password', '发布Topic', '订阅Topic', '设备编号',
										'整机二维码内容']
									for (let i = 0; i < port; i++) {
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
									for (let i = 0; i < port; i++) {
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
											let domainName = this.getFormat(this.domainName)
											let ruleId = this.configData.ruleId
											let baseUrl = domainName + `weixin${ruleId}/miniprogram`
											let urls = deviceCode[index]
											for (let i = 0; i <= port; i++) {
												if (i == 0) {
													obj.deviceCodeCom = baseUrl + '?qrcode=' + urls
												} else {
													let str = 'port' + i
													obj[str] = baseUrl + '?qrcode=' + urls + '&port=' + i
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
