<template>
	<div style="display: inline-block;"	>
		<el-button type="primary" @click="onShowDeviceInfo" size='mini' >
      详情
		</el-button>
		<el-dialog :visible.sync="showDeviceInfo" title="设备详情" @close="showDeviceInfo = false" :append-to-body="true">
			<div style="display: flex;">
				<el-row>
					<el-col :xs="24"  :lg="12">
						<div>
							<el-form ref="deviceInfo" :model="deviceInfo" label-position="left" label-width="100px"
								style="width: 300px; margin-left:50px;">
								<el-form-item :label="'设备号'" prop="deviceCode">
									<el-input v-model="deviceInfo.deviceCode" disabled=""></el-input>
								</el-form-item>
								<el-form-item :label="'实时总功率'" prop="deviceTotalPower">
									<el-input v-model="deviceInfo.deviceTotalPower" disabled="">
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'功率下限'" prop="powerLower">
									<el-input v-model="deviceInfo.powerLower" disabled="">
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'功率上限'" prop="powerUpper">
									<el-input v-model="deviceInfo.powerUpper" disabled="">
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'总功率上限'" prop="totalPowerUpper">
									<el-input v-model="deviceInfo.totalPowerUpper" disabled="">
										<template slot="append">W</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'警告温度'" prop="warningTemperature">
									<el-input v-model="deviceInfo.warningTemperature" disabled="">
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'低温'" prop="lowTemperature">
									<el-input v-model="deviceInfo.lowTemperature" disabled="">
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'高温'" prop="highTemperature">
									<el-input v-model="deviceInfo.highTemperature" disabled="">
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'设备机箱温度'" prop="deviceTemperature">
									<el-input v-model="deviceInfo.deviceTemperature" disabled="">
										<template slot="append">℃</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'设备等待时间'" prop="deviceChargePattern">
									<el-input v-model="deviceInfo.deviceChargePattern" disabled="">
										<template slot="append">S</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'设备心跳时间'" prop="deviceHeartbeatTime">
									<el-input v-model="deviceInfo.deviceHeartbeatTime" disabled="">
										<template slot="append">S</template>
									</el-input>
								</el-form-item>
								<el-form-item :label="'设备信号'" prop="deviceSignal">
									<el-input v-model="deviceInfo.deviceSignal" disabled="" />
								</el-form-item>
							</el-form>
						</div>
					</el-col>
					<el-col :xs="24"  :lg="12">
						<div class="left10">
							<el-form ref="deviceInfo" :model="deviceInfo" label-position="left" label-width="100px"
								style="width: 200px; margin-left:50px;">
								<div v-for="(item,index) in ports" :key="index">
									<el-form-item :label="`端口${index+1}`">
										<el-tag type="success" v-if="item == 0">空闲</el-tag>
										<el-tag type="danger" v-if="item == 1">占用</el-tag>
									</el-form-item>
								</div>
							</el-form>
						</div>
					</el-col>
				</el-row>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		findDeviceInfoById,
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
				deviceInfo: {},
				ports:[]
			}
		},
		mounted() {
            
		},
		methods: {
			onShowDeviceInfo(){
				this.onfindDeviceInfoById()
			},
			//查询设备详情
			onfindDeviceInfoById() {
				let data = {
					deviceId: this.row_data.id
				}
				findDeviceInfoById(data).then(res => {
					if (res.code == 200) {
						let deviceInfo= res.data
						this.deviceInfo = deviceInfo
						let ports=[]
						let portCount=res.data.portCount || 10
						for(let i=0;i<portCount;i++){
						  let value=deviceInfo[`port${i+1}`]
						  ports.push(value)
						}
						this.ports=ports
						this.showDeviceInfo = true
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {

		},
	}
</script>

<style>
</style>
