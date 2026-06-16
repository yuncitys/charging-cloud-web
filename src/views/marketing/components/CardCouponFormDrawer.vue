<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visibleSync"
    direction="rtl"
    size="680px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" v-loading="loading" class="marketing-activity-drawer__body">
      <!-- 抵用卡 -->
      <el-form v-if="cardCouponType === '1'" ref="formRef" :model="form" :rules="voucherRules" label-width="100px" label-position="top">
        <el-form-item label="抵用卡名称" prop="cardCouponName">
          <el-input v-model="form.cardCouponName" placeholder="请输入抵用卡名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="电费优惠" required>
          <div class="prefixed-field">
            <span class="prefixed-field__label">折扣比例</span>
            <el-input v-model.number="form.powerPercentage" placeholder="请输入电费优惠" type="number">
              <template slot="append">%</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="服务费优惠" required>
          <div class="prefixed-field">
            <span class="prefixed-field__label">折扣比例</span>
            <el-input v-model.number="form.servicePercentage" placeholder="请输入服务费优惠" type="number">
              <template slot="append">%</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item label="抵用卡面额" prop="faceValue">
          <el-input v-model.number="form.faceValue" placeholder="请输入抵用卡面额" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="抵用卡数量" prop="stockNum">
          <el-input v-model.number="form.stockNum" placeholder="请输入抵用卡数量" type="number">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效时间类型" prop="effectiveTimeType">
          <el-radio-group v-model="form.effectiveTimeType">
            <el-radio label="1">相对时间</el-radio>
            <el-radio label="2">绝对时间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.effectiveTimeType === '1'" label="有效时间" prop="afterReceiveDay" required>
          <div class="prefixed-field">
            <span class="prefixed-field__label">领取后</span>
            <el-input v-model.number="form.afterReceiveDay" placeholder="请输入相对时间" type="number">
              <template slot="append">天</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-else label="有效时间" prop="effectiveRange" required>
          <el-date-picker
            v-model="form.effectiveRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="使用说明">
          <el-input v-model="form.useInstructions" type="textarea" :rows="3" placeholder="请输入抵用卡使用说明" />
        </el-form-item>
        <el-form-item label="可用维度" prop="scopeType">
          <el-radio-group v-model="form.scopeType" @change="onScopeTypeChange">
            <el-radio label="1">按城市选择</el-radio>
            <el-radio label="2">按商户选择</el-radio>
            <el-radio label="3">按电站分组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择电站" required>
          <card-coupon-scope-picker
            ref="scopePicker"
            :scope-type="form.scopeType"
            v-model="form.stationIds"
            :group-ids.sync="form.scopeGroupIds"
          />
        </el-form-item>
      </el-form>

      <!-- 优惠券 -->
      <el-form v-else-if="cardCouponType === '2'" ref="formRef" :model="form" :rules="couponRules" label-width="100px" label-position="top">
        <el-form-item label="优惠券名称" prop="cardCouponName">
          <el-input v-model="form.cardCouponName" placeholder="请输入优惠券名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="优惠券面额" required>
          <div class="coupon-face-row">
            <el-select v-model="form.deductionType" style="width: 110px;">
              <el-option label="电费" value="1" />
              <el-option label="服务费" value="2" />
              <el-option label="总费用" value="3" />
            </el-select>
            <span class="coupon-face-row__text">满</span>
            <el-input v-model.number="form.amountLimit" placeholder="金额" style="width: 100px;" type="number" />
            <span class="coupon-face-row__text">元 减</span>
            <el-input v-model.number="form.faceValue" placeholder="金额" style="width: 100px;" type="number" />
            <span class="coupon-face-row__text">元</span>
          </div>
        </el-form-item>
        <el-form-item label="优惠券类型" prop="useType">
          <el-radio-group v-model="form.useType">
            <el-radio label="1">普通券</el-radio>
            <el-radio label="2">会员券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠券数量" prop="stockNum">
          <el-input v-model.number="form.stockNum" placeholder="请输入优惠券数量" type="number">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效时间类型" prop="effectiveTimeType">
          <el-radio-group v-model="form.effectiveTimeType">
            <el-radio label="1">相对时间</el-radio>
            <el-radio label="2">绝对时间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.effectiveTimeType === '1'" label="有效时间" prop="afterReceiveDay" required>
          <div class="prefixed-field">
            <span class="prefixed-field__label">领取后</span>
            <el-input v-model.number="form.afterReceiveDay" placeholder="请输入相对时间" type="number">
              <template slot="append">天</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-else label="有效时间" prop="effectiveRange" required>
          <el-date-picker
            v-model="form.effectiveRange"
            type="datetimerange"
            range-separator="—"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="使用说明">
          <el-input v-model="form.useInstructions" type="textarea" :rows="3" placeholder="请输入优惠券使用说明" />
        </el-form-item>
        <el-form-item label="可用维度" prop="scopeType">
          <el-radio-group v-model="form.scopeType" @change="onScopeTypeChange">
            <el-radio label="1">按城市选择</el-radio>
            <el-radio label="2">按商户选择</el-radio>
            <el-radio label="3">按电站分组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择电站" required>
          <card-coupon-scope-picker
            ref="scopePicker"
            :scope-type="form.scopeType"
            v-model="form.stationIds"
            :group-ids.sync="form.scopeGroupIds"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { cardCouponDetail, createCardCoupon, updateCardCoupon } from '@/api/marketing/marketing'
