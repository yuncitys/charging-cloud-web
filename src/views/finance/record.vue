<template>
	<div class="app-container">
		<div class="filter-container">
			<div class="flex total">
				<div class="totalAmount">总收益金额:<span>{{totalAmount}}</span></div>
				<div class="balanceAmount">余额:<span>{{balanceAmount}}</span></div>
			</div>
			<el-input v-model="listQuery.withdrawCode" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入流水号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择提现状态" clearable @change="handleFilter" @clear="handleFilter()">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="showDialog=true">
        提现
			</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fit
				highlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
        <el-table-column prop="wxName" label="小程序名称" align="center" :show-overflow-tooltip="isPc">
        </el-table-column>
        <el-table-column label="商户流水号" prop="withdrawCode" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column label="打款账号" prop="openId" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="申请用户" prop="withdrawUser"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column label="申请金额" prop="money"  align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column label="付款金额" prop="actualAmount"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="打款用户" prop="payUser"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="打款费率(%)" prop="withdrawRate"  align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
				<el-table-column prop="status" label="状态" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span type="success" v-if="scope.row.status === 'APPLYING'">申请打款中</span>
						<span type="success" v-if="scope.row.status === 'WAIT_PAY'">待付款确认</span>
						<span type="success" v-if="scope.row.status === 'ACCEPTED'">申请已受理</span>
						<span type="success" v-if="scope.row.status === 'PROCESSING'">打款中</span>
            <span type="success" v-if="scope.row.status === 'FINISHED'">打款完成</span>
            <span type="success" v-if="scope.row.status === 'CLOSED'">打款关闭</span>
            <span type="success" v-if="scope.row.status === 'REJECT'">打款驳回</span>
					</template>
				</el-table-column>
				<el-table-column prop="payType" label="打款方式" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span type="success" v-if="scope.row.payType == 1">付款到微信零钱</span>
						<span type="success" v-if="scope.row.payType == 2">线下付款</span>
            <span type="success"  v-if="scope.row.payType == 3">付款到银行卡</span>
					</template>
				</el-table-column>
				<el-table-column prop="payTime" label="打款时间" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.payTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="remarks" label="付款备注" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
        <el-table-column prop="failReason" label="驳回原因" align="center" :show-overflow-tooltip='isPc'>
        </el-table-column>
        <el-table-column label="申请时间" prop="createTime"  align="center" :show-overflow-tooltip='isPc' sortable>
        	<template slot-scope="scope">
        		<span>{{ scope.row.createTime | formatDate }}</span>
        	</template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime"  align="center" :show-overflow-tooltip='isPc' sortable>
        	<template slot-scope="scope">
        		<span>{{ scope.row.updateTime | formatDate }}</span>
        	</template>
        </el-table-column>
				<el-table-column label="操作" align="center" width="200">
					<template slot-scope="scope">
						<el-button type="primary" style="margin-left: 10px;" size="mini"
							v-if="scope.row.status === 'APPLYING' && btnAuthen.permsVerifAuthention(':finance:record:addMoney')"
							@click='openPayWindow(scope.row)'>打款
						</el-button>
						<el-button type="primary" style="margin-left: 10px;" size="mini"
							v-if="scope.row.status === 'APPLYING' && btnAuthen.permsVerifAuthention(':finance:record:reject')"
							@click='openRejectWindow(scope.row)'>驳回
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
				<el-form ref="withdrawData" :model="withdrawData" label-position="left" label-width="100px"
					style="width: 600px; margin-left:50px;" :rules="Rules">
					<el-form-item :label="'金额'" prop="money">
						<el-input v-model="withdrawData.money" placeholder="请输入金额" clearable type="number" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="btnBClick('withdrawData')">确定</el-button>
						<el-button @click="showDialog = false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>

      <el-dialog :visible.sync="showDialog1" title="驳回" @close="showDialog1 = false" v-if="showDialog1"
      	:append-to-body="true">
      	<el-form ref="rejectData" :model="rejectData" label-position="left" label-width="100px"
      		style="width: 600px; margin-left:50px;" :rules="rejectRules">
          <el-form-item :label="'提现单号'" prop="withdrawCode">
          	<el-input v-model="rejectData.withdrawCode" type="text" disabled/>
          </el-form-item>
      		<el-form-item :label="'驳回原因'" prop="failReason">
      			<el-input v-model="rejectData.failReason" placeholder="请输入驳回原因" clearable type="textarea" />
      		</el-form-item>
      		<el-form-item>
      			<el-button type="primary" @click="rejectClick('rejectData')">确定</el-button>
      			<el-button @click="showDialog1 = false">取消</el-button>
      		</el-form-item>
      	</el-form>
      </el-dialog>

      <el-dialog :visible.sync="showDialog2" title="打款" @close="showDialog2 = false" v-if="showDialog2"
      	:append-to-body="true">
      	<el-form ref="payData" :model="payData" label-position="left" label-width="100px"
      		style="width: 600px; margin-left:50px;" :rules="payRules">
          <el-form-item :label="'提现单号'" prop="withdrawCode">
          	<el-input v-model="payData.withdrawCode" type="text" disabled/>
          </el-form-item>
          <el-form-item :label="'付款方式'" prop="payType">
          	<el-radio-group v-model="payData.payType">
          		<el-radio :label="1">付款到微信零钱</el-radio>
          		<el-radio :label="2">线下付款</el-radio>
              <el-radio :label="3">付款到银行卡</el-radio>
          	</el-radio-group>
          </el-form-item>
      		<el-form-item :label="'付款备注'" prop="remarks">
      			<el-input v-model="payData.remarks" placeholder="请输入打款备注" clearable type="textarea" />
      		</el-form-item>
      		<el-form-item>
      			<el-button type="primary" @click="payClick('payData')">确定</el-button>
      			<el-button @click="showDialog2 = false">取消</el-button>
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
				withdrawData: {
					money: ''
				},
        rejectData: {
        	withdrawCode: '',
          failReason: ''
        },
        payData: {
        	withdrawCode: '',
          payType: 1,
          remarks:''
        },
				showDialog: false,
        showDialog1: false,
        showDialog2: false,
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
				},
				tableKey: 0,
				tags: [{
					title: '申请中',
					id: 'APPLYING',
				}, {
					title: '待付款确认',
					id: 'WAIT_PAY',
				}, {
					title: '申请已受理',
					id: 'ACCEPTED',
				}, {
					title: '打款中',
					id: 'PROCESSING',
				}, {
					title: '打款完成',
					id: 'FINISHED',
				}, {
					title: '打款关闭',
					id: 'CLOSED',
				}, {
					title: '打款驳回',
					id: 'REJECT',
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
        payRules: {
        	payType: [{
        		required: true,
        		message: '请选择付款方式',
        		trigger: 'change'
        	}],
          withdrawCode: [{
          	required: true,
          	message: '请输入付款单号',
          	trigger: 'change'
          }],
          remarks: [{
          	required: true,
          	message: '请输入付款备注',
          	trigger: 'change'
          }],
        },
        rejectRules: {
            withdrawCode: [{
            	required: true,
            	message: '请输入付款单号',
            	trigger: 'change'
            }],
            failReason: [{
            	required: true,
            	message: '请输入拒绝原因',
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
      payClick() {
      	this.$common.throttle(this.WithdrawCash(), 2000)
      },
      openPayWindow(row){
        this.showDialog2 = true,
        this.payData.withdrawCode = row.withdrawCode
      },
			WithdrawCash(row) {
				this.$confirm('是否确认打款?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					console.log("付款请求参数：",this.payData)
					updateWithdrawCashStatus(this.payData).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
              this.showDialog2 = false
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					})
				})
			},
      rejectClick() {
      	this.$common.throttle(this.AdminUserCash(), 2000)
      },
      openRejectWindow(row){
        this.showDialog1 = true,
        this.rejectData.withdrawCode = row.withdrawCode
      },
			AdminUserCash() {
				this.$confirm('是否确认驳回?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					console.log("驳回操作请求参数：",this.rejectData)
					updateAdminUserCash(this.rejectData).then(res => {
						if (res.code == 200) {
							this.$message({
								type: 'success',
								message: res.msg
							})
              this.showDialog1 = false
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
				this.$common.throttle(this.onWithdraw, 2000)
			},
			onWithdraw() {
				this.$refs['withdrawData'].validate(valid => {
					if (valid) {
						console.log(this.withdrawData)
						let {
							balanceAmount
						} = this
						let money = this.withdrawData.money
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
						gotoWithdrawCash(this.withdrawData).then(res => {
							if (res.code == 200) {
								this.showDialog = false
								this.resetForm('withdrawData')
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
