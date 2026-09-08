<template>
	<div style="display: inline-flex; align-items: center;">
		<el-button type="primary" size="medium" class="filter-item" @click='onShowConfig'
			icon="el-icon-download" v-if="btnAuthen.permsVerifAuthention(':device:deviceList:generate')">
      		生成设备
		</el-button>
		<el-dialog :visible.sync="showConfig" title="生成设备" @close="showConfig = false" :append-to-body="true">
			<el-form ref="configData" :model="configData" :rules="formConfigRules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item v-if="!syncRuleIdFromList" :label="'产品类型'" prop="ruleId">
					<el-radio-group v-model="configData.ruleId" @change="ruleIdChange">
						<el-radio v-for="item in deviceRuleOptions" :key="'rule-'+item.value" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'导出条数'" prop="number">
					<el-input v-model="configData.number" clearable placeholder="请输入导出条数" type="number" />
				</el-form-item>
				<el-form-item :label="'编号长度'" prop="length">
					<el-select v-model="configData.length" placeholder="请选择设备号长度" style="width: 100%;">
						<el-option v-for="item in digitData" :key="item.id" :label="item.value + '位'" :value="item.value"
							:disabled="item.disabled">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="'二维码前缀'" prop="deviceQrLink">
					<el-input v-model="configData.deviceQrLink" clearable placeholder="请输入设备二维码前缀"/>
				</el-form-item>
				<el-form-item :label="'设备类型'" prop="deviceTypeId">
					<el-select v-model="configData.deviceTypeId" placeholder="请选择设备类型" filterable clearable
						style="width: 100%;" @change="onDeviceTypeIdChange">
						<el-option v-for="item in deviceTypeOptions" :key="item.deviceTypeId"
							:label="formatDeviceTypeOptionLabel(item)" :value="item.deviceTypeId" />
					</el-select>
					<div v-if="selectedDeviceType" class="form-tip">{{ typeSummaryText }}</div>
				</el-form-item>
				<el-form-item :label="'总功率'" prop="deviceTotalPower">
					<el-input v-model="configData.deviceTotalPower" clearable placeholder="如 120 表示 120kW">
						<template slot="append">kW</template>
					</el-input>
				</el-form-item>
				<el-form-item label="计费规则" prop="deviceChagePattern" v-if="configData.ruleId === 1">
					<el-radio-group v-model="configData.deviceChagePattern" @change="changeChagePattern">
						<el-radio v-for="item in priceTypeOptions" :key="'pt-'+item.value" :label="item.value">{{ item.label }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'收费方案'" prop="devicePriceId">
					<el-select v-model="configData.devicePriceId" class="filter-item" placeholder="请选择收费方案"
						clearable style="width: 100%">
						<el-option v-for="item in devicePriceList" :key="item.id" :label="item.feeName"
							:value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="DownloadConfig('configData')" v-loading.fullscreen.lock="loading">
						确定</el-button>
					<el-button @click="showConfig = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<downloadProgress ref="downloadProgress" />
	</div>
</template>

<script>
	import {
		findDevicePriceByPriceType,
		downLoadDeviceCodes,
	} from '@/api/device/deviceList.js'
	import { createKwValidator } from '@/utils/powerUnit.js'
	import deviceTypePickerMixin from './deviceTypePickerMixin.js'
	import devicePowerKwMixin from './devicePowerKwMixin.js'
	import downloadProgress from '@/components/Common/downloadProgress.vue'

	export default {
		mixins: [deviceTypePickerMixin, devicePowerKwMixin],
		components: {
			downloadProgress
		},
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
					deviceQrLink: '',
					deviceTypeId: '',
					deviceTotalPower: '',
					deviceChagePattern: 0,
					devicePriceId: '',
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
						message: '请选择设备类型',
						trigger: 'change',
					}],
					deviceTotalPower: [{
						required: true,
						message: '请输入设备总功率',
						trigger: 'blur',
					}, {
						validator: createKwValidator('请输入设备总功率', '请输入大于 0 的功率(kW)'),
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
					length: [{
						required: true,
						message: '请选择设备号长度',
						trigger: 'blur',
					}],
					deviceQrLink: [{
						required: true,
						message: '请输入设备二维码前缀',
						trigger: 'blur',
					}],
				},
				operatorList: [],
				devicePriceList: [],
				deviceRuleOptions: [],
				priceTypeOptions: [],
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
		computed: {
			formConfigRules() {
				const r = { ...this.configrules }
				if (!this.syncRuleIdFromList) {
					r.ruleId = [{
						required: true,
						message: '请选择产品',
						trigger: 'blur',
					}]
				}
				return r
			},
			typeSummaryText() {
				const t = this.selectedDeviceType
				if (!t) return ''
				return this.formatDeviceTypeOptionLabel(t) + '（生成后将从类型继承默认参数）'
			}
		},
		methods: {
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
			onShowConfig() {
				if (this.syncRuleIdFromList) {
					this.configData.ruleId = this.listRuleId
				}
				this.showConfig = true
				if (this.syncRuleIdFromList) {
					this.ruleIdChange()
				} else {
					this.loadDeviceTypeOptions(this.configData.ruleId)
					this.getDevicePriceByPriceType()
				}
			},
			ruleIdChange() {
        		this.configData.deviceTypeId = ''
				this.selectedDeviceType = null
				this.configData.devicePriceId = ''
				this.loadDeviceTypeOptions(this.configData.ruleId)
				this.getDevicePriceByPriceType()
			},
			//导出设备配置
			DownloadConfig(formName) {
				this.$refs[formName].validate(valid => {
					if (!valid) {
						this.loading = false
						return false
					}
					const configData = {
						...this.configData,
						deviceTotalPower: this.toApiDeviceTotalPower(this.configData.deviceTotalPower)
					}
					this.loading = true
					downLoadDeviceCodes(configData).then(res => {
						this.loading = false
						if (res.code == 200 && res.data && res.data.id) {
							this.showConfig = false
							this.resetForm(formName)
							this.$message.success(res.msg || '已开始生成，请在下载进度中获取文件')
							this.$refs.downloadProgress.open(res.data.id)
							this.$emit('getLists')
						} else {
							this.$message({ message: (res && res.msg) || '导出失败，请重试', type: 'warning' })
						}
					}).catch(() => {
						this.loading = false
					})
				})
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields()
				this.selectedDeviceType = null
			},
		},
		created() {
			this.$dict.getDeviceRuleOptions().then(list => { this.deviceRuleOptions = list || [] })
			this.$dict.getPriceTypeOptions().then(list => {
				this.priceTypeOptions = (list || []).filter(i => [0, 1, 2].includes(Number(i.value)))
			})
		},
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
