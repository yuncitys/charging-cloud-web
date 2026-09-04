<template>
	<div class="app-container">
		<div class="filter-container">
			<el-row :gutter="20">
				<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
					<div @mouseenter="enter" @mouseleave="leave">
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>设备通讯，设备号:{{deviceInfo.deviceCode}}</span>
							</div>
							<div class="commedBox">
								<div v-for="(item,index) in CommandDetails" :key="index">
									<div class="commedBox_top flex" v-if="item.type == 1">
										<div></div>
										<div class="commedBox_topR">
											<div style="color: #666666;">服务器端 {{item.createTime}}</div>
											<div style="color: #666666;">{{item.commandContent}}</div>
											<div style="color: #999999;">
												{{item.commandRemarks}}
											</div>
										</div>
									</div>
									<div class="commedBox_bottom" v-if="item.type == 0">
										<div>
											<div>设备端 {{item.createTime}}</div>
											<div style="color: #666666;margin:5px 0"
												v-for="(line, lineIndex) in item.commandContentArr" :key="lineIndex">{{ line }}
											</div>
											<div style="color: #999999;" v-if="!item.commandRemarks.name">
												{{item.commandRemarks}}
											</div>
											<div style="color: #999999;" v-if="item.commandRemarks.name">
												<div>
													{{item.commandRemarks.name}}:
												</div>
												<div style="margin-top: 10px;">
													<JsonView :json="item.commandRemarks.commandRemarks" :closed="true">
													</JsonView>
												</div>
											</div>
										</div>
										<div style="height: 20px;"></div>
									</div>
								</div>
								<div style="height: 40px;"></div>
							</div>
						</el-card>
					</div>
					<div style="margin-top: 50px;">
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>控制端口，设备号:{{deviceInfo.deviceCode}}</span>
							</div>
							<div>
								<div :class="['flex', gunList.length === 10 ? 'partBox' : 'partBox1']">
									<div v-for="(gun, index) in gunList" :key="gun.gunNumber || index"
										:class="['partItem', gunList.length === 10 ? 'width10' : 'width20']">
										<div :class="[partIndex === index ? 'active' : '', isPortSelectable(gun.status) ? '' : 'partItem-disabled']"
											@click="choosePart(index)"
											style="width: 100%;height: 100%;">
											<div style="text-align: center;width: 100%;height: 100%;align-items: center;justify-content: center;"
												class="flex">
												<div>
													<div :style="portStatusStyle(gun.status)">{{ gun.gunNumber }}</div>
													<div :style="portStatusStyle(gun.status)">{{ $dict.formatConnectorStatus(gun.status) }}</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div
									style="margin: 28px auto;display: flex;width: 98%;align-items: center;flex-wrap: wrap;">
									<el-row :gutter="20">
										<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
											<div style="text-align: right;line-height: 36px;">
												测试时间
											</div>
										</el-col>
										<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
											<div>
												<el-input-number v-model="time" @change="handleChangeTime" :min="1"
													:max="65535" style="width: 100%">
												</el-input-number>
											</div>
										</el-col>
										<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
											<div>
												<div style="margin-left: 20px;">
													单位：分钟，输入数值需为正整数，例如20，代表20分钟
												</div>
											</div>
										</el-col>
									</el-row>
								</div>
								<div class="control_btn_box flex">
									<div>
										<el-button type="primary" @click='onopenOnePort' size="mini"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:openPort')">
                      						启动端口
										</el-button>
									</div>
									<div>
										<el-button type="primary" @click='onclosePort' size="mini"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:closePort')">
											停止端口
										</el-button>
									</div>
									<div>
										<el-button type="primary" size="mini" @click="onReadDevice"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">
											查询网络
										</el-button>
									</div>
									<div>
										<el-button type="primary" size="mini" @click='onRestartDevice'
										v-if="btnAuthen.permsVerifAuthention(':device:controller:restart')">
											重启设备
										</el-button>
									</div>
									<!-- 查询设备参数见上方下拉 -->
									<el-dropdown size="mini" @command="handleCommand" v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">
										<el-button size="mini" type="primary" icon="el-icon-d-arrow-right" style="margin-left: 10px;">查询设备参数</el-button>
										<el-dropdown-menu slot="dropdown">
											<el-dropdown-item command="90" icon="el-icon-caret-right">设备运行参数</el-dropdown-item>
											<el-dropdown-item command="91" icon="el-icon-warning-outline">充电监测参数</el-dropdown-item>
										</el-dropdown-menu>
									</el-dropdown>
								</div>
							</div>
						</el-card>
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
					<div>
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>参数设置，设备号:{{deviceInfo.deviceCode}}</span>
							</div>
							<div>
								<el-form label-width="125px" class="demo-form-inline" :rules="rules"
									:model="deviceInfoo">
									<el-form-item label="收费类型：" prop="deviceChargePattern">
										<el-radio-group v-model="deviceInfoo.deviceChargePattern" @change="handleSelect">
											<el-radio v-for="item in deviceChargePatternOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="心跳时间：" prop="deviceHeartbeatTime">
												<el-input placeholder="设备上报心跳间隔时间(单位秒,默认60秒)"
													v-model="deviceInfoo.deviceHeartbeatTime" type="number"
 @focus="handleSelect" style="min-width: 217px;">
													<template slot="append">单位秒</template>
												</el-input>
											</el-form-item>
										</el-col>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="等待时间：" prop="waitTime">
												<el-input placeholder="充电启动未插充电器判断时间(单位秒,默认30秒)"
													v-model="deviceInfoo.waitTime" type="number" @focus="handleSelect"
 style="min-width: 217px;">
													<template slot="append">单位秒</template>
												</el-input>
											</el-form-item>
										</el-col>
									</el-row>
									<el-form-item label="总功率上限：" prop="totalPowerUpper">
										<el-input placeholder="限制设备输出总功率（单位瓦，默认6000瓦）"
											v-model="deviceInfoo.totalPowerUpper" type="number" @focus="handleSelect"
