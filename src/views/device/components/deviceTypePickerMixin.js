/** 加桩/编辑设备：设备类型下拉（listDeviceTypeSelectOptions） */

import { listDeviceTypeSelectOptions } from '@/api/device/deviceList.js'

export default {
	data() {
		return {
			deviceTypeOptions: [],
			selectedDeviceType: null
		}
	},
	methods: {
		loadDeviceTypeOptions(ruleId, extra = {}) {
			if (ruleId == null || ruleId === '') {
				this.deviceTypeOptions = []
				return Promise.resolve([])
			}
			const params = { ruleId: Number(ruleId) }
			if (extra.portCount != null && extra.portCount !== '') {
				params.portCount = Number(extra.portCount)
			}
			if (extra.electricOut != null && extra.electricOut !== '') {
				params.electricOut = Number(extra.electricOut)
			}
			return listDeviceTypeSelectOptions(params).then(res => {
				if (res.code == 200) {
					this.deviceTypeOptions = res.data || []
				} else {
					this.deviceTypeOptions = []
					this.$message.error(res.msg || '加载设备类型失败')
				}
				return this.deviceTypeOptions
			})
		},
		formatDeviceTypeOptionLabel(item) {
			if (!item) return ''
			const parts = [item.deviceTypeName]
			if (item.ruleId != null) {
				parts.push(this.$dict.formatDeviceRule(item.ruleId))
			}
			if (item.electricOut != null && item.electricOut !== '') {
				parts.push(this.$dict.formatElectricOutType(item.electricOut))
			}
			if (item.portCount != null) {
				parts.push(item.portCount + '口')
			}
			return parts.join(' · ')
		},
		resolveSelectedDeviceType(deviceTypeId) {
			if (!deviceTypeId || !this.deviceTypeOptions.length) {
				this.selectedDeviceType = null
				return null
			}
			const id = Number(deviceTypeId)
			this.selectedDeviceType = this.deviceTypeOptions.find(item => Number(item.deviceTypeId) === id) || null
			return this.selectedDeviceType
		},
		onDeviceTypeIdChange(deviceTypeId) {
			this.resolveSelectedDeviceType(deviceTypeId)
		}
	}
}
