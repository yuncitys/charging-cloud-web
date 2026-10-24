<template>
  <div class="tool-trace">
    <div class="tool-trace__toggle" @click="open = !open">
      <i :class="open ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" />
      排查过程 ({{ steps.length }})
    </div>
    <div v-show="open" class="tool-trace__list">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="tool-trace__step"
      >
        <div class="tool-trace__step-head" @click="toggleStep(idx)">
          <span class="tool-trace__idx">{{ idx + 1 }}</span>
          <span class="tool-trace__name" :title="step.tool || ''">{{ toolLabel(step.tool) }}</span>
          <el-tag
            size="mini"
            :type="step.ok === false ? 'danger' : 'success'"
            effect="plain"
          >
            {{ step.ok === false ? '失败' : '成功' }}
          </el-tag>
          <i
            class="tool-trace__chevron"
            :class="stepOpen[idx] ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          />
        </div>
        <div v-show="stepOpen[idx]" class="tool-trace__step-body">
          <div class="tool-trace__plain">
            {{ plainOutcome(step) }}
          </div>
          <div v-if="step.pendingActionId" class="tool-trace__pending">
            待确认操作已生成，请在上方确认卡片中处理
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { toolLabel } from './toolLabels'

export default {
  name: 'ToolTracePanel',
  props: {
    steps: {
      type: Array,
      default: () => []
    },
    defaultOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const stepOpen = {}
    ;(this.steps || []).forEach((_, i) => {
      stepOpen[i] = false
    })
    return {
      open: !!this.defaultOpen,
      stepOpen
    }
  },
  watch: {
    steps: {
      immediate: false,
      handler(list) {
        const next = {}
        ;(list || []).forEach((_, i) => {
          next[i] = false
        })
        this.stepOpen = next
        if (!this.defaultOpen) {
          this.open = false
        }
      }
    }
  },
  methods: {
    toolLabel,

    toggleStep(idx) {
      this.$set(this.stepOpen, idx, !this.stepOpen[idx])
    },
    plainOutcome(step) {
      if (!step) {
        return '暂无说明'
      }
      if (step.summary != null && String(step.summary).trim() !== '') {
        return String(step.summary)
      }
      // Legacy sessions may still have raw content — never render it as JSON.
      if (step.ok === false) {
        return '这一步没有成功'
      }
      return '已完成'
    }
  }
}
</script>

<style lang="scss" scoped>
.tool-trace {
  margin-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  padding-top: 6px;

  &__toggle {
    font-size: 12px;
    color: #909399;
    cursor: pointer;
    user-select: none;

    &:hover {
      color: #606266;
    }
  }

  &__list {
    margin-top: 6px;
  }

  &__step {
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 6px;
    overflow: hidden;
    background: #fff;
  }

  &__step-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: #fafafa;
    cursor: pointer;
    font-size: 12px;
  }

  &__idx {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ecf5ff;
    color: #409eff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
  }

  &__name {
    flex: 1;
    font-size: 12px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    color: #c0c4cc;
    font-size: 12px;
  }

  &__step-body {
    padding: 6px 8px 8px;
  }

  &__plain {
    margin-bottom: 6px;
    padding: 6px 8px;
    font-size: 12px;
    line-height: 1.45;
    color: #606266;
    background: #f5f7fa;
    border-radius: 6px;
  }

  &__pending {
    margin-top: 6px;
    font-size: 11px;
    color: #e6a23c;
  }
}
</style>
