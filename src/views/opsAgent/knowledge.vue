<template>
	<div class="app-container knowledge-page" v-loading="loading">
		<div class="knowledge-page__header">
			<div class="knowledge-page__titles">
				<h2 class="knowledge-page__title">Ops Agent 知识库</h2>
				<p class="knowledge-page__desc">
					维护助手可检索的 SOP。保存后立即生效，无需重启。禁用后仍可在列表中看到，但不会被检索到。
				</p>
			</div>
			<div class="knowledge-page__actions">
				<el-button icon="el-icon-refresh" @click="load">刷新</el-button>
				<el-button
					v-if="canEdit"
					type="primary"
					icon="el-icon-plus"
					@click="openCreate"
				>新建</el-button>
			</div>
		</div>

		<div class="knowledge-page__filters">
			<el-input
				v-model="filters.q"
				size="small"
				clearable
				placeholder="搜索标题/正文/slug"
				style="width: 220px;"
				@keyup.enter.native="load"
			/>
			<el-input
				v-model="filters.tag"
				size="small"
				clearable
				placeholder="标签"
				style="width: 140px;"
				@keyup.enter.native="load"
			/>
			<el-select
				v-model="filters.enabled"
				size="small"
				clearable
				placeholder="启用状态"
				style="width: 120px;"
			>
				<el-option label="已启用" :value="true" />
				<el-option label="已禁用" :value="false" />
			</el-select>
			<el-button size="small" type="primary" @click="load">查询</el-button>
		</div>

		<el-table :data="list" border stripe>
			<el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
			<el-table-column prop="slug" label="slug" min-width="140" show-overflow-tooltip />
			<el-table-column prop="tags" label="标签" min-width="120" show-overflow-tooltip>
				<template slot-scope="{ row }">{{ row.tags || '—' }}</template>
			</el-table-column>
			<el-table-column prop="sortOrder" label="排序" width="80" align="center" />
			<el-table-column label="启用" width="90" align="center">
				<template slot-scope="{ row }">
					<el-switch
						v-model="row.enabled"
						:disabled="!canEdit || row._saving"
						@change="onToggle(row)"
					/>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="160" align="center" fixed="right">
				<template slot-scope="{ row }">
					<el-button type="text" size="mini" @click="openEdit(row)">{{ canEdit ? '编辑' : '查看' }}</el-button>
					<el-button
						v-if="canEdit"
						type="text"
						size="mini"
						style="color: #f56c6c;"
						:disabled="row._saving"
						@click="onDelete(row)"
					>删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog
			:title="dialog.isCreate ? '新建知识' : (canEdit ? '编辑知识' : '查看知识')"
			:visible.sync="dialog.visible"
			width="720px"
			append-to-body
			:close-on-click-modal="false"
			@closed="resetDialog"
		>
			<el-form label-width="80px" size="small">
				<el-form-item v-if="dialog.isCreate" label="slug">
					<el-input
						v-model="dialog.form.slug"
						:disabled="!canEdit || dialog.saving"
						placeholder="可选；空则自动生成 kb-时间戳"
					/>
				</el-form-item>
				<el-form-item v-else label="slug">
					<code class="knowledge-page__slug">{{ dialog.form.slug }}</code>
				</el-form-item>
				<el-form-item label="标题" required>
					<el-input v-model="dialog.form.title" :disabled="!canEdit || dialog.saving" maxlength="200" />
				</el-form-item>
				<el-form-item label="标签">
					<el-input
						v-model="dialog.form.tags"
						:disabled="!canEdit || dialog.saving"
						placeholder="逗号分隔，如 枪离线,设备"
					/>
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="dialog.form.sortOrder" :disabled="!canEdit || dialog.saving" :min="0" />
				</el-form-item>
				<el-form-item label="正文" required>
					<el-input
						v-model="dialog.form.content"
						type="textarea"
						:rows="14"
						:disabled="!canEdit || dialog.saving"
						placeholder="Markdown"
					/>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button :disabled="dialog.saving" @click="dialog.visible = false">{{ canEdit ? '取消' : '关闭' }}</el-button>
				<el-button
					v-if="canEdit"
					type="primary"
					:loading="dialog.saving"
					@click="saveDialog"
				>保存</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		listKnowledge,
		createKnowledge,
		updateKnowledge,
		enableKnowledge,
		deleteKnowledge
	} from '@/api/opsAgent/knowledge'

	export default {
		name: 'opsAgentKnowledge',
		data() {
			return {
				loading: false,
				list: [],
				filters: {
					q: '',
					tag: '',
					enabled: null
				},
				dialog: {
					visible: false,
					isCreate: false,
					saving: false,
					id: null,
					form: {
						slug: '',
						title: '',
						tags: '',
						sortOrder: 0,
						content: ''
					}
				}
			}
		},
		computed: {
			canEdit() {
				return this.btnAuthen.permsVerifAuthention(':agent:knowledge:edit')
			}
		},
		created() {
			this.load()
		},
		methods: {
			errMsg(e, fallback) {
				const data = e && e.response && e.response.data
				return (data && (data.msg || data.message)) || fallback
			},
			normalizeRows(rows) {
				return (rows || []).map(item => Object.assign({}, item, {
					enabled: item.enabled === true || item.enabled === 1,
					_saving: false,
					_origEnabled: item.enabled === true || item.enabled === 1
				}))
			},
			load() {
				this.loading = true
				const params = {}
				if (this.filters.q) params.q = this.filters.q
				if (this.filters.tag) params.tag = this.filters.tag
				if (this.filters.enabled === true || this.filters.enabled === false) {
					params.enabled = this.filters.enabled
				}
				listKnowledge(params).then(res => {
					const rows = Array.isArray(res) ? res : (res && res.code === 200 ? res.data : null)
					if (Array.isArray(rows)) {
						this.list = this.normalizeRows(rows)
					} else {
						this.$message.error((res && res.msg) || '加载失败')
					}
				}).catch(e => {
					this.$message.error(this.errMsg(e, '加载失败'))
				}).finally(() => {
					this.loading = false
				})
			},
			openCreate() {
				this.dialog = {
					visible: true,
					isCreate: true,
					saving: false,
					id: null,
					form: { slug: '', title: '', tags: '', sortOrder: 0, content: '' }
				}
			},
			openEdit(row) {
				this.dialog = {
					visible: true,
					isCreate: false,
					saving: false,
					id: row.id,
					form: {
						slug: row.slug || '',
						title: row.title || '',
						tags: row.tags || '',
						sortOrder: row.sortOrder == null ? 0 : row.sortOrder,
						content: row.content || ''
					}
				}
			},
			resetDialog() {
				this.dialog.saving = false
				this.dialog.id = null
			},
			saveDialog() {
				if (!this.canEdit || this.dialog.saving) return
				const f = this.dialog.form
				if (!f.title || !String(f.title).trim()) {
					this.$message.warning('请填写标题')
					return
				}
				if (!f.content || !String(f.content).trim()) {
					this.$message.warning('请填写正文')
					return
				}
				this.dialog.saving = true
				const payload = {
					title: f.title,
					content: f.content,
					tags: f.tags,
					sortOrder: f.sortOrder
				}
				const req = this.dialog.isCreate
					? createKnowledge(Object.assign({ slug: f.slug || undefined }, payload))
					: updateKnowledge(this.dialog.id, payload)
				req.then(() => {
					this.$message.success('保存成功')
					this.dialog.visible = false
					this.load()
				}).catch(e => {
					this.$message.error(this.errMsg(e, '保存失败'))
				}).finally(() => {
					this.dialog.saving = false
				})
			},
			onToggle(row) {
				row._saving = true
				enableKnowledge(row.id, row.enabled).then(() => {
					row._origEnabled = row.enabled
					this.$message.success('已更新')
				}).catch(e => {
					row.enabled = row._origEnabled
					this.$message.error(this.errMsg(e, '更新失败'))
				}).finally(() => {
					row._saving = false
				})
			},
			onDelete(row) {
				this.$confirm(`确认删除「${row.title}」？删除后不可恢复。`, '删除确认', {
					type: 'warning'
				}).then(() => {
					row._saving = true
					return deleteKnowledge(row.id)
				}).then(() => {
					this.$message.success('已删除')
					this.load()
				}).catch(e => {
					if (e === 'cancel' || e === 'close') return
					this.$message.error(this.errMsg(e, '删除失败'))
				}).finally(() => {
					row._saving = false
				})
			}
		}
	}
</script>

<style scoped>
.knowledge-page__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 16px;
}
.knowledge-page__title {
	margin: 0 0 6px;
	font-size: 18px;
	font-weight: 600;
	color: #334155;
}
.knowledge-page__desc {
	margin: 0;
	max-width: 640px;
	font-size: 13px;
	line-height: 1.5;
	color: #64748b;
}
.knowledge-page__filters {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 12px;
}
.knowledge-page__slug {
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 2px 6px;
	border-radius: 4px;
}
</style>
