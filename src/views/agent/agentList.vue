<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.adminName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入登录账号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.adminPhone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<!-- <el-autocomplete style="width: 200px;margin-right: 20px ;" class="filter-item"
				v-model="listQuery.adminName1" :fetch-suggestions="querySearch" placeholder="请选择角色"
				@select="handleSelect" clearable :debounce='0' @change="changeName"></el-autocomplete> -->
			<el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.roleId" filterable
				clearable @change="handleFilter()" placeholder="请选择角色">
				<el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
				</el-option>
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<!-- 添加代理商 -->
			<addPage @getLists="getLists" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column label="登录账号" prop="adminName" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="姓名" prop="adminFullname" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="adminPhone" label="手机号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="roleName" label="角色" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="freezeStatus" label="账号状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.freezeStatus == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.freezeStatus == 1">冻结</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="totalAmount" label="总收益" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="balenceAmount" label="余额" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="openId" label="绑定状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="danger" v-if="scope.row.bindingStatus == 0">未绑定</el-tag>
						<el-tag type="success" v-if="scope.row.bindingStatus == 1">已绑定</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="parentName" label="上级名称" align="center" :show-overflow-tooltip='isPc'>
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
				<el-table-column prop="lastLoginTime" label="最后登录时间" align="center" width="120" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.lastLoginTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="260">
					<template slot-scope="scope">
						<div style="display: flex;align-items: center;justify-content: space-around;">
						<div>
							<div>
							<!-- 编辑 -->
							<editPage :row_data="scope.row" @getLists="getLists" />
							</div>

							<div class="top10" v-if="btnAuthen.permsVerifAuthention(':sys:admin:deleteAdminUser')">
							<el-button type="danger" size="mini" @click='del(scope.row.id)'>
								删除
							</el-button>
							</div>
						</div>

						<div>
							<div v-if="btnAuthen.permsVerifAuthention(':sys:admin:freezeAdminUser')">
								<el-button type="danger" @click='onfreezeAdminUser(scope.row,1)' size="mini" v-if="scope.row.freezeStatus == 0">
									冻结账户
								</el-button>
								<el-button type="success" @click='onfreezeAdminUser(scope.row,0)' size="mini" v-if="scope.row.freezeStatus == 1 ">
									解封账户
								</el-button>
							</div>
							<div class="top10">
							<el-button type="primary" @click='editPassword(scope.row.id)' size="mini" v-if="btnAuthen.permsVerifAuthention(':sys:admin:editPasswordAdminUser')">
								重置密码
							</el-button>
							</div>
						</div>

						<div>
							<!-- 名下所有代理商 -->
							<div>
							<childsPage :row_data="scope.row" />
							</div>
							<div class="top10" v-if="btnAuthen.permsVerifAuthention(':sys:admin:unbindingAccount')">
							<el-button type="warning" size="mini" @click='unbindingAccount(scope.row.id)'>
								解绑账户
							</el-button>
							</div>
						</div>
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
		freezeAdminUser,unbindingAccount
	} from '@/api/agent/agentList.js'
	import {
		findRoleAllList,
	} from '@/api/permission/role.js'
	import {
		parseTime
	} from '@/utils/index'
	import addPage from './components/addPage.vue'
	import editPage from './components/editPage.vue'
	import childsPage from './components/childsPage.vue'
	export default {
		name: 'agentList',
		components: {
			addPage,
			editPage,
			childsPage
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
					adminName: '',
					adminPhone: ''
				},
				tableKey: 0,
				roleList: []
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
			querySearch(queryString, cb) {
				var restaurants = this.restaurants;
				let restaurantsText = restaurants.map((item, index) => {
					let value = item.roleName
					let roleId = item.id
					return {
						value,
						roleId
					}
				})
				var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return (restaurant) => {
					return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
				};
			},
			handleSelect(item) {
				console.log(item);
				this.listQuery.roleId = item.roleId + ''
				this.listQuery.adminName1 = item.value + ''
				this.handleFilter()
			},
			changeName() {
				if (this.listQuery.adminName1 == '') {
					this.listQuery.roleId = ''
					this.handleFilter()
				}
			},
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						let list = res.data || []
						this.list = list
						// let agentList = []
						// list.forEach((item, index) => {
						//   if(item.roleId != 3){
						//     agentList.push(item)
						//     // list.splice(index, 1);
						//     // console.log("remove",item)
						//   }
						// })
						// this.list = agentList
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			//冻结账户
			onfreezeAdminUser(item, freezeStatus, str) {
				let title = ''
				let message
				if (freezeStatus == 1) {
					title = '将会冻结此账户！'
					message = '冻结成功'
				} else {
					title = '将会解封此账户！'
					message = '解封成功'
				}
				this.$confirm(title, '警告', {
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
								message: message
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
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			unbindingAccount(id) {
				this.$confirm('这一操作将将会解绑此账户。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						adminId: id
					}
					console.log(data)
					unbindingAccount(data).then(res => {
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
			//初始化密码
			editPassword(adminUserId) {
				this.$confirm('是否初始化密码?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						adminUserId
					}
					editPasswordAdminUser(data).then(res => {
						if (res.code == 200) {
							this.$message.success(res.msg)
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			findRoleAllList() {
				findRoleAllList().then(res => {
					if (res.code == 200) {
						this.restaurants = res.data
						this.roleList = res.data
					}
				})
			},
			stopF5Refresh() {
				document.onkeydown = function(e) {
					var evt = window.event || e;
					var code = evt.keyCode || evt.which;
					//屏蔽F1---F12
					if (code > 111 && code < 124) {
						if (evt.preventDefault) {
							evt.preventDefault();
						} else {
							evt.keyCode = 0;
							evt.returnValue = false;
						}
					}
				};
				//禁止鼠标右键菜单
				document.oncontextmenu = function(e) {
					return false;
				};
				//阻止后退的所有动作，包括 键盘、鼠标手势等产生的后退动作。
				history.pushState(null, null, window.location.href);
				window.addEventListener("popstate", function() {
					history.pushState(null, null, window.location.href);
				});
			},
		},
		created() {
			this.getLists()
			this.findRoleAllList()
			// this.stopF5Refresh()
		},
	}
</script>
