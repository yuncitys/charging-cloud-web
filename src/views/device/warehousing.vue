<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入站点名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
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
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">
        查询
      </el-button>

			<div style="margin: 15px 0;">
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="batchUpdate"
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:batchAllocation')">
          批量分配站点
				</el-button>
				<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='onBatchSetPower'
					v-if="btnAuthen.permsVerifAuthention(':device:deviceList:batchSetPower')">
          批量设置设备参数
				</el-button>
				<!-- 导出Excel -->
				<downExcel :queryData="listQuery" />
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
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" @selection-change="selectionChange">
				<el-table-column type="selection" align="center">
				</el-table-column>
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column label="设备号" prop="deviceCode" v-if="formThead.deviceCode" align="center"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="ruleId" label="产品名称" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.ruleId === 1 ? '单车' : '汽车'}}
					</template>
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
        <el-table-column prop="deviceName" label="设备名称" v-if="formThead.deviceName" align="center"
        	:show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="350">
					<template slot-scope="scope">
						<div style="display: flex;align-items: center;justify-content: space-around;">
							<div>
								<div>
									<div style="margin-top: 0px;margin-left: 0px;"
										v-if="btnAuthen.permsVerifAuthention(':device:deviceList:oneDelete')">
										<el-button type="danger" @click="del(scope.row.id)" size='mini'>
                      删除
										</el-button>
									</div>
								</div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:info')"
									class="top10">
									<!-- 详情 -->
									<device-detail :row_data="scope.row" />
								</div>
							</div>
							<div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:deviceList:contrt')">
									<el-button type="primary" @click='toSetDevice(scope.row)' size='mini'>
										控制
									</el-button>
								</div>
								<div style="margin-top: 10px;margin-left: 0px;"
									v-if="btnAuthen.permsVerifAuthention(':device:deviceList:allocation')">
									<el-button type="primary" @click="showallocation(scope.row)" size='mini'>
                    分配设备
									</el-button>
								</div>
							</div>
							<div>
								<div v-if="btnAuthen.permsVerifAuthention(':device:qr:binding')">
									<deviceBind :deviceId="scope.row.id" :deviceCode="scope.row.deviceCode" />
								</div>
								<div style="margin-top: 10px;margin-left: 0px;">
									<editDeviceType :row_data="scope.row" @getLists="getLists"></editDeviceType>
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

			<!-- 分配设备 -->
			<allocation ref="allocation" @getLists="getLists" />

			<!-- 微信小程序二维码 -->
			<wx-code ref="wxCodes" />

			<!-- 批量设置功率 -->
			<batchPower ref="batchPower" />
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
		operationDevice
	} from '@/api/device/deviceList.js'
	import {
		parseTime
	} from '@/utils/index'
	import QRCode from 'qrcodejs2'
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
			batchPower
		},
		name: 'warehousing',
		data() {
			return {
				activeName: '1',
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
					allocationStatus: 2,
					page: 1,
					limit: 10,
					ruleId: 1
				},
        dealerList: [],
				formThead: {
					deviceCode: true,
					deviceTypeName: true,
					deviceSignal: true,
					deviceVersion: true,
					deviceSim: true,
					deviceImei: true,
					allocationStatus: false,
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
				},
				tags: [{
					title: '离线',
					id: 0,
				}, {
					title: '在线',
					id: 1,
				}],
				ruleIdList: [{
					id: '1',
					title: '单车'
				}, {
					id: '2',
					title: '汽车'
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
		mounted() {
			findDealerList().then(res => {
				if (res.code == 200) {
					this.dealerList = res.data
				} else {
					this.$message.error(res.msg)
				}
			})
		},
		methods: {
			//切换导航
			handleClick(tab, event) {
				this.listQuery.ruleId = tab.name
        this.listQuery.page = 1,
        this.listQuery.limit = 10,
				this.getLists()
			},
			//表格选择行
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
			//选择表格行数
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			//选择表格页数
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			//
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
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
		},
		created() {
			this.getLists()
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
