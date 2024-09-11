<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.userName" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户昵称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.phoneNumber" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.userCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="注册开始日期" end-placeholder="注册结束日期" @change="dateChange"
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
				<el-table-column label="ID" prop="userCode" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="昵称" prop="userName" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="头像" prop="headImg" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope" style="text-align: center;">
						<imgView :imgSrc="scope.row.headImg" />
					</template>
				</el-table-column>
				<el-table-column label="手机号" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
        <el-table-column label="购买天数" prop="days" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="包月类型" prop="monthCardType" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <!-- <el-table-column label="包月规则" prop="monthCardRuleConfig" align="center" :show-overflow-tooltip="isPc">
        </el-table-column> -->
				<el-table-column prop="startTime" label="生效日期" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.startTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="endTime" label="失效日期" align="center" sortable :show-overflow-tooltip="isPc">
        	<template slot-scope="scope">
        		<span>{{ scope.row.endTime | formatDate }}</span>
        	</template>
        </el-table-column>
				<el-table-column label="操作" align="center" width="260">
					<template slot-scope="scope">
						<el-button type="primary" @click='onHistory(scope.row)' size="mini">
              购买记录
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
    getList
	} from '@/api/user/monthCardUser.js'
	import {
		parseTime
	} from '@/utils/index'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		components: {
			imgView
		},
		name: 'monthCardUser',
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
      onHistory(row){
        console.log("查询用户：",row)
        const userCode = row.userCode || 0;
        this.$router.push({
        	name: 'rechargeRecord',
        	query: {
        		userId: userCode,
            type: '3'
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
		},
		created() {
			this.getLists()
			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style scoped="scoped">

</style>
