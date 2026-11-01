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

		<div v-if="list.length" class="knowledge-page__list">
			<article
				v-for="row in list"
				:key="row.id"
				class="knowledge-card"
			>
				<div class="knowledge-card__body">
					<div class="knowledge-card__name-row">
						<span class="knowledge-card__name" :title="row.title">{{ row.title }}</span>
						<el-tag v-if="row.enabled" type="success" size="mini">启用</el-tag>
						<el-tag v-else type="info" size="mini">禁用</el-tag>
					</div>
					<code class="knowledge-card__slug">{{ row.slug }}</code>
					<div v-if="tagList(row).length" class="knowledge-card__tags">
						<span
							v-for="(t, idx) in tagList(row)"
							:key="idx"
							class="knowledge-card__tag"
						>{{ t }}</span>
					</div>
					<p class="knowledge-card__desc">{{ previewContent(row) }}</p>
				</div>
				<footer class="knowledge-card__footer">
					<div class="knowledge-card__meta">
						<span class="knowledge-card__meta-label">排序</span>
						<span class="knowledge-card__meta-value">{{ row.sortOrder == null ? 0 : row.sortOrder }}</span>
					</div>
					<div class="knowledge-card__ops">
						<el-button
							size="mini"
							plain
							:icon="canEdit ? 'el-icon-edit' : 'el-icon-view'"
							:disabled="row._saving"
							@click="openEdit(row)"
						>{{ canEdit ? '编辑' : '查看' }}</el-button>
						<el-button
							v-if="canEdit"
							size="mini"
							plain
							type="danger"
							icon="el-icon-delete"
							:disabled="row._saving"
							@click="onDelete(row)"
						>删除</el-button>
						<div class="knowledge-card__switch">
							<span class="knowledge-card__switch-label">启用</span>
							<el-switch
								v-model="row.enabled"
								:disabled="!canEdit || row._saving"
								@change="onToggle(row)"
							/>
						</div>
					</div>
				</footer>
			</article>
		</div>

		<el-empty v-if="!loading && !list.length" description="暂无知识，点击右上角新建或等待空库种子导入" />

		<el-drawer
			:title="drawer.isCreate ? '新建知识' : (canEdit ? '编辑知识' : '查看知识')"
			:visible.sync="drawer.visible"
			direction="rtl"
			size="520px"
			append-to-body
			:wrapper-closable="false"
			custom-class="knowledge-drawer"
			@closed="resetDrawer"
		>
			<div class="knowledge-drawer__inner">
				<div class="knowledge-drawer__body">
					<el-form label-position="top" size="small">
						<el-form-item v-if="drawer.isCreate" label="slug">
							<el-input
								v-model="drawer.form.slug"
								:disabled="!canEdit || drawer.saving"
								placeholder="可选；空则自动生成 kb-时间戳"
							/>
						</el-form-item>
						<el-form-item v-else label="slug">
							<code class="knowledge-page__slug">{{ drawer.form.slug }}</code>
						</el-form-item>
						<el-form-item label="标题" required>
							<el-input
								v-model="drawer.form.title"
								:disabled="!canEdit || drawer.saving"
								maxlength="200"
							/>
						</el-form-item>
						<el-form-item label="标签">
							<el-input
								v-model="drawer.form.tags"
								:disabled="!canEdit || drawer.saving"
								placeholder="逗号分隔，如 枪离线,设备"
							/>
						</el-form-item>
						<el-form-item label="排序">
							<el-input-number
								v-model="drawer.form.sortOrder"
								:disabled="!canEdit || drawer.saving"
								:min="0"
							/>
						</el-form-item>
						<el-form-item label="正文（Markdown）" required>
							<el-input
								v-model="drawer.form.content"
								type="textarea"
								:rows="18"
								:disabled="!canEdit || drawer.saving"
								placeholder="Markdown"
							/>
						</el-form-item>
					</el-form>
				</div>
				<div class="knowledge-drawer__footer">
					<el-button :disabled="drawer.saving" @click="drawer.visible = false">
						{{ canEdit ? '取消' : '关闭' }}
					</el-button>
					<el-button
						v-if="canEdit"
						type="primary"
						:loading="drawer.saving"
						@click="saveDrawer"
					>保存</el-button>
				</div>
			</div>
		</el-drawer>
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
				drawer: {
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
			tagList(row) {
				if (!row || !row.tags) return []
				return String(row.tags).split(',').map(s => s.trim()).filter(Boolean)
			},
			previewContent(row) {
				const raw = (row && row.content) || ''
				return raw.replace(/\s+/g, ' ').trim() || '—'
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
				this.drawer = {
					visible: true,
					isCreate: true,
					saving: false,
					id: null,
					form: { slug: '', title: '', tags: '', sortOrder: 0, content: '' }
				}
			},
			openEdit(row) {
				this.drawer = {
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
			resetDrawer() {
				this.drawer.saving = false
				this.drawer.id = null
			},
			saveDrawer() {
				if (!this.canEdit || this.drawer.saving) return
				const f = this.drawer.form
				if (!f.title || !String(f.title).trim()) {
					this.$message.warning('请填写标题')
					return
				}
				if (!f.content || !String(f.content).trim()) {
					this.$message.warning('请填写正文')
					return
				}
				this.drawer.saving = true
				const payload = {
					title: f.title,
					content: f.content,
					tags: f.tags,
					sortOrder: f.sortOrder
				}
				const req = this.drawer.isCreate
					? createKnowledge(Object.assign({ slug: f.slug || undefined }, payload))
					: updateKnowledge(this.drawer.id, payload)
				req.then(() => {
					this.$message.success('保存成功')
					this.drawer.visible = false
					this.load()
				}).catch(e => {
					this.$message.error(this.errMsg(e, '保存失败'))
				}).finally(() => {
					this.drawer.saving = false
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
.knowledge-page__actions {
	flex-shrink: 0;
}
.knowledge-page__filters {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 16px;
}
.knowledge-page__list {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
}
.knowledge-card {
	display: flex;
	flex-direction: column;
	min-width: 0;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	overflow: hidden;
}
.knowledge-card__body {
	flex: 1;
	padding: 14px 14px 10px;
}
.knowledge-card__name-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
	min-width: 0;
}
.knowledge-card__name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	font-weight: 600;
	color: #334155;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.knowledge-card__slug {
	display: inline-block;
	max-width: 100%;
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 1px 6px;
	border-radius: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.knowledge-card__tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 8px;
}
.knowledge-card__tag {
	font-size: 11px;
	line-height: 1.4;
	color: #475569;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 4px;
	padding: 0 6px;
}
.knowledge-card__desc {
	margin: 8px 0 0;
	min-height: 34px;
	font-size: 12px;
	line-height: 1.45;
	color: #64748b;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
.knowledge-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 10px 14px;
	border-top: 1px solid #f1f5f9;
	background: #fafbfc;
}
.knowledge-card__meta {
	display: flex;
	align-items: center;
	gap: 6px;
	min-width: 0;
}
.knowledge-card__meta-label {
	font-size: 12px;
	color: #94a3b8;
}
.knowledge-card__meta-value {
	font-size: 12px;
	color: #64748b;
}
.knowledge-card__ops {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
	flex-wrap: wrap;
	justify-content: flex-end;
}
.knowledge-card__switch {
	display: flex;
	align-items: center;
	gap: 6px;
}
.knowledge-card__switch-label {
	font-size: 12px;
	color: #64748b;
}
.knowledge-page__slug {
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 2px 6px;
	border-radius: 4px;
}
@media (max-width: 1400px) {
	.knowledge-page__list {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}
@media (max-width: 1100px) {
	.knowledge-page__list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
@media (max-width: 720px) {
	.knowledge-page__list {
		grid-template-columns: 1fr;
	}
	.knowledge-card__footer {
		flex-direction: column;
		align-items: stretch;
	}
	.knowledge-card__ops {
		justify-content: space-between;
	}
}
</style>

<!-- append-to-body 的 drawer 不在本组件 DOM 内，样式不能 scoped -->
<style>
.el-drawer.knowledge-drawer {
	display: flex;
	flex-direction: column;
}
.knowledge-drawer .el-drawer__header {
	flex-shrink: 0;
	margin-bottom: 0;
	padding-bottom: 16px;
}
.knowledge-drawer .el-drawer__body {
	flex: 1;
	min-height: 0;
	padding: 0;
	overflow: hidden;
	box-sizing: border-box;
}
.knowledge-drawer__inner {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
}
.knowledge-drawer__body {
	flex: 1;
	min-height: 0;
	overflow-x: hidden;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
	padding: 0 20px 16px;
	box-sizing: border-box;
}
.knowledge-drawer__footer {
	flex-shrink: 0;
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	padding: 12px 20px;
	border-top: 1px solid #e2e8f0;
	background: #fff;
}
</style>

