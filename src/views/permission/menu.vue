<template>
	<div class="app-container">
		<div class="filter-container">
			<div style="margin: 15px 0;">
				<addPage type="parent" @getLists="getLists"></addPage>
			</div>
			<div class="menu-table-wrapper">
				<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" :fit="false" style="min-width: 960px"
					highlight-current-row align="center" row-key="id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" id="tableBox">
					<el-table-column prop="id" label="id" align="center" :show-overflow-tooltip="isPc" min-width="80">
					</el-table-column>
					<el-table-column prop="title" label="菜单名称" align="center" :show-overflow-tooltip="isPc" min-width="180">
					</el-table-column>
					<el-table-column prop="menuType" label="类型" align="center" min-width="100">
						<template slot-scope="scope">
							<el-tag :type="menuTypeTag(scope.row.menuType)" size="mini">
								{{ menuTypeLabel(scope.row.menuType) }}
							</el-tag>
						</template>
					</el-table-column>
					<el-table-column prop="icon" label="图标" align="center" min-width="100">
						<template slot-scope="scope" style="text-align: center;height: 40px;">
							<i :class="scope.row.icon" style="font-size: 26px;"></i>
						</template>
					</el-table-column>
					<el-table-column prop="href" label="资源地址" align="center" :show-overflow-tooltip="isPc" min-width="180">
					</el-table-column>
					<el-table-column prop="perms" label="权限标识" align="center" :show-overflow-tooltip="isPc" min-width="180">
					</el-table-column>
					<el-table-column prop="parentId" label="父级Id" align="center" :show-overflow-tooltip="isPc" min-width="100">
					</el-table-column>
					<el-table-column prop="sorting" label="排序" align="center" sortable :show-overflow-tooltip="isPc" min-width="100">
					</el-table-column>
					<el-table-column prop="grade" label="菜单等级" align="center" :show-overflow-tooltip="isPc" min-width="100">
					</el-table-column>
					<el-table-column label="操作" align="center" min-width="320">
						<template slot-scope="scope">
							<div style="display: flex;justify-content: center;align-items: center;flex-wrap: wrap;">
								<editPage :row_data="scope.row" @getLists="getLists"></editPage>
								<div>
									<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
										v-if="btnAuthen.permsVerifAuthention(':permission:menu:delete')">
										删除
									</el-button>
								</div>
								<div>
									<addPage
										type="childern"
										:id="scope.row.id"
										:parent-menu-type="scope.row.menuType"
										@getLists="getLists"
									></addPage>
								</div>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
	</div>
</template>

<script>
	import { getList, deleteMenu } from '@/api/permission/menu.js'
	import { parseTime } from '@/utils/index'
	import addPage from './components/menu/addPage.vue'
	import editPage from './components/menu/editPage.vue'
	import { menuTypeLabel, menuTypeTag } from '@/views/permission/constants/menuType.js'

	export default {
		components: {
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
				isPc: true
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			}
		},
		methods: {
			menuTypeLabel,
			menuTypeTag,
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					} else {
						this.listLoading = false
						this.$message.error(res.msg)
					}
				}).catch(() => {
					this.listLoading = false
				})
			},
			del(menuId) {
				this.$confirm('将递归删除该菜单及其全部子节点，是否继续？', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					deleteMenu({ menuId }).then(res => {
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
			}
		},
		created() {
			this.getLists()
			this.isPc = !this.$common.isMobile()
		}
	}
</script>

<style scoped="scoped">
.menu-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.el-table {
  width: auto !important;
}
.el-table .fixed-right {
  position: sticky;
  position: -webkit-sticky;
  right: 0;
  z-index: 100;
}
</style>
