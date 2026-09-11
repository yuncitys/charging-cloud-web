<template>
	<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneEdit')" style="display: inline-block;">
		<el-button type="warning" size="mini" @click="openDialog">
			{{ actionLabel }}
		</el-button>
		<el-dialog :visible.sync="showDialog" :title="actionLabel" width="520px" append-to-body @close="onClose">
			<el-form ref="formData" :model="formData" :rules="rules" label-width="90px">
				<el-form-item label="设备号">
					<el-input :value="row_data.deviceCode" disabled />
				</el-form-item>
				<el-form-item label="端口数">
					<el-input :value="portCountText" disabled />
				</el-form-item>
				<el-form-item label="设备类型" prop="deviceTypeId">
					<el-select v-model="formData.deviceTypeId" placeholder="请选择设备类型" filterable clearable
						style="width: 100%;" @change="onDeviceTypeIdChange">
						<el-option v-for="item in deviceTypeOptions" :key="item.deviceTypeId"
							:label="formatDeviceTypeOptionLabel(item)" :value="item.deviceTypeId" />
					</el-select>
					<div v-if="selectedDeviceType" class="form-tip">{{ typeSummaryText }}</div>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="showDialog = false">取消</el-button>
				<el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { bindDeviceType } from '@/api/device/deviceList.js'
import deviceTypePickerMixin from '@/views/device/components/deviceTypePickerMixin.js'

export default {
	name: 'BindInterconnectionDeviceType',
	mixins: [deviceTypePickerMixin],
	props: {
		row_data: { type: Object, required: true }
	},
	data() {
		return {
			showDialog: false,
			submitting: false,
			formData: { deviceTypeId: '' },
			rules: {
				deviceTypeId: [{ required: true, message: '请选择设备类型', trigger: 'change' }]
			}
		}
	},
	computed: {
		hasDeviceType() {
			return !!this.row_data.deviceTypeId
		},
		actionLabel() {
			return this.hasDeviceType ? '换绑类型' : '绑定类型'
		},
		portCountText() {
			const n = Number(this.row_data.portCount)
			return n > 0 ? n + ' 口' : '-'
		},
		typeSummaryText() {
			const t = this.selectedDeviceType
			if (!t) return ''
			return this.formatDeviceTypeOptionLabel(t) + ' · 绑定后将同步枪规格'
		}
	},
	methods: {
		openDialog() {
			this.formData.deviceTypeId = this.row_data.deviceTypeId ? Number(this.row_data.deviceTypeId) : ''
			this.showDialog = true
			const ruleId = this.row_data.ruleId != null ? this.row_data.ruleId : 2
			const portCount = this.row_data.portCount
			this.loadDeviceTypeOptions(ruleId, { portCount }).then(() => {
				this.resolveSelectedDeviceType(this.formData.deviceTypeId)
			})
		},
		onClose() {
			this.formData.deviceTypeId = ''
			this.selectedDeviceType = null
		},
		handleSubmit() {
			this.$refs.formData.validate(valid => {
				if (!valid) return
				const oldTypeId = this.row_data.deviceTypeId ? String(this.row_data.deviceTypeId) : ''
				const newTypeId = String(this.formData.deviceTypeId)
				const doBind = () => {
					this.submitting = true
					bindDeviceType({
						id: this.row_data.id,
						deviceTypeId: this.formData.deviceTypeId
					}).then(res => {
						this.submitting = false
						if (res.code == 200) {
							this.showDialog = false
							this.$message.success(res.msg || '绑定成功')
							this.$emit('getLists')
						} else {
							this.$message.error(res.msg)
						}
					}).catch(() => {
						this.submitting = false
					})
				}
				if (oldTypeId && oldTypeId !== newTypeId) {
					this.$confirm(
						'换类型将同步枪的输出类型、充电分类及功率等规格（不修改枪状态与连接状态）。是否继续？',
						'换类型确认',
						{ confirmButtonText: '继续', cancelButtonText: '取消', type: 'warning' }
					).then(doBind).catch(() => {})
					return
				}
				doBind()
			})
		}
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
