<template>
  <div class="app-container">
    <el-page-header :content="isEdit ? '编辑卡券' : '新增卡券'" @back="goBack" />

    <el-form ref="form" v-loading="loading" :model="form" :rules="rules" label-width="120px" style="margin-top: 24px; max-width: 900px;">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form-item label="卡券名称" prop="cardCouponName">
            <el-input v-model="form.cardCouponName" placeholder="请输入卡券名称" />
          </el-form-item>
          <el-form-item label="卡券类型" prop="cardCouponType">
            <el-radio-group v-model="form.cardCouponType" :disabled="isEdit">
              <el-radio v-for="item in cardCouponTypeOptions" :key="'ct'+item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否优惠共享" prop="discountShareFlag">
            <el-radio-group v-model="form.discountShareFlag">
              <el-radio v-for="item in discountShareFlagOptions" :key="'sf'+item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="库存数量" prop="stockNum">
            <el-input-number v-model="form.stockNum" :min="1" :max="9999999" />
          </el-form-item>
          <el-form-item label="使用说明">
            <el-input v-model="form.useInstructions" type="textarea" :rows="3" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="优惠规则" name="discount">
          <el-form-item label="抵扣类型" prop="deductionType">
            <el-select v-model="form.deductionType" placeholder="请选择">
              <el-option v-for="item in deductionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item :label="faceValueFieldLabel" prop="faceValue">
            <el-input-number v-model="form.faceValue" :min="0" :max="form.cardCouponType === '4' ? 100 : undefined" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item v-if="form.cardCouponType === '4'" label="折扣上限(元)" prop="amountLimit">
            <el-input-number v-model="form.amountLimit" :min="0.01" :precision="2" :step="1" />
          </el-form-item>
          <template v-if="isThresholdLimitCardType(form.cardCouponType)">
            <el-form-item label="使用门槛" prop="useThresholdType">
              <el-radio-group v-model="form.useThresholdType" @change="form.useThresholdValue = null">
                <el-radio v-for="item in useThresholdTypeOptions" :key="'ut'+item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.useThresholdType === '1'" label="满元门槛">
              <el-input-number v-model="form.useThresholdValue" :min="0" :precision="2" :step="1" />
            </el-form-item>
            <el-form-item v-if="form.useThresholdType === '2'" label="满度门槛">
              <el-input-number v-model="form.useThresholdValue" :min="0" :precision="2" :step="0.01" />
            </el-form-item>
            <template v-if="form.cardCouponType !== '4'">
              <el-form-item label="使用限额" prop="useLimitType">
              <el-radio-group v-model="form.useLimitType" @change="onUseLimitTypeChange">
                <el-radio v-for="item in useLimitTypeOptions" :key="'ul'+item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.useLimitType === '1'" :label="'每日限额(' + dailyLimitUnit + ')'">
              <el-input-number v-model="form.dailyLimitValue" :min="0.01" :precision="2" :step="1" />
            </el-form-item>
            <el-form-item v-if="form.useLimitType === '2'" :label="'每笔限额(' + orderLimitUnit + ')'">
              <el-input-number v-model="form.orderLimitValue" :min="0.01" :max="orderLimitMax" :precision="2" :step="1" />
            </el-form-item>
            </template>
          </template>
          <el-form-item v-if="form.cardCouponType === '2'" label="满减门槛(元)">
            <el-input-number v-model="form.amountLimit" :min="0" :precision="2" :step="1" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="有效期" name="validity">
          <el-form-item label="有效期类型" prop="effectiveTimeType">
            <el-radio-group v-model="form.effectiveTimeType">
              <el-radio v-for="item in effectiveTimeTypeOptions" :key="'et'+item.value" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.effectiveTimeType === '1'" label="有效天数">
            <el-input-number v-model="form.afterReceiveDay" :min="1" :max="3650" />
          </el-form-item>
          <el-form-item v-if="form.effectiveTimeType === '2'" label="起止日期">
            <el-date-picker v-model="effectiveRange" type="daterange" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"
              @change="onEffectiveRangeChange" />
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="可用范围" name="scope">
          <el-form-item label="范围类型" prop="scopeType">
            <el-select v-model="form.scopeType" placeholder="请选择" @change="onScopeTypeChange">
              <el-option v-for="item in scopeTypeFormOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.scopeType === '5'" label="选择电站">
            <el-select v-model="stationIds" multiple filterable placeholder="请选择电站" style="width: 100%;">
              <el-option v-for="item in stationOptions" :key="item.id" :label="item.networkName" :value="String(item.id)" />
            </el-select>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>

      <el-form-item style="margin-top: 24px;">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { cardCouponDetail, createCardCoupon, updateCardCoupon } from '@/api/marketing/marketing'
