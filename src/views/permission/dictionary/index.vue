<template>
	<div class="app-container dictionary-page">
		<el-row :gutter="20" type="flex" class="dict-row">
			<el-col :span="9" class="dict-col">
				<el-card shadow="never" class="dict-card">
					<div slot="header" class="card-header">
						<span>字典分类</span>
					</div>
					<div class="dict-card-body">
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
						<div class="dict-table-wrap">
							<el-table
								ref="typeTable"
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
								<el-table-column label="操作" width="240" align="center" class-name="table-action-cell">
									<template slot-scope="scope">
										<div class="table-action-btns">
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
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
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
					<div class="dict-card-body">
						<div class="dict-table-wrap">
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
								<el-table-column label="操作" width="240" align="center" class-name="table-action-cell">
									<template slot-scope="scope">
										<div class="table-action-btns">
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
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</div>
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

function collectDescendantIds(list, rootId) {
	const ids = new Set()
	if (!rootId) return ids
	ids.add(rootId)
	const walk = parentId => {
		list.forEach(item => {
			if (String(item.parentId || '0') === String(parentId)) {
				ids.add(item.id)
				walk(item.id)
			}
		})
	}
	walk(rootId)
	return ids
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
			const excluded = collectDescendantIds(this.dataList, this.dataForm.id)
			return this.dataList.filter(item => !excluded.has(item.id))
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
						const row = this.typeList[0]
						this.$nextTick(() => {
							this.handleTypeSelect(row)
							if (this.$refs.typeTable) {
								this.$refs.typeTable.setCurrentRow(row)
							}
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
.dictionary-page {
	--dict-radius: 8px;
	--dict-border: #e8ecf1;
	--dict-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 12px rgba(16, 24, 40, 0.04);
	--dict-accent: #409eff;
	--dict-accent-soft: rgba(64, 158, 255, 0.08);
	/* navbar+tags(84) + app-main padding(30) ≈ 114；本页自带 padding 计入 box */
	height: calc(100vh - 114px);
	box-sizing: border-box;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.dict-row {
	flex: 1;
	min-height: 0;
	height: 100%;
	margin-left: 0 !important;
	margin-right: 0 !important;
	display: flex;
	align-items: stretch;
}

.dict-col {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
}

.dict-card {
	flex: 1;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	min-height: 0;
	border: 1px solid var(--dict-border);
	border-radius: var(--dict-radius);
	box-shadow: var(--dict-shadow);
	overflow: hidden;
}

.dict-card ::v-deep .el-card__header {
	flex-shrink: 0;
	padding: 14px 16px;
	border-bottom: 1px solid var(--dict-border);
	background: #fafbfc;
}

.dict-card ::v-deep .el-card__body {
	flex: 1;
	min-height: 0;
	padding: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.dict-card-body {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.dict-table-wrap {
	flex: 1;
	min-height: 0;
	overflow: auto;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 15px;
	font-weight: 600;
	color: #1f2937;
}

.toolbar {
	flex-shrink: 0;
	margin-bottom: 14px;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 8px;
}

.table-action-btns {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-wrap: nowrap;
	gap: 6px;
	white-space: nowrap;
}

.table-action-btns .el-button + .el-button {
	margin-left: 0;
}

.dictionary-page ::v-deep .el-table {
	border-radius: 6px;
}

.dictionary-page ::v-deep .el-table th {
	background: #f8fafc;
	color: #475569;
	font-weight: 600;
}

.dictionary-page ::v-deep .el-table td,
.dictionary-page ::v-deep .el-table th {
	padding: 10px 0;
}

.dictionary-page ::v-deep .el-table__body tr.current-row > td {
	background: var(--dict-accent-soft) !important;
}

.dictionary-page ::v-deep .el-table__body tr.current-row > td:first-child {
	box-shadow: inset 3px 0 0 var(--dict-accent);
}

.dictionary-page ::v-deep td.table-action-cell {
	padding-left: 8px;
	padding-right: 8px;
}
</style>
