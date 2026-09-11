<template>
	<div style="display: inline-block;">
		<el-button size="mini" type="primary" v-if="btnAuthen.permsVerifAuthention(':device:deviceType:updateDeviceType')"
			@click="openDrawer">编辑</el-button>
		<el-drawer
			title="编辑设备类型"
			:visible.sync="showDrawer"
			direction="rtl"
			:size="drawerSize"
			:wrapper-closable="false"
			append-to-body
			custom-class="device-type-drawer"
			@close="onDrawerClose">
			<div class="device-type-drawer__body">
				<device-type-form-panel
					ref="formPanel"
					:form-data="formData"
					show-type-id
					port-count-disabled
					:device-rule-options="deviceRuleOptions"
					:electric-out-list="electricOutList"
					:charging-type-options="chargingTypeOptions"
					:template-electric-out-options="templateElectricOutOptions" />
			</div>
			<div class="device-type-drawer__footer">
				<el-button @click="showDrawer = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">保存</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script>
import { updateDeviceType, findDeviceTypeGunTemplates, countDevicesByDeviceType } from '@/api/device/deviceList.js'
import deviceTypeFormMixin from './deviceTypeFormMixin.js'
import DeviceTypeFormPanel from './DeviceTypeFormPanel.vue'

export default {
	name: 'deviceTypeEditPage',
	components: { DeviceTypeFormPanel },
	mixins: [deviceTypeFormMixin],
	props: {
		row_data: { type: Object }
	},
	data() {
		return {
			showDrawer: false,
			formData: {
				deviceTypeName: '',
				portCount: '',
				deviceTypeId: '',
				electricOut: '',
				ruleId: '',
				deviceForm: 0,
				cabinetRatedPower: '',
				chargingType: '',
				defaultGunPower: '',
				defaultVoltage: '',
				defaultCurrent: '',
				manufacturerId: '',
				manufacturerName: '',
				brandName: '',
				equipmentModel: '',
				protocolCode: '',
				equipmentType: '',
				typeStatus: 1,
				remark: ''
			},
			deviceRuleOptions: [],
			electricOutList: [],
			chargingTypeOptions: [],
			templateElectricOutOptions: []
		}
	},
	methods: {
		openDrawer() {
			const row = this.row_data || {}
			this.formData.deviceTypeName = row.deviceTypeName
			this.formData.portCount = row.portCount
			this.formData.deviceTypeId = row.deviceTypeId
			this.formData.ruleId = row.ruleId
			this.formData.electricOut = row.electricOut != null ? row.electricOut : ''
			this.formData.deviceForm = row.deviceForm != null ? row.deviceForm : 0
			this.formData.cabinetRatedPower = this.toFormPowerKw(row.cabinetRatedPower)
			this.formData.chargingType = row.chargingType != null ? row.chargingType : ''
			this.formData.defaultGunPower = this.toFormPowerKw(row.defaultGunPower)
			this.formData.defaultVoltage = row.defaultVoltage != null ? row.defaultVoltage : ''
			this.formData.defaultCurrent = row.defaultCurrent != null ? row.defaultCurrent : ''
			this.formData.manufacturerId = row.manufacturerId || ''
			this.formData.manufacturerName = row.manufacturerName || ''
			this.formData.brandName = row.brandName || ''
			this.formData.equipmentModel = row.equipmentModel || ''
			this.formData.protocolCode = row.protocolCode || ''
			this.formData.equipmentType = row.equipmentType != null ? row.equipmentType : ''
			this.formData.typeStatus = row.typeStatus != null ? row.typeStatus : 1
			this.formData.remark = row.remark || ''
			this.$dict.getElectricOutOptionsForRule(this.formData.ruleId).then(list => {
				this.electricOutList = list || []
			})
			findDeviceTypeGunTemplates({ deviceTypeId: row.deviceTypeId }).then(res => {
				this.showDrawer = true
				this.$nextTick(() => {
					const panel = this.$refs.formPanel
					if (!panel) return
					if (res.code == 200 && Array.isArray(res.data) && res.data.length) {
						panel.loadGunTemplates(res.data.map(item => ({
							gunNumber: item.gunNumber,
							electricOutType: item.electricOutType,
							chargingType: item.chargingType != null ? item.chargingType : '',
							ratedPower: this.toFormPowerKw(item.ratedPower),
							defaultVoltage: item.defaultVoltage != null ? item.defaultVoltage : '',
							defaultCurrent: item.defaultCurrent != null ? item.defaultCurrent : ''
						})))
					} else {
						panel.syncGunTemplates()
					}
				})
			})
		},
		handleSubmit() {
			const panel = this.$refs.formPanel
			const formRef = panel && panel.$refs.formData
			if (!formRef) return
			formRef.validate(valid => {
				if (!valid || !panel.validateGunTemplates()) {
					return
				}
				const payload = panel.buildPayload()
				countDevicesByDeviceType({ deviceTypeId: payload.deviceTypeId }).then(res => {
					const bound = res.code == 200 ? Number(res.data || 0) : 0
					if (bound <= 0) {
						this.saveDeviceType(payload, false)
						return
					}
					this.$confirm(
						`该类型已绑定 ${bound} 台设备。是否将类型/枪模板参数同步到这些设备的枪？（不修改枪状态与连接状态）`,
						'同步确认',
						{
							confirmButtonText: '保存并同步',
							cancelButtonText: '仅保存模板',
							distinguishCancelAndClose: true,
							type: 'warning'
						}
					).then(() => {
						this.saveDeviceType(payload, true)
					}).catch(action => {
						if (action === 'cancel') {
							this.saveDeviceType(payload, false)
						}
					})
				})
			})
		},
		saveDeviceType(payload, syncBoundDevices) {
			updateDeviceType({
				...payload,
				syncBoundDevices: !!syncBoundDevices
			}).then(res => {
				if (res.code == 200) {
					this.showDrawer = false
					this.$message.success(res.msg || '修改成功')
					this.$emit('getLists')
				} else {
					this.$message.error(res.msg)
				}
			})
		},
		onDrawerClose() {
			const panel = this.$refs.formPanel
			if (panel) {
				panel.loadGunTemplates([])
			}
		}
	},
	created() {
		this.$dict.getDeviceRuleOptions().then(list => { this.deviceRuleOptions = list || [] })
		this.$dict.getSelectorOptions('charging_type', { numeric: true }).then(list => { this.chargingTypeOptions = list || [] })
		this.$dict.getSelectorOptions('electric_out_type', { numeric: true }).then(list => { this.templateElectricOutOptions = list || [] })
	}
}
</script>

<style lang="scss">
.device-type-drawer .el-drawer__body {
	display: flex;
	flex-direction: column;
	padding: 0;
	height: 100%;
	overflow: hidden;
	background: #f5f7fa;
}
.device-type-drawer .el-drawer__header {
	margin-bottom: 0;
	padding: 16px 24px;
	border-bottom: 1px solid #ebeef5;
	background: #fff;
	flex-shrink: 0;
}
</style>

<style scoped>
.device-type-drawer__body {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 16px 20px 20px;
}
.device-type-drawer__footer {
	flex-shrink: 0;
	padding: 12px 24px;
	border-top: 1px solid #ebeef5;
	text-align: right;
	background: #fff;
}
</style>
