<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入文件名" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>
			<!-- 新增 -->
			<addPage @getLists="getLists" />
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="createTime" label="添加时间" align="center" sortable :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="fileName" label="文件名" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="upfileUrl" label="升级文件路径" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="md5Value" label="MD5值" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="fileSize" label="文件大小" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="remark" label="备注说明" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="successCount" label="下发指令成功次数" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="failCount" label="下发指令失败次数" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="lastTime" label="最后下发指令时间" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.lastTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="lastContent" label="最后下发指令内容" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="操作" align="center" width="300">
					<template slot-scope="scope">
						<div>
							<!-- 编辑 -->
							<editPage :row_data="scope.row" @getLists="getLists" />
							<el-button type="danger"
								v-if="btnAuthen.permsVerifAuthention(':updateApp:deleteupdateAppFile')"
								@click="deleData(scope.row)" style="margin-left: 10px;" size="mini">刪除
							</el-button>
						</div>
						<div style="margin-top: 5px;">
							<el-button type="primary" @click="onAllUpDate(scope.row)" style="margin-left: 10px;"
								size="mini">下发升级指令
							</el-button>
							<!-- <el-button type="primary" @click="onOneUpDate(scope.row)" style="margin-left: 10px;"
								size="mini">指定单个设备升级
							</el-button> -->
							<upgradeOne :row_data="scope.row"></upgradeOne>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>

			<!-- 指定单个设备升级-->
			<el-dialog :visible.sync="showOneUpte" title="指定单个设备升级" @close="showOneUpte = false" :append-to-body="true">
				<el-form ref="upDateData" :model="upDateData" label-position="left" label-width="120px"
					style="width: 600px; margin-left:50px;">
					<el-form-item :label="'搜索设备'" prop="deviceCode">
						<div style="display: flex;width: 100%;">
							<div style="width: 80%;">
								<el-input v-model="deviceCode" placeholder="请输入设备号" clearable />
							</div>
							<div style="width: 20%;display: flex;justify-content:flex-end;">
								<div>
									<el-button type="primary" @click="onfindDeviceCode">搜索</el-button>
								</div>
							</div>
						</div>
					</el-form-item>
					<el-form-item :label="'选择设备'" style="width: 100%;">
						<el-select v-model="upDateData.deviceCode" style="width: 100%;" class="filter-item"
							placeholder="请先搜索设备" clearable @keyup.enter.native="handleFilter">
							<el-option v-for="item in deviceList" :key="item.deviceCode" :label="item.deviceCode"
								:value="item.deviceCode" />
						</el-select>
					</el-form-item>
					<el-form-item :label="'文件名'" prop="fileName">
						<el-input v-model="upDateData.fileName" placeholder="文件名" clearable disabled />
					</el-form-item>
					<el-form-item :label="'升级文件路径'" prop="upfileUrl">
						<el-input v-model="upDateData.upfileUrl" placeholder="升级文件路径" clearable disabled />
					</el-form-item>
					<el-form-item :label="'文件大小'" prop="fileSize">
						<el-input v-model="upDateData.fileSize" placeholder="文件大小" clearable disabled />
					</el-form-item>
					<el-form-item :label="'MD5值'" prop="md5Value">
						<el-input v-model="upDateData.md5Value" placeholder="MD5值" clearable disabled />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="onsendOtaDevice('upDateData')" :loading="Loading">确定
						</el-button>
						<el-button @click="showOneUpte = false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		uploadfile,
		addUpdateApp,
		editUpdateApp,
		findDeviceCode,
		sendOtaDevice,
		delOtaDevice
	} from '@/api/device/upgrade.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/upgrade/addPage.vue'
	import editPage from './components/upgrade/editPage.vue'
	import upgradeOne from './components/upgrade/upgradeOne.vue'
	export default {
		name: 'upgrade',
		components: {
			addPage,
			editPage,
			upgradeOne
		},
		data() {
			return {
				listLoading: false,
				Loading: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10
				},
				tableKey: 0,
				showOneUpte: false,

				upDateData: {
					fileName: '',
					upfileUrl: '',
					md5Value: '',
					fileSize: '',
					deviceCode: '',
				},
				deviceCode: '',
				deviceList: []
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
		watch: {
			filterTextAdd(val) {
				this.$refs.addTree.filter(val);
			},
			filterTextEdit(val) {
				this.$refs.editTree.filter(val);
			}
		},
		methods: {
			//升级全部设备
			onAllUpDate(row) {
				this.upDateData.fileName = row.fileName
				this.upDateData.upfileUrl = row.upfileUrl
				this.upDateData.md5Value = row.md5Value
				this.upDateData.fileSize = row.fileSize
				console.log(this.upDateData)
				this.$confirm('您确定要下发版本升级指令吗？升级过程中所有设备不能使用！！！', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						url: this.upDateData.upfileUrl,
						md5: this.upDateData.md5Value,
						len: this.upDateData.fileSize,
						type: 0,
						deviceCode: ''
					}
					sendOtaDevice(data).then(res => {
						if (res.code == 200) {
							this.$message.success(res.msg)
						}
					})
				})
			},
			//显示单个升级弹窗
			onOneUpDate(row) {
				console.log(row)
				this.showOneUpte = true
				this.upDateData.fileName = row.fileName
				this.upDateData.upfileUrl = row.upfileUrl
				this.upDateData.md5Value = row.md5Value
				this.upDateData.fileSize = row.fileSize
				this.deviceCode = ''
				this.onfindDeviceCode()
			},
			//设备列表
			onfindDeviceCode() {
				let data = {
					deviceCode: this.deviceCode
				}
				findDeviceCode(data).then(res => {
					if (res.code == 200) {
						this.deviceList = res.data
					}
				})
			},
			//单个设备升级
			onsendOtaDevice() {
				if (this.upDateData.deviceCode == '') {
					this.$message.error('请选择设备')
					return false
				}
				let data = {
					url: this.upDateData.upfileUrl,
					md5: this.upDateData.md5Value,
					len: this.upDateData.fileSize,
					type: 1,
					deviceCode: this.upDateData.deviceCode
				}
				sendOtaDevice(data).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
						this.showOneUpte = false
					}
				})
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
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			deleData(item) {
				console.log(item)
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id: item.id
					}
					console.log(data)
					delOtaDevice(data).then(res => {
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
			}
		},
		created() {
			this.getLists()

			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">

</style>
