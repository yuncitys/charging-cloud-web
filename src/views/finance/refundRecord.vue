<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.userCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.refundCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入退款编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.payCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入支付编号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="开始日期" end-placeholder="结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd">
			</el-date-picker>

			<div style="margin: 15px 0;">
				<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
					icon="el-icon-search">查询</el-button>
			</div>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        		<el-table-column label="运营商户" prop="operatorName" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="退款编号" prop="refundCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="支付编号" prop="payCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="第三方退款编号" prop="thirdRefundCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="用户ID" prop="userCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="用户昵称" prop="userName" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<!-- <el-table-column label="用户头像" prop="headImg" align="center">
					<template slot-scope="scope" style="text-align: center;">
						<imgView :imgSrc="scope.row.headImg" />
					</template>
				</el-table-column> -->
				<el-table-column label="退款金额" prop="refundMoney" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="退款来源" prop="refundSource" align="center" :show-overflow-tooltip='isPc'>
				<template slot-scope="scope">
					<el-tag v-if="scope.row.refundSource == 'CHARGING_ORDER'">订单退款</el-tag>
					<el-tag v-if="scope.row.refundSource == 'WALLET_BALANCE'">余额退款</el-tag>
				</template>
				</el-table-column>
				<el-table-column label="退款渠道" prop="channel" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag v-if="scope.row.channel == 'ORIGINAL'">原路退回</el-tag>
						<el-tag v-if="scope.row.channel == 'BALANCE'">退回余额</el-tag>
						<el-tag v-if="scope.row.channel == 'OTHER_BALANCE'">原账户异常退到其他余额账户</el-tag>
						<el-tag v-if="scope.row.channel == 'OTHER_BANKCARD'">原银行卡异常退到其他银行卡</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="退款状态" prop="status" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
            			<el-tag type="danger" v-if="scope.row.status == 'UNTREATED'">未处理</el-tag>
						<el-tag v-if="scope.row.status == 'PROCESSING'">处理中</el-tag>
						<el-tag type="success"v-if="scope.row.status == 'SUCCESS'">退款成功</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 'ABNORMAL'">退款失败</el-tag>
            			<el-tag v-if="scope.row.status == 'CLOSED'">退款关闭</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="result" label="处理结果" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column prop="remark" label="退款说明" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="退款时间" align="center" sortable :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="成功时间" align="center" sortable :show-overflow-tooltip='isPc'>
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
	} from '@/api/finance/refundRecord.js'
	import {
		parseTime
	} from '@/utils/index'
	import imgView from '@/components/Common/imgView.vue'
	export default {
		name: 'refundRecord',
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
					payCode:'',
					refundCode:'',
					userCode: '',
					status: '',
					createTimeStart: '',
					createTimeEnd: ''
				},
				tableKey: 0,

				tags: [{
						id: 'UNTREATED',
						title: '未处理'
					},{
						id: 'PROCESSING',
						title: '处理中'
					},
					{
						id: 'SUCCESS',
						title: '退款成功'
					},
					{
						id: 'ABNORMAL',
						title: '退款失败'
					},
					{
						id: 'CLOSED',
						title: '退款关闭'
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
		},
		created() {
      const payCode = this.$route.query.payCode;
      if (payCode !== undefined && payCode != '') {
        this.listQuery.payCode = payCode;
        this.getLists();
      } else {
        this.getLists();
      }
		},
	}
</script>

<style>

</style>
