<template>
	<div class="app-container tool-pool-page" v-loading="loading">
		<div class="tool-pool-page__header">
			<div class="tool-pool-page__titles">
				<h2 class="tool-pool-page__title">Ops Agent 工具池</h2>
				<p class="tool-pool-page__desc">
					控制助手可调用的工具。关闭后不可用；权限码为空表示不额外校验。「同步目录」把代码中的工具写入工具池。
				</p>
			</div>
			<div class="tool-pool-page__actions">
				<el-button icon="el-icon-refresh" @click="load">刷新</el-button>
				<el-button
					v-if="btnAuthen.permsVerifAuthention(':agent:toolPool:edit')"
					type="primary"
					icon="el-icon-download"
					:loading="syncing"
					@click="sync"
				>同步目录</el-button>
			</div>
		</div>

		<section
			v-for="group in riskGroups"
			:key="group.key"
			class="tool-pool-group"
		>
			<header
				class="tool-pool-group__head"
				role="button"
				tabindex="0"
				@click="toggleGroup(group.key)"
				@keydown.enter.prevent="toggleGroup(group.key)"
				@keydown.space.prevent="toggleGroup(group.key)"
			>
				<i
					class="tool-pool-group__chevron"
					:class="isGroupCollapsed(group.key) ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"
				/>
				<span class="tool-pool-group__label">{{ group.label }}</span>
				<span class="tool-pool-group__count">{{ group.items.length }}</span>
				<span v-if="group.hint" class="tool-pool-group__hint">{{ group.hint }}</span>
			</header>
			<div v-show="!isGroupCollapsed(group.key)" class="tool-pool-group__list">
				<article
					v-for="row in group.items"
					:key="row.toolName"
					class="tool-pool-card"
				>
					<div class="tool-pool-card__body">
						<div class="tool-pool-card__name-row">
							<span class="tool-pool-card__name" :title="row.displayName">{{ row.displayName }}</span>
							<el-tag v-if="row.inCatalog" type="success" size="mini">在目录</el-tag>
							<el-tag v-else type="info" size="mini">已下线</el-tag>
						</div>
						<code class="tool-pool-card__tool">{{ row.toolName }}</code>
						<p class="tool-pool-card__desc">{{ row.description || '—' }}</p>
					</div>
					<footer class="tool-pool-card__footer">
						<div class="tool-pool-card__meta">
							<span class="tool-pool-card__meta-label">权限</span>
							<span
								class="tool-pool-card__perm-status"
								:class="hasPerm(row) ? 'is-set' : 'is-empty'"
							>{{ hasPerm(row) ? '已配置' : '未配置' }}</span>
						</div>
						<div class="tool-pool-card__ops">
							<el-button
								v-if="canEdit"
								size="mini"
								plain
								icon="el-icon-edit"
								:disabled="row._saving || permDialog.saving"
								@click="openPermDialog(row)"
							>编辑权限</el-button>
							<div class="tool-pool-card__switch">
								<span class="tool-pool-card__switch-label">启用</span>
								<el-switch
									v-model="row.enabled"
									:disabled="!canEdit || row._saving"
									@change="toggle(row)"
								/>
							</div>
						</div>
					</footer>
				</article>
			</div>
		</section>

		<el-empty v-if="!loading && !list.length" description="暂无工具，请先同步目录" />

		<el-dialog
			title="编辑工具权限"
			:visible.sync="permDialog.visible"
			width="480px"
			append-to-body
			:close-on-click-modal="false"
			@closed="resetPermDialog"
		>
			<div v-if="permDialog.row" class="perm-dialog">
				<div class="perm-dialog__tool">
					<div class="perm-dialog__name">{{ permDialog.row.displayName }}</div>
					<code class="perm-dialog__code">{{ permDialog.row.toolName }}</code>
				</div>
				<p class="perm-dialog__tip">权限码为空表示不额外校验。修改后立即生效，请确认操作人具备对应菜单权限。</p>
				<div class="perm-dialog__field">
					<label class="perm-dialog__label">权限码</label>
					<el-input
						v-model="permDialog.value"
						clearable
						placeholder="如 :station:list"
						:disabled="permDialog.saving"
						@keyup.enter.native="confirmPermDialog"
					/>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button :disabled="permDialog.saving" @click="permDialog.visible = false">取消</el-button>
				<el-button
					type="primary"
					:loading="permDialog.saving"
					:disabled="!permDialogDirty"
					@click="confirmPermDialog"
				>保存</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import { listToolPool, updateToolPool, syncToolPool } from '@/api/opsAgent/toolPool'

	const RISK_ORDER = ['l0', 'l1', 'l2']

	const RISK_GROUP_META = {
		l0: { label: 'L0 只读', hint: '查询类，默认低干扰' },
		l1: { label: 'L1 低风险', hint: '可执行但影响面较小' },
		l2: { label: 'L2 高风险', hint: '退款/停充等需权限与确认' }
	}

	export default {
		name: 'opsAgentToolPool',
		data() {
			return {
				loading: false,
				syncing: false,
				list: [],
				collapsedGroups: {},
				permDialog: {
					visible: false,
					saving: false,
					row: null,
					value: '',
					orig: ''
				}
			}
		},
		computed: {
			canEdit() {
				return this.btnAuthen.permsVerifAuthention(':agent:toolPool:edit')
			},
			permDialogDirty() {
				const cur = (this.permDialog.value || '').trim()
				const orig = (this.permDialog.orig || '').trim()
				return cur !== orig
			},
			riskGroups() {
				const buckets = { l0: [], l1: [], l2: [], other: [] }
				;(this.list || []).forEach(row => {
					const k = this.riskKey(row.risk)
					if (buckets[k]) {
						buckets[k].push(row)
					} else {
						buckets.other.push(row)
					}
				})
				const groups = RISK_ORDER.map(key => ({
					key,
					label: RISK_GROUP_META[key].label,
					hint: RISK_GROUP_META[key].hint,
					items: buckets[key]
				})).filter(g => g.items.length)
				if (buckets.other.length) {
					groups.push({ key: 'other', label: '其他', hint: '', items: buckets.other })
				}
				return groups
			}
		},
		created() {
			this.load()
		},
		methods: {
			riskKey(risk) {
				return String(risk || '').toLowerCase()
			},
			isGroupCollapsed(key) {
				return !!this.collapsedGroups[key]
			},
			toggleGroup(key) {
				this.$set(this.collapsedGroups, key, !this.collapsedGroups[key])
			},
			hasPerm(row) {
				const perm = row && row._orig ? row._orig.requiredPerm : (row && row.requiredPerm)
				return !!(perm && String(perm).trim())
			},
			openPermDialog(row) {
				const orig = (row._orig && row._orig.requiredPerm) || ''
				this.permDialog = {
					visible: true,
					saving: false,
					row,
					value: orig,
					orig
				}
			},
			resetPermDialog() {
				this.permDialog.row = null
				this.permDialog.value = ''
				this.permDialog.orig = ''
				this.permDialog.saving = false
			},
			confirmPermDialog() {
				const row = this.permDialog.row
				if (!row || !this.permDialogDirty || this.permDialog.saving) {
					return
				}
				const next = (this.permDialog.value || '').trim()
				this.permDialog.saving = true
				this.doUpdate(row, {
					enabled: row.enabled,
					requiredPerm: next
				}, () => {}).finally(() => {
					this.permDialog.saving = false
					if ((row._orig.requiredPerm || '') === next) {
						this.permDialog.visible = false
					}
				})
			},
			normalize(items) {
				return (items || []).map(item => Object.assign({}, item, {
					requiredPerm: item.requiredPerm || '',
					enabled: !!item.enabled,
					_saving: false,
					_orig: { requiredPerm: item.requiredPerm || '', enabled: !!item.enabled }
				}))
			},
			errMsg(e, fallback) {
				const data = e && e.response && e.response.data
				return (data && (data.msg || data.message)) || fallback
			},
			load() {
				this.loading = true
				listToolPool().then(res => {
					// 后端直接返回数组（无 code/data 包装）；兼容包装格式
					const rows = Array.isArray(res) ? res : (res && res.code === 200 ? res.data : null)
					if (Array.isArray(rows)) {
						this.list = this.normalize(rows)
					} else {
						this.$message.error((res && res.msg) || '加载失败')
					}
				}).catch(e => {
					this.$message.error(this.errMsg(e, '加载失败'))
				}).finally(() => {
					this.loading = false
				})
			},
			doUpdate(row, payload, onFail) {
				row._saving = true
				// 成功返回更新后的条目（无 code 包装）；未知工具为 HTTP 400，走 catch
				return updateToolPool(row.toolName, payload).then(res => {
					if (res && res.code !== undefined && res.code !== 200) {
						onFail()
						this.$message.error(res.msg || '保存失败')
						return
					}
					if (payload.requiredPerm !== undefined) {
						row.requiredPerm = payload.requiredPerm
						row._orig.requiredPerm = payload.requiredPerm
					}
					if (payload.enabled !== undefined) {
						row._orig.enabled = payload.enabled
					}
					this.$message.success('保存成功')
				}).catch(e => {
					onFail()
					this.$message.error(this.errMsg(e, '保存失败'))
				}).finally(() => {
					row._saving = false
				})
			},
			toggle(row) {
				// 仅提交 enabled，避免把未保存的权限码草稿一并写入
				this.doUpdate(row, { enabled: row.enabled }, () => {
					row.enabled = row._orig.enabled
				})
			},
			sync() {
				this.syncing = true
				syncToolPool().then(res => {
					if (res && res.code === 200) {
						this.$message.success(res.added ? `同步成功，新增 ${res.added} 个工具（默认未启用）` : '已是最新，无新增工具')
						this.load()
					} else {
						this.$message.error((res && res.msg) || '同步失败')
					}
				}).catch(e => {
					this.$message.error(this.errMsg(e, '同步失败'))
				}).finally(() => {
					this.syncing = false
				})
			}
		}
	}
