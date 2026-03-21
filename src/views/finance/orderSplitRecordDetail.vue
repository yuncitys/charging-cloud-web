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
					<el-col :span="12"><el-form-item label="收款账号"><span>{{ formatNullable(splitRecord.merchantName) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账金额(元)"><span>{{ formatNullable(splitRecord.splitAmount) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="到账金额(元)"><span>{{ formatNullable(splitRecord.amount) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="追回金额(元)"><span>{{ formatNullable(splitRecord.refundedAmount) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="手续费(元)"><span>{{ formatNullable(splitRecord.serviceCharge) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账比例(%)"><span>{{ formatNullable(splitRecord.splitRate) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="状态"><span>{{ formatNullable(splitRecord.status) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="分账时间"><span>{{ formatNullable(splitRecord.createTime) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="更新时间"><span>{{ formatNullable(splitRecord.updateTime) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="失败原因"><span>{{ formatNullable(splitRecord.failReason) }}</span></el-form-item></el-col>
					<!-- <el-col :span="12"><el-form-item label="备注"><span>{{ formatNullable(splitRecord.remark) }}</span></el-form-item></el-col> -->
					<el-col :span="24"><el-form-item label="分账详情"><span>{{ formatNullable(splitRecord.billingDetails) }}</span></el-form-item></el-col>
				</el-row>
			</el-form>

			<el-divider content-position="left">收款信息</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col v-for="item in splitRecordInfoItems" :key="item.prop" :span="12">
						<el-form-item :label="item.label">
							<span>{{ formatNullable(splitRecordInfo[item.prop]) }}</span>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>

			<el-divider content-position="left">退款记录</el-divider>
			<el-table v-if="profitRefundRecords.length" :data="profitRefundRecords" border size="mini" style="width: 100%;">
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
				splitRecordInfo: {},
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
			return this.detailData && this.detailData.splitRecordInfo ? this.detailData.splitRecordInfo : {}
		},
		profitRefundRecords() {
			return (this.detailData && Array.isArray(this.detailData.profitRefundRecords)) ? this.detailData.profitRefundRecords : []
		},
		refundRecordColumns() {
			return this.getRefundRecordColumns(this.profitRefundRecords)
		},
		splitRecordInfoItems() {
			return this.getObjectItems(this.splitRecordInfo)
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
			this.detailData = { splitRecordId: '', splitRecord: {}, splitRecordInfo: {}, profitRefundRecords: [] }
			getDetail({ id: this.id }).then(res => {
				if (res && res.code == 200) {
					const data = res.data || {}
					const splitRecordId = data.splitRecordId || data.id || ''
					const splitRecord = data.splitRecord || {}
					const splitRecordInfo = data.splitRecordInfo || {}
					const list = data.profitRefundRecords || []
					this.detailData = {
						splitRecordId,
						splitRecord: splitRecord || {},
						splitRecordInfo: splitRecordInfo || {},
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
		getObjectItems(obj) {
			if (!obj || typeof obj !== 'object') return []
			const hiddenProps = ['id', 'orderSplitRecordId', 'merchantId', 'userId', 'adminId', 'tenantId','stationId','isPlatformMerchant','busTradeMerNo']
			const labelMap = {
				orderCode: '结算订单',
				splitOrderCode: '分账订单',
				amount: '到账金额(元)',
				splitAmount: '分账金额(元)',
				serviceCharge: '手续费(元)',
				splitRate: '分账比例(%)',
				refundedAmount: '追回金额(元)',
				status: '状态',
				createTime: '创建时间',
				updateTime: '更新时间',
				remark: '备注',

				merchantName: '收款商户',
				merchantNo: '商户号',
				settBankAccType: '结算账户类型',
				settBankAccName: '结算账户名称',
				settBankBranchId: '开户行行号',
				settBankBranchName: '开户行全称',
				settBankAccNo: '银行账号',
				serviceRate: '服务费分账比例(%)',
				electricRate: '电费分账比例(%)',
				reserveRate: '预约费分账比例(%)',
				occupyRate: '占用费分账比例(%)',
			}
			const preferredProps = [
				'merchantName',
				'merchantNo',
				'settBankAccType',
				'settBankAccName',
				'settBankBranchId',
				'settBankBranchName',
				'settBankAccNo',
			]
			const keys = Object.keys(obj).filter(k => !hiddenProps.includes(k))
			const ordered = preferredProps.filter(k => keys.includes(k)).concat(keys.filter(k => !preferredProps.includes(k)))
			return ordered.map(prop => ({ prop, label: labelMap[prop] || prop }))
		},
		getDynamicColumns(list) {
			if (!Array.isArray(list) || list.length === 0) return []
			const first = list[0] || {}
			return Object.keys(first)
		},
		getRefundRecordColumns(list) {
			const hiddenProps = ['id', 'orderSplitRecordId', 'userId', 'adminId', 'tenantId','createUser','updateUser']
			const labelMap = {
				orderCode: '退款订单',
				splitOrderCode: '支付订单',
				outReturnNo: '第三方退款单号',
				returnMchid: '退款商户号',
				amount: '退款金额',
				status: '状态',
				failReason: '失败原因',
				remark: '备注',
				createTime: '创建时间',
				updateTime: '更新时间'
			}
			const preferredProps = [
				'id',
				'orderCode',
				'splitOrderCode',
				'outReturnNo',
				'returnMchid',
				'amount',
				'status',
				'failReason',
				'remark',
				'createTime',
				'updateTime'
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
