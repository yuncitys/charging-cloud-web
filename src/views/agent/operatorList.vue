<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.adminName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入登录账号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.adminPhone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<!-- 添加代理商 -->
			<addOperatorPage @getLists="getLists" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column  prop="adminName" label="登录账号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="adminFullname" label="姓名" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="adminPhone" label="手机号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="roleName" label="角色" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="wxName" label="小程序名称" align="center" width="100" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="wxAppId" label="小程序AppId" align="center" width="120" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="freezeStatus" label="运营状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.freezeStatus == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.freezeStatus == 1">冻结</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="totalAmount" label="总收益" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="balenceAmount" label="余额" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="isSeparate" label="是否参与分成" align="center" width="120" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.isSeparate === 1">参与分成</el-tag>
						<el-tag type="danger" v-if="scope.row.isSeparate === 0">不参与分成</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="interestRate" label="分润" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span v-if="scope.row.interestRate">{{ (scope.row.interestRate * 100).toFixed(0) }}%</span>
					</template>
				</el-table-column>
				<el-table-column prop="lastLoginTime" label="最后登录时间" align="center" width="120" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.lastLoginTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="360">
					<template slot-scope="scope">
            <div style="display: flex;align-items: center;justify-content: space-around;">
            	<div>
                <div>
                  <!-- 编辑 -->
                  <editOperatorPage :row_data="scope.row" @getLists="getLists" />
                </div>

                <div class="top10" v-if="btnAuthen.permsVerifAuthention(':sys:admin:deleteAdminUser')">
                  <el-button type="danger" size="mini"
                  	 @click='del(scope.row.id)'>
                    删除
                  </el-button>
                </div>
              </div>

              <div>
                <div v-if="btnAuthen.permsVerifAuthention(':sys:admin:freezeAdminUser')">
                    <el-button type="danger" @click='onfreezeAdminUser(scope.row,1)'
                    	size="mini"
                    	v-if="scope.row.freezeStatus == 0">
                    	冻结账户
                    </el-button>
                    <el-button type="success" @click='onfreezeAdminUser(scope.row,0)'
                    	size="mini"
                    	v-if="scope.row.freezeStatus == 1 ">
                    	解封账户
                    </el-button>
                </div>
                <div class="top10">
                  <el-button type="primary" @click='editPassword(scope.row.id)'
                    size="mini" v-if="btnAuthen.permsVerifAuthention(':sys:admin:editPasswordAdminUser')">
                    重置密码
                  </el-button>
                </div>
              </div>

              <!-- <div >
                <div>
                  <el-button type="primary" size="mini"
                    @click='addIndividual()'>
                  	个体开户
                  </el-button>
                </div>
                <div class="top10">
                  <el-button type="primary" size="mini"
                    @click='addIndividual()'>
                  	企业开户
                  </el-button>
                </div>
              </div> -->

              <div>
                <!-- style="margin-left: 10px;margin-top: 10px;"-->
                <!-- 名下所有代理商 -->
                <div class="top10">
                  <childsPage :row_data="scope.row" />
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
		freezeAdminUser
	} from '@/api/agent/agentList.js'
	import {
		findDealerList,
	} from '@/api/device/deviceList.js'
	import {
		parseTime
	} from '@/utils/index'
	import addOperatorPage from './components/addOperatorPage.vue'
	import editOperatorPage from './components/editOperatorPage.vue'
	import childsPage from './components/childsPage.vue'
	export default {
		name: 'operatorList',
		components: {
			addOperatorPage,
			editOperatorPage,
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
          roleId: 3,
					adminName: '',
					adminPhone: ''
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
      //个体开户
      addIndividual() {
      	this.$router.push({
      		name: "addIndividual"
      	});
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
			// getRoleList() {
			// 	let data = {
			// 		page: 1,
			// 		limit: 1000
			// 	}
			// 	findRoleList(data).then(res => {
			// 		if (res.code == 200) {
			// 			this.restaurants = res.data
			// 		}
			// 	})
			// },
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
			// this.stopF5Refresh()
		},
	}
</script>

<style>

</style>
