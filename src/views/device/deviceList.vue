<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<!-- <el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入站点名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" /> -->
			<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.chargingStationIds" multiple filterable clearable
				@change="handleFilter()" placeholder="请选择充电站">
				<el-option
					v-for="item in chargingStationList"
					:key="item.id"
					:label="item.networkName"
					:value="item.id">
				</el-option>
			</el-select>
			<el-select v-model="listQuery.deviceStatus" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择设备状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.dealerId" filterable clearable @change="handleFilter()" placeholder="请选择代理商">
				<el-option
					v-for="item in dealerList"
					:key="item.id"
					:label="item.adminFullname"
					:value="item.id">
				</el-option>
			</el-select>

			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>

			<div style="margin: 15px 0;">
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="batchUpdate"
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:batchAllocation')">
          			批量分配站点
				</el-button>
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='batchAddDevicePrice'
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:allCharge')">
          			批量设置收费标准
				</el-button>
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='onBatchSetPower'
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:batchSetPower')">
          			批量设置设备参数
				</el-button>
				<!--导出Excel  -->
				<downExcel :queryData="listQuery" :exportKeys="exportKeys"/>
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="onSyncDeviceStatus"
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:syncStatus')">
          			同步设备状态
				</el-button>
				<!--更新二维码-->
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="handleBatchSyncQRCode"
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:syncQR')">
          			同步二维码
				</el-button>
			</div>

			<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
				<el-tab-pane
				    v-for="(item, index) in ruleIdList"
				    :key="item.id"
				    :label="item.title"
				    :name="item.id">
				</el-tab-pane>
			</el-tabs>

			<div class="filter-container">
				<el-checkbox v-model="formThead.ruleId" label="产品名称">产品名称</el-checkbox>
				<el-checkbox v-model="formThead.deviceCode" label="设备号">设备号</el-checkbox>
				<el-checkbox v-model="formThead.deviceName" label="设备名称">设备名称</el-checkbox>
				<el-checkbox v-model="formThead.deviceTypeName" label="设备类型">设备类型</el-checkbox>
				<el-checkbox v-model="formThead.deviceSignal" label="设备信号">设备信号</el-checkbox>
				<el-checkbox v-model="formThead.deviceVersion" label="设备版本">设备版本</el-checkbox>
				<el-checkbox v-model="formThead.deviceImei" label="imei号">imei号</el-checkbox>
				<el-checkbox v-model="formThead.deviceSim" label="sim号">sim号</el-checkbox>
				<el-checkbox v-model="formThead.adminId" label="代理商">代理商</el-checkbox>
				<el-checkbox v-model="formThead.networkName" label="所属站点">所属站点</el-checkbox>
				<el-checkbox v-model="formThead.networkAddress" label="设备地址">设备地址</el-checkbox>
				<el-checkbox v-model="formThead.deviceStatus" label="设备状态">设备状态</el-checkbox>
				<el-checkbox v-model="formThead.priceType" label="计费类型">计费类型</el-checkbox>
				<el-checkbox v-model="formThead.feeName" label="计费标准">计费标准</el-checkbox>
				<el-checkbox v-model="formThead.activateStatus" label="激活状态">激活状态</el-checkbox>
				<el-checkbox v-model="formThead.activateTime" label="激活时间">激活时间</el-checkbox>
				<el-checkbox v-model="formThead.createTime" label="创建时间">创建时间</el-checkbox>
				<el-checkbox v-model="formThead.deviceChargePattern" label="是否免费">是否免费</el-checkbox>
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" @selection-change="selectionChange">
				<el-table-column type="selection" align="center">
				</el-table-column>
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="ruleId" label="产品名称" v-if="formThead.ruleId" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.ruleId === 1 ? '单车' : '汽车'}}
					</template>
				</el-table-column>
				<el-table-column prop="deviceName" label="设备名称" v-if="formThead.deviceName" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceCode" label="设备号" v-if="formThead.deviceCode" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceTypeName" label="设备类型" v-if="formThead.deviceTypeName" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceStatus" label="设备状态" v-if="formThead.deviceStatus" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="danger" v-if="scope.row.deviceStatus == 0">离线</el-tag>
						<el-tag type="success" v-if="scope.row.deviceStatus == 1">在线</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="deviceSignal" label="设备信号" v-if="formThead.deviceSignal" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceVersion" label="设备版本" v-if="formThead.deviceVersion" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceImei" label="imei号" v-if="formThead.deviceImei" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="deviceSim" label="sim号" v-if="formThead.deviceSim" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="adminId" label="代理商" v-if="formThead.adminId" align="center" width="120">
					<template slot-scope="scope">
						<div v-if="scope.row.adminId">
							<deviceAdmin :row_data="scope.row"></deviceAdmin>
						</div>
						<div v-else>
							未分配代理商
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="networkName" label="所属站点" v-if="formThead.networkName" align="center"
					:show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkAddress" label="设备地址" v-if="formThead.networkAddress" align="center"
					:show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="deviceChargePattern" label="是否免费" v-if="formThead.deviceChargePattern" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.deviceChargePattern == 0">否</span>
						<span v-if="scope.row.deviceChargePattern == 1">否</span>
						<span v-if="scope.row.deviceChargePattern == 2">是</span>
					</template>
				</el-table-column>
				<el-table-column prop="priceType" label="计费类型" v-if="formThead.priceType" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.priceType == 0">计时</span>
						<span v-if="scope.row.priceType == 1">电量</span>
						<span v-if="scope.row.priceType == 2">功率</span>
					</template>
				</el-table-column>
				<el-table-column prop="feeName" label="计费标准" v-if="formThead.feeName" align="center"
					:show-overflow-tooltip='isPc' width="150">
				</el-table-column>
				<el-table-column prop="activateStatus" label="激活状态" v-if="formThead.activateStatus" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="danger" v-if="scope.row.activateStatus == 0">未入网</el-tag>
						<el-tag type="success" v-if="scope.row.activateStatus == 1">已激活</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="activateTime" label="激活时间" v-if="formThead.activateTime" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.activateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" v-if="formThead.createTime" align="center"
					:show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="420" fixed="right">
					<template slot-scope="scope">
						<div style="display: flex;align-items: center;justify-content: space-around;">
							<div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:contrt')">
									<el-button type="primary" @click='toSetDevice(scope.row)' size='mini'>
										控制
									</el-button>
								</div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:info')"
									class="top10">
									<!-- 详情 -->
									<device-detail :row_data="scope.row" />
								</div>
							</div>

							<div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:allocation')"
									style="margin-left: 0px;">
									<el-button type="primary" @click="showallocation(scope.row)" size='mini'>
                    					分配设备
									</el-button>
								</div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneCharge')"
									style="margin-top: 10px;margin-left: 0px;">
									<el-button type="primary" @click="showonPriceType(scope.row)" size='mini'>
										收费方案
									</el-button>
								</div>
							</div>

							<div>
								<div v-if="scope.row.operationState == 0 && btnAuthen.permsVerifAuthention(':device:deviceList:operationDevice')">
									<el-button type="danger" @click="onOperationDevice(scope.row.id,1)" size='mini'>
                    					禁用
									</el-button>
                				</div>

								<div v-if="scope.row.operationState == 1 && btnAuthen.permsVerifAuthention(':device:deviceList:operationDevice')">
									<el-button type="primary" @click="onOperationDevice(scope.row.id,0)" size='mini'>
										启用
									</el-button>
								</div>

								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneDelete')"
									style="margin-top: 10px;margin-left: 0px;">
									<el-button type="danger" @click="del(scope.row.id)" size='mini'>
										删除
									</el-button>
								</div>
							</div>

							<div>
								<div>
									<el-button type="primary" @click="showWXQrcode(scope.row)" size='mini'>
                    					二维码
									</el-button>
								</div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:qr:binding')" class="top10">
									<deviceBind :deviceId="scope.row.id" :deviceCode="scope.row.deviceCode" />
								</div>
							</div>

							<div>
								<editDeviceType :row_data="scope.row" @getLists="getLists"></editDeviceType>
								<div class="top10">
									<el-button type="primary" @click="upDownRecord(scope.row)" size='mini'>
                    					上下线记录
									</el-button>
								</div>
							</div>
						</div>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,100,500,1000]"
					:page-size="listQuery.limit" :total="total" background
					layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
					@current-change="handleCurrentChange" />
			</div>

			<!-- 单个设置收费方案 -->
			<el-dialog :visible.sync="showPriceType" title="设置收费方案" @close="showPriceType = false">
				<el-form ref="PriceType" :model="PriceType" :rules="chooseRules" label-position="left"
					label-width="100px" style="width: 600px; margin-left:50px;">
					<el-form-item :label="'设备号'" prop="deviceCode">
						<el-input v-model="PriceType.deviceCode" clearable disabled />
					</el-form-item>
					<el-form-item :label="'产品名称'" prop="ruleId">
						<el-radio-group v-model="ruleId" @change="ruleIdChange" :disabled="true">
							<el-radio :label="1">单车</el-radio>
							<el-radio :label="2">汽车</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="收费类型" prop="deviceChagePattern" v-if="ruleId === 1">
						<el-radio-group v-model="deviceChagePattern" @change="changeChagePattern">
							<el-radio :label="0">时间</el-radio>
							<el-radio :label="1">电量</el-radio>
							<el-radio :label="2">功率</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item :label="'收费方案'" prop="devicePriceId">
						<el-select v-model="PriceType.devicePriceId" class="filter-item" placeholder="请选择收费方案" clearable
							style="width: 100%">
							<el-option v-for="item in priceTypeList0" :key="item.id" :label="item.feeName"
								:value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onPriceType('PriceType')">确定</el-button>
						<el-button @click="showPriceType = false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

			<!-- 批量设置收费方案 -->
			<el-dialog :visible.sync="showPriceTypes" title="批量设置收费方案" @close="showPriceTypes = false">
				<el-form ref="PriceTypes" :model="PriceType" :rules="chooseRules" label-position="left"
					label-width="100px" style="width: 600px; margin-left:50px;">
					<el-form-item :label="'设备号'" prop="deviceCodes">
						<el-input v-model="PriceTypes.deviceCodes" clearable disabled />
					</el-form-item>
					<el-form-item :label="'产品名称'" prop="ruleId">
						<el-radio-group v-model="ruleId" @change="ruleIdChange" :disabled="true">
							<el-radio :label="1">单车</el-radio>
							<el-radio :label="2">汽车</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="收费类型" prop="deviceChagePattern" v-if="ruleId === 1">
						<el-radio-group v-model="deviceChagePattern" @change="changeChagePattern">
							<el-radio :label="0">时间</el-radio>
							<el-radio :label="1">电量</el-radio>
							<el-radio :label="2">功率</el-radio>
						</el-radio-group>
					</el-form-item>
					<el-form-item :label="'收费方案'" prop="devicePriceId">
						<el-select v-model="PriceTypes.devicePriceId" class="filter-item" placeholder="请选择收费方案"
							clearable style="width: 100%">
							<el-option v-for="item in priceTypeList0" :key="item.id" :label="item.feeName"
								:value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onPriceTypes('PriceTypes')">确定</el-button>
						<el-button @click="showPriceTypes = false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

			<!-- 分配设备 -->
			<allocation ref="allocation" @getLists="getLists" />

			<!-- 微信小程序二维码 -->
			<wx-code ref="wxCodes" />

			<!-- 批量设置功率 -->
			<batchPower ref="batchPower" />

			<!-- 同步二维码 -->
			<SyncQRCodeBox v-if="syncQRCodeBoxVisible" ref="SyncQRCodeBox" @syncQRCode="syncQRCode"/>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		deleteDevice,
		findDealerList,
		addDevicePrice,
		batchAddDevicePrice,
		findDevicePriceByPriceType,
		updateDeviceStatus,
		syncDeviceStatus,
		operationDevice,
		setDeviceChargeModel,
		batchSetDeviceChargeModel,
		batchSetDeviceQr
	} from '@/api/device/deviceList.js'
	import {
		getChargingStationList
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		parseTime
	} from '@/utils/index'
	import wxCode from './components/wxCode.vue'
	import deviceDetail from './components/deviceDetail.vue'
	import miniCode from './components/miniAppCode.vue'
	import deviceConfig from './components/deviceConfig.vue'
	import downExcel from './components/downExcel.vue'
	import allocation from './components/allocation.vue'
	import deviceBind from './components/deviceBind.vue'
	import deviceAdmin from './components/deviceAdmin.vue'
	import editDeviceType from './components/editDeviceType.vue'
	import batchPower from './components/batchPower.vue'
	import SyncQRCodeBox from './components/SyncQRCodeBox'
	export default {
		components: {
			wxCode,
			deviceDetail,
			miniCode,
			deviceConfig,
			downExcel,
			allocation,
			deviceBind,
			deviceAdmin,
			editDeviceType,
			batchPower,
			SyncQRCodeBox
		},
		name: 'deviceList',
		data() {
			return {
				activeName: '1',
				ruleIdList: [{
					id: '1',
					title: '单车'
				}, {
					id: '2',
					title: '汽车'
				}],
				tableKey: 0,
				page: 1,
				limit: 10,
				total: 10,
				list: [],
				disabled: true,
				listQuery: {
					deviceCode: '',
					networkName: '',
					networkAddress: '',
					deviceStatus: '',
					activateStatus: '',
					dealerId: '',
					allocationStatus: 1,
					page: 1,
					limit: 10,
					ruleId: 1,
          			chargingStationIds: '',
					devicePurpose: 'DIRECT_CONNECTION',
				},
				cacheKey: 'deviceList',
				formThead: {
					ruleId: true,
					deviceCode: true,
					deviceTypeName: true,
					deviceSignal: true,
					deviceVersion: true,
          			deviceSim: true,
					deviceImei: true,
					networkName: true,
					networkAddress: true,
					activateStatus: false,
					activateTime: false,
					createTime: false,
					deviceStatus: true,
					priceType: true,
					feeName: true,
					deviceName: true,
					adminId: false,
					deviceChargePattern: true,
				},
				tags: [{
					title: '离线',
					id: 0,
				}, {
					title: '在线',
					id: 1,
				}],
				//分配设备
				dealerList: [],
        		chargingStationList: [],
				showAllocation: false,
				allocation: {
					deviceId: '',
					networkDotId: '',
					dealerId: ''
				},
				chooseRules: {
					dealerId: [{
						required: true,
						message: '请选择代理商',
						trigger: 'change'
					}],
				},
				ids: '',
				//设置收费方案
				showPriceType: false,
				PriceType: {
					deviceCode: '',
					devicePriceId: '',
					ruleId: 1
				},
				priceTypeList0: [],
				//批量设置收费方案
				showPriceTypes: false,
				PriceTypes: {
					deviceCodes: '',
					devicePriceId: '',
					ruleId: 1
				},
				deviceCodes: '',
				deviceChagePattern: 0,
				ruleId: 1,
				priceTypeDialog: '',
				//同步设备二维码
				syncQRCodeBoxVisible: false,
			}
		},
		filters: {
			//格式化时间
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		watch: {
			formThead: {
				handler(newVal) {
					// 这里做持久化或别的业务
					window.localStorage.setItem(this.cacheKey, JSON.stringify(newVal))
				},
				deep: true   // 监听内部任意属性变化
			},
		},
		mounted() {
			this.getChargingStationList(this.activeName)
		},
		computed: {
			exportKeys() {
				return Object.keys(this.formThead).filter(k => this.formThead[k] === true)
			},
		},
		methods: {
			getChargingStationList(ruleId){
				const data = {
					ruleId: ruleId
				}
				getChargingStationList(data).then(res => {
					if (res.code == 200) {
						this.chargingStationList = res.data;
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//切换导航
			handleClick(tab, event) {
				this.getChargingStationList(tab.name)
				this.listQuery.ruleId = tab.name
				this.listQuery.page = 1,
				this.listQuery.limit = 10,
				this.getLists()
			},
			//禁用/启用设备
			onOperationDevice(deviceId, operationState) {
				let str = ''
				if (parseInt(operationState) == 0) {
					str = '是否启用设备？'
				} else {
					str = '是否禁用设备'
				}
				this.$confirm(str, '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						deviceId,
						operationState
					}
					operationDevice(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			//单个选择表格数据
			selectionChange(row) {
				console.log(row)
				let ids = ''
				let idarr = []
				let deviceCodes = ''
				let deviceCodesarr = []
				if (row.length == 0) {
					ids = ''
					deviceCodes = ''
				} else {
					row.forEach((item, index) => {
						idarr.push(item.id)
						deviceCodesarr.push(item.deviceCode)
					})
				}
				if (idarr.length != 0) {
					ids = idarr.join(",")
				}
				if (deviceCodesarr.length != 0) {
					deviceCodes = deviceCodesarr.join(",")
				}
				console.log(ids, idarr)
				console.log(deviceCodes, deviceCodesarr)
				this.ids = ids
				this.deviceCodes = deviceCodes
			},
			//批量设置功率
			onBatchSetPower() {
				this.$refs.batchPower.onShowDialog(this.deviceCodes)
			},
			//显示二维码
			showWXQrcode(item) {
				this.$refs.wxCodes.showQrcode(item.deviceCode, item.portCount, item.networkDotId, item.deviceQrcodeLink, item.ruleId)
			},
			//设置表格一页数量
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			//设置表格页数
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			//搜索
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			//获取表格数据
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//删除操作
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id
					}
					console.log(data)
					deleteDevice(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			toSetDevice(item) {
				if (item.ruleId === 1) {
					this.setDevice(item)
				} else {
					this.setCarDevice(item)
				}
			},
			setDevice(item) {
				this.$router.push({
					name: 'setDevice',
					query: {
						id: item.id,
						deviceCode: item.deviceCode
					}
				})
			},
			setCarDevice(item) {
				this.$router.push({
					name: 'setCarDevice',
					query: {
						id: item.id,
						deviceCode: item.deviceCode
					}
				})
			},
			//上下线记录
			upDownRecord(item) {
				this.$router.push({
					name: 'upDownRecordList',
					query: {
						deviceCode: item.deviceCode
					}
				})
			},
			//单独分配设备
			showallocation(item) {
				console.log(item)
				this.$nextTick(() => {
					this.$refs.allocation.showallocation(item)
				})
			},
			//显示批量分配弹窗
			batchUpdate() {
				console.log(this.ids)
				this.$nextTick(() => {
					this.$refs.allocation.batchUpdate(this.ids, this.activeName)
				})
			},
			// 代理商列表
			findDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//批量设置收费方案
			batchAddDevicePrice() {
				console.log(this.deviceCodes)
				if (this.deviceCodes == '' || this.deviceCodes == null || this.deviceCodes == undefined) {
					this.$message.error("请选择要设置收费方案的设备")
					return false
				}
				let deviceArray =  this.deviceCodes.split(",");
				if (deviceArray.length > 30){
					this.$message.error("单次下发最大支持30个设备")
					return false
				}
				this.showPriceTypes = true
				this.PriceTypes.devicePriceId = ''
				this.PriceTypes.deviceCodes = this.deviceCodes
				this.deviceChagePattern = 0
				this.ruleId = Number(this.activeName)
				this.getfindDevicePriceByPriceType()
				this.priceTypeDialog = 'batch'
			},
			//批量设置收费方案
			onPriceTypes(formName) {
				if (this.PriceTypes.devicePriceId == '' || this.PriceTypes.devicePriceId == null) {
					this.$message.error("请选择要设置的收费方案")
					return false
				}
				let data = {
					deviceCodes: this.deviceCodes,
					devicePriceId: this.PriceTypes.devicePriceId,
					devicePriceType: this.deviceChagePattern,
					ruleId: this.ruleId
				}
				console.log(data)
			  	if (this.ruleId === 1) {
					batchAddDevicePrice(data).then(res => {
						if (res.code == 200) {
							this.showPriceTypes = false
							this.resetForm(formName)
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
			  	}else if(this.ruleId === 2){
					batchSetDeviceChargeModel(data).then(res => {
						if (res.code == 200) {
							this.showPriceTypes = false
							this.resetForm(formName)
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
			  	}
			},
			//显示收费方案
			showonPriceType(item) {
				this.PriceType.deviceCode = item.deviceCode
				let deviceChargePattern = item.priceType
				if (deviceChargePattern != null) {
					this.deviceChagePattern = deviceChargePattern
				}
				let devicePriceId = item.devicePriceId || ''
				this.PriceType.devicePriceId1 = devicePriceId
				this.PriceType.devicePriceId = ''
				this.ruleId = item.ruleId ?? 1
				this.showPriceType = true
				this.priceTypeDialog = 'one'
				this.getfindDevicePriceByPriceType()
			},
			//设置收费方案
			onPriceType(formName) {
				if (this.PriceType.devicePriceId == '' || this.PriceType.devicePriceId == null) {
					this.$message.error("请选择要设置的收费方案")
					return false
				}
				let data = {
					deviceCode: this.PriceType.deviceCode,
					devicePriceId: this.PriceType.devicePriceId,
					devicePriceType: this.deviceChagePattern,
					ruleId: this.ruleId
				}
				if(this.ruleId === 1){
					addDevicePrice(data).then(res => {
						if (res.code == 200) {
							this.showPriceType = false
							this.resetForm(formName)
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				}else if (this.ruleId === 2){
					setDeviceChargeModel(data).then(res => {
						if (res.code == 200) {
							this.showPriceType = false
							this.resetForm(formName)
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				}
			},
			//选择收费类型
			changeChagePattern(e) {
				console.log(e)
				this.deviceChagePattern = e
				this.getfindDevicePriceByPriceType()
				this.PriceType.devicePriceId = ''
				this.PriceType.devicePriceId1 = ''
			},
			ruleIdChange() {
				this.getfindDevicePriceByPriceType()
			},
			//获取方案列表
			getfindDevicePriceByPriceType() {
				let ruleId = this.ruleId
				let deviceChagePattern = this.deviceChagePattern
				if (parseInt(deviceChagePattern) == 3) {
					deviceChagePattern = 2
				}
				if (this.ruleId === 2) {
					deviceChagePattern = 1
				}
				let data = {
					priceType: deviceChagePattern,
					ruleId: ruleId
				}
				findDevicePriceByPriceType(data).then(res => {
					if (res.code == 200) {
						this.priceTypeList0 = res.data || []
						console.log(this.priceTypeList0)
						this.PriceType.devicePriceId = this.PriceType.devicePriceId1
					}
				})
			},
			//同步设备状态
			onSyncDeviceStatus() {
				if (this.deviceCodes == '' || this.deviceCodes == null || this.deviceCodes == undefined) {
					this.$message.error("请选择需要同步的设备")
					return false
				}
				let deviceArray =  this.deviceCodes.split(",");
				if (deviceArray.length > 30){
					this.$message.error("单次最大支持30个设备")
					return false
				}
				this.$confirm('这一操作将同步设备在线状态。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					syncDeviceStatus(deviceArray).then(res => {
						if (res.code == 200) {
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			//同步设备二维码
			handleBatchSyncQRCode() {
				if (this.deviceCodes == '' || this.deviceCodes == null || this.deviceCodes == undefined) {
					this.$message.error("请选择要设置同步的设备")
					return false
				}
				let deviceArray =  this.deviceCodes.split(",");
				if (deviceArray.length > 30){
					this.$message.error("单次下发最大支持30个设备")
					return false
				}
				this.syncQRCodeBoxVisible = true
				this.$nextTick(() => {
					this.$refs.SyncQRCodeBox.init(deviceArray)
				})
			},
			syncQRCode(data) {
				console.log("data：",data)
				batchSetDeviceQr(data).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.$refs.SyncQRCodeBox.visible = false
						this.syncQRCodeBoxVisible = false
						this.getLists()
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			// 进入页面时读缓存
			const raw = localStorage.getItem(this.cacheKey)
			if (raw) {
				try {
					this.formThead = JSON.parse(raw)
				} catch (e) {
					console.warn('parse cache error', e)
				}
			}
			this.getLists()
			this.findDealerList()
			this.getfindDevicePriceByPriceType()
		},
	}
</script>

<style scoped="scoped">
	.portText {
		font-weight: bold;
		color: #000000;
		margin-top: 20px;
	}
</style>
