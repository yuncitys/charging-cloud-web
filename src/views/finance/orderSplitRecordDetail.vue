<template>
	<div class="app-container">
		<div class="filter-container">
			<el-button type="primary" icon="el-icon-back" @click="handleBack">返回</el-button>
		</div>
		<div v-loading="loading">
			<el-divider content-position="left">分帐信息</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col :span="12"><el-form-item label="结算订单"><span>{{ formatNullable(splitRecord.orderCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账订单"><span>{{ formatNullable(splitRecord.splitOrderCode) }}</span></el-form-item></el-col>
					<!-- <el-col :span="12"><el-form-item label="收款账号"><span>{{ formatNullable(splitRecord.merchantName) }}</span></el-form-item></el-col> -->
					<el-col :span="12"><el-form-item label="分账金额(元)"><span>{{ formatNullable(splitRecord.splitAmount) }}</span></el-form-item></el-col>
					<!-- <el-col :span="12"><el-form-item label="到账金额(元)"><span>{{ formatNullable(splitRecord.amount) }}</span></el-form-item></el-col> -->
					<el-col :span="12"><el-form-item label="追回金额(元)"><span>{{ formatNullable(splitRecord.refundedAmount) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="手续费(元)"><span>{{ formatNullable(splitRecord.serviceCharge) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账比例(%)"><span>{{ formatNullable(splitRecord.splitRate) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="状态"><span>{{ formatNullable(splitRecord.status) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账时间"><span>{{ formatNullable(splitRecord.createTime) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="更新时间"><span>{{ formatNullable(splitRecord.updateTime) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="失败原因"><span>{{ formatNullable(splitRecord.failReason) }}</span></el-form-item></el-col>
					<!-- <el-col :span="12"><el-form-item label="备注"><span>{{ formatNullable(splitRecord.remark) }}</span></el-form-item></el-col> -->
					<!-- <el-col :span="24"><el-form-item label="分账详情"><span>{{ formatNullable(splitRecord.billingDetails) }}</span></el-form-item></el-col> -->
				</el-row>
			</el-form>

			<el-divider content-position="left">收款信息</el-divider>
			<el-table v-if="payeeList.length" :data="payeeList" border size="mini" style="width: 100%;" :span-method="payeeSpanMethod">
				<el-table-column v-for="col in payeeColumns" :key="col.prop" :prop="col.prop" :label="col.label" align="center" :show-overflow-tooltip="true" />
			</el-table>
			<div v-else style="text-align: center; padding: 12px 0;">暂无数据</div>

			<el-divider content-position="left">退款信息</el-divider>
			<el-table v-if="profitRefundRecords.length" :data="profitRefundRecords" border size="mini" style="width: 100%;" :span-method="refundSpanMethod">
				<el-table-column v-for="col in refundRecordColumns" :key="col.prop" :prop="col.prop" :label="col.label" align="center" :show-overflow-tooltip="true" />
			</el-table>
			<div v-else style="text-align: center; padding: 12px 0;">暂无数据</div>
		</div>
	</div>
</template>

<script>
import { getDetail } from '@/api/finance/orderSplitRecord.js'

export default {
	name: 'orderSplitRecordDetail',
	data() {
		return {
			loading: false,
			detailData: {
				splitRecordId: '',
				splitRecord: {},
				splitRecordInfo: [],
				profitRefundRecords: []
			}
		}
	},
	computed: {
		id() {
			return (this.$route && this.$route.query && this.$route.query.id) ? this.$route.query.id : ''
		},
		splitRecordId() {
			return this.detailData ? this.detailData.splitRecordId : ''
		},
		splitRecord() {
			return this.detailData && this.detailData.splitRecord ? this.detailData.splitRecord : {}
		},
		splitRecordInfo() {
			return this.detailData && this.detailData.splitRecordInfo ? this.detailData.splitRecordInfo : []
		},
		payeeList() {
			let list = []
			if (Array.isArray(this.splitRecordInfo)) list = this.splitRecordInfo
			else if (this.splitRecordInfo && typeof this.splitRecordInfo === 'object') list = [this.splitRecordInfo]
			else list = []
			return list.map(item => {
				if (this.isPlatformPayee(item)) {
					return { ...item, merchantName: '平台抽成' }
				}
				return item
			})
		},
		payeeColumns() {
			return this.getPayeeColumns(this.payeeList)
		},
		profitRefundRecords() {
			const list = (this.detailData && Array.isArray(this.detailData.profitRefundRecords)) ? this.detailData.profitRefundRecords : []
			return list.map(item => {
				if (this.isPlatformPayee(item)) {
					return { ...item, merchantName: item && item.merchantName ? item.merchantName : '平台商户' }
				}
				return item
			})
		},
		refundRecordColumns() {
			return this.getRefundRecordColumns(this.profitRefundRecords)
		}
	},
	watch: {
		id: {
			handler() {
				this.fetchDetail()
			},
			immediate: true
		},
	},
	methods: {
		handleBack() {
			this.$router.back()
		},
		fetchDetail() {
			if (!this.id) {
				this.$message.error('id不能为空')
				return
			}
			this.loading = true
			this.detailData = { splitRecordId: '', splitRecord: {}, splitRecordInfo: [], profitRefundRecords: [] }
			getDetail({ id: this.id }).then(res => {
				if (res && res.code == 200) {
					const data = res.data || {}
					const splitRecordId = data.splitRecordId || data.id || ''
					const splitRecord = data.splitRecord || {}
					const splitRecordInfo =
						data.splitRecordInfoList ||
						data.splitRecordInfos ||
						data.splitRecordInfoVos ||
						data.payeeList ||
						data.payees ||
						data.splitRecordInfo ||
						[]
					const list = data.profitRefundRecords || []
					this.detailData = {
						splitRecordId,
						splitRecord: splitRecord || {},
						splitRecordInfo: splitRecordInfo || [],
						profitRefundRecords: Array.isArray(list) ? list : []
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
		isPlatformPayee(row) {
			if (!row) return false
			const merchantId = row.merchantId !== undefined ? row.merchantId : row.merchant_id
			if (merchantId === 0 || merchantId === '0') return true
			if (row.isPlatformMerchant === true || row.is_platform_merchant === true) return true
			if (row.isPlatformMerchant === 1 || row.isPlatformMerchant === '1' || row.is_platform_merchant === 1 || row.is_platform_merchant === '1') return true
			return false
		},
		getPlatformMergeColspan() {
			const props = (this.payeeColumns || []).map(c => c.prop)
			const start = props.indexOf('merchantName')
			if (start === -1) return 1
			const mergeProps = ['merchantName', 'merchantNo', 'settBankAccType', 'settBankAccName', 'settBankBranchId', 'settBankBranchName', 'settBankAccNo']
			let count = 0
			for (let i = start; i < props.length; i++) {
				if (mergeProps.includes(props[i])) count += 1
				else break
			}
			return count || 1
		},
		payeeSpanMethod({ row, column }) {
			if (!this.isPlatformPayee(row)) return { rowspan: 1, colspan: 1 }
			const mergeProps = ['merchantName', 'merchantNo', 'settBankAccType', 'settBankAccName', 'settBankBranchId', 'settBankBranchName', 'settBankAccNo']
			const prop = column && column.property ? column.property : ''
			if (prop === 'merchantName') {
				return { rowspan: 1, colspan: this.getPlatformMergeColspan() }
			}
			if (mergeProps.includes(prop)) {
				return { rowspan: 0, colspan: 0 }
			}
			return { rowspan: 1, colspan: 1 }
		},
		getRefundPlatformMergeColspan() {
			const props = (this.refundRecordColumns || []).map(c => c.prop)
			const start = props.indexOf('merchantName')
			if (start === -1) return 1
			const mergeProps = ['merchantName', 'merchantNo', 'settBankAccType', 'settBankAccName', 'settBankBranchId', 'settBankBranchName', 'settBankAccNo']
			let count = 0
			for (let i = start; i < props.length; i++) {
				if (mergeProps.includes(props[i])) count += 1
				else break
			}
			return count || 1
		},
		refundSpanMethod({ row, column }) {
			if (!this.isPlatformPayee(row)) return { rowspan: 1, colspan: 1 }
			const mergeProps = ['merchantName', 'merchantNo', 'settBankAccType', 'settBankAccName', 'settBankBranchId', 'settBankBranchName', 'settBankAccNo']
			const prop = column && column.property ? column.property : ''
			if (prop === 'merchantName') {
				return { rowspan: 1, colspan: this.getRefundPlatformMergeColspan() }
			}
			if (mergeProps.includes(prop)) {
				return { rowspan: 0, colspan: 0 }
			}
			return { rowspan: 1, colspan: 1 }
		},
		getPayeeColumns(list) {
			const hiddenProps = ['id', 'orderSplitRecordId', 'merchantId', 'userId', 'adminId', 'tenantId', 'stationId', 'isPlatformMerchant', 'busTradeMerNo']
			const labelMap = {
				merchantName: '收款商户',
				merchantNo: '商户号',
				settBankAccType: '结算账户类型',
				settBankAccName: '结算账户名称',
				settBankBranchId: '开户行行号',
				settBankBranchName: '开户行全称',
				settBankAccNo: '银行账号',
				serviceRate: '服务费分账比例(%)',
				serviceAmount: '服务费分账金额(元)',
				electricRate: '电费分账比例(%)',
				electricAmount: '电费分账金额(元)',
				reserveRate: '预约费分账比例(%)',
				reserveAmount: '预约费分账金额(元)',
				occupyRate: '占用费分账比例(%)',
				occupyAmount: '占用费分账金额(元)',	
				createTime: '创建时间',
				updateTime: '更新时间',
				remark: '备注',
			}
			const preferredProps = [
				'merchantName',
				'merchantNo',
				'settBankAccType',
				'settBankAccName',
				'settBankBranchId',
				'settBankBranchName',
				'settBankAccNo',
				'serviceRate',
				'serviceAmount',
				'electricRate',
				'electricAmount',
				'reserveRate',
				'reserveAmount',
				'occupyRate',
				'occupyAmount',
				'remark',
				'createTime',
				'updateTime',
			]
			const keys = this.getDynamicColumns(list).filter(k => !hiddenProps.includes(k))
			const ordered = preferredProps.filter(k => keys.includes(k)).concat(keys.filter(k => !preferredProps.includes(k)))
			return ordered.map(prop => ({ prop, label: labelMap[prop] || prop }))
		},
		getDynamicColumns(list) {
			if (!Array.isArray(list) || list.length === 0) return []
			const first = list[0] || {}
			return Object.keys(first)
		},
		getRefundRecordColumns(list) {
			const hiddenProps = ['id', 'orderProfitRefundRecordId', 'orderSplitRecordId', 'stationId', 'merchantId', 'userId', 'adminId', 'tenantId', 'createUser', 'updateUser', 'busTradeMerNo', 'isPlatformMerchant']	
			const labelMap = {
				orderProfitRefundRecordId: '退款记录ID',
				stationId: '电站ID',
				merchantName: '退款商户',
				merchantNo: '商户号',
				settBankAccType: '结算账户类型',
				settBankAccName: '结算账户名称',
				settBankBranchId: '开户行行号',
				settBankBranchName: '开户行全称',
				settBankAccNo: '银行账号',
				serviceRate: '服务费退款比例(%)',
				serviceAmount: '服务费退款金额(元)',
				electricRate: '电费退款比例(%)',
				electricAmount: '电费退款金额(元)',
				reserveRate: '预约费退款比例(%)',
				reserveAmount: '预约费退款金额(元)',
				occupyRate: '占用费退款比例(%)',
				occupyAmount: '占用费退款金额(元)'
			}
			const preferredProps = [
				'orderProfitRefundRecordId',
				'stationId',
				'merchantName',
				'merchantNo',
				'settBankAccType',
				'settBankAccName',
				'settBankBranchId',
				'settBankBranchName',
				'settBankAccNo',
				'serviceRate',
				'serviceAmount',
				'electricRate',
				'electricAmount',
				'reserveRate',
				'reserveAmount',
				'occupyRate',
				'occupyAmount'
			]
			const keys = this.getDynamicColumns(list).filter(k => !hiddenProps.includes(k))
			const ordered = preferredProps.filter(k => keys.includes(k)).concat(keys.filter(k => !preferredProps.includes(k)))
			return ordered.map(prop => ({ prop, label: labelMap[prop] || prop }))
		},
		formatNullable(val) {
			if (val === 0 || val === '0') return val
			if (val === null || val === undefined || val === '') return '-'
			return val
		}
	}
}
</script>

<style>
</style>
