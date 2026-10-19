<template>
  <div class="tool-trace">
    <div class="tool-trace__toggle" @click="open = !open">
      <i :class="open ? 'el-icon-arrow-down' : 'el-icon-arrow-right'" />
      执行步骤 ({{ steps.length }})
    </div>
    <div v-show="open" class="tool-trace__list">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="tool-trace__step"
      >
        <div class="tool-trace__step-head" @click="toggleStep(idx)">
          <span class="tool-trace__idx">{{ idx + 1 }}</span>
          <span class="tool-trace__name">{{ step.tool || 'tool' }}</span>
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
          <div v-if="plainOutcome(step)" class="tool-trace__plain">
            {{ plainOutcome(step) }}
          </div>
          <json-block
            v-if="hasArgs(step)"
            :value="step.arguments"
            label="参数"
            :default-collapsed="true"
          />
          <json-block
            v-if="hasContent(step)"
            :value="step.content"
            label="返回"
            :default-collapsed="true"
          />
          <div v-if="step.pendingActionId" class="tool-trace__pending">
            待确认操作 ID：{{ step.pendingActionId }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsonBlock from './JsonBlock.vue'

export default {
  name: 'ToolTracePanel',
  components: { JsonBlock },
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
      stepOpen[i] = i === (this.steps.length - 1)
    })
    return {
      open: this.defaultOpen || (this.steps && this.steps.length <= 2),
      stepOpen
    }
  },
  watch: {
    steps: {
      immediate: false,
      handler(list) {
        const next = {}
        ;(list || []).forEach((_, i) => {
          next[i] = this.stepOpen[i] != null ? this.stepOpen[i] : i === list.length - 1
        })
        this.stepOpen = next
      }
    }
  },
  methods: {
    toggleStep(idx) {
      this.$set(this.stepOpen, idx, !this.stepOpen[idx])
    },
    hasArgs(step) {
      return step && step.arguments != null && step.arguments !== ''
    },
    hasContent(step) {
      return step && step.content != null && step.content !== ''
    },
    plainOutcome(step) {
      if (!step) {
        return ''
      }
      const raw = step.content == null ? '' : String(step.content)
      if (!raw) {
        return step.ok === false ? '这一步没有成功' : ''
      }
      const msg = this.extractMsg(raw)
      if (msg) {
        if (/订单不存在|不存在|未找到/.test(msg)) {
          return '说明：没有找到对应订单/账单'
        }
        if (/交易账单不存在|账单不存在/.test(msg)) {
          return '说明：找不到对应的交易账单'
        }
        return '说明：' + msg
      }
      if (step.ok === false) {
        if (/idempotency|already used/i.test(raw)) {
          return '说明：该操作之前已经处理过，不能重复提交'
        }
        if (/failed/i.test(raw)) {
          return '说明：这一步执行失败，可展开下方技术详情'
        }
        return '说明：这一步没有成功'
      }
      if (/^\s*[{\[]/.test(raw)) {
        return '说明：已返回数据（技术详情默认收起）'
      }
      return ''
    },
    extractMsg(text) {
      const m = /"msg"\s*:\s*"([^"]+)"/.exec(text)
      return m ? m[1] : ''
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
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
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
