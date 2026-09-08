<template>
	<div style="display: inline-flex; align-items: center;">
		<el-button type="primary" size="medium" class="filter-item" @click="onShowDevice"
			v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneAdd')">新增设备
		</el-button>
		<el-dialog :visible.sync="showDevice" title="新增设备" @close="showDevice = false" :append-to-body="true">
			<el-form ref="addDeviceData" :model="addDeviceData" :rules="formDeviceRules" label-position="left"
				label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item v-if="!syncRuleIdFromList" :label="'归属系列'" prop="ruleId">
					<el-radio-group v-model="addDeviceData.ruleId" @change="ruleIdChange($event)">
						<el-radio v-for="item in deviceRuleOptions" :key="'rule-'+item.value" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="addDeviceData.deviceTypeId" style="width: 100%;" class="filter-item"
						placeholder="请选择设备类型" clearable filterable @change="onDeviceTypeIdChange">
						<el-option v-for="item in deviceTypeOptions" :key="item.deviceTypeId"
							:label="formatDeviceTypeOptionLabel(item)" :value="item.deviceTypeId" />
					</el-select>
					<div v-if="selectedDeviceType" class="form-tip">
						<span>{{ typeSummaryText }}</span>
					</div>
				</el-form-item>
				<el-form-item :label="'设备号'" prop="deviceCode">
					<el-input v-model="addDeviceData.deviceCode" clearable placeholder="请输入设备号" />
				</el-form-item>
				<el-form-item :label="'imei号'" prop="deviceImei">
					<el-input v-model="addDeviceData.deviceImei" clearable placeholder="请输入imei号" />
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
				<el-form-item :label="'总功率'" prop="deviceTotalPower">
					<el-input v-model="addDeviceData.deviceTotalPower" clearable placeholder="如 120 表示 120kW">
						<template slot="append">kW</template>
					</el-input>
				</el-form-item>
				<el-form-item :label="'二维码前缀'" prop="deviceQrLink">
					<el-input v-model="addDeviceData.deviceQrLink" clearable placeholder="请输入设备二维码前缀" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="addDevices('addDeviceData')">确定</el-button>
					<el-button @click="showDevice = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
import { addDevice, findDevicePriceByPriceType } from '@/api/device/deviceList.js'
import { createKwValidator } from '@/utils/powerUnit.js'
import deviceTypePickerMixin from './deviceTypePickerMixin.js'
import devicePowerKwMixin from './devicePowerKwMixin.js'

export default {
	mixins: [deviceTypePickerMixin, devicePowerKwMixin],
	props: {
		syncRuleIdFromList: {
			type: Boolean,
			default: false
		},
		listRuleId: {
			type: Number,
			default: 1
		}
	},
	data() {
		return {
			showDevice: false,
			addDeviceData: {
				deviceQrLink: '',
				deviceCode: '',
				deviceImei: '',
				deviceTypeId: '',
				deviceChagePattern: 0,
				devicePriceId: '',
				deviceTotalPower: '',
				deviceVersion: '',
				deviceName: '',
				ruleId: 1
			},
			priceTypeList: [],
			deviceRules: {
				deviceCode: [{ required: true, message: '请输入设备号', trigger: 'blur' }],
				deviceTypeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
				deviceImei: [{ required: true, message: '请输入设备Imei号', trigger: 'blur' }],
				deviceTotalPower: [
					{ required: true, message: '请输入设备总功率', trigger: 'blur' },
					{ validator: createKwValidator('请输入设备总功率', '请输入大于 0 的功率(kW)'), trigger: 'blur' }
				],
				devicePriceId: [{ required: true, message: '请选择计费方案', trigger: 'blur' }],
				deviceChagePattern: [{ required: true, message: '请选择计费类型', trigger: 'blur' }],
				deviceQrLink: [{ required: true, message: '请输入二维码前缀', trigger: 'blur' }]
			},
			deviceRuleOptions: [],
			priceTypeOptions: []
		}
	},
	computed: {
		formDeviceRules() {
			const r = { ...this.deviceRules }
			if (!this.syncRuleIdFromList) {
				r.ruleId = [{ required: true, message: '请选择归属系列', trigger: 'blur' }]
			}
			return r
		},
		typeSummaryText() {
			const t = this.selectedDeviceType
			if (!t) return ''
			return this.formatDeviceTypeOptionLabel(t) + '（保存后将从类型继承默认参数）'
		}
	},
	methods: {
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
			if (this.syncRuleIdFromList) {
				this.addDeviceData.ruleId = this.listRuleId
			}
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
		addDevices(formName) {
			this.$refs[formName].validate(valid => {
				if (!valid) return false
				const payload = {
					...this.addDeviceData,
					deviceTotalPower: this.toApiDeviceTotalPower(this.addDeviceData.deviceTotalPower)
				}
				addDevice(payload).then(res => {
					if (res.code == 200) {
						this.showDevice = false
						this.resetForm(formName)
						this.$message.success(res.msg)
						this.$emit('getLists')
					} else {
						this.$message.error(res.msg)
					}
				})
			})
		},
		resetForm(formName) {
			this.$refs[formName].resetFields()
			this.selectedDeviceType = null
		}
	},
	created() {
		this.$dict.getDeviceRuleOptions().then(list => { this.deviceRuleOptions = list || [] })
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
