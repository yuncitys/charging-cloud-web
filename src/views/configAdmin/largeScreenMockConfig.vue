<template>
	<div class="app-container">
		<el-card shadow="never">
			<div slot="header" class="card-header">
				<span>大屏虚拟数据配置</span>
				<div>
					<el-button v-if="btnAuthen.permsVerifAuthention(':visualMockConfig:update')" @click="resetState">重置累计状态</el-button>
					<el-button v-if="btnAuthen.permsVerifAuthention(':visualMockConfig:update')" type="primary" :loading="saving" @click="save">保存</el-button>
				</div>
			</div>
			<el-alert
				title="开启后，所有大屏客户端从服务端读取同一套虚拟数据，不再使用浏览器本地存储。修改基数后如需从零重算，请先保存再点「重置累计状态」。"
				type="info"
				:closable="false"
				style="margin-bottom: 16px;"
			/>
			<el-form ref="form" :model="form" label-width="180px" v-loading="loading">
				<el-form-item label="启用虚拟数据">
					<el-switch v-model="form.mockEnabled" active-text="虚拟数据" inactive-text="真实数据" />
				</el-form-item>
				<el-form-item label="刷新间隔(毫秒)">
					<el-input-number v-model="form.tickIntervalMs" :min="1000" :step="1000" :max="60000" />
					<span class="hint">大屏按该间隔向服务端补算 tick，默认 5000</span>
				</el-form-item>

				<el-divider content-position="left">交易金额</el-divider>
				<el-form-item label="总交易基数">
					<el-input-number v-model="form.params.baseMoney" :min="0" :step="10000" />
				</el-form-item>
				<el-form-item label="今日金额每 tick 增量">
					<el-input-number v-model="form.params.todayMoneyMinDelta" :min="0" :step="0.01" :precision="2" />
					<span class="range">~</span>
					<el-input-number v-model="form.params.todayMoneyMaxDelta" :min="0" :step="0.01" :precision="2" />
				</el-form-item>
				<el-form-item label="今日起步值区间">
					<el-input-number v-model="form.params.todayDayBaseMin" :min="0" :step="100" />
					<span class="range">~</span>
					<el-input-number v-model="form.params.todayDayBaseMax" :min="0" :step="100" />
				</el-form-item>

				<el-divider content-position="left">订单</el-divider>
				<el-form-item label="扫码总订单基数">
					<el-input-number v-model="form.params.baseWxOrder" :min="0" :step="1000" />
				</el-form-item>
				<el-form-item label="扫码今日每 tick 增量">
					<el-input-number v-model="form.params.todayWxOrderMinDelta" :min="0" :step="1" />
					<span class="range">~</span>
					<el-input-number v-model="form.params.todayWxOrderMaxDelta" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="刷卡总订单基数">
					<el-input-number v-model="form.params.baseCardOrder" :min="0" :step="1000" />
				</el-form-item>
				<el-form-item label="刷卡今日每 tick 增量">
					<el-input-number v-model="form.params.todayCardOrderMinDelta" :min="0" :step="1" />
					<span class="range">~</span>
					<el-input-number v-model="form.params.todayCardOrderMaxDelta" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="进行中订单">
					<el-input-number v-model="form.params.inProgressOrderMin" :min="0" :step="10" />
					<span class="hint">最小值</span>
					<el-input-number v-model="form.params.inProgressOrderSpan" :min="0" :step="10" style="margin-left: 12px;" />
					<span class="hint">波动区间</span>
				</el-form-item>

				<el-divider content-position="left">用户 / 设备</el-divider>
				<el-form-item label="用户总数基数">
					<el-input-number v-model="form.params.baseTotalUser" :min="0" :step="1000" />
				</el-form-item>
				<el-form-item label="新增用户概率阈值">
					<el-input-number v-model="form.params.newUserProbability" :min="0" :max="1" :step="0.05" :precision="2" />
					<span class="hint">seeded 值大于该阈值则本 tick +1 人，默认 0.55</span>
				</el-form-item>
				<el-form-item label="电站初始数量">
					<el-input-number v-model="form.params.deviceStationInit" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="在线终端初始数量">
					<el-input-number v-model="form.params.deviceOnlineInit" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="离线终端初始数量">
					<el-input-number v-model="form.params.deviceOfflineInit" :min="0" :step="1" />
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script>
	import {
		getVisualMockConfig,
		updateVisualMockConfig,
		resetVisualMockState
	} from '@/api/configAdmin/visualMockConfig'
	export default {
		name: 'largeScreenMockConfig',
		data() {
			return {
				loading: false,
				saving: false,
				form: {
					mockEnabled: false,
					tickIntervalMs: 5000,
					params: {}
				}
			}
		},
		created() {
			this.load()
		},
		methods: {
			load() {
				this.loading = true
				getVisualMockConfig().then(res => {
					if (res.code === 200 && res.data) {
						this.form = {
							mockEnabled: !!res.data.mockEnabled,
							tickIntervalMs: res.data.tickIntervalMs || 5000,
							params: Object.assign({}, res.data.params || {})
						}
					}
				}).finally(() => {
					this.loading = false
				})
			},
			save() {
				this.saving = true
				updateVisualMockConfig(this.form).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg || '保存成功')
						if (res.data) {
							this.form = {
								mockEnabled: !!res.data.mockEnabled,
								tickIntervalMs: res.data.tickIntervalMs || 5000,
								params: Object.assign({}, res.data.params || {})
							}
						}
					}
				}).finally(() => {
					this.saving = false
				})
			},
			resetState() {
				this.$confirm('将清空 Redis 中的累计状态，下次打开大屏会按当前配置重新生成。是否继续？', '提示', {
					type: 'warning'
				}).then(() => {
					return resetVisualMockState()
				}).then(res => {
					if (res && res.code === 200) {
						this.$message.success(res.msg || '已重置')
					}
				}).catch(() => {})
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
	.hint {
		margin-left: 10px;
		color: #909399;
		font-size: 12px;
	}
	.range {
		margin: 0 8px;
		color: #909399;
	}
</style>
