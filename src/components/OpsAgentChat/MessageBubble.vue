<template>
  <div :class="['msg-bubble', `msg-bubble--${message.role}`]">
    <div class="msg-bubble__inner">
      <template v-for="(seg, i) in segments">
        <div
          v-if="seg.type === 'text' && seg.value && message.role === 'user'"
          :key="'t-' + i"
          class="msg-bubble__text"
        >{{ seg.value }}</div>
        <div
          v-else-if="seg.type === 'text' && seg.value"
          :key="'md-' + i"
          class="msg-bubble__md"
          v-html="renderMd(seg.value)"
        />
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
import { renderMarkdown } from './renderMarkdown'
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
  },
  methods: {
    renderMd(text) {
      return renderMarkdown(text)
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

  &__md {
    ::v-deep .md-h {
      margin: 8px 0 4px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
    }

    ::v-deep h1.md-h {
      font-size: 15px;
    }

    ::v-deep h2.md-h {
      font-size: 14px;
    }

    ::v-deep h3.md-h {
      font-size: 13px;
    }

    ::v-deep .md-p {
      margin: 0 0 6px;
    }

    ::v-deep .md-ul,
    ::v-deep .md-ol {
      margin: 4px 0 8px;
      padding-left: 1.3em;
    }

    ::v-deep li {
      margin: 2px 0;
    }

    ::v-deep code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.06);
      padding: 1px 4px;
      border-radius: 3px;
    }

    ::v-deep .md-pre {
      margin: 6px 0;
      padding: 8px;
      background: #1e1e2e;
      color: #cdd6f4;
      border-radius: 6px;
      overflow: auto;
      font-size: 11px;
      line-height: 1.45;
    }

    ::v-deep .md-pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }

    ::v-deep a {
      color: #409eff;
    }
  }
}
</style>
