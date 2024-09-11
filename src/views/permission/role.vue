<template>
	<div class="app-container">
		<div class="filter-container">
			<div style="margin: 15px 0;">
				<addPage @getLists="getLists"></addPage>
			</div>
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="roleName" label="角色名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="remark" label="备注" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip="isPc" sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip="isPc" sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.updateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<editPage :row_data="scope.row" @getLists="getLists"></editPage>
						<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
							icon="el-icon-delete" v-if="btnAuthen.permsVerifAuthention(':permission:role:delete')">删除
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
		addRole,
		findMenuByRoleId,
		updateRole,
		deleteRole
	} from '@/api/permission/role.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/role/addPage.vue'
	import editPage from './components/role/editPage.vue'
	export default {
		components:{
			addPage,
			editPage
		},
		name: 'role',
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10
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
						console.log(res)
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			del(roleId) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						roleId
					}
					console.log(data)
					deleteRole(data).then(res => {
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
		},
		created() {
			this.getLists()			
			this.isPc=!this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">

</style>
