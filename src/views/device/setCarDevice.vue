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
								<div class="port-control-panel">
									<div class="port-control-time">
										<span class="port-control-time__label">测试时间</span>
										<el-input-number
											v-model="time"
											class="port-control-time__input"
											size="small"
											controls-position="right"
											:min="1"
											:max="65535"
											@change="handleChangeTime"
										/>
										<span class="port-control-time__hint">单位：分钟（正整数，如 20 表示 20 分钟）</span>
									</div>
									<div class="port-control-actions">
										<div class="port-control-group">
											<div class="port-control-group__title">充电控制</div>
											<div class="port-control-group__buttons">
												<el-button
													type="primary"
													size="small"
													icon="el-icon-video-play"
													@click="onOpenDevice"
													v-if="btnAuthen.permsVerifAuthention(':device:controller:openPort')"
												>启动充电</el-button>
												<el-button
													type="warning"
													size="small"
													plain
													icon="el-icon-video-pause"
													@click="onCloseDevice"
													v-if="btnAuthen.permsVerifAuthention(':device:controller:closePort')"
												>停止充电</el-button>
											</div>
										</div>
										<div class="port-control-group">
											<div class="port-control-group__title">检测与维护</div>
											<div class="port-control-group__buttons">
												<el-button
													size="small"
													icon="el-icon-search"
													@click="onPortDetect"
													v-if="btnAuthen.permsVerifAuthention(':device:controller:query')"
												>端口检测</el-button>
												<el-button
													size="small"
													icon="el-icon-refresh-right"
													@click="onRestartDevice"
													v-if="btnAuthen.permsVerifAuthention(':device:controller:restart')"
												>远程重启</el-button>
											</div>
										</div>
										<div class="port-control-group">
											<div class="port-control-group__title">参数查询</div>
											<div class="port-control-group__buttons">
												<el-button size="small" icon="el-icon-money" @click="onQueryRate">查询费率</el-button>
												<el-button size="small" icon="el-icon-bank-card" @click="onQuerySwipeCard">查询刷卡模式</el-button>
												<el-button size="small" icon="el-icon-setting" @click="onQueryDevice">查询设备参数</el-button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</el-card>
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
					<div>
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>计费模型设置，设备号:{{deviceInfo.deviceCode}}</span>
							</div>
							<div>
								<el-form label-width="125px" class="demo-form-inline" style="width: 400px;">
									<el-form-item label="收费方案：" prop="devicePriceName">
										<el-select v-model="devicePriceId" style="margin-right: 20px ;width: 100%;"
											class="filter-item" placeholder="请选择类型收费方案" clearable
											@change="changeDevicePrice">
											<el-option v-for="item in devicePriceList" :key="item.id" :label="item.feeName" :value="item.id" />
										</el-select>
									</el-form-item>
									<el-form-item label=" ">
										<el-button type="primary" @click='onSetDeviceChargeModel' size="mini"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:set')">设置计费方案
										</el-button>
									</el-form-item>
								</el-form>
							</div>
						</el-card>
					</div>
					<div style="margin-top: 50px;">
						<el-card class="box-card">
							<div slot="header" class="clearfix">
								<span>设备详情，在线状态：<el-tag :type="deviceInfo.deviceStatus == 1 ? 'success' : 'danger'">{{ $dict.formatDeviceStatus(deviceInfo.deviceStatus) }}</el-tag>
								</span>
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
		findDeviceInfoById,
		queryParams,
		readData as readPortData,
		closeDevice,
		openDevice,
		setDeviceChargeModel,
		restartDevice,
		findDevicePriceByPriceType
	} from '@/api/device/deviceList.js'
	import devicePortControlMixin from '@/components/DevicePortControl/mixin'
	import { parseTime } from '@/utils/index'
	import SockJS from 'sockjs-client'
	import Stomp from 'stompjs'
	import JsonView from '@/components/JsonView/JsonView'

	export default {
		name: 'carDeviceController',
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
				deviceInfo: {},
				partIndex: -1,
				time: 1,
				deviceId: '',
				deviceCode: '',
				setInt: null,
				gunList: [],
				devicePriceList: [],
				devicePriceId: '',
				devicePriceName: ''
			}
		},
		methods: {
			changeDevicePrice(priceId) {
				const item = this.devicePriceList.find(p => Number(p.id) === Number(priceId))
				this.devicePriceName = item ? item.feeName : ''
			},
			onSetDeviceChargeModel() {
				if (!this.devicePriceId) {
					this.$message.error('请选择计费方案')
					return
				}
				setDeviceChargeModel({
					deviceCode: this.deviceCode,
					devicePriceId: this.devicePriceId
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onFindDevicePriceByPriceType() {
				findDevicePriceByPriceType({ ruleId: 2, priceType: 1 }).then(res => {
					if (res.code == 200) {
						this.devicePriceList = res.data || []
						this.changeDevicePrice(this.devicePriceId)
					}
				})
			},
			onOpenDevice() {
				if (!this.ensureIdlePortSelected()) {
					return
				}
				if (!this.time) {
					this.$message.error('请输入测试时间')
					return
				}
				openDevice({
					deviceCode: this.deviceCode,
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
			onCloseDevice() {
				if (!this.ensurePortSelected()) {
					return
				}
				closeDevice({
					deviceCode: this.deviceCode,
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
			onRestartDevice() {
				restartDevice({ deviceCode: this.deviceCode }).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			queryDeviceParams(cmd) {
				queryParams({
					deviceCode: this.deviceCode,
					cmd
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			onQueryRate() {
				this.queryDeviceParams('85')
			},
			onQuerySwipeCard() {
				this.queryDeviceParams('92')
			},
			onQueryDevice() {
				this.queryDeviceParams('93')
			},
			onPortDetect() {
				if (!this.ensurePortSelected()) {
					return
				}
				readPortData({
					deviceCode: this.deviceCode,
					port: this.getSelectedPortNumber(),
					cmd: '12'
				}).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			handleChangeTime(value) {
				this.time = value
			},
			onfindDeviceInfoById() {
				findDeviceInfoById({ deviceId: this.deviceId }).then(res => {
					if (res.code == 200) {
						this.deviceInfo = res.data
						this.devicePriceId = this.deviceInfo.devicePriceId
						this.loadGunList()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			parsePortStatusRemarks(item) {
				if (typeof item.commandRemarks !== 'string' || item.commandRemarks.indexOf('端口状态返回') === -1) {
					return
				}
				try {
					const raw = item.commandRemarks.replace('端口状态返回:', '').replace(/\\|\//g, '')
					item.commandRemarks = {
						name: '端口状态返回',
						commandRemarks: JSON.parse(raw)
					}
				} catch (e) {
					// 保留原始文本，避免 WebSocket 消息解析失败中断展示
				}
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
				const sockJS = new SockJS('/api/message/websocket')
				this.stompClient = Stomp.over(sockJS)
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
							const createTime = parseTime(messageData.createTime)
							messageData.createTime = createTime.slice(11, 19)
						}
						this.parsePortStatusRemarks(messageData)
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
		},
		created() {
			this.deviceId = this.$route.query.id
			this.deviceCode = this.$route.query.deviceCode
			this.initWebSocket()
			this.onfindDeviceInfoById()
			this.setInt = setInterval(() => {
				this.onfindDeviceInfoById()
			}, 5000)
			this.onFindDevicePriceByPriceType()
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
</style>

<style scoped lang="scss">
	@import '~@/components/DevicePortControl/port-control.scss';
</style>
