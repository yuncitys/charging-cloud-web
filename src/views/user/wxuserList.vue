<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.userName" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户昵称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.phoneNumber" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入手机号" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.userCode" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入用户ID" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-select v-model="listQuery.status" style="width: 150px;margin-right: 20px ;" class="filter-item"
				placeholder="请选择用户状态" clearable @change="handleFilter">
				<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
			</el-select>
			<el-date-picker v-model="time" type="datetimerange" range-separator="至" class="filter-item"
				style="margin-right: 20px ;" start-placeholder="注册开始日期" end-placeholder="注册结束日期" @change="dateChange"
				format="yyyy-MM-dd" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']">
			</el-date-picker>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter"
				icon="el-icon-search">查询</el-button>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......" fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<el-table-column label="用户ID" prop="userCode" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="用户帐号" prop="userAccount" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="昵称" prop="userName" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="手机号" prop="phoneNumber" align="center" :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="余额" prop="cash" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="支付金额" prop="realityPayMoney" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="赠送金额" prop="giveMoney" align="center" sortable :show-overflow-tooltip="isPc">
				</el-table-column>
				<el-table-column label="状态" prop="status" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<el-tag type="success" v-if="scope.row.status == 0">正常</el-tag>
						<el-tag type="danger" v-if="scope.row.status == 1">冻结</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="注册日期" prop="createTime" align="center" sortable :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="220">
					<template slot-scope="scope">
						<el-button size="mini" type="success" @click="openFinance(scope.row)">财务</el-button>
						<el-button type="primary" @click='open(scope.row)' size="mini"
							v-if="btnAuthen.permsVerifAuthention(':user:wxuserList:oneEdit')">
							编辑
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-container">
				<el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit"
					:total="total" background layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
			<!-- 编辑用户 -->
			<el-dialog :visible.sync="dialogTableVisible" title="编辑用户" @close="dialogTableVisible=false"
				:append-to-body="true">
				<el-form ref="editData" label-position="left" label-width="70px"
					style="width: 400px; margin-left:50px;">
					<el-form-item :label="'昵称'" prop="userName">
						<el-input v-model="editData.userName" disabled />
					</el-form-item>
					<el-form-item :label="'微信ID'" prop="wxOpenId">
						<el-input v-model="editData.wxOpenId" disabled />
					</el-form-item>
					<el-form-item :label="'状态'" prop="status">
						<el-select v-model="editData.status" class="filter-item" placeholder="请选择" clearable
							style="width: 100%">
							<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm('editData')">修改</el-button>
						<el-button @click="dialogTableVisible=false">取消</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>

		<el-drawer
			title="财务"
			:visible.sync="financeDrawerVisible"
			size="86%"
			direction="rtl"
			:wrapper-closable="false"
			append-to-body
		>
			<div class="finance-drawer-body">
				<div class="finance-cards">
					<div class="finance-card finance-card-org">
						<img :src="userImg" class="finance-card-icon" alt="" />
						<div class="finance-card-content">
							<div class="finance-card-title">{{ financeUser.userName || financeUser.userAccount || '-' }}</div>
							<div class="finance-card-sub">用户ID：{{ financeUser.userCode || '-' }}</div>
							<div class="finance-card-sub">用户账号：{{ financeUser.userAccount || '-' }}</div>
							<div class="finance-card-sub">手机号：{{ financeUser.phoneNumber || '-' }}</div>
						</div>
					</div>
					<div class="finance-card finance-card-wallet">
						<div class="finance-card-wallet-body">
							<img :src="walletImg" class="finance-card-icon" alt="" />
							<div class="finance-card-content finance-wallet-metrics">
								<div class="finance-wallet-main">
									<div class="finance-card-sub finance-wallet-label-muted">钱包总余额（元）</div>
									<div class="finance-card-money">¥ {{ walletBalance }}</div>
								</div>
								<div class="finance-wallet-split">
									<div class="finance-wallet-stat">
										<div class="finance-wallet-stat-label">实付金额</div>
										<div class="finance-wallet-stat-value">¥ {{ realityPayDisplay }}</div>
									</div>
									<div class="finance-wallet-stat">
										<div class="finance-wallet-stat-label">平台赠送</div>
										<div class="finance-wallet-stat-value finance-wallet-stat-gift">¥ {{ giveMoneyDisplay }}</div>
									</div>
								</div>
							</div>
						</div>
						<div v-if="btnAuthen.permsVerifAuthention(':user:wxuserList:updateCash')" class="finance-card-wallet-actions">
							<el-button class="finance-wallet-action-btn" type="primary" size="small" @click="openRechargeDialog">充值</el-button>
							<el-button class="finance-wallet-action-btn" type="warning" size="small" @click="openDeductDialog">扣费</el-button>
						</div>
					</div>
				</div>

				<div class="finance-section">
					<div class="finance-section-title">
						<span>资金流水</span>
					</div>

					<div class="finance-filter">
						<el-date-picker
							v-model="flowQuery.dateRange"
							type="daterange"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期"
							value-format="yyyy-MM-dd"
							class="filter-item"
							style="width: 260px;"
							clearable
						/>
						<el-input v-model="flowQuery.flowNo" class="filter-item" style="width: 190px;" placeholder="请输入流水号" clearable />
						<el-select v-model="flowQuery.flowType" class="filter-item" style="width: 190px;" placeholder="请选择流水类型" clearable>
							<el-option v-for="opt in flowTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
						</el-select>
						<el-input v-model="flowQuery.flowObject" class="filter-item" style="width: 190px;" placeholder="请输入流水对象" clearable />
						<el-button class="filter-item" type="primary" icon="el-icon-search" @click="searchFlow">确认</el-button>
						<el-button class="filter-item" plain @click="resetFlow">清空</el-button>
					</div>

					<el-table v-loading="flowLoading" :data="flowList" fit highlight-current-row>
						<el-table-column prop="flowNo" label="流水号" min-width="180" align="center" />
						<el-table-column prop="flowType" label="流水类型" min-width="120" align="center" />
						<el-table-column prop="flowObject" label="流水对象" min-width="140" align="center" />
						<el-table-column prop="flowTime" label="时间" min-width="160" align="center">
							<template slot-scope="scope">{{ scope.row.flowTime | formatDate }}</template>
						</el-table-column>
						<el-table-column prop="flowAmount" label="流水金额" min-width="120" align="center">
							<template slot-scope="scope">
								<span :class="Number(scope.row.flowAmount) < 0 ? 'money-out' : 'money-in'">{{ scope.row.flowAmount }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="operatorAccount" label="操作账号" min-width="120" align="center" />
					</el-table>

					<div class="pagination-container">
						<el-pagination
							:current-page="flowQuery.page"
							:page-size="flowQuery.limit"
							:page-sizes="[10, 20, 30, 50]"
							:total="flowTotal"
							background
							layout="total, sizes, prev, pager, next, jumper"
							@size-change="onFlowSizeChange"
							@current-change="onFlowCurrentChange"
						/>
					</div>
				</div>
			</div>
			<div class="finance-drawer-footer">
				<el-button @click="financeDrawerVisible = false">关闭</el-button>
			</div>
		</el-drawer>

		<el-dialog :visible.sync="rechargeDialogVisible" title="用户充值" append-to-body @close="onRechargeDialogClose">
			<el-form label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
				<el-form-item label="手机号">
					<el-input :value="financeUser.phoneNumber" disabled />
				</el-form-item>
				<el-form-item label="当前余额">
					<el-input :value="walletBalance" disabled />
				</el-form-item>
				<el-form-item label="充值金额">
					<el-input v-model="rechargeForm.money" placeholder="请输入充值金额" type="number" />
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="rechargeForm.remark" placeholder="请输入备注" type="textarea" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="rechargeSubmitting" @click="submitRecharge">充值</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>

		<el-dialog :visible.sync="deductDialogVisible" title="金额扣除" append-to-body @close="onDeductDialogClose">
			<el-form label-position="left" label-width="150px" style="width: 420px; margin-left:40px;">
				<el-form-item label="手机号">
					<el-input :value="financeUser.phoneNumber" disabled />
				</el-form-item>
				<el-form-item label="钱包余额">
					<el-input :value="walletBalance" disabled />
				</el-form-item>
				<el-form-item label="充值金扣除">
					<el-input v-model="deductForm.realityPayMoney" placeholder="可填 0，至少一项大于 0" type="number" />
				</el-form-item>
				<el-form-item label="赠送金扣除">
					<el-input v-model="deductForm.giveMoney" placeholder="可填 0，至少一项大于 0" type="number" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :loading="deductSubmitting" @click="submitDeduct">扣除</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		wxgetListNew,
		deleteUser,
		updateAppUserer,
		updateCash,
		updateBalance,
		getMiniAppUserFinanceWallet,
		getMiniAppUserFinanceFlowPage
	} from '@/api/user/userList.js'
	import {
		parseTime
	} from '@/utils/index'
	import userImg from '@/assets/charging-customer/user.png'
	import walletImg from '@/assets/charging-customer/wallet.png'

	export default {
		name: 'wxuserList',
		data() {
			return {
				tableKey: 0,
				page: 1,
				limit: 10,
				total: 10,
				list: [],
				listLoading: false,
				value1: '',
				value2: '',
				disabled: true,
				sels: [],
				listQuery: {
					userName: '',
					status: '',
					createTimeStart: '',
					createTimeEnd: '',
					userPlatform: 1,
					phoneNumber: '',
					userCode: '',
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
				numberType: [{
					title: '手机号查询',
					id: 1,
				}, {
					title: '用户ID查询',
					id: 2,
				}],
				dialogTableVisible: false,
				editData: {
					status: ''
				},
				ids: '',
				time: '',
				financeDrawerVisible: false,
				financeUser: {},
				walletBalance: '0.00',
				realityPayDisplay: '0.00',
				giveMoneyDisplay: '0.00',
				flowLoading: false,
				flowList: [],
				flowTotal: 0,
				flowQuery: {
					page: 1,
					limit: 10,
					dateRange: [],
					flowNo: '',
					flowType: '',
					flowObject: ''
				},
				flowTypeOptions: [
					{ label: '微信充值', value: '1' },
					{ label: '支付宝充值', value: '2' },
					{ label: '退款', value: '3' },
					{ label: '充电消费', value: '5' },
					{ label: '占桩扣款', value: '6' },
					{ label: '占桩退款', value: '7' },
					{ label: '上级分配', value: '8' },
					{ label: '上级扣款', value: '9' },
					{ label: '后台充值', value: '10' },
					{ label: '后台扣款', value: '11' }
				],
				userImg,
				walletImg,
				rechargeDialogVisible: false,
				rechargeForm: {
					money: '',
					remark: ''
				},
				rechargeSubmitting: false,
				deductDialogVisible: false,
				deductForm: {
					realityPayMoney: '',
					giveMoney: ''
				},
				deductSubmitting: false
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
			openFinance(row) {
				this.financeUser = Object.assign({}, row || {})
				this.seedWalletFromRow(row)
				this.financeDrawerVisible = true
				this.flowQuery.page = 1
				this.loadMiniAppWallet()
				this.loadMiniAppFlow()
			},
			seedWalletFromRow(row) {
				if (!row) return
				const cash = row.cash != null ? row.cash : 0
				const r = row.realityPayMoney != null ? row.realityPayMoney : 0
				const g = row.giveMoney != null ? row.giveMoney : 0
				this.walletBalance = Number(cash).toFixed(2)
				this.realityPayDisplay = Number(r).toFixed(2)
				this.giveMoneyDisplay = Number(g).toFixed(2)
			},
			loadMiniAppWallet() {
				if (!this.financeUser || !this.financeUser.id) return
				getMiniAppUserFinanceWallet(this.financeUser.id).then(res => {
					if (res.code === 200) {
						const d = res.data || {}
						const v = d.walletBalance != null ? d.walletBalance : 0
						this.walletBalance = Number(v).toFixed(2)
						const r = d.realityPayMoney != null ? d.realityPayMoney : 0
						const g = d.giveMoney != null ? d.giveMoney : 0
						this.realityPayDisplay = Number(r).toFixed(2)
						this.giveMoneyDisplay = Number(g).toFixed(2)
					} else {
						this.$message.error(res.msg || '查询钱包失败')
					}
				})
			},
			buildMiniAppFlowReq() {
				const range = this.flowQuery.dateRange || []
				const startTime = range && range.length === 2 ? `${range[0]} 00:00:00` : ''
				const endTime = range && range.length === 2 ? `${range[1]} 23:59:59` : ''
				return {
					userId: this.financeUser.id,
					page: this.flowQuery.page,
					limit: this.flowQuery.limit,
					startTime,
					endTime,
					flowNo: this.flowQuery.flowNo,
					flowType: this.flowQuery.flowType,
					flowObject: this.flowQuery.flowObject
				}
			},
			loadMiniAppFlow() {
				if (!this.financeUser || !this.financeUser.id) return
				this.flowLoading = true
				getMiniAppUserFinanceFlowPage(this.buildMiniAppFlowReq()).then(res => {
					this.flowLoading = false
					if (res.code === 200) {
						this.flowList = res.data || []
						this.flowTotal = res.count || 0
					} else {
						this.$message.error(res.msg || '查询资金流水失败')
					}
				}).catch(() => {
					this.flowLoading = false
				})
			},
			searchFlow() {
				this.flowQuery.page = 1
				this.loadMiniAppFlow()
			},
			resetFlow() {
				this.flowQuery = Object.assign({}, this.flowQuery, {
					page: 1,
					limit: 10,
					dateRange: [],
					flowNo: '',
					flowType: '',
					flowObject: ''
				})
				this.loadMiniAppFlow()
			},
			onFlowSizeChange(val) {
				this.flowQuery.limit = val
				this.flowQuery.page = 1
				this.loadMiniAppFlow()
			},
			onFlowCurrentChange(val) {
				this.flowQuery.page = val
				this.loadMiniAppFlow()
			},
			openRechargeDialog() {
				this.rechargeForm = { money: '', remark: '' }
				this.rechargeDialogVisible = true
			},
			onRechargeDialogClose() {
				this.rechargeForm = { money: '', remark: '' }
			},
			submitRecharge() {
				const reg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/
				const m = String(this.rechargeForm.money || '').trim()
				if (!reg.test(m)) {
					this.$message.error('请输入正数且最多两位小数')
					return
				}
				this.$confirm('是否确认充值?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.rechargeSubmitting = true
					updateCash({
						userId: this.financeUser.id,
						money: m,
						remark: this.rechargeForm.remark || ''
					}).then(res => {
						this.rechargeSubmitting = false
						if (res.code == 200) {
							this.$message.success(res.msg || '充值成功')
							this.rechargeDialogVisible = false
							this.loadMiniAppWallet()
							this.loadMiniAppFlow()
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					}).catch(() => {
						this.rechargeSubmitting = false
					})
				}).catch(() => {})
			},
			openDeductDialog() {
				this.deductForm = { realityPayMoney: '', giveMoney: '' }
				this.deductDialogVisible = true
			},
			onDeductDialogClose() {
				this.deductForm = { realityPayMoney: '', giveMoney: '' }
			},
			submitDeduct() {
				const rawR = this.deductForm.realityPayMoney
				const rawG = this.deductForm.giveMoney
				const r = rawR === '' || rawR === null || rawR === undefined ? 0 : Number(rawR)
				const g = rawG === '' || rawG === null || rawG === undefined ? 0 : Number(rawG)
				if (Number.isNaN(r) || Number.isNaN(g) || r < 0 || g < 0) {
					this.$message.error('扣除金额须为非负数')
					return
				}
				if (r === 0 && g === 0) {
					this.$message.error('请至少输入一项大于 0 的扣除金额')
					return
				}
				this.$confirm('是否确认扣除?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.deductSubmitting = true
					updateBalance({
						userId: this.financeUser.id,
						realityPayMoney: r,
						giveMoney: g
					}).then(res => {
						this.deductSubmitting = false
						if (res.code == 200) {
							this.$message.success(res.msg || '扣除成功')
							this.deductDialogVisible = false
							this.loadMiniAppWallet()
							this.loadMiniAppFlow()
							this.getLists()
						} else {
							this.$message.error(res.msg)
						}
					}).catch(() => {
						this.deductSubmitting = false
					})
				}).catch(() => {})
			},
			//删除单个
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
			//显示编辑弹窗
			open(row) {
				let editData = {}
				editData.userName = row.userName
				editData.wxOpenId = row.wxOpenId
				editData.status = row.status
				editData.id = row.id
				this.editData = editData
				console.log(this.editData)
				this.dialogTableVisible = true
			},
			//编辑提交表单
			submitForm(formName) {
				console.log(this.editData)
				let userData = {
					status: this.editData.status,
					id: this.editData.id
				}
				updateAppUserer(userData).then(res => {
					if (res.code == 200) {
						this.dialogTableVisible = false
						this.$message.success(res.msg)
						this.getLists()
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
			getLists() {
				this.listLoading = true
				let listQuery = JSON.parse(JSON.stringify(this.listQuery))
				if (listQuery.createTimeStart == null) {
					listQuery.createTimeStart = ''
				}
				if (listQuery.createTimeEnd == null) {
					listQuery.createTimeEnd = ''
				}
				wxgetListNew(listQuery).then(res => {
					this.listLoading = false
					if (res.code == 200) {
						console.log(res)
						this.list = res.data
						this.total = res.count
					} else {
						this.$message.error(res.msg)
					}
				}).catch(() => {
					this.listLoading = false
				})
			},
		},
		created() {
			this.getLists()
			this.isPc = !this.$common.isMobile()
		},
	}
</script>

<style scoped>
.finance-drawer-body {
	padding: 16px 20px 76px;
	overflow-y: auto;
	height: calc(100vh - 120px);
}
.finance-drawer-footer {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 12px 20px;
	text-align: right;
	border-top: 1px solid #ebeef5;
	background: #fff;
}
.finance-cards {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	gap: 16px;
	width: 100%;
	margin-bottom: 16px;
}
.finance-card {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 16px 18px;
	border-radius: 12px;
	background: #fff;
	border: 1px solid #ebeef5;
	min-height: 100px;
	box-sizing: border-box;
}
@media (max-width: 768px) {
	.finance-cards {
		grid-template-columns: 1fr;
	}
}
.finance-card-wallet {
	align-items: stretch;
	justify-content: space-between;
	gap: 20px;
	min-height: 128px;
}
.finance-card-wallet-body {
	display: flex;
	align-items: center;
	gap: 14px;
	flex: 1;
	min-width: 0;
}
.finance-wallet-metrics {
	display: flex;
	flex-direction: column;
	gap: 14px;
	min-width: 0;
}
.finance-wallet-label-muted {
	color: #909399;
	font-size: 12px;
	letter-spacing: 0.02em;
}
.finance-wallet-main .finance-card-money {
	margin-top: 2px;
}
.finance-wallet-split {
	display: flex;
	align-items: center;
	gap: 10px;
	max-width: 520px;
	width: 100%;
}
.finance-wallet-stat {
	flex: 1;
	background: #f5f7fa;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	padding: 10px 14px;
	min-width: 0;
}
.finance-wallet-stat-label {
	font-size: 12px;
	color: #909399;
	line-height: 1.4;
	margin-bottom: 4px;
}
.finance-wallet-stat-value {
	font-size: 15px;
	font-weight: 600;
	color: #303133;
	letter-spacing: 0.01em;
}
.finance-wallet-stat-gift {
	color: #67c23a;
}
.finance-card-wallet-actions {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 10px;
	flex-shrink: 0;
	width: 92px;
}
.finance-card-wallet-actions >>> .finance-wallet-action-btn {
	width: 100%;
	margin: 0;
	padding-left: 12px;
	padding-right: 12px;
}
.finance-card-icon {
	width: 52px;
	height: 52px;
	flex-shrink: 0;
}
.finance-card-content {
	flex: 1;
	min-width: 0;
}
.finance-card-title {
	font-size: 18px;
	font-weight: 600;
	color: #303133;
	margin-bottom: 8px;
}
.finance-card-sub {
	font-size: 13px;
	color: #606266;
	line-height: 18px;
}
.finance-card-money {
	margin-top: 4px;
	font-size: 22px;
	font-weight: 700;
	color: #303133;
	line-height: 1.2;
}
.finance-section {
	background: #fff;
	border: 1px solid #ebeef5;
	border-radius: 12px;
	padding: 14px 14px 6px;
}
.finance-section-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 4px 10px;
	font-weight: 600;
	color: #303133;
}
.finance-filter {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
	margin: 0 0 10px;
	padding: 0 4px;
}
.money-in {
	color: #67c23a;
}
.money-out {
	color: #f56c6c;
}
</style>
