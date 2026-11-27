<template>
  <el-drawer
    title="异常订单结算"
    :visible="visible"
    direction="rtl"
    size="960px"
    append-to-body
    :wrapper-closable="false"
    custom-class="abnormal-settle-drawer"
    @close="close"
  >
    <div v-if="row" class="abnormal-settle">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="确认结算将按平台四段单价重新计费，金额以 min(四段合计, 订单金额) 钳制；提交前请核对预览。"
      />

      <el-descriptions :column="3" border size="small" style="margin-top: 12px;">
        <el-descriptions-item label="订单号">{{ row.orderCode }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ payTypeText(row.payType) }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">{{ money(row.orderTotalPrice || row.totalPrice) }}</el-descriptions-item>
        <el-descriptions-item label="上报电量">{{ money(row.reportedPower) }} 度</el-descriptions-item>
        <el-descriptions-item label="上报金额">{{ money(row.reportedAmount) }} 元</el-descriptions-item>
        <el-descriptions-item label="异常类型">{{ row.abnormalType || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-form label-position="left" label-width="96px" size="small" style="margin-top: 12px;">
        <el-form-item label="结算方式">
          <el-radio-group v-model="form.mode" @change="onModeChange">
            <el-radio label="CORRECTED">修正后结算</el-radio>
            <el-radio label="REPORTED">按上报值结算</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.mode === 'CORRECTED'">
          <el-form-item label="总电量">
            <el-input-number v-model="form.totalPower" :min="0" :precision="4" :step="0.1" style="width: 180px;" />
            <el-button size="mini" type="primary" style="margin-left: 8px;" @click="autoSplit">按上报占比分摊</el-button>
            <span class="tip">只填总电量时，点“按上报占比分摊”生成四段，可再逐段微调</span>
          </el-form-item>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="尖电量">
                <el-input-number v-model="form.jian" :min="0" :precision="4" :step="0.1" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="峰电量">
                <el-input-number v-model="form.feng" :min="0" :precision="4" :step="0.1" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="平电量">
                <el-input-number v-model="form.ping" :min="0" :precision="4" :step="0.1" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="谷电量">
                <el-input-number v-model="form.gu" :min="0" :precision="4" :step="0.1" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-form-item>
          <el-button size="small" type="primary" :loading="previewLoading" @click="doPreview">结算预览</el-button>
        </el-form-item>
      </el-form>

      <template v-if="preview">
        <el-divider content-position="left">预览结果</el-divider>
        <el-alert
          v-if="preview.clamped"
          type="warning"
          :closable="false"
          show-icon
          :title="`发生钳制：四段计算 ${money(preview.calcAmount)} 元 → 结算 ${money(preview.settleAmount)} 元（差额 ${money(preview.diffAmount)} 元）`"
          style="margin-bottom: 10px;"
        />
        <el-descriptions :column="4" border size="small">
          <el-descriptions-item label="计算合计">{{ money(preview.calcAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="结算金额">{{ money(preview.settleAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="电费">{{ money(preview.electricityPrice) }} 元</el-descriptions-item>
          <el-descriptions-item label="服务费">{{ money(preview.servicePrice) }} 元</el-descriptions-item>
          <el-descriptions-item label="结算总电量">{{ money(preview.totalPower) }} 度</el-descriptions-item>
          <el-descriptions-item label="支付动作">{{ payModeText(preview.payMode) }}</el-descriptions-item>
          <el-descriptions-item label="扣款金额">{{ money(preview.deductAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="退款金额">{{ money(preview.refundAmount) }} 元</el-descriptions-item>
        </el-descriptions>

        <el-table :data="preview.periods" size="mini" border style="margin-top: 10px;">
          <el-table-column prop="name" label="时段" width="70" align="center" />
          <el-table-column prop="electric" label="电量(度)" align="right" />
          <el-table-column prop="electricityUnit" label="电费单价" align="right" />
          <el-table-column prop="serviceUnit" label="服务费单价" align="right" />
          <el-table-column prop="electricityAmount" label="电费(元)" align="right" />
          <el-table-column prop="serviceAmount" label="服务费(元)" align="right" />
          <el-table-column prop="amount" label="小计(元)" align="right" />
        </el-table>
        <div class="tip" style="margin-top: 6px;">{{ preview.note }}</div>
      </template>

      <el-form label-position="left" label-width="96px" size="small" style="margin-top: 12px;">
        <el-form-item label="原因" required>
          <el-input v-model="form.reason" maxlength="255" show-word-limit placeholder="必填：修正依据 / 与用户沟通情况" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" maxlength="500" show-word-limit type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="needConfirm">
          <el-checkbox v-model="form.confirmed">结算金额 ≥ {{ confirmThreshold }} 元，我已二次核对并确认</el-checkbox>
        </el-form-item>
      </el-form>
    </div>

    <div class="drawer-footer">
      <el-button size="small" @click="close">取消</el-button>
      <el-button size="small" type="primary" :loading="submitting" :disabled="!canSubmit" @click="doSubmit">确认结算</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { previewAbnormalSettle, settleAbnormal } from '@/api/order/abnormalOrder.js'
import { formatDictLabel, normalizeOrderPayMethodCode } from '@/utils/dictionary'

export default {
  name: 'AbnormalSettleDialog',
  props: {
    visible: { type: Boolean, default: false },
    row: { type: Object, default: null },
    confirmThreshold: { type: Number, default: 100 }
  },
  data() {
    return {
      form: this.emptyForm(),
      preview: null,
      previewLoading: false,
      submitting: false
    }
  },
  computed: {
    needConfirm() {
      return this.preview && Number(this.preview.settleAmount) >= this.confirmThreshold
    },
    canSubmit() {
      if (!this.preview || !this.preview.previewToken) return false
      if (!this.form.reason || !this.form.reason.trim()) return false
      if (this.needConfirm && !this.form.confirmed) return false
      return true
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.reset()
      }
    }
  },
  mounted() {
    this.$dict.getSelector('order_pay_method')
  },
  methods: {
    emptyForm() {
      return {
        mode: 'CORRECTED',
        totalPower: undefined,
        jian: undefined,
        feng: undefined,
        ping: undefined,
        gu: undefined,
        reason: '',
        remark: '',
        confirmed: false
      }
    },
    reset() {
      this.form = this.emptyForm()
      this.preview = null
      if (this.row) {
        this.form.totalPower = this.numberOrUndefined(this.row.reportedPower)
        this.form.jian = this.numberOrUndefined(this.row.reportedJele)
        this.form.feng = this.numberOrUndefined(this.row.reportedFele)
        this.form.ping = this.numberOrUndefined(this.row.reportedPele)
        this.form.gu = this.numberOrUndefined(this.row.reportedGele)
      }
    },
    close() {
      this.$emit('update:visible', false)
    },
    onModeChange() {
      this.preview = null
    },
    autoSplit() {
      const total = Number(this.form.totalPower || 0)
      const base = [this.row.reportedJele, this.row.reportedFele, this.row.reportedPele, this.row.reportedGele].map((v) => Number(v || 0))
      const sum = base.reduce((a, b) => a + b, 0)
      if (!total || total <= 0) {
        this.$message.warning('请先填写总电量')
        return
      }
      if (sum <= 0) {
        this.$message.warning('上报四段电量为空，请逐段填写')
        return
      }
      const parts = [0, 0, 0, 0]
      let assigned = 0
      for (let i = 0; i < 3; i++) {
        parts[i] = Math.round((total * base[i] / sum) * 10000) / 10000
        assigned += parts[i]
      }
      parts[3] = Math.round((total - assigned) * 10000) / 10000
      this.form.jian = parts[0]
      this.form.feng = parts[1]
      this.form.ping = parts[2]
      this.form.gu = parts[3]
    },
    buildParams() {
      const params = {
        id: this.row.id,
        orderCode: this.row.orderCode,
        mode: this.form.mode,
        totalPower: this.form.totalPower,
        reason: this.form.reason,
        remark: this.form.remark
      }
      if (this.form.mode === 'CORRECTED') {
        params.jian = this.form.jian
        params.feng = this.form.feng
        params.ping = this.form.ping
        params.gu = this.form.gu
      }
      if (this.preview && this.preview.previewToken) {
        params.previewToken = this.preview.previewToken
      }
      if (this.needConfirm && this.form.confirmed) {
        params.confirmed = true
      }
      return params
    },
    doPreview() {
      if (this.form.mode === 'CORRECTED') {
        const values = [this.form.jian, this.form.feng, this.form.ping, this.form.gu]
        if (values.some((v) => v === undefined || v === null || v === '')) {
          this.$message.warning('请填写四段电量，或填写总电量后分摊')
          return
        }
      }
      this.previewLoading = true
      previewAbnormalSettle(this.buildParams()).then((res) => {
        if (res.code === 200 && res.data) {
          this.preview = res.data
          if (Number(res.data.settleAmount) < this.confirmThreshold) {
            this.form.confirmed = false
          }
        } else {
          this.$message.error(res.msg || '预览失败')
        }
      }).catch(() => {
        this.$message.error('预览失败')
      }).finally(() => {
        this.previewLoading = false
      })
    },
    doSubmit() {
      if (!this.canSubmit) {
        this.$message.warning('请先完成预览、填写原因并勾选二次确认')
        return
      }
      this.submitting = true
      settleAbnormal(this.buildParams()).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg || '结算完成')
          this.$emit('success')
          this.close()
        } else {
          this.$message.error(res.msg || '结算失败')
        }
      }).catch(() => {
        this.$message.error('结算失败')
      }).finally(() => {
        this.submitting = false
      })
    },
    numberOrUndefined(value) {
      const num = Number(value)
      return Number.isFinite(num) && num > 0 ? num : undefined
    },
    payTypeText(payType) {
      if (!payType) return '-'
      const code = normalizeOrderPayMethodCode(payType)
      const label = formatDictLabel('order_pay_method', code)
      return label === code ? payType : label
    },
    money(value) {
      if (value === null || value === undefined || value === '') return '-'
      const num = Number(value)
      return Number.isFinite(num) ? num.toFixed(2) : value
    },
    payModeText(mode) {
      const map = {
        BALANCE_DEDUCT: '扣余额/企业钱包',
        WECHAT_REFUND: '微信退款',
        SWIPE_CARD: '扣电卡',
        FREE: '免费单记账',
        MONTH_CARD: '月卡记账',
        EVCS: '互联互通记账'
      }
      return map[mode] || mode || '-'
    }
  }
}
</script>

<style scoped>
.abnormal-settle .tip {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

</style>

<style>
.abnormal-settle-drawer .el-drawer__body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 55px);
  padding: 0;
  overflow: hidden;
}
.abnormal-settle-drawer .abnormal-settle {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 20px 12px;
}
.abnormal-settle-drawer .drawer-footer {
  flex: 0 0 auto;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  text-align: right;
}
</style>
