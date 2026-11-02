<template>
	<div class="app-container">
		<div class="filter-container">
			<el-button type="primary" icon="el-icon-back" @click="handleBack">返回</el-button>
			<el-button v-if="showReconcileButton" type="warning" icon="el-icon-s-check" style="margin-left: 12px;"
				@click="openReconcile">对账处理</el-button>
		</div>
		<div v-loading="loading">
			<el-divider content-position="left">基础信息</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col :span="12"><el-form-item label="运营商户"><span>{{ text(detail.operatorName) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款编号"><span>{{ text(detail.refundCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="支付编号"><span>{{ text(detail.payCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="第三方退款编号"><span>{{ text(detail.thirdRefundCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="用户ID"><span>{{ text(detail.userCode) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款金额"><span class="refund-money-highlight">{{ text(detail.refundMoney) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款来源"><span>{{ refundSourceLabel(detail.refundSource) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款渠道"><span>{{ refundChannelLabel(detail.channel) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款状态"><span>{{ refundStatusLabel(detail.status) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="退款时间"><span>{{ timeText(detail.createTime) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="成功时间"><span>{{ timeText(detail.updateTime) }}</span></el-form-item></el-col>
				</el-row>
			</el-form>

			<el-divider content-position="left">处理结果 / 说明</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col :span="24"><el-form-item label="处理结果"><span class="break-text">{{ text(detail.result) }}</span></el-form-item></el-col>
					<el-col :span="24"><el-form-item label="退款说明"><span class="break-text">{{ text(detail.remark) }}</span></el-form-item></el-col>
				</el-row>
			</el-form>

			<el-divider content-position="left">对账信息</el-divider>
			<el-form label-position="left" label-width="140px" size="mini">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-form-item label="对账状态">
							<span v-if="!detail.reconcileStatus">—</span>
							<el-tag v-else size="small" :type="reconcileTagType(detail.reconcileStatus)">
								{{ reconcileLabel(detail.reconcileStatus) }}
							</el-tag>
						</el-form-item>
					</el-col>
					<el-col :span="12"><el-form-item label="处理人"><span>{{ text(detail.reconcileBy) }}</span></el-form-item></el-col>
					<el-col :span="12"><el-form-item label="处理时间"><span>{{ timeText(detail.reconcileTime) }}</span></el-form-item></el-col>
					<el-col :span="24"><el-form-item label="处理说明"><span class="break-text">{{ text(detail.reconcileRemark) }}</span></el-form-item></el-col>
				</el-row>
			</el-form>
		</div>

		<el-dialog title="人工对账处理" :visible.sync="reconcileVisible" width="520px" :close-on-click-modal="false">
			<div style="margin-bottom: 15px; line-height: 1.8;">
				<div>退款编号：{{ detail.refundCode }}</div>
				<div>退款金额：{{ detail.refundMoney }}</div>
				<div style="word-break: break-all;">处理结果：{{ detail.result }}</div>
			</div>
			<el-form ref="reconcileForm" :model="reconcileForm" :rules="reconcileRules" label-width="90px">
				<el-form-item label="处理结论" prop="reconcileStatus">
					<el-radio-group v-model="reconcileForm.reconcileStatus">
						<el-radio label="DONE">已处理</el-radio>
						<el-radio label="IGNORED">无需处理</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="处理说明" prop="reconcileRemark">
					<el-input v-model="reconcileForm.reconcileRemark" type="textarea" :rows="4" maxlength="255"
						show-word-limit placeholder="请填写核实情况与处理方式，如：已在后台扣回用户余额 30 元" />
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button @click="reconcileVisible = false">取消</el-button>
				<el-button type="primary" :loading="reconcileSubmitting" @click="submitReconcile">确定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	import { getDetail, reconcileRefund } from '@/api/finance/refundRecord.js'
	import { parseTime } from '@/utils/index'
	import { formatDictLabel } from '@/utils/dictionary'

	export default {
		name: 'refundRecordDetail',
		data() {
			return {
				loading: false,
				detail: {},
				reconcileOptions: [
					{ value: 'PENDING', label: '待处理' },
					{ value: 'DONE', label: '已处理' },
					{ value: 'IGNORED', label: '无需处理' }
				],
				reconcileVisible: false,
				reconcileSubmitting: false,
				reconcileForm: {
					reconcileStatus: 'DONE',
					reconcileRemark: ''
				},
				reconcileRules: {
					reconcileStatus: [{ required: true, message: '请选择处理结论', trigger: 'change' }],
					reconcileRemark: [{ required: true, whitespace: true, message: '请填写处理说明', trigger: 'blur' }]
				}
			}
		},
		computed: {
			canReconcile() {
				return this.btnAuthen.permsVerifAuthention(':finance:refundRecord:reconcile')
			},
			showReconcileButton() {
				return this.canReconcile && this.detail.reconcileStatus === 'PENDING'
			}
		},
		watch: {
			'$route.query.id': {
				handler() {
					this.initDetail()
				},
				immediate: true
			}
		},
		created() {
			this.$dict.getSelector('finance_refund_status')
			this.$dict.getSelector('finance_refund_source')
			this.$dict.getSelector('finance_refund_channel')
		},
		methods: {
			initDetail() {
				if (this.$route.name !== 'refundRecordDetail') return
				const id = this.$route.query.id
				if (id === undefined || id === null || id === '') {
					this.$message.error('退款记录ID不能为空')
					this.handleBack()
					return
				}
				this.detail = {}
				this.loadDetail()
			},
			handleBack() {
				if (window.history.length > 1) {
					this.$router.back()
				} else {
					this.$router.push('/finance/refundRecord')
				}
			},
			text(val) {
				if (val === 0 || val === '0') return val
				if (val === null || val === undefined || val === '') return '—'
				return val
			},
			timeText(val) {
				return val ? parseTime(val) : '—'
			},
			refundSourceLabel(value) {
				if (value == null || value === '') return '—'
				return formatDictLabel('finance_refund_source', value)
			},
			refundChannelLabel(value) {
				if (value == null || value === '') return '—'
				return formatDictLabel('finance_refund_channel', value)
			},
			refundStatusLabel(value) {
				if (value == null || value === '') return '—'
				return formatDictLabel('finance_refund_status', value)
			},
			reconcileLabel(value) {
				const item = this.reconcileOptions.find(o => o.value === value)
				return item ? item.label : value
			},
			reconcileTagType(value) {
				if (value === 'DONE') return 'success'
				if (value === 'PENDING') return 'danger'
				return 'info'
			},
			loadDetail() {
				const id = this.$route.query.id
				this.loading = true
				return getDetail({ id }).then(res => {
					if (res && res.code == 200) {
						this.detail = res.data || {}
					} else {
						this.$message.error((res && res.msg) || '查询失败')
					}
				}).catch(() => {
					this.$message.error('查询失败')
				}).finally(() => {
					this.loading = false
				})
			},
			openReconcile() {
				this.reconcileForm = { reconcileStatus: 'DONE', reconcileRemark: '' }
				this.reconcileVisible = true
				this.$nextTick(() => {
					this.$refs.reconcileForm && this.$refs.reconcileForm.clearValidate()
				})
			},
			submitReconcile() {
				this.$refs.reconcileForm.validate(valid => {
					if (!valid) return
					this.reconcileSubmitting = true
					reconcileRefund({
						id: this.detail.id,
						reconcileStatus: this.reconcileForm.reconcileStatus,
						reconcileRemark: this.reconcileForm.reconcileRemark.trim()
					}).then(res => {
						if (res.code == 200) {
							this.$message.success(res.msg || '处理成功')
							this.reconcileVisible = false
							this.loadDetail()
						} else {
							this.$message.error(res.msg)
						}
					}).finally(() => {
						this.reconcileSubmitting = false
					})
				})
			}
		}
	}
</script>

<style>
	.refund-money-highlight {
		color: #f56c6c;
		font-weight: 600;
	}
	.break-text {
		word-break: break-all;
	}
</style>
