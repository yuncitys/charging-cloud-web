<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.qrCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入二维码编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择绑定状态" clearable @change="handleFilter">
				<el-option v-for="item in bindingTags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<!-- 生产二维码 -->
			<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click='onShowConfig'
				v-if="btnAuthen.permsVerifAuthention(':sys:qr:generate')">
				批量生产二维码
			</el-button>

			<!-- <createCode @getLists="getLists"></createCode> -->

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="qrCode" label="二维码编号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="status" label="是否绑定" align="center" :show-overflow-tooltip="isPc">
				<template slot-scope="scope">
					<el-tag type="danger" v-if="scope.row.status == 0">未绑定</el-tag>
					<el-tag type="success" v-if="scope.row.status == 1">已绑定</el-tag>
				</template>
				</el-table-column>
				<el-table-column prop="deviceCode" label="设备编号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="port" label="绑定类型" align="center" :show-overflow-tooltip='isPc'>
				<template slot-scope="scope">
					<span v-if="scope.row.port == 0 && scope.row.status == 1">主机二维码</span>
					<span v-if="scope.row.port != 0 && scope.row.status == 1">{{scope.row.port}}号插座</span>
				</template>
				</el-table-column>
				<el-table-column prop="bandingUser" label="绑定用户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="unbandingUser" label="解绑用户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.updateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<el-button type="primary" size='mini'
							@click="showCZQrcode(scope.row.qrCode,scope.row.qrText)" >
							二维码
						</el-button>
						<el-button size='mini' type="danger" @click='onUnBindingQRCode(scope.row)'
							v-if="btnAuthen.permsVerifAuthention(':sys:qr:unBinding') && scope.row.status">
							解绑
						</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>

			<!-- 插座二维码 -->
			<qrCode ref="qrCode" />

      		<!--下载进度条-->
			<el-dialog :visible.sync="showProgress" title="文件下载"  @close="handleClose()"
				:destroy-on-close= "true" :append-to-body="true" width="30%">
				<div>
					<div style="text-align: center;margin-bottom: 20px;font-size: 20px;">
						<h3>文件下载中,请稍等...</h3>
					</div>
					<div style="text-align: center;margin-bottom: 30px;font-size: 15px;">
						<span style="color: #FF0000;font-weight: bold;">关闭下载窗口后可进入
						<a style="color: #1E90FF; text-decoration:underline;">
							文件下载中心
						</a>
						下载
						</span>
					</div>
					<div style="text-align: center;width: 200px;margin: 0 auto;">
						<div style="width: 200px;height: 200px;">
							<el-progress type="circle" :percentage="percentage" :width="190"></el-progress>
						</div>
					</div>
				</div>
			</el-dialog>

			<el-dialog :visible.sync="showConfig" title="批量生产二维码" @close="showConfig = false" :append-to-body="true">
				<el-form ref="configData" :model="configData" :rules="configrules" label-position="left" label-width="100px"
					style="width: 600px; margin-left:50px;">
					<el-form-item :label="'生成数量'" prop="number">
						<el-input v-model="configData.number" clearable placeholder="请输入生成数量" type="number" />
					</el-form-item>
					<el-form-item :label="'二维码前缀'" prop="qrText">
						<el-input v-model="configData.qrText" clearable placeholder="请输入生成的二维码前缀" />
					</el-form-item>
					<el-form-item :label="'导出格式'" prop="type">
						<el-select v-model="configData.type" placeholder="请选择导出格式" style="width: 100%;">
							<el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value"
								:disabled="item.disabled">
							</el-option>
						</el-select>
					</el-form-item>
					<!-- <el-form-item :label="'运营商'" prop="adminId"> -->
						<!-- <el-autocomplete style="width: 100%;margin-right: 20px ;" class="filter-item" v-model="adminName"
							:fetch-suggestions="querySearch" placeholder="请选择运营商" @select="handleSelect" clearable
							:debounce='0' @change="changeName">
						</el-autocomplete> -->
						<!-- <el-select style="width: 100%;margin-right: 20px ;" class="filter-item" v-model="configData.adminId" filterable clearable placeholder="请选择运营商">
							<el-option
								v-for="item in operatorList"
								:key="item.id"
								:label="item.adminFullname"
								:value="item.id">
							</el-option>
						</el-select> -->
					<!-- </el-form-item> -->
					<el-form-item>
						<el-button type="primary" @click="DownloadConfig('configData')">
							确定
						</el-button>
						<el-button @click="showConfig = false">
							取消
						</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

		</div>
	</div>
</template>

