<template>
	<div class="app-container">
		<div class="filter-container">
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">
        查询
      </el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="taskName" label="下载任务" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column prop="percentage" label="下载进度" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
            <el-progress :text-inside="true" :stroke-width="20" :percentage="scope.row.percentage" status="success"></el-progress>
          </template>
        </el-table-column>
				<el-table-column prop="fileSize" label="文件大小" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
          	<span>{{ (scope.row.fileSize / 1000) || 0}} KB</span>
          </template>
				</el-table-column>
        <el-table-column prop="useTime" label="耗时" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
          	<span>{{ scope.row.useTime}} s</span>
          </template>
        </el-table-column>
        <el-table-column prop="creatTime" label="创建时间" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
          	<span>{{ scope.row.creatTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
          	<span>{{ scope.row.endTime | formatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="adminName" label="创建人" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>

				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
            <el-button
              type="primary" size='mini'
              @click="handleDownload(scope.row.taskName,scope.row.result)"
              v-if="btnAuthen.permsVerifAuthention(':monitor:task:download') && scope.row.status === 1">下载</el-button>
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
		getList
	} from '@/api/task/task.js'
	import {
		parseTime
	} from '@/utils/index'
	export default {
		name: 'task',
		data() {
			return {
				listLoading: true,
				page: 1,
				limit: 10,
				total: 10,
        list: [],
        tags: [{
        	title: '下载中',
        	id: 0,
        }, {
        	title: '已完成',
        	id: 1,
        }],
				listQuery: {
					page: 1,
					limit: 10,
          status:'',
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
			getList() {
				this.listLoading = true
        let listQuery = this.listQuery
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
      handleDownload(fileName,fileUrl){
        if (!fileUrl) {
          return;
        }
        let a = document.createElement('a')
        a.href = this.Global.APIURl + fileUrl
        a.click();
      },
      handleFilter() {
      	this.listQuery.page = 1
      	this.getList()
      },
			handleSizeChange(val) {
				this.listQuery.limit = val
				this.getList()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getList()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getList()
			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style>

</style>
