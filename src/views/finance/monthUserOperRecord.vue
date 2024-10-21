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
        <el-table-column label="月卡编号" prop="code" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="购买月数" prop="days" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="购买金额" prop="money" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="月卡类型" prop="monthCardType" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.monthCardType == 0">仅充电</span>
          	<span type="success" v-if="scope.row.monthCardType == 1">仅停车</span>
          	<span type="success" v-if="scope.row.monthCardType == 2">停车+充电</span>
          </template>
        </el-table-column>
        <el-table-column label="包月规则" prop="chargingMonthType" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span v-if="scope.row.chargingMonthType == 1">限次数包月</span>
          	<span v-if="scope.row.chargingMonthType == 2">限总时长包月</span>
          </template>
        </el-table-column>
        <el-table-column prop="renewType" label="续费规则" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span type="success" v-if="scope.row.renewType == 0">常规续费</span>
          	<span type="success" v-if="scope.row.renewType == 1">从过期时间开始续费</span>
          </template>
        </el-table-column>
        <el-table-column label="单月限制" prop="monthTotalStr" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="单日限制" prop="dayTotalStr" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="isVirtualCard" label="是否虚拟卡" align="center" :show-overflow-tooltip="isPc">
          <template slot-scope="scope">
          	<span v-if="scope.row.isVirtualCard == 0">否</span>
          	<span v-if="scope.row.isVirtualCard == 1">是</span>
          </template>
        </el-table-column>
				<el-table-column prop="startTime" label="起至日期" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.startTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="endTime" label="截至日期" align="center" sortable :show-overflow-tooltip="isPc">
        	<template slot-scope="scope">
        		<span>{{ scope.row.endTime | formatDate }}</span>
        	</template>
        </el-table-column>
				<el-table-column label="操作" align="center" width="320" fixed="right">
					<template slot-scope="scope">
            <div style="display: flex;justify-content: center;align-items: center;">
              <el-button type="primary" @click='onHistory(scope.row)' size="mini">
                月卡操作记录
              </el-button>
              <el-button type="primary" @click='onHistory(scope.row)' style="margin-left: 10px;" size="mini">
                月卡续费
              </el-button>
              <el-button type="danger" @click='onHistory(scope.row)' style="margin-left: 10px;" size="mini">
                月卡注销
              </el-button>
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
            let list = res.data || []
            list.forEach((item, index) => {
              let unit = ''
              if(item.chargingMonthType === 1){
                unit = '次';
              } else {
                unit = '分钟'
              }
            	let monthTotalStr = item.monthTotal === undefined ? 0 + unit : item.monthTotal  + unit
            	let dayTotalStr = item.dayTotal === undefined ? 0 + unit : item.dayTotal + unit
            	item.monthTotalStr = monthTotalStr;
            	item.dayTotalStr = dayTotalStr;
            })
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
