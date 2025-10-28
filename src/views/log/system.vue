<template>
	<div class="app-container">
		<div class="filter-container">
			<el-select v-model="listQuery.businessType" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="业务类型" clearable @change="handleFilter">
				<el-option v-for="item in businessType" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-select v-model="listQuery.operatorType" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="操作类别" clearable @change="handleFilter">
				<el-option v-for="item in operatorType" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']">
			</el-date-picker>

			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="title" label="操作功能" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="businessType" label="业务类型" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span v-if="scope.row.businessType == 0">其它</span>
						<span v-if="scope.row.businessType == 1">新增</span>
						<span v-if="scope.row.businessType == 2">修改</span>
						<span v-if="scope.row.businessType == 3">删除</span>
						<span v-if="scope.row.businessType == 4">授权</span>
						<span v-if="scope.row.businessType == 5">导出</span>
						<span v-if="scope.row.businessType == 6">导入</span>
						<span v-if="scope.row.businessType == 7">强退</span>
						<span v-if="scope.row.businessType == 8">生成代码</span>
						<span v-if="scope.row.businessType == 9">清空数据</span>
					</template>
				</el-table-column>
				<el-table-column prop="method" label="方法名称" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="requestMethod" label="请求方式" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="operatorType" label="操作类别" align="center" :show-overflow-tooltip='isPc'>
				<template slot-scope="scope">
					<span v-if="scope.row.operatorType == 0">其它</span>
					<span v-if="scope.row.operatorType == 1">后台用户</span>
					<span v-if="scope.row.operatorType == 2">手机端用户</span>
				</template>
				</el-table-column>
				<el-table-column prop="operName" label="操作人员" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="operUrl" label="请求地址" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="operIp" label="操作IP" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="operLocation" label="操作地点" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="operParam" label="请求参数" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="jsonResult" label="返回参数" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="errorMsg" label="错误消息" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="status" label="操作状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.status == 0">成功</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 1">失败</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="operTime" label="操作时间" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.operTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">

					</template>
				</el-table-column>
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
		page
	} from '@/api/log/system.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'system',
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				businessType: [{
					title: '其它',
					id: 0,
				}, {
					title: '新增',
					id: 1,
				}, {
					title: '修改',
					id: 2,
				}, {
					title: '删除',
					id: 3,
				}, {
					title: '授权',
					id: 4,
				}, {
					title: '导出',
					id: 5,
				}, {
					title: '导入',
					id: 6,
				}, {
					title: '强退',
					id: 7,
				}, {
					title: '生成代码',
					id: 8,
				}, {
					title: '清空数据',
					id: 9,
				}],
				operatorType: [{
					title: '其它',
					id: 0,
				}, {
					title: '后台用户',
					id: 1,
				}, {
					title: '手机端用户',
					id: 2,
				}],
				listQuery: {
					page: 1,
					limit: 10,
          			status:'',
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
				page(listQuery).then(res => {
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
