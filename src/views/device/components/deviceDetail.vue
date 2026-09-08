<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="onShowDeviceInfo" size="mini">
			查看详情
		</el-button>
		<el-drawer
			:visible.sync="showDeviceInfo"
			title="设备详情"
			direction="rtl"
			size="960px"
			:append-to-body="true"
			custom-class="device-detail-drawer"
			@close="showDeviceInfo = false"
		>
			<div class="device-detail-drawer__body">
				<div class="device-detail-header">
					<div class="device-detail-header__main">
						<div class="device-detail-header__code">{{ deviceInfo.deviceCode || '—' }}</div>
						<div class="device-detail-header__name">{{ deviceInfo.deviceName || '未命名设备' }}</div>
					</div>
					<div class="device-detail-header__meta">
						<span>{{ gunCount }} 路枪/端口</span>
					</div>
				</div>

				<div class="device-detail-metrics">
					<div class="device-detail-metric">
						<div class="device-detail-metric-label">档案总功率</div>
						<div class="device-detail-metric-value">
							{{ displayDeviceTotalPowerKw }}
							<span class="device-detail-metric-unit">kW</span>
						</div>
					</div>
					<div class="device-detail-metric">
						<div class="device-detail-metric-label">机箱温度</div>
						<div class="device-detail-metric-value">
							{{ displayText(deviceInfo.deviceTemperature) }}
							<span class="device-detail-metric-unit">℃</span>
						</div>
					</div>
					<div class="device-detail-metric">
						<div class="device-detail-metric-label">设备信号</div>
						<div class="device-detail-metric-value">{{ displayText(deviceInfo.deviceSignal) }}</div>
					</div>
					<div class="device-detail-metric">
						<div class="device-detail-metric-label">枪口数量</div>
						<div class="device-detail-metric-value">
							{{ gunCount }}
							<span class="device-detail-metric-unit">路</span>
						</div>
					</div>
				</div>

				<el-tabs v-model="activeTab">
					<el-tab-pane label="基本信息" name="base">
						<div class="device-detail-section">
							<div class="device-detail-section-title">功率参数</div>
							<div class="device-detail-grid">
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">功率下限</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(deviceInfo.powerLower, 'W') }}</div>
								</div>
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">功率上限</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(displayPowerUpperKw, 'kW') }}</div>
								</div>
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">总功率上限</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(displayTotalPowerUpperKw, 'kW') }}</div>
								</div>
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">大功率端口上限</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(displayHighPowerUpperKw, 'kW') }}</div>
								</div>
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">大功率端口下限</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(deviceInfo.highPowerLower, 'W') }}</div>
								</div>
							</div>
						</div>

						<div class="device-detail-section">
							<div class="device-detail-section-title">温度与运行</div>
							<div class="device-detail-grid">
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">警告温度</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(deviceInfo.warningTemperature, '℃') }}</div>
								</div>
								<div class="device-detail-kv">
									<div class="device-detail-kv-label">设备心跳时间</div>
									<div class="device-detail-kv-value">{{ formatWithUnit(deviceInfo.deviceHeartbeatTime, 'S') }}</div>
								</div>
							</div>
						</div>

						<div class="device-detail-section">
							<div class="device-detail-section-title">二维码</div>
							<div class="device-detail-grid device-detail-grid--single">
								<div class="device-detail-kv device-detail-kv--full">
									<div class="device-detail-kv-label">二维码规则</div>
									<div class="device-detail-kv-value">{{ displayText(deviceInfo.deviceQrcodeLink) }}</div>
								</div>
							</div>
						</div>
					</el-tab-pane>

					<el-tab-pane :label="'充电枪/端口列表（' + gunCount + '）'" name="guns">
						<el-table
							:data="gunList"
							border
							size="small"
							class="device-detail-gun-table"
							style="width: 100%;"
							max-height="560"
							v-loading="gunSaving"
						>
							<el-table-column prop="gunNumber" label="序号" width="64" align="center" />
							<el-table-column label="枪/插座名称" min-width="180">
								<template slot-scope="scope">
									<div v-if="canEditGun" class="device-detail-gun-name">
										<el-input
											v-model="scope.row.gunName"
											size="mini"
											maxlength="50"
											@blur="onGunNameBlur(scope.row)"
											@keyup.enter.native="$event.target.blur()"
										/>
									</div>
									<span v-else>{{ scope.row.gunName || '—' }}</span>
								</template>
							</el-table-column>
							<el-table-column prop="gunCode" label="枪编码" min-width="140" show-overflow-tooltip />
							<el-table-column prop="power" label="额定功率" width="100" align="center">
								<template slot-scope="scope">
									<span>{{ formatGunPower(scope.row.power) }}</span>
								</template>
							</el-table-column>
							<el-table-column prop="electricOutTypeText" label="输出类型" width="96" align="center">
								<template slot-scope="scope">
									<el-tag size="mini" :type="scope.row.electricOutType === 1 ? 'warning' : 'info'">
										{{ scope.row.electricOutTypeText || '—' }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column prop="chargingTypeText" label="充电类型" width="96" align="center">
								<template slot-scope="scope">
									<el-tag size="mini" :type="scope.row.chargingType === 2 ? 'danger' : (scope.row.chargingType === 1 ? 'primary' : 'info')">
										{{ scope.row.chargingTypeText || '—' }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column prop="statusText" label="状态" width="96" align="center">
								<template slot-scope="scope">
									<el-tag size="mini" :type="scope.row.status === 0 ? 'success' : (scope.row.status === 1 ? 'warning' : 'danger')">
										{{ scope.row.statusText || '—' }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column label="启用" width="100" align="center">
								<template slot-scope="scope">
									<el-switch
										v-if="canEditGun"
										:value="Number(scope.row.startStatus) === 1"
										:disabled="gunSaving"
										active-text=""
										inactive-text=""
										@change="(val) => onGunStartChange(scope.row, val)"
									/>
									<el-tag v-else size="mini" :type="Number(scope.row.startStatus) === 1 ? 'success' : 'info'">
										{{ scope.row.startStatusText || (Number(scope.row.startStatus) === 1 ? '已启用' : '未启用') }}
									</el-tag>
								</template>
							</el-table-column>
						</el-table>
					</el-tab-pane>
				</el-tabs>
			</div>
		</el-drawer>
	</div>
</template>

<script>
	import {
		findDeviceInfoById,
		listGuns,
		updateGun
	} from '@/api/device/deviceList.js'
	import { formatWattsAsKw, wattsToKw } from '@/utils/powerUnit.js'

	export default {
		props: {
			row_data: {
				type: Object,
				default: function() {
					return null
				}
			}
		},
		data() {
			return {
				showDeviceInfo: false,
				activeTab: 'base',
				deviceInfo: {},
				gunList: [],
				gunNameSnapshot: {},
				gunSaving: false
			}
		},
		computed: {
			gunCount() {
				return Array.isArray(this.gunList) ? this.gunList.length : 0
			},
			canEditGun() {
				return this.btnAuthen.permsVerifAuthention(':device:deviceList:oneEdit')
			},
			displayDeviceTotalPowerKw() {
				return wattsToKw(this.deviceInfo.deviceTotalPower) || '—'
			},
			displayPowerUpperKw() {
				return wattsToKw(this.deviceInfo.powerUpper) || '—'
			},
			displayTotalPowerUpperKw() {
				return wattsToKw(this.deviceInfo.totalPowerUpper) || '—'
			},
			displayHighPowerUpperKw() {
				return wattsToKw(this.deviceInfo.highPowerUpper) || '—'
			}
		},
		methods: {
			displayText(value) {
				if (value === 0 || value === '0') {
					return value
				}
				return value === null || value === undefined || value === '' ? '—' : value
			},
			formatWithUnit(value, unit) {
				const text = this.displayText(value)
				return text === '—' ? '—' : `${text} ${unit}`
			},
			formatGunPower(power) {
				return formatWattsAsKw(power)
			},
			onShowDeviceInfo() {
				this.activeTab = 'base'
				this.onfindDeviceInfoById()
				this.loadGuns()
			},
			onfindDeviceInfoById() {
				findDeviceInfoById({
					deviceId: this.row_data.id
				}).then(res => {
					if (res.code == 200) {
						this.deviceInfo = res.data || {}
						this.showDeviceInfo = true
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			loadGuns() {
				listGuns({ deviceId: this.row_data.id }).then(res => {
					if (res.code === 200 && Array.isArray(res.data)) {
						this.gunList = res.data
						this.syncGunNameSnapshot()
					} else {
						this.gunList = []
						this.gunNameSnapshot = {}
					}
				}).catch(() => {
					this.gunList = []
					this.gunNameSnapshot = {}
				})
			},
			syncGunNameSnapshot() {
				const map = {}
				;(this.gunList || []).forEach(gun => {
					if (gun && gun.id != null) {
						map[gun.id] = gun.gunName || ''
					}
				})
				this.gunNameSnapshot = map
			},
			onGunNameBlur(row) {
				if (!row || row.id == null) {
					return
				}
				const nextName = (row.gunName || '').trim()
				const prevName = this.gunNameSnapshot[row.id] || ''
				if (!nextName) {
					this.$message.warning('枪名称不能为空')
					this.$set(row, 'gunName', prevName)
					return
				}
				if (nextName === prevName) {
					this.$set(row, 'gunName', nextName)
					return
				}
				this.saveGun({
					gunId: row.id,
					gunName: nextName
				}, () => {
					this.$set(row, 'gunName', nextName)
					this.$set(this.gunNameSnapshot, row.id, nextName)
				}, () => {
					this.$set(row, 'gunName', prevName)
				})
			},
			onGunStartChange(row, enabled) {
				if (!row || row.id == null) {
					return
				}
				const nextStatus = enabled ? 1 : 0
				const prevStatus = Number(row.startStatus) === 1 ? 1 : 0
				if (nextStatus === prevStatus) {
					return
				}
				const actionText = enabled ? '启用' : '停用'
				this.$confirm(`确认${actionText}「${row.gunName || ('枪' + row.gunNumber)}」？`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.saveGun({
						gunId: row.id,
						startStatus: nextStatus
					}, () => {
						this.$set(row, 'startStatus', nextStatus)
						this.$set(row, 'startStatusText', enabled ? '已启用' : '未启用')
					})
				}).catch(() => {})
			},
			saveGun(payload, onSuccess, onFail) {
				this.gunSaving = true
				updateGun(payload).then(res => {
					this.gunSaving = false
					if (res.code === 200) {
						this.$message.success(res.msg || '更新成功')
						if (typeof onSuccess === 'function') {
							onSuccess()
						}
					} else {
						this.$message.error(res.msg || '更新失败')
						if (typeof onFail === 'function') {
							onFail()
						}
					}
				}).catch(() => {
					this.gunSaving = false
					this.$message.error('更新失败')
					if (typeof onFail === 'function') {
						onFail()
					}
				})
			}
		}
	}
</script>

<style lang="scss">
.device-detail-drawer {
	.el-drawer__body {
		padding: 0 20px 24px;
		overflow: auto;
	}
}

.device-detail-drawer__body {
	padding-top: 4px;
}

.device-detail-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 16px;
	padding-bottom: 14px;
	border-bottom: 1px solid #ebeef5;
}

.device-detail-header__code {
	font-size: 20px;
	font-weight: 600;
	color: #303133;
	line-height: 1.3;
	word-break: break-all;
}

.device-detail-header__name {
	margin-top: 4px;
	font-size: 13px;
	color: #909399;
	word-break: break-all;
}

.device-detail-header__meta {
	flex-shrink: 0;
	font-size: 13px;
	color: #606266;
	padding-top: 4px;
}

.device-detail-metrics {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
	margin-bottom: 18px;
}

.device-detail-metric {
	background: #f7f9fc;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	padding: 12px 14px;
	min-height: 72px;
}

.device-detail-metric-label {
	display: block;
	font-size: 13px;
	line-height: 18px;
	color: #606266;
	margin-bottom: 8px;
	font-weight: 500;
}

.device-detail-metric-value {
	display: block;
	font-size: 22px;
	font-weight: 600;
	color: #303133;
	line-height: 1.2;
	word-break: break-all;
}

.device-detail-metric-unit {
	margin-left: 4px;
	font-size: 12px;
	font-weight: 400;
	color: #909399;
}

.device-detail-section {
	margin-bottom: 18px;
}

.device-detail-section-title {
	font-size: 14px;
	font-weight: 600;
	color: #303133;
	margin-bottom: 10px;
	padding-left: 8px;
	border-left: 3px solid #1890ff;
}

.device-detail-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
}

.device-detail-grid--single {
	grid-template-columns: 1fr;
}

.device-detail-kv {
	background: #fafafa;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	padding: 12px 14px;
	min-height: 66px;
}

.device-detail-kv--full {
	grid-column: 1 / -1;
}

.device-detail-kv-label {
	display: block;
	font-size: 12px;
	line-height: 18px;
	color: #909399;
	margin-bottom: 6px;
}

.device-detail-kv-value {
	display: block;
	font-size: 14px;
	line-height: 20px;
	color: #303133;
	word-break: break-all;
}

.device-detail-gun-name {
	.el-input {
		width: 100%;
	}
}

@media (max-width: 900px) {
	.device-detail-metrics,
	.device-detail-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
