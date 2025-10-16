<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.feeName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入方案名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>
			<addPage @getLists="getLists" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" row-key="id"
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="feeName" label="方案名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="remark" label="收费说明" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="detail" label="方案详情" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="realTimeCharging" label="计费周期" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{scope.row.realTimeCharging ? '按30分钟收费' : '实时1分钟收费'}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="chargeType" label="计费功耗类型" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{scope.row.chargeType ? '最高功率' : '平均功率'}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="config.AutostopConfig.isAutostop" label="充满自停" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.config.AutostopConfig.isAutostop === 1">是</span>
						<span v-if="scope.row.config.AutostopConfig.isAutostop === 0">否</span>
					</template>
				</el-table-column>
				<el-table-column prop="createUser" label="创建用户" align="center" width="150"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="updateUser" label="更新用户" align="center" width="150"
					:show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.updateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<editPage @getLists="getLists" :row_data="scope.row" />
						<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
							icon="el-icon-delete"
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:charge:powerCharge:delete')">
							删除
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
	</div>
</template>

<script>
	import {
		getList,
		batchDevicePrices,
		deleteDevicePrice,
		updateDevicePrice
	} from '@/api/netWorkDot/charge/chargeList.js'
	import {
		parseTime
	} from '@/utils/index'
	import qs from 'qs'
	import addPage from './components/powerCharge/addPage.vue'
	import editPage from './components/powerCharge/editPage.vue'
	export default {
		components: {
			addPage,
			editPage
		},
		name: 'powerCharge',
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					feeName: '',
					priceType: 2,
					ruleId: 1
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
		methods: {
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						let list = res.data || []
						if (list.length != 0) {
							list.forEach((item, index) => {
								if (item.priceContents.length != 0) {
									let arr = []
									item.priceContents.forEach((item1, index1) => {
										let detail = item1.powerSectionBefore + '-' + item1.powerSectionAfter + 'W,' + item1.duration + '小时' + "/" + item1.serviceChargePrice + "元"
										arr[index1] = detail
									})
                  					item.detail = arr.join(";")
								} else {
									item.datail = ''
								}
								// if(item.priceView !=''){
								//   let priceViewDetail = JSON.parse(item.priceView);
								//   item.priceView = priceViewDetail
								// }
								if(item.config !=''){
									let configDetail = JSON.parse(item.config);
									item.config = configDetail
								}
							})
						}
						this.list = list
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
					deleteDevicePrice(data).then(res => {
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
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
		},
		created() {
			this.getLists()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}

	.left {
		margin-right: 20px;
	}

	.inputBoxx2 {
		margin-top: 10px !important;
		width: 100%;
	}

	.inputBoxx1 {
		width: 100%;
	}

	.inputBtnn {
		margin-top: 10px !important;
	}

	.formItem {
		margin-bottom: 25px;
	}
</style>
