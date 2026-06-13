<template>
	<div class="app-container feedback-config">
		<div class="toolbar">
			<el-button type="primary" @click="loadTree" size="small">刷新</el-button>
			<!-- <el-button type="warning" @click="confirmImport">从平台模板导入</el-button> -->
			<el-button type="success" @click="openTypeDialog()" size="small">新增</el-button>
		</div>

		<el-row :gutter="20" type="flex" class="config-row">
			<el-col :span="8" class="config-col">
				<el-card shadow="never" class="config-card">
					<div slot="header">反馈类型</div>
					<el-menu class="type-menu" :default-active="String(activeTypeId)" @select="selectType">
						<el-menu-item v-for="item in typeTree" :key="item.id" :index="String(item.id)">
							<span>{{ item.name }}</span>
							<el-tag size="mini" style="margin-left: 8px;" v-if="item.enabled === 0">停用</el-tag>
						</el-menu-item>
					</el-menu>
				</el-card>
			</el-col>
			<el-col :span="16" class="config-col" v-if="activeType">
				<el-card shadow="never" class="config-card">
					<div slot="header">{{ activeType.name }}</div>
					<el-form label-width="100px">
						<el-form-item label="名称">
							<el-input v-model="activeType.name" />
						</el-form-item>
						<el-form-item label="标识">
							<el-input v-model="activeType.typeKey" />
						</el-form-item>
						<el-form-item label="说明">
							<el-input type="textarea" v-model="activeType.description" />
						</el-form-item>
						<el-form-item label="排序">
							<el-input-number v-model="activeType.sort" :min="0" />
						</el-form-item>
						<el-form-item label="启用">
							<el-switch v-model="activeType.enabled" :active-value="1" :inactive-value="0" />
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="saveType">保存</el-button>
							<el-button type="danger" @click="removeType">删除</el-button>
						</el-form-item>
					</el-form>

					<div class="section-header">
						<span class="section-title">问题分类</span>
						<el-button type="primary" size="small" icon="el-icon-plus" @click="openSubTypeDialog()">新增问题分类</el-button>
					</div>
					<el-table :data="activeType.subTypes || []" border size="mini" empty-text="暂无问题分类">
						<el-table-column type="index" width="55" label="序号" align="center" />
						<el-table-column prop="name" label="分类名称" align="center" />
						<el-table-column prop="sort" label="排序" width="100" align="center" />
						<el-table-column prop="enabled" label="状态" width="100" align="center">
							<template slot-scope="scope">
								<el-tag type="success" v-if="scope.row.enabled === 1">启用</el-tag>
								<el-tag type="info" v-else>停用</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="180" align="center">
							<template slot-scope="scope">
								<el-button type="primary" size="small" @click="openSubTypeDialog(scope.row)">编辑</el-button>
								<el-button type="primary" size="small" @click="toggleSubType(scope.row)">
									{{ scope.row.enabled === 1 ? '停用' : '启用' }}
								</el-button>
							</template>
						</el-table-column>
					</el-table>

					<el-divider>扩展字段</el-divider>
					<el-checkbox-group v-model="selectedFieldKeys">
						<div v-for="field in presetFields" :key="field.fieldKey" class="field-row">
							<el-checkbox :label="field.fieldKey">{{ field.label }}</el-checkbox>
							<el-switch v-model="field.required" active-text="必填" inactive-text="选填" :active-value="1" :inactive-value="0" :disabled="!selectedFieldKeys.includes(field.fieldKey)" />
						</div>
					</el-checkbox-group>
					<el-button type="primary" style="margin-top: 12px;" @click="saveFields" size="small">保存扩展字段</el-button>
				</el-card>
			</el-col>
		</el-row>

		<el-dialog title="新增父类型" :visible.sync="typeDialogVisible" width="520px">
			<el-form label-width="100px">
				<el-form-item label="名称"><el-input v-model="newType.name" placeholder="请输入名称"/></el-form-item>
				<el-form-item label="标识"><el-input v-model="newType.typeKey" placeholder="请输入标识"/></el-form-item>
				<el-form-item label="说明"><el-input type="textarea" v-model="newType.description" placeholder="请输入说明"/></el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="typeDialogVisible = false" size="small">取消</el-button>
				<el-button type="primary" @click="createType" size="small">确定</el-button>
			</span>
		</el-dialog>

		<el-dialog :title="subTypeDialogTitle" :visible.sync="subTypeDialogVisible" width="520px">
			<el-form label-width="100px">
				<el-form-item label="分类名称">
					<el-input v-model="subTypeForm.name" placeholder="请输入问题分类名称" />
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="subTypeForm.sort" :min="0" />
				</el-form-item>
				<el-form-item label="启用">
					<el-switch v-model="subTypeForm.enabled" :active-value="1" :inactive-value="0" />
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="subTypeDialogVisible = false" size="small">取消</el-button>
				<el-button type="primary" @click="saveSubTypeDialog" size="small">确定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import {
	getFeedbackTypeTree,
	saveFeedbackType,
	saveFeedbackSubType,
	saveFeedbackTypeFields,
	importFeedbackTemplate,
	deleteFeedbackType
} from '@/api/feedback/feedback.js'

