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
												v-for="(item,index) in item.commandContentArr" :key="index">{{item}}
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
								<!-- class="flex partBox" -->
								<div :class="['flex',portList.length == 10 ? 'partBox' : 'partBox1']">
									<div v-for="(item,index) in portList" :key="index"
										:class="['partItem',portList.length == 10 ? 'width10' : 'width20']">
										<!-- 空闲 -->
										<div :class="[partIndex == index ? 'active' : '']" @click="choosePart(index)"
											v-if="item == 0" style="width: 100%;height: 100%;">
											<div style="text-align: center;width: 100%;height: 100%;align-items: center;justify-content: center;"
												class="flex">
												<div>
													<div>{{index+1}}</div>
													<div>空闲</div>
												</div>
											</div>
										</div>
										<!-- 占用 -->
										<div :class="['','flex',partIndex == index ? 'active' : '']" v-if="item == 1"
											style="width: 100%;height: 100%;" @click="choosePart(index)">
											<div style="text-align: center;width: 100%;height: 100%;align-items: center;justify-content: center;"
												class="flex">
												<div>
													<div style="color: #FCCC40;">{{index+1}}</div>
													<div style="color: #FCCC40;">占用</div>
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
									<!-- <div>
										<el-button type="primary" size="mini" @click='onQueryDeviceParams83'
										v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">
											查询设备参数
										</el-button>
									</div> -->
									<!-- <div>
										<el-button type="primary" size="mini" @click='onQueryDeviceParams84'
										v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">
											查询设备参数
										</el-button>
									</div> -->
									<el-dropdown size="mini" @command="(command) => handleCommand(command, deviceInfo.deviceCode)" v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">
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
											<!-- <el-radio :label="0">按时间收费</el-radio>
											<el-radio :label="1">按电量收费</el-radio> -->
											<el-radio :label="2">免费</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-row>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="心跳时间：" prop="deviceHeartbeatTime">
												<el-input placeholder="设备上报心跳间隔时间(单位秒,默认60秒)"
													v-model="deviceInfoo.deviceHeartbeatTime" type="number"
													@focus="handleSelect" style="min-width: 217px;" @blur="handleBlur">
													<template slot="append">单位秒</template>
												</el-input>
											</el-form-item>
										</el-col>
										<el-col :xl="12" :lg="24" :xs="24">
											<el-form-item label="等待时间：" prop="waitTime">
												<el-input placeholder="充电启动未插充电器判断时间(单位秒,默认30秒)"
													v-model="deviceInfoo.waitTime" type="number" @focus="handleSelect"
													style="min-width: 217px;" @blur="handleBlur">
													<template slot="append">单位秒</template>
												</el-input>
											</el-form-item>
										</el-col>
									</el-row>
									<el-form-item label="总功率上限：" prop="totalPowerUpper">
										<el-input placeholder="限制设备输出总功率（单位瓦，默认6000瓦）"
											v-model="deviceInfoo.totalPowerUpper" type="number" @focus="handleSelect"
											@blur="handleBlur">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="单路功率上限：" prop="powerUpper">
										<el-input placeholder="限制设备单个端口的最大功率（单位瓦，默认1000瓦）"
											v-model="deviceInfoo.powerUpper" type="number" @focus="handleSelect"
											@blur="handleBlur">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="单路功率下限：" prop="powerLower">
										<el-input placeholder="充电完成判断（单位瓦，默认10瓦）" v-model="deviceInfoo.powerLower"
											type="number" @focus="handleSelect" @blur="handleBlur">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>

									<!-- <el-form-item label="设备端口数：" prop="portCount">
										<el-radio-group v-model="deviceInfoo.portCount" @change="handleSelect">
											<el-radio :label="10">10路</el-radio>
											<el-radio :label="20">20路</el-radio>
										</el-radio-group>
									</el-form-item> -->

									<el-form-item label="大功率端口上限:" prop="highPowerUpper">
										<el-input placeholder="大功率端口上限（单位瓦）" v-model="deviceInfoo.highPowerUpper"
											type="number" @focus="handleSelect" @blur="handleBlur">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="大功率端口下限:" prop="highPowerLower">
										<el-input placeholder="大功率端口下限（单位瓦）" v-model="deviceInfoo.highPowerLower"
											type="number" @focus="handleSelect" @blur="handleBlur">
											<template slot="append">单位瓦</template>
										</el-input>
									</el-form-item>
									<el-form-item label="低温温度：" prop="lowTemperature">
										<el-input placeholder="低温禁用(单位摄氏度，默认20，范围0-25)"
											v-model="deviceInfoo.lowTemperature" type="number" @focus="handleSelect"
											@blur="handleBlur">
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label="告警温度：" prop="warningTemperature">
										<el-input placeholder="正常可用温度区间(默认55,范围 45~60，设备可以使用)"
											v-model="deviceInfoo.warningTemperature" type="number" @focus="handleSelect"
											@blur="handleBlur">
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label="高温温度：" prop="highTemperature">
										<el-input placeholder="温度过高禁用(默认70,范围 60~80，设备不允许使用)"
											v-model="deviceInfoo.highTemperature" type="number" @focus="handleSelect"
											@blur="handleBlur">
											<template slot="append">单位摄氏度</template>
										</el-input>
									</el-form-item>
									<el-form-item label=" ">
										<!-- <el-button type="primary" @click=''>读取数据
										</el-button> -->
										<el-button type="primary" @click='editConfirm' v-loading.fullscreen.lock="loading">确认设置</el-button>
									</el-form-item>
								</el-form>
							</div>
						</el-card>
					</div>
					<div style="margin-top: 50px;">
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>设备详情，在线状态：<el-tag type="success" v-if="deviceInfo.deviceStatus == 1">在线</el-tag>
									<el-tag type="danger" v-if="deviceInfo.deviceStatus == 0">离线</el-tag>
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
		getList,
		openAllPort,
   		closeAllPort,
		closeDevice,
		openDevice,
		queryParams,
		readDevice,
		restartDevice,
		setDeviceParams,
		findDeviceInfoById
	} from '@/api/device/deviceList.js'
	import {
		connectWebsocket,
		closeWebsocket
	} from '../../utils/websocket.js'
	import {
		parseTime
	} from '@/utils/index'
	import SockJS from 'sockjs-client';
	import Stomp from 'stompjs';
	import JsonView from '@/components/JsonView/JsonView'
	export default {
		name: 'bikeDeviceController',
		components: {
			JsonView
		},
		data() {
			return {
				isToBottom: true,
				stompClient: '',
				timer: null,
				CommandDetails: [],
				startTime: '',
				loading: false,
				listQuery: {
					page: 1,
					limit: 10
				},
				deviceInfo: {},
				partIndex: 0,
				time: 1,
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
				deviceId: '',
				setInt: null,
				setTime: null,
				portList: [],
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
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		methods: {
			// 更多操作触发
			handleCommand(command, deviceCode) {
				switch (command) {
					case "90":
						this.onQueryDeviceParams83();
						break;
					case "91":
						this.onQueryDeviceParams84();
						break;
					default:
						break;
				}
			},
			enter() {
				this.isToBottom = false
			},
			leave() {
				this.isToBottom = true
			},
			//滑动到底
			scrollToBottom() {
				this.$nextTick(() => {
					let box = this.$el.querySelector(".commedBox")
					box.scrollTop = box.scrollHeight
				})
			},
			//选择输入框停止读取数据
			handleSelect() {
				console.log('选中输入框')
				clearInterval(this.setInt)
			},
			handleBlur() {
				// this.setInt = setInterval(() => {
				// 	this.onfindDeviceInfoById()
				// }, 2000)
			},
			//选择端口
			choosePart(index) {
				this.partIndex = index
			},
			//获取启动时间
			handleChangeTime(value) {
				this.time = value
			},

			//设置设备参数
			editConfirm() {
				let deviceData = {}
				deviceData.deviceCode = this.deviceInfo.deviceCode
				deviceData.chargeType = this.deviceInfoo.deviceChargePattern
				deviceData.portCount = this.deviceInfoo.portCount
				deviceData.heartbeatTime = this.deviceInfoo.deviceHeartbeatTime
				deviceData.waitTime = this.deviceInfoo.waitTime
				deviceData.totalPowerUpper = this.deviceInfoo.totalPowerUpper
				deviceData.powerUpper = this.deviceInfoo.powerUpper
				deviceData.powerLower = this.deviceInfoo.powerLower
				deviceData.highPowerUpper = this.deviceInfoo.highPowerUpper
				deviceData.highPowerLower = this.deviceInfoo.highPowerLower
				let lowTemperature = this.deviceInfoo.lowTemperature
				// lowTemperature = Math.abs(lowTemperature);
				deviceData.lowTemperature = lowTemperature
				let highTemperature = this.deviceInfoo.highTemperature
				// highTemperature = Math.abs(highTemperature);
				deviceData.highTemperature = highTemperature
				let warningTemperature = this.deviceInfoo.warningTemperature
				// warningTemperature = Math.abs(warningTemperature);
				deviceData.warningTemperature = warningTemperature
				this.loading = true
				setDeviceParams(deviceData).then(res => {
					if (res.code == 200) {
						this.loading = false
						this.$message.success(res.msg)
						this.setInt = setInterval(() => {
							this.onfindDeviceInfoById()
						}, 5000)
					} else {
						this.$message.error(res.msg)
						this.loading = false
					}
				})
			},
      		//设置设备参数


			//启动全部端口
			onopenAllPort() {
				let popData1 = {
					deviceCode: this.deviceInfo.deviceCode,
					time: this.time,
					command: this.command1,
				}
				if (this.time == '' || this.time == null || this.time == undefined) {
					this.$message.error('请输入测试时间')
					return false
				}
				openAllPort(popData1).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//启动全部端口

			//关闭全部端口
			oncloseAllPort() {
				let popData = {
					deviceCode: this.deviceInfo.deviceCode,
					command: 'C1',
				}
				closeAllPort(popData).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//关闭全部端口

			// 启动单个端口
			onopenOnePort() {
				console.log(this.partIndex, "开启单个端口")
				// if(this.partIndex == '' || this.partIndex == null || this.partIndex == undefined){
				// 	this.$message.error('请选择测试端口')
				// 	return false
				// }
				if (this.time == '' || this.time == null || this.time == undefined) {
					this.$message.error('请输入测试时间')
					return false
				}
				let data = {
					userId: 1,
					deviceCode: this.deviceInfo.deviceCode,
					port: parseInt(this.partIndex)  + 1,
					mod: 1,//手动定时
					value: this.time,
					totalPrice: 100
				}
				console.log('开启单个端口', data)
				openDevice(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			// 启动单个端口

			// 关闭单个端口
			onclosePort() {
				// if(this.partIndex == '' || this.partIndex == null || this.partIndex == undefined){
				// 	this.$message.error('请选择测试端口')
				// 	return false
				// }
				let data = {
					deviceCode:  this.deviceInfo.deviceCode,
					port: parseInt(this.partIndex) + 1
				}
				closeDevice(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					this.onfindDeviceInfoById()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			// 关闭单个端口


			//查询网络
			onReadDevice() {
				let data = {
				deviceCode: this.deviceInfo.deviceCode,
				port: this.partIndex + 1
				}
				readDevice(data).then(res => {
				if (res.code === 200) {
					this.$message.success(res.msg)
				} else {
					this.$message.error(res.msg)
				}
				})
			},
      		//查询网络

			//远程重启
			onRestartDevice() {
				let data = {
				deviceCode: this.deviceInfo.deviceCode,
				}
				restartDevice(data).then(res => {
				if (res.code === 200) {
					this.$message.success(res.msg)
				} else {
					this.$message.error(res.msg)
				}
				})
			},
			//远程重启

			//查询设备参数
			onQueryDeviceParams83(){
				let data = {
					deviceCode: this.deviceInfo.deviceCode,
					cmd: "90"
				}
				queryParams(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onQueryDeviceParams84(){
				let data = {
					deviceCode: this.deviceInfo.deviceCode,
					cmd: "91"
				}
				queryParams(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//查询设备参数

			//设备详情
			onfindDeviceInfoById() {
				let data = {
					deviceId: this.deviceId
				}
				findDeviceInfoById(data).then(res => {
					if (res.code == 200) {
						this.deviceInfo = res.data
						let portList = []
						for (let i = 0; i < this.deviceInfo.portCount; i++) {
							let str = "port" + (i + 1)
							portList[i] = this.deviceInfo[str]
						}
						this.portList = portList
						// let {
						// 	deviceChargePattern,
						// 	deviceHeartbeatTime,
						// 	waitTime,
						// 	totalPowerUpper,
						// 	powerUpper,
						// 	powerLower,
						// 	lowTemperature,
						// 	warningTemperature,
						// 	highTemperature,
						// 	highPowerUpper,
						// 	highPowerLower,
						// 	portCount
						// } = this.deviceInfo
						this.deviceInfoo = {
							deviceChargePattern: this.deviceInfo.deviceChargePattern ? this.deviceInfo.deviceChargePattern : 0 ,
							deviceHeartbeatTime: this.deviceInfo.deviceHeartbeatTime ? this.deviceInfo.deviceHeartbeatTime : 60,
							waitTime: this.deviceInfo.waitTime ? this.deviceInfo.waitTime : 30 ,
							totalPowerUpper: this.deviceInfo.totalPowerUpper ? this.deviceInfo.totalPowerUpper : 6000,
							powerUpper: this.deviceInfo.powerUpper ? this.deviceInfo.powerUpper : 1000,
							powerLower: this.deviceInfo.powerLower ? this.deviceInfo.powerLower : 10,
							lowTemperature: this.deviceInfo.lowTemperature ? this.deviceInfo.lowTemperature : 20,
							warningTemperature: this.deviceInfo.warningTemperature ? this.deviceInfo.warningTemperature : 55,
							highTemperature: this.deviceInfo.highTemperature ? this.deviceInfo.highTemperature : 70,
							highPowerUpper: this.deviceInfo.highPowerUpper ? this.deviceInfo.highPowerUpper : 3000,
							highPowerLower: this.deviceInfo.highPowerLower ? this.deviceInfo.highPowerLower : 50,
							portCount: this.deviceInfo.portCount ? this.deviceInfo.portCount : 10
						}
						// this.deviceInfoo = {
						// 	deviceChargePattern,
						// 	deviceHeartbeatTime,
						// 	waitTime,
						// 	totalPowerUpper,
						// 	powerUpper,
						// 	powerLower,
						// 	lowTemperature,
						// 	warningTemperature,
						// 	highTemperature,
						// 	highPowerUpper,
						// 	highPowerLower,
						// 	portCount
						// }
					} else {
						this.$message.error(res.msg)
					}
				})
			},

			//返回当前时间
			getTime() {
				var date = new Date()
				var y = date.getFullYear()
				var m = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
				var d = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
				var hh = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours())
				var mm = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes())
				var ss = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
				return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
			},

			//初始化WebSocket
			initWebSocket() {
				this.connection();
				let that = this;
				this.timer = setInterval(() => {
					try {
						// that.stompClient.send("test");
					} catch (err) {
						console.log("断线了: " + err);
						that.connection();
					}
				}, 5000);
			},

			//WebSocket连接
			connection() {
				// 线上
        		let socket = new SockJS(`/api/message/websocket`);
        		//线下
				// let socket = new SockJS(`${process.env.VUE_APP_BASE_API}/api/message/websocket`);
				this.stompClient = Stomp.over(socket);
				let headers = {
					Authorization: '',
				}
				this.stompClient.connect(headers, () => {
					let deviceCode = this.deviceCode
					this.stompClient.subscribe(`/up/${deviceCode}`, (msg) => {
						console.log(msg.body);
						let jsonData = JSON.parse(msg.body)
						let messageType = jsonData.messageType
						//messageType:1 (后台控制消息) //messageType:2 (小程序设备端口启动消息)
						if (parseInt(messageType) != 1) {
							return false
						}
						let messageData = jsonData.messageData
						let CommandDetails = []
						CommandDetails.push(messageData)
						if (CommandDetails.length != 0) {
							CommandDetails.forEach((item, index) => {
								item.commandContentArr = this.lengthCutting(item.commandContent, 100)
								let time = ''
								let hh = item.createTime.slice(11, 13)
								let mm = item.createTime.slice(14, 16)
								let ss = item.createTime.slice(17, 19)
								time = hh + ':' + mm + ':' + ss
								item.createTime = time
							})
						}
						this.CommandDetails = this.CommandDetails.concat(CommandDetails)
						this.scrollToBottom()
					}, headers);
					// this.stompClient.send(`/up/${deviceCode}`,
					// 	headers,
					// 	JSON.stringify({
					// 		sender: '',
					// 		chatType: 'JOIN'
					// 	}),
					// )
				}, (err) => {
					clearInterval(this.timer)
					clearInterval(this.setInt)
					clearInterval(this.setTime)
					console.log('连接失败关闭定时')
					console.log('连接失败')
					console.log(err);
				});
			},
			disconnect() {
				if (this.stompClient) {
					this.stompClient.disconnect();
				}
			},
			/**
			 * 字符串按字数分割，返回数组
			 * str 需要切割的字符串
			 * num 切割字数
			 * retrurn 切割后的数据
			 * **/
			lengthCutting(str, num) {
				let strArr = [];
				for (let i = 0; i < str.length; i += num) strArr.push(str.slice(i, i + num));
				return strArr;
			}
		},
		mounted() {

		},
		created() {
			let id = this.$route.query.id
			let deviceCode = this.$route.query.deviceCode
			this.deviceId = id
			this.deviceCode = deviceCode
			console.log(this.deviceId, this.deviceCode)

			// webSocket查询设备应答回复明细
			this.initWebSocket();
			// webSocket查询设备应答回复明细

			// 接口轮询查询设备应答回复明细
			// this.startTime = this.getTime()
			// let setTime = setInterval(() => {
			// 	this.findDeviceCommandDetail()
			// }, 2000)
			// this.setTime = setTime
			// 接口轮询查询设备应答回复明细

      		//首次查询
			this.onfindDeviceInfoById()
      		//首次查询

      		// 接口轮询查询设备详情
			let setInt = setInterval(() => {
				this.onfindDeviceInfoById()
			}, 2000)
			this.setInt = setInt
			// 接口轮询查询设备详情
		},
		destroyed() {
			this.disconnect();
			clearInterval(this.timer)
			clearInterval(this.setInt)
			clearInterval(this.setTime)
			console.log('页面关闭')
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

	.active {
		border: 1px solid #13CE66 !important;
		color: #13CE66;
	}

	.control_btn_box {
		width: 100%;
		margin: 22px auto;
		/* margin-top: 10px; */
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.control_btn_box div {
		margin-top: 15px;
	}

	.lineBox {
		color: red;
		/* border: 1px solid red; */
		background-color: #E0E0E0;
		color: #333;
	}

	/* .box-card{
		overflow-x: scroll;
	} */
</style>
