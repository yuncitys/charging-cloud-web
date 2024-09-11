<template>
	<div>
		<el-dialog :visible.sync="showAllocation" title="分配设备" @close="showAllocation = false">
			<el-form ref="allocation" :model="allocation" :rules="chooseRules" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;">
				<el-form-item :label="'代理商'" prop="dealerId">
					<el-autocomplete class="filter-item" v-model="allocation.adminName" :fetch-suggestions="querySearch"
						placeholder="请选择代理商" @select="changeDealer" clearable :debounce='0' style="width: 100%;"
						@change="changeName" :disabled="showAdmin"></el-autocomplete>
				</el-form-item>
        <el-form-item :label="'设备名称'" prop="deviceName">
        	<el-input v-model="allocation.deviceName" clearable placeholder="请输入设备名称" />
        </el-form-item>
				<el-form-item :label="'站点类型'" prop="ruleId">
					<el-radio-group v-model="ruleId" @change="ruleIdChange" disabled>
						<el-radio :label="1">单车充电站</el-radio>
						<el-radio :label="2">汽车充电站</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item :label="'充电站点'" prop="networkDotId">
					<!-- <el-select v-model="allocation.networkDotId" class="filter-item" placeholder="请选择" clearable
						style="width: 100%" :disabled="showNetwork">
						<el-option v-for="item in dotList" :key="item.id" :label="item.network_name" :value="item.id" />
					</el-select> -->
					<el-autocomplete style="width: 100%;" v-model="allocation.networkDotName"
						:fetch-suggestions="querySearchDot" placeholder="请选择充电站点" @select="handleDot" clearable
						:debounce='0' @change="changeDot" :disabled="showNetwork">
					</el-autocomplete>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onallocation('allocation')">确定</el-button>
					<el-button @click="showAllocation = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		findDeviceCommand,
		openAllPort,
		openOnePort,
		closePort,
		deleteDevice,
		queryDeviceToCommand,
		queryOneProtStatus,
		chargeOnePort,
		addDevice,
		findDeviceType,
		updateDevice,
		findDeviceInfoById,
		findDealerList,
		findNetworkList,
		deviceAllocation,
		batchUpdateNetworkDot,
		uploadExcel,
		downloadExcel,
		addDevicePrice,
		batchAddDevicePrice,
		findDevicePriceByPriceType,
		downLoadDeviceCodes,
		operationDevice
	} from '@/api/device/deviceList.js'
	export default {
		data() {
			return {
				dealerList: [],
				dotList: [],
				showAllocation: false,
				allocation: {
					deviceId: '',
					networkDotId: '',
					dealerId: '',
					deviceName: '',
					networkDotName: '',
					adminName: ''
				},
				showNetwork: true,
				chooseRules: {
					dealerId: [{
						required: true,
						message: '请选择代理商',
						trigger: 'change'
					}],
				},
				ids: '',
				delType: '',
				showAdmin: true,
				ruleId: 1
			}
		},
		methods: {
			querySearchDot(queryString, cb) {
				var restaurants = this.dotList;
				let restaurantsText = []
				if (restaurants.length != '') {
					restaurants.forEach((item, index) => {
						let obj = {
							value: item.networkName,
							networkDotId: item.id
						}
						restaurantsText.push(obj)
					})
				}
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			handleDot(item) {
				this.allocation.networkDotId = item.networkDotId + ''
				this.allocation.networkDotName = item.value + ''
			},
			changeDot() {
				if (this.allocation.networkDotName == '') {
					this.allocation.networkDotId = ''
				}
			},
			querySearch(queryString, cb) {
				var restaurants = this.restaurants;
				let restaurantsText = []
				if (restaurants.length != '') {
					restaurants.forEach((item, index) => {
						let obj = {
							value: '',
							dealerId: ''
						}
						let value = item.adminName + "(" + item.adminFullname + ")"
						obj.value = value
						obj.dealerId = item.id
						restaurantsText.push(obj)
					})
				}
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return (restaurant) => {
					return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
				};
			},
			changeName() {
				if (this.allocation.adminName == '') {
					this.allocation.dealerId = ''
					this.allocation.networkDotId = ''
					this.allocation.networkDotName = ''
				}
			},
			//选择代理商
			changeDealer(item) {
				this.showNetwork = false
				this.allocation.dealerId = item.dealerId + ''
				this.allocation.adminName = item.value + ''
				this.findNetworkList(item.dealerId)
				this.allocation.networkDotId = ''
				this.allocation.networkDotName = ''
			},
			//代理商列表
			findDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data
						this.restaurants = this.dealerList
						this.restaurants.forEach((item, index) => {
							if (Number(this.allocation.dealerId) === Number(item.id)) {
								this.allocation.adminName = item.adminName + "(" + item.adminFullname + ")"
							}
						})
						this.showAdmin = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			ruleIdChange() {
				this.allocation.networkDotId = ''
				this.allocation.networkDotName = ''
				this.findNetworkList(this.allocation.dealerId)
			},
			//充电站列表
			findNetworkList(id) {
				let data = {
					dealerId: id,
					ruleId: this.ruleId
				}
				findNetworkList(data).then(res => {
					if (res.code == 200) {
						this.dotList = res.data || []
						this.dotList.forEach((item, index) => {
							if (Number(item.id) === Number(this.allocation.networkDotId)) {
								this.allocation.networkDotName = item.networkName
							}
						})
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//显示批量分配弹窗
			batchUpdate(ids, activeName) {
				this.ids = ids
				if (this.ids == '' || this.ids == null || this.ids == undefined) {
					this.$message.error("请选择要分配的设备")
					return false
				}
				this.showAllocation = true
				this.allocation.networkDotId = ''
				this.allocation.networkDotName = ''
				this.allocation.dealerId = ''
				this.allocation.adminName = ''
				this.allocation.deviceName = ''
				this.delType = "more"
				this.showNetwork = true
				this.findDealerList()
				this.ruleId = Number(activeName)
			},
			//显示单个分配弹窗
			showallocation(item) {
				console.log('单个分配')
				this.showAllocation = true
				this.showNetwork = false
				this.allocation.deviceId = item.id
				this.delType = "one"
				this.findDealerList()
        this.ruleId = item.ruleId
				this.allocation.deviceName = item.deviceName
				if (item.networkDotId) {
					this.allocation.networkDotId = item.networkDotId
				} else {
					this.allocation.networkDotId = ''
					this.allocation.networkDotName = ''
				}
				if (!item.adminId) {
					this.allocation.adminName = ''
					this.allocation.dealerId = ''
				} else {
					this.allocation.dealerId = item.adminId
					this.findNetworkList(item.adminId)
				}
			},
			//确定分配
			onallocation(formName) {
				console.log(this.allocation)
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						if (this.delType == 'more') {
							let data = {
								ids: this.ids,
								networkDotId: this.allocation.networkDotId,
								dealerId: this.allocation.dealerId,
								deviceName: this.allocation.deviceName
							}
							console.log(data)
							batchUpdateNetworkDot(data).then(res => {
								if (res.code == 200) {
									this.showAllocation = false
									this.dealerId = ''
									this.allocation.adminName = ''
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
								} else {
									this.$message.error(res.msg)
								}
							})
						} else {
							console.log(this.allocation)
							deviceAllocation(this.allocation).then(res => {
								if (res.code == 200) {
									this.showAllocation = false
									this.dealerId = ''
									this.allocation.adminName = ''
									this.resetForm(formName)
									this.$message.success(res.msg)
									this.$emit('getLists')
								} else {
									this.$message.error(res.msg)
								}
							})
						}
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		}
	}
</script>

<style>

</style>
