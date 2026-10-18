<template>
  <div :class="['msg-bubble', `msg-bubble--${message.role}`]">
    <div class="msg-bubble__inner">
      <template v-for="(seg, i) in segments">
        <div
          v-if="seg.type === 'text' && seg.value"
          :key="'t-' + i"
          class="msg-bubble__text"
        >{{ seg.value }}</div>
        <json-block
          v-else-if="seg.type === 'json'"
          :key="'j-' + i"
          :value="seg.value"
          label="数据"
        />
      </template>
      <tool-trace-panel
        v-if="message.toolTrace && message.toolTrace.length"
        :steps="message.toolTrace"
      />
    </div>
  </div>
</template>

<script>
import { splitTextAndJson } from './jsonPretty'
import JsonBlock from './JsonBlock.vue'
import ToolTracePanel from './ToolTracePanel.vue'

export default {
  name: 'MessageBubble',
  components: { JsonBlock, ToolTracePanel },
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    segments() {
      if (this.message.role === 'user') {
        return [{ type: 'text', value: this.message.text }]
      }
      return splitTextAndJson(this.message.text)
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-bubble {
  margin-bottom: 10px;
  display: flex;

  &--user {
    justify-content: flex-end;

    .msg-bubble__inner {
      background: #409eff;
      color: #fff;
    }
  }

  &--assistant {
    justify-content: flex-start;

    .msg-bubble__inner {
      background: #f4f4f5;
      color: #303133;
    }
  }

  &__inner {
    max-width: 92%;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
  }

  &__text {
    white-space: pre-wrap;
  }
}
</style>
