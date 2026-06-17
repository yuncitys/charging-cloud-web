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
      <!-- 抵用卡 / 电量卡 / 折扣券 -->
      <el-form v-if="isThresholdLimitCard" ref="formRef" :model="form" :rules="thresholdLimitRules" label-width="100px" label-position="top">
        <el-form-item :label="quotaTypeLabel + '名称'" prop="cardCouponName">
          <el-input v-model="form.cardCouponName" :placeholder="'请输入' + quotaTypeLabel + '名称'" maxlength="50" />
        </el-form-item>
        <el-form-item label="抵扣类型" prop="deductionType">
          <el-radio-group v-model="form.deductionType">
            <el-radio label="1">电费</el-radio>
            <el-radio label="2">服务费</el-radio>
            <el-radio label="3">总费用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="faceValueLabel" prop="faceValue">
          <el-input v-model.number="form.faceValue" :placeholder="faceValuePlaceholder" type="number">
            <template slot="append">{{ faceValueUnit }}</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="isDiscountCard" label="折扣上限" prop="amountLimit">
          <el-input v-model.number="form.amountLimit" placeholder="请输入单笔最高优惠金额" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="使用门槛" prop="useThresholdType">
          <el-radio-group v-model="form.useThresholdType" @change="onThresholdTypeChange">
            <el-radio label="0">无门槛</el-radio>
            <el-radio label="1">满元</el-radio>
            <el-radio label="2">满度</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.useThresholdType === '1'" label="满元门槛" prop="useThresholdValue">
          <el-input v-model.number="form.useThresholdValue" placeholder="请输入订单金额门槛" type="number">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="form.useThresholdType === '2'" label="满度门槛" prop="useThresholdValue">
          <el-input v-model.number="form.useThresholdValue" placeholder="请输入充电度数门槛" type="number">
            <template slot="append">度</template>
          </el-input>
        </el-form-item>
        <template v-if="!isDiscountCard">
          <el-form-item label="使用限额" prop="useLimitType">
          <el-radio-group v-model="form.useLimitType" @change="onUseLimitTypeChange">
            <el-radio label="1">每日限额</el-radio>
            <el-radio label="2">每笔限额</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.useLimitType === '1'" label="每日限额" prop="dailyLimitValue">
          <el-input v-model.number="form.dailyLimitValue" placeholder="请输入每日使用限额" type="number">
            <template slot="append">{{ dailyLimitUnit }}</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="form.useLimitType === '2'" label="每笔限额" prop="orderLimitValue">
          <el-input v-model.number="form.orderLimitValue" :placeholder="orderLimitPlaceholder" type="number">
            <template slot="append">{{ orderLimitUnit }}</template>
          </el-input>
        </el-form-item>
        </template>
        <el-form-item :label="quotaTypeLabel + '数量'" prop="stockNum">
          <el-input v-model.number="form.stockNum" :placeholder="'请输入' + quotaTypeLabel + '数量'" type="number">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效时间类型" prop="effectiveTimeType">
          <el-radio-group v-model="form.effectiveTimeType">
            <el-radio label="1">相对时间</el-radio>
            <el-radio label="2">绝对时间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.effectiveTimeType === '1'" label="有效时间" prop="afterReceiveDay">
          <div class="prefixed-field">
            <span class="prefixed-field__label">领取后</span>
            <el-input v-model.number="form.afterReceiveDay" placeholder="请输入相对时间" type="number">
              <template slot="append">天</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-else label="有效时间" prop="effectiveRange">
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
          <el-input v-model="form.useInstructions" type="textarea" :rows="3" :placeholder="'请输入' + quotaTypeLabel + '使用说明'" />
        </el-form-item>
        <el-form-item label="可用维度" prop="scopeType">
          <el-radio-group v-model="form.scopeType" @change="onScopeTypeChange">
            <el-radio label="1">按城市选择</el-radio>
            <el-radio label="2">按商户选择</el-radio>
            <el-radio label="3">按电站分组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择电站" prop="stationIds">
          <card-coupon-scope-picker
            ref="scopePicker"
            :scope-type="form.scopeType"
            v-model="form.stationIds"
            :group-ids.sync="form.scopeGroupIds"
          />
        </el-form-item>
      </el-form>

      <!-- 满减券 -->
      <el-form v-else-if="cardCouponType === '2'" ref="formRef" :model="form" :rules="fullReductionRules" label-width="100px" label-position="top">
        <el-form-item label="满减券名称" prop="cardCouponName">
          <el-input v-model="form.cardCouponName" placeholder="请输入满减券名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="满减券面额" prop="couponFace">
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
        <el-form-item label="券种类型" prop="useType">
          <el-radio-group v-model="form.useType">
            <el-radio label="1">普通券</el-radio>
            <el-radio label="2">会员券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="满减券数量" prop="stockNum">
          <el-input v-model.number="form.stockNum" placeholder="请输入满减券数量" type="number">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="有效时间类型" prop="effectiveTimeType">
          <el-radio-group v-model="form.effectiveTimeType">
            <el-radio label="1">相对时间</el-radio>
            <el-radio label="2">绝对时间</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.effectiveTimeType === '1'" label="有效时间" prop="afterReceiveDay">
          <div class="prefixed-field">
            <span class="prefixed-field__label">领取后</span>
            <el-input v-model.number="form.afterReceiveDay" placeholder="请输入相对时间" type="number">
              <template slot="append">天</template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item v-else label="有效时间" prop="effectiveRange">
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
          <el-input v-model="form.useInstructions" type="textarea" :rows="3" placeholder="请输入满减券使用说明" />
        </el-form-item>
        <el-form-item label="可用维度" prop="scopeType">
          <el-radio-group v-model="form.scopeType" @change="onScopeTypeChange">
            <el-radio label="1">按城市选择</el-radio>
            <el-radio label="2">按商户选择</el-radio>
            <el-radio label="3">按电站分组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择电站" prop="stationIds">
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
import { getCardCouponTypeLabel, isThresholdLimitCardType, isDiscountCardType, getFaceValueUnit } from '../constants/cardCoupon'
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
    const validateUseThresholdValue = (rule, value, callback) => {
      if (!isThresholdLimitCardType(this.cardCouponType)) {
        callback()
        return
      }
      const type = this.form.useThresholdType
      if (type === '0') {
        callback()
        return
      }
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error('请输入有效的使用门槛'))
        return
      }
      callback()
    }
    const validateDailyLimit = (rule, value, callback) => {
      if (!isThresholdLimitCardType(this.cardCouponType) || isDiscountCardType(this.cardCouponType) || this.form.useLimitType !== '1') {
        callback()
        return
      }
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error('请输入有效的每日限额'))
        return
      }
      callback()
    }
    const validateOrderLimit = (rule, value, callback) => {
      if (!isThresholdLimitCardType(this.cardCouponType) || isDiscountCardType(this.cardCouponType) || this.form.useLimitType !== '2') {
        callback()
        return
      }
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error('请输入有效的每笔限额'))
        return
      }
      if (this.cardCouponType === '1' && Number(value) > 100) {
        callback(new Error('每笔限额比例须在0-100之间'))
        return
      }
      callback()
    }
    const validateFaceValue = (rule, value, callback) => {
      if (!isThresholdLimitCardType(this.cardCouponType)) {
        callback()
        return
      }
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error(this.isDiscountCard ? '请输入有效的折扣比例' : '请输入面额'))
        return
      }
      if (this.isDiscountCard && Number(value) > 100) {
        callback(new Error('折扣比例须在0-100之间'))
        return
      }
      callback()
    }
    const validateDiscountCap = (rule, value, callback) => {
      if (!this.isDiscountCard) {
        callback()
        return
      }
      if (value === '' || value == null || Number(value) <= 0) {
        callback(new Error('请输入有效的折扣上限'))
        return
      }
      callback()
    }
    const validateCouponFace = (rule, value, callback) => {
      if (this.cardCouponType !== '2') {
        callback()
        return
      }
      if (!this.form.faceValue || Number(this.form.faceValue) <= 0) {
        callback(new Error('请输入有效的减免金额'))
        return
      }
      if (this.form.amountLimit === '' || this.form.amountLimit == null || Number(this.form.amountLimit) < 0) {
        callback(new Error('请输入有效的满减门槛'))
        return
      }
      callback()
    }
    const validateStationIds = (rule, value, callback) => {
      const msg = this.$refs.scopePicker && this.$refs.scopePicker.validate()
      if (msg) {
        callback(new Error(msg))
        return
      }
      callback()
    }
    const thresholdLimitRules = {
      cardCouponName: [{ required: true, message: '请输入卡券名称', trigger: 'blur' }],
      deductionType: [{ required: true, message: '请选择抵扣类型', trigger: 'change' }],
      faceValue: [{ required: true, validator: validateFaceValue, trigger: 'blur' }],
      amountLimit: [{ required: true, validator: validateDiscountCap, trigger: 'blur' }],
      useThresholdType: [{ required: true, message: '请选择使用门槛', trigger: 'change' }],
      useThresholdValue: [{ validator: validateUseThresholdValue, trigger: 'blur' }],
      useLimitType: [{ required: true, message: '请选择使用限额类型', trigger: 'change' }],
      dailyLimitValue: [{ required: true, validator: validateDailyLimit, trigger: 'blur' }],
      orderLimitValue: [{ required: true, validator: validateOrderLimit, trigger: 'blur' }],
      stockNum: [{ required: true, message: '请输入数量', trigger: 'blur' }],
      effectiveTimeType: [{ required: true, message: '请选择有效时间类型', trigger: 'change' }],
      afterReceiveDay: [{ required: true, message: '请输入相对时间', trigger: 'blur' }],
      effectiveRange: [{ required: true, message: '请选择有效时间', trigger: 'change' }],
      scopeType: [{ required: true, message: '请选择可用维度', trigger: 'change' }],
      stationIds: [{ required: true, validator: validateStationIds, trigger: 'change' }]
    }
    return {
      loading: false,
      submitting: false,
      form: {},
      thresholdLimitRules,
      fullReductionRules: {
        cardCouponName: [{ required: true, message: '请输入满减券名称', trigger: 'blur' }],
        couponFace: [{ required: true, validator: validateCouponFace, trigger: 'change' }],
        useType: [{ required: true, message: '请选择券种类型', trigger: 'change' }],
        stockNum: [{ required: true, message: '请输入满减券数量', trigger: 'blur' }],
        effectiveTimeType: [{ required: true, message: '请选择有效时间类型', trigger: 'change' }],
        afterReceiveDay: [{ required: true, message: '请输入相对时间', trigger: 'blur' }],
        effectiveRange: [{ required: true, message: '请选择有效时间', trigger: 'change' }],
        scopeType: [{ required: true, message: '请选择可用维度', trigger: 'change' }],
        stationIds: [{ required: true, validator: validateStationIds, trigger: 'change' }]
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
    isThresholdLimitCard() {
      return isThresholdLimitCardType(this.cardCouponType)
    },
    isDiscountCard() {
      return isDiscountCardType(this.cardCouponType)
    },
    quotaTypeLabel() {
      return getCardCouponTypeLabel(this.cardCouponType)
    },
    faceValueLabel() {
      return this.isDiscountCard ? '折扣值' : this.quotaTypeLabel + '面额'
    },
    faceValuePlaceholder() {
      return this.isDiscountCard ? '请输入折扣比例' : '请输入' + this.quotaTypeLabel + '面额'
    },
    faceValueUnit() {
      return getFaceValueUnit(this.cardCouponType)
    },
    dailyLimitUnit() {
      return this.cardCouponType === '3' ? '度' : '元'
    },
    orderLimitUnit() {
      return this.cardCouponType === '3' ? '度' : '%'
    },
    orderLimitPlaceholder() {
      return this.cardCouponType === '3' ? '请输入每笔使用限额' : '请输入订单金额比例'
    },
    drawerTitle() {
      return (this.isEdit ? '编辑' : '新增') + this.quotaTypeLabel
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
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
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
      if (this.isThresholdLimitCard) {
        this.form = {
          ...base,
          deductionType: '1',
          faceValue: '',
          amountLimit: '',
          useThresholdType: '0',
          useThresholdValue: '',
          useLimitType: '1',
          dailyLimitValue: '',
          orderLimitValue: '',
          stockNum: ''
        }
      } else {
        this.form = {
          ...base,
          deductionType: '1',
          amountLimit: '',
          faceValue: '',
          stockNum: '',
          couponFace: '1'
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
          faceValue: coupon.faceValue,
          amountLimit: coupon.amountLimit,
          useThresholdType: coupon.useThresholdType != null ? String(coupon.useThresholdType) : '0',
          useThresholdValue: coupon.useThresholdValue,
          useLimitType: this.resolveUseLimitType(coupon),
          dailyLimitValue: coupon.dailyLimitValue,
          orderLimitValue: coupon.orderLimitValue,
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
          scopeGroupIds: [],
          couponFace: '1'
        }
      }).catch(() => { this.loading = false })
    },
    onScopeTypeChange() {
      this.form.stationIds = []
      this.form.scopeGroupIds = []
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate('stationIds')
        }
      })
    },
    onThresholdTypeChange() {
      this.form.useThresholdValue = ''
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate('useThresholdValue')
        }
      })
    },
    onUseLimitTypeChange() {
      if (this.form.useLimitType === '1') {
        this.form.orderLimitValue = ''
      } else if (this.form.useLimitType === '2') {
        this.form.dailyLimitValue = ''
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate(['dailyLimitValue', 'orderLimitValue'])
        }
      })
    },
    resolveUseLimitType(coupon) {
      if (coupon.useLimitType) return String(coupon.useLimitType)
      if (coupon.orderLimitValue != null && coupon.orderLimitValue !== '') return '2'
      return '1'
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
      if (this.isThresholdLimitCard) {
        if (payload.useThresholdType === '0') {
          payload.useThresholdValue = null
        }
        if (!this.isDiscountCard) {
          payload.amountLimit = null
        } else {
          payload.useLimitType = null
          payload.dailyLimitValue = null
          payload.orderLimitValue = null
        }
        if (!this.isDiscountCard) {
          if (payload.useLimitType === '1') {
            payload.orderLimitValue = null
          } else if (payload.useLimitType === '2') {
            payload.dailyLimitValue = null
          }
        }
      } else {
        payload.useThresholdType = null
        payload.useThresholdValue = null
        payload.useLimitType = null
        payload.dailyLimitValue = null
        payload.orderLimitValue = null
      }
      delete payload.effectiveRange
      delete payload.scopeGroupIds
      delete payload.couponFace
      if (payload.scopeType === '3') {
        payload.stationIds = []
      }
      return payload
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
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
