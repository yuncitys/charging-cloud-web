<template>
	<div class="app-container dictionary-page">
		<el-row :gutter="20" type="flex" class="dict-row">
			<el-col :span="9" class="dict-col">
				<el-card shadow="never" class="dict-card">
					<div slot="header" class="card-header">
						<span>字典分类</span>
					</div>
					<div class="toolbar">
						<el-input
							v-model="typeKeyword"
							placeholder="搜索名称/编码"
							clearable
							size="small"
							style="width: 180px; margin-right: 8px;"
							@keyup.enter.native="loadTypes"
							@clear="loadTypes"
						/>
						<el-button type="primary" size="small" @click="loadTypes">查询</el-button>
						<el-button
							type="success"
							size="small"
							v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryType:add')"
							@click="openTypeDialog()"
						>新增</el-button>
					</div>
					<el-table
						v-loading="typeLoading"
						:data="typeList"
						highlight-current-row
						size="mini"
						border
						@current-change="handleTypeSelect"
					>
						<el-table-column prop="fullName" label="名称" min-width="120" show-overflow-tooltip />
						<el-table-column prop="enCode" label="编码" min-width="100" show-overflow-tooltip />
						<el-table-column prop="enabledMark" label="状态" width="70" align="center">
							<template slot-scope="scope">
								<el-tag :type="scope.row.enabledMark === 1 ? 'success' : 'info'" size="mini">
									{{ scope.row.enabledMark === 1 ? '启用' : '停用' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="180" align="center">
							<template slot-scope="scope">
								<el-button
									type="primary"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryType:edit')"
									@click.stop="openTypeDialog(scope.row)"
								>编辑</el-button>
								<el-button
									type="warning"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryType:edit')"
									@click.stop="toggleTypeState(scope.row)"
								>{{ scope.row.enabledMark === 1 ? '停用' : '启用' }}</el-button>
								<el-button
									type="danger"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryType:delete')"
									@click.stop="removeType(scope.row)"
								>删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-col>

			<el-col :span="15" class="dict-col">
				<el-card shadow="never" class="dict-card">
					<div slot="header" class="card-header">
						<span>{{ selectedType ? selectedType.fullName : '字典数据' }}</span>
						<el-button
							type="success"
							size="small"
							:disabled="!selectedType"
							v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryData:add')"
							@click="openDataDialog()"
						>新增数据</el-button>
					</div>
					<el-table
						v-loading="dataLoading"
						:data="dataTree"
						size="mini"
						border
						row-key="id"
						:tree-props="isTreeType ? { children: 'children', hasChildren: 'hasChildren' } : undefined"
						empty-text="请选择左侧字典分类"
					>
						<el-table-column prop="fullName" label="名称" min-width="140" show-overflow-tooltip />
						<el-table-column prop="enCode" label="编码" min-width="100" show-overflow-tooltip />
						<el-table-column prop="sortCode" label="排序" width="70" align="center" />
						<el-table-column prop="isDefault" label="默认" width="70" align="center">
							<template slot-scope="scope">
								<el-tag v-if="scope.row.isDefault === 1" type="warning" size="mini">是</el-tag>
								<span v-else>-</span>
							</template>
						</el-table-column>
						<el-table-column prop="enabledMark" label="状态" width="70" align="center">
							<template slot-scope="scope">
								<el-tag :type="scope.row.enabledMark === 1 ? 'success' : 'info'" size="mini">
									{{ scope.row.enabledMark === 1 ? '启用' : '停用' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="200" align="center">
							<template slot-scope="scope">
								<el-button
									type="primary"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryData:edit')"
									@click="openDataDialog(scope.row)"
								>编辑</el-button>
								<el-button
									type="warning"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryData:edit')"
									@click="toggleDataState(scope.row)"
								>{{ scope.row.enabledMark === 1 ? '停用' : '启用' }}</el-button>
								<el-button
									type="danger"
									size="mini"
									v-if="btnAuthen.permsVerifAuthention(':permission:dictionaryData:delete')"
									@click="removeData(scope.row)"
								>删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-col>
		</el-row>

		<el-dialog :title="typeDialogTitle" :visible.sync="typeDialogVisible" width="520px">
			<el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
				<el-form-item label="名称" prop="fullName">
					<el-input v-model="typeForm.fullName" placeholder="请输入分类名称" />
				</el-form-item>
				<el-form-item label="编码" prop="enCode">
					<el-input v-model="typeForm.enCode" placeholder="请输入分类编码" :disabled="!!typeForm.id" />
				</el-form-item>
				<el-form-item label="树形结构">
					<el-switch v-model="typeForm.isTree" :active-value="1" :inactive-value="0" />
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="typeForm.sortCode" :min="0" />
				</el-form-item>
				<el-form-item label="启用">
					<el-switch v-model="typeForm.enabledMark" :active-value="1" :inactive-value="0" />
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="typeForm.description" placeholder="请输入描述" />
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button size="small" @click="typeDialogVisible = false">取消</el-button>
				<el-button type="primary" size="small" @click="submitType">确定</el-button>
			</span>
		</el-dialog>

		<el-dialog :title="dataDialogTitle" :visible.sync="dataDialogVisible" width="520px">
			<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px">
				<el-form-item label="名称" prop="fullName">
					<el-input v-model="dataForm.fullName" placeholder="请输入数据名称" />
				</el-form-item>
				<el-form-item label="编码" prop="enCode">
					<el-input v-model="dataForm.enCode" placeholder="请输入数据编码" />
				</el-form-item>
				<el-form-item label="上级" v-if="isTreeType">
					<el-select v-model="dataForm.parentId" placeholder="请选择上级" clearable style="width: 100%;">
						<el-option label="顶级" value="0" />
						<el-option
							v-for="item in parentOptions"
							:key="item.id"
							:label="item.fullName"
							:value="item.id"
							:disabled="item.id === dataForm.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="dataForm.sortCode" :min="0" />
				</el-form-item>
				<el-form-item label="默认项">
					<el-switch v-model="dataForm.isDefault" :active-value="1" :inactive-value="0" />
				</el-form-item>
				<el-form-item label="启用">
					<el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="dataForm.description" placeholder="请输入描述" />
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button size="small" @click="dataDialogVisible = false">取消</el-button>
				<el-button type="primary" size="small" @click="submitData">确定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import {
	listDictionaryType,
	createDictionaryType,
	updateDictionaryType,
	deleteDictionaryType,
	updateDictionaryTypeState
} from '@/api/permission/dictionaryType.js'
import {
	listDictionaryData,
	createDictionaryData,
	updateDictionaryData,
	deleteDictionaryData,
	updateDictionaryDataState
} from '@/api/permission/dictionaryData.js'

function defaultTypeForm() {
	return {
		id: null,
		fullName: '',
		enCode: '',
		isTree: 0,
		description: '',
		sortCode: 0,
		enabledMark: 1
	}
}

function defaultDataForm() {
	return {
		id: null,
		fullName: '',
		enCode: '',
		parentId: '0',
		dictionaryTypeId: '',
		sortCode: 0,
		enabledMark: 1,
		isDefault: 0,
		description: ''
	}
}

function buildTree(list, parentId = '0') {
	return list
		.filter(item => String(item.parentId || '0') === String(parentId))
		.map(item => {
			const children = buildTree(list, item.id)
			if (children.length) {
				return { ...item, children, hasChildren: true, isLeaf: false }
			}
			return item
		})
}

export default {
	name: 'dictionary',
	data() {
		return {
			typeKeyword: '',
			typeLoading: false,
			typeList: [],
			selectedType: null,
			dataLoading: false,
			dataList: [],
			typeDialogVisible: false,
			typeForm: defaultTypeForm(),
			typeRules: {
				fullName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
				enCode: [{ required: true, message: '请输入分类编码', trigger: 'blur' }]
			},
			dataDialogVisible: false,
			dataForm: defaultDataForm(),
			dataRules: {
				fullName: [{ required: true, message: '请输入数据名称', trigger: 'blur' }],
				enCode: [{ required: true, message: '请输入数据编码', trigger: 'blur' }]
			}
		}
	},
	computed: {
		typeDialogTitle() {
			return this.typeForm.id ? '编辑字典分类' : '新增字典分类'
		},
		dataDialogTitle() {
			return this.dataForm.id ? '编辑字典数据' : '新增字典数据'
		},
		isTreeType() {
			return this.selectedType && this.selectedType.isTree === 1
		},
		dataTree() {
			if (!this.dataList.length) return []
			if (this.isTreeType) {
				return buildTree(this.dataList)
			}
			return this.dataList
		},
		parentOptions() {
			return this.dataList.filter(item => item.id !== this.dataForm.id)
		}
	},
	created() {
		this.loadTypes()
	},
	methods: {
		defaultTypeForm() {
			return defaultTypeForm()
		},
		defaultDataForm() {
			return defaultDataForm()
		},
		loadTypes() {
			this.typeLoading = true
			listDictionaryType({ keyword: this.typeKeyword || undefined }).then(res => {
				if (res.code === 200) {
					this.typeList = res.data || []
					if (this.selectedType) {
						const matched = this.typeList.find(item => item.id === this.selectedType.id)
						this.selectedType = matched || null
						if (matched) {
							this.loadData()
						} else {
							this.dataList = []
						}
					} else if (this.typeList.length) {
						this.$nextTick(() => {
							this.handleTypeSelect(this.typeList[0])
						})
					}
				} else {
					this.$message.error(res.msg)
				}
			}).finally(() => {
				this.typeLoading = false
			})
		},
		handleTypeSelect(row) {
			this.selectedType = row || null
			if (row) {
				this.loadData()
			} else {
				this.dataList = []
			}
		},
		loadData() {
			if (!this.selectedType) return
			this.dataLoading = true
			listDictionaryData({ typeId: this.selectedType.id }).then(res => {
				if (res.code === 200) {
					this.dataList = res.data || []
				} else {
					this.$message.error(res.msg)
				}
			}).finally(() => {
				this.dataLoading = false
			})
		},
		openTypeDialog(row) {
			this.typeForm = row
				? { ...this.defaultTypeForm(), ...row }
				: this.defaultTypeForm()
			this.typeDialogVisible = true
			this.$nextTick(() => {
				if (this.$refs.typeFormRef) this.$refs.typeFormRef.clearValidate()
			})
		},
		submitType() {
			this.$refs.typeFormRef.validate(valid => {
				if (!valid) return
				const payload = {
					fullName: this.typeForm.fullName,
					enCode: this.typeForm.enCode,
					isTree: this.typeForm.isTree,
					description: this.typeForm.description,
					sortCode: this.typeForm.sortCode,
					enabledMark: this.typeForm.enabledMark
				}
				const req = this.typeForm.id
					? updateDictionaryType(this.typeForm.id, payload)
					: createDictionaryType(payload)
				req.then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg || '保存成功')
						this.typeDialogVisible = false
						this.loadTypes()
					} else {
						this.$message.error(res.msg)
					}
				})
			})
		},
		toggleTypeState(row) {
			const enabledMark = row.enabledMark === 1 ? 0 : 1
			updateDictionaryTypeState(row.id, enabledMark).then(res => {
				if (res.code === 200) {
					this.$message.success(res.msg || '更新成功')
					this.loadTypes()
				} else {
					this.$message.error(res.msg)
				}
			})
		},
		removeType(row) {
			this.$confirm('删除后不可恢复，是否继续？', '警告', { type: 'warning' }).then(() => {
				deleteDictionaryType(row.id).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg || '删除成功')
						if (this.selectedType && this.selectedType.id === row.id) {
							this.selectedType = null
							this.dataList = []
						}
						this.loadTypes()
					} else {
						this.$message.error(res.msg)
					}
				})
			})
		},
		openDataDialog(row) {
			if (!this.selectedType) {
				this.$message.warning('请先选择字典分类')
				return
			}
			this.dataForm = row
				? { ...this.defaultDataForm(), ...row, dictionaryTypeId: this.selectedType.id }
				: { ...this.defaultDataForm(), dictionaryTypeId: this.selectedType.id }
			this.dataDialogVisible = true
			this.$nextTick(() => {
				if (this.$refs.dataFormRef) this.$refs.dataFormRef.clearValidate()
			})
		},
		submitData() {
			this.$refs.dataFormRef.validate(valid => {
				if (!valid) return
				const payload = {
					fullName: this.dataForm.fullName,
					enCode: this.dataForm.enCode,
					parentId: this.isTreeType ? (this.dataForm.parentId || '0') : '0',
					dictionaryTypeId: this.selectedType.id,
					sortCode: this.dataForm.sortCode,
					enabledMark: this.dataForm.enabledMark,
					isDefault: this.dataForm.isDefault,
					description: this.dataForm.description
				}
				const req = this.dataForm.id
					? updateDictionaryData(this.dataForm.id, payload)
					: createDictionaryData(payload)
				req.then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg || '保存成功')
						this.dataDialogVisible = false
						this.loadData()
					} else {
						this.$message.error(res.msg)
					}
				})
			})
		},
		toggleDataState(row) {
			const enabledMark = row.enabledMark === 1 ? 0 : 1
			updateDictionaryDataState(row.id, enabledMark).then(res => {
				if (res.code === 200) {
					this.$message.success(res.msg || '更新成功')
					this.loadData()
				} else {
					this.$message.error(res.msg)
				}
			})
		},
		removeData(row) {
			this.$confirm('删除后不可恢复，是否继续？', '警告', { type: 'warning' }).then(() => {
				deleteDictionaryData(row.id).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg || '删除成功')
						this.loadData()
					} else {
						this.$message.error(res.msg)
					}
				})
			})
		}
	}
}
</script>

<style scoped lang="scss">
.dict-row {
	display: flex;
	align-items: stretch;
}

.dict-col {
	display: flex;
	flex-direction: column;
}

.dict-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.dict-card ::v-deep .el-card__body {
	flex: 1;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.toolbar {
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
}
</style>
