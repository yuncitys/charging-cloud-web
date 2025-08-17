<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.deviceCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入设备号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>
			<!-- 导出Excel -->
			<downExcel :queryData="listQuery" />

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="deviceCode" label="设备编号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="connectorCode" label="终端编号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkName" label="充电站点" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkAddress" label="详细地址" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="alarmCode" label="日志编号" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="alarmItem" label="日志事件" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="reason" label="故障原因" align="center" :show-overflow-tooltip='isPc'>
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
	} from '@/api/upDownRecord/upDownRecordList.js'
	import {
		parseTime
	} from '@/utils/index'
	import downExcel from './components/downExcel.vue'
	export default {
		name: 'upDownRecordList1',
		components: {
			downExcel
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
					deviceCode: '',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tableKey: 0,
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
		mounted() {

		},
		methods: {
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
				getList(listQuery).then(res => {
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
			this.listQuery.deviceCode = this.$route.query.deviceCode || ''
			this.getLists()

			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style>

</style>
