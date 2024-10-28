<template>
	<div class="app-container">
		<div class="filter-container">
			<div class="flex total">
				<div class="totalAmount">总收益金额:<span>{{totalAmount}}</span></div>
				<div class="balanceAmount">余额:<span>{{balanceAmount}}</span></div>
			</div>
			<el-input v-model="listQuery.withdrawCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入流水号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<!-- <el-input v-model="listQuery.adminId" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable/> -->
			<!-- <el-input v-model="listQuery.phone" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" /> -->
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择提现状态" clearable @change="handleFilter" @clear="handleFilter()">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="showDialog=true">提现
			</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column prop="wxName" label="小程序名称" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <!-- <el-table-column prop="wxAppId" label="小程序appid" align="center" :show-overflow-tooltip="isPc">
        </el-table-column> -->
				<el-table-column label="提现账号" prop="adminFullname" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="手机号" prop="adminPhone" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="流水号" prop="withdrawCode" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="申请金额" prop="money"  align="center" :show-overflow-tooltip='isPc' sortable>
				</el-table-column>
				<el-table-column label="申请时间" prop="createTime"  align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="info" v-if="scope.row.status == 0">提现中</el-tag>
						<el-tag type="success" v-if="scope.row.status == 1">提现成功</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 2">已撤回</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 3">退回</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="payType" label="付款方式" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<el-tag type="info" v-if="scope.row.payType == 1">微信零钱</el-tag>
						<el-tag type="info" v-if="scope.row.payType == 2">线下提现</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="payTime" label="付款时间" align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.payTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="remarks" label="备注" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<el-button type="primary" style="margin-left: 10px;" size="mini"
							v-if="scope.row.status == 0 && btnAuthen.permsVerifAuthention(':finance:record:addMoney')"
							@click='WithdrawCash(scope.row)'>打款
						</el-button>
						<el-button type="primary" style="margin-left: 10px;" size="mini"
							v-if="scope.row.status == 0 && btnAuthen.permsVerifAuthention(':finance:record:reject')"
							@click='AdminUserCash(scope.row)'>驳回
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>


			<el-dialog :visible.sync="showDialog" title="提现" @close="showDialog = false" v-if="showDialog"
				:append-to-body="true">
				<el-form ref="addAdData" :model="addAdData" label-position="left" label-width="100px"
					style="width: 600px; margin-left:50px;" :rules="Rules">
					<el-form-item :label="'金额'" prop="money">
						<el-input v-model="addAdData.money" placeholder="请输入金额" clearable type="number" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="btnBClick('addAdData')">确定</el-button>
						<el-button @click="showDialog = false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

		</div>
	</div>
</template>

<script>
	import {
		getList,
		updateWithdrawCashStatus,
		updateAdminUserCash,
		gotoWithdrawCash
	} from '@/api/finance/record.js'
	import {
		parseTime
	} from '@/utils/index'
	import {
		getRouter
	} from '@/api/user'
	export default {
		name: 'record',
		components: {},
		data() {
			return {
				addAdData: {
					money: ''
				},
				showDialog: false,
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
				listQuery: {
					page: 1,
					limit: 10,
					status: '',
					withdrawCode: '',
					// adminId:'',
					phone: ''
				},
				tableKey: 0,
				tags: [{
					title: '提现中',
					id: 0,
				}, {
					title: '提现成功',
					id: 1,
				}, {
					title: '撤回 ',
					id: 2,
				}, {
					title: '退回 ',
					id: 3,
				}],
				totalAmount: 0,
				balanceAmount: 0,
				Rules: {
					money: [{
						required: true,
						message: '请输入提现金额',
						trigger: 'change'
					}],
				},
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
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			WithdrawCash(row) {
				this.$confirm('是否确认打款?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						withdrawCode: row.withdrawCode,
						withdrawAdminId: row.withdrawAdminId,
						money: row.money
					}
					console.log(data)
					updateWithdrawCashStatus(data).then(res => {
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
			AdminUserCash(row) {
				this.$confirm('是否确认驳回?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						withdrawCode: row.withdrawCode,
						adminPhone: row.adminPhone
					}
					console.log(data)
					updateAdminUserCash(data).then(res => {
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
			getAdminInfo() {
				getRouter().then(res => {
					if (res.code == 200) {
						let adminUser = res.data.adminUser
						this.balanceAmount = adminUser.balanceAmount
						this.totalAmount = adminUser.totalAmount
						this.$forceUpdate()
						console.log(this.balanceAmount, this.totalAmount)
					}
				})
			},
			btnBClick() {
				this.$common.throttle(this.onaddAdData, 2000)
			},
			onaddAdData() {
				this.$refs['addAdData'].validate(valid => {
					if (valid) {
						console.log(this.addAdData)
						let {
							balanceAmount
						} = this
						let money = this.addAdData.money
						// if (money % 1 !== 0) {
						// 	this.$message.error('请输入整数')
						// 	return false
						// }
            if (money <= 0) {
            	this.$message.error('提现金额不能小于0')
            	return false
            }
						if (parseInt(money) > parseInt(balanceAmount)) {
							this.$message.error('余额不足')
							return false
						}
						gotoWithdrawCash(this.addAdData).then(res => {
							if (res.code == 200) {
								this.showDialog = false
								this.resetForm('addAdData')
								this.$message.success(res.msg)
								this.getLists()
							} else {
								this.$message.error(res.msg)
							}
						})
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {
			this.getLists()
			this.getAdminInfo()
			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style>
	.flex {
		display: flex;
	}

	.total {
		margin-bottom: 30px;
	}

	.totalAmount,
	.balanceAmount {
		font-size: 30px;
		color: #333333;
	}

	.totalAmount span,
	.balanceAmount span {
		color: red;
	}

	.balanceAmount {
		margin-left: 60px;
	}
</style>
