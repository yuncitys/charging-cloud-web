<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="onShowDeviceInfo" size="mini">
			详情
		</el-button>
		<el-dialog :visible.sync="showDeviceInfo" title="设备详情" @close="showDeviceInfo = false" :append-to-body="true" width="900px">
			<el-tabs v-model="activeTab">
				<el-tab-pane label="基本信息" name="base">
					<el-row :gutter="20">
						<el-col :xs="24" :lg="12">
							<el-form ref="deviceInfo" :model="deviceInfo" label-position="left" label-width="110px">
								<el-form-item label="设备号" prop="deviceCode">
									<el-input v-model="deviceInfo.deviceCode" disabled></el-input>
								</el-form-item>
								<el-form-item label="设备名称" prop="deviceName">
									<el-input v-model="deviceInfo.deviceName" disabled></el-input>
								</el-form-item>
								<el-form-item label="实时总功率" prop="deviceTotalPower">
									<el-input v-model="deviceInfo.deviceTotalPower" disabled>
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item label="功率下限" prop="powerLower">
									<el-input v-model="deviceInfo.powerLower" disabled>
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item label="功率上限" prop="powerUpper">
									<el-input v-model="deviceInfo.powerUpper" disabled>
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item label="总功率上限" prop="totalPowerUpper">
									<el-input v-model="deviceInfo.totalPowerUpper" disabled>
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
							</el-form>
						</el-col>
						<el-col :xs="24" :lg="12">
							<el-form ref="deviceInfo" :model="deviceInfo" label-position="left" label-width="110px">
								<el-form-item label="警告温度" prop="warningTemperature">
									<el-input v-model="deviceInfo.warningTemperature" disabled>
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item label="机箱温度" prop="deviceTemperature">
									<el-input v-model="deviceInfo.deviceTemperature" disabled>
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item label="设备心跳时间" prop="deviceHeartbeatTime">
									<el-input v-model="deviceInfo.deviceHeartbeatTime" disabled>
										<template slot="append">S</template>
									</el-input>
								</el-form-item>
								<el-form-item label="设备信号" prop="deviceSignal">
									<el-input v-model="deviceInfo.deviceSignal" disabled />
								</el-form-item>
								<el-form-item label="二维码规则" prop="deviceQrcodeLink">
									<el-input v-model="deviceInfo.deviceQrcodeLink" disabled />
								</el-form-item>
							</el-form>
						</el-col>
					</el-row>
				</el-tab-pane>

				<el-tab-pane label="充电枪/端口列表" name="guns">
					<el-table :data="gunList" border size="small" style="width: 100%;" max-height="400">
						<el-table-column prop="gunNumber" label="序号" width="70" align="center" />
						<el-table-column prop="gunName" label="枪/插座名称" min-width="140" />
						<el-table-column prop="gunCode" label="枪编码" min-width="150" />
						<el-table-column prop="power" label="额定功率" width="100" align="center">
							<template slot-scope="scope">
								<span>{{ scope.row.power ? scope.row.power + ' W' : '-' }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="electricOutTypeText" label="输出类型" width="90" align="center">
							<template slot-scope="scope">
								<el-tag size="mini" :type="scope.row.electricOutType === 1 ? 'warning' : 'info'">
									{{ scope.row.electricOutTypeText || '—' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="chargingTypeText" label="充电类型" width="90" align="center">
							<template slot-scope="scope">
								<el-tag size="mini" :type="scope.row.chargingType === 2 ? 'danger' : (scope.row.chargingType === 1 ? 'primary' : 'info')">
									{{ scope.row.chargingTypeText || '—' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column prop="statusText" label="状态" width="100" align="center">
							<template slot-scope="scope">
								<el-tag size="mini" :type="scope.row.status === 0 ? 'success' : (scope.row.status === 1 ? 'warning' : 'danger')">
									{{ scope.row.statusText || '—' }}
								</el-tag>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-dialog>
	</div>
</template>

<script>
	import {
		findDeviceInfoById,
		listGuns
	} from '@/api/device/deviceList.js'

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
				gunList: []
			}
		},
		methods: {
			onShowDeviceInfo() {
				this.onfindDeviceInfoById()
				this.loadGuns()
			},
			// 查询设备详情
			onfindDeviceInfoById() {
				let data = {
					deviceId: this.row_data.id
				}
				findDeviceInfoById(data).then(res => {
					if (res.code == 200) {
						let deviceInfo = res.data
						this.deviceInfo = deviceInfo
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
					} else {
						this.gunList = []
					}
				}).catch(() => {
					this.gunList = []
				})
			}
		}
	}
</script>

<style scoped>
</style>