</script>

<style scoped>
.tool-pool-page__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 20px;
}
.tool-pool-page__title {
	margin: 0 0 6px;
	font-size: 18px;
	font-weight: 600;
	color: #334155;
}
.tool-pool-page__desc {
	margin: 0;
	max-width: 640px;
	font-size: 13px;
	line-height: 1.5;
	color: #64748b;
}
.tool-pool-page__actions {
	flex-shrink: 0;
}
.tool-pool-group {
	margin-bottom: 16px;
}
.tool-pool-group__head {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 10px;
	padding: 8px 10px;
	border-radius: 6px;
	background: #f8fafc;
	cursor: pointer;
	user-select: none;
}
.tool-pool-group__head:hover {
	background: #f1f5f9;
}
.tool-pool-group__chevron {
	font-size: 12px;
	color: #94a3b8;
}
.tool-pool-group__label {
	font-size: 14px;
	font-weight: 600;
	color: #334155;
}
.tool-pool-group__count {
	font-size: 12px;
	color: #94a3b8;
}
.tool-pool-group__hint {
	font-size: 12px;
	color: #94a3b8;
}
.tool-pool-group__list {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
}
.tool-pool-card {
	display: flex;
	flex-direction: column;
	min-width: 0;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	overflow: hidden;
}
.tool-pool-card__body {
	flex: 1;
	padding: 14px 14px 10px;
}
.tool-pool-card__name-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
	min-width: 0;
}
.tool-pool-card__name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	font-weight: 600;
	color: #334155;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.tool-pool-card__tool {
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
.tool-pool-card__desc {
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
.tool-pool-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 10px 14px;
	border-top: 1px solid #f1f5f9;
	background: #fafbfc;
}
.tool-pool-card__meta {
	display: flex;
	align-items: center;
	gap: 6px;
	min-width: 0;
}
.tool-pool-card__meta-label {
	font-size: 12px;
	color: #94a3b8;
}
.tool-pool-card__perm-status {
	font-size: 12px;
}
.tool-pool-card__perm-status.is-set {
	color: #409eff;
}
.tool-pool-card__perm-status.is-empty {
	color: #94a3b8;
}
.tool-pool-card__ops {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-shrink: 0;
}
.tool-pool-card__switch {
	display: flex;
	align-items: center;
	gap: 6px;
}
.tool-pool-card__switch-label {
	font-size: 12px;
	color: #64748b;
}
.perm-dialog__tool {
	margin-bottom: 12px;
}
.perm-dialog__name {
	font-size: 15px;
	font-weight: 600;
	color: #334155;
	margin-bottom: 4px;
}
.perm-dialog__code {
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 2px 6px;
	border-radius: 4px;
}
.perm-dialog__tip {
	margin: 0 0 14px;
	font-size: 12px;
	line-height: 1.5;
	color: #94a3b8;
}
.perm-dialog__field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.perm-dialog__label {
	font-size: 13px;
	color: #475569;
}
@media (max-width: 1400px) {
	.tool-pool-group__list {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}
@media (max-width: 1100px) {
	.tool-pool-group__list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
@media (max-width: 720px) {
	.tool-pool-group__list {
		grid-template-columns: 1fr;
	}
	.tool-pool-card__footer {
		flex-direction: column;
		align-items: stretch;
	}
	.tool-pool-card__ops {
		justify-content: space-between;
	}
}
</style>
