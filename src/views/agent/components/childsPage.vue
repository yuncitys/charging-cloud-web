<template>
	<div style="display: inline-block;">
		<el-button type="primary" size="mini"
			@click='onshowTable()'
			v-if="btnAuthen.permsVerifAuthention(':sys:admin:findAdminUserSonList')">名下代理
		</el-button>
		<el-dialog :visible.sync="showTable" title="所有代理商" @close="showTable = false" width="65%" :append-to-body="true">
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"
				fit highlight-current-row style="width: 100%;" align="center">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column label="登录账号" prop="adminName" align="center">
				</el-table-column>
				<el-table-column label="姓名" prop="adminFullname" align="center">
				</el-table-column>
				<el-table-column prop="adminPhone" label="手机号" align="center" :show-overflow-tooltip='true'>
				</el-table-column>
				<el-table-column prop="roleName" label="角色" align="center" :show-overflow-tooltip='true'>
				</el-table-column>
				<el-table-column prop="freezeStatus" label="账号状态" align="center" :show-overflow-tooltip='true'>
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.freezeStatus == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.freezeStatus == 1">冻结</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="totalAmount" label="总收益" align="center" :show-overflow-tooltip='true'>
				</el-table-column>
				<el-table-column prop="balenceAmount" label="余额" align="center" :show-overflow-tooltip='true'>
				</el-table-column>
				<el-table-column prop="parentName" label="上级名称" align="center" :show-overflow-tooltip='true'>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" sortable :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="更新时间" align="center" sortable :show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="lastLoginTime" label="最后登录时间" align="center" sortable
					:show-overflow-tooltip="true">
					<template slot-scope="scope">
						<span>{{ scope.row.lastLoginTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center"  width="300">
					<template slot-scope="scope">
						<!-- 编辑 -->
						<editPage :row_data="scope.row" @getLists="getLists" />
						<el-button type="danger" style="margin-left: 10px;" size="mini"
							v-if="btnAuthen.permsVerifAuthention(':agent:agentList:delete')" @click='del(scope.row.id)'>
              				删除
						</el-button>
						<el-button type="primary" style="margin-left: 10px;" size="mini"
							@click='editPassword(scope.row.id)'>
              				重置密码
						</el-button>
						<el-button type="danger" style="margin-left: 10px;" size="mini"
							@click="onfreezeAdminUser(scope.row,1,'next')" v-if="scope.row.freezeStatus == 0 && btnAuthen.permsVerifAuthention(':sys:admin:freezeAdminUser')">
							冻结账户
						</el-button>
						<el-button type="success" style="margin-left: 10px;" size="mini"
							@click="onfreezeAdminUser(scope.row,0,'next')" v-if="scope.row.freezeStatus == 1 && btnAuthen.permsVerifAuthention(':sys:admin:freezeAdminUser')">
							解封账户
						</el-button>
						<!-- 名下所有代理商 -->
						<div style="margin-top: 10px;">
							<childsPage :row_data="scope.row"/>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]"
					:page-size="listQuery.limit" :total="total" background
					layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
					@current-change="handleCurrentChange" />
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		updateAdminUser,
		deleteAdminUser,
		addAdminUser,
		editPasswordAdminUser,
		findAdminUserSonList,
		findRoleList,
		freezeAdminUser
	} from '@/api/agent/agentList.js'
	import {
		findDealerList,
	} from '@/api/device/deviceList.js'
	import {
		parseTime
	} from '@/utils/index'
	import editPage from './editPage.vue'
	import childsPage from './childsPage.vue'
	export default {
		name:'childsPage',
		components: {
			editPage,
			childsPage
		},
		props:{
			row_data:{
				type:Object
			}
		},
		data() {
			return {
				listLoading: true,
				tableKey:0,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					parentId: ''
				},
				showTable: false
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
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.AdminUserSonList()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.AdminUserSonList()
			},
			onshowTable(id) {
				this.listQuery.parentId = this.row_data.id
				this.showTable = true
				this.AdminUserSonList()
			},
			AdminUserSonList() {
				this.listLoading = true
				findAdminUserSonList(this.listQuery).then(res => {
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
			//冻结账户
			onfreezeAdminUser(item, freezeStatus, str) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						adminId: item.id,
						freezeStatus: freezeStatus
					}
					console.log(data)
					freezeAdminUser(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							if (str == 'next') {
								this.AdminUserSonList()
							} else {
								this.getLists()
							}
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						adminUserId: id
					}
					console.log(data)
					deleteAdminUser(data).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.AdminUserSonList()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			//初始化密码
			editPassword(adminUserId) {
				let data = {
					adminUserId
				}
				editPasswordAdminUser(data).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg)
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {

		},
	}
</script>

<style>

</style>
