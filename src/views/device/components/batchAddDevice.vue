<template>
	<div style="display: inline-flex; align-items: center;">
		<el-button type="primary" size="medium" class="filter-item"
			icon="el-icon-upload2" @click="onShowDevice" v-if="btnAuthen.permsVerifAuthention(':device:deviceList:allAdd')">
			批量导入设备
		</el-button>
		<el-dialog :visible.sync="showDevice" title="批量导入设备" @close="closeDialog()" :append-to-body="true">
			<el-form ref="addDeviceData" :model="addDeviceData" :rules="deviceRules" label-position="left"
				label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="addDeviceData.deviceTypeId" style="width: 100%;" class="filter-item"
						placeholder="请选择设备类型" clearable filterable @change="onDeviceTypeIdChange">
						<el-option v-for="item in deviceTypeOptions" :key="item.deviceTypeId"
							:label="formatDeviceTypeOptionLabel(item)" :value="item.deviceTypeId" />
					</el-select>
					<div v-if="selectedDeviceType" class="form-tip">{{ typeSummaryText }}</div>
				</el-form-item>
				<el-form-item label="收费类型" prop="deviceChagePattern" v-if="addDeviceData.ruleId === 1">
					<el-radio-group v-model="addDeviceData.deviceChagePattern" @change="changeChagePattern">
						<el-radio v-for="item in priceTypeOptions" :key="'pt-'+item.value" :label="item.value">{{ item.label }}</el-radio>
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
					<el-upload drag multiple ref="myUpload"
						:http-request="upload"
						:limit="1"
						:before-upload="beforeUpload"
						:action="uploadFileUrl" accept=".xls,.xlsx" v-loading.fullscreen.lock="fullscreenLoading">
						<i class="el-icon-upload"></i>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<div class="el-upload__tip" slot="tip">
							<div><i class="el-icon-warning-outline" style="font-size: 14px; display: inline-block; margin-right: 5px;"></i>只能上传Excel文件，且不超过500kb</div>
							<div class="form-tip">Excel「设备功率」列请填 kW（如 120 表示 120kW），导入时自动换算为 W 入库</div>
						</div>
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
	findDevicePriceByPriceType,
	uploadExcel,
	importPreview,
	importData
} from '@/api/device/deviceList.js'
import deviceTypePickerMixin from './deviceTypePickerMixin.js'
import { convertDeviceImportRowsToWatts } from '@/utils/powerUnit.js'

export default {
	mixins: [deviceTypePickerMixin],
	props: {
		listRuleId: {
			type: Number,
			default: 1
		}
	},
	data() {
		return {
			showDevice: false,
			addDeviceData: {
				deviceData: null,
				isVirtual: false,
				devicePurpose: '',
				deviceTypeId: '',
				deviceChagePattern: 0,
				devicePriceId: '',
				ruleId: 1
			},
			priceTypeList: [],
			deviceRules: {
				deviceTypeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
				devicePriceId: [{ required: true, message: '请选择计费方案', trigger: 'blur' }],
				deviceChagePattern: [{ required: true, message: '请选择计费类型', trigger: 'blur' }],
				isVirtual: [{ required: true, message: '请选择设备用途', trigger: 'blur' }]
			},
			priceTypeOptions: [],
			fullscreenLoading: false,
			showExcel: false,
			uploadFileUrl: this.Global.APIURl + '/api/system/device/Uploader'
		}
	},
	computed: {
		typeSummaryText() {
			const t = this.selectedDeviceType
			if (!t) return ''
			return this.formatDeviceTypeOptionLabel(t)
		}
	},
	methods: {
		closeDialog() {
			this.showDevice = false
			this.resetForm('addDeviceData')
		},
		beforeUpload(file) {
			const isRightSize = file.size / 1024 < 500
			if (!isRightSize) this.$message.error('文件大小不能超过500KB')
			return isRightSize
		},
		upload(file) {
			const param = new FormData()
			param.append('file', file.file)
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
			}).catch(() => {
				this.$message.error('上传失败，请重试')
				this.fullscreenLoading = false
			})
		},
		importPreview(fileName) {
			importPreview({ fileName }).then(res => {
				if (res.code == 200) {
					this.addDeviceData.deviceData = res.data
				} else {
					this.$message.error(res.msg)
				}
			}).catch(() => {
				this.$message.error('上传失败，请重试')
			})
		},
		importData(formName) {
			const data = this.addDeviceData
			if (data.devicePriceId == '' || data.devicePriceId == null) {
				this.$message.error('计费规则不能为空')
				return false
			}
			if (data.deviceTypeId == '' || data.deviceTypeId == null) {
				this.$message.error('设备类型不能为空')
				return false
			}
			if (data.deviceData == '' || data.deviceData == null) {
				this.$message.error('设备数据不能为空')
				return false
			}
			data.devicePurpose = data.isVirtual ? 'VIRTUAL_CONNECTION' : 'DIRECT_CONNECTION'
			const payload = {
				...data,
				deviceData: convertDeviceImportRowsToWatts(data.deviceData)
			}
			importData(payload).then(res => {
				if (res.code == 200) {
					this.showDevice = false
					this.resetForm(formName)
					this.$message.success(res.msg)
					this.$emit('getLists')
				} else {
					this.$message.error(res.msg)
				}
			}).catch(() => {
				this.$message.error('导入失败，请重试')
			})
		},
		changeChagePattern(e) {
			this.addDeviceData.deviceChagePattern = e
			this.addDeviceData.devicePriceId = ''
			this.getDevicePriceByPriceType()
		},
		getDevicePriceByPriceType() {
			let ruleId = this.addDeviceData.ruleId
			let deviceChagePattern = this.addDeviceData.deviceChagePattern
			if (parseInt(deviceChagePattern) == 3) {
				deviceChagePattern = 2
			}
			if (this.addDeviceData.ruleId === 2) {
				deviceChagePattern = 1
			}
			findDevicePriceByPriceType({ priceType: deviceChagePattern, ruleId }).then(res => {
				if (res.code == 200) {
					this.priceTypeList = res.data || []
				}
			})
		},
		onShowDevice() {
			this.fileList = []
			this.addDeviceData.ruleId = this.listRuleId
			this.showDevice = true
			this.ruleIdChange(this.addDeviceData.ruleId)
		},
		ruleIdChange(ruleId) {
			this.addDeviceData.deviceTypeId = ''
			this.selectedDeviceType = null
			this.addDeviceData.devicePriceId = ''
			this.loadDeviceTypeOptions(ruleId)
			this.getDevicePriceByPriceType()
		},
		resetForm(formName) {
			this.$refs[formName].resetFields()
			this.$refs.myUpload.clearFiles()
			this.selectedDeviceType = null
		}
	},
	created() {
		this.$dict.getPriceTypeOptions().then(list => {
			this.priceTypeOptions = (list || []).filter(i => [0, 1, 2].includes(Number(i.value)))
		})
	}
}
</script>

<style scoped>
.form-tip {
	font-size: 12px;
	color: #909399;
	line-height: 1.5;
	margin-top: 6px;
}
</style>
