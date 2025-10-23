<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.organizationName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入商户名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.administratorName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入管理员名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.administratorPhone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入联系方式" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.companyName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入公司名称名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.socialCreditCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入社会统一信用代码" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>
			<!-- 新增互联商户 -->
			<div style="margin: 15px 0;">
				<el-button type="primary" @click="addOrUpdateHandle()" v-if="btnAuthen.permsVerifAuthention(':interconnection:merchant:add')">添加</el-button>
			</div>
			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="name" label="商户名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="companyName" label="公司名称" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="socialCreditCode" label="社会信用代码" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="manageName" label="机构管理员" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="contactInfo" label="联系方式" align="center" :show-overflow-tooltip="isPc">
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
				<el-table-column label="操作" align="center" width="230">
					<template slot-scope="scope">
						<div style="display: flex;justify-content: center;align-items: center;">
							<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,false)"
							v-if="btnAuthen.permsVerifAuthention(':interconnection:merchant:edit')">编辑</el-button>
							<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,true)">详情</el-button>
							<el-button type="danger" size = "mini" @click="handleDelete(scope.row.id)"
							v-if="btnAuthen.permsVerifAuthention(':interconnection:merchant:delete')">删除</el-button>
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
		<merchantDialog ref="merchantForm" @getMerchantList="getMerchantList" />
	</div>
</template>

<script>
	import {
		getMerchantList,
		deleteMerchant
	} from '@/api/interconnection/merchant.js'
	import {
		parseTime
	} from '@/utils/index'
	import merchantDialog from './components/merchantDialog.vue';
	export default {
		name: 'operator',
		components: {
			merchantDialog
		},
		data() {
			return {
				listLoading: true,
				formVisible: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					operatorType: 2,
					organizationName: '',
					companyName: '',
					administratorName: '',
					administratorPhone: '',
					socialCreditCode: '',
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
			getMerchantList() {
				this.listLoading = true
				getMerchantList(this.listQuery).then(res => {
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
			handleDelete(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					deleteMerchant(id).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.getMerchantList()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getMerchantList()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getMerchantList()
			},
			handleFilter() {
				this.listQuery.page = 1
				this.getMerchantList()
			},
			addOrUpdateHandle(row,isDetail) {
				this.formVisible = true
				this.$nextTick(() => {
					this.$refs.merchantForm.openDialog(row,isDetail)
				})
      		},
			refresh(isrRefresh) {
				this.formVisible = false
				if (isrRefresh) this.reset()
			},
			reset() {
				this.handleFilter()
			},
		},
		created() {
			this.getMerchantList()
		},
	}
</script>