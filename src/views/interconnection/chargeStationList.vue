<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkProvince" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站省份" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.merchantId" filterable clearable @change="handleFilter()"
			  placeholder="运营商户">
			    <el-option
			      v-for="item in merchantList"
			      :key="item.id"
			      :label="item.name"
			      :value="item.id">
			    </el-option>
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>

			<!--同步站点-->
			<el-button style="margin-right: 20px ;" type="primary" class="filter-item" @click="onSyncStation">
				同步站点
			</el-button>

			<!--导出Excel  -->
			<downExcel :queryData="listQuery" />

			<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
				<el-tab-pane
					v-for="(item, index) in ruleIdList"
					:key="item.id"
					:label="item.title"
					:name="item.id">
				</el-tab-pane>
			</el-tabs>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<!-- <el-table-column prop="ruleId" label="充电站类型" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.ruleId === 1 ? '单车充电站' : '汽车充电站'}}
					</template>
				</el-table-column> -->
				<el-table-column prop="merchantName" label="运营商户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkName" label="充电站名称" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<!-- <el-table-column prop="networkProvince" label="省" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkCity" label="市" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkRegion" label="区" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column> -->
				<el-table-column prop="networkAddress" label="投放地" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkLongitude" label="地址经度" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkLatitude" label="地址纬度" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="App展示" align="center" width="110">
					<template slot-scope="scope">
						<el-switch
							v-model="scope.row.isAppDisplay"
							:active-value="1"
							:inactive-value="0"
							:disabled="!btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit') || !!appDisplayUpdating[scope.row.id]"
							@change="handleAppDisplayChange(scope.row, $event)"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="updateUser" label="更新用户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.updateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="180" fixed="right">
					<template slot-scope="scope">
						<!-- 设置分成 -->
						<!-- <set-split-account-page :row_data="scope.row" @getLists="getLists"/> -->
						<!-- 抽成规则 -->
						<el-button type="primary" size="mini" @click="toStationSetting(scope.row)">设置</el-button>
						<!-- 编辑 -->
						<!-- <chargeStationDialog :row_data="scope.row" @getLists="getLists" /> -->
						<!-- <el-button type="primary" style="margin-left: 10px;" size = "mini" @click="addOrUpdateHandle(scope.row,false)" 
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')">编辑
						</el-button> -->
						<!-- 详情 -->
						<!-- <el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,true)">详情</el-button> -->
						<!-- 删除 -->
						<el-button style="margin-left: 10px;" type="danger" size="mini" icon="el-icon-delete"  @click="del(scope.row.id)"
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:delete')">删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>
		<el-dialog :visible.sync="showSyncStation" title="同步站点" @close="showSyncStation = false">
			<el-form ref="syncStation" :model="syncStationForm" :rules="rules" label-position="left"
				label-width="100px" style="width: 600px; margin-left:50px;">
				<el-form-item :label="'互联商户'" prop="merchantId">
				<el-select v-model="syncStationForm.merchantId" class="filter-item" placeholder="请选择互联商户" clearable style="width: 100%">
					<el-option v-for="item in merchantList" 
						:key="item.id" 
						:label="item.name + '(' + item.companyName + ')'"
						:value="item.id" 
					/>
				</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="btnLoading" @click="synchronizationStation()">确定</el-button>
					<el-button @click="showSyncStation = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		updateNetworkDot,
		updateSwitch,
		deleteNetworkDot,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		getMerchantList,
		synchronizationStation
	} from '@/api/interconnection/merchant.js'
	import {
		parseTime
	} from '@/utils/index'
	import downExcel from '../netWorkDot/components/downExcel.vue'
	export default {
		name: 'interconnectionChargeStationList',
		components: {
			downExcel
		},
		data() {
			return {
				activeName: '2',
				ruleIdList: [{
					id: '1',
					title: '单车'
				}, {
					id: '2',
					title: '汽车'
				}],
				listLoading: true,
				showSyncStation: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				merchantList: [],
				appDisplayUpdating: {},
				listQuery: {
					page: 1,
					limit: 10,
					ruleId: 2,
					type: 2,
					adminId: '',
					merchantId: '',
					networkName: '',
					networkProvince: '',
					networkAddress: '',
					
				},
				tableKey: 0,

				btnLoading: false,
				syncStationForm: {
					merchantId: ''
				},
				rules: {
					merchantId: [{
						required: true,
						message: '请选择需要同步的商户',
						trigger: 'blur'
					}],
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
		mounted() {

		},
		methods: {
			normalizeFlag01(val) {
				if (val === 1 || val === '1' || val === true) return 1
				return 0
			},
			handleAppDisplayChange(row, val) {
				if (!row || !row.id) return
				const nextVal = this.normalizeFlag01(val)
				const prevVal = nextVal === 1 ? 0 : 1

				this.$set(this.appDisplayUpdating, row.id, true)
				updateSwitch({ id: row.id, field: 'isAppDisplay', value: nextVal === 1 }).then(res => {
					if (res && res.code == 200) {
						this.$message.success(res.msg || '更新成功')
					} else {
						row.isAppDisplay = prevVal
						this.$message.error((res && res.msg) || '更新失败')
					}
				}).catch(() => {
					row.isAppDisplay = prevVal
					this.$message.error('更新失败')
				}).finally(() => {
					this.$delete(this.appDisplayUpdating, row.id)
				})
			},
			toStationSetting(row) {
				const stationId = row && row.id ? row.id : ''
				if (!stationId) {
					this.$message.error('缺少站点ID')
					return
				}
				this.$router.push({
					path: `/netWorkDot/setting/${stationId}`,
					query: {
						merchantId: row.merchantId || row.merchant_id || row.merchantID || '',
						merchantName: row.merchantName || row.merchant_name || '',
						stationName: row.networkName || ''
					}
				})
			},
			addOrUpdateHandle(row,isDetail) {
				console.log("row:",row)
				this.$nextTick(() => {
					this.$refs.chargeStationForm.onshowAdd(row,isDetail)
				})
      		},
			//同步站点
			onSyncStation() {
				this.showSyncStation = true
				this.syncStationForm = {merchantId: ''}
				this.getMerchantList()
			},
			synchronizationStation() {
				this.btnLoading = true;
				const merchantId = this.syncStationForm.merchantId
				synchronizationStation(merchantId).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.showSyncStation = false
						this.getLists()
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
					this.btnLoading = false
				})
				
			},
			//切换导航
			handleClick(tab, event) {
				this.listQuery.ruleId = tab.name
				this.listQuery.page = 1,
				this.listQuery.limit = 10,
				this.getLists()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						const list = Array.isArray(res.data) ? res.data : []
						this.list = list.map(item => {
							const isAppDisplay = this.normalizeFlag01(item.isAppDisplay ?? item.is_app_display)
							return { ...item, isAppDisplay }
						})
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
					deleteNetworkDot(data).then(res => {
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
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getLists()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getLists()
			},
			getMerchantList() {
				getMerchantList({ roleType: 'OPERATOR', type: 2 }).then(res => {
					this.merchantList = (res && res.code == 200) ? (res.data || []) : []
				}).catch(() => {
					this.merchantList = []
				})
			},
		},
		created() {
			this.getLists()
			this.getMerchantList()
		},
	}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}

	.amap-sug-result {
		z-index: 9999 !important;
	}

	#tipinput {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	#tipinput1 {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}
</style>
