<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.organizationName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入互联客户名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.operatorName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入运营商名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>
			<!-- 新增互联机构 -->
			<div style="margin: 15px 0;">
				<el-button type="primary" @click="addOrUpdateHandle()">添加</el-button>
			</div>
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="organizationName" label="互联客户" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="operatorName" label="运营商户" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="updateUser" label="更新用户" align="center" :show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="310">
					<template slot-scope="scope">
						<div style="display: flex;justify-content: center;align-items: center;">
							<el-button type="primary" size = "mini" @click="chareStationPushHandle(scope.row)">站点推送</el-button>
							<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,false)">编辑</el-button>
							<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,true)">详情</el-button>
							<el-button type="danger" size = "mini" @click="handleDelete(scope.row.id)">删除</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>
		<organizationSecretKeyDialog ref="organizationSecretKeyDialog" @getOrganizeSecretKeyList="getOrganizeSecretKeyList" />
		<chargeStationPushDialog ref="chageStationPushDialog"></chargeStationPushDialog>
	</div>
</template>

<script>
	import {
		getOrganizeSecretKeyList,
        deleteOrganizeSecretKey
	} from '@/api/interconnection/organization.js'
	import {
		parseTime
	} from '@/utils/index'
	import organizationSecretKeyDialog from './components/organizationSecretKeyDialog.vue';
	import chargeStationPushDialog from './components/chargeStationPushDialog.vue';
	export default {
		name: 'organizeSecretKey',
		components: {
			organizationSecretKeyDialog,
			chargeStationPushDialog
		},
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
                    organizationName: '',
                    operatorName: ''
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
			getOrganizeSecretKeyList() {
				this.listLoading = true
				getOrganizeSecretKeyList(this.listQuery).then(res => {
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
			chareStationPushHandle(row){
				this.$nextTick(() => {
				    this.$refs.chageStationPushDialog.openDialog(row)
                })
			},
			handleDelete(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
                    deleteOrganizeSecretKey(id).then(res => {
                        if (res.code == 200) {
                            this.$message({
								type: 'success',
								message: res.msg
							})
							this.getOrganizeSecretKeyList()
                        } else {
                            this.$message.error(res.msg)
                        }
                    })
				})
			},
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getOrganizeSecretKeyList()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getOrganizeSecretKeyList()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getOrganizeSecretKeyList()
			},
			addOrUpdateHandle(row,isDetail) {
				this.$nextTick(() => {
				    this.$refs.organizationSecretKeyDialog.openDialog(row,isDetail)
                })
      		},
			refresh(isrRefresh) {
				if (isrRefresh) this.reset()
			},
			reset() {
				this.handleFilter()
			},
		},
		created() {
			this.getOrganizeSecretKeyList()
		},
	}
</script>