<template>
  <div>
    <!-- 顶部选项卡 -->
    <el-tabs v-model="activeMainTab" type="card" @tab-click="handleMainTabClick">
      <el-tab-pane label="充电桩" name="chargingPile"></el-tab-pane>
      <el-tab-pane label="充电枪1" name="gun1"></el-tab-pane>
      <el-tab-pane label="充电枪2" name="gun2"></el-tab-pane>
      <el-tab-pane label="连接设置" name="connection"></el-tab-pane>
    </el-tabs>

    <el-row :gutter="20">
      <!-- 主内容区域 -->
      <el-col :span="16">
        <!--连接设置选项卡-->
        <div v-if="activeMainTab === 'connection'">
          <el-col :span="16">
            <el-card>
              <h3>连接设置</h3>
              <el-form ref="form" :model="form" label-width="150px">
                <!-- ChargePoint Server -->
                <el-form-item label="连接地址">
                  <el-input v-model="form.chargePointServer">
                    <template slot="prepend">tcp://</template>
                  </el-input>
                </el-form-item>

                <!-- ChargePoint ID -->
                <el-form-item label="设备编号">
                  <el-input v-model="form.chargePointId"></el-input>
                </el-form-item>

                <!-- ChargePoint Model -->
                <el-form-item label="设备型号">
                  <el-select v-model="form.chargePointModel" placeholder="请选择型号" @change="changeType">
                    <el-option
                      v-for="item in chargePointModelOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- ChargePoint Type -->
                <el-form-item label="设备类型">
                  <el-select v-model="form.chargingPointTypeId" placeholder="请选择类型">
                    <el-option v-for="item in chargingPointModels"
                    :key="item.deviceTypeId"
                    :label="item.deviceTypeName"
                    :value="item.deviceTypeId + ''" :disabled="showDeviceType"/>
                  </el-select>
                </el-form-item>

                <!-- ChargePoint Version -->
                <el-form-item label="软件版本">
                  <el-input v-model="form.chargePointVersion" disabled>
                    <template slot="prepend">YKC</template>
                  </el-input>
                </el-form-item>

                <!-- Firmware Version -->
                <el-form-item label="固件版本">
                  <el-input v-model="form.firmwareVersion"></el-input>
                </el-form-item>

                <!-- Charge Point Vendor -->
                <!-- <el-form-item label="ChargePoint Vendor">
                  <el-input v-model="form.chargePointVendor"></el-input>
                </el-form-item> -->

                <!-- RFID Tag -->
                <!-- <el-form-item label="RFID Tag">
                  <el-input v-model="form.rfidTag"></el-input>
                </el-form-item> -->

                <!-- ICC Id -->
                <!-- <el-form-item label="ICC Id">
                  <el-input v-model="form.iccId"></el-input>
                </el-form-item> -->

                <!-- Meter Type -->
                <!-- <el-form-item label="Meter Type">
                  <el-input v-model="form.meterType"></el-input>
                </el-form-item> -->

                <!-- Meter Serial Number -->
                <!-- <el-form-item label="Meter Serial Number">
                  <el-input v-model="form.meterSerialNumber"></el-input>
                </el-form-item> -->

                <!-- Vendor Id -->
                <!-- <el-form-item label="Vendor Id">
                  <el-input v-model="form.vendorId"></el-input>
                </el-form-item> -->

                <!-- Reservation Id -->
                <!-- <el-form-item label="Reservation Id">
                  <el-input v-model="form.reservationId"></el-input>
                </el-form-item> -->

                <!-- 保存按钮 -->
                <el-form-item>
                  <el-button type="primary" @click="saveForm" v-if="!serverConnected">Save</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!--充电桩选项卡-->
        <div v-if="activeMainTab === 'chargingPile'">
          <!-- 充电桩选项卡内容 -->
          <el-col :span="16">
            <el-card>
              <el-form label-width="180px">
                <!-- Server Status -->
                <el-form-item label="连接状态:">
                  <span :style="{ color: serverConnected ? 'green' : 'red' }">
                    <!-- {{ serverConnected ? "Connected" : "Disconnected" }} -->
                    {{ serverConnected ? "已连接" : "未连接" }}
                  </span>
                </el-form-item>

                <!-- Charge Point Availability -->
                <el-form-item label="设备可用性:">
                  <el-select v-model="chargePointFrom.chargePointAvailability" placeholder="Select" disabled>
                    <el-option
                      v-for="item in availabilityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- Charge Point Status -->
                <el-form-item label="设备状态:">
                  <el-select v-model="chargePointFrom.chargePointStatus" placeholder="Select" @change="changeStatus">
                    <el-option
                      v-for="item in chargePointStatusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- Meter Value -->
                <!-- <el-form-item label="Meter value -> SampledValue:">
                  <el-input-number
                    v-model="chargePointFrom.meterValue"
                    :min="0"
                    :max="100"
                    label="Meter Value"
                  ></el-input-number>
                </el-form-item> -->

                <!-- SampledValue -> Context -->
                <!-- <el-form-item label="SampledValue -> Context:">
                  <el-select v-model="chargePointFrom.sampledContext" placeholder="Select">
                    <el-option
                      v-for="item in contextOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item> -->

                <!-- SampledValue -> Measurand -->
                <!-- <el-form-item label="SampledValue -> Measurand:">
                  <el-select v-model="chargePointFrom.sampledMeasurand" placeholder="Select">
                    <el-option
                      v-for="item in measurandOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item> -->

                <!-- 连接按钮 -->
                <el-form-item>
                  <el-button
                    :type="serverConnected ? 'danger' : 'primary'"
                    @click="toggleConnection"
                  >
                    {{ serverConnected ? "Connected" : "Connect" }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!-- 充电枪选项卡 -->
        <div v-if="activeMainTab === 'gun1'">
          <!-- 充电枪选项卡内容 -->
          <el-col :span="16">
            <el-card>
              <el-form label-width="180px">
                <!-- ConnectorAvailability -->
                <el-form-item label="枪可用性:">
                  <el-select v-model="connector1From.connectorAvailability" placeholder="Select" disabled>
                    <el-option
                      v-for="item in availabilityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- ConnectorStatus -->
                <el-form-item label="枪状态:">
                  <el-select v-model="connector1From.connectorStatus" placeholder="Select">
                    <el-option
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- 状态通知 -->
                <el-form-item>
                  <el-button type="primary" @click="statusNotification(1)">Status Notification</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!-- 充电枪选项卡 -->
        <div v-if="activeMainTab === 'gun2'">
          <!-- 充电枪选项卡内容 -->
          <el-col :span="16">
            <el-card>
              <el-form label-width="180px">
                <!-- ConnectorAvailability -->
                <el-form-item label="枪可用性:">
                  <el-select v-model="connector2From.connectorAvailability" placeholder="Select" disabled>
                    <el-option
                      v-for="item in availabilityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- ConnectorStatus -->
                <el-form-item label="枪状态:">
                  <el-select v-model="connector2From.connectorStatus" placeholder="Select">
                    <el-option
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- 状态通知 -->
                <el-form-item>
                  <el-button type="primary" @click="statusNotification(2)">Status Notification</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </div>

        <!-- 右侧日志 top: 60px; height: calc(100vh - 80px) -->
        <div>
          <el-col :span="16" style="position: fixed; right: 20px; width: 48%;">
            <el-card style="height: 100%;">
              <div slot="header" class="clearfix">
              	<span>交互日志，设备号：{{this.form.chargePointId}}</span>
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
              <!-- <el-tabs v-model="activeLogTab">
                <el-tab-pane label="交互日志" name="interaction">
                  <div class="log-content">
                    <p>交互日志显示区域。</p>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="清空日志" name="clear">
                  <div class="log-content">
                    <p>日志已清空。</p>
                  </div>
                </el-tab-pane>
              </el-tabs> -->
            </el-card>
          </el-col>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import {
    saveOrUpdate,
    findDeviceType
  } from '@/api/device/deviceList.js'
  import {
  	connect,
    disconnect,
    connectStatus,
    trigger
  } from '@/api/device/chargingPileSimulator.js'
  import {
  	connectWebsocket,
  	closeWebsocket
  } from '../../utils/websocket.js'
  import {
  	parseTime
  } from '@/utils/index'
  import Stomp from 'stompjs';
  import SockJS from 'sockjs-client';
  export default {
    name: 'chargingPileSimulator',
    components: {

    },
    data() {
      return {
        activeMainTab: "connection", // 主选项卡默认显示连接设置
        activeLogTab: "interaction", // 日志选项卡默认显示交互日志
        serverConnected: false, // 模拟服务器连接状态
        showDeviceType: false,
        form: {
          chargePointServer: "127.0.0.1:9000",
          chargePointId: "24102413849856",
          chargePointModel: 1,
          chargingPointTypeId: "",//设备类型
          chargePointVersion: 1.6,
          firmwareVersion: "J1.9M107",
          chargePointVendor: "Elmo",
          rfidTag: "DEADBEEF",
          iccId: "",
          meterType: "ELM NQC-ACDC",
          meterSerialNumber: "elm.001.13.1.0",
          vendorId: "vendorId",
          reservationId: "10110",
        },

        chargePointFrom: {
          chargePointAvailability: "Operative",
          chargePointStatus: 0,
          meterValue: 30,
          sampledContext: "Sample.Periodic",
          sampledMeasurand: "Current.Import",
        },

        connector1From: {
          connectorAvailability: "Operative",
          connectorStatus: 0,
        },

        connector2From: {
          connectorAvailability: "Operative",
          connectorStatus: 0,
        },

        availabilityOptions: [
          { label: "Operative", value: "Operative" },
          { label: "Inoperative", value: "Inoperative" },
          // { label: "有效的", value: "Operative" },
          // { label: "无效的", value: "Inoperative" },
        ],
        chargePointStatusOptions: [
          // { label: "Available", value: 0 },
          // { label: "Unavailable", value: 1 },
          // { label: "Faulted", value: 2 },
          { label: "可用", value: 0 },
          { label: "不可用", value: 1 },
          { label: "故障", value: 2 },
        ],
        statusOptions: [
          // { label: "Available", value: 0 },
          // { label: "Charging", value: 1 },
          // { label: "Unavailable", value: 2 },
          // { label: "Faulted", value: 3 },
          { label: "空闲", value: 0 },
          { label: "充电中", value: 1 },
          { label: "不可用", value: 2 },
          { label: "故障", value: 3 },
        ],
        contextOptions: [
          { label: "Sample.Periodic", value: "Sample.Periodic" },
          { label: "Sample.Event", value: "Sample.Event" },
        ],
        measurandOptions: [
          { label: "Current.Import", value: "Current.Import" },
          { label: "Energy.Export", value: "Energy.Export" },
        ],
        chargePointModelOptions: [
          // { label: "Direct Current", value: 1 },
          // { label: "Alternating Current", value: 0 },
          { label: "直流电", value: 1 },
          { label: "交流电", value: 0 },
        ],
        chargingPointModels: [],

        isToBottom: true,
        CommandDetails: [],
        ConnectStatusInterVal: null,
        StompClient: null,
        WebSocketInterVal: null
      };
    },
    methods: {
      changeStatus(){
        console.log("修改状态");
        this.saveForm()
      },
      statusNotification(connector){
        if (!this.serverConnected) {
          this.$message.error('请先建立连接')
          return false
        }
        console.log("状态通知：",connector)
        let connectorStatus;
        if (connector == 1) {
          connectorStatus = this.connector1From.connectorStatus
        } else{
          connectorStatus = this.connector2From.connectorStatus
        }
        let data = {
          chargePointId: this.form.chargePointId,
          connector: connector,
          status: connectorStatus,
          triggerType: "Monitor"
        }
        trigger(data).then(res => {
        	if (res.code === 200) {
            this.saveForm()
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      getDeviceTypeModels(){
        let data = {
          ruleId: 2,
          electricOut: this.form.chargePointModel
        }
        findDeviceType(data).then(res => {
        	if (res.code === 200) {
        		this.chargingPointModels = res.data
            console.log("chargingPointModels",this.chargingPointModels)
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      changeType(){
        this.form.chargingPointTypeId = ""
        this.showDeviceType = false
        this.getDeviceTypeModels()
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
      handleMainTabClick(tab) {
        console.log("切换到选项卡:", tab.name);
      },
      saveForm() {
        if (this.form.chargingPointTypeId == ''){
          this.$message.error('请选择设备类型')
          return false
        }
        if (this.form.chargePointId == ''){
          this.$message.error('请输入设备号')
          return false
        }
        let saveForm = {
          deviceCode: this.form.chargePointId,
          deviceTypeId: this.form.chargingPointTypeId,
          deviceVersion: this.form.firmwareVersion,
          operationState: this.chargePointFrom.chargePointStatus,
          port1: this.connector1From.connectorStatus,
          port2: this.connector2From.connectorStatus,
          devicePurpose: 'VIRTUAL_CONNECTION'
        }
        console.log("表单数据:", saveForm);
        saveOrUpdate(saveForm).then(res => {
        	if (res.code === 200) {
        		this.$message.success("操作成功")
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      //建立连接
      toggleConnection() {
        if (this.serverConnected){
          this.$confirm("确认要断开模拟器连接吗？断开后将无法继续使用该模拟器！", '警告', {
          	confirmButtonText: '是',
          	cancelButtonText: '否',
          	type: 'warning'
          }).then(() => {
            this.disconnect()
          })
          return;
        }
        let chargePileSimulatorConnectParams = {
          chargePointServer: this.form.chargePointServer,
          chargePointId: this.form.chargePointId,
          chargePointModel: this.form.chargePointModel,
          chargePointVersion: this.form.chargePointVersion,
          firmwareVersion: this.form.firmwareVersion,
          chargePointAvailability: this.chargePointFrom.chargePointAvailability,
          chargePointStatus: this.chargePointFrom.chargePointStatus
        }
        connect(chargePileSimulatorConnectParams).then(res => {
        	if (res.code === 200) {
            this.serverConnected = !this.serverConnected;
            this.initWebSocket();
        		this.$message.success(res.msg)
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      //获取连接状态
      getConnectStatus(){
        let deviceId = this.form.chargePointId
        connectStatus(deviceId).then(res => {
        	if (res.code === 200) {
            if (!res.data){
              return;
            }
            this.serverConnected = res.data.connectStatus,
            this.form.chargePointServer = res.data.chargePointServer
            this.form.chargePointId = res.data.chargePointId,
            this.form.chargePointModel = parseInt(res.data.chargePointModel),
            this.form.firmwareVersion = res.data.firmwareVersion,
            this.form.chargingPointTypeId = res.data.deviceTypeId,
            this.chargePointFrom.chargePointStatus = res.data.chargePointStatus,
            this.connector1From.connectorStatus =  res.data.port1,
            this.connector2From.connectorStatus =  res.data.port2
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      //断开连接
      disconnect(){
        let data = {
          chargePointId: this.form.chargePointId
        }
        disconnect(data).then(res => {
        	if (res.code === 200) {
            this.serverConnected = !this.serverConnected;
        		this.$message.success(res.msg)
        	} else {
        		this.$message.error(res.msg)
        	}
        })
      },
      //初始化连接状态
      initConnectStatus() {
        this.getConnectStatus()
        let interval = setInterval(() => {
        	this.getConnectStatus()
        }, 5000)
        this.ConnectStatusInterVal = interval
      },
      //初始化WebSocket
      initWebSocket() {
      	this.stompConnection();
      	let that = this;
      	this.WebSocketInterVal = setInterval(() => {
      		try {
      			// that.stompClient.send("test");
      		} catch (err) {
      			console.log("断线了: " + err);
      			that.stompConnection();
      		}
      	}, 5000);
      },
      //WebSocket连接
      stompConnection() {
        // 线下
        // let sockJS = new SockJS(`${process.env.VUE_APP_BASE_API}/api/message/websocket`);
      	// 线上
      	let sockJS = new SockJS(`/api/message/websocket`);
      	this.StompClient = Stomp.over(sockJS);
      	let headers = {
      		Authorization: '',
      	}
      	this.StompClient.connect(headers, () => {
      		let deviceCode = this.form.chargePointId
      		this.StompClient.subscribe(`/up/${deviceCode}`, (msg) => {
      			console.log(msg.body);
      			let jsonData = JSON.parse(msg.body)
            if (jsonData == ''){
              return false
            }
            //messageType:1 (后台控制消息) //messageType:2 (小程序设备端口启动消息)
      			let messageType = jsonData.messageType
      			if (parseInt(messageType) != 1) {
      				return false
      			}
      			let messageData = jsonData.messageData
            if (messageData == ''){
              return false
            }
            let CommandDetails = []
            CommandDetails.push(messageData)
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
      			this.CommandDetails = this.CommandDetails.concat(CommandDetails)
      			this.scrollToBottom()
      		}, headers);
      	}, (err) => {
      		console.log('连接失败：',err)
      	});
      },
      //断开WS连接
      stompDisconnect() {
      	if (!this.StompClient) {
      		return false;
      	}
        this.StompClient.disconnect();
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
    created() {
      //获取跳转路由数据
      let deviceId = this.$route.query.id
			let deviceCode = this.$route.query.deviceCode
      this.form.chargePointId = deviceCode
			console.log(deviceId, deviceCode)
      
      //获取设备类型
      this.getDeviceTypeModels()
      //获取设备类型

      //获取连接状态信息
      this.initConnectStatus();
    },
    destroyed() {
    	// this.disconnect();
      this.stompDisconnect();
      clearInterval(this.WebSocketInterVal)
    	clearInterval(this.ConnectStatusInterVal)
    	console.log('页面关闭')
    }
  };
</script>

<style scoped>
  /* 日志内容样式 */
  .log-content {
    width: 100%; /* 宽度适配父容器 */
    height: 540px; /* 高度占满父容器 */
    overflow-y: auto; /* 滚动条支持 */
    padding: 10px;
    background-color: #f5f5f5;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
  }

  /* el-card 样式 */
  .el-card {
    display: flex;
    flex-direction: column;
  }

  .commedBox {
  	width: 100%; /* 宽度适配父容器 */
  	height: 540px; /* 高度占满父容器 */
    padding: 10px;
  	overflow-y: scroll;
    background-color: #f5f5f5;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
  }

  .commedBox_top {
  	justify-content: space-between;
  }

  .commedBox_topR {
  	margin-right: 15px;
  	text-align: end;
  	line-height: 24px;
  }

</style>
