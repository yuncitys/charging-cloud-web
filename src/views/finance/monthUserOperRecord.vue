<template>
	<div class="app-container">
		<div class="filter-container">
      <el-input v-model="listQuery.monthCardCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
      	placeholder="请输入月卡编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
      <el-input v-model="listQuery.payCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
        	placeholder="请输入支付单号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.userName" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户昵称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.phoneNumber" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.userCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
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
				<el-table-column label="购买用户" prop="userName" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="手机号" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
        <el-table-column label="月卡编号" prop="monthCardCode" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="支付单号" prop="payCode" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="购买月数" prop="months" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="购买金额" prop="money" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="renewType" label="续费规则" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.renewType == 0">常规续费</span>
          	<span type="success" v-if="scope.row.renewType == 1">从过期时间开始续费</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationWay" label="操作路径" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.operationWay == 0">用户自助</span>
          	<span type="success" v-if="scope.row.operationWay == 1">管理平台</span>
          </template>
        </el-table-column>
        <el-table-column label="续费前有效期" prop="renewBeforeTime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="续费后有效期" prop="renewAfterTime" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="备注" prop="remark" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column prop="startTime" label="创建时间" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="endTime" label="更新时间" align="center" sortable :show-overflow-tooltip="isPc">
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
        	</template>
        </el-table-column>
				<!-- <el-table-column label="操作" align="center" width="320" fixed="right">
					<template slot-scope="scope">
            <div style="display: flex;justify-content: center;align-items: center;">

            </div>
					</template>
				</el-table-column> -->
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
    getList
	} from '@/api/monthCard/monthCardOperationLogList.js'
	import {
		parseTime
	} from '@/utils/index'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		components: {
			imgView
		},
		name: 'monthCardOperLog',
		data() {
			return {
				tableKey: 0,
				page: 1,
				limit: 10,
				total: 10,
				list: [],
				listQuery: {
          userCode: '',
					userName: '',
          phoneNumber: '',
          payCode: '',
          monthCardCode: '',
					createTimeStart: '',
					createTimeEnd: '',
					page: 1,
					limit: 10
				},
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
				getList(listQuery).then(res => {
          if (res.code == 200) {
          	console.log(res)
            let list = res.data || []
          	this.list = list
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
