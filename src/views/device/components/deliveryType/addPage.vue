<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px;" type="primary" class="filter-item" @click="openDrawer"
			v-if="btnAuthen.permsVerifAuthention(':device:deviceType:saveDeviceType')">添加设备类型
		</el-button>
		<el-drawer
			title="添加设备类型"
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
					:device-rule-options="deviceRuleOptions"
					:electric-out-list="electricOutList"
					:charging-type-options="chargingTypeOptions"
					:template-electric-out-options="templateElectricOutOptions"
					@rule-change="onRuleChange" />
			</div>
			<div class="device-type-drawer__footer">
				<el-button @click="showDrawer = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">保存</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script>
import { saveDeviceType } from '@/api/device/deviceList.js'
import deviceTypeFormMixin from './deviceTypeFormMixin.js'
import DeviceTypeFormPanel from './DeviceTypeFormPanel.vue'

export default {
	name: 'deviceTypeAddPage',
	components: { DeviceTypeFormPanel },
	mixins: [deviceTypeFormMixin],
	data() {
		return {
			showDrawer: false,
			formData: {
				deviceTypeName: '',
				portCount: '',
				electricOut: '',
				ruleId: 1,
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
			this.showDrawer = true
			this.onRuleChange(this.formData.ruleId)
		},
		onRuleChange(ruleId) {
			this.formData.electricOut = ''
			if (Number(ruleId) !== 2) {
				this.formData.deviceForm = 0
				this.formData.cabinetRatedPower = ''
			}
			this.$dict.getElectricOutOptionsForRule(ruleId).then(list => {
				this.electricOutList = list || []
			})
			this.$nextTick(() => {
				if (this.$refs.formPanel) {
					this.$refs.formPanel.syncGunTemplates()
				}
			})
		},
		handleSubmit() {
			const panel = this.$refs.formPanel
			panel.submitForm('formData', saveDeviceType, (res) => {
				this.showDrawer = false
				this.$message.success(res.msg || '添加成功')
				this.resetForm()
				this.$emit('getLists')
			})
		},
		onDrawerClose() {
			this.resetForm()
		},
		resetForm() {
			const panel = this.$refs.formPanel
			if (panel && panel.$refs.formData) {
				panel.$refs.formData.resetFields()
				panel.loadGunTemplates([])
			}
			this.formData.deviceForm = 0
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
/* append-to-body 抽屉须用非 scoped，否则无法作用到 .el-drawer__body */
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
