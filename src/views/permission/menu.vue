<template>
	<div class="app-container">
		<div class="filter-container">
			<div style="margin: 15px 0;">
				<addPage type="parent" @getLists="getLists"></addPage>
			</div>
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" row-key="id"
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}" id="tableBox">
				<el-table-column prop="id" label="id" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="title" label="菜单名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="icon" label="图标" align="center" width="150">
					<template slot-scope="scope" style="text-align: center;height: 40px;">
						<i :class="scope.row.icon" style="font-size: 26px;"></i>
					</template>
				</el-table-column>
				<el-table-column prop="href" label="资源地址" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="perms" label="权限标识" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="parentId" label="父级Id" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="sorting" label="排序" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="grade" label="菜单等级" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="操作" align="center"  width="260">
					<template slot-scope="scope">
						<div style="display: flex;justify-content: center;align-items: center;">
							<editPage :row_data="scope.row" @getLists="getLists"></editPage>
							<div>
								<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
									 v-if="btnAuthen.permsVerifAuthention(':permission:menu:delete')">
									删除
								</el-button>
							</div>
							<div>
								<addPage type="childern" :id="scope.row.id" @getLists="getLists"></addPage>
							</div>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>

<script>
	import {
		getList,
		addMenu,
		updateMenu,
		deleteMenu,
	} from '@/api/permission/menu.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/menu/addPage.vue'
	import editPage from './components/menu/editPage.vue'
	export default {
		components:{
			addPage,
			editPage
		},
		name: 'menu',
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
			del(menuId) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						menuId
					}
					console.log(data)
					deleteMenu(data).then(res => {
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
