/** 设备类型添加/编辑：按设备形态区分字段显示与校验 */

import { filterDeviceProtocolOptionsByRule } from '@/utils/dictionary.js'



export default {

	data() {

		return {

			allProtocolOptions: [],

			equipmentTypeOptionsList: [],

			brandOptionsList: []

		}

	},

	created() {

		this.loadDeviceTypeProductDicts()

	},

	computed: {

		protocolOptions() {

			return filterDeviceProtocolOptionsByRule(this.allProtocolOptions, this.formData.ruleId)

		},

		equipmentTypeOptions() {

			return this.equipmentTypeOptionsList

		},

		brandOptions() {

			return this.brandOptionsList

		},

		isCarRule() {

			return Number(this.formData.ruleId) === 2

		},

		needsGunTemplate() {

			return this.isCarRule && Number(this.formData.deviceForm) === 1

		},

		/** 一体机 / 单车：同质字段；分体式在枪模板配置 */

		showHomogeneousFields() {

			return !this.needsGunTemplate

		},

		/** 类型级电流输出：仅一体机（含单车），汽车分体式在枪模板逐枪配置 */

		showElectricOutField() {

			return !this.needsGunTemplate

		},

		drawerSize() {

			return this.needsGunTemplate ? '960px' : '780px'

		},

		formRules() {

			const rules = {

				ruleId: [{ required: true, message: '请选择归属系列', trigger: 'change' }],

				deviceTypeName: [{ required: true, message: '请输入设备类型名称', trigger: ['blur', 'change'] }],

				portCount: [

					{ required: true, message: '请输入端口数', trigger: ['blur', 'change'] },

					{ validator: this.checkPortCount, trigger: ['blur', 'change'] }

				]

			}

			if (this.showElectricOutField) {

				rules.electricOut = [{ required: true, message: '请选择电流输出类型', trigger: 'change' }]

			}

			if (this.isCarRule) {

				rules.deviceForm = [{ required: true, message: '请选择设备形态', trigger: 'change' }]

			}

			if (this.needsGunTemplate) {

				rules.cabinetRatedPower = [

					{ required: true, message: '请填写柜体额定功率', trigger: ['blur', 'change'] },

					{ validator: this.checkPositiveNum, trigger: ['blur', 'change'] }

				]

			}

			if (this.showHomogeneousFields) {

				rules.chargingType = [{ required: true, message: '请选择充电速度', trigger: 'change' }]

				rules.defaultGunPower = [

					{ required: true, message: '请填写单枪默认功率', trigger: ['blur', 'change'] },

					{ validator: this.checkPositiveNum, trigger: ['blur', 'change'] }

				]

				rules.defaultVoltage = [

					{ required: true, message: '请填写默认电压', trigger: ['blur', 'change'] },

					{ validator: this.checkPositiveDecimal, trigger: ['blur', 'change'] }

				]

				rules.defaultCurrent = [

					{ required: true, message: '请填写默认电流', trigger: ['blur', 'change'] },

					{ validator: this.checkPositiveDecimal, trigger: ['blur', 'change'] }

				]

			}

			rules.equipmentModel = [{ required: true, message: '请填写硬件型号', trigger: ['blur', 'change'] }]

			rules.protocolCode = [{ required: true, message: '请选择接入协议', trigger: 'change' }]

			return rules

		}

	},

	watch: {

		'formData.ruleId'() {

			const allowed = this.protocolOptions.map(item => item.value)

			if (this.formData.protocolCode && !allowed.includes(this.formData.protocolCode)) {

				this.formData.protocolCode = ''

			}

		},

		'formData.deviceForm'(val) {

			if (Number(val) === 1) {

				this.formData.electricOut = ''

				this.formData.chargingType = ''

				this.formData.defaultGunPower = ''

				this.formData.defaultVoltage = ''

				this.formData.defaultCurrent = ''

			} else {

				this.formData.cabinetRatedPower = ''

				this.gunTemplates = []

			}

			this.syncGunTemplates()

			this.$nextTick(() => {

				if (this.$refs.formData) {

					this.$refs.formData.clearValidate()

				}

			})

		}

	},

	methods: {

		loadDeviceTypeProductDicts() {

			if (!this.$dict) return

			this.$dict.getDeviceProtocolOptions().then(list => {

				this.allProtocolOptions = list || []

			})

			this.$dict.getTcecEquipmentTypeOptions().then(list => {

				this.equipmentTypeOptionsList = list || []

			})

			this.$dict.getDeviceBrandOptions().then(list => {

				this.brandOptionsList = list || []

			})

		},

		checkPortCount(rule, value, callback) {

			if (value === '' || value === null || value === undefined) {

				callback()

				return

			}

			if (!(/(^[1-9]\d*$)/.test(value))) {

				callback(new Error('请输入正整数'))

				return

			}

			callback()

		},

		checkPositiveNum(rule, value, callback) {

			if (value === '' || value === null || value === undefined) {

				callback()

				return

			}

			if (!(/(^[1-9]\d*$)/.test(value))) {

				callback(new Error('请输入正整数'))

				return

			}

			callback()

		},

		checkPositiveDecimal(rule, value, callback) {

			if (value === '' || value === null || value === undefined) {

				callback()

				return

			}

			if (Number(value) <= 0) {

				callback(new Error('请输入大于0的数值'))

				return

			}

			callback()

		},

		syncGunTemplates() {

			if (!this.needsGunTemplate) {

				this.gunTemplates = []

				return

			}

			const count = parseInt(this.formData.portCount, 10)

			if (!count || count <= 0) {

				this.gunTemplates = []

				return

			}

			const existing = {}

			this.gunTemplates.forEach(row => { existing[row.gunNumber] = row })

			const rows = []

			for (let i = 1; i <= count; i++) {

				rows.push(existing[i] || {

					gunNumber: i,

					electricOutType: '',

					chargingType: '',

					ratedPower: '',

					defaultVoltage: '',

					defaultCurrent: ''

				})

			}

			this.gunTemplates = rows

		},

		validateGunTemplates() {

			if (!this.needsGunTemplate) {

				return true

			}

			if (!this.gunTemplates.length) {

				this.$message.error('请配置枪模板')

				return false

			}

			for (const row of this.gunTemplates) {

				const label = row.gunNumber + '号枪'

				if (row.electricOutType === '' || row.electricOutType == null) {

					this.$message.error(label + '：请选择电流输出')

					return false

				}

				if (row.chargingType === '' || row.chargingType == null) {

					this.$message.error(label + '：请选择充电速度')

					return false

				}

				if (row.ratedPower === '' || row.ratedPower == null || Number(row.ratedPower) <= 0) {

					this.$message.error(label + '：请填写额定功率')

					return false

				}

				if (row.defaultVoltage === '' || row.defaultVoltage == null || Number(row.defaultVoltage) <= 0) {

					this.$message.error(label + '：请填写默认电压')

					return false

				}

				if (row.defaultCurrent === '' || row.defaultCurrent == null || Number(row.defaultCurrent) <= 0) {

					this.$message.error(label + '：请填写默认电流')

					return false

				}

			}

			return true

		},

		buildGunTemplates() {
			if (!this.needsGunTemplate || !this.gunTemplates.length) {
				return null
			}
			return this.gunTemplates.map(row => ({
				gunNumber: row.gunNumber,
				electricOutType: Number(row.electricOutType),
				chargingType: Number(row.chargingType),
				ratedPower: Number(row.ratedPower),
				defaultVoltage: row.defaultVoltage,
				defaultCurrent: row.defaultCurrent
			}))
		},
		buildPayload() {
			const payload = { ...this.formData }
			payload.typeStatus = payload.typeStatus === '' || payload.typeStatus == null ? 1 : Number(payload.typeStatus)
			if (payload.equipmentType === '' || payload.equipmentType == null) {
				delete payload.equipmentType
			} else {
				payload.equipmentType = Number(payload.equipmentType)
			}
			payload.portCount = payload.portCount === '' || payload.portCount == null ? null : Number(payload.portCount)
			if (this.needsGunTemplate) {
				delete payload.electricOut
				delete payload.chargingType
				delete payload.defaultGunPower
				delete payload.defaultVoltage
				delete payload.defaultCurrent
				payload.cabinetRatedPower = Number(payload.cabinetRatedPower)
				payload.gunTemplates = this.buildGunTemplates()
			} else {
				delete payload.cabinetRatedPower
				delete payload.gunTemplates
				payload.electricOut = Number(payload.electricOut)
				payload.chargingType = Number(payload.chargingType)
				payload.defaultGunPower = Number(payload.defaultGunPower)
			}
			if (!this.isCarRule) {
				payload.deviceForm = 0
				delete payload.cabinetRatedPower
			}
			return payload
		},

		submitForm(formName, submitFn, onSuccess) {

			const formRef = this.$refs[formName] || (this.$refs.formPanel && this.$refs.formPanel.$refs[formName])

			if (!formRef) return

			formRef.validate(valid => {

				if (!valid || !this.validateGunTemplates()) {

					return

				}

				submitFn(this.buildPayload()).then(res => {

					if (res.code == 200) {

						onSuccess(res)

					} else {

						this.$message.error(res.msg)

					}

				})

			})

		}

	}

}

