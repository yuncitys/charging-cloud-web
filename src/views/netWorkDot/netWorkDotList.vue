<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.networkAddress" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站地址" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()" />
			<el-input v-model="listQuery.networkProvince" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站省份" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<el-input v-model="listQuery.networkName" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入充电站名称" clearable @keyup.enter.native="handleFilter" @clear="handleFilter()"/>
			<!-- <el-select style="width: 200px;margin-right: 20px ;" class="filter-item" v-model="listQuery.adminId" filterable clearable @change="handleFilter()"
				placeholder="请选择代理商">
				<el-option
				v-for="item in dealerList"
				:key="item.id"
				:label="item.adminFullname"
				:value="item.id">
				</el-option>
			</el-select> -->
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="handleFilter" icon="el-icon-search">
				查询
			</el-button>

			<!--添加站点-->
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="addOrUpdateHandle()" 
				v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:add')">添加站点
			</el-button>

			<!--导出Excel  -->
			<downExcel :queryData="listQuery" />

			<el-tabs v-model="activeName" type="card" @tab-click="handleClick">
				<el-tab-pane
					v-for="(item, index) in ruleIdList"
					:key="item.id"
					:label="item.title"
					:name="item.id">
				</el-tab-pane>
			</el-tabs>

			<el-table v-loading="listLoading" :key="tableKey" :data="list" element-loading-text="拼命加载中......"  fithighlight-current-row style="width: 100%;" align="center" id="tableBox">
				<el-table-column type="index" width="55" label="序号" align="center">
					<template slot-scope="scope"><span>{{scope.$index+(page - 1) * limit + 1}} </span></template>
				</el-table-column>
				<!-- <el-table-column prop="ruleId" label="充电站类型" align="center" :show-overflow-tooltip="isPc">
					<template slot-scope="scope">
						{{scope.row.ruleId === 1 ? '单车充电站' : '汽车充电站'}}
					</template>
				</el-table-column> -->
				<el-table-column prop="merchantName" label="运营商户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkName" label="充电站名称" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<!-- <el-table-column prop="networkProvince" label="省" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkCity" label="市" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkRegion" label="区" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column> -->
				<el-table-column prop="networkAddress" label="投放地" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkLongitude" label="地址经度" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="networkLatitude" label="地址纬度" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<!-- <el-table-column prop="startingPrice" label="充电起始价" align="center" :show-overflow-tooltip='isPc'>
					<template slot-scope="scope">
						<span>{{ scope.row.ruleId === 2 ? scope.row.startingPrice + '（元）' : '无' }}</span>
					</template>
				</el-table-column> -->
				<el-table-column prop="createUser" label="创建用户" align="center" :show-overflow-tooltip='isPc'>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.createTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center" :show-overflow-tooltip='isPc' sortable>
					<template slot-scope="scope">
						<span>{{ scope.row.updateTime | formatDate }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="380" fixed="right">
					<template slot-scope="scope">
						<!-- 设置分成 -->
						<!-- <set-split-account-page :row_data="scope.row" @getLists="getLists"/> -->
						<!-- 抽成规则 -->
						<el-button type="primary" size="mini" @click="showSettlementConfig(scope.row)">结算配置</el-button>
						<!-- 编辑 -->
						<!-- <chargeStationDialog :row_data="scope.row" @getLists="getLists" /> -->
						<el-button type="primary" style="margin-left: 10px;" size = "mini" @click="addOrUpdateHandle(scope.row,false)" 
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:edit')">编辑
						</el-button>
						<!-- 详情 -->
						<el-button type="primary" size = "mini" @click="addOrUpdateHandle(scope.row,true)">详情</el-button>
						<!-- 删除 -->
						<el-button style="margin-left: 10px;" type="danger" size="mini" icon="el-icon-delete"  @click="del(scope.row.id)"
							v-if="btnAuthen.permsVerifAuthention(':netWorkDot:netWorkDotList:delete')">删除
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
		<ChargeStationDialog ref="chargeStationForm" @getLists="getLists" />
		<el-dialog :visible.sync="settlementDialog.visible" title="结算配置" @close="settlementDialog.visible = false" :append-to-body="true" width="720px">
			<el-tabs v-model="settlementDialog.activeTab" type="card" @tab-click="handleSettlementTabClick">
				<el-tab-pane label="抽成规则" name="commission"></el-tab-pane>
				<el-tab-pane label="收款账户" name="account"></el-tab-pane>
			</el-tabs>
			<div v-show="settlementDialog.activeTab === 'commission'" v-loading="settlementDialog.loadingCommission" element-loading-text="拼命加载中......">
				<div class="commission-wrap">
					<div class="commission-card">
						<div class="commission-header">
							<div class="commission-title">抽成规则</div>
							<div class="commission-header-right">
								<div class="commission-badge commission-badge--on" v-if="settlementDialog.commissionExists">已配置</div>
								<div class="commission-badge commission-badge--off" v-else>未配置</div>
								<el-button v-if="settlementDialog.commissionExists" class="settlement-header-btn" size="mini" type="primary" @click="openCommissionEdit">修改</el-button>
							</div>
						</div>
						<div class="commission-body" v-if="settlementDialog.commissionExists">
							<div class="commission-row">
								<div class="commission-label">电费抽成</div>
								<div class="commission-value">
									<span v-if="settlementDialog.commission.collectFlag == '1'">{{ formatCommission(settlementDialog.commission.powerRateType, settlementDialog.commission.powerRate) }}</span>
									<span v-else>-</span>
								</div>
							</div>
							<div class="commission-row">
								<div class="commission-label">服务费抽成</div>
								<div class="commission-value">
									<span v-if="settlementDialog.commission.collectFlag == '1'">{{ formatCommission(settlementDialog.commission.serviceRateType, settlementDialog.commission.serviceRate) }}</span>
									<span v-else>-</span>
								</div>
							</div>
						</div>
						<div class="commission-body settlement-empty" v-else>
							<div class="settlement-empty-title">暂无抽成规则</div>
							<div class="settlement-empty-desc">请先配置抽成规则后，再进行结算。</div>
							<el-button type="primary" @click="openCommissionEdit">配置规则</el-button>
						</div>
						<div class="commission-footer">
							<div class="commission-meta">修改用户：{{ settlementDialog.commission.updateUser || '-' }}</div>
							<div class="commission-meta">修改时间：{{ settlementDialog.commission.updateTime | formatDate }}</div>
						</div>
					</div>
				</div>
			</div>
			<div v-show="settlementDialog.activeTab === 'account'" v-loading="settlementDialog.loadingAccount" element-loading-text="拼命加载中......">
				<div class="commission-wrap">
					<div class="commission-card">
						<div class="commission-header">
							<div class="commission-title">收款账户</div>
							<div class="commission-header-right">
								<div class="commission-badge commission-badge--on" v-if="settlementDialog.account">已配置</div>
								<div class="commission-badge commission-badge--off" v-else>未配置</div>
								<el-button v-if="settlementDialog.account" class="settlement-header-btn" size="mini" type="primary" @click="openReceivingAccountEdit">修改</el-button>
							</div>
						</div>
						<div class="commission-body" v-if="settlementDialog.account">
							<div class="commission-row">
								<div class="commission-label">结算账户类型</div>
								<div class="commission-value">{{ formatSettBankAccType(settlementDialog.account.settBankAccType) }}</div>
							</div>
							<div class="commission-row">
								<div class="commission-label">结算账户名称</div>
								<div class="commission-value" :title="settlementDialog.account.settBankAccName">{{ settlementDialog.account.settBankAccName }}</div>
							</div>
							<div class="commission-row">
								<div class="commission-label">开户行</div>
								<div class="commission-value" :title="settlementDialog.account.settBankBranchName">{{ settlementDialog.account.settBankBranchName }}</div>
							</div>
							<div class="commission-row">
								<div class="commission-label">开户行行号</div>
								<div class="commission-value">{{ settlementDialog.account.settBankBranchId }}</div>
							</div>
							<div class="commission-row">
								<div class="commission-label">银行账号</div>
								<div class="commission-value">{{ settlementDialog.account.settBankAccNo }}</div>
							</div>
						</div>
						<div class="commission-body settlement-empty" v-else>
							<div class="settlement-empty-title">暂无收款账户</div>
							<div class="settlement-empty-desc">请先完成商户进件并创建收款账户后，再进行结算配置。</div>
							<el-button type="primary" @click="openReceivingAccountEdit">添加收款账户</el-button>
						</div>
						<div class="commission-footer">
							<div class="commission-meta">更新用户：{{ settlementDialog.account ? (settlementDialog.account.updateUser || '-') : '-' }}</div>
							<div class="commission-meta">更新时间：{{ settlementDialog.account ? (settlementDialog.account.updateTime | formatDate) : '-' }}</div>
						</div>
					</div>
				</div>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="settlementDialog.editAccountVisible" title="修改收款账户" @close="settlementDialog.editAccountVisible = false" :append-to-body="true" width="520px">
			<el-form v-if="!settlementDialog.accountListEmpty" label-position="left" label-width="100px">
				<el-form-item label="收款账户">
					<el-select v-model="settlementDialog.selectedAccountId" filterable placeholder="请选择收款账户" style="width: 100%;" :loading="settlementDialog.accountListLoading">
						<el-option
							v-for="item in settlementDialog.accountList"
							:key="item.id"
								:label="item.settBankAccName + '  ' + item.settBankAccNo"
							:value="item.id"
						/>
					</el-select>
				</el-form-item>
			</el-form>
			<div v-else class="settlement-empty">
				<div class="settlement-empty-title">暂无可选收款账户</div>
				<div class="settlement-empty-desc">请先创建收款账户，创建完成后再回来选择作为结算账户。</div>
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="settlementDialog.editAccountVisible = false">取消</el-button>
				<el-button v-if="settlementDialog.accountListEmpty" type="primary" @click="toTradeEntry">去创建收款账户</el-button>
				<el-button v-else type="primary" :loading="settlementDialog.accountSaving" @click="saveReceivingAccount">保存</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="settlementDialog.editCommissionVisible" :title="settlementDialog.commissionExists ? '修改抽成规则' : '配置抽成规则'" @close="settlementDialog.editCommissionVisible = false" :append-to-body="true" width="520px">
			<el-form ref="commissionForm" :model="settlementDialog.commissionForm" :rules="settlementDialog.commissionRules" label-position="left" label-width="120px">
				<el-form-item label="是否收取抽成" prop="collectFlag">
					<el-radio-group v-model="settlementDialog.commissionForm.collectFlag">
						<el-radio :label="'0'">否</el-radio>
						<el-radio :label="'1'">是</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="settlementDialog.commissionForm.collectFlag == '1'" label="电费抽成" prop="powerRate">
					<div style="display: flex; gap: 10px;">
						<el-select v-model="settlementDialog.commissionForm.powerRateType" style="width: 120px">
							<el-option :value="'0'" label="度数" />
							<el-option :value="'1'" label="折扣" />
						</el-select>
						<el-input v-model="settlementDialog.commissionForm.powerRate" placeholder="请输入数值" type="number">
							<template slot="append">
								<span v-if="settlementDialog.commissionForm.powerRateType == '1'">%</span>
								<span v-else>元/度</span>
							</template>
						</el-input>
					</div>
				</el-form-item>
				<el-form-item v-if="settlementDialog.commissionForm.collectFlag == '1'" label="服务费抽成" prop="serviceRate">
					<div style="display: flex; gap: 10px;">
						<el-select v-model="settlementDialog.commissionForm.serviceRateType" style="width: 120px">
							<el-option :value="'0'" label="度数" />
							<el-option :value="'1'" label="折扣" />
						</el-select>
						<el-input v-model="settlementDialog.commissionForm.serviceRate" placeholder="请输入数值" type="number">
							<template slot="append">
								<span v-if="settlementDialog.commissionForm.serviceRateType == '1'">%</span>
								<span v-else>元/度</span>
							</template>
						</el-input>
					</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="settlementDialog.editCommissionVisible = false">取消</el-button>
				<el-button type="primary" :loading="settlementDialog.commissionSaving" @click="saveCommissionRule">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		deleteNetworkDot,
	} from '@/api/netWorkDot/netWorkDotList.js'
	import { getByStationId as getStationCommissionInfo, saveOrUpdate as saveCommissionRuleApi } from '@/api/finance/commissionStrategy'
	import { getByStationId as getSettlementAccountByStationId, saveOrUpdate as saveSettlementAccount } from '@/api/finance/stationCommissionSettlementAccount'
	import { listCompleted as listCompletedTradeMerchant } from '@/api/pay/tradeEntry'
	import {
		findDealerList,
	} from '@/api/device/deviceList.js'
	import loadMap from "../../utils/loadMap.js";
	import {
		parseTime
	} from '@/utils/index'
	import downExcel from './components/downExcel.vue'
	import ChargeStationDialog from './components/chargeStationDialog.vue';
	export default {
		name: 'netWorkDotList',
		components: {
			ChargeStationDialog,
			downExcel
		},
		data() {
			return {
				activeName: '1',
				ruleIdList: [{
					id: '1',
					title: '单车'
				}, {
					id: '2',
					title: '汽车'
				}],
				listLoading: true,
				page: 1,
				limit: 10,
				list: [],
				total: 10,
        		dealerList: [],
				listQuery: {
					page: 1,
					limit: 10,
					ruleId: 1,
					type: 1,
					adminId: '',
					networkName: '',
					networkProvince: '',
					networkAddress: '',
					
				},
				tableKey: 0,
				settlementDialog: {
					visible: false,
					activeTab: 'commission',
					stationId: '',
					stationName: '',
					merchantId: '',
					loadingCommission: false,
					loadingAccount: false,
					commissionExists: false,
					editCommissionVisible: false,
					commissionSaving: false,
					commissionRules: {
						collectFlag: [{ required: true, message: '请选择是否收取抽成', trigger: 'blur' }],
						powerRate: [{ required: true, message: '请输入电费抽成', trigger: 'blur' }],
						serviceRate: [{ required: true, message: '请输入服务费抽成', trigger: 'blur' }]
					},
					commissionForm: {
						id: '',
						stationId: '',
						collectFlag: '0',
						powerRateType: '0',
						powerRate: '',
						serviceRateType: '0',
						serviceRate: ''
					},
					editAccountVisible: false,
					accountListLoading: false,
					accountSaving: false,
					accountList: [],
					accountListEmpty: false,
					selectedAccountId: '',
					commission: {
						stationName: '',
						collectFlag: '0',
						powerRateType: '0',
						powerRate: '',
						serviceRateType: '0',
						serviceRate: '',
						updateUser: '',
						updateTime: ''
					},
					account: null,
					accountLoaded: false
				}
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
			formatCommission(type, value) {
				if (value === null || value === undefined || value === '') return '-'
				if (type == '1') return `${value}%`
				return `${value} 元/度`
			},
			formatSettBankAccType(type) {
				if (type === '0010' || type === 10 || type === '10') return '借记账户'
				if (type === '0030' || type === 30 || type === '30') return '对公账户'
				return '-'
			},
			handleSettlementTabClick(tab) {
				if (tab.name === 'account') {
					this.loadSettlementAccount()
				}
			},
			showSettlementConfig(row) {
				this.settlementDialog.visible = true
				this.settlementDialog.activeTab = 'commission'
				this.settlementDialog.stationId = row.id
				this.settlementDialog.stationName = row.networkName || ''
				this.settlementDialog.merchantId = row.merchantId || row.merchant_id || row.merchantID || row.operatorId || ''
				this.settlementDialog.account = null
				this.settlementDialog.accountLoaded = false
				this.settlementDialog.commissionExists = false
				this.settlementDialog.editCommissionVisible = false
				this.settlementDialog.editAccountVisible = false
				this.settlementDialog.accountList = []
				this.settlementDialog.accountListEmpty = false
				this.settlementDialog.selectedAccountId = ''
				this.loadCommissionRule(row)
			},
			loadCommissionRule(row) {
				this.settlementDialog.loadingCommission = true
				const stationName = row.networkName || this.settlementDialog.stationName || ''
				this.settlementDialog.commission = {
					stationName,
					collectFlag: '0',
					powerRateType: '0',
					powerRate: '',
					serviceRateType: '0',
					serviceRate: '',
					updateUser: '',
					updateTime: ''
				}
				getStationCommissionInfo(row.id).then(res => {
					if (res.code == 200) {
						const data = res.data || null
						this.settlementDialog.commissionExists = !!data
						if (data) {
							this.settlementDialog.commission = {
								stationName,
								id: data.id,
								collectFlag: String(data.collectFlag ?? '0'),
								powerRateType: String(data.powerRateType ?? '0'),
								powerRate: data.powerRate ?? '',
								serviceRateType: String(data.serviceRateType ?? '0'),
								serviceRate: data.serviceRate ?? '',
								updateUser: data.updateUser || '',
								updateTime: data.updateTime || ''
							}
						}
					} else {
						this.$message.error(res.msg || '查询抽成规则失败')
					}
				}).catch(() => {
					this.$message.error('查询抽成规则失败')
				}).finally(() => {
					this.settlementDialog.loadingCommission = false
				})
			},
			openCommissionEdit() {
				this.settlementDialog.editCommissionVisible = true
				this.settlementDialog.commissionForm = {
					id: this.settlementDialog.commissionExists ? (this.settlementDialog.commission.id || '') : '',
					stationId: this.settlementDialog.stationId,
					collectFlag: this.settlementDialog.commissionExists ? String(this.settlementDialog.commission.collectFlag ?? '0') : '0',
					powerRateType: this.settlementDialog.commissionExists ? String(this.settlementDialog.commission.powerRateType ?? '0') : '0',
					powerRate: this.settlementDialog.commissionExists ? (this.settlementDialog.commission.powerRate ?? '0') : '0',
					serviceRateType: this.settlementDialog.commissionExists ? String(this.settlementDialog.commission.serviceRateType ?? '0') : '0',
					serviceRate: this.settlementDialog.commissionExists ? (this.settlementDialog.commission.serviceRate ?? '0') : '0'
				}
			},
			saveCommissionRule() {
				this.$refs.commissionForm.validate(valid => {
					if (!valid) return
					this.settlementDialog.commissionSaving = true
					const payload = { ...this.settlementDialog.commissionForm }
					payload.stationId = this.settlementDialog.stationId
					saveCommissionRuleApi(payload).then(res => {
						if (res.code == 200) {
							this.$message.success(res.msg || '保存成功')
							this.settlementDialog.editCommissionVisible = false
							this.settlementDialog.commissionExists = false
							this.loadCommissionRule({ id: this.settlementDialog.stationId, networkName: this.settlementDialog.stationName })
						} else {
							this.$message.error(res.msg || '保存失败')
						}
					}).catch(() => {
						this.$message.error('保存失败')
					}).finally(() => {
						this.settlementDialog.commissionSaving = false
					})
				})
			},
			loadSettlementAccount() {
				if (this.settlementDialog.accountLoaded) return
				this.settlementDialog.loadingAccount = true
				getSettlementAccountByStationId(this.settlementDialog.stationId).then(res => {
					if (res.code == 200) {
						const data = res.data || null
						if (data) {
							this.settlementDialog.account = {
								settBankAccType: data.settBankAccType,
								settBankAccName: data.settBankAccName,
								settBankBranchId: data.settBankBranchId,
								settBankBranchName: data.settBankBranchName,
								settBankAccNo: data.settBankAccNo,
								updateUser: data.updateUser,
								updateTime: data.updateTime
							}
						} else {
							this.settlementDialog.account = null
						}
						this.settlementDialog.accountLoaded = true
					} else {
						this.$message.error(res.msg || '查询结算账户失败')
					}
				}).catch(() => {
					this.$message.error('查询结算账户失败')
				}).finally(() => {
					this.settlementDialog.loadingAccount = false
				})
			},
			openReceivingAccountEdit() {
				this.settlementDialog.editAccountVisible = true
				this.loadReceivingAccountList()
			},
			loadReceivingAccountList() {
				this.settlementDialog.accountListLoading = true
				if (!this.settlementDialog.merchantId) {
					this.settlementDialog.accountList = []
					this.settlementDialog.accountListEmpty = true
					this.settlementDialog.selectedAccountId = ''
					this.settlementDialog.accountListLoading = false
					this.$message.error('缺少商户ID，无法查询收款账户列表')
					return
				}
				listCompletedTradeMerchant(this.settlementDialog.merchantId).then(res => {
					if (res.code == 200) {
						const list = res.data || []
						this.settlementDialog.accountList = list
						this.settlementDialog.accountListEmpty = !this.settlementDialog.accountList.length
						if (!this.settlementDialog.selectedAccountId && this.settlementDialog.accountList.length) {
							this.settlementDialog.selectedAccountId = this.settlementDialog.accountList[0].id
						}
					} else {
						this.$message.error(res.msg || '查询收款账户列表失败')
						this.settlementDialog.accountList = []
						this.settlementDialog.accountListEmpty = true
						this.settlementDialog.selectedAccountId = ''
					}
				}).catch(() => {
					this.$message.error('查询收款账户列表失败')
					this.settlementDialog.accountList = []
					this.settlementDialog.accountListEmpty = true
					this.settlementDialog.selectedAccountId = ''
				}).finally(() => {
					this.settlementDialog.accountListLoading = false
				})
			},
			saveReceivingAccount() {
				if (!this.settlementDialog.selectedAccountId) {
					this.$message.error('请选择收款账户')
					return
				}
				this.settlementDialog.accountSaving = true
				const selected = (this.settlementDialog.accountList || []).find(i => i.id === this.settlementDialog.selectedAccountId)
				const payload = {
					stationId: this.settlementDialog.stationId,
					merchantNo: selected ? selected.merchantNo : undefined,
					busTradeMerNo: selected ? selected.busTradeMerNo : undefined,
					settBankAccType: selected ? selected.settBankAccType : undefined,
					settBankAccName: selected ? selected.settBankAccName : undefined,
					settBankBranchId: selected ? selected.settBankBranchId : undefined,
					settBankBranchName: selected ? selected.settBankBranchName : undefined,
					settBankAccNo: selected ? selected.settBankAccNo : undefined
				}
				saveSettlementAccount(payload).then(res => {
					if (res.code == 200) {
						this.$message.success(res.msg || '保存成功')
						this.settlementDialog.editAccountVisible = false
						this.settlementDialog.accountLoaded = false
						this.loadSettlementAccount()
					} else {
						this.$message.error(res.msg || '保存失败')
					}
				}).catch(() => {
					this.$message.error('保存失败')
				}).finally(() => {
					this.settlementDialog.accountSaving = false
				})
			},
			toTradeEntry() {
				this.$router.push({ path: '/tradeEntry/add' })
				this.settlementDialog.visible = false
			},
			addOrUpdateHandle(row,isDetail) {
				console.log("row:",row)
				this.$nextTick(() => {
					this.$refs.chargeStationForm.onshowAdd(row,isDetail)
				})
      		},
			//切换导航
			handleClick(tab, event) {
				this.listQuery.ruleId = tab.name
				this.listQuery.page = 1,
				this.listQuery.limit = 10,
				this.getLists()
			},
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
			del(id) {
				this.$confirm('这一操作将永久删除该记录。你想继续吗?', '警告', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning'
				}).then(() => {
					let data = {
						id
					}
					console.log(data)
					deleteNetworkDot(data).then(res => {
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
			findDealerList() {
				findDealerList().then(res => {
					if (res.code == 200) {
						this.dealerList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
		},
		created() {
			this.getLists()
			// this.findDealerList()
		},
	}
</script>

<style>
	.el-dialog {
		display: flex;
		flex-direction: column;
		margin: 0 !important;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/*height:600px;*/
		max-height: calc(100% - 30px);
		max-width: calc(100% - 30px);
	}

	.el-dialog .el-dialog__body {
		flex: 1;
		overflow: auto;

	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	.avatar {
		width: 178px;
		height: 178px;
		display: block;
	}

	.amap-sug-result {
		z-index: 9999 !important;
	}

	#tipinput {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	#tipinput1 {
		-webkit-appearance: none;
		background-color: #FFFFFF;
		background-image: none;
		border-radius: 4px;
		border: 1px solid #DCDFE6;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		color: #606266;
		display: inline-block;
		font-size: inherit;
		height: 40px;
		line-height: 40px;
		outline: none;
		padding: 0 15px;
		-webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
		width: 100%;
	}

	.receive-account-wrap {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 6px 0 10px;
	}

	.receive-account-label {
		width: 96px;
		color: #303133;
		line-height: 36px;
		font-weight: 600;
	}

	.receive-account-card {
		flex: 1;
		border: 1px solid #ebeef5;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.receive-account-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border-bottom: 1px solid #f2f6fc;
	}

	.receive-account-title {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
		max-width: 520px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.receive-account-badge {
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 12px;
		color: #ff7a00;
		background: rgba(255, 122, 0, 0.12);
	}

	.receive-account-body {
		padding: 16px;
		color: #303133;
	}

	.receive-account-bank {
		font-size: 16px;
		line-height: 24px;
		color: #303133;
	}

	.receive-account-no {
		margin-top: 6px;
		font-size: 18px;
		line-height: 26px;
		letter-spacing: 1px;
		color: #303133;
	}

	.receive-account-empty {
		padding: 22px 0 10px;
		text-align: center;
	}

	.receive-account-empty-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.receive-account-empty-desc {
		margin: 8px auto 14px;
		max-width: 460px;
		font-size: 13px;
		color: #909399;
		line-height: 20px;
	}

	.commission-wrap {
		padding: 6px 0 10px;
	}

	.commission-card {
		border: 1px solid #ebeef5;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.commission-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		border-bottom: 1px solid #f2f6fc;
	}

	.commission-header-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.settlement-header-btn.el-button--primary,
	.settlement-header-btn.el-button--primary:hover,
	.settlement-header-btn.el-button--primary:focus {
		color: #fff;
	}

	.commission-title {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
	}

	.commission-badge {
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 12px;
	}

	.commission-badge--on {
		color: #67c23a;
		background: rgba(103, 194, 58, 0.12);
	}

	.commission-badge--off {
		color: #909399;
		background: rgba(144, 147, 153, 0.12);
	}

	.commission-body {
		padding: 16px;
	}

	.commission-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		border-bottom: 1px dashed #f2f6fc;
	}

	.commission-row:last-child {
		border-bottom: none;
	}

	.commission-label {
		font-size: 13px;
		color: #909399;
	}

	.commission-value {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.commission-footer {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 16px;
		background: #fafcff;
		border-top: 1px solid #f2f6fc;
	}

	.commission-meta {
		font-size: 12px;
		color: #909399;
	}

	.settlement-empty {
		text-align: center;
	}

	.settlement-empty-title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}

	.settlement-empty-desc {
		margin: 8px auto 14px;
		max-width: 460px;
		font-size: 13px;
		color: #909399;
		line-height: 20px;
	}
</style>
