<template>
  <el-card shadow="never" class="pending-action-card">
    <div class="pending-action-card__summary">{{ action.summary }}</div>
    <div class="pending-action-card__actions">
      <el-button size="mini" type="primary" :loading="confirming" @click="onConfirm">确认</el-button>
      <el-button size="mini" @click="$emit('cancel', action.id)">取消</el-button>
    </div>
  </el-card>
</template>

<script>
import { confirmAction } from '@/api/opsAgent/chat'

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
  methods: {
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
.pending-action-card {
  margin-top: 8px;
  background: #fdf6ec;
  border-color: #faecd8;

  &__summary {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  &__actions {
    text-align: right;
  }
}
</style>
