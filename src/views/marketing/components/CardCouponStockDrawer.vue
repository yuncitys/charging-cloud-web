<template>
  <el-drawer
    title="增加库存"
    :visible.sync="visibleSync"
    direction="rtl"
    size="480px"
    :wrapper-closable="false"
    append-to-body
    custom-class="marketing-activity-drawer"
    @open="onOpen"
    @close="onClose"
  >
    <div v-if="visibleSync" class="marketing-activity-drawer__body">
      <div class="stock-drawer-summary">
        <div class="stock-drawer-summary__name">{{ coupon.cardCouponName }}</div>
        <div class="stock-drawer-summary__meta">
          <el-tag size="mini" type="success">{{ typeLabel }}</el-tag>
          <span>当前库存 {{ coupon.currentStock }} 张</span>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="增加数量" prop="addCount">
          <el-input-number
            v-model="form.addCount"
            :min="1"
            :max="9999999"
            controls-position="right"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>

      <div class="stock-preview">
        <div class="stock-preview__item">
          <span class="stock-preview__label">当前库存</span>
          <span class="stock-preview__value">{{ coupon.currentStock }}</span>
        </div>
        <div class="stock-preview__arrow">+</div>
        <div class="stock-preview__item">
          <span class="stock-preview__label">本次增加</span>
          <span class="stock-preview__value stock-preview__value--add">{{ form.addCount || 0 }}</span>
        </div>
        <div class="stock-preview__arrow">=</div>
        <div class="stock-preview__item stock-preview__item--result">
          <span class="stock-preview__label">增加后</span>
          <span class="stock-preview__value stock-preview__value--result">{{ afterStock }}</span>
        </div>
      </div>

      <div class="marketing-tip stock-drawer-tip">增加库存后，活动发放将消耗新增库存；已发放数量不受影响。</div>
    </div>

    <div class="marketing-activity-drawer__footer">
      <el-button @click="visibleSync = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认增加</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { increaseCardCouponStock } from '@/api/marketing/marketing'
import { CARD_COUPON_TYPE } from '../constants/cardCoupon'
import '../styles/marketing.scss'

export default {
  name: 'CardCouponStockDrawer',
  props: {
    visible: { type: Boolean, default: false },
    coupon: {
      type: Object,
      default: () => ({
        cardCouponId: '',
        cardCouponName: '',
        cardCouponType: '1',
        currentStock: 0
      })
    }
  },
  data() {
    return {
      submitting: false,
      form: { addCount: 1 },
      rules: {
        addCount: [{ required: true, message: '请输入增加数量', trigger: 'blur' }]
      }
    }
  },
  computed: {
    visibleSync: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    typeLabel() {
      return CARD_COUPON_TYPE[this.coupon.cardCouponType] || '卡券'
    },
    afterStock() {
      return (this.coupon.currentStock || 0) + (this.form.addCount || 0)
    }
  },
  methods: {
    onOpen() {
      this.form.addCount = 1
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    onClose() {
      this.form.addCount = 1
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        this.submitting = true
        increaseCardCouponStock(this.coupon.cardCouponId, this.form.addCount).then(res => {
          this.submitting = false
          if (res.code === 200) {
            this.$message.success('库存增加成功')
            this.visibleSync = false
            this.$emit('saved')
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.stock-drawer-summary {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.stock-drawer-summary__name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.stock-drawer-summary__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #909399;
}
.stock-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 0;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}
.stock-drawer-tip {
  margin-top: 16px;
  margin-bottom: 0;
}
.stock-preview__item {
  flex: 1;
  text-align: center;
}
.stock-preview__item--result {
  background: #f0fdf4;
  border-radius: 6px;
  padding: 8px 4px;
}
.stock-preview__label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.stock-preview__value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.stock-preview__value--add {
  color: #409eff;
}
.stock-preview__value--result {
  color: #30B08F;
}
.stock-preview__arrow {
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  color: #c0c4cc;
  font-size: 16px;
}
</style>
