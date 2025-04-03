<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.orderCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入结算单号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
      <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
        placeholder="请选择分账用户">
          <el-option
            v-for="item in dealerList"
            :key="item.id"
            :label="item.adminFullname + '(' + item.adminName + ')'"
            :value="item.id">
          </el-option>
      </el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>

			<div style="margin: 15px 0;">
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
					icon="el-icon-search">查询</el-button>
				<orderSplitDownExcel :queryData="listQuery" />
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column label="结算订单" prop="orderCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="分账订单" prop="splitOrderCode" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="收款帐号" prop="adminFullname" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column label="分账金额(元)" prop="splitAmount" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="到账金额(元)" prop="amount" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="手续费(元)" prop="serviceCharge" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="分账比例(%)" prop="splitRate" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="分账类型" prop="refundSource" align="center" :show-overflow-tooltip='isPc'>
          <template slot-scope="scope">
            <el-tag v-if="scope.row.splitType === 0">分成</el-tag>
          </template>
        </el-table-column>
				<el-table-column label="状态" prop="status" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.status == 'UNTREATED'">未处理</el-tag>
						<el-tag v-if="scope.row.status == 'RPOCESSED'">处理中</el-tag>
						<el-tag type="success"v-if="scope.row.status == 'FINISH'">已完成</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 'FAIL'">分账失败</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="billingDetails" label="分账详情" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
        <el-table-column prop="failReason" label="失败原因" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column prop="createTime" label="分账时间" align="center" sortable :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column prop="updateTime" label="更新时间" align="center" sortable :show-overflow-tooltip='isPc'>
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
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
	} from '@/api/finance/orderSplitRecord.js'
	import {
		getAgent
	} from '@/api/agent/agentList.js'
	import {
		parseTime
	} from '@/utils/index'
	import orderSplitDownExcel from './components/orderSplitDownExcel.vue'
	export default {
		name: 'orderSplitRecord',
		components: {
			orderSplitDownExcel
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
					adminId: '',
					orderCode: '',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tableKey: 0,

				tags: [{
						id: 'UNTREATED',
						title: '未处理'
					},{
						id: 'RPOCESSED',
						title: '处理中'
					},
					{
						id: 'FINISH',
						title: '已完成'
					},
					{
						id: 'FAIL',
						title: '分成失败'
					},
				],

				time: '',
        		dealerList: [],
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
				let listQuery = JSON.parse(JSON.stringify(this.listQuery))
				if (listQuery.createTimeStart == null) {
					listQuery.createTimeStart = ''
				}
				if (listQuery.createTimeEnd == null) {
					listQuery.createTimeEnd = ''
				}
				getList(listQuery).then(res => {
					if (res.code == 200) {
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
				this.getList()
			},
			handleCurrentChange(val) {
				this.listQuery.page = val
				this.getList()
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
				this.getList()
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
			findDealerList() {
				getAgent().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			this.listQuery.orderCode = this.$route.query.orderCode || ''
			this.getList()
			this.findDealerList()
		},
	}
</script>

<style>

</style>