import { getChargingStationList } from '@/api/netWorkDot/netWorkDotList'
import {
  isThresholdLimitCardType,
  getFaceValueUnit,
  loadDeductionTypeOptions,
  loadCouponScopeTypeOptions,
  loadCardCouponTypeOptions,
  loadDiscountShareFlagOptions,
  loadUseThresholdTypeOptions,
  loadUseLimitTypeOptions,
  loadEffectiveTimeTypeOptions
} from './constants/cardCoupon'

export default {
  name: 'cardCouponEdit',
  data() {
    return {
      loading: false,
      submitting: false,
      activeTab: 'basic',
      effectiveRange: [],
      stationIds: [],
      stationOptions: [],
      deductionTypeOptions: [],
      couponScopeTypeOptions: [],
      cardCouponTypeOptions: [],
      discountShareFlagOptions: [],
      useThresholdTypeOptions: [],
      useLimitTypeOptions: [],
      effectiveTimeTypeOptions: [],
      form: {
        cardCouponId: '',
        cardCouponName: '',
        cardCouponType: '1',
        useType: '1',
        discountShareFlag: '1',
        deductionType: '1',
        faceValue: 0,
        amountLimit: 0,
        useThresholdType: '0',
        useThresholdValue: null,
        useLimitType: '1',
        dailyLimitValue: null,
        orderLimitValue: null,
        effectiveTimeType: '1',
        afterReceiveDay: 30,
        effectiveStartDate: '',
        effectiveEndDate: '',
        useInstructions: '',
        scopeType: '4',
        stockNum: 100
      },
      rules: {
        cardCouponName: [{ required: true, message: '请输入卡券名称', trigger: 'blur' }],
        cardCouponType: [{ required: true, message: '请选择类型', trigger: 'change' }],
        discountShareFlag: [{ required: true, message: '请选择是否优惠共享', trigger: 'change' }],
        stockNum: [{ required: true, message: '请输入库存', trigger: 'blur' }],
        scopeType: [{ required: true, message: '请选择范围', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.query.id
    },
    scopeTypeFormOptions() {
      const allow = ['3', '4', '5']
      return (this.couponScopeTypeOptions || []).filter(o => allow.includes(String(o.value)))
    },
    faceValueFieldLabel() {
      if (this.form.cardCouponType === '4') return '折扣值(%)'
      const unit = getFaceValueUnit(this.form.cardCouponType)
      return `面额(${unit})`
    },
    dailyLimitUnit() {
      return this.form.cardCouponType === '3' ? '度' : '元'
    },
    orderLimitUnit() {
      return this.form.cardCouponType === '3' ? '度' : '%'
    },
    orderLimitMax() {
      return ['1', '4'].includes(this.form.cardCouponType) ? 100 : undefined
    }
  },
  created() {
    loadDeductionTypeOptions().then(list => { this.deductionTypeOptions = list || [] })
    loadCouponScopeTypeOptions().then(list => { this.couponScopeTypeOptions = list || [] })
    loadCardCouponTypeOptions().then(list => { this.cardCouponTypeOptions = list || [] })
    loadDiscountShareFlagOptions().then(list => { this.discountShareFlagOptions = list || [] })
    loadUseThresholdTypeOptions().then(list => { this.useThresholdTypeOptions = list || [] })
    loadUseLimitTypeOptions().then(list => { this.useLimitTypeOptions = list || [] })
    loadEffectiveTimeTypeOptions().then(list => { this.effectiveTimeTypeOptions = list || [] })

    this.loadStations()
    if (this.isEdit) {
      this.loadDetail()
    }
  },
  methods: {
    isThresholdLimitCardType,
    loadStations() {
      getChargingStationList({ page: 1, limit: 9999 }).then(res => {
        this.stationOptions = res.data || []
      })
    },
    loadDetail() {
      this.loading = true
      cardCouponDetail(this.$route.query.id).then(res => {
        this.loading = false
        if (res.code !== 200 || !res.data) return
        const coupon = res.data.coupon || {}
        Object.assign(this.form, coupon)
        this.form.useType = coupon.useType || '1'
        this.form.discountShareFlag = coupon.discountShareFlag != null ? String(coupon.discountShareFlag) : '1'
        if (isThresholdLimitCardType(coupon.cardCouponType) && !this.form.useLimitType) {
          this.form.useLimitType = (coupon.orderLimitValue != null && coupon.orderLimitValue !== '') ? '2' : '1'
        }
        this.stationIds = (res.data.stationIds || []).map(String)
        if (coupon.effectiveStartDate && coupon.effectiveEndDate) {
          this.effectiveRange = [coupon.effectiveStartDate, coupon.effectiveEndDate]
        }
      }).catch(() => { this.loading = false })
    },
    onEffectiveRangeChange(val) {
      if (val && val.length === 2) {
        this.form.effectiveStartDate = val[0]
        this.form.effectiveEndDate = val[1]
      } else {
        this.form.effectiveStartDate = ''
        this.form.effectiveEndDate = ''
      }
    },
    onScopeTypeChange() {
      if (this.form.scopeType !== '5') {
        this.stationIds = []
      }
    },
    onUseLimitTypeChange() {
      if (this.form.useLimitType === '1') {
        this.form.orderLimitValue = null
      } else if (this.form.useLimitType === '2') {
        this.form.dailyLimitValue = null
      }
    },
    goBack() {
      this.$router.push({ name: 'cardCouponList' })
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.scopeType === '5' && !this.stationIds.length) {
          this.$message.warning('请选择指定电站')
          this.activeTab = 'scope'
          return
        }
        if (isThresholdLimitCardType(this.form.cardCouponType)) {
          if (this.form.cardCouponType === '4') {
            if (!this.form.faceValue || this.form.faceValue <= 0 || this.form.faceValue > 100) {
              this.$message.warning('请输入有效的折扣比例（0-100）')
              this.activeTab = 'discount'
              return
            }
            if (!this.form.amountLimit || this.form.amountLimit <= 0) {
              this.$message.warning('请输入有效的折扣上限')
              this.activeTab = 'discount'
              return
            }
          }
          if (this.form.cardCouponType !== '4') {
            if (!this.form.useLimitType) {
              this.$message.warning('请选择使用限额类型')
              this.activeTab = 'discount'
              return
            }
            if (this.form.useLimitType === '1' && (!this.form.dailyLimitValue || this.form.dailyLimitValue <= 0)) {
              this.$message.warning('请输入有效的每日限额')
              this.activeTab = 'discount'
              return
            }
            if (this.form.useLimitType === '2') {
              const max = this.orderLimitMax || Infinity
              if (!this.form.orderLimitValue || this.form.orderLimitValue <= 0 || this.form.orderLimitValue > max) {
                this.$message.warning(this.form.cardCouponType === '1' ? '请输入有效的每笔限额比例' : '请输入有效的每笔限额')
                this.activeTab = 'discount'
                return
              }
            }
          }
        }
        this.submitting = true
        const payload = { ...this.form, stationIds: this.stationIds, useType: '1' }
        if (isThresholdLimitCardType(payload.cardCouponType)) {
          if (payload.cardCouponType === '4') {
            payload.useLimitType = null
            payload.dailyLimitValue = null
            payload.orderLimitValue = null
          } else {
            if (payload.useLimitType === '1') payload.orderLimitValue = null
            if (payload.useLimitType === '2') payload.dailyLimitValue = null
            payload.amountLimit = null
          }
        }
        const api = this.isEdit ? updateCardCoupon : createCardCoupon
        api(payload).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.goBack()
          } else {
            this.$message.error(res.msg || '保存失败')
          }
        }).catch(() => { this.submitting = false })
      })
    }
  }
}
</script>
