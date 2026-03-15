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
					<el-col :span="12"><el-form-item label="付款金额"><span>{{ formatNullable(detailPay.payMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="赠送金额"><span>{{ formatNullable(detailPay.giftMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款金额"><span>{{ formatNullable(detailPay.refundMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="待分账金额"><span>{{ formatNullable(detailPay.remainingShareMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="是否分账"><span>{{ formatProfitSharing(detailPay.isProfitSharing) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="支付状态"><span>{{ formatPayStatus(detailPay.payStatus) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="用户ID"><span>{{ formatNullable(detailPay.userCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="交易类型"><span>{{ formatTradeType(detailPay.type) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="卡号"><span>{{ detailPay.cardNo || '-' }}</span></el-form-item></el-col>
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
	</div>
</template>

<script>
	import { getDetail } from '@/api/finance/rechargeRecord.js'
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
				}
			}
		},
		computed: {
			payCode() {
				return (this.$route && this.$route.query && this.$route.query.payCode) ? this.$route.query.payCode : ''
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
				const hiddenProps = ['splitType', 'userId', 'adminId', 'tenantId']
				const labelMap = {
					id: 'ID',
					orderCode: '分账单号',
					splitOrderCode: '支付单号',
					thirdSplitOrderCode: '第三方分账单号',
					bizOrderCode: '业务订单号',
					// splitType: '分账类型',
					splitAmount: '分账金额',
					amount: '到账金额',
					refundedAmount: '已退款金额',
					transactionAmount: '交易金额',
					serviceCharge: '手续费',
					splitRate: '分账比例',
					status: '状态',
					payType: '支付方式',
					billingDetails: '计费明细',
					remark: '备注',
					failReason: '失败原因',
					createTime: '创建时间',
					updateTime: '更新时间'
				}
				const preferredProps = [
                    'id',
                    'orderCode',
					'splitOrderCode',
                    'thirdSplitOrderCode',
                    'bizOrderCode',
					// 'splitType',
					'splitAmount',
                    'amount',
                    'refundedAmount',
                    'transactionAmount',
                    'serviceCharge',
					'splitRate',
					'status',
                    'payType',
					'billingDetails',
                    'remark',
					'failReason',
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
</style>
