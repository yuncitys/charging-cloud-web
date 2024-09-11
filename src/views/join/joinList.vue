<template>
	<div class="app-container">
		<div class="filter-container">
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="userName" label="姓名" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="phoneNumber" label="手机号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="city" label="地址" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="时间" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<!-- <el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						
					</template>
				</el-table-column> -->
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,100,500, 1000]"
					:page-size="listQuery.limit" :total="total" background
					layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
					@current-change="handleCurrentChange" />
			</div>

		</div>
	</div>
</template>

<script>
	import {
		getList,
	} from '@/api/join/joinList.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'joinList',
		components: {

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
			handleFilter() {
				this.listQuery.page = 1
				this.getLists()
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getLists()

			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style>

</style>
