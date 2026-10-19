<template>
  <div :class="['msg-bubble', 'msg-bubble--' + message.role]">
    <div class="msg-bubble__inner">
      <button
        type="button"
        class="msg-bubble__copy"
        :title="copied ? '已复制' : '复制'"
        @click="copyMessage"
      >
        <i :class="copied ? 'el-icon-check' : 'el-icon-document-copy'" />
      </button>
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
import { humanizeOpsError } from './friendlyText'
import JsonBlock from './JsonBlock.vue'
import ToolTracePanel from './ToolTracePanel.vue'

function isTechnicalFailure(text) {
  return /downstream rejected|idempotency key already used/i.test(text || '')
}

export default {
  name: 'MessageBubble',
  components: { JsonBlock, ToolTracePanel },
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      copied: false,
      copyTimer: null
    }
  },
  computed: {
    rawText() {
      return this.message.text || ''
    },
    isFailureDump() {
      return this.message.role === 'assistant' && isTechnicalFailure(this.rawText)
    },
    segments() {
      if (this.message.role === 'user') {
        return [{ type: 'text', value: this.rawText }]
      }
      if (this.isFailureDump) {
        return [{ type: 'text', value: humanizeOpsError(this.rawText, null) }]
      }
      return splitTextAndJson(this.rawText)
    },
    copySource() {
      if (this.isFailureDump) {
        return humanizeOpsError(this.rawText, null)
      }
      return this.rawText
    }
  },
  beforeDestroy() {
    if (this.copyTimer) {
      clearTimeout(this.copyTimer)
    }
  },
  methods: {
    renderMd(text) {
      return renderMarkdown(text)
    },
    copyMessage() {
      const text = this.copySource
      if (!text) {
        return
      }
      const done = () => {
        this.copied = true
        if (this.copyTimer) {
          clearTimeout(this.copyTimer)
        }
        this.copyTimer = setTimeout(() => {
          this.copied = false
        }, 1500)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done))
      } else {
        this.fallbackCopy(text, done)
      }
    },
    fallbackCopy(text, done) {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        done()
      } catch (e) {
        /* ignore */
      }
      document.body.removeChild(ta)
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
      border-radius: 14px 4px 14px 14px;
    }

    .msg-bubble__copy {
      color: rgba(255, 255, 255, 0.85);

      &:hover {
        background: rgba(255, 255, 255, 0.18);
        color: #fff;
      }
    }
  }

  &--assistant {
    justify-content: flex-start;

    .msg-bubble__inner {
      background: #f4f4f5;
      color: #303133;
      border-radius: 4px 14px 14px 14px;
      border: 1px solid #ebeef5;
    }
  }

  &__inner {
    position: relative;
    max-width: min(92%, 520px);
    padding: 10px 36px 10px 14px;
    font-size: 13px;
    line-height: 1.55;
    word-break: break-word;
  }

  &__copy {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #909399;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s, background 0.15s;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #606266;
    }
  }

  &:hover .msg-bubble__copy,
  &__copy:focus {
    opacity: 1;
  }

  &__text {
    white-space: pre-wrap;
  }

  &__md {
    ::v-deep {
      p {
        margin: 0 0 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      ul, ol {
        margin: 4px 0 8px;
        padding-left: 1.3em;
      }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.06);
        padding: 1px 5px;
        border-radius: 4px;
      }

      pre {
        margin: 8px 0;
        padding: 10px;
        background: #1e1e1e;
        color: #d4d4d4;
        border-radius: 8px;
        overflow: auto;
        font-size: 12px;
      }

      strong {
        font-weight: 600;
      }

      a {
        color: #409eff;
      }
    }
  }
}
</style>
