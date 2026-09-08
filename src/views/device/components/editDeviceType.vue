<template>
	<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneEdit')" style="display: inline-block;">
		<el-button type="primary" @click="onShowDevice" size="mini">编辑档案
		</el-button>
		<el-dialog :visible.sync="showDevice" title="编辑档案" @close="showDevice = false" :append-to-body="true">
			<el-form ref="formData" :model="formData" :rules="deviceRules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'设备编号'" prop="deviceCode">
					<el-input v-model="formData.deviceCode" clearable placeholder="请输入设备号" disabled />
				</el-form-item>
				<el-form-item :label="'归属系列'" prop="ruleId">
					<el-radio-group v-model="formData.ruleId" @change="ruleIdChange($event)">
						<el-radio v-for="item in deviceRuleOptions" :key="'rule-'+item.value" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="formData.deviceTypeId" style="width: 100%;" class="filter-item"
						placeholder="请选择设备类型" clearable filterable @change="onDeviceTypeIdChange">
						<el-option v-for="item in deviceTypeOptions" :key="item.deviceTypeId"
							:label="deviceTypeOptionLabel(item)" :value="item.deviceTypeId"
							:disabled="isDeviceTypeOptionDisabled(item)" />
					</el-select>
					<div v-if="selectedDeviceType" class="form-tip">{{ typeSummaryText }}</div>
					<div v-if="isInterconnectionDevice" class="form-tip">互联设备换类型须与当前 Connector 端口数一致</div>
				</el-form-item>
				<el-form-item :label="'二维码规则'" prop="deviceQrLink">
					<el-input v-model="formData.deviceQrLink" clearable placeholder="请输入设备二维码规则" :disabled="formData.ruleId === 2"/>
				</el-form-item>
				<el-form-item :label="'总功率'" prop="deviceTotalPower">
					<el-input v-model="formData.deviceTotalPower" clearable placeholder="如 120 表示 120kW">
						<template slot="append">kW</template>
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="confirm('formData')">确定</el-button>
					<el-button @click="showDevice = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
import { updateDevice } from '@/api/device/deviceList.js'
import { createKwValidator } from '@/utils/powerUnit.js'
import deviceTypePickerMixin from './deviceTypePickerMixin.js'
import devicePowerKwMixin from './devicePowerKwMixin.js'

const INTER_CONNECTION = 'INTER_CONNECTION'