const PRESET_FIELDS = [
	{ fieldKey: 'deviceCode', label: '设备编号', required: 0 },
	{ fieldKey: 'port', label: '枪号/端口', required: 0 },
	{ fieldKey: 'orderNo', label: '订单号', required: 0 },
	{ fieldKey: 'stationName', label: '站点名称', required: 0 }
]

export default {
	name: 'feedbackConfig',
	data() {
		return {
			typeTree: [],
			activeTypeId: null,
			activeType: null,
			presetFields: PRESET_FIELDS.map(item => ({ ...item })),
			selectedFieldKeys: [],
			typeDialogVisible: false,
			newType: { name: '', typeKey: '', description: '', sort: 0, enabled: 1 },
			subTypeDialogVisible: false,
			subTypeForm: { id: null, name: '', sort: 99, enabled: 1 }
		}
	},
	computed: {
		subTypeDialogTitle() {
			return this.subTypeForm.id ? '编辑问题分类' : '新增问题分类'
		}
	},
	created() {
		this.loadTree()
	},
	methods: {
		loadTree() {
			getFeedbackTypeTree().then(res => {
				if (res.code === 200) {
					this.typeTree = res.data || []
					if (this.typeTree.length && !this.activeTypeId) {
						this.selectType(String(this.typeTree[0].id))
					} else if (this.activeTypeId) {
						this.selectType(String(this.activeTypeId))
					}
				}
			})
		},
		selectType(id) {
			this.activeTypeId = Number(id)
			const found = this.typeTree.find(item => item.id === this.activeTypeId)
			this.activeType = found ? JSON.parse(JSON.stringify(found)) : null
			this.syncFields()
		},
		syncFields() {
			const currentFields = (this.activeType && this.activeType.fields) || []
			this.selectedFieldKeys = currentFields.map(item => item.fieldKey)
			this.presetFields = PRESET_FIELDS.map(item => {
				const matched = currentFields.find(f => f.fieldKey === item.fieldKey)
				return { ...item, required: matched ? matched.required : 0 }
			})
		},
		saveType() {
			saveFeedbackType(this.activeType).then(res => {
				if (res.code === 200) {
					this.$message.success('保存成功')
					this.loadTree()
				}
			})
		},
		removeType() {
			this.$confirm('确认删除该父类型及其子分类？', '提示').then(() => {
				deleteFeedbackType(this.activeType.id).then(res => {
					if (res.code === 200) {
						this.$message.success('删除成功')
						this.activeTypeId = null
						this.activeType = null
						this.loadTree()
					}
				})
			})
		},
		openSubTypeDialog(row) {
			if (!this.activeType) return
			this.subTypeForm = row
				? { id: row.id, name: row.name, sort: row.sort || 0, enabled: row.enabled == null ? 1 : row.enabled }
				: { id: null, name: '', sort: 99, enabled: 1 }
			this.subTypeDialogVisible = true
		},
		saveSubTypeDialog() {
			if (!this.subTypeForm.name) {
				this.$message.warning('请输入问题分类名称')
				return
			}
			const payload = { ...this.subTypeForm, typeId: this.activeType.id }
			saveFeedbackSubType(payload).then(res => {
				if (res.code === 200) {
					this.$message.success('保存成功')
					this.subTypeDialogVisible = false
					this.loadTree()
				}
			})
		},
		toggleSubType(row) {
			const payload = { ...row, typeId: this.activeType.id, enabled: row.enabled === 1 ? 0 : 1 }
			saveFeedbackSubType(payload).then(res => {
				if (res.code === 200) {
					this.$message.success('保存成功')
					this.loadTree()
				}
			})
		},
		saveFields() {
			const fields = this.presetFields
				.filter(item => this.selectedFieldKeys.includes(item.fieldKey))
				.map((item, index) => ({
					fieldKey: item.fieldKey,
					required: item.required,
					sort: index + 1
				}))
			saveFeedbackTypeFields(this.activeType.id, fields).then(res => {
				if (res.code === 200) {
					this.$message.success('保存成功')
					this.loadTree()
				}
			})
		},
		openTypeDialog() {
			this.newType = { name: '', typeKey: '', description: '', sort: 0, enabled: 1 }
			this.typeDialogVisible = true
		},
		createType() {
			saveFeedbackType(this.newType).then(res => {
				if (res.code === 200) {
					this.typeDialogVisible = false
					this.loadTree()
				}
			})
		},
		confirmImport() {
			this.$confirm('重新导入将覆盖当前租户配置，是否继续？', '提示', { type: 'warning' }).then(() => {
				importFeedbackTemplate().then(res => {
					if (res.code === 200) {
						this.$message.success('导入成功')
						this.activeTypeId = null
						this.activeType = null
						this.loadTree()
					}
				})
			})
		}
	}
}
</script>

<style scoped>
.toolbar { margin-bottom: 16px; }
.sub-row, .field-row { display: flex; align-items: center; margin-bottom: 10px; }
.field-row { gap: 16px; }

.config-row {
	display: flex;
	align-items: stretch;
}
.config-col {
	display: flex;
	flex-direction: column;
}
.config-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	width: 100%;
}
.config-card ::v-deep .el-card__body {
	flex: 1;
}
.type-menu {
	border-right: none;
	min-height: 100%;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 24px 0 16px;
	padding-top: 8px;
	border-top: 1px solid #ebeef5;
}
.section-title {
	font-size: 14px;
	font-weight: 600;
	color: #303133;
}
</style>
