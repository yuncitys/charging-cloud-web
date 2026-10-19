<template>
	<div class="app-container">
		<el-card shadow="never">
			<div slot="header" class="card-header">
				<span>Ops Agent 工具池</span>
				<div>
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
			<el-alert
				title="控制 Ops Agent 可调用的工具：关闭开关后该工具不可用；权限码为空表示不额外校验。「同步目录」会把代码中的工具目录同步到工具池。"
				type="info"
				:closable="false"
				style="margin-bottom: 16px;"
			/>
			<el-table :data="list" v-loading="loading" border stripe>
				<el-table-column prop="displayName" label="名称" min-width="150" show-overflow-tooltip />
				<el-table-column prop="toolName" label="工具标识" min-width="180" show-overflow-tooltip />
				<el-table-column label="风险" width="110" align="center">
					<template slot-scope="{ row }">
						<el-tag :type="riskType(row.risk)" size="small">{{ riskLabel(row.risk) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
				<el-table-column label="权限码" min-width="220">
					<template slot-scope="{ row }">
						<el-input
							v-model="row.requiredPerm"
							size="mini"
							clearable
							placeholder="如 :station:list"
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
					</template>
				</el-table-column>
				<el-table-column label="启用" width="80" align="center">
					<template slot-scope="{ row }">
						<el-switch
							v-model="row.enabled"
							:disabled="!canEdit || row._saving"
							@change="toggle(row)"
						/>
					</template>
				</el-table-column>
				<el-table-column label="目录状态" width="110" align="center">
					<template slot-scope="{ row }">
						<el-tag v-if="row.inCatalog" type="success" size="small">在目录</el-tag>
						<el-tag v-else type="info" size="small">已下线</el-tag>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script>
	import { listToolPool, updateToolPool, syncToolPool } from '@/api/opsAgent/toolPool'

	const RISK_MAP = {
		l0: { label: 'L0 只读', type: 'success' },
		l1: { label: 'L1 低风险', type: 'warning' },
		l2: { label: 'L2 高风险', type: 'danger' }
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
			}
		},
		created() {
			this.load()
		},
		methods: {
			riskKey(risk) {
				return String(risk || '').toLowerCase()
			},
			riskLabel(risk) {
				const r = RISK_MAP[this.riskKey(risk)]
				return r ? r.label : (risk || '-')
			},
			riskType(risk) {
				const r = RISK_MAP[this.riskKey(risk)]
				return r ? r.type : 'info'
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
	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
