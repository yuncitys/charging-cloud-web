<template>
	<div class="app-container">
		<div class="filter-container">
			<el-button type="primary" icon="el-icon-back" @click="handleBack">返回</el-button>
		</div>
		<div v-loading="loading">
			<el-divider content-position="left">支付信息</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col :span="12"><el-form-item label="支付单号"><span>{{ detailPay.payCode || detailData.payCode || '-' }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="业务记录号"><span>{{ detailPay.bizRecordId || '-' }}</span></el-form-item></el-col>
					<el-col :span="12">
						<el-form-item label="付款金额">
							<div class="pay-money-row">
								<span class="pay-money-highlight">{{ formatNullable(detailPay.payMoney) }}</span>
								<el-button
									v-if="showRefundButton"
									type="danger"
									size="mini"
									plain
									class="pay-money-refund-btn"
									:disabled="!effectivePayCode"
									@click="openRefundDialog"
								>退款</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12"><el-form-item label="赠送金额"><span>{{ formatNullable(detailPay.giftMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款金额"><span>{{ formatNullable(detailPay.refundMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="待分账金额"><span>{{ formatNullable(detailPay.remainingShareMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="是否分账"><span>{{ formatProfitSharing(detailPay.isProfitSharing) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="支付状态"><span>{{ formatPayStatus(detailPay.payStatus) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="用户ID"><span>{{ formatNullable(detailPay.userCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="交易类型"><span>{{ formatTradeType(detailPay.type) }}</span></el-form-item></el-col>
					<el-col v-if="showCardNo" :span="12"><el-form-item label="卡号"><span>{{ detailPay.cardNo || '-' }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="创建时间"><span>{{ detailPay.createTime || '-' }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="更新时间"><span>{{ detailPay.updateTime || '-' }}</span></el-form-item></el-col>
					<el-col :span="24"><el-form-item label="备注"><span>{{ detailPay.remark || '-' }}</span></el-form-item></el-col>
				</el-row>
			</el-form>

			<el-divider content-position="left">退款明细</el-divider>
			<el-table v-if="detailRefundDetails.length" :data="detailRefundDetails" border size="mini" style="width: 100%;">
				<el-table-column v-for="col in refundColumns" :key="col.prop" :prop="col.prop" :label="col.label" align="center" :show-overflow-tooltip="true" />
			</el-table>
			<div v-else style="text-align: center; padding: 12px 0;">暂无数据</div>

			<el-divider content-position="left">分账明细</el-divider>
			<el-table v-if="detailSplitRecords.length" :data="detailSplitRecords" border size="mini" style="width: 100%;">
				<el-table-column v-for="col in splitColumns" :key="col.prop" :prop="col.prop" :label="col.label" align="center" :show-overflow-tooltip="true" />
			</el-table>
			<div v-else style="text-align: center; padding: 12px 0;">暂无数据</div>
		</div>

		<el-dialog :visible.sync="refundDialogVisible" title="交易退款" :append-to-body="true" width="60%" @close="handleRefundClose">
			<div>
				<p style="color: orange;">温馨提示1：退款仅支持180天内的交易订单。</p>
				<p style="color: orange;">温馨提示2：若该笔交易记录存在交易订单则视为订单退款否则视为用户余额退款，退款金额原路返回。</p>
				<p style="color: orange;">温馨提示3：用户充值月卡不支持退款；交易订单未结算不允许退款。</p>
			</div>
			<el-form ref="refundFormRef" :model="refundForm" label-position="left" label-width="80px">
				<el-form-item label="支付单号" prop="payCode">
					<el-input v-model="refundForm.payCode" placeholder="请输入支付单号" disabled />
				</el-form-item>
				<el-form-item label="退款金额" prop="refundMoney">
					<el-input v-model="refundForm.refundMoney" placeholder="请输入退款金额" clearable type="number" />
				</el-form-item>
				<el-form-item label="退款说明" prop="remark">
					<el-input v-model="refundForm.remark" placeholder="请输入退款说明" clearable type="textarea" :rows="2" />
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="refundDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="refundConfirmLoading" @click="confirmRefund">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import { getDetail } from '@/api/finance/rechargeRecord.js'
	import { tradingRefund } from '@/api/finance/refundCenter.js'
	export default {
		name: 'rechargeRecordDetail',
		data() {
			return {
				loading: false,
				detailData: {
					payCode: '',
					payDetails: {},
					refundDetails: [],
					splitRecords: []
				},
				refundDialogVisible: false,
				refundConfirmLoading: false,
				refundForm: {
					tradingType: '',
					payCode: '',
					tradingOrders: [],
					refundMoney: '',
					remark: ''
				},
			}
		},
		computed: {
			payCode() {
				return (this.$route && this.$route.query && this.$route.query.payCode) ? this.$route.query.payCode : ''
			},
			effectivePayCode() {
				return this.detailPay.payCode || this.detailData.payCode || this.payCode || ''
			},
			showCardNo() {
				const v = typeof this.detailPay.type === 'string' ? Number(this.detailPay.type) : this.detailPay.type
				return v === 2 && !!this.detailPay.cardNo
			},
			detailPay() {
				return (this.detailData && this.detailData.payDetails) ? this.detailData.payDetails : {}
			},
			detailRefundDetails() {
				return (this.detailData && Array.isArray(this.detailData.refundDetails)) ? this.detailData.refundDetails : []
			},
			detailSplitRecords() {
				return (this.detailData && Array.isArray(this.detailData.splitRecords)) ? this.detailData.splitRecords : []
			},
			refundColumns() {
				return this.getRefundColumns(this.detailRefundDetails)
			},
			splitColumns() {
				return this.getSplitColumns(this.detailSplitRecords)
			},
			/** 支付成功(已支付)=1、部分退款=30 时可退款；需权限 */
			showRefundButton() {
				if (!this.btnAuthen || !this.btnAuthen.permsVerifAuthention(':web:refundCenter:tradingRefund')) {
					return false
				}
				const s = this.detailPay.payStatus
				const v = typeof s === 'string' ? Number(s) : s
				return v === 1 || v === 30
			},
		},
		watch: {
			payCode: {
				handler() {
					this.fetchDetail()
				},
				immediate: true
			}
		},
		methods: {
			handleBack() {
				this.$router.back()
			},
			openRefundDialog() {
				if (!this.effectivePayCode) {
					this.$message.error('payCode不能为空')
					return
				}
				this.refundDialogVisible = true
				this.refundConfirmLoading = false
				this.refundForm.payCode = this.effectivePayCode
				this.refundForm.tradingType = this.detailPay.payType || ''
				this.refundForm.refundMoney = ''
				this.refundForm.remark = ''
				this.refundForm.tradingOrders = []
			},
			handleRefundClose() {
				this.refundDialogVisible = false
				this.refundConfirmLoading = false
				this.refundForm = {
					tradingType: '',
					payCode: this.effectivePayCode || '',
					tradingOrders: [],
					refundMoney: '',
					remark: ''
				}
			},
			confirmRefund() {
				if (this.refundConfirmLoading) return
				if (!this.refundForm.payCode) {
					this.$message.error('支付单号不能为空')
					return
				}
				if (this.refundForm.refundMoney === '' || this.refundForm.refundMoney === null || this.refundForm.refundMoney === undefined) {
					this.$message.error('退款金额不能为空')
					return
				}
				if (Number(this.refundForm.refundMoney) <= 0) {
					this.$message.error('退款金额必须大于0')
					return
				}
				if (!this.refundForm.remark) {
					this.$message.error('退款备注不能为空')
					return
				}
				const payload = {
					...this.refundForm,
					refundMoney: Number(this.refundForm.refundMoney),
					tradingOrders: []
				}
				this.refundConfirmLoading = true
				tradingRefund(payload).then(res => {
					if (res && res.code == 200) {
						this.$message.success(res.msg || '退款成功')
						this.refundDialogVisible = false
						this.fetchDetail()
					} else {
						this.$message.error((res && res.msg) || '退款失败')
					}
				}).catch(() => {
					this.$message.error('退款失败')
				}).finally(() => {
					this.refundConfirmLoading = false
				})
			},
			fetchDetail() {
				if (!this.payCode) {
					this.$message.error('payCode不能为空')
					return
				}
				this.loading = true
				this.detailData = {
					payCode: '',
					payDetails: {},
					refundDetails: [],
					splitRecords: []
				}
				getDetail({ payCode: this.payCode }).then(res => {
					if (res && res.code == 200) {
						const data = res.data || {}
						this.detailData = {
							payCode: data.payCode || this.payCode,
							payDetails: data.payDetails || {},
							refundDetails: Array.isArray(data.refundDetails) ? data.refundDetails : [],
							splitRecords: Array.isArray(data.splitRecords) ? data.splitRecords : []
						}
					} else {
						this.$message.error((res && res.msg) || '查询失败')
					}
				}).catch(() => {
					this.$message.error('查询失败')
				}).finally(() => {
					this.loading = false
				})
			},
			getDynamicColumns(list) {
				if (!Array.isArray(list) || list.length === 0) return []
				const first = list[0] || {}
				return Object.keys(first)
			},
			getRefundColumns(list) {
				const hiddenProps = ['userId', 'adminId', 'tenantId']
				const labelMap = {
					id: 'ID',
					userCode: '用户ID',
                    refundCode: '退款单号',
					payCode: '支付单号',
                    thirdRefundCode: '第三方退款单号',
					bizRecordId: '业务记录号',
					refundSource: '退款来源',
					refundMoney: '退款金额',
					channel: '退款渠道',
					status: '状态',
					result: '结果',
					remark: '备注',
                    createTime: '创建时间',
					updateTime: '更新时间',
				}
				const preferredProps = [
                    'id',
                    'userCode',
					'refundCode',
					'payCode',
                    'thirdRefundCode',
                    'bizRecordId',
                    'refundSource',
					'refundMoney',
                    'channel',
					'status',
					'result',
					'remark',
					'createTime',
					'updateTime'
				]
				const keys = this.getDynamicColumns(list).filter(k => !hiddenProps.includes(k))
				const ordered = preferredProps.filter(k => keys.includes(k)).concat(keys.filter(k => !preferredProps.includes(k)))
				return ordered.map(prop => ({ prop, label: labelMap[prop] || prop }))
			},
			getSplitColumns(list) {
				const hiddenProps = ['splitType', 'userId', 'adminId', 'tenantId', 'amount', 'transactionAmount', 'billingDetails', 'failReason', 'remark']
				const labelMap = {
					id: 'ID',
					orderCode: '分账单号',
					splitOrderCode: '支付单号',
					thirdSplitOrderCode: '第三方分账单号',
					bizOrderCode: '业务订单号',
					// splitType: '分账类型',
					splitAmount: '分账金额',
					// amount: '到账金额',
					refundedAmount: '已退款金额',
					// transactionAmount: '交易金额',
					serviceCharge: '手续费',
					splitRate: '分账比例',
					status: '状态',
					payType: '支付方式',
					// billingDetails: '计费明细',
					// remark: '备注',
					// failReason: '失败原因',
					createTime: '分账时间',
					updateTime: '成功时间'
				}
				const preferredProps = [
                    'id',
                    'orderCode',
					'splitOrderCode',
                    'thirdSplitOrderCode',
                    'bizOrderCode',
					// 'splitType',
					'splitAmount',
                    // 'amount',
                    'refundedAmount',
                    // 'transactionAmount',
                    'serviceCharge',
					'splitRate',
					'status',
                    'payType',
					// 'billingDetails',
                    // 'remark',
					// 'failReason',
					'createTime',
					'updateTime',
				]
				const keys = this.getDynamicColumns(list).filter(k => !hiddenProps.includes(k))
				const ordered = preferredProps.filter(k => keys.includes(k)).concat(keys.filter(k => !preferredProps.includes(k)))
				return ordered.map(prop => ({ prop, label: labelMap[prop] || prop }))
			},
			formatProfitSharing(val) {
				if (val === true || val === 1) return '是'
				if (val === false || val === 0) return '否'
				return '-'
			},
			formatNullable(val) {
				if (val === 0 || val === '0') return val
				if (val === null || val === undefined || val === '') return '-'
				return val
			},
			formatPayStatus(val) {
				const v = typeof val === 'string' ? Number(val) : val
				if (v === 0) return '未支付'
				if (v === 10) return '支付中'
				if (v === 1) return '已支付'
				if (v === 2) return '支付失败'
				if (v === 3) return '已退款'
				if (v === 30) return '部分退款'
				return this.formatNullable(val)
			},
			formatTradeType(val) {
				const v = typeof val === 'string' ? Number(val) : val
				if (v === 0) return '充电缴费'
				if (v === 1) return '充值余额'
				if (v === 2) return '充值IC卡'
				if (v === 3) return '充值月卡'
				return this.formatNullable(val)
			},
		}
	}
</script>

<style>
	.pay-money-highlight {
		color: #f56c6c;
		font-weight: 600;
		line-height: 22px;
	}
	.pay-money-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: 28px;
		gap: 12px;
		flex-wrap: wrap;
	}
	.pay-money-refund-btn {
		flex-shrink: 0;
		height: 28px;
		line-height: 26px;
		padding: 0 12px;
		margin-left: auto;
	}
</style>
