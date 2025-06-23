<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" class="filter-item" 
			icon="el-icon-upload2" @click="onShowDevice" v-if="btnAuthen.permsVerifAuthention(':device:deviceList:allAdd')">
			批量导入设备
		</el-button>
		<el-dialog :visible.sync="showDevice" title="批量导入设备" @close="showDevice = false" :append-to-body="true">
			<el-form ref="addDeviceData" :model="addDeviceData" :rules="deviceRules" label-position="left"
				label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'归属系列'" prop="ruleId">
					<el-radio-group v-model="addDeviceData.ruleId" @change="ruleIdChange($event)">
						<el-radio :label="1">单车</el-radio>
						<el-radio :label="2">汽车</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'电流输出'" prop="electricOut">
					<el-select v-model="addDeviceData.electricOut" placeholder="请选择电流输出类型" style="width: 100%;" @change="currElectricOutChange">
						<el-option v-for="item in electricOutList" :key="item.value" :label="item.label" :value="item.value"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="addDeviceData.deviceTypeId" style="margin-right: 20px ;width: 100%;"
						class="filter-item" placeholder="请选择设备类型" clearable>
						<el-option v-for="item in tags" :key="item.deviceTypeId" :label="item.deviceTypeName"
							:value="item.deviceTypeId" :disabled="showDeviceType"/>
					</el-select>
				</el-form-item>
				<el-form-item label="收费类型" prop="deviceChagePattern" v-if="addDeviceData.ruleId === 1">
					<el-radio-group v-model="addDeviceData.deviceChagePattern" @change="changeChagePattern">
						<el-radio :label="0">时间</el-radio>
						<el-radio :label="1">电量</el-radio>
						<el-radio :label="2">功率</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'收费方案'" prop="devicePriceId">
					<el-select v-model="addDeviceData.devicePriceId" class="filter-item" placeholder="请选择收费方案"
						clearable style="width: 100%">
						<el-option v-for="item in priceTypeList" :key="item.id" :label="item.feeName"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="'虚拟设备'" prop="isVirtual" v-if="addDeviceData.ruleId == 2">
					<el-switch v-model="addDeviceData.isVirtual" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
				</el-form-item>
				<el-form-item :label="'设备数据'" prop="deviceData" required>
					<!-- :multiple="false" :show-file-list="false"  -->
					<el-upload drag multiple
						:http-request="upload"
						:limit="1"
						:before-upload="beforeUpload" 
						:action="uploadFileUrl" accept=".xls,.xlsx" v-loading.fullscreen.lock="fullscreenLoading">
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<div class="el-upload__tip" slot="tip"><i class="el-icon-warning-outline" style="font-size: 14px; display: inline-block; margin-right: 5px;"></i>只能上传Excel文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="importData('addDeviceData')">确定</el-button>
					<el-button @click="showDevice = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		addDevice,
		findDeviceType,
    	findDevicePriceByPriceType,
		uploadExcel,
		importPreview,
		importData
	} from '@/api/device/deviceList.js'
	export default {
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
				showDevice: false,
        		showDeviceType: true,
				addDeviceData: {
					deviceData: null,
					isVirtual: false,
					devicePurpose: '',
					electricOut: '',
					deviceTypeId: '',
					deviceChagePattern: 0,
					devicePriceId: '',
					ruleId: 1
				},
        		priceTypeList: [],
				deviceRules: {
					ruleId: [{
						required: true,
						message: '请选择归属系列',
						trigger: 'blur'
					}],
					deviceCode: [{
						required: true,
						message: '请输入设备号',
						trigger: 'blur'
					}],
					deviceTypeId: [{
						required: true,
						message: '请选择设备类型',
						trigger: 'change'
					}],
					deviceImei: [{
						required: true,
						message: '请输入设备Imei号',
						trigger: 'blur'
					}],
					electricOut: [{
						required: true,
						message: '请选择电流输出类型',
						trigger: 'blur'
					}],
					deviceTotalPower: [{
						required: true,
						message: '请输入设备总功率',
						trigger: 'blur'
					}, {
						validator: checkNum,
						trigger: 'blur'
					}],
					devicePriceId: [{
						required: true,
						message: '请选择计费方案',
						trigger: 'blur'
					}],
					deviceChagePattern: [{
						required: true,
						message: '请选择计费类型',
						trigger: 'blur'
					}],
					isVirtual: [{
						required: true,
						message: '请选择设备用途',
						trigger: 'blur'
					}],
				},
				tags: [],
				electricOutList:[
					{
						value:0,
						label:'交流充电桩'
					},
					{
						value:1,
						label:'直流充电桩'
					}
				],
				fullscreenLoading: false,
				showExcel: false,
				uploadFileUrl: this.Global.APIURl + '/api/system/device/Uploader'
			}
		},
		methods: {
			beforeUpload(file) {
				const isRightSize = file.size / 1024 < 500
				if (!isRightSize) this.$message.error('文件大小不能超过500KB')
				return isRightSize
			},
			//导入
			upload(file) {
				// 创建FormData对象
				let param = new FormData()
				param.append('file', file.file)
				// 将得到的文件流添加到FormData对象
				console.log(param, "11111")
				this.fullscreenLoading = true
				uploadExcel(param).then(res => {
					this.fullscreenLoading = false
					if (res.code == 200) {
						this.$message.success('上传成功')
						this.showExcel = false
						this.importPreview(res.data.name)
					} else {
						this.$message.error('上传失败，原因' + res.msg)
					}
				}).catch((err) => {
					this.$message.error('上传失败，请重试')
					this.fullscreenLoading = false
				})
			},
			importPreview(fileName){
				const params = { 'fileName': fileName }
				importPreview(params).then(res => {
					if (res.code == 200) {
						this.addDeviceData.deviceData = res.data
					} else {
						this.$message.error(res.msg);
					}
				}).catch((err) => {
					this.$message.error('上传失败，请重试')
				})
			},
			importData(formName){
				let data = this.addDeviceData
				console.log("批量导入数据:",data)
				if (data.devicePriceId == '' || data.devicePriceId == null){
					this.$message.error('计费规则不能为空')
					return false
				}
				if (data.deviceTypeId == '' || data.deviceTypeId == null){
					this.$message.error('设备类型不能为空')
					return false
				}
				if (data.deviceData == '' || data.deviceData == null){
					this.$message.error('设备数据不能为空')
					return false
				}
				if (data.isVirtual){
					data.devicePurpose = 'VIRTUAL_CONNECTION'
				} else {
					data.devicePurpose = 'DIRECT_CONNECTION'
				}
				importData(data).then(res => {
					if (res.code == 200) {
						this.showDevice = false
						this.resetForm(formName)
						this.$message.success(res.msg)
						this.$emit('getLists')
					} else {
						this.$message.error(res.msg);
					}
				}).catch((err) => {
					this.$message.error('导入失败，请重试')
				})
			},
			//选择收费类型
			changeChagePattern(e) {
				console.log(e)
				this.addDeviceData.deviceChagePattern = e
				this.addDeviceData.devicePriceId = ''
				this.getDevicePriceByPriceType()
			},
			//获取方案列表
			getDevicePriceByPriceType() {
				let ruleId = this.addDeviceData.ruleId
				let deviceChagePattern = this.addDeviceData.deviceChagePattern
				if (parseInt(deviceChagePattern) == 3) {
					deviceChagePattern = 2
				}
				if (this.addDeviceData.ruleId === 2) {
					deviceChagePattern = 1
				}
				let data = {
					priceType: deviceChagePattern,
					ruleId: ruleId
				}
				findDevicePriceByPriceType(data).then(res => {
					if (res.code == 200) {
						this.priceTypeList = res.data || []
					}
				})
			},
			onShowDevice() {
				this.fileList = []
				this.showDevice = true
        		this.ruleIdChange(this.addDeviceData.ruleId)
			},
			ruleIdChange(ruleId) {
				this.addDeviceData.deviceTypeId = ''
				this.addDeviceData.electricOut = ''
				this.addDeviceData.devicePriceId = ''
				// this.addDeviceData.deviceChagePattern = ''
				if(ruleId === 1){
				this.electricOutList =
				[
					{
					value: 0,
					label: '交流充电桩'
					}
				];
				}else if(ruleId === 2){
				this.electricOutList =
				[
					{
					value: 0,
					label: '交流充电桩'
					},
					{
					value: 1,
					label: '直流充电桩'
					},
				];
				}
				this.getDeviceTypeList()
				this.getDevicePriceByPriceType()
			},
			getDeviceTypeList() {
				let ruleId = this.addDeviceData.ruleId
        		let electricOut = this.addDeviceData.electricOut
				let data = {
					ruleId,
          			electricOut
				}
				findDeviceType(data).then(res => {
					if (res.code == 200) {
						this.tags = res.data || []
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			addDevices(formName) {
				console.log(this.addDeviceData)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						addDevice(this.addDeviceData).then(res => {
							if (res.code == 200) {
								this.showDevice = false
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
			//监听修改事件
			currElectricOutChange(){
				this.addDeviceData.deviceTypeId = ''
				this.showDeviceType = false
				this.getDeviceTypeList()
			}
		},
		created() {

		},
	}
</script>

<style>

</style>
