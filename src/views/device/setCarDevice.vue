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
										<el-button type="primary" @click='onOpenDevice' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:openPort')">启动充电
										</el-button>
										<el-button type="primary" @click='onCloseDevice' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:closePort')">停止充电
										</el-button>
										<el-button type="primary" @click='readData' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:controller:query')">端口检测
										</el-button>
                    <el-button type="primary" @click='onRestartDevice' size="mini"
                    	style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
                    	v-if="btnAuthen.permsVerifAuthention(':device:controller:restart')">远程重启
                    </el-button>
                    <el-button type="primary" @click='onQueryRate' size="mini"
                    	style="margin-left: 0;margin-right: 10px;margin-top: 10px;">查询费率
                    </el-button>
                    <el-button type="primary" @click='onQuerySwipeCard' size="mini"
                    	style="margin-left: 0;margin-right: 10px;margin-top: 10px;">查询刷卡模式
                    </el-button>
                    <el-button type="primary" @click='onQueryDevice' size="mini"
                    	style="margin-left: 0;margin-right: 10px;margin-top: 10px;">查询设备参数
                    </el-button>
										<!-- <el-button type="primary" @click='showUpdateCash=true' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:command:updateCash')">账户余额更新
										</el-button> -->
										<!-- <el-button type="primary" @click='showSyncUnLineCard=true' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:command:syncUnLineCard')">离线卡数据同步
										</el-button> -->
										<!-- <el-button type="primary" @click='onSetDeviceTime' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:command:setDeviceTime')">时间同步
										</el-button> -->
										<!-- <el-button type="primary" @click='showRemoteControlLock=true' size="mini"
											style="margin-left: 0;margin-right: 10px;margin-top: 10px;"
											v-if="btnAuthen.permsVerifAuthention(':device:command:remoteControlLock')">遥控地锁升降
										</el-button> -->
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
											class="filter-item" placeholder="请选择类型收费方案" clearable>
											<el-option v-for="item in devicePriceList" :key="item.id" :label="item.feeName" :value="item.id"
                      @select="changeDevciePrice"/>
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
								<span>设备参数设置，在线状态：<el-tag type="success" v-if="deviceInfo.deviceStatus == 1">在线</el-tag>
									<el-tag type="danger" v-if="deviceInfo.deviceStatus == 0">离线</el-tag>
								</span>
							</div>
							<div>
								<el-form label-width="125px" class="demo-form-inline" style="width: 400px;">
									<!-- <el-form-item label="最大充电时长：" prop="maxPower">
										<el-input placeholder="请输入最大充电时长" v-model="maxPower" type="number">
										</el-input>
									</el-form-item>
                  <el-form-item label="最大充电电流：" prop="maxPower">
                  	<el-input placeholder="请输入最大充电电流" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item>
                  <el-form-item label="最小电流检测开关：" prop="maxPower">
                  	<el-input placeholder="请选择电流检测开关" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item>
                  <el-form-item label="最小充电电流：" prop="maxPower">
                  	<el-input placeholder="请输入最小充电电流" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item>
                  <el-form-item label="最小电流检测时间：" prop="maxPower">
                  	<el-input placeholder="请输入最小充电电流" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item>
                  <el-form-item label="最大环境温度：" prop="maxPower">
                  	<el-input placeholder="请输入最大环境温度" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item> -->

                  <!-- <el-form-item label="最大功率比率：" prop="maxPower">
                  	<el-input placeholder="请输入最大功率比率" v-model="maxPower" type="number">
                  	</el-input>
                  </el-form-item>
									<el-form-item label="运营设置：" prop="isWork">
										<el-select v-model="isWork" style="margin-right: 20px ;width: 100%;"
											class="filter-item" placeholder="请选择运营方式" clearable>
											<el-option v-for="item in isWorkList" :key="item.id" :label="item.name"
												:value="item.id" />
										</el-select>
									</el-form-item> -->

									<!-- <el-form-item label=" ">
										<el-button type="primary" @click='onSetDeviceParam' size="mini"
											v-if="btnAuthen.permsVerifAuthention(':device:command:setDeviceParam')">参数设置
										</el-button>
									</el-form-item> -->
								</el-form>
							</div>
						</el-card>
					</div>
				</el-col>
			</el-row>
		</div>
		<!-- <el-dialog :visible.sync="showUpdateCash" title="账户余额更新" @close="showUpdateCash = false" :append-to-body="true">
			<el-form label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'余额'" prop="balance">
					<el-input v-model="balance" clearable placeholder="请输入余额" type="number" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onUpdateCash">确定</el-button>
					<el-button @click="showUpdateCash = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<el-dialog :visible.sync="showSyncUnLineCard" title="离线卡数据同步" @close="showSyncUnLineCard = false"
			:append-to-body="true">
			<el-form label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'类型'" prop="commandCard">
					<el-select v-model="commandCard" style="margin-right: 20px ;width: 100%;" class="filter-item"
						placeholder="请选择类型" clearable>
						<el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item :label="'卡号'" prop="cardNo">
					<el-input placeholder="请输入卡号" v-model="cardNo">
					</el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onSyncUnLineCard">确定</el-button>
					<el-button @click="showSyncUnLineCard = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<el-dialog :visible.sync="showRemoteControlLock" title="遥控地锁升降" @close="showRemoteControlLock = false"
			:append-to-body="true">
			<el-form label-position="left" label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'类型'" prop="lockState">
					<el-select v-model="lockState" style="margin-right: 20px ;width: 100%;" class="filter-item"
						placeholder="请选择类型" clearable>
						<el-option v-for="item in lockStateList" :key="item.id" :label="item.name" :value="item.id" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onRemoteControlLock">确定</el-button>
					<el-button @click="showRemoteControlLock = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog> -->
	</div>
