<template>
	<div class="device-type-form-panel">
		<el-form ref="formData" :model="formData" :rules="formRules" label-position="top" class="device-type-form">
			<!-- 基础信息 -->
			<el-card shadow="never" class="form-card">
				<div slot="header" class="form-card__header">
					<div class="form-card__title">
						<i class="el-icon-s-grid form-card__icon" />
						<span>基础信息</span>
					</div>
					<span class="form-card__desc">定义类型归属、名称与端口规模</span>
				</div>
				<el-row :gutter="20">
					<el-col v-if="showTypeId" :span="12">
						<el-form-item label="设备类型 ID" prop="deviceTypeId">
							<el-input v-model="formData.deviceTypeId" disabled />
						</el-form-item>
					</el-col>
					<el-col :span="showTypeId ? 12 : 24">
						<el-form-item label="归属系列" prop="ruleId">
							<el-radio-group v-model="formData.ruleId" :disabled="showTypeId" @change="$emit('rule-change', formData.ruleId)">
								<el-radio v-for="item in deviceRuleOptions" :key="'rule-'+item.value" :label="item.value">{{ item.label }}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col v-if="isCarRule" :span="24">
						<el-form-item label="设备形态" prop="deviceForm">
							<el-radio-group v-model="formData.deviceForm">
								<el-radio v-for="item in deviceFormOptions" :key="'form-'+item.value" :label="item.value">{{ item.label }}</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="设备类型名称" prop="deviceTypeName">
							<el-input v-model="formData.deviceTypeName" clearable placeholder="运营展示名称，如「60kW 双枪直流」" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="端口数" prop="portCount">
							<el-input v-model="formData.portCount" type="number" :disabled="portCountDisabled" clearable placeholder="设备端口总数" @change="syncGunTemplates" />
							<div v-if="portCountDisabled" class="form-tip">创建后不可修改</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="类型状态" prop="typeStatus">
							<el-radio-group v-model="formData.typeStatus">
								<el-radio :label="1">启用</el-radio>
								<el-radio :label="0">停用</el-radio>
							</el-radio-group>
							<div class="form-tip">停用后不可用于新建设备绑定</div>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="formData.remark" type="textarea" :rows="2" clearable placeholder="内部说明（可选）" />
						</el-form-item>
					</el-col>
				</el-row>
			</el-card>

			<!-- 产品档案 -->
			<el-card shadow="never" class="form-card">
				<div slot="header" class="form-card__header">
					<div class="form-card__title">
						<i class="el-icon-box form-card__icon form-card__icon--product" />
						<span>产品档案</span>
					</div>
					<span class="form-card__desc">厂商、型号与接入协议，用于 T/CEC 出站与加桩默认协议</span>
				</div>
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="厂商名称" prop="manufacturerName">
							<el-input v-model="formData.manufacturerName" clearable placeholder="设备生产商名称" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="组织代码" prop="manufacturerId">
							<el-input v-model="formData.manufacturerId" clearable placeholder="T/CEC ManufacturerID（可选）" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="品牌名称" prop="brandName">
							<el-select v-model="formData.brandName" clearable placeholder="请选择品牌（可选）" style="width: 100%;" filterable>
								<el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="硬件型号" prop="equipmentModel">
							<el-input v-model="formData.equipmentModel" clearable placeholder="硬件型号，区别于类型名称" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="接入协议" prop="protocolCode">
							<el-select v-model="formData.protocolCode" placeholder="请选择接入协议" style="width: 100%;" filterable>
								<el-option v-for="item in protocolOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="T/CEC 设备类型" prop="equipmentType">
							<el-select v-model="formData.equipmentType" clearable placeholder="留空由系统自动推导" style="width: 100%;">
								<el-option v-for="item in equipmentTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
				</el-row>
			</el-card>

			<!-- 电气规格 -->
			<el-card shadow="never" class="form-card form-card--last">
				<div slot="header" class="form-card__header">
					<div class="form-card__title">
						<i class="el-icon-lightning form-card__icon form-card__icon--electric" />
						<span>电气规格</span>
					</div>
					<span class="form-card__desc">{{ electricalCardDesc }}</span>
				</div>

				<el-row v-if="showElectricOutField || needsGunTemplate" :gutter="20">
					<el-col v-if="showElectricOutField" :span="12">
						<el-form-item label="电流输出" prop="electricOut">
							<el-select v-model="formData.electricOut" placeholder="请选择电流输出类型" style="width: 100%;">
								<el-option v-for="item in electricOutList" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col v-if="needsGunTemplate" :span="12">
						<el-form-item label="柜体额定功率 (kW)" prop="cabinetRatedPower">
							<el-input v-model="formData.cabinetRatedPower" type="number" clearable placeholder="如 360 表示 360kW">
								<template slot="append">kW</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>

				<template v-if="showHomogeneousFields">
					<el-row :gutter="20">
						<el-col :span="12">
							<el-form-item label="充电速度" prop="chargingType">
								<el-select v-model="formData.chargingType" placeholder="请选择充电速度" style="width: 100%;">
									<el-option v-for="item in chargingTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="单枪默认功率 (kW)" prop="defaultGunPower">
								<el-input v-model="formData.defaultGunPower" type="number" clearable placeholder="如 60 表示 60kW">
									<template slot="append">kW</template>
								</el-input>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="默认电压 (V)" prop="defaultVoltage">
								<el-input v-model="formData.defaultVoltage" type="number" clearable placeholder="请输入默认电压" />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="默认电流 (A)" prop="defaultCurrent">
								<el-input v-model="formData.defaultCurrent" type="number" clearable placeholder="请输入默认电流" />
							</el-form-item>
						</el-col>
					</el-row>
				</template>

				<el-form-item v-if="needsGunTemplate" required label="枪模板配置" class="gun-template-item">
					<div class="gun-template-wrap">
						<el-table :data="gunTemplates" border size="mini" style="width: 100%;">
							<el-table-column prop="gunNumber" label="枪号" width="60" align="center" fixed />
							<el-table-column min-width="120">
								<template slot="header"><span class="col-required">*</span>电流输出</template>
								<template slot-scope="scope">
									<el-select v-model="scope.row.electricOutType" size="mini" placeholder="请选择">
										<el-option v-for="item in templateElectricOutOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</template>
							</el-table-column>
							<el-table-column min-width="120">
								<template slot="header"><span class="col-required">*</span>充电速度</template>
								<template slot-scope="scope">
									<el-select v-model="scope.row.chargingType" size="mini" placeholder="请选择">
										<el-option v-for="item in chargingTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</template>
							</el-table-column>
							<el-table-column min-width="110">
								<template slot="header"><span class="col-required">*</span>功率 (kW)</template>
								<template slot-scope="scope">
									<el-input v-model="scope.row.ratedPower" size="mini" type="number" placeholder="kW" />
								</template>
							</el-table-column>
							<el-table-column min-width="100">
								<template slot="header"><span class="col-required">*</span>电压 (V)</template>
								<template slot-scope="scope">
									<el-input v-model="scope.row.defaultVoltage" size="mini" type="number" />
								</template>
							</el-table-column>
							<el-table-column min-width="100">
								<template slot="header"><span class="col-required">*</span>电流 (A)</template>
								<template slot-scope="scope">
									<el-input v-model="scope.row.defaultCurrent" size="mini" type="number" />
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div class="form-tip">分体式须逐枪配置规格，端口数变更后自动同步行数</div>
				</el-form-item>
			</el-card>
		</el-form>
	</div>