import CardCouponScopePicker from './CardCouponScopePicker'
import '../styles/marketing.scss'

export default {
  name: 'CardCouponFormDrawer',
  components: { CardCouponScopePicker },
  props: {
    visible: { type: Boolean, default: false },
    cardCouponType: { type: String, required: true },
    cardCouponId: { type: String, default: '' }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      form: {},
      voucherRules: {
        cardCouponName: [{ required: true, message: '请输入抵用卡名称', trigger: 'blur' }],
        faceValue: [{ required: true, message: '请输入抵用卡面额', trigger: 'blur' }],
        stockNum: [{ required: true, message: '请输入抵用卡数量', trigger: 'blur' }],
        effectiveTimeType: [{ required: true, message: '请选择有效时间类型', trigger: 'change' }],
        afterReceiveDay: [{ required: true, message: '请输入相对时间', trigger: 'blur' }],
        effectiveRange: [{ required: true, message: '请选择有效时间', trigger: 'change' }],
        scopeType: [{ required: true, message: '请选择可用维度', trigger: 'change' }]
      },
      couponRules: {
        cardCouponName: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
        useType: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
        stockNum: [{ required: true, message: '请输入优惠券数量', trigger: 'blur' }],
        effectiveTimeType: [{ required: true, message: '请选择有效时间类型', trigger: 'change' }],
        afterReceiveDay: [{ required: true, message: '请输入相对时间', trigger: 'blur' }],
        effectiveRange: [{ required: true, message: '请选择有效时间', trigger: 'change' }],
        scopeType: [{ required: true, message: '请选择可用维度', trigger: 'change' }]
      }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    isEdit() {
      return !!this.cardCouponId
    },
    drawerTitle() {
      const typeLabel = this.cardCouponType === '1' ? '抵用卡' : '优惠券'
      return (this.isEdit ? '编辑' : '新增') + typeLabel
    }
  },
  methods: {
    onOpen() {
      if (this.isEdit) {
        this.loadDetail()
      } else {
        this.resetForm()
      }
    },
    onClose() {
      this.form = {}
    },
    resetForm() {
      const base = {
        cardCouponId: '',
        cardCouponName: '',
        cardCouponType: this.cardCouponType,
        undertakerType: '1',
        undertakerId: '0',
        useType: '1',
        effectiveTimeType: '1',
        afterReceiveDay: 30,
        effectiveRange: [],
        effectiveStartDate: '',
        effectiveEndDate: '',
        useInstructions: '',
        scopeType: '2',
        stationIds: [],
        scopeGroupIds: []
      }
      if (this.cardCouponType === '1') {
        this.form = {
          ...base,
          powerPreferentialWay: '1',
          servicePreferentialWay: '1',
          powerPercentage: '',
          servicePercentage: '',
          faceValue: '',
          stockNum: ''
        }
      } else {
        this.form = {
          ...base,
          deductionType: '1',
          amountLimit: '',
          faceValue: '',
          stockNum: ''
        }
      }
    },
    loadDetail() {
      this.loading = true
      cardCouponDetail(this.cardCouponId).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) return
        const coupon = res.data.coupon || {}
        this.form = {
          cardCouponId: coupon.cardCouponId,
          cardCouponName: coupon.cardCouponName,
          cardCouponType: coupon.cardCouponType,
          undertakerType: coupon.undertakerType || '1',
          undertakerId: coupon.undertakerId || '0',
          useType: coupon.useType || '1',
          deductionType: coupon.deductionType || '1',
          powerPreferentialWay: coupon.powerPreferentialWay || '1',
          servicePreferentialWay: coupon.servicePreferentialWay || '1',
          powerPercentage: coupon.powerPercentage,
          servicePercentage: coupon.servicePercentage,
          faceValue: coupon.faceValue,
          amountLimit: coupon.amountLimit,
          stockNum: coupon.stockNum,
          effectiveTimeType: coupon.effectiveTimeType || '1',
          afterReceiveDay: coupon.afterReceiveDay || 30,
          effectiveRange: coupon.effectiveStartDate && coupon.effectiveEndDate
            ? [coupon.effectiveStartDate, coupon.effectiveEndDate] : [],
          effectiveStartDate: coupon.effectiveStartDate || '',
          effectiveEndDate: coupon.effectiveEndDate || '',
          useInstructions: coupon.useInstructions || '',
          scopeType: coupon.scopeType || '2',
          stationIds: (res.data.stationIds || []).map(String),
          scopeGroupIds: []
        }
      }).catch(() => { this.loading = false })
    },
    onScopeTypeChange() {
      this.form.stationIds = []
      this.form.scopeGroupIds = []
    },
    validateCustom() {
      const type = this.cardCouponType
      if (type === '1') {
        const power = this.form.powerPercentage
        const service = this.form.servicePercentage
        if ((power === '' || power == null) && (service === '' || service == null)) {
          return '请至少填写电费或服务费的优惠比例'
        }
      }
      if (type === '2') {
        if (!this.form.faceValue || Number(this.form.faceValue) <= 0) return '请输入有效的减免金额'
        if (this.form.amountLimit === '' || this.form.amountLimit == null || Number(this.form.amountLimit) < 0) {
          return '请输入有效的满减门槛'
        }
      }
      if (this.form.effectiveTimeType === '1') {
        if (!this.form.afterReceiveDay || this.form.afterReceiveDay < 1) return '请输入有效的相对时间'
      } else if (!this.form.effectiveRange || this.form.effectiveRange.length !== 2) {
        return '请选择有效时间'
      }
      const msg = this.$refs.scopePicker && this.$refs.scopePicker.validate()
      if (msg) return msg
      return ''
    },
    buildPayload() {
      const payload = { ...this.form }
      payload.cardCouponType = this.cardCouponType
      if (payload.effectiveTimeType === '1') {
        payload.effectiveStartDate = ''
        payload.effectiveEndDate = ''
      } else if (payload.effectiveRange && payload.effectiveRange.length === 2) {
        payload.effectiveStartDate = payload.effectiveRange[0]
        payload.effectiveEndDate = payload.effectiveRange[1]
      }
      delete payload.effectiveRange
      delete payload.scopeGroupIds
      if (payload.scopeType === '3') {
        payload.stationIds = []
      }
      return payload
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const customErr = this.validateCustom()
        if (customErr) {
          this.$message.warning(customErr)
          return
        }
        const payload = this.buildPayload()
        this.submitting = true
        const api = this.isEdit ? updateCardCoupon : createCardCoupon
        api(payload).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.visibleSync = false
            this.$emit('saved')
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.prefixed-field {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.prefixed-field__label {
  flex-shrink: 0;
  padding: 0 12px;
  line-height: 36px;
  background: #f5f7fa;
  color: #606266;
  font-size: 13px;
  border-right: 1px solid #dcdfe6;
}
.prefixed-field >>> .el-input__inner {
  border: none;
  border-radius: 0;
}
.prefixed-field >>> .el-input-group__append {
  border: none;
  background: #f5f7fa;
}
.coupon-face-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.coupon-face-row__text {
  font-size: 14px;
  color: #606266;
}
</style>