export default {
	mixins: [deviceTypePickerMixin, devicePowerKwMixin],
	props: {
		row_data: {
			type: Object,
			default: () => null
		}
	},
	data() {
		return {
			showDevice: false,
			originalDeviceTypeId: '',
			formData: {
				id: '',
				deviceCode: '',
				deviceTotalPower: '',
				deviceTypeId: '',
				deviceChagePattern: '',
				devicePriceId: '',
				ruleId: '',
				deviceQrLink: ''
			},
			deviceRules: {
				deviceCode: [{ required: true, message: '请输入设备号', trigger: 'blur' }],
				deviceTypeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
				ruleId: [{ required: true, message: '请选择归属系列', trigger: 'change' }],
				deviceTotalPower: [
					{ required: true, message: '请输入设备总功率', trigger: 'blur' },
					{ validator: createKwValidator('请输入设备总功率', '请输入大于 0 的功率(kW)'), trigger: 'blur' }
				],
				deviceQrLink: [{ required: true, message: '请输入二维码规则', trigger: 'blur' }]
			},
			deviceRuleOptions: [],
			currentPortCount: 0,
			currentDeviceSender: '',
			devicePurpose: ''
		}
	},
	computed: {
		isInterconnectionDevice() {
			return this.devicePurpose === INTER_CONNECTION
		},
		typeSummaryText() {
			const t = this.selectedDeviceType
			if (!t) return ''
			return this.formatDeviceTypeOptionLabel(t)
		}
	},
	methods: {
		onShowDevice() {
			this.showDevice = true
			this.currentPortCount = Number(this.row_data.portCount) || 0
			this.currentDeviceSender = (this.row_data.deviceSender || '').trim()
			this.devicePurpose = this.row_data.devicePurpose || ''
			this.originalDeviceTypeId = this.row_data.deviceTypeId ? String(this.row_data.deviceTypeId) : ''
			this.formData.deviceCode = this.row_data.deviceCode
			this.formData.id = this.row_data.id
			this.formData.ruleId = this.row_data.ruleId ?? 1
			this.formData.deviceTypeId = this.row_data.deviceTypeId ? Number(this.row_data.deviceTypeId) : ''
			this.formData.deviceChagePattern = this.row_data.priceType !== '' ? Number(this.row_data.priceType) : ''
			this.formData.devicePriceId = this.row_data.devicePriceId !== '' ? Number(this.row_data.devicePriceId) : ''
			this.formData.deviceTotalPower = this.toFormDeviceTotalPowerKw(this.row_data.deviceTotalPower)
			this.formData.deviceQrLink = this.row_data.deviceQrcodeLink ? this.row_data.deviceQrcodeLink : ''
			const extra = {}
			if (this.isInterconnectionDevice && this.currentPortCount) {
				extra.portCount = this.currentPortCount
			}
			this.loadDeviceTypeOptions(this.formData.ruleId, extra).then(() => {
				this.resolveSelectedDeviceType(this.formData.deviceTypeId)
			})
		},
		ruleIdChange(ruleId) {
			this.formData.deviceTypeId = ''
			this.selectedDeviceType = null
			const extra = {}
			if (this.isInterconnectionDevice && this.currentPortCount) {
				extra.portCount = this.currentPortCount
			}
			this.loadDeviceTypeOptions(ruleId, extra)
		},
		isDeviceTypePortMismatch(item) {
			if (!this.isInterconnectionDevice || !this.currentPortCount || !item || item.portCount == null) {
				return false
			}
			return Number(item.portCount) !== Number(this.currentPortCount)
		},
		isDeviceTypeProtocolMismatch(item) {
			if (this.isInterconnectionDevice || !item) {
				return false
			}
			const sender = this.currentDeviceSender
			if (!sender || !item.protocolCode) {
				return false
			}
			return String(item.protocolCode).trim() !== sender
		},
		isDeviceTypeOptionDisabled(item) {
			return this.isDeviceTypePortMismatch(item) || this.isDeviceTypeProtocolMismatch(item)
		},
		deviceTypeOptionLabel(item) {
			const base = this.formatDeviceTypeOptionLabel(item)
			if (this.isDeviceTypePortMismatch(item)) {
				return base + '（端口数不一致）'
			}
			if (this.isDeviceTypeProtocolMismatch(item)) {
				return base + '（协议不一致）'
			}
			return base
		},
		validateSelectedType(selectedType) {
			if (!selectedType) return null
			if (this.isDeviceTypePortMismatch(selectedType)) {
				return '所选设备类型端口数与当前设备不一致'
			}
			if (this.isDeviceTypeProtocolMismatch(selectedType)) {
				return '所选设备类型接入协议与当前设备不一致'
			}
			return null
		},
		buildTypeChangeConfirmMessage(selectedType) {
			if (this.isInterconnectionDevice) {
				return '换类型将同步枪的输出类型、充电分类及功率等规格（不修改枪状态与连接状态）。是否继续？'
			}
			const newPorts = selectedType && selectedType.portCount != null ? Number(selectedType.portCount) : 0
			if (newPorts && this.currentPortCount && newPorts !== this.currentPortCount) {
				return '换类型将调整枪口数量并同步枪规格（缩容时仅移除空闲/离线枪口，充电中或占位枪口将阻止保存）。是否继续？'
			}
			return '换类型将同步枪的输出类型、充电分类及功率等规格（不修改枪状态与连接状态）。是否继续？'
		},
		submitUpdate() {
			const payload = {
				...this.formData,
				deviceTotalPower: this.toApiDeviceTotalPower(this.formData.deviceTotalPower)
			}
			updateDevice(payload).then(res => {
				if (res.code == 200) {
					this.showDevice = false
					this.resetForm('formData')
					this.$message.success(res.msg)
					this.$emit('getLists')
				} else {
					this.$message.error(res.msg)
				}
			})
		},
		confirm(formName) {
			this.$refs[formName].validate(valid => {
				if (!valid) return false
				const selectedType = this.deviceTypeOptions.find(item => item.deviceTypeId === this.formData.deviceTypeId)
				const typeError = this.validateSelectedType(selectedType)
				if (typeError) {
					this.$message.error(typeError)
					return false
				}
				const newTypeId = this.formData.deviceTypeId ? String(this.formData.deviceTypeId) : ''
				if (newTypeId && newTypeId !== this.originalDeviceTypeId) {
					this.$confirm(
						this.buildTypeChangeConfirmMessage(selectedType),
						'换类型确认',
						{ confirmButtonText: '继续保存', cancelButtonText: '取消', type: 'warning' }
					).then(() => {
						this.submitUpdate()
					}).catch(() => {})
					return
				}
				this.submitUpdate()
			})
		},
		resetForm(formName) {
			this.$refs[formName].resetFields()
			this.selectedDeviceType = null
		}
	},
	created() {
		this.$dict.getDeviceRuleOptions().then(list => { this.deviceRuleOptions = list || [] })
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