</template>

<script>
	import {
		findDeviceInfoById,
    queryParams,
    readData,
		readDevice,
		closeDevice,
		openDevice,
		setDeviceParam,
		setDeviceChargeModel,
		restartDevice,
		findDevicePriceByPriceType
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
		name: 'setDevice1',
		components: {
			JsonView
		},
		data() {
			return {
				isToBottom: true,
				stompClient: '',
				timer: '',

				CommandDetails: [],
				startTime: '',
				deviceInfo: {},
				partIndex: 0,
				time: 1,
				deviceId: '',
				setInt: null,
				setTime: null,
				portList: [],
				showUpdateCash: false,
				balance: '',

				showSyncUnLineCard: false,
				commandCard: '44',
				cardNo: '',
				tags: [{
					id: '44',
					name: '离线卡数据同步'
				}, {
					id: '46',
					name: '离线卡数据清除'
				}, {
					id: '48',
					name: '离线卡数据查询'
				}],

				showRemoteControlLock: false,
				lockState: '55',
				lockStateList: [{
					id: '55',
					name: '升锁'
				}, {
					id: 'FF',
					name: '降锁'
				}],
				devicePriceList: [],
				devicePriceId: '',
        devicePriceName: '',


				maxPower: 100,
				isWork: '0',
				isWorkList: [{
					id: '0',
					name: '正常工作'
				}, {
					id: '1',
					name: '停止使用'
				}]
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
			//设置设备参数
			onSetDeviceParam() {
				let maxPower = this.maxPower
				if (!maxPower) {
					this.$message.error('请选择最大充电功率')
					return false
				}
				let data = {
					deviceCode: this.deviceCode,
					command: '52',
					maxPower,
					isWork: this.isWork
				}
				setDeviceParam(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
      //选择计费方案
      changeDevciePrice(item) {
        this.devicePriceId = item.id,
        this.devicePriceName = item.feeName
      },
			//设置计费方案
			onSetDeviceChargeModel() {
				let devicePriceId = this.devicePriceId
				if (!devicePriceId) {
					this.$message.error('请选择计费方案')
					return false
				}
				let data = {
					deviceCode: this.deviceCode,
					devicePriceId:devicePriceId
				}
				setDeviceChargeModel(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//计费方案列表
			onFindDevicePriceByPriceType() {
				let ruleId = 2
				let priceType = 1
				let data = {
					ruleId,
					priceType
				}
				findDevicePriceByPriceType(data).then(res => {
					if (res.code == 200) {
            this.devicePriceList = res.data
            this.devicePriceList.forEach((item, index) => {
              console.log("设备方案",item)
            	if (Number(this.devicePriceId) === Number(item.id)) {
            		this.devicePriceName = item.feeName
                console.log("设备方案名称",this.devicePriceName)
            	}
              console.log("设备方案名称",this.devicePriceName)
            })
					}
				})
			},
			//启动充电
			onOpenDevice() {
				let data = {
          userId: 1,
					deviceCode: this.deviceCode,
					port: this.partIndex + 1,
					mod: 1,//手动定时
					value: this.time,
          totalPrice: 1000
				}
				openDevice(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//关闭充电
			onCloseDevice() {
				let data = {
					deviceCode: this.deviceCode,
					port: this.partIndex + 1
				}
				closeDevice(data).then(res => {
					if (res.code === 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//查询网络
			onReadDevice() {
				let data = {
					deviceCode: this.deviceCode,
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
      //远程重启
      onRestartDevice() {
      	let data = {
      		deviceCode: this.deviceCode,
      	}
      	restartDevice(data).then(res => {
      		if (res.code === 200) {
      			this.$message.success(res.msg)
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      //查询费率模式
      onQueryRate(){
        let data = {
          deviceCode: this.deviceCode,
          cmd: "85"
        }
        queryParams(data).then(res => {
      		if (res.code === 200) {
      			this.$message.success(res.msg)
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      //查询刷卡模式
      onQuerySwipeCard(){
        let data = {
          deviceCode: this.deviceCode,
          cmd: "92"
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
      onQueryDevice(){
        let data = {
          deviceCode: this.deviceCode,
          cmd: "93"
        }
        queryParams(data).then(res => {
      		if (res.code === 200) {
      			this.$message.success(res.msg)
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
      //端口检测
      readData(){
        let data = {
          deviceCode: this.deviceCode,
          port: this.partIndex + 1,
          cmd: "12"
        }
        readData(data).then(res => {
      		if (res.code === 200) {
      			this.$message.success(res.msg)
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },

			// //账户余额更新
			// onUpdateCash() {
			// 	let balance = this.balance
			// 	if (!balance) {
			// 		this.$message.error('请输入余额')
			// 		return false
			// 	}
			// 	balance = Math.abs(balance)
			// 	balance = balance.toFixed(2)
			// 	let data = {
			// 		deviceCode: this.deviceCode,
			// 		port: this.partIndex + 1,
			// 		command: '42',
			// 		wlCardNo: '0',
			// 		balance: balance
			// 	}
			// 	updateCash(data).then(res => {
			// 		if (res.code === 200) {
			// 			this.showUpdateCash = false
			// 			this.$message.success(res.msg)
			// 		} else {
			// 			this.$message.error(res.msg)
			// 		}
			// 	})
			// },
			// //离线卡数据同步
			// onSyncUnLineCard() {
			// 	let command = this.commandCard
			// 	let cardNo = this.cardNo
			// 	if (!cardNo) {
			// 		this.$message.error('请输入卡号')
			// 		return false
			// 	}
			// 	let flag = true
			// 	if (command === '44') {
			// 		if (cardNo.length > 15) {
			// 			this.$message.error('卡号长度不得大于15')
			// 			flag = false
			// 		}
			// 	} else if (command === '46') {
			// 		if (cardNo.length > 24) {
			// 			this.$message.error('卡号长度不得大于24')
			// 			flag = false
			// 		}
			// 	} else if (command === '48') {
			// 		if (cardNo.length > 26) {
			// 			this.$message.error('卡号长度不得大于26')
			// 			flag = false
			// 		}
			// 	}
			// 	if (!flag) {
			// 		return false
			// 	}
			// 	let data = {
			// 		deviceCode: this.deviceCode,
			// 		port: this.partIndex + 1,
			// 		command: command,
			// 		wlCardNo: cardNo,
			// 		ljCardNo: cardNo
			// 	}
			// 	syncUnLineCard(data).then(res => {
			// 		if (res.code === 200) {
			// 			this.showSyncUnLineCard = false
			// 			this.$message.success(res.msg)
			// 		} else {
			// 			this.$message.error(res.msg)
			// 		}
			// 	})
			// },
			// //时间同步
			// onSetDeviceTime() {
			// 	let data = {
			// 		deviceCode: this.deviceCode,
			// 		command: '56',
			// 	}
			// 	setDeviceTime(data).then(res => {
			// 		if (res.code === 200) {
			// 			this.$message.success(res.msg)
			// 		} else {
			// 			this.$message.error(res.msg)
			// 		}
			// 	})
			// },
			//遥控地锁升降
			// onRemoteControlLock() {
			// 	let data = {
			// 		deviceCode: this.deviceCode,
			// 		command: '62',
			// 		port: this.partIndex + 1,
			// 		lockState: this.lockState
			// 	}
			// 	remoteControlLock(data).then(res => {
			// 		if (res.code === 200) {
			// 			this.showRemoteControlLock = false
			// 			this.$message.success(res.msg)
			// 		} else {
			// 			this.$message.error(res.msg)
			// 		}
			// 	})
			// },

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
			//选择端口
			choosePart(index) {
				this.partIndex = index
			},
			//获取启动时间
			handleChangeTime(value) {
				this.time = value
			},
			//设备详情
			onfindDeviceInfoById() {
				let data = {
					deviceId: this.deviceId
				}
				findDeviceInfoById(data).then(res => {
					if (res.code == 200) {
						this.deviceInfo = res.data
            this.devicePriceId = this.deviceInfo.devicePriceId
						let portList = []
						for (let i = 0; i < this.deviceInfo.portCount; i++) {
							let str = "port" + (i + 1)
							portList[i] = this.deviceInfo[str]
						}
						this.portList = portList
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
        //线下
        //let sockJS = new SockJS(`${process.env.VUE_APP_BASE_API}/api/message/websocket`);
				// 线上
				let sockJS = new SockJS(`/api/message/websocket`);
				this.stompClient = Stomp.over(sockJS);
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
								item.commandContentArr = this.lengthCutting(item.commandContent,100)
								if (item.createTime) {
									let createTime = parseTime(item.createTime)
									let time = ''
									let hh = createTime.slice(11, 13)
									let mm = createTime.slice(14, 16)
									let ss = createTime.slice(17, 19)
									time = hh + ':' + mm + ':' + ss
									item.createTime = time
								}

								if (item.commandRemarks.indexOf('端口状态返回') > -1) {
									let commandRemarks = item.commandRemarks.replace('端口状态返回:','')
									commandRemarks = commandRemarks.replace(/\\|\//g, '')
									console.log(commandRemarks)
									commandRemarks = JSON.parse(commandRemarks)
									item.commandRemarks = {
										name: '端口状态返回',
										commandRemarks
									}
									console.log(item.commandRemarks)
								}
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

			// 读取数据
			// webSocket查询设备应答回复明细
			this.initWebSocket();
			// webSocket查询设备应答回复明细


			// 接口轮询查询设备详情
			this.onfindDeviceInfoById()
			let setInt = setInterval(() => {
				this.onfindDeviceInfoById()
			}, 5000)
			this.setInt = setInt
			// 接口轮询查询设备详情

			this.onFindDevicePriceByPriceType()
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
		width: 98%;
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
