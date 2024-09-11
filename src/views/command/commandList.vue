<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.commandName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入指令名称" clearable @keyup.enter.native="handleFilter"/>
			<el-input v-model="listQuery.command" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入指令" clearable @keyup.enter.native="handleFilter"/>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column label="ID" prop="commandId" align="center">
				</el-table-column>
				<el-table-column label="指令名称" prop="commandName" align="center">
				</el-table-column>
				<el-table-column prop="commandDesc" label="指令说明" align="center" :show-overflow-tooltip="true">
				</el-table-column>
				</el-table-column>
				<el-table-column prop="command" label="指令标识" align="center" :show-overflow-tooltip="true">
				</el-table-column>
			<!-- 	<el-table-column prop="status" label="状态" align="center">
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.status == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 1">冻结</el-tag>
					</template>
				</el-table-column> -->
				<el-table-column prop="createTime" label="创建日期" align="center">
					<template slot-scope="scope">
					  <span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
					<!-- 	<el-button size="mini" type="primary" @click='open(scope.row)'>编辑
						</el-button>
						<el-button size="mini" type="danger" @click="del(scope.row.id)">删除
						</el-button> -->
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
	} from '@/api/command/commandList.js'
	import { parseTime } from '@/utils/index'
	export default {
		name:'commandList',
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
					commandName:'',
					command:'',
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
				dialogTableVisible: false,
				editData: {
					status:''
				},
				ids:''
			}
		},
		filters:{
			formatDate: function(time) {
			  if (!time) {
			    return ''
			  }
			  return parseTime(time)
			},
		},
		methods: {
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
			getLists() {
				this.listLoading = true
				getList(this.listQuery).then(res => {
					if (res.code == 200) {
						console.log(res)
						this.list = res.data
						this.total = res.count
						this.listLoading = false
					}else{
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
					let appUserId = id
					let data = {
						appUserId
					}
					console.log(data)
					deleteUser(data).then(res => {
						if(res.code == 200){
							this.$message({
								type: 'success',
								message: res.msg
							})
							this.getLists()
						}else{
							this.$message.error(res.msg)
						}
					})
				})

			}
		},
		created() {
			this.getLists()
		},

	}
</script>

<style scoped="scoped">

</style>
