<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.userName" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户昵称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.phoneNumber" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.userCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择用户状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="注册开始日期" end-placeholder="注册结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column label="小程序名称" prop="wxName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column label="用户ID" prop="userCode" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="昵称" prop="userName" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="头像" prop="headImg" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<imgView :imgSrc="scope.row.headImg" />
					</template>
				</el-table-column>
				<el-table-column label="手机号" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="微信ID" prop="wxOpenId" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="余额" prop="cash" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="支付金额" prop="realityPayMoney" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="赠送金额" prop="giveMoney" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="状态" prop="status" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.status == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 1">冻结</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="注册日期" prop="createTime" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="260">
					<template slot-scope="scope">
						<!-- 充值 -->
						<addCash :row_data="scope.row" @getLists="getLists" />
						<el-button type="primary" @click='open(scope.row)' size="mini"
							v-if="btnAuthen.permsVerifAuthention(':user:wxuserList:oneEdit')">编辑
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
			<!-- 编辑用户 -->
			<el-dialog :visible.sync="dialogTableVisible" title="编辑用户" @close="dialogTableVisible=false"
				:append-to-body="true">
				<el-form ref="editData" label-position="left" label-width="70px"
					style="width: 400px; margin-left:50px;">
					<el-form-item :label="'昵称'" prop="userName">
						<el-input v-model="editData.userName" disabled />
					</el-form-item>
					<el-form-item :label="'微信ID'" prop="wxOpenId">
						<el-input v-model="editData.wxOpenId" disabled />
					</el-form-item>
					<el-form-item :label="'状态'" prop="status">
						<el-select v-model="editData.status" class="filter-item" placeholder="请选择" clearable
							style="width: 100%">
							<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm('editData')">修改</el-button>
						<el-button @click="dialogTableVisible=false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>
	</div>
</template>

<script>
	import {
		wxgetList,
		deleteUser,
		batchDeleteAppUser,
		updateAppUserer,
		wxgetListNew,
		updateCash
	} from '@/api/user/userList.js'
	import {
		parseTime
	} from '@/utils/index'
	import addCash from './components/addCash.vue'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		components: {
			addCash,
			imgView
		},
		name: 'wxuserList',
		data() {
			return {
				tableKey: 0,
				page: 1,
				limit: 10,
				total: 10,
				list: [],
				value1: '',
				value2: '',
				disabled: true,
				sels: [],
				listQuery: {
					userName: '',
					status: '',
					createTimeStart: '',
					createTimeEnd: '',
					userPlatform: 1,
					phoneNumber: '',
					userCode: '',
					page: 1,
					limit: 10
				},
				tags: [{
					title: '正常',
					id: 0,
				}, {
					title: '禁用',
					id: 1,
				}],
				numberType: [{
					title: '手机号查询',
					id: 1,
				}, {
					title: '用户ID查询',
					id: 2,
				}],
				dialogTableVisible: false,
				editData: {
					status: ''
				},
				ids: '',
				time: ''
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
			//删除单个
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let appUserId = id
					let data = {
						appUserId
					}
					console.log(data)
					deleteUser(data).then(res => {
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
			//显示编辑弹窗
			open(row) {
				let editData = {}
				editData.userName = row.userName
				editData.wxOpenId = row.wxOpenId
				editData.status = row.status
				editData.id = row.id
				this.editData = editData
				console.log(this.editData)
				this.dialogTableVisible = true
			},
			//编辑提交表单
			submitForm(formName) {
				console.log(this.editData)
				let userData = {
					status: this.editData.status,
					id: this.editData.id
				}
				updateAppUserer(userData).then(res => {
					if (res.code == 200) {
						this.dialogTableVisible = false
						this.$message.success(res.msg)
						this.getLists()
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
			dateChange(e) {
				if (e) {
					this.listQuery.createTimeStart = e[0]
					this.listQuery.createTimeEnd = e[1]
				} else {
					this.listQuery.createTimeStart = ''
					this.listQuery.createTimeEnd = ''
				}
				this.handleFilter()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
			},
			getLists() {
				this.listLoading = true
				let listQuery = JSON.parse(JSON.stringify(this.listQuery))
				if (listQuery.createTimeStart == null) {
					listQuery.createTimeStart = ''
				}
				if (listQuery.createTimeEnd == null) {
					listQuery.createTimeEnd = ''
				}
				wxgetListNew(listQuery).then(res => {
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
		},
		created() {
			this.getLists()
			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">

</style>
