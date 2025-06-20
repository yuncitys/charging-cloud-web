<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.wxName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入所属小程序" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<!-- 新增方案 type:0 (IC卡)   1(余额)-->
      <addPage :recharge_type="recharge_type" @getLists="getLists"/>
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" row-key="id"
				:tree-props="{children: 'children', hasChildren: 'hasChildren'}" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="operatorName" label="运营商户" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="rechargeAmount" label="充值金额" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="giftAmount" label="赠送金额" align="center" :show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<!--编辑方案 type:0 (IC卡)   1(余额)-->
						<editPage :recharge_type="recharge_type" @getLists="getLists" :row_data="scope.row"/>

						<el-button type="danger" @click="del(scope.row.id)" style="margin-left: 10px;" size="mini"
							icon="el-icon-delete" v-if="btnAuthen.permsVerifAuthention(':sys:recharge:deleteRecharge')">
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
		addRecharge,
		deleteRecharge,
		updateRecharge
	} from '@/api/netWorkDot/charge/recharge.js'
	import {
		parseTime
	} from '@/utils/index'
	import qs from 'qs'
	import addPage from './components/addPage.vue'
	import editPage from './components/editPage.vue'
	export default {
		name: 'balanceList',
		components:{
			addPage,
			editPage
		},
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					type:1,
					page: 1,
					limit: 10,
					operatorName:''
				},
				tableKey: 0,
				// 充值类型 0:IC卡 1：余额
				recharge_type:1,
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
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						rechargeId:id
					}
					console.log(data)
					deleteRecharge(data).then(res => {
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getLists()
			this.isPc=!this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">
	.flex {
		display: flex;
	}
</style>
