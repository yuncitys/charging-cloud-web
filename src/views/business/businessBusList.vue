<template>
	<div id="page">
		<el-form label-position="left" label-width="80px" :inline="true">
			<el-form-item :label="''">
				<el-select v-model="listQuery.dealerId" class="filter-item" placeholder="请选择代理商" clearable
					@change="handleFilter">
					<el-option v-for="item in tags" :key="item.id" :label="item.adminNameResult" :value="item.id" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
					icon="el-icon-search">查询</el-button>
			</el-form-item>
		</el-form>

		<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
			highlight-current-row style="width: 100%;" align="center" id="tableBox">
			<el-table-column type="index" width="55" label="序号" align="center">
				<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
			</el-table-column>
			<el-table-column prop="adminName" label="代理商名称" align="center" sortable :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="totalAmount" label="实际支付金额" align="center" sortable :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="parentName" label="上级名称" align="center" sortable :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="deviceCount" label="设备总数" align="center" :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="roleName" label="角色名称" align="center" :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="orderCount" label="订单总数" align="center" sortable :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="balanceAmount" label="未提现金额" align="center" sortable :show-overflow-tooltip="true">
			</el-table-column>
			<el-table-column prop="scanQRCount" label="扫码收入" align="center" :show-overflow-tooltip="true">
			</el-table-column>
		</el-table>
		<div class="pagination-container">
			<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
				:total="total" background layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>
	</div>
</template>

<script>
	import {
		getList,
		findDealerList
	} from '@/api/business/businessStatistics.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'businessBusList',
		data() {
			return {
				listLoading: false,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					dealerId: "",
					deviceCode: ""
				},
				tableKey: 0,
				tags: [],
				pickerOptions: {
					shortcuts: [{
						text: '最近一周',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近一个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
							picker.$emit('pick', [start, end]);
						}
					}, {
						text: '最近三个月',
						onClick(picker) {
							const end = new Date();
							const start = new Date();
							start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
							picker.$emit('pick', [start, end]);
						}
					}]
				},
				value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
				value2: ''
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
			getfindDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						// adminNameResult
						let tags = res.data || []
						if (tags.length != 0) {
							tags.forEach((item, index) => {
								item.adminNameResult = item.adminName + '(' + item.adminFullname + ')'
							})
						}
						this.tags = tags
					}
				})
			},
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						this.list = res.data.adminInfoByDeviceAndOrder
						console.log(res.adminInfoByDeviceAndOrder)
						// let number =res.data.adminInfoByDeviceAndOrder.length
						this.total = res.data.adminInfoByDeviceAndOrderByCount;
						console.log("this.total", this.total)
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
		},
		created() {
			this.getLists()
			this.getfindDealerList()
		},
	}
</script>

<style scoped="scoped">
	#page {
		margin-top: 30px;
		margin-left: 20px;
	}
</style>