>
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="单路功率上限：" prop="powerUpper">
										<el-input placeholder="限制设备单个端口的最大功率（单位瓦，默认1000瓦）"
											v-model="deviceInfoo.powerUpper" type="number" @focus="handleSelect"
>
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="单路功率下限：" prop="powerLower">
										<el-input placeholder="充电完成判断（单位瓦，默认10瓦）" v-model="deviceInfoo.powerLower"
											type="number" @focus="handleSelect">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>

									<!-- 端口数改由 t_device_guns 维护，此处不再配置 -->

									<el-form-item label="大功率端口上限:" prop="highPowerUpper">
										<el-input placeholder="大功率端口上限（单位瓦）" v-model="deviceInfoo.highPowerUpper"
											type="number" @focus="handleSelect">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="大功率端口下限:" prop="highPowerLower">
										<el-input placeholder="大功率端口下限（单位瓦）" v-model="deviceInfoo.highPowerLower"
											type="number" @focus="handleSelect">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="低温温度：" prop="lowTemperature">
										<el-input placeholder="低温禁用(单位摄氏度，默认20，范围0-25)"
											v-model="deviceInfoo.lowTemperature" type="number" @focus="handleSelect"
>
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label="告警温度：" prop="warningTemperature">
										<el-input placeholder="正常可用温度区间(默认55,范围 45~60，设备可以使用)"
											v-model="deviceInfoo.warningTemperature" type="number" @focus="handleSelect"
>
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label="高温温度：" prop="highTemperature">
										<el-input placeholder="温度过高禁用(默认70,范围 60~80，设备不允许使用)"
											v-model="deviceInfoo.highTemperature" type="number" @focus="handleSelect"
