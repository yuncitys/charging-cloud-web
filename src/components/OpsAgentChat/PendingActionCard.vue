<template>
  <div class="pending-card">
    <div class="pending-card__head">
      <i class="el-icon-warning-outline pending-card__icon" />
      <div class="pending-card__titles">
        <div class="pending-card__title">需要您确认</div>
        <div class="pending-card__hint">确认后才会真正执行，点取消则不做任何改动</div>
      </div>
    </div>
    <div class="pending-card__body">{{ plainSummary }}</div>
    <div class="pending-card__actions">
      <el-button size="small" :disabled="confirming" @click="onCancel">取消</el-button>
      <el-button size="small" type="primary" :loading="confirming" @click="onConfirm">确认执行</el-button>
    </div>
  </div>
</template>

<script>
import { confirmAction } from '@/api/opsAgent/chat'
import { actionLabel, summarizeAction } from './friendlyText'

export default {
  name: 'PendingActionCard',
  props: {
    action: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      confirming: false
    }
  },
  computed: {
    plainSummary() {
      const label = actionLabel(this.action)
      const detail = summarizeAction(this.action.summary)
      if (detail && detail !== label) {
        return '即将执行：' + detail
      }
      return '即将执行：' + label
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel', this.action)
    },
    onConfirm() {
      this.confirming = true
      confirmAction(this.action.id)
        .then(res => {
          this.$emit('confirmed', { action: this.action, result: res })
        })
        .catch(err => {
          this.$emit('confirm-failed', { action: this.action, error: err })
        })
        .finally(() => {
          this.confirming = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-card {
  /* Keep same width rhythm as assistant message bubbles */
  width: 100%;
  max-width: min(92%, 520px);
  margin: 4px 0 14px;
  padding: 14px 16px;
  box-sizing: border-box;
  border-radius: 12px;
  background: linear-gradient(180deg, #fffbf5 0%, #fff8ee 100%);
  border: 1px solid #f5e0c0;
  box-shadow: 0 1px 2px rgba(230, 162, 60, 0.08);

  &__head {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  &__icon {
    font-size: 20px;
    color: #e6a23c;
    margin-top: 2px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }

  &__hint {
    margin-top: 2px;
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }

  &__body {
    font-size: 13px;
    color: #606266;
    line-height: 1.55;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    margin-bottom: 12px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
