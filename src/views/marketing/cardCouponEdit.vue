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
              <el-radio label="1">抵用卡</el-radio>
              <el-radio label="2">优惠券</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="成本承担" prop="undertakerType">
            <el-radio-group v-model="form.undertakerType">
              <el-radio label="1">平台</el-radio>
              <el-radio label="2">商户</el-radio>
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
              <el-option label="电费" value="1" />
              <el-option label="服务费" value="2" />
              <el-option label="总费用" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="面额(元)" prop="faceValue">
            <el-input-number v-model="form.faceValue" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <el-form-item label="满减门槛(元)">
            <el-input-number v-model="form.amountLimit" :min="0" :precision="2" :step="1" />
          </el-form-item>
          <template v-if="form.cardCouponType === '2'">
            <el-form-item label="电费折扣(%)">
              <el-input-number v-model="form.powerPercentage" :min="0" :max="100" :precision="2" />
            </el-form-item>
            <el-form-item label="服务费折扣(%)">
              <el-input-number v-model="form.servicePercentage" :min="0" :max="100" :precision="2" />
            </el-form-item>
          </template>
        </el-tab-pane>

        <el-tab-pane label="有效期" name="validity">
          <el-form-item label="有效期类型" prop="effectiveTimeType">
            <el-radio-group v-model="form.effectiveTimeType">
              <el-radio label="1">领取后N天</el-radio>
              <el-radio label="2">固定日期</el-radio>
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
              <el-option label="全部电站" value="4" />
              <el-option label="指定电站" value="5" />
              <el-option label="电站分组" value="3" />
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
      form: {
        cardCouponId: '',
        cardCouponName: '',
        cardCouponType: '1',
        undertakerType: '1',
        undertakerId: '0',
        deductionType: '3',
        faceValue: 0,
        amountLimit: 0,
        powerPercentage: 100,
        servicePercentage: 100,
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
        stockNum: [{ required: true, message: '请输入库存', trigger: 'blur' }],
        scopeType: [{ required: true, message: '请选择范围', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.query.id
    }
  },
  created() {
    this.loadStations()
    if (this.isEdit) {
      this.loadDetail()
    }
  },
  methods: {
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
        this.submitting = true
        const payload = { ...this.form, stationIds: this.stationIds }
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