>
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label=" ">
										<el-button type="primary" @click="editConfirm" v-loading.fullscreen.lock="loading">确认设置</el-button>
									</el-form-item>
								</el-form>
							</div>
						</el-card>
					</div>
					<div style="margin-top: 50px;">
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>设备详情，在线状态：<el-tag type="success" v-if="deviceInfo.deviceStatus == 1">{{ $dict.formatDeviceStatus(deviceInfo.deviceStatus) }}</el-tag>
									<el-tag type="danger" v-if="deviceInfo.deviceStatus == 0">{{ $dict.formatDeviceStatus(deviceInfo.deviceStatus) }}</el-tag>
								</span>
							</div>
							<div>
								<el-form label-width="120px" class="demo-form-inline">
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="信号强度：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceSignal"
															style="min-width: 100px;"></el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="IMEI：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceImei"
															style="min-width: 100px;"></el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
									</el-row>
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="机箱温度：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceTemperature"
															style="min-width: 100px;">
														</el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="历史总电量：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceElectricity"
															style="min-width: 100px;">
														</el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
									</el-row>
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="设备总功率：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceTotalPower"
															style="min-width: 100px;">
														</el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="软件版本：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceVersion"
															style="min-width: 100px;">
														</el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
									</el-row>
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="sim：">
												<div class="flex">
													<div>
														<el-input disabled v-model="deviceInfo.deviceSim"
															style="min-width: 100px;">
														</el-input>
													</div>
												</div>
											</el-form-item>
										</el-col>
									</el-row>
								</el-form>
							</div>
						</el-card>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script>
	import {
		closeDevice,
		openDevice,
		queryParams,
		readDevice,
		restartDevice,
		setDeviceParams,
		findDeviceInfoById
	} from '@/api/device/deviceList.js'
	import devicePortControlMixin from './devicePortControlMixin'
	import SockJS from 'sockjs-client'
	import Stomp from 'stompjs'
	import JsonView from '@/components/JsonView/JsonView'

	export default {
		name: 'bikeDeviceController',
		components: {
			JsonView
		},
		mixins: [devicePortControlMixin],
		data() {
			return {
				isToBottom: true,
				stompClient: '',
				timer: null,
				CommandDetails: [],
				loading: false,
				deviceInfo: {},
				partIndex: -1,
				time: 1,
				gunList: [],
				deviceInfoo: {
					deviceChargePattern: 0,
					deviceHeartbeatTime: 60,
					waitTime: 30,
					totalPowerUpper: 6000,
					powerUpper: 1000,
					powerLower: 10,
					highPowerUpper: 3000,
					highPowerLower: 50,
					lowTemperature: 20,
					warningTemperature: 55,
					highTemperature: 70,
				},
				deviceChargePatternOptions: [],
				deviceId: '',
				deviceCode: '',
				setInt: null,
				rules: {
					deviceChargePattern: [{
						required: true,
						message: '请选择收费方案',
						trigger: 'blur'
					}],
					deviceHeartbeatTime: [{
						required: true,
						message: '设备上报心跳间隔时间(单位秒,默认60秒)',
						trigger: 'blur'
					}],
					waitTime: [{
						required: true,
						message: '充电启动未插充电器判断时间(单位秒,默认30秒)',
						trigger: 'blur'
					}, ],
					totalPowerUpper: [{
						required: true,
						message: '限制设备输出总功率（单位瓦，默认6000瓦）',
						trigger: 'blur'
					}, ],
					powerUpper: [{
						required: true,
						message: '限制设备单个端口的最大功率（单位瓦，默认1000瓦）',
						trigger: 'blur'
					}, ],
					powerLower: [{
						required: true,
						message: '充电完成判断（单位瓦，默认10瓦）',
						trigger: 'blur'
					}, ],
					lowTemperature: [{
						required: true,
						message: '低温禁用(单位摄氏度，默认20，范围0-25)',
						trigger: 'blur'
					}, ],
					warningTemperature: [{
						required: true,
						message: '正常可用温度区间(默认55,范围45~60，设备可以使用)',
						trigger: 'blur'
					}, ],
					highTemperature: [{
						required: true,
						message: '温度过高禁用(默认70,范围 60~80，设备不允许使用)',
						trigger: 'blur'
					}, ],
					highPowerUpper: [{
						required: true,
						message: '请输入大功率端口上限',
						trigger: 'blur'
					}, ],
					highPowerLower: [{
						required: true,
						message: '请输入大功率端口下限',
						trigger: 'blur'
					}, ],
				}
			}
		},
		methods: {
			handleCommand(command) {
				this.queryDeviceParams(command)
			},
			handleSelect() {
				clearInterval(this.setInt)
			},
			handleChangeTime(value) {
				this.time = value
			},
			editConfirm() {
				const deviceData = {
					deviceCode: this.deviceInfo.deviceCode,
					chargeType: this.deviceInfoo.deviceChargePattern,
					portCount: this.deviceInfoo.portCount,
					heartbeatTime: this.deviceInfoo.deviceHeartbeatTime,
					waitTime: this.deviceInfoo.waitTime,
					totalPowerUpper: this.deviceInfoo.totalPowerUpper,
					powerUpper: this.deviceInfoo.powerUpper,
					powerLower: this.deviceInfoo.powerLower,
					highPowerUpper: this.deviceInfoo.highPowerUpper,
					highPowerLower: this.deviceInfoo.highPowerLower,
					lowTemperature: this.deviceInfoo.lowTemperature,
					highTemperature: this.deviceInfoo.highTemperature,
					warningTemperature: this.deviceInfoo.warningTemperature
				}
				this.loading = true
				setDeviceParams(deviceData).then(res => {
					this.loading = false
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.setInt = setInterval(() => {
							this.onfindDeviceInfoById()
						}, 5000)
					} else {
						this.$message.error(res.msg)
					}
				}).catch(() => {
					this.loading = false
				})
			},
			onopenOnePort() {
				if (!this.ensureIdlePortSelected()) {
					return
				}
				if (!this.time) {
					this.$message.error('请输入测试时间')
					return
				}
				openDevice({
					userId: 1,
					deviceCode: this.deviceInfo.deviceCode,
					port: this.getSelectedPortNumber(),
					mod: 1,
					value: this.time,
					totalPrice: 100
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
						this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onclosePort() {
				if (!this.ensurePortSelected()) {
					return
				}
				closeDevice({
					deviceCode: this.deviceInfo.deviceCode,
					port: this.getSelectedPortNumber()
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
						this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onReadDevice() {
				if (!this.ensurePortSelected()) {
					return
				}
				readDevice({
					deviceCode: this.deviceInfo.deviceCode,
					port: this.getSelectedPortNumber()
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onRestartDevice() {
				restartDevice({
					deviceCode: this.deviceInfo.deviceCode
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			queryDeviceParams(cmd) {
				queryParams({
					deviceCode: this.deviceInfo.deviceCode,
					cmd
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onfindDeviceInfoById() {
				findDeviceInfoById({ deviceId: this.deviceId }).then(res => {
					if (res.code == 200) {
						this.deviceInfo = res.data
						this.loadGunList()
						this.deviceInfoo = {
							deviceChargePattern: this.deviceInfo.deviceChargePattern || 0,
							deviceHeartbeatTime: this.deviceInfo.deviceHeartbeatTime || 60,
							waitTime: this.deviceInfo.waitTime || 30,
							totalPowerUpper: this.deviceInfo.totalPowerUpper || 6000,
							powerUpper: this.deviceInfo.powerUpper || 1000,
							powerLower: this.deviceInfo.powerLower || 10,
							lowTemperature: this.deviceInfo.lowTemperature || 20,
							warningTemperature: this.deviceInfo.warningTemperature || 55,
							highTemperature: this.deviceInfo.highTemperature || 70,
							highPowerUpper: this.deviceInfo.highPowerUpper || 3000,
							highPowerLower: this.deviceInfo.highPowerLower || 50,
							portCount: this.deviceInfo.portCount || 10
						}
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			initWebSocket() {
				this.connection()
				this.timer = setInterval(() => {
					try {
						if (!this.stompClient || !this.stompClient.connected) {
							this.connection()
						}
					} catch (err) {
						this.connection()
					}
				}, 5000)
			},
			connection() {
				const socket = new SockJS('/api/message/websocket')
				this.stompClient = Stomp.over(socket)
				const headers = { Authorization: '' }
				this.stompClient.connect(headers, () => {
					this.stompClient.subscribe(`/up/${this.deviceCode}`, (msg) => {
						const jsonData = JSON.parse(msg.body)
						if (parseInt(jsonData.messageType) !== 1) {
							return
						}
						const messageData = jsonData.messageData
						messageData.commandContentArr = this.lengthCutting(messageData.commandContent, 100)
						if (messageData.createTime) {
							messageData.createTime = messageData.createTime.slice(11, 19)
						}
						this.CommandDetails = this.CommandDetails.concat([messageData])
						this.scrollToBottom()
					}, headers)
				}, () => {
					clearInterval(this.timer)
					clearInterval(this.setInt)
				})
			},
			disconnect() {
				if (this.stompClient) {
					this.stompClient.disconnect()
				}
			}
		},
		mounted() {
			this.$dict.getSelector('device_status')
			this.$dict.getSelector('connector_status')
			this.$dict.getDeviceChargePatternOptions().then(list => { this.deviceChargePatternOptions = list || [] })
		},
		created() {
			this.deviceId = this.$route.query.id
			this.deviceCode = this.$route.query.deviceCode
			this.initWebSocket()
			this.onfindDeviceInfoById()
			this.setInt = setInterval(() => {
				this.onfindDeviceInfoById()
			}, 2000)
		},
		destroyed() {
			this.disconnect()
			clearInterval(this.timer)
			clearInterval(this.setInt)
		}
	}
</script>

<style scoped="scoped">
	* {
		font-size: 14px;
	}

	.flex {
		display: flex;
	}

	.commedBox {
		height: 640px;
		overflow-y: scroll;
	}

	.commedBox_top {
		justify-content: space-between;
	}

	.commedBox_topR {
		margin-right: 15px;
		text-align: end;
		line-height: 24px;
	}

	.partBox {
		width: 92%;
		margin: 0 auto;
	}

	.partBox1 {
		width: 100%;
		margin: 0 auto;
		flex-wrap: wrap;
	}

	.partItem {
		margin-left: 2%;
		height: 45px;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1px solid #EEEEEE;
		margin-top: 20px;
	}

	.width10 {
		width: 12.5%;
	}

	.width20 {
		width: 8%;
	}

	.partItem :hover {
		cursor: pointer
	}

	.partItem-disabled,
	.partItem-disabled:hover {
		cursor: not-allowed !important;
		opacity: 0.75;
	}

	.active {
		border: 1px solid #13CE66 !important;
		color: #13CE66;
	}

	.control_btn_box {
		width: 100%;
		margin: 22px auto;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.control_btn_box div {
		margin-top: 15px;
	}
</style>