<script>
	import {
		getList,
    	generateQR,
		unBindingQRCode
	} from '@/api/device/deviceQrcode.js'
	import {
		parseTime
	} from '@/utils/index'
	import {
		getOperator
	} from '@/api/agent/agentList.js'
	import {
		getTask
	} from '@/api/task/task.js'
	import createCode from './components/deviceQrcode/createCode.vue'
	import qrCode from './components/deviceQrcode/qrCode.vue'

	export default {
		name: 'deviceQrcode',
		components: {
			createCode,
			qrCode
		},
		data() {
			let checkNum = (rule, value, callback) => {
				if (!value) {
					return new Error('必填信息')
				} else {
					let regx = /(^[1-9]\d*$)/;
					if (!regx.test(value)) {
						callback(new Error('请输入正整数'))
					} else {
						callback()
					}
				}
			}
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					deviceCode: '',
					qrCode: '',
          			status: '',
				},
				tableKey: 0,
				bindingTags: [{
					title: '未绑定',
					id: 0,
				}, {
					title: '已绑定',
					id: 1,
				}],

				showProgress: false,
				getProgress: null,
				percentage: 0,

				showConfig: false,
				loading: false,
				operatorList: [],
				configData: {
					number: '',
					type: '',
					qrText: ''
				},
				configrules: {
					number: [{
						required: true,
						message: '请输入生成数量',
						trigger: 'blur',
					}, {
						validator: checkNum,
						trigger: 'blur'
					}],
					type: [{
						required: true,
						message: '请选择导出格式',
						trigger: 'blur'
					}],
					qrText: [{
						required: true,
						message: '请输入二维码前缀',
						trigger: 'blur'
					}]
				},
				typeList: [{
					value: 1,
					label: '图片'
				},
				{
					value: 2,
					label: 'excel'
				},
				{
					value: 3,
					label: '图片和excel'
				}],
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
			//显示二维码
			showCZQrcode(qrCode,qrText) {
				this.$refs.qrCode.showQrcode(qrCode,qrText)
			},
			//解绑二维码
			onUnBindingQRCode(item) {
				this.$confirm('是否解绑二维码?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						qrCode: item.qrCode
					}
					console.log(data)
					unBindingQRCode(data).then(res => {
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
			//获取列表数据
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
            			let list = res.data || []
						this.list = list
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//切换条数
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			//切换页数
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			//重置查询
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			//查询所有运营商
			getOperator() {
				getOperator().then(res => {
					if (res.code == 200) {
						this.operatorList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			//查询搜索代理商
			// querySearch(queryString, cb) {
			// 	var restaurants = this.restaurants;
			// 	let restaurantsText = []
			// 	if (restaurants.length != '') {
			// 		restaurants.forEach((item, index) => {
			// 			let obj = {
			// 				value: '',
			// 				adminId: '',
			//         domain: '',
			// 				wxAppId: ''
			// 			}
			// 			let value = item.adminName + "(" + item.adminFullname + ")"
			// 			obj.value = value
			// 			obj.adminId = item.id
			//       obj.domain = item.domainName
			// 			obj.wxAppId = item.wxAppId
			// 			restaurantsText.push(obj)
			// 		})
			// 	}
			// 	var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
			// 	// 调用 callback 返回建议列表的数据
			// 	cb(results);
			// },
			// //筛选
			// createFilter(queryString) {
			// 	return (restaurant) => {
			// 		return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
			// 	};
			// },
			// //选择运营商
			// handleSelect(item) {
			// 	console.log(item)
			// 	let adminId = item.adminId ? item.adminId : ''
			//   let domain = item.domain ? item.domain : ''
			//   this.configData.adminId = adminId
			//   this.configData.qrText = domain

			// 	this.adminName = item.value + ''
			// 	this.wxAppId = item.wxAppId + ''
			// },
			// //清除已选择运营商
			// changeName() {
			// 	if (this.adminName == '') {
			//     this.configData.adminId = ''
			//     this.configData.qrText = ''
			// 	}
			// },
			//显示弹窗
			onShowConfig() {
				this.showConfig = true
				this.percentage = 0
				this.configData.qrText = ''
				this.getOperator()
			},
			//清除表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			//导出设备配置
			DownloadConfig(formName) {
				let configData = this.configData
				// if (!configData.adminId) {
				// 	this.$message.error('请选择运营商')
				// 	return false
				// }
				let number = configData.number
				if (number > 1000) {
					this.$message.error('最多导出1000条数据')
					return false
				}
				this.$refs[formName].validate(valid => {
					console.log(valid)
					if (valid) {
						console.log("通过")
						this.showConfig = false
						generateQR(configData).then(res => {
							this.resetForm(formName)
							if (res.code == 200){
								let task = res.data
								this.percentage = task.percentage || 0
								if(task.status === 1){
									this.showProgress = false
									window.open(this.Global.APIURl + task.result)
								}else{
									this.showProgress = true
									this.getProgress = setInterval(() => {
										this.getTask(task.id)
									}, 1000)
								}
							} else {
								this.$message.error(res.msg)
							}
						})
					} else {
						this.loading = false
						console.log("不通过")
						return false
					}
				})
			},
			getTask(taskId){
				let data = {
				taskId:taskId
				}
				getTask(data).then(res => {
				let task = res.data
				this.percentage = task.percentage
				if(task.status === 1){
					clearInterval(this.getProgress)
					this.showProgress = false
					window.open(this.Global.APIURl + task.result)
				}
				})
			},
			handleClose(){
				this.showProgress = false
				this.getLists()
				clearInterval(this.getProgress)
			}
		},
		created() {
			this.getLists()
		},
		destroyed() {
			clearInterval(this.getProgress)
			console.log('页面关闭')
		}
	}
</script>

<style>

</style>
