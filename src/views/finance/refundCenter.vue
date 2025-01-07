<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.userCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.phone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.payCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入付款编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.type" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择交易类型" clearable @change="handleFilter">
        <el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>

			<div style="margin: 15px 0;">
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
					icon="el-icon-search">查询</el-button>
				<downExcel :queryData="listQuery" />
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column label="小程序名称" prop="wxName" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
				<el-table-column label="付款编号" prop="payCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="用户ID" prop="userCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="用户昵称" prop="userName" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="用户电话" prop="phoneNumber" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column prop="payMoney" label="付款金额" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="refundMoney" label="已退金额" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="payType" label="充值类型" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span v-if="scope.row.payType == 0">充电缴费</span>
						<span v-if="scope.row.payType == 1">充值余额</span>
						<span v-if="scope.row.payType == 2">充值IC卡</span>
            <span v-if="scope.row.payType == 3">充值月卡</span>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="支付时间" align="center" sortable :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
        <el-table-column label="操作" align="center" width="200">
        	<template slot-scope="scope">
            <!-- <el-button
              type="primary" size='mini'
              @click="handleRefund(scope.row.taskName,scope.row.result)"
              v-if="btnAuthen.permsVerifAuthention(':monitor:task:download')">退款</el-button> -->
            <!-- 交易退款 -->
            <refund-page :row_data="scope.row" @getLists="getLists"/>
            <el-button
              type="primary" size='mini' style="margin-left: 10px;"
              @click="handleRefund(scope.row.taskName,scope.row.result)"
              v-if="btnAuthen.permsVerifAuthention(':monitor:task:download')">详情</el-button>
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
	} from '@/api/finance/refundCenter.js'
	import {
		parseTime
	} from '@/utils/index'
	import imgView from '@/components/Common/imgView.vue'
	import downExcel from './components/downExcel.vue'
  import refundPage from './components/refundPage.vue'
	export default {
		name: 'rechargeCenter',
		components: {
			imgView,
			downExcel,
      refundPage
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
					payCode: '',
					userName: '',
					userCode: '',
					phone: '',
					type: '',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tableKey: 0,
				tags: [{
						id: '0',
						title: '充电缴费'
					},
					{
						id: '1',
						title: '充值余额'
					},
					{
						id: '2',
						title: '充值IC卡'
					},
          {
          	id: '3',
          	title: '充值月卡'
          }
				],
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
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      handleRefund(){

      }
		},
		created() {
			const userId = this.$route.query.userId;
			const type = this.$route.query.type;
      console.log("购买记录：",userId)
			if (userId !== undefined && userId != 0) {
			  this.listQuery.userId = userId;
			  this.listQuery.type = type;
			  this.getLists();
			} else {
			  this.getLists();
			}
		},
	}
</script>

<style>

</style>
