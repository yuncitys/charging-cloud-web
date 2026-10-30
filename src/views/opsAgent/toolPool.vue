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
			:class="'is-' + group.key"
		>
			<header class="tool-pool-group__head">
				<span class="tool-pool-group__label">{{ group.label }}</span>
				<span class="tool-pool-group__count">{{ group.items.length }}</span>
				<span v-if="group.hint" class="tool-pool-group__hint">{{ group.hint }}</span>
			</header>
			<div class="tool-pool-group__list">
				<article
					v-for="row in group.items"
					:key="row.toolName"
					class="tool-pool-card"
				>
					<div class="tool-pool-card__main">
						<div class="tool-pool-card__name-row">
							<span class="tool-pool-card__name">{{ row.displayName }}</span>
							<el-tag v-if="row.inCatalog" type="success" size="mini">在目录</el-tag>
							<el-tag v-else type="info" size="mini">已下线</el-tag>
						</div>
						<code class="tool-pool-card__tool">{{ row.toolName }}</code>
						<p class="tool-pool-card__desc">{{ row.description || '—' }}</p>
					</div>
					<div class="tool-pool-card__controls">
						<el-input
							v-model="row.requiredPerm"
							size="mini"
							clearable
							placeholder="权限码，如 :station:list"
							:disabled="!canEdit"
							@input="markDirty(row)"
						>
							<el-button
								v-if="canEdit"
								slot="append"
								:disabled="!row._dirty"
								:loading="row._saving"
								@click="savePerm(row)"
							>保存</el-button>
						</el-input>
						<div class="tool-pool-card__switch">
							<span class="tool-pool-card__switch-label">启用</span>
							<el-switch
								v-model="row.enabled"
								:disabled="!canEdit || row._saving"
								@change="toggle(row)"
							/>
						</div>
					</div>
				</article>
			</div>
		</section>

		<el-empty v-if="!loading && !list.length" description="暂无工具，请先同步目录" />
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
				list: []
			}
		},
		computed: {
			canEdit() {
				return this.btnAuthen.permsVerifAuthention(':agent:toolPool:edit')
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
			normalize(items) {
				return (items || []).map(item => Object.assign({}, item, {
					requiredPerm: item.requiredPerm || '',
					enabled: !!item.enabled,
					_dirty: false,
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
			markDirty(row) {
				this.$set(row, '_dirty', (row.requiredPerm || '') !== row._orig.requiredPerm)
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
						row._dirty = false
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
			savePerm(row) {
				this.doUpdate(row, {
					enabled: row.enabled,
					requiredPerm: (row.requiredPerm || '').trim()
				}, () => {})
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
	margin-bottom: 20px;
}
.tool-pool-group__head {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 10px;
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
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.tool-pool-card {
	display: flex;
	align-items: stretch;
	gap: 16px;
	padding: 12px 14px 12px 12px;
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	border-left-width: 3px;
}
.tool-pool-group.is-l0 .tool-pool-card { border-left-color: #4a8f6f; }
.tool-pool-group.is-l1 .tool-pool-card { border-left-color: #b8893d; }
.tool-pool-group.is-l2 .tool-pool-card { border-left-color: #c45b5b; }
.tool-pool-group.is-other .tool-pool-card { border-left-color: #94a3b8; }
.tool-pool-card__main {
	flex: 1;
	min-width: 0;
}
.tool-pool-card__name-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
}
.tool-pool-card__name {
	font-size: 14px;
	font-weight: 600;
	color: #334155;
}
.tool-pool-card__tool {
	display: inline-block;
	font-size: 12px;
	color: #64748b;
	background: #f1f5f9;
	padding: 1px 6px;
	border-radius: 4px;
}
.tool-pool-card__desc {
	margin: 8px 0 0;
	font-size: 12px;
	line-height: 1.45;
	color: #64748b;
}
.tool-pool-card__controls {
	width: 280px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;
	justify-content: center;
}
.tool-pool-card__switch {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
}
.tool-pool-card__switch-label {
	font-size: 12px;
	color: #64748b;
}
@media (max-width: 900px) {
	.tool-pool-card {
		flex-direction: column;
	}
	.tool-pool-card__controls {
		width: 100%;
	}
}
</style>
