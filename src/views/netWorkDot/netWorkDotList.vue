<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkProvince" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站省份" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<!-- <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
				placeholder="请选择代理商">
				<el-option
				v-for="item in dealerList"
				:key="item.id"
				:label="item.adminFullname"
				:value="item.id">
				</el-option>
			</el-select> -->
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>

			<!--添加站点-->
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="addOrUpdateHandle()" 
				v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:add')">添加站点
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
				<el-table-column prop="operatorName" label="运营商户" align="center" :show-overflow-tooltip='isPc'>
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
				<el-table-column prop="startingPrice" label="充电起始价" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.ruleId === 2 ? scope.row.startingPrice + '（元）' : '无' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip='isPc'>
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
				<el-table-column label="操作" align="center" width="380" fixed="right">
					<template slot-scope="scope">
						<!-- 设置分成 -->
						<set-split-account-page :row_data="scope.row" @getLists="getLists"/>
						<!-- 编辑 -->
						<!-- <chargeStationDialog :row_data="scope.row" @getLists="getLists" /> -->
						<el-button type="primary" style="margin-left: 10px;" size = "mini" @click="addOrUpdateHandle(scope.row,false)" 
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')">编辑
						</el-button>
						<!-- 详情 -->
						<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,true)">详情</el-button>
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
		<ChargeStationDialog ref="chargeStationForm" @getLists="getLists" />
	</div>
</template>

<script>
	import {
		getList,
		deleteNetworkDot,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import {
		findDealerList,
	} from '@/api/device/deviceList.js'
	import loadMap from "../../utils/loadMap.js";
	import {
		parseTime
	} from '@/utils/index'
  	import setSplitAccountPage from './components/setSplitAccountPage.vue'
	import downExcel from './components/downExcel.vue'
	import ChargeStationDialog from './components/chargeStationDialog.vue';
	export default {
		name: 'netWorkDotList',
		components: {
			ChargeStationDialog,
      		setSplitAccountPage,
			downExcel
		},
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
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
        		dealerList: [],
				listQuery: {
					page: 1,
					limit: 10,
					ruleId: 1,
					type: 1,
					adminId: '',
					networkName: '',
					networkProvince: '',
					networkAddress: '',
					
				},
				tableKey: 0,
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
			addOrUpdateHandle(row,isDetail) {
				console.log("row:",row)
				this.$nextTick(() => {
					this.$refs.chargeStationForm.onshowAdd(row,isDetail)
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
			findDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			this.getLists()
			// this.findDealerList()
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
