<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.reservedPhone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入预留手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
		   <el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
		    	placeholder="请选择故障处理状态" clearable @change="handleFilter">
		    	<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
		    </el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item" style="margin-right: 20px ;"
				start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange" format="yyyy-MM-dd"
				value-format="yyyy-MM-dd">
			</el-date-picker>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column prop="userName" label="用户名" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="headImg" label="头像" align="center">
					<template slot-scope="scope" style="text-align: center;">
						<imgView :imgSrc="scope.row.headImg"/>
					</template>
				</el-table-column>
				<el-table-column prop="reservedPhone" label="预留手机号" align="center"  :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="设备号" prop="deviceCode" align="center" sortable :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="端口号" prop="port" align="center" sortable :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="status" label="故障处理状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="danger" v-if="scope.row.status == 0">未处理</el-tag>
						<el-tag type="success" v-if="scope.row.status == 1">已处理</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="feebackContent" label="反馈内容" align="center"  :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="故障时间" align="center" sortable :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
					  <span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<el-button type="primary" style="margin-left: 10px;" size="mini" v-if="scope.row.status == 0 && btnAuthen.permsVerifAuthention(':report:reportList:confirm')" @click='update(scope.row.id)'>确认处理
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
		updateDeviceFeeBackList
	} from '@/api/report/reportList.js'
	import { parseTime } from '@/utils/index'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		name:'reportList',
		components: {
			imgView
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
          status: '',
					reservedPhone:'',
					createTimeStart:'',
					createTimeEnd:''
				},
				tableKey:0,
				tags: [{
					title: '未处理',
					id: 0,
				}, {
					title: '已处理',
					id: 1,
				}],
				time:''
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
		mounted() {
			
		},
		methods: {
			dateChange(e){
				if(e){
					this.listQuery.createTimeStart=e[0]
					this.listQuery.createTimeEnd=e[1]
				}else{
					this.listQuery.createTimeStart=''
					this.listQuery.createTimeEnd=''
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
				if(listQuery.createTimeStart == null){
					listQuery.createTimeStart=''
				}
				if(listQuery.createTimeEnd == null){
					listQuery.createTimeEnd=''
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
			update(id){
				this.$confirm('是否确认处理?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id:id
					}
					console.log(data)
					updateDeviceFeeBackList(data).then(res => {
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

<style>
	
</style>