</template>

<script>
import deviceTypeFormMixin from './deviceTypeFormMixin.js'

export default {
	name: 'DeviceTypeFormPanel',
	mixins: [deviceTypeFormMixin],
	props: {
		formData: { type: Object, required: true },
		showTypeId: { type: Boolean, default: false },
		portCountDisabled: { type: Boolean, default: false },
		deviceRuleOptions: { type: Array, default: () => [] },
		electricOutList: { type: Array, default: () => [] },
		chargingTypeOptions: { type: Array, default: () => [] },
		templateElectricOutOptions: { type: Array, default: () => [] }
	},
	data() {
		return {
			gunTemplates: [],
			deviceFormOptions: [
				{ value: 0, label: '一体机' },
				{ value: 1, label: '分体式（分布式）' }
			]
		}
	},
	computed: {
		electricalCardDesc() {
			if (this.needsGunTemplate) {
				return '分体式：柜体总功率 + 逐枪模板配置'
			}
			return '一体机 / 单车：各枪同质电气参数'
		}
	},
	methods: {
		loadGunTemplates(list) {
			this.gunTemplates = Array.isArray(list) ? list : []
		}
	}
}
</script>

<style scoped>
.device-type-form-panel {
	min-height: 100%;
}

.device-type-form ::v-deep .el-form-item {
	margin-bottom: 18px;
}

.device-type-form ::v-deep .el-form-item__label {
	padding-bottom: 6px;
	line-height: 1.4;
	font-weight: 500;
	color: #606266;
}

.form-card {
	margin-bottom: 16px;
	border: 1px solid #ebeef5;
	border-radius: 8px;
}

.form-card--last {
	margin-bottom: 0;
}

.form-card ::v-deep .el-card__header {
	padding: 14px 20px;
	background: #fafbfc;
	border-bottom: 1px solid #ebeef5;
}

.form-card ::v-deep .el-card__body {
	padding: 20px 20px 4px;
}

.form-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 6px 12px;
}

.form-card__title {
	display: flex;
	align-items: center;
	font-size: 15px;
	font-weight: 600;
	color: #303133;
}

.form-card__icon {
	margin-right: 8px;
	font-size: 16px;
	color: #409eff;
}

.form-card__icon--product {
	color: #67c23a;
}

.form-card__icon--electric {
	color: #e6a23c;
}

.form-card__desc {
	font-size: 12px;
	color: #909399;
	line-height: 1.4;
}

.form-tip {
	font-size: 12px;
	color: #909399;
	line-height: 1.5;
	margin-top: 4px;
}

.gun-template-item ::v-deep .el-form-item__label {
	width: 100%;
}

.gun-template-wrap {
	border-radius: 4px;
	overflow: hidden;
}

.col-required {
	color: #f56c6c;
	margin-right: 2px;
}
</style>
